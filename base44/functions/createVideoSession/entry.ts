import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id, participant_email } = await req.json();

    if (!session_id || !participant_email) {
      return Response.json({ error: 'session_id and participant_email are required' }, { status: 400 });
    }

    // Fetch the session
    const session = await base44.entities.MentorSession.get(session_id);
    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify user is authorized for this session (mentor, mentee, or admin)
    const isMentor = session.mentor_email === user.email;
    const isMentee = session.mentee_email === user.email;
    const isAdmin = user.role === 'admin';
    const isParticipant = participant_email === user.email;

    if (!isMentor && !isMentee && !isAdmin) {
      return Response.json({ error: 'Unauthorized: Not a participant in this session' }, { status: 403 });
    }

    // Time window check: allow joining 15 min before to 60 min after scheduled time
    const now = Date.now();
    const sessionTime = new Date(session.session_date).getTime();
    const fifteenMinBefore = sessionTime - (15 * 60 * 1000);
    const sixtyMinAfter = sessionTime + (60 * 60 * 1000);

    if (now < fifteenMinBefore && session.status !== 'live') {
      return Response.json({ 
        error: 'Session not yet available. You can join 15 minutes before the scheduled time.', 
        available_at: new Date(fifteenMinBefore).toISOString()
      }, { status: 403 });
    }

    if (now > sixtyMinAfter) {
      return Response.json({ error: 'This session has ended.' }, { status: 403 });
    }

    // If session doesn't have a channel yet, create one
    let channelId = session.agora_channel_id;
    if (!channelId) {
      // Generate unique channel ID
      channelId = `ggu_session_${session_id}_${Date.now()}`;
      await base44.entities.MentorSession.update(session_id, {
        agora_channel_id: channelId,
        status: session.status === 'scheduled' ? 'live' : session.status,
      });
    }

    // Determine role: mentors and admins can publish, mentees subscribe-only unless speaking
    const role = (isMentor || isAdmin) ? 'publisher' : 'subscriber';

    // Generate Agora token
    const tokenRes = await base44.functions.invoke('generateAgoraToken', {
      channelName: channelId,
      uid: 0,
      role: role,
    });

    // Log session join for audit trail
    await base44.entities.MentorSession.update(session_id, {
      last_accessed_by: user.email,
      last_accessed_at: new Date().toISOString(),
    });

    return Response.json({
      token: tokenRes.data.token,
      appId: tokenRes.data.appId,
      channelName: channelId,
      role: role,
      session: {
        id: session.id,
        topic: session.topic,
        mentor_email: session.mentor_email,
        mentee_email: session.mentee_email,
        status: session.status,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});