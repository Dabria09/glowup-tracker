import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Search, X } from 'lucide-react';
import useAgeGroup from '@/lib/useAgeGroup';

const SHINE_BADGES = [
  { id: 'consistent', emoji: '🌸', label: 'Most Consistent', desc: 'Daily check-ins' },
  { id: 'encourager', emoji: '💖', label: 'Encourager', desc: 'Uplifting others' },
  { id: 'learner', emoji: '📖', label: 'Learner', desc: 'Lessons completed' },
  { id: 'challenger', emoji: '🔥', label: 'Challenger', desc: 'Challenges done' },
  { id: 'glow_up', emoji: '⭐', label: 'Quiet Glow-Up', desc: 'Steady progress' },
  { id: 'mindset', emoji: '🧠', label: 'Mindset Leader', desc: 'Journal entries' },
];

export default function Leaderboard() {
  const navigate = useNavigate();
  const { worldInfo } = useAgeGroup();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('global');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [globalLeaders, setGlobalLeaders] = useState([]);
  const [weeklyLeaders, setWeeklyLeaders] = useState([]);
  const [teams, setTeams] = useState([]);
  const [circle, setCircle] = useState([]);
  
  // Airtable configuration - update these with your actual values
  const AIRTABLE_BASE_ID = 'appYOUR_BASE_ID'; // Replace with your Airtable base ID
  const AIRTABLE_TABLE_NAME = 'Leaderboard'; // Replace with your table name

  // Calculate points from user activities
  const calculateUserPoints = async (userEmail) => {
    try {
      const [
        gratitudeEntries,
        spiritualHabits,
        shoutouts,
        diaryEntries,
        userProfile
      ] = await Promise.all([
        base44.entities.GratitudeEntry.filter({ user_email: userEmail }),
        base44.entities.SpiritualHabit.filter({ user_email: userEmail }),
        base44.entities.ShoutOut.filter({ user_email: userEmail }),
        base44.entities.DiaryEntry.filter({ user_email: userEmail }),
        base44.entities.UserProfile.filter({ user_email: userEmail }).then(r => r[0] || null),
      ]);

      // Points calculation
      const checkInPoints = gratitudeEntries.length * 10;
      const habitPoints = spiritualHabits.filter(h => h.checked_date).length * 5;
      const shoutoutPointsReceived = shoutouts.reduce((sum, s) => sum + (s.likes || 0), 0) * 3;
      const shoutoutPointsGiven = shoutouts.length * 2;
      const journalPoints = diaryEntries.length * 5;

      const totalPoints = checkInPoints + habitPoints + shoutoutPointsReceived + shoutoutPointsGiven + journalPoints;
      
      // Weekly points (simplified - would need date filtering in production)
      const weeklyPoints = Math.floor(totalPoints * 0.4);

      return {
        total_points: totalPoints,
        weekly_points: weeklyPoints,
        check_in_streak: gratitudeEntries.length,
        journal_entries: diaryEntries.length,
        shoutouts_received: shoutoutPointsReceived / 3,
      };
    } catch (error) {
      console.error('Error calculating points:', error);
      return {
        total_points: 0,
        weekly_points: 0,
        check_in_streak: 0,
        journal_entries: 0,
        shoutouts_received: 0,
      };
    }
  };

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      try {
        // Fetch leaderboard data from Airtable
        const response = await base44.functions.invoke('airtableFetch', {
          action: 'fetchRecords',
          baseId: AIRTABLE_BASE_ID,
          tableId: AIRTABLE_TABLE_NAME,
        });

        if (response.records && response.records.length > 0) {
          // Parse Airtable data into leaderboard format
          const airtableData = response.records.map(record => ({
            id: record.id,
            name: record.fields.Name || record.fields.Username || 'User',
            username: record.fields.Username || record.fields.Name || 'user',
            email: record.fields.Email || '',
            points: record.fields.Total_Points || record.fields.Points || 0,
            weeklyPoints: record.fields.Weekly_Points || 0,
            teamPoints: record.fields.Team_Points || 0,
            teamName: record.fields.Team || '',
            avatar_url: record.fields.Avatar_URL || null,
            check_in_streak: record.fields.Check_In_Streak || 0,
            journal_entries: record.fields.Journal_Entries || 0,
          }));

          // Sort by total points for global leaderboard
          const sorted = airtableData.sort((a, b) => b.points - a.points);

          setGlobalLeaders(sorted);
          
          // Weekly leaders (top 10 by weekly points)
          const weeklySorted = [...airtableData].sort((a, b) => b.weeklyPoints - a.weeklyPoints);
          setWeeklyLeaders(weeklySorted.slice(0, 10));

          // Group by teams
          const teamMap = {};
          airtableData.forEach(member => {
            if (member.teamName) {
              if (!teamMap[member.teamName]) {
                teamMap[member.teamName] = { id: member.teamName, name: member.teamName, members: [], teamPoints: 0 };
              }
              teamMap[member.teamName].members.push(member);
              teamMap[member.teamName].teamPoints += member.points;
            }
          });
          setTeams(Object.values(teamMap).sort((a, b) => b.teamPoints - a.teamPoints));

          // Circle - top 5 from global
          setCircle(sorted.slice(0, 5).map((l, idx) => ({
            ...l,
            circlePoints: l.points,
            rank: ['Glow Queen', 'Shine Leader', 'Rising Star', 'Spark', 'Beam'][idx] || 'Member',
          })));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading leaderboard from Airtable:', error);
        setLoading(false);
      }
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const tabConfig = [
    { id: 'global', label: 'Global', icon: '👥', count: globalLeaders.length },
    { id: 'weekly', label: 'Weekly', icon: '👑', count: weeklyLeaders.length },
    { id: 'teams', label: 'Teams', icon: '🤝', count: teams.length },
    { id: 'circle', label: 'My Circle', icon: '💜', count: circle.length },
  ];

  const renderEmptyState = () => {
    const messages = {
      global: { emoji: '👑', title: 'No members on the board yet.', subtitle: 'Start checking in to earn glow points!' },
      weekly: { emoji: '⭐', title: 'Weekly Crowns are being calculated...', subtitle: 'Check back soon!' },
      teams: { emoji: '🤝', title: 'No teams yet.', subtitle: 'Create or join a Glow Squad!' },
      circle: { emoji: '⭐', title: 'Your circle is empty', subtitle: 'Go to Global tab and tap a member to add her!' },
    };
    const msg = messages[activeTab];
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-5xl mb-4">{msg.emoji}</span>
        <p className="font-bold text-lg text-white mb-1">{msg.title}</p>
        <p className="text-gray-400 text-sm text-center px-4">{msg.subtitle}</p>
      </div>
    );
  };

  const renderGlobalTab = () => (
    <div>
      {globalLeaders.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="space-y-3">
          {globalLeaders.map((leader, idx) => (
            <div key={leader.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="text-xl font-bold text-yellow-400 w-6">{idx + 1}</span>
              {idx < 3 && <span className="text-lg">{['🥇', '🥈', '🥉'][idx]}</span>}
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{leader.name}</p>
                <p className="text-xs text-gray-400">@{leader.username}</p>
              </div>
              <span className="font-bold text-yellow-400 text-sm">{leader.points} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderWeeklyTab = () => (
    <div>
      <p className="text-xs font-bold tracking-widest text-gray-500 mb-4 px-4">THIS WEEK'S CROWNS</p>
      {weeklyLeaders.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="space-y-3 px-4">
          {weeklyLeaders.map((leader, idx) => (
            <div key={leader.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="text-2xl">{['👑', '💎', '⭐'][idx] || '🌟'}</span>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{leader.name}</p>
                <p className="text-xs text-gray-400">{leader.weeklyPoints} weekly points</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-8 px-4">
        <p className="text-xs font-bold tracking-widest text-gray-500 mb-4">WAYS TO SHINE</p>
        <div className="grid grid-cols-2 gap-3">
          {SHINE_BADGES.map(badge => (
            <div key={badge.id} className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="text-3xl block mb-2">{badge.emoji}</span>
              <p className="font-semibold text-white text-xs">{badge.label}</p>
              <p className="text-gray-500 text-[10px]">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTeamsTab = () => (
    <div>
      <p className="text-xs font-bold tracking-widest text-gray-500 mb-4 px-4">GLOW TEAMS</p>
      {teams.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="space-y-3 px-4">
          {teams.map(team => (
            <div key={team.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white text-sm">{team.name}</p>
                  <p className="text-xs text-gray-400">{team.memberCount} members</p>
                </div>
                <span className="font-bold text-pink-400 text-sm">{team.teamPoints} pts</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-center px-4 mt-4">
        <button className="px-6 py-2 rounded-full font-semibold text-pink-400 border border-pink-400/50 text-sm hover:bg-pink-400/10 transition">
          Browse All →
        </button>
      </div>
    </div>
  );

  const renderCircleTab = () => (
    <div>
      <div className="px-4 py-3 rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="text-xs text-gray-400 text-center">Tap a girl's profile on the Global tab to add her to your circle. Compare progress privately 💜</p>
      </div>
      {circle.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="space-y-3 px-4">
          {circle.map((member, idx) => (
            <div key={member.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="font-bold text-gray-400 w-6">#{idx + 1}</span>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{member.name}</p>
                <p className="text-xs text-gray-400">{member.circlePoints} pts in your circle</p>
              </div>
              <span className="text-xs font-semibold text-pink-400">{member.rank}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative overflow-y-auto" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">

        {/* Points badge */}
        <div className="flex justify-end mb-3">
          <div className="flex items-center gap-1 backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs font-bold">
            <span>🏅</span><span className="text-yellow-400">15 pts</span>
          </div>
        </div>

        {/* World Banner */}
        {worldInfo && (
          <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5 mb-4" style={{ background: worldInfo.bgColor, border: `1px solid ${worldInfo.borderColor}` }}>
            <span className="text-lg">{worldInfo.emoji}</span>
            <div>
              <p className="text-xs font-bold" style={{ color: worldInfo.color }}>{worldInfo.label}</p>
              <p className="text-[10px] text-gray-400">Rankings are within your world only</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">🏆 Leaderboard</h1>
            <p className="text-xs text-gray-400">Rise together. Shine individually. 👑</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
          {tabConfig.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition ${activeTab === tab.id ? 'text-white' : 'text-gray-400 bg-white/5'}`}
              style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' } : {}}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <div className="flex items-center backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-4 py-2.5 gap-2">
            <Search size={16} className="text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for a girl by name..."
              className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
            />
            {search && <button onClick={() => setSearch('')}><X size={14} className="text-gray-500" /></button>}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'global' && renderGlobalTab()}
        {activeTab === 'weekly' && renderWeeklyTab()}
        {activeTab === 'teams' && renderTeamsTab()}
        {activeTab === 'circle' && renderCircleTab()}

      </div>

      <BottomNav active="connect" />
    </div>
  );
}