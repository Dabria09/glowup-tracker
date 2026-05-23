import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Search, Users, Plus, MessageCircle, BookOpen } from 'lucide-react';
import MentorApplicationModal from '@/components/mentorship/MentorApplicationModal';
import AnonymousQuestionModal from '@/components/mentorship/AnonymousQuestionModal';
import MentorDirectory from '@/components/mentorship/MentorDirectory';
import WisdomCard from '@/components/mentorship/WisdomCard';

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'career', label: 'Career', emoji: '💼' },
  { id: 'education', label: 'Education', emoji: '🎓' },
  { id: 'business', label: 'Business', emoji: '🚀' },
  { id: 'wellness', label: 'Wellness', emoji: '🌿' },
  { id: 'faith', label: 'Faith', emoji: '🙏' },
  { id: 'relationships', label: 'Relationships', emoji: '💕' },
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
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [wisdomQuestions, setWisdomQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);

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
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setShowQuestionModal(true)}
            className="px-4 py-3 rounded-xl font-semibold text-sm text-white transition hover:opacity-80"
            style={{ background: '#06b6d440', border: '1px solid #06b6d480' }}
          >
            <span className="mr-2">💌</span>Ask Anonymously
          </button>
          <button
            onClick={() => setShowApplicationModal(true)}
            className="px-4 py-3 rounded-xl font-semibold text-sm text-white transition hover:opacity-80"
            style={{ background: '#f59e0b40', border: '1px solid #f59e0b80' }}
          >
            <span className="mr-2">✨</span>Become a Mentor
          </button>
        </div>

        {/* Tier Info Banner */}
        {user?.role === 'admin' && (
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
            className="w-full mb-6 px-4 py-3 rounded-xl font-semibold text-sm text-white"
            style={{ background: 'rgba(132, 204, 22, 0.2)', border: '1px solid rgba(132, 204, 22, 0.4)' }}
          >
            🔄 Update Mentor Tiers
          </button>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('mentors')}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === 'mentors'
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            style={
              activeTab === 'mentors'
                ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
            }
          >
            <span className="mr-2">🔍</span>Find a Mentor
          </button>
          <button
            onClick={() => setActiveTab('wisdom')}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === 'wisdom'
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            style={
              activeTab === 'wisdom'
                ? { background: 'linear-gradient(135deg, #a855f7, #ec4899)' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
            }
          >
            <span className="mr-2">👑</span>Ms. Glow Wisdom
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        ) : activeTab === 'mentors' ? (
          <MentorDirectory mentors={mentors} user={user} />
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

      <MentorApplicationModal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        user={user}
        onSubmitted={() => {
          loadData();
        }}
      />
      <AnonymousQuestionModal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        user={user}
        onSubmitted={() => {
          loadData();
        }}
      />
    </div>
  );
}