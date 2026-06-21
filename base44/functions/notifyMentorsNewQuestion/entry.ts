import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Triggered by entity automation on AnonymousQuestion create — no user auth context
    const body = await req.json();
    const question = body.data || body;

    if (!question || !question.id) {
      return Response.json({ error: 'Invalid question data' }, { status: 400 });
    }

    // Fetch all approved mentors
    const mentors = await base44.asServiceRole.entities.Mentor.filter({ is_approved: true });

    if (!mentors || mentors.length === 0) {
      return Response.json({ success: true, notifications_sent: 0, message: 'No approved mentors found' });
    }

    const category = question.category || 'General';
    const fullQuestion = question.question || '';
    const preview = fullQuestion.slice(0, 80);
    const ellipsis = fullQuestion.length > 80 ? '…' : '';
    const inboxLink = '/mentor-dashboard?tab=Inbox';

    // Create in-app notifications for each mentor
    const notificationPromises = mentors.map(async (mentor) => {
      try {
        await base44.asServiceRole.entities.Notification.create({
          recipient_email: mentor.user_email,
          type: 'mentorship',
          actor_email: 'system',
          message: `💬 New anonymous question in ${category}: "${preview}${ellipsis}"`,
          link: inboxLink,
          is_read: false,
          priority: 'high',
          metadata: JSON.stringify({
            question_id: question.id,
            category: question.category,
            type: 'new_anonymous_question',
          }),
        });
      } catch (notifErr) {
        console.error(`Failed to notify mentor ${mentor.user_email}:`, notifErr.message);
      }
    });
    await Promise.all(notificationPromises);

    // Send email to each mentor
    const emailPromises = mentors.map(async (mentor) => {
      try {
        await base44.integrations.Core.SendEmail({
          to: mentor.user_email,
          subject: `💬 New Question Waiting in ${category} — Girls Glowing Up™ Mentor Inbox`,
          body: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #e8526d;">💬 A Girl Needs Your Wisdom</h2>
  <p style="font-size: 15px; color: #333;">Hi ${mentor.full_name || 'Mentor'},</p>
  <p style="font-size: 15px; color: #333;">A new anonymous question has just been posted in the <strong style="color: #a855f7;">${category}</strong> category. Be one of the first three mentors to claim it and share your guidance!</p>

  <div style="background: #f5f0f8; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #e8526d;">
    <p style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Question Preview</p>
    <p style="color: #333; font-style: italic; margin: 0;">"${preview}${ellipsis}"</p>
  </div>

  <div style="margin-top: 30px;">
    <a href="https://app.girlsglowingup.com${inboxLink}"
       style="display: inline-block; background: linear-gradient(135deg, #e8526d, #f1b610); color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px;">
      Open Mentor Inbox →
    </a>
  </div>

  <p style="color: #999; font-size: 12px; margin-top: 30px;">
    This is an automated mentor notification from Girls Glowing Up™. Only the first three mentors to claim a question will respond.
  </p>
</div>
          `,
        });
      } catch (emailErr) {
        console.error(`Failed to email mentor ${mentor.user_email}:`, emailErr.message);
      }
    });
    await Promise.all(emailPromises);

    return Response.json({
      success: true,
      notifications_sent: mentors.length,
      emails_sent: mentors.length,
      question_id: question.id,
    });
  } catch (error) {
    console.error('Mentor new-question notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});