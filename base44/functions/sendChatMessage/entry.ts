import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversation_id, receiver_email, content } = await req.json();
    
    if (!conversation_id || !receiver_email || !content) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const message = await base44.entities.ChatMessage.create({
      conversation_id,
      sender_email: user.email,
      receiver_email,
      content,
      timestamp: new Date().toISOString(),
      is_read: false
    });

    return Response.json({ success: true, message });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});