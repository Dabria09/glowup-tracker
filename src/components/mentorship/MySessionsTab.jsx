import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Video, Calendar, Clock, Users, Play, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import MentorVideoSession from '@/components/mentorship/MentorVideoSession';

const STATUS_META = {
  scheduled: { label: 'Scheduled', color: '#3b82f6', bg: 'rgba(59,130,246,0.2)' },
  live: { label: 'Live', color: '#ef4444', bg: 'rgba(239,68,68,0.2)' },
  completed: { label: 'Completed', color: '#10b981', bg: 'rgba(16,185,129,0.2)' },
  cancelled: { label: 'Cancelled', color: '#6b7280', bg: 'rgba(107,113,128,0.2)' },
};

export default function MySessionsTab({ user }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    loadSessions();
  }, [user]);

  const loadSessions = async () => {
    try {
      const allSessions = await base44.entities.MentorSession.list('-session_date', 50);
      // Filter sessions where user is either mentor or mentee
      const mySessions = allSessions.filter(
        s => s.mentor_email === user.email || s.mentee_email === user.email
      );
      setSessions(mySessions);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleJoinSession = async (session) => {
    setActiveSession(session);
  };

  const handleLeaveSession = () => {
    setActiveSession(null);
    loadSessions();
  };

  const handleViewRecording = (session) => {
    if (session.recording_url) {
      window.open(session.recording_url, '_blank');
    } else {
      alert('Recording not available for this session.');
    }
  };

  const canJoinSession = (session) => {
    if (session.status === 'cancelled') return false;
    if (session.status === 'completed') return false;
    
    const now = Date.now();
    const sessionTime = new Date(session.session_date).getTime();
    const fifteenMinBefore = sessionTime - (15 * 60 * 1000);
    const sixtyMinAfter = sessionTime + (60 * 60 * 1000);

    return now >= fifteenMinBefore && now <= sixtyMinAfter;
  };

  if (activeSession && user) {
    return <MentorVideoSession session={activeSession} user={user} onLeave={handleLeaveSession} />;
  }

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Video size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">No sessions yet</p>
          <p className="text-sm text-gray-400">Book your first mentorship session to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => {
            const statusMeta = STATUS_META[session.status] || STATUS_META.scheduled;
            const canJoin = canJoinSession(session);
            const isMyMentor = session.mentor_email === user.email;
            const otherParty = isMyMentor ? session.mentee_email : session.mentor_email;

            return (
              <div key={session.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: session.status === 'live' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)' }}>
                    {session.status === 'live' ? <Users size={18} className="text-red-400" /> : <Video size={18} className="text-blue-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-white text-sm">{session.topic || 'Mentorship Session'}</p>
                      {session.status === 'live' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                          🔴 LIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {isMyMentor ? `Mentee: ${otherParty}` : `Mentor: ${otherParty}`}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(session.session_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(session.session_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {canJoin && (
                        <button
                          onClick={() => handleJoinSession(session)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white transition hover:opacity-90"
                          style={{ background: session.status === 'live' ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#3b82f6,#2563eb)' }}
                        >
                          <ExternalLink size={12} />
                          {session.status === 'live' ? 'Join Live' : 'Join Session'}
                        </button>
                      )}
                      {session.status === 'completed' && session.recording_url && (
                        <button
                          onClick={() => handleViewRecording(session)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white transition hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
                        >
                          <Play size={12} /> View Recording
                        </button>
                      )}
                      {!canJoin && session.status === 'scheduled' && (
                        <span className="text-[10px] text-gray-500">
                          Available 15 min before start time
                        </span>
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
      )}
    </div>
  );
}