import { useState } from 'react';
import { X, Check, XCircle, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';

export default function QuizModal({ lesson, questions, onClose, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleSelectAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz complete
      const correctCount = newAnswers.reduce((sum, answer, idx) => {
        return sum + (answer === questions[idx].correctAnswer ? 1 : 0);
      }, 0);
      const finalScore = Math.round((correctCount / questions.length) * 100);
      setScore(finalScore);
      setQuizComplete(true);
      setShowResult(true);
      if (onComplete) onComplete(finalScore);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1]);
    }
  };

  if (quizComplete) {
    const passed = score >= 70;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-3xl p-8 max-w-md w-full border border-white/10">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: passed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>
              <Trophy size={48} className={passed ? 'text-green-400' : 'text-red-400'} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {passed ? 'Congratulations! 🎉' : 'Keep Learning! 💪'}
            </h2>
            <p className="text-gray-400 mb-6">
              {passed ? 'You passed the quiz!' : 'Review the lesson and try again'}
            </p>
            <div className="text-6xl font-bold mb-2" style={{ color: passed ? '#22C55E' : '#EF4444' }}>
              {score}%
            </div>
            <p className="text-sm text-gray-500 mb-6">
              {answers.filter((a, i) => a === questions[i].correctAnswer).length}/{questions.length} correct
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-bold text-white"
              style={{ background: passed ? 'linear-gradient(135deg, #22C55E, #16A34A)' : 'linear-gradient(135deg, #EC4899, #DB2777)' }}>
              {passed ? 'Continue Learning' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-3xl p-6 max-w-2xl w-full border border-white/10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold tracking-widest text-pink-400 mb-1">QUIZ</p>
            <h2 className="text-lg font-bold text-white">{lesson.title}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400">Question {currentQuestion + 1} of {questions.length}</p>
            <p className="text-xs text-gray-400">{Math.round(progress)}%</p>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #EC4899, #A855F7)' }} />
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <p className="text-lg font-semibold text-white mb-6">{question.question}</p>
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(idx)}
                className={`w-full text-left p-4 rounded-xl border transition ${
                  selectedAnswer === idx
                    ? 'border-pink-500 bg-pink-500/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                    selectedAnswer === idx ? 'border-pink-500 bg-pink-500' : 'border-gray-600'
                  }`}>
                    {selectedAnswer === idx && <Check size={14} className="text-white" />}
                  </div>
                  <span className="text-sm text-white">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition ${
              currentQuestion === 0
                ? 'opacity-50 cursor-not-allowed text-gray-500'
                : 'text-white bg-white/10 hover:bg-white/20'
            }`}
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition ${
              selectedAnswer === null
                ? 'opacity-50 cursor-not-allowed bg-gray-700'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90'
            }`}
          >
            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
            {currentQuestion < questions.length - 1 && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}