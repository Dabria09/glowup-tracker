import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    for (let i = 0; i < entitiesToDelete.length; i++) {
      const entityName = entitiesToDelete[i];
      try {
        const records = await base44.asServiceRole.entities[entityName].filter({ user_email: user.email });
        for (const record of records) {
          await base44.asServiceRole.entities[entityName].delete(record.id);
          await sleep(80);
        }
      } catch (e) {
        console.log(`Could not delete ${entityName}:`, e.message);
      }
      // Small pause between entities to avoid rate limits
      await sleep(150);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});