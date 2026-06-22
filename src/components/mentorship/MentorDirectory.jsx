import { useState } from 'react';
import { Search, Star, Video, Phone, MessageCircle, MapPin, Award } from 'lucide-react';
import ConnectionRequestModal from './ConnectionRequestModal';
import ChatModal from './ChatModal';
import ReviewsSection from './ReviewsSection';
import BadgesSection from './BadgesSection';

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'career', label: 'Career', emoji: '💼' },
  { id: 'education', label: 'Education', emoji: '🎓' },
  { id: 'business', label: 'Business', emoji: '🚀' },
  { id: 'wellness', label: 'Wellness', emoji: '🌿' },
  { id: 'faith', label: 'Faith', emoji: '🙏' },
  { id: 'relationships', label: 'Relationships', emoji: '💕' },
];

const sessionTypeIcons = {
  'Video Call': Video,
  'Phone Call': Phone,
  'Chat': MessageCircle,
  'In-person': MapPin,
};

export default function MentorDirectory({ mentors, user }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showBadges, setShowBadges] = useState(false);

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

  const handleBookSession = (mentor) => {
    setSelectedMentor(mentor);
    setShowRequestModal(true);
  };

  const handleStartChat = (mentor) => {
    setSelectedMentor(mentor);
    setShowChatModal(true);
  };

  const handleViewReviews = (mentor) => {
    setSelectedMentor(mentor);
    setShowReviews(true);
  };

  const handleViewBadges = (mentor) => {
    setSelectedMentor(mentor);
    setShowBadges(true);
  };

  return (
    <>
      {/* Category Filters */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition ${
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
              {cat.emoji} {cat.label}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, title, or expertise..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-white outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      </div>

      {/* Mentors Grid */}
      {filteredMentors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-white mb-2">No Mentors Found</h2>
          <p className="text-sm text-gray-400 text-center">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMentors.map(mentor => {
            const categories = JSON.parse(mentor.categories || '[]');
            const SessionIcon = sessionTypeIcons[mentor.session_type] || Video;
            
            return (
              <div key={mentor.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden"
                    style={{ background: mentor.avatar_url ? 'transparent' : 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                    {mentor.avatar_url ? (
                      <img src={mentor.avatar_url} alt={mentor.full_name} className="w-full h-full object-cover" />
                    ) : (
                      mentor.full_name?.charAt(0) || 'M'
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-white">{mentor.full_name}</h3>
                        {mentor.title && <p className="text-xs text-gray-400">{mentor.title}</p>}
                      </div>
                      {mentor.is_featured && (
                        <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                          👑 Ms. Glow
                        </span>
                      )}
                    </div>

                    {mentor.bio && (
                      <p className="text-xs text-gray-300 mt-2 line-clamp-3">{mentor.bio}</p>
                    )}
                    {mentor.expertise && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2"><span className="font-semibold">Expertise:</span> {mentor.expertise}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3">
                      {categories.slice(0, 3).map((cat, i) => (
                        <span key={i} className="px-2 py-1 rounded-full text-xs"
                          style={{ background: 'rgba(236,72,153,0.2)', color: '#ec4899' }}>
                          {cat}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      {mentor.experience_years && (
                        <span>{mentor.experience_years}+ years exp</span>
                      )}
                      {mentor.sessions_count > 0 ? (
                        <span className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-400 fill-yellow-400" />
                          {mentor.rating?.toFixed(1) || '5.0'} ({mentor.sessions_count} sessions)
                        </span>
                      ) : (
                        <span className="text-green-400">✓ Available</span>
                      )}
                      <span className="flex items-center gap-1">
                        <SessionIcon size={12} />
                        {mentor.session_type || 'Video'}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleViewReviews(mentor)}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                      >
                        <Star size={14} /> Reviews
                      </button>
                      <button
                        onClick={() => handleViewBadges(mentor)}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
                        style={{ background: 'rgba(255,205,50,0.12)', border: '1px solid rgba(255,205,50,0.3)' }}
                      >
                        <Award size={14} /> Badges
                      </button>
                      <button
                        onClick={() => handleStartChat(mentor)}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                      >
                        <MessageCircle size={14} /> Chat
                      </button>
                      <button
                        onClick={() => handleBookSession(mentor)}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white"
                        style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
                      >
                        🔗 Request
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConnectionRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        mentor={selectedMentor}
        user={user}
        onSubmitted={() => {
          // Refresh data or show success message
        }}
      />
      <ChatModal
        isOpen={showChatModal}
        onClose={() => {
          setShowChatModal(false);
          setSelectedMentor(null);
        }}
        user={user}
        mentor={selectedMentor}
      />
      {showReviews && selectedMentor && (
        <div
          className="fixed inset-0 z-[100] flex items-end"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowReviews(false)}
        >
          <div
            className="w-full max-h-[80vh] overflow-y-auto rounded-t-3xl p-6"
            style={{ background: '#1a0a30' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white text-lg">⭐ Reviews for {selectedMentor.full_name}</h2>
              <button onClick={() => setShowReviews(false)}>
                <span className="text-2xl text-gray-400">×</span>
              </button>
            </div>
            <ReviewsSection
              mentor={selectedMentor}
              user={user}
              onReviewSubmitted={() => {}}
            />
          </div>
        </div>
      )}
      {showBadges && selectedMentor && (
        <div
          className="fixed inset-0 z-[100] flex items-end"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowBadges(false)}
        >
          <div
            className="w-full max-h-[80vh] overflow-y-auto rounded-t-3xl p-6"
            style={{ background: '#1a0a30' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white text-lg">🏅 Badges for {selectedMentor.full_name}</h2>
              <button onClick={() => setShowBadges(false)}>
                <span className="text-2xl text-gray-400">×</span>
              </button>
            </div>
            <BadgesSection mentorEmail={selectedMentor.user_email} isMentor={false} />
          </div>
        </div>
      )}
    </>
  );
}