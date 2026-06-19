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
          const allUsers = await base44.entities.User.list();
          recipients = allUsers.map(u => ({ email: u.email, full_name: u.full_name }));
        } else if (announcement.send_to === 'specific_group' && announcement.group_id) {
          // Get group members
          const members = await base44.entities.GroupMember.filter({ group_id: announcement.group_id });
          recipients = members.map(m => ({ email: m.user_email, full_name: m.display_name || m.username || m.user_email }));
        }
        
        // Create notification for each recipient
        for (const recipient of recipients) {
          await base44.entities.Notification.create({
            recipient_email: recipient.email,
            type: 'announcement',
            actor_email: announcement.sent_by,
            actor_username: 'GGU Admin',
            title: announcement.title,
            message: announcement.body,
            is_read: false,
            created_date: now.toISOString(),
          });
        }
        
        // Update announcement status
        await base44.entities.Announcement.update(announcement.id, {
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