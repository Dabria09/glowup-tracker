import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const STATUS_FILTERS = ['Pending', 'Approved', 'Rejected', 'All'];

export default function MentorsAdminTab() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [newsletter, setNewsletter] = useState({ subject: '', body: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const apps = await base44.entities.MentorApplication.list('-created_date');
      setApplications(apps);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    // Update the MentorApplication record
    await base44.entities.MentorApplication.update(id, { status, approved_date: status === 'approved' ? new Date().toISOString() : undefined });

    // Also update the User entity so mentor_status reflects approval instantly
    const app = applications.find(a => a.id === id);
    if (app?.user_email) {
      const allUsers = await base44.entities.User.list();
      const matchedUser = allUsers.find(u => u.email === app.user_email);
      if (matchedUser) {
        await base44.entities.User.update(matchedUser.id, {
          mentor_status: status === 'approved' ? 'approved' : status === 'rejected' ? 'suspended' : 'pending',
        });
      }
    }

    load();
  };

  const sendNewsletter = async () => {
    if (!newsletter.subject.trim()) return;
    const approved = applications.filter(a => a.status === 'approved');
    for (const mentor of approved) {
      await base44.integrations.Core.SendEmail({ to: mentor.user_email, subject: newsletter.subject, body: newsletter.body });
    }
    setComposing(false);
    setNewsletter({ subject: '', body: '' });
    alert(`Newsletter sent to ${approved.length} mentors!`);
  };

  const filtered = filter === 'All' ? applications : applications.filter(a => a.status === filter.toLowerCase());

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm";

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl flex items-center justify-between" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}>
        <div>
          <p className="font-bold text-white text-sm flex items-center gap-2">👑 Ms. Glow Newsletter</p>
          <p className="text-xs text-gray-400 mt-0.5">Send a monthly newsletter to all approved mentors from Ms. Glow.</p>
        </div>
        <button onClick={() => setComposing(!composing)} className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.4)', color: '#fbbf24' }}>
          Compose
        </button>
      </div>

      {composing && (
        <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <input value={newsletter.subject} onChange={e => setNewsletter({ ...newsletter, subject: e.target.value })} placeholder="Email subject..." className={inputCls} />
          <textarea value={newsletter.body} onChange={e => setNewsletter({ ...newsletter, body: e.target.value })} placeholder="Newsletter body..." className={inputCls} rows={5} />
          <button onClick={sendNewsletter} className="w-full py-3 rounded-2xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
            Send to All Approved Mentors
          </button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto">
        {STATUS_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition ${filter === f ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={filter === f ? { background: 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div> :
        filtered.length === 0 ? (
          <div className="p-8 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-sm text-gray-400">No {filter.toLowerCase()} applications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(app => (
              <div key={app.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-white text-sm">{app.full_name}</p>
                    <p className="text-xs text-gray-400">{app.user_email}</p>
                    <p className="text-xs text-gray-500">{app.title}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    app.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    app.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>{app.status}</span>
                </div>
                {app.bio && <p className="text-xs text-gray-400 mb-2">{app.bio}</p>}
                <p className="text-xs text-gray-500 mb-3">Experience: {app.experience_years || 0} · Applied: {app.submitted_date ? new Date(app.submitted_date).toLocaleDateString() : 'N/A'}</p>
                {app.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(app.id, 'approved')} className="flex-1 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1" style={{ background: 'rgba(16,185,129,0.3)', border: '1px solid rgba(16,185,129,0.4)' }}>
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button onClick={() => updateStatus(app.id, 'rejected')} className="flex-1 py-2 rounded-xl text-xs font-bold text-orange-400 flex items-center justify-center gap-1" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                      <XCircle size={12} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}