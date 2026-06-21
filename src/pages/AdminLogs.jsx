import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import { ChevronLeft, Flag, Trash2, Check, AlertTriangle, Shield, Users, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLogs() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, flagged, recent
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser.role !== 'admin') {
        toast.error('Access denied. Admins only.');
        navigate('/dashboard');
        return;
      }

      const response = await base44.functions.invoke('getReportedPosts', {});
      setPosts(response.data?.reports || response.data?.posts || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletePost(post) {
    try {
      const entityByType = {
        community_post: base44.entities.CommunityPost,
        shoutout: base44.entities.ShoutOut,
        video_session: base44.entities.MentorSession,
      };
      const targetEntity = entityByType[post.content_type] || base44.entities.CommunityPost;
      await targetEntity.delete(post.reported_content_id || post.id);
      if (post.reported_content_id && post.id) {
        await base44.entities.ContentReport.update(post.id, {
          status: 'removed',
          reviewed_by: user?.email,
          reviewed_date: new Date().toISOString(),
        }).catch(() => {});
      }
      setPosts(prev => prev.filter(p => p.id !== post.id));
      setShowDeleteConfirm(false);
      setSelectedPost(null);
      toast.success('Post removed successfully');
    } catch (error) {
      toast.error('Failed to remove post');
    }
  }

  async function handleApprovePost(post) {
    toast.success('Post marked as reviewed');
    setSelectedPost(null);
  }

  const filteredPosts = posts.filter(post => {
    if (filter === 'recent') {
      const postDate = new Date(post.created_date);
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return postDate > dayAgo;
    }
    return true;
  });

  const getDisplayName = (post) => post.username || post.reported_by?.split('@')[0] || 'Reported content';
  const getDisplayLabel = (post) => post.community_name || post.content_label || post.content_type?.replace('_', ' ') || 'Report';
  const getDisplayText = (post) => post.content || post.content_text || post.description || 'Content unavailable';

  const stats = {
    total: posts.length,
    today: posts.filter(p => {
      const postDate = new Date(p.created_date);
      const today = new Date();
      return postDate.toDateString() === today.toDateString();
    }).length,
    communities: new Set(posts.map(p => p.community_id || p.content_type).filter(Boolean)).size,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0010' }}>
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pb-20 relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />
      
      <div className="relative z-10 px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => navigate(-1)} className="text-gray-400">
            <ChevronLeft size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={22} className="text-purple-400" />
            <h1 className="text-xl font-bold text-white">Moderation Dashboard</h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle size={16} className="text-purple-400" />
              <p className="text-xs text-gray-400">Total Posts</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-yellow-400" />
              <p className="text-xs text-gray-400">Today</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.today}</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-pink-400" />
              <p className="text-xs text-gray-400">Communities</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.communities}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
              filter === 'all' ? 'text-white' : 'text-gray-400'
            }`}
            style={filter === 'all' 
              ? { background: 'rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.5)' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
            }
          >
            All Posts
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
              filter === 'recent' ? 'text-white' : 'text-gray-400'
            }`}
            style={filter === 'recent'
              ? { background: 'rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.5)' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
            }
          >
            Last 24h
          </button>
        </div>

        {/* Posts List */}
        <div className="space-y-3">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🛡️</div>
              <p className="text-white font-bold mb-2">All Clear!</p>
              <p className="text-gray-400 text-sm">No posts to review</p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <div
                key={post.id}
                className="rounded-2xl p-4 cursor-pointer transition hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                onClick={() => setSelectedPost(post)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                      <span className="text-xs font-bold text-white">
                        {getDisplayName(post)?.[0]?.toUpperCase() || 'R'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{getDisplayName(post)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.created_date).toLocaleDateString()} • {getDisplayLabel(post)}
                      </p>
                    </div>
                  </div>
                  <Flag size={16} className="text-gray-500" />
                </div>
                <p className="text-sm text-gray-200 line-clamp-2 mb-3">{getDisplayText(post)}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MessageCircle size={12} /> {post.likes || 0} likes
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100]" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={() => setSelectedPost(null)}>
          <div className="fixed bottom-0 left-0 right-0 flex flex-col max-h-[80vh] mb-20" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-white text-lg">Review Post</p>
                <button onClick={() => setSelectedPost(null)}>
                  <ChevronLeft size={20} className="text-gray-400 rotate-180" />
                </button>
              </div>

              {/* Post Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                  <span className="text-sm font-bold text-white">
                    {getDisplayName(selectedPost)?.[0]?.toUpperCase() || 'R'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{getDisplayName(selectedPost)}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(selectedPost.created_date).toLocaleString()} • {getDisplayLabel(selectedPost)}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-sm text-white whitespace-pre-wrap">{getDisplayText(selectedPost)}</p>
              </div>

              {/* Stats */}
              <div className="flex gap-4 mb-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <MessageCircle size={12} /> {selectedPost.likes || 0} likes
                </span>
                <span>•</span>
                <span>ID: {selectedPost.id}</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleApprovePost(selectedPost)}
                  className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)' }}
                >
                  <Check size={18} /> Mark as Reviewed
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}
                >
                  <Trash2 size={18} /> Remove Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[101]" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={() => setShowDeleteConfirm(false)}>
          <div className="fixed bottom-0 left-0 right-0 p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.2)' }}>
                <AlertTriangle size={24} className="text-red-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-lg">Remove Post?</p>
                <p className="text-xs text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3.5 rounded-xl font-semibold text-white"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(selectedPost)}
                className="flex-1 py-3.5 rounded-xl font-bold text-white"
                style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)' }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}