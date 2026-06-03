import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslation from '@/lib/useTranslation';
import { Search } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { base44 } from '@/api/base44Client';

const CDN = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663618716083/WDWw94kRE3Ddo7F9rGLvjC/';
const G = 'https://media.base44.com/images/public/6a0e12a89992f9565c11e330/';

const SECTIONS = [
  {
    id: 'foundation',
    title: '🚀 Getting Started',
    items: [
      { id: 'about_ggu', label: 'About GGU', gradient: 'from-pink-900 via-purple-900 to-fuchsia-900', route: '/about', image: G + '4e7c211d5_generated_image.png' },
      { id: 'how_it_works', label: 'How It Works', gradient: 'from-purple-900 via-indigo-900 to-blue-900', route: '/how-it-works', image: G + 'bd1e6e22c_generated_image.png' },
      { id: 'pioneer_network', label: 'Pioneer Network™', gradient: 'from-yellow-800 via-amber-900 to-yellow-900', route: '/pioneer-network', image: G + '0f7a14967_generated_image.png' },
      { id: 'glow_pass', label: 'Glow Pass™', gradient: 'from-fuchsia-900 via-pink-900 to-rose-900', route: '/glow-pass', image: G + '4148069f7_generated_image.png' },
      { id: 'community_guidelines', label: 'Guidelines', gradient: 'from-blue-900 via-cyan-900 to-teal-900', route: '/guidelines', image: G + 'dc34574d2_generated_image.png' },
      { id: 'help_support', label: 'Help & Support', gradient: 'from-rose-900 via-pink-900 to-red-900', route: '/support', image: G + '1190ec018_generated_image.png' },
      { id: 'privacy_policy', label: 'Privacy Policy', gradient: 'from-gray-800 via-slate-900 to-gray-900', route: '/privacy-policy', image: G + '235f5bd8c_generated_image.png' },
      { id: 'terms_of_service', label: 'Terms of Service', gradient: 'from-gray-800 via-slate-900 to-gray-900', route: '/terms-of-service', image: G + '5f2be6029_generated_image.png' },
    ],
  },
  {
    id: 'learn',
    title: '📚 Learn & Grow',
    items: [
      { id: 'ggu_academy', label: 'GGU Academy', gradient: 'from-pink-900 via-purple-900 to-pink-800', route: '/ggu-academy', image: G + '6eb9c08c5_generated_image.png' },
      { id: 'girls_library', label: 'Girls Library', gradient: 'from-amber-800 via-orange-900 to-yellow-900', route: '/girls-library', image: G + 'b93eece9e_generated_image.png' },
      { id: 'career_explorer', label: 'Career Explorer', gradient: 'from-yellow-800 via-amber-900 to-orange-900', route: '/careers', image: G + 'e1576fb85_generated_image.png' },
      { id: 'your_voice', label: 'Your Voice', gradient: 'from-rose-900 via-red-900 to-pink-900', route: '/your-voice', badge: 'New', image: G + 'eba58a8ce_generated_image.png' },
      { id: 'growth_mindset', label: 'Growth Mindset', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', route: '/growth-mindset', image: G + '149736437_generated_image.png' },
      { id: 'homework_tracker', label: 'Homework Tracker', gradient: 'from-gray-800 via-slate-900 to-gray-900', route: '/homework-tracker', image: G + 'cdd648211_generated_image.png' },
      { id: 'daily_quotes', label: 'Daily Quotes', gradient: 'from-yellow-800 via-amber-900 to-orange-900', route: '/daily-quotes', image: G + 'fc4055b29_generated_image.png' },
      { id: 'glow_tips', label: 'Glow Tips', gradient: 'from-violet-900 via-purple-900 to-indigo-900', route: '/glow-tips', image: G + 'f0073c619_generated_image.png' },
    ],
  },
  {
    id: 'wellness',
    title: '🌿 Wellness & Health',
    items: [
      { id: 'wellness_hub', label: 'Wellness Hub', gradient: 'from-purple-900 via-pink-900 to-rose-900', route: '/wellness-hub', image: G + '39072c84d_generated_image.png' },
      { id: 'calm_corner', label: 'Calm Corner', gradient: 'from-amber-900 via-orange-900 to-rose-900', route: '/calm-corner', image: G + 'd3f025768_generated_image.png' },
      { id: 'cycle_tracker', label: 'Cycle Tracker', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', route: '/cycle-tracker', image: G + 'daa69e06c_generated_image.png' },
      { id: 'glow_checkin', label: 'Glow Check-In', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', route: '/daily-checkin', image: G + '211e8214f_generated_image.png' },
      { id: 'glow_playlist_wellness', label: 'Glow Up Playlist', gradient: 'from-pink-900 via-purple-900 to-fuchsia-900', route: '/glow-playlist', image: G + '4fb776ff6_generated_image.png' },
      { id: 'spiritual_glow', label: 'Spiritual Glow', gradient: 'from-indigo-900 via-purple-900 to-violet-900', route: '/spiritual-glow', image: CDN + 'icon-spiritual-glow-Y4zxRVLXJn8CpnpefTixYM.webp' },
    ],
  },
  {
    id: 'money',
    title: '💰 Money & Future',
    items: [
      { id: 'money_savings', label: 'Money & Savings', gradient: 'from-yellow-800 via-amber-900 to-yellow-900', route: '/money-tracker', image: G + '83b252879_generated_image.png' },
      { id: 'dream_calculator', label: 'Dream Calculator', gradient: 'from-indigo-900 via-purple-900 to-blue-900', route: '/dream-calculator', image: G + '4e5fb829a_generated_image.png' },
      { id: 'vision_board', label: 'Vision Board', gradient: 'from-pink-900 via-rose-900 to-orange-900', route: '/vision-board', image: G + '6adb092a1_IMG_4341.jpeg' },
      { id: 'scholarships', label: 'Scholarships', gradient: 'from-amber-900 via-yellow-900 to-orange-900', route: '/scholarships', image: G + 'eeeaa5f39_generated_image.png' },
      { id: 'grocery_list', label: 'Grocery List', gradient: 'from-yellow-700 via-amber-800 to-orange-800', route: '/grocery-list', image: G + '2a31766bf_generated_image.png' },
    ],
  },
  {
    id: 'challenges',
    title: '🔥 Challenges & Goals',
    items: [
      { id: 'glow_score', label: 'Glow Score', gradient: 'from-yellow-800 via-amber-900 to-yellow-900', route: '/glow-score', image: G + '969290838_generated_image.png' },
      { id: 'daily_challenges', label: 'Daily Challenges', gradient: 'from-pink-900 via-rose-900 to-red-900', route: '/daily-challenges', image: G + 'ac35abfb3_generated_image.png' },
      { id: 'transformation', label: 'Transformation', gradient: 'from-purple-900 via-violet-900 to-fuchsia-900', route: '/glow-up-challenges', image: CDN + 'icon-transformation-P5fD4QdfoP2Dkjf4cUfe5g.webp' },
      { id: 'me_vs_me', label: 'Me vs Me', gradient: 'from-yellow-900 via-pink-900 to-black', route: '/me-vs-me', image: CDN + 'icon-me-vs-me-KYCb7xc6LGLzVW9UGpUEWp.webp' },
      { id: 'weekly_theme', label: 'Weekly Theme', gradient: 'from-pink-900 via-fuchsia-900 to-purple-900', route: '/weekly-theme', image: G + 'eb7586e4a_generated_image.png' },
      { id: 'challenge_leaderboard', label: 'Challenge Leaderboard', gradient: 'from-yellow-800 via-pink-900 to-fuchsia-900', route: '/challenge-leaderboard', image: G + '0f9f2c63e_generated_image.png' },
      { id: 'my_certificates', label: 'My Certificates', gradient: 'from-yellow-700 via-amber-800 to-yellow-900', route: '/my-certificates', image: G + '01cd20461_generated_image.png' },
      { id: 'my_goals', label: 'My Goals', gradient: 'from-purple-900 via-pink-900 to-fuchsia-900', route: '/my-goals', image: G + 'cbb033f51_generated_image.png' },
    ],
  },
  {
    id: 'community',
    title: '💜 Community & Connect',
    items: [
      { id: 'community_hub', label: 'Community Hub', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', route: '/community-hub', image: G + 'a45d4bc59_generated_image.png' },
      { id: 'glow_feed', label: 'Glow Feed', gradient: 'from-yellow-800 via-amber-900 to-pink-900', route: '/glow-feed', image: G + 'e186aff68_generated_image.png' },
      { id: 'mentorship', label: 'Mentorship', gradient: 'from-purple-900 via-pink-900 to-rose-900', route: '/mentorship', image: G + '1b4f4ff51_generated_image.png' },
      { id: 'glow_talk', label: 'Glow Talk', gradient: 'from-pink-900 via-fuchsia-900 to-purple-900', route: '/glow-talk', badge: 'Live', image: CDN + 'icon-glow-talk-ewK3HLMfZYVeNKLD3iLrKz.webp' },
      { id: 'glow_squads', label: 'Glow Squads', gradient: 'from-fuchsia-900 via-pink-900 to-purple-900', route: '/glow-squads', image: G + 'fbf1d3b52_generated_image.png' },
      { id: 'glow_teams', label: 'Glow Teams', gradient: 'from-purple-900 via-indigo-900 to-pink-900', route: '/glow-teams', image: G + 'fc125e66a_generated_image.png' },
      { id: 'glow_board', label: 'Glow Board', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', route: '/glow-board', image: G + '122d02801_generated_image.png', badge: 'New' },
      { id: 'glow_kitchen', label: 'Glow Kitchen', gradient: 'from-rose-900 via-pink-900 to-fuchsia-900', route: '/glow-kitchen', image: G + 'be9a8ad25_generated_image.png' },
      { id: 'my_glow_link', label: 'My Glow Link™', gradient: 'from-yellow-800 via-amber-900 to-orange-900', route: '/my-glow-link', image: G + '1a90dd257_generated_image.png' },
      { id: 'leaderboard', label: 'Leaderboard', gradient: 'from-yellow-800 via-pink-900 to-fuchsia-900', route: '/leaderboard', image: G + '2942f3a42_generated_image.png' },
      { id: 'shout_outs', label: 'Shout Outs', gradient: 'from-orange-900 via-red-900 to-pink-900', route: '/shout-outs', image: G + 'dedb4d7d6_generated_image.png' },
    ],
  },
  {
    id: 'my_life',
    title: '🌸 My Life',
    items: [
      { id: 'my_calendar', label: 'My Calendar', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', route: '/my-calendar', image: G + '812fd8b16_generated_image.png' },
      { id: 'my_diary', label: 'My Diary', gradient: 'from-pink-800 via-purple-900 to-rose-900', route: '/diary', image: G + 'caa6bed8e_generated_image.png' },
      { id: 'sticky_notes', label: 'Sticky Notes', gradient: 'from-violet-900 via-purple-900 to-fuchsia-900', route: '/sticky-notes', image: G + '7a2c0e8e5_generated_image.png' },
      { id: 'cleaning_calendar', label: 'Cleaning Calendar', gradient: 'from-pink-900 via-fuchsia-900 to-purple-900', route: '/cleaning-calendar', image: G + '2b09b2a7a_generated_image.png' },
      { id: 'birthday_planner', label: 'Birthday Planner', gradient: 'from-pink-800 via-rose-900 to-fuchsia-900', route: '/birthday-planner', image: G + 'b20b18d32_generated_image.png' },
      { id: 'time_management', label: 'Time Management', gradient: 'from-purple-900 via-pink-900 to-rose-900', route: '/time-management', image: G + '2283fb160_generated_image.png' },
      { id: 'trip_planner', label: 'Trip Planner', gradient: 'from-blue-900 via-indigo-900 to-purple-900', route: '/trip-planner', image: G + '653f49aee_generated_image.png' },
      { id: 'countdown', label: 'Countdown', gradient: 'from-fuchsia-900 via-purple-900 to-pink-900', route: '/countdown', image: G + '5bb28f4bc_generated_image.png' },
      { id: 'important_contacts', label: 'Important Contacts', gradient: 'from-teal-900 via-cyan-900 to-blue-900', route: '/important-contacts', image: G + '4237d295d_generated_image.png' },
      { id: 'password_vault', label: 'Password Vault', gradient: 'from-yellow-800 via-amber-900 to-gray-900', route: '/password-vault', image: G + '87e552076_generated_image.png' },
      { id: 'cycle_tracker_life', label: 'Cycle Tracker', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', route: '/cycle-tracker', image: G + 'daa69e06c_generated_image.png' },
      { id: 'spiritual_glow_life', label: 'Spiritual Glow', gradient: 'from-indigo-900 via-purple-900 to-violet-900', route: '/spiritual-glow', image: CDN + 'icon-spiritual-glow-Y4zxRVLXJn8CpnpefTixYM.webp' },
      { id: 'homework_tracker_life', label: 'Homework Tracker', gradient: 'from-gray-800 via-slate-900 to-gray-900', route: '/homework-tracker', image: G + 'cdd648211_generated_image.png' },
      { id: 'vision_board_life', label: 'Vision Board', gradient: 'from-pink-900 via-rose-900 to-orange-900', route: '/vision-board', image: G + '6adb092a1_IMG_4341.jpeg' },
      { id: 'grocery_list_life', label: 'Grocery List', gradient: 'from-yellow-700 via-amber-800 to-orange-800', route: '/grocery-list', image: G + '2a31766bf_generated_image.png' },
      { id: 'meal_planner_life', label: 'Meal Planner', gradient: 'from-green-900 via-teal-900 to-emerald-900', route: '/meal-planner', image: G + '77cf489da_generated_image.png' },
      { id: 'glow_playlist_life', label: 'Glow Up Playlist', gradient: 'from-pink-900 via-purple-900 to-fuchsia-900', route: '/glow-playlist', image: G + '4fb776ff6_generated_image.png' },
      { id: 'my_goals_life', label: 'My Goals', gradient: 'from-indigo-900 via-purple-900 to-pink-900', route: '/my-goals', image: G + 'cbb033f51_generated_image.png' },
    ],
  },
  {
    id: 'fitness',
    title: '💪 Fitness & Body',
    items: [
      { id: 'fitness_tracker', label: 'Fitness Tracker', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', route: '/fitness-tracker', image: G + '381b52a8e_generated_image.png' },
    ],
  },
];

const RECOMMENDED = [
  { id: 'ggu_academy', icon: '📚', title: 'GGU Academy', desc: 'Your personalized learning path', route: '/ggu-academy' },
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
  const [totalPoints, setTotalPoints] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      const pts = await base44.entities.UserPoints.filter({ user_email: u.email });
      if (pts.length) setTotalPoints(pts[0].total_points || 0);
    }).catch(() => {});
  }, []);

  const allItems = SECTIONS.flatMap(s => s.items);
  const searchResults = search.trim().length > 1
    ? allItems.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen text-white pb-24 overflow-x-hidden" style={{ backgroundColor: '#0d0d0d' }}>
      {/* Points badge */}
      <div className="flex justify-end px-4 pt-3">
        <div className="flex items-center gap-1 backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs font-bold">
          <span>🏅</span><span className="text-yellow-400">{totalPoints.toLocaleString()} pts</span>
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