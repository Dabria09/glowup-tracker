import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, FileText, CheckCircle, Loader2 } from 'lucide-react';

export default function StepCommunityAgreement({ onBack, onSubmit, loading }) {
  const [tosScrolled, setTosScrolled] = useState(false);
  const [conductScrolled, setConductScrolled] = useState(false);
  const [acceptTOS, setAcceptTOS] = useState(false);
  const [acceptConduct, setAcceptConduct] = useState(false);
  const [acceptAccuracy, setAcceptAccuracy] = useState(false);

  const tosRef = useRef(null);
  const conductRef = useRef(null);

  const canSubmit = acceptTOS && acceptConduct && acceptAccuracy;

  const checkScroll = (ref, setScrolled) => {
    const el = ref.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 20) setScrolled(true);
  };

  const scrollBoxClass = "overflow-y-auto rounded-lg text-xs leading-relaxed text-gray-300 space-y-2";
  const scrollBoxStyle = { maxHeight: 180, background: 'rgba(0,0,0,0.35)', padding: '12px', borderRadius: '8px' };
  const sectionHead = { fontWeight: '700', color: '#f3f4f6', display: 'block', marginTop: '10px', marginBottom: '4px', fontSize: '12px' };

  const PlainCheckbox = ({ checked, disabled = false, onClick, label }) => (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}
      className={`flex items-center gap-3 mt-1 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className={`w-5 h-5 shrink-0 rounded border flex items-center justify-center ${checked ? 'bg-pink-500 border-pink-500' : 'border-white/30'}`}>
        {checked && <CheckCircle className="w-3 h-3 text-white" />}
      </div>
      <span className="text-sm text-white">{label}</span>
    </div>
  );

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSubmit({ acceptTOS, acceptConduct, acceptAccuracy });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: '"Playfair Display", serif' }}>
          Almost Done ✨
        </h2>
        <p className="text-sm text-gray-400 mt-1">Please review and accept the community agreements below to complete your registration.</p>
      </div>

      {/* Community Terms of Service */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-white">GGU Community Terms of Service</h3>
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
          These Community Terms of Service ("Terms") govern your participation as a member of the Girls Glowing Up™ platform ("GGU," "we," "us," or "our"). By creating an account and completing registration you agree to these Terms in full. If you do not agree you may not use the platform.

          <span style={sectionHead}>2. Eligibility</span>
          You must be at least 10 years old to join GGU. Members under the age of 13 must have verifiable parental or guardian consent before accessing community features. GGU reserves the right to verify age and consent at any time.

          <span style={sectionHead}>3. Account Responsibilities</span>
          You are responsible for keeping your account credentials secure. You may not share your account with anyone else. All information you provide during registration must be truthful and accurate. You must notify GGU immediately if you become aware of any unauthorized use of your account.

          <span style={sectionHead}>4. Community Standards</span>
          As a GGU community member you agree to treat every member with respect, kindness, and empathy. You may not post, share, or send content that is hateful, discriminatory, sexually explicit, violent, or harmful in any way. You may not bully, harass, threaten, or intimidate any other member. You may not share personal contact information with other members outside of the platform's approved channels. You may not impersonate any other person or entity.

          <span style={sectionHead}>5. Content You Share</span>
          You retain ownership of any content you post on GGU. By posting content you grant GGU a non-exclusive license to display that content within the platform. GGU reserves the right to remove any content that violates these Terms or our community guidelines at any time without notice.

          <span style={sectionHead}>6. Privacy and Safety</span>
          GGU takes the privacy and safety of its members seriously. GGU complies with the Children's Online Privacy Protection Act (COPPA) and all applicable privacy laws. Please review our full Privacy Policy for details on how we collect and use your information. Never share your home address, school name, phone number, or other identifying information publicly on the platform.

          <span style={sectionHead}>7. Prohibited Conduct</span>
          The following conduct is strictly prohibited and will result in account suspension or permanent removal: sharing sexually explicit or violent content; bullying, harassment, or intimidation; impersonating staff, mentors, or other members; attempting to contact other members outside of the platform; any activity that violates applicable law.

          <span style={sectionHead}>8. Modifications</span>
          GGU may update these Terms at any time. You will be notified of material changes via email or in-app notification. Continued use of the platform after notification constitutes acceptance of the updated Terms.

          <span style={sectionHead}>9. Governing Law</span>
          These Terms are governed by the laws of the State of Alabama. Any disputes shall be resolved in the courts of Jefferson County, Alabama.

          <span style={sectionHead}>10. Contact</span>
          For questions about these Terms please contact us at: hello@girlsglowingup.com
        </div>
        <PlainCheckbox
          checked={acceptTOS}
          disabled={!tosScrolled}
          onClick={() => setAcceptTOS(v => !v)}
          label="I have read and agree to the GGU Community Terms of Service"
        />
      </div>

      {/* Community Code of Conduct */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">GGU Community Code of Conduct</h3>
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
          <span style={sectionHead}>Be Kind and Supportive</span>
          GGU is a safe space for girls to grow, connect, and glow up together. Every member deserves to feel welcome and supported. Lift each other up — never tear each other down.

          <span style={sectionHead}>Respect Everyone</span>
          Treat all members with dignity and respect regardless of age, background, appearance, beliefs, or identity. Disagreements are okay; disrespect is not. If someone asks you to stop a behavior, stop immediately.

          <span style={sectionHead}>Keep It Safe</span>
          Do not share personal information such as your full name, home address, school, phone number, or location with other members. Do not meet up with anyone you only know from GGU without a trusted adult's knowledge and approval. Report anything that makes you feel unsafe to a GGU admin immediately.

          <span style={sectionHead}>Keep It Clean</span>
          Do not post, share, or send anything that is sexually explicit, violent, hateful, or inappropriate for the GGU community. No profanity, slurs, or language designed to hurt others. No spam, advertisements, or self-promotion.

          <span style={sectionHead}>Be Honest</span>
          Use your real age and accurate information when participating on the platform. Do not pretend to be someone you are not. Do not spread rumors or misinformation about other members or public figures.

          <span style={sectionHead}>Report and Protect</span>
          If you see something that violates these standards, use the in-app report button to alert GGU admin. You are not alone — GGU staff monitors the platform to keep everyone safe. Your reports are confidential.

          <span style={sectionHead}>Acknowledgment</span>
          By accepting this Code of Conduct you agree to be a positive, respectful, and responsible member of the Girls Glowing Up™ community. Violations may result in content removal, account suspension, or permanent removal from the platform.
        </div>
        <PlainCheckbox
          checked={acceptConduct}
          disabled={!conductScrolled}
          onClick={() => setAcceptConduct(v => !v)}
          label="I have read and agree to the GGU Community Code of Conduct"
        />
      </div>

      {/* Truthfulness */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-semibold text-white">Truthfulness Acknowledgment</p>
            <p className="text-xs text-gray-400">I confirm that all information I provided during registration is truthful and accurate. I understand that providing false information may result in account removal.</p>
            <PlainCheckbox
              checked={acceptAccuracy}
              onClick={() => setAcceptAccuracy(v => !v)}
              label="I confirm that all information I have provided is truthful and accurate"
            />
          </div>
        </div>
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
          {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Submitting...</> : 'Join the Sisterhood ✨'}
        </Button>
      </div>
    </div>
  );
}