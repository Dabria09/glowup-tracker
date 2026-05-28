/**
 * UserAvatarDisplay — Renders the correct profile picture based on identity_type.
 * Reads: avatar_url, identity_type, active_persona_id, selected_icon_id, glow_persona_images
 * Use this everywhere: leaderboards, profiles, comments, squads, streaks, challenges.
 *
 * Props:
 *   profile   — UserProfile entity object (or null)
 *   size      — number in px (default 40)
 *   className — extra classes
 *   showRing  — show the glowing identity ring (default true)
 *   fallback  — fallback initial letter (e.g. first letter of name)
 */

import { useMemo } from 'react';

const AESTHETIC_ICONS = {
  moon_glow:      { emoji: '🌙', bg: 'linear-gradient(135deg,#1e1b4b,#4c1d95)' },
  star_field:     { emoji: '⭐', bg: 'linear-gradient(135deg,#0f172a,#1e3a5f)' },
  rose_bloom:     { emoji: '🌹', bg: 'linear-gradient(135deg,#4c0519,#881337)' },
  cherry_blossom: { emoji: '🌸', bg: 'linear-gradient(135deg,#831843,#9d174d)' },
  sunflower:      { emoji: '🌻', bg: 'linear-gradient(135deg,#713f12,#92400e)' },
  butterfly:      { emoji: '🦋', bg: 'linear-gradient(135deg,#5b21b6,#7c3aed)' },
  crown_queen:    { emoji: '👑', bg: 'linear-gradient(135deg,#78350f,#b45309)' },
  diamond:        { emoji: '💎', bg: 'linear-gradient(135deg,#0c4a6e,#075985)' },
  fire_spirit:    { emoji: '🔥', bg: 'linear-gradient(135deg,#7f1d1d,#b91c1c)' },
  lightning:      { emoji: '⚡', bg: 'linear-gradient(135deg,#1c1917,#292524)' },
  peacock:        { emoji: '🦚', bg: 'linear-gradient(135deg,#064e3b,#065f46)' },
  galaxy:         { emoji: '🌌', bg: 'linear-gradient(135deg,#1e1b4b,#312e81)' },
  cloud_nine:     { emoji: '☁️', bg: 'linear-gradient(135deg,#1e3a5f,#1e40af)' },
  crystal_ball:   { emoji: '🔮', bg: 'linear-gradient(135deg,#4a044e,#701a75)' },
  rainbow:        { emoji: '🌈', bg: 'linear-gradient(135deg,#1e1b4b,#4c1d95)' },
  lotus:          { emoji: '🪷', bg: 'linear-gradient(135deg,#500724,#881337)' },
  comet:          { emoji: '☄️', bg: 'linear-gradient(135deg,#0c0a09,#1c1917)' },
  dove:           { emoji: '🕊️', bg: 'linear-gradient(135deg,#172554,#1e3a8a)' },
  magic_wand:     { emoji: '🪄', bg: 'linear-gradient(135deg,#2e1065,#4c1d95)' },
  infinity:       { emoji: '♾️', bg: 'linear-gradient(135deg,#042f2e,#134e4a)' },
};

const RING_STYLES = {
  selfie:  { ring: 'rgba(236,72,153,0.5)',  glow: 'rgba(236,72,153,0.2)' },
  persona: { ring: 'rgba(168,85,247,0.6)',  glow: 'rgba(168,85,247,0.25)' },
  icon:    { ring: 'rgba(251,191,36,0.55)', glow: 'rgba(251,191,36,0.18)' },
};

export default function UserAvatarDisplay({
  profile,
  size = 40,
  className = '',
  showRing = true,
  fallback = '✨',
}) {
  const identityType = profile?.identity_type || 'selfie';
  const ring = RING_STYLES[identityType] || RING_STYLES.selfie;

  const content = useMemo(() => {
    // Icon identity
    if (identityType === 'icon' && profile?.selected_icon_id) {
      const icon = AESTHETIC_ICONS[profile.selected_icon_id];
      if (icon) {
        return {
          type: 'icon',
          emoji: icon.emoji,
          bg: icon.bg,
        };
      }
    }

    // Persona identity
    if (identityType === 'persona' && profile?.active_persona_id && profile?.glow_persona_images) {
      try {
        const parsed = JSON.parse(profile.glow_persona_images);
        const url = parsed.images?.[profile.active_persona_id];
        if (url) return { type: 'image', url };
      } catch {}
    }

    // Selfie / fallback
    if (profile?.avatar_url) return { type: 'image', url: profile.avatar_url };

    return { type: 'fallback', text: fallback };
  }, [profile, fallback, identityType]);

  const fontSize = Math.round(size * 0.44);
  const ringSize = showRing ? 2 : 0;

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...(content.type === 'icon' ? { background: content.bg } : { background: 'linear-gradient(135deg,#ec4899,#a855f7)' }),
    ...(showRing ? {
      boxShadow: `0 0 0 ${ringSize}px ${ring.ring}, 0 0 ${Math.round(size * 0.3)}px ${ring.glow}`,
    } : {}),
  };

  return (
    <div className={className} style={containerStyle}>
      {content.type === 'image' && (
        <img
          src={content.url}
          alt="profile"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
      {content.type === 'icon' && (
        <span style={{ fontSize, lineHeight: 1 }}>{content.emoji}</span>
      )}
      {content.type === 'fallback' && (
        <span style={{ fontSize: Math.round(size * 0.38), fontWeight: 700, color: 'white' }}>
          {typeof fallback === 'string' && fallback.length === 1 ? fallback : '✨'}
        </span>
      )}
    </div>
  );
}