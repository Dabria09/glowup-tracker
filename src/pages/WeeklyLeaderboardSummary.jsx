import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Trophy, Crown, Flame, Users, Star } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const WORLDS = [
  { id: 'glow_girls', label: 'Glow Girls', emoji: '🌸', color: '#ec4899', bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)' },
  { id: 'glow_teens', label: 'Glow Teens', emoji: '✨', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)' },
  { id: 'glow_women', label: 'Glow Women', emoji: '👑', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
];

const RANK_STYLE = [
  { bg: 'rgba(251,191,36,0.25)', color: '#fbbf24', label: '🥇' },
  { bg: 'rgba(156,163,175,0.25)', color: '#d1d5db', label: '🥈' },
  { bg: 'rgba(180,83,9,0.25)', color: '#b45309', label: '🥉' },
];

function getWeekStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday
  return d;
}

export default function WeeklyLeaderboardSummary() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [worldData, setWorldData] = useState({}); // { glow_girls: { topIndividuals, topTeams }, ... }
  const [activeWorld, setActiveWorld] = useState('glow_girls');
  const [weekLabel, setWeekLabel] = useState('');

  useEffect(() => {
    const weekStart = getWeekStart();
    const opts = { month: 'short', day: 'numeric' };
    const today = new Date();
    setWeekLabel(`${weekStart.toLocaleDateString('en-US', opts)} – ${today.toLocaleDateString('en-US', opts)}`);

    const load = async () => {
      const [profiles, history, teamMembers, teams] = await Promise.all([
        base44.entities.UserProfile.list(),
        base44.entities.PointsHistory.list('-created_date', 500),
        base44.entities.TeamMember.list(),
        base44.entities.GlowTeam.list(),
      ]);

      // Filter history to this week
      const weekHistory = history.filter(h => new Date(h.created_date) >= weekStart);

      // Sum weekly points per user
      const weeklyByUser = {};
      weekHistory.forEach(h => {
        weeklyByUser[h.user_email] = (weeklyByUser[h.user_email] || 0) + (h.points || 0);
      });

      // Build world data
      const result = {};
      for (const world of WORLDS) {
        const worldProfiles = profiles.filter(p => p.age_group === world.id);
        const worldEmails = new Set(worldProfiles.map(p => p.user_email));

        // Top individuals this week
        const individuals = worldProfiles
          .map(p => ({
            email: p.user_email,
            username: p.username || p.user_email?.split('@')[0] || 'User',
            avatar_url: p.avatar_url,
            weeklyPoints: weeklyByUser[p.user_email] || 0,
          }))
          .filter(p => p.weeklyPoints > 0)
          .sort((a, b) => b.weeklyPoints - a.weeklyPoints)
          .slice(0, 5);

        // Team scores: sum weekly points of members in this world
        const teamScores = teams
          .filter(t => !t.age_group || t.age_group === world.id)
          .map(team => {
            const members = teamMembers
              .filter(m => m.team_id === team.id)
              .map(m => m.user_email);
            const weeklyTotal = members.reduce((sum, email) => {
              return worldEmails.has(email) ? sum + (weeklyByUser[email] || 0) : sum;
            }, 0);
            return { id: team.id, name: team.name, emoji: team.emoji || '⭐', members: members.length, weeklyTotal };
          })
          .filter(t => t.weeklyTotal > 0)
          .sort((a, b) => b.weeklyTotal - a.weeklyTotal)
          .slice(0, 5);

        result[world.id] = { topIndividuals: individuals, topTeams: teamScores };
      }

      setWorldData(result);
      setLoading(false);
    };

    load();
  }, []);

  const currentWorld = WORLDS.find(w => w.id === activeWorld);
  const data = worldData[activeWorld] || { topIndividuals: [], topTeams: [] };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-28" style={{ backgroundColor: '#080810' }}>
      {/* BG accent */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='%23fff'%3E%E2%98%85%3C/text%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <Crown size={16} className="text-yellow-400" />
              <span className="text-xs font-bold tracking-widest text-yellow-400">WEEKLY HIGHLIGHTS</span>
            </div>
            <h1 className="text-xl font-bold">Leaderboard Summary</h1>
            <p className="text-[11px] text-gray-500">{weekLabel}</p>
          </div>
        </div>

        {/* World Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
          {WORLDS.map(w => (
            <button key={w.id} onClick={() => setActiveWorld(w.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition flex-shrink-0"
              style={{
                background: activeWorld === w.id ? w.bg : 'rgba(255,255,255,0.05)',
                border: `1px solid ${activeWorld === w.id ? w.border : 'rgba(255,255,255,0.08)'}`,
                color: activeWorld === w.id ? w.color : '#6b7280',
              }}>
              <span>{w.emoji}</span> {w.label}
            </button>
          ))}
        </div>

        {/* World Banner */}
        <div className="rounded-3xl p-5 mb-6 flex items-center gap-4"
          style={{ background: currentWorld.bg, border: `1px solid ${currentWorld.border}` }}>
          <span className="text-5xl">{currentWorld.emoji}</span>
          <div>
            <p className="font-bold text-white text-lg">{currentWorld.label}</p>
            <p className="text-xs" style={{ color: currentWorld.color }}>
              {data.topIndividuals.length} active members · {data.topTeams.length} active teams this week
            </p>
          </div>
        </div>

        {/* Top Individuals */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Star size={15} style={{ color: currentWorld.color }} />
            <p className="text-xs font-bold tracking-widest" style={{ color: currentWorld.color }}>TOP INDIVIDUALS THIS WEEK</p>
          </div>

          {data.topIndividuals.length === 0 ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-gray-500 text-sm">No activity this week yet.</p>
              <p className="text-[11px] text-gray-600 mt-1">Be the first to earn points! ✨</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.topIndividuals.map((person, idx) => (
                <div key={person.email} className="flex items-center gap-3 rounded-2xl px-4 py-3 transition"
                  style={{ background: idx === 0 ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.05)', border: `1px solid ${idx === 0 ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
                  {/* Rank */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={idx < 3 ? RANK_STYLE[idx] : { background: 'rgba(255,255,255,0.08)', color: '#6b7280' }}>
                    {idx < 3 ? RANK_STYLE[idx].label : idx + 1}
                  </div>
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-sm"
                    style={{ background: `linear-gradient(135deg, ${currentWorld.color}60, ${currentWorld.color}30)` }}>
                    {person.avatar_url
                      ? <img src={person.avatar_url} alt="" className="w-full h-full object-cover" />
                      : person.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{person.username}</p>
                    {idx === 0 && <p className="text-[10px] font-bold" style={{ color: currentWorld.color }}>⭐ This Week's MVP</p>}
                  </div>
                  <div className="flex items-center gap-1 font-bold text-sm" style={{ color: idx === 0 ? '#fbbf24' : currentWorld.color }}>
                    <Flame size={13} />
                    +{person.weeklyPoints.toLocaleString()} pts
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Teams */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Users size={15} style={{ color: currentWorld.color }} />
            <p className="text-xs font-bold tracking-widest" style={{ color: currentWorld.color }}>TOP TEAMS THIS WEEK</p>
          </div>

          {data.topTeams.length === 0 ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-gray-500 text-sm">No team activity this week yet.</p>
              <p className="text-[11px] text-gray-600 mt-1">Join a team and start earning! 🔥</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.topTeams.map((team, idx) => (
                <div key={team.id} className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{ background: idx === 0 ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.05)', border: `1px solid ${idx === 0 ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
                  {/* Rank */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={idx < 3 ? RANK_STYLE[idx] : { background: 'rgba(255,255,255,0.08)', color: '#6b7280' }}>
                    {idx < 3 ? RANK_STYLE[idx].label : idx + 1}
                  </div>
                  {/* Team icon */}
                  <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-lg"
                    style={{ background: `${currentWorld.color}20` }}>
                    {team.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{team.name}</p>
                    <p className="text-[10px] text-gray-500">{team.members} member{team.members !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-sm" style={{ color: idx === 0 ? '#fbbf24' : currentWorld.color }}>
                    <Trophy size={13} />
                    +{team.weeklyTotal.toLocaleString()} pts
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex gap-3 mb-4">
          <button onClick={() => navigate('/leaderboard')}
            className="flex-1 py-3 rounded-2xl font-semibold text-sm text-white transition"
            style={{ background: `linear-gradient(135deg, ${currentWorld.color}, ${currentWorld.color}80)` }}>
            Full Leaderboard
          </button>
          <button onClick={() => navigate('/glow-teams')}
            className="flex-1 py-3 rounded-2xl font-semibold text-sm text-gray-300 bg-white/5 border border-white/10 transition">
            My Teams
          </button>
        </div>
      </div>

      <BottomNav active="discover" />
    </div>
  );
}