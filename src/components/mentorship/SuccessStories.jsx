import { useState, useEffect } from 'react';
import { Star, Heart, Share2, Award, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SuccessStories({ user }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const publicStories = await base44.entities.SuccessStory.filter({
        is_approved: true,
        is_public: true
      });
      setStories(publicStories.sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0)));
      setLoading(false);
    } catch (error) {
      console.error('Error loading stories:', error);
      setLoading(false);
    }
  };

  const markHelpful = async (storyId) => {
    try {
      const story = await base44.entities.SuccessStory.get(storyId);
      await base44.entities.SuccessStory.update(storyId, {
        helpful_count: (story.helpful_count || 0) + 1
      });
      loadStories();
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Award size={24} className="text-yellow-400" />
          Success Stories
        </h2>
        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-4 py-2 rounded-xl font-semibold text-sm text-white"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
        >
          Share Your Story
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Award size={40} className="mx-auto mb-3 text-gray-600" />
          <p className="text-sm text-gray-400">No success stories yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stories.map(story => (
            <div
              key={story.id}
              className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-white text-lg">{story.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {story.mentee_email?.split('@')[0]} with {story.mentor_email?.split('@')[0]}
                  </p>
                </div>
                <button
                  onClick={() => markHelpful(story.id)}
                  className="flex items-center gap-1 text-xs text-pink-400"
                >
                  <Heart size={14} />
                  {story.helpful_count || 0}
                </button>
              </div>

              <p className="text-sm text-gray-300 mb-3">{story.story}</p>

              {story.outcome && (
                <div className="rounded-lg p-3 mb-3" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <p className="text-xs text-green-400 font-bold mb-1">✨ Outcome</p>
                  <p className="text-xs text-gray-300">{story.outcome}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{new Date(story.submitted_date).toLocaleDateString()}</p>
                <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition">
                  <Share2 size={12} />
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSubmitModal && (
        <SuccessStorySubmitModal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          user={user}
          onSubmitted={() => {
            loadStories();
          }}
        />
      )}
    </div>
  );
}

function SuccessStorySubmitModal({ isOpen, onClose, user, onSubmitted }) {
  const [formData, setFormData] = useState({
    title: '',
    story: '',
    outcome: '',
    mentor_email: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title || !formData.story || !formData.mentor_email) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await base44.entities.SuccessStory.create({
        mentee_email: user.email,
        mentor_email: formData.mentor_email,
        title: formData.title,
        story: formData.story,
        outcome: formData.outcome,
        is_approved: false,
        is_public: false,
        submitted_date: new Date().toISOString(),
      });

      onSubmitted();
      onClose();
    } catch (error) {
      console.error('Error submitting story:', error);
      alert('Error submitting story');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-lg">Share Your Success Story</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <p className="text-xs text-gray-300">Your story will be reviewed before being published to inspire others!</p>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Story Title *</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Mentor's Email *</label>
            <input
              value={formData.mentor_email}
              onChange={(e) => setFormData({...formData, mentor_email: e.target.value})}
              placeholder="mentor@example.com"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Your Story *</label>
            <textarea
              value={formData.story}
              onChange={(e) => setFormData({...formData, story: e.target.value})}
              placeholder="How did mentorship impact your life?"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={5}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Outcome/Impact</label>
            <textarea
              value={formData.outcome}
              onChange={(e) => setFormData({...formData, outcome: e.target.value})}
              placeholder="What changed as a result?"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={3}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !formData.title || !formData.mentor_email || !formData.story}
            className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
          >
            {loading ? 'Submitting...' : 'Submit Story'}
          </button>
        </div>
      </div>
    </div>
  );
}