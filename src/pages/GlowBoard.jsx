import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { Plus, Heart, Bookmark, Search, TrendingUp, Trash2, Upload, X, ChevronLeft } from 'lucide-react';
import { awardPoints } from '@/lib/pointsHelper';
import useAgeGroup from '@/lib/useAgeGroup';

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'Glow Style', label: 'Glow Style', emoji: '💅' },
  { id: 'Dream Life', label: 'Dream Life', emoji: '🏠' },
  { id: 'Money Moves', label: 'Money Moves', emoji: '💰' },
  { id: 'Career Vision', label: 'Career Vision', emoji: '👩‍💼' },
  { id: 'Mindset', label: 'Mindset', emoji: '💭' },
  { id: 'Travel Goals', label: 'Travel Goals', emoji: '✈️' },
  { id: 'Home Goals', label: 'Home Goals', emoji: '🛋️' },
  { id: 'Wellness', label: 'Wellness', emoji: '🌿' },
  { id: 'Faith & Peace', label: 'Faith & Peace', emoji: '🙏' },
  { id: 'Study Grind', label: 'Study Grind', emoji: '📚' },
  { id: 'Glow Goals', label: 'Glow Goals', emoji: '🌟' },
];

export default function GlowBoard() {
  const navigate = useNavigate();
  const { ageGroup, worldInfo, filterForWorld } = useAgeGroup();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newPost, setNewPost] = useState({
    image_url: '',
    title: '',
    description: '',
    category: 'Glow Style',
  });
  const [featureSettings, setFeatureSettings] = useState(null);
  const [featureLoading, setFeatureLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const u = await base44.auth.me();
          setUser(u);
        }
        
        // Load feature settings
        const settings = await base44.entities.GlowBoardSettings.list();
        const activeSettings = settings[0] || { feature_enabled: true, accepting_submissions: true, require_approval: true };
        setFeatureSettings(activeSettings);
        
        // Load posts - only approved if require_approval is true
        const allPosts = await base44.entities.GlowBoard.list();
        let visiblePosts = allPosts;
        
        // If approval is required, only show approved posts
        if (activeSettings.require_approval) {
          visiblePosts = allPosts.filter(p => p.status === 'approved');
        }
        
        const worldPosts = filterForWorld(visiblePosts);
        setPosts(worldPosts);
        setFilteredPosts(worldPosts);
      } catch (err) {
        console.error('Error loading glow board:', err);
      }
      setLoading(false);
      setFeatureLoading(false);
    };
    
    loadData();
  }, []);

  useEffect(() => {
    let filtered = posts;
    
    if (activeTab === 'saved' && user) {
      filtered = filtered.filter(post => JSON.parse(post.saved_by || '[]').includes(user.email));
    } else if (activeTab === 'mine' && user) {
      filtered = filtered.filter(post => post.user_email === user.email);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }
    
    if (search.trim()) {
      filtered = filtered.filter(post => 
        post.title?.toLowerCase().includes(search.toLowerCase()) ||
        post.description?.toLowerCase().includes(search.toLowerCase()) ||
        post.username?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setFilteredPosts(filtered);
  }, [selectedCategory, search, posts, activeTab, user]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewPost({ ...newPost, image_url: file_url });
      setSelectedFile(file_url);
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitPost = async () => {
    if (!newPost.image_url.trim() || !newPost.category) return;
    
    try {
      await base44.entities.GlowBoard.create({
        user_email: user.email,
        username: user.full_name?.split('@')[0] || 'User',
        image_url: newPost.image_url,
        title: newPost.title,
        description: newPost.description,
        category: newPost.category,
        is_trending: false,
        saves: 0,
        saved_by: '[]',
        age_group: ageGroup || undefined,
      });
      
      await awardPoints(user.email, 'glow_board_post');
      setShowSubmitModal(false);
      setNewPost({ image_url: '', title: '', description: '', category: 'Glow Style' });
      setSelectedFile(null);
      
      const updated = await base44.entities.GlowBoard.list();
      setPosts(updated);
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await base44.entities.GlowBoard.delete(post.id);
      const updated = await base44.entities.GlowBoard.list();
      setPosts(updated);
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleSave = async (post) => {
    if (!user) {
      navigate('/onboarding');
      return;
    }
    
    try {
      const savedBy = JSON.parse(post.saved_by || '[]');
      const isSaved = savedBy.includes(user.email);
      
      let newSavedBy;
      let saveChange;
      
      if (isSaved) {
        newSavedBy = savedBy.filter(email => email !== user.email);
        saveChange = -1;
      } else {
        newSavedBy = [...savedBy, user.email];
        saveChange = 1;
      }
      
      await base44.entities.GlowBoard.update(post.id, {
        saved_by: JSON.stringify(newSavedBy),
        saves: (post.saves || 0) + saveChange,
      });
      
      const updated = await base44.entities.GlowBoard.list();
      setPosts(updated);
    } catch (err) {
      console.error('Error saving post:', err);
    }
  };

  if (loading || featureLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  // Feature disabled check
  if (featureSettings && !featureSettings.feature_enabled) {
    return (
      <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#080810' }}>
        <AppBackground />
        <div className="relative z-10 px-4 pt-4 flex flex-col items-center justify-center min-h-[80vh] text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.3)' }}>
            <span className="text-5xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Glow Board Temporarily Unavailable</h1>
          <p className="text-gray-400 text-sm max-w-md">
            {featureSettings.disabled_message || 'This feature is currently disabled. Please check back later!'}
          </p>
        </div>
        <BottomNav active="discover" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pb-24 relative overflow-y-auto" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">

        {/* World Banner */}
        {worldInfo && (
          <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5 mb-4" style={{ background: worldInfo.bgColor, border: `1px solid ${worldInfo.borderColor}` }}>
            <span className="text-lg">{worldInfo.emoji}</span>
            <div>
              <p className="text-xs font-bold" style={{ color: worldInfo.color }}>{worldInfo.label}</p>
              <p className="text-[10px] text-gray-400">Showing posts from your world</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/20 transition flex-shrink-0"><ChevronLeft size={20} /></button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">✨ The Glow Board</h1>
            <p className="text-xs text-gray-400">Your vision. Your vibe. Your future.</p>
          </div>
          {featureSettings?.accepting_submissions !== false && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 rounded-full font-bold text-white text-sm bg-pink-500 hover:bg-pink-600 transition flex items-center gap-2"
            >
              <Plus size={16} /> Submit
            </button>
          )}
        </div>

        {/* Submissions Paused Banner */}
        {featureSettings?.accepting_submissions === false && (
          <div className="mb-4 rounded-2xl p-4 border-2" style={{ background: 'rgba(245,158,11,0.08)', border: '2px solid rgba(245,158,11,0.35)' }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)' }}>
                <span className="text-lg">⏸️</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-400">Submissions Temporarily Paused</p>
                <p className="text-xs text-gray-400 mt-1">
                  New submissions are currently disabled. You can still browse and save existing posts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-5">
          <div className="flex items-center backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-4 py-2.5 gap-2">
            <Search size={16} className="text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search the board..."
              className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
            />
          </div>
        </div>

          {/* Categories */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition ${
                selectedCategory === cat.id 
                  ? 'text-white bg-pink-500' 
                  : 'text-gray-400 bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Tabs */}
        {user && (
          <div className="flex gap-2 mb-5">
            {[{id:'all',label:'All ✨'},{id:'saved',label:'Saved 🔖'},{id:'mine',label:'My Posts 💅'}].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  activeTab === tab.id ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Masonry Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {filteredPosts.map((post, idx) => {
            const isSaved = user && JSON.parse(post.saved_by || '[]').includes(user.email);
            
            return (
              <div
                key={post.id || idx}
                className="break-inside-avoid rounded-2xl overflow-hidden mb-3 relative group cursor-pointer hover:scale-[1.02] transition"
              >
                <img
                  src={post.image_url}
                  alt={post.title || 'Glow post'}
                  className="w-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&q=80';
                  }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    {post.title && (
                      <p className="text-white text-sm font-semibold mb-1">{post.title}</p>
                    )}
                    {post.description && (
                      <p className="text-gray-300 text-xs line-clamp-2">{post.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/glowlink/${post.username}`); }}
                        className="text-[10px] text-pink-400 hover:underline">
                        @{post.username}
                      </button>
                      <div className="flex items-center gap-1">
                        {user && post.user_email === user.email && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(post); }}
                            className="p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSave(post); }}
                          className={`p-1.5 rounded-full ${
                            isSaved ? 'bg-pink-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                        >
                          <Bookmark size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trending badge */}
                {post.is_trending && (
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-orange-500/90 text-white text-[10px] font-semibold flex items-center gap-1">
                    <TrendingUp size={10} /> Trending
                  </div>
                )}

                {/* Save count */}
                <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/50 text-white text-[10px] flex items-center gap-1">
                  <Heart size={10} /> {post.saves || 0}
                </div>
              </div>
            );
          })}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block">{activeTab === 'saved' ? '🔖' : activeTab === 'mine' ? '💅' : '✨'}</span>
            <p className="text-gray-400 text-sm">
              {activeTab === 'saved' ? 'No saved posts yet. Tap 🔖 on any post to save it!' :
               activeTab === 'mine' ? 'You haven\'t posted yet. Submit your first post!' :
               'No posts yet. Be the first to submit!'}
            </p>
          </div>
        )}

      </div>

      {/* Submit Modal - Check if accepting submissions */}
      {showSubmitModal && featureSettings?.accepting_submissions !== false && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowSubmitModal(false)}>
          <div
            className="w-full rounded-t-3xl flex flex-col max-h-[90vh] h-full"
            style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <h3 className="text-lg font-bold">Submit to Glow Board</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSubmitPost}
                  disabled={!newPost.image_url.trim() || !newPost.category}
                  className="px-4 py-2 rounded-full font-bold text-white text-sm disabled:opacity-40 transition"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
                >
                  Submit ✨
                </button>
                <button onClick={() => setShowSubmitModal(false)}><Plus size={20} className="rotate-45" /></button>
              </div>
            </div>
            <div className="overflow-y-auto px-6 pt-6 pb-20 space-y-5 flex-1">
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Upload Image *</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full bg-white/5 border border-white/10 border-dashed rounded-2xl px-4 py-6 text-center hover:bg-white/10 transition">
                      {selectedFile ? (
                        <div className="relative">
                          <img src={selectedFile} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover" />
                          <button
                            onClick={() => {
                              setSelectedFile(null);
                              setNewPost({ ...newPost, image_url: '' });
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                          <p className="text-sm text-gray-300">Click to upload or paste image URL below</p>
                          <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, GIF, WebP</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
                {uploading && (
                  <p className="text-xs text-pink-400 mt-2 flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Or Image URL</label>
                <input
                  value={newPost.image_url}
                  onChange={e => setNewPost({ ...newPost, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Title</label>
                <input
                  value={newPost.title}
                  onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="e.g., Glow Nails ✨"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Description</label>
                <textarea
                  value={newPost.description}
                  onChange={e => setNewPost({ ...newPost, description: e.target.value })}
                  placeholder="Add details..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none resize-none min-h-20"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Category *</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setNewPost({ ...newPost, category: cat.id })}
                      className={`px-3 py-2 rounded-full text-xs font-semibold transition ${
                        newPost.category === cat.id
                          ? 'bg-pink-500 text-white'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}