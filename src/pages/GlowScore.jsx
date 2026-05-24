import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ChevronDown, Flame, Zap, Sparkles, Lock } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const STAGES = [
  { id: 'seedling', name: 'Seedling', emoji: '🌱', minPoints: 0, maxPoints: 100, color: '#10b981', description: "You've started your journey. Every glow girl begins somewhere." },
  { id: 'growing', name: 'Growing', emoji: '🌿', minPoints: 100, maxPoints: 250, color: '#14b8a6', description: 'You\'re building momentum. Keep showing up for yourself!' },
  { id: 'glowing', name: 'Glowing', emoji: '✨', minPoints: 250, maxPoints: 500, color: '#f59e0b', description: 'You\'re shining bright! Your dedication is paying off.' },
  { id: 'blooming', name: 'Blooming', emoji: '🌸', minPoints: 500, maxPoints: 750, color: '#ec4899', description: 'You\'re in full bloom! This is your season.' },
  { id: 'leveling_up', name: 'Leveling Up', emoji: '💎', minPoints: 750, maxPoints: 1000, color: '#a855f7', description: 'You\'re reaching new heights. The crown awaits!' },
  { id: 'glow_queen', name: 'Glow Queen', emoji: '👑', minPoints: 1000, maxPoints: Infinity, color: '#fbbf24', description: 'You ARE the glow! You\'re inspiring others.' },
];

const BADGES = [
  { id: 'she_wrote', name: 'She Wrote', desc: 'Wrote 10+ diary entries', emoji: '✍️', tier: 'COMMON', earned: true },
  { id: 'shout_out_star', name: 'Shout Out Star', desc: 'Posted on Shout Out Wall', emoji: '📣', tier: 'COMMON', earned: true },
  { id: 'wisdom_collector', name: 'Wisdom Collector', desc: 'Saved 10+ quotes', emoji: '📚', tier: 'COMMON', earned: false },
  { id: 'first_step', name: 'First Step', desc: 'Wrote your very first diary entry', emoji: '👣', tier: 'COMMON', earned: false },
];

const SECRET_BADGES = [
  { id: 'secret1', name: 'Mystery Badge', desc: '???', emoji: '🔐', discovered: false },
  { id: 'secret2', name: 'Hidden Gem', desc: '???', emoji: '💎', discovered: false },
  { id: 'secret3', name: 'Surprise', desc: '???', emoji: '🎁', discovered: false },
  { id: 'secret4', name: 'Legendary', desc: '???', emoji: '⚡', discovered: false },
];

const SEASONAL_EVENTS = [
  { id: 'summer', name: 'Summer Glow Up', emoji: '🌸', desc: 'Limited badges & rewards', limited: true },
  { id: 'winter', name: 'Winter Reset', emoji: '❄️', desc: 'New year, new you', limited: true },
  { id: 'back_to_school', name: 'Back-to-School', emoji: '📚', desc: 'Academic glow season', limited: true },
  { id: 'self_love', name: 'Self-Love Feb', emoji: '💖', desc: '28 days of self-care', limited: true },
];

export default function GlowScore() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [totalPoints, setTotalPoints] = useState(15);
  const [dayStreak, setDayStreak] = useState(5);
  const [activities, setActivities] = useState(8);
  const [expandedTier, setExpandedTier] = useState(null);
  const [activeTab, setActiveTab] = useState('checkin');

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

  const pointBreakdown = [
    { name: 'Glow Check-ins', icon: '✓', points: 10, percentage: 67, color: '#10b981' },
    { name: 'shout_out', icon: '⭐', points: 5, percentage: 33, color: '#ec4899' },
  ];

  const earnedBadges = BADGES.filter(b => b.earned).length;
  const totalBadges = BADGES.length;

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

            <div className="text-center mb-6">
              <p className="text-6xl font-bold text-white mb-2">{totalPoints}</p>
              <p className="text-sm text-gray-300">Total Glow Points</p>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-300">{currentStage.name}</span>
                <span className="text-xs font-semibold" style={{ color: currentStage.color }}>{nextStage ? nextStage.name : currentStage.name}</span>
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

        {/* Your Glow Stage */}
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

        {/* Points Breakdown */}
        <div className="mb-8">
          <p className="text-xs font-bold tracking-widest text-gray-500 mb-4">POINTS BREAKDOWN</p>
          <div className="space-y-3">
            {pointBreakdown.map((item, idx) => (
              <div key={idx} className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-semibold text-white">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-300">{item.points} pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                  </div>
                  <span className="text-xs text-gray-400">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Glow Up Badges */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold tracking-widest text-gray-500">GLOW UP BADGES</p>
              <p className="text-xs text-gray-400 mt-1">{earnedBadges}/{totalBadges}</p>
            </div>
            <button className="text-xs text-gray-400 hover:text-gray-300">All →</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {BADGES.map(badge => (
              <div key={badge.id} className="rounded-2xl p-4" style={{ background: badge.earned ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${badge.earned ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-3xl">{badge.emoji}</span>
                  {badge.earned && <span className="text-xs font-bold text-green-400">✓ EARNED</span>}
                </div>
                <p className="font-semibold text-white text-sm mb-1">{badge.name}</p>
                <p className="text-xs text-gray-400 mb-2">{badge.desc}</p>
                <p className="text-xs text-gray-500">{badge.tier}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Secret Badges */}
        <div className="mb-8">
          <button className="w-full flex items-center justify-between p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-3 text-left flex-1">
              <Lock size={20} className="text-amber-500" />
              <div>
                <p className="text-sm font-bold text-amber-500">Secret Badges</p>
                <p className="text-xs text-gray-400">(0/4 discovered)</p>
              </div>
            </div>
            <ChevronDown size={16} className="text-gray-500" />
          </button>
        </div>

        {/* All Tiers */}
        <div className="mb-8">
          <button 
            onClick={() => setExpandedTier(expandedTier === 'all' ? null : 'all')}
            className="w-full flex items-center justify-between p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-sm font-bold text-white">All Tiers</span>
            <ChevronDown size={16} className="text-gray-500" style={{ transform: expandedTier === 'all' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>
        </div>

        {/* How to Earn Glow Points */}
        <div className="mb-8">
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

        {/* Seasonal Events */}
        <div className="mb-8">
          <p className="text-xs font-bold tracking-widest text-gray-500 mb-4">✨ SEASONAL EVENTS — COMING SOON</p>
          <div className="grid grid-cols-2 gap-3">
            {SEASONAL_EVENTS.map(event => (
              <div key={event.id} className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-3xl mb-2">{event.emoji}</p>
                <p className="font-semibold text-white text-sm mb-1">{event.name}</p>
                <p className="text-xs text-gray-400">{event.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-4">
          <p className="text-xs font-bold tracking-widest text-gray-500 mb-4">RECENT ACTIVITY</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('checkin')}
              className={`flex-1 py-3 px-4 rounded-full font-semibold transition ${activeTab === 'checkin' ? 'text-white' : 'text-gray-400 bg-white/5'}`}
              style={activeTab === 'checkin' ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' } : {}}
            >
              Daily Check-In
            </button>
            <button 
              onClick={() => setActiveTab('challenges')}
              className={`flex-1 py-3 px-4 rounded-full font-semibold transition ${activeTab === 'challenges' ? 'text-white' : 'text-gray-400 bg-white/5'}`}
              style={activeTab === 'challenges' ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' } : {}}
            >
              Challenges
            </button>
          </div>
        </div>
      </div>

      <BottomNav active="me" />
    </div>
  );
}