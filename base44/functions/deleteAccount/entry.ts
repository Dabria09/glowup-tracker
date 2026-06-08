import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entitiesToDelete = [
      // Profile & Points
      'UserProfile', 'UserPoints', 'PointsHistory',
      // Mentor
      'Mentor', 'TeenMentor', 'MentorApplication', 'TeenMentorApplication',
      'MentorSession', 'MentorshipProgress', 'MentorshipBadge',
      'PeerMentoringCircle', 'TeenMentorTraining', 'SuccessStory',
      'MentorshipResource', 'ParentConsent', 'SessionReport',
      // Social / Community
      'GlowFollow', 'Notification', 'CommunityPost', 'PostReaction',
      'PostComment', 'ShoutOut', 'CommunityMember', 'CommunityPoll',
      'AnonymousQuestion',
      // Teams & Squads
      'TeamMember', 'SquadMember',
      // Chat
      'ChatMessage',
      // Polls & Votes
      'DailyPollVote',
      // Contests
      'ContestEntry',
      // Spiritual / Wellness
      'GratitudeEntry', 'SpiritualReflection', 'SpiritualGoal',
      'SpiritualHabit', 'SpiritualProfile', 'Affirmation',
      // Vision
      'VisionBoard', 'VisionBoardItem',
      // Health
      'CycleLog', 'CycleSymptomLog', 'FitnessLog',
      // Tasks & Planning
      'HomeworkTask', 'TimeTask', 'CleaningTask', 'DailyTask', 'WeeklyChallenge',
      // Glow Up Challenges
      'GlowUpChallenge',
      // Events & Trips
      'Trip', 'TripActivity', 'TripExpense', 'TripDocument', 'TripPackItem',
      'GlowEvent', 'GlowTask', 'GlowGuest', 'GlowBudgetItem',
      // Personal Tools
      'CalendarEvent', 'Countdown', 'DiaryEntry', 'StickyNote',
      'Contact', 'PasswordVault', 'Appointment', 'SavedQuote',
      // Finance
      'MoneyEntry', 'SavingsGoal',
      // Social Feed
      'GlowUpPost', 'GlowBoard', 'GlowRoom',
      // Book Club
      'BookClubNomination', 'BookClubVote', 'BookClubDiscussion', 'BookClubProgress',
      // Kitchen
      'MealPlan', 'GroceryItem', 'KitchenPost', 'Recipe', 'KitchenBasic',
      // Teams
      'TeamDiscussion', 'SquadContest', 'TeamContest', 'SquadChallenge',
      // Career / Education
      'JobApplication', 'ScholarshipWin',
      // Certificates & Goals
      'GlowUpCertificate',
      // Glow Pass
      'GlowPass',
    ];

    // Run all entity deletions in parallel
    await Promise.all(
      entitiesToDelete.map(async (entityName) => {
        try {
          const records = await base44.asServiceRole.entities[entityName].filter({ user_email: user.email });
          if (records.length > 0) {
            await Promise.all(records.map(record =>
              base44.asServiceRole.entities[entityName].delete(record.id)
            ));
          }
        } catch (e) {
          console.log(`Could not delete ${entityName}:`, e.message);
        }
      })
    );

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});