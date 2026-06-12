import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function deleteAllByEmail(client, entityName, email, fieldName = 'user_email') {
  while (true) {
    const records = await client.entities[entityName].filter({ [fieldName]: email }, '-created_date', 100);
    if (!records || records.length === 0) break;
    await Promise.all(records.map(r => client.entities[entityName].delete(r.id)));
    if (records.length < 100) break;
  }
}

async function upsertDeletedAccount(client, user, deletedAt) {
  const payload = {
    email: user.email,
    user_id: user.id,
    deleted_at: deletedAt,
    reason: 'user_requested',
  };

  const existingByEmail = await client.entities.DeletedAccount.filter({ email: user.email });
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

    await Promise.all([
      ...userEmailEntities.map(name => deleteAllByEmail(sr, name, email).catch(() => {})),
      deleteAllByEmail(sr, 'GlowFollow', email, 'follower_email').catch(() => {}),
      deleteAllByEmail(sr, 'GlowFollow', email, 'followed_email').catch(() => {}),
      deleteAllByEmail(sr, 'ChatMessage', email, 'sender_email').catch(() => {}),
      deleteAllByEmail(sr, 'ChatMessage', email, 'receiver_email').catch(() => {}),
      deleteAllByEmail(sr, 'Notification', email, 'recipient_email').catch(() => {}),
    ]);

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