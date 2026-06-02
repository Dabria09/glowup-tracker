import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Copy, Trash2, ToggleLeft, ToggleRight, Clock, Users, Tag, Gift } from 'lucide-react';
import { toast } from 'sonner';

function generatePassCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 10; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function GlowPassAdminTab() {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '',
    label: '',
    max_uses: 2,
    valid_until: '',
    notes: '',
  });
  const [copied, setCopied] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      // Glow Passes are join codes of type 'promo'
      const all = await base44.entities.JoinCode.filter({ code_type: 'promo' });
      setPasses(all.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const create = async () => {
    if (!form.code.trim()) return;
    const user = await base44.auth.me();
    await base44.entities.JoinCode.create({
      ...form,
      code_type: 'promo',
      created_by: user.email,
      current_uses: 0,
      is_active: true,
      valid_from: new Date().toISOString().split('T')[0],
    });
    setForm({ code: '', label: '', max_uses: 2, valid_until: '', notes: '' });
    setShowForm(false);
    toast.success('Glow Pass created!');
    load();
  };

  const toggleActive = async (pass) => {
    await base44.entities.JoinCode.update(pass.id, { is_active: !pass.is_active });
    load();
  };

  const deletePass = async (id) => {
    if (!window.confirm('Delete this Glow Pass?')) return;
    await base44.entities.JoinCode.delete(id);
    load();
  };

  const copyPass = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Copied!');
  };

  const isExpired = (pass) => pass.valid_until && new Date(pass.valid_until) < new Date();
  const isAtLimit = (pass) => pass.max_uses > 0 && pass.current_uses >= pass.max_uses;

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-bold text-white flex items-center gap-2"><Gift size={16} className="text-pink-400" /> Glow Pass™ Management</p>
          <p className="text-xs text-gray-400 mt-0.5">{passes.length} passes created · {passes.filter(p => p.is_active && !isExpired(p) && !isAtLimit(p)).length} active</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
          <Plus size={14} /> New Pass
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="p-4 rounded-2xl space-y-3"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(236,72,153,0.3)' }}>
          <p className="font-bold text-white text-sm">Create Glow Pass™</p>

          <div className="flex gap-2">
            <input value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
              placeholder="Pass code (e.g. GLOWUP2026)"
              className={`${inputCls} flex-1 font-mono tracking-widest`} />
            <button onClick={() => setForm({ ...form, code: generatePassCode() })}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold text-pink-300"
              style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)' }}>
              Generate
            </button>
          </div>

          <input value={form.label}
            onChange={e => setForm({ ...form, label: e.target.value })}
            placeholder="Label (e.g. Spring 2026 Invite Batch)"
            className={inputCls} />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] text-gray-500 mb-1">Max Uses per Code</p>
              <input type="number" min={0} value={form.max_uses}
                onChange={e => setForm({ ...form, max_uses: parseInt(e.target.value) || 0 })}
                className={inputCls} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 mb-1">Expires On</p>
              <input type="date" value={form.valid_until}
                onChange={e => setForm({ ...form, valid_until: e.target.value })}
                className={inputCls} />
            </div>
          </div>

          <textarea value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes (e.g. Shared at Spring event)"
            className={inputCls} rows={2} />

          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-gray-400 bg-white/5">Cancel</button>
            <button onClick={create} disabled={!form.code.trim()}
              className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
              Create Pass
            </button>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total Passes', value: passes.length, color: '#a855f7' },
          { label: 'Active', value: passes.filter(p => p.is_active && !isExpired(p) && !isAtLimit(p)).length, color: '#4ade80' },
          { label: 'Total Used', value: passes.reduce((s, p) => s + (p.current_uses || 0), 0), color: '#ec4899' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Passes list */}
      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : passes.length === 0 ? (
        <div className="p-10 rounded-2xl text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Tag size={28} className="text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No Glow Passes yet. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {passes.map(pass => {
            const expired = isExpired(pass);
            const atLimit = isAtLimit(pass);
            const statusOk = pass.is_active && !expired && !atLimit;
            return (
              <div key={pass.id} className="p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${statusOk ? 'rgba(236,72,153,0.25)' : 'rgba(255,255,255,0.06)'}`, opacity: statusOk ? 1 : 0.65 }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => copyPass(pass.code)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-bold text-sm"
                      style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.4)', color: '#f472b6' }}>
                      {pass.code} <Copy size={11} />
                    </button>
                    {copied === pass.code && <span className="text-[10px] text-green-400 font-semibold">Copied!</span>}
                    {expired && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold">Expired</span>}
                    {atLimit && <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-semibold">Full</span>}
                    {!pass.is_active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 font-semibold">Disabled</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleActive(pass)} className="text-gray-400 hover:text-white">
                      {pass.is_active ? <ToggleRight size={20} className="text-green-400" /> : <ToggleLeft size={20} />}
                    </button>
                    <button onClick={() => deletePass(pass.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                  </div>
                </div>

                {pass.label && <p className="text-sm font-semibold text-white mb-1">{pass.label}</p>}
                {pass.notes && <p className="text-xs text-gray-500 mb-2">{pass.notes}</p>}

                <div className="flex items-center gap-4 text-[10px] text-gray-500 flex-wrap">
                  {pass.valid_until && (
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> Expires {new Date(pass.valid_until).toLocaleDateString()}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users size={10} />
                    {pass.current_uses || 0} used{pass.max_uses > 0 ? ` / ${pass.max_uses} max` : ' (unlimited)'}
                  </span>
                  {pass.max_uses > 0 && (
                    <div className="flex-1 min-w-[60px]">
                      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${Math.min(((pass.current_uses || 0) / pass.max_uses) * 100, 100)}%`,
                          background: atLimit ? '#ef4444' : '#ec4899'
                        }} />
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