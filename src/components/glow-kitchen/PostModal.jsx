import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Plus, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PostModal({ isOpen, onClose, user, onPostCreated, category = 'feed' }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedImage(file_url);
      setImageUrl(file_url);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      setLoading(true);
      await base44.entities.KitchenPost.create({
        user_email: user.email,
        username: user.full_name || user.email.split('@')[0],
        content: content.trim(),
        image_url: imageUrl,
        category: category,
        likes: 0,
        liked_by: '[]',
        comments: '[]',
        created_date: new Date().toISOString()
      });
      
      setContent('');
      setImageUrl('');
      setUploadedImage(null);
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
          <h2 className="font-bold text-white text-lg">
            {category === 'feed' && '📸 Share a Post'}
            {category === 'budget' && '💰 Share Budget Tip'}
            {category === 'cultural' && '🌍 Share Cultural Recipe'}
          </h2>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">
              {category === 'feed' && 'What\'s cooking? 👨‍🍳'}
              {category === 'budget' && 'Share your budget-friendly meal tip 💚'}
              {category === 'cultural' && 'Tell us about this cultural dish 🌍'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                category === 'feed' ? 'Share your kitchen moment, recipe win, or cooking inspiration...' :
                category === 'budget' ? 'How do you save money while eating healthy? Share your tips!' :
                'What makes this dish special in your culture?'
              }
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">{content.length}/500</p>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Add an image (optional)</label>
            
            {/* Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-600 text-gray-400 hover:border-pink-500 hover:text-pink-400 transition flex items-center justify-center gap-2"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <Upload size={18} />
              {uploadedImage ? 'Change Image' : 'Upload from Device'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* URL Input (alternative) */}
            <div className="mt-3">
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste image URL..."
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            {/* Image Preview */}
            {(uploadedImage || imageUrl) && (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-40 object-cover rounded-xl mt-3"
                onError={() => {
                  setImageUrl('');
                  setUploadedImage(null);
                }}
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