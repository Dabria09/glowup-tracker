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
  const br = 20;
  return (
    <div
      className="relative flex flex-col items-center gap-2 cursor-pointer group"
      onClick={() => item.route && navigate(item.route)}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {item.badge && (
        <span style={{
          position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
          zIndex: 20, fontSize: 9, fontWeight: 800, padding: '2px 7px',
          borderRadius: 10, color: 'white', letterSpacing: '0.3px',
          fontFamily: "'Outfit', sans-serif",
          background: item.badge === 'Live'
            ? 'linear-gradient(135deg,#ef4444,#dc2626)'
            : 'linear-gradient(135deg,#a855f7,#7c3aed)',
          boxShadow: item.badge === 'Live' ? '0 2px 10px rgba(239,68,68,0.5)' : '0 2px 10px rgba(168,85,247,0.5)',
        }}>{item.badge}</span>
      )}
      <div
        className="group-active:scale-90 transition-transform duration-150"
        style={{ width: size, height: size, position: 'relative' }}
      >
        {/* Outer glow ring */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: br + 2,
          background: 'linear-gradient(135deg, rgba(232,82,109,0.55), rgba(168,85,247,0.55), rgba(241,182,16,0.35))',
          padding: 1.5,
        }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: br,
            background: 'rgba(14,9,26,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {item.image
              ? <img src={item.image} alt={item.label} style={{ width: '86%', height: '86%', objectFit: 'contain' }} />
              : <span style={{ fontSize: 32 }}>{item.emoji}</span>
            }
          </div>
        </div>
        {/* Subtle inner shine */}
        <div style={{
          position: 'absolute', top: 2, left: 4, right: 4, height: '38%',
          borderRadius: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.07), transparent)',
          pointerEvents: 'none',
        }} />
      </div>
      <span style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: 11, fontWeight: 500, textAlign: 'center',
        color: 'rgba(255,255,255,0.7)', lineHeight: 1.3,
        width: 76, display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>{item.label}</span>
    </div>
  );
}

export default function Discover() {
  const [search, setSearch] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    base44.analytics.track({ eventName: 'page_view', metadata: { page: 'Discover', path: '/discover', category: 'main_nav' } });
    base44.auth.me().then(async (u) => {
      const pts = await base44.entities.UserPoints.filter({ user_email: u.email });
      if (pts.length) setTotalPoints(pts[0].total_points || 0);
    }).catch(() => {});
  }, []);

  const allItems = SECTIONS.flatMap((s) => s.items);
  const searchResults = search.trim().length > 1 ?
    allItems.filter((i) => i.label.toLowerCase().includes(search.toLowerCase())) : [];

  return (
    <div className="min-h-screen text-white pb-28 overflow-x-hidden" style={{ background: 'var(--ggu-bg, #07050e)' }}>
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div style={{ position: 'absolute', width: 500, height: 500, top: -150, right: -150, background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, bottom: '20%', left: -100, background: 'radial-gradient(circle, rgba(232,82,109,0.1), transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 px-4 pt-4 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 28, fontWeight: 800,
              background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 1.1,
            }}>{t('discover_title')}</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3, fontFamily: "'Outfit', sans-serif" }}>Everything in one place ✦</p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(241,182,16,0.08)',
            border: '1px solid rgba(241,182,16,0.25)',
            borderRadius: 24, padding: '7px 14px',
            boxShadow: '0 4px 20px rgba(241,182,16,0.1)',
          }}>
            <span style={{ fontSize: 14 }}>🏅</span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 13, color: '#fdcd2d' }}>{totalPoints.toLocaleString()}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'Outfit', sans-serif" }}>pts</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-7">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20, padding: '13px 18px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          }}>
            <Search size={15} color="rgba(255,255,255,0.3)" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('discover_search') || 'Search all features…'}
              style={{
                background: 'transparent', outline: 'none', flex: 1,
                fontSize: 14, color: 'white',
                fontFamily: "'Outfit', sans-serif",
              }}
              className="placeholder-white/20" />
          </div>
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
              background: 'rgba(12,8,24,0.97)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20, overflow: 'hidden', zIndex: 20,
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(24px)',
            }}>
              {searchResults.slice(0, 8).map((r) => (
                <div key={r.id} style={{
                  padding: '12px 18px', fontSize: 13, color: 'rgba(255,255,255,0.8)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                }} className="hover:bg-white/5 transition">
                  {r.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Featured pill */}
        <div className="mb-7">
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 12, fontFamily: "'Outfit', sans-serif" }}>
            {t('recommended') || 'Featured'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {RECOMMENDED.map((r) => (
              <div key={r.id} style={{
                background: 'linear-gradient(135deg, rgba(232,82,109,0.12), rgba(168,85,247,0.08))',
                border: '1px solid rgba(232,82,109,0.2)',
                borderRadius: 20, padding: '16px',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(232,82,109,0.08)',
              }} className="hover:scale-[1.02] transition-transform">
                <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 13, marginBottom: 4, color: 'white' }}>{r.icon} {r.title}</p>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <div key={section.id} className="mb-9">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ height: 1, width: 24, background: 'linear-gradient(90deg, rgba(232,82,109,0.6), transparent)' }} />
              <h2 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 15, fontWeight: 700,
                color: 'rgba(255,255,255,0.85)',
                letterSpacing: '0.2px',
              }}>{t('discover_' + section.id) || section.title}</h2>
            </div>
            <div className="grid grid-cols-3 gap-x-3 gap-y-6">
              {section.items.map((item) => (
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