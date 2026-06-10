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

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { targetEmail } = await req.json();
    if (!targetEmail) {
      return Response.json({ error: 'targetEmail is required' }, { status: 400 });
    }

    const sr = base44.asServiceRole;

    // Find the target user record
    const users = await sr.entities.User.filter({ email: targetEmail });
    if (!users || users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const targetUserId = users[0].id;

    // Step 1: Destroy auth credentials FIRST
    await sr.entities.User.delete(targetUserId);

    // Step 2: Delete all associated data in parallel
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
      ...userEmailEntities.map(name => deleteAllByEmail(sr, name, targetEmail).catch(() => {})),
      deleteAllByEmail(sr, 'GlowFollow', targetEmail, 'follower_email').catch(() => {}),
      deleteAllByEmail(sr, 'GlowFollow', targetEmail, 'followed_email').catch(() => {}),
      deleteAllByEmail(sr, 'ChatMessage', targetEmail, 'sender_email').catch(() => {}),
      deleteAllByEmail(sr, 'ChatMessage', targetEmail, 'receiver_email').catch(() => {}),
      deleteAllByEmail(sr, 'Notification', targetEmail, 'recipient_email').catch(() => {}),
    ]);

    return Response.json({ success: true, deleted: targetEmail });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});