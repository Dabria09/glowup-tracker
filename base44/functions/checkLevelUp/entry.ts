import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * checkLevelUp - Detects if user has leveled up and triggers celebration
 * Called after syncGlowLevel to check for level-up events
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get user's current level from profile
    const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
    if (!profiles.length) {
      return Response.json({ leveledUp: false, message: 'No profile found' });
    }

    const profile = profiles[0];
    const previousLevel = profile.glow_level_number || 0;
    const previousLevelName = profile.glow_level || 'Unknown';

    // Get all active levels
    const levels = await base44.entities.GlowLevel.filter({ is_active: true }, 'level_number');
    if (!levels.length) {
      return Response.json({ leveledUp: false, message: 'No levels configured' });
    }

    // Get user's total points
    const userPoints = await base44.entities.UserPoints.filter({ user_email: user.email });
    if (!userPoints.length) {
      return Response.json({ leveledUp: false, message: 'No points found' });
    }

    const totalPoints = userPoints[0].total_points || 0;

    // Find current level
    let currentLevel = null;
    for (const level of levels) {
      if (totalPoints >= (level.min_points || 0) && totalPoints < (level.max_points || 999999)) {
        currentLevel = level;
        break;
      }
    }

    if (!currentLevel && levels.length > 0) {
      currentLevel = levels[levels.length - 1];
    }

    if (!currentLevel) {
      return Response.json({ leveledUp: false, message: 'No matching level' });
    }

    const currentLevelNum = currentLevel.level_number || 0;
    const hasLeveledUp = currentLevelNum > previousLevel && previousLevel > 0;

    // Log the level-up event
    if (hasLeveledUp) {
      try {
        await base44.entities.PointsHistory.create({
          user_email: user.email,
          action: 'level_up',
          label: `Leveled Up to ${currentLevel.name}`,
          emoji: currentLevel.emoji,
          points: 0,
          total_after: totalPoints,
        });
      } catch (logErr) {
        console.warn('Failed to log level-up:', logErr);
      }
    }

    const responseData = {
      leveledUp: hasLeveledUp,
      currentLevel: {
        name: currentLevel.name,
        level_number: currentLevelNum,
        emoji: currentLevel.emoji,
        unlock_reward: currentLevel.unlock_reward,
        unlock_type: currentLevel.unlock_type,
      },
      previousLevel: previousLevel > 0 ? previousLevelName : null,
    };

    // If leveled up, create in-app notification for bell
    if (hasLeveledUp) {
      try {
        await base44.entities.Notification.create({
          recipient_email: user.email,
          type: 'level_up',
          message: `🎉 Congratulations! You've reached ${currentLevel.emoji} ${currentLevel.name}! Unlocked: ${currentLevel.unlock_emoji} ${currentLevel.unlock_reward}`,
          actor_email: 'system@ggu.app',
          actor_username: 'GGU Team',
          actor_avatar: null,
          link: '/glow-score',
          is_read: false,
          priority: 'high',
          metadata: JSON.stringify({
            previous_level: previousLevelName,
            new_level: currentLevel.name,
            level_number: currentLevelNum,
            unlock_reward: currentLevel.unlock_reward,
            unlock_type: currentLevel.unlock_type,
            emoji: currentLevel.emoji,
          }),
        });
        console.log('[checkLevelUp] Created level-up notification for', user.email);
      } catch (notifErr) {
        console.error('Failed to create level-up notification:', notifErr);
      }
    }

    return Response.json(responseData);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});