import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete mentor profile records
    const mentors = await base44.entities.Mentor.filter({ user_email: user.email });
    for (const m of mentors) {
      await base44.entities.Mentor.delete(m.id);
    }

    const teenMentors = await base44.entities.TeenMentor.filter({ user_email: user.email });
    for (const m of teenMentors) {
      await base44.entities.TeenMentor.delete(m.id);
    }

    // Delete user profile
    const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
    for (const p of profiles) {
      await base44.entities.UserProfile.delete(p.id);
    }

    // Delete the User entity record — this removes them from the app entirely
    await base44.asServiceRole.entities.User.delete(user.id);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});