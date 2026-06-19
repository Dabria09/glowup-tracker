import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, MessageSquare, Calendar, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const STATS_CARDS = [
  { id: 'total_mentors', label: 'Total Mentors', emoji: '🎓', color: '#a855f7' },
  { id: 'active_mentors', label: 'Active (30d)', emoji: '✨', color: '#4ade80' },
  { id: 'total_sessions', label: 'Sessions Conducted', emoji: '💬', color: '#ec4899' },
  { id: 'avg_sessions', label: 'Avg Sessions/Mentor', emoji: '📊', color: '#f59e0b' },
];

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return 'today';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function MentorActivityTab() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [mentors, setMentors] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      // Get all approved mentors
      const [apps, sessions, users] = await Promise.all([
        base44.entities.MentorApplication.filter({ status: 'approved' }, '-approved_date'),
        base44.entities.MentorSession.list('-created_date', 50),
        base44.entities.User.list(),
      ]);

      // Build mentor activity map
      const mentorMap = {};
      apps.forEach(app => {
        mentorMap[app.user_email] = {
          email: app.user_email,
          name: app.full_name,
          approved_date: app.approved_date,
          categories: JSON.parse(app.categories || '[]'),
          sessions_count: 0,
          last_session: null,
          track: app.mentor_track,
        };
      });

      // Count sessions per mentor
      sessions.forEach(s => {
        if (mentorMap[s.mentor_email]) {
          mentorMap[s.mentor_email].sessions_count += 1;
          if (!mentorMap[s.mentor_email].last_session || new Date(s.created_date) > new Date(mentorMap[s.mentor_email].last_session)) {
            mentorMap[s.mentor_email].last_session = s.created_date;
          }
        }
      });

      const mentorList = Object.values(mentorMap);
      const activeMentors = mentorList.filter(m => {
        if (!m.last_session) return false;
        const daysSince = (Date.now() - new Date(m.last_session).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 30;
      });

      setStats({
        total_mentors: mentorList.length,
        active_mentors: activeMentors.length,
        total_sessions: sessions.length,
        avg_sessions: mentorList.length ? (sessions.length / mentorList.length).toFixed(1) : 0,
      });

      setMentors(mentorList.sort((a, b) => b.sessions_count - a.sessions_count));
      setRecentSessions(sessions.slice(0, 10));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS_CARDS.map(card => (
          <div key={card.id} className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-2xl mb-1">{card.emoji}</p>
            <p className="font-bold text-white text-lg">{stats[card.id] || 0}</p>
            <p className="text-[10px] text-gray-400">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Mentor Activity Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="p-4 border-b border-white/10">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Users size={16} className="text-purple-400" />
            Mentor Activity Overview
          </h3>
        </div>
        {mentors.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No approved mentors yet.</div>
        ) : (
          <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
            {mentors.map(mentor => (
              <div key={mentor.email} className="p-3 flex items-center gap-3 hover:bg-white/5 transition">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', color: '#a855f7' }}>
                  {mentor.name[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{mentor.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{mentor.email}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-bold text-white">{mentor.sessions_count}</p>
                    <p className="text-[10px] text-gray-500">sessions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{timeAgo(mentor.last_session)}</p>
                    <p className="text-[10px] text-gray-600">last active</p>
                  </div>
                  {mentor.sessions_count === 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                      No activity
                    </span>
                  )}
                  {mentor.sessions_count > 0 && mentor.track === 'teen' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }}>
                      🌱 Teen
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="p-4 border-b border-white/10">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <MessageSquare size={16} className="text-pink-400" />
              Recent Mentor Sessions
            </h3>
          </div>
          <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
            {recentSessions.map(session => (
              <div key={session.id} className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(236,72,153,0.2)', border: '1px solid rgba(236,72,153,0.3)' }}>
                  <Calendar size={14} className="text-pink-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    <span className="font-semibold">{session.mentor_name || session.mentor_email?.split('@')[0]}</span>
                    {' → '}
                    <span className="text-gray-400">{session.user_name || session.user_email?.split('@')[0]}</span>
                  </p>
                  {session.notes && <p className="text-[10px] text-gray-500 truncate">{session.notes}</p>}
                </div>
                <p className="text-[10px] text-gray-600 flex-shrink-0">{timeAgo(session.created_date)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Mentors Alert */}
      {mentors.filter(m => m.sessions_count === 0).length > 0 && (
        <div className="p-4 rounded-2xl flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-400 mb-1">Inactive Mentors Detected</p>
            <p className="text-xs text-gray-400">
              {mentors.filter(m => m.sessions_count === 0).length} approved mentor{mentors.filter(m => m.sessions_count === 0).length !== 1 ? 's' : ''} haven't conducted any sessions yet. Consider sending a check-in newsletter.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}