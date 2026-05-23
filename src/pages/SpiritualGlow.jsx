import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Trash2, Plus, Edit3, Check, X, Heart } from 'lucide-react';
import { toast } from 'sonner';

const TODAY = new Date().toISOString().slice(0, 10);

const FAITH_PATHS = [
  {
    id: 'christianity', label: 'Christianity', emoji: '✝️',
    desc: 'Faith rooted in Christ, the Bible, and prayer',
    verse: '"For we are God\'s handiwork, created in Christ Jesus to do good works."',
    ref: '— Ephesians 2:10',
  },
  {
    id: 'islam', label: 'Islam', emoji: '☪️',
    desc: 'Faith rooted in the Quran, prayer, and peace',
    verse: '"And He found you lost and guided you."',
    ref: '— Quran 93:7',
  },
  {
    id: 'spiritual', label: 'Spiritual / Non-denominational', emoji: '⭐',
    desc: 'Connected to something greater — my own way',
    verse: '"You are a spiritual being having a human experience."',
    ref: '— Pierre Teilhard de Chardin',
  },
  {
    id: 'exploring', label: 'Still Exploring', emoji: '🔍',
    desc: 'I\'m on a journey and figuring it out',
    verse: '"The journey of a thousand miles begins with a single step."',
    ref: '— Lao Tzu',
  },
  {
    id: 'private', label: 'Prefer Private', emoji: '🤍',
    desc: 'This is personal — I keep it between me and God',
    verse: '"Be still and know."',
    ref: '— Psalm 46:10',
  },
  {
    id: 'other', label: 'Other', emoji: '🌸',
    desc: 'My faith path is unique to me',
    verse: '"In every walk with nature, one receives far more than they seek."',
    ref: '— John Muir',
  },
];

const SUGGESTED_GOALS = [
  { emoji: '🙏', text: 'Pray daily' },
  { emoji: '☀️', text: 'Practice gratitude every morning' },
  { emoji: '📓', text: 'Journal my thoughts and feelings' },
  { emoji: '🛡️', text: 'Protect my peace' },
  { emoji: '🌊', text: 'Control my anger' },
  { emoji: '💪', text: 'Respond better under pressure' },
  { emoji: '💛', text: 'Forgive people faster' },
  { emoji: '🌺', text: 'Spend less time comparing myself to others' },
  { emoji: '🚫', text: 'Stay grounded on social media' },
  { emoji: '🏛️', text: 'Attend church / mosque / worship' },
  { emoji: '📖', text: 'Read a devotional or scripture' },
  { emoji: '🧘', text: 'Meditate for 5 minutes daily' },
  { emoji: '👑', text: 'Choose healthy, uplifting friendships' },
  { emoji: '✋', text: 'Say no to things that don\'t align with my values' },
];

const REFLECTION_PROMPTS = [
  'What gives me peace when life feels overwhelming?',
  'What kind of person do I want to become?',
  'What helps me stay grounded when things get hard?',
  'How do I want to respond when life gets difficult?',
  'What values matter most to me?',
  'What does faith or spirituality mean to me personally?',
  'Who or what do I turn to when I need strength?',
  'What am I grateful for right now, in this moment?',
  'What would I tell my younger self about staying true to herself?',
  'How do I want to treat people — even when they\'re difficult?',
  'What boundaries do I need to protect my peace?',
  'What does inner peace look and feel like for me?',
];

const SUGGESTED_HABITS = [
  { emoji: '🌅', label: 'Morning prayer or intention' },
  { emoji: '🌙', label: 'Evening reflection' },
  { emoji: '🙏', label: 'Gratitude practice' },
  { emoji: '📓', label: 'Journaling' },
  { emoji: '🧘', label: 'Meditation' },
  { emoji: '📖', label: 'Scripture or devotional reading' },
  { emoji: '🌬️', label: 'Breath work or stillness' },
  { emoji: '💛', label: 'Acts of kindness' },
  { emoji: '📵', label: 'Digital detox time' },
  { emoji: '🚶', label: 'Mindful walk in nature' },
];

const BOUNDARIES = [
  { emoji: '🛡️', text: 'I protect my peace — I choose who and what I let into my space' },
  { emoji: '✋', text: 'I say no to pressure that goes against my values' },
  { emoji: '⭐', text: 'I stay true to myself, even when it\'s hard' },
  { emoji: '👑', text: 'I choose friendships that lift me up, not tear me down' },
  { emoji: '🚫', text: 'I don\'t let social media define my worth or my path' },
  { emoji: '💛', text: 'I choose healthy relationships — romantic and otherwise' },
  { emoji: '🕊️', text: 'I forgive — not for them, but for my own peace' },
  { emoji: '🚶‍♀️', text: 'I am allowed to walk away from what doesn\'t serve me' },
  { emoji: '🌸', text: 'My body, my mind, and my spirit are sacred' },
  { emoji: '🌊', text: 'I respond with grace, even when I\'m tested' },
];

const SUGGESTED_PRAYERS = [
  { emoji: '🙏', text: 'Grant me peace in moments of chaos' },
  { emoji: '💛', text: 'Help me forgive those who have hurt me' },
  { emoji: '🛡️', text: 'Protect my loved ones from harm' },
  { emoji: '✨', text: 'Guide me toward my highest purpose' },
  { emoji: '🌸', text: 'Let me be a source of kindness today' },
  { emoji: '💪', text: 'Give me strength to overcome my challenges' },
  { emoji: '🕊️', text: 'Fill my heart with gratitude and joy' },
  { emoji: '🌟', text: 'Help me shine my light in the world' },
  { emoji: '🤍', text: 'Bless those who are suffering' },
  { emoji: '🌅', text: 'Let each day bring me closer to my dreams' },
];

const TABS = ['My Path', 'My Plan', 'Reflect', 'Habits', 'Boundaries', 'Prayer List'];

export default function SpiritualGlow() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('My Path');
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [habits, setHabits] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // My Plan state
  const [newGoal, setNewGoal] = useState('');

  // Reflect state
  const [activePrompt, setActivePrompt] = useState(null);
  const [reflectText, setReflectText] = useState('');
  const [editingReflection, setEditingReflection] = useState(null);

  // Habits state
  const [newHabit, setNewHabit] = useState('');

  // Prayer List state
  const [newPrayer, setNewPrayer] = useState('');

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const [profiles, goalList, reflList, habitList, prayerList] = await Promise.all([
        base44.entities.SpiritualProfile.filter({ user_email: u.email }),
        base44.entities.SpiritualGoal.filter({ user_email: u.email }),
        base44.entities.SpiritualReflection.filter({ user_email: u.email }),
        base44.entities.SpiritualHabit.filter({ user_email: u.email }),
        base44.entities.SavedQuote.filter({ user_email: u.email, quote_type: 'prayer' }),
      ]);
      setProfile(profiles[0] || null);
      setGoals(goalList);
      setReflections(reflList.sort((a, b) => (b.reflection_date || '').localeCompare(a.reflection_date || '')));
      setHabits(habitList);
      setPrayers(prayerList.sort((a, b) => (b.created_date || '').localeCompare(a.created_date || '')));
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  // ── MY PATH ──
  const selectPath = async (pathId) => {
    if (profile) {
      await base44.entities.SpiritualProfile.update(profile.id, { faith_path: pathId });
      setProfile(p => ({ ...p, faith_path: pathId }));
    } else {
      const p = await base44.entities.SpiritualProfile.create({ user_email: user.email, faith_path: pathId });
      setProfile(p);
    }
    const path = FAITH_PATHS.find(p => p.id === pathId);
    toast.success(`${path.emoji} Path updated!`);
  };

  // ── MY PLAN ──
  const addGoal = async (text) => {
    if (!text.trim()) return;
    const g = await base44.entities.SpiritualGoal.create({ user_email: user.email, goal_text: text.trim() });
    setGoals(prev => [...prev, g]);
    setNewGoal('');
    toast.success('Goal added to your plan! ⭐');
  };

  const deleteGoal = async (g) => {
    await base44.entities.SpiritualGoal.delete(g.id);
    setGoals(prev => prev.filter(x => x.id !== g.id));
  };

  // ── REFLECT ──
  const saveReflection = async () => {
    if (!reflectText.trim()) return;
    if (editingReflection) {
      await base44.entities.SpiritualReflection.update(editingReflection.id, { content: reflectText.trim() });
      setReflections(prev => prev.map(r => r.id === editingReflection.id ? { ...r, content: reflectText.trim() } : r));
      setEditingReflection(null);
    } else {
      const r = await base44.entities.SpiritualReflection.create({
        user_email: user.email, prompt: activePrompt, content: reflectText.trim(), reflection_date: TODAY,
      });
      setReflections(prev => [r, ...prev]);
    }
    setReflectText('');
    setActivePrompt(null);
    toast.success('Reflection saved 🌸');
  };

  const deleteReflection = async (r) => {
    await base44.entities.SpiritualReflection.delete(r.id);
    setReflections(prev => prev.filter(x => x.id !== r.id));
  };

  // ── HABITS ──
  const addHabit = async (label, emoji = '✨') => {
    if (!label.trim()) return;
    const h = await base44.entities.SpiritualHabit.create({ user_email: user.email, label: label.trim(), emoji, checked_date: '' });
    setHabits(prev => [...prev, h]);
    setNewHabit('');
  };

  const toggleHabit = async (habit) => {
    const newDate = habit.checked_date === TODAY ? '' : TODAY;
    await base44.entities.SpiritualHabit.update(habit.id, { checked_date: newDate });
    setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, checked_date: newDate } : h));
  };

  const deleteHabit = async (habit) => {
    await base44.entities.SpiritualHabit.delete(habit.id);
    setHabits(prev => prev.filter(h => h.id !== habit.id));
  };

  // ── PRAYER LIST ──
  const addPrayer = async (text) => {
    if (!text.trim()) return;
    const p = await base44.entities.SavedQuote.create({ user_email: user.email, quote_text: text.trim(), quote_type: 'prayer' });
    setPrayers(prev => [p, ...prev]);
    setNewPrayer('');
    toast.success('Prayer added 🙏');
  };

  const deletePrayer = async (p) => {
    await base44.entities.SavedQuote.delete(p.id);
    setPrayers(prev => prev.filter(x => x.id !== p.id));
  };

  const selectedPath = FAITH_PATHS.find(p => p.id === profile?.faith_path);
  const checkedToday = habits.filter(h => h.checked_date === TODAY).length;
  const suggestedGoalsFiltered = SUGGESTED_GOALS.filter(sg => !goals.some(g => g.goal_text === sg.text));
  const suggestedHabitsFiltered = SUGGESTED_HABITS.filter(sh => !habits.some(h => h.label === sh.label));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0010' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative overflow-x-hidden" style={{ backgroundColor: '#0d0010' }}>
      {/* Heart pattern bg */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-8"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='rgba(180,50,120,0.12)'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 px-4 pt-4">
        {/* Points */}
        <div className="flex justify-end mb-2">
          <div className="rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1"
            style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
            <span>🏅</span><span className="text-yellow-400">15 pts</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <button onClick={() => navigate(-1)} className="text-gray-400 flex-shrink-0"><ChevronLeft size={22} /></button>
          <div>
            <h1 className="text-xl font-bold text-white">✨ My Spiritual Glow</h1>
            <p className="text-xs text-gray-400">Grounded. Peaceful. Empowered.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 py-3 scrollbar-none mb-4">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-gray-400'
              }`}
              style={activeTab === tab ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' } : { background: 'rgba(255,255,2555,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── MY PATH ── */}
        {activeTab === 'My Path' && (
          <div>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              What helps you feel spiritually grounded? There's no wrong answer — this is your journey. 🌸
            </p>

            {selectedPath && (
              <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.25)' }}>
                <p className="text-xs font-bold tracking-widest text-pink-400 mb-2">📖 VERSE OF THE WEEK</p>
                <p className="text-sm text-white italic leading-relaxed mb-1">{selectedPath.verse}</p>
                <p className="text-xs text-gray-400">{selectedPath.ref}</p>
              </div>
            )}

            <div className="space-y-2">
              {FAITH_PATHS.map(path => {
                const isSelected = profile?.faith_path === path.id;
                return (
                  <button key={path.id} onClick={() => selectPath(path.id)}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-left transition"
                    style={{
                      background: isSelected ? 'rgba(236,72,153,0.08)' : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${isSelected ? '#ec4899' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                    <span className="text-2xl flex-shrink-0">{path.emoji}</span>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-200'}`}>{path.label}</p>
                      <p className="text-xs text-gray-400">{path.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
                        <Check size={13} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MY PLAN ── */}
        {activeTab === 'My Plan' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Create a Spiritual Plan for the Year Ahead ✨</h2>
            <p className="text-sm text-gray-400 mb-4">Choose goals that feel meaningful to you. You can add your own too.</p>

            {goals.length > 0 && (
              <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-sm font-bold text-white mb-3">My Spiritual Plan ({goals.length} goal{goals.length !== 1 ? 's' : ''})</p>
                <div className="space-y-2">
                  {goals.map(g => (
                    <div key={g.id} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
                      <Check size={14} className="text-pink-400 flex-shrink-0" />
                      <span className="flex-1 text-sm text-white">{g.goal_text}</span>
                      <button onClick={() => deleteGoal(g)} className="text-gray-600 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom goal input */}
            <div className="flex gap-2 mb-5">
              <input value={newGoal} onChange={e => setNewGoal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addGoal(newGoal)}
                placeholder="Write your own spiritual goal..."
                className="flex-1 rounded-2xl px-4 py-3 text-sm text-white outline-none placeholder-gray-500"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <button onClick={() => addGoal(newGoal)}
                className="w-11 h-11 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Plus size={20} />
              </button>
            </div>

            <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">SUGGESTED GOALS — TAP TO ADD</p>
            <div className="space-y-2">
              {suggestedGoalsFiltered.map((sg, i) => (
                <button key={i} onClick={() => addGoal(sg.text)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-xl flex-shrink-0">{sg.emoji}</span>
                  <span className="flex-1 text-sm text-gray-200">{sg.text}</span>
                  <Plus size={16} className="text-gray-500 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── REFLECT ── */}
        {activeTab === 'Reflect' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Reflection Space 🌸</h2>
            <p className="text-sm text-gray-400 mb-4">Take a moment to go inward. Choose a prompt and write freely — this is your private space.</p>

            {/* Active prompt input */}
            {activePrompt && (
              <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-sm font-semibold text-white italic mb-3">"{activePrompt}"</p>
                <textarea value={reflectText} onChange={e => setReflectText(e.target.value)}
                  placeholder="Write freely... there's no right or wrong answer."
                  rows={4}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder-gray-500 resize-none"
                />
                <div className="flex gap-2 mt-3">
                  <button onClick={saveReflection}
                    className="flex-1 py-3 rounded-2xl font-bold text-white text-sm"
                    style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                    Save Reflection
                  </button>
                  <button onClick={() => { setActivePrompt(null); setReflectText(''); setEditingReflection(null); }}
                    className="px-5 py-3 rounded-2xl text-sm text-gray-300 font-semibold"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {reflections.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">MY REFLECTIONS</p>
                <div className="space-y-3">
                  {reflections.map(r => (
                    <div key={r.id} className="rounded-2xl p-4"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p className="text-xs text-gray-400 italic mb-1">"{r.prompt}"</p>
                      <p className="text-sm text-white mb-2">{r.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{r.reflection_date}</span>
                        <div className="flex gap-3">
                          <button onClick={() => { setEditingReflection(r); setActivePrompt(r.prompt); setReflectText(r.content); }}
                            className="text-xs text-gray-400 hover:text-white">Edit</button>
                          <button onClick={() => deleteReflection(r)} className="text-gray-600 hover:text-red-400">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">REFLECTION PROMPTS — TAP TO RESPOND</p>
            <div className="space-y-2">
              {REFLECTION_PROMPTS.map((prompt, i) => (
                <button key={i} onClick={() => { setActivePrompt(prompt); setReflectText(''); setEditingReflection(null); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-pink-400 flex-shrink-0">✏️</span>
                  <span className="text-sm text-gray-200">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── HABITS ── */}
        {activeTab === 'Habits' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Set Your Personal Spiritual Habits 🌅</h2>
            <p className="text-sm text-gray-400 mb-4">Small daily practices create a strong inner foundation. Check off what you did today.</p>

            {habits.length > 0 && (
              <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex justify-between items-center mb-3">
                  <p className="font-bold text-white">Today's Habits</p>
                  <span className="text-xs text-gray-400">{checkedToday} / {habits.length} done</span>
                </div>
                <div className="space-y-2">
                  {habits.map(h => {
                    const done = h.checked_date === TODAY;
                    return (
                      <div key={h.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                        <button onClick={() => toggleHabit(h)}
                          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${done ? 'bg-pink-500 border-pink-500' : 'border-gray-500'}`}>
                          {done && <Check size={12} />}
                        </button>
                        <span className="flex-shrink-0">{h.emoji}</span>
                        <span className={`flex-1 text-sm ${done ? 'line-through text-gray-500' : 'text-white'}`}>{h.label}</span>
                        <button onClick={() => deleteHabit(h)} className="text-gray-600 hover:text-red-400 flex-shrink-0">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add custom habit */}
            <div className="flex gap-2 mb-5">
              <input value={newHabit} onChange={e => setNewHabit(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addHabit(newHabit, '✨')}
                placeholder="Add your own habit..."
                className="flex-1 rounded-2xl px-4 py-3 text-sm text-white outline-none placeholder-gray-500"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <button onClick={() => addHabit(newHabit, '✨')}
                className="w-11 h-11 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Plus size={20} />
              </button>
            </div>

            <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">SUGGESTED HABITS — TAP TO ADD</p>
            <div className="space-y-2">
              {suggestedHabitsFiltered.map((sh, i) => (
                <button key={i} onClick={() => addHabit(sh.label, sh.emoji)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-xl flex-shrink-0">{sh.emoji}</span>
                  <span className="flex-1 text-sm text-gray-200">{sh.label}</span>
                  <Plus size={16} className="text-gray-500 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── BOUNDARIES ── */}
        {activeTab === 'Boundaries' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Spiritual Boundaries 🛡️</h2>
            <p className="text-sm text-gray-400 mb-4">Protecting your peace is a spiritual practice. These are your commitments to yourself.</p>

            <div className="space-y-2 mb-6">
              {BOUNDARIES.map((b, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-4 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-xl flex-shrink-0 mt-0.5">{b.emoji}</span>
                  <p className="text-sm text-gray-200 leading-relaxed">{b.text}</p>
                </div>
              ))}
            </div>

            {/* Reflect prompt CTA */}
            <div className="rounded-2xl p-5 text-center mb-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="text-3xl block mb-2">🌙</span>
              <h3 className="font-bold text-white mb-1">How do I want to respond under pressure?</h3>
              <p className="text-xs text-gray-400 mb-4">Use the Reflect tab to journal your answer. Your boundaries start with knowing yourself.</p>
              <button onClick={() => setActiveTab('Reflect')}
                className="px-6 py-2.5 rounded-full font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                Go to Reflect ✨
              </button>
            </div>

            {/* When tested tips */}
            <div className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-bold tracking-widest text-pink-400 mb-3">🎵 WHEN YOU FEEL TESTED</p>
              {[
                'Take 3 slow, deep breaths before responding',
                "Ask yourself: 'Is this worth my peace?'",
                'Reach out to someone you trust',
                "Remove yourself from the situation — it's okay to walk away",
                'Return to your spiritual habits to re-center',
              ].map((tip, i) => (
                <p key={i} className="text-sm text-gray-300 mb-1.5 flex items-start gap-2">
                  <span className="text-pink-500 mt-0.5 flex-shrink-0">•</span> {tip}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ── PRAYER LIST ── */}
        {activeTab === 'Prayer List' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-1">My Prayer List 🙏</h2>
            <p className="text-sm text-gray-400 mb-4">A sacred space for your prayers, intentions, and gratitude. Add prayers for yourself, loved ones, or anything on your heart.</p>

            {prayers.length > 0 && (
              <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex justify-between items-center mb-3">
                  <p className="font-bold text-white">My Prayers ({prayers.length})</p>
                  <Heart size={16} className="text-pink-400" />
                </div>
                <div className="space-y-2">
                  {prayers.map(p => (
                    <div key={p.id} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                      <Heart size={14} className="text-pink-400 flex-shrink-0 mt-0.5" />
                      <p className="flex-1 text-sm text-white">{p.quote_text}</p>
                      <button onClick={() => deletePrayer(p)} className="text-gray-600 hover:text-red-400 flex-shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add prayer input */}
            <div className="flex gap-2 mb-5">
              <input value={newPrayer} onChange={e => setNewPrayer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPrayer(newPrayer)}
                placeholder="Add a prayer or intention..."
                className="flex-1 rounded-2xl px-4 py-3 text-sm text-white outline-none placeholder-gray-500"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <button onClick={() => addPrayer(newPrayer)}
                className="w-11 h-11 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Plus size={20} />
              </button>
            </div>

            <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">SUGGESTED PRAYERS — TAP TO ADD</p>
            <div className="space-y-2">
              {SUGGESTED_PRAYERS.map((prayer, i) => (
                <button key={i} onClick={() => addPrayer(prayer.text)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="text-xl flex-shrink-0">{prayer.emoji}</span>
                  <span className="flex-1 text-sm text-gray-200">{prayer.text}</span>
                  <Plus size={16} className="text-gray-500 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav active="discover" />
    </div>
  );
}