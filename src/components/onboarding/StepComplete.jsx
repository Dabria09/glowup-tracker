import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Mail, Clock, FileText, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StepComplete({ applicationId }) {
  const navigate = useNavigate();

  const stages = [
    {
      number: 1,
      title: 'Application Received',
      description: 'Your application is in our system',
      icon: '📥',
      status: 'complete'
    },
    {
      number: 2,
      title: 'Initial Review',
      description: 'GGU team reviews your application',
      icon: '👀',
      status: 'pending'
    },
    {
      number: 3,
      title: 'Background Check',
      description: 'Safety verification (adult mentors only)',
      icon: '🛡️',
      status: 'pending'
    },
    {
      number: 4,
      title: 'Interview',
      description: 'Video call with GGU coordinator',
      icon: '🎥',
      status: 'pending'
    },
    {
      number: 5,
      title: 'Training & Certification',
      description: 'Complete GGU Mentor Lesson',
      icon: '📚',
      status: 'pending'
    },
    {
      number: 6,
      title: 'Final Approval',
      description: 'Welcome to the mentor community!',
      icon: '🎉',
      status: 'pending'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-playfair-display text-white">
          Application Submitted!
        </h2>
        <p className="text-muted-foreground text-lg">
          Thank you for applying to become a GGU Mentor
        </p>
      </div>

      {/* Application ID */}
      <Card className="glass-glow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Application ID</p>
              <p className="text-2xl font-mono font-bold text-white">{applicationId}</p>
            </div>
            <FileText className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="glass-glow">
        <CardHeader>
          <CardTitle className="text-xl font-playfair-display text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            What Happens Next
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Estimated timeline: <span className="text-primary font-semibold">5-7 business days</span>
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage) => (
              <div
                key={stage.number}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  stage.status === 'complete'
                    ? 'bg-primary/10 border-primary/20'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="text-2xl">{stage.icon}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white">{stage.title}</h4>
                    {stage.status === 'complete' && (
                      <Badge className="bg-primary text-primary-foreground">
                        Complete
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{stage.description}</p>
                </div>
                <div className="text-sm font-semibold text-white">
                  Step {stage.number}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card className="glass-glow">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-2">
              <p className="text-white font-medium">Have Questions?</p>
              <p className="text-sm text-muted-foreground">
                Contact us at{' '}
                <a
                  href="mailto:mentor@girlsglowingup.com"
                  className="text-primary hover:underline"
                >
                  mentor@girlsglowingup.com
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/10 border border-accent/20">
            <Mail className="h-5 w-5 text-accent mt-0.5" />
            <div className="space-y-2">
              <p className="text-white font-medium">Stay Updated</p>
              <p className="text-sm text-muted-foreground">
                You'll receive email updates at each stage of the review process.
                Check your inbox (and spam folder) regularly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <Button
          onClick={() => navigate('/mentor-dashboard')}
          className="w-full bg-primary hover:bg-primary/90 text-white"
          size="lg"
        >
          Go to Mentor Dashboard
        </Button>
        <Button
          onClick={() => navigate('/mentorship')}
          variant="outline"
          className="w-full border-white/20 text-white hover:bg-white/10"
          size="lg"
        >
          View Application Status
        </Button>
      </div>
    </div>
  );
}