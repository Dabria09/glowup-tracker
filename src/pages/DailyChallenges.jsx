import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Check, Star, Sparkles, Zap, Trophy, Calendar, Heart, Book, Dumbbell, Music, Smile } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const DAILY_TASKS_POOL = [
  { id: 'water_1', text: 'Drink a glass of water', category: 'wellness', xp: 25, emoji: '💧' },
  { id: 'stretch_1', text: 'Do 5 minutes of stretching', category: 'wellness', xp: 25, emoji: '🧘' },
  { id: 'breathe_1', text: 'Take 10 deep breaths', category: 'wellness', xp: 25, emoji: '😮‍💨' },
  { id: 'walk_1', text: 'Take a 10-minute walk', category: 'wellness', xp: 30, emoji: '🚶' },
  { id: 'gratitude_1', text: 'Write 1 thing you\'re grateful for', category: 'wellness', xp: 30, emoji: '📝' },
  { id: 'mirror_1', text: 'Say 1 positive affirmation in the mirror', category: 'confidence', xp: 30, emoji: '🪞' },
  { id: 'posture_1', text: 'Practice good posture for 1 hour', category: 'confidence', xp: 25, emoji: '💪' },
  { id: 'compliment_1', text: 'Give someone a genuine compliment', category: 'confidence', xp: 35, emoji: '💕' },
  { id: 'speak_1', text: 'Share an opinion in class or a group', category: 'confidence', xp: 40, emoji: '🎤' },
  { id: 'read_1', text: 'Read for 15 minutes', category: 'academic', xp: 30, emoji: '📖' },
  { id: 'review_1', text: 'Review today\'s notes', category: 'academic', xp: 30, emoji: '📚' },
  { id: 'question_1', text: 'Ask a teacher a question', category: 'academic', xp: 35, emoji: '🙋' },
  { id: 'plan_1', text: 'Plan tomorrow\'s tasks', category: 'academic', xp: 30, emoji: '📋' },
  { id: 'kindness_1', text: 'Do one kind act for someone', category: 'kindness', xp: 35, emoji: '💜' },
  { id: 'thankyou_1', text: 'Send a thank you message', category: 'kindness', xp: 30, emoji: '💌' },
  { id: 'listen_1', text: 'Listen actively to someone today', category: 'kindness', xp: 30, emoji: '👂' },
  { id: 'pray_1', text: 'Spend 5 minutes in prayer or meditation', category: 'spiritual', xp: 35, emoji: '🙏' },
  { id: 'verse_1', text: 'Read an inspiring passage', category: 'spiritual', xp: 30, emoji: '✨' },
  { id: 'nature_1', text: 'Spend time in nature', category: 'spiritual', xp: 30, emoji: '🌿' },
];

const WEEKLY_CHALLENGES = [
  {
    id: 'confidence_week',
    title: 'Confidence Boost',
    emoji: '👑',
    color: '#FF1F8E',
    days: [
      { day: 1, task: 'Compliment 3 people sincerely', xp: 50 },
      { day: 2, task: 'Speak up in class or a group', xp: 50 },
      { day: 3, task: 'Wear something that makes you feel powerful', xp: 50 },
      { day: 4, task: 'Practice power posing for 2 minutes', xp: 50 },
      { day: 5, task: 'Share an opinion even if others might disagree', xp: 75 },
      { day: 6, task: 'Try something you\'ve been afraid to try', xp: 75 },
      { day: 7, task: 'Celebrate yourself - write 5 things you love about you', xp: 100 },
    ],
  },
  {
    id: 'wellness_week',
    title: 'Wellness Week',
    emoji: '🌿',
    color: '#22C55E',
    days: [
      { day: 1, task: 'Drink 8 glasses of water', xp: 50 },
      { day: 2, task: '10-minute walk outside', xp: 50 },
      { day: 3, task: '5 minutes of deep breathing', xp: 50 },
      { day: 4, task: 'Write 3 things you\'re grateful for', xp: 50 },
      { day: 5, task: 'No social media for 2 hours', xp: 75 },
      { day: 6, task: 'Do one thing just for joy today', xp: 75 },
      { day: 7, task: 'Create a calming bedtime routine', xp: 100 },
    ],
  },
  {
    id: 'academic_week',
    title: 'Academic Excellence',
    emoji: '📚',
    color: '#3B82F6',
    days: [
      { day: 1, task: 'Organize your study space', xp: 50 },
      { day: 2, task: 'Review notes from today\'s classes', xp: 50 },
      { day: 3, task: 'Ask a teacher a question', xp: 50 },
      { day: 4, task: 'Read for 30 minutes beyond assignments', xp: 50 },
      { day: 5, task: 'Complete an assignment one day early', xp: 75 },
      { day: 6, task: 'Teach a concept to someone else', xp: 75 },
      { day: 7, task: 'Plan your assignments for next week', xp: 100 },
    ],
  },
  {
    id: 'kindness_week',
    title: 'Kindness Challenge',
    emoji: '💜',
    color: '#A855F7',
    days: [
      { day: 1, task: 'Send a thank you message to someone', xp: 50 },
      { day: 2, task: 'Help someone without being asked', xp: 50 },
      { day: 3, task: 'Give a genuine compliment', xp: 50 },
      { day: 4, task: 'Listen actively to someone today', xp: 50 },
      { day: 5, task: 'Share something you have with someone in need', xp: 75 },
      { day: 6, task: 'Stand up for someone', xp: 75 },
      { day: 7, task: 'Do something anonymous and kind', xp: 100 },
    ],
  },
];

export default function DailyChallenges() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [weeklyProgress, setWeeklyProgress] = useState({});
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [activeTab, setActiveTab] = useState('weekly');
  const [dailyTasks, setDailyTasks] = useState([]);
  const [todaysDate, setTodaysDate] = useState(new Date().toISOString().split('T')[0]);

  const getDailyTasksForDate = (date) => {
    // Generate 5 random tasks for the date
    const seed = date.split('-').join('').split('').reduce((a, b) => a + parseInt(b), 0);
    const shuffled = [...DAILY_TASKS_POOL].sort((a, b) => {
      const hash = (str) => str.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
      return hash(a.id + seed) - hash(b.id + seed);
    });
    return shuffled.slice(0, 5);
  };

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const progress = await base44.entities.WeeklyChallenge.filter({ user_email: u.email }).catch(() => []);
      const progressMap = {};
      progress.forEach(p => {
        progressMap[p.challenge_id] = p;
      });
      setWeeklyProgress(progressMap);

      // Fetch today's daily tasks
      const today = new Date().toISOString().split('T')[0];
      setTodaysDate(today);
      const tasks = await base44.entities.DailyTask.filter({ user_email: u.email, date: today }).catch(() => []);
      
      if (tasks.length === 0) {
        // Create today's tasks
        const newTasks = getDailyTasksForDate(today).map(t => ({
          user_email: u.email,
          task_id: t.id,
          task_text: t.text,
          category: t.category,
          xp: t.xp,
          date: today,
          is_completed: false,
        }));
        await base44.entities.DailyTask.bulkCreate(newTasks);
        const created = await base44.entities.DailyTask.filter({ user_email: u.email, date: today });
        setDailyTasks(created);
      } else {
        setDailyTasks(tasks);
      }
    }).catch(() => setUser(null));
  }, []);

  const handleStartChallenge = async (challenge) => {
    if (!user) {
      alert('Please log in to start challenges');
      return;
    }
    await base44.entities.WeeklyChallenge.create({
      user_email: user.email,
      challenge_id: challenge.id,
      challenge_name: challenge.title,
      status: 'in_progress',
      completed_days: '[]',
      total_xp: 0,
      started_date: new Date().toISOString(),
    });
    setSelectedChallenge(challenge);
  };

  const handleCompleteDay = async (challengeId, day, xp) => {
    if (!user) return;
    
    const currentProgress = weeklyProgress[challengeId];
    if (!currentProgress) return;

    const completedDays = currentProgress.completed_days ? JSON.parse(currentProgress.completed_days) : [];
    if (!completedDays.includes(day)) {
      completedDays.push(day);
    }

    const newXp = (currentProgress.total_xp || 0) + xp;
    const isComplete = completedDays.length === 7;

    await base44.entities.WeeklyChallenge.update(currentProgress.id, {
      completed_days: JSON.stringify(completedDays),
      total_xp: newXp,
      status: isComplete ? 'completed' : 'in_progress',
      completed_date: isComplete ? new Date().toISOString() : null,
    });

    const progress = await base44.entities.WeeklyChallenge.filter({ user_email: user.email }).catch(() => []);
    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.challenge_id] = p;
    });
    setWeeklyProgress(progressMap);
  };

  const handleCompleteDailyTask = async (taskId) => {
    if (!user) return;
    const task = dailyTasks.find(t => t.id === taskId);
    if (!task) return;

    await base44.entities.DailyTask.update(task.id, {
      is_completed: true,
      completed_date: new Date().toISOString(),
    });

    const tasks = await base44.entities.DailyTask.filter({ user_email: user.email, date: todaysDate });
    setDailyTasks(tasks);
  };

  const getWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return {
      start: startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  };

  const weekDates = getWeekDates();
  const totalWeeklyXp = Object.values(weeklyProgress).reduce((sum, p) => sum + (p.total_xp || 0), 0);
  const totalWeeklyCompleted = Object.values(weeklyProgress).reduce((sum, p) => {
    const days = p.completed_days ? JSON.parse(p.completed_days) : [];
    return sum + days.length;
  }, 0);
  const dailyTasksCompleted = dailyTasks.filter(t => t.is_completed).length;
  const dailyTotalXp = dailyTasks.filter(t => t.is_completed).reduce((sum, t) => sum + t.xp, 0);

  return (
    <div className="min-h-screen text-white pb-28"
      style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a18 40%, #0d0610 100%)' }}>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.07]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='%23fff'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 px-4 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/discover')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Daily Challenges</h1>
            <p className="text-xs text-gray-400">Build habits, one day at a time</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'weekly' ? 'text-white' : 'text-gray-500'}`}
            style={{ background: activeTab === 'weekly' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)', border: activeTab === 'weekly' ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.08)' }}
          >
            Weekly Challenges
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'daily' ? 'text-white' : 'text-gray-500'}`}
            style={{ background: activeTab === 'daily' ? 'rgba(255,31,142,0.2)' : 'rgba(255,255,255,0.05)', border: activeTab === 'daily' ? '1px solid rgba(255,31,142,0.4)' : '1px solid rgba(255,255,255,0.08)' }}
          >
            Daily Tasks
          </button>
        </div>

        {activeTab === 'weekly' && (
          <>
            {/* Weekly Stats */}
            <div className="rounded-2xl p-5 mb-6 border border-purple-500/30"
              style={{ background: 'rgba(168,85,247,0.1)' }}>
              <div className="flex items-center gap-3 mb-3">
                <Zap size={20} className="text-yellow-400" />
                <p className="text-sm font-bold text-white">This Week's Progress</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#FFD700' }}>{totalWeeklyCompleted}/28</p>
                  <p className="text-xs text-gray-400">Days Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#c084fc' }}>{totalWeeklyXp}</p>
                  <p className="text-xs text-gray-400">Total XP Earned</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">{weekDates.start} - {weekDates.end}</p>
            </div>

            {/* Challenge Cards */}
            <div className="space-y-4">
              {WEEKLY_CHALLENGES.map(challenge => {
                const progress = weeklyProgress[challenge.id];
                const completedDays = progress?.completed_days ? JSON.parse(progress.completed_days) : [];
                const isCompleted = progress?.status === 'completed';
                const progressPercent = (completedDays.length / 7) * 100;

                return (
                  <div 
                    key={challenge.id}
                    className="rounded-2xl p-5 cursor-pointer transition hover:opacity-90"
                    style={{ 
                      background: `linear-gradient(135deg, ${challenge.color}20, ${challenge.color}10)`,
                      border: `1px solid ${challenge.color}40`
                    }}
                    onClick={() => setSelectedChallenge(challenge)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ background: `${challenge.color}30`, border: `1px solid ${challenge.color}40` }}>
                          {challenge.emoji}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{challenge.title}</h3>
                          <p className="text-xs text-gray-400">7 days • {challenge.days.reduce((sum, d) => sum + d.xp, 0)} XP</p>
                        </div>
                      </div>
                      {isCompleted && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: challenge.color }}>
                          <Check size={16} className="text-white" />
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-400">Progress</p>
                        <p className="text-xs font-bold" style={{ color: challenge.color }}>{completedDays.length}/7 days</p>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all" 
                          style={{ width: `${progressPercent}%`, background: `linear-gradient(90deg, ${challenge.color}, ${challenge.color}80)` }} 
                        />
                      </div>
                    </div>

                    {!progress ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleStartChallenge(challenge); }}
                        className="w-full py-2.5 rounded-xl font-bold text-white text-sm"
                        style={{ background: `linear-gradient(135deg, ${challenge.color}, ${challenge.color}cc)` }}
                      >
                        Start Challenge ✨
                      </button>
                    ) : (
                      <p className="text-xs text-center" style={{ color: challenge.color }}>
                        {isCompleted ? '✓ Completed!' : `${completedDays.length}/7 days completed`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'daily' && (
          <>
            {/* Daily Stats */}
            <div className="rounded-2xl p-5 mb-6 border border-pink-500/30"
              style={{ background: 'rgba(255,31,142,0.1)' }}>
              <div className="flex items-center gap-3 mb-3">
                <Sparkles size={20} className="text-pink-400" />
                <p className="text-sm font-bold text-white">Today's Progress</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#FF1F8E' }}>{dailyTasksCompleted}/5</p>
                  <p className="text-xs text-gray-400">Tasks Done</p>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#c084fc' }}>{dailyTotalXp}</p>
                  <p className="text-xs text-gray-400">XP Earned</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">{new Date(todaysDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {dailyTasks.map((task, index) => (
                <div 
                  key={task.id}
                  className="flex items-center gap-3 p-4 rounded-xl transition"
                  style={{ 
                    background: task.is_completed ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                    border: task.is_completed ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  <button
                    onClick={() => handleCompleteDailyTask(task.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition ${task.is_completed ? 'hover:scale-110' : 'hover:scale-105'}`}
                    style={{ background: task.is_completed ? '#22C55E' : 'rgba(255,255,255,0.1)' }}
                    disabled={task.is_completed}
                  >
                    {task.is_completed ? (
                      <Check size={18} className="text-white" />
                    ) : (
                      <span className="text-lg">{DAILY_TASKS_POOL.find(t => t.id === task.task_id)?.emoji || '✨'}</span>
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${task.is_completed ? 'text-green-400 line-through' : 'text-white'}`}>
                      {task.task_text}
                    </p>
                    <p className="text-xs" style={{ color: task.is_completed ? '#22C55E' : '#9ca3af' }}>
                      +{task.xp} XP
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold ${task.is_completed ? 'bg-green-500/20 text-green-400' : 'bg-pink-500/20 text-pink-400'}`}>
                    {task.category}
                  </div>
                </div>
              ))}
            </div>

            {dailyTasksCompleted === 5 && (
              <div className="mt-6 text-center p-4 rounded-2xl border border-yellow-500/30"
                style={{ background: 'rgba(255,215,0,0.1)' }}>
                <Trophy size={32} className="mx-auto mb-2 text-yellow-400" />
                <p className="font-bold text-white">All Daily Tasks Complete! 🎉</p>
                <p className="text-xs text-gray-400 mt-1">Come back tomorrow for new tasks!</p>
              </div>
            )}
          </>
        )}

        {/* Challenge Detail Modal */}
        {selectedChallenge && (
          <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={() => setSelectedChallenge(null)}>
            <div 
              className="w-full max-w-lg rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
              style={{ background: '#1a0a18', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `${selectedChallenge.color}30`, border: `1px solid ${selectedChallenge.color}40` }}>
                    {selectedChallenge.emoji}
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-lg">{selectedChallenge.title}</h2>
                    <p className="text-xs text-gray-400">7-Day Challenge</p>
                  </div>
                </div>
                <button onClick={() => setSelectedChallenge(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-3">
                {selectedChallenge.days.map((dayObj, index) => {
                  const progress = weeklyProgress[selectedChallenge.id];
                  const completedDays = progress?.completed_days ? JSON.parse(progress.completed_days) : [];
                  const isDayCompleted = completedDays.includes(dayObj.day);
                  const canAccess = index === 0 || completedDays.includes(dayObj.day - 1) || isDayCompleted;

                  return (
                    <div 
                      key={dayObj.day}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ 
                        background: isDayCompleted ? `${selectedChallenge.color}20` : (canAccess ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.3)'),
                        opacity: canAccess || isDayCompleted ? 1 : 0.5
                      }}
                    >
                      {isDayCompleted ? (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: selectedChallenge.color }}>
                          <Check size={16} className="text-white" />
                        </div>
                      ) : canAccess ? (
                        <button 
                          onClick={() => handleCompleteDay(selectedChallenge.id, dayObj.day, dayObj.xp)}
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 hover:scale-110 transition"
                          style={{ background: 'rgba(255,255,255,0.1)' }}
                        >
                          <span className="text-xs text-white">{dayObj.day}</span>
                        </button>
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-gray-600">{dayObj.day}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className={`text-sm ${isDayCompleted ? 'text-white/70 line-through' : 'text-white'}`}>
                          {dayObj.task}
                        </p>
                      </div>
                      <span className="text-xs font-bold" style={{ color: selectedChallenge.color }}>+{dayObj.xp} XP</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav active="glow" />
    </div>
  );
}