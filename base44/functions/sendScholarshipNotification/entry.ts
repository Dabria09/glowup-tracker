import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get the scholarship data from the automation payload
    const body = await req.json().catch(() => ({}));
    const scholarship = body?.data || {};

    // Get all registered users
    const users = await base44.asServiceRole.entities.User.list();

    if (!users || users.length === 0) {
      return Response.json({ message: 'No users to notify.' });
    }

    let sent = 0;
    const name = scholarship.name || 'a new scholarship';
    const amount = scholarship.amount ? ` worth ${scholarship.amount}` : '';
    const deadline = scholarship.deadline ? `\n📅 Deadline: ${scholarship.deadline}` : '';
    const applyUrl = scholarship.apply_url ? `\n\n🔗 Apply here: ${scholarship.apply_url}` : '';
    const eligibility = scholarship.eligibility ? `\n\nEligibility: ${scholarship.eligibility}` : '';
    const desc = scholarship.description ? `\n\n${scholarship.description}` : '';

    for (const user of users) {
      if (!user.email) continue;
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: `💰 New Scholarship Alert: ${name}`,
        body: `Hi ${user.full_name || 'Queen'} 👑,

A new scholarship has just been added to the GGU Scholarships page — and we didn't want you to miss it!

✨ ${name}${amount}${desc}${eligibility}${deadline}${applyUrl}

Head to the app to view all available scholarships and start your application today. Your future is bright! 🌟

With love,
The GGU Team`,
      });
      sent++;
    }

    return Response.json({ success: true, sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});