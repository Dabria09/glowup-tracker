import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function deleteAllByEmail(client, entityName, email, fieldName = 'user_email') {
  while (true) {
    const records = await client.entities[entityName].filter({ [fieldName]: email }, '-created_date', 100);
    if (!records || records.length === 0) break;
    await Promise.all(records.map(r => client.entities[entityName].delete(r.id)));
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

    const email = user.email;

    // Step 1: Delete all associated data using the user-scoped client (no service token needed)
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
      ...userEmailEntities.map(name => deleteAllByEmail(base44, name, email).catch(() => {})),
      deleteAllByEmail(base44, 'GlowFollow', email, 'follower_email').catch(() => {}),
      deleteAllByEmail(base44, 'GlowFollow', email, 'followed_email').catch(() => {}),
      deleteAllByEmail(base44, 'ChatMessage', email, 'sender_email').catch(() => {}),
      deleteAllByEmail(base44, 'ChatMessage', email, 'receiver_email').catch(() => {}),
      deleteAllByEmail(base44, 'Notification', email, 'recipient_email').catch(() => {}),
    ]);

    // Step 2: Mark the account as deleted FIRST so it stays detectable even if
    // the platform refuses to remove the auth credentials below. Sign-in relies
    // on isDeletedAccount() (isDeleted / deleted_at), so without this marker a
    // "deleted" account whose credentials survive could log straight back in.
    const deletionMarker = { isDeleted: true, deleted_at: new Date().toISOString() };
    let markerSet = false;
    try {
      await base44.auth.updateMe(deletionMarker);
      markerSet = true;
    } catch (e) {
      console.error('updateMe (soft-delete marker) error:', e.message);
    }
    try {
      await base44.entities.User.update(user.id, deletionMarker);
      markerSet = true;
    } catch (e) {
      console.error('User.update (soft-delete marker) error:', e.message);
    }

    // Step 3: Attempt to fully remove the auth user record (login credentials).
    let authDeleted = false;
    try {
      await base44.auth.deleteMe();
      authDeleted = true;
    } catch (e) {
      // App owner accounts (and some other cases) cannot be hard-deleted by the
      // platform. The soft-delete marker from Step 2 still blocks future sign-ins.
      console.error('deleteMe error (may be app owner):', e.message);
    }

    // Only report success if the account can no longer be signed into: either the
    // credentials were removed, or the soft-delete marker was persisted.
    if (!authDeleted && !markerSet) {
      return Response.json({
        success: false,
        error: 'Account deletion could not be completed. Please try again or contact support.',
      }, { status: 500 });
    }

    return Response.json({ success: true, type: authDeleted ? 'delete' : 'soft_delete' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});