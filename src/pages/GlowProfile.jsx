import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import UserAvatarDisplay from '@/components/UserAvatarDisplay';
import { ChevronLeft, Share2, Heart, Link2, ExternalLink, Lock } from 'lucide-react';

const DEFAULT_PRIVACY = {
  public_profile: true,
  show_achievements: true,
  show_streak: true,
  show_goals: true,
  show_links: true,
  show_timeline: true,
  show_photos: true,
};

const ERA_GRADIENTS = {
  'Confidence Era':  'linear-gradient(135deg,#7c2d12,#b45309)',
  'Glow Up Era':     'linear-gradient(135deg,#831843,#9d174d)',
  'Boss Era':        'linear-gradient(135deg,#1e1b4b,#4c1d95)',
  'Healing Era':     'linear-gradient(135deg,#064e3b,#065f46)',
  'Growth Era':      'linear-gradient(135deg,#14532d,#166534)',
  'Abundance Era':   'linear-gradient(135deg,#713f12,#92400e)',
  'Queen Era':       'linear-gradient(135deg,#78350f,#b45309)',
  'Unbothered Era':  'linear-gradient(135deg,#0f172a,#1e293b)',
  'Focused Era':     'linear-gradient(135deg,#0c4a6e,#075985)',
  'Elevation Era':   'linear-gradient(135deg,#4a044e,#701a75)',
};

export default function GlowProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [privacy, setPrivacy] = useState(DEFAULT_PRIVACY);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    const load = async () => {
      const profiles = await base44.entities.UserProfile.filter({ username });
      if (!profiles.length) { setNotFound(true); setLoading(false); return; }
      const p = profiles[0];
      setProfile(p);
      try { setPrivacy({ ...DEFAULT_PRIVACY, ...(p.privacy_settings ? JSON.parse(p.privacy_settings) : {}) }); } catch {}

      const [userPosts, userPoints] = await Promise.all([
        base44.entities.GlowUpPost.filter({ user_email: p.user_email }, '-created_date', 30),
        base44.entities.UserPoints.filter({ user_email: p.user_email }),
      ]);

      setPosts(userPosts.filter(post => post.visibility === 'public'));
      if (userPoints.length) setPoints(userPoints[0]);
      setLoading(false);
    };
    load();
  }, [username]);

  const shareProfile = () => {
    if (navigator.share) navigator.share({ title: `${username}'s Glow Link`, url: window.location.href }).catch(() => {});
    else navigator.clipboard?.writeText(window.location.href);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white" style={{ backgroundColor: '#0d0608' }}>
      <p className="text-5xl mb-4">✨</p>
      <h1 className="text-xl font-bold mb-2">Profile Not Found</h1>
      <p className="text-sm text-gray-400 mb-6">@{username} hasn't set up their Glow Link yet.</p>
      <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-full font-bold text-white" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>Go Back</button>
    </div>
  );

  if (!privacy.public_profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white" style={{ backgroundColor: '#0d0608' }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)' }}>
        <Lock size={28} className="text-pink-400" />
      </div>
      <h1 className="text-xl font-bold mb-2">Private Profile</h1>
      <p className="text-sm text-gray-400 mb-6">@{username} has set their profile to private.</p>
      <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-full font-bold text-white" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>Go Back</button>
    </div>
  );

  const links = profile.links ? (() => { try { return JSON.parse(profile.links); } catch { return []; } })() : [];
  const totalPoints = points?.total_points || 0;
  const tier = totalPoints >= 500 ? 'Radiant' : totalPoints >= 200 ? 'Glowing' : totalPoints >= 50 ? 'Seedling' : 'Spark';
  const tierEmoji = { Radiant: '👑', Glowing: '✨', Seedling: '🌱', Spark: '⚡' }[tier];
  const coverGradient = ERA_GRADIENTS[profile.glow_era] || 'linear-gradient(135deg,#831843,#4c1d95)';
  const personaImages = profile.glow_persona_images ? (() => { try { return JSON.parse(profile.glow_persona_images)?.images || {}; } catch { return {}; } })() : {};
  const allPhotos = [
    ...(profile.avatar_url ? [{ url: profile.avatar_url, label: 'Profile' }] : []),
    ...Object.entries(personaImages).map(([id, url]) => ({ url, label: id.replace(/_/g,' ') })),
  ];

  return (
    <div className="min-h-screen text-white pb-10" style={{ backgroundColor: '#0d0608' }}>

      {/* Sticky Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(13,6,8,0.85)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold">@{profile.username}</h1>
          <p className="text-xs text-gray-500">Glow Link™</p>
        </div>
        <button onClick={shareProfile} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold"
          style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.35)', color: '#f9a8d4' }}>
          <Share2 size={14} /> Share
        </button>
      </div>

      {/* ── Cover Banner ────────────────────────────────────────── */}
      <div className="relative h-32" style={{ background: coverGradient }}>
        <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M20 28C13 22 6 16 6 10A6 6 0 0 1 12 4C15 4 18 6 20 9 22 6 25 4 28 4A6 6 0 0 1 34 10C34 16 27 22 20 28Z' fill='%23ffffff' opacity='0.07'/%3E%3C/svg%3E\")", backgroundSize: '40px 40px' }} />
        {profile.glow_era && (
          <div className="absolute bottom-3 right-4">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.9)' }}>
              ✨ {profile.glow_era}
            </span>
          </div>
        )}
      </div>

      <div className="px-4">

        {/* ── Profile Card ────────────────────────────────────── */}
        <div className="-mt-10 mb-5">
          <div className="flex items-end justify-between mb-4">
            <div style={{ border: '3px solid #0d0608', borderRadius: '50%' }}>
              <UserAvatarDisplay profile={profile} size={80} fallback={(profile.username?.[0] || '✨').toUpperCase()} showRing />
            </div>
            <div className="flex items-center gap-2 pb-1">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
                {tierEmoji} {tier}
              </span>
              {totalPoints > 0 && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }}>
                  🏅 {totalPoints.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <h1 className="text-xl font-black text-white">@{profile.username}</h1>

          {profile.bio && (
            <p className="text-sm text-gray-300 mt-2 leading-relaxed">{profile.bio}</p>
          )}

          {profile.motto && (
            <p className="text-xs text-gray-500 italic mt-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', borderLeft: '2px solid rgba(236,72,153,0.4)' }}>
              "{profile.motto}"
            </p>
          )}

          {/* Custom Links */}
          {privacy.show_links && links.length > 0 && (
            <div className="flex flex-col gap-2 mt-4">
              {links.map((link, i) => (
                <a key={i} href={link.url.startsWith('http') ? link.url : 'https://'+link.url}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl transition group"
                  style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)' }}>
                  <Link2 size={16} className="text-pink-400 flex-shrink-0" />
                  <span className="flex-1 text-sm font-semibold text-white">{link.label}</span>
                  <ExternalLink size={14} className="text-gray-500 group-hover:text-pink-400 transition" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* ── Stats ───────────────────────────────────────────── */}
        {privacy.show_achievements && totalPoints > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            {privacy.show_streak && (
              <div className="text-center rounded-2xl py-4 px-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-2xl mb-1">🔥</p>
                <p className="font-bold text-white text-sm">{points?.check_in_streak || 0}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Day Streak</p>
              </div>
            )}
            <div className="text-center rounded-2xl py-4 px-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-2xl mb-1">✓</p>
              <p className="font-bold text-white text-sm">{points?.challenges_completed || 0}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Challenges</p>
            </div>
            <div className="text-center rounded-2xl py-4 px-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-2xl mb-1">⭐</p>
              <p className="font-bold text-white text-sm">{Math.floor(totalPoints / 100)}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Badges</p>
            </div>
          </div>
        )}

        {/* ── Tabs ────────────────────────────────────────────── */}
        {(privacy.show_timeline || privacy.show_photos) && (
          <>
            <div className="flex gap-1 p-1 rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {privacy.show_timeline && (
                <button onClick={() => setActiveTab('timeline')}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition"
                  style={{ background: activeTab === 'timeline' ? 'linear-gradient(135deg,#c44a55,#ec4899)' : 'transparent', color: activeTab === 'timeline' ? '#fff' : '#9ca3af' }}>
                  📝 Posts
                </button>
              )}
              {privacy.show_photos && allPhotos.length > 0 && (
                <button onClick={() => setActiveTab('photos')}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition"
                  style={{ background: activeTab === 'photos' ? 'linear-gradient(135deg,#c44a55,#ec4899)' : 'transparent', color: activeTab === 'photos' ? '#fff' : '#9ca3af' }}>
                  📸 Photos
                </button>
              )}
            </div>

            {/* Timeline */}
            {activeTab === 'timeline' && privacy.show_timeline && (
              <div className="space-y-3 pb-6">
                {posts.length === 0 ? (
                  <div className="text-center py-14">
                    <p className="text-4xl mb-3">✨</p>
                    <p className="text-gray-500 text-sm">No public posts yet.</p>
                  </div>
                ) : posts.map(post => (
                  <div key={post.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <UserAvatarDisplay profile={profile} size={32} fallback={(profile.username?.[0] || '✨').toUpperCase()} showRing={false} />
                      <div>
                        <p className="text-xs font-bold text-white">@{profile.username}</p>
                        <p className="text-[10px] text-gray-500">{new Date(post.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed">{post.content}</p>
                    {post.media_urls && JSON.parse(post.media_urls || '[]').length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {JSON.parse(post.media_urls).slice(0,4).map((url, i) => (
                          <img key={i} src={url} alt="post" className="w-full h-28 rounded-xl object-cover" />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                      <Heart size={12} /> <span>{post.likes || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Photos */}
            {activeTab === 'photos' && privacy.show_photos && (
              <div className="pb-6">
                {allPhotos.length === 0 ? (
                  <div className="text-center py-14">
                    <p className="text-4xl mb-3">📸</p>
                    <p className="text-gray-500 text-sm">No photos yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {allPhotos.map((photo, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                        <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.8),transparent)' }}>
                          <p className="text-[9px] text-white/70 capitalize truncate">{photo.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}