import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';
import DailyPollSection from '@/components/glow/DailyPollSection';

const BG = '#0d0608';
const PINK = '#e8526d';
const PINK_HOT = '#ff6a75';
const PINK_DEEP = '#c44a55';
const GOLD = '#f1b610';
const GOLD_LT = '#fdcd2d';
const WHITE = '#fff8f0';
const MUTED = '#c4949e';
const MUTED2 = '#8a6070';
const CARD = '#1e0d12';
const BORDER = 'rgba(232,82,109,0.2)';
const GOLD_BORDER = 'rgba(241,182,16,0.25)';

const ALL_CHALLENGES = [
  { id: 'confidence', name: 'Confidence Boost', emoji: '✨', desc: 'Build unshakeable self-belief in 30 days', days: 30, color: PINK },
  { id: 'wellness', name: 'Glow Wellness', emoji: '🌸', desc: 'Mind, body & spirit habits that last', days: 30, color: '#a855f7' },
  { id: 'money', name: 'Money Moves', emoji: '💰', desc: 'Master your finances and future', days: 30, color: GOLD },
  { id: 'academic', name: 'Academic Glow', emoji: '📚', desc: 'Crush your studies and career goals', days: 30, color: '#3b82f6' },
  { id: 'faith', name: 'Spiritual Glow', emoji: '🙏', desc: 'Connect with your inner light and purpose', days: 30, color: '#10b981' },
  { id: 'leadership', name: 'Leadership Era', emoji: '👑', desc: 'Step into your power and lead', days: 30, color: '#f59e0b' },
];

const BADGES = [
  { id: 'first_checkin', emoji: '⭐', label: 'First Check-In', pts: 10 },
  { id: 'streak_7', emoji: '🔥', label: '7-Day Streak', pts: 50 },
  { id: 'streak_30', emoji: '💎', label: '30-Day Streak', pts: 200 },
  { id: 'challenge_1', emoji: '🏆', label: 'First Challenge', pts: 100 },
  { id: 'challenge_3', emoji: '👑', label: 'Triple Crown', pts: 300 },
  { id: 'all_challenges', emoji: '✨', label: 'Glow Crown', pts: 1000 },
];

const AFFIRMATIONS = [
  "You are becoming everything you were created to be. 💜",
  "Your consistency is building the version of you that the world needs. ✨",
  "Every small action today is shaping your incredible tomorrow. 🌸",
  "You showed up for yourself today — that is everything. 👑",
  "Your glow is not a destination. It is who you are becoming. ✦",
  "Progress over perfection. You are doing amazing. 🔥",
  "The girl you are becoming will thank you for today. 💫",
];

const ENCOURAGEMENTS = [
  { from: "GGU Team", msg: "Today is a fresh page in your glow story. Write something beautiful. 💜", emoji: "💌" },
  { from: "GGU Team", msg: "Every girl who started where you are now became who she always knew she could be. Keep going. ✨", emoji: "🌟" },
  { from: "GGU Team", msg: "You don't have to be perfect to be powerful. Show up as you are — that's enough. 🔥", emoji: "👑" },
  { from: "GGU Team", msg: "Your journey is yours alone. Don't compare your chapter 1 to someone else's chapter 10. 💫", emoji: "🌸" },
  { from: "GGU Team", msg: "Soft girl era or boss era — either way, you are doing the work and it shows. 💎", emoji: "💎" },
  { from: "GGU Team", msg: "The world needs what only you can bring. Step into today with confidence. 🌍", emoji: "🌍" },
  { from: "GGU Team", msg: "Rest is not quitting. Breaks are part of the process. Take care of yourself. 🌙", emoji: "🌙" },
];

const MOODS = [
  { emoji: '✨', label: 'Glowing', color: '#f4c542' },
  { emoji: '😊', label: 'Good', color: '#a8d8a8' },
  { emoji: '😐', label: 'Okay', color: '#9b9b9b' },
  { emoji: '😔', label: 'Struggling', color: '#e07b54' },
  { emoji: '💪', label: 'Motivated', color: '#e8a0bf' },
];

// Glow level system
const GLOW_LEVELS = [
  { level: 1, name: 'Glow Seedling', emoji: '🌱', min: 0, max: 100 },
  { level: 2, name: 'Glow Bud', emoji: '🌷', min: 100, max: 250 },
  { level: 3, name: 'Glow Bloom', emoji: '🌸', min: 250, max: 500 },
  { level: 4, name: 'Glow Star', emoji: '⭐', min: 500, max: 800 },
  { level: 5, name: 'Glow Queen', emoji: '👑', min: 800, max: 1200 },
  { level: 6, name: 'Glow Legend', emoji: '✨', min: 1200, max: 2000 },
  { level: 7, name: 'Glow Crown', emoji: '💎', min: 2000, max: Infinity },
];

const NEXT_REWARDS = [
  { pts: 100, name: 'Pink Bloom Badge', emoji: '🌸', type: 'badge' },
  { pts: 250, name: 'Golden Glow Frame', emoji: '🖼️', type: 'frame' },
  { pts: 500, name: 'Star Queen Theme', emoji: '⭐', type: 'theme' },
  { pts: 800, name: 'Diamond Profile Banner', emoji: '💎', type: 'banner' },
  { pts: 1200, name: 'Crown Avatar Ring', emoji: '👑', type: 'avatar' },
  { pts: 2000, name: 'Glow Legend Background', emoji: '✨', type: 'background' },
];

function getGlowLevel(pts) {
  return GLOW_LEVELS.find(l => pts >= l.min && pts < l.max) || GLOW_LEVELS[GLOW_LEVELS.length - 1];
}

function getNextReward(pts) {
  return NEXT_REWARDS.find(r => pts < r.pts) || null;
}

function ProgressBar({ value, max, color = PINK, height = 6 }) {
  const pct = Math.min(100, max > 0 ? Math.round((value / max) * 100) : 0);
  return (
    <div style={{ height, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, borderRadius: 99, transition: 'width 0.6s ease' }} />
    </div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 16, background: 'rgba(0,0,0,0.35)', border: `1px solid ${BORDER}` }}>
      <p style={{ fontSize: 20, margin: '0 0 2px' }}>{icon}</p>
      <p style={{ fontWeight: 800, fontSize: 20, color: WHITE, margin: '0 0 1px' }}>{value}</p>
      <p style={{ fontSize: 10, color: MUTED2, margin: 0 }}>{label}</p>
    </div>
  );
}

export default function Glow() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dailyQuote, setDailyQuote] = useState(null);
  const [msGlowMsg, setMsGlowMsg] = useState(null);
  const [userPoints, setUserPoints] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [mySquads, setMySquads] = useState([]);
  const [glowLevels, setGlowLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState(null);
  const [moodSaved, setMoodSaved] = useState(false);
  const [goalsChecked, setGoalsChecked] = useState({});
  const [savedQuote, setSavedQuote] = useState(null);

  const userEmailRef = useRef(null);
  const todayAffirmation = AFFIRMATIONS[new Date().getDay() % AFFIRMATIONS.length];
  const todayEncouragement = ENCOURAGEMENTS[new Date().getDate() % ENCOURAGEMENTS.length];

  // Keep ref in sync so event listeners always have the latest email
  useEffect(() => { userEmailRef.current = user?.email || null; }, [user?.email]);

  // Re-fetch points on visibility change, pageshow (bfcache), or check-in complete event
  useEffect(() => {
    const refresh = async () => {
      const email = userEmailRef.current;
      if (!email) return;
      const pts = await base44.entities.UserPoints.filter({ user_email: email });
      if (pts.length) setUserPoints(pts[0]);
    };
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    const onPageShow = (e) => { if (e.persisted) refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('ggu_checkin_complete', refresh);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('ggu_checkin_complete', refresh);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [pts, ch, certs, quotes, msgs, squadMem, savedQ, lvls, recentPts] = await Promise.all([
          base44.entities.UserPoints.filter({ user_email: u.email }),
          base44.entities.GlowUpChallenge.filter({ user_email: u.email }),
          base44.entities.GlowUpCertificate.filter({ user_email: u.email }),
          base44.entities.AdminQuote.filter({ is_active: true }),
          base44.entities.MsGlowMessage.filter({ is_active: true }),
          base44.entities.SquadMember.filter({ user_email: u.email }),
          base44.entities.SavedQuote.filter({ user_email: u.email }, '-created_date', 1),
          base44.entities.GlowLevel.filter({ is_active: true }).catch(() => []),
          base44.entities.PointsHistory.filter({ user_email: u.email }, '-created_date', 15).catch(() => []),
        ]);
        if (pts.length) setUserPoints(pts[0]);
        setChallenges(ch);
        setCertificates(certs);
        if (quotes.length) {
          const idx = new Date().getDate() % quotes.length;
          setDailyQuote(quotes[idx]);
        }
        if (msgs.length) {
          const idx = new Date().getDate() % msgs.length;
          setMsGlowMsg(msgs[idx]);
        }
        setMySquads(squadMem);
        setGlowLevels(lvls);
        if (savedQ.length) setSavedQuote(savedQ[0]);

        // Sync check-in: use the same localStorage key as Dashboard (set by DailyCheckIn page)
        const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const lsCheckinKey = `ggu_checkin_${u.email}_date`;
        const checkedInToday = localStorage.getItem(lsCheckinKey) === todayStr;
        if (checkedInToday) {
          const todayDisplay = new Date().toDateString();
          const goalsKey2 = `ggu_goals_${u.email}_${todayDisplay}`;
          const existing = JSON.parse(localStorage.getItem(goalsKey2) || '{}');
          if (!existing.checkin) {
            existing.checkin = true;
            localStorage.setItem(goalsKey2, JSON.stringify(existing));
            setGoalsChecked(prev => ({ ...prev, checkin: true }));
          }
        }

        // Check saved mood for today
        const todayKey = `ggu_mood_${u.email}_${new Date().toDateString()}`;
        const savedMood = localStorage.getItem(todayKey);
        if (savedMood !== null) { setMood(parseInt(savedMood)); setMoodSaved(true); }

        // Load checked goals
        const goalsKey = `ggu_goals_${u.email}_${new Date().toDateString()}`;
        const savedGoals = localStorage.getItem(goalsKey);
        if (savedGoals) setGoalsChecked(JSON.parse(savedGoals));
      } catch {
        base44.auth.redirectToLogin();
      }
      setLoading(false);
    };
    load();
  }, []);

  const getChallengeRecord = (id) => challenges.find(c => c.challenge_id === id);
  const completedChallenges = challenges.filter(c => c.status === 'completed').length;
  const activeChallenge = challenges.find(c => c.status === 'in_progress');
  const activeChallengeInfo = activeChallenge ? ALL_CHALLENGES.find(c => c.id === activeChallenge.challenge_id) : null;
  const activeDays = activeChallenge ? JSON.parse(activeChallenge.completed_days || '[]').length : 0;
  const totalPoints = userPoints?.total_points || 0;
  const streak = userPoints?.check_in_streak || 0;
  const longestStreak = userPoints?.best_streak || streak;
  const totalDays = userPoints ? Math.max(1, Math.floor((Date.now() - new Date(userPoints.created_date || Date.now())) / 86400000)) : 0;
  const badgesEarned = Math.floor(totalPoints / 100);
  const crownPct = Math.min(100, (completedChallenges / 6) * 100);
  // Use DB levels if available, else fall back to defaults
  const activeLevels = glowLevels.length > 0 ? [...glowLevels].sort((a, b) => a.min_points - b.min_points) : null;
  const rawGlowLevel = activeLevels
    ? (activeLevels.slice().reverse().find(l => totalPoints >= (l.min_points || 0)) || activeLevels[0])
    : GLOW_LEVELS.find(l => totalPoints >= l.min && totalPoints < l.max) || GLOW_LEVELS[GLOW_LEVELS.length - 1];
  const glowLevel = activeLevels
    ? { level: rawGlowLevel.level_number, name: rawGlowLevel.name, emoji: rawGlowLevel.emoji, min: rawGlowLevel.min_points, max: rawGlowLevel.max_points || 99999 }
    : rawGlowLevel;
  const nextLevelEntry = activeLevels ? activeLevels.find(l => (l.min_points || 0) > totalPoints) : null;
  const nextReward = activeLevels && nextLevelEntry && nextLevelEntry.unlock_reward
    ? { pts: nextLevelEntry.min_points, name: nextLevelEntry.unlock_reward, emoji: nextLevelEntry.unlock_emoji || '🎁', type: nextLevelEntry.unlock_type || 'badge' }
    : NEXT_REWARDS.find(r => totalPoints < r.pts) || null;
  const glowMax = glowLevel.max >= 99999 ? 99999 : glowLevel.max;
  const levelProgress = glowMax >= 99999 ? 100 : Math.round(((totalPoints - glowLevel.min) / (glowMax - glowLevel.min)) * 100);
  const ptsToNextLevel = glowMax >= 99999 ? 0 : glowMax - totalPoints;

  // Monthly stats (rough estimate)
  const monthlyCheckins = userPoints?.check_in_streak ? Math.min(streak, 30) : 0;
  const monthlyPts = Math.min(totalPoints, totalPoints > 500 ? Math.floor(totalPoints * 0.3) : totalPoints);

  // Today's goals
  const TODAYS_GOALS = [
    { id: 'checkin', label: 'Daily Check-In', route: '/daily-checkin', emoji: '✨' },
    { id: 'challenge', label: activeChallenge ? `${activeChallengeInfo?.name || 'Challenge'} · Day ${activeDays + 1}` : 'Start a Challenge', route: activeChallenge ? `/glow-up-challenges/${activeChallenge.challenge_id}` : '/glow-up-challenges', emoji: '🎯' },
    { id: 'vision', label: 'Update Vision Board', route: '/vision-board', emoji: '🌟' },
    { id: 'academy', label: 'Complete an Academy Lesson', route: '/ggu-academy', emoji: '📚' },
    { id: 'community', label: 'Post in Community', route: '/glow-feed', emoji: '💬' },
  ];

  const toggleGoal = (id, route) => {
    const newState = { ...goalsChecked, [id]: !goalsChecked[id] };
    setGoalsChecked(newState);
    const goalsKey = `ggu_goals_${user?.email}_${new Date().toDateString()}`;
    localStorage.setItem(goalsKey, JSON.stringify(newState));
    if (!goalsChecked[id]) {
      setTimeout(() => navigate(route), 200);
    }
  };

  const saveMood = (idx) => {
    setMood(idx);
    setMoodSaved(true);
    const todayKey = `ggu_mood_${user?.email}_${new Date().toDateString()}`;
    localStorage.setItem(todayKey, idx.toString());
  };

  const goalsCompleted = Object.values(goalsChecked).filter(Boolean).length;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="w-8 h-8 border-4 border-red-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: BG, color: WHITE, fontFamily: '"DM Sans","Inter",sans-serif', paddingBottom: 110, overflowX: 'hidden' }}>
      {/* Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute rounded-full" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(232,82,109,0.32), transparent 70%)', top: -200, left: -150, filter: 'blur(100px)' }} />
        <div className="absolute rounded-full" style={{ width: 380, height: 380, background: 'radial-gradient(circle, rgba(241,182,16,0.2), transparent 70%)', bottom: '25%', right: -100, filter: 'blur(100px)' }} />
      </div>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'%3E%3Cpath d='M22 34 C11 25 4 18 4 11 C4 7 7.5 3.5 12 3.5 C15.5 3.5 18.5 5.5 22 9 C25.5 5.5 28.5 3.5 32 3.5 C36.5 3.5 40 7 40 11 C40 18 33 25 22 34Z' fill='%23e8526d' opacity='0.04'/%3E%3C/svg%3E\")", backgroundSize: '44px 44px' }} />

      <div className="relative z-10 px-4">

        {/* Header */}
        <div style={{ paddingTop: 16, paddingBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: GOLD_LT, margin: '0 0 4px' }}>Your Journey</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>
              <span style={{ color: PINK_HOT }}>My</span>{' '}
              <span style={{ background: 'linear-gradient(135deg, #f1b610, #ffe75c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Glow</span>
            </h1>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>{glowLevel.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: GOLD_LT }}>{glowLevel.name}</span>
              </div>
              <p style={{ fontSize: 10, color: MUTED2, margin: 0 }}>Lv. {glowLevel.level} · {totalPoints.toLocaleString()} pts</p>
            </div>
          </div>
        </div>

        {/* Today's Encouragement - from GGU/Ms. Glow */}
        <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(232,82,109,0.1))', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 20, padding: '14px 16px', marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #a855f7, #ec4899, #f1b610)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>{todayEncouragement.emoji}</span>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: '#c084fc', margin: 0, textTransform: 'uppercase' }}>Today's Encouragement · {msGlowMsg ? 'Ms. Glow' : todayEncouragement.from}</p>
          </div>
          <p style={{ fontSize: 14, color: WHITE, margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
            "{msGlowMsg ? msGlowMsg.content : todayEncouragement.msg}"
          </p>
        </div>

        {/* Daily Affirmation */}
        <div style={{ background: 'linear-gradient(135deg, rgba(232,82,109,0.12), rgba(241,182,16,0.08))', border: `1px solid ${BORDER}`, borderRadius: 18, padding: '14px 16px', marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${PINK_DEEP}, ${PINK_HOT}, ${GOLD})` }} />
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', color: GOLD_LT, margin: '0 0 6px', textTransform: 'uppercase' }}>Today's Affirmation</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: WHITE, margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>"{todayAffirmation}"</p>
        </div>

        {/* Daily Poll */}
        <DailyPollSection
          userEmail={user?.email}
          onPointsAwarded={(n) => setUserPoints(prev => prev ? { ...prev, total_points: (prev.total_points || 0) + n } : prev)}
        />

        {/* Mood Check-In */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '14px 16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: WHITE, margin: 0 }}>💖 How are you feeling today?</p>
            {moodSaved && <span style={{ fontSize: 10, color: '#6abf6a', fontWeight: 700 }}>✓ Logged</span>}
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
            {MOODS.map((m, i) => (
              <button key={i} onClick={() => saveMood(i)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 4px', borderRadius: 12, border: `2px solid ${mood === i ? m.color : 'rgba(255,255,255,0.08)'}`, background: mood === i ? `${m.color}18` : 'rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'all 0.2s' }}>
                <span style={{ fontSize: 20 }}>{m.emoji}</span>
                <span style={{ fontSize: 9, color: mood === i ? m.color : MUTED2, fontWeight: 600 }}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Glow Goals */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: WHITE, margin: 0 }}>🎯 Today's Glow Goals</p>
            <span style={{ fontSize: 11, color: MUTED2 }}>{goalsCompleted}/{TODAYS_GOALS.length} done</span>
          </div>
          {/* Progress mini bar */}
          <div style={{ marginBottom: 12 }}>
            <ProgressBar value={goalsCompleted} max={TODAYS_GOALS.length} color={PINK} height={5} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {TODAYS_GOALS.map(goal => {
              const done = goalsChecked[goal.id];
              return (
                <button key={goal.id} onClick={() => toggleGoal(goal.id, goal.route)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: done ? 'rgba(106,191,106,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${done ? 'rgba(106,191,106,0.3)' : 'rgba(255,255,255,0.06)'}`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{done ? '✅' : '☐'}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: done ? '#6abf6a' : WHITE, flex: 1, textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.7 : 1 }}>{goal.emoji} {goal.label}</span>
                  {!done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MUTED2} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>}
                </button>
              );
            })}
          </div>
          {goalsCompleted === TODAYS_GOALS.length && (
            <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 10, background: 'rgba(106,191,106,0.1)', border: '1px solid rgba(106,191,106,0.3)', textAlign: 'center' }}>
              <span style={{ fontSize: 13, color: '#6abf6a', fontWeight: 700 }}>🎉 All goals complete! You're glowing today!</span>
            </div>
          )}
        </div>

        {/* Active Challenge Banner */}
        {activeChallenge && activeChallengeInfo ? (
          <div style={{ background: `linear-gradient(135deg, ${activeChallengeInfo.color}18, ${activeChallengeInfo.color}08)`, border: `1px solid ${activeChallengeInfo.color}40`, borderRadius: 20, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', color: MUTED2, textTransform: 'uppercase', margin: '0 0 3px' }}>Active Challenge</p>
                <p style={{ fontSize: 17, fontWeight: 800, color: WHITE, margin: 0 }}>{activeChallengeInfo.emoji} {activeChallengeInfo.name}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: activeChallengeInfo.color, margin: 0 }}>{activeDays}</p>
                <p style={{ fontSize: 10, color: MUTED2, margin: 0 }}>of 30 days</p>
              </div>
            </div>
            <ProgressBar value={activeDays} max={30} color={activeChallengeInfo.color} height={8} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: MUTED2 }}>{Math.round((activeDays / 30) * 100)}% complete</span>
              <span style={{ fontSize: 11, color: MUTED2 }}>{30 - activeDays} days left</span>
            </div>
            <button onClick={() => navigate(`/glow-up-challenges/${activeChallenge.challenge_id}`)} style={{ marginTop: 12, width: '100%', padding: '10px', borderRadius: 12, background: `linear-gradient(135deg, ${PINK_DEEP}, ${PINK_HOT})`, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', boxShadow: `0 4px 16px rgba(232,82,109,0.35)` }}>
              📅 Continue Challenge →
            </button>
          </div>
        ) : (
          <button onClick={() => navigate('/glow-up-challenges')} style={{ width: '100%', background: `linear-gradient(135deg, rgba(232,82,109,0.15), rgba(232,82,109,0.08))`, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '18px 16px', marginBottom: 12, cursor: 'pointer', textAlign: 'center' }}>
            <p style={{ fontSize: 24, margin: '0 0 6px' }}>✨</p>
            <p style={{ fontWeight: 800, fontSize: 15, color: WHITE, margin: '0 0 3px' }}>Start Your First Challenge</p>
            <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>30-day journeys to unlock your best self</p>
          </button>
        )}

        {/* YOUR GLOW JOURNEY — Level + Next Reward */}
        <div style={{ background: 'linear-gradient(135deg, rgba(241,182,16,0.12), rgba(232,82,109,0.08))', border: `1px solid ${GOLD_BORDER}`, borderRadius: 20, padding: '18px 16px', marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${GOLD}, ${PINK_HOT})` }} />
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: GOLD_LT, margin: '0 0 12px' }}>🌟 Your Glow Journey</p>

          {/* Level display */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 28 }}>{glowLevel.emoji}</span>
              <div>
                <p style={{ fontWeight: 800, fontSize: 16, color: WHITE, margin: 0 }}>Level {glowLevel.level} · {glowLevel.name}</p>
                <p style={{ fontSize: 11, color: MUTED2, margin: 0 }}>{totalPoints.toLocaleString()} points total</p>
              </div>
            </div>
            {glowMax < 99999 && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 900, fontSize: 20, color: GOLD_LT, margin: 0 }}>{levelProgress}%</p>
                <p style={{ fontSize: 10, color: MUTED2, margin: 0 }}>to next level</p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {glowMax < 99999 && (
            <>
              <ProgressBar value={totalPoints - glowLevel.min} max={glowLevel.max - glowLevel.min} color={GOLD} height={8} />
              <p style={{ fontSize: 11, color: MUTED2, margin: '6px 0 12px' }}>
                {totalPoints - glowLevel.min} / {glowLevel.max - glowLevel.min} pts · <span style={{ color: GOLD_LT }}>{ptsToNextLevel} pts to Level {glowLevel.level + 1}</span>
              </p>
            </>
          )}

          {/* Next Reward */}
          {nextReward && (
            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(241,182,16,0.15)', border: `1px solid ${GOLD_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {nextReward.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: GOLD_LT, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px' }}>Next Unlock</p>
                <p style={{ fontWeight: 700, fontSize: 14, color: WHITE, margin: '0 0 1px' }}>{nextReward.name}</p>
                <p style={{ fontSize: 11, color: MUTED2, margin: 0 }}>{(nextReward.pts - totalPoints).toLocaleString()} more points needed</p>
              </div>
            </div>
          )}

          {/* Streak */}
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: 10, background: 'rgba(232,82,109,0.1)', border: `1px solid ${BORDER}` }}>
              <p style={{ fontWeight: 900, fontSize: 18, color: PINK_HOT, margin: 0 }}>🔥 {streak}</p>
              <p style={{ fontSize: 10, color: MUTED2, margin: 0 }}>Current Streak</p>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: 10, background: 'rgba(241,182,16,0.1)', border: `1px solid ${GOLD_BORDER}` }}>
              <p style={{ fontWeight: 900, fontSize: 18, color: GOLD_LT, margin: 0 }}>⭐ {longestStreak}</p>
              <p style={{ fontSize: 10, color: MUTED2, margin: 0 }}>Best Streak</p>
            </div>
          </div>
        </div>

        {/* Glow Crown + Quick Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {/* Glow Crown */}
          <div style={{ background: CARD, border: `1px solid ${GOLD_BORDER}`, borderRadius: 18, padding: '14px 12px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: GOLD_LT, textTransform: 'uppercase', margin: '0 0 6px' }}>Glow Crown</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: GOLD_LT, margin: '0 0 4px' }}>{completedChallenges}<span style={{ fontSize: 13, color: MUTED2 }}>/6</span></p>
            <ProgressBar value={completedChallenges} max={6} color={GOLD} height={6} />
            <p style={{ fontSize: 10, color: MUTED2, margin: '5px 0 0' }}>
              {completedChallenges === 6 ? '👑 Crown Earned!' : `${6 - completedChallenges} challenges to crown`}
            </p>
          </div>
          {/* Points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '10px 12px', flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>🔥</span>
              <div>
                <p style={{ fontWeight: 800, fontSize: 18, color: PINK_HOT, margin: 0 }}>{streak}</p>
                <p style={{ fontSize: 10, color: MUTED2, margin: 0 }}>day streak</p>
              </div>
            </div>
            <div style={{ background: CARD, border: `1px solid ${GOLD_BORDER}`, borderRadius: 14, padding: '10px 12px', flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>🏅</span>
              <div>
                <p style={{ fontWeight: 800, fontSize: 18, color: GOLD_LT, margin: 0 }}>{totalPoints.toLocaleString()}</p>
                <p style={{ fontSize: 10, color: MUTED2, margin: 0 }}>total points</p>
              </div>
            </div>
          </div>
        </div>

        {/* This Month Summary */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: WHITE, margin: 0 }}>📊 This Month</p>
            <button onClick={() => navigate('/monthly-summary')} style={{ fontSize: 11, color: PINK, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Full Summary →</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { icon: '✅', val: monthlyCheckins, lab: 'Check-Ins' },
              { icon: '🏆', val: completedChallenges, lab: 'Challenges Done' },
              { icon: '🏅', val: monthlyPts.toLocaleString(), lab: 'Points Earned' },
              { icon: '⭐', val: badgesEarned, lab: 'Badges Unlocked' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '10px 8px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.06)` }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <p style={{ fontWeight: 800, fontSize: 18, color: WHITE, margin: '2px 0 0' }}>{item.val}</p>
                <p style={{ fontSize: 10, color: MUTED2, margin: 0 }}>{item.lab}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUTED2, marginBottom: 10 }}>Quick Actions</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { icon: '✨', label: "Today's Task", sub: 'Daily check-in', route: '/daily-checkin', accent: PINK },
              { icon: '📅', label: 'All Challenges', sub: 'View 30-day plans', route: '/glow-up-challenges', accent: '#a855f7' },
              { icon: '🏆', label: 'Certificates', sub: `${certificates.length} earned`, route: '/my-certificates', accent: GOLD },
            ].map(item => (
              <button key={item.label} onClick={() => navigate(item.route)} style={{ background: `${item.accent}12`, border: `1px solid ${item.accent}35`, borderRadius: 16, padding: '14px 8px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <p style={{ fontWeight: 700, fontSize: 12, color: WHITE, margin: 0, lineHeight: 1.2 }}>{item.label}</p>
                <p style={{ fontSize: 10, color: MUTED2, margin: 0 }}>{item.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Where You Left Off */}
        {activeChallenge && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>📍</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: WHITE, margin: 0 }}>Where you left off</p>
              <p style={{ fontSize: 12, color: MUTED2, margin: '2px 0 0' }}>{activeChallengeInfo?.name} · Day {activeDays + 1} waiting for you</p>
            </div>
            <button onClick={() => navigate(`/glow-up-challenges/${activeChallenge.challenge_id}`)} style={{ padding: '6px 12px', borderRadius: 10, background: `linear-gradient(135deg, ${PINK_DEEP}, ${PINK_HOT})`, color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Go →
            </button>
          </div>
        )}

        {/* My Squad Activity */}
        {mySquads.length > 0 && (
          <div style={{ background: CARD, border: `1px solid rgba(168,85,247,0.25)`, borderRadius: 20, padding: '16px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: WHITE, margin: 0 }}>🤝 My Squad</p>
              <button onClick={() => navigate('/glow-squads')} style={{ fontSize: 11, color: '#a855f7', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View Squad →</button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {mySquads.slice(0, 3).map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 10, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#a855f7,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 800 }}>{(m.user_email?.[0] || 'G').toUpperCase()}</div>
                  <span style={{ fontSize: 11, color: WHITE, fontWeight: 600 }}>{m.user_email?.split('@')[0] || 'Member'}</span>
                  {m.personal_streak > 0 && <span style={{ fontSize: 10, color: PINK }}>🔥{m.personal_streak}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Favorite Quote */}
        {savedQuote ? (
          <button onClick={() => navigate('/saved-quotes')} style={{ width: '100%', background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(168,85,247,0.05))', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 18, padding: '16px', marginBottom: 12, cursor: 'pointer', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #a855f7, #ec4899)' }} />
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', color: '#c084fc', margin: '0 0 8px', textTransform: 'uppercase' }}>🌟 Favorite Glow Quote</p>
            <p style={{ fontSize: 14, color: WHITE, margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>"{savedQuote.quote_text || 'Your saved quote lives here.'}"</p>
            <p style={{ fontSize: 11, color: '#c084fc', margin: '8px 0 0', fontWeight: 600 }}>Tap to view all saved quotes →</p>
          </button>
        ) : dailyQuote && (
          <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(168,85,247,0.05))', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 18, padding: '16px', marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #a855f7, #ec4899)' }} />
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', color: '#c084fc', margin: '0 0 8px', textTransform: 'uppercase' }}>Today's Quote</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: WHITE, margin: '0 0 8px', lineHeight: 1.5, fontStyle: 'italic' }}>{dailyQuote.quote_text}</p>
            {dailyQuote.author && <p style={{ fontSize: 12, color: MUTED2, margin: 0, fontWeight: 600 }}>— {dailyQuote.author}</p>}
          </div>
        )}

        {/* My Challenges */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUTED2, marginBottom: 10 }}>My Challenges</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ALL_CHALLENGES.map((ch, idx) => {
              const record = getChallengeRecord(ch.id);
              const status = record?.status || 'not_started';
              const daysComplete = record ? JSON.parse(record.completed_days || '[]').length : 0;
              const isLocked = idx > 0 && completedChallenges < idx;
              return (
                <button
                  key={ch.id}
                  onClick={() => !isLocked && navigate(`/glow-up-challenges/${ch.id}`)}
                  style={{ width: '100%', background: CARD, border: `1px solid ${status === 'completed' ? GOLD_BORDER : status === 'in_progress' ? `${ch.color}40` : BORDER}`, borderRadius: 16, padding: '14px 16px', cursor: isLocked ? 'default' : 'pointer', textAlign: 'left', opacity: isLocked ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${ch.color}18`, border: `1px solid ${ch.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {isLocked ? '🔒' : ch.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: WHITE, margin: 0 }}>{ch.name}</p>
                      {status === 'completed' && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: 'rgba(241,182,16,0.15)', color: GOLD_LT, border: `1px solid ${GOLD_BORDER}` }}>✓ Done</span>}
                      {status === 'in_progress' && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: `${ch.color}18`, color: ch.color, border: `1px solid ${ch.color}40` }}>Active</span>}
                    </div>
                    {status !== 'not_started' && !isLocked ? (
                      <ProgressBar value={daysComplete} max={30} color={status === 'completed' ? GOLD : ch.color} height={4} />
                    ) : (
                      <p style={{ fontSize: 11, color: MUTED2, margin: 0 }}>{ch.desc}</p>
                    )}
                    {status === 'in_progress' && <p style={{ fontSize: 10, color: MUTED2, margin: '3px 0 0' }}>Day {daysComplete}/{ch.days} · {30 - daysComplete} days left</p>}
                    {status === 'completed' && <p style={{ fontSize: 10, color: GOLD_LT, margin: '3px 0 0' }}>All 30 days complete! 🎉</p>}
                  </div>
                  {!isLocked && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* My Glow Stats */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUTED2, marginBottom: 10 }}>My Glow Stats</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <StatCard icon="📅" value={totalDays} label="Days Active" />
            <StatCard icon="🔥" value={longestStreak} label="Best Streak" />
            <StatCard icon="🏆" value={completedChallenges} label="Challenges" />
            <StatCard icon="⭐" value={badgesEarned} label="Badges" />
            <StatCard icon="🏅" value={totalPoints.toLocaleString()} label="Points" />
            <StatCard icon="📜" value={certificates.length} label="Certificates" />
          </div>
        </div>

        {/* Recent Achievements */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUTED2, margin: 0 }}>Rewards and Badges</p>
            <button onClick={() => navigate('/glow-score')} style={{ fontSize: 11, color: PINK, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>See All</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {BADGES.map(badge => {
              const earned = totalPoints >= badge.pts;
              return (
                <div key={badge.id} style={{ background: earned ? `linear-gradient(135deg, ${GOLD}14, ${GOLD}08)` : CARD, border: `1px solid ${earned ? GOLD_BORDER : BORDER}`, borderRadius: 16, padding: '12px 8px', textAlign: 'center', opacity: earned ? 1 : 0.45 }}>
                  <p style={{ fontSize: 26, margin: '0 0 4px', filter: earned ? 'none' : 'grayscale(1)' }}>{badge.emoji}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: earned ? WHITE : MUTED2, margin: 0, lineHeight: 1.3 }}>{badge.label}</p>
                  {!earned && <p style={{ fontSize: 9, color: MUTED2, margin: '2px 0 0' }}>{badge.pts} pts</p>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Glow Crown Status */}
        <div style={{ background: 'linear-gradient(135deg, rgba(241,182,16,0.1), rgba(241,182,16,0.05))', border: `1px solid ${GOLD_BORDER}`, borderRadius: 20, padding: '18px 16px', marginBottom: 16, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${GOLD}, #ffe75c, ${GOLD})` }} />
          <p style={{ fontSize: 32, margin: '0 0 6px' }}>👑</p>
          <p style={{ fontWeight: 800, fontSize: 17, color: GOLD_LT, margin: '0 0 4px' }}>Glow Crown Status</p>
          <p style={{ fontSize: 13, color: MUTED, margin: '0 0 12px' }}>
            {completedChallenges === 6
              ? 'You earned the Glow Crown! You are a true Glow Queen. 👑'
              : `Complete all 6 challenges to earn your Glow Crown. ${completedChallenges}/6 done.`}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            {ALL_CHALLENGES.map((ch, i) => {
              const done = getChallengeRecord(ch.id)?.status === 'completed';
              return <div key={ch.id} style={{ width: 32, height: 32, borderRadius: 8, background: done ? `linear-gradient(135deg, ${GOLD}, #ffe75c)` : 'rgba(255,255,255,0.06)', border: `1px solid ${done ? GOLD_BORDER : BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{done ? ch.emoji : '○'}</div>;
            })}
          </div>
          <ProgressBar value={completedChallenges} max={6} color={GOLD} height={8} />
          <p style={{ fontSize: 11, color: MUTED2, margin: '6px 0 0' }}>{Math.round(crownPct)}% of Glow Crown earned</p>
        </div>

        {/* Glow Pass */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '14px 16px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🎟️</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: WHITE, margin: 0 }}>Glow Pass Rewards</p>
              <p style={{ fontSize: 12, color: MUTED2, margin: '2px 0 0' }}>Invite friends and unlock exclusive rewards</p>
            </div>
            <button onClick={() => {
              const inviteUrl = `${window.location.origin}/join`;
              if (navigator.share) {
                navigator.share({ title: 'Join Girls Glowing Up!', text: 'Come join me on Girls Glowing Up — your glow journey starts here! 🌟', url: inviteUrl }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(inviteUrl);
                alert('Invite link copied! Share it with your friends.');
              }
            }} style={{ padding: '6px 12px', borderRadius: 10, background: `linear-gradient(135deg, ${PINK_DEEP}, ${PINK_HOT})`, color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Invite
            </button>
          </div>
        </div>

      </div>
      <BottomNav active="glow" />
    </div>
  );
}