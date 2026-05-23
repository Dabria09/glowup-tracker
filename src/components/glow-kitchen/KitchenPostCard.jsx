import { useState } from 'react';
import { X, Heart, MessageCircle, Send, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function KitchenPostCard({ post, user, onLike, onDelete, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  const isLiked = post.liked_by?.includes(user?.email);
  const comments = JSON.parse(post.comments || '[]');

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      setLoading(true);
      const newComment = {
        user_email: user.email,
        username: user.full_name || user.email.split('@')[0],
        text: commentText.trim(),
        created_date: new Date().toISOString()
      };
      const updatedComments = [...comments, newComment];
      
      await base44.entities.KitchenPost.update(post.id, {
        comments: JSON.stringify(updatedComments)
      });
      
      onComment(post.id, updatedComments);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
            <span className="text-white font-bold text-sm">{post.username?.[0]?.toUpperCase() || '👤'}</span>
          </div>
          <div>
            <p className="font-bold text-white text-sm">{post.username || 'Anonymous'}</p>
            <p className="text-xs text-gray-500">{timeAgo(post.created_date)}</p>
          </div>
        </div>
        {post.user_email === user?.email && (
          <button onClick={() => onDelete(post.id)} className="text-gray-500 hover:text-red-400 transition">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-gray-200 mb-3 whitespace-pre-wrap">{post.content}</p>

      {/* Image */}
      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post"
          className="w-full h-48 object-cover rounded-xl mb-3"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-white/10">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-2 text-sm transition ${isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'}`}
        >
          <Heart size={18} className={isLiked ? 'fill-pink-500' : ''} />
          <span>{post.likes || 0}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
        >
          <MessageCircle size={18} />
          <span>{comments.length}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-white/10">
          {/* Existing Comments */}
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-xs text-gray-500 text-center">No comments yet</p>
            ) : (
              comments.map((comment, i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(236,72,153,0.2)' }}>
                    <span className="text-xs font-bold text-pink-400">{comment.username?.[0]?.toUpperCase() || '👤'}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{comment.username}</span>
                      <span className="text-xs text-gray-500">{timeAgo(comment.created_date)}</span>
                    </div>
                    <p className="text-xs text-gray-300">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment */}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-gray-500 outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button
              onClick={handleAddComment}
              disabled={!commentText.trim() || loading}
              className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}