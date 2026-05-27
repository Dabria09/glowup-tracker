import { useState, useEffect } from 'react';
import useAgeGroup from '@/lib/useAgeGroup';
import useTranslation from '@/lib/useTranslation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, X, Plus, Check } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import CustomizeModal from '@/components/CustomizeModal';
import AvatarPreview from '@/components/avatar/AvatarPreview';
import NutritionSummary from '@/components/Dashboard/NutritionSummary';

// ── All available pages for home apps & quick access ──────────────────────────
const ALL_PAGES = [
  { id: 'daily-checkin', icon: '✦', label: 'Daily Check-In', route: '/daily-checkin', keywords: ['check in', 'mood', 'daily', 'points', 'journal'] },
  { id: 'glow', icon: '✨', label: 'My Glow', route: '/glow', keywords: ['challenges', 'streak', 'crown', 'badges', 'progress'] },
  { id: 'discover', icon: '🧭', label: 'Discover', route: '/discover', keywords: ['explore', 'find', 'browse'] },
  { id: 'glow-feed', icon: '📲', label: 'Glow Feed', route: '/glow-feed', keywords: ['feed', 'posts', 'community', 'social'] },
  { id: 'glow-board', icon: '📸', label: 'Glow Board', route: '/glow-board', keywords: ['photos', 'vision', 'inspiration', 'images'] },
  { id: 'glow-talk', icon: '💬', label: 'Glow Talk', route: '/glow-talk', keywords: ['chat', 'messages', 'talk', 'rooms'] },
  { id: 'shout-outs', icon: '📣', label: 'Shout Outs', route: '/shout-outs', keywords: ['praise', 'recognition', 'props', 'appreciate'] },
  { id: 'leaderboard', icon: '🏅', label: 'Leaderboard', route: '/leaderboard', keywords: ['ranking', 'top', 'scores', 'competition'] },
  { id: 'glow-teams', icon: '🏆', label: 'Glow Teams', route: '/glow-teams', keywords: ['team', 'group', 'compete'] },
  { id: 'glow-squads', icon: '💜', label: 'Glow Squads', route: '/glow-squads', keywords: ['squad', 'friends', 'close', 'circle'] },
  { id: 'community-hub', icon: '🌸', label: 'Community', route: '/community-hub', keywords: ['community', 'groups', 'people'] },
  { id: 'mentorship', icon: '🎓', label: 'Mentorship', route: '/mentorship', keywords: ['mentor', 'guidance', 'learning', 'coach'] },
  { id: 'meal-planner', icon: '🍽️', label: 'Meal Planner', route: '/meal-planner', keywords: ['food', 'meals', 'nutrition', 'eat', 'diet', 'calories'] },
  { id: 'grocery-list', icon: '🛒', label: 'Grocery List', route: '/grocery-list', keywords: ['groceries', 'shopping', 'food', 'list'] },
  { id: 'glow-kitchen', icon: '👩‍🍳', label: 'Glow Kitchen', route: '/glow-kitchen', keywords: ['recipes', 'cook', 'kitchen', 'food'] },
  { id: 'fitness-tracker', icon: '💪', label: 'Fitness', route: '/fitness-tracker', keywords: ['workout', 'exercise', 'fitness', 'health', 'gym'] },
  { id: 'wellness-hub', icon: '🌿', label: 'Wellness Hub', route: '/wellness-hub', keywords: ['wellness', 'health', 'self care', 'mental'] },
  { id: 'cycle-tracker', icon: '🌙', label: 'Cycle Tracker', route: '/cycle-tracker', keywords: ['period', 'cycle', 'health', 'body'] },
  { id: 'calm-corner', icon: '🧘', label: 'Calm Corner', route: '/calm-corner', keywords: ['meditation', 'calm', 'relax', 'breathe', 'anxiety'] },
  { id: 'spiritual-glow', icon: '🙏', label: 'Spiritual Glow', route: '/spiritual-glow', keywords: ['spiritual', 'faith', 'prayer', 'gratitude'] },
  { id: 'diary', icon: '📔', label: 'Diary', route: '/diary', keywords: ['journal', 'diary', 'write', 'thoughts', 'feelings'] },
  { id: 'vision-board', icon: '🌈', label: 'Vision Board', route: '/vision-board', keywords: ['goals', 'dreams', 'vision', 'future', 'manifestation'] },
  { id: 'my-goals', icon: '🎯', label: 'My Goals', route: '/my-goals', keywords: ['goals', 'targets', 'achieve', 'aims'] },
  { id: 'glow-up-challenges', icon: '🔥', label: 'Glow Challenges', route: '/glow-up-challenges', keywords: ['challenge', '30 day', 'glow up', 'improve'] },
  { id: 'my-certificates', icon: '🏅', label: 'Certificates', route: '/my-certificates', keywords: ['certificate', 'achievement', 'completed', 'award'] },
  { id: 'glow-score', icon: '⭐', label: 'Glow Score', route: '/glow-score', keywords: ['score', 'level', 'tier', 'points', 'ranking'] },
  { id: 'daily-challenges', icon: '✅', label: 'Daily Challenges', route: '/daily-challenges', keywords: ['tasks', 'daily', 'challenge', 'complete'] },
  { id: 'daily-quotes', icon: '💬', label: 'Daily Quotes', route: '/daily-quotes', keywords: ['quotes', 'inspiration', 'motivation', 'affirmation'] },
  { id: 'glow-tips', icon: '💡', label: 'Glow Tips', route: '/glow-tips', keywords: ['tips', 'advice', 'beauty', 'self care'] },
  { id: 'weekly-theme', icon: '📅', label: 'Weekly Theme', route: '/weekly-theme', keywords: ['weekly', 'theme', 'focus', 'goals'] },
  { id: 'me-vs-me', icon: '📈', label: 'Me Vs Me', route: '/me-vs-me', keywords: ['progress', 'personal', 'growth', 'compare'] },
  { id: 'scholarships', icon: '🎓', label: 'Scholarships', route: '/scholarships', keywords: ['scholarship', 'money', 'college', 'award', 'education'] },
  { id: 'careers', icon: '💼', label: 'Career Explorer', route: '/careers', keywords: ['career', 'jobs', 'profession', 'future'] },
  { id: 'job-tracker', icon: '📋', label: 'Job Tracker', route: '/job-tracker', keywords: ['job', 'application', 'work', 'employment'] },
  { id: 'dream-calculator', icon: '💰', label: 'Dream Calculator', route: '/dream-calculator', keywords: ['money', 'dream', 'salary', 'calculate'] },
  { id: 'money-tracker', icon: '📊', label: 'Money Tracker', route: '/money-tracker', keywords: ['money', 'budget', 'finance', 'spend', 'save'] },
  { id: 'savings-goals', icon: '🏦', label: 'Savings Goals', route: '/savings-goals', keywords: ['save', 'savings', 'money', 'goals', 'bank'] },
  { id: 'homework-tracker', icon: '📚', label: 'Homework', route: '/homework-tracker', keywords: ['homework', 'school', 'study', 'academic', 'assignment'] },
  { id: 'ggu-academy', icon: '🏫', label: 'GGU Academy', route: '/ggu-academy', keywords: ['academy', 'learn', 'course', 'education', 'school'] },
  { id: 'growth-mindset', icon: '🌱', label: 'Growth Mindset', route: '/growth-mindset', keywords: ['mindset', 'growth', 'positive', 'confidence'] },
  { id: 'girls-library', icon: '📖', label: "Girls' Library", route: '/girls-library', keywords: ['books', 'read', 'library', 'literature'] },
  { id: 'your-voice', icon: '🎙️', label: 'Your Voice', route: '/your-voice', keywords: ['voice', 'speak', 'opinions', 'debate'] },
  { id: 'audio-library', icon: '🎧', label: 'Audio Library', route: '/audio-library', keywords: ['audio', 'podcast', 'listen', 'music'] },
  { id: 'glow-playlist', icon: '🎵', label: 'Glow Playlist', route: '/glow-playlist', keywords: ['playlist', 'music', 'songs', 'vibe'] },
  { id: 'countdown', icon: '⏳', label: 'Countdown', route: '/countdown', keywords: ['countdown', 'timer', 'event', 'date'] },
  { id: 'my-calendar', icon: '🗓️', label: 'My Calendar', route: '/my-calendar', keywords: ['calendar', 'schedule', 'events', 'dates'] },
  { id: 'birthday-planner', icon: '🎂', label: 'Birthday Planner', route: '/birthday-planner', keywords: ['birthday', 'party', 'event', 'celebrate'] },
  { id: 'trip-planner', icon: '✈️', label: 'Trip Planner', route: '/trip-planner', keywords: ['trip', 'travel', 'vacation', 'plan'] },
  { id: 'cleaning-calendar', icon: '🧹', label: 'Cleaning Calendar', route: '/cleaning-calendar', keywords: ['clean', 'chores', 'home', 'organize'] },
  { id: 'sticky-notes', icon: '🗒️', label: 'Sticky Notes', route: '/sticky-notes', keywords: ['notes', 'reminder', 'sticky', 'memo'] },
  { id: 'time-management', icon: '⏰', label: 'Time Management', route: '/time-management', keywords: ['time', 'schedule', 'manage', 'productive'] },
  { id: 'important-contacts', icon: '📞', label: 'Contacts', route: '/important-contacts', keywords: ['contacts', 'phone', 'people', 'emergency'] },
  { id: 'password-vault', icon: '🔐', label: 'Password Vault', route: '/password-vault', keywords: ['password', 'security', 'vault', 'private'] },
  { id: 'my-glow-link', icon: '🌐', label: 'My Glow Link', route: '/my-glow-link', keywords: ['profile', 'link', 'share', 'public'] },
  { id: 'glow-store', icon: '🛍️', label: 'Glow Store', route: '/glow-store', keywords: ['store', 'shop', 'rewards', 'items', 'buy'] },
  { id: 'mock-vote', icon: '🗳️', label: 'Mock Vote', route: '/mock-vote', keywords: ['vote', 'poll', 'opinion', 'choice'] },
  { id: 'support', icon: '💌', label: 'Support', route: '/support', keywords: ['help', 'support', 'contact', 'issue'] },
];

const DEFAULT_HOME_IDS = ['daily-checkin', 'glow', 'glow-feed', 'meal-planner', 'fitness-tracker', 'diary', 'vision-board', 'glow-up-challenges'];
const DEFAULT_QUICK_IDS = ['daily-checkin', 'glow', 'diary', 'money-tracker'];

const SOCIAL = [
  { name: 'Instagram', handle: '@girlsglowingup', url: 'https://instagram.com/girlsglowingup', color: 'bg-gradient-to-br from-pink-600 to-purple-600', icon: '📸' },
  { name: 'TikTok', handle: '@girlsglowingup', url: 'https://tiktok.com/@girlsglowingup', color: 'bg-black border border-gray-600', icon: '🎵' },
  { name: 'YouTube', handle: 'Girls Glowing Up', url: 'https://youtube.com/@girlsglowingup', color: 'bg-red-600', icon: '▶️' },
  { name: 'X / Twitter', handle: '@girlsglowingup', url: 'https://x.com/girlsglowingup', color: 'bg-black border border-gray-600', icon: '✖️' },
  { name: 'Facebook', handle: 'Girls Glowing Up', url: 'https://facebook.com/girlsglowingup', color: 'bg-blue-600', icon: '📘' },
  { name: 'Snapchat', handle: 'girlsglowingup', url: 'https://snapchat.com/add/girlsglowingup', color: 'bg-yellow-400', icon: '👻' },
];

const PATTERN_SVGS = {
  stars: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='10' y='42' font-size='30' fill='rgba(255,255,255,0.03)'>&#9733;</text></svg>",
  hearts: "<svg xmlns='http://www.w3.org/2000/svg' width='55' height='55'><text x='8' y='40' font-size='28' fill='rgba(255,255,255,0.03)'>&#9829;</text></svg>",
  sparkles: "<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><text x='5' y='36' font-size='26' fill='rgba(255,255,255,0.035)'>&#10022;</text></svg>",
  flowers: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='8' y='42' font-size='30' fill='rgba(255,255,255,0.03)'>&#10047;</text></svg>",
  butterflies: "<svg xmlns='http://www.w3.org/2000/svg' width='65' height='65'><text x='6' y='46' font-size='32' fill='rgba(255,255,255,0.03)'>&#129419;</text></svg>",
  diamonds: "<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><polygon points='22,3 41,22 22,41 3,22' fill='rgba(255,255,255,0.03)'/></svg>",
  crowns: "<svg xmlns='http://www.w3.org/2000/svg' width='65' height='65'><text x='8' y='46' font-size='32' fill='rgba(255,255,255,0.03)'>&#128081;</text></svg>",
  dots: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='2' fill='rgba(255,255,255,0.03)'/></svg>",
  moons: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='8' y='42' font-size='30' fill='rgba(255,255,255,0.03)'>&#9790;</text></svg>",
  lightning: "<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><text x='8' y='38' font-size='26' fill='rgba(255,255,255,0.03)'>&#9889;</text></svg>",
  fire: "<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><text x='8' y='38' font-size='26' fill='rgba(255,255,255,0.03)'>&#128293;</text></svg>",
  snowflakes: "<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><text x='5' y='38' font-size='28' fill='rgba(255,255,255,0.035)'>&#10052;</text></svg>",
  music: "<svg xmlns='http://www.w3.org/2000/svg' width='55' height='55'><text x='6' y='40' font-size='28' fill='rgba(255,255,255,0.03)'>&#9834;</text></svg>",
  rainbow: "<svg xmlns='http://www.w3.org/2000/svg' width='65' height='55'><text x='4' y='42' font-size='30' fill='rgba(255,255,255,0.03)'>&#127752;</text></svg>",
  clouds: "<svg xmlns='http://www.w3.org/2000/svg' width='70' height='50'><text x='4' y='36' font-size='30' fill='rgba(255,255,255,0.03)'>&#9729;</text></svg>",
  paws: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='8' y='42' font-size='28' fill='rgba(255,255,255,0.03)'>&#128062;</text></svg>",
  lips: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='6' y='42' font-size='28' fill='rgba(255,255,255,0.03)'>&#128139;</text></svg>",
  eyes: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='6' y='42' font-size='28' fill='rgba(255,255,255,0.03)'>&#129535;</text></svg>",
};

const patternStyle = (pattern, bgImage, bgImagePos = { x: 50, y: 50 }) => {
  if (bgImage) return { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: `${bgImagePos.x}% ${bgImagePos.y}%` };
  if (pattern && pattern !== 'none' && PATTERN_SVGS[pattern]) {
    return { backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(PATTERN_SVGS[pattern])}")` };
  }
  return {};
};

function getTime() { return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'greeting_morning';
  if (h < 17) return 'greeting_afternoon';
  return 'greeting_evening';
}

function loadSavedIds(key, defaults) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {}
  return defaults;
}

// Picker modal for choosing pages to add
function PagePickerModal({ title, currentIds, onSave, onClose }) {
  const [selected, setSelected] = useState([...currentIds]);
  const [search, setSearch] = useState('');
  const filtered = ALL_PAGES.filter(p => {
    const q = search.toLowerCase();
    return p.label.toLowerCase().includes(q) || p.keywords.some(k => k.includes(q));
  });
  const toggle = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={onClose}>
      <div className="w-full rounded-t-3xl flex flex-col" style={{ maxHeight: '85vh', background: '#0f0a1e', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <h3 className="font-bold text-white">{title}</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-2">
            <Search size={14} className="text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search all pages..." className="bg-transparent text-sm text-white outline-none flex-1 placeholder-gray-500" />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(page => {
              const isOn = selected.includes(page.id);
              return (
                <button key={page.id} onClick={() => toggle(page.id)} className="flex items-center gap-2 p-3 rounded-2xl text-left transition" style={{ background: isOn ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isOn ? 'rgba(236,72,153,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
                  <span className="text-xl flex-shrink-0">{page.icon}</span>
                  <span className="text-xs font-semibold text-white flex-1 leading-tight">{page.label}</span>
                  {isOn && <Check size={12} className="text-pink-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="px-4 py-4 border-t border-white/10 flex-shrink-0 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="py-3 rounded-2xl text-sm font-semibold text-gray-400 bg-white/5">Cancel</button>
          <button onClick={() => { onSave(selected); onClose(); }} className="py-3 rounded-2xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#c44a55,#ff6a75)' }}>Save ({selected.length})</button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { worldInfo } = useAgeGroup();
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarConfig, setAvatarConfig] = useState(null);
  const [search, setSearch] = useState('');
  const [showCustomize, setShowCustomize] = useState(false);
  const [bgColor, setBgColor] = useState('#8b2d88');
  const [bgPattern, setBgPattern] = useState('none');
  const [bgImage, setBgImage] = useState(null);
  const [bgImagePos, setBgImagePos] = useState({ x: 50, y: 50 });
  const [isEditMode, setIsEditMode] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showQuickAccess, setShowQuickAccess] = useState(() => { try { return localStorage.getItem('ggu_show_quick') !== 'false'; } catch { return true; } });
  const [homeAppIds, setHomeAppIds] = useState(() => loadSavedIds('ggu_home_apps', DEFAULT_HOME_IDS));
  const [quickIds, setQuickIds] = useState(() => loadSavedIds('ggu_quick_access', DEFAULT_QUICK_IDS));
  const [showHomePicker, setShowHomePicker] = useState(false);
  const [showQuickPicker, setShowQuickPicker] = useState(false);

  const homeApps = homeAppIds.map(id => ALL_PAGES.find(p => p.id === id)).filter(Boolean);
  const quickApps = quickIds.map(id => ALL_PAGES.find(p => p.id === id)).filter(Boolean);

  useEffect(() => { localStorage.setItem('ggu_show_quick', showQuickAccess); }, [showQuickAccess]);
  useEffect(() => { localStorage.setItem('ggu_home_apps', JSON.stringify(homeAppIds)); }, [homeAppIds]);
  useEffect(() => { localStorage.setItem('ggu_quick_access', JSON.stringify(quickIds)); }, [quickIds]);
  useEffect(() => { localStorage.setItem('ggu_bg_color', bgColor); }, [bgColor]);
  useEffect(() => { localStorage.setItem('ggu_bg_pattern', bgPattern); }, [bgPattern]);
  useEffect(() => { if (bgImage) localStorage.setItem('ggu_bg_image', bgImage); else localStorage.removeItem('ggu_bg_image'); }, [bgImage]);
  useEffect(() => { localStorage.setItem('ggu_bg_image_pos', JSON.stringify(bgImagePos)); }, [bgImagePos]);

  useEffect(() => {
    const savedColor = localStorage.getItem('ggu_bg_color');
    const savedPattern = localStorage.getItem('ggu_bg_pattern');
    const savedImage = localStorage.getItem('ggu_bg_image');
    const savedPos = localStorage.getItem('ggu_bg_image_pos');
    if (savedColor) setBgColor(savedColor);
    if (savedPattern) setBgPattern(savedPattern);
    if (savedImage) setBgImage(savedImage);
    if (savedPos) { try { setBgImagePos(JSON.parse(savedPos)); } catch {} }
  }, []);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const pts = await base44.entities.UserPoints.filter({ user_email: u.email });
      setTotalPoints(pts.length > 0 ? pts[0].total_points || 0 : 0);
      const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
      if (profiles.length) {
        const profile = profiles[0];
        if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
        if (profile.avatar_builder_config) { try { setAvatarConfig(JSON.parse(profile.avatar_builder_config)); } catch {} }
      }
    }).catch(() => {});
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'Gorgeous';
  const username = user?.email?.split('@')[0] || 'user';

  // Search all pages by label + keywords
  const searchResults = search.trim().length > 1
    ? ALL_PAGES.filter(p => {
        const q = search.toLowerCase();
        return p.label.toLowerCase().includes(q) || p.keywords.some(k => k.toLowerCase().includes(q));
      })
    : [];

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = [...homeAppIds];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setHomeAppIds(items);
  };

  const removeApp = (id) => setHomeAppIds(prev => prev.filter(x => x !== id));

  return (
    <div className="min-h-screen text-white pb-24 overflow-x-hidden relative" style={{ backgroundColor: '#080810' }}>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundColor: bgColor, opacity: 0.12 }} />
      {(bgPattern !== 'none' || bgImage) && (
        <div className="fixed inset-0 pointer-events-none z-0" style={patternStyle(bgPattern, bgImage, bgImagePos)} />
      )}

      <div className="relative z-10">

        {/* World + Points row */}
        <div className="flex items-center justify-between px-4 pt-3">
          {worldInfo && (
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ background: worldInfo.bgColor, border: `1px solid ${worldInfo.borderColor}`, color: worldInfo.color }}>
              <span>{worldInfo.emoji}</span><span>{worldInfo.label}</span>
            </div>
          )}
          <div className="flex-1" />
          <button onClick={() => navigate('/glow-score')} className="flex items-center gap-1 glass rounded-full px-3 py-1 text-xs font-bold hover:opacity-80 transition">
            <span>🏅</span><span className="text-yellow-400">{totalPoints.toLocaleString()} {t('points')}</span><span className="text-gray-500 ml-1">›</span>
          </button>
        </div>

        {/* Header row */}
        <div className="flex items-center gap-3 px-4 pt-2 pb-3">
          <div onClick={() => navigate('/avatar')} className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-lg font-bold overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition">
            {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="avatar" /> : avatarConfig ? <AvatarPreview config={avatarConfig} size={56} /> : firstName[0]}
          </div>
          <div className="flex-1" />
          {isEditMode ? (
            <button onClick={() => setIsEditMode(false)} className="text-xs backdrop-blur-md bg-pink-500/20 border border-pink-500/40 rounded-full px-3 py-1.5 text-pink-300 font-semibold hover:bg-pink-500/30 transition">{t('done')}</button>
          ) : (
            <>
              <button onClick={() => setIsEditMode(true)} className="text-xs glass rounded-full px-3 py-1.5 text-gray-300 hover:text-white transition">{t('edit_home')}</button>
              <button onClick={() => setShowCustomize(true)} className="text-xs glass rounded-full px-3 py-1.5 text-gray-300 hover:text-white transition">{t('customize')}</button>
              <button onClick={async () => { if (window.confirm('Are you sure you want to sign out?')) { await base44.auth.logout('/'); } }} className="text-xs backdrop-blur-md bg-red-500/20 border border-red-500/40 rounded-full px-3 py-1.5 text-red-300 font-semibold hover:bg-red-500/30 transition">Sign Out</button>
            </>
          )}
        </div>

        {/* Greeting */}
        <div className="px-4 mb-4">
          <p className="text-gray-400 text-sm">{t(getGreeting())} ✨</p>
          <h1 className="text-2xl font-bold">Hey, {firstName} ✨</h1>
          <p className="text-gray-500 text-sm">@{username}</p>
        </div>

        {/* Daily Glow Check-In Banner */}
        <div className="px-4 mb-4">
          <button onClick={() => navigate('/daily-checkin')} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-left transition hover:opacity-90" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.5), rgba(168,85,247,0.4), rgba(236,72,153,0.3))', border: '1px solid rgba(168,85,247,0.4)' }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'rgba(168,85,247,0.3)' }}>✦</div>
            <div className="flex-1">
              <p className="text-xs font-bold tracking-wider text-yellow-400 mb-0.5">DAILY GLOW CHECK-IN</p>
              <p className="font-bold text-white text-base">How are you glowing today?</p>
              <p className="text-xs text-gray-400">Tap to check in &amp; earn points ✨</p>
            </div>
            <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
          </button>
        </div>

        {/* Quick Access — compact scrollable row */}
        {(showQuickAccess || isEditMode) && (
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold tracking-widest text-gray-500">{t('quick_access')}</p>
            {isEditMode ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setShowQuickPicker(true)} className="flex items-center gap-1 text-xs text-pink-400 font-semibold">
                  <Plus size={12} /> Edit
                </button>
                <button onClick={() => setShowQuickAccess(v => !v)} className={`text-xs font-semibold px-2 py-0.5 rounded-full border transition ${showQuickAccess ? 'border-green-500/40 bg-green-500/15 text-green-400' : 'border-gray-600 bg-white/5 text-gray-500'}`}>
                  {showQuickAccess ? 'Visible' : 'Hidden'}
                </button>
              </div>
            ) : (
              <button onClick={() => setShowQuickPicker(true)} className="flex items-center gap-1 text-xs text-pink-400 font-semibold">
                <Plus size={12} /> Edit
              </button>
            )}
          </div>
          {showQuickAccess && (
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {quickApps.map(app => (
              <button key={app.id} onClick={() => navigate(app.route)} className="flex flex-col items-center gap-1 flex-shrink-0 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition" style={{ minWidth: 52 }}>
                <span className="text-lg leading-none">{app.icon}</span>
                <span className="text-[9px] text-gray-400 text-center leading-tight" style={{ maxWidth: 48 }}>{app.label}</span>
              </button>
            ))}
            {!isEditMode && (
              <button onClick={() => setShowQuickPicker(true)} className="flex flex-col items-center justify-center gap-1 flex-shrink-0 px-3 py-2 rounded-2xl border border-dashed border-white/20 hover:border-pink-500/50 transition" style={{ minWidth: 52 }}>
                <Plus size={14} className="text-gray-500" />
                <span className="text-[9px] text-gray-500">Add</span>
              </button>
            )}
          </div>
          )}
        </div>
        )}

        {/* Search bar */}
        <div className="px-4 mb-5 relative">
          <div className="flex items-center glass rounded-full px-4 py-2.5 gap-2">
            <Search size={16} className="text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search_placeholder')} className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1" />
            {search && <button onClick={() => setSearch('')}><X size={14} className="text-gray-500" /></button>}
          </div>
          {searchResults.length > 0 && (
            <div className="absolute top-full left-4 right-4 mt-1 bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden z-10 shadow-xl">
              {searchResults.slice(0, 8).map(r => (
                <button key={r.id} onClick={() => { navigate(r.route); setSearch(''); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-gray-800 border-b border-gray-800 last:border-0 text-left">
                  <span>{r.icon}</span><span>{r.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Your World / Home Apps */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold tracking-widest text-gray-500">{t('your_world')}</p>
            {isEditMode && (
              <button onClick={() => setShowHomePicker(true)} className="flex items-center gap-1 text-xs text-pink-400 font-semibold">
                <Plus size={12} /> Add Apps
              </button>
            )}
          </div>
          {isEditMode ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="apps" direction="horizontal">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="grid grid-cols-4 gap-3">
                    {homeApps.map((app, index) => (
                      <Draggable key={app.id} draggableId={app.id} index={index}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`relative flex flex-col items-center gap-1.5 rounded-2xl p-3 select-none cursor-grab active:cursor-grabbing transition ${snapshot.isDragging ? 'opacity-70 scale-110' : 'animate-[wiggle_0.3s_ease-in-out_infinite]'}`} style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <button onClick={(e) => { e.stopPropagation(); removeApp(app.id); }} className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold z-10">&times;</button>
                            <span className="text-3xl">{app.icon}</span>
                            <span className="text-xs text-center text-gray-300 leading-tight">{app.label}</span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {homeApps.map(app => (
                <button key={app.id} onClick={() => navigate(app.route)} className="relative flex flex-col items-center gap-1.5 rounded-2xl p-3 cursor-pointer hover:scale-95 transition-transform glass-glow" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <span className="text-3xl">{app.icon}</span>
                  <span className="text-xs text-center text-gray-300 leading-tight">{app.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Glow Everywhere */}
        <div className="px-4 mb-2" />
        <div className="px-4 mb-6">
          <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">{t('glow_everywhere')}</p>
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {SOCIAL.map((s, i) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition ${i < SOCIAL.length - 1 ? 'border-b border-white/10' : ''}`}>
                <div className={`w-9 h-9 rounded-full ${s.color} flex items-center justify-center text-sm flex-shrink-0`}>{s.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.handle}</p>
                </div>
                <ChevronRight size={16} className="text-gray-500" />
              </a>
            ))}
          </div>
          <p className="text-center text-xs text-gray-600 mt-2">Tapping opens the app — GGU is not affiliated with these platforms</p>
        </div>

      </div>

      <BottomNav active="home" />

      {showCustomize && (
        <CustomizeModal bgColor={bgColor} setBgColor={setBgColor} bgPattern={bgPattern} setBgPattern={setBgPattern} bgImage={bgImage} setBgImage={setBgImage} bgImagePos={bgImagePos} setBgImagePos={setBgImagePos} onClose={() => setShowCustomize(false)} />
      )}

      {showHomePicker && (
        <PagePickerModal
          title="Choose Home Apps"
          currentIds={homeAppIds}
          onSave={setHomeAppIds}
          onClose={() => setShowHomePicker(false)}
        />
      )}

      {showQuickPicker && (
        <PagePickerModal
          title="Choose Quick Access"
          currentIds={quickIds}
          onSave={setQuickIds}
          onClose={() => setShowQuickPicker(false)}
        />
      )}
    </div>
  );
}