import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const FEATURES = [
  { icon: '✦', title: 'Daily Glow Challenges', desc: 'Daily habits that build confidence, wellness, and real-life skills.', tag: 'Core Feature' },
  { icon: '🎓', title: 'Mentor Connections', desc: 'Connect with background-checked women who have been where you\'re going.', tag: 'Mentorship' },
  { icon: '💰', title: 'Money & Career Tools', desc: 'Budget trackers, scholarship finders, and career exploration paths.', tag: 'Life Skills' },
  { icon: '📚', title: 'Girls\' Library', desc: 'Curated books, articles, and resources handpicked for your stage of life.', tag: 'Resources' },
  { icon: '🌸', title: 'Wellness Hub', desc: 'Cycle tracking, mental health check-ins, and nutrition guidance.', tag: 'Wellness' },
  { icon: '👑', title: 'Glow Score System', desc: 'Earn points, unlock certificates, and track your growth journey.', tag: 'Gamification' },
];

const SAFETY_ITEMS = [
  { icon: '🛡️', title: 'Background Checks', desc: 'Every mentor goes through a thorough background check before connecting with girls.' },
  { icon: '🔒', title: 'Data Privacy', desc: 'Your data is never sold. Full privacy controls and transparent data practices.' },
  { icon: '✅', title: 'Verified Community', desc: 'Members are verified and our community standards are actively enforced.' },
  { icon: '👨‍👩‍👧', title: 'Parental Oversight', desc: 'Parents can monitor and control their daughter\'s experience within the app.' },
];

const MENTOR_PERKS = [
  { icon: '⭐', label: 'Make Impact' },
  { icon: '📜', label: 'Earn Certificate' },
  { icon: '🌐', label: 'Build Network' },
  { icon: '💛', label: 'Give Back' },
];

const STATS = [
  { value: '10K+', label: 'Glow Girls' },
  { value: '4.9★', label: 'App Rating' },
  { value: '50+', label: 'Mentors' },
];

const BG = `#0d0608`;
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
const BORDER2 = 'rgba(241,182,16,0.22)';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleJoin = () => navigate(user ? '/dashboard' : '/join');

  return (
    <div style={{ background: BG, color: WHITE, fontFamily: '"DM Sans", "Inter", sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute rounded-full" style={{ width: 700, height: 700, background: `radial-gradient(circle, rgba(232,82,109,0.4), transparent 70%)`, top: -280, left: -180, opacity: 0.5, filter: 'blur(100px)' }} />
        <div className="absolute rounded-full" style={{ width: 550, height: 550, background: `radial-gradient(circle, rgba(241,182,16,0.35), transparent 70%)`, top: '30%', right: -180, opacity: 0.4, filter: 'blur(100px)', animationDelay: '-6s' }} />
        <div className="absolute rounded-full" style={{ width: 450, height: 450, background: `radial-gradient(circle, rgba(196,74,85,0.3), transparent 70%)`, bottom: -120, left: '15%', opacity: 0.35, filter: 'blur(100px)' }} />
      </div>
      {/* Hearts pattern */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'%3E%3Cpath d='M22 34 C11 25 4 18 4 11 C4 7 7.5 3.5 12 3.5 C15.5 3.5 18.5 5.5 22 9 C25.5 5.5 28.5 3.5 32 3.5 C36.5 3.5 40 7 40 11 C40 18 33 25 22 34Z' fill='%23e8526d' opacity='0.04'/%3E%3C/svg%3E\")", backgroundSize: '44px 44px' }} />

      <div className="relative z-10">
        {/* NAV */}
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3" style={{ background: 'rgba(13,6,8,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(232,82,109,0.15)' }}>
          <div style={{ fontFamily: '"Playfair Display", serif', fontWeight: 900, fontSize: 20, background: `linear-gradient(135deg, ${PINK}, ${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Girls Glowing Up™
          </div>
          <div className="hidden md:flex items-center gap-1">
            {[['#features','Features'],['#safety','Safety'],['#mentors','Mentors']].map(([href, label]) => (
              <a key={label} href={href} style={{ color: MUTED, fontSize: 13, fontWeight: 500, padding: '6px 12px', borderRadius: 8, textDecoration: 'none' }}>{label}</a>
            ))}
            <button onClick={() => navigate('/join')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(241,182,16,0.1)', border: '1.5px solid rgba(241,182,16,0.4)', color: GOLD_LT, fontSize: 13, fontWeight: 700, padding: '8px 16px', borderRadius: 10, cursor: 'pointer' }}>
              🎓 Apply as Mentor
            </button>
          </div>
        </nav>

        {/* HERO */}
        <section className="flex flex-col items-center justify-center text-center px-6 pb-16" style={{ minHeight: 'calc(100vh - 64px)', paddingTop: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: GOLD_LT, marginBottom: 18 }}>
            Empowered Girls. Brighter Futures.
          </p>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(28px,7vw,54px)', fontWeight: 900, lineHeight: 1.08, marginBottom: 14 }}>
            <span style={{ color: PINK_HOT, textShadow: '0 0 30px rgba(255,106,117,0.5)' }}>Girls</span>{' '}
            <span style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #ffe75c 50%, #ffd1a3 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 20px rgba(241,182,16,0.5))' }}>Glowing Up</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px,2.5vw,17px)', color: MUTED, maxWidth: 480, lineHeight: 1.7, margin: '0 auto 36px' }}>
            A safe, empowering space where girls build <strong style={{ color: '#ffb2c0', fontWeight: 600 }}>confidence</strong>, discover their purpose, and connect with mentors who believe in them.
          </p>

          <div className="flex flex-col items-center gap-3 w-full" style={{ maxWidth: 400 }}>
            <button onClick={handleJoin} className="w-full flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5" style={{ background: `linear-gradient(135deg, ${PINK_DEEP} 0%, ${PINK} 40%, ${PINK_HOT} 100%)`, color: 'white', fontFamily: '"Sora","Poppins",sans-serif', fontSize: 16, fontWeight: 800, padding: '17px 28px', borderRadius: 16, border: 'none', cursor: 'pointer', boxShadow: `0 8px 32px rgba(232,82,109,0.5)`, letterSpacing: '-.2px' }}>
              ✦ Join the Sisterhood
            </button>
            <div className="flex items-center gap-3 w-full" style={{ color: 'rgba(196,148,158,0.4)', fontSize: 11, letterSpacing: 1 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(232,82,109,0.18)' }} /><span>OR</span><div style={{ flex: 1, height: 1, background: 'rgba(232,82,109,0.18)' }} />
            </div>
            <button onClick={() => base44.auth.redirectToLogin()} className="w-full flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5" style={{ background: 'transparent', border: `2px solid rgba(241,182,16,0.55)`, color: GOLD_LT, fontFamily: '"Sora","Poppins",sans-serif', fontSize: 15, fontWeight: 700, padding: '15px 28px', borderRadius: 16, cursor: 'pointer' }}>
              🎓 Mentor Sign In
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap mt-9" style={{ fontSize: 12, color: MUTED2 }}>
            <span>🛡️ Background checked mentors</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(241,182,16,0.4)', display: 'inline-block' }} />
            <span>🔒 Data never sold</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(241,182,16,0.4)', display: 'inline-block' }} />
            <span>✅ Verified community</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 mt-4" style={{ background: 'rgba(241,182,16,0.07)', border: '1px solid rgba(241,182,16,0.25)', maxWidth: 400, width: '100%', fontSize: 12, color: '#ffd1a3' }}>
            <span>👑</span>
            <span>Got a Glow Pass? <strong style={{ color: GOLD_LT }}>Use it when you join</strong> to unlock the sisterhood instantly.</span>
          </div>
        </section>

        {/* STATS */}
        <section className="px-5 pb-16">
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            {STATS.map(s => (
              <div key={s.label} className="rounded-[18px] p-5 text-center transition-all hover:-translate-y-1 relative overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, rgba(232,82,109,0.07), transparent 60%)` }} />
                <p className="relative" style={{ fontFamily: '"Playfair Display",serif', fontSize: 32, fontWeight: 900, background: `linear-gradient(135deg, ${PINK_HOT}, ${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
                <p className="relative" style={{ fontSize: 11, color: MUTED2, fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="px-5 pb-16 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div style={{ height: 1, width: 36, background: `linear-gradient(90deg, ${PINK}, transparent)` }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: PINK, letterSpacing: 2, textTransform: 'uppercase' }}>Features</p>
          </div>
          <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(24px,5vw,38px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 32 }}>
            Everything you need to{' '}
            <span style={{ background: `linear-gradient(135deg, ${PINK_HOT}, ${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>glow up</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(f => (
              <div key={f.title} className="rounded-[20px] p-5 transition-all hover:-translate-y-1 relative overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 26, marginBottom: 11, display: 'block' }}>{f.icon}</span>
                <p style={{ fontFamily: '"Sora","Poppins",sans-serif', fontSize: 14, fontWeight: 700, marginBottom: 5, color: WHITE }}>{f.title}</p>
                <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>{f.desc}</p>
                <span style={{ display: 'inline-block', marginTop: 9, fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: 'rgba(232,82,109,0.12)', border: '1px solid rgba(232,82,109,0.3)', color: '#ffb2c0' }}>{f.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SAFETY */}
        <section id="safety" className="px-5 pb-16 max-w-3xl mx-auto">
          <div className="rounded-3xl p-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(241,182,16,0.06), rgba(232,82,109,0.06))', border: '1px solid rgba(241,182,16,0.2)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${GOLD}, ${PINK_HOT}, ${PINK})` }} />
            <div className="flex items-center gap-3 mb-5">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(241,182,16,0.12)', border: '1px solid rgba(241,182,16,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🛡️</div>
              <div>
                <h3 style={{ fontFamily: '"Sora","Poppins",sans-serif', fontSize: 16, fontWeight: 700 }}>Safety First. Always.</h3>
                <p style={{ fontSize: 12, color: GOLD_LT, marginTop: 2 }}>Built with teen safety as the foundation</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SAFETY_ITEMS.map(s => (
                <div key={s.title} className="flex items-start gap-2 rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(241,182,16,0.1)', border: '1px solid rgba(241,182,16,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <strong style={{ color: WHITE, fontWeight: 600, display: 'block', marginBottom: 1, fontSize: 12 }}>{s.title}</strong>
                    <span style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{s.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MENTOR CTA */}
        <section id="mentors" className="px-5 pb-16 max-w-3xl mx-auto">
          <div className="rounded-3xl p-10 flex flex-col items-center text-center relative overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER2}` }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(241,182,16,0.07), transparent 60%)' }} />
            <h2 className="relative" style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(20px,4vw,28px)', fontWeight: 900, marginBottom: 10 }}>Are You a Woman Who Gets It?</h2>
            <p className="relative" style={{ fontSize: 14, color: MUTED, maxWidth: 380, lineHeight: 1.65, marginBottom: 22 }}>
              Girls Glowing Up is looking for women who have walked the path and want to light the way for the next generation.
            </p>
            <div className="flex gap-2 flex-wrap justify-center mb-6 relative">
              {MENTOR_PERKS.map(p => (
                <span key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(241,182,16,0.08)', border: '1px solid rgba(241,182,16,0.25)', color: GOLD_LT, fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 20 }}>
                  {p.icon} {p.label}
                </span>
              ))}
            </div>
            <button onClick={() => navigate('/join')} className="relative flex items-center justify-center gap-2 font-bold transition-all hover:-translate-y-0.5" style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #ffe75c 100%)`, color: '#1a0a00', fontFamily: '"Sora","Poppins",sans-serif', fontSize: 15, fontWeight: 800, padding: '15px 36px', borderRadius: 14, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(241,182,16,0.45)', maxWidth: 300, width: '100%' }}>
              🎓 Apply as a Mentor
            </button>
            <p className="relative" style={{ marginTop: 11, fontSize: 11, color: MUTED2 }}>Background check required · No experience necessary</p>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="px-6 pb-16 max-w-md mx-auto text-center">
          <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(24px,6vw,36px)', fontWeight: 900, marginBottom: 10, lineHeight: 1.1 }}>Your glow up starts today.</h2>
          <p style={{ fontSize: 14, color: MUTED, marginBottom: 26, lineHeight: 1.6 }}>Join thousands of girls already leveling up their confidence, health, and future — one glow at a time.</p>
          <div className="flex flex-col gap-3">
            <button onClick={handleJoin} className="w-full flex items-center justify-center gap-2 font-bold transition-all hover:-translate-y-0.5" style={{ background: `linear-gradient(135deg, ${PINK_DEEP} 0%, ${PINK} 40%, ${PINK_HOT} 100%)`, color: 'white', fontFamily: '"Sora","Poppins",sans-serif', fontSize: 16, fontWeight: 800, padding: '17px 28px', borderRadius: 16, border: 'none', cursor: 'pointer', boxShadow: `0 8px 32px rgba(232,82,109,0.5)` }}>
              ✦ Join the Sisterhood
            </button>
            {user && (
              <button onClick={() => navigate('/dashboard')} className="w-full flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5" style={{ background: 'transparent', border: `2px solid rgba(241,182,16,0.55)`, color: GOLD_LT, fontFamily: '"Sora","Poppins",sans-serif', fontSize: 15, fontWeight: 700, padding: '15px 28px', borderRadius: 16, cursor: 'pointer' }}>
                Go to Dashboard →
              </button>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="px-6 pb-8 text-center" style={{ borderTop: '1px solid rgba(232,82,109,0.12)' }}>
          <div className="flex justify-center gap-5 flex-wrap mb-3 pt-6">
            {[['About','/about'],['How It Works','/how-it-works'],['Guidelines','/guidelines'],['Support','/support']].map(([label, path]) => (
              <span key={label} onClick={() => navigate(path)} style={{ fontSize: 12, color: '#ffb2c0', opacity: 0.6, cursor: 'pointer' }}>{label}</span>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(196,148,158,0.35)' }}>© 2025 Girls Glowing Up™. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}