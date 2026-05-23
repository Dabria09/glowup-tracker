import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Search, Users } from 'lucide-react';

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
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
          {ACTION_BUTTONS.map(btn => (
            <button
              key={btn.id}
              className="px-4 py-3 rounded-xl font-semibold text-sm text-white transition hover:opacity-80"
              style={{ background: `${btn.color}40`, border: `1px solid ${btn.color}80` }}
            >
              <span className="mr-2">{btn.emoji}</span>{btn.label}
            </button>
          ))}
        </div>

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
            placeholder="Search mentors..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-5xl mb-4 animate-bounce">✨</div>
          <h2 className="text-xl font-bold text-white mb-2">Mentors Coming Soon</h2>
          <p className="text-sm text-gray-400 text-center">We're reviewing applications now. Check back soon!</p>
        </div>
      </div>

      <BottomNav active="discover" />
    </div>
  );
}