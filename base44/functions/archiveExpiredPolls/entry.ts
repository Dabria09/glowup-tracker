import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const allPolls = await base44.entities.DailyPoll.filter({ is_active: true });
    
    let archived = 0;
    for (const poll of allPolls) {
      if (poll.scheduled_date && poll.scheduled_date < today) {
        await base44.entities.DailyPoll.update(poll.id, { is_active: false });
        archived++;
      }
    }

    return Response.json({ 
      success: true, 
      archived, 
      message: `Auto-archived ${archived} expired poll(s)` 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});