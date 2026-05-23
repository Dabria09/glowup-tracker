import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const conversation_id = url.searchParams.get('conversation_id');
    
    if (!conversation_id) {
      return Response.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    const messages = await base44.entities.ChatMessage.filter(
      { conversation_id },
      'timestamp',
      50
    );

    return Response.json({ messages });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});