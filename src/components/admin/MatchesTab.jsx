import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, X } from 'lucide-react';

const STATUS_FILTERS = ['All', 'Active', 'Paused', 'Completed', 'Removed'];

export default function MatchesTab() {
  const [matches, setMatches] = useState([]);
  const [filter, setFilter] = useState('Active');
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [form, setForm] = useState({ mentor_email: '', mentee_email: '', goal: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const m = await base44.entities.MentorshipProgress.list('-created_date');
      setMatches(m);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const assign = async () => {
    if (!form.mentor_email.trim() || !form.mentee_email.trim()) return;
    await base44.entities.MentorshipProgress.create({
      ...form,
      created_date: new Date().toISOString(),
      progress_percentage: 0,
    });
    setForm({ mentor_email: '', mentee_email: '', goal: '' });
    setShowAssign(false);
    load();
  };

  const filtered = filter === 'All' ? matches : matches.filter(m => {
    if (filter === 'Active') return m.progress_percentage < 100;
    if (filter === 'Completed') return m.progress_percentage >= 100;
    return true;
  });

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm";

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-white text-base">GGU Program Matches</p>
          <p className="text-xs text-gray-400 mt-0.5">Assign mentors to mentees as part of the GGU program</p>
        </div>
        <button onClick={() => setShowAssign(true)} className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold text-white flex items-center gap-1" style={{ background: '#10b981' }}>
          <Plus size={14} /> Assign Match
        </button>
      </div>

      {showAssign && (
        <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center justify-between">
            <p className="font-semibold text-white text-sm">Assign New Match</p>
            <button onClick={() => setShowAssign(false)}><X size={16} className="text-gray-400" /></button>
          </div>
          <input value={form.mentor_email} onChange={e => setForm({ ...form, mentor_email: e.target.value })} placeholder="Mentor email..." className={inputCls} />
          <input value={form.mentee_email} onChange={e => setForm({ ...form, mentee_email: e.target.value })} placeholder="Mentee email..." className={inputCls} />
          <input value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} placeholder="Program goal..." className={inputCls} />
          <button onClick={assign} className="w-full py-3 rounded-2xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
            Create Match
          </button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto">
        {STATUS_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition ${filter === f ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={filter === f ? { background: 'rgba(16,185,129,0.4)', border: '1px solid rgba(16,185,129,0.5)' } : {}}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div> :
        filtered.length === 0 ? (
          <div className="p-8 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-sm text-gray-400">No matches found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(m => (
              <div key={m.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="font-semibold text-white text-sm">{m.mentor_email?.split('@')[0]} → {m.mentee_email?.split('@')[0]}</p>
                <p className="text-xs text-gray-400 mt-0.5">{m.goal || 'No goal set'}</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-500">Progress</span>
                    <span className="text-[10px] text-gray-400">{m.progress_percentage || 0}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-teal-400" style={{ width: `${m.progress_percentage || 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}