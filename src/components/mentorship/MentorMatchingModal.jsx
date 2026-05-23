import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Heart, Sparkles, Users, Filter } from 'lucide-react';

export default function MentorMatchingModal({ isOpen, onClose, user, onMatched }) {
  const [mentors, setMentors] = useState([]);
  const [preferences, setPreferences] = useState({
    categories: [],
    availability: '',
    session_type: '',
    min_experience: 0,
  });
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [showPreferences, setShowPreferences] = useState(false);

  const CATEGORIES = ['Career', 'Education', 'Business', 'Wellness', 'Faith', 'Relationships', 'Cooking', 'Identity', 'Find Your Purpose', 'Skill Building'];
  const AVAILABILITY = ['Weekly', 'Bi-weekly', 'Monthly', 'One-time'];
  const SESSION_TYPES = ['Video Call', 'Phone Call', 'Chat', 'In-person'];

  useEffect(() => {
    if (isOpen) {
      loadMentors();
    }
  }, [isOpen]);

  const loadMentors = async () => {
    try {
      const mentorsData = await base44.entities.Mentor.filter({ is_approved: true });
      setMentors(mentorsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading mentors:', error);
      setLoading(false);
    }
  };

  const calculateMatchScore = (mentor) => {
    let score = 0;
    const mentorCategories = JSON.parse(mentor.categories || '[]');
    
    // Category match (40 points)
    const matchingCategories = preferences.categories.filter(cat => 
      mentorCategories.includes(cat)
    );
    score += (matchingCategories.length / Math.max(preferences.categories.length, 1)) * 40;
    
    // Availability match (20 points)
    if (preferences.availability && mentor.availability === preferences.availability) {
      score += 20;
    }
    
    // Session type match (20 points)
    if (preferences.session_type && mentor.session_type === preferences.session_type) {
      score += 20;
    }
    
    // Experience bonus (20 points)
    if (mentor.experience_years >= preferences.min_experience) {
      score += 20;
    } else if (mentor.experience_years >= preferences.min_experience * 0.7) {
      score += 10;
    }
    
    // Rating bonus
    if (mentor.rating >= 4.5) score += 10;
    if (mentor.sessions_count >= 10) score += 5;
    
    return Math.min(Math.round(score), 100);
  };

  const findMatches = () => {
    setMatching(true);
    
    const scoredMentors = mentors.map(mentor => ({
      ...mentor,
      match_score: calculateMatchScore(mentor),
    }));
    
    const sorted = scoredMentors
      .filter(m => m.match_score > 0)
      .sort((a, b) => b.match_score - a.match_score);
    
    setMatches(sorted);
    setMatching(false);
    setShowPreferences(false);
  };

  const toggleCategory = (cat) => {
    setPreferences(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-400" />
            Find Your Perfect Mentor
          </h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        {!showPreferences && matches.length === 0 && !loading && (
          <div className="text-center py-10">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-white mb-2">Let's Find Your Match</h3>
            <p className="text-sm text-gray-400 mb-6">Tell us what you're looking for and we'll find the perfect mentor for you.</p>
            <button
              onClick={() => setShowPreferences(true)}
              className="px-8 py-4 rounded-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
            >
              <Heart size={20} className="inline mr-2" />
              Set Preferences
            </button>
          </div>
        )}

        {showPreferences && (
          <div className="space-y-6">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-bold text-white text-sm mb-3">What areas do you need help with? *</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                      preferences.categories.includes(cat)
                        ? 'text-white'
                        : 'text-gray-400 bg-gray-800'
                    }`}
                    style={preferences.categories.includes(cat) ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' } : {}}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-bold text-white text-sm mb-3">How often do you want to meet?</h3>
              <div className="flex flex-wrap gap-2">
                {AVAILABILITY.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setPreferences(prev => ({ ...prev, availability: prev.availability === opt ? '' : opt }))}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                      preferences.availability === opt
                        ? 'text-white'
                        : 'text-gray-400 bg-gray-800'
                    }`}
                    style={preferences.availability === opt ? { background: 'linear-gradient(135deg, #3b82f6, #2563eb)' } : {}}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-bold text-white text-sm mb-3">Preferred session type</h3>
              <div className="flex flex-wrap gap-2">
                {SESSION_TYPES.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setPreferences(prev => ({ ...prev, session_type: prev.session_type === opt ? '' : opt }))}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                      preferences.session_type === opt
                        ? 'text-white'
                        : 'text-gray-400 bg-gray-800'
                    }`}
                    style={preferences.session_type === opt ? { background: 'linear-gradient(135deg, #06b6d4, #0891b2)' } : {}}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-bold text-white text-sm mb-3">Minimum years of experience</h3>
              <input
                type="range"
                min="0"
                max="20"
                value={preferences.min_experience}
                onChange={(e) => setPreferences(prev => ({ ...prev, min_experience: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Any</span>
                <span className="text-white font-bold">{preferences.min_experience}+ years</span>
                <span>20+</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPreferences(false)}
                className="flex-1 py-3 rounded-xl font-bold text-white"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                Back
              </button>
              <button
                onClick={findMatches}
                disabled={preferences.categories.length === 0 || matching}
                className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
              >
                {matching ? 'Finding Matches...' : 'Find My Matches'}
              </button>
            </div>
          </div>
        )}

        {matches.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Your Top Matches</h3>
              <button
                onClick={() => setShowPreferences(true)}
                className="text-xs text-pink-400 flex items-center gap-1"
              >
                <Filter size={12} /> Adjust Preferences
              </button>
            </div>

            {matches.slice(0, 10).map((mentor, idx) => {
              const score = mentor.match_score;
              return (
                <div
                  key={mentor.id}
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden"
                        style={{ background: mentor.avatar_url ? 'transparent' : 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                        {mentor.avatar_url ? (
                          <img src={mentor.avatar_url} alt={mentor.full_name} className="w-full h-full object-cover" />
                        ) : (
                          mentor.full_name?.charAt(0) || 'M'
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ 
                          background: score >= 80 ? 'linear-gradient(135deg, #22c55e, #16a34a)' : score >= 60 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #2563eb)'
                        }}>
                        {score}%
                      </div>
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

                      {mentor.bio && <p className="text-xs text-gray-300 mt-2 line-clamp-2">{mentor.bio}</p>}

                      <div className="flex flex-wrap gap-2 mt-2">
                        {JSON.parse(mentor.categories || '[]').slice(0, 3).map((cat, i) => (
                          <span key={i} className="px-2 py-1 rounded-full text-xs"
                            style={{ background: 'rgba(236,72,153,0.2)', color: '#ec4899' }}>
                            {cat}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        {mentor.experience_years && <span>{mentor.experience_years}+ years</span>}
                        {mentor.sessions_count > 0 ? (
                          <span className="flex items-center gap-1">
                            <span className="text-yellow-400">⭐</span>
                            {mentor.rating?.toFixed(1) || '5.0'} ({mentor.sessions_count})
                          </span>
                        ) : (
                          <span className="text-green-400">✓ Available</span>
                        )}
                      </div>

                      <button
                        onClick={() => onMatched(mentor)}
                        className="w-full mt-3 py-2.5 rounded-xl font-semibold text-sm text-white"
                        style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {loading && (
          <div className="text-center py-10">
            <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-400 text-sm">Loading mentors...</p>
          </div>
        )}
      </div>
    </div>
  );
}