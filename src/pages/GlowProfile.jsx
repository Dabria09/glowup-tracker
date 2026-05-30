import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import UserAvatarDisplay from '@/components/UserAvatarDisplay';
import { ChevronLeft, Share2, Heart, Link2, ExternalLink, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getGlowLevel, getTheme, getFrame, computeBadges } from '@/components/glowlink/GlowThemes';

const DEFAULT_PRIVACY = {
  public_profile: true,
  allow_followers: true,
  show_achievements: true,
  show_streak: true,
  show_goals: true,
  show_links: true,
  show_timeline: true,
  show_photos: true,
  show_interests: true,
  show_vibe: true,
};

const VIBE_OPTIONS = [
  { id: 'soft_girl', label: 'Soft Girl', emoji: '🌸' },
  { id: 'boss_era', label: 'Boss Era', emoji: '👑' },
  { id: 'fitness', label: 'Fitness Glow', emoji: '💪' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
  { id: 'wellness', label: 'Wellness', emoji: '🧘' },
  { id: 'academic', label: 'Academic', emoji: '📚' },
  { id: 'spiritual', label: 'Spiritual', emoji: '✨' },
  { id: 'adventure', label: 'Adventure', emoji: '🌍' },
];

const REACTIONS = ['✨', '🔥', '💎', '🌸', '👑', '💜'];

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
  const [postReactions, setPostReactions] = useState({});
  const [featuredSections, setFeaturedSections] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followRecordId, setFollowRecordId] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const profiles = await base44.entities.UserProfile.filter({ username });
      if (!profiles.length) { setNotFound(true); setLoading(false); return; }
      const p = profiles[0];
      setProfile(p);
      try { setPrivacy({ ...DEFAULT_PRIVACY, ...(p.privacy_settings ? JSON.parse(p.privacy_settings) : {}) }); } catch {}
      try { setFeaturedSections(p.featured_sections ? JSON.parse(p.featured_sections) : {}); } catch {}

      const [userPosts, userPointsData, followersData, followingData, cu] = await Promise.all([
        base44.entities.GlowUpPost.filter({ user_email: p.user_email }, '-created_date', 30),
        base44.entities.UserPoints.filter({ user_email: p.user_email }),
        base44.entities.GlowFollow.filter({ followed_email: p.user_email, status: 'active' }),
        base44.entities.GlowFollow.filter({ follower_email: p.user_email, status: 'active' }),
        base44.auth.me().catch(() => null),
      ]);

      setFollowersCount(followersData.length);
      setFollowingCount(followingData.length);
      setCurrentUser(cu);
      if (cu && cu.email !== p.user_email) {
        const myFollow = followersData.find(r => r.follower_email === cu.email);
        if (myFollow) { setIsFollowing(true); setFollowRecordId(myFollow.id); }
      }
      setPosts(userPosts.filter(post => post.visibility === 'public' || post.visibility === 'followers'));
      if (userPointsData.length) setPoints(userPointsData[0]);
      setLoading(false);
    };
    load();
  }, [username]);

  const shareProfile = () => {
    if (navigator.share) navigator.share({ title: `${username}'s Glow Link`, url: window.location.href }).catch(() => {});
    else navigator.clipboard?.writeText(window.location.href);
  };

  const handleFollow = async () => {
    if (!currentUser) { base44.auth.redirectToLogin(); return; }
    setFollowLoading(true);
    if (isFollowing && followRecordId) {
      await base44.entities.GlowFollow.delete(followRecordId);
      setIsFollowing(false);
      setFollowRecordId(null);
      setFollowersCount(c => Math.max(0, c - 1));
    } else {
      const record = await base44.entities.GlowFollow.create({
        follower_email: currentUser.email,
        followed_email: profile.user_email,
        follower_username: currentUser.email.split('@')[0],
        followed_username: profile.username || profile.user_email.split('@')[0],
        status: 'active',
      });
      setIsFollowing(true);
      setFollowRecordId(record.id);
      setFollowersCount(c => c + 1);
      // Create follow notification
      base44.entities.Notification.create({
        recipient_email: profile.user_email,
        type: 'follow',
        actor_email: currentUser.email,
        actor_username: currentUser.email.split('@')[0],
        message: 'Started following you',
        link: `/glowlink/${profile.username || profile.user_email.split('@')[0]}/followers?type=followers`,
        is_read: false,
      }).catch(() => {});
    }
    setFollowLoading(false);
  };

  const toggleReaction = (postId, emoji) => {
    setPostReactions(prev => {
      const current = prev[postId] || {};
      const reacted = current[`_reacted_${emoji}`];
      return {
        ...prev,
        [postId]: {
          ...current,
          [emoji]: (current[emoji] || 0) + (reacted ? -1 : 1),
          [`_reacted_${emoji}`]: !reacted,
        },
      };
    });
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
  const glowLevel = getGlowLevel(totalPoints);
  const theme = getTheme(profile.profile_theme || 'default');
  const frame = getFrame(profile.profile_frame || 'default');
  const frameStyle = frame.style(theme.accent);
  const badges = computeBadges(totalPoints, points?.check_in_streak, points?.challenges_completed, posts.length);
  const personaImages = profile.glow_persona_images ? (() => { try { return JSON.parse(profile.glow_persona_images)?.images || {}; } catch { return {}; } })() : {};
  const galleryImages = profile.gallery_images ? (() => { try { return JSON.parse(profile.gallery_images) || []; } catch { return []; } })() : [];
  const interests = profile.interests ? (() => { try { return JSON.parse(profile.interests) || []; } catch { return []; } })() : [];
  const vibeData = VIBE_OPTIONS.find(v => v.id === profile.vibe);
  const allPhotos = [
    ...(profile.avatar_url ? [{ url: profile.avatar_url, label: 'Profile' }] : []),
    ...Object.entries(personaImages).map(([id, url]) => ({ url, label: id.replace(/_/g, ' ') })),
    ...galleryImages.map(url => ({ url, label: 'Gallery' })),
  ];
  const progressPct = glowLevel.next ? Math.min(100, Math.floor((totalPoints / glowLevel.next) * 100)) : 100;

  return (
    <div className="min-h-screen text-white pb-10" style={{ backgroundColor: theme.bg }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute rounded-full" style={{ width: 400, height: 400, top: -100, left: -80, background: `radial-gradient(circle, ${theme.glow}, transparent 70%)`, filter: 'blur(80px)', opacity: 0.5 }} />
        <div className="absolute rounded-full" style={{ width: 300, height: 300, bottom: '20%', right: -60, background: `radial-gradient(circle, ${theme.glow}, transparent 70%)`, filter: 'blur(60px)', opacity: 0.3 }} />
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md px-4 py-3 flex items-center gap-2 relative"
        style={{ background: `${theme.bg}CC`, borderBottom: `1px solid ${theme.cardBorder}` }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate">@{profile.username}</h1>
          <p className="text-xs truncate" style={{ color: theme.accent }}>Glow Link™ · {glowLevel.emoji} {glowLevel.name}</p>
        </div>
        {currentUser && currentUser.email !== profile?.user_email && (
          <button onClick={handleFollow} disabled={followLoading}
            className="px-4 py-2 rounded-full text-sm font-bold transition disabled:opacity-60 flex-shrink-0"
            style={isFollowing
              ? { background: 'rgba(255,255,255,0.1)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.2)' }
              : { background: `linear-gradient(135deg,${theme.accent},${theme.accent2})`, color: '#fff' }}>
            {followLoading ? '...' : isFollowing ? 'Following' : '+ Follow'}
          </button>
        )}
        <button onClick={shareProfile} className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
          style={{ background: `${theme.accent}20`, border: `1px solid ${theme.accent}50`, color: theme.textAccent }}>
          <Share2 size={16} />
        </button>
      </div>

      {/* Cover Banner */}
      <div className="relative h-24" style={{ background: profile.custom_banner_url ? 'transparent' : theme.gradient }}>
        {profile.custom_banner_url
          ? <img src={profile.custom_banner_url} alt="banner" className="w-full h-full object-cover" />
          : <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' }} />
        }
        {profile.glow_era && (
          <div className="absolute bottom-2 right-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', color: theme.textAccent, border: `1px solid ${theme.cardBorder}` }}>
              {theme.emoji} {profile.glow_era}
            </span>
          </div>
        )}
      </div>

      <div className="px-4 relative z-10">

        {/* Profile Header */}
        <div className="mt-4 mb-5">
          <div className="flex items-end justify-between mb-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full animate-pulse"
                style={{ margin: -8, background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`, filter: 'blur(8px)' }} />
              <div style={{ ...frameStyle, borderRadius: '50%', position: 'relative' }}>
                <UserAvatarDisplay profile={profile} size={120} fallback={(profile.username?.[0] || '✨').toUpperCase()} showRing={false} />
              </div>
              {frame.id !== 'default' && (
                <div className="absolute -bottom-1 -right-1 text-base leading-none">{frame.emoji}</div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 pb-1">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: glowLevel.gradient, boxShadow: `0 4px 16px ${glowLevel.color}40` }}>
                <span>{glowLevel.emoji}</span>
                <span className="text-white">{glowLevel.name}</span>
              </div>
              {totalPoints > 0 && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${theme.accent}20`, border: `1px solid ${theme.accent}40`, color: theme.textAccent }}>
                  🏅 {totalPoints.toLocaleString()} pts
                </span>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-black text-white mb-2">@{profile.username}</h1>

          {/* Followers / Following */}
          <div className="flex items-center gap-5 mb-3">
            <button onClick={() => navigate(`/glowlink/${profile.username}/followers?type=followers`)} className="text-left hover:opacity-80 transition">
              <span className="text-lg font-black text-white">{followersCount}</span>
              <span className="text-xs text-gray-500 ml-1">Followers</span>
            </button>
            <button onClick={() => navigate(`/glowlink/${profile.username}/followers?type=following`)} className="text-left hover:opacity-80 transition">
              <span className="text-lg font-black text-white">{followingCount}</span>
              <span className="text-xs text-gray-500 ml-1">Following</span>
            </button>
          </div>

          {/* Level progress bar */}
          {glowLevel.next && (
            <div className="mb-3">
              <div className="flex justify-between text-[10px] mb-1" style={{ color: theme.textAccent }}>
                <span>{glowLevel.name}</span>
                <span>{totalPoints} / {glowLevel.next}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})` }}
                />
              </div>
            </div>
          )}

          {profile.bio && <p className="text-sm text-gray-300 mt-2 leading-relaxed">{profile.bio}</p>}

          {profile.motto && (
            <p className="text-xs italic mt-2 px-3 py-2 rounded-xl"
              style={{ background: `${theme.accent}10`, borderLeft: `2px solid ${theme.accent}60`, color: theme.textAccent }}>
              "{profile.motto}"
            </p>
          )}

          {/* Vibe */}
          {privacy.show_vibe && vibeData && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 rounded-full font-semibold"
                style={{ background: `${theme.accent}20`, border: `1px solid ${theme.accent}40`, color: theme.textAccent }}>
                {vibeData.emoji} {vibeData.label} Vibe
              </span>
            </div>
          )}

          {/* Interests */}
          {privacy.show_interests && interests.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {interests.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${theme.cardBorder}`, color: '#9ca3af' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Featured Quote */}
          {profile.featured_quote && (
            <div className="mt-3 px-3 py-3 rounded-2xl" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: theme.accent }}>✨ Featured Quote</p>
              <p className="text-sm italic text-white leading-relaxed">"{profile.featured_quote}"</p>
            </div>
          )}

          {/* Featured Sections */}
          {(featuredSections.mood || featuredSections.affirmation || featuredSections.goal) && (
            <div className="grid grid-cols-1 gap-2 mt-4">
              {featuredSections.mood && (
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                  <span className="text-lg">😊</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.accent }}>Current Mood</p>
                    <p className="text-sm text-white font-semibold">{featuredSections.mood}</p>
                  </div>
                </div>
              )}
              {featuredSections.affirmation && (
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                  <span className="text-lg">💬</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.accent }}>Affirmation</p>
                    <p className="text-sm text-white italic">"{featuredSections.affirmation}"</p>
                  </div>
                </div>
              )}
              {featuredSections.goal && (
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                  <span className="text-lg">🎯</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.accent }}>Current Goal</p>
                    <p className="text-sm text-white font-semibold">{featuredSections.goal}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom Links */}
          {privacy.show_links && links.length > 0 && (
            <div className="flex flex-col gap-2 mt-4">
              {links.map((link, i) => (
                <a key={i} href={link.url.startsWith('http') ? link.url : 'https://' + link.url}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl transition group"
                  style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                  <Link2 size={16} style={{ color: theme.accent }} className="flex-shrink-0" />
                  <span className="flex-1 text-sm font-semibold text-white">{link.label}</span>
                  <ExternalLink size={14} className="text-gray-500 group-hover:text-pink-400 transition" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Badges */}
        {privacy.show_achievements && badges.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: theme.accent }}>Achievements</p>
            <div className="flex gap-2 flex-wrap">
              {badges.map(badge => (
                <div key={badge.id} title={badge.desc}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.textAccent }}>
                  <span>{badge.emoji}</span> {badge.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {privacy.show_achievements && totalPoints > 0 && (
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {privacy.show_streak && (
              <div className="text-center rounded-2xl py-4 px-2" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                <p className="text-2xl mb-1">🔥</p>
                <p className="font-bold text-white text-sm">{points?.check_in_streak || 0}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Day Streak</p>
              </div>
            )}
            <div className="text-center rounded-2xl py-4 px-2" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
              <p className="text-2xl mb-1">✅</p>
              <p className="font-bold text-white text-sm">{points?.challenges_completed || 0}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Challenges</p>
            </div>
            <div className="text-center rounded-2xl py-4 px-2" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
              <p className="text-2xl mb-1">⭐</p>
              <p className="font-bold text-white text-sm">{badges.length}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Badges</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        {(privacy.show_timeline || privacy.show_photos) && (
          <>
            <div className="flex gap-1 p-1 rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {privacy.show_timeline && (
                <button onClick={() => setActiveTab('timeline')}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition"
                  style={{ background: activeTab === 'timeline' ? `linear-gradient(135deg,${theme.accent},${theme.accent2})` : 'transparent', color: activeTab === 'timeline' ? '#fff' : '#9ca3af' }}>
                  📝 Posts
                </button>
              )}
              {privacy.show_photos && allPhotos.length > 0 && (
                <button onClick={() => setActiveTab('photos')}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition"
                  style={{ background: activeTab === 'photos' ? `linear-gradient(135deg,${theme.accent},${theme.accent2})` : 'transparent', color: activeTab === 'photos' ? '#fff' : '#9ca3af' }}>
                  📸 Photos
                </button>
              )}
            </div>

            {activeTab === 'timeline' && privacy.show_timeline && (
              <div className="space-y-4 pb-6">
                {posts.length === 0 ? (
                  <div className="text-center py-14">
                    <p className="text-4xl mb-3">✨</p>
                    <p className="text-gray-500 text-sm">No public posts yet.</p>
                  </div>
                ) : posts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-3xl overflow-hidden"
                    style={{ background: theme.postGradient, border: `1px solid ${theme.cardBorder}`, boxShadow: `0 4px 24px ${theme.glow}20` }}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div style={{ ...frameStyle, borderRadius: '50%' }}>
                          <UserAvatarDisplay profile={profile} size={42} fallback={(profile.username?.[0] || '✨').toUpperCase()} showRing={false} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">@{profile.username}</p>
                          <p className="text-[10px] text-gray-500">{new Date(post.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="ml-auto">
                          <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: `${theme.accent}20`, color: theme.textAccent }}>{glowLevel.emoji} {glowLevel.name}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-100 leading-relaxed mb-3">{post.content}</p>
                      {post.media_urls && JSON.parse(post.media_urls || '[]').length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {JSON.parse(post.media_urls).slice(0, 4).map((url, j) => (
                            <img key={j} src={url} alt="post" className="w-full h-28 rounded-2xl object-cover" />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="px-4 pb-3 flex items-center gap-1 flex-wrap">
                      {REACTIONS.map(emoji => {
                        const count = postReactions[post.id]?.[emoji] || 0;
                        const reacted = postReactions[post.id]?.[`_reacted_${emoji}`];
                        return (
                          <button key={emoji} onClick={() => toggleReaction(post.id, emoji)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition"
                            style={{ background: reacted ? `${theme.accent}30` : 'rgba(255,255,255,0.07)', border: `1px solid ${reacted ? theme.accent : 'rgba(255,255,255,0.1)'}`, color: reacted ? theme.textAccent : '#6b7280' }}>
                            {emoji}{count > 0 && <span>{count}</span>}
                          </button>
                        );
                      })}
                      <div className="ml-auto flex items-center gap-1 text-xs text-gray-600">
                        <Heart size={11} /> <span>{post.likes || 0}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

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
                      <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                        className="relative aspect-square rounded-2xl overflow-hidden"
                        style={{ border: `1px solid ${theme.cardBorder}` }}>
                        <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.8),transparent)' }}>
                          <p className="text-[9px] text-white/70 capitalize truncate">{photo.label}</p>
                        </div>
                      </motion.div>
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