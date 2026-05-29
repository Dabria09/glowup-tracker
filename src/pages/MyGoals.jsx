import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const CATEGORIES = [
  { id: 'health', label: 'Health', emoji: '💪', color: '#FF1F8E' },
  { id: 'school', label: 'School', emoji: '🎓', color: '#a855f7' },
  { id: 'money', label: 'Money', emoji: '💰', color: '#FFD700' },
  { id: 'confidence', label: 'Confidence', emoji: '✨', color: '#3b82f6' },
  { id: 'relationships', label: 'Relationships', emoji: '💕', color: '#FF69B4' },
  { id: 'daily', label: 'Daily', emoji: '☀️', color: '#FFA500' },
  { id: 'mental', label: 'Mental', emoji: '🧠', color: '#FF6B9D' },
  { id: 'other', label: 'Other', emoji: '🎯', color: '#a855f7' },
];

const UNITS = ['times', 'days', 'weeks', 'months', 'miles', 'pounds', 'hours', 'pages', 'books'];

export default function MyGoals() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [formData, setFormData] = useState({
    goal_name: '',
    category: 'health',
    target: 1,
    unit: 'times',
    target_date: '',
    notes: '',
  });

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const userGoals = await base44.entities.SpiritualGoal.filter({ user_email: u.email }).catch(() => []);
      setGoals(userGoals);
    }).catch(() => setUser(null));
  }, []);

  const handleCreateGoal = async () => {
    if (!formData.goal_name.trim()) return;
    await base44.entities.SpiritualGoal.create({
      user_email: user.email,
      goal_name: formData.goal_name,
      category: formData.category,
      target: formData.target,
      unit: formData.unit,
      target_date: formData.target_date || null,
      notes: formData.notes,
      status: 'active',
      progress: 0,
    });
    const updated = await base44.entities.SpiritualGoal.filter({ user_email: user.email }).catch(() => []);
    setGoals(updated);
    setShowForm(false);
    setFormData({ goal_name: '', category: 'health', target: 1, unit: 'times', target_date: '', notes: '' });
  };

  const handleDeleteGoal = async (id) => {
    await base44.entities.SpiritualGoal.delete(id);
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleToggleComplete = async (goal) => {
    await base44.entities.SpiritualGoal.update(goal.id, {
      status: goal.status === 'completed' ? 'active' : 'completed',
    });
    const updated = await base44.entities.SpiritualGoal.filter({ user_email: user.email }).catch(() => []);
    setGoals(updated);
  };

  const filtered = goals.filter(g => activeTab === 'all' ? true : g.status === activeTab);
  const activeCount = goals.filter(g => g.status === 'active').length;
  const completedCount = goals.filter(g => g.status === 'completed').length;

  const getCategoryColor = (catId) => CATEGORIES.find(c => c.id === catId)?.color || '#a855f7';
  const getCategoryEmoji = (catId) => CATEGORIES.find(c => c.id === catId)?.emoji || '🎯';

  return (
    <div className="min-h-screen text-white pb-24" style={{ background: '#0d0d0d' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4 mb-6">
        <button onClick={() => navigate('/discover')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">My Goals</h1>
          <p className="text-xs text-gray-400">{activeCount} active · {completedCount} completed</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full text-white font-bold"
          style={{ background: 'linear-gradient(135deg, #FF1F8E, #a855f7)' }}
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 mb-6 pb-4 border-b border-white/10">
        {[
          { id: 'active', label: 'Active', count: activeCount },
          { id: 'completed', label: 'Completed', count: completedCount },
          { id: 'all', label: 'All', count: goals.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${
              activeTab === tab.id ? 'bg-pink-500/20 text-pink-400' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Goals List */}
      <div className="px-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-gray-400 text-sm mb-4">No {activeTab === 'all' ? 'goals' : activeTab} goals yet</p>
            {activeTab === 'active' && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 rounded-full font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #FF1F8E, #a855f7)' }}
              >
                Set Your First Goal
              </button>
            )}
          </div>
        ) : (
          filtered.map(goal => (
            <div
              key={goal.id}
              className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <button onClick={() => handleToggleComplete(goal)} className="flex-shrink-0 transition">
                {goal.status === 'completed' ? (
                  <CheckCircle2 size={24} style={{ color: getCategoryColor(goal.category) }} />
                ) : (
                  <Circle size={24} className="text-gray-500 hover:text-gray-400" />
                )}
              </button>
              <div className="flex-1">
                <p className={`font-bold ${goal.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
                  {goal.goal_name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {getCategoryEmoji(goal.category)} {goal.category} • {goal.target} {goal.unit}
                </p>
                {goal.notes && <p className="text-xs text-gray-500 mt-1">{goal.notes}</p>}
                {goal.target_date && (
                  <p className="text-xs text-gray-400 mt-1">Due: {new Date(goal.target_date).toLocaleDateString()}</p>
                )}
              </div>
              <button onClick={() => handleDeleteGoal(goal.id)} className="flex-shrink-0 text-gray-500 hover:text-red-400 transition">
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl bottom-sheet"
            style={{
              background: '#1a0a18',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-white">New Goal 🎯</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g., Read 10 books this year"
                  value={formData.goal_name}
                  onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className="p-3 rounded-xl text-center transition"
                      style={{
                        background: formData.category === cat.id ? `${cat.color}20` : 'rgba(255,255,255,0.05)',
                        border: formData.category === cat.id ? `2px solid ${cat.color}` : '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <p className="text-xl mb-1">{cat.emoji}</p>
                      <p className="text-[10px] text-gray-300">{cat.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Target</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Target Date (Optional)</label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Why this goal matters to you..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              <button
                onClick={handleCreateGoal}
                className="w-full py-3 rounded-xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #FF1F8E, #a855f7)' }}
              >
                Create Goal 🎯
              </button>

              <div className="h-16" />
            </div>
          </div>
        </div>
      )}

      <BottomNav active="glow" />
    </div>
  );
}