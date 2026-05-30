import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const SECTIONS = [
  {
    title: '1. Who We Are',
    content: `Girls Glowing Up™ (GGU) is a girls empowerment organization headquartered in Birmingham, Alabama. The GGU App ("App") is a digital platform designed to empower girls ages 10–18 through personal development, wellness resources, mentorship, and community connection.

Organization Name: Girls Glowing Up™
Website: gguapp.com | girlsglowingup.com
Contact Email: privacy@girlsglowingup.com
Mailing Address: Birmingham, Alabama`,
  },
  {
    title: '2. Scope of This Policy',
    content: `This Privacy Policy applies to all users of the GGU App and related websites, including girls ages 10–18 ("Users") and their parents or legal guardians ("Parents"). It describes how we collect, use, store, share, and protect personal information.

By accessing or using the GGU App, you (and, for users under 13, a parent or guardian) agree to the practices described in this Privacy Policy.`,
  },
  {
    title: '3. Children Under 13 — COPPA Disclosures',
    content: `The GGU App knowingly collects information from children under the age of 13. We do so in compliance with the Children's Online Privacy Protection Act (COPPA), 15 U.S.C. § 6501 et seq., and the FTC's COPPA Rule, 16 C.F.R. Part 312.

3a. Verifiable Parental Consent
Before a child under 13 creates an account or uses features that require personal information, we require verifiable parental consent. This includes:
• A parent or guardian completing the registration process on behalf of the child
• Providing a parent or guardian email address that we use for ongoing consent communications
• Agreeing to this Privacy Policy and our Terms of Service on behalf of the child

3b. What Parents Can Do
Parents and legal guardians have the right to:
• Review any personal information we have collected from their child
• Request deletion of their child's personal information at any time
• Refuse to allow further collection or use of their child's information
• Revoke consent and close the child's account

To exercise any of these rights, contact us at privacy@girlsglowingup.com. We will respond within 30 days.`,
  },
  {
    title: '4. Information We Collect',
    content: `4a. Information Provided During Registration
• Child's first name and display name (username)
• Child's age or date of birth (used for age-gating features)
• Parent or guardian name and email address (for users under 13)
• School name or school district (optional, for school expansion features)
• Avatar selection (illustrated, no photos required)

4b. Information Collected Automatically
• Device type and operating system
• App usage data (features accessed, session duration)
• Crash reports and error logs (for technical improvements)
• General geographic region (not precise GPS location)

4c. Information from Optional Features
• Profile content added to Glow Board™ (interests, goals)
• Messages sent through in-app Connect features (subject to age restrictions)
• Glow Link page content (if the user creates a public-facing profile page)
• Participation in GGU Academy courses or Money Moves game

4d. What We Do NOT Collect
• We do not collect Social Security numbers, financial account information, or government ID
• We do not require or store real photos of children
• We do not collect precise GPS or real-time location data
• We do not allow children under 13 to engage in one-on-one video or messaging with adults`,
  },
  {
    title: '5. How We Use Information',
    content: `We use collected information only for the following purposes:
• To create and manage user accounts
• To deliver age-appropriate content and features
• To enforce our age-gated video and mentorship policies
• To send parents and guardians account-related notifications
• To improve and maintain the App (technical performance, bug fixes)
• To enforce our Terms of Service and Community Guidelines
• To comply with applicable legal obligations

We do NOT use children's personal information for targeted advertising, behavioral profiling, or sale to third parties.`,
  },
  {
    title: '6. Age-Gated Features',
    content: `To protect all users, the GGU App uses the following age-gated access controls:

Ages 10–12: No video content. No direct messaging with adults. All community interaction is moderated.

Ages 13–15: Group video content only. Messaging with peers in supervised community spaces.

Ages 16–18: One-on-one video mentorship permitted only with documented parental or guardian consent.

Age is verified at account creation. We reserve the right to verify age claims at any time.`,
  },
  {
    title: '7. How We Share Information',
    content: `We do not sell, rent, or trade personal information. We share information only in the following limited circumstances:

7a. Service Providers
We may share information with trusted third-party vendors who help us operate the App, including hosting providers, analytics tools, and customer support platforms. These vendors are contractually required to keep information confidential and use it only to provide services to GGU.

7b. Legal Requirements
We may disclose information when required by law, court order, or to protect the safety of our users or the public.

7c. School District Partnerships
If GGU partners with a school district, we may share limited, non-personal aggregate data for program reporting. No individually identifiable student data is shared without separate written consent under FERPA requirements.`,
  },
  {
    title: '8. Data Retention',
    content: `We retain personal information only as long as necessary to provide the App's services, comply with legal obligations, or as directed by a parent or guardian.

• Account data is retained for the duration of the active account
• Upon account deletion request, personal data is deleted within 30 days
• Aggregate, anonymized usage data may be retained indefinitely for research and improvement purposes`,
  },
  {
    title: '9. Data Security',
    content: `We implement reasonable technical and organizational security measures to protect personal information from unauthorized access, disclosure, alteration, or destruction. These include:
• Encrypted data transmission (SSL/TLS)
• Access controls limiting who can view user data internally
• Regular security reviews of our platform and third-party integrations

No method of transmission over the internet is 100% secure. In the event of a data breach affecting children's information, we will notify affected parents or guardians as required by applicable law.`,
  },
  {
    title: '10. Third-Party Links and Services',
    content: `The GGU App may contain links to external websites or resources (such as scholarship opportunities or mental health hotlines). We are not responsible for the privacy practices of third-party sites. We encourage parents and users to review the privacy policies of any external sites before providing personal information.`,
  },
  {
    title: '11. Your Rights',
    content: `11a. For Parents and Guardians of Children Under 13
• Right to review your child's personal information
• Right to request correction of inaccurate information
• Right to request deletion of your child's account and data
• Right to withdraw consent and stop further data collection

11b. For Users Ages 13–18
• Right to access your personal information
• Right to request correction of inaccurate data
• Right to request account deletion
• Right to opt out of non-essential communications

To exercise any of these rights, email us at privacy@girlsglowingup.com with the subject line "Privacy Request." We will respond within 30 days.`,
  },
  {
    title: '12. California Privacy Rights',
    content: `If you are a California resident, you may have additional rights under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA), including the right to know, right to delete, and right to non-discrimination. Contact us at privacy@girlsglowingup.com to submit a verified request.`,
  },
  {
    title: '13. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. When we make material changes, we will:
• Post the updated policy in the App and on our websites
• Notify parents and guardians of children under 13 by email
• Update the "Last Updated" date at the top of this policy

Continued use of the App after changes are posted constitutes acceptance of the updated policy. If changes affect how we use children's personal information, we will obtain fresh parental consent where required by COPPA.`,
  },
  {
    title: '14. Contact Us',
    content: `If you have questions, concerns, or requests related to this Privacy Policy or our data practices, please contact us:

Girls Glowing Up™ — Privacy Team
Email: privacy@girlsglowingup.com
Website: girlsglowingup.com
Mailing: Birmingham, Alabama

For complaints related to COPPA compliance, you may also contact the Federal Trade Commission at ftc.gov/coppa.

Girls Glowing Up™ is committed to protecting the privacy, safety, and dignity of every girl in our community.`,
  },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white pb-28" style={{ backgroundColor: '#0d0608' }}>
      <div className="px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-pink-400" />
            <h1 className="text-xl font-bold">Privacy Policy</h1>
          </div>
        </div>

        {/* Header card */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(236,72,153,0.3)' }}>
          <p className="text-yellow-400 text-sm font-bold mb-2">⚠️ IMPORTANT</p>
          <p className="text-sm text-gray-200 leading-relaxed">
            This app is designed for girls ages 10–18. We take the privacy and safety of minors extremely seriously. This policy complies with the Children's Online Privacy Protection Act (COPPA) and applicable state privacy laws.
          </p>
          <p className="text-xs text-gray-400 mt-3">Effective Date: June 1, 2026 · Last Updated: June 1, 2026</p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {SECTIONS.map((section, i) => (
            <div key={i} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="font-bold text-white mb-3 text-sm">{section.title}</h2>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-600 mt-6 mb-4">© 2026 Girls Glowing Up™ LLC. All rights reserved.</p>
      </div>
      <BottomNav active="me" />
    </div>
  );
}