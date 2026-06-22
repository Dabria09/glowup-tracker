import { useState, useEffect } from 'react';
import { Star, Award, Trophy, Medal, TrendingUp, Users, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const BADGE_CONFIG = {
  first_session: { name: 'First Steps', icon: '🌱', tier: 'bronze', description: 'Completed your first session' },
  five_sessions: { name: 'Getting Started', icon: '🌿', tier: 'bronze', description: 'Completed 5 sessions' },
  ten_sessions: { name: 'Dedicated', icon: '🌸', tier: 'silver', description: 'Completed 10 sessions' },
  twenty_sessions: { name: 'Committed', icon: '✨', tier: 'silver', description: 'Completed 20 sessions' },
  fifty_sessions: { name: 'Legendary', icon: '👑', tier: 'gold', description: 'Completed 50 sessions' },
  perfect_rating: { name: 'Perfectionist', icon: '💯', tier: 'gold', description: 'Maintained 5.0 rating for 10+ sessions' },
  super_mentor: { name: 'Super Mentor', icon: '🦸', tier: 'platinum', description: '100+ sessions with 4.8+ rating' },
  early_adopter: { name: 'Early Adopter', icon: '🚀', tier: 'bronze', description: 'Joined mentorship program in first month' },
  helper: { name: 'Helper', icon: '🤝', tier: 'bronze', description: 'Helped 5+ different mentees' },
  wisdom_keeper: { name: 'Wisdom Keeper', icon: '📚', tier: 'silver', description: 'Shared 20+ resources' },
  community_pillar: { name: 'Community Pillar', icon: '🏛️', tier: 'gold', description: 'Mentored 20+ different mentees' },
  mentor_champion: { name: 'Mentor Champion', icon: '🏆', tier: 'gold', description: '10+ sessions with 4.5+ rating' },
  top_responder: { name: 'Top Responder', icon: '⚡', tier: 'silver', description: 'Consistently quick responses' },
};

export default function BadgesSection({ user, isMentor, mentorEmail }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const targetEmail = mentorEmail || user?.email;
      if (!targetEmail) { setLoading(false); return; }
      const userBadges = await base44.entities.MentorshipBadge.filter({ user_email: targetEmail });
      setBadges(userBadges);
      setLoading(false);
    } catch (error) {
      console.error('Error loading badges:', error);
      setLoading(false);
    }
  };

  const getTierColor = (tier) => {
    switch(tier) {
      case 'bronze': return { bg: 'rgba(205,127,50,0.2)', border: 'rgba(205,127,50,0.4)', text: '#cd7f32' };
      case 'silver': return { bg: 'rgba(192,192,192,0.2)', border: 'rgba(192,192,192,0.4)', text: '#c0c0c0' };
      case 'gold': return { bg: 'rgba(255,215,0,0.2)', border: 'rgba(255,215,0,0.4)', text: '#ffd700' };
      case 'platinum': return { bg: 'rgba(224,224,224,0.2)', border: 'rgba(224,224,224,0.4)', text: '#e0e0e0' };
      default: return { bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.2)', text: '#ffffff' };
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-400 text-sm">Loading badges...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Award size={18} className="text-yellow-400" />
          {isMentor ? 'Your Badges' : 'Achievement Badges'}
        </h3>
        <span className="text-xs text-gray-400">{badges.length} earned</span>
      </div>

      {badges.length === 0 ? (
        <div className="text-center py-8">
          <Award size={40} className="mx-auto mb-3 text-gray-600" />
          <p className="text-sm text-gray-400 mb-2">{isMentor ? 'No badges earned yet' : 'No badges yet'}</p>
          <p className="text-xs text-gray-500">{isMentor ? 'Complete sessions and achieve milestones to earn badges!' : 'This mentor will earn badges as they reach milestones.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {badges.map(badge => {
            const colors = getTierColor(badge.badge_tier);
            return (
              <div
                key={badge.id}
                className="rounded-xl p-3 text-center"
                style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
              >
                <div className="text-3xl mb-1">{badge.badge_icon}</div>
                <p className="text-xs font-bold" style={{ color: colors.text }}>{badge.badge_name}</p>
                <p className="text-[10px] text-gray-400 mt-1">{new Date(badge.earned_date).toLocaleDateString()}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}