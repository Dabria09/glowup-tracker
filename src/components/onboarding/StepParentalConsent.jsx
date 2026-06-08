import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Phone, User, Info, Shield } from 'lucide-react';

export default function StepParentalConsent({ data, update, onNext, onBack, parentEmail, setParentEmail }) {
  const [parentName, setParentName] = useState(data.parent_name || '');
  const [parentPhone, setParentPhone] = useState(data.parent_phone || '');
  const [relationship, setRelationship] = useState(data.relationship || '');
  const [errors, setErrors] = useState({});
  const [consentSent, setConsentSent] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!parentName.trim()) {
      newErrors.parentName = 'Parent/guardian name is required';
    }
    
    if (!parentEmail?.trim()) {
      newErrors.parentEmail = 'Parent/guardian email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
      newErrors.parentEmail = 'Invalid email format';
    }
    
    if (!parentPhone?.trim()) {
      newErrors.parentPhone = 'Parent/guardian phone is required';
    }
    
    if (!relationship.trim()) {
      newErrors.relationship = 'Relationship is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendConsent = async () => {
    if (!validate()) return;

    try {
      // Update parent data
      update({
        parent_name: parentName,
        parent_phone: parentPhone,
        relationship: relationship,
      });

      // Send consent email to parent
      await fetch('/functions/sendParentalConsent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentName,
          parentEmail,
          parentPhone,
          relationship,
          applicantName: data.full_name,
        }),
      });

      setConsentSent(true);
      setParentEmail(parentEmail);
    } catch (err) {
      setErrors({ submit: 'Failed to send consent email. Please try again.' });
    }
  };

  if (consentSent) {
    return (
      <Card className="w-full max-w-2xl mx-auto glass-glow">
        <CardHeader>
          <CardTitle className="text-2xl font-playfair-display text-white flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            Parental Consent Sent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-primary/10 border-primary/20">
            <AlertDescription className="text-white">
              A consent email has been sent to <strong>{parentEmail}</strong>. Your parent or guardian must click the confirmation link in the email before you can continue with your application.
            </AlertDescription>
          </Alert>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
            <h3 className="text-sm font-semibold text-white">What happens next?</h3>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Your parent/guardian receives the consent email</li>
              <li>They click the confirmation link to verify their consent</li>
              <li>Once confirmed, you'll receive an email to continue your application</li>
              <li>Step 2 of your mentor application will unlock</li>
            </ol>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/10 border border-accent/20">
            <Info className="h-5 w-5 text-accent mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="text-white font-medium mb-1">Didn't receive the email?</p>
              <p>Ask your parent/guardian to check their spam folder. You can also resend the consent email if needed.</p>
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
              onClick={() => window.location.reload()}
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
              disabled
            >
              Waiting for Parent Confirmation...
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto glass-glow">
      <CardHeader>
        <CardTitle className="text-2xl font-playfair-display text-white flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          Parent or Guardian Consent
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Since you're under 18, we need consent from a parent or guardian before you can continue.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-primary/10 border-primary/20">
          <AlertDescription className="text-white text-sm">
            A parent or guardian must provide consent for you to participate as a teen mentor. They will receive an email to verify their consent.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parentName" className="text-white flex items-center gap-2">
              <User className="h-4 w-4" />
              Parent/Guardian Full Name *
            </Label>
            <Input
              id="parentName"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Jane Doe"
              className={errors.parentName ? 'border-destructive' : ''}
            />
            {errors.parentName && (
              <p className="text-destructive text-xs">{errors.parentName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentEmail" className="text-white flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Parent/Guardian Email Address *
            </Label>
            <Input
              id="parentEmail"
              type="email"
              value={parentEmail || ''}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="jane@example.com"
              className={errors.parentEmail ? 'border-destructive' : ''}
            />
            {errors.parentEmail && (
              <p className="text-destructive text-xs">{errors.parentEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentPhone" className="text-white flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Parent/Guardian Phone Number *
            </Label>
            <Input
              id="parentPhone"
              type="tel"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className={errors.parentPhone ? 'border-destructive' : ''}
            />
            {errors.parentPhone && (
              <p className="text-destructive text-xs">{errors.parentPhone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship" className="text-white">
              Relationship to You *
            </Label>
            <Input
              id="relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="Mother, Father, Legal Guardian, etc."
              className={errors.relationship ? 'border-destructive' : ''}
            />
            {errors.relationship && (
              <p className="text-destructive text-xs">{errors.relationship}</p>
            )}
          </div>
        </div>

        {errors.submit && (
          <Alert className="bg-destructive/10 border-destructive/20">
            <AlertDescription className="text-destructive text-sm">
              {errors.submit}
            </AlertDescription>
          </Alert>
        )}

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
            onClick={handleSendConsent}
            className="flex-1 bg-primary hover:bg-primary/90 text-white"
          >
            Send Consent Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}