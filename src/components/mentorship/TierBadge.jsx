const TIER_CONFIG = {
  seed: {
    label: 'Seed',
    emoji: '🌱',
    color: '#84cc16',
    bg: 'rgba(132, 204, 22, 0.15)',
    border: 'rgba(132, 204, 22, 0.3)',
    description: 'New mentor just starting out',
    requirements: '0-2 sessions'
  },
  sprout: {
    label: 'Sprout',
    emoji: '🌿',
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'rgba(34, 197, 94, 0.3)',
    description: 'Gaining traction',
    requirements: '3-5 sessions'
  },
  bloom: {
    label: 'Bloom',
    emoji: '🌸',
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.15)',
    border: 'rgba(236, 72, 153, 0.3)',
    description: 'Established mentor',
    requirements: '6-15 sessions'
  },
  radiant: {
    label: 'Radiant',
    emoji: '✨',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.3)',
    description: 'High-performing mentor',
    requirements: '16-30 sessions, 4.5+ rating'
  },
  luminary: {
    label: 'Luminary',
    emoji: '👑',
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.3)',
    description: 'Top-tier mentor leader',
    requirements: '31+ sessions, 4.8+ rating'
  }
};

export function getTierConfig(tier) {
  return TIER_CONFIG[tier] || TIER_CONFIG.seed;
}

export function calculateTier(sessionsCount, avgRating) {
  if (sessionsCount >= 31 && avgRating >= 4.8) return 'luminary';
  if (sessionsCount >= 16 && avgRating >= 4.5) return 'radiant';
  if (sessionsCount >= 6) return 'bloom';
  if (sessionsCount >= 3) return 'sprout';
  return 'seed';
}

export default function TierBadge({ tier, size = 'md', showDescription = false }) {
  const config = getTierConfig(tier);
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className="flex flex-col items-center">
      <span
        className={`rounded-full font-bold ${sizeClasses[size]}`}
        style={{
          background: config.bg,
          color: config.color,
          border: `1px solid ${config.border}`
        }}
      >
        {config.emoji} {config.label}
      </span>
      {showDescription && (
        <>
          <p className="text-xs text-gray-400 mt-1">{config.description}</p>
          <p className="text-xs text-gray-500">{config.requirements}</p>
        </>
      )}
    </div>
  );
}