import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Check, Lock, Star, ChevronDown } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { getChallengeById, PHASE_INFO } from '@/components/challenges/challengeData';

function getLocalToday() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
}

export default function GlowUpChallengeDetail() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [expandedPhase, setExpandedPhase] = useState('foundation');

  const challenge = getChallengeById(challengeId);

  const { data: userChallenge } = useQuery({
    queryKey: ['userChallenge', challengeId, user?.email],
    queryFn: async () => {
      if (!user || !challenge) return null;
      const challenges = await base44.entities.GlowUpChallenge.filter({
        user_email: user.email,
        challenge_id: challengeId,
      });
      return challenges[0] || null;
    },
    enabled: !!user && !!challenge,
  });

  const { data: allUserChallenges } = useQuery({
    queryKey: ['allUserChallenges', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.GlowUpChallenge.filter({ user_email: user.email }).catch(() => []);
    },
    enabled: !!user,
  });

  const activeChallengeId = allUserChallenges?.find(c => c.status === 'in_progress')?.challenge_id;
  const isChallengeLocked = activeChallengeId && activeChallengeId !== challengeId && userChallenge?.status !== 'completed';

  const startMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.GlowUpChallenge.create({
        user_email: user.email,
        challenge_id: challenge.id,
        challenge_name: challenge.name,
        phase: 'foundation',
        current_day: 1,
        status: 'in_progress',
        started_date: new Date().toISOString(),
        completed_days: '[]',
        total_points: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userChallenge', challengeId]);
    },
  });

  const completeDayMutation = useMutation({
    mutationFn: async ({ day, points, phase }) => {
      const existing = userChallenge?.completed_days ? JSON.parse(userChallenge.completed_days) : [];
      // Guard: don't re-award if already completed
      if (existing.includes(day)) return;
      const updatedDays = [...existing, day];

      const newPoints = (userChallenge?.total_points || 0) + points;
      const phaseDays = challenge.phases[phase]?.days.map(d => d.day) || [];
      const isPhaseComplete = phaseDays.every(d => updatedDays.includes(d));
      const phases = ['foundation', 'growth', 'mastery'];
      const nextPhase = phases[phases.indexOf(phase) + 1] || null;
      const isChallengeComplete = updatedDays.length === 30;

      const today = getLocalToday();
      const lastCompletedDate = userChallenge?.last_completed_date;
      let newStreak = userChallenge?.current_streak || 0;
      if (!lastCompletedDate) {
        newStreak = 1;
      } else if (lastCompletedDate < today) {
        newStreak = (userChallenge?.current_streak || 0) + 1;
      }
      const bestStreak = Math.max(newStreak, userChallenge?.best_streak || 0);

      return await base44.entities.GlowUpChallenge.update(userChallenge.id, {
        completed_days: JSON.stringify(updatedDays),
        total_points: newPoints,
        current_day: Math.min(day + 1, 30),
        phase: isPhaseComplete && nextPhase ? nextPhase : phase,
        status: isChallengeComplete ? 'completed' : 'in_progress',
        completed_date: isChallengeComplete ? new Date().toISOString() : null,
        current_streak: newStreak,
        best_streak: bestStreak,
        last_completed_date: today,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userChallenge', challengeId]);
    },
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  if (!challenge) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white px-6 text-center"
        style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #0d0610 100%)' }}>
        <p className="text-5xl mb-4">🔍</p>
        <h2 className="text-xl font-bold mb-2">Challenge Not Found</h2>
        <p className="text-sm text-gray-400 mb-6">We couldn't find this challenge. It may have moved or the link is incorrect.</p>
        <button onClick={() => navigate('/glow-up-challenges')}
          className="px-6 py-3 rounded-2xl font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #FF1F8E, #a855f7)' }}>
          View All Challenges
        </button>
      </div>
    );
  }

  // ── Derived state ──────────────────────────────────────────────────────────
  const completedDays = (() => {
    try { return userChallenge?.completed_days ? JSON.parse(userChallenge.completed_days) : []; }
    catch { return []; }
  })();

  const today = getLocalToday();
  const lastCompletedDate = userChallenge?.last_completed_date || null;
  const completedTodayAlready = lastCompletedDate === today;
  const progress = (completedDays.length / 30) * 100;

  // Returns true if the day is accessible (completed OR the next unlocked day)
  const canAccessDay = (day) => {
    if (user?.role === 'admin') return true;
    if (completedDays.includes(day)) return true;
    const nextDay = completedDays.length + 1;
    if (day !== nextDay) return false;
    if (day === 1) return true;
    return lastCompletedDate !== null && lastCompletedDate < today;
  };

  const canAccessPhase = (phaseKey) => {
    if (!userChallenge) return phaseKey === 'foundation';
    if (userChallenge.phase === 'mastery') return true;
    if (userChallenge.phase === 'growth') return phaseKey !== 'mastery';
    return phaseKey === 'foundation';
  };

  const isPhaseCompleted = (phaseKey) => {
    const phaseDays = challenge.phases[phaseKey]?.days.map(d => d.day) || [];
    return phaseDays.every(d => completedDays.includes(d));
  };

  const canAccessChallenge = () => {
    if (user?.role === 'admin') return true;
    if (userChallenge?.status === 'completed') return true;
    if (isChallengeLocked) return false;
    return true;
  };

  const handleStart = () => {
    if (!user) { alert('Please log in to start challenges'); return; }
    startMutation.mutate();
  };

  const handleCompleteDay = (day, points, phase) => {
    if (!user) { alert('Please log in to track progress'); return; }
    if (completedTodayAlready) return; // one task per day
    if (completedDays.includes(day)) return; // already done
    completeDayMutation.mutate({ day, points, phase });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen text-white pb-28"
      style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a18 40%, #0d0610 100%)' }}>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.07]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='%23fff'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 px-4 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/glow-up-challenges')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{challenge.name}</h1>
            <p className="text-xs text-gray-400">{challenge.subtitle}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: `linear-gradient(135deg, ${challenge.color}40, ${challenge.color}20)` }}>
            {challenge.emoji}
          </div>
        </div>

        {!canAccessChallenge() ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl"
              style={{ background: 'rgba(0,0,0,0.3)' }}>
              🔒
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Challenge Locked</h2>
            <p className="text-sm text-gray-400 mb-6">Complete your active challenge first to stay focused on your journey.</p>
            <button onClick={() => navigate('/glow-up-challenges')}
              className="px-6 py-3 rounded-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #FF1F8E, #a855f7)' }}>
              View Active Challenge
            </button>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-white">Your Progress</p>
                <p className="text-sm font-bold" style={{ color: challenge.color }}>{Math.round(progress)}%</p>
              </div>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${challenge.color}, ${challenge.color}80)` }} />
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-400">{completedDays.length}/30 days completed</p>
                <p className="text-xs" style={{ color: challenge.color }}>{userChallenge?.total_points || 0} points</p>
              </div>
            </div>

            {/* Streak */}
            <div className="rounded-2xl p-5 mb-6" style={{ background: `linear-gradient(135deg, ${challenge.color}20, ${challenge.color}10)`, border: `1px solid ${challenge.color}40` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🔥</span>
                  <div>
                    <p className="text-sm font-bold text-white">Current Streak</p>
                    <p className="text-xs text-gray-400">Keep it going!</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold" style={{ color: challenge.color }}>{userChallenge?.current_streak || 0}</p>
                  <p className="text-xs text-gray-400">days in a row</p>
                </div>
              </div>
              {userChallenge?.best_streak > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">Best Streak</p>
                    <p className="text-sm font-bold" style={{ color: challenge.color }}>{userChallenge?.best_streak} days</p>
                  </div>
                </div>
              )}
            </div>

            {!userChallenge ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl"
                  style={{ background: `linear-gradient(135deg, ${challenge.color}40, ${challenge.color}20)` }}>
                  {challenge.emoji}
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Start Your {challenge.name} Journey</h2>
                <p className="text-sm text-gray-400 mb-6">30 days to transform your life</p>
                <button onClick={handleStart}
                  className="w-full py-3 rounded-2xl font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${challenge.color}, ${challenge.color}cc)` }}>
                  Start Challenge 👑
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(challenge.phases).map(([phaseKey, phase]) => {
                  const canAccess = canAccessPhase(phaseKey);
                  const phaseCompleted = isPhaseCompleted(phaseKey);
                  const phaseInfo = PHASE_INFO[phaseKey];

                  const visibleDays = phase.days.filter(d => completedDays.includes(d.day) || canAccessDay(d.day));
                  const lockedCount = phase.days.length - visibleDays.length;
                  const hasAvailableToday = phase.days.some(d => !completedDays.includes(d.day) && canAccessDay(d.day));

                  return (
                    <div key={phaseKey} className="rounded-2xl overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', opacity: canAccess ? 1 : 0.5 }}>
                      <button
                        onClick={() => canAccess && setExpandedPhase(expandedPhase === phaseKey ? null : phaseKey)}
                        className="w-full flex items-center gap-3 p-4 transition"
                        style={{ background: expandedPhase === phaseKey ? 'rgba(255,255,255,0.08)' : 'transparent' }}>
                        <span className="text-2xl">{phaseInfo.emoji}</span>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-white text-sm">{phaseInfo.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{phase.name}</p>
                        </div>
                        {!canAccess ? (
                          <Lock size={18} className="text-gray-500" />
                        ) : phaseCompleted ? (
                          <Star size={18} className="text-yellow-400" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-500"
                            style={{ transform: expandedPhase === phaseKey ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        )}
                      </button>

                      {canAccess && expandedPhase === phaseKey && (
                        <div className="px-4 pb-4 pt-0 border-t border-white/5">
                          <div className="space-y-2 mt-3">
                            {/* Completed + currently available days only */}
                            {visibleDays.map(dayObj => {
                              const isDayCompleted = completedDays.includes(dayObj.day);
                              const isActionable = !isDayCompleted && !completedTodayAlready && !completeDayMutation.isPending;
                              return (
                                <div key={dayObj.day} className="flex items-center gap-3 p-3 rounded-xl"
                                  style={{
                                    background: isDayCompleted ? `${challenge.color}20` : 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${isDayCompleted ? challenge.color + '40' : 'rgba(255,255,255,0.08)'}`,
                                  }}>
                                  {isDayCompleted ? (
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                      style={{ background: challenge.color }}>
                                      <Check size={14} className="text-white" />
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleCompleteDay(dayObj.day, dayObj.points, phaseKey)}
                                      disabled={!isActionable}
                                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition disabled:opacity-40"
                                      style={{
                                        background: isActionable ? challenge.color + '30' : 'rgba(0,0,0,0.3)',
                                        border: `1px solid ${isActionable ? challenge.color + '80' : 'rgba(255,255,255,0.1)'}`,
                                      }}>
                                      <span className="text-xs" style={{ color: isActionable ? challenge.color : '#6b7280' }}>{dayObj.day}</span>
                                    </button>
                                  )}
                                  <div className="flex-1">
                                    <p className={`text-xs ${isDayCompleted ? 'text-white/60 line-through' : 'text-white font-medium'}`}>
                                      {dayObj.task}
                                    </p>
                                  </div>
                                  <span className="text-xs font-bold"
                                    style={{ color: isDayCompleted ? 'rgba(255,255,255,0.35)' : challenge.color }}>
                                    +{dayObj.points}
                                  </span>
                                </div>
                              );
                            })}

                            {/* Already completed today — block next task */}
                            {completedTodayAlready && hasAvailableToday && (
                              <div className="flex items-center gap-2 p-3 rounded-xl"
                                style={{ background: `${challenge.color}10`, border: `1px solid ${challenge.color}30` }}>
                                <span className="text-sm">⏰</span>
                                <p className="text-xs flex-1" style={{ color: challenge.color }}>
                                  You already completed today's task. Come back tomorrow to unlock the next day!
                                </p>
                              </div>
                            )}

                            {/* Locked days summary */}
                            {lockedCount > 0 && (
                              <div className="flex items-center gap-3 p-3 rounded-xl"
                                style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ background: 'rgba(0,0,0,0.4)' }}>
                                  <Lock size={12} className="text-gray-500" />
                                </div>
                                <p className="text-xs text-gray-500 flex-1">
                                  {lockedCount} day{lockedCount > 1 ? 's' : ''} locked — complete each day one at a time
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav active="glow" />
    </div>
  );
}