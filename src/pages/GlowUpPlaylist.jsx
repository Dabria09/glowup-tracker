import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Plus, ExternalLink, Trash2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function GlowUpPlaylist() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', url: '', emoji: '🎵' });

  const EMOJIS = ['🎵', '🔥', '✨', '💖', '👑', '🌙', '🎯', '💪', '🙏', '🎶'];

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const saved = localStorage.getItem(`ggu_playlists_${u.email}`);
      if (saved) setPlaylists(JSON.parse(saved));
    }).catch(() => setUser(null));
  }, []);

  const saveToStorage = (list) => {
    if (user) localStorage.setItem(`ggu_playlists_${user.email}`, JSON.stringify(list));
  };

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.url.trim()) return;
    const newList = [...playlists, { id: Date.now(), ...formData }];
    setPlaylists(newList);
    saveToStorage(newList);
    setShowForm(false);
    setFormData({ name: '', url: '', emoji: '🎵' });
  };

  const handleDelete = (id) => {
    const newList = playlists.filter(p => p.id !== id);
    setPlaylists(newList);
    saveToStorage(newList);
  };

  return (
    <div className="min-h-screen text-white pb-28"
      style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a18 40%, #0d0610 100%)' }}>

      <div className="px-4 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/discover')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">🎵 Glow Up Playlist</h1>
            <p className="text-xs text-gray-400">Your personal music collection</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-white font-bold"
            style={{ background: 'linear-gradient(135deg, #FF1F8E, #a855f7)' }}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Playlists */}
        {playlists.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">🎶</p>
            <p className="text-gray-400 text-sm mb-2">No playlists yet</p>
            <p className="text-gray-500 text-xs mb-6">Add a Spotify, Apple Music, or YouTube link</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 rounded-full font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #FF1F8E, #a855f7)' }}
            >
              Add Your First Playlist
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {playlists.map(playlist => (
              <div
                key={playlist.id}
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-3xl flex-shrink-0">{playlist.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{playlist.name}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{playlist.url}</p>
                </div>
                <a
                  href={playlist.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-pink-500/20 hover:bg-pink-500/40 transition flex-shrink-0"
                >
                  <ExternalLink size={16} className="text-pink-400" />
                </a>
                <button
                  onClick={() => handleDelete(playlist.id)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500/20 transition flex-shrink-0"
                >
                  <Trash2 size={16} className="text-gray-500 hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Playlist Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-6"
            style={{ background: '#1a0a18', borderTop: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">Add Playlist 🎵</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Pick an Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => setFormData({ ...formData, emoji: e })}
                      className="w-10 h-10 rounded-xl text-xl transition"
                      style={{
                        background: formData.emoji === e ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.05)',
                        border: formData.emoji === e ? '2px solid #EC4899' : '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Playlist Name</label>
                <input
                  type="text"
                  placeholder="e.g., My Hype Mix"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Playlist URL</label>
                <input
                  type="url"
                  placeholder="Paste Spotify, Apple Music, or YouTube link..."
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              <button
                onClick={handleAdd}
                className="w-full py-3 rounded-xl font-bold text-white mt-2"
                style={{ background: 'linear-gradient(135deg, #FF1F8E, #a855f7)' }}
              >
                Add Playlist 🎵
              </button>
              <div className="h-6" />
            </div>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}