import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Calculate days remaining in current month
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysLeft = lastDay.getDate() - now.getDate();

    if (daysLeft !== 3) {
      return Response.json({ message: `Not reminder day. ${daysLeft} days left in month.` });
    }

    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
    const monthName = now.toLocaleString('en-US', { month: 'long' });
    const year = now.getFullYear();
    const deadline = lastDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    // Get all users
    const users = await base44.asServiceRole.entities.User.list();

    // Get existing nominations for this month
    const nominations = await base44.asServiceRole.entities.BookClubNomination.filter({ vote_month: currentMonth });
    const nominatedEmails = new Set(nominations.map(n => n.user_email));

    let sent = 0;

    for (const user of users) {
      if (!user.email) continue;

      const alreadyNominated = nominatedEmails.has(user.email);
      const name = user.full_name || 'Sis';

      const subject = alreadyNominated
        ? `📚 Only 3 days left — voting opens soon! | Glow Girls Book Club`
        : `📚 3 days left to nominate a book! | Glow Girls Book Club`;

      const body = alreadyNominated
        ? `Hey ${name}! 👋\n\nJust a reminder — your book nomination for ${monthName} ${year} is in! ✅\n\nFinal voting opens in just 3 days (${deadline}), when the top 5 most-nominated books will go to a community vote.\n\nHead to the Book Club → Vote tab to see the current standings and get ready to cast your final vote!\n\n✨ Glow Girls Book Club`
        : `Hey ${name}! 👋\n\nYou still have time to nominate a book for ${monthName} ${year} — but only 3 days left! 📖\n\nNominations close on ${deadline}, and the top 5 most-nominated books will go to a community vote.\n\nDon't miss your chance to have your pick read by the whole community!\n\n👉 Head to the Book Club → Vote tab to submit your nomination now.\n\n✨ Glow Girls Book Club`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject,
        body,
      });

      sent++;
    }

    return Response.json({ success: true, sent, daysLeft, month: currentMonth });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});