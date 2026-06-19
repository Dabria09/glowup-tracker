import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Trash2, Pencil } from 'lucide-react';

export default function AnnounceTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', send_to: 'all', group_id: '', scheduled_date: '' });
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [a, g] = await Promise.all([
        base44.entities.Announcement.list('-created_date'),
        base44.entities.ClassGroup.filter({ is_active: true }, '-created_date'),
      ]);
      setAnnouncements(a);
      setGroups(g);
    } catch (e) { console.error(e); }
  };

  const send = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    if (form.send_to === 'specific_group' && !form.group_id) { alert('Please select a group'); return; }
    setSending(true);
    try {
      const user = await base44.auth.me();
      const selectedGroup = groups.find(g => g.id === form.group_id);
      await base44.entities.Announcement.create({
        title: form.title,
        body: form.body,
        send_to: form.send_to,
        group_id: form.send_to === 'specific_group' ? form.group_id : null,
        target_group_name: selectedGroup?.group_name || null,
        scheduled_date: form.scheduled_date || null,
        sent_by: user.email,
        sent_date: new Date().toISOString(),
        status: form.scheduled_date ? 'scheduled' : 'sent',
      });
      setForm({ title: '', body: '', send_to: 'all', group_id: '', scheduled_date: '' });
      load();
    } catch (e) { console.error(e); }
    setSending(false);
  };

  const deleteAnnouncement = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    await base44.entities.Announcement.delete(id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const startEdit = (a) => {
    setEditingId(a.id);
    setEditForm({ title: a.title, body: a.body, send_to: a.send_to, group_id: a.group_id || '', scheduled_date: a.scheduled_date || '' });
  };

  const saveEdit = async () => {
    if (!editForm.title.trim() || !editForm.body.trim()) return;
    if (editForm.send_to === 'specific_group' && !editForm.group_id) { alert('Please select a group'); return; }
    try {
      const selectedGroup = groups.find(g => g.id === editForm.group_id);
      await base44.entities.Announcement.update(editingId, {
        title: editForm.title,
        body: editForm.body,
        send_to: editForm.send_to,
        group_id: editForm.send_to === 'specific_group' ? editForm.group_id : null,
        target_group_name: selectedGroup?.group_name || null,
        scheduled_date: editForm.scheduled_date || null,
        status: editForm.scheduled_date ? 'scheduled' : 'sent',
      });
      setEditingId(null);
      setEditForm(null);
      load();
    } catch (e) { console.error(e); }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm";
  const editInputCls = "w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-gray-500 outline-none text-sm";

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="font-bold text-white text-sm flex items-center gap-2">{editingId ? '✏️ Edit Announcement' : '📣 New Announcement'}</p>
        {editingId && editForm && (
          <>
            <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className={editInputCls} />
            <textarea value={editForm.body} onChange={e => setEditForm({ ...editForm, body: e.target.value })} className={editInputCls} rows={4} />
          </>
        )}
        {!editingId && (
          <>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Announcement title..." className={inputCls} />
            <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Message body..." className={inputCls} rows={4} />
          </>
        )}
        <div>
          <p className="text-xs text-gray-400 mb-2">Send to:</p>
          <div className="flex gap-2">
            {['all', 'specific_group'].map(opt => (
              <button key={opt} onClick={() => editingId ? setEditForm({ ...editForm, send_to: opt, group_id: '' }) : setForm({ ...form, send_to: opt, group_id: '' })}
                className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${(editingId ? editForm.send_to : form.send_to) === opt ? 'text-white' : 'text-gray-400 bg-white/5'}`}
                style={(editingId ? editForm.send_to : form.send_to) === opt ? { background: 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}>
                {opt === 'all' ? 'All Users' : 'Specific Group'}
              </button>
            ))}
          </div>
          {(editingId ? editForm?.send_to : form.send_to) === 'specific_group' && (
            <div className="mt-3 space-y-2">
              {groups.length === 0 ? (
                <p className="text-xs text-red-400 px-1">No active groups found. Create a group first in the Groups tab.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {groups.map(g => {
                    const currentGroupId = editingId ? editForm.group_id : form.group_id;
                    const isSelected = currentGroupId === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => editingId ? setEditForm({ ...editForm, group_id: g.id }) : setForm({ ...form, group_id: g.id })}
                        className="w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold transition"
                        style={isSelected
                          ? { background: 'linear-gradient(135deg,rgba(236,72,153,0.3),rgba(168,85,247,0.3))', border: '1px solid rgba(236,72,153,0.6)', color: '#fff' }
                          : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#d1d5db' }}
                      >
                        <span>{g.group_name}</span>
                        {g.organization && <span className="text-gray-500 font-normal"> — {g.organization}</span>}
                        {isSelected && <span className="float-right text-pink-400">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
              {!(editingId ? editForm.group_id : form.group_id) && groups.length > 0 && (
                <p className="text-[10px] text-amber-400 px-1">Select a group above to target this announcement.</p>
              )}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-2">Schedule (optional — leave blank to send now):</p>
          <input type="datetime-local" value={editingId ? editForm?.scheduled_date : form.scheduled_date} onChange={e => editingId ? setEditForm({ ...editForm, scheduled_date: e.target.value }) : setForm({ ...form, scheduled_date: e.target.value })} className={inputCls} />
        </div>
        {editingId ? (
          <div className="flex gap-2">
            <button onClick={saveEdit} disabled={sending} className="flex-1 py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
              <Pencil size={16} /> {sending ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => { setEditingId(null); setEditForm(null); }} className="px-4 py-3 rounded-2xl text-sm text-gray-400 bg-white/5">Cancel</button>
          </div>
        ) : (
          <button onClick={send} disabled={sending} className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
            <Send size={16} /> {sending ? 'Sending...' : 'Send Now'}
          </button>
        )}
      </div>

      {announcements.length === 0 ? <p className="text-center text-sm text-gray-500 py-4">No announcements yet.</p> : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-semibold text-white text-sm">{a.title}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${a.status === 'sent' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{a.status}</span>
                  {a.status === 'scheduled' && (
                    <button onClick={() => startEdit(a)} className="text-blue-400 hover:text-blue-300 transition" title="Edit"><Pencil size={14} /></button>
                  )}
                  <button onClick={() => deleteAnnouncement(a.id)} className="text-gray-500 hover:text-red-400 transition"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="text-xs text-gray-400">{a.body}</p>
              <p className="text-[10px] text-gray-600 mt-2">
                {a.send_to === 'all' ? 'All Users' : `🎯 ${a.target_group_name || 'Specific Group'}`} · {a.sent_date ? new Date(a.sent_date).toLocaleDateString() : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}