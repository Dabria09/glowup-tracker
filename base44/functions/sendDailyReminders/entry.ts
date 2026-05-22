import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Service role to get all users
    const allUsers = await base44.asServiceRole.entities.User.list();
    
    const today = new Date().toISOString().split('T')[0];
    
    for (const user of allUsers) {
      // Check if user has fitness log today
      const fitnessLogs = await base44.entities.FitnessLog.filter({ 
        user_email: user.email,
        date: today 
      });
      
      // Check if user has diary entry today
      const diaryEntries = await base44.entities.DiaryEntry.filter({ 
        user_email: user.email 
      });
      
      const hasDiaryToday = diaryEntries.some(entry => 
        entry.created_date.startsWith(today)
      );
      
      // Send reminder if no activity today
      if (fitnessLogs.length === 0 || !hasDiaryToday) {
        const missingActivities = [];
        if (fitnessLogs.length === 0) missingActivities.push('fitness log');
        if (!hasDiaryToday) missingActivities.push('diary entry');
        
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: '💜 Keep Your Glow Streak Going!',
          body: `Hey ${user.full_name || 'Glow Girl'}! ✨

We noticed you haven't completed your ${missingActivities.join(' and ')} today.

Don't let your streak die! Take a few minutes to:
${fitnessLogs.length === 0 ? '• Log your fitness activity 💪' : ''}
${!hasDiaryToday ? '• Write in your diary 📖' : ''}

Your future self will thank you for staying consistent! 👑

Keep glowing,
The GGU Team`
        });
        
        console.log(`Sent reminder to ${user.email}`);
      }
    }
    
    return Response.json({ 
      success: true, 
      message: 'Daily reminders sent',
      usersNotified: allUsers.length 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});