import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Trophy, Sparkles, Crown, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { CHALLENGES, getTotalPoints } from '@/components/challenges/challengeData';

export default function GlowUpChallenges() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['glowUpChallenges', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.GlowUpChallenge.filter({ user_email: user.email });
    },
    enabled: !!user,
  });

  const { data: certificate } = useQuery({
    queryKey: ['glowUpCertificate', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const certs = await base44.entities.GlowUpCertificate.filter({ user_email: user.email });
      return certs[0] || null;
    },
    enabled: !!user,
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const getChallengeProgress = (challengeId) => {
    const userChallenge = challenges.find(c => c.challenge_id === challengeId);
    if (!userChallenge) return { status: 'not_started', progress: 0, currentDay: 1, completedDays: [] };
    const totalDays = 30;
    const completedCount = userChallenge.completed_days?.length || 0;
    return {
      status: userChallenge.status,
      progress: (completedCount / totalDays) * 100,
      currentDay: userChallenge.current_day,
      completedDays: userChallenge.completed_days || [],
      phase: userChallenge.phase,
    };
  };

  const totalCompleted = challenges.filter(c => c.status === 'completed').length;
  const totalDaysCompleted = challenges.reduce((sum, c) => sum + (c.completed_days?.length || 0), 0);
  const totalPoints = challenges.reduce((sum, c) => sum + (c.total_points || 0), 0);

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
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-4 rounded-2xl" style={{ background: 'rgba(255,31,142,0.1)', border: '1px solid rgba(255,31,142,0.2)' }}>
            <p className="text-2xl font-bold" style={{ color: '#FF1F8E' }}>{totalCompleted}/6</p>
            <p className="text-xs text-gray-400 mt-1">Completed</p>
          </div>
          <div className="text-center p-4 rounded-2xl" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)' }}>
            <p className="text-2xl font-bold" style={{ color: '#FFD700' }}>{totalDaysCompleted}</p>
            <p className="text-xs text-gray-400 mt-1">Days Done</p>
          </div>
          <div className="text-center p-4 rounded-2xl" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <p className="text-2xl font-bold" style={{ color: '#c084fc' }}>{totalPoints}</p>
            <p className="text-xs text-gray-400 mt-1">Points</p>
          </div>
        </div>

        {/* Certificate Banner */}
        {certificate ? (
          <div className="rounded-2xl p-5 mb-6 border border-yellow-500/30"
            style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,180,0,0.1))' }}>
            <div className="flex items-center gap-3 mb-3">
              <Crown size={24} className="text-yellow-400" />
              <p className="text-sm font-bold text-yellow-400 uppercase tracking-widest">Glow Crown Earned!</p>
            </div>
            <p className="text-white text-sm leading-relaxed">
              Congratulations! You've completed all 6 challenges and earned your Glow Crown Certificate. You are officially glowing up! 👑✨
            </p>
            <p className="text-xs text-gray-400 mt-3">Earned: {new Date(certificate.earned_date).toLocaleDateString()}</p>
          </div>
        ) : (
          <div className="rounded-2xl p-5 mb-6 border border-purple-500/30"
            style={{ background: 'rgba(168,85,247,0.1)' }}>
            <div className="flex items-center gap-3 mb-3">
              <Trophy size={24} className="text-purple-400" />
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

        {/* Challenge Cards */}
        <div className="space-y-4">
          {CHALLENGES.map(challenge => {
            const progress = getChallengeProgress(challenge.id);
            return (
              <button key={challenge.id} onClick={() => navigate(`/glow-up-challenges/${challenge.id}`)}
                className="w-full text-left rounded-2xl p-5 transition hover:opacity-90"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${challenge.color}40, ${challenge.color}20)`, border: `1px solid ${challenge.color}40` }}>
                    {challenge.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold mb-0.5" style={{ color: challenge.color }}>{challenge.subtitle}</p>
                    <h3 className="font-bold text-white text-lg mb-1">{challenge.name}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-3">{challenge.description}</p>
                    
                    {/* Progress */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full" 
                          style={{ width: `${progress.progress}%`, background: `linear-gradient(90deg, ${challenge.color}, ${challenge.color}80)` }} />
                      </div>
                      <p className="text-xs font-bold" style={{ color: challenge.color }}>{Math.round(progress.progress)}%</p>
                    </div>
                    
                    {progress.status === 'completed' && (
                      <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                        <Sparkles size={12} /> Completed!
                      </p>
                    )}
                  </div>
                  <ChevronRight size={18} className="text-gray-500 flex-shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <BottomNav active="glow" />
    </div>
  );
}