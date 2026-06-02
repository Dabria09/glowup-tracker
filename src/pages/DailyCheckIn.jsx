import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { awardPoints } from '@/lib/pointsHelper';

const DAILY_FOCUSES = [
  { icon: '📱', label: 'Social Media',      tip: 'How is social media affecting your peace today? Time to be intentional.' },
  { icon: '💪', label: 'Confidence',         tip: 'Own your greatness today. You were created to stand out, not fit in.' },
  { icon: '🙏', label: 'Gratitude',          tip: 'Name 3 things you\'re grateful for. Gratitude shifts your entire mindset.' },
  { icon: '🛑', label: 'Boundaries',         tip: 'It\'s okay to say no. Protecting your energy is an act of self-love.' },
  { icon: '💆‍♀️', label: 'Self-Care',         tip: 'You can\'t pour from an empty cup. Pour into yourself first today.' },
  { icon: '🎯', label: 'Goals',              tip: 'One step forward is still progress. What\'s your one move today?' },
  { icon: '💚', label: 'Health',             tip: 'Your body is your home. Drink water, move, rest — treat it like a temple.' },
  { icon: '📖', label: 'Learning',           tip: 'Curious minds grow every day. What will you learn or explore today?' },
  { icon: '💰', label: 'Money Mindset',      tip: 'Build your financial future one smart decision at a time.' },
  { icon: '👯‍♀️', label: 'Friendships',       tip: 'Pour into the people who pour into you. Quality over quantity.' },
  { icon: '😴', label: 'Rest & Sleep',       tip: 'Rest is productive. Give your mind and body the recovery they deserve.' },
  { icon: '🧠', label: 'Mental Health',      tip: 'Check in with yourself. It\'s okay to not be okay — and to ask for help.' },
  { icon: '✨', label: 'Glow Up',            tip: 'Your glow up is a daily practice — inside and out. Invest in yourself.' },
  { icon: '🌱', label: 'Growth Mindset',     tip: 'Every challenge is a classroom. What are you learning from this season?' },
  { icon: '🔥', label: 'Hustle & Purpose',  tip: 'Your dreams are valid. Work on them a little every single day.' },
  { icon: '❤️', label: 'Self-Love',          tip: 'Speak kindly to yourself today. You\'re your own most important relationship.' },
  { icon: '🎓', label: 'School & Career',    tip: 'Your education is an investment in yourself. Show up for your future.' },
  { icon: '🧘', label: 'Mindfulness',        tip: 'Slow down. Breathe. This moment is the only one that actually exists.' },
  { icon: '🌟', label: 'Affirmations',       tip: 'What you speak over yourself matters. Claim who you\'re becoming.' },
  { icon: '🏠', label: 'Home & Space',       tip: 'Your environment shapes your mindset. A clean space = a clear mind.' },
  { icon: '🤝', label: 'Community',          tip: 'Lift as you climb. Who can you encourage or support today?' },
  { icon: '⏰', label: 'Time Management',   tip: 'Your time is your most valuable resource. Spend it like it.' },
  { icon: '🗣️', label: 'Communication',     tip: 'Speak your truth with grace. Your voice deserves to be heard.' },
  { icon: '🌍', label: 'Impact & Legacy',   tip: 'Everything you do today is building who you\'ll be tomorrow.' },
  { icon: '🫶', label: 'Family',             tip: 'Cherish the people who love you unconditionally. Check in on someone today.' },
  { icon: '💻', label: 'Digital Wellness',  tip: 'Your online life should reflect your real values. Be intentional.' },
  { icon: '🎨', label: 'Creativity',         tip: 'You are creative — even if it doesn\'t look traditional. Express yourself.' },
  { icon: '💎', label: 'Values',             tip: 'Know what you stand for so you\'ll know what to walk away from.' },
  { icon: '🚫', label: 'Letting Go',         tip: 'Release what no longer serves you. Growth requires creating space.' },
  { icon: '🏆', label: 'Winning Mindset',   tip: 'Champions are made in the moments nobody\'s watching. Keep going.' },
  { icon: '🌸', label: 'Inner Peace',        tip: 'Peace is not the absence of chaos — it\'s how you respond to it.' },
];

const MOODS = [
  { emoji: '🤩', label: 'Amazing' },
  { emoji: '😊', label: 'Happy' },
  { emoji: '🙏', label: 'Grateful' },
  { emoji: '🔥', label: 'Excited' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '🥺', label: 'Sad' },
  { emoji: '😤', label: 'Stressed' },
  { emoji: '😒', label: 'Angry' },
];

function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getTodayFocus() {
  const [y, m, d] = getTodayKey().split('-').map(Number);
  const idx = (y * 365 + m * 31 + d) % DAILY_FOCUSES.length;
  return DAILY_FOCUSES[idx];
}

export default function DailyCheckIn() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [todayEntry, setTodayEntry] = useState(null);

  const [mood, setMood] = useState(null);
  const [confidence, setConfidence] = useState(5);
  const [stress, setStress] = useState(5);
  const [goals, setGoals] = useState('');
  const [affirmation, setAffirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const todayFocus = getTodayFocus();
  const todayKey = getTodayKey();

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
      if (profiles.length) setProfile(profiles[0]);
      // Check if already checked in today
      const entries = await base44.entities.DiaryEntry.filter({ user_email: u.email });
      const todayCheckIn = entries.find(e => e.tags && e.tags.includes(`daily-checkin-${todayKey}`));
      if (todayCheckIn) { setAlreadyCheckedIn(true); setTodayEntry(todayCheckIn); }
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const firstName = profile?.username || user?.full_name?.split(' ')[0] || 'Beautiful';

  const handleSubmit = async () => {
    if (!mood) return toast.error('Pick your mood first! 💜');
    setSubmitting(true);
    await base44.entities.DiaryEntry.create({
      user_email: user.email,
      title: `Daily Check-In — ${todayFocus.label}`,
      content: JSON.stringify({ mood, confidence, stress, goals, affirmation, focus: todayFocus.label }),
      mood: mood.label,
      tags: `daily-checkin,daily-checkin-${todayKey}`,
      date: todayKey,
    });
    localStorage.setItem(`ggu_checkin_${user.email}_date`, todayKey);
    await awardPoints(user.email, 'daily_checkin');
    // Notify Dashboard to refresh check-in state immediately
    window.dispatchEvent(new CustomEvent('ggu_checkin_complete'));
    setAlreadyCheckedIn(true);
    setSubmitting(false);
    toast.success('Check-in complete! +10 pts ✨');
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  if (alreadyCheckedIn) return (
    <div className="min-h-screen pb-24 text-white relative" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4 flex flex-col items-center justify-center min-h-screen gap-4">
        <span className="text-7xl">✨</span>
        <h2 className="text-2xl font-bold text-white text-center">You've already glowed today!</h2>
        <p className="text-gray-400 text-center text-sm">Your daily check-in is complete. Come back tomorrow for a fresh start.</p>
        <div className="rounded-2xl p-4 w-full max-w-sm" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
          <p className="text-xs font-bold text-purple-400 mb-1">TODAY'S FOCUS</p>
          <p className="font-bold text-white">{todayFocus.icon} {todayFocus.label}</p>
          <p className="text-xs text-gray-400 mt-1 italic">"{todayFocus.tip}"</p>
        </div>
        <button onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-full font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
          Back to Dashboard
        </button>
      </div>
      <BottomNav active="home" />
    </div>
  );

  return (
    <div className="min-h-screen pb-32 text-white relative" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={22} /></button>
        </div>

        {/* Points */}
        <div className="flex justify-end mb-3">
          <div className="rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span>🏅</span><span className="text-yellow-400">+10 pts</span>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-yellow-400 text-sm font-bold tracking-wide">✦ DAILY GLOW CHECK-IN</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">How are you glowing today?</h1>
        <p className="text-gray-400 text-sm mb-5">Good to see you, {firstName}! ✨</p>

        {/* Today's Focus */}
        <div className="rounded-2xl px-4 py-3.5 mb-6 flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <p className="text-xs text-gray-500 font-semibold tracking-wider mb-0.5">TODAY'S FOCUS</p>
            <p className="font-bold text-lg" style={{ color: '#a78bfa' }}>{todayFocus.icon} {todayFocus.label}</p>
            <p className="text-xs text-gray-400 mt-0.5 italic leading-relaxed max-w-xs">{todayFocus.tip}</p>
          </div>
          <Zap size={20} className="text-yellow-400 flex-shrink-0 ml-2" />
        </div>

        {/* Mood */}
        <p className="text-base font-semibold text-white mb-3">How are you feeling right now?</p>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {MOODS.map(m => (
            <button key={m.label} onClick={() => setMood(m)}
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition"
              style={{
                background: mood?.label === m.label ? 'rgba(168,85,247,0.35)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${mood?.label === m.label ? 'rgba(168,85,247,0.6)' : 'rgba(255,255,255,0.08)'}`,
              }}>
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs text-gray-300">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Confidence */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <p className="text-base font-semibold text-white">Confidence Level</p>
            <p className="text-pink-400 font-bold">{confidence}/10</p>
          </div>
          <input type="range" min={1} max={10} value={confidence} onChange={e => setConfidence(+e.target.value)}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #ec4899 ${confidence * 10}%, rgba(255,255,255,0.15) ${confidence * 10}%)` }} />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Not feeling it</span><span>Unstoppable</span>
          </div>
        </div>

        {/* Stress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-base font-semibold text-white">Stress Level</p>
            <p className="text-pink-400 font-bold">{stress}/10</p>
          </div>
          <input type="range" min={1} max={10} value={stress} onChange={e => setStress(+e.target.value)}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #ec4899 ${stress * 10}%, rgba(255,255,255,0.15) ${stress * 10}%)` }} />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Totally chill</span><span>Overwhelmed</span>
          </div>
        </div>

        {/* Goals */}
        <div className="mb-4">
          <p className="text-base font-semibold text-white mb-2">What are your goals for today? <span className="text-gray-500 font-normal text-sm">(optional)</span></p>
          <textarea value={goals} onChange={e => setGoals(e.target.value)} rows={3}
            placeholder="e.g. Study for my test, go for a walk, call my friend..."
            className="w-full px-4 py-3 rounded-2xl text-sm text-white placeholder-gray-600 outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>

        {/* Affirmation */}
        <div className="mb-6">
          <p className="text-base font-semibold text-white mb-2">Today's affirmation <span className="text-gray-500 font-normal text-sm">(optional)</span></p>
          <textarea value={affirmation} onChange={e => setAffirmation(e.target.value)} rows={2}
            placeholder="e.g. I am capable, worthy, and unstoppable..."
            className="w-full px-4 py-3 rounded-2xl text-sm text-white placeholder-gray-600 outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={submitting || !mood}
          className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 disabled:opacity-50 transition"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)' }}>
          {submitting ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <>✦ Submit Check-In &amp; Earn Points</>}
        </button>
      </div>

      <BottomNav active="home" />
    </div>
  );
}