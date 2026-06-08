import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify authenticated user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { parentName, parentEmail, parentPhone, relationship, applicantName } = await req.json();

    // Validate required fields
    if (!parentName || !parentEmail || !relationship) {
      return Response.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Create parent consent record
    const consentRecord = await base44.entities.ParentConsent.create({
      teen_email: user.email,
      teen_name: applicantName,
      parent_name: parentName,
      parent_email: parentEmail,
      parent_phone: parentPhone,
      relationship: relationship,
      consent_given: false,
      consent_requested_date: new Date().toISOString(),
    });

    // Send consent email to parent
    const consentLink = `${Deno.env.get('BASE44_APP_URL') || 'https://app.base44.com'}/parent-consent?token=${consentRecord.id}`;
    
    await base44.integrations.Core.SendEmail({
      to: parentEmail,
      subject: 'Parental Consent Required - GGU Mentor Application',
      body: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #e8526d;">Parental Consent Required</h2>
            <p>Dear ${parentName},</p>
            <p>Your child, <strong>${applicantName}</strong>, has applied to become a mentor with Girls Glowing Up™. Since they are under 18 years old, we require your consent before they can proceed with their application.</p>
            
            <div style="background-color: #f5f0f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #e8526d; margin-top: 0;">What This Means:</h3>
              <ul style="line-height: 1.8;">
                <li>Your child will be mentoring younger students in a safe, supervised environment</li>
                <li>All interactions happen through our secure platform</li>
                <li>Background checks are required for all mentors</li>
                <li>Training and guidelines are provided</li>
              </ul>
            </div>

            <p>By clicking the button below, you confirm that:</p>
            <ul style="line-height: 1.8;">
              <li>You are the parent or legal guardian of ${applicantName}</li>
              <li>You give permission for your child to participate as a teen mentor</li>
              <li>You understand the time commitment and responsibilities involved</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${consentLink}" 
                 style="background-color: #e8526d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Give Parental Consent
              </a>
            </div>

            <p>If you have any questions or concerns, please don't hesitate to contact us at support@girlsglowingup.com.</p>

            <p>Thank you for supporting your child's leadership journey!</p>

            <p style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 14px; color: #666;">
              <strong>Girls Glowing Up™</strong><br>
              Empowering the next generation of leaders
            </p>
          </body>
        </html>
      `,
    });

    // Update MentorApplication with parent info and mark consent as sent
    const applications = await base44.entities.MentorApplication.filter({ 
      user_email: user.email,
      status: 'pending'
    });

    if (applications.length > 0) {
      await base44.entities.MentorApplication.update(applications[0].id, {
        parent_email: parentEmail,
        parent_name: parentName,
        parent_phone: parentPhone,
        parent_relationship: relationship,
        parent_consent_sent: true,
      });
    }

    return Response.json({ 
      success: true, 
      message: 'Consent email sent successfully',
      consentId: consentRecord.id
    });
  } catch (error) {
    console.error('Error sending parental consent:', error);
    return Response.json({ 
      error: error.message || 'Failed to send consent email' 
    }, { status: 500 });
  }
});