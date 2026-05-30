import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Edit3, BarChart2 } from 'lucide-react';

const CATEGORIES = ['Confidence','Friendships','Leadership','School','Bullying','Social Media','Relationships','Self-Esteem','Decision Making','Career Exploration','Money','Mental Wellness'];

const EMPTY = { question: '', category: 'Confidence', option_a: '', option_b: '', option_c: '', option_d: '', insight_a: '', insight_b: '', insight_c: '', insight_d: '', coaching_tip: '', points_awarded: 15, scheduled_date: '', is_active: true };

export default function PollsAdminTab() {
  const [polls, setPolls] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.DailyPoll.list('-created_date', 50);
    setPolls(data);
    setLoading(false);
  };

  const save = async () => {
    setSaving(true);
    if (editId) {
      await base44.entities.DailyPoll.update(editId, form);
    } else {
      await base44.entities.DailyPoll.create({ ...form, votes_a: 0, votes_b: 0, votes_c: 0, votes_d: 0 });
    }
    setForm(EMPTY);
    setEditId(null);
    setShowForm(false);
    await load();
    setSaving(false);
  };

  const deletePoll = async (id) => {
    if (!confirm('Delete this poll?')) return;
    await base44.entities.DailyPoll.delete(id);
    setPolls(polls.filter(p => p.id !== id));
  };

  const startEdit = (poll) => {
    setForm({ ...poll });
    setEditId(poll.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  if (loading) return <div className="text-center py-8 text-gray-400">Loading polls...</div>;

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Daily Polls</h2>
        <button onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
          <Plus size={14} /> {showForm ? 'Cancel' : 'New Poll'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl p-4 mb-6 space-y-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="text-sm font-bold text-white mb-2">{editId ? 'Edit Poll' : 'Create New Poll'}</h3>

          <div>
            <p className="text-xs text-gray-400 mb-1">Category</p>
            <select value={form.category} onChange={f('category')} className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#1a0a18' }}>{c}</option>)}
            </select>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">Question *</p>
            <textarea value={form.question} onChange={f('question')} rows={3} placeholder="If someone said someone was talking about you, would you..." className="w-full text-sm text-white rounded-xl p-2.5 resize-none" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {['a','b','c','d'].map(letter => (
              <div key={letter}>
                <p className="text-xs text-gray-400 mb-1">Option {letter.toUpperCase()} *</p>
                <input value={form[`option_${letter}`]} onChange={f(`option_${letter}`)} placeholder={`Option ${letter.toUpperCase()}`} className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
              </div>
            ))}
          </div>

          <p className="text-xs font-bold text-pink-400 mt-2">Insights (shown after voting)</p>
          <div className="grid grid-cols-2 gap-3">
            {['a','b','c','d'].map(letter => (
              <div key={letter}>
                <p className="text-xs text-gray-400 mb-1">Insight {letter.toUpperCase()}</p>
                <textarea value={form[`insight_${letter}`]} onChange={f(`insight_${letter}`)} rows={2} placeholder="What this choice reveals..." className="w-full text-xs text-white rounded-xl p-2 resize-none" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">Coaching Tip (shown after voting)</p>
            <textarea value={form.coaching_tip} onChange={f('coaching_tip')} rows={2} placeholder="A brief coaching message for all voters..." className="w-full text-sm text-white rounded-xl p-2.5 resize-none" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Scheduled Date</p>
              <input type="date" value={form.scheduled_date} onChange={f('scheduled_date')} className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', colorScheme: 'dark' }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Points Awarded</p>
              <input type="number" value={form.points_awarded} onChange={f('points_awarded')} className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="poll_active" checked={form.is_active} onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))} />
            <label htmlFor="poll_active" className="text-sm text-gray-300">Active (visible to users)</label>
          </div>

          <button onClick={save} disabled={saving || !form.question || !form.option_a || !form.option_b}
            className="w-full py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: saving ? '#555' : 'linear-gradient(135deg,#ec4899,#a855f7)', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : editId ? 'Update Poll' : 'Create Poll'}
          </button>
        </div>
      )}

      {/* Poll List */}
      <div className="space-y-3">
        {polls.length === 0 && <p className="text-center text-gray-500 text-sm py-8">No polls yet. Create your first one!</p>}
        {polls.map(poll => {
          const totalVotes = (poll.votes_a || 0) + (poll.votes_b || 0) + (poll.votes_c || 0) + (poll.votes_d || 0);
          const isExpanded = expandedId === poll.id;
          return (
            <div key={poll.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${poll.is_active ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(236,72,153,0.15)', color: '#ec4899' }}>{poll.category}</span>
                    {poll.scheduled_date && <span className="text-xs text-gray-500">📅 {poll.scheduled_date}</span>}
                    {!poll.is_active && <span className="text-xs text-gray-600 font-bold">INACTIVE</span>}
                  </div>
                  <p className="text-sm text-white font-semibold">{poll.question}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <button onClick={() => setExpandedId(isExpanded ? null : poll.id)} className="flex items-center gap-1 text-xs text-gray-400">
                      <BarChart2 size={11} /> {totalVotes} votes {isExpanded ? '▲' : '▼'}
                    </button>
                    <span className="text-xs text-green-400 font-bold">+{poll.points_awarded} pts</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(poll)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <Edit3 size={13} className="text-gray-300" />
                  </button>
                  <button onClick={() => deletePoll(poll.id)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                  {[['A', poll.option_a, poll.votes_a], ['B', poll.option_b, poll.votes_b], ['C', poll.option_c, poll.votes_c], ['D', poll.option_d, poll.votes_d]].map(([ltr, txt, votes]) => {
                    if (!txt) return null;
                    const pct = totalVotes > 0 ? Math.round(((votes || 0) / totalVotes) * 100) : 0;
                    return (
                      <div key={ltr}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-300"><strong className="text-pink-400">{ltr}.</strong> {txt}</span>
                          <span className="text-gray-400 font-bold">{votes || 0} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#ec4899,#a855f7)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}