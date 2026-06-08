import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This endpoint can be called without authentication (from email links)
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const action = url.searchParams.get('action'); // 'approve' or 'decline'
    
    if (!token || !action) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    if (action !== 'approve' && action !== 'decline') {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    // Find the consent record
    const consents = await base44.entities.ParentConsent.filter({ id: token });
    
    if (consents.length === 0) {
      return Response.json({ error: 'Invalid or expired consent link' }, { status: 404 });
    }
    
    const consent = consents[0];
    
    // Check if already responded
    if (consent.consent_given !== null) {
      return Response.json({ 
        error: 'This consent request has already been responded to',
        already_responded: true,
        consent_given: consent.consent_given
      }, { status: 400 });
    }
    
    // Check if expired
    const now = new Date();
    const expiresDate = consent.consent_expires_date ? new Date(consent.consent_expires_date) : null;
    if (expiresDate && now > expiresDate) {
      return Response.json({ error: 'This consent link has expired (14 days)' }, { status: 400 });
    }
    
    // Update consent record
    await base44.entities.ParentConsent.update(token, {
      consent_given: action === 'approve',
      consent_response_date: new Date().toISOString(),
    });
    
    // Update MentorApplication
    const applications = await base44.entities.MentorApplication.filter({ 
      user_email: consent.teen_email,
      status: 'pending'
    });
    
    if (applications.length > 0) {
      await base44.entities.MentorApplication.update(applications[0].id, {
        parent_consent_given: action === 'approve',
        parent_consent_response_date: new Date().toISOString(),
        status: action === 'approve' ? 'pending' : 'parent_declined',
        rejection_reason: action === 'decline' ? 'Parent/guardian declined consent' : undefined,
      });
    }
    
    // Send confirmation email to parent
    await base44.integrations.Core.SendEmail({
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
    await base44.integrations.Core.SendEmail({
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
      teen_name: consent.teen_name
    });
  } catch (error) {
    console.error('Error processing parental consent:', error);
    return Response.json({ 
      error: error.message || 'Failed to process consent response' 
    }, { status: 500 });
  }
});