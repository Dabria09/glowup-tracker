import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const VALID_PASSES = ['5H3CC4ER55', 'HPZJ686XK5', 'GLOWUP2025', 'PIONEER001', 'SISTERHOOD'];

const AGE_GROUPS = [
  { id: 'glow-girl', emoji: '🌸', name: 'Tween World', ages: 'Ages 10–13', color: '#e8526d', desc: 'Build confidence, discover your gifts, and learn to love who you\'re becoming. Age-appropriate content with full safety protections.', feats: ['Daily Challenges', 'Confidence', 'Wellness Basics'], consent: true },
  { id: 'glow-up', emoji: '⚡', name: 'Teen World', ages: 'Ages 14–17', color: '#f1b610', desc: 'Navigate high school and your future — build real skills, career clarity, find mentors, and own your story.', feats: ['Career Explorer', 'Money Moves', 'Mentorship'], consent: false },
  { id: 'glow-sis', emoji: '🌟', name: "Women's World", ages: 'Ages 18+', color: '#ff6a75', desc: 'Your world, no limits. Network, grow your career, lead, and lift others. Women\'s World has no upper age limit.', feats: ['Networking', 'Leadership', 'Mentoring Others'], consent: false },
  { id: 'glow-mom', emoji: '💛', name: 'Parent / Guardian', ages: 'Parent / Guardian', color: '#fdcd2d', desc: 'Stay connected to your child\'s journey and access parent resources, oversight tools, and progress updates.', feats: ['Account Oversight', 'Progress Updates'], consent: false },
];

const MSG = {
  'glow-girl': "You're officially a Glow Girl. Your journey to becoming your best self starts right now.",
  'glow-up': "You're officially Glowing Up. Let's level up every part of your life.",
  'glow-sis': "Welcome, Glow Sis. The girls behind you need to see you. Show up and shine.",
  'glow-mom': "Welcome, Glow Mom. We're grateful to partner with you in your daughter's journey.",
};

const PINK = '#e8526d';
const PINK_HOT = '#ff6a75';
const PINK_DEEP = '#c44a55';
const GOLD = '#f1b610';
const GOLD_LT = '#fdcd2d';
const WHITE = '#fff8f0';
const MUTED = '#c4949e';
const MUTED2 = '#8a6070';
const CARD = '#1e0d12';

export default function JoinGGU() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('si');
  const [step, setStep] = useState(1);
  const [passCode, setPassCode] = useState('');
  const [passValid, setPassValid] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const group = AGE_GROUPS.find(g => g.id === selectedGroup);

  const handlePassInput = (val) => {
    const v = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setPassCode(v);
    if (!v) return setPassValid(null);
    if (v.length < 8) return setPassValid(null);
    setPassValid(VALID_PASSES.includes(v));
  };

  const signIn = () => base44.auth.redirectToLogin('/dashboard');
  const createAccount = () => { setShowSuccess(true); setTimeout(() => base44.auth.redirectToLogin('/onboarding'), 1800); };

  const dot = (s, active, done) => (
    <div key={s} className="rounded-full" style={{ width: 8, height: 8, background: done ? GOLD : active ? PINK : 'rgba(232,82,109,0.2)', border: `1px solid ${done ? GOLD : active ? PINK : 'rgba(232,82,109,0.3)'}`, boxShadow: active ? '0 0 8px rgba(232,82,109,0.6)' : 'none' }} />
  );

  return (
    <div style={{ background: '#0d0608', color: WHITE, fontFamily: '"DM Sans","Inter",sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'hidden' }}>
      {/* BG */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute rounded-full" style={{ width: 500, height: 500, background: 'radial-gradient(circle,rgba(232,82,109,0.45),transparent 70%)', top: -180, left: -120, opacity: .45, filter: 'blur(100px)' }} />
        <div className="absolute rounded-full" style={{ width: 400, height: 400, background: 'radial-gradient(circle,rgba(241,182,16,0.35),transparent 70%)', bottom: -100, right: -100, opacity: .35, filter: 'blur(100px)' }} />
      </div>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'%3E%3Cpath d='M22 34 C11 25 4 18 4 11 C4 7 7.5 3.5 12 3.5 C15.5 3.5 18.5 5.5 22 9 C25.5 5.5 28.5 3.5 32 3.5 C36.5 3.5 40 7 40 11 C40 18 33 25 22 34Z' fill='%23e8526d' opacity='0.04'/%3E%3C/svg%3E\")", backgroundSize: '44px 44px' }} />

      <div className="relative z-10 w-full max-w-md px-4 py-6 pb-10">
        {/* Logo */}
        <div className="text-center mb-5">
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 900, fontSize: 28, background: `linear-gradient(135deg,${PINK},${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>Girls Glowing Up™</h1>
          <p style={{ fontSize: 11, color: MUTED2, marginTop: 4 }}>Your journey to becoming your best self starts here</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl overflow-hidden" style={{ background: CARD, border: `1px solid ${PINK}33`, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
          {/* Tabs */}
          <div className="grid grid-cols-2" style={{ borderBottom: `1px solid ${PINK}33` }}>
            {[['si','Sign In'],['su','Join GGU ✦']].map(([t,label]) => (
              <button key={t} onClick={() => { setTab(t); setStep(1); setPassCode(''); setPassValid(null); setSelectedGroup(null); setShowSuccess(false); }} style={{ padding: '15px', textAlign: 'center', fontFamily: '"Sora","Poppins",sans-serif', fontSize: 14, fontWeight: 700, color: tab === t ? WHITE : MUTED2, background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative' }}>
                {label}
                {tab === t && <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 2, background: `linear-gradient(90deg,${PINK},${GOLD})`, borderRadius: 2 }} />}
              </button>
            ))}
          </div>

          {/* SIGN IN */}
          {tab === 'si' && (
            <div style={{ padding: 26 }}>
              <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 21, fontWeight: 900, marginBottom: 4 }}>Welcome Back, Queen 👑</h2>
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>Continue your glow up journey</p>
              <button onClick={signIn} className="w-full flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5" style={{ background: `linear-gradient(135deg,${PINK_DEEP},${PINK} 40%,${PINK_HOT} 100%)`, color: 'white', fontFamily: '"Sora","Poppins",sans-serif', fontSize: 15, fontWeight: 800, padding: 16, borderRadius: 14, border: 'none', cursor: 'pointer', boxShadow: '0 8px 28px rgba(232,82,109,0.45)' }}>
                ✦ Sign In with Google
              </button>
              <button onClick={() => base44.auth.redirectToLogin('/mentorship')} className="w-full flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 mt-2.5" style={{ background: 'transparent', border: `2px solid rgba(241,182,16,0.4)`, color: GOLD_LT, fontFamily: '"Sora","Poppins",sans-serif', fontSize: 14, fontWeight: 700, padding: 13, borderRadius: 14, cursor: 'pointer' }}>
                🎓 Mentor Sign In → Mentor Hub
              </button>
              <div className="flex items-center gap-2.5 my-3.5" style={{ color: 'rgba(196,148,158,0.4)', fontSize: 11, letterSpacing: 1 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(232,82,109,0.18)' }} /><span>OR</span><div style={{ flex: 1, height: 1, background: 'rgba(232,82,109,0.18)' }} />
              </div>
              <button className="w-full flex items-center justify-center gap-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: MUTED, fontSize: 14, padding: 13, borderRadius: 14, cursor: 'not-allowed', opacity: 0.6 }}>
                👁️ Sign In with Face / Fingerprint
              </button>
              <div className="flex items-start gap-2 rounded-xl p-3 mt-3" style={{ background: 'rgba(241,182,16,0.07)', border: '1px solid rgba(241,182,16,0.2)' }}>
                <span>💡</span><p style={{ fontSize: 12, color: '#ffd1a3', lineHeight: 1.5 }}>For the best experience, <strong style={{ color: GOLD_LT }}>sign in with Google.</strong> Apple sign-in is not currently supported.</p>
              </div>
            </div>
          )}

          {/* JOIN STEPS */}
          {tab === 'su' && !showSuccess && (
            <div style={{ padding: 26 }}>

              {/* STEP 1 - Glow Pass */}
              {step === 1 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-3">{[1,2,3].map(s => dot(s, s===1, false))}</div>
                  <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 21, fontWeight: 900 }}>Do you have a Glow Pass™?</h2>
                  <p style={{ fontSize: 13, color: MUTED, marginTop: 4, marginBottom: 16 }}>Enter your pass code to unlock the sisterhood</p>
                  <div className="rounded-[18px] p-5 text-center mb-4" style={{ background: 'linear-gradient(135deg,rgba(241,182,16,0.09),rgba(232,82,109,0.07))', border: '1px solid rgba(241,182,16,0.3)' }}>
                    <span style={{ fontSize: 28, marginBottom: 6, display: 'block', filter: 'drop-shadow(0 0 10px rgba(241,182,16,0.8))' }}>👑</span>
                    <p style={{ fontFamily: '"Sora","Poppins",sans-serif', fontSize: 15, fontWeight: 800, color: GOLD_LT, marginBottom: 5 }}>Glow Pass™ — Choose Wisely</p>
                    <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.55, marginBottom: 13 }}>Each Glow Pass is a personal invitation into GGU. If a girl believed in you enough to share hers, use it here.</p>
                    <div className="relative">
                      <input type="text" value={passCode} onChange={e => handlePassInput(e.target.value)} placeholder="Enter pass code (e.g. 5H3CC4ER55)" maxLength={12} style={{ width: '100%', textAlign: 'center', background: 'rgba(0,0,0,0.3)', border: `1px solid ${passValid===true?GOLD:passValid===false?'#f87171':'rgba(241,182,16,0.3)'}`, borderRadius: 12, padding: '13px 44px 13px 14px', color: WHITE, fontFamily: '"Sora","Poppins",sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', outline: 'none', boxShadow: passValid===true?'0 0 14px rgba(241,182,16,0.3)':passValid===false?'0 0 10px rgba(248,113,113,0.2)':'none' }} />
                      {passValid!==null && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>{passValid?'✅':'❌'}</span>}
                    </div>
                    {passValid!==null && <p style={{ fontSize: 12, marginTop: 7, color: passValid?GOLD_LT:'#f87171', minHeight: 17 }}>{passValid?'✓ Valid Glow Pass! Welcome to the sisterhood.':"That pass code isn't recognized. Check with the girl who invited you."}</p>}
                    <p onClick={() => setStep(2)} style={{ fontSize: 12, color: 'rgba(196,148,158,0.4)', marginTop: 7, cursor: 'pointer', textDecoration: 'underline' }}>I don't have a Glow Pass — join the waitlist instead</p>
                  </div>
                  <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(241,182,16,0.12)' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: GOLD_LT, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>How Glow Passes Work</p>
                    {[['👑','Each girl gets exactly 2 passes — limited for a reason'],['❤️','Share your code with a girl you believe in'],['⏰','Passes expire in 30 days if unused'],['🎁','Earn rewards for every member you bring in']].map(([icon,text])=>(
                      <div key={text} className="flex items-start gap-2 mb-1.5" style={{ fontSize: 12, color: MUTED, lineHeight: 1.45 }}><span>{icon}</span><span>{text}</span></div>
                    ))}
                  </div>
                  <button onClick={() => setStep(2)} disabled={!passValid} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: passValid?`linear-gradient(135deg,${PINK_DEEP},${PINK} 40%,${PINK_HOT} 100%)`:'rgba(232,82,109,0.2)', color: 'white', fontFamily: '"Sora","Poppins",sans-serif', fontSize: 15, fontWeight: 800, padding: 16, borderRadius: 14, border: 'none', cursor: passValid?'pointer':'not-allowed', opacity: passValid?1:0.4, boxShadow: passValid?'0 8px 24px rgba(232,82,109,0.4)':'none', marginTop: 4 }}>Continue →</button>
                </div>
              )}

              {/* STEP 2 - Age Group */}
              {step === 2 && (
                <div>
                  <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: MUTED2, fontSize: 13, cursor: 'pointer', marginBottom: 12 }}>← Back</button>
                  <div className="flex items-center gap-1.5 mb-3">{[1,2,3].map(s => dot(s, s===2, s<2))}</div>
                  <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 21, fontWeight: 900 }}>Which Glow Girl are you?</h2>
                  <p style={{ fontSize: 13, color: MUTED, marginTop: 4, marginBottom: 16 }}>Everything in the app is personalized for your stage</p>
                  <div className="flex flex-col gap-3">
                    {AGE_GROUPS.map(g => (
                      <div key={g.id} onClick={() => setSelectedGroup(g.id)} className="rounded-2xl p-4 cursor-pointer transition-all relative overflow-hidden" style={{ background: 'rgba(0,0,0,0.18)', border: `2px solid ${selectedGroup===g.id?g.color:'rgba(232,82,109,0.2)'}`, boxShadow: selectedGroup===g.id?`0 0 0 1px ${g.color},0 8px 24px rgba(0,0,0,0.2)`:'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 30, flexShrink: 0 }}>{g.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: '"Sora","Poppins",sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{g.name}</p>
                          <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, marginBottom: 4, background: `${g.color}22`, border: `1px solid ${g.color}55`, color: g.id==='glow-up'?GOLD_LT:'#ffb2c0' }}>{g.ages}</span>
                          <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>{g.desc}</p>
                          <div className="flex gap-1 flex-wrap mt-1.5">
                            {g.feats.map(f => <span key={f} style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: 'rgba(232,82,109,0.1)', border: '1px solid rgba(232,82,109,0.25)', color: '#ffb2c0' }}>{f}</span>)}
                          </div>
                        </div>
                        {selectedGroup===g.id && <span style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: g.color }}>✓</span>}
                      </div>
                    ))}
                  </div>
                  {group?.consent && (
                    <div className="flex items-start gap-2 rounded-xl p-3 mt-3" style={{ background: 'rgba(241,182,16,0.07)', border: '1px solid rgba(241,182,16,0.25)' }}>
                      <span>⚠️</span><p style={{ fontSize: 12, color: '#ffd1a3', lineHeight: 1.5 }}>Since you're under 13, a parent or guardian must give consent before you join. We'll guide you both through it together.</p>
                    </div>
                  )}
                  <button onClick={() => setStep(3)} disabled={!selectedGroup} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: selectedGroup?`linear-gradient(135deg,${PINK_DEEP},${PINK} 40%,${PINK_HOT} 100%)`:'rgba(232,82,109,0.2)', color: 'white', fontFamily: '"Sora","Poppins",sans-serif', fontSize: 15, fontWeight: 800, padding: 16, borderRadius: 14, border: 'none', cursor: selectedGroup?'pointer':'not-allowed', opacity: selectedGroup?1:0.4, boxShadow: selectedGroup?'0 8px 24px rgba(232,82,109,0.4)':'none', marginTop: 16 }}>
                    {group ? `I'm a ${group.name} →` : 'This is me →'}
                  </button>
                </div>
              )}

              {/* STEP 3 - Create Account */}
              {step === 3 && (
                <div>
                  <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: MUTED2, fontSize: 13, cursor: 'pointer', marginBottom: 12 }}>← Back</button>
                  <div className="flex items-center gap-1.5 mb-3">{[1,2,3].map(s => dot(s, s===3, s<3))}</div>
                  <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 21, fontWeight: 900 }}>Join Girls Glowing Up™ 💖</h2>
                  <p style={{ fontSize: 13, color: MUTED, marginTop: 4, marginBottom: 16 }}>Create your account in seconds. Your sisterhood awaits.</p>
                  {group && (
                    <div className="flex items-center gap-2 rounded-xl p-2 mb-4" style={{ background: 'rgba(232,82,109,0.1)', border: '1px solid rgba(232,82,109,0.25)', fontSize: 12, color: '#ffb2c0', fontWeight: 600 }}>
                      <span>{group.emoji}</span><span>{group.name} · {group.ages}</span>
                    </div>
                  )}
                  <button onClick={createAccount} className="w-full flex items-center justify-center gap-2 font-bold transition-all hover:-translate-y-0.5" style={{ background: `linear-gradient(135deg,${PINK_DEEP},${PINK} 40%,${PINK_HOT} 100%)`, color: 'white', fontFamily: '"Sora","Poppins",sans-serif', fontSize: 15, fontWeight: 800, padding: 16, borderRadius: 14, border: 'none', cursor: 'pointer', boxShadow: '0 8px 28px rgba(232,82,109,0.45)' }}>
                    ✦ Create Account with Google
                  </button>
                  <div className="flex items-start gap-2 rounded-xl p-3 mt-3" style={{ background: 'rgba(241,182,16,0.07)', border: '1px solid rgba(241,182,16,0.2)' }}>
                    <span>💡</span><p style={{ fontSize: 12, color: '#ffd1a3', lineHeight: 1.5 }}>For the best experience, <strong style={{ color: GOLD_LT }}>sign in with Google.</strong> We never see your password.</p>
                  </div>
                  <div className="rounded-xl p-3 mt-3" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(232,82,109,0.2)' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: GOLD_LT, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7 }}>✦ What happens next</p>
                    <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.8 }}>1. Sign up with Google — we never see your password<br/>2. Personalize your Glow profile &amp; avatar<br/>3. Quick tour of your new sisterhood<br/>4. Start your first Glow Up Challenge 🔥</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUCCESS */}
          {tab === 'su' && showSuccess && (
            <div style={{ padding: '40px 26px', textAlign: 'center' }}>
              <span style={{ fontSize: 52, display: 'block', marginBottom: 13, filter: 'drop-shadow(0 0 16px rgba(241,182,16,0.8))' }}>👑</span>
              <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Welcome to the <span style={{ background: `linear-gradient(135deg,${PINK_HOT},${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sisterhood!</span></h2>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, marginBottom: 22 }}>{selectedGroup ? MSG[selectedGroup] : "Your journey to becoming your best self starts right now."}</p>
              <p style={{ fontSize: 12, color: MUTED2 }}>Redirecting to sign in...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-4 flex-wrap mt-4" style={{ fontSize: 11, color: MUTED2 }}>
          <span>🛡️ Background checked mentors</span>
          <span>🔒 Data never sold</span>
          <span>✅ Verified community</span>
        </div>
        <div className="text-center mt-3">
          <button onClick={() => navigate('/')} style={{ fontSize: 12, color: '#ffb2c0', opacity: 0.6, background: 'none', border: 'none', cursor: 'pointer' }}>← Back to Home</button>
        </div>
      </div>
    </div>
  );
}