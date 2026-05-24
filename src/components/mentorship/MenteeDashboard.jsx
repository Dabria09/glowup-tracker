import { useState, useEffect } from 'react';
import { Calendar, Clock, Star, MessageCircle, BookOpen, CheckCircle, Hourglass, History, Video } from 'lucide-react';
import MentorSessionCall from './MentorSessionCall';
import SessionFeedbackModal from './SessionFeedbackModal';
import { base44 } from '@/api/base44Client';

export default function MenteeDashboard({ user }) {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [mentors, setMentors] = useState({});
  const [feedbackSession, setFeedbackSession] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const sessions = await base44.entities.MentorSession.filter({ mentee_email: user.email });
      const now = new Date();

      const pending = sessions.filter(s => s.status === 'pending');
      setPendingRequests(pending);

      const upcoming = sessions
        .filter(s => s.status === 'scheduled' && new Date(s.session_date) > now)
        .sort((a, b) => new Date(a.session_date) - new Date(b.session_date));
      setUpcomingSessions(upcoming);

      const completed = sessions
        .filter(s => s.status === 'completed' || (s.status === 'scheduled' && new Date(s.session_date) < now))
        .sort((a, b) => new Date(b.session_date) - new Date(a.session_date));
      setCompletedSessions(completed);

      const allMentorEmails = sessions.map(s => s.mentor_email);
      const uniqueEmails = [...new Set(allMentorEmails)];
      const mentorData = {};
      for (const email of uniqueEmails) {
        const found = await base44.entities.Mentor.filter({ user_email: email });
        if (found.length > 0) mentorData[email] = found[0];
      }
      setMentors(mentorData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading mentee data:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const getMentorName = (email) => mentors[email]?.full_name || email.split('@')[0];
  const getMentorAvatar = (email) => mentors[email]?.avatar_url;

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-400 text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  const totalCompleted = completedSessions.length;
  const totalUpcoming = upcomingSessions.length;
  const totalPending = pendingRequests.length;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(147,51,234,0.15))', border: '1px solid rgba(59,130,246,0.3)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.3)' }}>
            <BookOpen size={24} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Welcome back!</h2>
            <p className="text-sm text-gray-300">Track your mentorship journey</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <Hourglass size={18} className="mx-auto mb-1 text-amber-400" />
          <p className="text-xl font-bold text-white">{totalPending}</p>
          <p className="text-xs text-gray-400">Pending</p>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
          <Calendar size={18} className="mx-auto mb-1 text-blue-400" />
          <p className="text-xl font-bold text-white">{totalUpcoming}</p>
          <p className="text-xs text-gray-400">Upcoming</p>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <CheckCircle size={18} className="mx-auto mb-1 text-green-400" />
          <p className="text-xl font-bold text-white">{totalCompleted}</p>
          <p className="text-xs text-gray-400">Completed</p>
        </div>
      </div>

      {/* Pending Requests */}
      {totalPending > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Hourglass size={18} className="text-amber-400" />
              Pending Requests
            </h3>
            <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>
              {totalPending}
            </span>
          </div>
          <div className="space-y-3">
            {pendingRequests.map(session => (
              <div key={session.id} className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p className="text-sm font-semibold text-white">{getMentorName(session.mentor_email)}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(session.session_date)}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{formatTime(session.session_date)}</span>
                </div>
                {session.topic && <p className="text-xs text-gray-500 mt-2">📝 {session.topic}</p>}
                <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                  <Hourglass size={10} /> Awaiting mentor approval
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-blue-400" />
            Upcoming Sessions
          </h3>
          {totalUpcoming > 0 && (
            <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(59,130,246,0.2)', color: '#3b82f6' }}>
              {totalUpcoming}
            </span>
          )}
        </div>
        {totalUpcoming === 0 ? (
          <div className="text-center py-8">
            <Calendar size={40} className="mx-auto mb-3 text-gray-600" />
            <p className="text-sm text-gray-400">No upcoming sessions</p>
            <p className="text-xs text-gray-500 mt-1">Find a mentor to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map(session => (
              <div key={session.id} className="rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden flex-shrink-0"
                    style={{ background: getMentorAvatar(session.mentor_email) ? 'transparent' : 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                    {getMentorAvatar(session.mentor_email)
                      ? <img src={getMentorAvatar(session.mentor_email)} alt="" className="w-full h-full object-cover" />
                      : getMentorName(session.mentor_email).charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{getMentorName(session.mentor_email)}</p>
                    {mentors[session.mentor_email]?.title && (
                      <p className="text-xs text-gray-400">{mentors[session.mentor_email].title}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock size={12} />{formatDate(session.session_date)} at {formatTime(session.session_date)}</span>
                      <span className="flex items-center gap-1"><MessageCircle size={12} />{session.session_type || 'Video'}</span>
                    </div>
                    {session.topic && <p className="text-xs text-gray-500 mt-2">📝 {session.topic}</p>}
                    {(session.session_type === 'Video Call' || !session.session_type) && (
                      <button
                        onClick={() => setActiveCall(session)}
                        className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
                      >
                        <Video size={14} /> Join Call
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session History */}
      {totalCompleted > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <History size={18} className="text-purple-400" />
              Session History
            </h3>
            <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(168,85,247,0.2)', color: '#a855f7' }}>
              {totalCompleted}
            </span>
          </div>
          <div className="space-y-3">
            {completedSessions.slice(0, 10).map(session => (
              <div key={session.id} className="rounded-xl p-4" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden"
                      style={{ background: getMentorAvatar(session.mentor_email) ? 'transparent' : 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                      {getMentorAvatar(session.mentor_email)
                        ? <img src={getMentorAvatar(session.mentor_email)} alt="" className="w-full h-full object-cover" />
                        : getMentorName(session.mentor_email).charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{getMentorName(session.mentor_email)}</p>
                      <p className="text-xs text-gray-400">{formatDate(session.session_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.rating ? (
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold text-white">{session.rating}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setFeedbackSession(session)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
                      >
                        ⭐ Rate
                      </button>
                    )}
                    {session.status === 'completed' && <CheckCircle size={16} className="text-green-400" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeCall && (
        <MentorSessionCall
          session={activeCall}
          user={user}
          onLeave={() => setActiveCall(null)}
        />
      )}

      {feedbackSession && (
        <SessionFeedbackModal
          isOpen={!!feedbackSession}
          onClose={() => setFeedbackSession(null)}
          session={feedbackSession}
          mentorName={getMentorName(feedbackSession.mentor_email)}
          onSubmitted={() => {
            setFeedbackSession(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}