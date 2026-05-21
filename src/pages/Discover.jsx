import { useState } from 'react';
import { Search } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const SECTIONS = [
  {
    id: 'learn',
    title: '📚 Learn & Grow',
    items: [
      { id: 'ggu_academy', label: 'GGU Academy', emoji: '🏛️', route: '/ggu-academy' },
      { id: 'girls_library', label: 'Girls Library', emoji: '📚', route: '/girls-library' },
      { id: 'career_explorer', label: 'Career Explorer', emoji: '💼', route: '/career-explorer' },
      { id: 'your_voice', label: 'Your Voice', emoji: '🗳️', route: '/your-voice', badge: 'New' },
      { id: 'growth_mindset', label: 'Growth Mindset', emoji: '🧠', route: '/growth-mindset' },
      { id: 'homework_tracker', label: 'Homework Tracker', emoji: '📓', route: '/homework-tracker' },
      { id: 'daily_quotes', label: 'Daily Quotes', emoji: '✨', route: '/daily-quotes' },
      { id: 'glow_tips', label: 'Glow Tips', emoji: '💡', route: '/glow-tips' },
    ],
  },
  {
    id: 'wellness',
    title: '🌿 Wellness & Health',
    items: [
      { id: 'wellness_hub', label: 'Wellness Hub', emoji: '🌀', route: '/wellness-hub' },
      { id: 'calm_corner', label: 'Calm Corner', emoji: '🕯️', route: '/calm-corner' },
      { id: 'cycle_tracker', label: 'Cycle Tracker', emoji: '🌸', route: '/cycle-tracker' },
      { id: 'glow_checkin', label: 'Glow Check-In', emoji: '💗', route: '/glow-checkin' },
      { id: 'spiritual_glow', label: 'Spiritual Glow', emoji: '🧘', route: '/spiritual-glow' },
    ],
  },
  {
    id: 'money',
    title: '💰 Money & Future',
    items: [
      { id: 'money_savings', label: 'Money & Savings', emoji: '🏦', route: '/money-savings' },
      { id: 'dream_calculator', label: 'Dream Calculator', emoji: '🌌', route: '/dream-calculator' },
      { id: 'vision_board', label: 'Vision Board', emoji: '🗂️', route: '/vision-board' },
      { id: 'scholarships', label: 'Scholarships', emoji: '🎓', route: '/scholarships' },
      { id: 'grocery_list', label: 'Grocery List', emoji: '🛒', route: '/grocery-list' },
    ],
  },
  {
    id: 'challenges',
    title: '🔥 Challenges & Goals',
    items: [
      { id: 'daily_challenges', label: 'Daily Challenges', emoji: '⚡', route: '/daily-challenges' },
      { id: 'transformation', label: 'Transformation', emoji: '🦋', route: '/transformation' },
      { id: 'me_vs_me', label: 'Me vs Me', emoji: '👑', route: '/me-vs-me' },
      { id: 'weekly_theme', label: 'Weekly Theme', emoji: '📅', route: '/weekly-theme' },
    ],
  },
  {
    id: 'community',
    title: '💜 Community & Connect',
    items: [
      { id: 'community_hub', label: 'Community Hub', emoji: '🤝', route: '/community-hub' },
      { id: 'glow_feed', label: 'Glow Feed', emoji: '🏆', route: '/glow-feed' },
      { id: 'mentorship', label: 'Mentorship', emoji: '🌺', route: '/mentorship' },
      { id: 'glow_talk', label: 'Glow Talk', emoji: '🎙️', route: '/glow-talk', badge: 'Live' },
      { id: 'glow_squads', label: 'Glow Squads', emoji: '👯', route: '/glow-squads' },
      { id: 'teams', label: 'Teams', emoji: '🏅', route: '/teams' },
      { id: 'glow_board', label: 'Glow Board', emoji: '📸', route: '/glow-board' },
      { id: 'glow_kitchen', label: 'Glow Kitchen', emoji: '👩‍🍳', route: '/glow-kitchen' },
      { id: 'my_glow_link', label: 'My Glow Link™', emoji: '🔗', route: '/my-glow-link' },
      { id: 'leaderboard', label: 'Leaderboard', emoji: '🥇', route: '/leaderboard' },
      { id: 'shout_outs', label: 'Shout Outs', emoji: '📣', route: '/shout-outs' },
    ],
  },
  {
    id: 'my_life',
    title: '🌸 My Life',
    items: [
      { id: 'my_calendar', label: 'My Calendar', emoji: '📆', route: '/my-calendar' },
      { id: 'my_diary', label: 'My Diary', emoji: '📔', route: '/my-diary' },
      { id: 'sticky_notes', label: 'Sticky Notes', emoji: '📝', route: '/sticky-notes' },
      { id: 'cleaning_calendar', label: 'Cleaning Calendar', emoji: '🧹', route: '/cleaning-calendar' },
      { id: 'birthday_planner', label: 'Birthday Planner', emoji: '🎂', route: '/birthday-planner' },
      { id: 'time_management', label: 'Time Management', emoji: '⏰', route: '/time-management' },
      { id: 'trip_planner', label: 'Trip Planner', emoji: '✈️', route: '/trip-planner' },
      { id: 'countdown', label: 'Countdown', emoji: '🎉', route: '/countdown' },
      { id: 'important_contacts', label: 'Important Contacts', emoji: '📱', route: '/important-contacts' },
      { id: 'password_vault', label: 'Password Vault', emoji: '🔒', route: '/password-vault' },
    ],
  },
  {
    id: 'fitness',
    title: '💪 Fitness & Body',
    items: [
      { id: 'fitness_tracker', label: 'Fitness Tracker', emoji: '🏋️', route: '/fitness-tracker' },
    ],
  },
];

const RECOMMENDED = [
  { id: 'curriculum', icon: '📚', title: 'Curriculum', desc: 'Personalized learning paths', route: '/curriculum' },
  { id: 'resources', icon: '📖', title: 'Resources', desc: 'Handpicked for your growth', route: '/resources' },
];

export default function Discover() {
  const [search, setSearch] = useState('');

  const allItems = SECTIONS.flatMap(s => s.items);
  const searchResults = search.trim().length > 1
    ? allItems.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen text-white pb-24 overflow-x-hidden" style={{ backgroundColor: '#0d0d0d' }}>
      {/* Points badge */}
      <div className="flex justify-end px-4 pt-3">
        <div className="flex items-center gap-1 backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs font-bold">
          <span>🏅</span><span className="text-yellow-400">15 pts</span>
        </div>
      </div>

      <div className="px-4 pt-2 pb-4">
        <h1 className="text-3xl font-bold text-white mb-4">Discover ✨</h1>

        {/* Search */}
        <div className="relative mb-6">
          <div className="flex items-center backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-4 py-3 gap-2">
            <Search size={16} className="text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search features, topics, resources..."
              className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden z-10 shadow-xl">
              {searchResults.map(r => (
                <div key={r.id} className="px-4 py-3 text-sm text-gray-200 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0">
                  {r.emoji} {r.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended */}
        <div className="mb-6">
          <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">✨ RECOMMENDED FOR YOU</p>
          <div className="grid grid-cols-2 gap-3">
            {RECOMMENDED.map(r => (
              <div key={r.id} className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 cursor-pointer hover:bg-white/10 transition">
                <p className="font-semibold text-sm mb-1">{r.icon} {r.title}</p>
                <p className="text-gray-400 text-xs">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map(section => (
          <div key={section.id} className="mb-8">
            <h2 className="text-lg font-bold text-white mb-4">{section.title}</h2>
            <div className="grid grid-cols-3 gap-3">
              {section.items.map(item => (
                <div
                  key={item.id}
                  className="relative flex flex-col items-center gap-2 cursor-pointer group"
                >
                  {item.badge && (
                    <span className={`absolute -top-1 left-1/2 -translate-x-1/2 z-10 text-[9px] font-bold px-2 py-0.5 rounded-full text-white ${item.badge === 'Live' ? 'bg-red-500' : 'bg-purple-600'}`}>
                      {item.badge}
                    </span>
                  )}
                  <div className="w-20 h-20 rounded-2xl bg-gray-800/80 border border-white/8 flex items-center justify-center text-4xl group-hover:bg-gray-700/80 transition backdrop-blur-sm">
                    {item.emoji}
                  </div>
                  <span className="text-xs text-center text-gray-300 leading-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="discover" />
    </div>
  );
}