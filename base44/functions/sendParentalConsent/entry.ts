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

    // Calculate expiration date (14 days from now)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 14);
    
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
      consent_expires_date: expirationDate.toISOString(),
      consent_link_sent: true,
    });

    // Send consent email to parent
    const consentLink = `${Deno.env.get('BASE44_APP_URL') || 'https://app.base44.com'}/parent-consent?token=${consentRecord.id}`;
    const declineLink = `${Deno.env.get('BASE44_APP_URL') || 'https://app.base44.com'}/parent-consent/decline?token=${consentRecord.id}`;
    
    // Calculate teen age from date of birth
    const dob = applications.find(app => app.user_email === user.email)?.date_of_birth;
    const teenAge = dob ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : '';
    
    await base44.integrations.Core.SendEmail({
      to: parentEmail,
      subject: 'Parental Consent Required - GGU Teen Mentor Application',
      body: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <p>Dear ${parentName},</p>
            
            <p>We are reaching out because your teen, <strong>${applicantName}</strong> (age ${teenAge}), recently applied to become a Teen Mentor on the Girls Glowing Up™ platform.</p>
            
            <p>Before their application can move forward we are required to obtain your consent as their parent or guardian. This email explains what GGU is, what being a Teen Mentor involves, and what we need from you.</p>
            
            <h3 style="color: #e8526d; margin-top: 24px;">What is Girls Glowing Up™?</h3>
            <p>Girls Glowing Up™ (GGU) is a Birmingham, Alabama-based girls empowerment platform serving girls ages 5 to 26. Our app helps girls build confidence, financial literacy, wellness habits, career awareness, and community connections in a safe, moderated digital environment.</p>
            <p>Our platform is 100% ad-free. We do not sell user data. All mentorship features are age-gated and safety-monitored.</p>
            
            <h3 style="color: #e8526d; margin-top: 24px;">What Does a Teen Mentor Do?</h3>
            <p>${applicantName} applied to serve as a peer mentor — guiding and encouraging younger girls on the platform through shared experiences, check-ins, and supportive conversations. Teen mentors are peer leaders, not adult supervisors.</p>
            <p>As a Teen Mentor ${applicantName} would:</p>
            <ul style="line-height: 1.8;">
              <li>Support younger girls in their age group through in-app messaging and group sessions</li>
              <li>Complete a required GGU Mentor Lesson before being approved</li>
              <li>Participate in a brief interview with GGU staff</li>
              <li>Follow GGU's Safety and Code of Conduct at all times</li>
              <li>Be monitored by GGU admin throughout their mentorship</li>
            </ul>
            
            <h3 style="color: #e8526d; margin-top: 24px;">What Teen Mentors Cannot Do</h3>
            <ul style="line-height: 1.8;">
              <li>Teen mentors cannot mentor girls in the Glow Women category (ages 19 to 26)</li>
              <li>Teen mentors cannot engage in direct one-on-one video calls without GGU facilitation</li>
              <li>Teen mentors cannot share personal contact information with mentees</li>
              <li>Teen mentors cannot access any adult-only features on the platform</li>
            </ul>
            
            <h3 style="color: #e8526d; margin-top: 24px;">Safety Measures in Place</h3>
            <ul style="line-height: 1.8;">
              <li>All Teen Mentor interactions are monitored and moderated by GGU admin</li>
              <li>GGU has a zero-tolerance policy for inappropriate behavior</li>
              <li>Teen Mentor accounts can be suspended or revoked at any time by GGU admin</li>
              <li>You as a parent or guardian can contact us at any time at mentors@girlsglowingup.com</li>
              <li>Teen mentors are identified with a Teen Mentor badge so all users know they are peer leaders</li>
            </ul>
            
            <h3 style="color: #e8526d; margin-top: 24px;">What We Need From You</h3>
            <p>Please review this information carefully and select one of the options below. Your response is required before ${applicantName}'s application can proceed.</p>
            
            <p style="background-color: #fef3c7; padding: 12px; border-left: 4px solid #f59e0b; margin: 16px 0;">
              <strong>Important:</strong> These links expire in 14 days. If you do not respond within 14 days the application will be automatically placed on hold and ${applicantName} will be notified.
            </p>
            
            <div style="text-align: center; margin: 30px 0; display: flex; gap: 16px; justify-content: center;">
              <a href="${consentLink}" 
                 style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                ✓ Approve
              </a>
              <a href="${declineLink}" 
                 style="background-color: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                ✗ Decline
              </a>
            </div>
            
            <p>If you have any questions about GGU or the Teen Mentor program please reply to this email or contact us directly at mentors@girlsglowingup.com.</p>
            
            <p>Thank you for supporting the next generation of girls who glow.</p>
            
            <p style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 14px; color: #666;">
              With love and purpose,<br>
              <strong>The Girls Glowing Up™ Team</strong><br>
              girlsglowingup.com | gguapp.com
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