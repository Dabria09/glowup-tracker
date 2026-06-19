import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Copy, Users, Pencil, Trash2, Check, X, ChevronDown, ChevronUp, Archive, ArchiveRestore } from 'lucide-react';

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
  const [newlyCreated, setNewlyCreated] = useState(null); // single: { group_name, join_code } | bulk: [...]
  const [copied, setCopied] = useState({});
  const [mode, setMode] = useState('single'); // 'single' | 'bulk'
  const [bulkText, setBulkText] = useState('');
  const [bulkOrg, setBulkOrg] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [members, setMembers] = useState({});
  const [membersLoading, setMembersLoading] = useState({});
  const [showArchived, setShowArchived] = useState(false);

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
    setSaving(true); setSaveError('');
    try {
      const code = generateCode();
      await base44.entities.ClassGroup.create({ ...form, join_code: code });
      setNewlyCreated({ group_name: form.group_name, join_code: code });
      setCopied({});
      setForm({ group_name: '', organization: '', description: '' });
      load();
    } catch (e) {
      setSaveError(e.message || 'Failed to create group. Please try again.');
    }
    setSaving(false);
  };

  const createBulk = async () => {
    const names = bulkText.split('\n').map(n => n.trim()).filter(Boolean);
    if (!names.length) { setSaveError('Enter at least one group name.'); return; }
    setSaving(true); setSaveError('');
    try {
      const records = names.map(name => ({ group_name: name, organization: bulkOrg.trim(), join_code: generateCode() }));
      await base44.entities.ClassGroup.bulkCreate(records);
      setNewlyCreated(records); // array signals bulk result
      setCopied({});
      setBulkText('');
      load();
    } catch (e) {
      setSaveError(e.message || 'Bulk creation failed. Please try again.');
    }
    setSaving(false);
  };

  const copyAll = () => {
    const lines = newlyCreated.map(r => `${r.group_name}: ${r.join_code}`).join('\n');
    navigator.clipboard.writeText(lines);
    const all = {};
    newlyCreated.forEach((_, i) => all[i] = true);
    setCopied(all);
    setTimeout(() => setCopied({}), 2000);
  };

  const archiveGroup = async (id) => {
    await base44.entities.ClassGroup.update(id, { is_active: false });
    load();
  };

  const restoreGroup = async (id) => {
    await base44.entities.ClassGroup.update(id, { is_active: true });
    load();
  };

  const deleteGroup = async (id) => {
    if (!confirm('Permanently delete this group? All data will be lost and cannot be recovered.')) return;
    await base44.entities.ClassGroup.delete(id);
    load();
  };

  const toggleMembers = async (groupId) => {
    if (expandedId === groupId) { setExpandedId(null); return; }
    setExpandedId(groupId);
    if (members[groupId]) return; // already loaded
    setMembersLoading(prev => ({ ...prev, [groupId]: true }));
    try {
      const result = await base44.entities.GroupMember.filter({ group_id: groupId }, '-joined_date');
      setMembers(prev => ({ ...prev, [groupId]: result }));
    } catch (e) { console.error(e); }
    setMembersLoading(prev => ({ ...prev, [groupId]: false }));
  };

  const removeMember = async (groupId, memberId) => {
    await base44.entities.GroupMember.delete(memberId);
    setMembers(prev => ({ ...prev, [groupId]: prev[groupId].filter(m => m.id !== memberId) }));
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
        <div className="flex items-center justify-between">
          <p className="font-bold text-white text-sm">🏫 Create Group / Class</p>
          <div className="flex gap-1 p-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            {['single', 'bulk'].map(m => (
              <button key={m} onClick={() => { setMode(m); setSaveError(''); }} className="px-3 py-1 rounded-full text-xs font-semibold transition" style={mode === m ? { background: 'linear-gradient(135deg,#3b82f6,#a855f7)', color: '#fff' } : { color: '#9ca3af' }}>
                {m === 'single' ? 'Single' : 'Bulk'}
              </button>
            ))}
          </div>
        </div>

        {mode === 'single' ? (
          <>
            <input value={form.group_name} onChange={e => setForm({ ...form, group_name: e.target.value })} placeholder="Group name (e.g. BCS — Period 3)" className={inputCls} />
            <input value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} placeholder="School or organization name" className={inputCls} />
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" className={inputCls} />
            {saveError && <p className="text-xs text-red-400">{saveError}</p>}
            <button onClick={create} disabled={saving} className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#3b82f6,#a855f7)' }}>
              {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Plus size={16} /> Create Group &amp; Generate Code</>}
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-gray-400">Enter one group name per line — a unique join code will be generated for each.</p>
            <textarea
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder={"BCS — Period 1\nBCS — Period 2\nBCS — Period 3\nBCS — Period 4"}
              className={inputCls}
              rows={5}
            />
            <input value={bulkOrg} onChange={e => setBulkOrg(e.target.value)} placeholder="School or organization (applies to all)" className={inputCls} />
            {saveError && <p className="text-xs text-red-400">{saveError}</p>}
            <button onClick={createBulk} disabled={saving} className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#3b82f6,#a855f7)' }}>
              {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Plus size={16} /> Create All &amp; Generate Codes</>}
            </button>
          </>
        )}
      </div>

      {/* Success banners */}
      {newlyCreated && !Array.isArray(newlyCreated) && (
        <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.45)' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-400 tracking-wider">✅ GROUP CREATED — SHARE THIS CODE</p>
            <button onClick={() => setNewlyCreated(null)} className="text-gray-500 hover:text-gray-300"><X size={14} /></button>
          </div>
          <p className="text-sm text-white font-semibold">{newlyCreated.group_name}</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black tracking-widest text-emerald-300" style={{ fontFamily: 'monospace' }}>{newlyCreated.join_code}</span>
            <button
              onClick={() => { navigator.clipboard.writeText(newlyCreated.join_code); setCopied({ 0: true }); setTimeout(() => setCopied({}), 2000); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition"
              style={{ background: copied[0] ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: copied[0] ? '#34d399' : '#fff' }}>
              {copied[0] ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy Code</>}
            </button>
          </div>
          <p className="text-xs text-gray-400">Share this code with the teacher so students can join.</p>
        </div>
      )}

      {newlyCreated && Array.isArray(newlyCreated) && (
        <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.45)' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-400 tracking-wider">✅ {newlyCreated.length} GROUPS CREATED</p>
            <div className="flex items-center gap-2">
              <button onClick={copyAll} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition" style={{ background: 'rgba(16,185,129,0.25)', color: '#34d399', border: '1px solid rgba(16,185,129,0.4)' }}>
                <Copy size={11} /> Copy All
              </button>
              <button onClick={() => setNewlyCreated(null)} className="text-gray-500 hover:text-gray-300"><X size={14} /></button>
            </div>
          </div>
          <div className="space-y-2">
            {newlyCreated.map((r, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div>
                  <p className="text-xs font-semibold text-white">{r.group_name}</p>
                  {r.organization && <p className="text-[10px] text-gray-500">{r.organization}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-emerald-300" style={{ fontFamily: 'monospace', letterSpacing: '0.15em' }}>{r.join_code}</span>
                  <button onClick={() => { navigator.clipboard.writeText(r.join_code); setCopied(prev => ({ ...prev, [i]: true })); setTimeout(() => setCopied(prev => ({ ...prev, [i]: false })), 2000); }}
                    className="p-1 rounded" style={{ color: copied[i] ? '#34d399' : '#9ca3af' }}>
                    {copied[i] ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400">Share each code with the corresponding teacher. All codes are also saved in the list below.</p>
        </div>
      )}

      {/* Active / Archived toggle */}
      <div className="flex gap-2">
        {[false, true].map(archived => (
          <button key={String(archived)} onClick={() => setShowArchived(archived)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition"
            style={showArchived === archived ? { background: archived ? 'rgba(251,191,36,0.2)' : 'linear-gradient(135deg,#3b82f6,#a855f7)', color: archived ? '#fbbf24' : '#fff', border: archived ? '1px solid rgba(251,191,36,0.4)' : 'none' } : { background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}>
            {archived ? <><Archive size={11} /> Archived ({groups.filter(g => g.is_active === false).length})</> : <>Active ({groups.filter(g => g.is_active !== false).length})</>}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div> :
        groups.filter(g => showArchived ? g.is_active === false : g.is_active !== false).length === 0
          ? <p className="text-center text-sm text-gray-500 py-4">{showArchived ? 'No archived groups.' : 'No active groups. Create one above.'}</p>
          : (
          <div className="space-y-3">
            {groups.filter(g => showArchived ? g.is_active === false : g.is_active !== false).map(g => (
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
                        {!showArchived && <button onClick={() => startEdit(g)} className="text-blue-400 hover:text-blue-300" title="Edit"><Pencil size={14} /></button>}
                        {showArchived
                          ? <>
                              <button onClick={() => restoreGroup(g.id)} className="text-emerald-400 hover:text-emerald-300" title="Restore group"><ArchiveRestore size={14} /></button>
                              <button onClick={() => deleteGroup(g.id)} className="text-red-400 hover:text-red-300" title="Permanently delete"><Trash2 size={14} /></button>
                            </>
                          : <button onClick={() => archiveGroup(g.id)} className="text-yellow-400 hover:text-yellow-300" title="Archive group"><Archive size={14} /></button>
                        }
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <button onClick={() => toggleMembers(g.id)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition">
                        <Users size={11} />
                        <span>{members[g.id]?.length ?? g.member_count ?? 0} members</span>
                        {expandedId === g.id ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>
                    </div>

                    {expandedId === g.id && (
                      <div className="mt-3 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                        {membersLoading[g.id] ? (
                          <div className="flex justify-center py-4"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
                        ) : !members[g.id]?.length ? (
                          <p className="text-xs text-gray-500 text-center py-4">No members have joined yet.</p>
                        ) : (
                          <div>
                            <div className="px-3 py-2 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.04)' }}>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{members[g.id].length} student{members[g.id].length !== 1 ? 's' : ''} joined</span>
                            </div>
                            {members[g.id].map(m => (
                              <div key={m.id} className="flex items-center justify-between px-3 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div>
                                  <p className="text-xs text-white font-medium">{m.display_name || m.username || m.user_email}</p>
                                  {(m.display_name || m.username) && <p className="text-[10px] text-gray-500">{m.user_email}</p>}
                                  {m.joined_date && <p className="text-[10px] text-gray-600">{new Date(m.joined_date).toLocaleDateString()}</p>}
                                </div>
                                <button onClick={() => removeMember(g.id, m.id)} className="text-red-400 hover:text-red-300 p-1" title="Remove from group">
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
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