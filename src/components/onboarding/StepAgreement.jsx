import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, FileText, CheckCircle, Loader2, User, BookOpen, Users } from 'lucide-react';

export default function StepAgreement({
  onBack,
  onSubmit,
  loading,
  fullName,
  mentorTrack,
  ageGroups,
  expertise,
}) {
  const [tosScrolled, setTosScrolled] = useState(false);
  const [conductScrolled, setConductScrolled] = useState(false);
  const [acceptTOS, setAcceptTOS] = useState(false);
  const [acceptConduct, setAcceptConduct] = useState(false);
  const [acceptAccuracy, setAcceptAccuracy] = useState(false);
  const [signature, setSignature] = useState('');

  const tosRef = useRef(null);
  const conductRef = useRef(null);

  const canSubmit = acceptTOS && acceptConduct && acceptAccuracy && signature.trim().length >= 2;

  const checkScroll = (ref, setScrolled) => {
    const el = ref.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 20) {
      setScrolled(true);
    }
  };

  // Parse display values
  const parsedAgeGroups = (() => {
    try { return typeof ageGroups === 'string' ? JSON.parse(ageGroups) : (ageGroups || []); }
    catch { return []; }
  })();
  const parsedExpertise = (() => {
    try { return typeof expertise === 'string' ? JSON.parse(expertise) : (expertise || []); }
    catch { return []; }
  })();
  const firstName = (fullName || '').split(' ')[0] || 'Mentor';
  const isAdult = mentorTrack === 'adult';

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSubmit({ acceptTOS, acceptConduct, acceptAccuracy, signature });
  };

  const scrollBoxClass = "overflow-y-auto rounded-lg text-xs leading-relaxed text-gray-300 space-y-2";
  const scrollBoxStyle = { maxHeight: 180, background: 'rgba(0,0,0,0.35)', padding: '12px', borderRadius: '8px' };
  const sectionHead = { fontWeight: '700', color: '#f3f4f6', display: 'block', marginTop: '10px', marginBottom: '4px', fontSize: '12px' };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="text-center space-y-1">
        <div style={{ fontFamily: '"Playfair Display", serif', fontWeight: 900, fontSize: 22, background: 'linear-gradient(135deg, #e8526d, #f1b610)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Girls Glowing Up™
        </div>
        <p className="text-xs text-gray-400">Step 9 of 9</p>
        <div className="flex gap-1 mt-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full" style={{ background: i < 9 ? '#ec4899' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: '"Playfair Display", serif' }}>
          Almost Done — Review and Sign
        </h2>
        <p className="text-sm text-gray-400 mt-1">Please review your application summary and accept the agreements below.</p>
      </div>

      {/* Application Summary */}
      <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-pink-300 uppercase tracking-wide flex items-center gap-2">
          <User className="h-4 w-4" /> Application Summary
        </h3>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Full Name</span>
            <span className="text-white font-medium">{fullName || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Mentor Type</span>
            <span className={`font-semibold ${isAdult ? 'text-pink-300' : 'text-amber-300'}`}>
              {isAdult ? '✦ Adult Mentor (18+)' : '✦ Teen Mentor (13–17)'}
            </span>
          </div>
          {parsedAgeGroups.length > 0 && (
            <div>
              <span className="text-gray-400 flex items-center gap-1 mb-1"><Users className="h-3 w-3" /> Target Age Groups</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {parsedAgeGroups.map(g => (
                  <span key={g} className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-200 text-xs">{g}</span>
                ))}
              </div>
            </div>
          )}
          {parsedExpertise.length > 0 && (
            <div>
              <span className="text-gray-400 flex items-center gap-1 mb-1"><BookOpen className="h-3 w-3" /> Areas of Expertise</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {parsedExpertise.map(e => (
                  <span key={e} className="px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-200 text-xs">{e}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TOS Scrollbox */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-white">GGU Mentor Terms of Service</h3>
        </div>
        {!tosScrolled && (
          <p className="text-xs text-amber-400">↓ Scroll to the bottom to unlock this checkbox</p>
        )}
        <div
          ref={tosRef}
          className={scrollBoxClass}
          style={scrollBoxStyle}
          onScroll={() => checkScroll(tosRef, setTosScrolled)}
        >
          <span style={sectionHead}>1. Acceptance of Terms</span>
          These Mentor Terms of Service ("Terms") govern your participation as a mentor on the Girls Glowing Up™ platform ("GGU," "we," "us," or "our"). By submitting a mentor application and providing your electronic signature you agree to these Terms in full. If you do not agree you may not participate as a GGU mentor. These Terms apply to all mentors including Adult Mentors (age 18 and older) and Teen Mentors (ages 13 to 17).

          <span style={sectionHead}>2. Mentor Eligibility</span>
          <strong style={{ color: '#f9fafb' }}>Adult Mentors — Age 18 and Older:</strong> Must be at least 18 years of age at the time of application. Must provide valid government-issued photo ID for identity verification. Must consent to and clear a background check before approval. Must complete the GGU Mentor Lesson and pass the assessment with 80% or higher. Must complete a GGU staff interview before final approval. Must not have any history of abuse, exploitation, or crimes against minors.
          <br/><br/>
          <strong style={{ color: '#f9fafb' }}>Teen Mentors — Ages 13 to 17:</strong> Must be between 13 and 17 years of age at the time of application. Must provide a valid school-issued student ID for identity verification. Must obtain written consent from a parent or legal guardian before the application can proceed. Parent or guardian must countersign these Terms on behalf of the teen mentor. Must complete the GGU Mentor Lesson and pass the assessment with 80% or higher. Must complete a GGU staff interview before final approval. Background checks are not required for teen mentors.

          <span style={sectionHead}>3. Background Check — Adult Mentors Only</span>
          All adult mentors are required to successfully complete a background check administered by a third-party screening provider selected by GGU. This requirement is non-negotiable and is in place solely to protect the safety of every girl on our platform. The background check will be initiated by GGU admin after your application is reviewed. You will receive an email from our background check provider with instructions. Background check results are reviewed by GGU admin only and are never shared publicly. If your background check is not cleared your application will be declined and you will be notified by email. You cannot access any mentee-facing features until your background check is cleared. GGU reserves the right to require an updated background check at any time during your tenure as a mentor.

          <span style={sectionHead}>4. Mentor Responsibilities</span>
          As a GGU mentor you agree to communicate with mentees in a positive, encouraging, age-appropriate, and professional manner at all times. Never share your personal contact information including phone number, personal email, home address, or social media handles with mentees. Never initiate or encourage communication with mentees outside of the GGU platform. Never discuss topics that are sexual, violent, politically divisive, or otherwise inappropriate for the age group you are mentoring. Never use profanity or offensive language in any platform interaction. Report any concerning behavior from mentees or other users to GGU admin immediately using the in-app report function. Be present and prepared for all scheduled sessions. Give at least 24 hours notice if you need to cancel or reschedule a session. Do not record sessions without explicit written consent from GGU and the mentee's parent or guardian if applicable. Maintain professional boundaries at all times — you are a mentor not a friend peer or parent figure.
          <br/><br/>
          <strong style={{ color: '#f9fafb' }}>Teen Mentor Additional Rules:</strong> Teen mentors may only mentor girls in the Glow Girls (5 to 12) and Glow Teens (13 to 18) age groups. Teen mentors may not mentor Glow Women (19 to 26). Teen mentors must have a parent or guardian available by contact throughout their tenure. GGU may contact the teen mentor's parent or guardian at any time if a conduct concern arises.

          <span style={sectionHead}>5. Prohibited Conduct</span>
          The following conduct is strictly prohibited and will result in immediate suspension or permanent removal: Any form of sexual communication, solicitation, or conduct toward any platform user. Bullying, harassment, intimidation, or discrimination of any kind. Sharing, distributing, or requesting inappropriate images or content. Attempting to establish personal relationships with mentees outside of the GGU platform. Misrepresenting your identity, credentials, or background. Providing false information during the application process. Encouraging a mentee to keep any conversation or interaction secret from their parents or guardians. Using the platform for any commercial purpose, solicitation, or self-promotion. Accessing or attempting to access features or information beyond your approved mentor role.

          <span style={sectionHead}>6. Required Training — GGU Mentor Lesson</span>
          All mentors must complete the GGU Mentor Lesson before receiving final approval. This lesson covers GGU values, mission, and community standards; safe and appropriate communication with minors; what mentors can and cannot do on the platform; how to structure an effective mentoring session; and how to recognize and report concerning behavior. A quiz follows the lesson. You must score 80% or higher to pass. You may retake the quiz up to 3 times. If you do not pass after 3 attempts your application will be placed on hold and GGU will contact you directly.

          <span style={sectionHead}>7. Privacy and Confidentiality</span>
          All mentee information is confidential. You may not discuss, share, or disclose any information about your mentees with any third party. Mentee names, ages, personal stories, and session content are private and protected. GGU complies with the Children's Online Privacy Protection Act (COPPA) and all applicable privacy laws. You agree not to collect, store, or use any personal information about mentees outside of the GGU platform. Your mentor profile information including your name, photo, bio, and expertise areas will be visible to GGU users.

          <span style={sectionHead}>8. Volunteer Status and Compensation</span>
          GGU mentors serve in a volunteer capacity unless a separate written compensation agreement has been executed by both parties. Participation as a GGU mentor does not create an employment relationship, contractor relationship, or any entitlement to compensation unless explicitly agreed to in writing.

          <span style={sectionHead}>9. Suspension and Removal</span>
          GGU reserves the right to suspend or permanently remove any mentor from the platform at any time for violation of any provision of these Terms; conduct that GGU determines to be harmful or potentially harmful to any user; failure to maintain active engagement with assigned mentees without notice; a background check that does not clear (adult mentors); complaints from mentees, parents, or other users that GGU determines to be credible; or any conduct that GGU determines to be inconsistent with its mission and values. GGU will notify the mentor of suspension or removal by email. Removed mentors may not reapply without explicit written permission from GGU leadership.

          <span style={sectionHead}>10. Limitation of Liability</span>
          GGU provides the mentor platform on an as-is basis. To the fullest extent permitted by law GGU is not liable for any damages arising from your participation as a mentor including but not limited to disputes with mentees, emotional distress, reputational harm, or loss of time. You agree to indemnify and hold harmless Girls Glowing Up™, its founders, employees, and agents from any claims, damages, or expenses arising from your conduct on the platform.

          <span style={sectionHead}>11. Modifications to These Terms</span>
          GGU reserves the right to update these Terms at any time. Mentors will be notified of material changes by email and in-app notification. Continued participation as a mentor after notification of changes constitutes acceptance of the updated Terms.

          <span style={sectionHead}>12. Governing Law</span>
          These Terms are governed by the laws of the State of Alabama. Any disputes arising from these Terms shall be resolved in the courts of Jefferson County, Alabama.

          <span style={sectionHead}>13. Contact</span>
          For questions about these Terms or the GGU Mentor Program please contact us at: mentors@girlsglowingup.com
        </div>
        <div className={`flex items-center gap-3 mt-1 ${!tosScrolled ? 'opacity-40 pointer-events-none' : ''}`}>
          <input
            type="checkbox"
            id="tos-cb"
            checked={acceptTOS}
            disabled={!tosScrolled}
            onChange={(e) => setAcceptTOS(e.target.checked)}
            className="w-5 h-5 cursor-pointer accent-pink-500"
          />
          <label htmlFor="tos-cb" className="text-sm text-white cursor-pointer">
            I have read and agree to the GGU Mentor Terms of Service
          </label>
        </div>
      </div>

      {/* Safety & Code of Conduct Scrollbox */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">GGU Safety and Code of Conduct Agreement</h3>
        </div>
        {!conductScrolled && (
          <p className="text-xs text-amber-400">↓ Scroll to the bottom to unlock this checkbox</p>
        )}
        <div
          ref={conductRef}
          className={scrollBoxClass}
          style={scrollBoxStyle}
          onScroll={() => checkScroll(conductRef, setConductScrolled)}
        >
          <span style={sectionHead}>Communication Standards</span>
          Always communicate in a positive, encouraging, age-appropriate, and professional manner. Never use profanity, offensive language, or tone that could be perceived as shaming, belittling, or dismissive. Report any concerning behavior from any user to GGU admin immediately using the in-app report function. Do not share your personal contact details — phone number, email address, home address, or social media handles — with any mentee.

          <span style={sectionHead}>Boundaries</span>
          Never initiate or encourage any form of communication with mentees outside the GGU platform. Never discuss topics that are sexual, violent, politically divisive, or otherwise inappropriate for your mentee's age group. Never record any session or conversation without explicit written consent from GGU and the mentee's parent or guardian where applicable. Never encourage a mentee to keep any conversation or interaction secret from their parent or guardian. Do not attempt to establish personal friendships or romantic connections with any mentee.

          <span style={sectionHead}>Session Conduct</span>
          Be present, prepared, and punctual for all scheduled sessions. Provide at least 24 hours advance notice when you must cancel or reschedule a session. Maintain professional boundaries at all times — you are a mentor, not a peer, friend, or parent figure. Focus sessions on the mentee's goals, growth, and the agreed mentorship subject matter.

          <span style={sectionHead}>Teen Mentor Conduct Rules</span>
          Teen mentors may only mentor girls in the Glow Girls (ages 5 to 12) and Glow Teens (ages 13 to 18) age groups. Teen mentors may never mentor or engage with Glow Women (ages 19 to 26). Teen mentors must ensure a parent or guardian is available by phone or contact throughout their tenure. GGU admin may contact the teen mentor's parent or guardian at any time if a conduct concern arises. Teen mentors must report any interaction that makes them feel unsafe or uncomfortable to GGU admin immediately.

          <span style={sectionHead}>Prohibited Behavior</span>
          The following behaviors will result in immediate account suspension and possible permanent removal from the platform: sharing, requesting, or distributing sexual, violent, or inappropriate content of any kind; bullying, harassing, intimidating, or discriminating against any user; misrepresenting your identity, age, credentials, or background; using the GGU platform for commercial solicitation, self-promotion, or any purpose outside of mentorship; accessing or attempting to access account information, features, or content beyond your approved mentor role.

          <span style={sectionHead}>Reporting Obligations</span>
          All GGU mentors are required reporters of concerning behavior. If you observe, suspect, or experience abuse, exploitation, or any conduct that may harm a minor, you must immediately report it using the GGU in-app report function and contact GGU admin at mentors@girlsglowingup.com. Failure to report known or suspected harmful behavior may result in removal from the platform.

          <span style={sectionHead}>Acknowledgment</span>
          By accepting this agreement you confirm that you have read, understood, and agree to uphold this Safety and Code of Conduct in every interaction on the Girls Glowing Up™ platform. You understand that violations may result in suspension, permanent removal, and where applicable, referral to appropriate authorities.
        </div>
        <div className={`flex items-center gap-3 mt-1 ${!conductScrolled ? 'opacity-40 pointer-events-none' : ''}`}>
          <input
            type="checkbox"
            id="conduct-cb"
            checked={acceptConduct}
            disabled={!conductScrolled}
            onChange={(e) => setAcceptConduct(e.target.checked)}
            className="w-5 h-5 cursor-pointer accent-pink-500"
          />
          <label htmlFor="conduct-cb" className="text-sm text-white cursor-pointer">
            I have read and agree to the GGU Safety and Code of Conduct
          </label>
        </div>
      </div>

      {/* Truthfulness Checkbox */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-semibold text-white">Truthfulness Acknowledgment</p>
            <p className="text-xs text-gray-400">I certify that all information provided in this application is truthful, accurate, and complete. I understand that providing false or misleading information may result in rejection or removal from the platform.</p>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="accuracy-cb"
                checked={acceptAccuracy}
                onChange={(e) => setAcceptAccuracy(e.target.checked)}
                className="w-5 h-5 cursor-pointer accent-pink-500"
              />
              <label htmlFor="accuracy-cb" className="text-sm text-white cursor-pointer">
                I confirm that all information I have provided is truthful and accurate
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Electronic Signature */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-white flex items-center gap-2">
          Electronic Signature <span className="text-pink-400">*</span>
        </label>
        <input
          type="text"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          autoCorrect="off"
          autoCapitalize="words"
          autoComplete="name"
          spellCheck="false"
          placeholder="Type your full legal name"
          className="w-full px-4 py-3 rounded-xl bg-gray-800/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition text-sm"
        />
        <p className="text-xs text-gray-500">
          By typing your full legal name above, you electronically sign this application with the same legal validity as a handwritten signature.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 border-white/20 text-white hover:bg-white/10"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className="flex-1 text-white font-semibold py-3 transition-all"
          style={{
            background: canSubmit && !loading ? 'linear-gradient(135deg, #ec4899, #db2777)' : '#374151',
            boxShadow: canSubmit && !loading ? '0 4px 20px rgba(236,72,153,0.3)' : 'none',
            cursor: canSubmit && !loading ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</>
          ) : (
            'Submit Application ✨'
          )}
        </Button>
      </div>
    </div>
  );
}