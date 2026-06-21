import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    
    // This endpoint can be called without authentication (from email links)
    const url = new URL(req.url);
    let body: Record<string, unknown> = {};
    if ((req.headers.get('content-type') || '').includes('application/json')) {
      body = await req.json().catch(() => ({}));
    }
    const token = url.searchParams.get('token') || String(body.token || '');
    const action = url.searchParams.get('action') || String(body.action || 'status'); // 'status', 'approve', or 'decline'
    
    if (!token || !action) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    if (!['status', 'approve', 'decline'].includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    // Find the consent record
    const consents = await sr.entities.ParentConsent.filter({ id: token });
    
    if (consents.length === 0) {
      return Response.json(
        { error: 'Invalid or expired consent link' },
        { status: action === 'status' ? 200 : 404 }
      );
    }
    
    const consent = consents[0];
    
    const publicConsent = {
      teen_name: consent.teen_name,
      parent_name: consent.parent_name,
      consent_given: consent.consent_given,
    };

    // Check if already responded
    if (typeof consent.consent_given === 'boolean') {
      return Response.json({ 
        ...publicConsent,
        already_responded: true,
      });
    }
    
    // Check if expired
    const now = new Date();
    const expiresDate = consent.consent_expires_date ? new Date(consent.consent_expires_date) : null;
    if (expiresDate && now > expiresDate) {
      return Response.json(
        { error: 'This consent link has expired (14 days)' },
        { status: action === 'status' ? 200 : 400 }
      );
    }

    if (action === 'status') {
      return Response.json({
        ...publicConsent,
        ready_to_respond: true,
      });
    }
    
    // Update consent record
    await sr.entities.ParentConsent.update(token, {
      consent_given: action === 'approve',
      consent_response_date: new Date().toISOString(),
    });
    
    const consentContext = consent.consent_context || consent.account_type || 'mentor';

    if (consentContext === 'girl') {
      const profiles = await sr.entities.UserProfile.filter({ user_email: consent.teen_email });
      if (profiles.length > 0) {
        await sr.entities.UserProfile.update(profiles[0].id, {
          parental_consent_given: action === 'approve',
          admin_consent_approved: action === 'approve',
          parental_consent_response_date: new Date().toISOString(),
          onboarding_complete: action === 'approve',
          consent_status: action === 'approve' ? 'approved' : 'declined',
        });
      }

      const users = await sr.entities.User.filter({ email: consent.teen_email });
      if (users.length > 0) {
        await sr.entities.User.update(users[0].id, {
          parental_consent_confirmed: action === 'approve',
          requires_parental_consent: action !== 'approve',
        });
      }
    } else {
      // Update MentorApplication
      const applications = await sr.entities.MentorApplication.filter({ 
        user_email: consent.teen_email,
        status: 'pending'
      });
      
      if (applications.length > 0) {
        await sr.entities.MentorApplication.update(applications[0].id, {
          parent_consent_given: action === 'approve',
          parent_consent_response_date: new Date().toISOString(),
          status: action === 'approve' ? 'pending' : 'parent_declined',
          rejection_reason: action === 'decline' ? 'Parent/guardian declined consent' : undefined,
        });
      }
    }
    
    // Send confirmation email to parent
    const emailClient = sr.integrations?.Core?.SendEmail ? sr.integrations.Core : base44.integrations.Core;
    await emailClient.SendEmail({
      to: consent.parent_email,
      subject: `Consent Response Confirmed - ${action === 'approve' ? 'Approved' : 'Declined'}`,
      body: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <p>Dear ${consent.parent_name},</p>
            <p>Thank you for responding to the parental consent request for ${consent.teen_name}.</p>
            <p>Your response has been recorded: <strong>${action === 'approve' ? 'APPROVED' : 'DECLINED'}</strong></p>
            ${action === 'approve' 
              ? '<p>Your teen can now proceed with their GGU Mentor application. They will be contacted with next steps including the GGU Mentor Lesson and staff interview.</p>'
              : '<p>Your teen\'s application has been placed on hold. If you have questions or change your mind, please contact us at mentors@girlsglowingup.com.</p>'
            }
            <p style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 14px; color: #666;">
              With love and purpose,<br>
              <strong>The Girls Glowing Up™ Team</strong><br>
              mentors@girlsglowingup.com
            </p>
          </body>
        </html>
      `,
    });
    
    // Send notification email to teen
    await emailClient.SendEmail({
      to: consent.teen_email,
      subject: `Parental Consent Response - ${action === 'approve' ? 'Approved!' : 'Update Required'}`,
      body: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <p>Hi ${consent.teen_name},</p>
            ${action === 'approve'
              ? `<p>Great news! Your parent/guardian has given their consent for you to proceed with your GGU Mentor application.</p>
                 <p><strong>Next steps:</strong></p>
                 <ol>
                   <li>Complete the GGU Mentor Lesson (you'll receive a separate email with access)</li>
                   <li>Schedule your staff interview</li>
                   <li>Wait for final approval</li>
                 </ol>
                 <p>We're excited to have you join the mentor community!</p>`
              : `<p>Your parent/guardian has declined to give consent for your GGU Mentor application at this time.</p>
                 <p>If you'd like to discuss this decision or have questions, please reach out to us at mentors@girlsglowingup.com.</p>`
            }
            <p style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 14px; color: #666;">
              With love and purpose,<br>
              <strong>The Girls Glowing Up™ Team</strong><br>
              mentors@girlsglowingup.com
            </p>
          </body>
        </html>
      `,
    });
    
    return Response.json({ 
      success: true,
      action: action,
      teen_name: consent.teen_name,
      parent_name: consent.parent_name,
      consent_given: action === 'approve',
    });
  } catch (error) {
    console.error('Error processing parental consent:', error);
    return Response.json({ 
      error: error.message || 'Failed to process consent response' 
    }, { status: 500 });
  }
});