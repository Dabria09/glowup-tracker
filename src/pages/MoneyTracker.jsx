import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Plus, X, Target, ChevronRight } from 'lucide-react';

const TIPS = [
  '"Automate your savings so you can\'t forget — or be tempted. Set it and stack it."',
  '"Pay yourself first. Before bills, before fun — savings comes first."',
  '"The 50/30/20 rule: 50% needs, 30% wants, 20% savings."',
  '"Even $5/week = $260/year. Start small!"',
];

const INCOME_CATS = ['Job / Work', 'Side Hustle', 'Gift', 'Allowance', 'Freelance', 'Other'];
const EXPENSE_CATS = ['Food', 'Shopping', 'Transport', 'Entertainment', 'Beauty', 'Bills', 'Other'];
const SAVINGS_CATS = ['Emergency Fund', 'Goal Savings', 'Investment', 'Other'];

const NEEDS_WANTS = [
  { emoji: '🏠', label: 'Needs', color: '#4ade80', desc: 'Things you must have to survive and function', bg: 'rgba(20,60,30,0.8)', border: 'rgba(74,222,128,0.3)' },
  { emoji: '✨', label: 'Wants', color: '#f472b6', desc: "Things that make life enjoyable but aren't essential", bg: 'rgba(60,10,40,0.8)', border: 'rgba(244,114,182,0.3)' },
  { emoji: '📈', label: 'Investments', color: '#60a5fa', desc: 'Things that grow your money or future value', bg: 'rgba(10,30,70,0.8)', border: 'rgba(96,165,250,0.3)' },
  { emoji: '💜', label: 'Giving', color: '#a78bfa', desc: 'Sharing your blessings builds character and community', bg: 'rgba(40,15,70,0.8)', border: 'rgba(167,139,250,0.3)' },
];

const NEEDS_EXAMPLES = {
  Needs: ['Rent / mortgage', 'Groceries & food', 'Utilities (electric, water)', 'Transportation to work', 'Health insurance', 'Basic clothing'],
  Wants: ['Netflix / streaming', 'Eating out at restaurants', 'Designer clothes', 'Video games', 'Vacations', 'New phone upgrade'],
  Investments: ['Stocks & ETFs', '401k / Roth IRA', 'Starting a business', 'Education / courses', 'Real estate', 'High-yield savings'],
  Giving: ['Church / tithe', 'Charity donations', 'Helping family', 'Community fundraisers', 'Buying for others'],
};

export default function MoneyTracker() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedNW, setExpandedNW] = useState(null);
  const [form, setForm] = useState({ type: 'income', category: '', description: '', amount: '' });
  const tipIdx = new Date().getDay() % TIPS.length;

  useEffect(() => {
    // Track page view
    base44.analytics.track({ eventName: 'page_view', properties: { page: 'Money Tracker', path: '/money-tracker' } });
    
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.MoneyEntry.filter({ user_email: u.email }, '-created_date').then(setEntries);
    }).catch(() => {});
  }, []);

  const totals = entries.reduce((acc, e) => {
    if (e.type === 'income') acc.income += e.amount;
    else if (e.type === 'expense') acc.expense += e.amount;
    else if (e.type === 'savings') acc.savings += e.amount;
    return acc;
  }, { income: 0, expense: 0, savings: 0 });
  const balance = totals.income - totals.expense - totals.savings;

  const cats = form.type === 'income' ? INCOME_CATS : form.type === 'expense' ? EXPENSE_CATS : SAVINGS_CATS;

  async function handleAdd() {
    if (!form.amount || !user) return;
    const entry = await base44.entities.MoneyEntry.create({
      user_email: user.email,
      type: form.type,
      category: form.category || cats[0],
      description: form.description,
      amount: parseFloat(form.amount),
      entry_date: new Date().toISOString().split('T')[0],
    });
    setEntries(prev => [entry, ...prev]);
    setForm({ type: 'income', category: '', description: '', amount: '' });
    setShowForm(false);
  }

  async function handleDelete(id) {
    await base44.entities.MoneyEntry.delete(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  const fmt = (n) => '$' + n.toFixed(2);

  return (
    <div className="min-h-screen text-white relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />
      <div className="relative z-10 pb-24">
        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={20} /></button>
              <h1 className="text-2xl font-bold text-white">Money Moves 💰</h1>
            </div>
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs font-bold">
              <span>🏅</span><span className="text-yellow-400">15 pts</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 pl-8">Track your income, savings, and spending</p>
        </div>

        <div className="px-4 space-y-4">
          {/* Tip of the week */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(30,20,50,0.85)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span>✨</span>
              <span className="text-xs font-bold tracking-widest text-yellow-400">GLOW TIP OF THE WEEK</span>
            </div>
            <p className="text-sm text-gray-200 italic">{TIPS[tipIdx]}</p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Income', val: totals.income, color: '#4ade80', bg: 'rgba(10,40,20,0.85)' },
              { label: 'Total Savings', val: totals.savings, color: '#fbbf24', bg: 'rgba(40,30,5,0.85)' },
              { label: 'Total Expenses', val: totals.expense, color: '#f87171', bg: 'rgba(50,10,10,0.85)' },
              { label: 'Net Balance', val: balance, color: balance >= 0 ? '#4ade80' : '#f87171', bg: 'rgba(10,35,30,0.85)' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-4" style={{ background: s.bg, border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: s.color }}>{s.label}</p>
                <p className="text-2xl font-bold text-white">{fmt(s.val)}</p>
              </div>
            ))}
          </div>

          {/* Add Entry Button */}
          <button onClick={() => setShowForm(true)} className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
            <Plus size={18} /> Add Entry
          </button>

          {/* Entries */}
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">ALL ENTRIES ({entries.length})</p>
            {entries.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-3">💰</div>
                <p className="text-gray-400 text-sm">No entries yet. Start tracking your money moves!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map(e => (
                  <div key={e.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{e.description || e.category}</p>
                      <p className="text-xs text-gray-500">{e.category} • {e.entry_date}</p>
                    </div>
                    <p className="text-sm font-bold" style={{ color: e.type === 'income' ? '#4ade80' : e.type === 'savings' ? '#fbbf24' : '#f87171' }}>
                      {e.type === 'income' ? '+' : '-'}{fmt(e.amount)}
                    </p>
                    <button onClick={() => handleDelete(e.id)} className="text-gray-600 hover:text-gray-400 ml-1"><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Savings Goal Tracker Banner */}
          <button onClick={() => navigate('/savings-goals')} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left"
            style={{ background: 'rgba(30,20,50,0.85)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(251,191,36,0.2)', border: '2px solid #fbbf24' }}>
              <Target size={20} className="text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-sm">Savings Goal Tracker 💰</p>
              <p className="text-xs text-gray-400">Set goals, track progress, and stack your coins!</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>

          {/* Needs vs Wants 101 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📊</span>
                <p className="font-bold text-white text-base">Needs vs Wants 101</p>
              </div>
              <span className="text-xs text-gray-500">Financial Education</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-2">
              {NEEDS_WANTS.map((nw, i) => (
                <button key={i} onClick={() => setExpandedNW(expandedNW === nw.label ? null : nw.label)}
                  className="rounded-2xl p-4 text-left transition"
                  style={{ background: nw.bg, border: `1px solid ${nw.border}` }}>
                  <div className="text-2xl mb-2">{nw.emoji}</div>
                  <p className="font-bold text-sm mb-1" style={{ color: nw.color }}>{nw.label}</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{nw.desc}</p>
                </button>
              ))}
            </div>
            {expandedNW && (
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-xs font-bold text-gray-300 mb-2">Examples of {expandedNW}:</p>
                <div className="space-y-1">
                  {NEEDS_EXAMPLES[expandedNW]?.map((ex, i) => (
                    <p key={i} className="text-xs text-gray-400">• {ex}</p>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-center text-gray-600 mt-2">Tap a category to see examples</p>
          </div>

          {/* Building Together */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(20,10,40,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span>👥</span>
                <p className="font-bold text-pink-400 text-sm">Building Together</p>
              </div>
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">Coming Soon</span>
            </div>
            <p className="text-xs text-gray-300 mb-3">Future module: shared budgeting, saving as a couple, planning for kids, healthy financial communication, and avoiding financial dependency.</p>
            <div className="flex flex-wrap gap-2">
              {['Shared Bills', 'Couple Budgeting', 'Saving for Kids', 'Emergency Funds', 'Financial Communication'].map((t, i) => (
                <span key={i} className="text-xs text-gray-400 border border-white/10 rounded-full px-2 py-0.5">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Entry Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100]" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowForm(false)}>
          <div className="fixed bottom-0 left-0 right-0 flex flex-col max-h-[75vh] mb-20" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-white text-lg">Add Entry</p>
                <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
              </div>
              {/* Type selector */}
              <div className="grid grid-cols-3 gap-2">
                {[{ v: 'income', label: '💚 Income' }, { v: 'expense', label: '🔴 Expense' }, { v: 'savings', label: '💛 Savings' }].map(t => (
                  <button key={t.v} onClick={() => setForm(f => ({ ...f, type: t.v, category: '' }))}
                    className="py-2 rounded-xl text-sm font-semibold transition"
                    style={form.type === t.v
                      ? { background: 'rgba(168,85,247,0.4)', border: '1px solid rgba(168,85,247,0.7)', color: '#fff' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
                    {t.label}
                  </button>
                ))}
              </div>
              {/* Category */}
              <div className="flex flex-wrap gap-2">
                {cats.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition"
                    style={form.category === c
                      ? { background: 'rgba(236,72,153,0.4)', border: '1px solid rgba(236,72,153,0.6)', color: '#fff' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
                    {c}
                  </button>
                ))}
              </div>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Description (optional)"
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="Amount ($)"
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div className="border-t border-white/10 p-6 flex-shrink-0">
              <button onClick={handleAdd} disabled={!form.amount}
                className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                Add Entry 💰
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}