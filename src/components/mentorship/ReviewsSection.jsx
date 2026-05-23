import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ReviewsSection({ mentor, user, onReviewSubmitted }) {
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasSessionWithMentor, setHasSessionWithMentor] = useState(null);

  const loadReviews = async () => {
    try {
      const sessions = await base44.entities.MentorSession.filter({
        mentor_email: mentor.user_email,
        status: 'completed'
      });
      const withReviews = sessions.filter(s => s.rating && s.rating > 0);
      setReviews(withReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const checkUserSession = async () => {
    try {
      const sessions = await base44.entities.MentorSession.filter({
        mentor_email: mentor.user_email,
        mentee_email: user.email,
        status: 'completed'
      });
      const alreadyReviewed = sessions.some(s => s.rating && s.rating > 0);
      setHasSessionWithMentor(sessions.length > 0 && !alreadyReviewed);
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  useState(() => {
    loadReviews();
    checkUserSession();
  }, []);

  const handleSubmitReview = async () => {
    if (newRating === 0 || !newComment.trim()) return;

    try {
      setLoading(true);
      const sessions = await base44.entities.MentorSession.filter({
        mentor_email: mentor.user_email,
        mentee_email: user.email,
        status: 'completed'
      });
      
      if (sessions.length > 0) {
        await base44.entities.MentorSession.update(sessions[0].id, {
          rating: newRating,
          feedback: newComment.trim()
        });
        
        setReviews([...reviews, {
          mentee_email: user.email,
          rating: newRating,
          feedback: newComment.trim(),
          created_date: new Date().toISOString()
        }]);
        
        onReviewSubmitted();
        setShowReviewForm(false);
        setNewRating(0);
        setNewComment('');
        setHasSessionWithMentor(false);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white text-lg">Reviews and Feedback</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-yellow-400">{averageRating}</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} size={16} className={star <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} />
            ))}
          </div>
          <span className="text-xs text-gray-400">({reviews.length} reviews)</span>
        </div>
      </div>

      {hasSessionWithMentor && !showReviewForm && (
        <button
          onClick={() => setShowReviewForm(true)}
          className="w-full mb-4 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
        >
          <Star size={16} /> Leave a Review
        </button>
      )}

      {showReviewForm && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <p className="text-sm text-white font-semibold mb-3">Share your experience with {mentor.full_name}</p>
          
          <div className="mb-3">
            <label className="text-xs font-bold text-gray-400 mb-2 block">Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setNewRating(star)}
                  className="transition hover:scale-110"
                >
                  <Star 
                    size={32} 
                    className={star <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs font-bold text-gray-400 mb-2 block">Comment *</label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What was your experience like?"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowReviewForm(false);
                setNewRating(0);
                setNewComment('');
              }}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReview}
              disabled={newRating === 0 || !newComment.trim() || loading}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
            >
              <Send size={14} /> Submit Review
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="text-center py-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Star size={40} className="mx-auto mb-3 text-gray-600" />
            <p className="text-sm text-gray-400">No reviews yet</p>
            <p className="text-xs text-gray-500 mt-1">Be the first to share your experience</p>
          </div>
        ) : (
          reviews.map((review, idx) => (
            <div key={idx} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                  {(review.mentee_email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {(review.mentee_email || 'user').split('@')[0]}
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={12} className={star <= (review.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-300">{review.feedback}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}