import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, CheckCircle, Clock, TrendingUp, Users, Award, Search, Filter, Star, Heart } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import UserAvatarDisplay from '@/components/UserAvatarDisplay';
import MenteeDashboard from './MenteeDashboard';

const CATEGORIES = ['All', 'Career', 'Education', 'Business', 'Wellness', 'Faith', 'Relationships'];
const STATUS_FILTERS = [
  { id: 'all', label: 'All', icon: MessageCircle },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'answered', label: 'Answered', icon: CheckCircle },
];

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [stats, setStats] = useState({
    total_questions: 0,
    pending: 0,
    answered: 0,
    helpful_count: 0,
    sessions_completed: 0,
    rating: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Load mentor profile (check both Mentor and TeenMentor entities)
        const mentors = await base44.entities.Mentor.filter({ user_email: currentUser.email });
        if (mentors.length > 0) {
          setProfile(mentors[0]);
        } else {
          const teenMentors = await base44.entities.TeenMentor.filter({ user_email: currentUser.email });
          if (teenMentors.length > 0) {
            setProfile(teenMentors[0]);
          }
        }

        // Load anonymous questions (assigned to this mentor OR unassigned if mentor wants to claim)
        const allQuestions = await base44.entities.AnonymousQuestion.list('-submitted_date', 100);
        
        // Filter: show questions assigned to this mentor OR unassigned pending questions
        const mentorQuestions = allQuestions.filter(q => 
          (q.assigned_mentor_email === currentUser.email) || 
          (q.status === 'pending' && !q.assigned_mentor_email)
        );
        
        setQuestions(mentorQuestions);

        // Calculate stats (include both Mentor and TeenMentor sessions)
        const assignedQuestions = allQuestions.filter(q => q.assigned_mentor_email === currentUser.email);
        const statsData = {
          total_questions: assignedQuestions.length,
          pending: assignedQuestions.filter(q => q.status === 'pending').length,
          answered: assignedQuestions.filter(q => q.status === 'answered').length,
          helpful_count: assignedQuestions.reduce((sum, q) => sum + (q.helpful_count || 0), 0),
          sessions_completed: 0, // Would need to load from SessionReport entity
          rating: 0, // Would need to calculate from reviews
        };
        setStats(statsData);

      } catch (error) {
        console.error('Error loading mentor dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredQuestions = questions.filter(q => {
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && q.status === 'pending') ||
      (statusFilter === 'answered' && q.status === 'answered');
    const matchesSearch = searchQuery === '' || 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleClaimQuestion = async (question) => {
    try {
      await base44.entities.AnonymousQuestion.update(question.id, {
        assigned_mentor_email: user.email,
        status: 'pending',
      });
      // Refresh questions
      const allQuestions = await base44.entities.AnonymousQuestion.list('-submitted_date', 100);
      const mentorQuestions = allQuestions.filter(q => 
        (q.assigned_mentor_email === user.email) || 
        (q.status === 'pending' && !q.assigned_mentor_email)
      );
      setQuestions(mentorQuestions);
    } catch (error) {
      console.error('Error claiming question:', error);
    }
  };

  const handleRespond = (question) => {
    setSelectedQuestion(question);
    setShowResponseModal(true);
  };

  const handleResponseSubmitted = async () => {
    // Refresh questions after response
    const allQuestions = await base44.entities.AnonymousQuestion.list('-submitted_date', 100);
    const mentorQuestions = allQuestions.filter(q => 
      (q.assigned_mentor_email === user.email) || 
      (q.status === 'pending' && !q.assigned_mentor_email)
    );
    setQuestions(mentorQuestions);
    setShowResponseModal(false);
    setSelectedQuestion(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08060e' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'rgba(232,82,109,0.2)', borderTopColor: '#ec4899' }}></div>
          <p className="text-gray-400">Loading your mentor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pb-24" style={{ background: '#08060e' }}>
      {/* Header */}
      <div className="px-5 pt-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Mentor Dashboard 👩‍🏫</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate('/mentorship')} className="text-sm text-pink-400 font-semibold">
              Hub
            </button>
            <button onClick={() => setShowDashboard(true)} className="text-sm text-blue-400 font-semibold">
              Find My Mentor
            </button>
          </div>
        </div>

        {/* Mentor Profile Card */}
        {profile && (
          <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-3">
              <UserAvatarDisplay profile={profile} size={48} fallback={profile.full_name?.charAt(0) || 'M'} />
              <div className="flex-1">
                <h2 className="font-bold text-white">{profile.full_name}</h2>
                {profile.title && <p className="text-xs text-gray-400">{profile.title}</p>}
                {profile.grade && <p className="text-xs text-gray-400">Grade {profile.grade}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-green-400">✓ Active {profile.grade ? 'Teen ' : ''}Mentor</span>
                  {profile.is_featured && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                      👑 Ms. Glow
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl p-3" style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)' }}>
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle size={16} className="text-pink-400" />
              <span className="text-xs text-gray-400">Questions</span>
            </div>
            <p className="text-2xl font-bold">{stats.total_questions}</p>
          </div>
          <div className="rounded-2xl p-3" style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-cyan-400" />
              <span className="text-xs text-gray-400">Pending</span>
            </div>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </div>
          <div className="rounded-2xl p-3" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-xs text-gray-400">Answered</span>
            </div>
            <p className="text-2xl font-bold">{stats.answered}</p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl p-3" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Heart size={16} className="text-yellow-400" />
              <span className="text-xs text-gray-400">Helpful Votes</span>
            </div>
            <p className="text-xl font-bold">{stats.helpful_count}</p>
          </div>
          <div className="rounded-2xl p-3" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Star size={16} className="text-purple-400" />
              <span className="text-xs text-gray-400">Rating</span>
            </div>
            <p className="text-xl font-bold">{stats.rating > 0 ? stats.rating.toFixed(1) : 'New'}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 mb-4">
        {/* Status Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {STATUS_FILTERS.map(filter => {
            const Icon = filter.icon;
            const isActive = statusFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                style={
                  isActive
                    ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' }
                    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                <Icon size={14} />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                style={
                  isActive
                    ? { background: 'rgba(236,72,153,0.3)', border: '1px solid rgba(236,72,153,0.5)' }
                    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="px-5 pb-6">
        <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-widest">
          {statusFilter === 'all' ? 'All Questions' : statusFilter === 'pending' ? 'Pending Questions' : 'Answered Questions'}
          {filteredQuestions.length > 0 && ` (${filteredQuestions.length})`}
        </h3>

        {filteredQuestions.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-lg font-bold text-white mb-2">No Questions Found</h2>
            <p className="text-sm text-gray-400">
              {statusFilter === 'pending' ? 'All caught up! No pending questions.' : 'No questions match your filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuestions.map(q => {
              const isAssigned = q.assigned_mentor_email === user?.email;
              const isPending = q.status === 'pending';
              
              return (
                <div
                  key={q.id}
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${isAssigned ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.1)'}` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(6,182,212,0.2)', color: '#06b6d4' }}>
                      {q.category}
                    </span>
                    {q.helpful_count > 0 && (
                      <span className="flex items-center gap-1 text-xs text-yellow-400">
                        <Heart size={12} className="fill-yellow-400" />
                        {q.helpful_count}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-white mb-3">{q.question}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Clock size={12} />
                    {new Date(q.submitted_date).toLocaleDateString()}
                    {isAssigned && (
                      <span className="ml-auto text-pink-400 font-semibold">Assigned to you</span>
                    )}
                  </div>

                  {q.answer ? (
                    <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                      <p className="text-sm text-green-400">{q.answer}</p>
                    </div>
                  ) : null}

                  <div className="flex gap-2">
                    {isAssigned ? (
                      q.status === 'pending' ? (
                        <button
                          onClick={() => handleRespond(q)}
                          className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white"
                          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
                        >
                          ✍️ Respond
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRespond(q)}
                          className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white"
                          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                        >
                          ✓ Edit Response
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => handleClaimQuestion(q)}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white"
                        style={{ background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.4)' }}
                      >
                        🙋 Claim Question
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedQuestion(q);
                        setShowResponseModal(true);
                      }}
                      className="px-4 py-2.5 rounded-xl font-semibold text-sm text-white"
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                      👁️ View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav active="connect" />

      {/* Mentee Dashboard Modal */}
      {showDashboard && (
        <div
          className="fixed inset-0 z-[100] flex items-end"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowDashboard(false)}
        >
          <div
            className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6"
            style={{ background: '#1a0a30' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-white text-lg flex items-center gap-2">
                <Users size={20} className="text-blue-400" />
                Find My Mentor
              </h2>
              <button onClick={() => setShowDashboard(false)}>
                <span className="text-2xl text-gray-400">×</span>
              </button>
            </div>
            <MenteeDashboard user={user} />
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedQuestion && (
        <ResponseModal
          question={selectedQuestion}
          onClose={() => {
            setShowResponseModal(false);
            setSelectedQuestion(null);
          }}
          onResponseSubmitted={handleResponseSubmitted}
          user={user}
        />
      )}
    </div>
  );
}

// Response Modal Component
function ResponseModal({ question, onClose, onResponseSubmitted, user }) {
  const [response, setResponse] = useState(question.answer || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!response.trim()) return;

    try {
      setLoading(true);
      await base44.entities.AnonymousQuestion.update(question.id, {
        answer: response.trim(),
        status: 'answered',
        answered_date: new Date().toISOString(),
        assigned_mentor_email: user.email,
      });
      onResponseSubmitted();
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-lg">
            {question.answer ? '✏️ Edit Response' : '✍️ Respond to Question'}
          </h2>
          <button onClick={onClose}><span className="text-2xl text-gray-400">×</span></button>
        </div>

        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)' }}>
          <p className="text-xs text-gray-400 mb-1">Category</p>
          <p className="text-sm font-semibold text-cyan-400">{question.category}</p>
        </div>

        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-xs text-gray-400 mb-1">Question</p>
          <p className="text-sm text-white">{question.question}</p>
        </div>

        <div className="mb-4">
          <label className="text-xs font-bold text-gray-400 mb-2 block">Your Response *</label>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Share your wisdom and guidance..."
            className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            rows={6}
          />
          <p className="text-xs text-gray-500 mt-1">{response.length}/1000</p>
        </div>

        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)' }}>
          <p className="text-xs text-gray-300">
            💡 Your response will be posted anonymously. The student will only see your answer, not your identity.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!response.trim() || loading}
          className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
        >
          {loading ? 'Submitting...' : question.answer ? 'Update Response' : 'Submit Response'}
        </button>
      </div>
    </div>
  );
}