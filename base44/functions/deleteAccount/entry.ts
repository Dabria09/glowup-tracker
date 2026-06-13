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
      return Response.json({ error: 'Type DELETE to confirm account deletion.' }, { status: 400 });
    }

    const email = user.email;

    // Delete all associated app data first
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
      'DeletedAccount',
    ];

    const cleanupTargets = [
      ...userEmailEntities.map(entityName => ({ entityName, fieldName: 'user_email' })),
      { entityName: 'DeletedAccount', fieldName: 'email' },
      { entityName: 'GlowFollow', fieldName: 'follower_email' },
      { entityName: 'GlowFollow', fieldName: 'followed_email' },
      { entityName: 'ChatMessage', fieldName: 'sender_email' },
      { entityName: 'ChatMessage', fieldName: 'receiver_email' },
      { entityName: 'Notification', fieldName: 'recipient_email' },
    ];

    await Promise.all(cleanupTargets.map(async ({ entityName, fieldName }) => {
      try {
        await deleteAllByEmail(sr, entityName, email, fieldName);
      } catch (e) {
        console.warn(`Cleanup failed for ${entityName}.${fieldName}:`, e.message);
      }
    }));

    // Also remove the User entity row entirely
    try {
      await sr.entities.User.delete(user.id);
    } catch (e) {
      console.warn('User entity delete failed (non-blocking):', e.message);
    }

    // Hard-delete the auth credentials so the email is immediately free
    let authDeleted = false;
    try {
      await base44.auth.deleteMe();
      authDeleted = true;
    } catch (e) {
      console.error('deleteMe error (may be app owner):', e.message);
      // Fall back: soft-delete marker so sign-in is still blocked
      try {
        await base44.auth.updateMe({ isDeleted: true, deleted_at: new Date().toISOString() });
      } catch {}
    }

    return Response.json({ success: true, type: authDeleted ? 'hard_delete' : 'soft_delete' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});