import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete ALL user-related entity records
    const entitiesToDelete = [
      'Mentor', 'TeenMentor', 'MentorApplication', 'UserProfile', 
      'UserPoints', 'PointsHistory', 'GlowFollow', 'Notification',
      'CommunityPost', 'PostReaction', 'PostComment', 'ShoutOut',
      'ChatMessage', 'DailyPollVote', 'AnonymousQuestion', 'MentorshipProgress',
      'SessionReport', 'ContestEntry', 'GratitudeEntry', 'SpiritualReflection',
      'SpiritualGoal', 'Affirmation', 'VisionBoardItem', 'CycleLog',
      'CycleSymptomLog', 'HomeworkTask', 'Trip', 'TripActivity', 'TripExpense',
      'TripDocument', 'TimeTask', 'GlowEvent', 'GlowTask', 'GlowGuest',
      'CleaningTask', 'StickyNote', 'CalendarEvent', 'Countdown', 'DiaryEntry',
      'FitnessLog', 'Contact', 'PasswordVault', 'Appointment', 'SavedQuote',
      'MoneyEntry', 'SavingsGoal', 'GlowUpPost', 'BookClubNomination',
      'BookClubVote', 'BookClubDiscussion', 'MealPlan', 'GroceryItem',
      'KitchenPost', 'Recipe', 'GlowBoard', 'TeamDiscussion', 'SquadContest',
      'TeamContest', 'SquadChallenge', 'GlowRoom', 'CommunityMember',
      'SpiritualProfile', 'VisionBoard', 'WeeklyChallenge', 'DailyTask',
      'KitchenBasic', 'GlowUpCertificate', 'ScholarshipWin', 'JobApplication',
      'MentorSession', 'PeerMentoringCircle', 'TeenMentorTraining',
      'SuccessStory', 'MentorshipResource', 'ParentConsent', 'GlowPass'
    ];

    for (const entityName of entitiesToDelete) {
      try {
        const records = await base44.asServiceRole.entities[entityName].filter({ user_email: user.email });
        for (const record of records) {
          await base44.asServiceRole.entities[entityName].delete(record.id);
        }
        // Also try filtering by email field variations
        try {
          const records2 = await base44.asServiceRole.entities[entityName].filter({ email: user.email });
          for (const record of records2) {
            await base44.asServiceRole.entities[entityName].delete(record.id);
          }
        } catch (e2) {
          // Ignore if entity doesn't have email field
        }
      } catch (e) {
        // Ignore entities that don't exist or can't be filtered
        console.log(`Could not delete ${entityName}:`, e.message);
      }
    }

    return Response.json({ 
      success: true, 
      message: 'All user data deleted. You may now delete your account via platform settings.' 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});