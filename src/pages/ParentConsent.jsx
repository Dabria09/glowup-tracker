import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

export default function ParentConsent() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const getFunctionData = (result) => result?.data || result || {};

  useEffect(() => {
    if (!token) {
      setError('Invalid consent link');
      setLoading(false);
      return;
    }

    // Fetch consent status
    const checkConsent = async () => {
      try {
        const result = await base44.functions.invoke('processParentalConsent', {
          token,
          action: 'status',
        });
        const consent = getFunctionData(result);

        if (consent.error) {
          setError(consent.error);
          setLoading(false);
          return;
        }

        if (consent.already_responded) {
          setResponse({
            already_responded: true,
            consent_given: consent.consent_given,
            teen_name: consent.teen_name,
            parent_name: consent.parent_name,
          });
          setLoading(false);
          return;
        }

        setResponse({
          ready_to_respond: true,
          teen_name: consent.teen_name,
          parent_name: consent.parent_name,
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load consent information');
        setLoading(false);
      }
    };

    checkConsent();
  }, [token]);

  const handleRespond = async (action) => {
    try {
      const result = await base44.functions.invoke('processParentalConsent', { token, action });
      const data = getFunctionData(result);
      
      if (data.success || data.already_responded) {
        setResponse({
          already_responded: true,
          consent_given: data.consent_given ?? action === 'approve',
          teen_name: data.teen_name,
          parent_name: data.parent_name,
        });
      } else {
        setError(data.error || 'Failed to process response');
      }
    } catch (err) {
      setError('Failed to process your response');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-glow">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-white">Loading consent information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-6 w-6" />
              Consent Link Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground mt-4">
              If you believe this is an error, please contact us at{' '}
              <a href="mailto:mentors@girlsglowingup.com" className="text-primary hover:underline">
                mentors@girlsglowingup.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!response) {
    return null;
  }

  if (response.ready_to_respond) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg glass-glow">
          <CardHeader>
            <CardTitle className="text-2xl font-playfair-display text-white">
              Parental Consent Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-white">
                Hello <strong>{response.parent_name}</strong>,
              </p>
              <p className="text-muted-foreground mt-2">
                Your teen, <strong>{response.teen_name}</strong>, has applied to become a Teen Mentor with Girls Glowing Up™.
              </p>
            </div>

            <div className="space-y-4 text-sm text-muted-foreground">
              <h4 className="font-semibold text-white">What is GGU?</h4>
              <p>
                Girls Glowing Up™ is a Birmingham, Alabama-based girls empowerment platform serving girls ages 5 to 26. 
                Our app helps girls build confidence, financial literacy, wellness habits, and community connections 
                in a safe, moderated digital environment.
              </p>
              
              <h4 className="font-semibold text-white mt-4">What Teen Mentors Do</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Support younger girls through in-app messaging and group sessions</li>
                <li>Complete the GGU Mentor Lesson before approval</li>
                <li>Participate in a staff interview</li>
                <li>Follow Safety and Code of Conduct at all times</li>
                <li>Are monitored by GGU admin throughout mentorship</li>
              </ul>

              <h4 className="font-semibold text-white mt-4">What Teen Mentors Cannot Do</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Mentor girls in Glow Women category (19-26)</li>
                <li>Share personal contact information</li>
                <li>Engage in 1-on-1 video calls without facilitation</li>
                <li>Access adult-only features</li>
              </ul>

              <h4 className="font-semibold text-white mt-4">Safety Measures</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>All interactions monitored by GGU admin</li>
                <li>Zero-tolerance policy for inappropriate behavior</li>
                <li>Accounts can be suspended at any time</li>
                <li>Teen mentors identified with badge</li>
              </ul>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-amber-200 text-sm">
                <strong>Important:</strong> This consent link expires in 14 days. 
                If you don't respond, the application will be placed on hold.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <p className="text-white text-center font-semibold">
                Do you give consent for {response.teen_name} to proceed?
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => handleRespond('approve')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleRespond('decline')}
                  variant="destructive"
                  className="flex-1"
                  size="lg"
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  Decline
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-4">
              Questions? Contact us at{' '}
              <a href="mailto:mentors@girlsglowingup.com" className="text-primary hover:underline">
                mentors@girlsglowingup.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already responded
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            {response.consent_given ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <XCircle className="h-8 w-8 text-destructive" />
            )}
            Consent Response Recorded
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Thank you, {response.parent_name}. Your response has been recorded.
          </p>
          <div className={`rounded-lg p-4 ${response.consent_given ? 'bg-green-500/10 border border-green-500/30' : 'bg-destructive/10 border border-destructive/30'}`}>
            <p className={response.consent_given ? 'text-green-200' : 'text-destructive-foreground'}>
              <strong>Your decision:</strong> {response.consent_given ? 'APPROVED ✓' : 'DECLINED ✗'}
            </p>
          </div>
          {response.consent_given ? (
            <p className="text-sm text-muted-foreground">
              {response.teen_name} can now proceed with their GGU Mentor application. 
              They will receive next steps via email.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              The application has been placed on hold. 
              If you have questions or change your mind, contact us at{' '}
              <a href="mailto:mentors@girlsglowingup.com" className="text-primary hover:underline">
                mentors@girlsglowingup.com
              </a>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}