import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mentee_email, mentor_email, session_date, session_type, topic } = await req.json();

    if (!mentee_email || !mentor_email || !session_date) {
      return Response.json({ error: 'mentee_email, mentor_email, and session_date are required' }, { status: 400 });
    }

    // Verify user is authorized to create this session
    const isMentee = mentee_email === user.email;
    const isMentor = mentor_email === user.email;
    const isAdmin = user.role === 'admin';

    if (!isMentee && !isMentor && !isAdmin) {
      return Response.json({ error: 'Unauthorized: Cannot create session for other users' }, { status: 403 });
    }

    // Check if mentor is approved
    const mentorApp = await base44.entities.MentorApplication.filter({ user_email: mentor_email, status: 'approved' }).then(apps => apps[0]);
    if (!mentorApp) {
      return Response.json({ error: 'Mentor is not approved yet' }, { status: 400 });
    }

    // Validate session date is in the future
    const sessionTime = new Date(session_date).getTime();
    const now = Date.now();
    if (sessionTime < now) {
      return Response.json({ error: 'Session date must be in the future' }, { status: 400 });
    }

    // Create the session
    const session = await base44.entities.MentorSession.create({
      mentee_email,
      mentor_email,
      session_date,
      session_type: session_type || 'Video Call',
      topic: topic || 'Mentorship Session',
      status: 'scheduled',
    });

    return Response.json({
      message: 'Session created successfully',
      session: {
        id: session.id,
        mentee_email: session.mentee_email,
        mentor_email: session.mentor_email,
        session_date: session.session_date,
        status: session.status,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});