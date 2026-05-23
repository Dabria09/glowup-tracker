import { useState } from 'react';
import { ThumbsUp, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function WisdomCard({ question, user }) {
  const [helpfulCount, setHelpfulCount] = useState(question.helpful_count || 0);
  const [hasVoted, setHasVoted] = useState(false);

  const handleHelpful = async () => {
    if (hasVoted) return;
    
    try {
      await base44.entities.AnonymousQuestion.update(question.id, {
        helpful_count: (question.helpful_count || 0) + 1
      });
      setHelpfulCount(prev => prev + 1);
      setHasVoted(true);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
          👑
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(168,85,247,0.2)', color: '#a855f7' }}>
              {question.category}
            </span>
            <span className="text-xs text-gray-500">{formatDate(question.submitted_date)}</span>
          </div>
          
          <p className="text-sm text-white font-semibold mb-2">Q: {question.question}</p>
          
          {question.answer && (
            <div className="rounded-xl p-3 mt-2" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <p className="text-xs text-gray-400 mb-1">A:</p>
              <p className="text-sm text-gray-200">{question.answer}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <button
          onClick={handleHelpful}
          disabled={hasVoted}
          className={`flex items-center gap-1.5 text-xs transition ${
            hasVoted ? 'text-purple-400' : 'text-gray-400 hover:text-purple-400'
          }`}
        >
          <ThumbsUp size={14} className={hasVoted ? 'fill-purple-400' : ''} />
          Helpful ({helpfulCount})
        </button>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <MessageCircle size={14} />
          Answered
        </span>
      </div>
    </div>
  );
}