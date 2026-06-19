import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Video, Play, ExternalLink, Users, AlertTriangle, X } from 'lucide-react';
import MentorVideoSession from '@/components/mentorship/MentorVideoSession';

const STATUS_META = {
  scheduled: { label: 'Scheduled', color: '#3b82f6', bg: 'rgba(59,130,246,0.2)' },
  live: { label: 'Live', color: '#ef4444', bg: 'rgba(239,68,68,0.2)' },
  completed: { label: 'Completed', color: '#10b981', bg: 'rgba(16,185,129,0.2)' },
  cancelled: { label: 'Cancelled', color: '#6b7280', bg: 'rgba(107,113,128,0.2)' },
};

const FLAG_REASONS = [
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'harassment', label: 'Harassment or Bullying' },
  { value: 'safety_concern', label: 'Safety Concern' },
  { value: 'policy_violation', label: 'Policy Violation' },
  { value: 'other', label: 'Other' },
];

export default function VideoMonitorTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFlagModal, setShowFlagModal] = useState(null);
  const [flagForm, setFlagForm] = useState({ reason: 'inappropriate', description: '' });
  const [flagging, setFlagging] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [user, setUser] = useState(null);

  const load = async () => {
    try {
      const s = await base44.entities.MentorSession.list('-session_date', 50);
      setSessions(s);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch (e) {
        console.error(e);
      }
    };
    loadUser();
  }, []);

  const handleViewRecording = (session) => {
    if (session.recording_url) {
      window.open(session.recording_url, '_blank');
    } else {
      alert('Recording not available for this session.');
    }
  };

  const handleJoinSession = async (session) => {
    if (!user) return;
    setActiveSession(session);
  };

  const handleLeaveSession = () => {
    setActiveSession(null);
    load();
  };

  const handleFlagSession = async () => {
    if (!flagForm.reason || !flagForm.description.trim()) {
      alert('Please provide a reason and details for the flag.');
      return;
    }
    setFlagging(true);
    try {
      const me = await base44.auth.me();
      const session = sessions.find(s => s.id === showFlagModal);
      await base44.entities.ContentReport.create({
        reported_content_id: session.id,
        content_type: 'video_session',
        content_snapshot: JSON.stringify({
          mentor: session.mentor_email,
          mentee: session.mentee_email,
          date: session.session_date,
          topic: session.topic,
        }),
        reported_by: me.email,
        reason: flagForm.reason,
        description: flagForm.description.trim(),
        status: 'pending',
      });
      setShowFlagModal(null);
      setFlagForm({ reason: 'inappropriate', description: '' });
      alert('✅ Session flagged for review. This will appear in the Moderation tab.');
    } catch (e) {
      alert('Failed to flag session: ' + e.message);
    }
    setFlagging(false);
  };

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
            {sessions.map(s => {
              const statusMeta = STATUS_META[s.status] || STATUS_META.scheduled;
              return (
                <div key={s.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.status === 'live' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)' }}>
                      {s.status === 'live' ? <Users size={18} className="text-red-400" /> : <Video size={18} className="text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-white text-sm">{s.topic || 'Mentorship Session'}</p>
                        {s.status === 'live' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                            🔴 LIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{s.mentor_email} ↔ {s.mentee_email}</p>
                      <p className="text-xs text-gray-500">{s.session_date ? new Date(s.session_date).toLocaleString() : ''}</p>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {s.status === 'completed' && s.recording_url && (
                          <button
                            onClick={() => handleViewRecording(s)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white transition hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
                          >
                            <Play size={12} /> View Recording
                          </button>
                        )}
                        {(s.status === 'live' || s.status === 'scheduled') && user && (
                          <button
                            onClick={() => handleJoinSession(s)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white transition hover:opacity-90"
                            style={{ background: s.status === 'live' ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#3b82f6,#2563eb)' }}
                          >
                            <ExternalLink size={12} /> {s.status === 'live' ? 'Join Live Session' : 'Join Session'}
                          </button>
                        )}
                        <button
                          onClick={() => setShowFlagModal(s.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-orange-400 transition hover:opacity-90"
                          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
                        >
                          <AlertTriangle size={12} /> Flag Session
                        </button>
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

      {/* Active Video Session */}
      {activeSession && user && (
        <MentorVideoSession session={activeSession} user={user} onLeave={handleLeaveSession} />
      )}

      {/* Flag Session Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-4" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-white text-sm flex items-center gap-2">
                <AlertTriangle size={16} className="text-orange-400" /> Flag Session for Review
              </p>
              <button onClick={() => { setShowFlagModal(null); setFlagForm({ reason: 'inappropriate', description: '' }); }} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              This will create a report in the Moderation tab for admin review.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Reason *</label>
                <select
                  value={flagForm.reason}
                  onChange={e => setFlagForm({ ...flagForm, reason: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none text-sm"
                >
                  {FLAG_REASONS.map(r => (
                    <option key={r.value} value={r.value} style={{ background: '#1a0a2e' }}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Details *</label>
                <textarea
                  value={flagForm.description}
                  onChange={e => setFlagForm({ ...flagForm, description: e.target.value })}
                  placeholder="Describe what you observed..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm resize-none"
                  rows={4}
                />
              </div>
              <button
                onClick={handleFlagSession}
                disabled={flagging || !flagForm.description.trim()}
                className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}
              >
                {flagging ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><AlertTriangle size={16} /> Submit Flag</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}