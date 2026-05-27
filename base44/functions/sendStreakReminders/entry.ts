import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all users who have points (i.e., they've been active before)
    const allUserPoints = await base44.asServiceRole.entities.UserPoints.list();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check who already checked in today
    const todayCheckIns = await base44.asServiceRole.entities.DiaryEntry.list();
    const todayCheckedInEmails = new Set(
      todayCheckIns
        .filter(e => e.created_date && e.created_date.startsWith(todayStr))
        .map(e => e.created_by)
    );

    // Also check DailyCheckIn entity for today
    const dailyCheckIns = await base44.asServiceRole.entities.DailyCheckIn ? 
      [] : [];

    let reminded = 0;
    const errors = [];

    for (const userPts of allUserPoints) {
      const email = userPts.user_email;
      if (!email) continue;

      // Skip if they already did something today
      if (todayCheckedInEmails.has(email)) continue;

      // Check if last_updated was yesterday (streak at risk) or the day before (streak may be lost)
      const lastUpdated = userPts.last_updated 
        ? new Date(userPts.last_updated).toISOString().split('T')[0]
        : null;

      const isAtRisk = lastUpdated === yesterdayStr;
      if (!isAtRisk) continue;

      // Look up user info
      let userName = 'Glow Girl';
      try {
        const users = await base44.asServiceRole.entities.User.filter({ email });
        if (users.length > 0) userName = users[0].full_name || 'Glow Girl';
      } catch {}

      const totalPts = userPts.total_points || 0;

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          from_name: 'Girls Glowing Up',
          subject: '🔥 Your glow streak is on the line!',
          body: `
Hi ${userName}! 💕

Your glow streak is at risk of breaking today — don't let it slip away!

You've worked so hard to earn ${totalPts.toLocaleString()} points on your glow journey. One quick action is all it takes to keep your momentum going:

✦ Do your Daily Check-In
📔 Write a Diary Entry
✅ Complete a Daily Challenge
💪 Log a Fitness Activity

Any of these will keep your streak alive and earn you more points!

👉 Log in now: https://girlsglowingup.com/daily-checkin

You've got this, Glow Girl. We believe in you! ✨

— The Girls Glowing Up Team
          `.trim(),
        });
        reminded++;
      } catch (err) {
        errors.push({ email, error: err.message });
      }
    }

    return Response.json({
      success: true,
      total_checked: allUserPoints.length,
      reminders_sent: reminded,
      errors,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});