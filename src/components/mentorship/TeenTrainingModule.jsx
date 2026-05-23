import { useState, useEffect } from 'react';
import { X, BookOpen, CheckCircle, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TRAINING_MODULES = [
  {
    id: 'module_1',
    title: 'Understanding Your Role',
    content: 'As a teen mentor, you play a vital role in guiding younger children. Learn about boundaries, active listening, and creating a safe space.',
    quiz: [
      { q: 'What age group can teen mentors work with?', options: ['Any age', 'Ages 6-12', 'Ages 13-17', 'Only babies'], correct: 1 },
      { q: 'If a mentee shares something concerning, you should:', options: ['Keep it secret', 'Report to admin', 'Ignore it', 'Tell friends'], correct: 1 },
    ]
  },
  {
    id: 'module_2',
    title: 'Safety & Boundaries',
    content: 'Learn about appropriate boundaries, when to involve adults, and how to recognize warning signs.',
    quiz: [
      { q: '1-on-1 video calls are allowed for mentees under 14?', options: ['Yes', 'No', 'Only with parent', 'Sometimes'], correct: 1 },
      { q: 'You can share your personal phone number with mentees?', options: ['Yes', 'No', 'Only if they ask', 'After 3 sessions'], correct: 1 },
    ]
  },
  {
    id: 'module_3',
    title: 'Communication Skills',
    content: 'Master the art of active listening, asking powerful questions, and providing constructive feedback.',
    quiz: [
      { q: 'Active listening means:', options: ['Talking more', 'Interrupting', 'Fully focusing', 'Multitasking'], correct: 2 },
      { q: 'Good questions are:', options: ['Yes/No only', 'Open-ended', 'Leading', 'Complicated'], correct: 1 },
    ]
  },
  {
    id: 'module_4',
    title: 'Building Confidence',
    content: 'Learn techniques to boost your mentee\'s self-esteem and help them discover their potential.',
    quiz: [
      { q: 'Praise should be:', options: ['Generic', 'Specific', 'Rare', 'About looks only'], correct: 1 },
      { q: 'When a mentee fails, you should:', options: ['Criticize', 'Encourage & learn', 'Ignore', 'Do it for them'], correct: 1 },
    ]
  },
];

export default function TeenTrainingModule({ isOpen, onClose, user, onCompleted }) {
  const [training, setTraining] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTraining();
  }, []);

  const loadTraining = async () => {
    try {
      const userTraining = await base44.entities.TeenMentorTraining.filter({ user_email: user.email });
      const trainingWithStatus = TRAINING_MODULES.map(module => {
        const userModule = userTraining.find(t => t.module_id === module.id);
        return {
          ...module,
          status: userModule?.status || 'not_started',
          quiz_score: userModule?.quiz_score || null,
          completed_date: userModule?.completed_date,
        };
      });
      setTraining(trainingWithStatus);
      setLoading(false);
    } catch (error) {
      console.error('Error loading training:', error);
      setLoading(false);
    }
  };

  const startModule = async (module) => {
    try {
      await base44.entities.TeenMentorTraining.create({
        user_email: user.email,
        module_id: module.id,
        module_title: module.title,
        status: 'in_progress',
        started_date: new Date().toISOString(),
      });
      setCurrentModule(module);
      setQuizAnswers({});
      loadTraining();
    } catch (error) {
      console.error('Error starting module:', error);
    }
  };

  const submitQuiz = async () => {
    const module = currentModule;
    let score = 0;
    module.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) score++;
    });
    const percentage = (score / module.quiz.length) * 100;

    try {
      const existing = await base44.entities.TeenMentorTraining.filter({
        user_email: user.email,
        module_id: module.id
      });

      if (existing.length > 0) {
        await base44.entities.TeenMentorTraining.update(existing[0].id, {
          status: percentage >= 70 ? 'completed' : 'in_progress',
          quiz_score: percentage,
          completed_date: percentage >= 70 ? new Date().toISOString() : null,
        });
      }

      if (percentage >= 70) {
        setCurrentModule(null);
        loadTraining();
        onCompleted?.();
      } else {
        alert(`Score: ${percentage}%. You need 70% to pass. Try again!`);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const allCompleted = training.every(t => t.status === 'completed');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <BookOpen size={20} className="text-orange-400" />
            Teen Mentor Training
          </h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        {allCompleted ? (
          <div className="text-center py-10">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-white mb-2">Training Complete!</h3>
            <p className="text-sm text-gray-400">You're now certified as a Teen Mentor!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {training.map((module, idx) => (
              <div
                key={module.id}
                className="rounded-xl p-4 flex items-center justify-between"
                style={{
                  background: module.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${module.status === 'completed' ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: module.status === 'completed' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)' }}>
                    {module.status === 'completed' ? (
                      <CheckCircle size={20} className="text-green-400" />
                    ) : (
                      <Lock size={20} className="text-orange-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{idx + 1}. {module.title}</h3>
                    {module.status === 'completed' && module.quiz_score !== null && (
                      <p className="text-xs text-green-400">Score: {module.quiz_score}%</p>
                    )}
                  </div>
                </div>
                {module.status !== 'completed' && (
                  <button
                    onClick={() => startModule(module)}
                    className="px-4 py-2 rounded-lg font-semibold text-xs text-white"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
                  >
                    {module.status === 'not_started' ? 'Start' : 'Continue'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {currentModule && (
          <div className="fixed inset-0 z-[101] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setCurrentModule(null)}>
            <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white text-lg">{currentModule.title}</h3>
                <button onClick={() => setCurrentModule(null)}><X size={20} className="text-gray-400" /></button>
              </div>

              <div className="space-y-6">
                <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-sm text-gray-300">{currentModule.content}</p>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-4">Quiz</h4>
                  <div className="space-y-4">
                    {currentModule.quiz.map((q, idx) => (
                      <div key={idx} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <p className="text-sm text-white font-semibold mb-3">{idx + 1}. {q.q}</p>
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => (
                            <button
                              key={optIdx}
                              onClick={() => setQuizAnswers({...quizAnswers, [idx]: optIdx})}
                              className={`w-full p-3 rounded-lg text-left text-sm transition ${
                                quizAnswers[idx] === optIdx
                                  ? 'text-white'
                                  : 'text-gray-400 bg-gray-800'
                              }`}
                              style={quizAnswers[idx] === optIdx ? { background: 'linear-gradient(135deg, #f59e0b, #f97316)' } : {}}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(quizAnswers).length !== currentModule.quiz.length}
                    className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40 mt-6"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
                  >
                    Submit Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}