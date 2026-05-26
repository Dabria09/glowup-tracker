import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Share2, BookOpen, RotateCcw, ChevronRight, X, Check, ChevronLeft } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const AGE_MODES = [
  { id: 'middle', label: 'Middle School', sub: 'Ages 11–13', emoji: '🌱' },
  { id: 'high', label: 'High School', sub: 'Ages 14–18', emoji: '✨' },
  { id: 'college', label: 'College', sub: 'Ages 18–22', emoji: '👑' },
  { id: 'adult', label: 'Adult / Entrepreneur', sub: '22+', emoji: '💎' },
];

const CATEGORIES = [
  { id: 'confidence', label: 'Confidence', emoji: '💪', color: '#FF1F8E' },
  { id: 'money', label: 'Money', emoji: '💰', color: '#FFD700' },
  { id: 'school', label: 'School', emoji: '📚', color: '#3b82f6' },
  { id: 'relationships', label: 'Relationships', emoji: '💗', color: '#f472b6' },
  { id: 'wellness', label: 'Wellness', emoji: '🌿', color: '#22c55e' },
  { id: 'mindset', label: 'Mindset', emoji: '🧠', color: '#a855f7' },
  { id: 'career', label: 'Career', emoji: '🚀', color: '#f97316' },
];

const TIPS_BY_CATEGORY = {
  confidence: [
    'Stand tall — your posture affects how you feel about yourself',
    'Compliment yourself in the mirror every morning',
    'Wear something that makes you feel powerful today',
    'Your opinion matters. Speak up in class at least once today',
    'Stop apologizing for taking up space — you belong here',
  ],
  money: [
    'Save at least 20% of every dollar you earn, no matter how small',
    'Learn the difference between wants and needs before every purchase',
    'Start a no-spend day once a week to build discipline',
    'Invest in knowledge — it pays the best dividends',
    'Track every expense for 30 days and watch your habits change',
  ],
  school: [
    'Study in 25-minute sprints with 5-minute breaks for better focus',
    'Rewrite your notes by hand — it boosts memory retention by 40%',
    'Ask questions in class. Curiosity is a sign of intelligence',
    'Build a relationship with at least one teacher this semester',
    'Your GPA does not define your worth, but your effort does',
  ],
  relationships: [
    'You teach people how to treat you — set your standards high',
    'A real friend celebrates your wins without jealousy',
    'Check in on your strong friends. They need love too',
    'Healthy conflict is part of every good relationship',
    'Know the difference between someone who is busy and someone who does not care',
  ],
  wellness: [
    'Drink a full glass of water before reaching for your phone every morning',
    'Walk outside for at least 10 minutes today — nature is free therapy',
    'Rest is productive. Your body repairs itself when you sleep',
    'One deep breath changes your nervous system instantly — use it',
    'Eat something colorful today. Real food is real self-care',
  ],
  mindset: [
    'Every day is a new opportunity to glow up. Start with one small action',
    'Discipline beats motivation every single time — build systems',
    'Your thoughts become your words. Speak life over yourself daily',
    'Failure is data, not destiny. What did you learn?',
    'Comparison is the thief of joy. Run your own race',
  ],
  career: [
    'Start building your personal brand before you need a job',
    'Learn one new skill every month — compound growth is real',
    'Network up. Connect with people doing what you want to do',
    'Your first job is not your forever job — just start somewhere',
    'Document everything you accomplish — your resume will thank you',
  ],
};

const TODAY_TIP = '"Every day is a new opportunity to glow up. Start with one small action today."';

const SAVED_KEY = 'ggu_glow_tips_saved';
const MODE_KEY = 'ggu_glow_tips_mode';

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); } catch { return []; }
}

export default function GlowTips() {
  const navigate = useNavigate();
  const [ageMode, setAgeMode] = useState(() => localStorage.getItem(MODE_KEY) || 'high');
  const [showModeModal, setShowModeModal] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [savedTips, setSavedTips] = useState(loadSaved);
  const [selectedCategory, setSelectedCategory] = useState('confidence');
  const [tipIndex, setTipIndex] = useState(0);
  const [todaySaved, setTodaySaved] = useState(false);
  const [todayFavorited, setTodayFavorited] = useState(false);

  const currentMode = AGE_MODES.find(m => m.id === ageMode) || AGE_MODES[1];
  const activeCat = CATEGORIES.find(c => c.id === selectedCategory);
  const catTips = TIPS_BY_CATEGORY[selectedCategory] || [];
  const currentTip = catTips[tipIndex % catTips.length];

  const selectMode = (id) => {
    setAgeMode(id);
    localStorage.setItem(MODE_KEY, id);
    setShowModeModal(false);
  };

  const nextTip = () => setTipIndex(i => (i + 1) % catTips.length);

  const saveCatTip = () => {
    const key = `${selectedCategory}-${tipIndex}`;
    setSavedTips(prev => {
      const updated = prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key];
      localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isCatTipSaved = savedTips.includes(`${selectedCategory}-${tipIndex}`);

  return (
    <div className="min-h-screen text-white pb-28 relative overflow-x-hidden"
      style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a18 40%, #0d0610 100%)' }}>

      {/* Heart pattern bg */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.07]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='%23fff'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 px-4 pt-6">

        {/* Back button */}
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 mb-4">
          <ChevronLeft size={20} />
        </button>

        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Glow Tip ✨</h1>
            <p className="text-sm text-white/50 mt-0.5">Daily wisdom to keep you glowing</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={() => setShowSaved(!showSaved)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: showSaved ? '#FF1F8E' : '#fff' }}>
              <Heart size={12} fill={showSaved ? '#FF1F8E' : 'none'} /> Saved
            </button>
            <button onClick={() => setShowModeModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #5b21b6, #7B2FBE)', color: '#fff' }}>
              {currentMode.emoji} {currentMode.label}
            </button>
          </div>
        </div>

        {/* Saved panel */}
        {showSaved && (
          <div className="mb-5 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-sm font-bold text-white mb-3">🔖 Saved Tips ({savedTips.length})</p>
            {savedTips.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">Save tips by tapping the heart button</p>
            ) : (
              <div className="space-y-2">
                {savedTips.map(key => {
                  const [catId, idx] = key.split('-');
                  const cat = CATEGORIES.find(c => c.id === catId);
                  const tip = TIPS_BY_CATEGORY[catId]?.[parseInt(idx)];
                  if (!tip) return null;
                  return (
                    <div key={key} className="flex items-start gap-2 p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <span>{cat?.emoji}</span>
                      <p className="text-xs text-white/80 flex-1">{tip}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Today's Glow Tip card */}
        <div className="rounded-3xl p-5 mb-7"
          style={{ background: 'linear-gradient(135deg, rgba(90,20,100,0.7), rgba(160,20,80,0.5))', border: '1px solid rgba(255,31,142,0.2)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
              style={{ background: 'rgba(255,31,142,0.3)' }}>💡</div>
            <span className="text-xs font-bold tracking-widest" style={{ color: '#FF1F8E' }}>TODAY'S GLOW TIP</span>
          </div>
          <p className="text-white text-base font-semibold leading-relaxed mb-5">{TODAY_TIP}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Save', icon: <Heart size={13} fill={todaySaved ? '#FF1F8E' : 'none'} />, action: () => setTodaySaved(!todaySaved), active: todaySaved },
              { label: 'Favorite', icon: <Star size={13} fill={todayFavorited ? '#FFD700' : 'none'} />, action: () => setTodayFavorited(!todayFavorited), active: todayFavorited },
              { label: 'Share', icon: <Share2 size={13} />, action: () => {}, active: false },
              { label: 'Journal', icon: <BookOpen size={13} />, action: () => navigate('/diary'), active: false, accent: true },
            ].map(btn => (
              <button key={btn.label} onClick={btn.action}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition"
                style={btn.accent
                  ? { background: 'rgba(123,47,190,0.4)', border: '1px solid rgba(168,85,247,0.5)', color: '#c084fc' }
                  : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: btn.active ? (btn.label === 'Favorite' ? '#FFD700' : '#FF1F8E') : '#fff' }}>
                {btn.icon} {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tips by Category */}
        <h2 className="text-lg font-bold text-white mb-4">Tips by Category</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setTipIndex(0); }}
                className="rounded-2xl p-4 text-left transition"
                style={isSelected
                  ? { background: `linear-gradient(135deg, ${cat.color}30, ${cat.color}15)`, border: `1px solid ${cat.color}60` }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-2xl block mb-2">{cat.emoji}</span>
                <p className="text-sm font-bold text-white">{cat.label}</p>
                <p className="text-xs" style={{ color: isSelected ? cat.color : 'rgba(255,255,255,0.4)' }}>{catTips.length} tips</p>
              </button>
            );
          })}
        </div>

        {/* Active category tip card */}
        {activeCat && (
          <div className="rounded-2xl p-5 mb-5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span>{activeCat.emoji}</span>
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: activeCat.color }}>
                  {activeCat.label} Tips
                </span>
              </div>
              <button onClick={nextTip}
                className="flex items-center gap-1 text-xs font-semibold"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
                <RotateCcw size={11} /> Next tip
              </button>
            </div>

            <p className="text-white font-semibold text-base leading-relaxed mb-4">{currentTip}</p>

            {/* Progress bar */}
            <div className="flex gap-1 mb-4">
              {catTips.map((_, i) => (
                <div key={i} className="h-1 flex-1 rounded-full"
                  style={{ background: i <= tipIndex % catTips.length ? activeCat.color : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: 'Save', icon: <Heart size={13} fill={isCatTipSaved ? activeCat.color : 'none'} />, action: saveCatTip, color: isCatTipSaved ? activeCat.color : undefined },
                { label: 'Favorite', icon: <Star size={13} />, action: () => {}, color: undefined },
                { label: 'Share', icon: <Share2 size={13} />, action: () => {}, color: undefined },
                { label: 'Journal', icon: <BookOpen size={13} />, action: () => navigate('/diary'), accent: true },
              ].map(btn => (
                <button key={btn.label} onClick={btn.action}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition"
                  style={btn.accent
                    ? { background: 'rgba(123,47,190,0.4)', border: '1px solid rgba(168,85,247,0.5)', color: '#c084fc' }
                    : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: btn.color || '#fff' }}>
                  {btn.icon} {btn.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Want more wellness banner */}
        <button onClick={() => navigate('/wellness-hub')}
          className="w-full flex items-center gap-3 p-4 rounded-2xl mb-2 transition"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="text-2xl">🌿</span>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-white">Want more wellness?</p>
            <p className="text-xs text-gray-400">Visit the full Wellness Hub</p>
          </div>
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Age Mode Modal */}
      {showModeModal && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowModeModal(false)}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-white">Choose Your Age Mode</h2>
              <button onClick={() => setShowModeModal(false)} className="text-gray-400"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-400 mb-6">Tips adapt to your life stage so the advice actually fits where you are.</p>
            <div className="space-y-3 pb-4">
              {AGE_MODES.map(mode => {
                const isSelected = ageMode === mode.id;
                return (
                  <button key={mode.id} onClick={() => selectMode(mode.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl transition"
                    style={isSelected
                      ? { background: 'rgba(123,47,190,0.35)', border: '1px solid rgba(168,85,247,0.5)' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="text-2xl">{mode.emoji}</span>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-white text-sm">{mode.label}</p>
                      <p className="text-xs text-gray-400">{mode.sub}</p>
                    </div>
                    {isSelected && <Check size={16} className="text-purple-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}