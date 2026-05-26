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

export async function awardPoints(userEmail, action) {
  const pts = POINT_VALUES[action];
  if (!pts || !userEmail) return 0;

  try {
    const existing = await base44.entities.UserPoints.filter({ user_email: userEmail });
    if (existing.length > 0) {
      const newTotal = (existing[0].total_points || 0) + pts;
      await base44.entities.UserPoints.update(existing[0].id, {
        total_points: newTotal,
        last_updated: new Date().toISOString(),
      });
      return newTotal;
    } else {
      await base44.entities.UserPoints.create({
        user_email: userEmail,
        total_points: pts,
        last_updated: new Date().toISOString(),
      });
      return pts;
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

export function getEarnedCertificates(totalPoints) {
  return CERTIFICATES.filter(c => totalPoints >= c.points);
}

export function getNextCertificate(totalPoints) {
  return CERTIFICATES.find(c => totalPoints < c.points) || null;
}