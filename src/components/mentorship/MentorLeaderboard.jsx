import { useState, useEffect } from 'react';
import { Trophy, Star, Crown, Medal } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MentorLeaderboard() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const allMentors = await base44.entities.Mentor.filter({ is_approved: true });
      
      const ranked = allMentors.map(mentor => ({
        ...mentor,
        score: (mentor.sessions_count || 0) * 10 + (mentor.rating || 0) * 20 + (mentor.mentor_tier === 'luminary' ? 100 : mentor.mentor_tier === 'radiant' ? 50 : mentor.mentor_tier === 'bloom' ? 25 : mentor.mentor_tier === 'sprout' ? 10 : 0)
      })).sort((a, b) => b.score - a.score);

      setMentors(ranked);
      setLoading(false);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLoading(false);
    }
  };

  const getTierIcon = (tier) => {
    switch(tier) {
      case 'luminary': return <Crown size={16} className="text-purple-400" />;
      case 'radiant': return <Star size={16} className="text-yellow-400" />;
      case 'bloom': return <Medal size={16} className="text-pink-400" />;
      default: return <Trophy size={16} className="text-gray-400" />;
    }
  };

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const filteredMentors = filter === 'all' ? mentors : mentors.filter(m => m.mentor_tier === filter);

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Trophy size={18} className="text-yellow-400" />
          Top Mentors
        </h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-xs rounded-lg px-2 py-1 text-white outline-none"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <option value="all">All Tiers</option>
          <option value="luminary">Luminary</option>
          <option value="radiant">Radiant</option>
          <option value="bloom">Bloom</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        </div>
      ) : filteredMentors.length === 0 ? (
        <div className="text-center py-10">
          <Trophy size={40} className="mx-auto mb-3 text-gray-600" />
          <p className="text-sm text-gray-400">No mentors yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMentors.slice(0, 10).map((mentor, idx) => (
            <div
              key={mentor.id}
              className="rounded-xl p-4 flex items-center gap-4"
              style={{
                background: idx < 3 ? 'rgba(255,215,0,0.05)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${idx < 3 ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.06)'}`
              }}
            >
              <div className="text-2xl font-bold w-8 text-center">
                {getRankEmoji(idx + 1)}
              </div>
              
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                {mentor.avatar_url ? (
                  <img src={mentor.avatar_url} alt={mentor.full_name} className="w-full h-full object-cover" />
                ) : (
                  mentor.full_name.charAt(0)
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white truncate">{mentor.full_name}</p>
                  {getTierIcon(mentor.mentor_tier)}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                    {mentor.rating?.toFixed(1) || '0.0'}
                  </span>
                  <span>{mentor.sessions_count || 0} sessions</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold text-pink-400">{Math.round(mentor.score)} pts</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}