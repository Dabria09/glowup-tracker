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

    // Note: We don't delete the User entity record here as that's handled by the platform's account deletion flow.
    // This function only cleans up mentor-specific data. The user should use the platform's built-in account deletion.

    return Response.json({ success: true, message: 'Mentor data deleted. Please use platform settings to delete your full account.' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});