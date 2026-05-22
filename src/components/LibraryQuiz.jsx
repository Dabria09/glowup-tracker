import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function LibraryQuiz({ quiz }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [showResult, setShowResult] = useState(false);

  if (!quiz) return null;

  const question = quiz.questions[currentQ];

  const handleSelect = (idx) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === question.answer) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQ + 1 >= quiz.questions.length) {
      setDone(true);
    } else {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setShowResult(false);
  };

  if (done) {
    const pct = Math.round((score / quiz.questions.length) * 100);
    const msg = pct === 100 ? "Perfect score! You're a pro! 🏆"
      : pct >= 80 ? "Amazing job! You really know your stuff! 🌟"
      : pct >= 60 ? "Good work! Keep learning! 💪"
      : "Keep reading and try again! You've got this! 📚";

    return (
      <div className="rounded-2xl p-5 mt-4 text-center" style={{ background: 'rgba(109,40,217,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
        <p className="text-4xl mb-2">
          {pct === 100 ? '🏆' : pct >= 80 ? '🌟' : pct >= 60 ? '💪' : '📚'}
        </p>
        <p className="text-xl font-bold text-white mb-1">Quiz Complete!</p>
        <p className="text-4xl font-bold mb-1" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {score}/{quiz.questions.length}
        </p>
        <p className="text-sm text-gray-300 mb-4">{msg}</p>
        <button onClick={handleRetry}
          className="px-6 py-2.5 rounded-full text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Quiz Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-pink-400">🧠 Quick Quiz</p>
        <span className="text-xs text-gray-500">{currentQ + 1} / {quiz.questions.length}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${((currentQ + (showResult ? 1 : 0)) / quiz.questions.length) * 100}%`, background: 'linear-gradient(90deg, #ec4899, #a855f7)' }} />
      </div>

      {/* Question */}
      <div className="rounded-2xl p-4 mb-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="text-sm font-semibold text-white leading-relaxed">{question.q}</p>
      </div>

      {/* Options */}
      <div className="space-y-2 mb-3">
        {question.options.map((opt, idx) => {
          let style = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' };
          let textClass = 'text-gray-300';

          if (showResult) {
            if (idx === question.answer) {
              style = { background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)' };
              textClass = 'text-green-400 font-semibold';
            } else if (idx === selected && idx !== question.answer) {
              style = { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)' };
              textClass = 'text-red-400';
            }
          }

          return (
            <button key={idx} onClick={() => handleSelect(idx)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition ${!showResult ? 'hover:bg-white/10' : ''}`}
              style={style}>
              {showResult && idx === question.answer && <CheckCircle size={16} className="text-green-400 flex-shrink-0" />}
              {showResult && idx === selected && idx !== question.answer && <XCircle size={16} className="text-red-400 flex-shrink-0" />}
              {(!showResult || (idx !== question.answer && idx !== selected)) && (
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#9ca3af' }}>
                  {String.fromCharCode(65 + idx)}
                </span>
              )}
              <span className={`text-sm ${textClass}`}>{opt}</span>
            </button>
          );
        })}
      </div>

      {showResult && (
        <button onClick={handleNext}
          className="w-full py-3 rounded-2xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
          {currentQ + 1 >= quiz.questions.length ? 'See Results 🎉' : 'Next Question →'}
        </button>
      )}
    </div>
  );
}