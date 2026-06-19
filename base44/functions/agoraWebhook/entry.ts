import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verify this is a valid Agora webhook request
    const signature = req.headers.get('X-Agora-Signature');
    const appId = req.headers.get('X-Agora-App-Id');

    if (!signature || !appId) {
      return Response.json({ error: 'Missing Agora webhook headers' }, { status: 400 });
    }

    // Verify app ID matches
    if (appId !== Deno.env.get('AGORA_APP_ID')) {
      return Response.json({ error: 'Invalid app ID' }, { status: 401 });
    }

    const payload = await req.json();
    console.log('Agora webhook payload:', payload);

    // Handle recording completed event (Agora sends 'recording_completed' or 'available')
    if (payload.eventType === 'recording_completed' || payload.eventType === 'available' || payload.eventType === 'recording_available') {
      const { channelId, recordingUrl, duration } = payload;

      if (!channelId) {
        return Response.json({ error: 'Missing channelId in payload' }, { status: 400 });
      }

      // Find the session by agora_channel_id
      const sessions = await base44.entities.MentorSession.filter({});
      const session = sessions.find(s => s.agora_channel_id === channelId);

      if (!session) {
        console.log('No session found for channel:', channelId);
        return Response.json({ message: 'No matching session found', received: true });
      }

      // Update session with recording URL
      await base44.entities.MentorSession.update(session.id, {
        recording_url: recordingUrl,
        recording_duration: duration || 0,
        status: 'completed',
      });

      console.log('Recording saved for session:', session.id);

      return Response.json({
        message: 'Recording processed successfully',
        session_id: session.id,
        recording_url: recordingUrl,
      });
    }

    // Handle other Agora events (optional logging)
    console.log('Agora event received:', payload.eventType);

    return Response.json({ message: 'Webhook received', event_type: payload.eventType });
  } catch (error) {
    console.error('Agora webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});