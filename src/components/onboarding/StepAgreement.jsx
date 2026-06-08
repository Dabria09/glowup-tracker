import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, FileText } from 'lucide-react';

export default function StepAgreement({ onBack, onSubmit, loading }) {
  const [acceptTOS, setAcceptTOS] = useState(false);
  const [acceptConduct, setAcceptConduct] = useState(false);
  const [acceptAccuracy, setAcceptAccuracy] = useState(false);
  const [signature, setSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = acceptTOS && acceptConduct && acceptAccuracy && signature.trim().length >= 2;

  const checkboxStyle = {
    width: 24,
    height: 24,
    border: '2px solid #ec4899',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit();
    } catch (error) {
      setIsSubmitting(false);
      alert('Something went wrong. Please try again.');
    }
  };



  return (
    <Card className="w-full max-w-2xl mx-auto" style={{ pointerEvents: 'auto', background: 'rgba(30, 10, 40, 0.72)', backdropFilter: 'blur(28px)', border: '1px solid rgba(255, 255, 255, 0.14)' }}>
      <CardHeader>
        <CardTitle className="text-2xl font-playfair-display text-white flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          Final Agreement
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Review and accept our terms to complete your application
        </p>
      </CardHeader>
      <CardContent className="space-y-6" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 50 }}>
        <Alert className="bg-primary/10 border-primary/20">
          <AlertDescription className="text-white text-sm">
            Before submitting, please read and accept the following agreements. Your electronic signature confirms your commitment to these terms.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {/* Terms of Service */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white mb-2">GGU Mentor Terms of Service</h3>
                <div style={scrollBoxStyle}>
                  <p style={{ marginBottom: '10px' }}><strong>1. Acceptance of Terms</strong><br/>These Mentor Terms of Service ("Terms") govern your participation as a mentor on the Girls Glowing Up™ platform ("GGU," "we," "us," or "our"). By submitting a mentor application and providing your electronic signature you agree to these Terms in full. If you do not agree you may not participate as a GGU mentor. These Terms apply to all mentors including Adult Mentors (age 18 and older) and Teen Mentors (ages 13 to 17).</p>
                  
                  <p style={headingStyle}>2. Mentor Eligibility</p>
                  <p style={{ marginBottom: '8px' }}><strong>Adult Mentors — Age 18 and Older:</strong> Must be at least 18 years of age. Must provide valid government-issued photo ID. Must consent to and clear a background check. Must complete the GGU Mentor Lesson with 80% or higher. Must complete a GGU staff interview. Must not have any history of abuse, exploitation, or crimes against minors.</p>
                  <p style={{ marginBottom: '10px' }}><strong>Teen Mentors — Ages 13 to 17:</strong> Must be between 13 and 17 years of age. Must provide valid school-issued student ID. Must obtain written consent from parent or legal guardian. Parent must countersign these Terms. Must complete the GGU Mentor Lesson with 80% or higher. Must complete a GGU staff interview. Background checks are not required for teen mentors.</p>
                  
                  <p style={headingStyle}>3. Background Check — Adult Mentors Only</p>
                  <p style={{ marginBottom: '10px' }}>All adult mentors must complete a background check administered by a third-party provider. This is non-negotiable to protect the safety of every girl on our platform. Results are reviewed by GGU admin only. If not cleared, your application will be declined. You cannot access mentee-facing features until cleared. GGU may require updated checks at any time.</p>
                  
                  <p style={headingStyle}>4. Mentor Responsibilities</p>
                  <p style={{ marginBottom: '8px' }}><strong>Communication:</strong> Communicate positively, encouragingly, age-appropriately, professionally. Never share personal contact info. Never initiate contact outside GGU platform. Never discuss sexual, violent, or inappropriate topics. Never use profanity. Report concerning behavior immediately.</p>
                  <p style={{ marginBottom: '8px' }}><strong>Sessions:</strong> Be present and prepared. Give 24hr notice for cancellations. Do not record without consent. Maintain professional boundaries.</p>
                  <p style={{ marginBottom: '10px' }}><strong>Teen Mentors:</strong> May only mentor Glow Girls (5-12) and Glow Teens (13-18). Cannot mentor Glow Women (19-26). Parent must be available by contact. GGU may contact parent if concerns arise.</p>
                  
                  <p style={headingStyle}>5. Prohibited Conduct</p>
                  <p style={{ marginBottom: '10px' }}>Sexual communication or conduct. Bullying, harassment, discrimination. Sharing inappropriate content. Establishing personal relationships outside platform. Misrepresenting identity. Commercial use. Accessing information beyond your role.</p>
                  
                  <p style={headingStyle}>6. Required Training</p>
                  <p style={{ marginBottom: '10px' }}>All mentors must complete the GGU Mentor Lesson and pass with 80% or higher. You may retake up to 3 times. After 3 failed attempts, your application will be placed on hold.</p>
                  
                  <p style={headingStyle}>7. Privacy and Confidentiality</p>
                  <p style={{ marginBottom: '10px' }}>All mentee information is confidential. You may not share mentee names, ages, stories, or session content. GGU complies with COPPA. Your mentor profile (name, photo, bio) will be visible to users.</p>
                  
                  <p style={headingStyle}>8. Volunteer Status</p>
                  <p style={{ marginBottom: '10px' }}>Mentors serve as volunteers unless separate written compensation agreement exists. No employment relationship is created.</p>
                  
                  <p style={headingStyle}>9. Suspension and Removal</p>
                  <p style={{ marginBottom: '10px' }}>GGU may suspend or remove mentors for: violating Terms, harmful conduct, failure to engage, failed background check, credible complaints. Notification by email. Removed mentors may not reapply without written permission.</p>
                  
                  <p style={headingStyle}>10. Limitation of Liability</p>
                  <p style={{ marginBottom: '10px' }}>Platform provided as-is. GGU not liable for damages arising from participation. You agree to indemnify GGU from claims arising from your conduct.</p>
                  
                  <p style={headingStyle}>11. Modifications</p>
                  <p style={{ marginBottom: '10px' }}>GGU may update Terms at any time. Mentors notified by email and in-app. Continued participation constitutes acceptance.</p>
                  
                  <p style={headingStyle}>12. Governing Law</p>
                  <p style={{ marginBottom: '10px' }}>Governed by laws of Alabama. Disputes resolved in Jefferson County, Alabama courts.</p>
                  
                  <p style={headingStyle}>13. Contact</p>
                  <p>Questions: mentors@girlsglowingup.com</p>
                </div>
                <div 
                  onClick={() => setAcceptTOS(!acceptTOS)}
                  className="flex items-center gap-3 mt-3 cursor-pointer"
                >
                  <div style={{ ...checkboxStyle, background: acceptTOS ? '#ec4899' : 'transparent' }}>
                    {acceptTOS && <span style={{ color: 'white', fontSize: '16px' }}>✓</span>}
                  </div>
                  <span className="text-sm text-white">I have read and accept the GGU Mentor Terms of Service in full</span>
                </div>
              </div>
            </div>
          </div>

          {/* Safety and Code of Conduct */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-accent mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white mb-2">Safety and Code of Conduct</h3>
                <div style={scrollBoxStyle}>
                  <p style={headingStyle}>Communication Standards</p>
                  <p style={{ marginBottom: '8px' }}>Always positive, encouraging, age-appropriate. Never profanity or offensive language. Report concerning behavior immediately.</p>
                  
                  <p style={headingStyle}>Boundaries</p>
                  <p style={{ marginBottom: '8px' }}>Never share phone, email, address, or social media. Never contact outside GGU. Never discuss sexual, violent, or political topics. Never encourage secrets from parents.</p>
                  
                  <p style={headingStyle}>Sessions</p>
                  <p style={{ marginBottom: '8px' }}>Be present and prepared. 24hr cancellation notice. No recording without consent. Professional boundaries — mentor, not friend or parent.</p>
                  
                  <p style={headingStyle}>Teen Mentor Rules</p>
                  <p style={{ marginBottom: '8px' }}>Only mentor Glow Girls (5-12) and Glow Teens (13-18). Cannot mentor Glow Women (19-26). Parent available by contact. GGU may contact parent anytime.</p>
                  
                  <p style={headingStyle}>Reporting</p>
                  <p>Report concerning behavior using in-app report function immediately.</p>
                </div>
                <div 
                  onClick={() => setAcceptConduct(!acceptConduct)}
                  className="flex items-center gap-3 mt-3 cursor-pointer"
                >
                  <div style={{ ...checkboxStyle, background: acceptConduct ? '#ec4899' : 'transparent' }}>
                    {acceptConduct && <span style={{ color: 'white', fontSize: '16px' }}>✓</span>}
                  </div>
                  <span className="text-sm text-white">I agree to follow the Safety and Code of Conduct at all times</span>
                </div>
              </div>
            </div>
          </div>

          {/* Truthfulness Acknowledgment */}
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white mb-2">Truthfulness Acknowledgment</h3>
                <p className="text-xs text-muted-foreground">
                  I certify that all information provided in this application is truthful, accurate, and complete. I understand that providing false or misleading information may result in rejection or removal.
                </p>
                <div 
                  onClick={() => setAcceptAccuracy(!acceptAccuracy)}
                  className="flex items-center gap-3 mt-3 cursor-pointer"
                >
                  <div style={{ ...checkboxStyle, background: acceptAccuracy ? '#ec4899' : 'transparent' }}>
                    {acceptAccuracy && <span style={{ color: 'white', fontSize: '16px' }}>✓</span>}
                  </div>
                  <span className="text-sm text-white">I certify all information is truthful and accurate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Electronic Signature */}
          <div className="space-y-2">
            <label className="text-white flex items-center gap-2 text-sm">
              Electronic Signature *
            </label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              autoCorrect="off"
              autoCapitalize="off"
              autoComplete="off"
              spellCheck="false"
              placeholder="Type your full name"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
            />
            <p className="text-xs text-muted-foreground">
              By typing your name above, you electronically sign this application with the same legal validity as a handwritten signature.
            </p>
          </div>
        </div>

        {/* Debug Display */}
        <div className="pt-4 pb-2 px-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xs font-mono text-accent">
            TOS: {acceptTOS ? '✅ true' : '❌ false'} — 
            Conduct: {acceptConduct ? '✅ true' : '❌ false'} — 
            Accuracy: {acceptAccuracy ? '✅ true' : '❌ false'} — 
            Signature: {signature ? `${signature.trim().length} chars` : 'empty'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Button: {!canSubmit ? 'DISABLED' : 'ENABLED'}
          </p>
        </div>

        <div className="flex gap-4 pt-4" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 100 }}>
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 border-white/20 text-white hover:bg-white/10"
            style={{ pointerEvents: 'auto !important', cursor: 'pointer' }}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || loading || isSubmitting}
            className="flex-1 text-white"
            style={{ 
              pointerEvents: 'auto !important', 
              cursor: canSubmit && !loading && !isSubmitting ? 'pointer' : 'not-allowed',
              background: canSubmit && !loading && !isSubmitting ? '#ec4899' : '#6b7280',
            }}
          >
            {(loading || isSubmitting) && <span className="animate-spin mr-2">⏳</span>}
            {loading || isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}