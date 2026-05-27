import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Copy, Trash2, ToggleLeft, ToggleRight, Clock, Users, Tag } from 'lucide-react';

const CODE_TYPES = ['general', 'group', 'event', 'challenge', 'promo'];
const TYPE_COLORS = {
  general: '#a855f7',
  group: '#3b82f6',
  event: '#ec4899',
  challenge: '#f59e0b',
  promo: '#10b981',
};

function generateCode(prefix = '') {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return prefix ? `${prefix.toUpperCase()}-${rand}` : rand;
}

export default function CodesTab() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [form, setForm] = useState({
    code: '',
    label: '',
    code_type: 'general',
    group_name: '',
    max_uses: 0,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
    notes: '',
  });
  const [copied, setCopied] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const c = await base44.entities.JoinCode.list('-created_date');
      setCodes(c);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const create = async () => {
    if (!form.code.trim()) return;
    const user = await base44.auth.me();
    await base44.entities.JoinCode.create({ ...form, created_by: user.email, current_uses: 0, is_active: true });
    setForm({ code: '', label: '', code_type: 'general', group_name: '', max_uses: 0, valid_from: new Date().toISOString().split('T')[0], valid_until: '', notes: '' });
    setShowForm(false);
    load();
  };

  const toggleActive = async (code) => {
    await base44.entities.JoinCode.update(code.id, { is_active: !code.is_active });
    load();
  };

  const deleteCode = async (id) => {
    if (!window.confirm('Delete this code?')) return;
    await base44.entities.JoinCode.delete(id);
    load();
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const isExpired = (code) => code.valid_until && new Date(code.valid_until) < new Date();
  const isAtLimit = (code) => code.max_uses > 0 && code.current_uses >= code.max_uses;

  const filtered = filterType === 'all' ? codes : codes.filter(c => c.code_type === filterType);

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm";
  const selectCls = "w-full bg-gray-900 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none text-sm";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-bold text-white">Join Codes</p>
          <p className="text-xs text-gray-400 mt-0.5">{codes.length} codes created · {codes.filter(c => c.is_active && !isExpired(c)).length} active</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
          <Plus size={14} /> New Code
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(168,85,247,0.3)' }}>
          <p className="font-bold text-white text-sm">Create New Code</p>

          {/* Code field with generator */}
          <div className="flex gap-2">
            <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Code (e.g. GLOW2026)" className={`${inputCls} flex-1`} />
            <button onClick={() => setForm({ ...form, code: generateCode(form.label.split(' ')[0]) })} className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold text-purple-300" style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}>
              Generate
            </button>
          </div>

          <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Label / purpose (e.g. Spring Camp 2026)" className={inputCls} />

          <select value={form.code_type} onChange={e => setForm({ ...form, code_type: e.target.value })} className={selectCls}>
            {CODE_TYPES.map(t => <option key={t} value={t} className="bg-gray-900 capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>

          {form.code_type === 'group' && (
            <input value={form.group_name} onChange={e => setForm({ ...form, group_name: e.target.value })} placeholder="Group/Class name" className={inputCls} />
          )}

          {/* Timeframe */}
          <div>
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><Clock size={11} /> Timeframe</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Valid From</p>
                <input type="date" value={form.valid_from} onChange={e => setForm({ ...form, valid_from: e.target.value })} className={inputCls} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Expires On</p>
                <input type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Usage limit */}
          <div>
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><Users size={11} /> Max Uses (0 = unlimited)</p>
            <input type="number" min={0} value={form.max_uses} onChange={e => setForm({ ...form, max_uses: parseInt(e.target.value) || 0 })} className={inputCls} />
          </div>

          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" className={inputCls} rows={2} />

          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-gray-400 bg-white/5">Cancel</button>
            <button onClick={create} className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
              Create Code
            </button>
          </div>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', ...CODE_TYPES].map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition ${filterType === t ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={filterType === t ? { background: TYPE_COLORS[t] || 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}>
            {t === 'all' ? 'All' : t}
          </button>
        ))}
      </div>

      {/* Codes list */}
      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="p-10 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Tag size={28} className="text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No codes yet. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(code => {
            const expired = isExpired(code);
            const atLimit = isAtLimit(code);
            const statusOk = code.is_active && !expired && !atLimit;
            return (
              <div key={code.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${statusOk ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`, opacity: statusOk ? 1 : 0.65 }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Code badge */}
                    <button onClick={() => copyCode(code.code)} className="flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-bold text-sm" style={{ background: (TYPE_COLORS[code.code_type] || '#a855f7') + '20', border: `1px solid ${(TYPE_COLORS[code.code_type] || '#a855f7')}50`, color: TYPE_COLORS[code.code_type] || '#a855f7' }}>
                      {code.code}
                      <Copy size={11} />
                    </button>
                    {copied === code.code && <span className="text-[10px] text-green-400 font-semibold">Copied!</span>}
                    <span className="text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold" style={{ background: (TYPE_COLORS[code.code_type] || '#a855f7') + '15', color: TYPE_COLORS[code.code_type] || '#a855f7' }}>{code.code_type}</span>
                    {expired && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold">Expired</span>}
                    {atLimit && <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-semibold">Full</span>}
                    {!code.is_active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 font-semibold">Disabled</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleActive(code)} className="text-gray-400 hover:text-white transition">
                      {code.is_active ? <ToggleRight size={20} className="text-green-400" /> : <ToggleLeft size={20} />}
                    </button>
                    <button onClick={() => deleteCode(code.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                  </div>
                </div>

                {code.label && <p className="text-sm font-semibold text-white mb-1">{code.label}</p>}
                {code.group_name && <p className="text-xs text-blue-400 mb-1">📚 {code.group_name}</p>}
                {code.notes && <p className="text-xs text-gray-500 mb-2">{code.notes}</p>}

                {/* Stats row */}
                <div className="flex items-center gap-4 text-[10px] text-gray-500 flex-wrap">
                  {(code.valid_from || code.valid_until) && (
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {code.valid_from && new Date(code.valid_from).toLocaleDateString()}
                      {code.valid_from && code.valid_until && ' → '}
                      {code.valid_until && new Date(code.valid_until).toLocaleDateString()}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users size={10} />
                    {code.current_uses || 0} used{code.max_uses > 0 ? ` / ${code.max_uses} max` : ' (unlimited)'}
                  </span>
                  {code.max_uses > 0 && (
                    <div className="flex-1 min-w-[60px]">
                      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(((code.current_uses || 0) / code.max_uses) * 100, 100)}%`, background: atLimit ? '#ef4444' : '#10b981' }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}