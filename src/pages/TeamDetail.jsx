import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Users, Trophy, Flame, MessageCircle, Star, Crown, Medal, TrendingUp, Calendar, Plus } from 'lucide-react';

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [contestEntries, setContestEntries] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadData = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const u = await base44.auth.me();
          setUser(u);
          
          const [teamData, teamMembers, teamDiscussions, entries] = await Promise.all([
            base44.entities.GlowTeam.get(id),
            base44.entities.TeamMember.filter({ team_id: id }),
            base44.entities.TeamDiscussion.filter({ team_id: id }),
            base44.entities.TeamContestEntry.filter({ team_id: id })
          ]);
          
          if (teamData) {
            setTeam(teamData);
            setMembers(teamMembers);
            setDiscussions(teamDiscussions);
            setContestEntries(entries);
            setIsMember(teamMembers.some(m => m.user_email === u.email));
          }
        }
      } catch (err) {
        console.error('Error loading team:', err);
      }
      setLoading(false);
    };
    
    loadData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  if (!team) {
    return (
      <div className="min-h-screen text-white pb-24" style={{ backgroundColor: '#080810' }}>
        <AppBackground />
        <div className="px-4 pt-4 text-center">
          <p className="text-gray-400">Team not found</p>
          <button onClick={() => navigate('/glow-teams')} className="mt-4 px-4 py-2 bg-pink-500 rounded-full">Back to Teams</button>
        </div>
      </div>
    );
  }

  const topContributors = members.sort((a, b) => b.contribution_points - a.contribution_points).slice(0, 5);
  const recentDiscussions = discussions.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5);

  return (
    <div className="min-h-screen text-white pb-24 relative overflow-y-auto" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10">

        {/* Header */}
        <div className="sticky top-0 z-20 backdrop-blur-md bg-black/30 border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold">{team.name}</h1>
              <p className="text-xs text-gray-400">{team.category}</p>
            </div>
            {(user?.role === 'admin' || team.created_by === user?.email) && (
              <button
                onClick={async () => {
                  if (!window.confirm(`Delete "${team.name}"? This cannot be undone.`)) return;
                  const allMembers = await base44.entities.TeamMember.filter({ team_id: team.id });
                  for (const m of allMembers) await base44.entities.TeamMember.delete(m.id);
                  await base44.entities.GlowTeam.delete(team.id);
                  navigate('/glow-teams');
                }}
                className="px-3 py-1.5 rounded-full font-bold text-red-400 text-xs border border-red-400/40 hover:bg-red-400/10 transition"
              >
                Delete
              </button>
            )}
            {!isMember ? (
              <button
                onClick={async () => {
                  await base44.entities.TeamMember.create({
                    team_id: team.id,
                    user_email: user.email,
                    role: 'member',
                    joined_date: new Date().toISOString(),
                    contribution_points: 0,
                  });
                  setIsMember(true);
                  setMembers(prev => [...prev, { user_email: user.email, role: 'member', contribution_points: 0 }]);
                }}
                className="px-4 py-2 rounded-full font-bold text-white text-sm bg-pink-500 hover:bg-pink-600 transition"
              >
                Join Team
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                ✓ Member
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-4 space-y-6">

          {/* Team Stats */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-pink-900/30 to-purple-900/30 border border-pink-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-2xl">
                {team.emoji || '🌟'}
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">{team.name}</h2>
                <p className="text-xs text-gray-400">{team.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-white/5">
                <Users className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                <p className="font-bold text-white">{team.member_count || members.length}</p>
                <p className="text-[10px] text-gray-400">Members</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/5">
                <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="font-bold text-white">{team.total_points || 0}</p>
                <p className="text-[10px] text-gray-400">Total Points</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/5">
                <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <p className="font-bold text-white">{team.current_streak || 0}</p>
                <p className="text-[10px] text-gray-400">Day Streak</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10">
            {['overview', 'members', 'discussions', 'contests'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-4 font-semibold text-sm transition border-b-2 capitalize ${
                  activeTab === tab ? 'text-pink-400 border-pink-400' : 'text-gray-400 border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Contributors */}
              <div>
                <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                  <Trophy size={16} className="text-yellow-400" /> TOP CONTRIBUTORS
                </h3>
                <div className="space-y-2">
                  {topContributors.map((member, idx) => (
                    <div key={member.id || idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                      <div className="w-8 flex-shrink-0">
                        {idx === 0 ? <Crown className="text-yellow-400" size={20} /> :
                         idx === 1 ? <Medal className="text-gray-400" size={20} /> :
                         idx === 2 ? <Medal className="text-amber-600" size={20} /> :
                         <span className="text-sm font-bold text-gray-400">#{idx + 1}</span>}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                        {member.user_email?.[0]?.toUpperCase() || 'M'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{member.user_email?.split('@')[0] || 'Member'}</p>
                        <p className="text-xs text-gray-400 capitalize">{member.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-pink-400">{member.contribution_points}</p>
                        <p className="text-[10px] text-gray-400">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Discussions */}
              <div>
                <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                  <MessageCircle size={16} className="text-purple-400" /> RECENT DISCUSSIONS
                </h3>
                {recentDiscussions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">No discussions yet. Start one!</div>
                ) : (
                  <div className="space-y-2">
                    {recentDiscussions.map((disc, idx) => (
                      <div key={disc.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold text-white">{disc.title || 'Discussion'}</p>
                            <p className="text-xs text-gray-400">{disc.username || disc.user_email?.split('@')[0]}</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                            {disc.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 line-clamp-2">{disc.content}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><MessageCircle size={12} /> {disc.comments || 0}</span>
                          <span className="flex items-center gap-1"><Star size={12} /> {disc.likes || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div>
              <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-3">ALL MEMBERS ({members.length})</h3>
              <div className="space-y-2">
                {members.map((member, idx) => (
                  <div key={member.id || idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                      {member.user_email?.[0]?.toUpperCase() || 'M'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{member.user_email?.split('@')[0] || 'Member'}</p>
                      <p className="text-xs text-gray-400 capitalize">{member.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-pink-400">{member.contribution_points}</p>
                      <p className="text-[10px] text-gray-400">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discussions Tab */}
          {activeTab === 'discussions' && (
            <div>
              <button
                onClick={() => navigate(`/glow-teams/${id}/discuss`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl mb-4 font-semibold text-sm bg-pink-500 hover:bg-pink-600 transition"
              >
                <Plus size={16} /> Start New Discussion
              </button>
              <div className="space-y-3">
                {discussions.map((disc) => (
                  <div key={disc.id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-white">{disc.title || 'Discussion'}</p>
                        <p className="text-xs text-gray-400">{disc.username || disc.user_email?.split('@')[0]}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                        {disc.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{disc.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><MessageCircle size={14} /> {disc.comments || 0} comments</span>
                      <span className="flex items-center gap-1"><Star size={14} /> {disc.likes || 0} likes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contests Tab */}
          {activeTab === 'contests' && (
            <div className="space-y-4">
              {contestEntries.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p>No contest entries yet</p>
                </div>
              ) : (
                contestEntries.map((entry, idx) => (
                  <div key={entry.id} className="p-4 rounded-2xl bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border border-yellow-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-white">Team Contest</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                        Rank #{entry.rank || idx + 1}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Progress</p>
                        <p className="font-bold text-white text-lg">{entry.current_progress} pts</p>
                      </div>
                      <TrendingUp className="text-green-400" size={24} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>

      <BottomNav active="discover" />
    </div>
  );
}