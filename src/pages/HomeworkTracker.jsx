import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Plus, X, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const SUBJECTS = [
  { id: 'All', label: 'All', emoji: '📋', color: 'bg-pink-500' },
  { id: 'Math', label: 'Math', emoji: '➕', color: 'bg-blue-600' },
  { id: 'English', label: 'English', emoji: '📖', color: 'bg-purple-600' },
  { id: 'Science', label: 'Science', emoji: '🔬', color: 'bg-green-600' },
  { id: 'History', label: 'History', emoji: '🏛️', color: 'bg-amber-600' },
  { id: 'Art', label: 'Art', emoji: '🎨', color: 'bg-pink-600' },
  { id: 'PE', label: 'PE', emoji: '🏃', color: 'bg-orange-600' },
  { id: 'Music', label: 'Music', emoji: '🎵', color: 'bg-indigo-600' },
  { id: 'Language', label: 'Language', emoji: '🌎', color: 'bg-teal-600' },
  { id: 'Other', label: 'Other', emoji: '📝', color: 'bg-gray-600' },
];

const PRIORITIES = ['High', 'Medium', 'Low'];

const PRIORITY_STYLES = {
  High: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40' },
  Medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40' },
  Low: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/40' },
};

const SUBJECT_MAP = Object.fromEntries(SUBJECTS.map(s => [s.id, s]));

function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr + 'T00:00:00') - new Date().setHours(0,0,0,0)) / (1000*60*60*24));
  return diff;
}

function DueBadge({ dateStr }) {
  const days = getDaysUntil(dateStr);
  if (days === null) return null;
  if (days < 0) return <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">Overdue</span>;
  if (days === 0) return <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">Due Today!</span>;
  if (days === 1) return <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">Tomorrow</span>;
  return <span className="text-xs text-gray-500">📅 {dateStr}</span>;
}

export default function HomeworkTracker() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeSubject, setActiveSubject] = useState('All');
  const [showCompleted, setShowCompleted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [fTitle, setFTitle] = useState('');
  const [fSubject, setFSubject] = useState('Math');
  const [fPriority, setFPriority] = useState('Medium');
  const [fDue, setFDue] = useState('');
  const [fNotes, setFNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const data = await base44.entities.HomeworkTask.filter({ user_email: u.email });
      setTasks(data.sort((a, b) => (a.due_date || '').localeCompare(b.due_date || '')));
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const filtered = tasks.filter(t => {
    if (!showCompleted && t.is_done) return false;
    if (activeSubject !== 'All' && t.subject !== activeSubject) return false;
    return true;
  });

  const doneCount = tasks.filter(t => t.is_done).length;
  const overdueCount = tasks.filter(t => !t.is_done && getDaysUntil(t.due_date) !== null && getDaysUntil(t.due_date) < 0).length;
  const dueTodayCount = tasks.filter(t => !t.is_done && getDaysUntil(t.due_date) === 0).length;

  const handleAdd = async () => {
    if (!fTitle.trim()) return;
    setSaving(true);
    const t = await base44.entities.HomeworkTask.create({
      user_email: user.email,
      subject: fSubject,
      title: fTitle.trim(),
      due_date: fDue,
      priority: fPriority,
      notes: fNotes.trim(),
      is_done: false,
    });
    setTasks(prev => [t, ...prev].sort((a, b) => (a.due_date || '').localeCompare(b.due_date || '')));
    setFTitle(''); setFDue(''); setFNotes('');
    setShowForm(false);
    setSaving(false);
    toast.success('Assignment added! 📚');
  };

  const toggleDone = async (task) => {
    await base44.entities.HomeworkTask.update(task.id, { is_done: !task.is_done });
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_done: !t.is_done } : t));
    if (!task.is_done) toast.success('Great job! ✅');
  };

  const deleteTask = async (task) => {
    await base44.entities.HomeworkTask.delete(task.id);
    setTasks(prev => prev.filter(t => t.id !== task.id));
  };

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
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={22} /></button>
            <div>
              <h1 className="text-2xl font-bold text-white">Homework Tracker</h1>
              <p className="text-gray-500 text-xs">{doneCount}/{tasks.length} done</p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)}
            className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center shadow-lg">
            <Plus size={20} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{tasks.filter(t => !t.is_done).length}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{dueTodayCount}</p>
            <p className="text-xs text-gray-500">Due Today</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
            <p className="text-xs text-gray-500">Overdue</p>
          </div>
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div className="glass rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-white">Overall Progress</span>
              <span className="text-sm font-bold text-pink-400">{Math.round((doneCount / tasks.length) * 100)}%</span>
            </div>
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${(doneCount / tasks.length) * 100}%`, background: 'linear-gradient(90deg, #ec4899, #a855f7)' }} />
            </div>
          </div>
        )}

        {/* Subject Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none">
          {SUBJECTS.map(s => (
            <button key={s.id} onClick={() => setActiveSubject(s.id)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
                activeSubject === s.id
                  ? 'bg-pink-500 border-pink-500 text-white'
                  : 'glass border-white/10 text-gray-300'
              }`}>
              <span>{s.emoji}</span> {s.label}
            </button>
          ))}
        </div>

        {/* Tasks */}
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <p className="font-bold text-white flex items-center gap-2"><BookOpen size={16} className="text-pink-400" /> Assignments</p>
            <button onClick={() => setShowCompleted(v => !v)} className="text-xs text-gray-400 hover:text-white transition">
              {showCompleted ? 'Hide completed' : 'Show completed'}
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-10">
              <span className="text-5xl mb-3">✅</span>
              <p className="text-white font-semibold">All clear!</p>
              <p className="text-gray-500 text-sm text-center mt-1">No assignments here. Add one to stay on track.</p>
              <button onClick={() => setShowForm(true)}
                className="mt-4 flex items-center gap-1 px-5 py-2.5 rounded-full font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                <Plus size={16} /> Add Assignment
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(task => {
                const sub = SUBJECT_MAP[task.subject] || SUBJECT_MAP['Other'];
                const pri = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES['Medium'];
                return (
                  <div key={task.id} className={`flex items-start gap-3 bg-white/5 rounded-2xl px-3 py-3 border border-white/10 transition ${task.is_done ? 'opacity-50' : ''}`}>
                    <button onClick={() => toggleDone(task)}
                      className={`mt-0.5 w-6 h-6 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition ${
                        task.is_done ? 'bg-pink-500 border-pink-500' : 'border-gray-500'
                      }`}>
                      {task.is_done && <span className="text-white text-xs">✓</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${task.is_done ? 'line-through text-gray-500' : 'text-white'}`}>{task.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{sub.emoji} {task.subject}</span>
                        {task.priority && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${pri.bg} ${pri.text} ${pri.border}`}>{task.priority}</span>
                        )}
                        {task.due_date && <DueBadge dateStr={task.due_date} />}
                      </div>
                      {task.notes && <p className="text-xs text-gray-500 mt-1">{task.notes}</p>}
                    </div>
                    <button onClick={() => deleteTask(task)} className="text-gray-700 hover:text-red-400 flex-shrink-0 mt-0.5">
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="glass rounded-2xl p-4">
          <p className="font-bold text-white mb-3">📚 Study Tips</p>
          <div className="space-y-2 text-sm text-gray-300">
            <p>🎯 Tackle the hardest subject first while your brain is fresh</p>
            <p>⏱️ Use the Pomodoro method — 25 min focus, 5 min break</p>
            <p>📵 Put your phone away during study sessions</p>
            <p>🌿 Study in a clean, distraction-free space</p>
            <p>🌙 Review notes before bed to help memory retention</p>
          </div>
        </div>
      </div>

      {/* Add Assignment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg glass-strong rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <p className="text-white font-bold text-lg">📝 New Assignment</p>
              <div className="flex items-center gap-2">
                <button onClick={handleAdd} disabled={saving || !fTitle.trim()}
                  className="px-4 py-2 rounded-full font-bold text-white text-sm disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                  {saving ? 'Adding...' : '✓ Save'}
                </button>
                <button onClick={() => setShowForm(false)}><X size={22} className="text-gray-400" /></button>
              </div>
            </div>

            <input autoFocus type="text" placeholder="Assignment title" value={fTitle} onChange={e => setFTitle(e.target.value)}
              className="w-full bg-white/5 border-2 border-pink-500/60 rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-gray-500 mb-3" />

            {/* Subject */}
            <p className="text-xs text-gray-400 mb-2">Subject</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {SUBJECTS.filter(s => s.id !== 'All').map(s => (
                <button key={s.id} onClick={() => setFSubject(s.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition ${
                    fSubject === s.id ? 'bg-pink-500 border-pink-500 text-white' : 'glass border-white/10 text-gray-300'
                  }`}>
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>

            {/* Priority */}
            <p className="text-xs text-gray-400 mb-2">Priority</p>
            <div className="flex gap-2 mb-3">
              {PRIORITIES.map(p => (
                <button key={p} onClick={() => setFPriority(p)}
                  className={`flex-1 py-2 rounded-2xl text-sm font-semibold border transition ${
                    fPriority === p ? 'bg-yellow-700/40 border-yellow-500 text-yellow-300' : 'glass border-white/10 text-gray-400'
                  }`}>
                  {p}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-400 mb-1">Due Date</p>
            <input type="date" value={fDue} onChange={e => setFDue(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none mb-3" />

            <p className="text-xs text-gray-400 mb-1">Notes (optional)</p>
            <input type="text" placeholder="e.g. Chapter 5, pages 20-30" value={fNotes} onChange={e => setFNotes(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-gray-500 mb-4" />


          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}