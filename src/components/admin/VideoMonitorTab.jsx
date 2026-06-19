import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Video, Users, Play, ExternalLink } from 'lucide-react';

const STATUS_FILTERS = ['All', 'Live', 'Upcoming', 'Completed'];

const STATUS_META = {
  live: { label: '🔴 Live', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  upcoming: { label: 'Upcoming', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  scheduled: { label: 'Scheduled', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  completed: { label: 'Completed', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  cancelled: { label: 'Cancelled', color: '#6b7280', bg: 'rgba(107,113,128,0.15)' },
};

export default function VideoMonitorTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const s = await base44.entities.MentorSession.list('-session_date', 50);
        setSessions(s);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const handleViewRecording = (session) => {
    if (session.recording_url) {
      window.open(session.recording_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleJoinSession = async (session) => {
    try {
      const res = await base44.functions.invoke('generateAgoraToken', {
        channelName: session.agora_channel_id || `session_${session.id}`,
      });
      const { token, appId } = res.data;
      window.open(`/video-session?channel=${session.agora_channel_id || `session_${session.id}`}&token=${token}&appid=${appId}`, '_blank');
    } catch (e) {
      alert('Failed to join session: ' + e.message);
    }
  };

  const filtered = sessions.filter(s => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Live') return s.status === 'live';
    if (statusFilter === 'Upcoming') return s.status === 'scheduled' && new Date(s.session_date) > new Date();
    if (statusFilter === 'Completed') return s.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
        <p className="font-bold text-white text-sm flex items-center gap-2 mb-2"><Video size={16} className="text-blue-400" /> Video Session Monitor</p>
        <p className="text-xs text-gray-400 leading-relaxed">Monitor all scheduled and live video sessions. You can join any session unannounced to ensure safety. All sessions are recorded automatically.</p>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto">
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition ${statusFilter === f ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={statusFilter === f ? { background: 'linear-gradient(135deg,#3b82f6,#a855f7)' } : {}}
          >
            {f === 'Live' ? '🔴 ' : f === 'Upcoming' ? '📅 ' : f === 'Completed' ? '✅ ' : ''}{f}
          </button>
        ))}
      </div>

      <p className="text-sm font-semibold text-gray-300">All Video Sessions</p>

      {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div> :
        filtered.length === 0 ? (
          <div className="p-12 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Video size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No {statusFilter.toLowerCase()} sessions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(s => {
              const statusMeta = STATUS_META[s.status] || STATUS_META.scheduled;
              const isLive = s.status === 'live';
              const isScheduled = s.status === 'scheduled';
              const isCompleted = s.status === 'completed';
              
              return (
                <div key={s.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: isLive ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isLive ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)' }}>
                      {isLive ? <Users size={18} className="text-red-400" /> : <Video size={18} className="text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-white text-sm">{s.topic || 'Mentorship Session'}</p>
                        {isLive && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                            🔴 LIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{s.mentor_email} ↔ {s.mentee_email}</p>
                      <p className="text-xs text-gray-500">{s.session_date ? new Date(s.session_date).toLocaleString() : ''}</p>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {isCompleted && s.recording_url && (
                          <button
                            onClick={() => handleViewRecording(s)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white transition hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
                          >
                            <Play size={12} /> View Recording
                          </button>
                        )}
                        {(isLive || isScheduled) && s.agora_channel_id && (
                          <button
                            onClick={() => handleJoinSession(s)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white transition hover:opacity-90"
                            style={{ background: isLive ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#3b82f6,#2563eb)' }}
                          >
                            <ExternalLink size={12} /> {isLive ? 'Join Live Session' : 'Join Session'}
                          </button>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full font-bold flex-shrink-0" style={{ background: statusMeta.bg, color: statusMeta.color, border: `1px solid ${statusMeta.color}40` }}>
                      {statusMeta.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
}