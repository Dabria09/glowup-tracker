import { useState } from 'react';
import { ChevronRight, X, RotateCcw } from 'lucide-react';

const QUESTIONS = [
  {
    q: 'What gets you most excited about a future career?',
    options: [
      { label: 'Helping people heal or feel better', cats: ['Healthcare', 'Mental Health'] },
      { label: 'Building and growing a business', cats: ['Business', 'Trades & Entrepreneurship'] },
      { label: 'Creating things — art, music, writing', cats: ['Creative & Media', 'Creative Arts', 'Design'] },
      { label: 'Solving technical problems with code or data', cats: ['Technology', 'Tech & Digital'] },
      { label: 'Fighting for justice and equality', cats: ['Law', 'Law & Justice', 'Education & Social Impact'] },
    ],
  },
  {
    q: 'How do you prefer to work?',
    options: [
      { label: 'Hands-on with people every day', cats: ['Healthcare', 'Education', 'Mental Health'] },
      { label: 'Independently with creative freedom', cats: ['Creative & Media', 'Creative Arts', 'Beauty & Wellness'] },
      { label: 'In a team, leading projects', cats: ['Business', 'Tech & Digital'] },
      { label: 'Researching and analyzing information', cats: ['Science', 'Technology', 'Finance'] },
      { label: 'In courtrooms, meetings, or policy rooms', cats: ['Law', 'Law & Justice', 'Education & Social Impact'] },
    ],
  },
  {
    q: "What's your biggest strength?",
    options: [
      { label: 'Empathy — I connect with people deeply', cats: ['Mental Health', 'Healthcare', 'Education & Social Impact'] },
      { label: 'Creativity — I think outside the box', cats: ['Creative Arts', 'Creative & Media', 'Design', 'Beauty & Wellness'] },
      { label: 'Leadership — I take charge naturally', cats: ['Business', 'Trades & Entrepreneurship'] },
      { label: 'Logic — I love solving complex problems', cats: ['Technology', 'Science', 'Finance', 'Tech & Digital'] },
      { label: 'Communication — I speak and write well', cats: ['Media', 'Law', 'Education'] },
    ],
  },
  {
    q: 'What kind of impact do you want to make?',
    options: [
      { label: 'Save and improve lives directly', cats: ['Healthcare', 'Mental Health'] },
      { label: 'Build wealth and financial security for others', cats: ['Finance', 'Business'] },
      { label: 'Inspire people through art or storytelling', cats: ['Creative & Media', 'Media', 'Creative Arts'] },
      { label: 'Innovate and shape the future of technology', cats: ['Technology', 'Tech & Digital', 'Science'] },
      { label: 'Fight injustice and create systemic change', cats: ['Law', 'Law & Justice', 'Education & Social Impact'] },
    ],
  },
  {
    q: 'What lifestyle do you want your career to give you?',
    options: [
      { label: 'High income with a prestigious title', cats: ['Healthcare', 'Law', 'Finance'] },
      { label: 'Freedom to be creative and set my own hours', cats: ['Creative & Media', 'Beauty & Wellness', 'Trades & Entrepreneurship'] },
      { label: 'Stability and a clear career path', cats: ['Education', 'Business', 'Technology'] },
      { label: 'Fame and a platform to influence others', cats: ['Media', 'Creative Arts', 'Tech & Digital'] },
      { label: 'Purpose — knowing I made a real difference', cats: ['Mental Health', 'Education & Social Impact', 'Law & Justice'] },
    ],
  },
];

const CATEGORY_COLORS = {
  Business: '#a855f7',
  Healthcare: '#06b6d4',
  Law: '#f59e0b',
  Technology: '#22c55e',
  Education: '#f97316',
  'Mental Health': '#ec4899',
  'Creative Arts': '#ef4444',
  Finance: '#10b981',
  Media: '#8b5cf6',
  Science: '#14b8a6',
  Design: '#6366f1',
  'Beauty & Wellness': '#f472b6',
  'Tech & Digital': '#3b82f6',
  'Creative & Media': '#e879f9',
  'Education & Social Impact': '#fb923c',
  'Law & Justice': '#fbbf24',
  'Trades & Entrepreneurship': '#84cc16',
};

export default function CareerQuiz({ onClose, onSelectCategory }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const handleAnswer = (cats) => {
    const newAnswers = [...answers, cats];
    if (step < QUESTIONS.length - 1) {
      setAnswers(newAnswers);
      setStep(step + 1);
    } else {
      // Tally scores
      const scores = {};
      newAnswers.forEach(catList => {
        catList.forEach(cat => {
          scores[cat] = (scores[cat] || 0) + 1;
        });
      });
      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const topCats = sorted.slice(0, 3).map(([cat, score]) => ({
        cat,
        pct: Math.round((score / QUESTIONS.length) * 100),
      }));
      setResult(topCats);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers([]);
    setResult(null);
  };

  const progress = ((step) / QUESTIONS.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end" onClick={onClose}>
      <div className="w-full rounded-t-3xl flex flex-col" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '92vh' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest">Career Match Quiz</p>
            <h2 className="text-lg font-bold text-white">Find Your % Match 🎯</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        {!result && (
          <div className="px-5 mb-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
              <span>Question {step + 1} of {QUESTIONS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #a855f7, #ec4899)' }} />
            </div>
          </div>
        )}

        <div className="overflow-y-auto flex-1 px-5 pb-6">
          {!result ? (
            <div>
              <p className="text-base font-bold text-white mb-5 leading-snug">{QUESTIONS[step].q}</p>
              <div className="space-y-3">
                {QUESTIONS[step].options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(opt.cats)}
                    className="w-full text-left px-4 py-3.5 rounded-2xl text-sm font-medium text-white transition hover:opacity-90"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <div className="text-5xl mb-2">✨</div>
                <h3 className="text-xl font-bold text-white mb-1">Your Top Career Matches!</h3>
                <p className="text-sm text-gray-400">Based on your answers, here are the fields you're most aligned with.</p>
              </div>
              <div className="space-y-3 mb-6">
                {result.map(({ cat, pct }, i) => (
                  <div key={i} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${CATEGORY_COLORS[cat]}40` }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-white text-sm">{cat}</p>
                      <span className="text-sm font-bold" style={{ color: CATEGORY_COLORS[cat] }}>{Math.min(pct + 60 + i * 10, 99)}% match</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(pct + 60 + i * 10, 99)}%`, background: CATEGORY_COLORS[cat], transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => { onSelectCategory(result[0].cat); onClose(); }}
                className="w-full py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 mb-3"
                style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                Explore {result[0].cat} Careers <ChevronRight size={16} />
              </button>
              <button onClick={reset} className="w-full py-3 rounded-2xl text-sm text-gray-400 flex items-center justify-center gap-2"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <RotateCcw size={14} /> Retake Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}