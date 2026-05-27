import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Default point values (mirrors pointsHelper.js POINT_VALUES)
const DEFAULT_POINT_VALUES = {
  daily_checkin: 10, grocery_item: 5, scholarship_saved: 10, shoutout_given: 10,
  contact_added: 5, diary_entry: 15, sticky_note: 5, glow_feed_post: 15,
  glow_board_post: 20, community_post: 15, vision_board_item: 15, recipe_added: 20,
  kitchen_post: 15, shout_out_post: 10, book_club: 20, fitness_log: 20,
  meal_plan_created: 20, cycle_tracked: 15, calm_corner: 25, spiritual_habit: 20,
  gratitude_entry: 15, daily_task: 25, savings_goal: 25, job_application: 20,
  homework_task: 15, glow_score_check: 10, lesson_completed: 30, challenge_day: 30,
  weekly_challenge: 100, glow_up_challenge: 200, mentor_session: 50,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Load current configured point values
    const configs = await base44.asServiceRole.entities.PointsConfig.list();
    let pointValues = { ...DEFAULT_POINT_VALUES };
    if (configs.length > 0) {
      try {
        const parsed = JSON.parse(configs[0].config_json || '{}');
        pointValues = { ...DEFAULT_POINT_VALUES, ...parsed };
      } catch {}
    }

    // Load all history records
    const allHistory = await base44.asServiceRole.entities.PointsHistory.list();

    // Group by user_email and sum totals using new point values
    const userTotals = {};
    for (const entry of allHistory) {
      const email = entry.user_email;
      if (!email) continue;
      if (!userTotals[email]) userTotals[email] = 0;
      // Use new configured value for this action, fall back to what was originally awarded
      const newPts = pointValues[entry.action] ?? entry.points ?? 0;
      userTotals[email] += newPts;
    }

    // Update each UserPoints record
    const allUserPoints = await base44.asServiceRole.entities.UserPoints.list();
    const userPointsMap = {};
    for (const up of allUserPoints) {
      if (up.user_email) userPointsMap[up.user_email] = up;
    }

    let updated = 0;
    let created = 0;
    for (const [email, total] of Object.entries(userTotals)) {
      if (userPointsMap[email]) {
        await base44.asServiceRole.entities.UserPoints.update(userPointsMap[email].id, {
          total_points: total,
          last_updated: new Date().toISOString(),
        });
        updated++;
      } else {
        await base44.asServiceRole.entities.UserPoints.create({
          user_email: email,
          total_points: total,
          last_updated: new Date().toISOString(),
        });
        created++;
      }
    }

    return Response.json({ success: true, users_updated: updated, users_created: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});