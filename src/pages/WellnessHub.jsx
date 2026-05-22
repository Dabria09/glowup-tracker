import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'physical',
    emoji: '💪',
    title: 'Physical Wellness',
    subtitle: 'Move your body, feel amazing',
    accent: '#ec4899',
    bg: 'rgba(236,72,153,0.15)',
    border: 'rgba(236,72,153,0.3)',
    goal: 'Move your body for at least 20 minutes every day this week',
    tips: [
      'Do 10 jumping jacks every morning to wake up your body',
      'Take a 10-minute walk outside — fresh air is medicine',
      'Stretch for 5 minutes before bed to release tension',
      'Dance to your favorite song — it counts as cardio!',
      'Take the stairs instead of the elevator when you can',
      'Do 3 sets of 10 squats while watching TV',
      'Try a 7-minute workout on YouTube — free and effective',
      'Drink water before every meal to stay hydrated',
    ],
    challenges: [
      'Do a 10-minute morning stretch every day',
      'Walk 5,000 steps daily',
      'Try one new physical activity this week',
    ],
  },
  {
    id: 'mental',
    emoji: '🧠',
    title: 'Mental Wellness',
    subtitle: 'Protect your peace, grow your mind',
    accent: '#a855f7',
    bg: 'rgba(168,85,247,0.15)',
    border: 'rgba(168,85,247,0.3)',
    goal: 'Journal for 5 minutes every day and limit social media to 30 min',
    tips: [
      'Write 3 things you\'re grateful for every morning',
      'Put your phone down 1 hour before bed',
      'Say no to one thing that drains your energy this week',
      'Journal for 5 minutes about how you\'re really feeling',
      'Limit social media to 30 minutes a day',
      'Talk to someone you trust when you\'re overwhelmed',
      'Practice the 5-4-3-2-1 grounding technique when anxious',
      'Celebrate small wins — they add up to big ones',
    ],
    challenges: [
      'No phone for the first 30 minutes after waking up',
      'Write one positive affirmation daily',
      'Do a 5-minute breathing exercise each evening',
    ],
  },
  {
    id: 'nutrition',
    emoji: '🥗',
    title: 'Nutrition',
    subtitle: 'Fuel your glow from the inside out',
    accent: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.3)',
    goal: 'Drink 8 glasses of water daily and eat at least 1 fruit or veggie per meal',
    tips: [
      'Drink 8 glasses of water every day — your skin will thank you',
      'Add one fruit or vegetable to every meal',
      'Eat breakfast — it powers your brain for school',
      'Swap soda for sparkling water with lemon',
      'Meal prep on Sundays to avoid fast food during the week',
      'Read nutrition labels — know what you\'re putting in your body',
      'Eat slowly and without your phone to actually enjoy your food',
      'Snack on almonds, fruit, or yogurt instead of chips',
    ],
    challenges: [
      'Drink a glass of water first thing every morning',
      'Add a vegetable to every dinner this week',
      'Skip sugary drinks for 7 days',
    ],
  },
  {
    id: 'sleep',
    emoji: '😴',
    title: 'Sleep',
    subtitle: 'Rest is how dreamers recharge',
    accent: '#6366f1',
    bg: 'rgba(99,102,241,0.15)',
    border: 'rgba(99,102,241,0.3)',
    goal: 'Get 8+ hours of sleep every night and put your phone away 30 min before bed',
    tips: [
      'Aim for 8-9 hours of sleep every night as a teen',
      'Set a consistent bedtime — even on weekends',
      'No screens 30 minutes before bed — use that time to wind down',
      'Keep your room cool and dark for better sleep quality',
      'Write tomorrow\'s to-do list before bed to quiet your mind',
      'Try reading for 10 minutes instead of scrolling',
      'Avoid caffeine after 2pm',
      'A consistent morning alarm helps regulate your sleep cycle',
    ],
    challenges: [
      'Set a bedtime alarm for the same time every night',
      'No phone in bed for 7 days',
      'Write a brain dump before bed to clear your mind',
    ],
  },
  {
    id: 'skincare',
    emoji: '✨',
    title: 'Skincare',
    subtitle: 'Glow from the outside in',
    accent: '#eab308',
    bg: 'rgba(234,179,8,0.12)',
    border: 'rgba(234,179,8,0.3)',
    goal: 'Cleanse and moisturize morning and night every day this week',
    tips: [
      'Cleanse your face morning and night — consistency is key',
      'Always wear SPF 30+ sunscreen, even on cloudy days',
      'Moisturize after every wash — hydration = glow',
      'Never sleep in makeup — it clogs pores and causes breakouts',
      'Change your pillowcase every week to reduce bacteria',
      'Drink water — it\'s the best skincare product that exists',
      'Don\'t pick at your skin — it causes scarring',
      'Find your skin type (oily, dry, combination) before buying products',
    ],
    challenges: [
      'Build a consistent 2-step routine: cleanse + moisturize',
      'Drink 8 glasses of water daily for skin hydration',
      'Change your pillowcase this week',
    ],
  },
];

const SPECIAL = [
  { id: 'calm', emoji: '🌸', title: 'Calm Corner', subtitle: 'Breathing, affirmations & gratitude', route: '/calm-corner', accent: '#f472b6', border: 'rgba(244,114,182,0.3)', bg: 'rgba(244,114,182,0.1)' },
  { id: 'spiritual', emoji: '✨', title: 'Spiritual Glow', subtitle: 'Faith, reflection & spiritual habits', route: '/spiritual-glow', accent: '#a78bfa', border: 'rgba(167,139,250,0.3)', bg: 'rgba(167,139,250,0.1)' },
];

function DetailView({ cat, onBack }) {
  const navigate = useNavigate();
  const [goal, setGoal] = useState(cat.goal);
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(cat.goal);
  const [checked, setChecked] = useState([false, false, false]);

  const toggleChallenge = (i) => setChecked(prev => { const n = [...prev]; n[i] = !n[i]; return n; });

  return (
    <div className="min-h-screen pb-24 text-white relative" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">
        {/* Back */}
        <button onClick={onBack} className="flex items-center gap-1 text-gray-400 text-sm mb-4 hover:text-white transition">
          <ChevronLeft size={18} /> Back to Wellness Hub
        </button>

        {/* Points */}
        <div className="flex justify-end mb-2">
          <div className="rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span>🏅</span><span className="text-yellow-400">15 pts</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-5xl">{cat.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold text-white">{cat.title}</h1>
            <p className="text-sm text-gray-400">{cat.subtitle}</p>
          </div>
        </div>

        {/* This Week's Goal */}
        <div className="rounded-2xl p-4 mb-6" style={{ background: cat.bg, border: `1px solid ${cat.border}` }}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs font-bold tracking-wider mb-1" style={{ color: cat.accent }}>THIS WEEK'S GOAL</p>
              {editingGoal ? (
                <textarea value={tempGoal} onChange={e => setTempGoal(e.target.value)}
                  className="w-full bg-transparent text-white text-sm outline-none resize-none border-b border-white/20 pb-1"
                  rows={2} autoFocus />
              ) : (
                <p className="text-sm text-white leading-relaxed">{goal}</p>
              )}
            </div>
            <button onClick={() => {
              if (editingGoal) { setGoal(tempGoal); setEditingGoal(false); }
              else { setTempGoal(goal); setEditingGoal(true); }
            }}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold text-white"
              style={{ background: cat.accent }}>
              {editingGoal ? 'Save' : 'Set Goal'}
            </button>
          </div>
        </div>

        {/* Tips */}
        <h2 className="text-lg font-bold text-white mb-3">Tips for You 💡</h2>
        <div className="space-y-2 mb-6">
          {cat.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                style={{ background: cat.accent, minWidth: 28 }}>
                {i + 1}
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>

        {/* Challenges */}
        <h2 className="text-lg font-bold text-white mb-3">Weekly Challenges 🎯</h2>
        <div className="space-y-2 mb-6">
          {cat.challenges.map((ch, i) => (
            <button key={i} onClick={() => toggleChallenge(i)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition"
              style={{ background: checked[i] ? cat.bg : 'rgba(255,255,255,0.04)', border: `1px solid ${checked[i] ? cat.border : 'rgba(255,255,255,0.07)'}` }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ border: `2px solid ${checked[i] ? cat.accent : 'rgba(255,255,255,0.25)'}`, background: checked[i] ? cat.accent : 'transparent' }}>
                {checked[i] && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <p className="text-sm text-white">{ch}</p>
            </button>
          ))}
        </div>

        {/* Calm Corner CTA */}
        <button onClick={() => navigate('/calm-corner')}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-left transition hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, rgba(139,10,120,0.5), rgba(109,40,217,0.4))', border: '1px solid rgba(244,114,182,0.3)' }}>
          <span className="text-2xl">🌸</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Need to decompress?</p>
            <p className="text-xs text-gray-300">Visit Calm Corner for breathing & affirmations</p>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </button>
      </div>
      <BottomNav active="discover" />
    </div>
  );
}

export default function WellnessHub() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  if (selected) return <DetailView cat={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="min-h-screen pb-24 text-white relative" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">

        {/* Points */}
        <div className="flex justify-end mb-2">
          <div className="rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span>🏅</span><span className="text-yellow-400">15 pts</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={22} /></button>
          <h1 className="text-3xl font-bold text-white">Wellness Hub 🌿</h1>
        </div>
        <p className="text-sm text-gray-400 mb-6 pl-7">Take care of your whole self — mind, body, and soul</p>

        {/* Main categories */}
        <div className="space-y-3 mb-3">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setSelected(cat)}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition hover:opacity-90"
              style={{ background: cat.bg, border: `1px solid ${cat.border}` }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
                {cat.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-base">{cat.title}</p>
                <p className="text-xs text-gray-400 mb-1">{cat.subtitle}</p>
                <p className="text-xs font-semibold" style={{ color: cat.accent }}>8 tips · 3 challenges</p>
              </div>
              <ChevronRight size={18} className="text-gray-500 flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Special links */}
        <div className="space-y-3 mb-5">
          {SPECIAL.map(s => (
            <button key={s.id} onClick={() => navigate(s.route)}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition hover:opacity-90"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
                {s.emoji}
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-base">{s.title}</p>
                <p className="text-xs text-gray-400">{s.subtitle}</p>
              </div>
              <ChevronRight size={18} className="text-gray-500 flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Wellness Reminder */}
        <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(234,179,8,0.25)' }}>
          <p className="text-sm font-bold text-yellow-400 mb-2">💛 Wellness Reminder</p>
          <p className="text-sm text-gray-300 leading-relaxed italic">
            "Taking care of yourself isn't selfish — it's necessary. You can't pour from an empty cup. Fill yours first."
          </p>
        </div>
      </div>

      <BottomNav active="discover" />
    </div>
  );
}