import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;
    
    // Verify authenticated user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      context = 'mentor',
      parentName,
      parentEmail,
      parentPhone,
      relationship,
      applicantName,
      dateOfBirth,
    } = await req.json();
    const consentContext = context === 'girl' ? 'girl' : 'mentor';
    const childName = applicantName || user.full_name || user.email;
    const normalizedParentName = String(parentName || '').trim();
    const normalizedParentEmail = String(parentEmail || '').trim();
    const normalizedParentPhone = String(parentPhone || '').trim();
    const normalizedRelationship = String(relationship || '').trim();

    // Validate required fields
    if (!normalizedParentName || !normalizedParentEmail || !normalizedRelationship) {
      return Response.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    if (!EMAIL_PATTERN.test(normalizedParentEmail)) {
      return Response.json({
        error: 'Please enter a valid parent or guardian email address'
      }, { status: 400 });
    }

    // Calculate expiration date (14 days from now)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 14);
    
    // Create parent consent record
    const consentRecord = await sr.entities.ParentConsent.create({
      user_email: user.email,
      teen_email: user.email,
      teen_name: childName,
      parent_name: normalizedParentName,
      parent_email: normalizedParentEmail,
      parent_phone: normalizedParentPhone,
      relationship: normalizedRelationship,
      consent_context: consentContext,
      account_type: consentContext,
      consent_given: null,
      consent_requested_date: new Date().toISOString(),
      consent_expires_date: expirationDate.toISOString(),
      consent_link_sent: true,
    });

    // Send consent email to parent
    const appUrl = Deno.env.get('BASE44_APP_URL') || Deno.env.get('BASE44_APP_BASE_URL') || 'https://gguapp.com';
    const consentLink = `${appUrl}/parent-consent?token=${consentRecord.id}`;
    
    // Calculate applicant age from date of birth
    const dob = dateOfBirth || user.date_of_birth;
    const teenAge = dob ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : '';
    const subject = consentContext === 'girl'
      ? `Parental Consent Required - ${childName} wants to join Girls Glowing Up`
      : `Parental Consent Required - GGU Teen Mentor Application`;
    const intro = consentContext === 'girl'
      ? `We are reaching out because ${childName} (age ${teenAge}) created a Girls Glowing Up account and needs parent or guardian consent before accessing the app.`
      : `We are reaching out because your teen, <strong>${childName}</strong> (age ${teenAge}), recently applied to become a Teen Mentor on the Girls Glowing Up™ platform.`;
    
    const emailClient = sr.integrations?.Core?.SendEmail ? sr.integrations.Core : base44.integrations.Core;
    await emailClient.SendEmail({
      to: normalizedParentEmail,
      subject,
      body: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <p>Dear ${normalizedParentName},</p>
            
            <p>${intro}</p>
            
            <p>Before ${consentContext === 'girl' ? 'their account can be activated' : 'their application can move forward'} we are required to obtain your consent as their parent or guardian.</p>
            
            <h3 style="color: #e8526d; margin-top: 24px;">What is Girls Glowing Up™?</h3>
            <p>Girls Glowing Up™ (GGU) is a Birmingham, Alabama-based girls empowerment platform serving girls ages 10 and up. Our app helps girls build confidence, financial literacy, wellness habits, career awareness, and community connections in a safe, moderated digital environment.</p>
            <p>Our platform is 100% ad-free. We do not sell user data. All mentorship features are age-gated and safety-monitored.</p>
            
            ${consentContext === 'mentor' ? `
              <h3 style="color: #e8526d; margin-top: 24px;">What Does a Teen Mentor Do?</h3>
              <p>${childName} applied to serve as a peer mentor — guiding and encouraging younger girls on the platform through shared experiences, check-ins, and supportive conversations. Teen mentors are peer leaders, not adult supervisors.</p>
              <p>As a Teen Mentor ${childName} would:</p>
              <ul style="line-height: 1.8;">
                <li>Support younger girls in their age group through in-app messaging and group sessions</li>
                <li>Complete a required GGU Mentor Lesson before being approved</li>
                <li>Participate in a brief interview with GGU staff</li>
                <li>Follow GGU's Safety and Code of Conduct at all times</li>
                <li>Be monitored by GGU admin throughout their mentorship</li>
              </ul>
              
              <h3 style="color: #e8526d; margin-top: 24px;">What Teen Mentors Cannot Do</h3>
              <ul style="line-height: 1.8;">
                <li>Teen mentors cannot mentor Glow Women users</li>
                <li>Teen mentors cannot engage in direct one-on-one video calls without GGU facilitation</li>
                <li>Teen mentors cannot share personal contact information with mentees</li>
                <li>Teen mentors cannot access any adult-only features on the platform</li>
              </ul>
            ` : `
              <h3 style="color: #e8526d; margin-top: 24px;">Under-13 Safety</h3>
              <ul style="line-height: 1.8;">
                <li>Glow Girls under 13 require parent or guardian consent before accessing the app</li>
                <li>Community and mentorship features are age-gated and moderated</li>
                <li>Parents can contact GGU Safety at any time</li>
              </ul>
            `}
            
            <h3 style="color: #e8526d; margin-top: 24px;">Safety Measures in Place</h3>
            <ul style="line-height: 1.8;">
              <li>Age-appropriate interactions are monitored and moderated by GGU admin</li>
              <li>GGU has a zero-tolerance policy for inappropriate behavior</li>
              <li>You as a parent or guardian can contact us at any time at mentors@girlsglowingup.com</li>
            </ul>
            
            <h3 style="color: #e8526d; margin-top: 24px;">What We Need From You</h3>
            <p>Please review this information carefully and provide your response. Your response is required before ${childName}'s ${consentContext === 'girl' ? 'account can be activated' : 'application can proceed'}.</p>
            
            <p style="background-color: #fef3c7; padding: 12px; border-left: 4px solid #f59e0b; margin: 16px 0;">
              <strong>Important:</strong> This link expires in 14 days. If you do not respond within 14 days the request will remain on hold.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${consentLink}" 
                 style="background-color: #e8526d; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Review Consent Request
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

    if (consentContext === 'mentor') {
      const applications = await sr.entities.MentorApplication.filter({ 
        user_email: user.email,
        status: 'pending'
      });

      if (applications.length > 0) {
        await sr.entities.MentorApplication.update(applications[0].id, {
          parent_email: normalizedParentEmail,
          parent_name: normalizedParentName,
          parent_phone: normalizedParentPhone,
          parent_relationship: normalizedRelationship,
          parent_consent_sent: true,
          parent_consent_id: consentRecord.id,
        });
      }
    } else {
      const profiles = await sr.entities.UserProfile.filter({ user_email: user.email });
      if (profiles.length > 0) {
        await sr.entities.UserProfile.update(profiles[0].id, {
          parent_email: normalizedParentEmail,
          parent_name: normalizedParentName,
          parent_phone: normalizedParentPhone,
          parent_relationship: normalizedRelationship,
          parental_consent_sent: true,
          parent_consent_id: consentRecord.id,
        });
      }
      await base44.auth.updateMe({
        requires_parental_consent: true,
        parental_consent_confirmed: false,
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