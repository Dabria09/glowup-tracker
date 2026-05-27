import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Send } from 'lucide-react';

export default function AnnounceTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', send_to: 'all', scheduled_date: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const a = await base44.entities.Announcement.list('-created_date');
      setAnnouncements(a);
    } catch (e) { console.error(e); }
  };

  const send = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setSending(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.Announcement.create({
        title: form.title,
        body: form.body,
        send_to: form.send_to,
        scheduled_date: form.scheduled_date || null,
        sent_by: user.email,
        sent_date: new Date().toISOString(),
        status: form.scheduled_date ? 'scheduled' : 'sent',
      });
      setForm({ title: '', body: '', send_to: 'all', scheduled_date: '' });
      load();
    } catch (e) { console.error(e); }
    setSending(false);
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm";

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="font-bold text-white text-sm flex items-center gap-2">📣 New Announcement</p>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Announcement title..." className={inputCls} />
        <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Message body..." className={inputCls} rows={4} />
        <div>
          <p className="text-xs text-gray-400 mb-2">Send to:</p>
          <div className="flex gap-2">
            {['all', 'specific_group'].map(opt => (
              <button key={opt} onClick={() => setForm({ ...form, send_to: opt })}
                className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${form.send_to === opt ? 'text-white' : 'text-gray-400 bg-white/5'}`}
                style={form.send_to === opt ? { background: 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}>
                {opt === 'all' ? 'All Users' : 'Specific Group'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-2">Schedule (optional — leave blank to send now):</p>
          <input type="datetime-local" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} className={inputCls} />
        </div>
        <button onClick={send} disabled={sending} className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
          <Send size={16} /> {sending ? 'Sending...' : 'Send Now'}
        </button>
      </div>

      {announcements.length === 0 ? <p className="text-center text-sm text-gray-500 py-4">No announcements yet.</p> : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-semibold text-white text-sm">{a.title}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${a.status === 'sent' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{a.status}</span>
              </div>
              <p className="text-xs text-gray-400">{a.body}</p>
              <p className="text-[10px] text-gray-600 mt-2">{a.send_to === 'all' ? 'All Users' : 'Specific Group'} · {a.sent_date ? new Date(a.sent_date).toLocaleDateString() : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}