import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Info } from 'lucide-react';

export default function StepReferences({ data, update, onNext, onBack, isTeen }) {
  const [refs, setRefs] = useState(data.references || []);
  const [errors, setErrors] = useState({});

  const addReference = () => {
    if (refs.length < 2) {
      const newRefs = [...refs, { name: '', relationship: '', email: '' }];
      setRefs(newRefs);
      update({ references: newRefs });
    }
  };

  const removeReference = (index) => {
    const newRefs = refs.filter((_, i) => i !== index);
    setRefs(newRefs);
    update({ references: newRefs });
  };

  const updateReference = (index, field, value) => {
    const newRefs = [...refs];
    newRefs[index] = { ...newRefs[index], [field]: value };
    setRefs(newRefs);
    update({ references: newRefs });
    
    // Clear error when user starts typing
    if (errors[`ref_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`ref_${index}_${field}`]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    refs.forEach((ref, index) => {
      if (!ref.name?.trim()) {
        newErrors[`ref_${index}_name`] = 'Name is required';
        isValid = false;
      }
      if (!ref.relationship?.trim()) {
        newErrors[`ref_${index}_relationship`] = 'Relationship is required';
        isValid = false;
      }
      if (!ref.email?.trim()) {
        newErrors[`ref_${index}_email`] = 'Email is required';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ref.email)) {
        newErrors[`ref_${index}_email`] = 'Invalid email format';
        isValid = false;
      }
    });

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
          {isTeen 
            ? 'Optional: Add up to 2 references who can speak to your character (teen mentors only)'
            : 'Required: Add up to 2 professional or character references. GGU will contact them as part of the vetting process.'}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {refs.map((ref, index) => (
          <div key={index} className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Reference #{index + 1}</h3>
              {refs.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeReference(index)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor={`ref_${index}_name`} className="text-white">
                  Full Name *
                </Label>
                <Input
                  id={`ref_${index}_name`}
                  value={ref.name}
                  onChange={(e) => updateReference(index, 'name', e.target.value)}
                  placeholder="Jane Smith"
                  className={errors[`ref_${index}_name`] ? 'border-destructive' : ''}
                />
                {errors[`ref_${index}_name`] && (
                  <p className="text-destructive text-xs">{errors[`ref_${index}_name`]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`ref_${index}_relationship`} className="text-white">
                  Relationship to You *
                </Label>
                <Input
                  id={`ref_${index}_relationship`}
                  value={ref.relationship}
                  onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                  placeholder="Former supervisor, Teacher, Colleague, etc."
                  className={errors[`ref_${index}_relationship`] ? 'border-destructive' : ''}
                />
                {errors[`ref_${index}_relationship`] && (
                  <p className="text-destructive text-xs">{errors[`ref_${index}_relationship`]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`ref_${index}_email`} className="text-white">
                  Email Address *
                </Label>
                <Input
                  id={`ref_${index}_email`}
                  type="email"
                  value={ref.email}
                  onChange={(e) => updateReference(index, 'email', e.target.value)}
                  placeholder="jane@example.com"
                  className={errors[`ref_${index}_email`] ? 'border-destructive' : ''}
                />
                {errors[`ref_${index}_email`] && (
                  <p className="text-destructive text-xs">{errors[`ref_${index}_email`]}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {refs.length < 2 && (
          <Button
            type="button"
            variant="outline"
            onClick={addReference}
            className="w-full border-dashed border-2 border-muted-foreground/50 hover:border-primary/50 text-muted-foreground hover:text-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Reference #{refs.length + 1}
          </Button>
        )}

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