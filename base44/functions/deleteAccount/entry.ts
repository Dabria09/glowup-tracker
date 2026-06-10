import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function deleteAllByEmail(sr, entityName, email, fieldName = 'user_email') {
  while (true) {
    const records = await sr.entities[entityName].filter({ [fieldName]: email }, '-created_date', 100);
    if (!records || records.length === 0) break;
    await Promise.all(records.map(r => sr.entities[entityName].delete(r.id)));
    if (records.length < 100) break;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sr = base44.asServiceRole;
    const email = user.email;
    const userId = user.id;

    // Step 1: Destroy auth credentials FIRST — permanently removes email/password from authentication.
    // Must happen before data cleanup so auth is always destroyed even if data cleanup fails.
    await sr.entities.User.delete(userId);

    // Step 2: Delete all associated data records (errors swallowed — auth already destroyed above)
    const userEmailEntities = [
      'UserProfile', 'UserPoints', 'PointsHistory',
      'Mentor', 'TeenMentor', 'MentorApplication', 'TeenMentorApplication',
      'MentorSession', 'MentorshipProgress', 'MentorshipBadge',
      'PeerMentoringCircle', 'TeenMentorTraining', 'SuccessStory',
      'MentorshipResource', 'ParentConsent', 'SessionReport',
      'Notification', 'CommunityPost', 'PostReaction', 'PostComment',
      'ShoutOut', 'CommunityMember', 'CommunityPoll', 'AnonymousQuestion',
      'TeamMember', 'SquadMember',
      'DailyPollVote', 'ContestEntry',
      'GratitudeEntry', 'SpiritualReflection', 'SpiritualGoal',
      'SpiritualHabit', 'SpiritualProfile', 'Affirmation',
      'VisionBoard', 'VisionBoardItem',
      'CycleLog', 'CycleSymptomLog', 'FitnessLog',
      'HomeworkTask', 'TimeTask', 'CleaningTask', 'DailyTask', 'WeeklyChallenge',
      'GlowUpChallenge',
      'Trip', 'TripActivity', 'TripExpense', 'TripDocument', 'TripPackItem',
      'GlowEvent', 'GlowTask', 'GlowGuest', 'GlowBudgetItem',
      'CalendarEvent', 'Countdown', 'DiaryEntry', 'StickyNote',
      'Contact', 'PasswordVault', 'Appointment', 'SavedQuote',
      'MoneyEntry', 'SavingsGoal',
      'GlowUpPost', 'GlowBoard', 'GlowRoom',
      'BookClubNomination', 'BookClubVote', 'BookClubDiscussion', 'BookClubProgress',
      'MealPlan', 'GroceryItem', 'KitchenPost', 'Recipe', 'KitchenBasic',
      'TeamDiscussion', 'SquadContest', 'TeamContest', 'SquadChallenge',
      'JobApplication', 'ScholarshipWin',
      'GlowUpCertificate',
    ];

    await Promise.all([
      ...userEmailEntities.map(name => deleteAllByEmail(sr, name, email).catch(() => {})),
      deleteAllByEmail(sr, 'GlowFollow', email, 'follower_email').catch(() => {}),
      deleteAllByEmail(sr, 'GlowFollow', email, 'followed_email').catch(() => {}),
      deleteAllByEmail(sr, 'ChatMessage', email, 'sender_email').catch(() => {}),
      deleteAllByEmail(sr, 'ChatMessage', email, 'receiver_email').catch(() => {}),
      deleteAllByEmail(sr, 'Notification', email, 'recipient_email').catch(() => {}),
    ]);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});