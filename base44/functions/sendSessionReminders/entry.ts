import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all scheduled sessions for today and tomorrow
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const sessions = await base44.entities.MentorSession.filter({
      status: 'scheduled'
    });
    
    const upcomingSessions = sessions.filter(s => {
      const sessionDate = new Date(s.session_date);
      return sessionDate >= now && sessionDate <= tomorrow;
    });
    
    let remindersSent = 0;
    
    for (const session of upcomingSessions) {
      try {
        // Send reminder to mentee
        await base44.integrations.Core.SendEmail({
          to: session.mentee_email,
          subject: '🔔 Upcoming Mentorship Session Reminder',
          body: `Hi ${session.mentee_email.split('@')[0]},\n\nThis is a reminder about your upcoming mentorship session with ${session.mentor_email.split('@')[0]}.\n\n📅 Date: ${new Date(session.session_date).toLocaleDateString()}\n⏰ Time: ${new Date(session.session_date).toLocaleTimeString()}\n📝 Topic: ${session.topic || 'General'}\n💻 Type: ${session.session_type || 'Video Call'}\n\nWe're excited to see you there!\n\nBest regards,\nGGU Mentorship Team`
        });
        
        // Send reminder to mentor
        await base44.integrations.Core.SendEmail({
          to: session.mentor_email,
          subject: '🔔 Upcoming Mentorship Session Reminder',
          body: `Hi ${session.mentor_email.split('@')[0]},\n\nThis is a reminder about your upcoming mentorship session with ${session.mentee_email.split('@')[0]}.\n\n📅 Date: ${new Date(session.session_date).toLocaleDateString()}\n⏰ Time: ${new Date(session.session_date).toLocaleTimeString()}\n📝 Topic: ${session.topic || 'General'}\n💻 Type: ${session.session_type || 'Video Call'}\n\nThank you for being an amazing mentor!\n\nBest regards,\nGGU Mentorship Team`
        });
        
        remindersSent += 2;
      } catch (error) {
        console.error('Error sending reminder:', error);
      }
    }
    
    return Response.json({ 
      message: `Sent ${remindersSent} reminders`,
      sessions_count: upcomingSessions.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});