import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Video, Eye } from 'lucide-react';

export default function VideoMonitorTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await base44.entities.MentorSession.list('-created_date', 50);
        setSessions(s);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
        <p className="font-bold text-white text-sm flex items-center gap-2 mb-2"><Video size={16} className="text-blue-400" /> Video Session Monitor</p>
        <p className="text-xs text-gray-400 leading-relaxed">Monitor all scheduled and live video sessions. You can join any session unannounced to ensure safety. All sessions are recorded automatically.</p>
      </div>

      <p className="text-sm font-semibold text-gray-300">All Video Sessions</p>

      {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div> :
        sessions.length === 0 ? (
          <div className="p-12 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Video size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No video sessions yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(s => (
              <div key={s.id} className="p-4 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59,130,246,0.2)' }}>
                  <Video size={18} className="text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">{s.session_topic || 'Mentorship Session'}</p>
                  <p className="text-xs text-gray-400">{s.mentor_email} ↔ {s.mentee_email}</p>
                  <p className="text-xs text-gray-500">{s.session_date ? new Date(s.session_date).toLocaleDateString() : ''}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${s.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {s.status || 'scheduled'}
                </span>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}