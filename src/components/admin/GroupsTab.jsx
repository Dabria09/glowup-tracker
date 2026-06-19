import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Copy, Users, Pencil, Trash2, Check, X } from 'lucide-react';

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function GroupsTab() {
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ group_name: '', organization: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newlyCreated, setNewlyCreated] = useState(null); // { group_name, join_code }
  const [copied, setCopied] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const g = await base44.entities.ClassGroup.list('-created_date');
      setGroups(g);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const create = async () => {
    if (!form.group_name.trim()) { setSaveError('Group name is required.'); return; }
    setSaving(true); setSaveError(''); setSaveSuccess('');
    try {
      const code = generateCode();
      await base44.entities.ClassGroup.create({ ...form, join_code: code });
      setNewlyCreated({ group_name: form.group_name, join_code: code });
      setCopied(false);
      setForm({ group_name: '', organization: '', description: '' });
      load();
    } catch (e) {
      setSaveError(e.message || 'Failed to create group. Please try again.');
    }
    setSaving(false);
  };

  const deleteGroup = async (id) => {
    if (!confirm('Delete this group? This cannot be undone.')) return;
    await base44.entities.ClassGroup.delete(id);
    load();
  };

  const startEdit = (g) => { setEditingId(g.id); setEditForm({ group_name: g.group_name, organization: g.organization || '', description: g.description || '' }); };

  const saveEdit = async () => {
    if (!editForm.group_name.trim()) return;
    await base44.entities.ClassGroup.update(editingId, editForm);
    setEditingId(null);
    load();
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm";
  const editInputCls = "w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-gray-500 outline-none text-sm";

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="font-bold text-white text-sm flex items-center gap-2">🏫 Create New Group / Class</p>
        <input value={form.group_name} onChange={e => setForm({ ...form, group_name: e.target.value })} placeholder="Group name (e.g. Lincoln Middle — Period 3)" className={inputCls} />
        <input value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} placeholder="School or organization name" className={inputCls} />
        <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" className={inputCls} />
        {saveError && <p className="text-xs text-red-400">{saveError}</p>}
        <button onClick={create} disabled={saving} className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#3b82f6,#a855f7)' }}>
          {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Plus size={16} /> Create Group &amp; Generate Code</>}
        </button>
      </div>

      {newlyCreated && (
        <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.45)' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-400 tracking-wider">✅ GROUP CREATED — SHARE THIS CODE</p>
            <button onClick={() => setNewlyCreated(null)} className="text-gray-500 hover:text-gray-300"><X size={14} /></button>
          </div>
          <p className="text-sm text-white font-semibold">{newlyCreated.group_name}</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black tracking-widest text-emerald-300" style={{ fontFamily: 'monospace' }}>{newlyCreated.join_code}</span>
            <button
              onClick={() => { navigator.clipboard.writeText(newlyCreated.join_code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition"
              style={{ background: copied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: copied ? '#34d399' : '#fff' }}>
              {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy Code</>}
            </button>
          </div>
          <p className="text-xs text-gray-400">Share this code with the teacher so students can join the group.</p>
        </div>
      )}

      {loading ? <div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div> :
        groups.length === 0 ? <p className="text-center text-sm text-gray-500 py-4">No groups yet. Create one above.</p> : (
          <div className="space-y-3">
            {groups.map(g => (
              <div key={g.id} className="p-4 rounded-2xl" style={{ background: editingId === g.id ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.05)', border: `1px solid ${editingId === g.id ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.1)'}` }}>
                {editingId === g.id ? (
                  <div className="space-y-2">
                    <input value={editForm.group_name} onChange={e => setEditForm({ ...editForm, group_name: e.target.value })} placeholder="Group name" className={editInputCls} />
                    <input value={editForm.organization} onChange={e => setEditForm({ ...editForm, organization: e.target.value })} placeholder="School or organization" className={editInputCls} />
                    <input value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description (optional)" className={editInputCls} />
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveEdit} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#3b82f6,#a855f7)' }}><Check size={12} /> Save</button>
                      <button onClick={() => setEditingId(null)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-gray-400 bg-white/5"><X size={12} /> Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm">{g.group_name}</p>
                        {g.organization && <p className="text-xs text-gray-400">{g.organization}</p>}
                        {g.description && <p className="text-xs text-gray-500 mt-1">{g.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
                          {g.join_code}
                        </span>
                        <button onClick={() => navigator.clipboard.writeText(g.join_code)} className="text-gray-400 hover:text-white"><Copy size={14} /></button>
                        <button onClick={() => startEdit(g)} className="text-blue-400 hover:text-blue-300"><Pencil size={14} /></button>
                        <button onClick={() => deleteGroup(g.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <Users size={11} /> {g.member_count || 0} members
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}