import { useState, useEffect } from 'react';
import useTranslation from '@/lib/useTranslation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Search, MessageCircle, ChevronRight, X } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import CustomizeModal from '@/components/CustomizeModal';
import AvatarPreview from '@/components/avatar/AvatarPreview';

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

const RECOMMENDED_IDS = [
  { id: 'curriculum', icon: '📚', titleKey: 'rec_curriculum_title', descKey: 'rec_curriculum_desc' },
  { id: 'habits', icon: '🎯', titleKey: 'rec_habits_title', descKey: 'rec_habits_desc' },
  { id: 'library', icon: '📖', titleKey: 'rec_library_title', descKey: 'rec_library_desc' },
];

const SOCIAL = [
  { name: 'Instagram', handle: '@girlsglowingup', url: 'https://instagram.com/girlsglowingup', color: 'bg-gradient-to-br from-pink-600 to-purple-600', icon: '📸' },
  { name: 'TikTok', handle: '@girlsglowingup', url: 'https://tiktok.com/@girlsglowingup', color: 'bg-black border border-gray-600', icon: '🎵' },
  { name: 'YouTube', handle: 'Girls Glowing Up', url: 'https://youtube.com/@girlsglowingup', color: 'bg-red-600', icon: '▶️' },
  { name: 'X / Twitter', handle: '@girlsglowingup', url: 'https://x.com/girlsglowingup', color: 'bg-black border border-gray-600', icon: '✖️' },
  { name: 'Facebook', handle: 'Girls Glowing Up', url: 'https://facebook.com/girlsglowingup', color: 'bg-blue-600', icon: '📘' },
  { name: 'Snapchat', handle: 'girlsglowingup', url: 'https://snapchat.com/add/girlsglowingup', color: 'bg-yellow-400', icon: '👻' },
];

function getTime() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'greeting_morning';
  if (h < 17) return 'greeting_afternoon';
  return 'greeting_evening';
}

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
    const encoded = encodeURIComponent(PATTERN_SVGS[pattern]);
    return { backgroundImage: `url("data:image/svg+xml,${encoded}")` };
  }
  return {};
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarConfig, setAvatarConfig] = useState(null);
  const [time, setTime] = useState(getTime());
  const [search, setSearch] = useState('');
  const [showCustomize, setShowCustomize] = useState(false);
  const [bgColor, setBgColor] = useState('#8b2d88');
  const [bgPattern, setBgPattern] = useState('none');
  const [bgImage, setBgImage] = useState(null);
  const [bgImagePos, setBgImagePos] = useState({ x: 50, y: 50 });
  const [isEditMode, setIsEditMode] = useState(false);
  const [homeApps, setHomeApps] = useState(WORLD_APPS.filter(a => !a.soon));

  // Persist bg settings to localStorage so all pages share the same look
  useEffect(() => { localStorage.setItem('ggu_bg_color', bgColor); }, [bgColor]);
  useEffect(() => { localStorage.setItem('ggu_bg_pattern', bgPattern); }, [bgPattern]);
  useEffect(() => { if (bgImage) localStorage.setItem('ggu_bg_image', bgImage); else localStorage.removeItem('ggu_bg_image'); }, [bgImage]);
  useEffect(() => { localStorage.setItem('ggu_bg_image_pos', JSON.stringify(bgImagePos)); }, [bgImagePos]);

  useEffect(() => {
    // Restore saved bg on mount
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
      const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
      if (profiles.length) {
        const profile = profiles[0];
        if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
        if (profile.avatar_builder_config) {
          try { setAvatarConfig(JSON.parse(profile.avatar_builder_config)); } catch {}
        }
      }
    }).catch(() => {});
    const timer = setInterval(() => setTime(getTime()), 30000);
    return () => clearInterval(timer);
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'Gorgeous';
  const username = user?.email?.split('@')[0] || 'user';

  const allSearchable = [
    ...WORLD_APPS.map(a => ({ label: a.label, route: a.route })),
    ...RECOMMENDED_IDS.map(r => ({ label: r.titleKey, route: '/' + r.id })),
  ];
  const searchResults = search.trim().length > 1
    ? allSearchable.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : [];

  const hiddenApps = WORLD_APPS.filter(a => !a.soon && !homeApps.find(h => h.id === a.id));

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(homeApps);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setHomeApps(items);
  };

  const removeApp = (id) => setHomeApps(prev => prev.filter(a => a.id !== id));
  const addApp = (app) => setHomeApps(prev => [...prev, app]);

  return (
    <div className="min-h-screen text-white pb-24 overflow-x-hidden relative" style={{ backgroundColor: '#080810' }}>
      {/* Color tint overlay */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundColor: bgColor, opacity: 0.12 }} />
      {/* Pattern overlay */}
      {(bgPattern !== 'none' || bgImage) && (
        <div className="fixed inset-0 pointer-events-none z-0" style={patternStyle(bgPattern, bgImage, bgImagePos)} />
      )}
      {/* Content above overlays */}
      <div className="relative z-10">
      {/* Points badge */}
      <div className="flex justify-end px-4 pt-3">
        <div className="flex items-center gap-1 glass rounded-full px-3 py-1 text-xs font-bold">
          <span>🏅</span><span className="text-yellow-400">15 {t('points')}</span>
        </div>
      </div>

      {/* Header row */}
      <div className="flex items-center gap-3 px-4 pt-2 pb-3">
        <div onClick={() => navigate('/avatar')} className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-lg font-bold overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition">
          {avatarUrl ? (
            <img src={avatarUrl} className="w-full h-full object-cover" alt="avatar" />
          ) : avatarConfig ? (
            <AvatarPreview config={avatarConfig} size={56} />
          ) : (
            firstName[0]
          )}
        </div>
        <span className="text-white font-semibold text-sm">{time}</span>
        <button className="ml-1 text-gray-300 hover:text-white"><MessageCircle size={20} /></button>
        <div className="flex-1" />
        {isEditMode ? (
          <button
            onClick={() => setIsEditMode(false)}
            className="text-xs backdrop-blur-md bg-pink-500/20 border border-pink-500/40 rounded-full px-3 py-1.5 text-pink-300 font-semibold hover:bg-pink-500/30 transition"
          >
            {t('done')}
          </button>
        ) : (
          <>
            <button onClick={() => setIsEditMode(true)} className="text-xs glass rounded-full px-3 py-1.5 text-gray-300 hover:text-white transition">{t('edit_home')}</button>
            <button onClick={() => setShowCustomize(true)} className="text-xs glass rounded-full px-3 py-1.5 text-gray-300 hover:text-white transition">{t('customize')}</button>
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to sign out?')) {
                  await base44.auth.logout('/');
                }
              }}
              className="text-xs backdrop-blur-md bg-red-500/20 border border-red-500/40 rounded-full px-3 py-1.5 text-red-300 font-semibold hover:bg-red-500/30 transition"
            >
              Sign Out
            </button>
          </>
        )}
      </div>

      {/* Greeting */}
      <div className="px-4 mb-4">
        <p className="text-gray-400 text-sm">{t(getGreeting())} ✨</p>
        <h1 className="text-2xl font-bold">Hey, {firstName} ✨</h1>
        <p className="text-gray-500 text-sm">@{username}</p>
      </div>

      {/* Quick Access */}
      {!isEditMode && (
        <div className="px-4 mb-5">
          <button className="flex items-center gap-2 backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm font-semibold text-white">
            {t('quick_access')}
          </button>
        </div>
      )}

      {/* Search bar */}
      <div className="px-4 mb-5 relative">
        <div className="flex items-center glass rounded-full px-4 py-2.5 gap-2">
          <Search size={16} className="text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('search_placeholder')}
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
        <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">{t('your_world')}</p>
        {isEditMode ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="apps" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-4 gap-3"
                >
                  {homeApps.map((app, index) => (
                    <Draggable key={app.id} draggableId={app.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`relative flex flex-col items-center gap-1.5 ${app.bg} rounded-2xl p-3 transition ${snapshot.isDragging ? 'opacity-70 scale-110' : 'animate-[wiggle_0.3s_ease-in-out_infinite]'}`}
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); removeApp(app.id); }}
                            className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold z-10 hover:bg-red-600"
                          >
                            &times;
                          </button>
                          <span className="text-3xl">{app.icon}</span>
                          <span className="text-xs text-center text-gray-300 leading-tight">{app.label}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {hiddenApps.map(app => (
                    <div key={app.id} onClick={() => addApp(app)} className="flex flex-col items-center gap-1.5 border-2 border-dashed border-gray-600 rounded-2xl p-3 cursor-pointer hover:border-pink-500 hover:bg-pink-500/10 transition">
                      <span className="text-2xl">{app.icon}</span>
                      <span className="text-xs text-center text-gray-400 leading-tight">{app.label}</span>
                      <span className="text-[10px] font-bold text-pink-400 bg-pink-500/20 rounded-full px-2 py-0.5">+ Add</span>
                    </div>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {homeApps.map(app => (
              <div key={app.id} className={`relative flex flex-col items-center gap-1.5 rounded-2xl p-3 cursor-pointer hover:scale-95 transition-transform glass-glow`} style={{background: 'rgba(255,255,255,0.06)'}}>
                {app.soon && <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">Soon</span>}
                <span className="text-3xl">{app.icon}</span>
                <span className="text-xs text-center text-gray-300 leading-tight">{app.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended For You */}
      <div className="px-4 mb-6">
        <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">{t('recommended')}</p>
        <div className="space-y-3">
          {RECOMMENDED_IDS.map(r => (
            <div key={r.id} className="glass rounded-2xl p-4 cursor-pointer hover:scale-[1.01] transition-transform">
              <p className="font-semibold text-sm mb-1">{r.icon} {t(r.titleKey)}</p>
              <p className="text-gray-400 text-sm">{t(r.descKey)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Glow Everywhere */}
      <div className="px-4 mb-6">
        <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">{t('glow_everywhere')}</p>
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {SOCIAL.map((s, i) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition ${i < SOCIAL.length - 1 ? 'border-b border-white/10' : ''}`}
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

      </div>{/* end relative z-10 */}

      <BottomNav active="home" />

      {showCustomize && (
        <CustomizeModal
          bgColor={bgColor}
          setBgColor={setBgColor}
          bgPattern={bgPattern}
          setBgPattern={setBgPattern}
          bgImage={bgImage}
          setBgImage={setBgImage}
          bgImagePos={bgImagePos}
          setBgImagePos={setBgImagePos}
          onClose={() => setShowCustomize(false)}
        />
      )}
    </div>
  );
}