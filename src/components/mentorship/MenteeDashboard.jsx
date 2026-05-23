import { useState, useEffect } from 'react';
import { Calendar, Clock, Star, MessageCircle, BookOpen, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MenteeDashboard({ user }) {
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [mentorInfo, setMentorInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const sessions = await base44.entities.MentorSession.filter({
        mentee_email: user.email,
      });
      
      const upcoming = sessions
        .filter(s => s.status === 'scheduled' && new Date(s.session_date) > new Date())
        .sort((a, b) => new Date(a.session_date) - new Date(b.session_date))
        .slice(0, 5);
      setUpcomingSessions(upcoming);

      const past = sessions
        .filter(s => s.status === 'completed' || new Date(s.session_date) < new Date())
        .sort((a, b) => new Date(b.session_date) - new Date(a.session_date))
        .slice(0, 5);
      setPastSessions(past);

      if (upcoming.length > 0) {
        const mentors = await base44.entities.Mentor.filter({ 
          user_email: upcoming[0].mentor_email 
        });
        if (mentors.length > 0) {
          setMentorInfo(mentors[0]);
        }
      }

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
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-400 text-sm">Loading your dashboard...</p>
      </div>
    );
  }

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
            <p className="text-sm text-gray-300">Ready to learn and grow?</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Calendar size={20} className="mx-auto mb-2 text-blue-400" />
          <p className="text-2xl font-bold text-white">{upcomingSessions.length}</p>
          <p className="text-xs text-gray-400">Upcoming</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <CheckCircle size={20} className="mx-auto mb-2 text-green-400" />
          <p className="text-2xl font-bold text-white">{pastSessions.filter(s => s.status === 'completed').length}</p>
          <p className="text-xs text-gray-400">Completed</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Star size={20} className="mx-auto mb-2 text-yellow-400" />
          <p className="text-2xl font-bold text-white">{pastSessions.filter(s => s.rating).length}</p>
          <p className="text-xs text-gray-400">Reviewed</p>
        </div>
      </div>

      {/* Next Session */}
      {upcomingSessions.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(147,51,234,0.1))', border: '1px solid rgba(59,130,246,0.3)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-blue-400" />
              Next Session
            </h3>
          </div>
          
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden"
                style={{ background: mentorInfo?.avatar_url ? 'transparent' : 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                {mentorInfo?.avatar_url ? (
                  <img src={mentorInfo.avatar_url} alt={mentorInfo.full_name} className="w-full h-full object-cover" />
                ) : (
                  mentorInfo?.full_name?.charAt(0) || 'M'
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{mentorInfo?.full_name || upcomingSessions[0].mentor_email.split('@')[0]}</p>
                {mentorInfo?.title && <p className="text-xs text-gray-400">{mentorInfo.title}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(upcomingSessions[0].session_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatTime(upcomingSessions[0].session_date)}
                  </span>
                </div>
                {upcomingSessions[0].topic && (
                  <p className="text-xs text-gray-500 mt-2">📝 {upcomingSessions[0].topic}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-blue-400" />
            My Sessions
          </h3>
        </div>
        
        {upcomingSessions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar size={40} className="mx-auto mb-3 text-gray-600" />
            <p className="text-sm text-gray-400">No upcoming sessions</p>
            <p className="text-xs text-gray-500 mt-1">Find a mentor to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map(session => (
              <div key={session.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{session.mentor_email.split('@')[0]}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(session.session_date)} at {formatTime(session.session_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={12} />
                        {session.session_type || 'Video'}
                      </span>
                    </div>
                    {session.topic && (
                      <p className="text-xs text-gray-500 mt-2">📝 {session.topic}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-purple-400" />
              Recent Sessions
            </h3>
          </div>
          
          <div className="space-y-3">
            {pastSessions.slice(0, 3).map(session => (
              <div key={session.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{session.mentor_email.split('@')[0]}</p>
                    <p className="text-xs text-gray-400">{formatDate(session.session_date)}</p>
                  </div>
                  {session.rating ? (
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold text-white">{session.rating}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">No review</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CheckCircle({ size, className }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}