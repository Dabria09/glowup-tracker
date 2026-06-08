import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

export default function StepReferences({ ref1, setRef1, ref2, setRef2, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const updateRef1 = (field, value) => {
    setRef1(prev => ({ ...prev, [field]: value }));
    if (errors[`ref1_${field}`]) {
      setErrors(prev => ({ ...prev, [`ref1_${field}`]: '' }));
    }
  };

  const updateRef2 = (field, value) => {
    setRef2(prev => ({ ...prev, [field]: value }));
    if (errors[`ref2_${field}`]) {
      setErrors(prev => ({ ...prev, [`ref2_${field}`]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    // Validate ref1 if filled
    if (ref1.name || ref1.relationship || ref1.email) {
      if (!ref1.name?.trim()) {
        newErrors.ref1_name = 'Name is required';
        isValid = false;
      }
      if (!ref1.relationship?.trim()) {
        newErrors.ref1_relationship = 'Relationship is required';
        isValid = false;
      }
      if (!ref1.email?.trim()) {
        newErrors.ref1_email = 'Email is required';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ref1.email)) {
        newErrors.ref1_email = 'Invalid email format';
        isValid = false;
      }
    }

    // Validate ref2 if filled
    if (ref2.name || ref2.relationship || ref2.email) {
      if (!ref2.name?.trim()) {
        newErrors.ref2_name = 'Name is required';
        isValid = false;
      }
      if (!ref2.relationship?.trim()) {
        newErrors.ref2_relationship = 'Relationship is required';
        isValid = false;
      }
      if (!ref2.email?.trim()) {
        newErrors.ref2_email = 'Email is required';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ref2.email)) {
        newErrors.ref2_email = 'Invalid email format';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleContinue = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto glass-glow">
      <CardHeader>
        <CardTitle className="text-2xl font-playfair-display text-white">
          Professional References
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Add up to 2 professional or character references. GGU will contact them as part of the vetting process.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reference 1 */}
        <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
          <h3 className="text-sm font-semibold text-white">Reference #1</h3>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="ref1_name" className="text-white">
                Full Name *
              </Label>
              <Input
                id="ref1_name"
                value={ref1.name}
                onChange={(e) => updateRef1('name', e.target.value)}
                placeholder="Jane Smith"
                className={errors.ref1_name ? 'border-destructive' : ''}
              />
              {errors.ref1_name && (
                <p className="text-destructive text-xs">{errors.ref1_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ref1_relationship" className="text-white">
                Relationship to You *
              </Label>
              <Input
                id="ref1_relationship"
                value={ref1.relationship}
                onChange={(e) => updateRef1('relationship', e.target.value)}
                placeholder="Former supervisor, Teacher, Colleague, etc."
                className={errors.ref1_relationship ? 'border-destructive' : ''}
              />
              {errors.ref1_relationship && (
                <p className="text-destructive text-xs">{errors.ref1_relationship}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ref1_email" className="text-white">
                Email Address *
              </Label>
              <Input
                id="ref1_email"
                type="email"
                value={ref1.email}
                onChange={(e) => updateRef1('email', e.target.value)}
                placeholder="jane@example.com"
                className={errors.ref1_email ? 'border-destructive' : ''}
              />
              {errors.ref1_email && (
                <p className="text-destructive text-xs">{errors.ref1_email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Reference 2 */}
        <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
          <h3 className="text-sm font-semibold text-white">Reference #2 (Optional)</h3>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="ref2_name" className="text-white">
                Full Name
              </Label>
              <Input
                id="ref2_name"
                value={ref2.name}
                onChange={(e) => updateRef2('name', e.target.value)}
                placeholder="John Doe"
                className={errors.ref2_name ? 'border-destructive' : ''}
              />
              {errors.ref2_name && (
                <p className="text-destructive text-xs">{errors.ref2_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ref2_relationship" className="text-white">
                Relationship to You
              </Label>
              <Input
                id="ref2_relationship"
                value={ref2.relationship}
                onChange={(e) => updateRef2('relationship', e.target.value)}
                placeholder="Former supervisor, Teacher, Colleague, etc."
                className={errors.ref2_relationship ? 'border-destructive' : ''}
              />
              {errors.ref2_relationship && (
                <p className="text-destructive text-xs">{errors.ref2_relationship}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ref2_email" className="text-white">
                Email Address
              </Label>
              <Input
                id="ref2_email"
                type="email"
                value={ref2.email}
                onChange={(e) => updateRef2('email', e.target.value)}
                placeholder="john@example.com"
                className={errors.ref2_email ? 'border-destructive' : ''}
              />
              {errors.ref2_email && (
                <p className="text-destructive text-xs">{errors.ref2_email}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
          <Info className="h-5 w-5 text-primary mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="text-white font-medium mb-1">What happens next?</p>
            <p>GGU will contact your references via email as part of the application review process. Please ensure you have their permission before submitting.</p>
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