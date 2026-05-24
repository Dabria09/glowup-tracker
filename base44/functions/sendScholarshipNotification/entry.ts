import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function buildMimeMessage({ to, subject, body, fromEmail }) {
  const message = [
    `From: GGU Team <${fromEmail}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
    ``,
    body,
  ].join('\r\n');

  return btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));
    const scholarship = body?.data || {};

    const users = await base44.asServiceRole.entities.User.list();
    if (!users || users.length === 0) {
      return Response.json({ message: 'No users to notify.' });
    }

    // Get Gmail access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    // Get sender email from Gmail profile
    const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await profileRes.json();
    const fromEmail = profile.emailAddress || 'noreply@ggu.app';

    const name = scholarship.name || 'a new scholarship';
    const amount = scholarship.amount ? ` worth ${scholarship.amount}` : '';
    const deadline = scholarship.deadline ? `\n📅 Deadline: ${scholarship.deadline}` : '';
    const applyUrl = scholarship.apply_url ? `\n\n🔗 Apply here: ${scholarship.apply_url}` : '';
    const eligibility = scholarship.eligibility ? `\n\nEligibility: ${scholarship.eligibility}` : '';
    const desc = scholarship.description ? `\n\n${scholarship.description}` : '';

    let sent = 0;
    for (const user of users) {
      if (!user.email) continue;

      const emailBody = `Hi ${user.full_name || 'Queen'} 👑,

A new scholarship has just been added to the GGU Scholarships page — and we didn't want you to miss it!

✨ ${name}${amount}${desc}${eligibility}${deadline}${applyUrl}

Head to the app to view all available scholarships and start your application today. Your future is bright! 🌟

With love,
The GGU Team`;

      const raw = buildMimeMessage({
        to: user.email,
        subject: `💰 New Scholarship Alert: ${name}`,
        body: emailBody,
        fromEmail,
      });

      const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
      });

      if (sendRes.ok) sent++;
    }

    return Response.json({ success: true, sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});