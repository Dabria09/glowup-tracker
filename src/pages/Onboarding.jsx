import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import StepDOB from '@/components/onboarding/StepDOB';
import StepUsername from '@/components/onboarding/StepUsername';
import StepParentalConsent from '@/components/onboarding/StepParentalConsent';
import StepAgreement from '@/components/onboarding/StepAgreement';
import StepComplete from '@/components/onboarding/StepComplete';
import StepMentorChoice from '@/components/onboarding/StepMentorChoice';

const STEPS_DEFAULT = ['dob', 'username', 'agreement', 'complete'];
const STEPS_MINOR   = ['dob', 'username', 'parental', 'agreement', 'complete'];
const STEPS_MENTOR  = ['dob', 'username', 'agreement', 'mentor', 'complete'];

export default function Onboarding() {
  const [hardBanned, setHardBanned] = useState(null);
  const navigate = useNavigate();
  const wantsMentor = new URLSearchParams(window.location.search).get('mentor') === 'true';
  const [user, setUser] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState({
    date_of_birth: '', age: null, age_group: '',
    username: '', parent_name: '', parent_email: '',
    agreed_to_tos: false, agreed_to_privacy: false, stage: '',
  });

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      // Check hard ban on this email
      const activeBans = await base44.entities.BannedUser.filter({ user_email: u.email, ban_type: 'hard', is_active: true });
      if (activeBans.length) { setHardBanned(activeBans[0]); return; }
      // If already onboarded, go to dashboard
      const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
      if (profiles.length && profiles[0].onboarding_complete) {
        navigate('/dashboard');
      }
    }).catch(() => navigate('/'));
  }, []);

  const update = (patch) => setData(prev => ({ ...prev, ...patch }));

  const steps = data.age !== null && data.age < 13
    ? STEPS_MINOR
    : wantsMentor ? STEPS_MENTOR : STEPS_DEFAULT;
  const currentStep = steps[stepIndex];

  const next = () => setStepIndex(i => i + 1);
  const back = () => setStepIndex(i => i - 1);

  const handleComplete = async () => {
    if (!user) return;
    const profileData = {
      user_email: user.email,
      username: data.username,
      date_of_birth: data.date_of_birth,
      age: data.age,
      age_group: data.age_group,
      stage: data.stage,
      agreed_to_tos: data.agreed_to_tos,
      agreed_to_privacy: data.agreed_to_privacy,
      onboarding_complete: data.age >= 13, // minors pending approval
      parental_consent_given: false,
      parental_consent_sent: data.age < 13,
    };
    if (data.age < 13) {
      profileData.parent_email = data.parent_email;
      profileData.parent_name = data.parent_name;
      // Send parental consent email
      await base44.integrations.Core.SendEmail({
        to: data.parent_email,
        subject: `Parental Consent Required – ${user.full_name || user.email} wants to join Girls Glowing Up™`,
        body: `Hello ${data.parent_name},\n\n${user.full_name || 'Your child'} has signed up for Girls Glowing Up™ and needs your approval.\n\nGirls Glowing Up™ is a safe, moderated platform for girls ages 5–26 to grow, learn, and connect with verified mentors.\n\nTo approve their account, please reply to this email or visit:\nhttps://gguapp.com/parental-consent\n\nIf you did not expect this email, you can safely ignore it.\n\nThank you,\nThe GGU Safety Team\n\n---\nGirls Glowing Up™ | safety@girlsglowingup.com`,
      });
    }
    await base44.entities.UserProfile.create(profileData);
    next();
  };

  const progressSteps = steps.filter(s => s !== 'complete');
  const progressIndex = Math.min(stepIndex, progressSteps.length - 1);

  if (hardBanned) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6 text-white">
        <div className="max-w-sm w-full text-center space-y-5">
          <div className="text-5xl">🔴</div>
          <h1 className="text-xl font-bold">Registration Blocked</h1>
          <p className="text-sm text-gray-400">This email address has been permanently banned from Girls Glowing Up™ and cannot be used to create a new account until {hardBanned.email_blocked_until ? new Date(hardBanned.email_blocked_until).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'further notice'}.</p>
          {hardBanned.reason && <p className="text-xs text-gray-500">Reason: {hardBanned.reason}</p>}
          <a href="mailto:safety@girlsglowingup.com" className="block text-sm text-pink-400">safety@girlsglowingup.com</a>
          <button onClick={() => base44.auth.logout('/')} className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-400 bg-white/10">Sign Out</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-600 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-4 py-8 font-inter">
      <img
        src="https://gguapp.com/manus-storage/ggu-logo-glow_54cb14fa.png"
        alt="Girls Glowing Up"
        className="w-36 mx-auto mb-6"
      />

      {/* Progress bar */}
      {currentStep !== 'complete' && (
        <div className="w-full max-w-sm mb-6">
          <div className="flex gap-1.5">
            {progressSteps.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-all ${i <= progressIndex ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">Step {progressIndex + 1} of {progressSteps.length}</p>
        </div>
      )}

      <div className="w-full max-w-sm">
        {currentStep === 'dob' && <StepDOB data={data} update={update} onNext={next} />}
        {currentStep === 'username' && <StepUsername data={data} update={update} onNext={next} onBack={back} />}
        {currentStep === 'parental' && <StepParentalConsent data={data} update={update} onNext={next} onBack={back} />}
        {currentStep === 'agreement' && (
          <StepAgreement data={data} update={update} onNext={handleComplete} onBack={back} />
        )}
        {currentStep === 'mentor' && (
          <StepMentorChoice data={data} user={user} onNext={next} />
        )}
        {currentStep === 'complete' && (
          <StepComplete data={data} onDone={() => navigate('/dashboard')} />
        )}
      </div>
    </div>
  );
}