import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Plus, X, Trash2 } from 'lucide-react';

const TEMPLATES = [
  { name: 'New Laptop', emoji: '💻', target: 800, weekly: 25 },
  { name: 'First Car', emoji: '🚗', target: 5000, weekly: 100 },
  { name: 'Business Launch', emoji: '🚀', target: 2500, weekly: 50 },
  { name: 'College Fund', emoji: '🎓', target: 10000, weekly: 150 },
  { name: 'Emergency Fund', emoji: '🛡️', target: 1000, weekly: 30 },
  { name: 'Vacation', emoji: '✈️', target: 1500, weekly: 40 },
  { name: 'Apartment Deposit', emoji: '🏠', target: 3000, weekly: 75 },
  { name: 'New Phone', emoji: '📱', target: 600, weekly: 20 },
];

const EMOJIS = ['🎯', '💰', '👟', '💻', '✈️', '🎓', '📌', '🏠', '🚗', '📱', '👜', '💎', '⭐', '🎵', '📚', '🏆'];

const TIPS = [
  'Save before you spend — pay yourself first',
  'The 50/30/20 rule: 50% needs, 30% wants, 20% savings',
  'Even $5/week = $260/year. Start small!',
  'Open a high-yield savings account for better interest',
  'Automate your savings so you can\'t forget',
];

function weeksToComplete(target, saved, weekly) {
  if (!weekly || weekly <= 0) return null;
  const remaining = target - (saved || 0);
  if (remaining <= 0) return 0;
  const weeks = Math.ceil(remaining / weekly);
  const date = new Date();
  date.setDate(date.getDate() + weeks * 7);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function SavingsGoals() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [form, setForm] = useState({ name: '', emoji: '🎯', target: '', saved: '', weekly: '' });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.SavingsGoal.filter({ user_email: u.email }).then(setGoals);
    }).catch(() => {});
  }, []);

  function applyTemplate(t) {
    setSelectedTemplate(t.name);
    setForm({ name: t.name, emoji: t.emoji, target: String(t.target), saved: '', weekly: String(t.weekly) });
  }

  async function handleCreate() {
    if (!form.name || !form.target || !user) return;
    const goal = await base44.entities.SavingsGoal.create({
      user_email: user.email,
      name: form.name,
      emoji: form.emoji,
      target_amount: parseFloat(form.target),
      saved_amount: parseFloat(form.saved || 0),
      weekly_commitment: parseFloat(form.weekly || 0),
    });
    setGoals(prev => [...prev, goal]);
    setForm({ name: '', emoji: '🎯', target: '', saved: '', weekly: '' });
    setSelectedTemplate(null);
    setShowForm(false);
  }

  async function handleDelete(id) {
    await base44.entities.SavingsGoal.delete(id);
    setGoals(prev => prev.filter(g => g.id !== id));
  }

  async function addToSaved(goal, amount) {
    const newSaved = (goal.saved_amount || 0) + amount;
    const updated = await base44.entities.SavingsGoal.update(goal.id, { saved_amount: newSaved });
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, saved_amount: newSaved } : g));
  }

  const completion = weeksToComplete(parseFloat(form.target || 0), parseFloat(form.saved || 0), parseFloat(form.weekly || 0));

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />
      <div className="relative z-10">
        {/* Header */}
        <div className="px-4 pt-4 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={20} /></button>
            <div>
              <h1 className="text-2xl font-bold text-white">Savings Goals 💰</h1>
              <p className="text-xs text-gray-400">Stack your coins, girl 💰</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs font-bold">
              <span>🏅</span><span className="text-yellow-400">15 pts</span>
            </div>
            <button onClick={() => setShowForm(true)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(236,72,153,0.3)', border: '1px solid rgba(236,72,153,0.5)' }}>
              <Plus size={18} className="text-pink-400" />
            </button>
          </div>
        </div>

        <div className="px-4 space-y-5">
          {/* Goals list */}
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">💲</div>
              <p className="text-white font-bold mb-1">No savings goals yet</p>
              <p className="text-gray-500 text-sm mb-4">Every dreamer needs a money plan 💰</p>
              <button onClick={() => setShowForm(true)} className="flex items-center gap-2 mx-auto px-6 py-3 rounded-full text-sm font-semibold text-white"
                style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
                <Plus size={16} /> Create Your First Goal
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map(g => {
                const pct = Math.min(100, Math.round(((g.saved_amount || 0) / g.target_amount) * 100));
                const done = pct >= 100;
                return (
                  <div key={g.id} className="rounded-2xl p-4" style={{ background: 'rgba(25,15,45,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{g.emoji}</span>
                        <div>
                          <p className="font-bold text-white text-sm">{g.name}</p>
                          <p className="text-xs text-gray-400">${(g.saved_amount || 0).toLocaleString()} / ${g.target_amount.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: done ? '#4ade80' : '#fbbf24' }}>{pct}%</span>
                        <button onClick={() => handleDelete(g.id)} className="text-gray-600 hover:text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="w-full rounded-full h-2 mb-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-2 rounded-full transition-all" style={{ width: pct + '%', background: done ? '#4ade80' : 'linear-gradient(90deg, #ec4899, #a855f7)' }} />
                    </div>
                    {!done && (
                      <div className="flex gap-2 mb-2">
                        {[10, 25, 50].map(amt => (
                          <button key={amt} onClick={() => addToSaved(g, amt)}
                            className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-white"
                            style={{ background: 'rgba(168,85,247,0.25)', border: '1px solid rgba(168,85,247,0.4)' }}>
                            +${amt}
                          </button>
                        ))}
                      </div>
                    )}
                    {!done && g.weekly_commitment > 0 && (
                      <p className="text-xs text-gray-500">${g.weekly_commitment}/wk · Est. {weeksToComplete(g.target_amount, g.saved_amount, g.weekly_commitment)}</p>
                    )}
                    {done && <p className="text-xs text-green-400 font-bold">🎉 Goal reached!</p>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick-start templates */}
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">QUICK-START TEMPLATES</p>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((t, i) => (
                <button key={i} onClick={() => { applyTemplate(t); setShowForm(true); }}
                  className="rounded-2xl p-4 text-left"
                  style={{ background: 'rgba(20,12,40,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="text-2xl mb-2">{t.emoji}</div>
                  <p className="font-bold text-white text-sm mb-1">{t.name}</p>
                  <p className="text-xs font-semibold" style={{ color: i % 3 === 0 ? '#60a5fa' : i % 3 === 1 ? '#4ade80' : '#fbbf24' }}>${t.target.toLocaleString()} goal</p>
                  <p className="text-xs text-gray-500">${t.weekly}/wk</p>
                </button>
              ))}
            </div>
          </div>

          {/* GGU Money Tips */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(20,10,40,0.9)', border: '1px solid rgba(168,85,247,0.25)' }}>
            <p className="font-bold text-purple-300 mb-3">✨ GGU Money Tips 💜</p>
            {TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 mb-2">
                <span className="text-yellow-400 text-xs mt-0.5">💡</span>
                <p className="text-xs text-gray-300">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Goal Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => { setShowForm(false); setSelectedTemplate(null); }}>
          <div className="w-full rounded-t-3xl flex flex-col max-h-[85vh]" style={{ background: '#1a0a35' }} onClick={e => e.stopPropagation()}>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-white text-lg">🎯 New Savings Goal</p>
                <button onClick={() => { setShowForm(false); setSelectedTemplate(null); }}><X size={20} className="text-gray-400" /></button>
              </div>

              {/* Templates */}
              <div>
                <p className="text-xs font-bold text-gray-400 mb-2">QUICK TEMPLATES</p>
                <div className="grid grid-cols-4 gap-2">
                  {TEMPLATES.map((t, i) => (
                    <button key={i} onClick={() => applyTemplate(t)}
                      className="rounded-xl p-2 text-center text-xs font-medium transition"
                      style={selectedTemplate === t.name
                        ? { background: 'rgba(168,85,247,0.4)', border: '1px solid rgba(168,85,247,0.7)', color: '#fff' }
                        : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}>
                      <div className="text-xl mb-0.5">{t.emoji}</div>
                      <div className="leading-tight">{t.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Emoji picker */}
              <div>
                <p className="text-xs font-bold text-gray-400 mb-2">Pick an emoji</p>
                <div className="grid grid-cols-8 gap-2">
                  {EMOJIS.map((e, i) => (
                    <button key={i} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                      className="w-9 h-9 rounded-xl text-xl flex items-center justify-center transition"
                      style={form.emoji === e
                        ? { background: 'rgba(168,85,247,0.4)', border: '2px solid rgba(168,85,247,0.8)' }
                        : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Goal name"
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Target Amount ($)</p>
                  <input type="number" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Already Saved ($)</p>
                  <input type="number" value={form.saved} onChange={e => setForm(f => ({ ...f, saved: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Weekly Commitment ($) — for completion estimate</p>
                <input type="number" value={form.weekly} onChange={e => setForm(f => ({ ...f, weekly: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                {completion !== null && form.weekly && (
                  <p className="text-xs text-purple-300 mt-1">Est. completion: {completion}</p>
                )}
              </div>
            </div>

            <div className="border-t border-white/10 p-5 flex-shrink-0">
              <button onClick={handleCreate} disabled={!form.name || !form.target}
                className="w-full py-4 rounded-xl font-bold text-white disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                Create Goal 💰
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}