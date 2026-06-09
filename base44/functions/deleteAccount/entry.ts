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

    // Run all deletions in parallel, including special cases
    await Promise.all([
      // Standard user_email entities
      ...userEmailEntities.map(entityName =>
        deleteAllByEmail(sr, entityName, email).catch(e =>
          console.log(`Skip ${entityName}: ${e.message}`)
        )
      ),
      // GlowFollow: user appears as follower OR followed
      (async () => {
        try {
          await Promise.all([
            deleteAllByEmail(sr, 'GlowFollow', email, 'follower_email'),
            deleteAllByEmail(sr, 'GlowFollow', email, 'followed_email'),
          ]);
        } catch (e) { console.log(`Skip GlowFollow: ${e.message}`); }
      })(),
      // ChatMessage: user appears as sender OR receiver
      (async () => {
        try {
          await Promise.all([
            deleteAllByEmail(sr, 'ChatMessage', email, 'sender_email'),
            deleteAllByEmail(sr, 'ChatMessage', email, 'receiver_email'),
          ]);
        } catch (e) { console.log(`Skip ChatMessage: ${e.message}`); }
      })(),
      // Notification: user is recipient
      deleteAllByEmail(sr, 'Notification', email, 'recipient_email').catch(e =>
        console.log(`Skip Notification(recipient): ${e.message}`)
      ),
    ]);

    // Finally, delete the auth user account itself so they can't log back in
    await base44.asServiceRole.entities.User.delete(user.id);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});