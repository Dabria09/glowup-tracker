import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Phone, User, Shield } from 'lucide-react';

export default function StepParentalConsent({ data, update, onNext, onBack }) {
  const [parentName, setParentName] = useState(data.parent_name || '');
  const [parentEmail, setParentEmail] = useState(data.parent_email || '');
  const [parentPhone, setParentPhone] = useState(data.parent_phone || '');
  const [relationship, setRelationship] = useState(data.relationship || '');
  const [errors, setErrors] = useState({});

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

  const handleContinue = () => {
    if (!validate()) return;
    update({
      parent_name: parentName.trim(),
      parent_email: parentEmail.trim(),
      parent_phone: parentPhone.trim(),
      relationship: relationship.trim(),
    });
    onNext();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto glass-glow">
      <CardHeader>
        <CardTitle className="text-2xl font-playfair-display text-white flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          Parent or Guardian Consent
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Since you're under 13, we need consent from a parent or guardian before your account can be activated.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-primary/10 border-primary/20">
          <AlertDescription className="text-white text-sm">
            A parent or guardian must provide consent before you can access Girls Glowing Up. They will receive an email after the final agreement step.
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
              value={parentEmail}
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
            onClick={handleContinue}
            className="flex-1 bg-primary hover:bg-primary/90 text-white"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}