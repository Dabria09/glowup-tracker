import { useState } from 'react';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = ['Career', 'Education', 'Business', 'Wellness', 'Faith', 'Relationships'];

export default function AnonymousQuestionModal({ isOpen, onClose, user, onSubmitted }) {
  const [formData, setFormData] = useState({
    question: '',
    category: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.question.trim() || !formData.category) return;

    try {
      setLoading(true);
      await base44.entities.AnonymousQuestion.create({
        user_email: user?.email || 'anonymous',
        question: formData.question.trim(),
        category: formData.category,
        status: 'pending',
        submitted_date: new Date().toISOString(),
        is_public: false,
        helpful_count: 0,
      });
      setFormData({ question: '', category: '' });
      onSubmitted();
      onClose();
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-lg">💌 Ask Anonymously</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)' }}>
            <p className="text-xs text-gray-300">
              🔒 Your question is completely anonymous. Mentors will only see your question, not your identity.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Your Question *</label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({...formData, question: e.target.value})}
              placeholder="What would you like to ask?"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={5}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.question.length}/500</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!formData.question.trim() || !formData.category || loading}
            className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
          >
            {loading ? 'Submitting...' : 'Submit Question'}
          </button>
        </div>
      </div>
    </div>
  );
}