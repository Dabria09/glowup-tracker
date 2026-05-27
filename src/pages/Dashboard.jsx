import { useState, useEffect, useRef } from 'react';
import useAgeGroup from '@/lib/useAgeGroup';
import useTranslation from '@/lib/useTranslation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, X, Plus, Check } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import CustomizeModal from '@/components/CustomizeModal';
import AvatarPreview from '@/components/avatar/AvatarPreview';

const CDN = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663618716083/WDWw94kRE3Ddo7F9rGLvjC/';
const MANUS = 'https://gguapp-wdww94kr.manus.space/manus-storage/';
const MEDIA = 'https://media.base44.com/images/public/6a0e12a89992f9565c11e330/';

// All available pages — image icons match Discover exactly
const ALL_PAGES = [
  { id: 'daily-checkin', label: 'Glow Check-In', route: '/daily-checkin', image: MANUS + 'icon-glow-check-in_fe36a2ac.png', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', keywords: ['check in', 'mood', 'daily', 'points'] },
  { id: 'glow', label: 'My Glow', route: '/glow', gradient: 'from-pink-900 via-purple-900 to-fuchsia-900', emoji: '✨', keywords: ['challenges', 'streak', 'crown', 'badges', 'progress'] },
  { id: 'glow-feed', label: 'Glow Feed', route: '/glow-feed', image: CDN + 'icon-glow-up-feed-T2qbW3yLFS86GWn35JSQgk.webp', gradient: 'from-yellow-800 via-amber-900 to-pink-900', keywords: ['feed', 'posts', 'community', 'social'] },
  { id: 'glow-board', label: 'Glow Board', route: '/glow-board', image: CDN + 'icon-glow-board-4XSLLnCWyfrrYDHQ8zApA2.webp', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', keywords: ['photos', 'vision', 'inspiration', 'images'] },
  { id: 'glow-talk', label: 'Glow Talk', route: '/glow-talk', image: CDN + 'icon-glow-talk-ewK3HLMfZYVeNKLD3iLrKz.webp', gradient: 'from-pink-900 via-fuchsia-900 to-purple-900', keywords: ['chat', 'messages', 'talk', 'rooms'] },
  { id: 'shout-outs', label: 'Shout Outs', route: '/shout-outs', image: CDN + 'icon-shout-outs-NTrE9c8n5rJCznKxgqLihW.webp', gradient: 'from-orange-900 via-red-900 to-pink-900', keywords: ['praise', 'recognition', 'props'] },
  { id: 'leaderboard', label: 'Leaderboard', route: '/leaderboard', image: CDN + 'icon-leaderboard-WLMjT77VCu94JhWg7vXfbm.webp', gradient: 'from-yellow-800 via-pink-900 to-fuchsia-900', keywords: ['ranking', 'top', 'scores', 'competition'] },
  { id: 'challenge-leaderboard', label: 'Challenge Board', route: '/challenge-leaderboard', image: CDN + 'icon-leaderboard-WLMjT77VCu94JhWg7vXfbm.webp', gradient: 'from-yellow-800 via-pink-900 to-fuchsia-900', keywords: ['challenge', 'ranking', 'competition'] },
  { id: 'glow-teams', label: 'Glow Teams', route: '/glow-teams', image: MANUS + 'icon-teams_6ca08712.png', gradient: 'from-purple-900 via-indigo-900 to-pink-900', keywords: ['team', 'group', 'compete'] },
  { id: 'glow-squads', label: 'Glow Squads', route: '/glow-squads', image: MANUS + 'icon-glow-squads-v2_61c9bc2b.png', gradient: 'from-fuchsia-900 via-pink-900 to-purple-900', keywords: ['squad', 'friends', 'close', 'circle'] },
  { id: 'community-hub', label: 'Community Hub', route: '/community-hub', image: CDN + 'icon-community-hub-v2-feRBzspWzoghy2BCvatoSn.webp', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', keywords: ['community', 'groups', 'people'] },
  { id: 'mentorship', label: 'Mentorship', route: '/mentorship', image: CDN + 'icon-mentorship-HYC9V34WnU3LfmtQfCTwiP.webp', gradient: 'from-purple-900 via-pink-900 to-rose-900', keywords: ['mentor', 'guidance', 'learning', 'coach'] },
  { id: 'meal-planner', label: 'Meal Planner', route: '/meal-planner', image: MEDIA + '3f8b8ce77_generated_image.png', gradient: 'from-green-900 via-teal-900 to-emerald-900', keywords: ['food', 'meals', 'nutrition', 'eat', 'diet'] },
  { id: 'grocery-list', label: 'Grocery List', route: '/grocery-list', image: CDN + 'icon-grocery-list-Sz9GHLVJt4pRGz2JvYmwDw.webp', gradient: 'from-yellow-700 via-amber-800 to-orange-800', keywords: ['groceries', 'shopping', 'food', 'list'] },
  { id: 'glow-kitchen', label: 'Glow Kitchen', route: '/glow-kitchen', image: CDN + 'icon-glow-kitchen-WyHBfNCsiaR38BJ6YjES3Q.webp', gradient: 'from-rose-900 via-pink-900 to-fuchsia-900', keywords: ['recipes', 'cook', 'kitchen', 'food'] },
  { id: 'fitness-tracker', label: 'Fitness', route: '/fitness-tracker', image: CDN + 'icon-flex-fitness_tracker-QvdXMwiTH22d77fpWaYMoZ.webp', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', keywords: ['workout', 'exercise', 'fitness', 'health', 'gym'] },
  { id: 'wellness-hub', label: 'Wellness Hub', route: '/wellness-hub', image: MANUS + 'icon-wellness-hub_a68ae95a.png', gradient: 'from-purple-900 via-pink-900 to-rose-900', keywords: ['wellness', 'health', 'self care', 'mental'] },
  { id: 'cycle-tracker', label: 'Cycle Tracker', route: '/cycle-tracker', image: CDN + 'icon-cycle-tracker-mfEEuehTKonzHUdUSmTMaA.webp', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', keywords: ['period', 'cycle', 'health', 'body'] },
  { id: 'calm-corner', label: 'Calm Corner', route: '/calm-corner', image: MANUS + 'icon-calm-corner_ef4b2861.png', gradient: 'from-amber-900 via-orange-900 to-rose-900', keywords: ['meditation', 'calm', 'relax', 'breathe'] },
  { id: 'spiritual-glow', label: 'Spiritual Glow', route: '/spiritual-glow', image: CDN + 'icon-spiritual-glow-Y4zxRVLXJn8CpnpefTixYM.webp', gradient: 'from-indigo-900 via-purple-900 to-violet-900', keywords: ['spiritual', 'faith', 'prayer', 'gratitude'] },
  { id: 'diary', label: 'My Diary', route: '/diary', image: CDN + 'icon-my-diary-hV9wyJJ7diLH36nJFHSGb4.webp', gradient: 'from-pink-800 via-purple-900 to-rose-900', keywords: ['journal', 'diary', 'write', 'thoughts', 'feelings'] },
  { id: 'vision-board', label: 'Vision Board', route: '/vision-board', image: MEDIA + '6adb092a1_IMG_4341.jpeg', gradient: 'from-pink-900 via-rose-900 to-orange-900', keywords: ['goals', 'dreams', 'vision', 'future', 'manifestation'] },
  { id: 'my-goals', label: 'My Goals', route: '/my-goals', image: MEDIA + 'a1aa2e5b9_IMG_4995.jpeg', gradient: 'from-purple-900 via-pink-900 to-fuchsia-900', keywords: ['goals', 'targets', 'achieve', 'aims'] },
  { id: 'glow-up-challenges', label: 'Transformation', route: '/glow-up-challenges', image: CDN + 'icon-transformation-P5fD4QdfoP2Dkjf4cUfe5g.webp', gradient: 'from-purple-900 via-violet-900 to-fuchsia-900', keywords: ['challenge', '30 day', 'glow up', 'improve'] },
  { id: 'my-certificates', label: 'Certificates', route: '/my-certificates', image: MEDIA + 'db352357b_generated_image.png', gradient: 'from-yellow-700 via-amber-800 to-yellow-900', keywords: ['certificate', 'achievement', 'completed', 'award'] },
  { id: 'glow-score', label: 'Glow Score', route: '/glow-score', image: MEDIA + '93e848a21_IMG_4972.jpg', gradient: 'from-yellow-800 via-amber-900 to-yellow-900', keywords: ['score', 'level', 'tier', 'points', 'ranking'] },
  { id: 'daily-challenges', label: 'Daily Challenges', route: '/daily-challenges', image: CDN + 'icon-daily-challenges-5aR9HwiMcVmjJVeR6dG8u8.webp', gradient: 'from-pink-900 via-rose-900 to-red-900', keywords: ['tasks', 'daily', 'challenge', 'complete'] },
  { id: 'daily-quotes', label: 'Daily Quotes', route: '/daily-quotes', image: CDN + 'icon-daily-quotes-HvcRFzha7VDVnsWvcwnxkn.webp', gradient: 'from-yellow-800 via-amber-900 to-orange-900', keywords: ['quotes', 'inspiration', 'motivation'] },
  { id: 'glow-tips', label: 'Glow Tips', route: '/glow-tips', image: CDN + 'icon-glow-tips-KryoBvfwicfNDGnBszfh8g.webp', gradient: 'from-violet-900 via-purple-900 to-indigo-900', keywords: ['tips', 'advice', 'beauty', 'self care'] },
  { id: 'weekly-theme', label: 'Weekly Theme', route: '/weekly-theme', image: CDN + 'icon-weekly-theme-Ddu6T87k5StF8EDt5BYehk.webp', gradient: 'from-pink-900 via-fuchsia-900 to-purple-900', keywords: ['weekly', 'theme', 'focus', 'goals'] },
  { id: 'me-vs-me', label: 'Me vs Me', route: '/me-vs-me', image: CDN + 'icon-me-vs-me-KYCb7xc6LGLzVW9UGpUEWp.webp', gradient: 'from-yellow-900 via-pink-900 to-black', keywords: ['progress', 'personal', 'growth', 'compare'] },
  { id: 'scholarships', label: 'Scholarships', route: '/scholarships', image: MANUS + 'icon-diploma-education_12164ff4.png', gradient: 'from-amber-900 via-yellow-900 to-orange-900', keywords: ['scholarship', 'money', 'college', 'award', 'education'] },
  { id: 'careers', label: 'Career Explorer', route: '/careers', image: CDN + 'icon-career-explorer-8j63MBeNyT9uZDM7Jtmztz.webp', gradient: 'from-yellow-800 via-amber-900 to-orange-900', keywords: ['career', 'jobs', 'profession', 'future'] },
  { id: 'job-tracker', label: 'Job Tracker', route: '/job-tracker', gradient: 'from-blue-900 via-indigo-900 to-purple-900', emoji: '📋', keywords: ['job', 'application', 'work', 'employment'] },
  { id: 'dream-calculator', label: 'Dream Calculator', route: '/dream-calculator', image: MANUS + 'icon-dream-calculator_0ac76f98.png', gradient: 'from-indigo-900 via-purple-900 to-blue-900', keywords: ['money', 'dream', 'salary', 'calculate'] },
  { id: 'money-tracker', label: 'Money & Savings', route: '/money-tracker', image: CDN + 'icon-money-tracker-2TYacsiWgAXqNkGsYeqxTn.webp', gradient: 'from-yellow-800 via-amber-900 to-yellow-900', keywords: ['money', 'budget', 'finance', 'spend', 'save'] },
  { id: 'savings-goals', label: 'Savings Goals', route: '/savings-goals', gradient: 'from-green-900 via-emerald-900 to-teal-900', emoji: '🏦', keywords: ['save', 'savings', 'money', 'goals', 'bank'] },
  { id: 'homework-tracker', label: 'Homework', route: '/homework-tracker', image: CDN + 'icon-homework-tracker-UzfmPy6kuzvUAsU3vgon39.webp', gradient: 'from-gray-800 via-slate-900 to-gray-900', keywords: ['homework', 'school', 'study', 'academic', 'assignment'] },
  { id: 'ggu-academy', label: 'GGU Academy', route: '/ggu-academy', image: CDN + 'icon-ggu-academy-KcP2723cbWjawrV5CXFVoa.webp', gradient: 'from-pink-900 via-purple-900 to-pink-800', keywords: ['academy', 'learn', 'course', 'education', 'school'] },
  { id: 'growth-mindset', label: 'Growth Mindset', route: '/growth-mindset', image: MANUS + 'icon-growth-mindset_a5fa4874.png', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', keywords: ['mindset', 'growth', 'positive', 'confidence'] },
  { id: 'girls-library', label: "Girls' Library", route: '/girls-library', image: CDN + 'icon-library-fYQUmdRKLjKeb8kEpFXuZz.webp', gradient: 'from-amber-800 via-orange-900 to-yellow-900', keywords: ['books', 'read', 'library', 'literature'] },
  { id: 'your-voice', label: 'Your Voice', route: '/your-voice', image: CDN + 'icon-your-voice-EfuNjY9nzEGsR3k7RWGZKq.webp', gradient: 'from-rose-900 via-red-900 to-pink-900', keywords: ['voice', 'speak', 'opinions', 'debate'] },
  { id: 'glow-playlist', label: 'Glow Playlist', route: '/glow-playlist', image: MEDIA + '4fb776ff6_generated_image.png', gradient: 'from-pink-900 via-purple-900 to-fuchsia-900', keywords: ['playlist', 'music', 'songs', 'vibe'] },
  { id: 'countdown', label: 'Countdown', route: '/countdown', image: CDN + 'icon-countdown-7HeWEhC3DPLUnHCzG43qTW.webp', gradient: 'from-fuchsia-900 via-purple-900 to-pink-900', keywords: ['countdown', 'timer', 'event', 'date'] },
  { id: 'my-calendar', label: 'My Calendar', route: '/my-calendar', image: CDN + 'icon-my-calendar-55x8hsLegkBBMSVxNXFap5.webp', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', keywords: ['calendar', 'schedule', 'events', 'dates'] },
  { id: 'birthday-planner', label: 'Birthday Planner', route: '/birthday-planner', image: CDN + 'icon-birthday-planner-Qp8X5ePr97LrHNc2yucHpS.webp', gradient: 'from-pink-800 via-rose-900 to-fuchsia-900', keywords: ['birthday', 'party', 'event', 'celebrate'] },
  { id: 'trip-planner', label: 'Trip Planner', route: '/trip-planner', image: CDN + 'icon-trip-planner-QAiWdgEFB9pMKaHeuK6ZMu.webp', gradient: 'from-blue-900 via-indigo-900 to-purple-900', keywords: ['trip', 'travel', 'vacation', 'plan'] },
  { id: 'cleaning-calendar', label: 'Cleaning Calendar', route: '/cleaning-calendar', image: CDN + 'icon-cleaning-calendar-XC5nXr5kSwExbkzykThJEr.webp', gradient: 'from-pink-900 via-fuchsia-900 to-purple-900', keywords: ['clean', 'chores', 'home', 'organize'] },
  { id: 'sticky-notes', label: 'Sticky Notes', route: '/sticky-notes', image: CDN + 'icon-ggu-notes-YfCNPjnpsmHMjZkm5VACrP.webp', gradient: 'from-violet-900 via-purple-900 to-fuchsia-900', keywords: ['notes', 'reminder', 'sticky', 'memo'] },
  { id: 'time-management', label: 'Time Management', route: '/time-management', image: CDN + 'icon-time-management-LRboeGD2hk8GxmG3SPgSrU.webp', gradient: 'from-purple-900 via-pink-900 to-rose-900', keywords: ['time', 'schedule', 'manage', 'productive'] },
  { id: 'important-contacts', label: 'Contacts', route: '/important-contacts', image: CDN + 'icon-important-contacts-UbmbL7qNMiaxYU2N3To7LT.webp', gradient: 'from-teal-900 via-cyan-900 to-blue-900', keywords: ['contacts', 'phone', 'people', 'emergency'] },
  { id: 'password-vault', label: 'Password Vault', route: '/password-vault', image: CDN + 'icon-password-vault-M6NfKgvjrqX84pzi4yKu4c.webp', gradient: 'from-yellow-800 via-amber-900 to-gray-900', keywords: ['password', 'security', 'vault', 'private'] },
  { id: 'my-glow-link', label: 'My Glow Link', route: '/my-glow-link', image: CDN + 'icon-my-glow-link-74jzirPfc7YN8uTh9fGCeE.webp', gradient: 'from-yellow-800 via-amber-900 to-orange-900', keywords: ['profile', 'link', 'share', 'public'] },
  { id: 'glow-store', label: 'Glow Store', route: '/glow-store', gradient: 'from-pink-900 via-purple-900 to-fuchsia-900', emoji: '🛍️', keywords: ['store', 'shop', 'rewards', 'items', 'buy'] },
  { id: 'support', label: 'Help & Support', route: '/support', gradient: 'from-rose-900 via-pink-900 to-red-900', emoji: '💜', keywords: ['help', 'support', 'contact', 'issue'] },
];

const DEFAULT_HOME_IDS = ['daily-checkin', 'glow', 'glow-feed', 'fitness-tracker', 'diary', 'vision-board', 'glow-up-challenges', 'my-goals'];
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
};

const patternStyle = (pattern, bgImage, bgImagePos = { x: 50, y: 50 }) => {
  if (bgImage) return { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: `${bgImagePos.x}% ${bgImagePos.y}%` };
  if (pattern && pattern !== 'none' && PATTERN_SVGS[pattern]) {
    return { backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(PATTERN_SVGS[pattern])}")` };
  }
  return {};
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'greeting_morning';
  if (h < 17) return 'greeting_afternoon';
  return 'greeting_evening';
}

function loadSavedIds(key, defaults) {
  try { const s = localStorage.getItem(key); if (s) return JSON.parse(s); } catch {}
  return defaults;
}

// iPhone-style app icon
function HomeAppIcon({ app, isEdit, onRemove, dragHandleProps, dragInnerRef, isDragging, style }) {
  return (
    <div ref={dragInnerRef} style={style} {...(dragHandleProps || {})}
      className={`relative flex flex-col items-center gap-1.5 select-none ${isDragging ? 'opacity-70 scale-110 z-50' : ''} ${isEdit ? 'animate-[wiggle_0.35s_ease-in-out_infinite]' : ''}`}>
      {isEdit && (
        <button onPointerDown={e => { e.stopPropagation(); onRemove(); }}
          className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-black border border-white/30 flex items-center justify-center text-white text-xs font-bold z-20 shadow-lg">
          <X size={10} />
        </button>
      )}
      <div className={`w-[72px] h-[72px] rounded-[16px] overflow-hidden shadow-lg border border-white/10 ${app.image ? '' : 'bg-gradient-to-br ' + app.gradient + ' flex items-center justify-center'}`}
        style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
        {app.image
          ? <img src={app.image} alt={app.label} className="w-full h-full object-cover" />
          : <span className="text-3xl drop-shadow-lg">{app.emoji}</span>}
      </div>
      <span className="text-[10px] text-center text-gray-300 leading-tight w-[76px]">{app.label}</span>
    </div>
  );
}

// Quick access compact chip
function QuickChip({ app, onNavigate }) {
  return (
    <button onClick={() => onNavigate(app.route)}
      className="flex flex-col items-center gap-1 flex-shrink-0 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition overflow-hidden"
      style={{ width: 58, paddingTop: 6, paddingBottom: 6 }}>
      <div className={`w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center ${app.image ? '' : 'bg-gradient-to-br ' + app.gradient}`}>
        {app.image ? <img src={app.image} alt={app.label} className="w-full h-full object-cover" /> : <span className="text-base">{app.emoji}</span>}
      </div>
      <span className="text-[9px] text-gray-400 text-center leading-tight px-1" style={{ maxWidth: 54 }}>{app.label}</span>
    </button>
  );
}

// Page picker modal (search all pages)
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search all pages..." className="bg-transparent text-sm text-white outline-none flex-1 placeholder-gray-500" autoFocus />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(page => {
              const isOn = selected.includes(page.id);
              return (
                <button key={page.id} onClick={() => toggle(page.id)} className="flex items-center gap-2 p-3 rounded-2xl text-left transition" style={{ background: isOn ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isOn ? 'rgba(236,72,153,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
                  <div className={`w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center ${page.image ? '' : 'bg-gradient-to-br ' + page.gradient}`}>
                    {page.image ? <img src={page.image} alt={page.label} className="w-full h-full object-cover" /> : <span className="text-base">{page.emoji}</span>}
                  </div>
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
  const [homeAppIds, setHomeAppIds] = useState(() => loadSavedIds('ggu_home_apps', DEFAULT_HOME_IDS));
  const [quickIds, setQuickIds] = useState(() => loadSavedIds('ggu_quick_access', DEFAULT_QUICK_IDS));
  const [showQuickAccess, setShowQuickAccess] = useState(() => { try { return localStorage.getItem('ggu_show_quick') !== 'false'; } catch { return true; } });
  const [showHomePicker, setShowHomePicker] = useState(false);
  const [showQuickPicker, setShowQuickPicker] = useState(false);

  // Long-press to enter edit mode (iPhone-style)
  const longPressTimer = useRef(null);
  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => setIsEditMode(true), 600);
  };
  const handleLongPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const homeApps = homeAppIds.map(id => ALL_PAGES.find(p => p.id === id)).filter(Boolean);
  const quickApps = quickIds.map(id => ALL_PAGES.find(p => p.id === id)).filter(Boolean);

  useEffect(() => { localStorage.setItem('ggu_home_apps', JSON.stringify(homeAppIds)); }, [homeAppIds]);
  useEffect(() => { localStorage.setItem('ggu_quick_access', JSON.stringify(quickIds)); }, [quickIds]);
  useEffect(() => { localStorage.setItem('ggu_show_quick', showQuickAccess); }, [showQuickAccess]);
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

  return (
    <div className="min-h-screen text-white pb-24 overflow-x-hidden relative" style={{ backgroundColor: '#080810' }}
      onClick={isEditMode ? () => setIsEditMode(false) : undefined}>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundColor: bgColor, opacity: 0.12 }} />
      {(bgPattern !== 'none' || bgImage) && (
        <div className="fixed inset-0 pointer-events-none z-0" style={patternStyle(bgPattern, bgImage, bgImagePos)} />
      )}

      <div className="relative z-10" onClick={e => e.stopPropagation()}>

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

        {/* Avatar + header controls */}
        <div className="flex items-center gap-3 px-4 pt-2 pb-3">
          <div onClick={() => navigate('/avatar')} className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-lg font-bold overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition">
            {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="avatar" /> : avatarConfig ? <AvatarPreview config={avatarConfig} size={56} /> : firstName[0]}
          </div>
          <div className="flex-1" />
          {isEditMode ? (
            <button onClick={() => setIsEditMode(false)} className="text-xs backdrop-blur-md bg-pink-500/20 border border-pink-500/40 rounded-full px-3 py-1.5 text-pink-300 font-semibold hover:bg-pink-500/30 transition">Done</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setShowCustomize(true)} className="text-xs glass rounded-full px-3 py-1.5 text-gray-300 hover:text-white transition">{t('customize')}</button>
              <button onClick={async () => { if (window.confirm('Are you sure you want to sign out?')) { await base44.auth.logout('/'); } }} className="text-xs backdrop-blur-md bg-red-500/20 border border-red-500/40 rounded-full px-3 py-1.5 text-red-300 font-semibold hover:bg-red-500/30 transition">Sign Out</button>
            </div>
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
            <div className="w-11 h-11 rounded-2xl overflow-hidden flex-shrink-0">
              <img src={MANUS + 'icon-glow-check-in_fe36a2ac.png'} className="w-full h-full object-cover" alt="check in" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold tracking-wider text-yellow-400 mb-0.5">DAILY GLOW CHECK-IN</p>
              <p className="font-bold text-white text-base">How are you glowing today?</p>
              <p className="text-xs text-gray-400">Tap to check in &amp; earn points ✨</p>
            </div>
            <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
          </button>
        </div>

        {/* Quick Access */}
        {(showQuickAccess || isEditMode) && (
          <div className="px-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold tracking-widest text-gray-500">{t('quick_access')}</p>
              {isEditMode ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowQuickPicker(true)} className="flex items-center gap-1 text-xs text-pink-400 font-semibold"><Plus size={12} /> Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); setShowQuickAccess(v => !v); }} className={`text-xs font-semibold px-2 py-0.5 rounded-full border transition ${showQuickAccess ? 'border-green-500/40 bg-green-500/15 text-green-400' : 'border-gray-600 bg-white/5 text-gray-500'}`}>
                    {showQuickAccess ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowQuickPicker(true)} className="flex items-center gap-1 text-xs text-pink-400 font-semibold"><Plus size={12} /> Edit</button>
              )}
            </div>
            {showQuickAccess && (
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {quickApps.map(app => <QuickChip key={app.id} app={app} onNavigate={navigate} />)}
                {!isEditMode && (
                  <button onClick={() => setShowQuickPicker(true)} className="flex flex-col items-center justify-center gap-1 flex-shrink-0 rounded-2xl border border-dashed border-white/20 hover:border-pink-500/50 transition" style={{ width: 58, paddingTop: 6, paddingBottom: 6 }}>
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
                  <div className={`w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center ${r.image ? '' : 'bg-gradient-to-br ' + r.gradient}`}>
                    {r.image ? <img src={r.image} alt={r.label} className="w-full h-full object-cover" /> : <span className="text-sm">{r.emoji}</span>}
                  </div>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Home Apps — iPhone-style grid with long press to jiggle */}
        <div className="px-4 mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold tracking-widest text-gray-500">{t('your_world')}</p>
            {isEditMode ? (
              <button onClick={() => setShowHomePicker(true)} className="flex items-center gap-1 text-xs text-pink-400 font-semibold"><Plus size={12} /> Add Apps</button>
            ) : (
              <p className="text-xs text-gray-600">Hold to rearrange</p>
            )}
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="apps" direction="horizontal">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}
                  className="grid grid-cols-4 gap-x-2 gap-y-5"
                  onMouseDown={isEditMode ? undefined : handleLongPressStart}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  onTouchStart={isEditMode ? undefined : handleLongPressStart}
                  onTouchEnd={handleLongPressEnd}>
                  {homeApps.map((app, index) => (
                    <Draggable key={app.id} draggableId={app.id} index={index} isDragDisabled={!isEditMode}>
                      {(provided, snapshot) => (
                        <HomeAppIcon
                          app={app}
                          isEdit={isEditMode}
                          onRemove={() => setHomeAppIds(prev => prev.filter(x => x !== app.id))}
                          dragHandleProps={{ ...provided.draggableProps, ...provided.dragHandleProps }}
                          dragInnerRef={provided.innerRef}
                          isDragging={snapshot.isDragging}
                          style={provided.draggableProps.style}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Spacer between apps and social */}
        <div className="mx-4 mb-6 border-t border-white/8" />

        {/* Glow Everywhere — Social */}
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
        <PagePickerModal title="Choose Home Apps" currentIds={homeAppIds} onSave={setHomeAppIds} onClose={() => setShowHomePicker(false)} />
      )}
      {showQuickPicker && (
        <PagePickerModal title="Choose Quick Access" currentIds={quickIds} onSave={setQuickIds} onClose={() => setShowQuickPicker(false)} />
      )}
    </div>
  );
}