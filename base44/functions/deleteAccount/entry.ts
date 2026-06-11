import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function deleteAllByEmail(client, entityName, email, fieldName = 'user_email') {
  const entity = client.entities?.[entityName];
  if (!entity) return { entityName, deleted: 0, skipped: true };
  let deleted = 0;
  while (true) {
    const records = await entity.filter({ [fieldName]: email }, '-created_date', 100);
    if (!records || records.length === 0) break;
    await Promise.all(records.map(r => entity.delete(r.id)));
    deleted += records.length;
    if (records.length < 100) break;
  }
  return { entityName, deleted, fieldName };
}

async function ensureAuthUserDeleted(sr, userId) {
  try {
    const record = await sr.entities.User.get(userId);
    if (record) {
      throw new Error('User auth record still exists after deletion.');
    }
  } catch (error) {
    const message = String(error?.message || '').toLowerCase();
    if (message.includes('still exists')) throw error;
    // Expected: Base44 throws when the record no longer exists.
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
    const userId = user.id;
    const sr = base44.asServiceRole;

    // Step 1: Delete the authentication/User record. Do not continue if this fails.
    if (typeof base44.auth.deleteMe === 'function') {
      await base44.auth.deleteMe();
    } else {
      await sr.entities.User.delete(userId);
    }

    // Some Base44 exports expose the auth user as the User entity. Verify it is gone,
    // and use the service-role deletion as a fallback if deleteMe only invalidated the session.
    try {
      await ensureAuthUserDeleted(sr, userId);
    } catch {
      await sr.entities.User.delete(userId);
      await ensureAuthUserDeleted(sr, userId);
    }

    // Step 2: Delete all associated data records in parallel using service-role access.
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

    const cleanupResults = await Promise.all([
      ...userEmailEntities.map(name => deleteAllByEmail(sr, name, email).catch(error => ({ entityName: name, error: error.message }))),
      deleteAllByEmail(sr, 'GlowFollow', email, 'follower_email').catch(error => ({ entityName: 'GlowFollow', fieldName: 'follower_email', error: error.message })),
      deleteAllByEmail(sr, 'GlowFollow', email, 'followed_email').catch(error => ({ entityName: 'GlowFollow', fieldName: 'followed_email', error: error.message })),
      deleteAllByEmail(sr, 'ChatMessage', email, 'sender_email').catch(error => ({ entityName: 'ChatMessage', fieldName: 'sender_email', error: error.message })),
      deleteAllByEmail(sr, 'ChatMessage', email, 'receiver_email').catch(error => ({ entityName: 'ChatMessage', fieldName: 'receiver_email', error: error.message })),
      deleteAllByEmail(sr, 'Notification', email, 'recipient_email').catch(error => ({ entityName: 'Notification', fieldName: 'recipient_email', error: error.message })),
    ]);

    return Response.json({ success: true, type: 'delete', cleanupResults });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});