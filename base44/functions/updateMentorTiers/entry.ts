import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get rank configurations from database
    const rankConfigs = await base44.entities.MentorRankConfig.filter({ is_active: true });
    const tierThresholds = {};
    rankConfigs.forEach(config => {
      tierThresholds[config.rank_tier] = {
        min_sessions: config.min_sessions || 0,
        min_rating: config.min_rating || 0,
      };
    });
    
    // Get all approved mentors
    const mentors = await base44.entities.Mentor.filter({ is_approved: true });
    
    let updatedCount = 0;
    
    for (const mentor of mentors) {
      try {
        // Get completed sessions
        const sessions = await base44.entities.MentorSession.filter({
          mentor_email: mentor.user_email,
          status: 'completed'
        });
        
        const sessionsCount = sessions.length;
        
        // Get rated sessions
        const ratedSessions = sessions.filter(s => s.rating && s.rating > 0);
        const avgRating = ratedSessions.length > 0
          ? ratedSessions.reduce((sum, s) => sum + s.rating, 0) / ratedSessions.length
          : 0;
        
        // Determine tier based on database thresholds
        let newTier = 'seed';
        const tiers = ['luminary', 'radiant', 'bloom', 'sprout', 'seed'];
        
        for (const tier of tiers) {
          const threshold = tierThresholds[tier];
          if (!threshold) continue;
          
          const meetsSessions = sessionsCount >= threshold.min_sessions;
          const meetsRating = avgRating >= threshold.min_rating;
          
          if (meetsSessions && meetsRating) {
            newTier = tier;
            break;
          }
        }
        
        // Update if tier changed
        if (mentor.mentor_tier !== newTier) {
          await base44.entities.Mentor.update(mentor.id, {
            mentor_tier: newTier,
            rating: avgRating,
            sessions_count: sessionsCount
          });
          updatedCount++;
        }
      } catch (error) {
        console.error('Error updating mentor:', error);
      }
    }
    
    return Response.json({ 
      message: `Updated ${updatedCount} mentors`,
      total_mentors: mentors.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});