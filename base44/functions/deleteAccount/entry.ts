import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function deleteAllByEmail(client, entityName, email, fieldName = 'user_email') {
  let deletedCount = 0;
  while (true) {
    const records = await client.entities[entityName].filter({ [fieldName]: email }, '-created_date', 100);
    if (!records || records.length === 0) break;
    await Promise.all(records.map(r => client.entities[entityName].delete(r.id)));
    deletedCount += records.length;
    if (records.length < 100) break;
  }
  return deletedCount;
}

async function countByEmail(client, entityName, email, fieldName = 'user_email') {
  const records = await client.entities[entityName].filter({ [fieldName]: email }, '-created_date', 100);
  return records?.length || 0;
}

async function upsertDeletedAccount(client, user, deletedAt) {
  const normalizedEmail = String(user.email || '').trim().toLowerCase();
  const payload = {
    email: normalizedEmail,
    user_id: user.id,
    deleted_at: deletedAt,
    reason: 'user_requested',
  };

  const existingByEmail = await client.entities.DeletedAccount.filter({ email: normalizedEmail });
  const existing = existingByEmail?.find(record => record.user_id === user.id) || existingByEmail?.[0];
  if (existing) {
    return client.entities.DeletedAccount.update(existing.id, payload);
  }

  return client.entities.DeletedAccount.create(payload);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload = {};
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }

    const confirmation = String(payload.confirmation || '').trim();
    if (confirmation !== 'DELETE') {
      return Response.json({
        error: 'Type DELETE to confirm account deletion.'
      }, { status: 400 });
    }

    const email = user.email;

    // Keep a tombstone in the app User table. OAuth providers can leave an
    // authenticated browser session behind, so auth checks must have a durable
    // app-level signal that this account was deleted.
    const deletedAt = new Date().toISOString();
    const accountType = ['girl', 'mentor', 'linked'].includes(user.account_type) ? user.account_type : 'girl';
    const deletedUserFields = {
      email,
      role: user.role || 'user',
      isDeleted: true,
      is_deleted: true,
      deleted_at: deletedAt,
      deletedAt,
      account_type: accountType,
    };
    try {
      await upsertDeletedAccount(sr, user, deletedAt);
    } catch (e) {
      console.error('Failed to persist DeletedAccount blocklist record:', e.message);
      return Response.json({
        error: 'Could not record account deletion. Please try again.'
      }, { status: 500 });
    }
    try {
      await base44.auth.updateMe({
        isDeleted: true,
        is_deleted: true,
        deleted_at: deletedAt,
        deletedAt,
      });
    } catch (e) {
      console.error('Failed to mark auth user deleted:', e.message);
    }
    try {
      await sr.entities.User.update(user.id, deletedUserFields);
    } catch {
      try {
        await sr.entities.User.create({
          id: user.id,
          ...deletedUserFields,
        });
      } catch (e) {
        console.error('Failed to persist deleted User tombstone:', e.message);
      }
    }

    // Step 1: Delete all associated data with service-role access so records
    // from mentor/admin-managed flows are removed consistently.
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

    const cleanupTargets = [
      ...userEmailEntities.map(entityName => ({ entityName, fieldName: 'user_email' })),
      { entityName: 'GlowFollow', fieldName: 'follower_email' },
      { entityName: 'GlowFollow', fieldName: 'followed_email' },
      { entityName: 'ChatMessage', fieldName: 'sender_email' },
      { entityName: 'ChatMessage', fieldName: 'receiver_email' },
      { entityName: 'Notification', fieldName: 'recipient_email' },
    ];

    const cleanupResults = await Promise.all(cleanupTargets.map(async ({ entityName, fieldName }) => {
      try {
        const deleted = await deleteAllByEmail(sr, entityName, email, fieldName);
        const remaining = await countByEmail(sr, entityName, email, fieldName);
        return { entityName, fieldName, deleted, remaining };
      } catch (error) {
        return { entityName, fieldName, error: error.message || 'Cleanup failed' };
      }
    }));
    const cleanupFailures = cleanupResults.filter(result => result.error || result.remaining > 0);
    if (cleanupFailures.length > 0) {
      console.error('Account deletion cleanup incomplete:', cleanupFailures);
      return Response.json({
        error: 'Account deletion could not fully complete. Please try again or contact support.'
      }, { status: 500 });
    }

    // Step 2: Delete the auth user record (removes login credentials)
    try {
      await base44.auth.deleteMe();
    } catch (e) {
      // App owner accounts cannot be deleted by the platform — data is already cleaned up above
      console.error('deleteMe error (may be app owner):', e.message);
    }

    return Response.json({ success: true, type: 'delete' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});