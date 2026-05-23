import { useState } from 'react';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ConnectionRequestModal({ isOpen, onClose, mentor, user, onSubmitted }) {
  const [formData, setFormData] = useState({
    topic: '',
    availability: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.topic.trim() || !formData.availability) return;

    try {
      setLoading(true);
      await base44.entities.MentorSession.create({
        mentee_email: user.email,
        mentor_email: mentor.user_email,
        session_date: formData.availability,
        topic: formData.topic.trim(),
        notes: formData.message.trim(),
        status: 'scheduled',
      });
      onSubmitted();
      onClose();
    } catch (error) {
      console.error('Error sending request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-lg">🔍 Request Connection</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)' }}>
          <p className="text-sm text-white font-semibold">{mentor.full_name}</p>
          {mentor.title && <p className="text-xs text-gray-400">{mentor.title}</p>}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">What would you like to discuss? *</label>
            <textarea
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
              placeholder="e.g., Career transition, Building confidence, Starting a business..."
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={3}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Your Availability *</label>
            <select
              value={formData.availability}
              onChange={(e) => setFormData({...formData, availability: e.target.value})}
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <option value="">Select your availability</option>
              <option value="Weekdays - Morning">Weekdays - Morning</option>
              <option value="Weekdays - Afternoon">Weekdays - Afternoon</option>
              <option value="Weekdays - Evening">Weekdays - Evening</option>
              <option value="Weekends">Weekends</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Message (optional)</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="Share any additional context..."
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={3}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!formData.topic.trim() || !formData.availability || loading}
            className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
          >
            {loading ? 'Sending...' : 'Send Connection Request'}
          </button>
        </div>
      </div>
    </div>
  );
}