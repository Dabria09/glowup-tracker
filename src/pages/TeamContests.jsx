import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Trophy, Flame, Star, Medal, Crown, Users } from 'lucide-react';

export default function TeamContests() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeContest, setActiveContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userTeams, setUserTeams] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loggedProgress, setLoggedProgress] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const user = await base44.auth.me();
          setCurrentUser(user);
          
          const [contests, entries, teams] = await Promise.all([
            base44.entities.TeamContest.filter({ status: 'active' }),
            base44.entities.TeamContestEntry.list(),
            base44.entities.TeamMember.filter({ user_email: user.email })
          ]);
          
          setUserTeams(teams);
          
          if (contests.length > 0) {
            const contest = contests[0];
            setActiveContest(contest);
            
            const sorted = entries
              .filter(e => e.contest_id === contest.id)
              .sort((a, b) => b.current_progress - a.current_progress);
            
            setLeaderboard(sorted);
          }
        }
      } catch (err) {
        console.error('Error loading contests:', err);
      }
      setLoading(false);
    };
    
    loadData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  const handleLogProgress = async () => {
    if (!currentUser || !activeContest || userTeams.length === 0) return;
    const teamId = userTeams[0].team_id;
    const existing = leaderboard.find(e => e.team_id === teamId);
    if (existing) {
      await base44.entities.TeamContestEntry.update(existing.id, {
        current_progress: (existing.current_progress || 0) + 1,
      });
      setLeaderboard(prev => prev.map(e => e.team_id === teamId ? { ...e, current_progress: (e.current_progress || 0) + 1 } : e).sort((a, b) => b.current_progress - a.current_progress));
    } else {
      const newEntry = await base44.entities.TeamContestEntry.create({
        contest_id: activeContest.id,
        team_id: teamId,
        current_progress: 1,
      });
      setLeaderboard(prev => [...prev, newEntry].sort((a, b) => b.current_progress - a.current_progress));
    }
    setLoggedProgress(true);
    setTimeout(() => setLoggedProgress(false), 2000);
  };

  if (!activeContest) {
    return (
      <div className="min-h-screen text-white pb-24 relative overflow-y-auto" style={{ backgroundColor: '#080810' }}>
        <AppBackground />
        <div className="relative z-10 px-4 pt-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">🏆 Team Contests</h1>
          </div>
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">🎉</span>
            <p className="font-bold text-lg text-white mb-2">No active contests right now</p>
            <p className="text-gray-400 text-sm mb-6">Check back soon for the next team challenge!</p>
            {currentUser?.role === 'admin' && (
              <p className="text-xs text-pink-400">Admin: create a TeamContest record with status &quot;active&quot; in the Admin panel to start a contest.</p>
            )}
          </div>
        </div>
        <BottomNav active="discover" />
      </div>
    );
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="text-yellow-400" size={24} />;
    if (rank === 2) return <Medal className="text-gray-400" size={24} />;
    if (rank === 3) return <Medal className="text-amber-600" size={24} />;
    return <span className="text-xl font-bold text-gray-400">#{rank}</span>;
  };

  const progressPercentage = (progress) => {
    return Math.min((progress / activeContest.target_value) * 100, 100);
  };

  return (
    <div className="min-h-screen text-white pb-24 relative overflow-y-auto" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">🏆 Team Contest</h1>
            <p className="text-xs text-gray-400">Your team competes. Everyone rises.</p>
          </div>
        </div>

        {/* Contest Info */}
        <div className="rounded-2xl p-5 mb-6 bg-gradient-to-br from-yellow-900/50 to-amber-900/50 border border-yellow-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="text-yellow-400" size={24} />
            <h2 className="font-bold text-white text-lg">{activeContest.contest_name}</h2>
          </div>
          <p className="text-sm text-gray-200 mb-3">{activeContest.description}</p>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
            <span>Challenge: {activeContest.challenge_type}</span>
            <span>Target: {activeContest.target_value}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs">
              <p className="text-gray-400">Ends in</p>
              <p className="font-bold text-white">
                {Math.ceil((new Date(activeContest.end_date) - new Date()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">Prize</p>
              <p className="font-bold text-yellow-400 text-sm">{activeContest.prize_description}</p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="mb-6">
          <h2 className="text-sm font-bold tracking-widest text-gray-400 mb-3">TEAM LEADERBOARD</h2>
          <div className="space-y-3">
            {leaderboard.map((entry, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const isMyTeam = userTeams.some(t => t.team_id === entry.team_id);
              
              return (
                <div
                  key={entry.team_id}
                  onClick={() => navigate(`/glow-teams/${entry.team_id}`)}
                  className={`rounded-2xl p-4 cursor-pointer transition hover:scale-[1.02] ${
                    isMyTeam ? 'ring-2 ring-pink-500' : ''
                  }`}
                  style={{ 
                    background: isTop3 
                      ? 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.1))'
                      : 'rgba(255,255,255,0.07)',
                    border: isTop3 ? '1px solid rgba(236,72,153,0.3)' : '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 flex-shrink-0">
                      {getRankIcon(rank)}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-lg flex-shrink-0">
                      {entry.team_emoji || '🌟'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-white text-sm">{entry.team_name}</p>
                          <p className="text-[10px] text-gray-400">{entry.team_category}</p>
                          {isMyTeam && <p className="text-[10px] text-pink-400">Your Team</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-yellow-400 text-sm">{entry.current_progress}</p>
                          <p className="text-[10px] text-gray-400">points</p>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500"
                          style={{ width: `${progressPercentage(entry.current_progress)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {entry.current_progress} / {activeContest.target_value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Your Team */}
        {userTeams.length > 0 && (
          <div>
            <h2 className="text-sm font-bold tracking-widest text-gray-400 mb-3">YOUR TEAM</h2>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-xs text-gray-400 mb-3">Every action earns points for your team 💜</p>
              <button
                onClick={handleLogProgress}
                disabled={loggedProgress}
                className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-60 transition"
                style={{ background: loggedProgress ? 'rgba(52,211,153,0.3)' : 'linear-gradient(135deg, #ec4899, #a855f7)' }}
              >
                {loggedProgress ? '✓ Progress Logged!' : '🔥 Log My Contribution (+1 point for team)'}
              </button>
            </div>
          </div>
        )}

      </div>

      <BottomNav active="discover" />
    </div>
  );
}