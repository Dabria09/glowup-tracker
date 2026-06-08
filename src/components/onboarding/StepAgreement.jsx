import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, FileText, PenTool } from 'lucide-react';

export default function StepAgreement({ acceptTOS, setAcceptTOS, acceptConduct, setAcceptConduct, signature, setSignature, onSubmit, onBack, loading }) {
  const [showSignatureError, setShowSignatureError] = useState(false);

  // Simple validation: signature is valid if it has 2+ characters
  const signatureValid = signature && signature.trim().length >= 2;
  
  // Submit is enabled only when all 3 conditions are met
  const canSubmit = acceptTOS && acceptConduct && signatureValid;

  const handleSignatureChange = (e) => {
    setSignature(e.target.value);
    // Clear error message while typing
    setShowSignatureError(false);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    // Call parent submit handler
    if (typeof onSubmit === 'function') {
      onSubmit();
    }
  };

  const scrollBoxStyle = {
    maxHeight: '200px',
    overflowY: 'auto',
    fontSize: '12px',
    lineHeight: '1.5',
    color: '#9ca3af',
    paddingRight: '8px',
  };

  const headingStyle = {
    color: '#f1b610',
    fontWeight: '600',
    marginTop: '12px',
    marginBottom: '6px',
    fontSize: '12px',
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
                <div className="flex items-start gap-2 mt-3">
                  <Checkbox
                    id="tos"
                    checked={acceptTOS}
                    onCheckedChange={setAcceptTOS}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="tos" className="text-sm text-white cursor-pointer">
                    I have read and accept the GGU Mentor Terms of Service in full
                  </Label>
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
                <div className="flex items-start gap-2 mt-3">
                  <Checkbox
                    id="conduct"
                    checked={acceptConduct}
                    onCheckedChange={setAcceptConduct}
                    className="data-[state=checked]:bg-accent"
                  />
                  <Label htmlFor="conduct" className="text-sm text-white cursor-pointer">
                    I agree to follow the Safety and Code of Conduct at all times
                  </Label>
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
                <div className="flex items-center gap-2 mt-3">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  <span className="text-xs text-white">Acknowledged by proceeding</span>
                </div>
              </div>
            </div>
          </div>

          {/* Electronic Signature */}
          <div className="space-y-2">
            <Label htmlFor="signature" className="text-white flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Electronic Signature *
            </Label>
            <Input
              id="signature"
              value={signature}
              onChange={handleSignatureChange}
              placeholder="Type your full legal name"
              className={showSignatureError ? 'border-destructive' : ''}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <p className="text-xs text-muted-foreground">
              By typing your name above, you electronically sign this application with the same legal validity as a handwritten signature.
            </p>
            {showSignatureError && (
              <p className="text-destructive text-xs">Electronic Agreement Required</p>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 100 }}>
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🟡 Back button clicked');
              onBack();
            }}
            className="flex-1 border-white/20 text-white hover:bg-white/10"
            style={{ pointerEvents: 'auto !important', cursor: 'pointer', position: 'relative', zIndex: 101 }}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit(e);
            }}
            className="flex-1 bg-primary hover:bg-primary/90 text-white"
            disabled={!canSubmit || loading}
            style={{ pointerEvents: 'auto !important', cursor: 'pointer', position: 'relative', zIndex: 101, touchAction: 'manipulation' }}
          >
            {loading && <span className="animate-spin mr-2">⏳</span>}
            {loading ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}