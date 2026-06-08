import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, Upload, User, CheckCircle, ChevronRight, Shield } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import StepWhoYouAre from "@/components/onboarding/StepWhoYouAre";
import StepParentalConsent from "@/components/onboarding/StepParentalConsent";
import StepProfessionalBackground from "@/components/onboarding/StepProfessionalBackground";
import StepYourWhy from "@/components/onboarding/StepYourWhy";
import StepSafetyConduct from "@/components/onboarding/StepSafetyConduct";
import StepReferences from "@/components/onboarding/StepReferences";
import StepAgreement from "@/components/onboarding/StepAgreement";
import StepComplete from "@/components/onboarding/StepComplete";

const EXPERTISE_OPTIONS = [
  "Career Development", "STEM", "Business & Entrepreneurship", "Creative Arts", 
  "Leadership", "Mental Health & Wellness", "Academic Support", "Life Skills", 
  "Financial Literacy", "Health & Fitness", "Technology", "Communication"
];

const AGE_GROUPS = ["Middle School (11-13)", "High School (14-18)", "College (18-22)", "Young Professional (23-26)"];

const MENTORING_TYPES = ["One-on-One Mentoring", "Group Mentoring", "Peer Mentoring", "Career Mentoring"];

const AVAILABILITY_OPTIONS = ["Weekdays (Morning)", "Weekdays (Afternoon)", "Weekdays (Evening)", "Weekends"];

const SESSION_TYPES = ["Video Call", "Phone Call", "Text Chat", "In-Person"];

export default function MentorRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: Account, 1: Who You Are, 2: Professional Background, 3: Your Why, 4: Safety, 5: References, 6: Agreement, 7: Complete
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1 — Who You Are
  const [whoYouAreData, setWhoYouAreData] = useState({
    preferred_name: '',
    pronouns: '',
    bio: '',
    phone: '',
    city: '',
    state: '',
    school_or_workplace: '',
    languages: '',
    avatar_url: '',
    date_of_birth: '',
    parent_email: '',
    parent_name: '',
    parent_phone: '',
    parent_relationship: '',
  });

  // Step 1.5 — Parental Consent (teen mentors only)
  const [parentConsentSent, setParentConsentSent] = useState(false);

  // Step 2 — Professional Background
  const [professionalData, setProfessionalData] = useState({
    title: '',
    occupation: '',
    employer: '',
    education: '',
    field_of_study: '',
    experience_years: 0,
    worked_with_youth: 'no',
    youth_experience_description: '',
    expertise: [],
    age_groups: [],
    mentoring_type: '',
    mentee_count: '1-2',
    hours_per_month: '5-10',
    availability: [],
    session_type: '',
    categories: [],
  });

  // Step 3 — Your Why (short answer questions)
  const [yourWhyData, setYourWhyData] = useState({
    why_mentor: '',
    wish_told_younger: '',
    empowerment_meaning: '',
    challenge_overcome: '',
    mentoring_style: '',
  });

  // Step 4 — Safety & Conduct (adult mentors 18+ only)
  const [safetyData, setSafetyData] = useState({
    felony_conviction: undefined,
    restraining_order: undefined,
    removed_from_minors_role: undefined,
    consent_background_check: false,
    understand_application_hold: false,
  });

  // Step 5 — References
  const [ref1, setRef1] = useState({ name: '', relationship: '', email: '' });
  const [ref2, setRef2] = useState({ name: '', relationship: '', email: '' });

  // Step 6 — Agreement (captured from StepAgreement's onSubmit callback)
  // No local state needed — StepAgreement calls onSubmit(agreementData) directly

  // Auto-detect already logged-in users and skip account creation
  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
      if (authed) {
        base44.auth.me().then(u => {
          if (u) {
            setEmail(u.email);
            setFullName(u.full_name || "");
            setStep(1);
          }
        }).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  const toggleMulti = (val, arr, setArr) => {
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  const updateWhoYouAre = (patch) => setWhoYouAreData(prev => ({ ...prev, ...patch }));
  const updateYourWhy = (patch) => setYourWhyData(prev => ({ ...prev, ...patch }));
  const updateSafety = (patch) => setSafetyData(prev => ({ ...prev, ...patch }));
  const updateParentalConsent = (patch) => setWhoYouAreData(prev => ({ ...prev, ...patch }));

  const calcAge = (dobStr) => {
    if (!dobStr) return 0;
    const diff = Date.now() - new Date(dobStr).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  const handleGoogle = () => base44.auth.loginWithProvider("google", "/mentor-register?step=2");
  const handleApple = () => base44.auth.loginWithProvider("apple", "/mentor-register?step=2");

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      toast.success("Registration successful! Please check your email for the verification code.");
      setIsVerified(false);
      setStep(0.5); // OTP step
    } catch (err) {
      setError(err.message || "Registration failed");
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await base44.auth.verifyOtp({ email, otpCode: otp });
      if (res.access_token) {
        base44.auth.setToken(res.access_token);
        setIsVerified(true);
        setStep(1);
        toast.success("Email verified! Let's complete your mentor profile.");
      }
    } catch (err) {
      setError(err.message || "Invalid code");
    }
    setLoading(false);
  };

  const handleResendCode = async () => {
    try {
      await base44.auth.resendOtp(email);
      toast.success("Verification code resent!");
    } catch (err) {
      setError(err.message || "Failed to resend");
    }
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const age = calcAge(whoYouAreData.date_of_birth);
      const mentorTrack = age >= 18 ? "adult" : "teen";
      
      // Map camelCase form state to snake_case database fields
      const applicationData = {
        user_email: user.email,
        full_name: fullName,
        // Who You Are - map camelCase to snake_case
        preferred_name: whoYouAreData.preferredName || whoYouAreData.preferred_name,
        pronouns: whoYouAreData.pronouns,
        bio: whoYouAreData.bio,
        phone: whoYouAreData.phone,
        city: whoYouAreData.city,
        state: whoYouAreData.state,
        school_or_workplace: whoYouAreData.schoolOrWorkplace || whoYouAreData.school_or_workplace,
        languages: whoYouAreData.languages,
        avatar_url: whoYouAreData.avatar_url,
        date_of_birth: whoYouAreData.date_of_birth,
        // Professional Background - map camelCase to snake_case
        title: professionalData.title,
        occupation: professionalData.occupation,
        employer: professionalData.employer,
        education: professionalData.education,
        field_of_study: professionalData.fieldOfStudy || professionalData.field_of_study,
        experience_years: professionalData.experienceYears || professionalData.experience_years,
        worked_with_youth: professionalData.workedWithYouth || professionalData.worked_with_youth,
        youth_experience_description: professionalData.youthExperienceDesc || professionalData.youth_experience_description,
        // Map expertiseAreas to both expertise and categories
        expertise: JSON.stringify(professionalData.expertiseAreas || professionalData.expertise || []),
        categories: JSON.stringify(professionalData.expertiseAreas || professionalData.categories || []),
        age_groups: JSON.stringify(professionalData.ageGroups || professionalData.age_groups || []),
        mentoring_type: professionalData.mentoringType || professionalData.mentoring_type,
        mentee_count: professionalData.menteeCount || professionalData.mentee_count,
        hours_per_month: professionalData.hoursPerMonth || professionalData.hours_per_month,
        availability: JSON.stringify(professionalData.availability),
        session_type: professionalData.sessionType || professionalData.session_type,
        // Your Why fields
        why_mentor: yourWhyData.why_mentor,
        wish_someone_told: yourWhyData.wish_told_younger,
        empowerment_meaning: yourWhyData.empowerment_meaning,
        challenge_overcome: yourWhyData.challenge_overcome,
        mentoring_style: yourWhyData.mentoring_style,
        // Safety data (for adult mentors)
        felony_conviction: safetyData.felony_conviction,
        restraining_order: safetyData.restraining_order,
        removed_from_minors_role: safetyData.removed_from_minors_role,
        consent_background_check: safetyData.consent_background_check,
        understand_application_hold: safetyData.understand_application_hold,
        // References
        reference_1_name: ref1.name,
        reference_1_relationship: ref1.relationship,
        reference_1_email: ref1.email,
        reference_2_name: ref2.name,
        reference_2_relationship: ref2.relationship,
        reference_2_email: ref2.email,
        // Agreements
        agreements_accepted: JSON.stringify(["tos", "conduct"]),
        agreements_timestamp: new Date().toISOString(),
        parent_name: whoYouAreData.parent_name,
        parent_phone: whoYouAreData.parent_phone,
        parent_relationship: whoYouAreData.parent_relationship,
        // Required fields
        mentor_track: mentorTrack,
        status: "pending",
        submitted_date: new Date().toISOString(),
      };
      
      console.log('Submitting application with data:', applicationData);
      
      // Create MentorApplication record
      await base44.entities.MentorApplication.create(applicationData);
      
      console.log('Application created successfully');
      toast.success("Application submitted! We'll review within 5-7 business days.");
      setStep(7); // Complete step
    } catch (err) {
      console.error('Submit error details:', {
        message: err.message,
        code: err.code,
        response: err.response,
        fullError: err
      });
      setError(`Error: ${err.message || 'Something went wrong. Please try again.'}`);
      toast.error(`Error: ${err.message || 'Something went wrong. Please try again.'}`);
    }
    setLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Create Your Mentor Account</h2>
              <p className="text-gray-400">Join our community of empowered mentors</p>
            </div>
            
            <div className="space-y-4">
              <Button onClick={handleGoogle} className="w-full bg-white text-gray-900 hover:bg-gray-100" size="lg">
                <GoogleIcon className="w-5 h-5 mr-2" />
                Continue with Google
              </Button>
              <Button onClick={handleApple} className="w-full bg-black text-white hover:bg-gray-800" size="lg">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Or register with email</span>
              </div>
            </div>

            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div>
                <Label className="text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                    placeholder="Jane Doe"
                    required
                  />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700" size="lg" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>

            <p className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link to="/mentor-login" className="text-pink-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        );

      case 0.5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
              <p className="text-gray-400">Enter the code sent to {email}</p>
            </div>
            
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                render={({ slots }) => (
                  <InputOTPGroup>
                    {slots.map((slot, idx) => (
                      <InputOTPSlot key={idx} {...slot} className="w-12 h-14 bg-gray-800 border-gray-700 text-white text-xl" />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="space-y-3">
              <Button onClick={handleVerify} className="w-full bg-pink-600 hover:bg-pink-700" size="lg" disabled={otp.length !== 6 || loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Email
              </Button>
              <Button onClick={handleResendCode} variant="outline" className="w-full" disabled={loading}>
                Resend Code
              </Button>
            </div>
          </div>
        );

      case 1:
        return (
          <StepWhoYouAre
            data={whoYouAreData}
            update={updateWhoYouAre}
            onNext={(isTeen) => {
              if (isTeen) {
                setStep(1.5); // Parental consent step
              } else {
                setStep(2); // Professional background
              }
            }}
            onBack={handleBack}
          />
        );
      
      case 1.5:
        return (
          <StepParentalConsent
            data={whoYouAreData}
            update={updateParentalConsent}
            onNext={() => { setParentConsentSent(true); setStep(2); }}
            onBack={handleBack}
            parentEmail={whoYouAreData.parent_email}
            setParentEmail={(email) => updateWhoYouAre({ parent_email: email })}
          />
        );
      
      case 2:
        return <StepProfessionalBackground data={professionalData} update={(patch) => setProfessionalData(prev => ({ ...prev, ...patch }))} toggleMulti={toggleMulti} onNext={handleNext} onBack={handleBack} />;
      
      case 3:
        return <StepYourWhy data={yourWhyData} update={updateYourWhy} onNext={handleNext} onBack={handleBack} />;
      
      case 4:
        return <StepSafetyConduct data={safetyData} update={updateSafety} onNext={handleNext} onBack={handleBack} />;
      
      case 5:
        return <StepReferences ref1={ref1} setRef1={setRef1} ref2={ref2} setRef2={setRef2} onNext={handleNext} onBack={handleBack} />;
      
      case 6:
        return (
          <StepAgreement
            onBack={handleBack}
            onSubmit={handleSubmit}
            loading={loading}
            fullName={fullName}
            mentorTrack={calcAge(whoYouAreData.date_of_birth) >= 18 ? 'adult' : 'teen'}
            ageGroups={professionalData.ageGroups || professionalData.age_groups || []}
            expertise={professionalData.expertiseAreas || professionalData.expertise || []}
          />
        );
      
      case 7:
        return (
          <StepComplete
            fullName={fullName}
            email={email}
            mentorTrack={calcAge(whoYouAreData.date_of_birth) >= 18 ? 'adult' : 'teen'}
            parentEmail={whoYouAreData.parent_email}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-800">
        {step > 0 && step < 8 && (
          <div className="mb-8">
            <div className="flex gap-2 mb-4">
              {[1, 1.5, 2, 3, 4, 5, 6, 7].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    s <= step ? 'bg-pink-500' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 text-right">Step {Math.floor(step)} of 7</p>
          </div>
        )}
        
        {renderStep()}
      </div>
    </div>
  );
}