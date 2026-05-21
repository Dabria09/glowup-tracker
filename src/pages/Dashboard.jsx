import { useState, useEffect } from 'react';
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

function getTime() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const PATTERN_SVGS = {
  stars: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='10' y='42' font-size='30' fill='rgba(255,255,255,0.05)'>&#9733;</text></svg>",
  hearts: "<svg xmlns='http://www.w3.org/2000/svg' width='55' height='55'><text x='8' y='40' font-size='28' fill='rgba(255,255,255,0.05)'>&#9829;</text></svg>",
  sparkles: "<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><text x='5' y='36' font-size='26' fill='rgba(255,255,255,0.06)'>&#10022;</text></svg>",
  flowers: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='8' y='42' font-size='30' fill='rgba(255,255,255,0.05)'>&#10047;</text></svg>",
  butterflies: "<svg xmlns='http://www.w3.org/2000/svg' width='65' height='65'><text x='6' y='46' font-size='32' fill='rgba(255,255,255,0.05)'>&#129419;</text></svg>",
  diamonds: "<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><polygon points='22,3 41,22 22,41 3,22' fill='rgba(255,255,255,0.05)'/></svg>",
  crowns: "<svg xmlns='http://www.w3.org/2000/svg' width='65' height='65'><text x='8' y='46' font-size='32' fill='rgba(255,255,255,0.05)'>&#128081;</text></svg>",
  dots: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='2' fill='rgba(255,255,255,0.05)'/></svg>",
  moons: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='8' y='42' font-size='30' fill='rgba(255,255,255,0.05)'>&#9790;</text></svg>",
  lightning: "<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><text x='8' y='38' font-size='26' fill='rgba(255,255,255,0.05)'>&#9889;</text></svg>",
  fire: "<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><text x='8' y='38' font-size='26' fill='rgba(255,255,255,0.05)'>&#128293;</text></svg>",
  snowflakes: "<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><text x='5' y='38' font-size='28' fill='rgba(255,255,255,0.06)'>&#10052;</text></svg>",
  music: "<svg xmlns='http://www.w3.org/2000/svg' width='55' height='55'><text x='6' y='40' font-size='28' fill='rgba(255,255,255,0.05)'>&#9834;</text></svg>",
  rainbow: "<svg xmlns='http://www.w3.org/2000/svg' width='65' height='55'><text x='4' y='42' font-size='30' fill='rgba(255,255,255,0.05)'>&#127752;</text></svg>",
  clouds: "<svg xmlns='http://www.w3.org/2000/svg' width='70' height='50'><text x='4' y='36' font-size='30' fill='rgba(255,255,255,0.05)'>&#9729;</text></svg>",
  paws: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='8' y='42' font-size='28' fill='rgba(255,255,255,0.05)'>&#128062;</text></svg>",
  lips: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='6' y='42' font-size='28' fill='rgba(255,255,255,0.05)'>&#128139;</text></svg>",
  eyes: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='6' y='42' font-size='28' fill='rgba(255,255,255,0.05)'>&#129535;</text></svg>",
};

const patternStyle = (pattern, bgColor, bgImage) => {
  const base = { backgroundColor: bgColor };
  if (bgImage) return { ...base, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  if (pattern && pattern !== 'none' && PATTERN_SVGS[pattern]) {
    const encoded = encodeURIComponent(PATTERN_SVGS[pattern]);
    return { ...base, backgroundImage: `url("data:image/svg+xml,${encoded}")` };
  }
  return base;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarConfig, setAvatarConfig] = useState(null);
  const [time, setTime] = useState(getTime());
  const [search, setSearch] = useState('');
  const [showCustomize, setShowCustomize] = useState(false);
  const [bgColor, setBgColor] = useState('#1a0a0f');
  const [bgPattern, setBgPattern] = useState('none');
  const [bgImage, setBgImage] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [homeApps, setHomeApps] = useState(WORLD_APPS.filter(a => !a.soon));

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
    ...RECOMMENDED.map(r => ({ label: r.title, route: '/' + r.id })),
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
    <div className="min-h-screen text-white pb-24 overflow-x-hidden" style={patternStyle(bgPattern, bgColor, bgImage)}>
      {/* Points badge */}
      <div className="flex justify-end px-4 pt-3">
        <div className="flex items-center gap-1 bg-gray-800/80 rounded-full px-3 py-1 text-xs font-bold">
          <span>🏅</span><span className="text-yellow-400">15 pts</span>
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
            className="text-xs border border-pink-500 rounded-full px-3 py-1.5 text-pink-400 font-semibold hover:bg-pink-500/10 transition"
          >
            ✅ Done
          </button>
        ) : (
          <>
            <button onClick={() => setIsEditMode(true)} className="text-xs border border-gray-600 rounded-full px-3 py-1.5 text-gray-300 hover:text-white hover:border-gray-400 transition">⚙️ Edit Home</button>
            <button onClick={() => setShowCustomize(true)} className="text-xs border border-gray-600 rounded-full px-3 py-1.5 text-gray-300 hover:text-white hover:border-gray-400 transition">🎨 Customize</button>
          </>
        )}
      </div>

      {/* Greeting */}
      <div className="px-4 mb-4">
        <p className="text-gray-400 text-sm">{getGreeting()} ✨</p>
        <h1 className="text-2xl font-bold">Hey, {firstName} ✨</h1>
        <p className="text-gray-500 text-sm">@{username}</p>
      </div>

      {/* Quick Access */}
      {!isEditMode && (
        <div className="px-4 mb-5">
          <button className="flex items-center gap-2 bg-gray-800/80 rounded-full px-4 py-2 text-sm font-semibold text-white border border-gray-700">
            ⚡ Quick Access
          </button>
        </div>
      )}

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
                    <div key={app.id} onClick={() => addApp(app)} className="flex flex-col items-center gap-1.5 border-2 border-dashed border-gray-600 rounded-2xl p-3 cursor-pointer hover:border-pink-500 transition">
                      <span className="text-2xl text-gray-500">+</span>
                      <span className="text-xs text-center text-gray-500 leading-tight">{app.label}</span>
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
              <div key={app.id} className={`relative flex flex-col items-center gap-1.5 ${app.bg} rounded-2xl p-3 cursor-pointer hover:opacity-80 transition`}>
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
          onClose={() => setShowCustomize(false)}
        />
      )}
    </div>
  );
}