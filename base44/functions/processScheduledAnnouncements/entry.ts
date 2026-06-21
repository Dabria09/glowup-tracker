import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - admin only' }, { status: 403 });
    }

    const now = new Date();
    
    // Fetch all scheduled announcements that should be sent now
    const announcements = await base44.entities.Announcement.filter({ status: 'scheduled' });
    
    let processed = 0;
    let sent = 0;
    let errors = 0;

    for (const announcement of announcements) {
      try {
        const scheduledDate = new Date(announcement.scheduled_date);
        
        // Skip if not yet time
        if (scheduledDate > now) continue;
        
        // Determine recipients
        let recipients = [];
        
        if (announcement.send_to === 'all') {
          // Get all users
          const allUsers = await base44.asServiceRole.entities.User.list();
          recipients = allUsers.map(u => ({ email: u.email, full_name: u.full_name }));
        } else if (announcement.send_to === 'specific_group' && announcement.group_id) {
          // Get group members
          const members = await base44.asServiceRole.entities.GroupMember.filter({ group_id: announcement.group_id });
          recipients = members.map(m => ({ email: m.user_email, full_name: m.display_name || m.username || m.user_email }));
        }

        const uniqueRecipients = [...new Map(recipients.filter(r => r.email).map(r => [r.email.toLowerCase(), r])).values()];
        
        // Create notification for each recipient
        for (const recipient of uniqueRecipients) {
          await base44.asServiceRole.entities.Notification.create({
            recipient_email: recipient.email,
            type: 'announcement',
            actor_email: announcement.sent_by,
            actor_username: 'GGU Admin',
            message: `${announcement.title}: ${announcement.body}`,
            link: '/notifications',
            is_read: false,
            priority: 'medium',
            metadata: JSON.stringify({ announcement_id: announcement.id }),
          });
        }
        
        // Update announcement status
        await base44.asServiceRole.entities.Announcement.update(announcement.id, {
          status: 'sent',
          sent_date: now.toISOString(),
        });
        
        sent++;
        processed++;
      } catch (err) {
        console.error(`Error processing announcement ${announcement.id}:`, err);
        errors++;
      }
    }

    return Response.json({ 
      success: true, 
      processed, 
      sent, 
      errors,
      checked_at: now.toISOString() 
    });
  } catch (error) {
    console.error('Error in processScheduledAnnouncements:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});