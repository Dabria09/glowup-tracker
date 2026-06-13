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

    // Delete the User entity row via service role — this is the primary deletion
    // mechanism (mirrors adminDeleteUser which is known to work).
    // deleteMe() is attempted first as a clean auth-layer delete, but if it
    // fails (e.g. platform restriction), the sr.entities.User.delete is the fallback.
    let authDeleted = false;
    try {
      await base44.auth.deleteMe();
      authDeleted = true;
    } catch (e) {
      console.warn('deleteMe failed, falling back to sr entity delete:', e.message);
    }

    if (!authDeleted) {
      try {
        await sr.entities.User.delete(user.id);
        authDeleted = true;
      } catch (e) {
        console.error('sr.entities.User.delete also failed:', e.message);
      }
    } else {
      // deleteMe succeeded — also clean up the entity row
      try {
        await sr.entities.User.delete(user.id);
      } catch {}
    }

    if (!authDeleted) {
      return Response.json({
        success: false,
        error: 'Account deletion could not be completed. Please try again or contact support.',
      }, { status: 500 });
    }

    return Response.json({ success: true, type: 'hard_delete' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});