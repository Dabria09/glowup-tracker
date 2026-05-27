import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle } from 'lucide-react';

const STATUS_FILTERS = ['Pending', 'Approved', 'Rejected', 'All'];

export default function KitchenMentorsTab() {
  const [subTab, setSubTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [apps, sess] = await Promise.all([
        base44.entities.TeenMentorApplication.list('-created_date'),
        base44.entities.MentorSession.list('-created_date', 50),
      ]);
      setApplications(apps);
      setSessions(sess);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await base44.entities.TeenMentorApplication.update(id, { status });
    load();
  };

  const filtered = filter === 'All' ? applications : applications.filter(a => a.status?.toLowerCase() === filter.toLowerCase());

  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-white flex items-center gap-2">🍳 Kitchen Mentor Management</p>

      <div className="flex gap-2">
        {[{ id: 'applications', label: '🍳 Mentor Applications' }, { id: 'sessions', label: '📋 Session Requests' }].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`flex-1 py-2 rounded-full text-xs font-semibold transition ${subTab === t.id ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={subTab === t.id ? { background: 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'applications' && (
        <>
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
                <p className="text-sm text-gray-400">No pending applications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(app => (
                  <div key={app.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-white text-sm">{app.full_name || app.user_email}</p>
                        <p className="text-xs text-gray-400">{app.user_email}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${app.status === 'approved' ? 'bg-green-500/20 text-green-400' : app.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{app.status || 'pending'}</span>
                    </div>
                    {(!app.status || app.status === 'pending') && (
                      <div className="flex gap-2 mt-2">
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
        </>
      )}

      {subTab === 'sessions' && (
        sessions.length === 0 ? (
          <div className="p-8 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-sm text-gray-400">No session requests yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(s => (
              <div key={s.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="font-semibold text-white text-sm">{s.session_topic || 'Session'}</p>
                <p className="text-xs text-gray-400">{s.mentor_email} → {s.mentee_email}</p>
                <p className="text-xs text-gray-500 mt-1">{s.session_date ? new Date(s.session_date).toLocaleDateString() : 'No date set'}</p>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}