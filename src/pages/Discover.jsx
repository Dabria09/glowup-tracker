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
  { id: 'about_ggu', label: 'About GGU', gradient: 'from-pink-900 via-purple-900 to-fuchsia-900', route: '/about', image: G + '49f8524d8_generated_image.png' },
  { id: 'how_it_works', label: 'How It Works', gradient: 'from-purple-900 via-indigo-900 to-blue-900', route: '/how-it-works', image: G + '9b3ebb1b4_generated_image.png' },
  { id: 'pioneer_network', label: 'Pioneer Network™', gradient: 'from-yellow-800 via-amber-900 to-yellow-900', route: '/pioneer-network', image: G + '3fddb528b_generated_image.png' },
  { id: 'glow_pass', label: 'Glow Pass™', gradient: 'from-fuchsia-900 via-pink-900 to-rose-900', route: '/glow-pass', image: G + 'b211f9d7a_generated_image.png' },
  { id: 'community_guidelines', label: 'Guidelines', gradient: 'from-blue-900 via-cyan-900 to-teal-900', route: '/guidelines', image: G + '1d5fe267d_generated_image.png' },
  { id: 'help_support', label: 'Help & Support', gradient: 'from-rose-900 via-pink-900 to-red-900', route: '/support', image: G + 'a4fc1cf5d_generated_image.png' },
  { id: 'privacy_policy', label: 'Privacy Policy', gradient: 'from-gray-800 via-slate-900 to-gray-900', route: '/privacy-policy', image: G + 'e904c020c_generated_image.png' },
  { id: 'terms_of_service', label: 'Terms of Service', gradient: 'from-gray-800 via-slate-900 to-gray-900', route: '/terms-of-service', image: G + 'aae8cb059_generated_image.png' }]

},
{
  id: 'learn',
  title: '📚 Learn & Grow',
  items: [
  { id: 'ggu_academy', label: 'GGU Academy', gradient: 'from-pink-900 via-purple-900 to-pink-800', route: '/ggu-academy', image: G + 'ed750f49f_generated_image.png' },
  { id: 'girls_library', label: 'Girls Library', gradient: 'from-amber-800 via-orange-900 to-yellow-900', route: '/girls-library', image: G + '6045b9468_generated_image.png' },
  { id: 'career_explorer', label: 'Career Explorer', gradient: 'from-yellow-800 via-amber-900 to-orange-900', route: '/careers', image: G + '690d53027_generated_image.png' },
  { id: 'your_voice', label: 'Your Voice', gradient: 'from-rose-900 via-red-900 to-pink-900', route: '/your-voice', badge: 'New', image: G + '275b4ec38_generated_image.png' },
  { id: 'growth_mindset', label: 'Growth Mindset', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', route: '/growth-mindset', image: G + '5f450c758_generated_image.png' },
  { id: 'homework_tracker', label: 'Homework Tracker', gradient: 'from-gray-800 via-slate-900 to-gray-900', route: '/homework-tracker', image: G + 'c390f66c0_generated_image.png' },
  { id: 'daily_quotes', label: 'Daily Quotes', gradient: 'from-yellow-800 via-amber-900 to-orange-900', route: '/daily-quotes', image: G + '4cf447c7f_generated_image.png' },
  { id: 'glow_tips', label: 'Glow Tips', gradient: 'from-violet-900 via-purple-900 to-indigo-900', route: '/glow-tips', image: G + '9dc18d7d9_generated_image.png' }]

},
{
  id: 'wellness',
  title: '🌿 Wellness & Health',
  items: [
  { id: 'wellness_hub', label: 'Wellness Hub', gradient: 'from-purple-900 via-pink-900 to-rose-900', route: '/wellness-hub', image: G + 'e78417482_generated_image.png' },
  { id: 'calm_corner', label: 'Calm Corner', gradient: 'from-amber-900 via-orange-900 to-rose-900', route: '/calm-corner', image: G + '946ac07ee_generated_image.png' },
  { id: 'cycle_tracker', label: 'Cycle Tracker', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', route: '/cycle-tracker', image: G + 'ee7ef7b01_generated_image.png' },
  { id: 'glow_checkin', label: 'Glow Check-In', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', route: '/daily-checkin', image: G + '2ad052c1f_generated_image.png' },
  { id: 'glow_playlist_wellness', label: 'Glow Up Playlist', gradient: 'from-pink-900 via-purple-900 to-fuchsia-900', route: '/glow-playlist', image: G + '6445f243c_generated_image.png' },
  { id: 'spiritual_glow', label: 'Spiritual Glow', gradient: 'from-indigo-900 via-purple-900 to-violet-900', route: '/spiritual-glow', image: G + '36c281277_generated_image.png' }]

},
{
  id: 'money',
  title: '💰 Money & Future',
  items: [
  { id: 'money_savings', label: 'Money & Savings', gradient: 'from-yellow-800 via-amber-900 to-yellow-900', route: '/money-tracker', image: G + '318604697_generated_image.png' },
  { id: 'dream_calculator', label: 'Dream Calculator', gradient: 'from-indigo-900 via-purple-900 to-blue-900', route: '/dream-calculator', image: G + '970fc7984_generated_image.png' },
  { id: 'vision_board', label: 'Vision Board', gradient: 'from-pink-900 via-rose-900 to-orange-900', route: '/vision-board', image: G + 'f62dbe5d2_generated_image.png' },
  { id: 'scholarships', label: 'Scholarships', gradient: 'from-amber-900 via-yellow-900 to-orange-900', route: '/scholarships', image: G + 'e63ad859e_generated_image.png' },
  { id: 'grocery_list', label: 'Grocery List', gradient: 'from-yellow-700 via-amber-800 to-orange-800', route: '/grocery-list', image: G + 'd3a3fe1f2_generated_image.png' }]

},
{
  id: 'challenges',
  title: '🔥 Challenges & Goals',
  items: [
  { id: 'glow_score', label: 'Glow Score', gradient: 'from-yellow-800 via-amber-900 to-yellow-900', route: '/glow-score', image: G + '054ca0204_generated_image.png' },
  { id: 'daily_challenges', label: 'Daily Challenges', gradient: 'from-pink-900 via-rose-900 to-red-900', route: '/daily-challenges', image: G + '5d8c38a62_generated_image.png' },
  { id: 'transformation', label: 'Transformation', gradient: 'from-purple-900 via-violet-900 to-fuchsia-900', route: '/glow-up-challenges', image: G + '11e16a6c5_generated_image.png' },
  { id: 'me_vs_me', label: 'Me vs Me', gradient: 'from-yellow-900 via-pink-900 to-black', route: '/me-vs-me', image: G + '3b5a1157d_generated_image.png' },
  { id: 'weekly_theme', label: 'Weekly Theme', gradient: 'from-pink-900 via-fuchsia-900 to-purple-900', route: '/weekly-theme', image: G + '035672bd8_generated_image.png' },
  { id: 'challenge_leaderboard', label: 'Challenge Leaderboard', gradient: 'from-yellow-800 via-pink-900 to-fuchsia-900', route: '/challenge-leaderboard', image: G + '62de76922_generated_image.png' },
  { id: 'my_certificates', label: 'My Certificates', gradient: 'from-yellow-700 via-amber-800 to-yellow-900', route: '/my-certificates', image: G + 'd3ecec9a9_generated_image.png' },
  { id: 'my_goals', label: 'My Goals', gradient: 'from-purple-900 via-pink-900 to-fuchsia-900', route: '/my-goals', image: G + '516e41b53_generated_image.png' }]

},
{
  id: 'community',
  title: '💜 Community & Connect',
  items: [
  { id: 'community_hub', label: 'Community Hub', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', route: '/community-hub', image: G + 'b903c9fb6_generated_image.png?v=2' },
  { id: 'glow_feed', label: 'Glow Feed', gradient: 'from-yellow-800 via-amber-900 to-pink-900', route: '/glow-feed', image: G + 'b54c35ab5_generated_image.png?v=2' },
  { id: 'mentorship', label: 'Mentorship', gradient: 'from-purple-900 via-pink-900 to-rose-900', route: '/mentorship', image: G + '747986b99_generated_image.png?v=2' },
  { id: 'glow_talk', label: 'Glow Talk', gradient: 'from-pink-900 via-fuchsia-900 to-purple-900', route: '/glow-talk', badge: 'Live', image: G + 'b718f5c26_generated_image.png?v=2' },
  { id: 'glow_squads', label: 'Glow Squads', gradient: 'from-fuchsia-900 via-pink-900 to-purple-900', route: '/glow-squads', image: G + 'b990d5ccf_generated_image.png?v=2' },
  { id: 'glow_teams', label: 'Glow Teams', gradient: 'from-purple-900 via-indigo-900 to-pink-900', route: '/glow-teams', image: G + '23b34cbd3_generated_image.png?v=2' },
  { id: 'glow_board', label: 'Glow Board', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', route: '/glow-board', image: G + 'a76e19c27_generated_image.png?v=2' },
  { id: 'glow_kitchen', label: 'Glow Kitchen', gradient: 'from-rose-900 via-pink-900 to-fuchsia-900', route: '/glow-kitchen', image: G + 'ad580c299_generated_image.png?v=2' },
  { id: 'my_glow_link', label: 'My Glow Link™', gradient: 'from-yellow-800 via-amber-900 to-orange-900', route: '/my-glow-link', image: G + '993a4bab1_generated_image.png' },
  { id: 'leaderboard', label: 'Leaderboard', gradient: 'from-yellow-800 via-pink-900 to-fuchsia-900', route: '/leaderboard', image: G + '62de76922_generated_image.png' },
  { id: 'shout_outs', label: 'Shout Outs', gradient: 'from-orange-900 via-red-900 to-pink-900', route: '/shout-outs', image: G + '841f8b508_generated_image.png' }]

},
{
  id: 'my_life',
  title: '🌸 My Life',
  items: [
  { id: 'my_calendar', label: 'My Calendar', gradient: 'from-pink-900 via-rose-900 to-fuchsia-900', route: '/my-calendar', image: G + '8c01385ea_generated_image.png' },
  { id: 'my_diary', label: 'My Diary', gradient: 'from-pink-800 via-purple-900 to-rose-900', route: '/diary', image: G + 'b9cbbd278_generated_image.png' },
  { id: 'sticky_notes', label: 'Sticky Notes', gradient: 'from-violet-900 via-purple-900 to-fuchsia-900', route: '/sticky-notes', image: G + '74fa7886f_generated_image.png' },
  { id: 'cleaning_calendar', label: 'Cleaning Calendar', gradient: 'from-pink-900 via-fuchsia-900 to-purple-900', route: '/cleaning-calendar', image: G + '7699c2395_generated_image.png' },
  { id: 'birthday_planner', label: 'Birthday Planner', gradient: 'from-pink-800 via-rose-900 to-fuchsia-900', route: '/birthday-planner', image: G + 'f61e7abcd_generated_image.png' },
  { id: 'time_management', label: 'Time Management', gradient: 'from-purple-900 via-pink-900 to-rose-900', route: '/time-management', image: G + 'f79912847_generated_image.png' },
  { id: 'trip_planner', label: 'Trip Planner', gradient: 'from-blue-900 via-indigo-900 to-purple-900', route: '/trip-planner', image: G + 'a44ab1c91_generated_image.png' },
  { id: 'countdown', label: 'Countdown', gradient: 'from-fuchsia-900 via-purple-900 to-pink-900', route: '/countdown', image: G + 'f112832da_generated_image.png' },
  { id: 'important_contacts', label: 'Important Contacts', gradient: 'from-teal-900 via-cyan-900 to-blue-900', route: '/important-contacts', image: G + 'e6db4fb7e_generated_image.png' },
  { id: 'password_vault', label: 'Password Vault', gradient: 'from-yellow-800 via-amber-900 to-gray-900', route: '/password-vault', image: G + '5dad0afdd_generated_image.png' },
  { id: 'cycle_tracker_life', label: 'Cycle Tracker', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', route: '/cycle-tracker', image: G + 'ee7ef7b01_generated_image.png' },
  { id: 'spiritual_glow_life', label: 'Spiritual Glow', gradient: 'from-indigo-900 via-purple-900 to-violet-900', route: '/spiritual-glow', image: G + '36c281277_generated_image.png' },
  { id: 'homework_tracker_life', label: 'Homework Tracker', gradient: 'from-gray-800 via-slate-900 to-gray-900', route: '/homework-tracker', image: G + 'c390f66c0_generated_image.png' },
  { id: 'vision_board_life', label: 'Vision Board', gradient: 'from-pink-900 via-rose-900 to-orange-900', route: '/vision-board', image: G + 'f62dbe5d2_generated_image.png' },
  { id: 'grocery_list_life', label: 'Grocery List', gradient: 'from-yellow-700 via-amber-800 to-orange-800', route: '/grocery-list', image: G + 'd3a3fe1f2_generated_image.png' },
  { id: 'meal_planner_life', label: 'Meal Planner', gradient: 'from-green-900 via-teal-900 to-emerald-900', route: '/meal-planner', image: G + '3a9192283_generated_image.png' },
  { id: 'glow_playlist_life', label: 'Glow Up Playlist', gradient: 'from-pink-900 via-purple-900 to-fuchsia-900', route: '/glow-playlist', image: G + '6445f243c_generated_image.png' },
  { id: 'my_goals_life', label: 'My Goals', gradient: 'from-indigo-900 via-purple-900 to-pink-900', route: '/my-goals', image: G + '516e41b53_generated_image.png' }]

},
{
  id: 'fitness',
  title: '💪 Fitness & Body',
  items: [
  { id: 'fitness_tracker', label: 'Fitness Tracker', gradient: 'from-purple-900 via-fuchsia-900 to-pink-900', route: '/fitness-tracker', image: G + '21e8efe1c_generated_image.png' }]

}];


const RECOMMENDED = [
{ id: 'ggu_academy', icon: '📚', title: 'GGU Academy', desc: 'Your personalized learning path', route: '/ggu-academy' }];


function AppIcon({ item }) {
  const navigate = useNavigate();
  const size = 76;
  const br = 18;
  return (
    <div className="relative flex flex-col items-center gap-1.5 cursor-pointer group" onClick={() => item.route && navigate(item.route)}>
      {item.badge &&
      <span className={`absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 text-[9px] font-bold px-2 py-0.5 rounded-full text-white shadow-lg ${item.badge === 'Live' ? 'bg-red-500' : 'bg-purple-600'}`}>
          {item.badge}
        </span>
      }
      <div className="relative group-hover:scale-95 transition-transform duration-200" style={{ width: size, height: size }}>
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: br,
            background: 'linear-gradient(135deg, rgba(236,72,153,0.6), rgba(168,85,247,0.6), rgba(251,191,36,0.4))',
            padding: 1.5
          }}>
          
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden"
            style={{ borderRadius: br - 2, background: 'rgba(18,8,28,0.9)' }}>
            
            {item.image ?
            <img src={item.image} alt={item.label} className="object-contain rounded-xl" style={{ width: '85%', height: '85%' }} /> :
            <span className="text-4xl drop-shadow-lg">{item.emoji}</span>
            }
          </div>
        </div>
      </div>
      <span className="text-[11px] text-center text-gray-300 leading-tight w-20">{item.label}</span>
    </div>);

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

  const allItems = SECTIONS.flatMap((s) => s.items);
  const searchResults = search.trim().length > 1 ?
  allItems.filter((i) => i.label.toLowerCase().includes(search.toLowerCase())) :
  [];

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
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('discover_search')}
              className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1" />
            
          </div>
          {searchResults.length > 0 &&
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden z-10 shadow-xl">
              {searchResults.map((r) =>
            <div key={r.id} className="px-4 py-3 text-sm text-gray-200 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0">
                  {r.emoji} {r.label}
                </div>
            )}
            </div>
          }
        </div>

        {/* Recommended */}
        <div className="mb-7">
          <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">{t('recommended')}</p>
          <div className="grid grid-cols-2 gap-3">
            {RECOMMENDED.map((r) =>
            <div key={r.id} className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 cursor-pointer hover:bg-white/10 transition">
                <p className="font-semibold text-sm mb-1">{r.icon} {r.title}</p>
                <p className="text-gray-400 text-xs">{r.desc}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map((section) =>
        <div key={section.id} className="mb-8">
            <h2 className="text-lg font-bold text-white mb-4">{t('discover_' + section.id) || section.title}</h2>
            <div className="grid grid-cols-3 gap-x-3 gap-y-5">
              {section.items.map((item) =>
            <AppIcon key={item.id} item={item} />
            )}
            </div>
          </div>
        )}
      </div>

      <BottomNav active="discover" />
    </div>);

}