import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { Plus, Heart, Bookmark, Search, TrendingUp, Grid, User } from 'lucide-react';

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newPost, setNewPost] = useState({
    image_url: '',
    title: '',
    description: '',
    category: 'Glow Style',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const u = await base44.auth.me();
          setUser(u);
        }
        
        const allPosts = await base44.entities.GlowBoard.list();
        setPosts(allPosts);
        setFilteredPosts(allPosts);
      } catch (err) {
        console.error('Error loading glow board:', err);
      }
      setLoading(false);
    };
    
    loadData();
  }, []);

  useEffect(() => {
    let filtered = posts;
    
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
  }, [selectedCategory, search, posts]);

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
      });
      
      setShowSubmitModal(false);
      setNewPost({ image_url: '', title: '', description: '', category: 'Glow Style' });
      
      const updated = await base44.entities.GlowBoard.list();
      setPosts(updated);
    } catch (err) {
      console.error('Error creating post:', err);
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative overflow-y-auto" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">✨ The Glow Board</h1>
            <p className="text-xs text-gray-400">Your vision. Your vibe. Your future.</p>
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-full font-bold text-white text-sm bg-pink-500 hover:bg-pink-600 transition flex items-center gap-2"
          >
            <Plus size={16} /> Submit
          </button>
        </div>

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

        {/* My Saves shortcut */}
        {user && (
          <button
            onClick={() => setSelectedCategory('all')}
            className="mb-4 flex items-center gap-2 text-xs text-pink-400 hover:text-pink-300 transition"
          >
            <Bookmark size={14} /> View All Posts
          </button>
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
                      <span className="text-[10px] text-gray-400">@{post.username}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSave(post);
                        }}
                        className={`p-1.5 rounded-full ${
                          isSaved ? 'bg-pink-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        <Bookmark size={14} />
                      </button>
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
            <span className="text-5xl mb-4 block">✨</span>
            <p className="text-gray-400 text-sm">No posts yet. Be the first to submit!</p>
          </div>
        )}

      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowSubmitModal(false)}>
          <div
            className="w-full rounded-t-3xl flex flex-col max-h-[90vh] h-full"
            style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <h3 className="text-lg font-bold">Submit to Glow Board</h3>
              <button onClick={() => setShowSubmitModal(false)}><Plus size={20} className="rotate-45" /></button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Image URL *</label>
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
              <button
                onClick={handleSubmitPost}
                disabled={!newPost.image_url.trim() || !newPost.category}
                className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40 transition"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
              >
                Submit Post ✨
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="glow" />
    </div>
  );
}