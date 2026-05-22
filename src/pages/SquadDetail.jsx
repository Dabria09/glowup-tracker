import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Users, Flame, Star, Heart, Trophy, Calendar, MessageCircle, Plus, X, Crown, Medal } from 'lucide-react';

export default function SquadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [squad, setSquad] = useState(null);
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInText, setCheckInText] = useState('');
  const [todayCheckIn, setTodayCheckIn] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.GlowSquad.filter({ id }),
      base44.entities.SquadMember.filter({ squad_id: id })
    ]).then(async ([u, squads, squadMembers]) => {
      setUser(u);
      if (squads.length > 0) {
        setSquad(squads[0]);
        setMembers(squadMembers);
        setIsMember(squadMembers.some(m => m.user_email === u.email));
        
        // Check if user checked in today
        const today = new Date().toDateString();
        // You can implement check-in logic here
      }
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  if (!squad) {
    return (
      <div className="min-h-screen text-white pb-24" style={{ backgroundColor: '#080810' }}>
        <AppBackground />
        <div className="px-4 pt-4 text-center">
          <p className="text-gray-400">Squad not found</p>
          <button onClick={() => navigate('/glow-squads')} className="mt-4 px-4 py-2 bg-pink-500 rounded-full">Back to Squads</button>
        </div>
      </div>
    );
  }

  const sortedMembers = members.sort((a, b) => b.personal_streak - a.personal_streak);

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
              <h1 className="text-lg font-bold">{squad.name}</h1>
              <p className="text-xs text-gray-400">Private Squad</p>
            </div>
            {!isMember ? (
              <button
                onClick={async () => {
                  if (squad.member_count >= squad.max_members) {
                    alert('Squad is full!');
                    return;
                  }
                  await base44.entities.SquadMember.create({
                    squad_id: squad.id,
                    user_email: user.email,
                    role: 'member',
                    joined_date: new Date().toISOString(),
                    personal_streak: 0,
                  });
                  setIsMember(true);
                  setMembers(prev => [...prev, { user_email: user.email, role: 'member', personal_streak: 0 }]);
                  await base44.entities.GlowSquad.update(squad.id, { member_count: squad.member_count + 1 });
                }}
                className="px-4 py-2 rounded-full font-bold text-white text-sm bg-pink-500 hover:bg-pink-600 transition"
              >
                Join Squad
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                ✓ Member
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-4 space-y-6">

          {/* Squad Stats Card */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-pink-900/30 to-purple-900/30 border border-pink-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-2xl">
                {squad.emoji || '💜'}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-white text-lg">{squad.name}</h2>
                <p className="text-xs text-gray-400">{squad.description || 'Your intimate circle'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 rounded-xl bg-white/5">
                <Users className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                <p className="font-bold text-white">{squad.member_count || members.length}</p>
                <p className="text-[10px] text-gray-400">Members</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/5">
                <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <p className="font-bold text-white">{squad.current_streak || 0}</p>
                <p className="text-[10px] text-gray-400">Day Streak</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/5">
                <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="font-bold text-white">{squad.squad_points || 0}</p>
                <p className="text-[10px] text-gray-400">Squad Points</p>
              </div>
            </div>

            {/* Daily Check-in Button */}
            {isMember && (
              <button
                onClick={() => setShowCheckIn(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition"
              >
                <Heart size={16} /> Daily Squad Check-in
              </button>
            )}
          </div>

          {/* Member Leaderboard */}
          <div>
            <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-3 flex items-center gap-2">
              <Trophy size={16} className="text-yellow-400" /> MEMBER LEADERBOARD
            </h3>
            <div className="space-y-2">
              {sortedMembers.map((member, idx) => (
                <div key={member.id || idx} className={`flex items-center gap-3 p-3 rounded-xl border ${
                  member.user_email === user.email 
                    ? 'bg-pink-500/10 border-pink-500/30' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="w-8 flex-shrink-0 text-center">
                    {idx === 0 ? <Crown className="text-yellow-400" size={20} /> :
                     idx === 1 ? <Medal className="text-gray-400" size={20} /> :
                     idx === 2 ? <Medal className="text-amber-600" size={20} /> :
                     <span className="text-sm font-bold text-gray-400">#{idx + 1}</span>}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                    {member.user_email?.[0]?.toUpperCase() || 'M'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      {member.user_email?.split('@')[0] || 'Member'}
                      {member.role === 'captain' && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">Captain</span>}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Flame size={10} /> {member.personal_streak} day streak</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-pink-400">{member.personal_streak}</p>
                    <p className="text-[10px] text-gray-400">streak</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Squad Progress */}
          <div>
            <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-3 flex items-center gap-2">
              <Star size={16} className="text-purple-400" /> SQUAD PROGRESS
            </h3>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Challenges Completed</span>
                <span className="text-sm font-bold text-white">{squad.challenges_completed || 0}</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 to-purple-600" style={{ width: `${Math.min((squad.challenges_completed || 0) * 10, 100)}%` }} />
              </div>
            </div>
          </div>

        </div>

        {/* Check-in Modal */}
        {showCheckIn && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowCheckIn(false)}>
            <div
              className="w-full rounded-t-3xl flex flex-col max-h-[90vh] h-full"
              style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
                <h3 className="text-lg font-bold">Daily Check-in</h3>
                <button onClick={() => setShowCheckIn(false)}><X size={20} /></button>
              </div>
              <div className="overflow-y-auto p-6 space-y-4 flex-1">
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">How's your squad doing today?</label>
                  <textarea
                    value={checkInText}
                    onChange={e => setCheckInText(e.target.value)}
                    placeholder="Share your progress, wins, or challenges..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none resize-none min-h-24"
                  />
                </div>
                <button
                  onClick={async () => {
                    // Save check-in logic here
                    setShowCheckIn(false);
                    setCheckInText('');
                    alert('Check-in saved! Your squad is proud of you 💜');
                  }}
                  className="w-full py-3 rounded-2xl font-bold text-white text-sm bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition"
                >
                  Check In 💜
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <BottomNav active="discover" />
    </div>
  );
}