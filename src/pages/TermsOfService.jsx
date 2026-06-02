import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function TermsOfService() {
  const navigate = useNavigate();

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `These Terms of Service ("Terms") constitute a legally binding agreement between you and Girls Glowing Up™ LLC ("GGU," "we," "us," or "our") governing your use of the GGU mobile application and related services ("App").

By accessing or using the App, you confirm that you are at least 10 years old, or that a parent or legal guardian has reviewed and accepted these Terms on your behalf. If you do not agree to these Terms, do not use the App.`
    },
    {
      title: '2. Who Can Use the App — Age-Based Worlds',
      content: `The GGU App is open to users ages 10 and older. Users are placed into one of three age-based worlds based on their age at registration. Each world has different content, features, permissions, and safety protections:

Tween World (Ages 10–13)
• Designed for younger users with age-appropriate content and strict safety settings
• Users ages 10–12 must have a parent or legal guardian provide verifiable parental consent before creating an account
• Community interaction is moderated; no one-on-one messaging with adults
• Parent Dashboard is available for caregiver oversight

Teen World (Ages 14–17)
• Designed for teen users with expanded community features, mentorship, and career tools
• Users under 18 must have a parent or guardian review and agree to these Terms
• One-on-one mentorship with verified adult mentors requires documented parental consent for users under 18

Women's World (Ages 18+)
• Designed for adult women with full access to networking, career development, wellness, mentorship, and leadership features
• There is no upper age limit; Women's World is open to all adult users
• Adult Community Guidelines and Terms of Service apply

GGU reserves the right to verify age and move users to the appropriate world or terminate accounts that do not meet eligibility requirements.`
    },
    {
      title: '3. Account Registration',
      content: `To use the GGU App, you must create an account. You agree to:

• Provide accurate, current, and complete information during registration
• Maintain the security of your password and accept responsibility for all activity under your account
• Notify GGU immediately if you suspect unauthorized access to your account
• Not create accounts for others without their permission

GGU reserves the right to suspend or terminate accounts that violate these Terms.`
    },
    {
      title: '4. User Content',
      content: `The GGU App allows users to post content including text, images, goals, diary entries, and community posts ("User Content"). By submitting User Content, you:

• Represent that you own or have the right to share the content
• Grant GGU a non-exclusive, royalty-free license to display and moderate your content within the App
• Agree not to post content that is illegal, harmful, harassing, or violates these Terms

GGU does not claim ownership of your personal content. You may delete your content at any time.`
    },
    {
      title: '5. Community Guidelines',
      content: `All users must follow GGU Community Guidelines, which prohibit:

• Bullying, harassment, threats, or hate speech
• Sharing inappropriate, explicit, or harmful content
• Impersonating other users or public figures
• Spam, solicitation, or unauthorized advertising
• Sharing personal information of others without consent
• Any illegal activity

Violations may result in content removal, account suspension, or permanent ban. Standards are enforced across all worlds, with additional protections for Tween and Teen World users.`
    },
    {
      title: '6. Safety Protections by World',
      content: `GGU maintains world-specific safety protections to ensure every user has an age-appropriate, safe experience:

Tween World Safety Protections:
• All content is age-reviewed and moderated
• No direct one-on-one messaging with adults
• Parental consent required before account creation
• Parents receive notifications and have account oversight via the Parent Dashboard
• No video features involving adult interactions

Teen World Safety Protections:
• Community features include moderation and reporting tools
• Mentorship with adults requires verified mentor credentials and, for users under 18, documented parental consent
• Peer mentorship is supervised and monitored
• Users can block, report, and flag content at any time

Women's World Safety Protections:
• All users are 18+ and subject to standard Community Guidelines
• Mentors and community members are subject to verification and conduct standards
• GGU reserves the right to remove any user who violates safety policies`
    },
    {
      title: '7. Mentorship Program',
      content: `GGU's Mentorship Hub connects users with verified mentors. Participation is subject to:

• Tween World users (10–13) require active parental consent on file before accessing any mentorship features
• Teen World users under 18 require parental or guardian consent for one-on-one sessions with adult mentors
• All adult mentors complete a verification process before being approved
• Session activity is logged and, for minors, accessible to parents via the Parent Dashboard
• GGU reserves the right to remove mentors or terminate sessions that violate safety policies

GGU does not guarantee the accuracy of mentor profiles and is not responsible for advice given during sessions.`
    },
    {
      title: '8. Glow Points & Rewards',
      content: `GGU may award Glow Points for completing challenges, daily check-ins, and other activities. Glow Points:

• Have no monetary value and cannot be exchanged for cash
• May be used for in-app features, unlocking content, or recognition
• Are subject to change at GGU's discretion
• Will be forfeited if an account is terminated for violations`
    },
    {
      title: '9. Privacy',
      content: `Your use of the GGU App is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices regarding your personal information.

For Tween World users under 13, GGU complies fully with the Children's Online Privacy Protection Act (COPPA). Parents may review, correct, or request deletion of their child's data at any time by contacting privacy@girlsglowingup.com.`
    },
    {
      title: '10. Prohibited Activities',
      content: `You agree NOT to:

• Attempt to hack, scrape, or reverse-engineer any part of the App
• Use the App for commercial purposes without written authorization from GGU
• Upload malware, viruses, or any harmful code
• Circumvent any access controls or safety features, including age-gating
• Use the App to collect information about other users without consent
• Attempt to contact or interact with minors in a manner that violates GGU's safety policies
• Violate any applicable local, state, national, or international law`
    },
    {
      title: '11. Disclaimer of Warranties',
      content: `THE GGU APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. GGU DOES NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS. USE OF THE APP IS AT YOUR OWN RISK.

GGU's wellness content, tips, and resources are for informational purposes only and do not constitute medical, legal, or professional advice.`
    },
    {
      title: '12. Limitation of Liability',
      content: `TO THE FULLEST EXTENT PERMITTED BY LAW, GGU SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE APP. GGU's total liability shall not exceed the amount you paid (if any) for use of the App in the 12 months preceding the claim.`
    },
    {
      title: '13. Changes to Terms',
      content: `GGU may update these Terms at any time. We will notify users of material changes via in-app notice or email at least 14 days before changes take effect. For Tween and Teen World users under 18, we will also notify the parent or guardian on file. Continued use of the App after changes constitutes acceptance of the updated Terms.`
    },
    {
      title: '14. Contact',
      content: `Girls Glowing Up™ LLC
Email: support@girlsglowingup.com
Website: gguapp.com
Mailing Address: Birmingham, Alabama

For questions about these Terms, contact us at the email above. We respond within 5 business days.`
    },
  ];

  return (
    <div className="min-h-screen text-white pb-28" style={{ backgroundColor: '#0d0608' }}>
      <div className="px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-pink-400" />
            <h1 className="text-xl font-bold">Terms of Service</h1>
          </div>
        </div>

        {/* Header card */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(236,72,153,0.3)' }}>
          <p className="text-sm font-bold text-white mb-1">Girls Glowing Up™ (GGU)</p>
          <p className="text-sm text-gray-300 leading-relaxed">Please read these Terms carefully before using the GGU App. GGU serves users ages 10 and older through three age-based worlds: Tween World (10–13), Teen World (14–17), and Women's World (18+). By creating an account or using the app, you (and, for users under 18, a parent or legal guardian) agree to be bound by these terms.</p>
          <p className="text-xs text-gray-400 mt-3">Effective Date: June 1, 2026 · Last Updated: June 1, 2026</p>
        </div>

        {/* Sections */}
        <div className="space-y-5">
          {sections.map((section, i) => (
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