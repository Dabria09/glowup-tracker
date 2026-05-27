import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';

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
  { id: 'confidence-boost', name: 'Confidence Boost', emoji: '✨', desc: 'Build unshakeable self-belief in 30 days', days: 30, color: PINK },
  { id: 'glow-wellness', name: 'Glow Wellness', emoji: '🌸', desc: 'Mind, body & spirit habits that last', days: 30, color: '#a855f7' },
  { id: 'money-moves', name: 'Money Moves', emoji: '💰', desc: 'Master your finances and future', days: 30, color: GOLD },
  { id: 'academic-glow', name: 'Academic Glow', emoji: '📚', desc: 'Crush your studies and career goals', days: 30, color: '#3b82f6' },
  { id: 'spiritual-glow', name: 'Spiritual Glow', emoji: '🙏', desc: 'Connect with your inner light and purpose', days: 30, color: '#10b981' },
  { id: 'leadership-era', name: 'Leadership Era', emoji: '👑', desc: 'Step into your power and lead', days: 30, color: '#f59e0b' },
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
  const [userPoints, setUserPoints] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayAffirmation = AFFIRMATIONS[new Date().getDay() % AFFIRMATIONS.length];

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [pts, ch, certs] = await Promise.all([
          base44.entities.UserPoints.filter({ user_email: u.email }),
          base44.entities.GlowUpChallenge.filter({ user_email: u.email }),
          base44.entities.GlowUpCertificate.filter({ user_email: u.email }),
        ]);
        if (pts.length) setUserPoints(pts[0]);
        setChallenges(ch);
        setCertificates(certs);
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

  // Crown progress: 0–6 challenges
  const crownPct = Math.min(100, (completedChallenges / 6) * 100);

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
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>
            <span style={{ color: PINK_HOT }}>My</span>{' '}
            <span style={{ background: 'linear-gradient(135deg, #f1b610, #ffe75c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Glow</span>
          </h1>
          <p style={{ fontSize: 13, color: MUTED, margin: '4px 0 0' }}>Your personal empowerment dashboard.</p>
        </div>

        {/* Daily Affirmation */}
        <div style={{ background: 'linear-gradient(135deg, rgba(232,82,109,0.12), rgba(241,182,16,0.08))', border: `1px solid ${BORDER}`, borderRadius: 18, padding: '14px 16px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${PINK_DEEP}, ${PINK_HOT}, ${GOLD})` }} />
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', color: GOLD_LT, margin: '0 0 6px', textTransform: 'uppercase' }}>Today's Affirmation</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: WHITE, margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>"{todayAffirmation}"</p>
        </div>

        {/* Active Challenge Banner */}
        {activeChallenge && activeChallengeInfo ? (
          <div style={{ background: `linear-gradient(135deg, ${activeChallengeInfo.color}18, ${activeChallengeInfo.color}08)`, border: `1px solid ${activeChallengeInfo.color}40`, borderRadius: 20, padding: 16, marginBottom: 16 }}>
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
          <button onClick={() => navigate('/glow-up-challenges')} style={{ width: '100%', background: `linear-gradient(135deg, rgba(232,82,109,0.15), rgba(232,82,109,0.08))`, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '18px 16px', marginBottom: 16, cursor: 'pointer', textAlign: 'center' }}>
            <p style={{ fontSize: 24, margin: '0 0 6px' }}>✨</p>
            <p style={{ fontWeight: 800, fontSize: 15, color: WHITE, margin: '0 0 3px' }}>Start Your First Challenge</p>
            <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>30-day journeys to unlock your best self</p>
          </button>
        )}

        {/* Glow Crown + Streak + Points Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {/* Glow Crown */}
          <div style={{ background: CARD, border: `1px solid ${GOLD_BORDER}`, borderRadius: 18, padding: '14px 12px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: GOLD_LT, textTransform: 'uppercase', margin: '0 0 6px' }}>Glow Crown</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: GOLD_LT, margin: '0 0 4px' }}>{completedChallenges}<span style={{ fontSize: 13, color: MUTED2 }}>/6</span></p>
            <ProgressBar value={completedChallenges} max={6} color={GOLD} height={6} />
            <p style={{ fontSize: 10, color: MUTED2, margin: '5px 0 0' }}>
              {completedChallenges === 6 ? '👑 Crown Earned!' : `${6 - completedChallenges} challenges to crown`}
            </p>
          </div>
          {/* Streak + Points */}
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

        {/* Quick Actions */}
        <div style={{ marginBottom: 20 }}>
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
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
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

        {/* Rewards and Badges */}
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
            <button onClick={() => navigate('/my-glow-link')} style={{ padding: '6px 12px', borderRadius: 10, background: `linear-gradient(135deg, ${PINK_DEEP}, ${PINK_HOT})`, color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Share
            </button>
          </div>
        </div>

      </div>
      <BottomNav active="glow" />
    </div>
  );
}