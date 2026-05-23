import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    
    const upcomingSessions = await base44.entities.MentorSession.filter({ 
      status: 'scheduled'
    });
    
    const sessionsToRemind = upcomingSessions.filter(session => {
      const sessionDate = new Date(session.session_date);
      const timeUntilSession = sessionDate.getTime() - now.getTime();
      const hoursUntilSession = timeUntilSession / (1000 * 60 * 60);
      
      return hoursUntilSession > 0 && hoursUntilSession <= 24;
    });
    
    let remindersSent = 0;
    
    for (const session of sessionsToRemind) {
      try {
        const sessionDate = new Date(session.session_date);
        const formattedDate = sessionDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        const formattedTime = sessionDate.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        });
        
        const menteeSubject = `Reminder: Mentorship Session Tomorrow at ${formattedTime}`;
        const menteeBody = `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #ec4899;">🌟 Session Reminder</h2>
              <p>Hi there!</p>
              <p>This is a friendly reminder about your upcoming mentorship session:</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>📅 Date:</strong> ${formattedDate}</p>
                <p><strong>⏰ Time:</strong> ${formattedTime}</p>
                <p><strong>👩‍🏫 Mentor:</strong> ${session.mentor_email}</p>
                <p><strong>💬 Type:</strong> ${session.session_type || 'Video Call'}</p>
                ${session.topic ? `<p><strong>📝 Topic:</strong> ${session.topic}</p>` : ''}
              </div>
              <p>Please be ready a few minutes before the scheduled time.</p>
              <p>If you need to reschedule, please reach out to your mentor as soon as possible.</p>
              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                Best regards,<br>
                The Glow Mentorship Team
              </p>
            </body>
          </html>
        `;
        
        const mentorSubject = `Reminder: Session with Mentee Tomorrow at ${formattedTime}`;
        const mentorBody = `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #a855f7;">👩‍🏫 Session Reminder</h2>
              <p>Hello!</p>
              <p>You have an upcoming mentorship session scheduled:</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>📅 Date:</strong> ${formattedDate}</p>
                <p><strong>⏰ Time:</strong> ${formattedTime}</p>
                <p><strong>👤 Mentee:</strong> ${session.mentee_email}</p>
                <p><strong>💬 Type:</strong> ${session.session_type || 'Video Call'}</p>
                ${session.topic ? `<p><strong>📝 Topic:</strong> ${session.topic}</p>` : ''}
                ${session.notes ? `<p><strong>📋 Notes:</strong> ${session.notes}</p>` : ''}
              </div>
              <p>Please ensure you're prepared and available a few minutes early.</p>
              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                Thank you for being an amazing mentor!<br>
                The Glow Mentorship Team
              </p>
            </body>
          </html>
        `;
        
        await base44.integrations.Core.SendEmail({
          to: session.mentee_email,
          subject: menteeSubject,
          body: menteeBody
        });
        
        await base44.integrations.Core.SendEmail({
          to: session.mentor_email,
          subject: mentorSubject,
          body: mentorBody
        });
        
        remindersSent += 2;
      } catch (error) {
        console.error(`Error sending reminder for session ${session.id}:`, error);
      }
    }
    
    return Response.json({ 
      success: true, 
      message: `Sent ${remindersSent} reminders for ${sessionsToRemind.length} sessions`,
      sessionsCount: sessionsToRemind.length,
      remindersSent
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});