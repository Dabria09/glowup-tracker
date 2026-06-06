import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Share2, BookOpen, RotateCcw, ChevronRight, X, Check, ChevronLeft } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { base44 } from '@/api/base44Client';

const AGE_MODES = [
  { id: 'middle', label: 'Middle School', sub: 'Ages 11–13', emoji: '🌱' },
  { id: 'high_school', label: 'High School', sub: 'Ages 14–18', emoji: '✨' },
  { id: 'college', label: 'College', sub: 'Ages 18–22', emoji: '🎓' },
  { id: 'adult_entrepreneur', label: 'Adult/Entrepreneur', sub: 'Ages 22+', emoji: '👑' },
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

const TIPS_BY_AGE = {
  middle: {
    confidence: [
      'Give yourself one compliment in the mirror before school',
      'Stand tall in the hallway — your posture shows how you feel',
      'Raise your hand in class at least once today',
      'You don\'t have to fit in — you\'re meant to stand out',
      'Wear something that makes you feel like YOU today',
    ],
    money: [
      'Save $1 from your allowance every week — it adds up fast',
      'Help with chores to earn extra money — hustle starts early',
      'Before you buy something, ask: do I need this or just want it?',
      'A piggy bank is your first savings account — use it',
      'Even $5/week = $260 a year. Start now!',
    ],
    school: [
      'Ask one question in class today — it shows you care',
      'Review your notes the same night you take them',
      'Make a study buddy — learning together is more fun',
      'Your grades don\'t define you, but your effort does',
      'Find one subject you love and go deeper into it',
    ],
    relationships: [
      'A real friend lifts you up, not tears you down',
      'Treat others how you want to be treated — always',
      'It\'s okay to say no to things that make you uncomfortable',
      'Check on a friend who seems quiet today',
      'You don\'t have to be friends with everyone — quality over quantity',
    ],
    wellness: [
      'Get 8–9 hours of sleep — your brain is still growing',
      'Move your body for 10 minutes today — dance, walk, stretch',
      'Eat at least one fruit or veggie today',
      'Take 3 deep breaths when you feel stressed',
      'Drink water first thing in the morning — your body needs it',
    ],
    mindset: [
      'Mistakes are how you learn — don\'t be afraid to try',
      'Growth takes time — be patient with yourself',
      'Your thoughts are powerful — choose kind ones about yourself',
      'You are not behind — you\'re right where you need to be',
      'Write down one thing you\'re proud of today',
    ],
    career: [
      'Try a new activity or club this semester',
      'Talk to an adult about what they do for work',
      'Reading books builds skills for any career',
      'Your curiosity is your superpower — keep asking questions',
      'Think about what you love doing — that\'s a clue to your future',
    ],
  },
  high_school: {
    confidence: [
      'Own your story — every part of it makes you powerful',
      'Speak up for yourself in situations that matter',
      'Your uniqueness is your greatest competitive advantage',
      'Stop shrinking yourself to make others comfortable',
      'You are qualified. Stop waiting for permission to show up',
      'Carry yourself like the person you\'re becoming',
      'Rejection is redirection — don\'t take it personally',
    ],
    money: [
      'Open a savings account and watch compound interest work for you',
      'Look into ways to earn money — babysitting, tutoring, dog walking',
      'Apply for scholarships like it\'s your part-time job',
      'Learn what a credit score is and why it matters now',
      'Understand the difference between good debt and bad debt',
      'Financial discipline at 16 creates freedom at 26',
    ],
    school: [
      'Build a relationship with at least one teacher this semester',
      'Use a planner — time management is a skill that pays for life',
      'Research colleges and deadlines now — not in senior panic mode',
      'Your transcript tells a story. Make it one you\'re proud of',
      'Build a resume now even if you don\'t have much on it yet',
      'Ask for help before you fall behind, not after',
    ],
    relationships: [
      'Healthy relationships feel safe, not anxious',
      'Setting boundaries is an act of self-respect',
      'Know what a healthy relationship looks, sounds, and feels like',
      'Surround yourself with people who are going somewhere',
      'Learn to resolve conflict without losing your integrity',
    ],
    wellness: [
      'Your mental health is just as important as your grades',
      'Build a morning routine that sets your tone for the day',
      'Limit screen time before bed for better sleep quality',
      'Protect your mental health like you protect your phone — charge it daily',
      'You can\'t pour from an empty cup — fill yours first',
    ],
    mindset: [
      'Failure is a teacher, not a verdict',
      'What you practice daily, you become eventually',
      'Comparison will rob you — stay in your lane and win',
      'Decision making is a skill — practice making intentional choices',
      'Discipline will always outlast motivation — build systems',
    ],
    career: [
      'Explore at least 3 career fields before committing to one',
      'Volunteer or shadow someone in a job that interests you',
      'Start building a skill now that the future demands — coding, writing, design',
      'Network now — LinkedIn is free and powerful at any age',
      'Entrepreneurship is a valid path — it starts with solving one problem',
    ],
  },
  college: {
    confidence: [
      'You earned your seat at the table — own it',
      'Imposter syndrome is a liar. You belong here',
      'Take up space confidently — your perspective matters',
      'Advocate for yourself with professors, advisors, and employers',
      'Your confidence is a skill you build every day — practice it',
    ],
    money: [
      'Avoid lifestyle inflation — just because you can spend doesn\'t mean you should',
      'Build an emergency fund with at least $500 before anything else',
      'Your student loans are real debt — understand the terms before you sign',
      'Start investing even $25/month — time in the market beats timing the market',
      'Learn to cook — it\'s the fastest way to cut your budget in half',
    ],
    school: [
      'Go to office hours — professors remember students who show up',
      'Your network is being built right now in every class and club',
      'Choose classes that challenge you, not just ones that are easy',
      'Internships matter more than GPA for most careers — get one early',
      'Take care of your mental health before your grades fall — not after',
    ],
    relationships: [
      'College friendships can last a lifetime — invest in the real ones',
      'Long-distance relationships require intentional communication — decide if it\'s worth it',
      'Networking is relationship building — treat everyone with respect',
      'Know your dealbreakers before you enter relationships',
      'It\'s okay to outgrow friendships from high school',
    ],
    wellness: [
      'Sleep is your number one performance enhancer — protect it',
      'Move your body daily — even a 20-minute walk changes your mood',
      'Therapy is a strength, not a weakness — use campus resources',
      'Meal prep once a week and save money and brain energy',
      'Limit alcohol — it affects your grades, decisions, and mental health more than you think',
    ],
    mindset: [
      'You\'re not behind. Everyone is on a different path',
      'Failure in college teaches you more than any class',
      'Who you become in college matters as much as what you study',
      'Build your discipline now — it\'s the foundation of your career',
      'Comparison on social media is a highlight reel. Real life is messier and better',
    ],
    career: [
      'Start applying for internships in your freshman year',
      'Build a personal brand online before graduation',
      'Your major doesn\'t have to determine your entire career',
      'Talk to alumni in careers that interest you — they love helping',
      'Freelance or start a side project to build real-world skills',
    ],
  },
  adult_entrepreneur: {
    confidence: [
      'Your lived experience is currency — don\'t undervalue it',
      'Confidence is built through doing, not waiting until you\'re ready',
      'Say yes before you know how — figure it out on the way',
      'Own every decision you\'ve made — they all led you here',
      'Show up as the version of yourself you\'re becoming, not just who you\'ve been',
    ],
    money: [
      'Pay yourself first — automate savings before you see the money',
      'Invest in assets that work while you sleep — stocks, real estate, business',
      'A budget is a plan for your money, not a restriction',
      'Your business needs separate finances from day one',
      'Understand your tax obligations — money you don\'t plan for is money lost',
    ],
    school: [
      'Learning never stops — dedicate 30 minutes a day to growing your knowledge',
      'Certifications, courses, and masterminds are the new college for entrepreneurs',
      'Mentor someone younger — teaching reinforces everything you know',
      'Read one business or personal development book every month',
      'Conferences and workshops build networks that change your trajectory',
    ],
    relationships: [
      'Your inner circle will determine your outer results',
      'Invest in relationships before you need them — generosity pays forward',
      'Romantic partnerships need to be built on shared vision, not just chemistry',
      'Know when to end relationships that cost more than they contribute',
      'Hire slow, fire fast — your team reflects your values',
    ],
    wellness: [
      'Burnout is a business killer — rest is a strategy, not laziness',
      'Your body is your most important business asset — treat it like one',
      'Set boundaries between work and personal life or work will consume everything',
      'Mental health maintenance prevents mental health crises — don\'t skip it',
      'Morning routines are the difference between reactive and intentional days',
    ],
    mindset: [
      'Entrepreneurship is a mindset before it\'s a business',
      'Every failure has tuition embedded in it — collect what it teaches',
      'Vision without execution is just a dream — build systems',
      'Stop comparing your chapter 3 to someone else\'s chapter 30',
      'Your comfort zone and your growth zone cannot occupy the same space',
    ],
    career: [
      'Build multiple income streams — dependence on one is a risk',
      'Your personal brand is your most valuable business asset — invest in it',
      'Know your numbers: revenue, profit margin, and cost of acquisition',
      'Delegate what others can do so you can focus on what only you can do',
      'Impact and income can coexist — build a business that does both',
    ],
  },
};

function getTipsForMode(category, ageMode, adminTips) {
  const matching = adminTips.filter(
    t => t.category === category && t.is_active && (t.age_group === ageMode || t.age_group === 'all')
  );
  if (matching.length > 0) return matching.map(t => t.tip_text);
  return TIPS_BY_AGE[ageMode]?.[category] || TIPS_BY_AGE.high_school[category] || TIPS_BY_AGE.middle[category] || [];
}

const SAVED_KEY = 'ggu_glow_tips_saved';
const MODE_KEY = 'ggu_glow_tips_mode';

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); } catch { return []; }
}

export default function GlowTips() {
  const navigate = useNavigate();
  const [ageMode, setAgeMode] = useState(() => localStorage.getItem(MODE_KEY) || 'high_school');
  const [showModeModal, setShowModeModal] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [savedTips, setSavedTips] = useState(loadSaved);
  const [selectedCategory, setSelectedCategory] = useState('confidence');
  const [tipIndex, setTipIndex] = useState(0);
  const [adminTips, setAdminTips] = useState([]);
  const [todaySaved, setTodaySaved] = useState(false);
  const [todayFavorited, setTodayFavorited] = useState(false);

  useEffect(() => {
    base44.entities.AdminGlowTip.filter({ is_active: true }).then(setAdminTips).catch(() => {});
  }, []);

  const currentMode = AGE_MODES.find(m => m.id === ageMode) || AGE_MODES[1];
  const activeCat = CATEGORIES.find(c => c.id === selectedCategory);
  const catTips = getTipsForMode(selectedCategory, ageMode, adminTips);
  const currentTip = catTips[tipIndex % catTips.length];

  const todayTip = (() => {
    const featured = adminTips.find(t => t.is_featured && t.is_active && (t.age_group === ageMode || t.age_group === 'all'));
    if (featured) return featured.tip_text;
    const mindsetTips = TIPS_BY_AGE[ageMode]?.mindset || TIPS_BY_AGE.middle.mindset;
    const d = new Date();
    return mindsetTips[(d.getDate() + d.getMonth()) % mindsetTips.length];
  })();

  const selectMode = (id) => {
    setAgeMode(id);
    localStorage.setItem(MODE_KEY, id);
    setTipIndex(0);
    setShowModeModal(false);
    base44.auth.me().then(u => {
      if (u) base44.auth.updateMe({ age_mode: id }).catch(() => {});
    }).catch(() => {});
  };

  const nextTip = () => setTipIndex(i => (i + 1) % catTips.length);

  const saveCatTip = () => {
    const key = `${selectedCategory}-${ageMode}-${tipIndex}`;
    setSavedTips(prev => {
      const updated = prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key];
      localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isCatTipSaved = savedTips.includes(`${selectedCategory}-${ageMode}-${tipIndex}`);

  return (
    <div className="min-h-screen text-white pb-28 relative overflow-x-hidden"
      style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a18 40%, #0d0610 100%)' }}>

      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.07]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='%23fff'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 px-4 pt-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 mb-4">
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Glow Tips ✨</h1>
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
              {currentMode.emoji} {currentMode.label.split(' ')[0]}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', color: '#c084fc' }}>
            {currentMode.emoji} {currentMode.label} · {currentMode.sub}
          </span>
          <button onClick={() => setShowModeModal(true)} className="text-xs text-white/40 underline">Change</button>
        </div>

        {showSaved && (
          <div className="mb-5 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-sm font-bold text-white mb-3">🔖 Saved Tips ({savedTips.length})</p>
            {savedTips.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">Save tips by tapping the heart button</p>
            ) : (
              <div className="space-y-2">
                {savedTips.map(key => {
                  const parts = key.split('-');
                  const catId = parts[0];
                  const modeId = parts[1];
                  const idx = parseInt(parts[2]);
                  const cat = CATEGORIES.find(c => c.id === catId);
                  const tips = getTipsForMode(catId, modeId, adminTips);
                  const tip = tips[idx];
                  if (!tip) return null;
                  return (
                    <div key={key} className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <span>{cat?.emoji}</span>
                      <p className="text-xs text-white/80 flex-1">{tip}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="rounded-3xl p-5 mb-7"
          style={{ background: 'linear-gradient(135deg, rgba(90,20,100,0.7), rgba(160,20,80,0.5))', border: '1px solid rgba(255,31,142,0.2)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm" style={{ background: 'rgba(255,31,142,0.3)' }}>💡</div>
            <span className="text-xs font-bold tracking-widest" style={{ color: '#FF1F8E' }}>TODAY'S GLOW TIP</span>
          </div>
          <p className="text-white text-base font-semibold leading-relaxed mb-5">"{todayTip}"</p>
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

        <h2 className="text-lg font-bold text-white mb-4">Tips by Category</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            const tips = getTipsForMode(cat.id, ageMode, adminTips);
            return (
              <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setTipIndex(0); }}
                className="rounded-2xl p-4 text-left transition"
                style={isSelected
                  ? { background: `linear-gradient(135deg, ${cat.color}30, ${cat.color}15)`, border: `1px solid ${cat.color}60` }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-2xl block mb-2">{cat.emoji}</span>
                <p className="text-sm font-bold text-white">{cat.label}</p>
                <p className="text-xs" style={{ color: isSelected ? cat.color : 'rgba(255,255,255,0.4)' }}>{tips.length} tips</p>
              </button>
            );
          })}
        </div>

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
              <button onClick={nextTip} className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <RotateCcw size={11} /> Next tip
              </button>
            </div>
            <p className="text-white font-semibold text-base leading-relaxed mb-4">{currentTip}</p>
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

      {showModeModal && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={() => setShowModeModal(false)}>
          <div
            className="w-full rounded-t-3xl flex flex-col"
            style={{
              background: '#1a0a2e',
              border: '1px solid rgba(255,255,255,0.12)',
              maxHeight: '90vh',
            }}
            onClick={e => e.stopPropagation()}>

            {/* Scrollable content area */}
            <div className="overflow-y-auto flex-1 px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-white">Choose Your Age</h2>
                <button onClick={() => setShowModeModal(false)} className="text-gray-400 w-8 h-8 flex items-center justify-center"><X size={20} /></button>
              </div>
              <p className="text-sm text-gray-400 mb-6">Tips are tailored to your life stage so the advice actually fits where you are.</p>
              <div className="space-y-3">
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

            {/* Sticky button always visible above bottom nav + home indicator */}
            <div className="px-6 pt-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)' }}>
              <button
                onClick={() => setShowModeModal(false)}
                className="w-full py-4 rounded-2xl font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}