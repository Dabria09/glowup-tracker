import { useState } from 'react';
import { ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function WisdomCard({ question, user }) {
  const [expanded, setExpanded] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(question.helpful_count || 0);

  const handleHelpful = async () => {
    try {
      await base44.entities.AnonymousQuestion.update(question.id, {
        helpful_count: helpfulCount + 1
      });
      setHelpfulCount(prev => prev + 1);
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">💌</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(6,182,212,0.2)', color: '#06b6d4' }}>
              {question.category}
            </span>
            {question.is_public && (
              <span className="text-xs text-gray-500">🌍 Public</span>
            )}
          </div>
          <p className="text-sm text-white font-medium">{question.question}</p>
        </div>
      </div>

      {question.answer && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-left py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-2"
            style={{ background: 'rgba(168,85,247,0.1)' }}
          >
            <span className="text-purple-400">👑</span>
            <span className="text-purple-300">Ms. Glow Wisdom</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expanded && (
            <div className="mt-3 pl-3 border-l-2 border-purple-500">
              <p className="text-sm text-gray-300 leading-relaxed">{question.answer}</p>
              <div className="flex items-center justify-between mt-3">
                <button
                  onClick={handleHelpful}
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-purple-400 transition"
                >
                  <ThumbsUp size={14} />
                  Helpful ({helpfulCount})
                </button>
                {question.answered_date && (
                  <span className="text-xs text-gray-500">
                    {new Date(question.answered_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {!question.answer && (
        <div className="text-xs text-gray-500 italic">
          Pending mentor response...
        </div>
      )}
    </div>
  );
}