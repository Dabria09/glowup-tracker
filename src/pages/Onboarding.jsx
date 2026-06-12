import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import StepDOB from '@/components/onboarding/StepDOB';
import StepUsername from '@/components/onboarding/StepUsername';
import StepParentalConsent from '@/components/onboarding/StepParentalConsent';
import StepAgreement from '@/components/onboarding/StepAgreement';
import StepComplete from '@/components/onboarding/StepComplete';
import NewUserTour from '@/components/NewUserTour';
import {
  calculateGirlAgeGroup,
  clearAuthSession,
  hasDeletedMentorEntityByEmail,
  hasMentorAccount,
  isMentorModeActive,
  isDeletedAccount,
  loadMentorApplicationByEmail,
  loadCurrentUserRecord,
  loadMentorEntityByEmail,
} from '@/lib/authRules';

const STEPS_MINOR   = ['dob', 'username', 'parental', 'agreement', 'complete'];

export default function Onboarding() {
  console.log('[Onboarding Component] Rendering...');
  const [hardBanned, setHardBanned] = useState(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [isMentorFlow, setIsMentorFlow] = useState(false);
  const [data, setData] = useState({
    date_of_birth: '', age: null, age_group: '',
    username: '', parent_name: '', parent_email: '',
    agreed_to_tos: false, agreed_to_privacy: false,
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isFromMentorSignup = urlParams.get('mentor') === 'true';

    // Immediately redirect mentor flow to the proper wizard
    if (isFromMentorSignup) {
      window.location.href = '/mentor-register';
      return;
    }

    console.log('[Onboarding] 🔍 INIT - mentor param:', isFromMentorSignup, 'URL:', window.location.search);
    
    const initAuth = async () => {
      try {
        console.log('[Onboarding] Checking auth status...');
        const authed = await base44.auth.isAuthenticated();
        console.log('[Onboarding] Auth status:', authed);
        
        if (!authed) {
          console.log('[Onboarding] Not authenticated, redirecting to login...');
          base44.auth.redirectToLogin('/onboarding' + (isFromMentorSignup ? '?mentor=true' : ''));
          return;
        }
        
        console.log('[Onboarding] Getting user info...');
        const u = await base44.auth.me();
        console.log('[Onboarding] User:', u);
        const userRecord = await loadCurrentUserRecord(u);
        const mergedUser = { ...u, ...userRecord };

        if (isDeletedAccount(mergedUser)) {
          console.log('[Onboarding] Deleted account detected, clearing session');
          await clearAuthSession();
          navigate('/login', { replace: true });
          return;
        }

        // Admins always go straight to dashboard — check BEFORE mentor checks
        if (mergedUser.role === 'admin') {
          console.log('[Onboarding] Admin user, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
          return;
        }

        if (!isFromMentorSignup) {
          const mentorEntity = await loadMentorEntityByEmail(mergedUser.email);
          const mentorApplication = await loadMentorApplicationByEmail(mergedUser.email);
          const hasMentorMetadata = hasMentorAccount(mergedUser) || isMentorModeActive(mergedUser);
          if (!mentorEntity && !mentorApplication && (hasMentorMetadata || await hasDeletedMentorEntityByEmail(mergedUser.email))) {
            console.log('[Onboarding] Deleted mentor account detected, clearing session');
            await clearAuthSession();
            navigate('/mentor-login', { replace: true });
            return;
          }
          if (mentorEntity || mentorApplication) {
            console.log('[Onboarding] Mentor account detected, redirecting to mentor dashboard');
            navigate('/mentor-dashboard', { replace: true });
            return;
          }
        }

        // Check if user already has a complete profile FIRST — fast exit before any mentor checks
        let hasCompleteProfile = false;
        try {
          const profiles = await base44.entities.UserProfile.filter({ user_email: mergedUser.email });
          hasCompleteProfile = profiles.length > 0 && profiles[0].onboarding_complete;
          console.log('[Onboarding] Profile check:', { complete: hasCompleteProfile, count: profiles.length });
        } catch (profileErr) {
          console.log('[Onboarding] Profile check skipped:', profileErr.message);
        }

        // If the user already has a complete profile, send them straight to dashboard
        // This prevents returning users from getting stuck here
        if (!isFromMentorSignup && hasCompleteProfile) {
          console.log('[Onboarding] Already onboarded, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
          return;
        }

        setUser(mergedUser);
        const calculated = calculateGirlAgeGroup(mergedUser.date_of_birth);
        setData(prev => ({
          ...prev,
          full_name: mergedUser.full_name || prev.full_name,
          date_of_birth: mergedUser.date_of_birth || prev.date_of_birth,
          age: typeof mergedUser.age === 'number' ? mergedUser.age : (calculated.age ?? prev.age),
          age_group: mergedUser.age_group || calculated.ageGroup || prev.age_group,
        }));
        
        // Check hard ban on this email
        try {
          const activeBans = await base44.entities.BannedUser.filter({ user_email: mergedUser.email, ban_type: 'hard', is_active: true });
          if (activeBans.length) { 
            console.log('[Onboarding] User is banned:', activeBans[0]);
            setHardBanned(activeBans[0]); 
            return; 
          }
        } catch (banErr) {
          console.log('[Onboarding] Ban check skipped:', banErr.message);
        }
        
        if (isFromMentorSignup) {
          console.log('[Onboarding] 🔥 FORCING mentor flow from URL param - will NOT redirect to dashboard');
          setIsMentorFlow(true);
          // If user already has a complete profile AND is already a mentor, skip to mentor dashboard
          if (hasCompleteProfile && hasMentorAccount(mergedUser)) {
            console.log('[Onboarding] Already a mentor with complete profile, redirecting to mentor dashboard');
            navigate('/mentor-dashboard', { replace: true });
            return;
          }
          console.log('[Onboarding] ✅ MENTOR FLOW - proceeding to mentor application');
        }
        
        console.log('[Onboarding] Initialization complete, showing onboarding');
      } catch (err) {
        console.error('[Onboarding] Auth error:', err);
        alert('Auth error: ' + err.message);
      }
    };
    
    initAuth();
  }, []);

  const update = (patch) => setData(prev => ({ ...prev, ...patch }));

  // Skip mentor choice step if user is already in mentor flow
  const hasDob = Boolean(data.date_of_birth && data.age !== null && data.age_group);
  const computedSteps = data.age !== null && data.age < 13
    ? STEPS_MINOR
    : ['dob', 'username', 'agreement', 'complete'];
  const steps = hasDob ? computedSteps.filter(s => s !== 'dob') : computedSteps;
  const currentStep = steps[stepIndex];
  
  // Debug: log step transitions
  useEffect(() => {
    console.log('[Onboarding] Step changed:', { stepIndex, currentStep, steps, isMentorFlow, data });
  }, [stepIndex, currentStep, steps, isMentorFlow, data]);

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
      agreed_to_tos: data.agreed_to_tos,
      agreed_to_privacy: data.agreed_to_privacy,
      onboarding_complete: data.age >= 13,
      parental_consent_given: false,
      parental_consent_sent: data.age < 13,
    };
    if (data.age < 13) {
      profileData.parent_email = data.parent_email;
      profileData.parent_name = data.parent_name;
      profileData.parent_phone = data.parent_phone;
      profileData.parent_relationship = data.relationship;
    }

    // UPSERT: update existing profile or create new one
    try {
      const existing = await base44.entities.UserProfile.filter({ user_email: user.email });
      if (existing.length > 0) {
        await base44.entities.UserProfile.update(existing[0].id, profileData);
      } else {
        await base44.entities.UserProfile.create(profileData);
      }
      if (data.age < 13) {
        await base44.functions.invoke('sendParentalConsent', {
          context: 'girl',
          parentName: data.parent_name,
          parentEmail: data.parent_email,
          parentPhone: data.parent_phone,
          relationship: data.relationship,
          applicantName: user.full_name || data.username || user.email,
          dateOfBirth: data.date_of_birth,
        });
      }
    } catch (err) {
      console.error('[Onboarding] Profile save error:', err);
      alert('We could not finish onboarding. Please try again. ' + err.message);
      return;
    }

    if (data.age < 13) {
      navigate('/dashboard');
      return;
    }

    // For non-mentors, show the tour then go to dashboard
    setShowTour(true);
  };

  const progressSteps = steps.filter(s => s !== 'complete');
  const progressIndex = Math.min(stepIndex, progressSteps.length - 1);
  
  if (!currentStep && stepIndex < steps.length) {
    console.error('[Onboarding] Invalid step!', { stepIndex, steps, currentStep });
  }

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
    console.log('[Onboarding] Waiting for user object...');
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at top, #0f0520 0%, #1a0a18 50%, #0d0610 100%)' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto" />
          <p className="text-white text-sm mt-4">Loading onboarding...</p>
          <p className="text-gray-500 text-xs mt-2">Auth: {user === null ? 'checking...' : 'loading'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-4 py-8 font-inter" style={{ background: 'radial-gradient(ellipse at top, #0f0520 0%, #1a0a18 50%, #0d0610 100%)' }}>
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
          <StepAgreement
            onBack={back}
            onSubmit={() => handleComplete()}
            loading={false}
          />
        )}
        {currentStep === 'complete' && (
          <StepComplete applicationId="PENDING" />
        )}
        {!currentStep && (
          <div className="text-center text-white">
            <p>Loading...</p>
            <p className="text-xs text-gray-400 mt-2">Step: {stepIndex}, Steps: {steps.join(', ')}</p>
          </div>
        )}
      </div>

      {showTour && <NewUserTour onComplete={() => { setShowTour(false); navigate('/dashboard'); }} />}
    </div>
  );
}