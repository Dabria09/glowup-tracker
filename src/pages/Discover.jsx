import { useState } from 'react';
import { Search } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const SECTIONS = [
  {
    id: 'learn',
    title: '📚 Learn & Grow',
    items: [
      { id: 'ggu_academy', label: 'GGU Academy', emoji: '🏛️', gradient: 'from-pink-900 via-purple-900 to-pink-800', route: '/ggu-academy' },
      { id: 'girls_library', label: 'Girls Library', emoji: '📚', gradient: 'from-amber-800 via-orange-900 to-yellow-900', route: '/girls-library' },
      { id: 'career_explorer', label: 'Career Explorer', emoji: '💼', gradient: 'from-yellow-800 via-amber-900 to-orange-900', route: '/career-explorer' },
      { id: 'your_voice', label: 'Your Voice', emoji: '🗳️', gradient: 'from-rose-900 via-red-900 to-pink-900', route: '/your-voice', badge: 'New' },
      { id: 'growth_mindset', label: 'Growth Mindset', emoji: '🧠', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', route: '/growth-mindset' },
      { id: 'homework_tracker', label: 'Homework Tracker', emoji: '📓', gradient: 'from-gray-800 via-slate-900 to-gray-900', route: '/homework-tracker' },
      { id: 'daily_quotes', label: 'Daily Quotes', emoji: '✨', gradient: 'from-yellow-800 via-amber-900 to-orange-900', route: '/daily-quotes' },
      { id: 'glow_tips', label: 'Glow Tips', emoji: '💡', gradient: 'from-violet-900 via-purple-900 to-indigo-900', route: '/glow-tips' },
    ],
  },
  {
    id: 'wellness',
    title: '🌿 Wellness & Health',
    items: [
      { id: 'wellness_hub', label: 'Wellness Hub', emoji: '🌀', gradient: 'from-purple-900 via-pink-900 to-rose-900', route: '/wellness-hub' },
      { id: 'calm_corner', label: 'Calm Corner', emoji: '🕯️', gradient: 'from-amber-900 via-orange-900 to-rose-900', route: '/calm-corner' },
      { id: 'cycle_tracker', label: 'Cycle Tracker', emoji: '🌸', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', route: '/cycle-tracker' },
      { id: 'glow_checkin', label: 'Glow Check-In', emoji: '💗', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', route: '/glow-checkin' },
      { id: 'spiritual_glow', label: 'Spiritual Glow', emoji: '🧘', gradient: 'from-indigo-900 via-purple-900 to-violet-900', route: '/spiritual-glow' },
    ],
  },
  {
    id: 'money',
    title: '💰 Money & Future',
    items: [
      { id: 'money_savings', label: 'Money & Savings', emoji: '🏦', gradient: 'from-yellow-800 via-amber-900 to-yellow-900', route: '/money-savings' },
      { id: 'dream_calculator', label: 'Dream Calculator', emoji: '🌌', gradient: 'from-indigo-900 via-purple-900 to-blue-900', route: '/dream-calculator' },
      { id: 'vision_board', label: 'Vision Board', emoji: '🗂️', gradient: 'from-pink-900 via-rose-900 to-orange-900', route: '/vision-board' },
      { id: 'scholarships', label: 'Scholarships', emoji: '🎓', gradient: 'from-amber-900 via-yellow-900 to-orange-900', route: '/scholarships' },
      { id: 'grocery_list', label: 'Grocery List', emoji: '🛒', gradient: 'from-yellow-700 via-amber-800 to-orange-800', route: '/grocery-list' },
    ],
  },
  {
    id: 'challenges',
    title: '🔥 Challenges & Goals',
    items: [
      { id: 'daily_challenges', label: 'Daily Challenges', emoji: '⚡', gradient: 'from-pink-900 via-rose-900 to-red-900', route: '/daily-challenges' },
      { id: 'transformation', label: 'Transformation', emoji: '🦋', gradient: 'from-purple-900 via-violet-900 to-fuchsia-900', route: '/transformation' },
      { id: 'me_vs_me', label: 'Me vs Me', emoji: '👑', gradient: 'from-yellow-900 via-pink-900 to-black', route: '/me-vs-me' },
      { id: 'weekly_theme', label: 'Weekly Theme', emoji: '📅', gradient: 'from-pink-900 via-fuchsia-900 to-purple-900', route: '/weekly-theme' },
    ],
  },
  {
    id: 'community',
    title: '💜 Community & Connect',
    items: [
      { id: 'community_hub', label: 'Community Hub', emoji: '🤝', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', route: '/community-hub' },
      { id: 'glow_feed', label: 'Glow Feed', emoji: '🏆', gradient: 'from-yellow-800 via-amber-900 to-pink-900', route: '/glow-feed' },
      { id: 'mentorship', label: 'Mentorship', emoji: '🌺', gradient: 'from-purple-900 via-pink-900 to-rose-900', route: '/mentorship' },
      { id: 'glow_talk', label: 'Glow Talk', emoji: '🎙️', gradient: 'from-pink-900 via-fuchsia-900 to-purple-900', route: '/glow-talk', badge: 'Live' },
      { id: 'glow_squads', label: 'Glow Squads', emoji: '👯', gradient: 'from-fuchsia-900 via-pink-900 to-purple-900', route: '/glow-squads' },
      { id: 'teams', label: 'Teams', emoji: '🏅', gradient: 'from-purple-900 via-indigo-900 to-pink-900', route: '/teams' },
      { id: 'glow_board', label: 'Glow Board', emoji: '📸', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', route: '/glow-board' },
      { id: 'glow_kitchen', label: 'Glow Kitchen', emoji: '👩‍🍳', gradient: 'from-rose-900 via-pink-900 to-fuchsia-900', route: '/glow-kitchen' },
      { id: 'my_glow_link', label: 'My Glow Link™', emoji: '🔗', gradient: 'from-yellow-800 via-amber-900 to-orange-900', route: '/my-glow-link' },
      { id: 'leaderboard', label: 'Leaderboard', emoji: '🥇', gradient: 'from-yellow-800 via-pink-900 to-fuchsia-900', route: '/leaderboard' },
      { id: 'shout_outs', label: 'Shout Outs', emoji: '📣', gradient: 'from-orange-900 via-red-900 to-pink-900', route: '/shout-outs' },
    ],
  },
  {
    id: 'my_life',
    title: '🌸 My Life',
    items: [
      { id: 'my_calendar', label: 'My Calendar', emoji: '📆', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', route: '/my-calendar' },
      { id: 'my_diary', label: 'My Diary', emoji: '📔', gradient: 'from-pink-800 via-purple-900 to-rose-900', route: '/my-diary' },
      { id: 'sticky_notes', label: 'Sticky Notes', emoji: '📝', gradient: 'from-violet-900 via-purple-900 to-fuchsia-900', route: '/sticky-notes' },
      { id: 'cleaning_calendar', label: 'Cleaning Calendar', emoji: '🧹', gradient: 'from-pink-900 via-fuchsia-900 to-purple-900', route: '/cleaning-calendar' },
      { id: 'birthday_planner', label: 'Birthday Planner', emoji: '🎂', gradient: 'from-pink-800 via-rose-900 to-fuchsia-900', route: '/birthday-planner' },
      { id: 'time_management', label: 'Time Management', emoji: '⏰', gradient: 'from-purple-900 via-pink-900 to-rose-900', route: '/time-management' },
      { id: 'trip_planner', label: 'Trip Planner', emoji: '✈️', gradient: 'from-blue-900 via-indigo-900 to-purple-900', route: '/trip-planner' },
      { id: 'countdown', label: 'Countdown', emoji: '🎉', gradient: 'from-fuchsia-900 via-purple-900 to-pink-900', route: '/countdown' },
      { id: 'important_contacts', label: 'Important Contacts', emoji: '📱', gradient: 'from-teal-900 via-cyan-900 to-blue-900', route: '/important-contacts' },
      { id: 'password_vault', label: 'Password Vault', emoji: '🔒', gradient: 'from-yellow-800 via-amber-900 to-gray-900', route: '/password-vault' },
    ],
  },
  {
    id: 'fitness',
    title: '💪 Fitness & Body',
    items: [
      { id: 'fitness_tracker', label: 'Fitness Tracker', emoji: '🏋️', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', route: '/fitness-tracker' },
    ],
  },
];

const RECOMMENDED = [
  { id: 'curriculum', icon: '📚', title: 'Curriculum', desc: 'Personalized learning paths', route: '/curriculum' },
  { id: 'resources', icon: '📖', title: 'Resources', desc: 'Handpicked for your growth', route: '/resources' },
];

function AppIcon({ item }) {
  return (
    <div className="relative flex flex-col items-center gap-1.5 cursor-pointer group">
      {item.badge && (
        <span className={`absolute -top-1.5 left-1/2 -translate-x-1/2 z-10 text-[9px] font-bold px-2 py-0.5 rounded-full text-white shadow-lg ${item.badge === 'Live' ? 'bg-red-500' : 'bg-purple-600'}`}>
          {item.badge}
        </span>
      )}
      <div
        className={`w-[76px] h-[76px] rounded-[18px] bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:scale-95 transition-transform border border-white/5`}
        style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)' }}
      >
        <span className="text-4xl drop-shadow-lg">{item.emoji}</span>
      </div>
      <span className="text-[11px] text-center text-gray-300 leading-tight w-20">{item.label}</span>
    </div>
  );
}

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
        <div className="mb-7">
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
            <div className="grid grid-cols-3 gap-x-3 gap-y-5">
              {section.items.map(item => (
                <AppIcon key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="discover" />
    </div>
  );
}