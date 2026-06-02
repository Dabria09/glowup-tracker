import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ChevronDown, Flame, Zap, Sparkles, Lock } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const STAGES = [
  { id: 'seedling', name: 'Seedling', emoji: '🌱', minPoints: 0, maxPoints: 100, color: '#10b981', description: "You've started your journey. Every glow girl begins somewhere." },
  { id: 'growing', name: 'Growing', emoji: '🌿', minPoints: 100, maxPoints: 250, color: '#14b8a6', description: "You're building momentum. Keep showing up for yourself!" },
  { id: 'glowing', name: 'Glowing', emoji: '✨', minPoints: 250, maxPoints: 500, color: '#f59e0b', description: "You're shining bright! Your dedication is paying off." },
  { id: 'blooming', name: 'Blooming', emoji: '🌸', minPoints: 500, maxPoints: 750, color: '#ec4899', description: "You're in full bloom! This is your season." },
  { id: 'leveling_up', name: 'Leveling Up', emoji: '💎', minPoints: 750, maxPoints: 1000, color: '#a855f7', description: "You're reaching new heights. The crown awaits!" },
  { id: 'glow_queen', name: 'Glow Queen', emoji: '👑', minPoints: 1000, maxPoints: Infinity, color: '#fbbf24', description: "You ARE the glow! You're inspiring others." },
];

const MILESTONE_BADGES = [
  { id: 'first_glow',  name: 'First Glow',   emoji: '🌱', pts: 25,   tier: 'STARTER',   desc: 'You lit your first spark. The journey begins!', color: '#10b981' },
  { id: 'seedling',    name: 'Seedling',      emoji: '🌿', pts: 100,  tier: 'COMMON',    desc: 'Growing strong — 100 points earned!', color: '#14b8a6' },
  { id: 'glowing',     name: 'Glowing',       emoji: '✨', pts: 250,  tier: 'UNCOMMON',  desc: "You're starting to radiate. Keep shining!", color: '#f59e0b' },
  { id: 'blooming',    name: 'Blooming',      emoji: '🌸', pts: 500,  tier: 'RARE',      desc: 'In full bloom — 500 points and counting!', color: '#ec4899' },
  { id: 'level_up',   name: 'Level Up',       emoji: '💎', pts: 750,  tier: 'EPIC',      desc: 'Diamond-level dedication. Respect!', color: '#a855f7' },
  { id: 'glow_queen', name: 'Glow Queen',     emoji: '👑', pts: 1000, tier: 'LEGENDARY', desc: 'A thousand points of pure glow energy!', color: '#fbbf24' },
  { id: 'fire_girl',  name: 'Fire Girl',      emoji: '🔥', pts: 2000, tier: 'LEGENDARY', desc: 'Unstoppable. 2,000 points of pure grit.', color: '#ef4444' },
  { id: 'glow_icon',  name: 'Glow Icon',      emoji: '🌟', pts: 5000, tier: 'MYTHIC',    desc: 'You are the standard. 5,000 points achieved.', color: '#fdcd2d' },
];

const SEASONAL_EVENTS = [
  { id: 'summer', name: 'Summer Glow Up', emoji: '🌸', desc: 'Limited badges & rewards' },
  { id: 'winter', name: 'Winter Reset', emoji: '❄️', desc: 'New year, new you' },
  { id: 'back_to_school', name: 'Back-to-School', emoji: '📚', desc: 'Academic glow season' },
  { id: 'self_love', name: 'Self-Love Feb', emoji: '💖', desc: '28 days of self-care' },
];

export default function GlowScore() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [dayStreak, setDayStreak] = useState(0);
  const [activities, setActivities] = useState(0);
  const [expandedTier, setExpandedTier] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const [pts, hist] = await Promise.all([
        base44.entities.UserPoints.filter({ user_email: u.email }),
        base44.entities.PointsHistory.filter({ user_email: u.email }, '-created_date', 200),
      ]);
      const total = pts.length > 0 ? pts[0].total_points || 0 : 0;
      setTotalPoints(total);
      setActivities(hist.length);

      const daySet = new Set(hist.map(e => new Date(e.created_date).toISOString().split('T')[0]));
      let streak = 0;
      let cursor = new Date();
      cursor.setHours(0, 0, 0, 0);
      const todayStr = cursor.toISOString().split('T')[0];
      if (!daySet.has(todayStr)) cursor.setDate(cursor.getDate() - 1);
      while (true) {
        const ds = cursor.toISOString().split('T')[0];
        if (daySet.has(ds)) { streak++; cursor.setDate(cursor.getDate() - 1); }
        else break;
      }
      setDayStreak(streak);
    }).catch(() => setUser(null));
  }, []);

  const currentStage = STAGES.find(s => totalPoints >= s.minPoints && totalPoints < s.maxPoints) || STAGES[0];
  const nextStage = STAGES[STAGES.indexOf(currentStage) + 1];
  const pointsInStage = totalPoints - currentStage.minPoints;
  const pointsNeededForStage = currentStage.maxPoints === Infinity ? 1 : currentStage.maxPoints - currentStage.minPoints;
  const stageProgress = Math.min(100, (pointsInStage / pointsNeededForStage) * 100);
  const pointsUntilNext = nextStage ? nextStage.minPoints - totalPoints : 0;
  const stageIndex = STAGES.indexOf(currentStage);

  const pointBreakdown = [
    { name: 'Glow Check-ins', icon: '✓', points: 10, percentage: 67, color: '#10b981' },
    { name: 'Shout Outs', icon: '⭐', points: 5, percentage: 33, color: '#ec4899' },
  ];

  const unlockedBadges = MILESTONE_BADGES.filter(b => totalPoints >= b.pts).length;

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
            <div className="flex justify-center mb-2"><Flame size={24} className="text-orange-500" /></div>
            <p className="text-2xl font-bold text-white mb-1">{dayStreak}</p>
            <p className="text-xs text-gray-400">Day Streak</p>
          </div>
          <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex justify-center mb-2"><Zap size={24} className="text-yellow-500" /></div>
            <p className="text-2xl font-bold text-white mb-1">{stageIndex + 1}</p>
            <p className="text-xs text-gray-400">Level</p>
          </div>
          <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex justify-center mb-2"><Sparkles size={24} className="text-pink-500" /></div>
            <p className="text-2xl font-bold text-white mb-1">{activities}</p>
            <p className="text-xs text-gray-400">Activities</p>
          </div>
        </div>

        {/* Your Glow Stage */}
        <div className="mb-8">
          <p className="text-xs font-bold tracking-widest text-gray-500 mb-4">YOUR GLOW STAGE</p>
          <div className="grid grid-cols-3 gap-2">
            {STAGES.map((stage, idx) => (
              <div key={stage.id} className="rounded-2xl p-3 text-center transition-all cursor-pointer"
                style={{ background: idx <= stageIndex ? `linear-gradient(135deg, ${stage.color}30, ${stage.color}15)` : 'rgba(255,255,255,0.05)', border: `1px solid ${idx <= stageIndex ? stage.color + '50' : 'rgba(255,255,255,0.1)'}`, opacity: idx <= stageIndex ? 1 : 0.5 }}>
                <p className="text-2xl mb-1">{stage.emoji}</p>
                <p className="text-xs font-semibold text-white">{stage.name}</p>
                {idx === stageIndex && <div className="w-1.5 h-1.5 rounded-full mx-auto mt-2" style={{ backgroundColor: stage.color }} />}
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

        {/* Milestone Badges */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-bold tracking-widest text-gray-500">MILESTONE BADGES</p>
              <p className="text-xs text-gray-400 mt-1">{unlockedBadges}/{MILESTONE_BADGES.length} unlocked</p>
            </div>
          </div>

          {/* Next badge progress */}
          {(() => {
            const next = MILESTONE_BADGES.find(b => totalPoints < b.pts);
            if (!next) return (
              <div className="rounded-2xl p-3 mb-4 text-center text-sm font-bold" style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
                🎉 All milestone badges unlocked! You are legendary.
              </div>
            );
            const prev = MILESTONE_BADGES[MILESTONE_BADGES.indexOf(next) - 1];
            const from = prev ? prev.pts : 0;
            const pct = Math.round(((totalPoints - from) / (next.pts - from)) * 100);
            return (
              <div className="rounded-2xl p-4 mb-4" style={{ background: `${next.color}15`, border: `1px solid ${next.color}40` }}>
                <div className="flex items-center gap-3 mb-3">
                  <span style={{ fontSize: 28, filter: 'grayscale(0.4)' }}>{next.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">Next: {next.name}</p>
                    <p className="text-xs text-gray-400">{next.pts - totalPoints} pts away · {next.pts} pts needed</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: `${next.color}22`, border: `1px solid ${next.color}55`, color: next.color }}>{next.tier}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(2, pct)}%`, background: `linear-gradient(90deg,${next.color},${next.color}99)` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">{pct}% there</p>
              </div>
            );
          })()}

          <div className="grid grid-cols-2 gap-3">
            {MILESTONE_BADGES.map(badge => {
              const earned = totalPoints >= badge.pts;
              return (
                <div key={badge.id} className="rounded-2xl p-4 relative overflow-hidden"
                  style={{ background: earned ? `linear-gradient(135deg,${badge.color}20,${badge.color}08)` : 'rgba(255,255,255,0.04)', border: `1px solid ${earned ? badge.color + '50' : 'rgba(255,255,255,0.08)'}`, opacity: earned ? 1 : 0.55 }}>
                  {earned && (
                    <div className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${badge.color}25`, color: badge.color }}>✓</div>
                  )}
                  <span style={{ fontSize: 28, display: 'block', marginBottom: 8, filter: earned ? 'none' : 'grayscale(1)' }}>{badge.emoji}</span>
                  <p className="font-bold text-white text-sm mb-1" style={{ fontFamily: '"Sora","Poppins",sans-serif' }}>{badge.name}</p>
                  <p className="text-xs mb-2" style={{ color: earned ? '#c4949e' : '#5a4050', lineHeight: 1.5 }}>{badge.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: earned ? `${badge.color}20` : 'rgba(255,255,255,0.06)', border: `1px solid ${earned ? badge.color + '40' : 'rgba(255,255,255,0.1)'}`, color: earned ? badge.color : '#5a4050' }}>{badge.tier}</span>
                    <span className="text-[10px] font-bold" style={{ color: earned ? badge.color : '#5a4050' }}>🏅 {badge.pts.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
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
          <button onClick={() => setExpandedTier(expandedTier === 'all' ? null : 'all')}
            className="w-full flex items-center justify-between p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-sm font-bold text-white">All Tiers</span>
            <ChevronDown size={16} className="text-gray-500" style={{ transform: expandedTier === 'all' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>
        </div>

        {/* How to Earn Glow Points */}
        <div className="mb-8">
          <p className="text-xs font-bold tracking-widest text-gray-500 mb-4">HOW TO EARN GLOW POINTS</p>
          <div className="grid grid-cols-2 gap-3">
            {[['✨','Daily Check-In','+10 pts'],['🔥','Challenge Day','+30 pts'],['📚','Complete a Lesson','+30 pts'],['📔','Diary Entry','+15 pts'],['💪','Fitness Log','+20 pts'],['📣','Shout Out','+10 pts']].map(([icon,label,pts]) => (
              <div key={label} className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-sm font-semibold text-white mb-1">{icon} {label}</p>
                <p className="text-xs text-gray-400">{pts}</p>
              </div>
            ))}
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

        {/* Glow Store CTA */}
        <div className="mb-6 rounded-3xl p-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,rgba(241,182,16,0.12),rgba(232,82,109,0.08))', border: '1px solid rgba(241,182,16,0.3)' }}>
          <div>
            <p className="text-xs font-bold tracking-widest mb-1" style={{ color: '#fdcd2d' }}>GLOW STORE™</p>
            <p className="text-sm font-bold text-white">Spend your points!</p>
            <p className="text-xs text-gray-400">Unlock frames, titles, badges &amp; themes</p>
          </div>
          <button onClick={() => navigate('/glow-store')}
            className="flex-shrink-0 flex items-center gap-1.5 font-bold px-4 py-2.5 rounded-full transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#f1b610,#ffe75c)', color: '#1a0a00', fontSize: 13, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(241,182,16,0.4)' }}>
            🛍️ Shop
          </button>
        </div>

        {/* Recent Activity */}
        <div className="mb-4">
          <p className="text-xs font-bold tracking-widest text-gray-500 mb-4">RECENT ACTIVITY</p>
          <div className="flex gap-2">
            <button onClick={() => navigate('/daily-checkin')}
              className="flex-1 py-3 px-4 rounded-full font-semibold transition text-white"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
              Daily Check-In
            </button>
            <button onClick={() => navigate('/daily-challenges')}
              className="flex-1 py-3 px-4 rounded-full font-semibold transition text-gray-400 bg-white/5">
              Challenges
            </button>
          </div>
        </div>
      </div>

      <BottomNav active="glow" />
    </div>
  );
}