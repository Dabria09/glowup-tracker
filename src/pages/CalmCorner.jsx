import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import useGlowPoints from '@/hooks/useGlowPoints';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, ChevronRight, AlertTriangle, X, Plus, Phone, MessageCircle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const TODAY = new Date().toISOString().slice(0, 10);

const BREATHING_EXERCISES = [
  {
    id: 'box', emoji: '🟦', title: 'Box Breathing', subtitle: 'Calm your nervous system in 2 minutes',
    detail: '4 rounds · ~2 min',
    phases: [
      { label: 'Inhale', cue: 'Breathe in slowly...', secs: 4 },
      { label: 'Hold', cue: 'Hold your breath...', secs: 4 },
      { label: 'Exhale', cue: 'Breathe out slowly...', secs: 4 },
      { label: 'Hold', cue: 'Rest...', secs: 4 },
    ],
    rounds: 4,
  },
  {
    id: '478', emoji: '🌙', title: '4-7-8 Breathing', subtitle: 'Release stress and anxiety instantly',
    detail: '3 rounds · ~1 min',
    phases: [
      { label: 'Inhale', cue: 'Breathe in slowly...', secs: 4 },
      { label: 'Hold', cue: 'Hold your breath...', secs: 7 },
      { label: 'Exhale', cue: 'Breathe out slowly...', secs: 8 },
    ],
    rounds: 3,
  },
  {
    id: 'calm', emoji: '🌸', title: 'Calm Breath', subtitle: 'Simple 5-5 breathing for quick calm',
    detail: '5 rounds · ~1 min',
    phases: [
      { label: 'Inhale', cue: 'Breathe in slowly...', secs: 5 },
      { label: 'Exhale', cue: 'Breathe out slowly...', secs: 5 },
    ],
    rounds: 5,
  },
];

const STARTER_AFFIRMATIONS = [
  'I am worthy of love and success',
  'I am becoming the best version of myself every day',
  'My confidence grows every single day',
  'I am enough, exactly as I am',
  'I attract good things into my life',
  'I am a leader in the making',
  'I choose peace over perfection',
  'I trust the journey I am on',
];

const CRISIS_RESOURCES = [
  { name: 'Crisis Text Line', detail: 'Text HOME to 741741', icon: '💬', color: '#ec4899', action: 'sms:741741&body=HOME', type: 'text' },
  { name: '988 Suicide & Crisis Lifeline', detail: 'Call or text 988', icon: '📞', color: '#a855f7', action: 'tel:988', type: 'phone' },
  { name: 'Teen Line', detail: '1-800-852-8336 (6–10 PM PT)', icon: '🌸', color: '#f97316', action: 'tel:18008528336', type: 'phone' },
  { name: 'Girls Inc Helpline', detail: '1-800-374-4475', icon: '👑', color: '#eab308', action: 'tel:18003744475', type: 'phone' },
  { name: 'National DV Hotline', detail: '1-800-799-7233', icon: '🛡️', color: '#06b6d4', action: 'tel:18007997233', type: 'phone' },
  { name: 'RAINN Sexual Assault Hotline', detail: '1-800-656-4673', icon: '💜', color: '#8b5cf6', action: 'tel:18006564673', type: 'phone' },
];

// ── Breathing Session Component ──
function BreathingSession({ exercise, onClose }) {
  const [round, setRound] = useState(1);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [count, setCount] = useState(exercise.phases[0].secs);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (done) return;
    timerRef.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          // advance phase
          setPhaseIdx(pi => {
            const nextPi = pi + 1;
            if (nextPi >= exercise.phases.length) {
              // next round
              setRound(r => {
                if (r >= exercise.rounds) {
                  clearInterval(timerRef.current);
                  setDone(true);
                  return r;
                }
                return r + 1;
              });
              setTimeout(() => setCount(exercise.phases[0].secs), 0);
              return 0;
            }
            setTimeout(() => setCount(exercise.phases[nextPi].secs), 0);
            return nextPi;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [done]);

  const reset = () => {
    clearInterval(timerRef.current);
    setRound(1); setPhaseIdx(0); setCount(exercise.phases[0].secs); setDone(false);
  };

  const phase = exercise.phases[phaseIdx] || exercise.phases[0];
  const isInhale = phase.label === 'Inhale';
  const isExhale = phase.label === 'Exhale';

  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-bold text-white text-base">{exercise.emoji} {exercise.title}</p>
          <p className="text-xs text-gray-400">{exercise.subtitle}</p>
        </div>
        <button onClick={reset} className="text-gray-500 hover:text-white"><RotateCcw size={18} /></button>
      </div>

      {done ? (
        <div className="text-center py-8">
          <p className="text-5xl mb-3">✨</p>
          <p className="text-xl font-bold text-white mb-1">Well done!</p>
          <p className="text-gray-400 text-sm mb-4">You just gave your nervous system a gift.</p>
          <button onClick={reset} className="px-6 py-2.5 rounded-full font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>Do Again</button>
        </div>
      ) : (
        <>
          <p className="text-center text-xs text-gray-500 mb-4">Round {round} of {exercise.rounds}</p>
          <div className="flex items-center justify-center mb-4">
            <div className="relative flex items-center justify-center"
              style={{
                width: 180, height: 180,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(236,72,153,0.5) 0%, rgba(168,85,247,0.2) 60%, transparent 80%)',
                transition: 'transform 0.5s ease',
                transform: isInhale ? 'scale(1.12)' : isExhale ? 'scale(0.92)' : 'scale(1)',
              }}>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{phase.label}</p>
                <p className="text-5xl font-bold text-white">{count}</p>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-400">{phase.cue}</p>
        </>
      )}
    </div>
  );
}

export default function CalmCorner() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('breathe');
  const [showCrisis, setShowCrisis] = useState(false);
  const totalPoints = useGlowPoints(user?.email);
  const [activeExercise, setActiveExercise] = useState(null);

  // Affirm state
  const [affirmations, setAffirmations] = useState([]);
  const [newAffirm, setNewAffirm] = useState('');

  // Gratitude state
  const [gratitudeEntries, setGratitudeEntries] = useState([]);
  const [g1, setG1] = useState('');
  const [g2, setG2] = useState('');
  const [g3, setG3] = useState('');
  const [showGratLib, setShowGratLib] = useState(false);
  const [savingGrat, setSavingGrat] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const [affirms, grats] = await Promise.all([
        base44.entities.Affirmation.filter({ user_email: u.email }),
        base44.entities.GratitudeEntry.filter({ user_email: u.email }),
      ]);
      setAffirmations(affirms);
      setGratitudeEntries(grats.sort((a, b) => (b.entry_date || '').localeCompare(a.entry_date || '')));
      const todayEntry = grats.find(g => g.entry_date === TODAY);
      if (todayEntry) { setG1(todayEntry.item1 || ''); setG2(todayEntry.item2 || ''); setG3(todayEntry.item3 || ''); }
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const addAffirmation = async (text) => {
    if (!text.trim()) return;
    const a = await base44.entities.Affirmation.create({ user_email: user.email, text: text.trim() });
    setAffirmations(prev => [a, ...prev]);
    setNewAffirm('');
    toast.success('Affirmation saved! ✨');
  };

  const saveGratitude = async () => {
    if (!g1.trim() && !g2.trim() && !g3.trim()) return;
    setSavingGrat(true);
    const existing = gratitudeEntries.find(g => g.entry_date === TODAY);
    const data = { user_email: user.email, entry_date: TODAY, item1: g1.trim(), item2: g2.trim(), item3: g3.trim() };
    if (existing) {
      await base44.entities.GratitudeEntry.update(existing.id, data);
      setGratitudeEntries(prev => prev.map(g => g.entry_date === TODAY ? { ...g, ...data } : g));
    } else {
      const entry = await base44.entities.GratitudeEntry.create(data);
      setGratitudeEntries(prev => [entry, ...prev]);
    }
    setSavingGrat(false);
    toast.success('Gratitude saved! 🙏');
  };

  const streak = (() => {
    let s = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const ds = d.toISOString().slice(0, 10);
      if (gratitudeEntries.some(g => g.entry_date === ds)) { s++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return s;
  })();

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0010' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative overflow-x-hidden" style={{ backgroundColor: '#0d0010' }}>
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='rgba(180,50,120,0.1)'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />
      <AppBackground />

      <div className="relative z-10 px-4 pt-4">
        {/* Points */}
        <div className="flex justify-end mb-2">
          <div className="rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1"
            style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
            <span>🏅</span><span className="text-yellow-400">{totalPoints !== null ? totalPoints.toLocaleString() : '...'} pts</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={22} /></button>
          <div>
            <h1 className="text-2xl font-bold text-white">Calm Corner 🌸</h1>
            <p className="text-xs text-gray-400">Your peaceful space to breathe, affirm, and grow</p>
          </div>
        </div>

        {/* Crisis button */}
        <button onClick={() => setShowCrisis(true)}
          className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 mb-4 text-sm"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
          <AlertTriangle size={16} /> I Need Help Right Now
        </button>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-4 rounded-2xl p-1.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { id: 'breathe', label: 'Breathe', emoji: '🌬️' },
            { id: 'affirm', label: 'Affirm', emoji: '✨' },
            { id: 'gratitude', label: 'Gratitude', emoji: '🙏' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 rounded-xl text-sm font-semibold flex flex-col items-center gap-0.5 transition ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`}
              style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' } : {}}>
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* BREATHE TAB */}
        {activeTab === 'breathe' && (
          <div>
            {activeExercise ? (
              <>
                <BreathingSession exercise={activeExercise} onClose={() => setActiveExercise(null)} />
                <button onClick={() => setActiveExercise(null)} className="w-full py-3 text-sm text-gray-400 text-center">
                  ← Back to exercises
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-300 mb-4">Choose a breathing exercise to calm your mind and body in just 2 minutes.</p>
                <div className="space-y-3">
                  {BREATHING_EXERCISES.map(ex => (
                    <button key={ex.id} onClick={() => setActiveExercise(ex)}
                      className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-left transition hover:bg-white/5"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <span className="text-2xl flex-shrink-0">{ex.emoji}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm">{ex.title}</p>
                        <p className="text-xs text-gray-400">{ex.subtitle}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{ex.detail}</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-600 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* AFFIRM TAB */}
        {activeTab === 'affirm' && (
          <div>
            <div className="flex gap-2 mb-4">
              <input value={newAffirm} onChange={e => setNewAffirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addAffirmation(newAffirm)}
                placeholder="Write your own affirmation..."
                className="flex-1 rounded-2xl px-4 py-3 text-sm text-white outline-none placeholder-gray-500"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <button onClick={() => addAffirmation(newAffirm)}
                className="w-11 h-11 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
                <Plus size={20} />
              </button>
            </div>

            {affirmations.length > 0 && (
              <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">MY AFFIRMATIONS</p>
                <div className="space-y-2">
                  {affirmations.map(a => (
                    <div key={a.id} className="text-sm text-white py-2 border-b border-white/5 last:border-0">
                      ✨ {a.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 mb-3">Quick add a starter affirmation:</p>
            <div className="flex flex-wrap gap-2">
              {STARTER_AFFIRMATIONS.map((a, i) => {
                const saved = affirmations.some(af => af.text === a);
                return (
                  <button key={i} onClick={() => !saved && addAffirmation(a)}
                    className={`text-xs px-3 py-2 rounded-full transition ${saved ? 'text-pink-300 cursor-default' : 'text-gray-300 hover:bg-pink-500/20'}`}
                    style={saved
                      ? { background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.35)' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {saved ? '✓ ' : '+ '}{a.length > 32 ? a.slice(0, 32) + '...' : a}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* GRATITUDE TAB */}
        {activeTab === 'gratitude' && (
          <div>
            {/* Streak */}
            <div className="rounded-2xl px-4 py-3 mb-4 flex items-center gap-3"
              style={{ background: streak > 0 ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${streak > 0 ? 'rgba(234,179,8,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
              <span className="text-2xl">{streak > 0 ? '🔥' : '🔥'}</span>
              <div>
                <p className="font-bold text-white">{streak} Day Streak</p>
                <p className="text-xs text-gray-400">{streak > 0 ? 'Keep going — you\'re building a habit!' : 'Start your gratitude journey today'}</p>
              </div>
            </div>

            <p className="font-bold text-white mb-3">Today I'm grateful for...</p>
            <div className="space-y-2 mb-4">
              {[
                { num: 1, val: g1, set: setG1, placeholder: 'Something that made you smile...' },
                { num: 2, val: g2, set: setG2, placeholder: 'Someone you appreciate...' },
                { num: 3, val: g3, set: setG3, placeholder: 'A blessing you noticed...' },
              ].map(item => (
                <div key={item.num} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                    {item.num}
                  </div>
                  <input value={item.val} onChange={e => item.set(e.target.value)}
                    placeholder={item.placeholder}
                    className="flex-1 rounded-2xl px-4 py-3 text-sm text-white outline-none placeholder-gray-600"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
              ))}
            </div>

            <button onClick={saveGratitude} disabled={savingGrat || (!g1.trim() && !g2.trim() && !g3.trim())}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-sm mb-4 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
              {savingGrat ? 'Saving...' : 'Save Today\'s Gratitude 🙏'}
            </button>

            <button onClick={() => setShowGratLib(v => !v)}
              className="flex items-center gap-2 text-sm text-pink-400 mb-4">
              <ChevronRight size={16} className={`transition-transform ${showGratLib ? 'rotate-90' : ''}`} />
              View Gratitude Library ({gratitudeEntries.length} entries)
            </button>

            {showGratLib && gratitudeEntries.length > 0 && (
              <div className="space-y-3">
                {gratitudeEntries.map(g => (
                  <div key={g.id} className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-xs text-gray-500 mb-2">{g.entry_date}</p>
                    {[g.item1, g.item2, g.item3].filter(Boolean).map((item, i) => (
                      <p key={i} className="text-sm text-gray-200 flex items-start gap-1.5 mb-1">
                        <span className="text-pink-400 flex-shrink-0">{i + 1}.</span> {item}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Audio Library Banner */}
        <button onClick={() => navigate('/audio-library')}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl mt-5 text-left"
          style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.6), rgba(168,85,247,0.4))', border: '1px solid rgba(168,85,247,0.4)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
            <span className="text-lg">🎧</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-white text-sm">Audio Library 🎧</p>
            <p className="text-xs text-gray-300">Affirmations, meditations &amp; big sis talks</p>
          </div>
          <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
        </button>
      </div>

      {/* Crisis Overlay */}
      {showCrisis && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: '#0d0010' }}>
          <div className="px-4 pt-4 pb-24">
            <div className="flex justify-end mb-4">
              <div className="rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1"
                style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                <span>🏅</span><span className="text-yellow-400">{totalPoints !== null ? totalPoints.toLocaleString() : '...'} pts</span>
                </div>
                </div>
                <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-pink-400" />
                <h2 className="text-xl font-bold text-white">You Are Not Alone</h2>
              </div>
              <button onClick={() => setShowCrisis(false)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-300 mb-5">Tap any resource below to connect immediately. Help is always available. 💝</p>

            <div className="space-y-3 mb-6">
              {CRISIS_RESOURCES.map((r, i) => (
                <a key={i} href={r.action}
                  className="flex items-center gap-3 px-4 py-4 rounded-2xl block"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ background: r.color + '25', border: `1px solid ${r.color}50` }}>
                    {r.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.detail}</p>
                  </div>
                  {r.type === 'text'
                    ? <MessageCircle size={18} style={{ color: r.color }} className="flex-shrink-0" />
                    : <Phone size={18} style={{ color: r.color }} className="flex-shrink-0" />
                  }
                </a>
              ))}
            </div>

            <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="font-semibold text-white mb-1">"You are stronger than you think."</p>
              <p className="text-xs text-gray-400">Reaching out is the bravest thing you can do. 💝</p>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}