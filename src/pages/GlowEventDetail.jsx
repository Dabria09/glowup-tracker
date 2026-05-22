import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const BUDGET_BREAKDOWN_TEMPLATE = [
  { category: 'Venue', description: 'Venue rental', pct: 0.30 },
  { category: 'Food & Cake', description: 'Catering & birthday cake', pct: 0.25 },
  { category: 'Decorations', description: 'Decorations & balloons', pct: 0.15 },
  { category: 'Activities', description: 'Entertainment & activities', pct: 0.10 },
  { category: 'Invitations', description: 'Invitations & party favors', pct: 0.08 },
  { category: 'Photography', description: 'Photos & memories', pct: 0.07 },
  { category: 'Outfit', description: 'Birthday outfit', pct: 0.05 },
];

const TABS = ['Checklist', 'Guests', 'Budget', 'Can I Afford?'];

export default function GlowEventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [event, setEvent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [guests, setGuests] = useState([]);
  const [budgetItems, setBudgetItems] = useState([]);
  const [activeTab, setActiveTab] = useState('Checklist');
  const [loading, setLoading] = useState(true);

  // Checklist form
  const [newTask, setNewTask] = useState('');
  const [newTaskCat, setNewTaskCat] = useState('Venue');
  // Guest form
  const [newGuest, setNewGuest] = useState('');
  // Budget form
  const [newItemName, setNewItemName] = useState('');
  const [newItemCat, setNewItemCat] = useState('Venue');
  const [newItemAmt, setNewItemAmt] = useState('');

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const [ev, ts, gs, bs] = await Promise.all([
        base44.entities.GlowEvent.get(id),
        base44.entities.GlowTask.filter({ event_id: id }),
        base44.entities.GlowGuest.filter({ event_id: id }),
        base44.entities.GlowBudgetItem.filter({ event_id: id }),
      ]);
      setEvent(ev);
      setTasks(ts);
      setGuests(gs);
      setBudgetItems(bs);
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, [id]);

  const getCountdown = () => {
    if (!event?.event_date) return { days: '--', hours: '--' };
    const diff = new Date(event.event_date + 'T00:00:00') - new Date();
    if (diff < 0) return { days: 0, hours: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    const t = await base44.entities.GlowTask.create({ event_id: id, user_email: user.email, label: newTask.trim(), category: newTaskCat, is_done: false });
    setTasks(prev => [...prev, t]);
    setNewTask('');
  };

  const toggleTask = async (task) => {
    await base44.entities.GlowTask.update(task.id, { is_done: !task.is_done });
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_done: !t.is_done } : t));
  };

  const deleteTask = async (task) => {
    await base44.entities.GlowTask.delete(task.id);
    setTasks(prev => prev.filter(t => t.id !== task.id));
  };

  const addGuest = async () => {
    if (!newGuest.trim()) return;
    const g = await base44.entities.GlowGuest.create({ event_id: id, user_email: user.email, name: newGuest.trim(), is_confirmed: false });
    setGuests(prev => [...prev, g]);
    setNewGuest('');
  };

  const toggleGuest = async (guest) => {
    await base44.entities.GlowGuest.update(guest.id, { is_confirmed: !guest.is_confirmed });
    setGuests(prev => prev.map(g => g.id === guest.id ? { ...g, is_confirmed: !g.is_confirmed } : g));
  };

  const deleteGuest = async (guest) => {
    await base44.entities.GlowGuest.delete(guest.id);
    setGuests(prev => prev.filter(g => g.id !== guest.id));
  };

  const generateBudget = async () => {
    if (!event?.budget) { toast.error('Set a budget first'); return; }
    const items = BUDGET_BREAKDOWN_TEMPLATE.map(t => ({
      event_id: id,
      user_email: user.email,
      category: t.category,
      description: t.description,
      amount: Math.round(event.budget * t.pct),
    }));
    const created = await base44.entities.GlowBudgetItem.bulkCreate(items);
    setBudgetItems(prev => [...prev, ...created]);
    toast.success('Budget breakdown generated! ✨');
  };

  const addBudgetItem = async () => {
    if (!newItemName.trim() || !newItemAmt) return;
    const item = await base44.entities.GlowBudgetItem.create({ event_id: id, user_email: user.email, category: newItemCat, description: newItemName.trim(), amount: Number(newItemAmt) });
    setBudgetItems(prev => [...prev, item]);
    setNewItemName(''); setNewItemAmt('');
  };

  const deleteBudgetItem = async (item) => {
    await base44.entities.GlowBudgetItem.delete(item.id);
    setBudgetItems(prev => prev.filter(i => i.id !== item.id));
  };

  const deleteEvent = async () => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    await base44.entities.GlowEvent.delete(id);
    toast.success('Plan deleted');
    navigate('/birthday-planner');
  };

  if (loading || !event) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a0a2e' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  const { days, hours } = getCountdown();
  const doneTasks = tasks.filter(t => t.is_done).length;
  const confirmedGuests = guests.filter(g => g.is_confirmed).length;
  const totalSpend = budgetItems.reduce((s, i) => s + (i.amount || 0), 0);
  const remaining = (event.budget || 0) - totalSpend;
  const pct = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0d0d' }}>
      <AppBackground />
      <div className="relative z-10">
        {/* Hero */}
        <div className="relative pt-6 pb-8 px-4 text-center" style={{ background: 'linear-gradient(135deg, #ff1493 0%, #ff69b4 100%)' }}>
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='white'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />
          <button onClick={() => navigate('/birthday-planner')} className="absolute top-6 left-4 text-white/80 flex items-center gap-1 text-sm">
            <ChevronLeft size={18} /> All Plans
          </button>
          <div className="relative z-10">
            <p className="text-5xl mb-2">{event.event_type_emoji || '🎂'}</p>
            <h1 className="text-3xl font-bold text-white">{event.name}</h1>
            <p className="text-white/80 text-sm">{event.event_type}</p>
            {event.event_date && (
              <div className="flex justify-center gap-3 mt-3">
                <div className="bg-white/20 backdrop-blur rounded-2xl px-5 py-2 text-center">
                  <p className="text-2xl font-bold text-white">{days}</p>
                  <p className="text-xs text-white/80">Days</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-2xl px-5 py-2 text-center">
                  <p className="text-2xl font-bold text-white">{hours}</p>
                  <p className="text-xs text-white/80">Hours</p>
                </div>
              </div>
            )}
            <div className="flex justify-center gap-3 mt-3">
              <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2 text-center">
                <p className="text-sm font-bold text-white">{doneTasks}/{tasks.length}</p>
                <p className="text-xs text-white/80">Done</p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2 text-center">
                <p className="text-sm font-bold text-white">{confirmedGuests}/{guests.length}</p>
                <p className="text-xs text-white/80">Confirmed</p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-2 text-center">
                <p className="text-sm font-bold text-white">${(event.budget || 0).toLocaleString()}</p>
                <p className="text-xs text-white/80">Budget</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-black/20">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                activeTab === tab ? 'text-white border-b-2 border-pink-500' : 'text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="px-4 pt-5 pb-4">

          {/* CHECKLIST TAB */}
          {activeTab === 'Checklist' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-white">Planning Progress</p>
                <p className="text-pink-400 font-bold">{pct}%</p>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full mb-5">
                <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all" style={{ width: `${pct}%` }} />
              </div>

              <div className="space-y-2 mb-5">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <button
                      onClick={() => toggleTask(task)}
                      className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition ${task.is_done ? 'bg-pink-500 border-pink-500' : 'border-gray-500'}`}
                    >
                      {task.is_done && <span className="text-white text-xs">✓</span>}
                    </button>
                    <span className={`flex-1 text-sm ${task.is_done ? 'line-through text-gray-500' : 'text-white'}`}>{task.label}</span>
                    <button onClick={() => deleteTask(task)} className="text-gray-600 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              <p className="text-xs font-bold tracking-widest text-gray-500 mb-2">ADD TASK</p>
              <input
                type="text"
                placeholder="Task name..."
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-gray-600 mb-2"
              />
              <input
                type="text"
                placeholder="Category (e.g. Venue, Food...)"
                value={newTaskCat}
                onChange={e => setNewTaskCat(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-gray-600 mb-3"
              />
              <button onClick={addTask} className="w-full py-3 rounded-full font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #ff1493, #cc44ff)' }}>
                Add Task
              </button>

              <button onClick={deleteEvent} className="w-full py-3 rounded-full border border-red-900/40 text-red-400 text-sm font-semibold mt-8">
                Delete Plan
              </button>
            </div>
          )}

          {/* GUESTS TAB */}
          {activeTab === 'Guests' && (
            <div>
              <div className="flex gap-2 mb-5">
                <input
                  type="text"
                  placeholder="Guest name..."
                  value={newGuest}
                  onChange={e => setNewGuest(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addGuest()}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-gray-600"
                />
                <button onClick={addGuest} className="w-11 h-11 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center">
                  <Plus size={20} className="text-pink-400" />
                </button>
              </div>

              {guests.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <span className="text-5xl mb-3">🕺🕺</span>
                  <p className="text-white font-semibold">No guests yet. Add your crew!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {guests.map(g => (
                    <div key={g.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                      <button
                        onClick={() => toggleGuest(g)}
                        className={`w-5 h-5 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition ${g.is_confirmed ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}
                      >
                        {g.is_confirmed && <span className="text-white text-xs">✓</span>}
                      </button>
                      <span className="flex-1 text-sm text-white">{g.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${g.is_confirmed ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {g.is_confirmed ? 'Confirmed' : 'Pending'}
                      </span>
                      <button onClick={() => deleteGuest(g)} className="text-gray-600 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={deleteEvent} className="w-full py-3 rounded-full border border-red-900/40 text-red-400 text-sm font-semibold mt-8">
                Delete Plan
              </button>
            </div>
          )}

          {/* BUDGET TAB */}
          {activeTab === 'Budget' && (
            <div>
              {budgetItems.length === 0 && (
                <button
                  onClick={generateBudget}
                  className="w-full py-4 rounded-full font-bold text-white text-sm mb-5 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #ff1493, #cc44ff)' }}
                >
                  🪄 ✨ Generate Glow Budget Breakdown
                </button>
              )}

              {budgetItems.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Total Budget</span>
                    <span className="font-bold text-white">${(event.budget || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Estimated</span>
                    <span className={`font-bold ${totalSpend <= (event.budget || 0) ? 'text-green-400' : 'text-red-400'}`}>${totalSpend.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2 mb-5">
                {budgetItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{item.category}</p>
                      <p className="text-xs text-gray-400">{item.description}</p>
                    </div>
                    <span className="text-white font-bold text-sm">${item.amount?.toLocaleString()}</span>
                    <button onClick={() => deleteBudgetItem(item)} className="text-gray-600 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              <p className="text-xs font-bold tracking-widest text-gray-500 mb-2">ADD ITEM</p>
              <input
                type="text"
                placeholder="Item name..."
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-gray-600 mb-2"
              />
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Category"
                  value={newItemCat}
                  onChange={e => setNewItemCat(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder-gray-600"
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={newItemAmt}
                    onChange={e => setNewItemAmt(e.target.value)}
                    className="w-24 bg-white/5 border border-white/10 rounded-2xl pl-6 pr-3 py-3 text-white text-sm outline-none"
                  />
                </div>
              </div>
              <button onClick={addBudgetItem} className="w-full py-3 rounded-full font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #ff1493, #cc44ff)' }}>
                Add Item
              </button>
            </div>
          )}

          {/* CAN I AFFORD TAB */}
          {activeTab === 'Can I Afford?' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">💸 Budget Reality Check</h2>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 mb-5">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Budget</span>
                  <span className="text-white font-bold">${(event.budget || 0).toLocaleString('.00', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Estimated Cost</span>
                  <span className="text-white font-bold">${totalSpend.toLocaleString('.00', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="text-gray-300">Remaining</span>
                  <span className={`font-bold text-lg ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${Math.abs(remaining).toLocaleString('.00', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className={`rounded-2xl p-5 text-center border ${remaining >= 0 ? 'bg-green-900/30 border-green-500/30' : 'bg-red-900/30 border-red-500/30'}`}>
                <p className="text-3xl mb-2">{remaining >= 0 ? '✅' : '⚠️'}</p>
                <p className={`font-bold text-lg ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {remaining >= 0 ? "You're within budget! ✨" : "Over budget! Consider cutting some items."}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
      <BottomNav active="discover" />
    </div>
  );
}