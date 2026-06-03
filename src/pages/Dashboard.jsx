import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useAgeGroup from '@/lib/useAgeGroup';
import useTranslation from '@/lib/useTranslation';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Search, X, Plus, Check, ChevronRight, Settings } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import CustomizeModal from '@/components/CustomizeModal';
import AvatarPreview from '@/components/avatar/AvatarPreview';
import UserAvatarDisplay from '@/components/UserAvatarDisplay';

const CDN = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663618716083/WDWw94kRE3Ddo7F9rGLvjC/';
const MANUS = 'https://gguapp-wdww94kr.manus.space/manus-storage/';
const MEDIA = 'https://media.base44.com/images/public/6a0e12a89992f9565c11e330/';

const G = MEDIA;
const ALL_PAGES = [
  { id: 'daily-checkin', label: 'Glow Check-In', route: '/daily-checkin', image: MANUS + 'icon-glow-check-in_fe36a2ac.png?v=2', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', keywords: ['check in', 'mood', 'daily', 'points'] },
  { id: 'glow', label: 'My Glow', route: '/glow', gradient: 'from-pink-900 via-purple-900 to-fuchsia-900', emoji: '✨', keywords: ['challenges', 'streak', 'crown', 'badges', 'progress'] },
  { id: 'glow-feed', label: 'Glow Feed', route: '/glow-feed', image: G + 'b54c35ab5_generated_image.png?v=2', gradient: 'from-yellow-800 via-amber-900 to-pink-900', keywords: ['feed', 'posts', 'community', 'social'] },
  { id: 'glow-board', label: 'Glow Board', route: '/glow-board', image: G + 'a76e19c27_generated_image.png?v=2', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', keywords: ['photos', 'vision', 'inspiration'] },
  { id: 'glow-talk', label: 'Glow Talk', route: '/glow-talk', image: G + 'b718f5c26_generated_image.png?v=2', gradient: 'from-pink-900 via-fuchsia-900 to-purple-900', keywords: ['chat', 'messages', 'talk'] },
  { id: 'shout-outs', label: 'Shout Outs', route: '/shout-outs', image: G + '841f8b508_generated_image.png?v=2', gradient: 'from-orange-900 via-red-900 to-pink-900', keywords: ['praise', 'recognition'] },
  { id: 'leaderboard', label: 'Leaderboard', route: '/leaderboard', image: G + '62de76922_generated_image.png?v=2', gradient: 'from-yellow-800 via-pink-900 to-fuchsia-900', keywords: ['ranking', 'top', 'scores'] },
  { id: 'challenge-leaderboard', label: 'Challenge Board', route: '/challenge-leaderboard', image: G + '62de76922_generated_image.png?v=2', gradient: 'from-yellow-800 via-pink-900 to-fuchsia-900', keywords: ['challenge', 'ranking'] },
  { id: 'glow-teams', label: 'Glow Teams', route: '/glow-teams', image: G + '23b34cbd3_generated_image.png?v=2', gradient: 'from-purple-900 via-indigo-900 to-pink-900', keywords: ['team', 'group', 'compete'] },
  { id: 'glow-squads', label: 'Glow Squads', route: '/glow-squads', image: G + 'b990d5ccf_generated_image.png?v=2', gradient: 'from-fuchsia-900 via-pink-900 to-purple-900', keywords: ['squad', 'friends', 'circle'] },
  { id: 'community-hub', label: 'Community Hub', route: '/community-hub', image: G + 'b903c9fb6_generated_image.png?v=2', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', keywords: ['community', 'groups'] },
  { id: 'mentorship', label: 'Mentorship', route: '/mentorship', image: G + '747986b99_generated_image.png?v=2', gradient: 'from-purple-900 via-pink-900 to-rose-900', keywords: ['mentor', 'guidance', 'coach'] },
  { id: 'meal-planner', label: 'Meal Planner', route: '/meal-planner', image: G + '3a9192283_generated_image.png?v=2', gradient: 'from-green-900 via-teal-900 to-emerald-900', keywords: ['food', 'meals', 'nutrition'] },
  { id: 'grocery-list', label: 'Grocery List', route: '/grocery-list', image: G + 'd3a3fe1f2_generated_image.png?v=2', gradient: 'from-yellow-700 via-amber-800 to-orange-800', keywords: ['groceries', 'shopping', 'food'] },
  { id: 'glow-kitchen', label: 'Glow Kitchen', route: '/glow-kitchen', image: G + 'ad580c299_generated_image.png?v=2', gradient: 'from-rose-900 via-pink-900 to-fuchsia-900', keywords: ['recipes', 'cook', 'kitchen'] },
  { id: 'fitness-tracker', label: 'Fitness', route: '/fitness-tracker', image: G + '21e8efe1c_generated_image.png?v=2', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', keywords: ['workout', 'exercise', 'fitness'] },
  { id: 'wellness-hub', label: 'Wellness Hub', route: '/wellness-hub', image: MANUS + 'icon-wellness-hub_a68ae95a.png?v=2', gradient: 'from-purple-900 via-pink-900 to-rose-900', keywords: ['wellness', 'health', 'self care'] },
  { id: 'cycle-tracker', label: 'Cycle Tracker', route: '/cycle-tracker', image: G + 'ee7ef7b01_generated_image.png?v=2', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', keywords: ['period', 'cycle', 'health'] },
  { id: 'calm-corner', label: 'Calm Corner', route: '/calm-corner', gradient: 'from-amber-900 via-orange-900 to-rose-900', emoji: '🧘', keywords: ['meditation', 'calm', 'relax'] },
  { id: 'spiritual-glow', label: 'Spiritual Glow', route: '/spiritual-glow', image: G + '36c281277_generated_image.png?v=2', gradient: 'from-indigo-900 via-purple-900 to-violet-900', keywords: ['spiritual', 'faith', 'prayer'] },
  { id: 'diary', label: 'My Diary', route: '/diary', image: G + 'b9cbbd278_generated_image.png?v=2', gradient: 'from-pink-800 via-purple-900 to-rose-900', keywords: ['journal', 'diary', 'write', 'thoughts'] },
  { id: 'vision-board', label: 'Vision Board', route: '/vision-board', image: G + 'f62dbe5d2_generated_image.png?v=2', gradient: 'from-pink-900 via-rose-900 to-orange-900', keywords: ['goals', 'dreams', 'vision'] },
  { id: 'my-goals', label: 'My Goals', route: '/my-goals', image: G + '516e41b53_generated_image.png?v=2', gradient: 'from-purple-900 via-pink-900 to-fuchsia-900', keywords: ['goals', 'targets', 'achieve'] },
  { id: 'glow-up-challenges', label: 'Transformation', route: '/glow-up-challenges', gradient: 'from-purple-900 via-violet-900 to-fuchsia-900', emoji: '🦋', keywords: ['challenge', '30 day', 'glow up'] },
  { id: 'my-certificates', label: 'Certificates', route: '/my-certificates', image: G + 'db352357b_generated_image.png?v=2', gradient: 'from-yellow-700 via-amber-800 to-yellow-900', keywords: ['certificate', 'achievement'] },
  { id: 'glow-score', label: 'Glow Score', route: '/glow-score', image: G + '93e848a21_IMG_4972.jpg?v=2', gradient: 'from-yellow-800 via-amber-900 to-yellow-900', keywords: ['score', 'level', 'tier', 'points'] },
  { id: 'daily-challenges', label: 'Daily Challenges', route: '/daily-challenges', gradient: 'from-pink-900 via-rose-900 to-red-900', emoji: '🔥', keywords: ['tasks', 'daily', 'challenge'] },
  { id: 'daily-quotes', label: 'Daily Quotes', route: '/daily-quotes', gradient: 'from-yellow-800 via-amber-900 to-orange-900', emoji: '✨', keywords: ['quotes', 'inspiration', 'motivation'] },
  { id: 'glow-tips', label: 'Glow Tips', route: '/glow-tips', gradient: 'from-violet-900 via-purple-900 to-indigo-900', emoji: '💡', keywords: ['tips', 'advice', 'beauty'] },
  { id: 'weekly-theme', label: 'Weekly Theme', route: '/weekly-theme', gradient: 'from-pink-900 via-fuchsia-900 to-purple-900', emoji: '🌟', keywords: ['weekly', 'theme', 'focus'] },
  { id: 'me-vs-me', label: 'Me vs Me', route: '/me-vs-me', gradient: 'from-yellow-900 via-pink-900 to-black', emoji: '💪', keywords: ['progress', 'personal', 'growth'] },
  { id: 'scholarships', label: 'Scholarships', route: '/scholarships', image: G + 'e63ad859e_generated_image.png?v=2', gradient: 'from-amber-900 via-yellow-900 to-orange-900', keywords: ['scholarship', 'money', 'college'] },
  { id: 'careers', label: 'Career Explorer', route: '/careers', image: G + '690d53027_generated_image.png?v=2', gradient: 'from-yellow-800 via-amber-900 to-orange-900', keywords: ['career', 'jobs', 'future'] },
  { id: 'dream-calculator', label: 'Dream Calculator', route: '/dream-calculator', gradient: 'from-indigo-900 via-purple-900 to-blue-900', emoji: '💸', keywords: ['money', 'dream', 'salary'] },
  { id: 'money-tracker', label: 'Money & Savings', route: '/money-tracker', image: G + '318604697_generated_image.png?v=2', gradient: 'from-yellow-800 via-amber-900 to-yellow-900', keywords: ['money', 'budget', 'finance'] },
  { id: 'savings-goals', label: 'Savings Goals', route: '/savings-goals', gradient: 'from-green-900 via-emerald-900 to-teal-900', emoji: '🏦', keywords: ['save', 'savings', 'money', 'goals'] },
  { id: 'homework-tracker', label: 'Homework', route: '/homework-tracker', image: G + 'c390f66c0_generated_image.png?v=2', gradient: 'from-gray-800 via-slate-900 to-gray-900', keywords: ['homework', 'school', 'study'] },
  { id: 'ggu-academy', label: 'GGU Academy', route: '/ggu-academy', gradient: 'from-pink-900 via-purple-900 to-pink-800', emoji: '📚', keywords: ['academy', 'learn', 'education'] },
  { id: 'growth-mindset', label: 'Growth Mindset', route: '/growth-mindset', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', emoji: '🌱', keywords: ['mindset', 'growth', 'positive'] },
  { id: 'girls-library', label: "Girls' Library", route: '/girls-library', gradient: 'from-amber-800 via-orange-900 to-yellow-900', emoji: '📖', keywords: ['books', 'read', 'library'] },
  { id: 'your-voice', label: 'Your Voice', route: '/your-voice', gradient: 'from-rose-900 via-red-900 to-pink-900', emoji: '🎤', keywords: ['voice', 'speak', 'opinions'] },
  { id: 'glow-playlist', label: 'Glow Playlist', route: '/glow-playlist', image: G + '6445f243c_generated_image.png?v=2', gradient: 'from-pink-900 via-purple-900 to-fuchsia-900', keywords: ['playlist', 'music', 'songs'] },
  { id: 'countdown', label: 'Countdown', route: '/countdown', image: G + 'f112832da_generated_image.png?v=2', gradient: 'from-fuchsia-900 via-purple-900 to-pink-900', keywords: ['countdown', 'timer', 'event'] },
  { id: 'my-calendar', label: 'My Calendar', route: '/my-calendar', image: G + '8c01385ea_generated_image.png?v=2', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', keywords: ['calendar', 'schedule', 'events'] },
  { id: 'birthday-planner', label: 'Birthday Planner', route: '/birthday-planner', image: G + 'f61e7abcd_generated_image.png?v=2', gradient: 'from-pink-800 via-rose-900 to-fuchsia-900', keywords: ['birthday', 'party', 'event'] },
  { id: 'trip-planner', label: 'Trip Planner', route: '/trip-planner', image: G + 'a44ab1c91_generated_image.png?v=2', gradient: 'from-blue-900 via-indigo-900 to-purple-900', keywords: ['trip', 'travel', 'vacation'] },
  { id: 'cleaning-calendar', label: 'Cleaning Calendar', route: '/cleaning-calendar', image: G + '7699c2395_generated_image.png?v=2', gradient: 'from-pink-900 via-fuchsia-900 to-purple-900', keywords: ['clean', 'chores', 'home'] },
  { id: 'sticky-notes', label: 'Sticky Notes', route: '/sticky-notes', image: G + '74fa7886f_generated_image.png?v=2', gradient: 'from-violet-900 via-purple-900 to-fuchsia-900', keywords: ['notes', 'reminder', 'sticky'] },
  { id: 'time-management', label: 'Time Management', route: '/time-management', image: G + 'f79912847_generated_image.png?v=2', gradient: 'from-purple-900 via-pink-900 to-rose-900', keywords: ['time', 'schedule', 'manage'] },
  { id: 'important-contacts', label: 'Contacts', route: '/important-contacts', image: G + 'e6db4fb7e_generated_image.png?v=2', gradient: 'from-teal-900 via-cyan-900 to-blue-900', keywords: ['contacts', 'phone', 'emergency'] },
  { id: 'password-vault', label: 'Password Vault', route: '/password-vault', image: G + '5dad0afdd_generated_image.png?v=2', gradient: 'from-yellow-800 via-amber-900 to-gray-900', keywords: ['password', 'security', 'vault'] },
  { id: 'my-glow-link', label: 'My Glow Link', route: '/my-glow-link', image: G + '993a4bab1_generated_image.png?v=2', gradient: 'from-yellow-800 via-amber-900 to-orange-900', keywords: ['profile', 'link', 'share'] },
  { id: 'glow-store', label: 'Glow Store', route: '/glow-store', gradient: 'from-pink-900 via-purple-900 to-fuchsia-900', emoji: '🛍️', keywords: ['store', 'shop', 'rewards'] },
  { id: 'support', label: 'Help & Support', route: '/support', gradient: 'from-rose-900 via-pink-900 to-red-900', emoji: '💜', keywords: ['help', 'support', 'contact'] },
];

const DEFAULT_HOME_IDS = ['daily-checkin', 'fitness-tracker', 'diary', 'vision-board', 'glow-up-challenges', 'my-goals', 'scholarships', 'wellness-hub', 'daily-challenges', 'glow-tips', 'my-calendar', 'money-tracker'];
const DEFAULT_QUICK_IDS = ['daily-checkin', 'diary', 'money-tracker', 'my-goals'];

const SOCIAL = [
  { name: 'Instagram', handle: '@girlsglowingup', url: 'https://instagram.com/girlsglowingup', color: '#e1306c', icon: '📸' },
  { name: 'TikTok', handle: '@girlsglowingup', url: 'https://tiktok.com/@girlsglowingup', color: '#000', icon: '🎵' },
  { name: 'YouTube', handle: 'Girls Glowing Up', url: 'https://youtube.com/@girlsglowingup', color: '#ff0000', icon: '▶️' },
  { name: 'X / Twitter', handle: '@girlsglowingup', url: 'https://x.com/girlsglowingup', color: '#000', icon: '✖️' },
  { name: 'Facebook', handle: 'Girls Glowing Up', url: 'https://facebook.com/girlsglowingup', color: '#1877f2', icon: '📘' },
  { name: 'Snapchat', handle: 'girlsglowingup', url: 'https://snapchat.com/add/girlsglowingup', color: '#fffc00', icon: '👻' },
];

const PATTERN_SVGS = {
  stars: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='10' y='42' font-size='30' fill='rgba(255,255,255,0.03)'>&#9733;</text></svg>",
  hearts: "<svg xmlns='http://www.w3.org/2000/svg' width='55' height='55'><text x='8' y='40' font-size='28' fill='rgba(255,255,255,0.03)'>&#9829;</text></svg>",
  sparkles: "<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><text x='5' y='36' font-size='26' fill='rgba(255,255,255,0.035)'>&#10022;</text></svg>",
  flowers: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='8' y='42' font-size='30' fill='rgba(255,255,255,0.03)'>&#10047;</text></svg>",
  dots: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='2' fill='rgba(255,255,255,0.03)'/></svg>",
  moons: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='8' y='42' font-size='30' fill='rgba(255,255,255,0.03)'>&#9790;</text></svg>",
};

function patternStyle(pattern, bgImage, bgImagePos = { x: 50, y: 50 }) {
  if (bgImage) return { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: `${bgImagePos.x}% ${bgImagePos.y}%` };
  if (pattern && pattern !== 'none' && PATTERN_SVGS[pattern]) {
    return { backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(PATTERN_SVGS[pattern])}")` };
  }
  return {};
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'greeting_morning';
  if (h < 17) return 'greeting_afternoon';
  return 'greeting_evening';
}

function loadSaved(key, defaults) {
  try {
    const s = localStorage.getItem(key);
    if (s) {
      const parsed = JSON.parse(s);
      // Validate: filter out IDs that no longer exist in ALL_PAGES (e.g. old 'glow', 'glow-feed' if removed)
      if (key === 'ggu_home_apps' && Array.isArray(parsed)) {
        const cleaned = parsed.filter(id => id && (id.startsWith('folder_') || ALL_PAGES.some(p => p.id === id)));
        return cleaned.length > 0 ? cleaned : defaults;
      }
      return parsed;
    }
  } catch {}
  return defaults;
}

function getPageById(id) { return ALL_PAGES.find(p => p.id === id); }

// ─── Widget Icon (iOS-style rounded square) ─────────────────────────────────
function AppIcon({ app, size = 64 }) {
  return (
    <div
      className={`overflow-hidden flex items-center justify-center flex-shrink-0 ${app.image ? '' : 'bg-gradient-to-br ' + app.gradient}`}
      style={{ width: size, height: size, borderRadius: size * 0.225, boxShadow: '0 4px 14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)' }}
    >
      {app.image
        ? <img src={app.image} alt={app.label} className="w-full h-full object-cover" />
        : <span style={{ fontSize: size * 0.42 }}>{app.emoji}</span>}
    </div>
  );
}

// ─── Folder Icon ─────────────────────────────────────────────────────────────
function FolderIcon({ folder, onOpen, onLongPress }) {
  const apps = folder.appIds.slice(0, 4).map(id => getPageById(id)).filter(Boolean);
  const longTimer = useRef(null);
  const startPress = () => { longTimer.current = setTimeout(() => onLongPress && onLongPress(), 600); };
  const endPress = () => clearTimeout(longTimer.current);

  return (
    <button className="flex flex-col items-center gap-1.5 select-none w-full" onClick={onOpen}
      onMouseDown={startPress} onMouseUp={endPress} onMouseLeave={endPress}
      onTouchStart={startPress} onTouchEnd={endPress} onTouchMove={endPress}>
      <div className="w-16 h-16 rounded-[18px] flex items-center justify-center p-1.5"
        style={{ background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
        <div className="grid grid-cols-2 gap-0.5 w-full h-full">
          {[0,1,2,3].map(i => apps[i] ? (
            <div key={i} className={`rounded-[5px] overflow-hidden ${apps[i].image ? '' : 'bg-gradient-to-br ' + apps[i].gradient}`}
              style={{ width: 26, height: 26 }}>
              {apps[i].image && <img src={apps[i].image} alt="" className="w-full h-full object-cover" />}
            </div>
          ) : <div key={i} className="rounded-[5px] bg-white/10" style={{ width: 26, height: 26 }} />)}
        </div>
      </div>
      <span className="text-[10px] text-center text-gray-300 leading-tight" style={{ maxWidth: 68 }}>{folder.name}</span>
    </button>
  );
}

// ─── Folder Modal ─────────────────────────────────────────────────────────────
function FolderModal({ folder, folders, setFolders, homeAppIds, setHomeAppIds, navigate, onClose }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(folder.name);
  const apps = folder.appIds.map(id => getPageById(id)).filter(Boolean);

  const saveName = () => {
    setFolders(prev => ({ ...prev, [folder.id]: { ...prev[folder.id], name: name.trim() || folder.name } }));
    setEditing(false);
  };

  const removeApp = (appId) => {
    const newAppIds = folder.appIds.filter(id => id !== appId);
    if (newAppIds.length <= 1) {
      const newFolders = { ...folders };
      delete newFolders[folder.id];
      setFolders(newFolders);
      setHomeAppIds(prev => {
        const next = prev.filter(id => id !== folder.id);
        if (newAppIds.length === 1) { const idx = prev.indexOf(folder.id); next.splice(idx, 0, newAppIds[0]); }
        return next;
      });
      onClose();
    } else {
      setFolders(prev => ({ ...prev, [folder.id]: { ...prev[folder.id], appIds: newAppIds } }));
    }
  };

  const deleteFolder = () => {
    const newFolders = { ...folders };
    delete newFolders[folder.id];
    setFolders(newFolders);
    setHomeAppIds(prev => {
      const idx = prev.indexOf(folder.id);
      if (idx === -1) return prev;
      const next = [...prev];
      next.splice(idx, 1, ...folder.appIds);
      return next;
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(24px)' }} onClick={onClose}>
      <div className="w-full rounded-3xl overflow-hidden" style={{ maxWidth: 340, background: 'rgba(18,8,28,0.96)', border: '1px solid rgba(255,255,255,0.12)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          {editing ? (
            <input autoFocus value={name} onChange={e => setName(e.target.value)} onBlur={saveName} onKeyDown={e => e.key === 'Enter' && saveName()} className="font-bold text-white text-lg bg-transparent border-b border-pink-500 outline-none flex-1 mr-3" />
          ) : (
            <button onClick={() => setEditing(true)} className="font-bold text-white text-lg flex items-center gap-1">{folder.name} <span className="text-[11px] text-gray-500 font-normal">✏️</span></button>
          )}
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="px-5 pb-4">
          <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="grid grid-cols-3 gap-4">
              {apps.map(app => (
                <div key={app.id} className="relative flex flex-col items-center gap-1">
                  <button className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center z-10 text-gray-300 text-xs" onClick={() => removeApp(app.id)} style={{ fontSize: 14 }}>×</button>
                  <button onClick={() => { navigate(app.route); onClose(); }} className="active:scale-90 transition-transform"><AppIcon app={app} size={54} /></button>
                  <span className="text-[10px] text-gray-300 text-center leading-tight w-16">{app.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 pb-5">
          <button onClick={deleteFolder} className="w-full py-2.5 rounded-2xl text-sm font-semibold text-red-400 border border-red-900/40 bg-red-900/10">Dissolve Folder</button>
        </div>
      </div>
    </div>
  );
}

// ─── Page Picker Modal ────────────────────────────────────────────────────────
function PagePickerModal({ title, currentIds, onSave, onClose }) {
  const [selected, setSelected] = useState([...currentIds]);
  const [search, setSearch] = useState('');
  const filtered = ALL_PAGES.filter(p => {
    const q = search.toLowerCase();
    return p.label.toLowerCase().includes(q) || p.keywords.some(k => k.includes(q));
  });
  const toggle = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-end" onClick={onClose}>
      <div className="w-full rounded-t-3xl flex flex-col" style={{ maxHeight: '88vh', background: '#0f0a1e', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <h3 className="font-bold text-white">{title}</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-2">
            <Search size={14} className="text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="bg-transparent text-sm text-white outline-none flex-1 placeholder-gray-500" autoFocus />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(page => {
              const isOn = selected.includes(page.id);
              return (
                <button key={page.id} onClick={() => toggle(page.id)} className="flex items-center gap-2 p-3 rounded-2xl text-left transition"
                  style={{ background: isOn ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isOn ? 'rgba(236,72,153,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
                  <AppIcon app={page} size={32} />
                  <span className="text-xs font-semibold text-white flex-1 leading-tight">{page.label}</span>
                  {isOn && <Check size={12} className="text-pink-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="px-4 pt-4 border-t border-white/10 flex-shrink-0 grid grid-cols-2 gap-3"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}>
          <button onClick={onClose} className="py-4 rounded-2xl text-sm font-semibold text-gray-400 bg-white/5">Cancel</button>
          <button onClick={() => { onSave(selected); onClose(); }} className="py-4 rounded-2xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#c44a55,#ff6a75)' }}>Save ({selected.length})</button>
        </div>
      </div>
    </div>
  );
}

// ─── Featured Widget (large 2-col) ────────────────────────────────────────────
function FeaturedWidget({ app, onNavigate }) {
  return (
    <button onClick={() => onNavigate(app.route)}
      className={`relative rounded-[24px] overflow-hidden active:scale-98 transition-all select-none text-left ${app.image ? '' : 'bg-gradient-to-br ' + app.gradient}`}
      style={{ height: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
      {app.image && <img src={app.image} alt={app.label} className="absolute inset-0 w-full h-full object-cover" />}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.05) 100%)' }} />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Featured</p>
        <p className="text-base font-bold text-white leading-tight">{app.label}</p>
      </div>
      <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
        <ChevronRight size={14} className="text-white" />
      </div>
    </button>
  );
}

// ─── Medium Widget (1-col) ────────────────────────────────────────────────────
function MediumWidget({ app, onNavigate }) {
  return (
    <button onClick={() => onNavigate(app.route)}
      className={`relative rounded-[22px] overflow-hidden active:scale-98 transition-all select-none text-left w-full ${app.image ? '' : 'bg-gradient-to-br ' + app.gradient}`}
      style={{ height: 110, boxShadow: '0 6px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
      {app.image && <img src={app.image} alt={app.label} className="absolute inset-0 w-full h-full object-cover" />}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)' }} />
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="w-9 h-9 rounded-[10px] overflow-hidden flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
          {app.image ? <img src={app.image} alt="" className="w-full h-full object-cover" /> : <span className="text-base">{app.emoji}</span>}
        </div>
        <p className="text-sm font-bold text-white leading-tight">{app.label}</p>
      </div>
    </button>
  );
}

// ─── Small App Icon (4-col grid) ─────────────────────────────────────────────
function SmallAppIcon({ app, onNavigate }) {
  return (
    <button onClick={() => onNavigate(app.route)} className="flex flex-col items-center gap-1.5 select-none active:scale-90 transition-transform w-full">
      <AppIcon app={app} size={64} />
      <span className="text-[10px] text-center text-gray-300 leading-tight" style={{ maxWidth: 68 }}>{app.label}</span>
    </button>
  );
}

// ─── Quick Chip ───────────────────────────────────────────────────────────────
function QuickChip({ app, onNavigate }) {
  return (
    <button onClick={() => onNavigate(app.route)}
      className="flex flex-col items-center gap-1 flex-shrink-0 py-2.5 px-2 rounded-2xl transition"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', minWidth: 60 }}>
      <AppIcon app={app} size={36} />
      <span className="text-[9px] text-gray-400 text-center leading-tight" style={{ maxWidth: 58 }}>{app.label}</span>
    </button>
  );
}

// ─── Size Picker Modal ────────────────────────────────────────────────────────
function SizePickerModal({ app, currentSize, onSelect, onClose }) {
  const sizes = [
    { id: 'small', label: 'Small', desc: 'Icon only', icon: '▪' },
    { id: 'medium', label: 'Medium', desc: 'Card style', icon: '▬' },
    { id: 'large', label: 'Large', desc: 'Featured banner', icon: '■' },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)' }} onClick={onClose}>
      <div className="w-full rounded-t-3xl p-5" style={{ background: '#0f0a1e', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-white text-base">Widget Size — {app.label}</p>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="grid grid-cols-3 gap-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}>
          {sizes.map(s => (
            <button key={s.id} onClick={() => { onSelect(s.id); onClose(); }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl transition"
              style={{ background: currentSize === s.id ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${currentSize === s.id ? 'rgba(236,72,153,0.5)' : 'rgba(255,255,255,0.08)'}` }}>
              <span className="text-2xl">{s.icon}</span>
              <p className="text-sm font-bold text-white">{s.label}</p>
              <p className="text-[10px] text-gray-500">{s.desc}</p>
              {currentSize === s.id && <Check size={12} className="text-pink-400" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { worldInfo } = useAgeGroup();
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [avatarConfig, setAvatarConfig] = useState(null);
  const [search, setSearch] = useState('');
  const [showCustomize, setShowCustomize] = useState(false);
  const [bgColor, setBgColor] = useState('#8b2d88');
  const [bgPattern, setBgPattern] = useState('none');
  const [bgImage, setBgImage] = useState(null);
  const [bgImagePos, setBgImagePos] = useState({ x: 50, y: 50 });
  const [totalPoints, setTotalPoints] = useState(0);
  const [homeAppIds, setHomeAppIds] = useState(() => loadSaved('ggu_home_apps', DEFAULT_HOME_IDS));
  const [quickIds, setQuickIds] = useState(() => loadSaved('ggu_quick_access', DEFAULT_QUICK_IDS));
  const [showQuickPicker, setShowQuickPicker] = useState(false);
  const [showHomePicker, setShowHomePicker] = useState(false);
  const [folders, setFolders] = useState(() => loadSaved('ggu_folders', {}));
  const [openFolder, setOpenFolder] = useState(null);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [communityIds, setCommunityIds] = useState(() => loadSaved('ggu_community_apps', ['glow-feed', 'community-hub', 'mentorship']));
  const [showCommunityPicker, setShowCommunityPicker] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const saveLayoutTimeout = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const [dragOverId, setDragOverId] = useState(null);
  const [widgetSizes, setWidgetSizes] = useState(() => loadSaved('ggu_widget_sizes', {}));
  const [sizingId, setSizingId] = useState(null);
  const draggedId = useRef(null);

  useEffect(() => { localStorage.setItem('ggu_home_apps', JSON.stringify(homeAppIds)); }, [homeAppIds]);
  useEffect(() => { localStorage.setItem('ggu_quick_access', JSON.stringify(quickIds)); }, [quickIds]);
  useEffect(() => { localStorage.setItem('ggu_folders', JSON.stringify(folders)); }, [folders]);
  useEffect(() => { localStorage.setItem('ggu_community_apps', JSON.stringify(communityIds)); }, [communityIds]);
  useEffect(() => { localStorage.setItem('ggu_widget_sizes', JSON.stringify(widgetSizes)); }, [widgetSizes]);

  // Save layout to UserProfile (debounced) so it persists across devices/sessions
  const saveLayoutToProfile = (pid, data) => {
    clearTimeout(saveLayoutTimeout.current);
    saveLayoutTimeout.current = setTimeout(async () => {
      if (!pid) return;
      await base44.entities.UserProfile.update(pid, { featured_sections: JSON.stringify(data) });
    }, 1200);
  };

  const setWidgetSizesAndSave = (updater) => {
    setWidgetSizes(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('ggu_widget_sizes', JSON.stringify(next));
      saveLayoutToProfile(profileId, { homeAppIds, quickIds, folders, communityIds, widgetSizes: next });
      return next;
    });
  };

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
    let email = null;

    const getTodayKey = () => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    };

    const checkCheckin = async (userEmail) => {
      const today = getTodayKey();
      const lsKey = `ggu_checkin_${userEmail}_date`;
      // Fast path: localStorage already recorded for this user + today
      if (localStorage.getItem(lsKey) === today) { setCheckedInToday(true); return; }
      // Slow path: query DB (same tag format as DailyCheckIn page)
      const rows = await base44.entities.DiaryEntry.filter({ user_email: userEmail });
      const found = rows.find(e => e.tags && e.tags.includes(`daily-checkin-${today}`));
      if (found) { localStorage.setItem(lsKey, today); setCheckedInToday(true); }
      else { setCheckedInToday(false); }
    };

    const refreshPoints = async (userEmail) => {
      const pts = await base44.entities.UserPoints.filter({ user_email: userEmail });
      setTotalPoints(pts.length > 0 ? pts[0].total_points || 0 : 0);
    };

    const onVisibilityChange = () => { if (email && document.visibilityState === 'visible') { checkCheckin(email); refreshPoints(email); } };
    const onCheckinComplete = () => { if (email) { checkCheckin(email); refreshPoints(email); } };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('ggu_checkin_complete', onCheckinComplete);

    base44.auth.me().then(async (u) => {
      email = u.email;
      setUser(u);
      await checkCheckin(u.email);
      await refreshPoints(u.email);
      const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
        if (profiles.length) {
          const profile = profiles[0];
          setProfileData(profile);
          setProfileId(profile.id);
          if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
          if (profile.avatar_builder_config) { try { setAvatarConfig(JSON.parse(profile.avatar_builder_config)); } catch {} }
          // Load saved layout from profile (overrides localStorage if present)
          if (profile.featured_sections) {
            try {
              const saved = JSON.parse(profile.featured_sections);
              if (saved.homeAppIds) {
                // Strip removed/invalid app IDs
                const cleaned = saved.homeAppIds.filter(id => id && (id.startsWith('folder_') || ALL_PAGES.some(p => p.id === id)));
                setHomeAppIds(cleaned.length > 0 ? cleaned : DEFAULT_HOME_IDS);
                localStorage.setItem('ggu_home_apps', JSON.stringify(cleaned.length > 0 ? cleaned : DEFAULT_HOME_IDS));
              }
              if (saved.quickIds) { setQuickIds(saved.quickIds); localStorage.setItem('ggu_quick_access', JSON.stringify(saved.quickIds)); }
              if (saved.folders) { setFolders(saved.folders); localStorage.setItem('ggu_folders', JSON.stringify(saved.folders)); }
              if (saved.communityIds) { setCommunityIds(saved.communityIds); localStorage.setItem('ggu_community_apps', JSON.stringify(saved.communityIds)); }
              if (saved.widgetSizes) { setWidgetSizes(saved.widgetSizes); localStorage.setItem('ggu_widget_sizes', JSON.stringify(saved.widgetSizes)); }
            } catch {}
          }
        }
    }).catch(() => {});

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('ggu_checkin_complete', onCheckinComplete);
    };
  }, []);

  // ── Drag handlers ────────────────────────────────────────────────────────────
  const onDragStart = (start) => { draggedId.current = start.draggableId; };
  const onDragUpdate = (update) => {
    if (!update.destination) { setDragOverId(null); return; }
    const destId = homeAppIds[update.destination.index];
    setDragOverId(destId && destId !== draggedId.current ? destId : null);
  };

  // Helper to update layout and sync to profile
  const setHomeAppIdsAndSave = (updater) => {
    setHomeAppIds(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveLayoutToProfile(profileId, { homeAppIds: next, quickIds, folders, communityIds, widgetSizes });
      return next;
    });
  };

  const setQuickIdsAndSave = (next) => {
    setQuickIds(next);
    saveLayoutToProfile(profileId, { homeAppIds, quickIds: next, folders, communityIds, widgetSizes });
  };

  const setCommunityIdsAndSave = (next) => {
    setCommunityIds(next);
    saveLayoutToProfile(profileId, { homeAppIds, quickIds, folders, communityIds: next, widgetSizes });
  };

  const onDragEnd = (result) => {
    setDragOverId(null);
    draggedId.current = null;
    if (!result.destination) return;
    const srcIndex = result.source.index;
    const destIndex = result.destination.index;
    if (srcIndex === destIndex) return;
    const draggedItemId = homeAppIds[srcIndex];
    const targetItemId = homeAppIds[destIndex];
    // Only merge into folders when hovering (dragOverId set), not on simple drop

    const isFolder = (id) => id && id.startsWith('folder_');
    const shouldMerge = dragOverId !== null && dragOverId === targetItemId;
    if (shouldMerge && !isFolder(draggedItemId)) {
      if (isFolder(targetItemId)) {
        const newFolders = { ...folders, [targetItemId]: { ...folders[targetItemId], appIds: [...(folders[targetItemId]?.appIds || []), draggedItemId] } };
        const newIds = homeAppIds.filter(id => id !== draggedItemId);
        setFolders(newFolders);
        setHomeAppIds(newIds);
        saveLayoutToProfile(profileId, { homeAppIds: newIds, quickIds, folders: newFolders, communityIds, widgetSizes });
      } else {
        const folderId = 'folder_' + Date.now();
        const newFolders = { ...folders, [folderId]: { id: folderId, name: 'Folder', appIds: [targetItemId, draggedItemId] } };
        const newIds = homeAppIds.filter(id => id !== draggedItemId).map(id => id === targetItemId ? folderId : id);
        setFolders(newFolders);
        setHomeAppIds(newIds);
        saveLayoutToProfile(profileId, { homeAppIds: newIds, quickIds, folders: newFolders, communityIds, widgetSizes });
      }
      return;
    }
    const items = [...homeAppIds];
    const [moved] = items.splice(srcIndex, 1);
    items.splice(destIndex, 0, moved);
    setHomeAppIds(items);
    saveLayoutToProfile(profileId, { homeAppIds: items, quickIds, folders, communityIds, widgetSizes });
  };

  const firstName = user?.full_name?.split(' ')[0] || 'Gorgeous';
  const username = user?.email?.split('@')[0] || 'user';
  const greetingEmoji = { greeting_morning: '🌅', greeting_afternoon: '☀️', greeting_evening: '🌙' };
  const greetingKey = getGreeting();

  const searchResults = search.trim().length > 1
    ? ALL_PAGES.filter(p => { const q = search.toLowerCase(); return p.label.toLowerCase().includes(q) || p.keywords.some(k => k.toLowerCase().includes(q)); })
    : [];

  const currentFolder = openFolder ? folders[openFolder] : null;

  return (
    <div className="min-h-screen text-white pb-28 overflow-x-hidden relative" style={{ backgroundColor: '#08060e' }}>
      {/* Background tint */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundColor: bgColor, opacity: 0.1 }} />
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute rounded-full" style={{ width: 400, height: 400, top: -100, left: -80, background: 'radial-gradient(circle, rgba(232,82,109,0.18), transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute rounded-full" style={{ width: 300, height: 300, top: '40%', right: -60, background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)', filter: 'blur(60px)' }} />
      </div>
      {(bgPattern !== 'none' || bgImage) && (
        <div className="fixed inset-0 pointer-events-none z-0" style={patternStyle(bgPattern, bgImage, bgImagePos)} />
      )}

      <div className="relative z-10">

        {/* ── TOP STATUS BAR ─────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          {worldInfo && (
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold"
              style={{ background: worldInfo.bgColor, border: `1px solid ${worldInfo.borderColor}`, color: worldInfo.color }}>
              <span>{worldInfo.emoji}</span><span>{worldInfo.label}</span>
            </div>
          )}
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/glow-score')}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
              <span>🏅</span><span className="text-yellow-400">{totalPoints.toLocaleString()}</span><span className="text-gray-500">pts</span>
            </button>
            <button onClick={() => setShowCustomize(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
              <Settings size={14} className="text-gray-300" />
            </button>
          </div>
        </div>

        {/* ── GREETING & AVATAR ─────────────────────────────────── */}
        <div className="flex items-center gap-4 px-5 pt-2 pb-4">
          <button onClick={() => navigate('/avatar')}>
            <UserAvatarDisplay profile={profileData} size={54} fallback={firstName[0]} showRing={true} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-500 font-medium">{greetingEmoji[greetingKey]} {t(greetingKey)}</p>
            <h1 className="text-xl font-bold leading-tight truncate">Hey, {firstName} ✨</h1>
            <p className="text-[11px] text-gray-500">@{username}</p>
          </div>
          <button onClick={async () => { if (window.confirm('Sign out?')) { await base44.auth.logout('/'); } }}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-full flex-shrink-0"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            Sign Out
          </button>
        </div>

        {/* ── DAILY GLOW CHECK-IN BANNER ────────────────────────── */}
        <div className="px-5 mb-5">
          {checkedInToday ? (
            <div className="w-full flex items-center gap-4 px-4 py-4 rounded-[22px]"
              style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.18), rgba(16,185,129,0.12))', border: '1px solid rgba(52,211,153,0.3)', backdropFilter: 'blur(16px)' }}>
              <div className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(52,211,153,0.2)' }}>
                <span className="text-2xl">✅</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold tracking-wider text-green-400 mb-0.5 uppercase">Daily Glow Check-In</p>
                <p className="font-bold text-white text-[15px]">Checked in today ✨</p>
                <p className="text-[11px] text-white/40">Come back tomorrow for your next check-in</p>
              </div>
              <span className="text-green-400 text-lg flex-shrink-0">🌟</span>
            </div>
          ) : (
            <button onClick={() => navigate('/daily-checkin')}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-[22px] text-left active:scale-98 transition-all"
              style={{ background: 'linear-gradient(135deg, rgba(139,44,170,0.6), rgba(232,82,109,0.5))', border: '1px solid rgba(232,82,109,0.35)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(232,82,109,0.2)' }}>
              <div className="w-12 h-12 rounded-[14px] overflow-hidden flex-shrink-0" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                <img src={MANUS + 'icon-glow-check-in_fe36a2ac.png'} className="w-full h-full object-cover" alt="check in" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold tracking-wider text-yellow-300 mb-0.5 uppercase">Daily Glow Check-In</p>
                <p className="font-bold text-white text-[15px]">How are you glowing today?</p>
                <p className="text-[11px] text-white/50">Tap to check in &amp; earn points ✨</p>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <ChevronRight size={16} className="text-white" />
              </div>
            </button>
          )}
        </div>

        {/* ── SEARCH ───────────────────────────────────────────── */}
        <div className="px-5 mb-5 relative">
          <button onClick={() => navigate('/search')}
            className="w-full flex items-center gap-2.5 rounded-2xl px-4 py-3 text-left"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
            <Search size={15} className="text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-600">Search everything…</span>
          </button>
          {searchResults.length > 0 && (
            <div className="absolute top-full left-5 right-5 mt-1 rounded-2xl overflow-hidden z-20 shadow-2xl"
              style={{ background: 'rgba(18,8,28,0.97)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
              {searchResults.slice(0, 8).map(r => (
                <button key={r.id} onClick={() => { navigate(r.route); setSearch(''); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 text-left">
                  <AppIcon app={r} size={32} />
                  <span className="text-sm text-gray-200">{r.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── QUICK ACCESS ─────────────────────────────────────── */}
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold tracking-widest text-gray-600 uppercase">Quick Access</p>
            <button onClick={() => setShowQuickPicker(true)} className="flex items-center gap-1 text-[11px] text-pink-400 font-semibold"><Plus size={11} /> Customize</button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {quickIds.map(id => ALL_PAGES.find(p => p.id === id)).filter(Boolean).map(app =>
              <QuickChip key={app.id} app={app} onNavigate={navigate} />
            )}
            <button onClick={() => setShowQuickPicker(true)}
              className="flex flex-col items-center justify-center gap-1 flex-shrink-0 py-2.5 px-3 rounded-2xl border border-dashed border-white/15 hover:border-pink-500/40 transition"
              style={{ minWidth: 60 }}>
              <Plus size={14} className="text-gray-600" />
              <span className="text-[9px] text-gray-600">Add</span>
            </button>
          </div>
        </div>

        {/* ── YOUR WORLD ───────────────────────────────────────── */}
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold tracking-widest text-gray-600 uppercase">Your World</p>
            <button onClick={() => setEditMode(e => !e)}
              className={`text-[11px] font-semibold px-3 py-1 rounded-full transition ${editMode ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
              {editMode ? 'Done ✓' : 'Edit'}
            </button>
          </div>

          <DragDropContext onDragStart={onDragStart} onDragUpdate={onDragUpdate} onDragEnd={onDragEnd}>
            <Droppable droppableId="home-apps" direction="horizontal">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}
                  className="grid grid-cols-4 gap-x-2 gap-y-5">
                  {homeAppIds.map((itemId, index) => {
                    const isFolder = itemId && itemId.startsWith('folder_');
                    const folder = isFolder ? folders[itemId] : null;
                    const app = !isFolder ? getPageById(itemId) : null;
                    const isHoverTarget = dragOverId === itemId;
                    const wSize = (!isFolder && widgetSizes[itemId]) || 'small';
                    if (isFolder && !folder) return null;
                    if (!isFolder && !app) return null;
                    const spanClass = !isFolder && (wSize === 'medium' || wSize === 'large') ? 'col-span-2' : '';
                    return (
                      <Draggable key={itemId} draggableId={itemId} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={provided.draggableProps.style}
                            className={`select-none ${isHoverTarget && !snapshot.isDragging ? 'scale-105' : ''} ${spanClass}`}>
                            <div className={`relative transition-all ${isHoverTarget && !snapshot.isDragging ? 'ring-2 ring-pink-400 ring-offset-1 ring-offset-transparent rounded-[18px]' : ''}`}>
                              {isFolder ? (
                                <FolderIcon folder={folder} onOpen={() => !snapshot.isDragging && setOpenFolder(itemId)} onLongPress={() => setOpenFolder(itemId)} />
                              ) : wSize === 'large' ? (
                                <FeaturedWidget app={app} onNavigate={snapshot.isDragging ? () => {} : navigate} />
                              ) : wSize === 'medium' ? (
                                <MediumWidget app={app} onNavigate={snapshot.isDragging ? () => {} : navigate} />
                              ) : (
                                <SmallAppIcon app={app} onNavigate={snapshot.isDragging ? () => {} : navigate} />
                              )}
                              {editMode && (
                                <>
                                  <button onPointerDown={e => { e.stopPropagation(); setHomeAppIdsAndSave(prev => prev.filter(id => id !== itemId)); }}
                                    className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-red-900 border border-red-700 flex items-center justify-center z-20 shadow"
                                    style={{ fontSize: 13, color: '#fca5a5', lineHeight: 1 }}>×</button>
                                  {!isFolder && (
                                    <button onPointerDown={e => { e.stopPropagation(); setSizingId(itemId); }}
                                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center z-20 shadow"
                                      style={{ fontSize: 9, color: '#c084fc', lineHeight: 1 }}>⬛</button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                  {/* Add more button */}
                  <button onClick={() => setShowHomePicker(true)}
                    className="flex flex-col items-center gap-1.5 select-none">
                    <div className="w-16 h-16 rounded-[18px] flex items-center justify-center border-2 border-dashed border-white/10 hover:border-pink-500/40 transition">
                      <Plus size={20} className="text-gray-600" />
                    </div>
                    <span className="text-[10px] text-gray-600">Add</span>
                  </button>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* ── COMMUNITY ────────────────────────────────────────── */}
        <div className="px-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold tracking-widest text-gray-600 uppercase">Community</p>
            <button onClick={() => setShowCommunityPicker(true)} className="flex items-center gap-1 text-[11px] text-pink-400 font-semibold"><Plus size={11} /> Edit</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {communityIds.map(id => {
              const app = getPageById(id);
              if (!app) return null;
              return (
                <button key={id} onClick={() => navigate(app.route)}
                  className="relative rounded-[18px] overflow-hidden flex flex-col items-start justify-end p-3 active:scale-95 transition-all"
                  style={{ height: 90, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {app.image && <img src={app.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 50%, transparent)' }} />
                  <span className="relative text-[11px] font-bold text-white z-10">{app.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── SOCIAL MEDIA (subtle, at bottom) ─────────────────── */}
        <div className="px-5 mb-6">
          <p className="text-[11px] font-bold tracking-widest text-gray-600 uppercase mb-3">Follow Us</p>
          <div className="rounded-[20px] overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex flex-wrap gap-2 p-3">
              {SOCIAL.map(s => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-gray-400 hover:text-gray-200 transition"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <span>{s.icon}</span><span>{s.name}</span>
                </a>
              ))}
            </div>
            <p className="text-center text-[10px] text-gray-700 pb-3 px-4">Tapping opens the app — GGU is not affiliated with these platforms</p>
          </div>
        </div>

      </div>

      <BottomNav active="home" />

      {/* ── MODALS ───────────────────────────────────────────────── */}
      {showCustomize && (
        <CustomizeModal bgColor={bgColor} setBgColor={setBgColor} bgPattern={bgPattern} setBgPattern={setBgPattern}
          bgImage={bgImage} setBgImage={setBgImage} bgImagePos={bgImagePos} setBgImagePos={setBgImagePos}
          onClose={() => setShowCustomize(false)} />
      )}
      {showCommunityPicker && (
        <PagePickerModal title="Customize Community" currentIds={communityIds} onSave={setCommunityIdsAndSave} onClose={() => setShowCommunityPicker(false)} />
      )}
      {showQuickPicker && (
        <PagePickerModal title="Customize Quick Access" currentIds={quickIds} onSave={setQuickIdsAndSave} onClose={() => setShowQuickPicker(false)} />
      )}
      {showHomePicker && (
        <PagePickerModal title="Your World — Add Apps" currentIds={homeAppIds} onSave={(ids) => { setHomeAppIdsAndSave(() => ids); }} onClose={() => setShowHomePicker(false)} />
      )}
      {currentFolder && (
        <FolderModal folder={currentFolder} folders={folders} setFolders={setFolders}
          homeAppIds={homeAppIds} setHomeAppIds={setHomeAppIds} navigate={navigate} onClose={() => setOpenFolder(null)} />
      )}
      {sizingId && (() => { const sApp = getPageById(sizingId); return sApp ? (
        <SizePickerModal app={sApp} currentSize={widgetSizes[sizingId] || 'small'}
          onSelect={size => setWidgetSizesAndSave(prev => ({ ...prev, [sizingId]: size }))}
          onClose={() => setSizingId(null)} />
      ) : null; })()}
    </div>
  );
}