import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Helper: delete all records for a user from an entity using user_email field, paginating until done
async function deleteAllByEmail(serviceRole, entityName, email, fieldName = 'user_email') {
  let deleted = 0;
  while (true) {
    const query = { [fieldName]: email };
    const records = await serviceRole.entities[entityName].filter(query, '-created_date', 100);
    if (!records || records.length === 0) break;
    await Promise.all(records.map(r => serviceRole.entities[entityName].delete(r.id)));
    deleted += records.length;
    if (records.length < 100) break;
  }
  return deleted;
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

    // Entities using user_email field
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

    // Run all data deletions - errors are swallowed so User deletion always runs
    try {
      await Promise.all([
        ...userEmailEntities.map(entityName =>
          deleteAllByEmail(sr, entityName, email).catch(e =>
            console.log(`Skip ${entityName}: ${e.message}`)
          )
        ),
        (async () => {
          await Promise.all([
            deleteAllByEmail(sr, 'GlowFollow', email, 'follower_email').catch(() => {}),
            deleteAllByEmail(sr, 'GlowFollow', email, 'followed_email').catch(() => {}),
          ]);
        })(),
        (async () => {
          await Promise.all([
            deleteAllByEmail(sr, 'ChatMessage', email, 'sender_email').catch(() => {}),
            deleteAllByEmail(sr, 'ChatMessage', email, 'receiver_email').catch(() => {}),
          ]);
        })(),
        deleteAllByEmail(sr, 'Notification', email, 'recipient_email').catch(() => {}),
      ]);
    } catch (e) {
      console.log(`Data cleanup error (continuing): ${e.message}`);
    }

    // Always delete the auth user — this frees the email for re-registration
    await base44.asServiceRole.entities.User.delete(user.id);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});