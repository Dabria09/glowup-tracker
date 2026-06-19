import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get user's total points
    const userPoints = await base44.entities.UserPoints.filter({ user_email: user.email });
    if (!userPoints.length) {
      return Response.json({ error: 'User points not found' }, { status: 404 });
    }
    const totalPoints = userPoints[0].total_points || 0;

    // Get all active Glow Levels sorted by level_number
    const levels = await base44.entities.GlowLevel.filter({ is_active: true }, 'level_number');
    if (!levels.length) {
      return Response.json({ error: 'No Glow Levels configured' }, { status: 404 });
    }

    // Find current level based on total points
    let currentLevel = null;
    for (const level of levels) {
      if (totalPoints >= (level.min_points || 0) && totalPoints < (level.max_points || 999999)) {
        currentLevel = level;
        break;
      }
    }

    // If no level found (points exceed all max), use the highest level
    if (!currentLevel) {
      currentLevel = levels[levels.length - 1];
    }

    // Check additional requirements (streak, badges, challenges)
    const requirementsMet = {
      points: true,
      streak: true,
      badges: true,
      challenges: true,
    };

    // Note: Streak, badges, and challenges would need additional entity queries
    // For now, we just return the level based on points
    // Future enhancement: add streak_requirement, badge_requirement, challenge_requirement validation

    return Response.json({
      success: true,
      currentLevel: {
        id: currentLevel.id,
        level_number: currentLevel.level_number,
        name: currentLevel.name,
        emoji: currentLevel.emoji,
        description: currentLevel.description,
        min_points: currentLevel.min_points,
        max_points: currentLevel.max_points,
        unlock_reward: currentLevel.unlock_reward,
        unlock_emoji: currentLevel.unlock_emoji,
        unlock_type: currentLevel.unlock_type,
      },
      totalPoints,
      requirementsMet,
      nextLevel: levels.find(l => l.level_number === (currentLevel.level_number || 0) + 1) || null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});