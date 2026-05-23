import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const mentors = await base44.entities.Mentor.list();
    const sessions = await base44.entities.MentorSession.filter({ status: 'completed' });

    const mentorStats = {};
    sessions.forEach(session => {
      if (!mentorStats[session.mentor_email]) {
        mentorStats[session.mentor_email] = { count: 0, totalRating: 0, ratingCount: 0 };
      }
      mentorStats[session.mentor_email].count++;
      if (session.rating && session.rating > 0) {
        mentorStats[session.mentor_email].totalRating += session.rating;
        mentorStats[session.mentor_email].ratingCount++;
      }
    });

    let updatedCount = 0;
    for (const mentor of mentors) {
      const stats = mentorStats[mentor.user_email] || { count: 0, totalRating: 0, ratingCount: 0 };
      const avgRating = stats.ratingCount > 0 ? stats.totalRating / stats.ratingCount : 0;
      
      let newTier;
      if (stats.count >= 31 && avgRating >= 4.8) newTier = 'luminary';
      else if (stats.count >= 16 && avgRating >= 4.5) newTier = 'radiant';
      else if (stats.count >= 6) newTier = 'bloom';
      else if (stats.count >= 3) newTier = 'sprout';
      else newTier = 'seed';

      if (mentor.mentor_tier !== newTier) {
        await base44.entities.Mentor.update(mentor.id, {
          mentor_tier: newTier,
          sessions_count: stats.count,
          rating: avgRating
        });
        updatedCount++;
      }
    }

    return Response.json({ 
      success: true, 
      message: `Updated ${updatedCount} mentor tiers`,
      updatedCount 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});