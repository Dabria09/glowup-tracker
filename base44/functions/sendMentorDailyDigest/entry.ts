import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Scheduled task — use service role (no user auth context)
    const service = base44.asServiceRole;

    // 1. Fetch all approved mentors
    const mentors = await service.entities.Mentor.filter({ is_approved: true });
    if (!mentors || mentors.length === 0) {
      return Response.json({ success: true, message: 'No approved mentors found', emails_sent: 0 });
    }

    // 2. Fetch all anonymous questions (paginate to be safe)
    let allQuestions = [];
    let batch = await service.entities.AnonymousQuestion.list('-created_date', 200);
    allQuestions = allQuestions.concat(batch);

    // 3. Helper: parse JSON array safely
    const parseArr = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch { return []; }
    };

    // 4. For each mentor, find claimed-but-unanswered questions
    let emailsSent = 0;
    let totalPending = 0;

    for (const mentor of mentors) {
      const mentorEmail = mentor.user_email;
      if (!mentorEmail) continue;

      const pending = allQuestions.filter((q) => {
        const claimedBy = parseArr(q.claimed_by);
        if (!claimedBy.includes(mentorEmail)) return false;

        // Check if this mentor has already responded
        const responses = parseArr(q.mentor_responses);
        const hasResponded = responses.some((r) => r && r.mentor_email === mentorEmail);
        return !hasResponded;
      });

      if (pending.length === 0) continue; // No email if nothing pending

      totalPending += pending.length;

      // Build HTML email
      const questionRows = pending.map((q, i) => {
        const submitted = q.submitted_date
          ? new Date(q.submitted_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '—';
        const preview = (q.question || '').slice(0, 140) + ((q.question || '').length > 140 ? '…' : '');
        return `
          <tr>
            <td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.08);">
              <div style="font-size:11px;font-weight:700;color:#f1b610;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">${q.category || 'General'} · ${submitted}</div>
              <div style="font-size:14px;color:#f8f5f0;line-height:1.5;">${preview}</div>
            </td>
          </tr>`;
      }).join('');

      const html = `
        <div style="background:#07050e;padding:32px 20px;font-family:'Outfit',Helvetica,Arial,sans-serif;">
          <div style="max-width:520px;margin:0 auto;">
            <div style="text-align:center;margin-bottom:28px;">
              <div style="font-size:22px;font-weight:900;background:linear-gradient(135deg,#e8526d,#f1b610);-webkit-background-clip:text;-webkit-text-fill-color:transparent;color:#e8526d;">Girls Glowing Up™</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:2px;margin-top:4px;">Mentor Daily Digest</div>
            </div>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(232,82,109,0.2);border-radius:20px;overflow:hidden;">
              <div style="padding:24px 24px 8px;">
                <h1 style="font-size:20px;font-weight:800;color:#fff;margin:0 0 8px;">Hi ${mentor.preferred_name || mentor.full_name || 'Mentor'},</h1>
                <p style="font-size:14px;color:rgba(255,255,255,0.6);line-height:1.6;margin:0 0 20px;">
                  You have <strong style="color:#f1b610;">${pending.length} question${pending.length > 1 ? 's' : ''}</strong> waiting for your wisdom. Don't let a girl wait — your guidance matters.
                </p>
              </div>
              <table style="width:100%;border-collapse:collapse;">
                ${questionRows}
              </table>
              <div style="padding:24px;">
                <a href="${req.headers.get('origin') || 'https://app.base44.com'}/mentor-dashboard?tab=Inbox"
                   style="display:inline-block;background:linear-gradient(135deg,#e8526d,#f1b610);color:#fff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:14;text-decoration:none;border-radius:14px;">
                  Open Mentor Inbox →
                </a>
                <p style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:16px;line-height:1.5;">
                  You're receiving this because you're an approved GGU mentor with unanswered questions. Keep glowing! 💛
                </p>
              </div>
            </div>
          </div>
        </div>`;

      try {
        await service.integrations.Core.SendEmail({
          to: mentorEmail,
          subject: `💛 You have ${pending.length} question${pending.length > 1 ? 's' : ''} waiting — GGU Mentor Digest`,
          body: html,
        });
        emailsSent++;
      } catch (emailErr) {
        console.error(`Failed to send digest to ${mentorEmail}:`, emailErr.message);
      }
    }

    return Response.json({
      success: true,
      mentors_checked: mentors.length,
      emails_sent: emailsSent,
      total_pending_questions: totalPending,
    });
  } catch (error) {
    console.error('Mentor daily digest error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});