import { motion } from 'framer-motion';
import { X, Link2, ExternalLink } from 'lucide-react';
import UserAvatarDisplay from '@/components/UserAvatarDisplay';
import { getGlowLevel, getTheme, getFrame, computeBadges } from '@/components/glowlink/GlowThemes';

const REACTIONS = ['✨', '🔥', '💎', '🌸', '👑', '💜'];

/**
 * Full-screen preview overlay that shows exactly how a profile will
 * look on the public Glow Link page — without saving anything.
 *
 * Props:
 *   profile      — UserProfile entity (saved or partially built)
 *   overrides    — { bio, motto, glowEra, profileTheme, profileFrame, links, featuredMood, featuredAffirmation, featuredGoal }
 *   posts        — array of GlowUpPost records
 *   pointsRecord — UserPoints record (or null)
 *   username     — current (possibly unsaved) username string
 *   onClose      — callback to close the preview
 */
export default function GlowProfilePreview({ profile, overrides, posts, pointsRecord, username, onClose }) {
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
  } = overrides || {};

  const totalPoints = pointsRecord?.total_points || 0;
  const glowLevel = getGlowLevel(totalPoints);
  const theme = getTheme(profileTheme);
  const frame = getFrame(profileFrame);
  const frameStyle = frame.style(theme.accent);
  const badges = computeBadges(totalPoints, pointsRecord?.check_in_streak, pointsRecord?.challenges_completed, posts.length);
  const publicPosts = posts.filter(p => p.visibility === 'public');

  const personaImages = profile?.glow_persona_images
    ? (() => { try { return JSON.parse(profile.glow_persona_images)?.images || {}; } catch { return {}; } })()
    : {};
  const allPhotos = [
    ...(profile?.avatar_url ? [{ url: profile.avatar_url, label: 'Profile' }] : []),
    ...Object.entries(personaImages).map(([id, url]) => ({ url, label: id.replace(/_/g, ' ') })),
  ];

  // Merge overrides into a preview profile object for UserAvatarDisplay
  const previewProfile = profile ? { ...profile, profile_theme: profileTheme, profile_frame: profileFrame } : null;
  const progressPct = glowLevel.next ? Math.min(100, Math.floor((totalPoints / glowLevel.next) * 100)) : 100;
  const displayUsername = username || profile?.username || 'me';

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
        <p className="text-xs text-gray-500">This is how your profile looks publicly</p>
        <button onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center transition hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.12)', border: `1px solid ${theme.cardBorder}` }}>
          <X size={16} className="text-white" />
        </button>
      </div>

      {/* Scrollable profile content */}
      <div className="flex-1 overflow-y-auto relative z-10">

        {/* Cover Banner */}
        <div className="relative h-16" style={{ background: theme.gradient }}>
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' }} />
          {glowEra && (
            <div className="absolute bottom-2 right-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', color: theme.textAccent, border: `1px solid ${theme.cardBorder}` }}>
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

            <h1 className="text-2xl font-black text-white mb-2">@{displayUsername}</h1>

            {/* Level progress */}
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

            {bio && <p className="text-sm text-gray-300 mt-2 leading-relaxed">{bio}</p>}

            {motto && (
              <p className="text-xs italic mt-2 px-3 py-2 rounded-xl"
                style={{ background: `${theme.accent}10`, borderLeft: `2px solid ${theme.accent}60`, color: theme.textAccent }}>
                "{motto}"
              </p>
            )}

            {/* Featured sections */}
            {(featuredMood || featuredAffirmation || featuredGoal) && (
              <div className="grid grid-cols-1 gap-2 mt-4">
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
                {featuredGoal && (
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
            {links.length > 0 && (
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
          {badges.length > 0 && (
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
          {totalPoints > 0 && (
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              <div className="text-center rounded-2xl py-4 px-2" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
                <p className="text-2xl mb-1">🔥</p>
                <p className="font-bold text-white text-sm">{pointsRecord?.check_in_streak || 0}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Day Streak</p>
              </div>
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

          {/* Posts preview */}
          {publicPosts.length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: theme.accent }}>Posts</p>
              <div className="space-y-4 mb-5">
                {publicPosts.slice(0, 3).map((post, i) => (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="rounded-3xl overflow-hidden"
                    style={{ background: theme.postGradient, border: `1px solid ${theme.cardBorder}` }}>
                    <div className="p-4">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div style={{ ...frameStyle, borderRadius: '50%' }}>
                          <UserAvatarDisplay profile={previewProfile} size={34} fallback={(displayUsername?.[0] || '✨').toUpperCase()} showRing={false} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">@{displayUsername}</p>
                          <p className="text-[10px] text-gray-500">{new Date(post.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-100 leading-relaxed">{post.content}</p>
                    </div>
                    <div className="px-4 pb-3 flex items-center gap-1 flex-wrap">
                      {REACTIONS.map(emoji => (
                        <div key={emoji} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#6b7280' }}>
                          {emoji}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Photos preview */}
          {allPhotos.length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: theme.accent }}>Photos</p>
              <div className="grid grid-cols-3 gap-2 pb-8">
                {allPhotos.map((photo, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden"
                    style={{ border: `1px solid ${theme.cardBorder}` }}>
                    <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.8),transparent)' }}>
                      <p className="text-[9px] text-white/70 capitalize truncate">{photo.label}</p>
                    </div>
                  </div>
                ))}
              </div>
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