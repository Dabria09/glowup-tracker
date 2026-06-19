import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * syncGlowLevel - Automatically updates user's Glow Level based on total points.
 * Called after any points-earning action to ensure levels stay in sync.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get user's total points
    const userPoints = await base44.entities.UserPoints.filter({ user_email: user.email });
    if (!userPoints.length) {
      return Response.json({ 
        success: true, 
        message: 'No points record found',
        level: null 
      });
    }

    const totalPoints = userPoints[0].total_points || 0;

    // Fetch active Glow Levels
    const levels = await base44.entities.GlowLevel.filter({ is_active: true }, 'level_number');
    if (!levels.length) {
      return Response.json({ 
        success: true, 
        message: 'No levels configured',
        level: null 
      });
    }

    // Find current level
    const currentLevel = levels.find(lvl => 
      totalPoints >= (lvl.min_points || 0) && 
      totalPoints < (lvl.max_points === 99999 ? Infinity : (lvl.max_points || Infinity))
    );

    if (!currentLevel) {
      return Response.json({ 
        success: true, 
        message: 'No matching level found',
        level: null 
      });
    }

    // Check if user has a profile to update
    const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
    
    let updated = false;
    if (profiles.length) {
      // Update user profile with current level
      await base44.entities.UserProfile.update(profiles[0].id, {
        glow_level: currentLevel.name,
        glow_level_number: currentLevel.level_number,
        glow_level_emoji: currentLevel.emoji,
      });
      updated = true;
    }

    // Determine next level
    const currentIdx = levels.findIndex(lvl => lvl.id === currentLevel.id);
    const nextLevel = levels[currentIdx + 1] || null;

    return Response.json({
      success: true,
      level: {
        id: currentLevel.id,
        name: currentLevel.name,
        level_number: currentLevel.level_number,
        emoji: currentLevel.emoji,
        min_points: currentLevel.min_points,
        max_points: currentLevel.max_points,
        unlock_reward: currentLevel.unlock_reward,
        unlock_type: currentLevel.unlock_type,
      },
      next_level: nextLevel ? {
        name: nextLevel.name,
        min_points: nextLevel.min_points,
      } : null,
      total_points: totalPoints,
      profile_updated: updated,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});