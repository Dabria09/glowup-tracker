import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Link2, ExternalLink } from 'lucide-react';
import UserAvatarDisplay from '@/components/UserAvatarDisplay';
import { getGlowLevel, getTheme, getFrame, computeBadges } from '@/components/glowlink/GlowThemes';

const REACTIONS = ['✨', '🔥', '💎', '🌸', '👑', '💜'];

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

/**
 * Full-screen preview overlay — matches exactly what the public GlowLink shows.
 *
 * Props:
 *   profile      — UserProfile entity (saved)
 *   overrides    — { bio, motto, glowEra, profileTheme, profileFrame, links,
 *                    featuredMood, featuredAffirmation, featuredGoal,
 *                    featuredQuote, vibe, interests (array), privacy (object),
 *                    bannerUrl }
 *   posts        — array of GlowUpPost records
 *   pointsRecord — UserPoints record (or null)
 *   username     — current (possibly unsaved) username string
 *   onClose      — callback to close the preview
 */
export default function GlowProfilePreview({ profile, overrides, posts, pointsRecord, username, onClose }) {
  const [activeTab, setActiveTab] = useState('timeline');

  const {
    bio = '',
    motto = '',
    glowEra = '',
    profileTheme = 'default',
    profileFrame = 'default',
    links = [],
    featuredMood = '',
    featuredAffirmation = '',
    featuredGoal = '',
    featuredQuote = '',
    vibe = '',
    interests = [],
    privacy = {},
    bannerUrl = '',
  } = overrides || {};

  const privacySettings = {
    public_profile: true, allow_followers: true, show_achievements: true,
    show_streak: true, show_goals: true, show_links: true,
    show_timeline: true, show_photos: true, show_interests: true, show_vibe: true,
    ...privacy,
  };

  const totalPoints = pointsRecord?.total_points || 0;
  const glowLevel = getGlowLevel(totalPoints);
  const theme = getTheme(profileTheme);
  const frame = getFrame(profileFrame);
  const frameStyle = frame.style(theme.accent);
  const badges = computeBadges(totalPoints, pointsRecord?.check_in_streak, pointsRecord?.challenges_completed, posts.length);

  // Same filter as real GlowProfile — show public + followers posts
  const visiblePosts = posts.filter(p => p.visibility === 'public' || p.visibility === 'followers');

  const personaImages = profile?.glow_persona_images
    ? (() => { try { return JSON.parse(profile.glow_persona_images)?.images || {}; } catch { return {}; } })()
    : {};
  const galleryImages = profile?.gallery_images
    ? (() => { try { return JSON.parse(profile.gallery_images) || []; } catch { return []; } })()
    : [];
  const allPhotos = [
    ...(profile?.avatar_url ? [{ url: profile.avatar_url, label: 'Profile' }] : []),
    ...Object.entries(personaImages).map(([id, url]) => ({ url, label: id.replace(/_/g, ' ') })),
    ...galleryImages.map(url => ({ url, label: 'Gallery' })),
  ];

  const previewProfile = profile ? { ...profile, profile_theme: profileTheme, profile_frame: profileFrame } : null;
  const progressPct = glowLevel.next ? Math.min(100, Math.floor((totalPoints / glowLevel.next) * 100)) : 100;
  const displayUsername = username || profile?.username || 'me';
  const vibeData = VIBE_OPTIONS.find(v => v.id === vibe);
  const interestsList = Array.isArray(interests) ? interests : [];

  const effectiveBannerUrl = bannerUrl || profile?.custom_banner_url || '';

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: theme.bg }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute rounded-full" style={{ width: 350, height: 350, top: -80, left: -60, background: `radial-gradient(circle, ${theme.glow}, transparent 70%)`, filter: 'blur(80px)', opacity: 0.5 }} />
        <div className="absolute rounded-full" style={{ width: 250, height: 250, bottom: '20%', right: -40, background: `radial-gradient(circle, ${theme.glow}, transparent 70%)`, filter: 'blur(60px)', opacity: 0.3 }} />
      </div>

      {/* Preview Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background: `${theme.bg}EE`, borderBottom: `1px solid ${theme.cardBorder}`, backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Preview Mode</span>
        </div>
        <p className="text-xs text-gray-500">Exact public view</p>
        <button onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center transition hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.12)', border: `1px solid ${theme.cardBorder}` }}>
          <X size={16} className="text-white" />
        </button>
      </div>

      {/* Scrollable profile content */}
      <div className="flex-1 overflow-y-auto relative z-10">

        {/* Cover Banner */}
        <div className="relative h-24" style={{ background: effectiveBannerUrl ? 'transparent' : theme.gradient }}>
          {effectiveBannerUrl
            ? <img src={effectiveBannerUrl} alt="banner" className="w-full h-full object-cover" />
            : <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' }} />
          }
          {glowEra && (
            <div className="absolute bottom-2 right-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', color: theme.textAccent, border: `1px solid ${theme.cardBorder}` }}>
                {theme.emoji} {glowEra}
              </span>
            </div>
          )}
        </div>

        <div className="px-4">

          {/* Profile Header */}
          <div className="mt-4 mb-5">
            <div className="flex items-end justify-between mb-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full animate-pulse"
                  style={{ margin: -8, background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`, filter: 'blur(8px)' }} />
                <div style={{ ...frameStyle, borderRadius: '50%', position: 'relative' }}>
                  <UserAvatarDisplay profile={previewProfile} size={88} fallback={(displayUsername?.[0] || '✨').toUpperCase()} showRing={false} />
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

            <h1 className="text-2xl font-black text-white mb-1">@{displayUsername}</h1>

            {/* Level progress */}
            {glowLevel.next && (
              <div className="mb-3">
                <div className="flex justify-between text-[10px] mb-1" style={{ color: theme.textAccent }}>
                  <span>{glowLevel.name}</span>
                  <span>{totalPoints} / {glowLevel.next}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})` }} />
                </div>
              </div>
            )}

            {bio && <p className="text-sm text-gray-300 mt-2 leading-relaxed">{bio}</p>}

            {motto && (
              <p className="text-xs italic mt-2 px-3 py-2 rounded-xl"
                style={{ background: `${theme.accent}10`, borderLeft: `2px solid ${theme.accent}60`, color: theme.textAccent }}>
                "{motto}"
              </p>
            )}

            {/* Vibe */}
            {privacySettings.show_vibe && vibeData && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs px-3 py-1.5 rounded-full font-semibold"
                  style={{ background: `${theme.accent}20`, border: `1px solid ${theme.accent}40`, color: theme.textAccent }}>
                  {vibeData.emoji} {vibeData.label} Vibe
                </span>
              </div>
            )}

            {/* Interests */}
            {privacySettings.show_interests && interestsList.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {interestsList.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${theme.cardBorder}`, color: '#9ca3af' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Featured quote */}
            {featuredQuote && (
              <div className="mt-3 px-3 py-3 rounded-2xl" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: theme.accent }}>✨ Featured Quote</p>
                <p className="text-sm italic text-white leading-relaxed">"{featuredQuote}"</p>
              </div>
            )}

            {/* Featured Mood/Goal/Affirmation */}
            {(featuredMood || featuredAffirmation || (privacySettings.show_goals && featuredGoal)) && (
              <div className="grid grid-cols-1 gap-2 mt-3">
                {featuredMood && (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                    <span className="text-lg">😊</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.accent }}>Current Mood</p>
                      <p className="text-sm text-white font-semibold">{featuredMood}</p>
                    </div>
                  </div>
                )}
                {featuredAffirmation && (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                    <span className="text-lg">💬</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.accent }}>Affirmation</p>
                      <p className="text-sm text-white italic">"{featuredAffirmation}"</p>
                    </div>
                  </div>
                )}
                {privacySettings.show_goals && featuredGoal && (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                    <span className="text-lg">🎯</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.accent }}>Current Goal</p>
                      <p className="text-sm text-white font-semibold">{featuredGoal}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Links */}
            {privacySettings.show_links && links.length > 0 && (
              <div className="flex flex-col gap-2 mt-4">
                {links.map((link, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                    <Link2 size={16} style={{ color: theme.accent }} className="flex-shrink-0" />
                    <span className="flex-1 text-sm font-semibold text-white">{link.label}</span>
                    <ExternalLink size={14} className="text-gray-500" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Badges */}
          {privacySettings.show_achievements && badges.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: theme.accent }}>Achievements</p>
              <div className="flex gap-2 flex-wrap">
                {badges.map(badge => (
                  <div key={badge.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.textAccent }}>
                    <span>{badge.emoji}</span> {badge.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          {privacySettings.show_achievements && totalPoints > 0 && (
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {privacySettings.show_streak && (
                <div className="text-center rounded-2xl py-4 px-2" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                  <p className="text-2xl mb-1">🔥</p>
                  <p className="font-bold text-white text-sm">{pointsRecord?.check_in_streak || 0}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Day Streak</p>
                </div>
              )}
              <div className="text-center rounded-2xl py-4 px-2" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                <p className="text-2xl mb-1">✅</p>
                <p className="font-bold text-white text-sm">{pointsRecord?.challenges_completed || 0}</p>
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
          {(privacySettings.show_timeline || (privacySettings.show_photos && allPhotos.length > 0)) && (
            <>
              <div className="flex gap-1 p-1 rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                {privacySettings.show_timeline && (
                  <button onClick={() => setActiveTab('timeline')}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition"
                    style={{ background: activeTab === 'timeline' ? `linear-gradient(135deg,${theme.accent},${theme.accent2})` : 'transparent', color: activeTab === 'timeline' ? '#fff' : '#9ca3af' }}>
                    📝 Posts
                  </button>
                )}
                {privacySettings.show_photos && allPhotos.length > 0 && (
                  <button onClick={() => setActiveTab('photos')}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition"
                    style={{ background: activeTab === 'photos' ? `linear-gradient(135deg,${theme.accent},${theme.accent2})` : 'transparent', color: activeTab === 'photos' ? '#fff' : '#9ca3af' }}>
                    📸 Photos
                  </button>
                )}
              </div>

              {activeTab === 'timeline' && privacySettings.show_timeline && (
                <div className="space-y-4 mb-5">
                  {visiblePosts.length === 0 ? (
                    <div className="text-center py-14">
                      <p className="text-4xl mb-3">✨</p>
                      <p className="text-gray-500 text-sm">No posts yet.</p>
                    </div>
                  ) : visiblePosts.map((post, i) => (
                    <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="rounded-3xl overflow-hidden"
                      style={{ background: theme.postGradient, border: `1px solid ${theme.cardBorder}` }}>
                      <div className="p-4">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div style={{ ...frameStyle, borderRadius: '50%' }}>
                            <UserAvatarDisplay profile={previewProfile} size={32} fallback={(displayUsername?.[0] || '✨').toUpperCase()} showRing={false} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">@{displayUsername}</p>
                            <p className="text-[10px] text-gray-500">{new Date(post.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          {post.post_type && (
                            <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${theme.accent}20`, color: theme.textAccent }}>{post.post_type}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-100 leading-relaxed">{post.content}</p>
                        {post.media_urls && (() => { try { const urls = JSON.parse(post.media_urls); return urls.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {urls.slice(0, 4).map((url, j) => (
                              <img key={j} src={url} alt="post media" className="w-full h-24 rounded-xl object-cover" />
                            ))}
                          </div>
                        ) : null; } catch { return null; } })()}
                      </div>
                      <div className="px-4 pb-3 flex gap-1 flex-wrap">
                        {REACTIONS.map(emoji => (
                          <div key={emoji} className="flex items-center px-2.5 py-1.5 rounded-full text-xs"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#6b7280' }}>
                            {emoji}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'photos' && privacySettings.show_photos && (
                <div className="pb-8">
                  {allPhotos.length === 0 ? (
                    <div className="text-center py-14">
                      <p className="text-4xl mb-3">📸</p>
                      <p className="text-gray-500 text-sm">No photos yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {allPhotos.map((photo, i) => (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                          className="relative aspect-square rounded-2xl overflow-hidden"
                          style={{ border: `1px solid ${theme.cardBorder}` }}>
                          <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 px-2 py-1" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.7),transparent)' }}>
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

      {/* Bottom CTA */}
      <div className="relative z-20 px-4 py-3 flex-shrink-0"
        style={{ background: `${theme.bg}EE`, borderTop: `1px solid ${theme.cardBorder}`, backdropFilter: 'blur(12px)' }}>
        <button onClick={onClose}
          className="w-full py-3.5 rounded-2xl font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)', boxShadow: '0 4px 20px rgba(236,72,153,0.3)' }}>
          ← Back to Editing
        </button>
      </div>
    </div>
  );
}