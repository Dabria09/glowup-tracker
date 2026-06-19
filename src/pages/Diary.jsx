import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';
import AppBackground from '@/components/AppBackground';
import { Download, Lock, Plus, Search, ChevronLeft } from 'lucide-react';

const MOOD_FILTERS = [
  { label: 'Excited', emoji: '⚡' },
  { label: 'Okay', emoji: '🙂' },
  { label: 'Sad', emoji: '😢' },
  { label: 'Stressed', emoji: '😤' },
  { label: 'Angry', emoji: '😠' },
];

export default function Diary() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [moodFilter, setMoodFilter] = useState(null);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    // Track page view with metadata
    base44.analytics.track({ eventName: 'page_view', metadata: { page: 'Diary', path: '/diary' } });
    
    base44.auth.me().then(async (u) => {
      setUser(u);
      const [data, pts] = await Promise.all([
        base44.entities.DiaryEntry.filter({ user_email: u.email }),
        base44.entities.UserPoints.filter({ user_email: u.email }),
      ]);
      setEntries(data.sort((a, b) => b.entry_date?.localeCompare(a.entry_date)));
      if (pts.length) setPoints(pts[0].total_points || 0);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const filtered = entries.filter(e => {
    const matchSearch = !search || e.title?.toLowerCase().includes(search.toLowerCase()) || e.content?.toLowerCase().includes(search.toLowerCase());
    const matchMood = !moodFilter || e.mood === moodFilter;
    return matchSearch && matchMood;
  });

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a0a2e' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#1a0a2e' }}>
      <AppBackground />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-6 pb-4">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-1 transition">
              <ChevronLeft size={18} /> Back
            </button>
            <h1 className="text-3xl font-bold text-white">My Diary</h1>
            <p className="text-sm text-gray-400 mt-0.5">{entries.length} entries · Your private space 🔒</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={() => navigate('/glow-score')} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs font-bold">
              <span>🏅</span><span className="text-yellow-400">{points.toLocaleString()} pts</span>
            </button>
            <button className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
              <Download size={16} className="text-gray-300" />
            </button>
            <button className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
              <Lock size={16} className="text-gray-300" />
            </button>
            <button
              onClick={() => navigate('/diary/new')}
              className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center"
            >
              <Plus size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 mb-3">
          <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2.5">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search your entries..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-white text-sm outline-none w-full placeholder-gray-500"
            />
          </div>
        </div>

        {/* Mood Filter Chips */}
        <div className="flex gap-2 px-4 mb-6 overflow-x-auto no-scrollbar">
          {MOOD_FILTERS.map(m => (
            <button
              key={m.label}
              onClick={() => setMoodFilter(moodFilter === m.label ? null : m.label)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm transition ${
                moodFilter === m.label
                  ? 'bg-pink-500/30 border-pink-500 text-white'
                  : 'bg-white/5 border-white/20 text-gray-300'
              }`}
            >
              <span>{m.emoji}</span> {m.label}
            </button>
          ))}
        </div>

        {/* Empty or Entries */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
            <span className="text-6xl mb-4">📖</span>
            <h2 className="text-xl font-bold text-white mb-2">Start Your Story</h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Your diary is a safe space to express yourself, track your growth, and celebrate your journey.
            </p>
            <button
              onClick={() => navigate('/diary/new')}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold text-sm"
            >
              Write Your First Entry
            </button>
          </div>
        ) : (
          <div className="px-4 space-y-3">
            {filtered.map(entry => (
              <button
                key={entry.id}
                onClick={() => navigate(`/diary/${entry.id}`)}
                className="w-full text-left glass rounded-2xl p-4 hover:scale-[1.01] transition-transform"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{entry.title || 'Untitled'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{entry.entry_date}</p>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{entry.content}</p>
                  </div>
                  {entry.mood && <span className="text-2xl flex-shrink-0">{
                    { Amazing: '🌟', Happy: '🙂', Grateful: '🙏', Excited: '⚡', Okay: '😐', Sad: '😢', Stressed: '😤', Angry: '😠' }[entry.mood]
                  }</span>}
                </div>
                {entry.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                      <span key={tag} className="text-xs bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav active="me" />
    </div>
  );
}