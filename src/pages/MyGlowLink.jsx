import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Plus, X, Upload } from 'lucide-react';

const GLOW_ERAS = [
  'Confidence Era', 'Glow Up Era', 'Boss Era', 'Healing Era', 'Growth Era',
  'Abundance Era', 'Queen Era', 'Unbothered Era', 'Focused Era', 'Elevation Era'
];

export default function MyGlowLink() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postText, setPostText] = useState('');
  const [postVisibility, setPostVisibility] = useState('followers');
  const [postFiles, setPostFiles] = useState([]);
  
  // Settings
  const [username, setUsername] = useState('');
  const [glowEra, setGlowEra] = useState('Glow Up Era');
  const [bio, setBio] = useState('');
  const [motto, setMotto] = useState('');
  const [links, setLinks] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState(null);
  
  const [achievements, setAchievements] = useState({
    streak: 7,
    badges: 3,
    goals: 2,
    challenges: 1,
    days: 30,
    tier: 'Radiant',
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    public_profile: true,
    show_achievements: true,
    show_streak: true,
    show_goals: true,
    show_links: true,
    show_timeline: true,
  });

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
      if (profiles.length) setProfile(profiles[0]);
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setPostFiles(prev => [...prev, ...files.slice(0, 5 - prev.length)]);
  };

  const createPost = async () => {
    if (!postText.trim() && postFiles.length === 0) return;
    
    let fileUrls = [];
    for (const file of postFiles) {
      try {
        const res = await base44.integrations.Core.UploadFile({ file });
        fileUrls.push(res.file_url);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    const post = await base44.entities.GlowUpPost.create({
      user_email: user.email,
      content: postText.trim(),
      media_urls: JSON.stringify(fileUrls),
      visibility: postVisibility,
      likes: 0,
      comments: 0,
    });

    setPosts(prev => [post, ...prev]);
    setPostText('');
    setPostFiles([]);
    setShowPostForm(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative overflow-y-auto" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10">

        {/* Header */}
        <div className="sticky top-0 z-20 backdrop-blur-md bg-black/30 border-b border-white/10 px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">My Glow Link™</h1>
            <p className="text-xs text-gray-400">Your personal shareable profile</p>
          </div>
          <button className="px-4 py-2 rounded-full font-bold text-white text-sm bg-pink-500 hover:bg-pink-600 transition">
            Save
          </button>
        </div>

        <div className="px-4 py-4 space-y-6">

          {/* Profile Section */}
          <div>
            <h2 className="text-sm font-bold tracking-widest text-gray-400 mb-3">YOUR PROFILE</h2>
            <div className="flex items-center justify-between gap-4 rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {profilePhoto ? <img src={profilePhoto} alt="profile" className="w-full h-full object-cover rounded-full" /> : user?.full_name?.[0] || 'G'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{user?.full_name}</p>
                  <p className="text-xs text-gray-400 truncate">@{user?.email?.split('@')[0]}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-white">{followers}</p>
                <p className="text-[10px] text-gray-400">Followers</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-white">{following}</p>
                <p className="text-[10px] text-gray-400">Following</p>
              </div>
            </div>
          </div>

          {/* Post Creation Button - Always visible at top */}
          <button onClick={() => setShowPostForm(true)} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(236,72,153,0.3)' }}>
            <Plus size={18} className="text-pink-400" />
            <span className="text-sm font-semibold text-pink-400">Share a post</span>
          </button>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10">
            <button onClick={() => setActiveTab('timeline')} className={`pb-3 px-4 font-semibold text-sm transition border-b-2 ${activeTab === 'timeline' ? 'text-pink-400 border-pink-400' : 'text-gray-400 border-transparent'}`}>
              Timeline
            </button>
            <button onClick={() => setActiveTab('settings')} className={`pb-3 px-4 font-semibold text-sm transition border-b-2 ${activeTab === 'settings' ? 'text-pink-400 border-pink-400' : 'text-gray-400 border-transparent'}`}>
              Settings
            </button>
          </div>

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {/* Posts */}
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl mb-3 block">✨</span>
                  <p className="text-gray-400 text-sm">No posts yet. Share your glow journey!</p>
                </div>
              ) : (
                posts.map(post => (
                  <div key={post.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-white text-sm">{user?.full_name}</p>
                        <p className="text-xs text-gray-400">{new Date(post.created_date).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full" style={{ background: post.visibility === 'public' ? 'rgba(52,211,153,0.2)' : 'rgba(168,85,247,0.2)', color: post.visibility === 'public' ? '#86efac' : '#d8b4fe' }}>
                        {post.visibility === 'public' ? '🌍 Public' : '👥 Followers'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-200 mb-3">{post.content}</p>
                    {post.media_urls && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {JSON.parse(post.media_urls || '[]').slice(0, 4).map((url, i) => (
                          <img key={i} src={url} alt="post" className="w-full h-32 rounded-xl object-cover" />
                        ))}
                      </div>
                    )}
                    <div className="flex gap-4 text-xs text-gray-400">
                      <button className="hover:text-pink-400 transition">❤️ {post.likes}</button>
                      <button className="hover:text-pink-400 transition">💬 {post.comments}</button>
                      {post.visibility === 'public' && (
                        <button onClick={() => { alert('Post reshared! 🎉'); }} className="hover:text-pink-400 transition">🔄 Reshare</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6 pb-6">
              {/* Glow Link & Profile */}
              <div>
                <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-3">YOUR GLOW LINK</h3>
                <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="text-xs text-gray-400 mb-2">Your Link</p>
                  <div className="flex items-center gap-2 mb-3 p-3 rounded-xl bg-black/30">
                    <span className="text-sm text-yellow-400 font-mono flex-1 truncate">https://gguapp.com/glowlink/{username || 'username'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(`https://gguapp.com/glowlink/${username || 'username'}`); alert('Link copied! 📋'); }} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full text-sm font-semibold border border-pink-400/50 text-pink-400 hover:bg-pink-400/10 transition">
                      📋 Copy
                    </button>
                    <button onClick={() => { if (navigator.share) { navigator.share({ title: 'Check out my Glow Link!', url: `https://gguapp.com/glowlink/${username || 'username'}` }).catch(() => {}); } else { alert('Share not supported on this device'); } }} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full text-sm font-semibold border border-pink-400/50 text-pink-400 hover:bg-pink-400/10 transition">
                      📤 Share
                    </button>
                    <button onClick={() => window.open(`https://gguapp.com/glowlink/${username || 'username'}`, '_blank')} className="px-3 py-2 rounded-full text-sm font-semibold border border-pink-400/50 text-pink-400 hover:bg-pink-400/10 transition">↗️</button>
                  </div>
                </div>
              </div>

              {/* Profile Photo */}
              <div>
                <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-3">PROFILE PHOTO</h3>
                <p className="text-xs text-gray-400 mb-3">This photo shows on your Glow Link and across the app</p>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 overflow-hidden flex items-center justify-center text-2xl font-bold flex-shrink-0">
                    {profilePhoto ? <img src={profilePhoto} alt="profile" className="w-full h-full object-cover" /> : user?.full_name?.[0]}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="px-4 py-2 rounded-full bg-pink-500 text-white font-semibold text-sm cursor-pointer hover:bg-pink-600 transition">
                      📸 Upload Photo
                      <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && setProfilePhoto(URL.createObjectURL(e.target.files[0]))} className="hidden" />
                    </label>
                    <button onClick={() => setProfilePhoto(null)} className="px-4 py-2 rounded-full border border-red-500/50 text-red-400 font-semibold text-sm hover:bg-red-500/10 transition">Remove Photo</button>
                  </div>
                </div>
              </div>

              {/* Username */}
              <div>
                <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-3">USERNAME</h3>
                <div>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="text-gray-400">@</span>
                    <input value={username} onChange={e => setUsername(e.target.value)} placeholder="rasheleria" className="bg-transparent text-white outline-none flex-1" />
                  </div>
                  <p className="text-xs text-red-400 mt-1">✕ Already taken</p>
                  <p className="text-xs text-gray-400 mt-1">Your link: /glowlink/{username}</p>
                </div>
              </div>

              {/* Glow Era */}
              <div>
                <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-3">GLOW ERA</h3>
                <div className="grid grid-cols-2 gap-2">
                  {GLOW_ERAS.map(era => (
                    <button key={era} onClick={() => setGlowEra(era)} className={`px-3 py-2 rounded-full text-xs font-semibold transition ${glowEra === era ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>
                      {era}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-3">YOUR BIO</h3>
                <p className="text-xs text-gray-400 mb-2">Tell the world who you are and where you're going... 👑</p>
                <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 500))} placeholder="Your bio here..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none resize-none min-h-20" />
                <p className="text-xs text-gray-400 text-right mt-1">{bio.length}/500</p>
              </div>

              {/* Personal Motto */}
              <div>
                <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-3">PERSONAL MOTTO</h3>
                <textarea value={motto} onChange={e => setMotto(e.target.value)} placeholder="Your personal motto or favorite quote..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none resize-none min-h-16" />
              </div>

              {/* Custom Links */}
              <div>
                <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-3">YOUR LINKS ({links.length}/3)</h3>
                {links.map((link, i) => (
                  <div key={i} className="mb-3 p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-xs text-gray-400 mb-1">{link.label}</p>
                    <p className="text-xs text-gray-500 truncate">{link.url}</p>
                  </div>
                ))}
                {links.length < 3 && (
                  <button onClick={() => { const label = prompt('Link label (e.g., TikTok, Instagram):'); const url = prompt('Link URL:'); if (label && url) setLinks(prev => [...prev, { label, url }]); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                    + Add Link
                  </button>
                )}
              </div>

              {/* Achievements */}
              <div>
                <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-3">HER ACHIEVEMENTS</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <span className="text-2xl block mb-1">🔥</span>
                    <p className="font-bold text-white text-sm">{achievements.streak} days</p>
                    <p className="text-xs text-gray-400">Streak</p>
                  </div>
                  <div className="text-center p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <span className="text-2xl block mb-1">⭐</span>
                    <p className="font-bold text-white text-sm">{achievements.badges} earned</p>
                    <p className="text-xs text-gray-400">Badges</p>
                  </div>
                  <div className="text-center p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <span className="text-2xl block mb-1">🎯</span>
                    <p className="font-bold text-white text-sm">{achievements.goals} active</p>
                    <p className="text-xs text-gray-400">Goals</p>
                  </div>
                  <div className="text-center p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <span className="text-2xl block mb-1">✓</span>
                    <p className="font-bold text-white text-sm">{achievements.challenges} done</p>
                    <p className="text-xs text-gray-400">Challenges</p>
                  </div>
                  <div className="text-center p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <span className="text-2xl block mb-1">📅</span>
                    <p className="font-bold text-white text-sm">{achievements.days}+</p>
                    <p className="text-xs text-gray-400">Days in GGU</p>
                  </div>
                  <div className="text-center p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <span className="text-2xl block mb-1">👑</span>
                    <p className="font-bold text-white text-sm">{achievements.tier}</p>
                    <p className="text-xs text-gray-400">Tier</p>
                  </div>
                </div>
              </div>

              {/* Privacy Controls */}
              <div>
                <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-3">PRIVACY CONTROLS</h3>
                {[
                  { key: 'public_profile', label: 'Public Profile', desc: 'Anyone can view your Glow Link' },
                  { key: 'show_achievements', label: 'Show Achievements', desc: 'Display your badges and stats' },
                  { key: 'show_streak', label: 'Show Streak', desc: 'Show your current streak' },
                  { key: 'show_goals', label: 'Show Goals', desc: 'Show your public goals' },
                  { key: 'show_links', label: 'Show Links', desc: 'Show your custom links' },
                  { key: 'show_timeline', label: 'Show Timeline', desc: 'Show your Glow Up Timeline' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-3 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <button onClick={() => setPrivacy(p => ({ ...p, [item.key]: !p[item.key] }))} className={`w-10 h-6 rounded-full transition ${privacy[item.key] ? 'bg-pink-500' : 'bg-gray-600'}`}>
                      <div className={`w-5 h-5 rounded-full bg-white transition ${privacy[item.key] ? 'ml-4.5' : 'ml-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={async () => { if (user) { await base44.auth.updateMe({ bio, motto }); alert('Glow Link saved!'); } }} className="w-full py-3 rounded-2xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                Save My Glow Link 💜
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Creation Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowPostForm(false)}>
          <div className="w-full rounded-t-3xl flex flex-col max-h-[90vh] h-full" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <h3 className="text-lg font-bold">New Post</h3>
              <button onClick={() => setShowPostForm(false)}><X size={20} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <textarea value={postText} onChange={e => setPostText(e.target.value)} placeholder="What's on your mind? ✨" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none min-h-24 resize-none" />
              <div className="flex gap-2 flex-wrap">
                {postFiles.map((file, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center">
                    <span className="text-3xl">{file.type.includes('video') ? '🎥' : '📸'}</span>
                    <button onClick={() => setPostFiles(prev => prev.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <label className="flex items-center gap-2 px-4 py-3 rounded-2xl cursor-pointer" style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}>
                <Upload size={16} className="text-purple-400" />
                <span className="text-sm text-purple-400 font-semibold">Upload pics or videos (max 5)</span>
                <input type="file" multiple accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
              </label>
              <div>
                <p className="text-xs text-gray-400 mb-2">Who can see this?</p>
                <div className="flex gap-2">
                  <button onClick={() => setPostVisibility('followers')} className={`flex-1 py-2 rounded-full font-semibold text-sm transition ${postVisibility === 'followers' ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                    👥 Followers
                  </button>
                  <button onClick={() => setPostVisibility('public')} className={`flex-1 py-2 rounded-full font-semibold text-sm transition ${postVisibility === 'public' ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                    🌍 Public
                  </button>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 pt-3 border-t border-white/10 flex-shrink-0">
              <button onClick={createPost} disabled={!postText.trim() && postFiles.length === 0} className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40 transition" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="connect" />
    </div>
  );
}