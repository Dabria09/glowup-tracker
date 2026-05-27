import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

const BG = '#0d0608';
const PINK = '#e8526d';
const PINK_HOT = '#ff6a75';
const GOLD = '#f1b610';
const GOLD_LT = '#fdcd2d';
const WHITE = '#fff8f0';
const MUTED = '#c4949e';
const MUTED2 = '#8a6070';
const CARD = '#1e0d12';
const BORDER = 'rgba(232,82,109,0.2)';
const GOLD_GRAD = 'linear-gradient(135deg, #f1b610, #ffe75c)';

const SECTIONS = [
  {
    label: 'Share & Discover',
    items: [
      { icon: '✨', label: 'Glow Feed', desc: 'See what everyone is posting', route: '/glow-feed', accent: PINK },
      { icon: '📸', label: 'Glow Board', desc: 'Share photos and inspiration', route: '/glow-board', accent: '#a855f7' },
      { icon: '💬', label: 'Glow Talk', desc: 'Chat rooms and conversations', route: '/glow-talk', accent: '#3b82f6' },
      { icon: '📣', label: 'Shout Outs', desc: 'Give props to your girls', route: '/shout-outs', accent: '#f59e0b' },
    ],
  },
  {
    label: 'Teams and Squads',
    items: [
      { icon: '🏆', label: 'Glow Teams', desc: 'Join a team and compete together', route: '/glow-teams', accent: PINK },
      { icon: '💜', label: 'Glow Squads', desc: 'Your close-knit squad', route: '/glow-squads', accent: '#a855f7' },
      { icon: '🎯', label: 'Team Contests', desc: 'Enter contests and win', route: '/team-contests', accent: GOLD },
    ],
  },
  {
    label: 'Community',
    items: [
      { icon: '🌸', label: 'Community Hub', desc: 'Find your people and join groups', route: '/community-hub', accent: '#10b981' },
      { icon: '🎓', label: 'Mentorship', desc: 'Connect with mentors who get it', route: '/mentorship', accent: GOLD },
      { icon: '🌐', label: 'My Glow Link', desc: 'Your shareable profile page', route: '/my-glow-link', accent: PINK },
    ],
  },
  {
    label: 'Rankings',
    items: [
      { icon: '🏅', label: 'Leaderboard', desc: 'See who is glowing the most', route: '/leaderboard', accent: GOLD },
      { icon: '⭐', label: 'Challenge Leaderboard', desc: 'Challenge rankings and scores', route: '/challenge-leaderboard', accent: PINK_HOT },
      { icon: '📋', label: 'Weekly Summary', desc: 'Top girls of the week', route: '/weekly-leaderboard', accent: '#a855f7' },
    ],
  },
];

export default function Connect() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: BG, color: WHITE, fontFamily: '"DM Sans","Inter",sans-serif', paddingBottom: 110, overflowX: 'hidden' }}>
      {/* Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute rounded-full" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(232,82,109,0.3), transparent 70%)', top: -200, left: -150, filter: 'blur(100px)' }} />
        <div className="absolute rounded-full" style={{ width: 350, height: 350, background: 'radial-gradient(circle, rgba(241,182,16,0.18), transparent 70%)', bottom: '20%', right: -100, filter: 'blur(100px)' }} />
      </div>
      {/* Hearts pattern */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'%3E%3Cpath d='M22 34 C11 25 4 18 4 11 C4 7 7.5 3.5 12 3.5 C15.5 3.5 18.5 5.5 22 9 C25.5 5.5 28.5 3.5 32 3.5 C36.5 3.5 40 7 40 11 C40 18 33 25 22 34Z' fill='%23e8526d' opacity='0.04'/%3E%3C/svg%3E\")", backgroundSize: '44px 44px' }} />

      <div className="relative z-10 px-4">
        {/* Header */}
        <div style={{ paddingTop: 16, paddingBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: GOLD_LT, marginBottom: 6 }}>
            Your World
          </p>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>
            <span style={{ color: PINK_HOT }}>Connect</span>{' '}
            <span style={{ background: GOLD_GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>and Glow</span>
          </h1>
          <p style={{ fontSize: 13, color: MUTED, margin: '6px 0 0' }}>Find your community, squad, and sisterhood.</p>
        </div>

        {/* Sections */}
        {SECTIONS.map(section => (
          <div key={section.label} style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUTED2, marginBottom: 10 }}>
              {section.label}
            </p>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, overflow: 'hidden' }}>
              {section.items.map((item, i) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.route)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'none', border: 'none', borderBottom: i < section.items.length - 1 ? `1px solid ${BORDER}` : 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: `${item.accent}18`, border: `1px solid ${item.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: WHITE, margin: 0 }}>{item.label}</p>
                    <p style={{ fontSize: 12, color: MUTED2, margin: '1px 0 0' }}>{item.desc}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="connect" />
    </div>
  );
}