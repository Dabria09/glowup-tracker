import { useState, useEffect } from 'react';
import { Calendar, Clock, Star, Users, MessageCircle, Check, X, TrendingUp, Award, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import TierBadge, { getTierConfig } from './TierBadge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MentorAdminDashboard from './MentorAdminDashboard';

export default function MentorDashboard({ user }) {
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    recentReviews: [],
    ratingTrend: []
  });
  const [sessionSummary, setSessionSummary] = useState({
    totalCompleted: 0,
    totalHours: 0,
    thisMonthCompleted: 0,
    thisMonthHours: 0
  });
  const [sessionStats, setSessionStats] = useState({
    completedSessions: 0,
    totalHours: 0
  });
  const [mentorProfile, setMentorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInsights, setShowInsights] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const mentorData = await base44.entities.Mentor.filter({ user_email: user.email });
      if (mentorData.length > 0) {
        setMentorProfile(mentorData[0]);
      }

      const sessions = await base44.entities.MentorSession.filter({
        mentor_email: user.email,
        status: 'scheduled'
      });
      
      const upcoming = sessions
        .filter(s => new Date(s.session_date) > new Date())
        .sort((a, b) => new Date(a.session_date) - new Date(b.session_date))
        .slice(0, 5);
      setUpcomingSessions(upcoming);

      const allSessions = await base44.entities.MentorSession.filter({
        mentor_email: user.email
      });
      
      const pending = allSessions.filter(s => s.status === 'pending');
      setPendingRequests(pending);

      const completedSessions = allSessions.filter(s => 
        s.status === 'completed'
      );
      
      const ratedSessions = completedSessions.filter(s => s.rating && s.rating > 0);
      const avgRating = ratedSessions.length > 0
        ? ratedSessions.reduce((sum, s) => sum + s.rating, 0) / ratedSessions.length
        : 0;
      
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthSessions = completedSessions.filter(s => new Date(s.session_date) >= thisMonthStart);
      
      const totalHours = completedSessions.reduce((sum, session) => 1, 0);
      const thisMonthHours = thisMonthSessions.reduce((sum, session) => 1, 0);
      
      setSessionSummary({
        totalCompleted: completedSessions.length,
        totalHours: totalHours,
        thisMonthCompleted: thisMonthSessions.length,
        thisMonthHours: thisMonthHours
      });
      
      setSessionStats({
        completedSessions: completedSessions.length,
        totalHours: Math.round(totalHours * 10) / 10
      });
      
      const monthlyRatings = {};
      ratedSessions.forEach(session => {
        const date = new Date(session.session_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyRatings[monthKey]) {
          monthlyRatings[monthKey] = { month: monthKey, total: 0, count: 0 };
        }
        monthlyRatings[monthKey].total += session.rating;
        monthlyRatings[monthKey].count += 1;
      });
      
      const ratingTrend = Object.values(monthlyRatings)
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6)
        .map(data => ({
          month: data.month,
          rating: parseFloat((data.total / data.count).toFixed(2)),
          sessions: data.count
        }));
      
      setFeedbackStats({
        averageRating: avgRating,
        totalReviews: ratedSessions.length,
        recentReviews: ratedSessions.slice(-5).reverse(),
        ratingTrend
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const handleRequestResponse = async (sessionId, accept) => {
    try {
      await base44.entities.MentorSession.update(sessionId, {
        status: accept ? 'scheduled' : 'cancelled'
      });
      loadData();
    } catch (error) {
      console.error('Error updating request:', error);
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
      {/* Welcome & Tier */}
      {mentorProfile && (
        <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(236,72,153,0.3)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Welcome back, {mentorProfile.full_name}!</h2>
              <p className="text-sm text-gray-300 mt-1">{mentorProfile.title || 'Mentor'}</p>
            </div>
            <TierBadge tier={mentorProfile.mentor_tier || 'seed'} size="md" />
          </div>
        </div>
      )}

      {/* Admin: Manage Applications */}
      {user?.role === 'admin' && (
        <button
          onClick={() => setShowAdminDashboard(true)}
          className="w-full mb-6 rounded-2xl p-5 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(236,72,153,0.3)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(236,72,153,0.3)' }}>
              <FileText size={20} className="text-pink-400" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-white">Manage Mentor Applications</h3>
              <p className="text-xs text-gray-400">Review and approve new mentors</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Admin Access</p>
          </div>
        </button>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl p-4 text-center" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.15))', border: '1px solid rgba(34,197,94,0.3)' }}>
          <Check size={20} className="mx-auto mb-2 text-green-400" />
          <p className="text-2xl font-bold text-white">{sessionStats.completedSessions}</p>
          <p className="text-xs text-gray-300">Completed Sessions</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(236,72,153,0.3)' }}>
          <Clock size={20} className="mx-auto mb-2 text-pink-400" />
          <p className="text-2xl font-bold text-white">{sessionStats.totalHours}</p>
          <p className="text-xs text-gray-300">Total Hours</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Calendar size={20} className="mx-auto mb-2 text-pink-400" />
          <p className="text-2xl font-bold text-white">{upcomingSessions.length}</p>
          <p className="text-xs text-gray-400">Upcoming</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Users size={20} className="mx-auto mb-2 text-purple-400" />
          <p className="text-2xl font-bold text-white">{pendingRequests.length}</p>
          <p className="text-xs text-gray-400">Pending</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Star size={20} className="mx-auto mb-2 text-yellow-400" />
          <p className="text-2xl font-bold text-white">{feedbackStats.averageRating.toFixed(1)}</p>
          <p className="text-xs text-gray-400">Rating</p>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-pink-400" />
            Upcoming Sessions
          </h3>
        </div>
        
        {upcomingSessions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar size={40} className="mx-auto mb-3 text-gray-600" />
            <p className="text-sm text-gray-400">No upcoming sessions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map(session => (
              <div key={session.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{session.mentee_email.split('@')[0]}</p>
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

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-purple-400" />
              Pending Requests
            </h3>
            <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(168,85,247,0.2)', color: '#a855f7' }}>
              {pendingRequests.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {pendingRequests.map(request => (
              <div key={request.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{request.mentee_email.split('@')[0]}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(request.session_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(request.session_date)}
                      </span>
                    </div>
                    {request.topic && (
                      <p className="text-xs text-gray-500 mt-2">📝 {request.topic}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequestResponse(request.id, true)}
                    className="flex-1 py-2 rounded-lg font-semibold text-xs text-white flex items-center justify-center gap-1"
                    style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                  >
                    <Check size={14} /> Accept
                  </button>
                  <button
                    onClick={() => handleRequestResponse(request.id, false)}
                    className="flex-1 py-2 rounded-lg font-semibold text-xs text-white flex items-center justify-center gap-1"
                    style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)' }}
                  >
                    <X size={14} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Insights Button */}
      <button
        onClick={() => setShowInsights(true)}
        className="w-full rounded-2xl p-5 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))', border: '1px solid rgba(168,85,247,0.3)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.3)' }}>
            <TrendingUp size={20} className="text-purple-400" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-white">Performance Insights</h3>
            <p className="text-xs text-gray-400">View your mentoring trends and stats</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{sessionSummary.totalHours}h</p>
          <p className="text-xs text-gray-400">Total mentored</p>
        </div>
      </button>

      {/* Recent Feedback */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Star size={18} className="text-yellow-400" />
            Recent Feedback
          </h3>
          {feedbackStats.totalReviews > 0 && (
            <span className="text-xs text-gray-400">{feedbackStats.totalReviews} total reviews</span>
          )}
        </div>
        
        {feedbackStats.recentReviews.length === 0 ? (
          <div className="text-center py-8">
            <Star size={40} className="mx-auto mb-3 text-gray-600" />
            <p className="text-sm text-gray-400">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {feedbackStats.recentReviews.map((review, idx) => (
              <div key={idx} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={12} className={star <= (review.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(review.session_date)}</span>
                </div>
                {review.feedback && (
                  <p className="text-sm text-gray-300">"{review.feedback}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Insights Modal */}
      {showInsights && (
        <div
          className="fixed inset-0 z-[100] flex items-end"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowInsights(false)}
        >
          <div
            className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6"
            style={{ background: '#1a0a30' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-white text-lg flex items-center gap-2">
                <TrendingUp size={20} className="text-purple-400" />
                Performance Insights
              </h2>
              <button onClick={() => setShowInsights(false)}>
                <span className="text-2xl text-gray-400">×</span>
              </button>
            </div>

            {/* Session Summary */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-2xl p-4" style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Award size={18} className="text-pink-400" />
                  <p className="text-xs text-gray-400">Total Completed</p>
                </div>
                <p className="text-3xl font-bold text-white">{sessionSummary.totalCompleted}</p>
                <p className="text-xs text-gray-500 mt-1">{sessionSummary.thisMonthCompleted} this month</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={18} className="text-purple-400" />
                  <p className="text-xs text-gray-400">Total Hours</p>
                </div>
                <p className="text-3xl font-bold text-white">{sessionSummary.totalHours}h</p>
                <p className="text-xs text-gray-500 mt-1">{sessionSummary.thisMonthHours}h this month</p>
              </div>
            </div>

            {/* Rating Trend Chart */}
            <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-yellow-400" />
                Rating Trends (Last 6 Months)
              </h3>
              {feedbackStats.ratingTrend.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={feedbackStats.ratingTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#6b7280" 
                        fontSize={10}
                        tickFormatter={(month) => month.slice(5)}
                      />
                      <YAxis 
                        stroke="#6b7280" 
                        fontSize={10}
                        domain={[0, 5]}
                        tickCount={6}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(20, 10, 40, 0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        labelStyle={{ color: '#ec4899', marginBottom: '4px' }}
                        formatter={(value, name) => [value, name === 'rating' ? 'Average Rating' : 'Sessions']}
                      />
                      <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="#ec4899"
                        strokeWidth={2}
                        dot={{ fill: '#ec4899', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-10">
                  <TrendingUp size={40} className="mx-auto mb-3 text-gray-600" />
                  <p className="text-sm text-gray-400">Not enough data yet</p>
                </div>
              )}
            </div>

            {/* All Time Stats */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-bold text-white mb-4">All-Time Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Sessions Completed</span>
                  <span className="text-lg font-bold text-white">{sessionSummary.totalCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Hours Mentored</span>
                  <span className="text-lg font-bold text-white">{sessionSummary.totalHours}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Average Rating</span>
                  <div className="flex items-center gap-2">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-bold text-white">{feedbackStats.averageRating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Reviews</span>
                  <span className="text-lg font-bold text-white">{feedbackStats.totalReviews}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <MentorAdminDashboard
        isOpen={showAdminDashboard}
        onClose={() => setShowAdminDashboard(false)}
      />
    </div>
  );
}