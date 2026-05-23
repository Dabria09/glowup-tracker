import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return Response.json({ error: 'Session ID required' }, { status: 400 });
    }
    
    // Get session details
    const session = await base44.entities.MentorSession.get(sessionId);
    
    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }
    
    // Verify user is part of the session
    if (session.mentor_email !== user.email && session.mentee_email !== user.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Generate Agora token
    const channelName = `mentorship_${sessionId}`;
    const uid = user.email === session.mentor_email ? 1 : 2; // Mentor=1, Mentee=2
    const tokenExpiration = 3600; // 1 hour
    
    const agoraResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate an Agora token for video call. Channel: ${channelName}, UID: ${uid}, Expiration: ${tokenExpiration}s`,
      add_context_from_internet: false
    });
    
    // For now, return session details - actual Agora token generation would use the generateAgoraToken function
    return Response.json({
      channel_name: channelName,
      uid: uid,
      app_id: Deno.env.get('AGORA_APP_ID'),
      session: session
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});