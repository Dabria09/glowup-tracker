import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Plus, X, Trash2, RotateCcw, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { id: 'All', label: 'All', emoji: '🗂️' },
  { id: 'School', label: 'School', emoji: '📚' },
  { id: 'Personal', label: 'Personal', emoji: '🌸' },
  { id: 'Health', label: 'Health', emoji: '💚' },
  { id: 'Goals', label: 'Goals', emoji: '🎯' },
];

const PRIORITIES = ['High', 'Medium', 'Low'];

const PRIORITY_COLORS = {
  High: 'bg-red-500/20 text-red-400 border-red-500/40',
  Medium: 'bg-yellow-700/30 text-yellow-400 border-yellow-600/40',
  Low: 'bg-green-700/20 text-green-400 border-green-600/40',
};

const TIPS = [
  { emoji: '🎯', text: "Tackle your hardest task first — it's called 'eating the frog'" },
  { emoji: '🚫', text: 'Put your phone face-down during focus sessions' },
  { emoji: '✅', text: 'Break big projects into small, specific tasks' },
  { emoji: '⏰', text: 'Use the Pomodoro timer above to stay focused' },
  { emoji: '🌙', text: "Plan tomorrow's top 3 tasks the night before" },
];

const FOCUS_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function TimeManagement() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showCompleted, setShowCompleted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCat, setTaskCat] = useState('School');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDate, setTaskDate] = useState('');
  const [taskMins, setTaskMins] = useState('30');

  // Pomodoro
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const data = await base44.entities.TimeTask.filter({ user_email: u.email });
      setTasks(data);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setRunning(false);
            const next = !isBreak;
            setIsBreak(next);
            setTimeLeft(next ? BREAK_DURATION : FOCUS_DURATION);
            toast.success(next ? '☕ Break time! 5 minutes.' : '🎯 Focus time! 25 minutes.');
            return next ? BREAK_DURATION : FOCUS_DURATION;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running, isBreak]);

  const resetTimer = () => {
    setRunning(false);
    setIsBreak(false);
    setTimeLeft(FOCUS_DURATION);
  };

  const filteredTasks = tasks.filter(t => {
    if (!showCompleted && t.is_done) return false;
    if (activeFilter !== 'All' && t.category !== activeFilter) return false;
    return true;
  });

  const doneTasks = tasks.filter(t => t.is_done).length;
  const urgentTasks = tasks.filter(t => t.is_urgent && !t.is_done).length;

  const addTask = async () => {
    if (!taskTitle.trim()) return;
    const t = await base44.entities.TimeTask.create({
      user_email: user.email,
      title: taskTitle.trim(),
      category: taskCat,
      priority: taskPriority,
      due_date: taskDate,
      est_minutes: Number(taskMins) || 30,
      is_done: false,
      is_urgent: taskPriority === 'High',
    });
    setTasks(prev => [...prev, t]);
    setTaskTitle(''); setTaskDate(''); setTaskMins('30');
    setShowForm(false);
    toast.success('Task added! ✨');
  };

  const toggleTask = async (task) => {
    await base44.entities.TimeTask.update(task.id, { is_done: !task.is_done });
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_done: !t.is_done } : t));
  };

  const deleteTask = async (task) => {
    await base44.entities.TimeTask.delete(task.id);
    setTasks(prev => prev.filter(t => t.id !== task.id));
  };

  const progress = (timeLeft / (isBreak ? BREAK_DURATION : FOCUS_DURATION));
  const circumference = 2 * Math.PI * 52;

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">

        {/* Points */}
        <div className="flex justify-end mb-2">
          <div className="glass rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1">
            <span>🏅</span><span className="text-yellow-400">15 pts</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={22} /></button>
            <div>
              <h1 className="text-2xl font-bold text-white">Time Management</h1>
              <p className="text-gray-500 text-xs">{doneTasks}/{tasks.length} tasks done</p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)}
            className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center shadow-lg">
            <Plus size={20} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Total', value: tasks.length, color: 'text-white' },
            { label: 'Done', value: doneTasks, color: 'text-green-400' },
            { label: 'Urgent', value: urgentTasks, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setActiveFilter(c.id)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
                activeFilter === c.id
                  ? 'bg-pink-500 border-pink-500 text-white'
                  : 'glass border-white/10 text-gray-300'
              }`}>
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>

        {/* Tasks Section */}
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <p className="font-bold text-white flex items-center gap-2">⚡ Tasks</p>
            <button onClick={() => setShowCompleted(v => !v)} className="text-xs text-gray-400 hover:text-white transition">
              {showCompleted ? 'Hide completed' : 'Show completed'}
            </button>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <span className="text-5xl mb-2">✅</span>
              <p className="text-white font-semibold">All caught up! Add a task to stay on track.</p>
              <button onClick={() => setShowForm(true)}
                className="mt-4 flex items-center gap-1 px-5 py-2.5 rounded-full text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #ff1493, #cc44ff)' }}>
                <Plus size={16} /> Add Task
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 bg-white/5 rounded-2xl px-3 py-3 border border-white/10">
                  <button onClick={() => toggleTask(task)}
                    className={`w-6 h-6 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition ${
                      task.is_done ? 'bg-pink-500 border-pink-500' : 'border-gray-500'
                    }`}>
                    {task.is_done && <span className="text-white text-xs">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${task.is_done ? 'line-through text-gray-500' : 'text-white'}`}>{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-400">{CATEGORIES.find(c => c.id === task.category)?.emoji} {task.category}</span>
                      {task.priority && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[task.priority] || ''}`}>{task.priority}</span>
                      )}
                      {task.est_minutes && <span className="text-xs text-gray-500">~{task.est_minutes}m</span>}
                    </div>
                  </div>
                  <button onClick={() => deleteTask(task)} className="text-gray-600 hover:text-red-400 flex-shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pomodoro Timer */}
        <div className="glass rounded-2xl p-5 mb-4">
          <div className="flex justify-between items-center mb-4">
            <p className="font-bold text-white flex items-center gap-2">⏰ Pomodoro Timer</p>
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${isBreak ? 'bg-green-500/20 text-green-400' : 'bg-pink-500/20 text-pink-400'}`}>
              {isBreak ? 'Break' : 'Focus'}
            </span>
          </div>

          {/* Circle Timer */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
                <circle cx="72" cy="72" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <circle cx="72" cy="72" r="52" fill="none"
                  stroke={isBreak ? '#22c55e' : '#ff1493'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div className="text-center">
                <p className="text-4xl font-bold text-white tracking-tight">{formatTime(timeLeft)}</p>
                <p className="text-xs text-gray-400">{isBreak ? 'break' : 'focus'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setRunning(v => !v)}
              className="flex items-center gap-2 px-7 py-2.5 rounded-full font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #ff1493, #cc44ff)' }}>
              {running ? <Pause size={16} /> : <Play size={16} />}
              {running ? 'Pause' : 'Start'}
            </button>
            <button onClick={resetTimer} className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white">
              <RotateCcw size={18} />
            </button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-3">Focus for 25 minutes, then take a 5-minute break</p>
        </div>

        {/* Tips */}
        <div className="glass rounded-2xl p-4 mb-4">
          <p className="font-bold text-white mb-3">⚡ Time Management Tips</p>
          <div className="space-y-2">
            {TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-lg">{tip.emoji}</span>
                <p className="text-sm text-gray-300">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg glass-strong rounded-t-3xl p-6 pb-40" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <p className="text-white font-bold text-lg flex items-center gap-2"><Plus size={18} className="text-pink-400" /> New Task</p>
              <button onClick={() => setShowForm(false)}><X size={22} className="text-gray-400" /></button>
            </div>

            <input
              autoFocus
              type="text"
              placeholder="What do you need to do?"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              className="w-full bg-white/5 border-2 border-pink-500/60 rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-gray-500 mb-3"
            />

            {/* Category */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {CATEGORIES.filter(c => c.id !== 'All').map(c => (
                <button key={c.id} onClick={() => setTaskCat(c.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition ${
                    taskCat === c.id ? 'bg-pink-500 border-pink-500 text-white' : 'glass border-white/10 text-gray-300'
                  }`}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>

            {/* Priority */}
            <div className="flex gap-2 mb-3">
              {PRIORITIES.map(p => (
                <button key={p} onClick={() => setTaskPriority(p)}
                  className={`flex-1 py-2 rounded-2xl text-sm font-semibold border transition ${
                    taskPriority === p ? 'bg-yellow-700/40 border-yellow-500 text-yellow-300' : 'glass border-white/10 text-gray-400'
                  }`}>
                  {p}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-500 mb-1">Due Date</p>
            <input type="date" value={taskDate} onChange={e => setTaskDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none mb-3"
            />

            <p className="text-xs text-gray-500 mb-1">Est. Minutes</p>
            <input type="number" placeholder="30" value={taskMins} onChange={e => setTaskMins(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none mb-4"
            />

            <button onClick={addTask} className="w-full py-3 rounded-full font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #ff1493, #cc44ff)' }}>
              ✓ Add Task
            </button>
          </div>
        </div>
      )}

      <BottomNav active="home" />
    </div>
  );
}