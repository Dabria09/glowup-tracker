import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  const sections = [
    {
      title: '1. Who We Are',
      content: `Girls Glowing Up™ (GGU) is a girls empowerment organization headquartered in Birmingham, Alabama. The GGU App ("App") is a digital platform designed to empower girls ages 10–18 through personal development, wellness resources, mentorship, and community connection.

Organization Name: Girls Glowing Up™
Website: gguapp.com | girlsglowingup.com
Contact Email: privacy@girlsglowingup.com
Mailing Address: Birmingham, Alabama`
    },
    {
      title: '2. Scope of This Policy',
      content: `This Privacy Policy applies to all users of the GGU App and related websites, including girls ages 10–18 ("Users") and their parents or legal guardians ("Parents"). It describes how we collect, use, share, and protect information.`
    },
    {
      title: '3. Information We Collect',
      content: `From Users (ages 10–18):
• Account registration: first name, username, age/date of birth, email address
• Profile content: avatar/photo, bio, interests, posts, diary entries, vision boards
• Activity data: challenge completions, points earned, check-ins, glow goals
• Device/technical data: device type, IP address, app version, usage logs

From Parents/Guardians:
• Name, email address, and relationship to the child
• Parental consent confirmation and date

We do NOT collect Social Security numbers, payment card data, or precise GPS location.`
    },
    {
      title: '4. COPPA Compliance (Children Under 13)',
      content: `GGU complies fully with the Children's Online Privacy Protection Act (COPPA).

For users ages 10–12:
• We require verifiable parental consent BEFORE collecting personal information
• Parents can review, correct, or delete their child's personal information at any time
• We do not condition participation on disclosing more information than necessary
• We do not share children's information with third parties for marketing

To provide or revoke consent, contact us at: privacy@girlsglowingup.com`
    },
    {
      title: '5. How We Use Information',
      content: `We use collected information to:
• Create and manage user accounts
• Deliver app features including challenges, wellness tools, mentorship, and community
• Personalize content based on age group and interests
• Award Glow Points and track progress
• Ensure platform safety and enforce community guidelines
• Communicate important updates and safety notices
• Comply with legal obligations`
    },
    {
      title: '6. Information Sharing',
      content: `We do NOT sell personal information to third parties.

We may share information with:
• Service providers who help us operate the app (hosting, analytics) under strict data agreements
• Law enforcement when required by law or to protect safety
• Parents/guardians of users under 13 upon verified request

We do NOT share personal information for advertising or marketing purposes.`
    },
    {
      title: '7. Mentorship & Community Safety',
      content: `The GGU Mentorship Hub connects teens with verified mentors. For users ages 10–12, parental consent is required before accessing mentorship features. All mentors are vetted and session activity is monitored. Parents can view session logs in the Parent Dashboard at any time.

Community posts and content are subject to moderation. Users may report inappropriate content directly within the app.`
    },
    {
      title: '8. Data Retention & Deletion',
      content: `We retain personal information only as long as necessary to provide services or as required by law.

Users (or parents of users under 18) may request:
• Access to their personal information
• Correction of inaccurate data
• Deletion of their account and associated data

To submit a request: privacy@girlsglowingup.com

Account deletion removes your profile, posts, diary entries, and activity data within 30 days.`
    },
    {
      title: '9. Security',
      content: `We implement industry-standard safeguards including encryption in transit (TLS), access controls, and regular security reviews. No system is 100% secure. If you believe your account has been compromised, contact support immediately.`
    },
    {
      title: '10. Changes to This Policy',
      content: `We may update this Privacy Policy periodically. We will notify users of material changes via in-app notice or email. Continued use of the App after changes constitutes acceptance of the updated policy.`
    },
    {
      title: '11. Contact Us',
      content: `Girls Glowing Up™
Email: privacy@girlsglowingup.com
Website: gguapp.com
Mailing Address: Birmingham, Alabama

For parental consent requests, data deletion, or privacy concerns, please email us directly. We respond within 5 business days.`
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
            <Shield size={20} className="text-pink-400" />
            <h1 className="text-xl font-bold">Privacy Policy</h1>
          </div>
        </div>

        {/* Header card */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(236,72,153,0.3)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400 text-sm font-bold">⚠️ IMPORTANT</span>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">This app is designed for girls ages 10–18. We take the privacy and safety of minors extremely seriously. This policy complies with COPPA and applicable state privacy laws.</p>
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