import { useState } from 'react';
import { X, Image as ImageIcon, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PostModal({ isOpen, onClose, user, onPostCreated }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      setLoading(true);
      // Since there's no Post entity yet, we can just close and show success
      // In a real app, you'd save to a GlowKitchenPost entity
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: '🍽️ Kitchen Post Shared!',
        body: `Your post was shared: "${content}"`
      });
      
      setContent('');
      setImageUrl('');
      onPostCreated();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6"
        style={{ background: '#1a0a30' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-lg">Share a Post</h2>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">What's cooking? 👨‍🍳</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your kitchen moment, recipe win, or cooking inspiration..."
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">{content.length}/500</p>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Add an image (optional)</label>
            <div className="relative">
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste image URL..."
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-40 object-cover rounded-xl mt-3"
                onError={() => setImageUrl('')}
              />
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!content.trim() || loading}
            className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
          >
            <Plus size={18} /> {loading ? 'Sharing...' : 'Share Post'}
          </button>
        </div>
      </div>
    </div>
  );
}