import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';

const TABS = [
  { id: 'daily', label: 'Daily', emoji: '☀️' },
  { id: 'weekly', label: 'Weekly', emoji: '📅' },
  { id: 'monthly', label: 'Monthly', emoji: '📆' },
  { id: 'seasonal', label: 'Seasonal', emoji: '🌸' },
];

const PRESET_TASKS = {
  daily: [
    { room: 'Bathroom', label: 'Wipe bathroom sink & mirror' },
    { room: 'Bedroom', label: 'Make your bed' },
    { room: 'Car', label: 'Empty car trash bag if needed' },
    { room: 'General', label: 'Take out trash if full' },
    { room: 'General', label: 'Pick up clutter & put things away' },
    { room: 'General', label: 'Sweep or vacuum high-traffic areas' },
    { room: 'Kitchen', label: 'Wipe kitchen counters' },
    { room: 'Kitchen', label: 'Wash dishes / load dishwasher' },
    { room: 'Kitchen', label: 'Wipe stovetop after cooking' },
  ],
  weekly: [
    { room: 'Bathroom', label: 'Deep clean bathroom (toilet, tub, shower)' },
    { room: 'Bathroom', label: 'Wash towels & bath mats' },
    { room: 'Bedroom', label: 'Change bed sheets & pillowcases' },
    { room: 'Car', label: 'Vacuum car seats & floor mats' },
    { room: 'Car', label: 'Wipe car dashboard & steering wheel' },
    { room: 'General', label: 'Take out all trash & recycling' },
    { room: 'General', label: 'Dust furniture & shelves' },
    { room: 'General', label: 'Mop hard floors' },
    { room: 'General', label: 'Vacuum all rooms' },
    { room: 'General', label: 'Organize one drawer or shelf' },
    { room: 'General', label: 'Clean under bed' },
    { room: 'Kitchen', label: 'Clean microwave inside' },
    { room: 'Kitchen', label: 'Wipe down fridge exterior' },
  ],
  monthly: [
    { room: 'Bathroom', label: 'Wash shower curtain or clean glass doors' },
    { room: 'Bedroom', label: 'Declutter closet — donate what you don\'t wear' },
    { room: 'Car', label: 'Clean car windshield inside & out' },
    { room: 'Car', label: 'Wash car exterior (hand wash or car wash)' },
    { room: 'General', label: 'Wipe down all light switches & door handles' },
    { room: 'General', label: 'Clean under furniture (couch, bed, dresser)' },
    { room: 'General', label: 'Wash windows & mirrors throughout' },
    { room: 'General', label: 'Wipe down baseboards' },
    { room: 'General', label: 'Check & replace air filters if needed' },
    { room: 'General', label: 'Deep clean trash cans' },
    { room: 'General', label: 'Wipe walls' },
    { room: 'Kitchen', label: 'Clean inside of fridge' },
    { room: 'Kitchen', label: 'Clean oven & stovetop deep clean' },
  ],
  seasonal: [
    { room: 'Bathroom', label: 'Deep clean bathroom tiles & grout' },
    { room: 'Bedroom', label: 'Flip or rotate mattress' },
    { room: 'Bedroom', label: 'Wash all bedding including comforters & pillows' },
    { room: 'Car', label: 'Detail car interior (seats, trunk, all surfaces)' },
    { room: 'General', label: 'Declutter entire home — room by room' },
    { room: 'General', label: 'Clean garage or storage areas' },
    { room: 'General', label: 'Check smoke & carbon monoxide detectors' },
    { room: 'General', label: 'Wash all curtains, blinds, or window coverings' },
    { room: 'General', label: 'Clean outdoor spaces (porch, patio, balcony)' },
    { room: 'General', label: 'Clean drawers' },
    { room: 'Kitchen', label: 'Deep clean entire kitchen (cabinets, appliances)' },
    { room: 'Kitchen', label: 'Organize pantry & toss expired food' },
    { room: 'Kitchen', label: 'Clean behind and under all appliances' },
  ],
};

const GLOW_TIPS = {
  daily: 'Doing your daily tasks takes less than 20 minutes. Put on your favorite playlist and get it done!',
  weekly: "Pick one day as your 'reset day' — do all your weekly tasks at once and enjoy a fresh space all week.",
  monthly: 'Monthly tasks keep your home healthy long-term. Set a reminder on the 1st of each month!',
  seasonal: 'Seasonal deep cleans prevent buildup and make your space feel brand new. Reward yourself after!',
};

const ROOM_COLORS = {
  Bathroom: 'bg-blue-500/20 text-blue-300',
  Bedroom: 'bg-purple-500/20 text-purple-300',
  Car: 'bg-green-600/20 text-green-400',
  General: 'bg-gray-500/20 text-gray-300',
  Kitchen: 'bg-orange-600/20 text-orange-400',
};

export default function CleaningCalendar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');
  const [dbTasks, setDbTasks] = useState([]); // persisted tasks
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const tasks = await base44.entities.CleaningTask.filter({ user_email: u.email });
      setDbTasks(tasks);
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  // Merge preset + custom tasks for current tab
  const getTasksForTab = (tab) => {
    const presets = PRESET_TASKS[tab].map(t => ({
      ...t,
      key: `${tab}__${t.room}__${t.label}`,
      is_custom: false,
    }));
    const custom = dbTasks.filter(t => t.tab === tab && t.is_custom).map(t => ({
      id: t.id,
      room: t.room || 'General',
      label: t.label,
      key: `custom__${t.id}`,
      is_custom: true,
    }));
    return [...presets, ...custom];
  };

  const isChecked = (task) => {
    if (task.is_custom) {
      const dbT = dbTasks.find(t => t.id === task.id);
      return dbT?.is_checked || false;
    }
    return dbTasks.some(t => t.tab === activeTab && t.label === task.label && !t.is_custom && t.is_checked);
  };

  const toggleTask = async (task) => {
    if (!user) return;
    if (task.is_custom) {
      const dbT = dbTasks.find(t => t.id === task.id);
      if (!dbT) return;
      const updated = await base44.entities.CleaningTask.update(dbT.id, { is_checked: !dbT.is_checked });
      setDbTasks(prev => prev.map(t => t.id === dbT.id ? { ...t, is_checked: !t.is_checked } : t));
    } else {
      const existing = dbTasks.find(t => t.tab === activeTab && t.label === task.label && !t.is_custom);
      if (existing) {
        await base44.entities.CleaningTask.update(existing.id, { is_checked: !existing.is_checked });
        setDbTasks(prev => prev.map(t => t.id === existing.id ? { ...t, is_checked: !t.is_checked } : t));
      } else {
        const created = await base44.entities.CleaningTask.create({
          user_email: user.email,
          tab: activeTab,
          room: task.room,
          label: task.label,
          is_checked: true,
          is_custom: false,
        });
        setDbTasks(prev => [...prev, created]);
      }
    }
  };

  const addCustomTask = async () => {
    if (!newTaskLabel.trim() || !user) return;
    const created = await base44.entities.CleaningTask.create({
      user_email: user.email,
      tab: activeTab,
      room: 'General',
      label: newTaskLabel.trim(),
      is_checked: false,
      is_custom: true,
    });
    setDbTasks(prev => [...prev, created]);
    setNewTaskLabel('');
    setShowAddForm(false);
  };

  const deleteCustomTask = async (task) => {
    await base44.entities.CleaningTask.delete(task.id);
    setDbTasks(prev => prev.filter(t => t.id !== task.id));
  };

  const allTasks = getTasksForTab(activeTab);
  const checkedCount = allTasks.filter(t => isChecked(t)).length;
  const total = allTasks.length;
  const pct = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

  // Group by room
  const rooms = [...new Set(allTasks.map(t => t.room))];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a0a2e' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#1a0a2e' }}>
      <AppBackground />
      <div className="relative z-10">
        {/* Header */}
        <div className="px-4 pt-6 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => navigate('/discover')} className="text-gray-400 mr-1"><ChevronLeft size={22} /></button>
            <h1 className="text-2xl font-bold">🏠 Cleaning Calendar</h1>
          </div>
          <p className="text-gray-400 text-sm ml-8">A clean space = a clear mind ✨</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 mb-4 overflow-x-auto no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm transition ${
                activeTab === tab.id
                  ? 'bg-pink-500 text-white'
                  : 'bg-white/10 text-gray-300 border border-white/10'
              }`}
            >
              <span>{tab.emoji}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="mx-4 mb-5 glass rounded-2xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300">{checkedCount} of {total} tasks done</span>
            <span className="text-white font-bold">{pct}%</span>
          </div>
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #ec4899, #a855f7)' }}
            />
          </div>
        </div>

        {/* Task list grouped by room */}
        <div className="px-4 space-y-4">
          {rooms.map(room => {
            const roomTasks = allTasks.filter(t => t.room === room);
            const roomChecked = roomTasks.filter(t => isChecked(t)).length;
            return (
              <div key={room}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ROOM_COLORS[room] || 'bg-gray-500/20 text-gray-300'}`}>
                    {room}
                  </span>
                  <span className="text-xs text-gray-500">{roomChecked}/{roomTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {roomTasks.map(task => (
                    <div
                      key={task.key}
                      className="flex items-center gap-3 glass rounded-2xl px-4 py-3"
                    >
                      <button
                        onClick={() => toggleTask(task)}
                        className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition ${
                          isChecked(task) ? 'bg-pink-500 border-pink-500' : 'border-gray-500'
                        }`}
                      >
                        {isChecked(task) && <span className="text-white text-xs font-bold">✓</span>}
                      </button>
                      <span className={`flex-1 text-sm ${isChecked(task) ? 'line-through text-gray-500' : 'text-white'}`}>
                        {task.label}
                      </span>
                      {task.is_custom && (
                        <button onClick={() => deleteCustomTask(task)} className="text-gray-600 hover:text-red-400 transition">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add custom task */}
        <div className="mx-4 mt-5">
          {showAddForm ? (
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={newTaskLabel}
                onChange={e => setNewTaskLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomTask()}
                placeholder="Enter task name..."
                className="flex-1 bg-white/5 border border-pink-500/50 rounded-full px-4 py-2.5 text-white text-sm outline-none placeholder-gray-500"
              />
              <button onClick={addCustomTask} className="px-4 py-2 rounded-full bg-pink-500 text-white text-sm font-bold">Add</button>
              <button onClick={() => setShowAddForm(false)} className="px-3 py-2 rounded-full border border-white/20 text-gray-400 text-sm">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 border border-dashed border-pink-500/40 rounded-2xl text-pink-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-pink-500/5 transition"
            >
              <Plus size={16} /> Add custom task
            </button>
          )}
        </div>

        {/* Glow Tip */}
        <div className="mx-4 mt-5 mb-6 bg-purple-900/30 border border-purple-500/30 rounded-2xl p-4">
          <p className="text-sm text-white leading-relaxed">
            <span className="text-pink-400 font-bold">✨ Glow Tip:</span> {GLOW_TIPS[activeTab]}
          </p>
        </div>
      </div>
      <BottomNav active="discover" />
    </div>
  );
}