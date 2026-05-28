import { base44 } from '@/api/base44Client';

// Point values per action — higher value = more meaningful activity
export const POINT_VALUES = {
  // Daily engagement (low-medium)
  daily_checkin: 10,
  grocery_item: 5,
  scholarship_saved: 10,
  shoutout_given: 10,
  contact_added: 5,

  // Content & creativity (medium)
  diary_entry: 15,
  sticky_note: 5,
  glow_feed_post: 15,
  glow_board_post: 20,
  community_post: 15,
  vision_board_item: 15,
  recipe_added: 20,
  kitchen_post: 15,
  shout_out_post: 10,
  book_club: 20,

  // Health & wellness (medium-high)
  fitness_log: 20,
  meal_plan_created: 20,
  cycle_tracked: 15,
  calm_corner: 25,
  spiritual_habit: 20,
  gratitude_entry: 15,

  // Growth & learning (high)
  daily_task: 25,
  savings_goal: 25,
  job_application: 20,
  homework_task: 15,
  glow_score_check: 10,
  lesson_completed: 30,

  // Challenges (highest)
  challenge_day: 30,
  weekly_challenge: 100,
  glow_up_challenge: 200,
  mentor_session: 50,
};

export const DEFAULT_CERT_THRESHOLDS = {
  glow_starter:      100,
  rising_star:       500,
  glow_girl:         1000,
  glow_queen:        2500,
  diamond_glow:      5000,
  legendary_glower:  10000,
};

export const DEFAULT_LEVEL_THRESHOLDS = {
  level_rising:    50,
  level_star:      200,
  level_icon:      500,
  level_legendary: 1000,
};

export const CERTIFICATES = [
  {
    id: 'glow_starter',
    name: 'Glow Starter',
    emoji: '⭐',
    points: 100,
    color: '#a78bfa',
    gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    description: 'Your glow journey begins! You\'ve taken your first steps.',
  },
  {
    id: 'rising_star',
    name: 'Rising Star',
    emoji: '🌟',
    points: 500,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #d97706, #fbbf24)',
    description: 'You\'re on the rise! Consistent effort is paying off.',
  },
  {
    id: 'glow_girl',
    name: 'Glow Girl',
    emoji: '💫',
    points: 1000,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #be185d, #ec4899)',
    description: 'Glowing from the inside out. The community sees you!',
  },
  {
    id: 'glow_queen',
    name: 'Glow Queen',
    emoji: '👑',
    points: 2500,
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #b45309, #FFD700)',
    description: 'Royalty in the making. Your dedication is undeniable.',
  },
  {
    id: 'diamond_glow',
    name: 'Diamond Glow',
    emoji: '💎',
    points: 5000,
    color: '#67e8f9',
    gradient: 'linear-gradient(135deg, #0891b2, #67e8f9)',
    description: 'Rare, brilliant, unstoppable. You inspire everyone around you.',
  },
  {
    id: 'legendary_glower',
    name: 'Legendary Glower',
    emoji: '🏆',
    points: 10000,
    color: '#FF1F8E',
    gradient: 'linear-gradient(135deg, #FF1F8E, #a855f7, #FFD700)',
    description: 'The pinnacle of glowing up. You are a legend.',
  },
];

const ACTION_META = {
  daily_checkin:     { label: 'Daily Check-In', emoji: '✦' },
  grocery_item:      { label: 'Grocery Item Added', emoji: '🛒' },
  scholarship_saved: { label: 'Scholarship Saved', emoji: '🎓' },
  shoutout_given:    { label: 'Shout Out Given', emoji: '📣' },
  contact_added:     { label: 'Contact Added', emoji: '📞' },
  diary_entry:       { label: 'Diary Entry', emoji: '📔' },
  sticky_note:       { label: 'Sticky Note', emoji: '📝' },
  glow_feed_post:    { label: 'Glow Feed Post', emoji: '📸' },
  glow_board_post:   { label: 'Glow Board Post', emoji: '🖼️' },
  community_post:    { label: 'Community Post', emoji: '💬' },
  vision_board_item: { label: 'Vision Board Item', emoji: '✨' },
  recipe_added:      { label: 'Recipe Added', emoji: '🍳' },
  kitchen_post:      { label: 'Kitchen Post', emoji: '🥘' },
  book_club:         { label: 'Book Club Activity', emoji: '📚' },
  fitness_log:       { label: 'Fitness Log', emoji: '💪' },
  meal_plan_created: { label: 'Meal Plan Created', emoji: '🥗' },
  cycle_tracked:     { label: 'Cycle Tracked', emoji: '🌸' },
  calm_corner:       { label: 'Calm Corner Session', emoji: '🧘' },
  spiritual_habit:   { label: 'Spiritual Habit', emoji: '🙏' },
  gratitude_entry:   { label: 'Gratitude Entry', emoji: '💖' },
  daily_task:        { label: 'Daily Task Completed', emoji: '✅' },
  savings_goal:      { label: 'Savings Goal Set', emoji: '💰' },
  job_application:   { label: 'Job Application', emoji: '💼' },
  homework_task:     { label: 'Homework Task', emoji: '📖' },
  lesson_completed:  { label: 'Lesson Completed', emoji: '🎓' },
  challenge_day:     { label: 'Challenge Day', emoji: '🔥' },
  weekly_challenge:  { label: 'Weekly Challenge', emoji: '🏅' },
  glow_up_challenge: { label: 'Glow Up Challenge', emoji: '👑' },
  mentor_session:    { label: 'Mentor Session', emoji: '🤝' },
};

// In-memory cache for admin-configured point values
let _configCache = null;

async function getConfiguredPoints(action) {
  // Use window cache to avoid refetch within same session
  if (typeof window !== 'undefined' && window.__pointsConfigCache) {
    return window.__pointsConfigCache[action] ?? POINT_VALUES[action] ?? 0;
  }
  try {
    const configs = await base44.entities.PointsConfig.list();
    if (configs.length > 0) {
      const parsed = JSON.parse(configs[0].config_json || '{}');
      const merged = { ...POINT_VALUES, ...parsed };
      if (typeof window !== 'undefined') window.__pointsConfigCache = merged;
      return merged[action] ?? 0;
    }
  } catch {}
  return POINT_VALUES[action] ?? 0;
}

// Actions that can only be awarded once per calendar day
const DAILY_CAPPED_ACTIONS = new Set([
  'daily_checkin', 'diary_entry', 'fitness_log', 'cycle_tracked',
  'calm_corner', 'gratitude_entry', 'spiritual_habit', 'glow_score_check',
]);

function getLocalDateStr() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
}

export async function awardPoints(userEmail, action) {
  const pts = await getConfiguredPoints(action);
  if (!pts || !userEmail) return 0;

  // Daily deduplication guard
  if (DAILY_CAPPED_ACTIONS.has(action)) {
    const todayStr = getLocalDateStr();
    try {
      const recentHistory = await base44.entities.PointsHistory.filter(
        { user_email: userEmail, action },
        '-created_date',
        5
      );
      const alreadyToday = recentHistory.some(
        h => h.created_date?.slice(0, 10) === todayStr
      );
      if (alreadyToday) return 0; // already awarded today, skip
    } catch {}
  }

  try {
    const existing = await base44.entities.UserPoints.filter({ user_email: userEmail });
    if (existing.length > 0) {
      const newTotal = (existing[0].total_points || 0) + pts;
      await base44.entities.UserPoints.update(existing[0].id, {
        total_points: newTotal,
        last_updated: new Date().toISOString(),
      });
      await base44.entities.PointsHistory.create({
        user_email: userEmail, action,
        label: ACTION_META[action]?.label || action,
        emoji: ACTION_META[action]?.emoji || '✨',
        points: pts, total_after: newTotal,
      });
      return newTotal;
    } else {
      const newTotal = pts;
      await base44.entities.UserPoints.create({
        user_email: userEmail,
        total_points: newTotal,
        last_updated: new Date().toISOString(),
      });
      await base44.entities.PointsHistory.create({
        user_email: userEmail, action,
        label: ACTION_META[action]?.label || action,
        emoji: ACTION_META[action]?.emoji || '✨',
        points: pts, total_after: newTotal,
      });
      return newTotal;
    }
  } catch (err) {
    console.error('Error awarding points:', err);
    return 0;
  }
}

export async function getUserPoints(userEmail) {
  try {
    const existing = await base44.entities.UserPoints.filter({ user_email: userEmail });
    return existing.length > 0 ? existing[0].total_points || 0 : 0;
  } catch {
    return 0;
  }
}

// Merge static CERTIFICATES with any admin-configured thresholds from cache
function getConfiguredCertificates() {
  const cache = (typeof window !== 'undefined' && window.__pointsConfigCache) || {};
  return CERTIFICATES.map(c => ({
    ...c,
    points: cache[`cert_${c.id}`] ?? c.points,
  }));
}

export function getGlowLevelThresholds() {
  const cache = (typeof window !== 'undefined' && window.__pointsConfigCache) || {};
  return {
    rising:    cache['level_rising']    ?? DEFAULT_LEVEL_THRESHOLDS.level_rising,
    star:      cache['level_star']      ?? DEFAULT_LEVEL_THRESHOLDS.level_star,
    icon:      cache['level_icon']      ?? DEFAULT_LEVEL_THRESHOLDS.level_icon,
    legendary: cache['level_legendary'] ?? DEFAULT_LEVEL_THRESHOLDS.level_legendary,
  };
}

export function getEarnedCertificates(totalPoints) {
  return getConfiguredCertificates().filter(c => totalPoints >= c.points);
}

export function getNextCertificate(totalPoints) {
  return getConfiguredCertificates().find(c => totalPoints < c.points) || null;
}