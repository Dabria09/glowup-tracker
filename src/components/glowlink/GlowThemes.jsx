// ── Glow Level System ─────────────────────────────────────────────────────────
export function getGlowLevel(points) {
  if (points >= 1000) return { level: 5, name: 'Legendary Glow', emoji: '👑', color: '#fbbf24', gradient: 'linear-gradient(135deg,#78350f,#fbbf24)', next: null };
  if (points >= 500)  return { level: 4, name: 'Icon Glow',      emoji: '💎', color: '#c084fc', gradient: 'linear-gradient(135deg,#4a044e,#c084fc)', next: 1000 };
  if (points >= 200)  return { level: 3, name: 'Star Glow',      emoji: '⭐', color: '#60a5fa', gradient: 'linear-gradient(135deg,#1e3a8a,#60a5fa)', next: 500  };
  if (points >= 50)   return { level: 2, name: 'Rising Glow',    emoji: '🌟', color: '#34d399', gradient: 'linear-gradient(135deg,#064e3b,#34d399)', next: 200  };
  return               { level: 1, name: 'Spark',             emoji: '⚡', color: '#f472b6', gradient: 'linear-gradient(135deg,#831843,#f472b6)', next: 50   };
}

// ── Profile Themes ─────────────────────────────────────────────────────────────
export const GLOW_THEMES = [
  {
    id: 'default',
    name: 'Glow Up',
    emoji: '✨',
    requiredPoints: 0,
    bg: '#0d0608',
    cardBg: 'rgba(255,255,255,0.05)',
    cardBorder: 'rgba(236,72,153,0.25)',
    accent: '#ec4899',
    accent2: '#a855f7',
    gradient: 'linear-gradient(135deg,#831843,#4c1d95)',
    textAccent: '#f9a8d4',
    glow: 'rgba(236,72,153,0.3)',
    postGradient: 'linear-gradient(135deg,rgba(196,74,85,0.15),rgba(168,85,247,0.15))',
  },
  {
    id: 'soft_girl',
    name: 'Soft Girl',
    emoji: '🌸',
    requiredPoints: 50,
    bg: '#130a10',
    cardBg: 'rgba(251,207,232,0.08)',
    cardBorder: 'rgba(244,114,182,0.3)',
    accent: '#f472b6',
    accent2: '#f9a8d4',
    gradient: 'linear-gradient(135deg,#9d174d,#fbcfe8)',
    textAccent: '#fbcfe8',
    glow: 'rgba(244,114,182,0.4)',
    postGradient: 'linear-gradient(135deg,rgba(244,114,182,0.12),rgba(251,207,232,0.12))',
  },
  {
    id: 'luxury',
    name: 'Luxury Glow',
    emoji: '💛',
    requiredPoints: 100,
    bg: '#0c0800',
    cardBg: 'rgba(251,191,36,0.06)',
    cardBorder: 'rgba(251,191,36,0.3)',
    accent: '#fbbf24',
    accent2: '#d97706',
    gradient: 'linear-gradient(135deg,#78350f,#fbbf24)',
    textAccent: '#fde68a',
    glow: 'rgba(251,191,36,0.35)',
    postGradient: 'linear-gradient(135deg,rgba(251,191,36,0.1),rgba(217,119,6,0.1))',
  },
  {
    id: 'y2k',
    name: 'Y2K',
    emoji: '🦋',
    requiredPoints: 150,
    bg: '#05001a',
    cardBg: 'rgba(167,139,250,0.08)',
    cardBorder: 'rgba(167,139,250,0.3)',
    accent: '#a78bfa',
    accent2: '#06b6d4',
    gradient: 'linear-gradient(135deg,#4c1d95,#0e7490)',
    textAccent: '#c4b5fd',
    glow: 'rgba(167,139,250,0.35)',
    postGradient: 'linear-gradient(135deg,rgba(167,139,250,0.12),rgba(6,182,212,0.12))',
  },
  {
    id: 'ceo',
    name: 'CEO Era',
    emoji: '👑',
    requiredPoints: 200,
    bg: '#030309',
    cardBg: 'rgba(251,191,36,0.05)',
    cardBorder: 'rgba(251,191,36,0.2)',
    accent: '#fbbf24',
    accent2: '#1e3a8a',
    gradient: 'linear-gradient(135deg,#0f172a,#fbbf24)',
    textAccent: '#fde68a',
    glow: 'rgba(251,191,36,0.3)',
    postGradient: 'linear-gradient(135deg,rgba(15,23,42,0.5),rgba(251,191,36,0.08))',
  },
  {
    id: 'angel',
    name: 'Angel Energy',
    emoji: '🤍',
    requiredPoints: 300,
    bg: '#0a0a12',
    cardBg: 'rgba(255,255,255,0.07)',
    cardBorder: 'rgba(255,255,255,0.25)',
    accent: '#e2e8f0',
    accent2: '#94a3b8',
    gradient: 'linear-gradient(135deg,#334155,#e2e8f0)',
    textAccent: '#f1f5f9',
    glow: 'rgba(226,232,240,0.4)',
    postGradient: 'linear-gradient(135deg,rgba(255,255,255,0.07),rgba(148,163,184,0.07))',
  },
  {
    id: 'cozy',
    name: 'Cozy Feminine',
    emoji: '🧸',
    requiredPoints: 400,
    bg: '#0c0805',
    cardBg: 'rgba(212,165,116,0.07)',
    cardBorder: 'rgba(212,165,116,0.3)',
    accent: '#d4a574',
    accent2: '#a8795a',
    gradient: 'linear-gradient(135deg,#44201a,#d4a574)',
    textAccent: '#fde8cc',
    glow: 'rgba(212,165,116,0.35)',
    postGradient: 'linear-gradient(135deg,rgba(212,165,116,0.1),rgba(168,121,90,0.1))',
  },
  {
    id: 'main_character',
    name: 'Main Character',
    emoji: '🎬',
    requiredPoints: 500,
    bg: '#050505',
    cardBg: 'rgba(239,68,68,0.07)',
    cardBorder: 'rgba(239,68,68,0.25)',
    accent: '#ef4444',
    accent2: '#1f2937',
    gradient: 'linear-gradient(135deg,#450a0a,#ef4444)',
    textAccent: '#fca5a5',
    glow: 'rgba(239,68,68,0.4)',
    postGradient: 'linear-gradient(135deg,rgba(239,68,68,0.1),rgba(31,41,55,0.2))',
  },
  {
    id: 'wellness',
    name: 'Wellness Era',
    emoji: '🌿',
    requiredPoints: 600,
    bg: '#030d07',
    cardBg: 'rgba(52,211,153,0.06)',
    cardBorder: 'rgba(52,211,153,0.25)',
    accent: '#34d399',
    accent2: '#059669',
    gradient: 'linear-gradient(135deg,#064e3b,#34d399)',
    textAccent: '#a7f3d0',
    glow: 'rgba(52,211,153,0.35)',
    postGradient: 'linear-gradient(135deg,rgba(52,211,153,0.1),rgba(5,150,105,0.1))',
  },
  {
    id: 'dream_life',
    name: 'Dream Life',
    emoji: '💫',
    requiredPoints: 1000,
    bg: '#050010',
    cardBg: 'rgba(139,92,246,0.08)',
    cardBorder: 'rgba(99,102,241,0.35)',
    accent: '#818cf8',
    accent2: '#c084fc',
    gradient: 'linear-gradient(135deg,#1e1b4b,#818cf8,#c084fc)',
    textAccent: '#c7d2fe',
    glow: 'rgba(129,140,248,0.5)',
    postGradient: 'linear-gradient(135deg,rgba(129,140,248,0.12),rgba(192,132,252,0.12))',
  },
];

export function getTheme(themeId) {
  return GLOW_THEMES.find(t => t.id === themeId) || GLOW_THEMES[0];
}

// ── Profile Frames ─────────────────────────────────────────────────────────────
export const PROFILE_FRAMES = [
  { id: 'default',    name: 'Classic',     emoji: '⭕', requiredPoints: 0,    style: (color) => ({ border: `3px solid ${color}` }) },
  { id: 'sparkles',   name: 'Sparkles',    emoji: '✨', requiredPoints: 50,   style: (color) => ({ border: `3px solid ${color}`, boxShadow: `0 0 12px ${color}, 0 0 24px ${color}40` }) },
  { id: 'glitter',    name: 'Glitter',     emoji: '💫', requiredPoints: 100,  style: (color) => ({ border: `3px solid ${color}`, boxShadow: `0 0 0 3px rgba(255,255,255,0.2), 0 0 20px ${color}` }) },
  { id: 'butterflies',name: 'Butterflies', emoji: '🦋', requiredPoints: 150,  style: (color) => ({ border: `3px dashed ${color}`, boxShadow: `0 0 16px ${color}` }) },
  { id: 'stars',      name: 'Stars',       emoji: '⭐', requiredPoints: 200,  style: (color) => ({ border: `3px solid ${color}`, outline: `3px solid ${color}40`, outlineOffset: '3px' }) },
  { id: 'flames',     name: 'Flames',      emoji: '🔥', requiredPoints: 300,  style: (color) => ({ border: `3px solid ${color}`, boxShadow: `0 0 8px ${color}, 0 4px 20px rgba(239,68,68,0.5)` }) },
  { id: 'aura',       name: 'Aura Glow',   emoji: '🌟', requiredPoints: 400,  style: (color) => ({ border: `3px solid ${color}`, boxShadow: `0 0 0 6px ${color}20, 0 0 30px ${color}60, 0 0 60px ${color}30` }) },
  { id: 'crown',      name: 'Crown',       emoji: '👑', requiredPoints: 500,  style: (color) => ({ border: `3px solid ${color}`, boxShadow: `0 0 0 4px ${color}30, 0 0 40px ${color}`, background: `radial-gradient(circle at center, ${color}10, transparent)` }) },
];

export function getFrame(frameId) {
  return PROFILE_FRAMES.find(f => f.id === frameId) || PROFILE_FRAMES[0];
}

// ── Achievement Badges ─────────────────────────────────────────────────────────
export function computeBadges(points, streak, challenges, postCount) {
  const badges = [];
  const p = points || 0;
  const s = streak || 0;
  const c = challenges || 0;

  if (p >= 1)   badges.push({ id: 'spark',       emoji: '⚡', name: 'Spark',           desc: 'Started your glow journey'     });
  if (s >= 3)   badges.push({ id: 'streak3',     emoji: '🔥', name: '3-Day Streak',    desc: 'Checked in 3 days straight'    });
  if (s >= 7)   badges.push({ id: 'streak7',     emoji: '💥', name: 'Consistency',     desc: '7-day check-in streak'         });
  if (s >= 30)  badges.push({ id: 'streak30',    emoji: '🏆', name: 'Glow Legend',     desc: '30-day streak champion'        });
  if (c >= 1)   badges.push({ id: 'challenge1',  emoji: '✅', name: 'Challenger',      desc: 'Completed first challenge'     });
  if (c >= 5)   badges.push({ id: 'challenge5',  emoji: '👑', name: 'Confidence Queen',desc: '5 challenges completed'        });
  if (p >= 100) badges.push({ id: 'points100',   emoji: '💎', name: 'Diamond',         desc: 'Earned 100+ points'            });
  if (p >= 500) badges.push({ id: 'icon',        emoji: '🌟', name: 'Icon',            desc: 'Earned 500+ points'            });
  if (p >= 1000)badges.push({ id: 'legendary',   emoji: '✨', name: 'Legendary',       desc: 'Reached 1000 points'           });
  if (postCount >= 5) badges.push({ id: 'storyteller', emoji: '📝', name: 'Storyteller', desc: 'Shared 5+ posts'            });
  return badges;
}