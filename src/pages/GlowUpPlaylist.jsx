import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Music } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const PLAYLISTS = {
  mood_vibes: [
    { id: 'new_2025', title: 'New 2025', emoji: '🆕', color: '#FF1F8E', songs: 10 },
    { id: 'hype_songs', title: 'Hype Songs', emoji: '🔥', color: '#FF6B35', songs: 8 },
    { id: 'confidence', title: 'Confidence', emoji: '👑', color: '#FFD700', songs: 7 },
    { id: 'healing', title: 'Healing', emoji: '💖', color: '#FF69B4', songs: 6 },
    { id: 'focus_mode', title: 'Focus Mode', emoji: '🎯', color: '#3B82F6', songs: 8 },
    { id: 'feel_good', title: 'Feel Good', emoji: '✨', color: '#FFD700', songs: 8 },
    { id: 'faith', title: 'Faith & Gratitude', emoji: '🙏', color: '#A855F7', songs: 6 },
    { id: 'chill', title: 'Chill Vibes', emoji: '🌙', color: '#667EEA', songs: 7 },
  ],
  glow_sessions: [
    { id: 'morning_glow', title: 'Morning Glow', subtitle: 'Start your day right', emoji: '☕', songs: 5 },
    { id: 'study_grind', title: 'Study Grind', subtitle: 'Deep focus mode', emoji: '📚', songs: 5 },
    { id: 'workout_queen', title: 'Workout Queen', subtitle: 'Push through every rep', emoji: '💪', songs: 5 },
    { id: 'self_care', title: 'Self-Care Sunday', subtitle: 'Rest, restore, glow', emoji: '💆', songs: 5 },
    { id: 'glow_up_era', title: 'Glow Up Era', subtitle: 'Main character energy', emoji: '⭐', songs: 5 },
    { id: 'night_wind', title: 'Night Wind Down', subtitle: 'End the day in peace', emoji: '🌛', songs: 5 },
    { id: 'faith_walk', title: 'Faith Walk', subtitle: 'Walk in your purpose', emoji: '🕊️', songs: 5 },
    { id: 'girls_trip', title: 'Girls Trip', subtitle: 'Road trip with your girls', emoji: '✈️', songs: 5 },
    { id: 'journal_session', title: 'Journal Session', subtitle: 'Write it all out', emoji: '📝', songs: 5 },
  ],
};

const SONGS_BY_PLAYLIST = {
  new_2025: [
    { title: 'Texas Hold \'Em', artist: 'Beyoncé', mood: 'Country queen era', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'Espresso', artist: 'Sabrina Carpenter', mood: 'Confident summer bop', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'Please Please Please', artist: 'Sabrina Carpenter', mood: 'Cute but make it real', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'Spend It', artist: 'Young Miami', mood: 'Boss moves only', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'Savage Remix', artist: 'Megan Thee Stallion ft. Beyoncé', mood: 'Boss moves only', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'WAP', artist: 'Cardi B ft. Megan Thee Stallion', mood: 'Unapologetic confidence', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'Bodak Yellow', artist: 'Cardi B', mood: 'Take charge energy', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'FNF (Let\'s Go)', artist: 'Latto ft. SZA', mood: 'New year new me', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'Big Mama', artist: 'GloRilla', mood: 'Respect the legacy', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'Run the World (Girls)', artist: 'Beyoncé', mood: 'Girl power anthem', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
  ],
  hype_songs: [
    { title: 'Run the World (Girls)', artist: 'Beyoncé', mood: 'Girl power anthem', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'BOSS', artist: 'Fifth Harmony', mood: 'Own the room', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'Savage Remix', artist: 'Megan Thee Stallion ft. Beyoncé', mood: 'Boss moves only', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'Bodak Yellow', artist: 'Cardi B', mood: 'Take charge energy', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'Spend It', artist: 'Young Miami', mood: 'Boss moves only', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'FNF (Let\'s Go)', artist: 'Latto ft. SZA', mood: 'New year new me', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'Big Mama', artist: 'GloRilla', mood: 'Respect the legacy', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'Tootsee Slide', artist: 'Drake ft. Gunna', mood: 'Smooth and confident', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
  ],
  healing: [
    { title: 'Rise Up', artist: 'Andra Day', mood: 'Strength through pain', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'Scars to Your Beautiful', artist: 'Alessia Cara', mood: 'Self acceptance', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'Warrior', artist: 'Demi Lovato', mood: 'Survivor energy', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'Praying', artist: 'Kesha', mood: 'Healing journey', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'I Will Survive', artist: 'Gloria Gaynor', mood: 'You made it', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
    { title: 'Stronger (What Doesn\'t Kill You)', artist: 'Kelly Clarkson', mood: 'Unbreakable spirit', spotify: 'https://open.spotify.com/track/', apple: 'https://music.apple.com/us/album/' },
  ],
};

export default function GlowUpPlaylist() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mood_vibes');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handlePlaylistClick = (playlist) => {
    setSelectedPlaylist(playlist);
  };

  const getSongs = (playlistId) => {
    return SONGS_BY_PLAYLIST[playlistId] || [];
  };

  return (
    <div className="min-h-screen text-white pb-28"
      style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a18 40%, #0d0610 100%)' }}>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.07]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='%23fff'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 px-4 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/discover')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              🎵 Glow Up Playlist
            </h1>
            <p className="text-xs text-gray-400">2026 music + mood-matched vibes for your journey</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 mt-4">
          <button
            onClick={() => setActiveTab('mood_vibes')}
            className={`px-4 py-2.5 rounded-full font-bold text-sm transition ${activeTab === 'mood_vibes' ? 'bg-pink-500 text-white' : 'bg-white/10 text-gray-400'}`}
          >
            Mood Vibes
          </button>
          <button
            onClick={() => setActiveTab('glow_sessions')}
            className={`px-4 py-2.5 rounded-full font-bold text-sm transition ${activeTab === 'glow_sessions' ? 'bg-pink-500 text-white' : 'bg-white/10 text-gray-400'}`}
          >
            Glow Sessions
          </button>
        </div>

        {!selectedPlaylist ? (
          <>
            {activeTab === 'mood_vibes' && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4">Pick your vibe right now ✨</h2>
                <div className="grid grid-cols-2 gap-3">
                  {PLAYLISTS.mood_vibes.map(playlist => (
                    <button
                      key={playlist.id}
                      onClick={() => handlePlaylistClick(playlist)}
                      className="text-left rounded-2xl p-4 transition hover:scale-95"
                      style={{ background: `linear-gradient(135deg, ${playlist.color}40, ${playlist.color}20)`, border: `1px solid ${playlist.color}40` }}
                    >
                      <div className="text-3xl mb-2">{playlist.emoji}</div>
                      <p className="font-bold text-white text-sm">{playlist.title}</p>
                      <p className="text-xs text-gray-300 mt-1">{playlist.songs} songs</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'glow_sessions' && (
              <div>
                <h2 className="text-lg font-bold text-white mb-2">Curated playlists for every part of your glow journey ✨</h2>
                <div className="space-y-2 mt-4">
                  {PLAYLISTS.glow_sessions.map(playlist => (
                    <button
                      key={playlist.id}
                      onClick={() => handlePlaylistClick(playlist)}
                      className="w-full text-left rounded-2xl p-4 transition hover:bg-white/10"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{playlist.emoji}</span>
                        <div className="flex-1">
                          <p className="font-bold text-white">{playlist.title}</p>
                          <p className="text-xs text-gray-400">{playlist.subtitle} • {playlist.songs} songs</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Playlist Detail */}
            <button
              onClick={() => setSelectedPlaylist(null)}
              className="flex items-center gap-2 mb-6 text-pink-400 hover:text-pink-300 text-sm font-bold"
            >
              ← Back
            </button>

            <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-start gap-3 mb-4">
                <span className="text-5xl">{selectedPlaylist.emoji}</span>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{selectedPlaylist.title}</h2>
                  {selectedPlaylist.subtitle && <p className="text-sm text-gray-400 mt-1">{selectedPlaylist.subtitle}</p>}
                </div>
              </div>
              <p className="text-xs text-gray-400">{selectedPlaylist.songs} songs curated for you</p>
            </div>

            {/* Songs List */}
            <div className="space-y-3">
              {getSongs(selectedPlaylist.id).map((song, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-pink-500/20 flex-shrink-0 font-bold text-pink-400">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{song.title}</p>
                    <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                    <p className="text-xs text-gray-500 mt-1 italic">{song.mood}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={song.spotify} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center hover:bg-green-500/40 transition">
                      <span className="text-xs text-green-400 font-bold">S</span>
                    </a>
                    <a href={song.apple} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center hover:bg-red-500/40 transition">
                      <span className="text-xs text-red-400 font-bold">A</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav active="discover" />
    </div>
  );
}