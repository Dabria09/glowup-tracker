import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Flame, Zap, Sparkles } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const STAGES = [
  { id: 'seedling', name: 'Seedling', emoji: '🌱', minPoints: 0, maxPoints: 100, color: '#10b981', description: "You've started your journey. Every glow girl begins somewhere." },
  { id: 'growing', name: 'Growing', emoji: '🌿', minPoints: 100, maxPoints: 250, color: '#14b8a6', description: 'You\'re building momentum. Keep showing up for yourself!' },
  { id: 'glowing', name: 'Glowing', emoji: '✨', minPoints: 250, maxPoints: 500, color: '#f59e0b', description: 'You\'re shining bright! Your dedication is paying off.' },
  { id: 'blooming', name: 'Blooming', emoji: '🌸', minPoints: 500, maxPoints: 750, color: '#ec4899', description: 'You\'re in full bloom! This is your season.' },
  { id: 'leveling_up', name: 'Leveling Up', emoji: '💎', minPoints: 750, maxPoints: 1000, color: '#a855f7', description: 'You\'re reaching new heights. The crown awaits!' },
  { id: 'glow_queen', name: 'Glow Queen', emoji: '👑', minPoints: 1000, maxPoints: Infinity, color: '#fbbf24', description: 'You ARE the glow! You\'re inspiring others.' },
];

export default function GlowScore() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [totalPoints, setTotalPoints] = useState(15);
  const [dayStreak, setDayStreak] = useState(5);
  const [activities, setActivities] = useState(8);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const currentStage = STAGES.find(s => totalPoints >= s.minPoints && totalPoints < s.maxPoints) || STAGES[0];
  const nextStage = STAGES[STAGES.indexOf(currentStage) + 1];
  const pointsInStage = totalPoints - currentStage.minPoints;
  const pointsNeededForStage = currentStage.maxPoints - currentStage.minPoints;
  const stageProgress = (pointsInStage / pointsNeededForStage) * 100;
  const pointsUntilNext = nextStage ? nextStage.minPoints - totalPoints : 0;

  const stageIndex = STAGES.indexOf(currentStage);

  return (
    <div className="min-h-screen text-white pb-28" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.05]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='%23fff'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/discover')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">⭐</span>
              <span className="text-xs font-bold tracking-widest text-yellow-400">GLOW SCORE™</span>
            </div>
            <h1 className="text-2xl font-bold">Your Glow Journey</h1>
            <p className="text-xs text-gray-400">Level up by showing up every day</p>
          </div>
        </div>

        {/* Main Stage Card */}
        <div className="rounded-3xl p-6 mb-6 overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${currentStage.color}20, ${currentStage.color}10)`, border: `1px solid ${currentStage.color}30` }}>
          <div className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext x='20' y='60' font-size='40' fill='%23fff'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />
          
          <div className="relative z-10">
            {/* Stage Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Current Stage</p>
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{currentStage.emoji}</span>
                  <div>
                    <h2 className="text-3xl font-bold text-white">{currentStage.name}</h2>
                    <p className="text-xs text-gray-300 mt-1">{currentStage.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Points Display */}
            <div className="text-center mb-6">
              <p className="text-6xl font-bold text-white mb-2">{totalPoints}</p>
              <p className="text-sm text-gray-300">Total Glow Points</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-300">{currentStage.name}</span>
                <span className="text-xs font-semibold" style={{ color: currentStage.color }}>{nextStage ? currentStage.name : currentStage.name}</span>
              </div>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${stageProgress}%`, background: `linear-gradient(90deg, ${currentStage.color}, ${currentStage.color}80)` }} />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {nextStage ? `${pointsUntilNext} points to ${nextStage.name}` : 'You are a Glow Queen! 👑'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex justify-center mb-2">
              <Flame size={24} className="text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{dayStreak}</p>
            <p className="text-xs text-gray-400">Day Streak</p>
          </div>
          <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex justify-center mb-2">
              <Zap size={24} className="text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stageIndex + 1}</p>
            <p className="text-xs text-gray-400">Level</p>
          </div>
          <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex justify-center mb-2">
              <Sparkles size={24} className="text-pink-500" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{activities}</p>
            <p className="text-xs text-gray-400">Activities</p>
          </div>
        </div>

        {/* Your Glow Stage Progression */}
        <div className="mb-8">
          <p className="text-xs font-bold tracking-widest text-gray-500 mb-4">YOUR GLOW STAGE</p>
          <div className="grid grid-cols-3 gap-2">
            {STAGES.map((stage, idx) => (
              <div 
                key={stage.id}
                className="rounded-2xl p-3 text-center transition-all cursor-pointer"
                style={{
                  background: idx <= stageIndex ? `linear-gradient(135deg, ${stage.color}30, ${stage.color}15)` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${idx <= stageIndex ? stage.color + '50' : 'rgba(255,255,255,0.1)'}`,
                  opacity: idx <= stageIndex ? 1 : 0.5
                }}
              >
                <p className="text-2xl mb-1">{stage.emoji}</p>
                <p className="text-xs font-semibold text-white">{stage.name}</p>
                {idx === stageIndex && (
                  <div className="w-1.5 h-1.5 rounded-full mx-auto mt-2" style={{ backgroundColor: stage.color }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* How to Earn Points */}
        <div className="mb-4">
          <p className="text-xs font-bold tracking-widest text-gray-500 mb-4">HOW TO EARN GLOW POINTS</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-sm font-semibold text-white mb-1">✨ Daily Check-In</p>
              <p className="text-xs text-gray-400">+10-15 pts</p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-sm font-semibold text-white mb-1">🔥 Glow Challenges</p>
              <p className="text-xs text-gray-400">+20-45 pts</p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-sm font-semibold text-white mb-1">📚 Complete Lessons</p>
              <p className="text-xs text-gray-400">+20 pts</p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-sm font-semibold text-white mb-1">💬 Diary Entry</p>
              <p className="text-xs text-gray-400">+5 pts</p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-sm font-semibold text-white mb-1">🎯 Goal Progress</p>
              <p className="text-xs text-gray-400">+10 pts</p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-sm font-semibold text-white mb-1">💭 Save a Quote</p>
              <p className="text-xs text-gray-400">+2 pts</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="me" />
    </div>
  );
}