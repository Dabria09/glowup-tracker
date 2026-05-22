import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslation from '@/lib/useTranslation';
import { Search } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const CDN = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663618716083/WDWw94kRE3Ddo7F9rGLvjC/';
const MANUS = 'https://gguapp-wdww94kr.manus.space/manus-storage/';

const SECTIONS = [
  {
    id: 'learn',
    title: '📚 Learn & Grow',
    items: [
      { id: 'ggu_academy', label: 'GGU Academy', gradient: 'from-pink-900 via-purple-900 to-pink-800', route: '/ggu-academy', image: CDN + 'icon-ggu-academy-KcP2723cbWjawrV5CXFVoa.webp' },
      { id: 'girls_library', label: 'Girls Library', gradient: 'from-amber-800 via-orange-900 to-yellow-900', route: '/girls-library', image: CDN + 'icon-library-fYQUmdRKLjKeb8kEpFXuZz.webp' },
      { id: 'career_explorer', label: 'Career Explorer', gradient: 'from-yellow-800 via-amber-900 to-orange-900', route: '/career-explorer', image: CDN + 'icon-career-explorer-8j63MBeNyT9uZDM7Jtmztz.webp' },
      { id: 'your_voice', label: 'Your Voice', gradient: 'from-rose-900 via-red-900 to-pink-900', route: '/your-voice', badge: 'New', image: CDN + 'icon-your-voice-EfuNjY9nzEGsR3k7RWGZKq.webp' },
      { id: 'growth_mindset', label: 'Growth Mindset', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', route: '/growth-mindset', image: MANUS + 'icon-growth-mindset_a5fa4874.png' },
      { id: 'homework_tracker', label: 'Homework Tracker', gradient: 'from-gray-800 via-slate-900 to-gray-900', route: '/homework-tracker', image: CDN + 'icon-homework-tracker-UzfmPy6kuzvUAsU3vgon39.webp' },
      { id: 'daily_quotes', label: 'Daily Quotes', gradient: 'from-yellow-800 via-amber-900 to-orange-900', route: '/daily-quotes', image: CDN + 'icon-daily-quotes-HvcRFzha7VDVnsWvcwnxkn.webp' },
      { id: 'glow_tips', label: 'Glow Tips', gradient: 'from-violet-900 via-purple-900 to-indigo-900', route: '/glow-tips', image: CDN + 'icon-glow-tips-KryoBvfwicfNDGnBszfh8g.webp' },
    ],
  },
  {
    id: 'wellness',
    title: '🌿 Wellness & Health',
    items: [
      { id: 'wellness_hub', label: 'Wellness Hub', gradient: 'from-purple-900 via-pink-900 to-rose-900', route: '/wellness-hub', image: MANUS + 'icon-wellness-hub_a68ae95a.png' },
      { id: 'calm_corner', label: 'Calm Corner', gradient: 'from-amber-900 via-orange-900 to-rose-900', route: '/calm-corner', image: MANUS + 'icon-calm-corner_ef4b2861.png' },
      { id: 'cycle_tracker', label: 'Cycle Tracker', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', route: '/cycle-tracker', image: CDN + 'icon-cycle-tracker-mfEEuehTKonzHUdUSmTMaA.webp' },
      { id: 'glow_checkin', label: 'Glow Check-In', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', route: '/daily-checkin', image: MANUS + 'icon-glow-check-in_fe36a2ac.png' },

      { id: 'spiritual_glow', label: 'Spiritual Glow', gradient: 'from-indigo-900 via-purple-900 to-violet-900', route: '/spiritual-glow', image: CDN + 'icon-spiritual-glow-Y4zxRVLXJn8CpnpefTixYM.webp' },
    ],
  },
  {
    id: 'money',
    title: '💰 Money & Future',
    items: [
      { id: 'money_savings', label: 'Money & Savings', gradient: 'from-yellow-800 via-amber-900 to-yellow-900', route: '/money-savings', image: CDN + 'icon-money-tracker-2TYacsiWgAXqNkGsYeqxTn.webp' },
      { id: 'dream_calculator', label: 'Dream Calculator', gradient: 'from-indigo-900 via-purple-900 to-blue-900', route: '/dream-calculator', image: MANUS + 'icon-dream-calculator_0ac76f98.png' },
      { id: 'vision_board', label: 'Vision Board', gradient: 'from-pink-900 via-rose-900 to-orange-900', route: '/vision-board', image: 'https://media.base44.com/images/public/6a0e12a89992f9565c11e330/6adb092a1_IMG_4341.jpeg' },
      { id: 'scholarships', label: 'Scholarships', gradient: 'from-amber-900 via-yellow-900 to-orange-900', route: '/scholarships', image: MANUS + 'icon-diploma-education_12164ff4.png' },
      { id: 'grocery_list', label: 'Grocery List', gradient: 'from-yellow-700 via-amber-800 to-orange-800', route: '/grocery-list', image: CDN + 'icon-grocery-list-Sz9GHLVJt4pRGz2JvYmwDw.webp' },
    ],
  },
  {
    id: 'challenges',
    title: '🔥 Challenges & Goals',
    items: [
      { id: 'daily_challenges', label: 'Daily Challenges', gradient: 'from-pink-900 via-rose-900 to-red-900', route: '/daily-challenges', image: CDN + 'icon-daily-challenges-5aR9HwiMcVmjJVeR6dG8u8.webp' },
      { id: 'transformation', label: 'Transformation', gradient: 'from-purple-900 via-violet-900 to-fuchsia-900', route: '/transformation', image: CDN + 'icon-transformation-P5fD4QdfoP2Dkjf4cUfe5g.webp' },
      { id: 'me_vs_me', label: 'Me vs Me', gradient: 'from-yellow-900 via-pink-900 to-black', route: '/me-vs-me', image: CDN + 'icon-me-vs-me-KYCb7xc6LGLzVW9UGpUEWp.webp' },
      { id: 'weekly_theme', label: 'Weekly Theme', gradient: 'from-pink-900 via-fuchsia-900 to-purple-900', route: '/weekly-theme', image: CDN + 'icon-weekly-theme-Ddu6T87k5StF8EDt5BYehk.webp' },
    ],
  },
  {
    id: 'community',
    title: '💜 Community & Connect',
    items: [
      { id: 'community_hub', label: 'Community Hub', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', route: '/community-hub', image: CDN + 'icon-community-hub-v2-feRBzspWzoghy2BCvatoSn.webp' },
      { id: 'glow_feed', label: 'Glow Feed', gradient: 'from-yellow-800 via-amber-900 to-pink-900', route: '/glow-feed', image: CDN + 'icon-glow-up-feed-T2qbW3yLFS86GWn35JSQgk.webp' },
      { id: 'mentorship', label: 'Mentorship', gradient: 'from-purple-900 via-pink-900 to-rose-900', route: '/mentorship', image: CDN + 'icon-mentorship-HYC9V34WnU3LfmtQfCTwiP.webp' },
      { id: 'glow_talk', label: 'Glow Talk', gradient: 'from-pink-900 via-fuchsia-900 to-purple-900', route: '/glow-talk', badge: 'Live', image: CDN + 'icon-glow-talk-ewK3HLMfZYVeNKLD3iLrKz.webp' },
      { id: 'glow_squads', label: 'Glow Squads', gradient: 'from-fuchsia-900 via-pink-900 to-purple-900', route: '/glow-squads', image: MANUS + 'icon-glow-squads-v2_61c9bc2b.png' },
      { id: 'teams', label: 'Teams', gradient: 'from-purple-900 via-indigo-900 to-pink-900', route: '/teams', image: MANUS + 'icon-teams_6ca08712.png' },
      { id: 'glow_board', label: 'Glow Board', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', route: '/glow-board', image: CDN + 'icon-glow-board-4XSLLnCWyfrrYDHQ8zApA2.webp' },
      { id: 'glow_kitchen', label: 'Glow Kitchen', gradient: 'from-rose-900 via-pink-900 to-fuchsia-900', route: '/glow-kitchen', image: CDN + 'icon-glow-kitchen-WyHBfNCsiaR38BJ6YjES3Q.webp' },
      { id: 'my_glow_link', label: 'My Glow Link™', gradient: 'from-yellow-800 via-amber-900 to-orange-900', route: '/my-glow-link', image: CDN + 'icon-my-glow-link-74jzirPfc7YN8uTh9fGCeE.webp' },
      { id: 'leaderboard', label: 'Leaderboard', gradient: 'from-yellow-800 via-pink-900 to-fuchsia-900', route: '/leaderboard', image: CDN + 'icon-leaderboard-WLMjT77VCu94JhWg7vXfbm.webp' },
      { id: 'shout_outs', label: 'Shout Outs', gradient: 'from-orange-900 via-red-900 to-pink-900', route: '/shout-outs', image: CDN + 'icon-shout-outs-NTrE9c8n5rJCznKxgqLihW.webp' },
    ],
  },
  {
    id: 'my_life',
    title: '🌸 My Life',
    items: [
      { id: 'my_calendar', label: 'My Calendar', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', route: '/my-calendar', image: CDN + 'icon-my-calendar-55x8hsLegkBBMSVxNXFap5.webp' },
      { id: 'my_diary', label: 'My Diary', gradient: 'from-pink-800 via-purple-900 to-rose-900', route: '/diary', image: CDN + 'icon-my-diary-hV9wyJJ7diLH36nJFHSGb4.webp' },
      { id: 'sticky_notes', label: 'Sticky Notes', gradient: 'from-violet-900 via-purple-900 to-fuchsia-900', route: '/sticky-notes', image: CDN + 'icon-ggu-notes-YfCNPjnpsmHMjZkm5VACrP.webp' },
      { id: 'cleaning_calendar', label: 'Cleaning Calendar', gradient: 'from-pink-900 via-fuchsia-900 to-purple-900', route: '/cleaning-calendar', image: CDN + 'icon-cleaning-calendar-XC5nXr5kSwExbkzykThJEr.webp' },
      { id: 'birthday_planner', label: 'Birthday Planner', gradient: 'from-pink-800 via-rose-900 to-fuchsia-900', route: '/birthday-planner', image: CDN + 'icon-birthday-planner-Qp8X5ePr97LrHNc2yucHpS.webp' },
      { id: 'time_management', label: 'Time Management', gradient: 'from-purple-900 via-pink-900 to-rose-900', route: '/time-management', image: CDN + 'icon-time-management-LRboeGD2hk8GxmG3SPgSrU.webp' },
      { id: 'trip_planner', label: 'Trip Planner', gradient: 'from-blue-900 via-indigo-900 to-purple-900', route: '/trip-planner', image: CDN + 'icon-trip-planner-QAiWdgEFB9pMKaHeuK6ZMu.webp' },
      { id: 'countdown', label: 'Countdown', gradient: 'from-fuchsia-900 via-purple-900 to-pink-900', route: '/countdown', image: CDN + 'icon-countdown-7HeWEhC3DPLUnHCzG43qTW.webp' },
      { id: 'important_contacts', label: 'Important Contacts', gradient: 'from-teal-900 via-cyan-900 to-blue-900', route: '/important-contacts', image: CDN + 'icon-important-contacts-UbmbL7qNMiaxYU2N3To7LT.webp' },
      { id: 'password_vault', label: 'Password Vault', gradient: 'from-yellow-800 via-amber-900 to-gray-900', route: '/password-vault', image: CDN + 'icon-password-vault-M6NfKgvjrqX84pzi4yKu4c.webp' },
      { id: 'cycle_tracker_life', label: 'Cycle Tracker', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', route: '/cycle-tracker', image: CDN + 'icon-cycle-tracker-mfEEuehTKonzHUdUSmTMaA.webp' },
      { id: 'spiritual_glow_life', label: 'Spiritual Glow', gradient: 'from-indigo-900 via-purple-900 to-violet-900', route: '/spiritual-glow', image: CDN + 'icon-spiritual-glow-Y4zxRVLXJn8CpnpefTixYM.webp' },
      { id: 'homework_tracker_life', label: 'Homework Tracker', gradient: 'from-gray-800 via-slate-900 to-gray-900', route: '/homework-tracker', image: CDN + 'icon-homework-tracker-UzfmPy6kuzvUAsU3vgon39.webp' },
      { id: 'vision_board_life', label: 'Vision Board', gradient: 'from-pink-900 via-rose-900 to-orange-900', route: '/vision-board', image: 'https://media.base44.com/images/public/6a0e12a89992f9565c11e330/6adb092a1_IMG_4341.jpeg' },
    ],
  },
  {
    id: 'fitness',
    title: '💪 Fitness & Body',
    items: [
      { id: 'fitness_tracker', label: 'Fitness Tracker', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', route: '/fitness-tracker', image: CDN + 'icon-flex-fitness_tracker-QvdXMwiTH22d77fpWaYMoZ.webp' },
    ],
  },
];

const RECOMMENDED = [
  { id: 'curriculum', icon: '📚', title: 'Curriculum', desc: 'Personalized learning paths', route: '/curriculum' },
  { id: 'resources', icon: '📖', title: 'Resources', desc: 'Handpicked for your growth', route: '/resources' },
];

function AppIcon({ item }) {
  const navigate = useNavigate();
  return (
    <div className="relative flex flex-col items-center gap-1.5 cursor-pointer group" onClick={() => item.route && navigate(item.route)}>
      {item.badge && (
        <span className={`absolute -top-1.5 left-1/2 -translate-x-1/2 z-10 text-[9px] font-bold px-2 py-0.5 rounded-full text-white shadow-lg ${item.badge === 'Live' ? 'bg-red-500' : 'bg-purple-600'}`}>
          {item.badge}
        </span>
      )}
      <div
        className={`w-[76px] h-[76px] rounded-[18px] overflow-hidden shadow-lg group-hover:scale-95 transition-transform border border-white/5 ${item.image ? '' : 'bg-gradient-to-br ' + item.gradient + ' flex items-center justify-center'}`}
        style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)' }}
      >
        {item.image
          ? <img src={item.image} alt={item.label} className="w-full h-full object-cover" />
          : <span className="text-4xl drop-shadow-lg">{item.emoji}</span>
        }
      </div>
      <span className="text-[11px] text-center text-gray-300 leading-tight w-20">{item.label}</span>
    </div>
  );
}

export default function Discover() {
  const [search, setSearch] = useState('');
  const { t } = useTranslation();

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
        <h1 className="text-3xl font-bold text-white mb-4">{t('discover_title')}</h1>

        {/* Search */}
        <div className="relative mb-6">
          <div className="flex items-center backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-4 py-3 gap-2">
            <Search size={16} className="text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('discover_search')}
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
          <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">{t('recommended')}</p>
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
            <h2 className="text-lg font-bold text-white mb-4">{t('discover_' + section.id) || section.title}</h2>
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