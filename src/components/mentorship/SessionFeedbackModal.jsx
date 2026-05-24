import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SessionFeedbackModal({ isOpen, onClose, session, mentorName, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;

    try {
      setLoading(true);

      // Save rating + feedback to the session
      await base44.entities.MentorSession.update(session.id, {
        rating,
        feedback,
        status: 'completed',
      });

      // Recalculate mentor's average rating
      const allSessions = await base44.entities.MentorSession.filter({
        mentor_email: session.mentor_email,
        status: 'completed',
      });

      const ratedSessions = allSessions.filter(s => s.rating > 0);
      const avgRating = ratedSessions.length > 0
        ? ratedSessions.reduce((sum, s) => sum + s.rating, 0) / ratedSessions.length
        : rating;

      // Update mentor profile
      const mentorRecords = await base44.entities.Mentor.filter({ user_email: session.mentor_email });
      if (mentorRecords.length > 0) {
        await base44.entities.Mentor.update(mentorRecords[0].id, {
          rating: Math.round(avgRating * 10) / 10,
          sessions_count: allSessions.length,
        });
      }

      onSubmitted();
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
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
        className="w-full rounded-t-3xl p-6"
        style={{ background: '#1a0a30' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-lg">Rate Your Session</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <p className="text-sm text-gray-300 mb-6">
          How was your session with <span className="text-white font-semibold">{mentorName}</span>?
        </p>

        {/* Star Rating */}
        <div className="flex justify-center gap-3 mb-6">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
            >
              <Star
                size={40}
                className={`transition ${star <= (hovered || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-center text-sm font-semibold mb-4" style={{ color: '#f59e0b' }}>
            {['', 'Poor', 'Fair', 'Good', 'Great', 'Amazing!'][rating]}
          </p>
        )}

        {/* Written Feedback */}
        <div className="mb-6">
          <label className="text-xs font-bold text-gray-400 mb-2 block">Additional Comments (optional)</label>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Share what was helpful or how the session could improve..."
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!rating || loading}
          className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    </div>
  );
}