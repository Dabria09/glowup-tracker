import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { report, alertType } = await req.json();
    if (!report || !report.id) {
      return Response.json({ error: 'Invalid report data' }, { status: 400 });
    }

    // Get all admin users
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    if (!admins || admins.length === 0) {
      return Response.json({ error: 'No admins found' }, { status: 404 });
    }

    const priority = alertType === 'hate_speech' || alertType === 'harassment' ? 'urgent' : 
                     alertType === 'profanity' ? 'high' : 'medium';
    
    const emoji = priority === 'urgent' ? '🚨' : priority === 'high' ? '⚠️' : '📋';
    const urgencyText = priority === 'urgent' ? 'URGENT: ' : priority === 'high' ? 'High Priority: ' : '';
    
    const reviewLink = `/admin?tab=moderation&highlight=${report.id}`;
    const notifications = admins.map(async (admin) => {
      // Create in-app notification
      await base44.asServiceRole.entities.Notification.create({
        recipient_email: admin.email,
        type: 'moderation_alert',
        actor_email: report.reported_by || 'system',
        message: `${emoji} ${urgencyText}New ${report.content_type === 'shoutout' ? 'ShoutOut' : 'post'} reported for ${alertType.replace('_', ' ')}`,
        link: reviewLink,
        is_read: false,
        priority,
        metadata: JSON.stringify({
          report_id: report.id,
          content_type: report.content_type,
          content_id: report.reported_content_id,
          reason: report.reason,
          reported_by: report.reported_by,
        }),
      });
    });

    await Promise.all(notifications);

    // Send email for urgent/high priority
    if (priority === 'urgent' || priority === 'high') {
      const emailPromises = admins.map(async (admin) => {
        await base44.integrations.Core.SendEmail({
          to: admin.email,
          subject: `${emoji} ${urgencyText}Content Moderation Alert - Action Required`,
          body: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #e8526d;">${emoji} ${urgencyText}Content Reported</h2>
  
  <div style="background: #f5f0f8; padding: 20px; border-radius: 12px; margin: 20px 0;">
    <p><strong>Content Type:</strong> ${report.content_type === 'shoutout' ? 'ShoutOut' : 'Community Post'}</p>
    <p><strong>Reason:</strong> ${alertType.replace('_', ' ')}</p>
    <p><strong>Reported By:</strong> ${report.reported_by || 'Anonymous'}</p>
    <p><strong>Priority:</strong> <span style="color: ${priority === 'urgent' ? '#dc2626' : '#f97316'}; font-weight: bold;">${priority.toUpperCase()}</span></p>
  </div>
  
  ${report.content_snapshot ? `
  <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #e8526d;">
    <p style="color: #666; font-style: italic;">"${report.content_snapshot}"</p>
  </div>
  ` : ''}
  
  <div style="margin-top: 30px;">
    <a href="https://app.girlsglowingup.com${reviewLink}" 
       style="display: inline-block; background: linear-gradient(135deg, #e8526d, #a855f7); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
      Review Content →
    </a>
  </div>
  
  <p style="color: #999; font-size: 12px; margin-top: 30px;">
    This is an automated moderation alert from Girls Glowing Up™
  </p>
</div>
          `,
        });
      });
      await Promise.all(emailPromises);
    }

    return Response.json({ 
      success: true, 
      notifications_sent: admins.length,
      emails_sent: priority === 'urgent' || priority === 'high' ? admins.length : 0,
      priority 
    });
  } catch (error) {
    console.error('Moderation alert error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});