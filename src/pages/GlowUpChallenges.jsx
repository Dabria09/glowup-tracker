import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Sparkles, Crown, Zap, Heart, Star, ChevronLeft } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { CHALLENGES } from '@/components/challenges/challengeData';

export default function GlowUpChallenges() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const userChallenges = await base44.entities.GlowUpChallenge.filter({ user_email: u.email }).catch(() => []);
      setChallenges(userChallenges);
      const certs = await base44.entities.GlowUpCertificate.filter({ user_email: u.email }).catch(() => []);
      setCertificate(certs[0] || null);
    }).catch(() => setUser(null));
  }, []);

  const getChallengeProgress = (challengeId) => {
    const userChallenge = challenges.find(c => c.challenge_id === challengeId);
    if (!userChallenge) return { status: 'locked', progress: 0, completedDays: 0 };
    const completedCount = userChallenge.completed_days?.length || 0;
    return {
      status: userChallenge.status,
      progress: (completedCount / 30) * 100,
      completedDays: completedCount,
    };
  };

  const totalCompleted = challenges.filter(c => c.status === 'completed').length;
  const totalDaysCompleted = challenges.reduce((sum, c) => sum + (c.completed_days?.length || 0), 0);
  const totalPoints = challenges.reduce((sum, c) => sum + (c.total_points || 0), 0);
  
  // Find active challenge (in_progress)
  const activeChallenge = challenges.find(c => c.status === 'in_progress');

  return (
    <div className="min-h-screen text-white pb-28"
      style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a18 40%, #0d0610 100%)' }}>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.07]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='%23fff'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 px-4 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/discover')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">6 Glow Up Challenges</h1>
            <p className="text-xs text-gray-400">180 Days to Your Best Self 👑</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="text-center p-4 rounded-2xl" style={{ background: 'rgba(255,31,142,0.1)', border: '1px solid rgba(255,31,142,0.2)' }}>
            <p className="text-2xl font-bold" style={{ color: '#FF1F8E' }}>{totalCompleted}/6</p>
            <p className="text-xs text-gray-400 mt-1">Challenges Done</p>
          </div>
          <div className="text-center p-4 rounded-2xl" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)' }}>
            <p className="text-2xl font-bold" style={{ color: '#FFD700' }}>{totalDaysCompleted}</p>
            <p className="text-xs text-gray-400 mt-1">Days Completed</p>
          </div>
          <div className="text-center p-4 rounded-2xl" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <p className="text-2xl font-bold" style={{ color: '#c084fc' }}>{totalPoints}</p>
            <p className="text-xs text-gray-400 mt-1">Total Points</p>
          </div>
        </div>

        {/* Certificate Banner */}
        {certificate ? (
          <div className="rounded-2xl p-5 mb-8 border border-yellow-500/30"
            style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,180,0,0.1))' }}>
            <div className="flex items-center gap-3 mb-3">
              <Crown size={24} className="text-yellow-400" />
              <p className="text-sm font-bold text-yellow-400 uppercase tracking-widest">Glow Crown Earned! 👑</p>
            </div>
            <p className="text-white text-sm leading-relaxed">
              Congratulations! You've completed all 6 challenges and earned your exclusive Glow Crown Certificate.
            </p>
            <p className="text-xs text-gray-400 mt-3">Earned: {new Date(certificate.earned_date).toLocaleDateString()}</p>
          </div>
        ) : (
          <div className="rounded-2xl p-5 mb-8 border border-purple-500/30"
            style={{ background: 'rgba(168,85,247,0.1)' }}>
            <div className="flex items-center gap-3 mb-3">
              <Crown size={24} className="text-purple-400" />
              <p className="text-sm font-bold text-purple-400 uppercase tracking-widest">Glow Crown Certificate</p>
            </div>
            <p className="text-white text-sm leading-relaxed">
              Complete all 6 challenges (180 days total) to earn your exclusive Glow Crown Certificate from Girls Glowing Up™ Academy.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(totalCompleted / 6) * 100}%`, background: 'linear-gradient(90deg, #FF1F8E, #a855f7)' }} />
              </div>
              <p className="text-xs text-gray-400">{totalCompleted}/6</p>
            </div>
          </div>
        )}

        {/* Progression Path */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-yellow-400" />
            <h2 className="text-lg font-bold text-white">Your Progression Path</h2>
          </div>
          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-500 via-purple-500 to-yellow-500" />
            
            {/* Steps */}
            <div className="space-y-6">
              {[
                { num: 1, title: 'Start Your Journey', desc: 'Choose your first challenge', color: '#FF1F8E', completed: totalCompleted >= 1 },
                { num: 2, title: 'Build Momentum', desc: 'Complete 30 days', color: '#a855f7', completed: totalCompleted >= 2 },
                { num: 3, title: 'Level Up', desc: 'Master 3 challenges', color: '#3b82f6', completed: totalCompleted >= 3 },
                { num: 4, title: 'Earn Your Crown', desc: 'Complete all 180 days', color: '#FFD700', completed: totalCompleted === 6 },
              ].map((step, i) => (
                <div key={step.num} className="relative flex items-start gap-4 pl-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 z-10"
                    style={{ background: step.completed ? `linear-gradient(135deg, ${step.color}40, ${step.color}20)` : 'rgba(255,255,255,0.05)', border: `1px solid ${step.completed ? step.color : 'rgba(255,255,255,0.1)'}` }}>
                    {step.completed ? (
                      <Star size={24} className="text-white" style={{ color: step.color }} fill={step.color} />
                    ) : (
                      <span className="text-xl font-bold" style={{ color: step.color }}>{step.num}</span>
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="font-bold text-white" style={{ color: step.completed ? step.color : '#9ca3af' }}>{step.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart size={18} className="text-pink-400" />
            <h2 className="text-lg font-bold text-white">Your Challenges</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {CHALLENGES.map(challenge => {
              const progress = getChallengeProgress(challenge.id);
              const isCompleted = progress.status === 'completed';
              const isActive = progress.status === 'in_progress';
              const isLocked = activeChallenge && !isCompleted && !isActive;
              
              return (
                <button 
                  key={challenge.id} 
                  onClick={() => !isLocked && navigate(`/glow-up-challenges/${challenge.id}`)}
                  className={`text-left rounded-2xl p-4 transition ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                    style={{ background: `linear-gradient(135deg, ${challenge.color}40, ${challenge.color}20)`, border: `1px solid ${challenge.color}40` }}>
                    {challenge.emoji}
                  </div>
                  <p className="text-xs font-semibold mb-1" style={{ color: challenge.color }}>{challenge.subtitle}</p>
                  <h3 className="font-bold text-white text-sm mb-2">{challenge.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${progress.progress}%`, background: `linear-gradient(90deg, ${challenge.color}, ${challenge.color}80)` }} />
                    </div>
                    <p className="text-[10px] font-bold" style={{ color: challenge.color }}>{Math.round(progress.progress)}%</p>
                  </div>
                  {isCompleted && (
                    <p className="text-[10px] text-green-400 mt-2 flex items-center gap-1">
                      <Star size={8} /> Done
                    </p>
                  )}
                  {isActive && (
                    <p className="text-[10px] text-pink-400 mt-2 flex items-center gap-1">
                      <Sparkles size={8} /> In Progress
                    </p>
                  )}
                  {isLocked && (
                    <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                      🔒 Complete active challenge first
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>


      </div>

      <BottomNav active="glow" />
    </div>
  );
}