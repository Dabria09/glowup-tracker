import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Search, Users, Plus, MessageCircle, BookOpen, LayoutDashboard, Star } from 'lucide-react';
import AnonymousQuestionModal from '@/components/mentorship/AnonymousQuestionModal';
import MentorDirectory from '@/components/mentorship/MentorDirectory';
import WisdomCard from '@/components/mentorship/WisdomCard';
import MentorDashboard from '@/components/mentorship/MentorDashboard';
import MenteeDashboard from '@/components/mentorship/MenteeDashboard';
import MentorAdminDashboard from '@/components/mentorship/MentorAdminDashboard';
import TeenMentorAdminDashboard from '@/components/mentorship/TeenMentorAdminDashboard';
import MentorMatchingModal from '@/components/mentorship/MentorMatchingModal';
import SessionBookingModal from '@/components/mentorship/SessionBookingModal';
import SuccessStories from '@/components/mentorship/SuccessStories';
import MentorLeaderboard from '@/components/mentorship/MentorLeaderboard';
import ProgramsTab from '@/components/mentorship/ProgramsTab';
import ResourcesTab from '@/components/mentorship/ResourcesTab';

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'career', label: 'Career', emoji: '💼' },
  { id: 'education', label: 'Education', emoji: '🎓' },
  { id: 'business', label: 'Business', emoji: '🚀' },
  { id: 'wellness', label: 'Wellness', emoji: '🌿' },
  { id: 'faith', label: 'Faith', emoji: '🙏' },
  { id: 'relationships', label: 'Relationships', emoji: '💕' },
  { id: 'cooking', label: 'Cooking', emoji: '🍳' },
  { id: 'identity', label: 'Identity', emoji: '🦋' },
  { id: 'purpose', label: 'Find Your Purpose', emoji: '🎯' },
  { id: 'skill-building', label: 'Skill Building', emoji: '🛠️' },
];

const ACTION_BUTTONS = [
  { id: 'find', label: 'Find a Mentor', emoji: '🔍', color: '#ec4899' },
  { id: 'wisdom', label: 'Ms. Glow Wisdom', emoji: '👑', color: '#a855f7' },
  { id: 'ask', label: 'Ask Anonymously', emoji: '💌', color: '#06b6d4' },
  { id: 'become', label: 'Become a Mentor', emoji: '✨', color: '#f59e0b' },
];

export default function Mentorship() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('mentors');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [wisdomQuestions, setWisdomQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMentor, setIsMentor] = useState(false);
  const [isTeenMentor, setIsTeenMentor] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showTeenAdminDashboard, setShowTeenAdminDashboard] = useState(false);
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);

      // Check if user is a mentor
      const mentorData = await base44.entities.Mentor.filter({ user_email: u.email, is_approved: true });
      setIsMentor(mentorData.length > 0);

      // Check if user is a teen mentor
      const teenMentorData = await base44.entities.TeenMentor.filter({ user_email: u.email, is_approved: true });
      setIsTeenMentor(teenMentorData.length > 0);

      const mentorsData = await base44.entities.Mentor.filter({ is_approved: true });
      setMentors(mentorsData);

      const questionsData = await base44.entities.AnonymousQuestion.filter({ 
        status: 'answered',
        is_public: true
      });
      setWisdomQuestions(questionsData.sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0)));

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleBookSession = (mentor) => {
    // TODO: Implement booking flow
    console.log('Booking session with:', mentor);
  };

  const filteredMentors = mentors.filter(mentor => {
    const categories = JSON.parse(mentor.categories || '[]');
    const matchesCategory = activeCategory === 'all' || 
      categories.some(c => c.toLowerCase().includes(activeCategory));
    const matchesSearch = searchQuery === '' || 
      mentor.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-400">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users size={28} />
              Mentorship Hub
            </h1>
            <p className="text-xs text-gray-400">Real women. Real wisdom. Real connections.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => setShowDashboard(true)}
            className="px-4 py-3 rounded-xl font-semibold text-sm text-white transition hover:opacity-80 flex items-center justify-center gap-2"
            style={{ background: isMentor ? 'rgba(236,72,153,0.2)' : 'rgba(59,130,246,0.2)', border: isMentor ? '1px solid rgba(236,72,153,0.4)' : '1px solid rgba(59,130,246,0.4)' }}
          >
            <LayoutDashboard size={16} />
            <span>{isMentor ? 'Mentor Dashboard' : 'Mentee Dashboard'}</span>
          </button>
          <button
            onClick={() => setShowMatchingModal(true)}
            className="px-4 py-3 rounded-xl font-semibold text-sm text-white transition hover:opacity-80 flex items-center justify-center gap-2"
            style={{ background: 'rgba(236,72,153,0.2)', border: '1px solid rgba(236,72,153,0.4)' }}
          >
            <span className="mr-2">🎯</span>Find Match
          </button>
          <button
            onClick={() => setShowQuestionModal(true)}
            className="px-4 py-3 rounded-xl font-semibold text-sm text-white transition hover:opacity-80"
            style={{ background: '#06b6d440', border: '1px solid #06b6d480' }}
          >
            <span className="mr-2">💌</span>Ask Anonymously
          </button>
        </div>
        
        {/* Admin Actions */}
        {user?.role === 'admin' && (
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setShowAdminDashboard(true)}
              className="w-full px-4 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
            >
              <Users size={16} />
              Manage Women Mentor Applications
            </button>
            <button
              onClick={() => setShowTeenAdminDashboard(true)}
              className="w-full px-4 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
            >
              <Star size={16} />
              Manage Teen Mentor Applications
            </button>
            <button
              onClick={async () => {
                try {
                  const res = await base44.functions.invoke('updateMentorTiers', {});
                  alert(res.data.message);
                  loadData();
                } catch (error) {
                  alert('Error updating tiers: ' + error.message);
                }
              }}
              className="w-full px-4 py-3 rounded-xl font-semibold text-sm text-white"
              style={{ background: 'rgba(132, 204, 22, 0.2)', border: '1px solid rgba(132, 204, 22, 0.4)' }}
            >
              🔄 Update Mentor Tiers
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[
            { id: 'mentors', label: 'Find', emoji: '🔍' },
            { id: 'wisdom', label: 'Wisdom', emoji: '👑' },
            { id: 'programs', label: 'Programs', emoji: '📚' },
            { id: 'resources', label: 'Resources', emoji: '🗂️' },
            { id: 'stories', label: 'Stories', emoji: '✨' },
            { id: 'leaderboard', label: 'Top', emoji: '🏆' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 px-3 py-2 rounded-xl font-semibold text-xs transition"
              style={activeTab === tab.id
                ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }
              }
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        ) : activeTab === 'mentors' ? (
          <MentorDirectory mentors={mentors} user={user} />
        ) : activeTab === 'programs' ? (
          <ProgramsTab user={user} />
        ) : activeTab === 'resources' ? (
          <ResourcesTab user={user} />
        ) : activeTab === 'stories' ? (
          <SuccessStories user={user} />
        ) : activeTab === 'leaderboard' ? (
          <MentorLeaderboard />
        ) : (
          wisdomQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-5xl mb-4">👑</div>
              <h2 className="text-xl font-bold text-white mb-2">Wisdom Library</h2>
              <p className="text-sm text-gray-400 text-center mb-4">Anonymous questions answered by our expert mentors.</p>
              <button
                onClick={() => setShowQuestionModal(true)}
                className="px-6 py-3 rounded-full font-semibold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
              >
                <MessageCircle size={16} className="inline mr-2" />
                Ask a Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {wisdomQuestions.map(q => (
                <WisdomCard key={q.id} question={q} user={user} />
              ))}
            </div>
          )
        )}
      </div>

      <BottomNav active="discover" />

      <AnonymousQuestionModal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        user={user}
        onSubmitted={() => {
          loadData();
        }}
      />

      <MentorAdminDashboard
        isOpen={showAdminDashboard}
        onClose={() => setShowAdminDashboard(false)}
      />
      <TeenMentorAdminDashboard
        isOpen={showTeenAdminDashboard}
        onClose={() => setShowTeenAdminDashboard(false)}
      />

      <MentorMatchingModal
        isOpen={showMatchingModal}
        onClose={() => setShowMatchingModal(false)}
        user={user}
        onMatched={(mentor) => {
          setSelectedMentor(mentor);
          setShowMatchingModal(false);
          setShowBookingModal(true);
        }}
      />

      <SessionBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        mentor={selectedMentor}
        user={user}
        onBooked={() => {
          loadData();
        }}
      />
      
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
                <LayoutDashboard size={20} className={isMentor || isTeenMentor ? 'text-pink-400' : 'text-blue-400'} />
                {isMentor ? 'Women Mentor Dashboard' : isTeenMentor ? 'Teen Mentor Dashboard' : 'Mentee Dashboard'}
              </h2>
              <button onClick={() => setShowDashboard(false)}>
                <span className="text-2xl text-gray-400">×</span>
              </button>
            </div>
            {isMentor || isTeenMentor ? (
              <MentorDashboard user={user} />
            ) : (
              <MenteeDashboard user={user} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}