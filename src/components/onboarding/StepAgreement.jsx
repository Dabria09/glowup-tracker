import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, FileText, PenTool } from 'lucide-react';

export default function StepAgreement({ acceptTOS, setAcceptTOS, acceptConduct, setAcceptConduct, signature, setSignature, onSubmit, onBack, loading }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!acceptTOS) {
      newErrors.acceptTOS = 'You must accept the Terms of Service';
    }
    
    if (!acceptConduct) {
      newErrors.acceptConduct = 'You must accept the Safety and Code of Conduct';
    }
    
    if (!signature?.trim()) {
      newErrors.signature = 'Electronic signature is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto glass-glow">
      <CardHeader>
        <CardTitle className="text-2xl font-playfair-display text-white flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          Final Agreement
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Review and accept our terms to complete your application
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
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
                <div className="text-xs text-muted-foreground space-y-2 max-h-32 overflow-y-auto pr-2">
                  <p>By accepting these terms, you agree to:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Provide mentoring services in good faith</li>
                    <li>Maintain confidentiality of mentee information</li>
                    <li>Follow all platform guidelines and policies</li>
                    <li>Participate in required training and background checks</li>
                    <li>Report any concerns about mentee safety immediately</li>
                  </ul>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <Checkbox
                    id="tos"
                    checked={acceptTOS}
                    onCheckedChange={setAcceptTOS}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="tos" className="text-sm text-white cursor-pointer">
                    I have read and accept the GGU Mentor Terms of Service
                  </Label>
                </div>
                {errors.acceptTOS && (
                  <p className="text-destructive text-xs">{errors.acceptTOS}</p>
                )}
              </div>
            </div>
          </div>

          {/* Safety and Code of Conduct */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-accent mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white mb-2">Safety and Code of Conduct</h3>
                <div className="text-xs text-muted-foreground space-y-2 max-h-32 overflow-y-auto pr-2">
                  <p>You commit to:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Maintain appropriate boundaries with mentees</li>
                    <li>Communicate only through official platform channels</li>
                    <li>Respect diversity and promote inclusivity</li>
                    <li>Avoid sharing inappropriate or harmful content</li>
                    <li>Attend all scheduled sessions or provide 24hr notice</li>
                    <li>Immediately report any safety concerns or violations</li>
                  </ul>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <Checkbox
                    id="conduct"
                    checked={acceptConduct}
                    onCheckedChange={setAcceptConduct}
                    className="data-[state=checked]:bg-accent"
                  />
                  <Label htmlFor="conduct" className="text-sm text-white cursor-pointer">
                    I have read and accept the Safety and Code of Conduct
                  </Label>
                </div>
                {errors.acceptConduct && (
                  <p className="text-destructive text-xs">{errors.acceptConduct}</p>
                )}
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
                  I certify that all information provided in this application is truthful, accurate, and complete. I understand that providing false or misleading information may result in rejection of my application or removal from the program.
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
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Type your full legal name"
              className={errors.signature ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground">
              By typing your name above, you electronically sign this application with the same legal validity as a handwritten signature.
            </p>
            {errors.signature && (
              <p className="text-destructive text-xs">{errors.signature}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
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
            className="flex-1 bg-primary hover:bg-primary/90 text-white"
            disabled={loading}
          >
            {loading && <span className="animate-spin mr-2">⏳</span>}
            Submit Application
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}