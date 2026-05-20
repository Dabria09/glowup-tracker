import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, MessageCircle, ChevronRight, X, Check, Upload } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import CustomizeModal from '@/components/CustomizeModal';

const WORLD_APPS = [
  { id: 'grow', icon: '⭐', label: 'Grow', bg: 'bg-green-900', route: '/grow' },
  { id: 'know', icon: '💗', label: 'Know Yourself', bg: 'bg-purple-900', route: '/know-yourself' },
  { id: 'connect', icon: '🔗', label: 'Connect', bg: 'bg-blue-900', route: '/connect' },
  { id: 'money', icon: '💲', label: 'Money', bg: 'bg-yellow-900', route: '/money' },
  { id: 'safety', icon: '💖', label: 'Safety & Wellness', bg: 'bg-pink-900', route: '/safety' },
  { id: 'myworld', icon: '✨', label: 'My World', bg: 'bg-indigo-900', route: '/my-world' },
  { id: 'glowboard', icon: '📸', label: 'Glow Board', bg: 'bg-purple-800', route: '/glow-board' },
  { id: 'games', icon: '🎮', label: 'Games', bg: 'bg-gray-800', route: '/games', soon: true },
];

const RECOMMENDED = [
  { id: 'curriculum', icon: '📚', title: 'Curriculum', desc: 'Personalized curriculum based on your interests and goals' },
  { id: 'habits', icon: '🎯', title: 'Habits', desc: 'Build habits that match your goals' },
  { id: 'library', icon: '📖', title: 'Library', desc: 'Resources handpicked for your growth' },
];

const SOCIAL = [
  { name: 'Instagram', handle: '@girlsglowingup', url: 'https://instagram.com/girlsglowingup', color: 'bg-gradient-to-br from-pink-600 to-purple-600', icon: '📸' },
  { name: 'TikTok', handle: '@girlsglowingup', url: 'https://tiktok.com/@girlsglowingup', color: 'bg-black border border-gray-600', icon: '🎵' },
  { name: 'YouTube', handle: 'Girls Glowing Up', url: 'https://youtube.com/@girlsglowingup', color: 'bg-red-600', icon: '▶️' },
  { name: 'X / Twitter', handle: '@girlsglowingup', url: 'https://x.com/girlsglowingup', color: 'bg-black border border-gray-600', icon: '✖️' },
  { name: 'Facebook', handle: 'Girls Glowing Up', url: 'https://facebook.com/girlsglowingup', color: 'bg-blue-600', icon: '📘' },
  { name: 'Snapchat', handle: 'girlsglowingup', url: 'https://snapchat.com/add/girlsglowingup', color: 'bg-yellow-400', icon: '👻' },
];

const BG_COLORS = ['#1a0a0f', '#0a0a1a', '#0a1a0a', '#1a1a0a', '#0d0d0d', '#1a0a1a'];
const BG_PATTERNS = [
  { id: 'none', label: 'None' },
  { id: 'dots', label: 'Dots' },
  { id: 'grid', label: 'Grid' },
  { id: 'stars', label: 'Stars' },
];

function getTime() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const patternStyle = (pattern, bgColor, bgImage) => {
  const base = { backgroundColor: bgColor, backgroundImage: 'none' };
  if (bgImage) return { ...base, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  if (pattern === 'dots') return { ...base, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '20px 20px' };
  if (pattern === 'grid') return { ...base, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' };
  if (pattern === 'stars') return { ...base, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '30px 30px' };
  return base;
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [time, setTime] = useState(getTime());
  const [search, setSearch] = useState('');
  const [showCustomize, setShowCustomize] = useState(false);
  const [bgColor, setBgColor] = useState('#1a0a0f');
  const [bgPattern, setBgPattern] = useState('none');
  const [bgImage, setBgImage] = useState(null);
  const [quickAccess, setQuickAccess] = useState(['grow', 'know', 'safety', 'glowboard']);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const timer = setInterval(() => setTime(getTime()), 30000);
    return () => clearInterval(timer);
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'Gorgeous';
  const username = user?.email?.split('@')[0] || 'user';

  const allSearchable = [
    ...WORLD_APPS.map(a => ({ label: a.label, route: a.route })),
    ...RECOMMENDED.map(r => ({ label: r.title, route: '/' + r.id })),
  ];
  const searchResults = search.trim().length > 1
    ? allSearchable.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : [];

  const quickApps = WORLD_APPS.filter(a => quickAccess.includes(a.id));

  return (
    <div className="min-h-screen text-white pb-24 overflow-x-hidden" style={patternStyle(bgPattern, bgColor, bgImage)}>
      {/* Points badge */}
      <div className="flex justify-end px-4 pt-3">
        <div className="flex items-center gap-1 bg-gray-800/80 rounded-full px-3 py-1 text-xs font-bold">
          <span>🏅</span><span className="text-yellow-400">15 pts</span>
        </div>
      </div>

      {/* Header row */}
      <div className="flex items-center gap-3 px-4 pt-2 pb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm font-bold overflow-hidden flex-shrink-0">
          {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" /> : firstName[0]}
        </div>
        <span className="text-white font-semibold text-sm">{time}</span>
        <button className="ml-1 text-gray-300 hover:text-white"><MessageCircle size={20} /></button>
        <div className="flex-1" />
        <button onClick={() => setShowCustomize(true)} className="text-xs border border-gray-600 rounded-full px-3 py-1.5 text-gray-300 hover:text-white hover:border-gray-400 transition">⚙️ Edit Home</button>
        <button onClick={() => setShowCustomize(true)} className="text-xs border border-gray-600 rounded-full px-3 py-1.5 text-gray-300 hover:text-white hover:border-gray-400 transition">🎨 Customize</button>
      </div>

      {/* Greeting */}
      <div className="px-4 mb-4">
        <p className="text-gray-400 text-sm">{getGreeting()} ✨</p>
        <h1 className="text-2xl font-bold">Hey, {firstName} ✨</h1>
        <p className="text-gray-500 text-sm">@{username}</p>
      </div>

      {/* Quick Access */}
      <div className="px-4 mb-5">
        <button className="flex items-center gap-2 bg-gray-800/80 rounded-full px-4 py-2 text-sm font-semibold text-white border border-gray-700">
          ⚡ Quick Access
        </button>
        {quickApps.length > 0 && (
          <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
            {quickApps.map(app => (
              <div key={app.id} className={`flex-shrink-0 w-16 flex flex-col items-center gap-1 ${app.bg} rounded-2xl p-3 cursor-pointer hover:opacity-80 transition`}>
                <span className="text-2xl">{app.icon}</span>
                <span className="text-xs text-center text-gray-300 leading-tight">{app.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search bar */}
      <div className="px-4 mb-5 relative">
        <div className="flex items-center bg-gray-800/70 border border-gray-700 rounded-full px-4 py-2.5 gap-2">
          <Search size={16} className="text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search the entire app..."
            className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
          />
          {search && <button onClick={() => setSearch('')}><X size={14} className="text-gray-500" /></button>}
        </div>
        {searchResults.length > 0 && (
          <div className="absolute top-full left-4 right-4 mt-1 bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden z-10 shadow-xl">
            {searchResults.map(r => (
              <div key={r.label} className="px-4 py-3 text-sm text-gray-200 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0">
                {r.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Your World */}
      <div className="px-4 mb-6">
        <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">YOUR WORLD</p>
        <div className="grid grid-cols-4 gap-3">
          {WORLD_APPS.map(app => (
            <div key={app.id} className={`relative flex flex-col items-center gap-1.5 ${app.bg} rounded-2xl p-3 cursor-pointer hover:opacity-80 transition`}>
              {app.soon && <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">Soon</span>}
              <span className="text-3xl">{app.icon}</span>
              <span className="text-xs text-center text-gray-300 leading-tight">{app.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended For You */}
      <div className="px-4 mb-6">
        <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">✨ RECOMMENDED FOR YOU</p>
        <div className="space-y-3">
          {RECOMMENDED.map(r => (
            <div key={r.id} className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 cursor-pointer hover:bg-gray-800 transition">
              <p className="font-semibold text-sm mb-1">{r.icon} {r.title}</p>
              <p className="text-gray-400 text-sm">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Glow Everywhere */}
      <div className="px-4 mb-6">
        <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">💗 GLOW EVERYWHERE</p>
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden">
          {SOCIAL.map((s, i) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-700/50 transition ${i < SOCIAL.length - 1 ? 'border-b border-gray-700' : ''}`}
            >
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

      <BottomNav active="home" />

      {showCustomize && (
        <CustomizeModal
          bgColor={bgColor}
          setBgColor={setBgColor}
          bgPattern={bgPattern}
          setBgPattern={setBgPattern}
          bgImage={bgImage}
          setBgImage={setBgImage}
          quickAccess={quickAccess}
          setQuickAccess={setQuickAccess}
          allApps={WORLD_APPS}
          onClose={() => setShowCustomize(false)}
          BG_COLORS={BG_COLORS}
          BG_PATTERNS={BG_PATTERNS}
        />
      )}
    </div>
  );
}