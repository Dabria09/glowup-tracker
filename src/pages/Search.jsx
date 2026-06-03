import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import UserAvatarDisplay from '@/components/UserAvatarDisplay';
import BottomNav from '@/components/BottomNav';
import { Search as SearchIcon, X, ChevronRight, Loader2 } from 'lucide-react';
import { RESOURCES, CAT_META } from '@/lib/libraryResources';

// Static app pages for instant navigation search
const CDN = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663618716083/WDWw94kRE3Ddo7F9rGLvjC/';
const MANUS = 'https://gguapp-wdww94kr.manus.space/manus-storage/';
const MEDIA = 'https://media.base44.com/images/public/6a0e12a89992f9565c11e330/';

const APP_PAGES = [
  { id: 'daily-checkin', label: 'Glow Check-In', route: '/daily-checkin', keywords: 'check in mood daily points' },
  { id: 'glow', label: 'My Glow', route: '/glow', keywords: 'challenges streak crown badges progress' },
  { id: 'glow-feed', label: 'Glow Feed', route: '/glow-feed', keywords: 'feed posts community social' },
  { id: 'glow-board', label: 'Glow Board', route: '/glow-board', keywords: 'photos vision inspiration' },
  { id: 'glow-talk', label: 'Glow Talk', route: '/glow-talk', keywords: 'chat messages talk' },
  { id: 'shout-outs', label: 'Shout Outs', route: '/shout-outs', keywords: 'praise recognition' },
  { id: 'leaderboard', label: 'Leaderboard', route: '/leaderboard', keywords: 'ranking top scores' },
  { id: 'glow-teams', label: 'Glow Teams', route: '/glow-teams', keywords: 'team group compete' },
  { id: 'glow-squads', label: 'Glow Squads', route: '/glow-squads', keywords: 'squad friends circle' },
  { id: 'community-hub', label: 'Community Hub', route: '/community-hub', keywords: 'community groups' },
  { id: 'mentorship', label: 'Mentorship', route: '/mentorship', keywords: 'mentor guidance coach' },
  { id: 'meal-planner', label: 'Meal Planner', route: '/meal-planner', keywords: 'food meals nutrition' },
  { id: 'glow-kitchen', label: 'Glow Kitchen', route: '/glow-kitchen', keywords: 'recipes cook kitchen' },
  { id: 'fitness-tracker', label: 'Fitness', route: '/fitness-tracker', keywords: 'workout exercise fitness' },
  { id: 'wellness-hub', label: 'Wellness Hub', route: '/wellness-hub', keywords: 'wellness health self care' },
  { id: 'cycle-tracker', label: 'Cycle Tracker', route: '/cycle-tracker', keywords: 'period cycle health' },
  { id: 'calm-corner', label: 'Calm Corner', route: '/calm-corner', keywords: 'meditation calm relax' },
  { id: 'spiritual-glow', label: 'Spiritual Glow', route: '/spiritual-glow', keywords: 'spiritual faith prayer' },
  { id: 'diary', label: 'My Diary', route: '/diary', keywords: 'journal diary write thoughts' },
  { id: 'vision-board', label: 'Vision Board', route: '/vision-board', keywords: 'goals dreams vision' },
  { id: 'my-goals', label: 'My Goals', route: '/my-goals', keywords: 'goals targets achieve' },
  { id: 'glow-up-challenges', label: 'Transformation Challenges', route: '/glow-up-challenges', keywords: 'challenge 30 day glow up' },
  { id: 'scholarships', label: 'Scholarships', route: '/scholarships', keywords: 'scholarship money college' },
  { id: 'careers', label: 'Career Explorer', route: '/careers', keywords: 'career jobs future' },
  { id: 'dream-calculator', label: 'Dream Calculator', route: '/dream-calculator', keywords: 'money dream salary' },
  { id: 'money-tracker', label: 'Money & Savings', route: '/money-tracker', keywords: 'money budget finance' },
  { id: 'homework-tracker', label: 'Homework', route: '/homework-tracker', keywords: 'homework school study' },
  { id: 'ggu-academy', label: 'GGU Academy', route: '/ggu-academy', keywords: 'academy learn education' },
  { id: 'growth-mindset', label: 'Growth Mindset', route: '/growth-mindset', keywords: 'mindset growth positive' },
  { id: 'daily-quotes', label: 'Daily Quotes', route: '/daily-quotes', keywords: 'quotes inspiration motivation' },
  { id: 'glow-tips', label: 'Glow Tips', route: '/glow-tips', keywords: 'tips advice beauty' },
  { id: 'weekly-theme', label: 'Weekly Theme', route: '/weekly-theme', keywords: 'weekly theme focus' },
  { id: 'my-glow-link', label: 'My Glow Link', route: '/my-glow-link', keywords: 'profile link share' },
  { id: 'glow-store', label: 'Glow Store', route: '/glow-store', keywords: 'store shop rewards' },
  { id: 'countdown', label: 'Countdown', route: '/countdown', keywords: 'countdown timer event' },
  { id: 'my-calendar', label: 'My Calendar', route: '/my-calendar', keywords: 'calendar schedule events' },
  { id: 'birthday-planner', label: 'Birthday Planner', route: '/birthday-planner', keywords: 'birthday party event' },
  { id: 'trip-planner', label: 'Trip Planner', route: '/trip-planner', keywords: 'trip travel vacation' },
  { id: 'sticky-notes', label: 'Sticky Notes', route: '/sticky-notes', keywords: 'notes reminder sticky' },
  { id: 'time-management', label: 'Time Management', route: '/time-management', keywords: 'time schedule manage' },
  { id: 'important-contacts', label: 'Contacts', route: '/important-contacts', keywords: 'contacts phone emergency' },
  { id: 'password-vault', label: 'Password Vault', route: '/password-vault', keywords: 'password security vault' },
  { id: 'support', label: 'Help & Support', route: '/support', keywords: 'help support contact' },
  { id: 'glow-score', label: 'Glow Score', route: '/glow-score', keywords: 'score level tier points' },
  { id: 'notifications', label: 'Notifications', route: '/notifications', keywords: 'notifications alerts follows' },
];

const SECTION_ORDER = ['pages', 'library', 'profiles', 'communities', 'posts', 'challenges', 'scholarships', 'quotes', 'tips', 'kitchen', 'wellness'];

const SECTION_META = {
  pages:        { label: '📱 Features & Tools', color: '#ec4899' },
  library:      { label: '📚 Girls Library', color: '#f472b6' },
  profiles:     { label: '👤 Girls', color: '#a855f7' },
  communities:  { label: '🌸 Communities', color: '#10b981' },
  posts:        { label: '📝 Posts', color: '#3b82f6' },
  challenges:   { label: '🔥 Challenges', color: '#f59e0b' },
  scholarships: { label: '🎓 Scholarships', color: '#fbbf24' },
  quotes:       { label: '💬 Quotes', color: '#34d399' },
  tips:         { label: '✨ Glow Tips', color: '#c084fc' },
  kitchen:      { label: '🍳 Kitchen Basics', color: '#fb923c' },
  wellness:     { label: '💚 Wellness Guides', color: '#4ade80' },
};

export default function Search() {
  const navigate = useNavigate();
  const inputRef = useRef();
  const debounceRef = useRef(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    const q = query.trim();
    if (!q || q.length < 2) {
      setResults({});
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => runSearch(q), 320);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const runSearch = async (q) => {
    const qLower = q.toLowerCase();

    // 1. Static pages
    const pages = APP_PAGES.filter(p =>
      p.label.toLowerCase().includes(qLower) ||
      p.keywords.toLowerCase().includes(qLower)
    ).slice(0, 6);

    // 2. Library resources (static — search title, desc, tips, category)
    const library = RESOURCES.filter(r => {
      const catLabel = CAT_META[r.cat]?.label || r.cat;
      return (
        (r.title || '').toLowerCase().includes(qLower) ||
        (r.desc || '').toLowerCase().includes(qLower) ||
        catLabel.toLowerCase().includes(qLower) ||
        (r.cat || '').toLowerCase().includes(qLower) ||
        (r.tips || []).some(t => t.toLowerCase().includes(qLower))
      );
    }).slice(0, 6);

    // 3. DB queries in parallel
    const [profiles, posts, challenges, quotes, scholarships, kitchen, communities, tips, wellness] = await Promise.allSettled([
      base44.entities.UserProfile.list('-updated_date', 200).then(all =>
        all.filter(p =>
          (p.username || '').toLowerCase().includes(qLower) ||
          (p.display_name || '').toLowerCase().includes(qLower) ||
          (p.bio || '').toLowerCase().includes(qLower) ||
          (p.glow_era || '').toLowerCase().includes(qLower) ||
          (p.vibe || '').toLowerCase().includes(qLower)
        ).slice(0, 6)
      ),
      base44.entities.GlowUpPost.list('-created_date', 100).then(all =>
        all.filter(p =>
          (p.content || '').toLowerCase().includes(qLower) ||
          (p.tags || '').toLowerCase().includes(qLower)
        ).slice(0, 6)
      ),
      base44.entities.GlowUpChallenge.list('-updated_date', 100).then(all =>
        all.filter(c =>
          (c.challenge_name || '').toLowerCase().includes(qLower) ||
          (c.phase || '').toLowerCase().includes(qLower)
        ).slice(0, 4)
      ),
      base44.entities.AdminQuote.list('-created_date', 200).then(all =>
        all.filter(q2 =>
          (q2.quote_text || '').toLowerCase().includes(qLower) ||
          (q2.author || '').toLowerCase().includes(qLower) ||
          (q2.category || '').toLowerCase().includes(qLower)
        ).slice(0, 4)
      ),
      base44.entities.Scholarship.list('-created_date', 300).then(all =>
        all.filter(s =>
          (s.title || '').toLowerCase().includes(qLower) ||
          (s.description || '').toLowerCase().includes(qLower) ||
          (s.category || '').toLowerCase().includes(qLower) ||
          (s.organization || '').toLowerCase().includes(qLower)
        ).slice(0, 5)
      ),
      base44.entities.KitchenBasic.list('-created_date', 200).then(all =>
        all.filter(k =>
          (k.title || '').toLowerCase().includes(qLower) ||
          (k.description || '').toLowerCase().includes(qLower) ||
          (k.category || '').toLowerCase().includes(qLower)
        ).slice(0, 5)
      ),
      base44.entities.Community.list('-created_date', 100).then(all =>
        all.filter(c =>
          (c.name || '').toLowerCase().includes(qLower) ||
          (c.description || '').toLowerCase().includes(qLower) ||
          (c.category || '').toLowerCase().includes(qLower)
        ).slice(0, 4)
      ),
      base44.entities.AdminGlowTip.list('-created_date', 300).then(all =>
        all.filter(t =>
          (t.tip_text || '').toLowerCase().includes(qLower) ||
          (t.category || '').toLowerCase().includes(qLower)
        ).slice(0, 5)
      ),
      base44.entities.HealthyGuide.list('-created_date', 100).then(all =>
        all.filter(g =>
          (g.title || '').toLowerCase().includes(qLower) ||
          (g.content || '').toLowerCase().includes(qLower) ||
          (g.category || '').toLowerCase().includes(qLower)
        ).slice(0, 4)
      ),
    ]);

    setResults({
      pages,
      library,
      profiles:     profiles.status     === 'fulfilled' ? profiles.value     : [],
      posts:        posts.status        === 'fulfilled' ? posts.value        : [],
      challenges:   challenges.status   === 'fulfilled' ? challenges.value   : [],
      quotes:       quotes.status       === 'fulfilled' ? quotes.value       : [],
      scholarships: scholarships.status === 'fulfilled' ? scholarships.value : [],
      kitchen:      kitchen.status      === 'fulfilled' ? kitchen.value      : [],
      communities:  communities.status  === 'fulfilled' ? communities.value  : [],
      tips:         tips.status         === 'fulfilled' ? tips.value         : [],
      wellness:     wellness.status     === 'fulfilled' ? wellness.value     : [],
    });
    setLoading(false);
    setSearched(true);
  };

  const totalResults = Object.values(results).reduce((sum, arr) => sum + (arr?.length || 0), 0);

  const handleClear = () => {
    setQuery('');
    setResults({});
    setSearched(false);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen text-white pb-28" style={{ backgroundColor: '#0d0608' }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute rounded-full" style={{ width: 400, height: 400, top: -100, left: -80, background: 'radial-gradient(circle, rgba(236,72,153,0.12), transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* Header + Search Bar */}
      <div className="sticky top-0 z-30" style={{ background: 'rgba(13,6,8,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <ChevronRight size={18} className="text-gray-400 rotate-180" />
          </button>
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {loading
              ? <Loader2 size={15} className="text-pink-400 flex-shrink-0 animate-spin" />
              : <SearchIcon size={15} className="text-gray-500 flex-shrink-0" />}
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search everything in GGU…"
              className="bg-transparent text-sm text-white placeholder-gray-600 outline-none flex-1"
            />
            {query && (
              <button onClick={handleClear}>
                <X size={14} className="text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 pt-4">
        {/* Empty / initial state */}
        {!searched && !loading && query.length < 2 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-lg font-bold text-white mb-2">Search the whole app</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Search features, library resources, girls, posts, challenges, scholarships, and more.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {['hair care', 'skincare', 'fitness', 'scholarships', 'budgeting', 'mindset', 'safety'].map(tag => (
                <button key={tag} onClick={() => setQuery(tag)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', color: '#f9a8d4' }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {searched && !loading && totalResults === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="text-5xl mb-4">✨</div>
            <h2 className="text-lg font-bold text-white mb-2">No results for "{query}"</h2>
            <p className="text-sm text-gray-500">Try a different word or browse features on the Discover tab.</p>
          </div>
        )}

        {/* Results */}
        {searched && totalResults > 0 && (
          <div className="space-y-6">
            <p className="text-xs text-gray-600 font-semibold">{totalResults} result{totalResults !== 1 ? 's' : ''} for <span className="text-pink-400">"{query}"</span></p>

            {SECTION_ORDER.map(section => {
              const items = results[section];
              if (!items || items.length === 0) return null;
              const meta = SECTION_META[section];

              return (
                <div key={section}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: meta.color }}>{meta.label}</p>
                  <div className="space-y-2">

                    {/* PAGES */}
                    {section === 'pages' && items.map(page => (
                      <button key={page.id} onClick={() => navigate(page.route)}
                        className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition active:scale-98"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: 'rgba(236,72,153,0.15)' }}>📱</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white">{page.label}</p>
                          <p className="text-xs text-gray-500 truncate">{page.route}</p>
                        </div>
                        <ChevronRight size={14} className="text-gray-600" />
                      </button>
                    ))}

                    {/* LIBRARY RESOURCES */}
                    {section === 'library' && items.map(resource => {
                      const catMeta = CAT_META[resource.cat] || {};
                      return (
                        <button key={resource.id}
                          onClick={() => navigate('/girls-library')}
                          className="w-full flex items-start gap-3 p-3.5 rounded-2xl text-left transition active:scale-98"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                            style={{ background: 'rgba(244,114,182,0.15)' }}>{resource.emoji || catMeta.emoji || '📚'}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white">{resource.title}</p>
                            <p className="text-xs font-semibold" style={{ color: catMeta.labelColor || '#c084fc' }}>{catMeta.label || resource.cat}</p>
                            {resource.desc && <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{resource.desc}</p>}
                          </div>
                          <ChevronRight size={14} className="text-gray-600 flex-shrink-0" />
                        </button>
                      );
                    })}

                    {/* PROFILES */}
                    {section === 'profiles' && items.map(profile => (
                      <button key={profile.id}
                        onClick={() => navigate(`/glowlink/${profile.username || profile.user_email?.split('@')[0]}`)}
                        className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition active:scale-98"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <UserAvatarDisplay profile={profile} size={40} fallback={(profile.username?.[0] || '?').toUpperCase()} showRing={false} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white">@{profile.username || profile.user_email?.split('@')[0]}</p>
                          {profile.glow_era && <p className="text-xs text-pink-400">✨ {profile.glow_era}</p>}
                          {profile.bio && <p className="text-xs text-gray-500 truncate">{profile.bio}</p>}
                        </div>
                        <ChevronRight size={14} className="text-gray-600" />
                      </button>
                    ))}

                    {/* POSTS */}
                    {section === 'posts' && items.map(post => (
                      <button key={post.id} onClick={() => navigate('/glow-feed')}
                        className="w-full flex items-start gap-3 p-3.5 rounded-2xl text-left transition active:scale-98"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: 'rgba(59,130,246,0.15)' }}>📝</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">{post.user_email?.split('@')[0]}</p>
                          <p className="text-sm text-gray-200 leading-relaxed line-clamp-2">{post.content}</p>
                          {post.tags && <p className="text-xs text-blue-400 mt-1">{post.tags}</p>}
                        </div>
                      </button>
                    ))}

                    {/* CHALLENGES */}
                    {section === 'challenges' && items.map(challenge => (
                      <button key={challenge.id}
                        onClick={() => navigate(`/glow-up-challenges/${challenge.challenge_id}`)}
                        className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition active:scale-98"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: 'rgba(245,158,11,0.15)' }}>🔥</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white">{challenge.challenge_name}</p>
                          <p className="text-xs text-gray-500 capitalize">{challenge.phase} phase · {challenge.status}</p>
                        </div>
                        <ChevronRight size={14} className="text-gray-600" />
                      </button>
                    ))}

                    {/* QUOTES */}
                    {section === 'quotes' && items.map(quote => (
                      <button key={quote.id} onClick={() => navigate('/daily-quotes')}
                        className="w-full flex items-start gap-3 p-3.5 rounded-2xl text-left transition active:scale-98"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: 'rgba(52,211,153,0.15)' }}>💬</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white italic leading-relaxed line-clamp-2">"{quote.quote_text}"</p>
                          {quote.author && <p className="text-xs text-green-400 mt-1">— {quote.author}</p>}
                        </div>
                      </button>
                    ))}

                    {/* SCHOLARSHIPS */}
                    {section === 'scholarships' && items.map(s => (
                      <button key={s.id} onClick={() => navigate('/scholarships')}
                        className="w-full flex items-start gap-3 p-3.5 rounded-2xl text-left transition active:scale-98"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: 'rgba(251,191,36,0.15)' }}>🎓</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{s.title}</p>
                          {s.organization && <p className="text-xs text-yellow-400">{s.organization}</p>}
                          {s.description && <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{s.description}</p>}
                        </div>
                        <ChevronRight size={14} className="text-gray-600 flex-shrink-0" />
                      </button>
                    ))}

                    {/* KITCHEN */}
                    {section === 'kitchen' && items.map(k => (
                      <button key={k.id} onClick={() => navigate('/glow-kitchen')}
                        className="w-full flex items-start gap-3 p-3.5 rounded-2xl text-left transition active:scale-98"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: 'rgba(249,115,22,0.15)' }}>{k.emoji || '🍳'}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white">{k.title}</p>
                          {k.category && <p className="text-xs text-orange-400">{k.category}</p>}
                          {k.description && <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{k.description}</p>}
                        </div>
                        <ChevronRight size={14} className="text-gray-600 flex-shrink-0" />
                      </button>
                    ))}

                    {/* COMMUNITIES */}
                    {section === 'communities' && items.map(c => (
                      <button key={c.id} onClick={() => navigate(`/community-hub/${c.id}`)}
                        className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition active:scale-98"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: 'rgba(16,185,129,0.15)' }}>🌸</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white">{c.name}</p>
                          {c.category && <p className="text-xs text-green-400">{c.category}</p>}
                          {c.description && <p className="text-xs text-gray-500 truncate mt-0.5">{c.description}</p>}
                        </div>
                        <ChevronRight size={14} className="text-gray-600 flex-shrink-0" />
                      </button>
                    ))}

                    {/* GLOW TIPS */}
                    {section === 'tips' && items.map(tip => (
                      <button key={tip.id} onClick={() => navigate('/glow-tips')}
                        className="w-full flex items-start gap-3 p-3.5 rounded-2xl text-left transition active:scale-98"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: 'rgba(192,132,252,0.15)' }}>✨</div>
                        <div className="flex-1 min-w-0">
                          {tip.category && <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-0.5">{tip.category}</p>}
                          <p className="text-sm text-white leading-relaxed line-clamp-2">{tip.tip_text}</p>
                        </div>
                      </button>
                    ))}

                    {/* WELLNESS GUIDES */}
                    {section === 'wellness' && items.map(guide => (
                      <button key={guide.id} onClick={() => navigate('/wellness-hub')}
                        className="w-full flex items-start gap-3 p-3.5 rounded-2xl text-left transition active:scale-98"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: 'rgba(52,211,153,0.15)' }}>💚</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white">{guide.title}</p>
                          {guide.category && <p className="text-xs text-green-400">{guide.category}</p>}
                          {guide.content && <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{guide.content}</p>}
                        </div>
                        <ChevronRight size={14} className="text-gray-600 flex-shrink-0" />
                      </button>
                    ))}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav active="discover" />
    </div>
  );
}