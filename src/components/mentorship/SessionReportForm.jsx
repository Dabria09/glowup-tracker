import { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SessionReportForm({ isOpen, onClose, session, onSubmitted }) {
  const [formData, setFormData] = useState({
    topics_covered: '',
    achievements: '',
    challenges: '',
    next_steps: '',
    safety_concerns: false,
    safety_notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.topics_covered.trim()) {
      alert('Please fill in topics covered');
      return;
    }

    try {
      setLoading(true);
      await base44.entities.SessionReport.create({
        session_id: session.id,
        mentor_email: session.mentor_email,
        mentee_email: session.mentee_email,
        session_date: session.session_date,
        topics_covered: formData.topics_covered,
        achievements: formData.achievements,
        challenges: formData.challenges,
        next_steps: formData.next_steps,
        safety_concerns: formData.safety_concerns,
        safety_notes: formData.safety_notes,
        submitted_date: new Date().toISOString(),
      });

      // Update session status
      await base44.entities.MentorSession.update(session.id, {
        status: 'completed',
        notes: formData.topics_covered,
      });

      onSubmitted();
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <Send size={20} className="text-green-400" />
            Session Report
          </h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
          <p className="text-sm text-white font-semibold">Session with {session.mentee_email?.split('@')[0] || session.mentor_email?.split('@')[0]}</p>
          <p className="text-xs text-gray-400 mt-1">{new Date(session.session_date).toLocaleString()}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Topics Covered *</label>
            <textarea
              value={formData.topics_covered}
              onChange={(e) => setFormData({...formData, topics_covered: e.target.value})}
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={3}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Achievements</label>
            <textarea
              value={formData.achievements}
              onChange={(e) => setFormData({...formData, achievements: e.target.value})}
              placeholder="What did the mentee accomplish?"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={2}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Challenges</label>
            <textarea
              value={formData.challenges}
              onChange={(e) => setFormData({...formData, challenges: e.target.value})}
              placeholder="Any challenges encountered?"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={2}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Next Steps</label>
            <textarea
              value={formData.next_steps}
              onChange={(e) => setFormData({...formData, next_steps: e.target.value})}
              placeholder="What should be done before next session?"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={2}
            />
          </div>

          <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                checked={formData.safety_concerns}
                onChange={(e) => setFormData({...formData, safety_concerns: e.target.checked})}
                className="w-4 h-4 rounded border-gray-600 text-red-500 focus:ring-red-500"
              />
              <label className="text-sm font-bold text-red-400">Safety Concerns</label>
            </div>
            {formData.safety_concerns && (
              <textarea
                value={formData.safety_notes}
                onChange={(e) => setFormData({...formData, safety_notes: e.target.value})}
                placeholder="Please describe the safety concern..."
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                rows={3}
              />
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}