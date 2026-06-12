import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Check, Upload, CheckCircle } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import BrandLogo from "@/components/BrandLogo";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { calculateAge, calculateGirlAgeGroup, getMentorTrack, saveCurrentUserRecord } from "@/lib/authRules";
import {
  buildOAuthPrefill,
  getFirstName,
  readMentorOAuthPrefill,
  saveMentorOAuthPrefill,
  waitForOAuthUser,
} from "@/lib/oauthPrefill";

const EXPERTISE_OPTIONS = [
  "Career Development","Financial Literacy","College Prep and Applications",
  "Entrepreneurship and Business","Mental Wellness and Confidence","STEM and Technology",
  "Arts and Creative Industries","Athletics and Sports","Social Media and Content Creation",
  "Fashion and Beauty Industry","Health and Fitness","Community Leadership and Civic Engagement",
  "Relationships and Communication","Life Skills and Independence","Faith and Spirituality","Other"
];

const LANGUAGE_OPTIONS = ["English","Spanish","French","Mandarin","Arabic","Portuguese","Swahili","Hindi","Yoruba","Other"];
const AVAILABILITY_OPTIONS = ["Weekday Mornings","Weekday Afternoons","Weekday Evenings","Weekend Mornings","Weekend Afternoons","Weekend Evenings"];
const AGE_GROUP_OPTIONS = ["Glow Girls 5 to 12","Glow Teens 13 to 18","Glow Women 19 to 26"];

export default function MentorRegister() {
  // Read ?step= from URL on initial render
  const searchParams = new URLSearchParams(window.location.search);
  const urlStep = parseInt(searchParams.get("step") || "0", 10);
  const isOAuthMentorFlow = searchParams.get("oauth") === "1";
  const shouldHydrateOAuthPrefill = isOAuthMentorFlow || urlStep >= 1;
  const initialOAuthPrefill = shouldHydrateOAuthPrefill ? readMentorOAuthPrefill() : null;
  const initialDob = initialOAuthPrefill?.dateOfBirth || "";
  const initialMentorTrack = initialOAuthPrefill?.mentorType || getMentorTrack(calculateAge(initialDob)) || "adult";

  // Account creation state
  const [fullName, setFullName] = useState(initialOAuthPrefill?.fullName || "");
  const [email, setEmail] = useState(initialOAuthPrefill?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState(initialDob);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthHydrating, setOauthHydrating] = useState(shouldHydrateOAuthPrefill && !initialOAuthPrefill);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [mentorTrack, setMentorTrack] = useState(initialMentorTrack);
  const [step, setStep] = useState(urlStep); // 0=account, OTP inline, 1-10=steps, 11=confirmation

  // Step 1 — Who You Are
  const [avatarUrl, setAvatarUrl] = useState(initialOAuthPrefill?.avatarUrl || "");
  const [preferredName, setPreferredName] = useState(initialOAuthPrefill?.preferredName || getFirstName(initialOAuthPrefill?.fullName));
  const [pronouns, setPronouns] = useState("");
  const [bio, setBio] = useState("");
  const [schoolOrWorkplace, setSchoolOrWorkplace] = useState("");
  const [languages, setLanguages] = useState([]);

  // Step 2 — Professional
  const [occupation, setOccupation] = useState("");
  const [employer, setEmployer] = useState("");
  const [education, setEducation] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [workedWithYouth, setWorkedWithYouth] = useState(null);
  const [youthDesc, setYouthDesc] = useState("");

  // Step 3 — Expertise
  const [expertise, setExpertise] = useState([]);

  // Step 4 — Mentoring prefs
  const [ageGroups, setAgeGroups] = useState([]);
  const [mentoringStyle, setMentoringStyle] = useState("");
  const [menteeCount, setMenteeCount] = useState("");
  const [hoursPerMonth, setHoursPerMonth] = useState("");
  const [availability, setAvailability] = useState([]);
  const [sessionPref, setSessionPref] = useState("");

  // Step 5 — Your Why
  const [whyMentor, setWhyMentor] = useState("");
  const [wishTold, setWishTold] = useState("");
  const [empowermentMeaning, setEmpowermentMeaning] = useState("");
  const [challengeOvercome, setChallengeOvercome] = useState("");
  const [styleDesc, setStyleDesc] = useState("");

  // Step 6 — Safety
  const [convictedFelony, setConvictedFelony] = useState(null);
  const [restrainingOrder, setRestrainingOrder] = useState(null);
  const [removedFromMinors, setRemovedFromMinors] = useState(null);
  const [safetyExplanation, setSafetyExplanation] = useState("");
  const [consentBgCheck, setConsentBgCheck] = useState(false);
  const [understandHold, setUnderstandHold] = useState(false);
  const [teenSafetyConsent, setTeenSafetyConsent] = useState(false);

  // Step 7 — ID Verification
  const [idDocUrl, setIdDocUrl] = useState("");
  const [facePhotoUrl, setFacePhotoUrl] = useState("");
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingFace, setUploadingFace] = useState(false);

  // Step 8 — References (adult)
  const [ref1Name, setRef1Name] = useState("");
  const [ref1Rel, setRef1Rel] = useState("");
  const [ref1Email, setRef1Email] = useState("");
  const [ref2Name, setRef2Name] = useState("");
  const [ref2Rel, setRef2Rel] = useState("");
  const [ref2Email, setRef2Email] = useState("");

  // Step 9 — Parent Consent (teen)
  const [parentName, setParentName] = useState("");
  const [parentRel, setParentRel] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentConsentSent, setParentConsentSent] = useState(false);
  const [parentConsentId, setParentConsentId] = useState("");

  // Step 10 — Final Agreement
  const [scrolledTos, setScrolledTos] = useState(false);
  const [scrolledConduct, setScrolledConduct] = useState(false);
  const [acceptTos, setAcceptTos] = useState(false);
  const [acceptConduct, setAcceptConduct] = useState(false);
  const [certifyTruth, setCertifyTruth] = useState(false);
  const [signature, setSignature] = useState("");
  const [generatedAppId, setGeneratedAppId] = useState("");

  const tosRef = useRef(null);
  const conductRef = useRef(null);

  const applyMentorPrefill = useCallback((prefill) => {
    if (!prefill) return;

    setFullName(prev => prev || prefill.fullName || "");
    setEmail(prev => prev || prefill.email || "");
    setDob(prev => prev || prefill.dateOfBirth || "");
    setAvatarUrl(prev => prev || prefill.avatarUrl || "");
    setPreferredName(prev => prev || prefill.preferredName || getFirstName(prefill.fullName));

    const track = prefill.mentorType || getMentorTrack(calculateAge(prefill.dateOfBirth));
    if (track) setMentorTrack(track);
  }, []);

  // Pre-fill user info from Google/Apple OAuth before rendering the application steps.
  useEffect(() => {
    if (!shouldHydrateOAuthPrefill) return undefined;

    let isMounted = true;
    const hydrateOAuthPrefill = async () => {
      const storedPrefill = readMentorOAuthPrefill();
      if (storedPrefill) applyMentorPrefill(storedPrefill);
      else setOauthHydrating(true);

      try {
        const u = await waitForOAuthUser(() => base44.auth.me());
        if (!isMounted || !u) return;

        const prefill = buildOAuthPrefill(u);
        saveMentorOAuthPrefill(prefill);
        applyMentorPrefill(prefill);
      } catch {
        // Stored prefill is enough to continue; otherwise the form remains editable.
      } finally {
        if (isMounted) setOauthHydrating(false);
      }
    };

    hydrateOAuthPrefill();
    return () => { isMounted = false; };
  }, [shouldHydrateOAuthPrefill, applyMentorPrefill]);

  const toggleMulti = (val, arr, setArr) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const handleUploadFile = async (e, setUrl, setUploading) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUrl(file_url);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleScroll = (ref, setScrolled) => {
    if (!ref.current) return;
    const { scrollTop, scrollHeight, clientHeight } = ref.current;
    if (scrollHeight - scrollTop <= clientHeight + 20) setScrolled(true);
  };

  // Account creation
  const handleCreateAccount = async () => {
    setError("");
    if (!fullName || !email || !password || !confirmPassword || !dob) { setError("All fields are required."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    const age = calculateAge(dob);
    const track = getMentorTrack(age);
    if (!track) { setError("You must be at least 13 years old to apply as a GGU Mentor."); return; }

    setMentorTrack(track);
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      if (err.message?.toLowerCase().includes("already") || err.message?.toLowerCase().includes("exist")) {
        setError("An account with this email already exists. Please sign in instead.");
      } else {
        setError(err.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinueOAuthAccount = async () => {
    setError("");
    if (!fullName || !email || !dob) { setError("Name, email, and date of birth are required."); return; }

    const age = calculateAge(dob);
    const { ageGroup } = calculateGirlAgeGroup(dob);
    const track = getMentorTrack(age);
    if (!track) { setError("You must be at least 13 years old to apply as a GGU Mentor."); return; }

    setMentorTrack(track);
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      const prefill = buildOAuthPrefill(currentUser, {
        fullName,
        email,
        dateOfBirth: dob,
        avatarUrl,
        mentorType: track,
      });
      saveMentorOAuthPrefill(prefill);
      await saveCurrentUserRecord(currentUser, {
        full_name: fullName,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        date_of_birth: dob,
        age,
        age_group: ageGroup,
        account_type: "mentor",
        mentor_type: track,
        mentor_status: "pending",
        isDeleted: false,
        created_at: new Date().toISOString(),
      });
      setStep(1);
    } catch (err) {
      setError(err.message || "Could not continue with your Google account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);

      const age = calculateAge(dob);
      const { ageGroup } = calculateGirlAgeGroup(dob);
      const track = getMentorTrack(age);

      const currentUser = await base44.auth.me();
      await saveCurrentUserRecord(currentUser, {
        full_name: fullName,
        date_of_birth: dob,
        age,
        age_group: ageGroup,
        account_type: "mentor",
        mentor_type: track,
        mentor_status: "pending",
        isDeleted: false,
        created_at: new Date().toISOString(),
      });

      setShowOtp(false);
      setStep(1);
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => base44.auth.loginWithProvider("google", "/google-setup?mentor=true");
  const handleAppleSignup = () => base44.auth.loginWithProvider("apple", "/google-setup?mentor=true");

  const handleSendParentConsent = async () => {
    if (!parentEmail || !parentName) return;
    setLoading(true);
    try {
      const result = await base44.functions.invoke('sendParentalConsent', {
        context: 'mentor',
        parentName,
        parentEmail,
        parentPhone,
        relationship: parentRel,
        applicantName: fullName,
        dateOfBirth: dob,
      });
      if (!result?.data?.success) throw new Error(result?.data?.error || 'Failed to send consent email');
      setParentConsentId(result.data.consentId || "");
      setParentConsentSent(true);
    } catch (err) {
      alert("Failed to send email: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    setLoading(true);
    const appId = "MTR-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedAppId(appId);
    try {
      await base44.entities.MentorApplication.create({
        user_email: email,
        full_name: fullName,
        preferred_name: preferredName,
        pronouns,
        bio,
        school_or_workplace: schoolOrWorkplace,
        languages: JSON.stringify(languages),
        occupation,
        employer,
        education,
        field_of_study: fieldOfStudy,
        experience_years: Number(experienceYears) || 0,
        worked_with_youth: workedWithYouth ? "yes" : "no",
        youth_experience_description: youthDesc,
        categories: JSON.stringify(expertise),
        age_groups: JSON.stringify(ageGroups),
        mentoring_type: mentoringStyle,
        mentee_count: menteeCount,
        hours_per_month: hoursPerMonth,
        availability: JSON.stringify(availability),
        session_type: sessionPref,
        why_mentor: whyMentor,
        wish_someone_told: wishTold,
        empowerment_meaning: empowermentMeaning,
        challenge_overcome: challengeOvercome,
        mentoring_style: styleDesc,
        avatar_url: avatarUrl,
        mentor_track: mentorTrack,
        parent_name: parentName,
        parent_email: parentEmail,
        parent_phone: parentPhone,
        parent_relationship: parentRel,
        parent_consent_sent: parentConsentSent,
        parent_consent_id: parentConsentId,
        reference_1_name: ref1Name,
        reference_1_relationship: ref1Rel,
        reference_1_email: ref1Email,
        reference_2_name: ref2Name,
        reference_2_relationship: ref2Rel,
        reference_2_email: ref2Email,
        status: "pending",
        submitted_date: new Date().toISOString(),
        agreements_accepted: JSON.stringify(["tos", "conduct", "truth"]),
        agreements_timestamp: new Date().toISOString(),
      });
      setStep(11);
    } catch (err) {
      alert("Something went wrong. Please try again.\n" + err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 7 && mentorTrack === "teen") setStep(9);
    else if (step === 8 && mentorTrack === "adult") setStep(10);
    else setStep(s => s + 1);
  };
  const prevStep = () => {
    if (step === 9 && mentorTrack === "teen") setStep(7);
    else if (step === 10 && mentorTrack === "adult") setStep(8);
    else setStep(s => s - 1);
  };

  const visibleSteps = mentorTrack === "teen"
    ? [1, 2, 3, 4, 5, 6, 7, 9, 10]
    : [1, 2, 3, 4, 5, 6, 7, 8, 10];
  const totalSteps = visibleSteps.length;
  const currentProgressStep = Math.max(1, visibleSteps.indexOf(step) + 1);

  const bg = { background: 'radial-gradient(ellipse at top, #0f0520 0%, #1a0a18 50%, #0d0610 100%)' };
  const cardStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' };

  if (oauthHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={bg}>
        <div className="rounded-3xl p-6 text-center" style={cardStyle}>
          <Loader2 className="w-8 h-8 animate-spin text-pink-400 mx-auto" />
          <p className="text-sm text-gray-300 mt-4">Loading your Google info...</p>
        </div>
      </div>
    );
  }

  // OTP SCREEN
  if (showOtp) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={bg}>
        <div className="w-full max-w-md z-10">
          <div className="text-center mb-8">
            <BrandLogo alt="GGU" className="w-36 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-white">Verify Your Email ✉️</h1>
            <p className="text-sm text-gray-400 mt-1">6-digit code sent to <span className="text-pink-400">{email}</span></p>
          </div>
          <div className="rounded-3xl p-6 space-y-4" style={cardStyle}>
            {error && <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>}
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus>
                <InputOTPGroup>
                  <InputOTPSlot index={0}/><InputOTPSlot index={1}/><InputOTPSlot index={2}/>
                  <InputOTPSlot index={3}/><InputOTPSlot index={4}/><InputOTPSlot index={5}/>
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button className="w-full h-12 font-bold text-white" onClick={handleVerifyOtp} disabled={loading || otpCode.length < 6}
              style={{ background: 'linear-gradient(135deg, #e8526d, #f1b610)' }}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Verifying...</> : 'Verify & Continue'}
            </Button>
            <p className="text-center text-sm text-gray-400">
              Didn't get it?{" "}
              <button onClick={() => base44.auth.resendOtp(email)} className="text-pink-400 hover:underline">Resend</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ACCOUNT CREATION (step 0)
  if (step === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden" style={bg}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute rounded-full" style={{ width:500,height:500,top:-150,left:-100,background:'radial-gradient(circle, rgba(232,82,109,0.15), transparent 70%)',filter:'blur(80px)' }}/>
          <div className="absolute rounded-full" style={{ width:400,height:400,bottom:-100,right:-80,background:'radial-gradient(circle, rgba(241,182,16,0.12), transparent 70%)',filter:'blur(80px)' }}/>
        </div>
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-6">
            <BrandLogo alt="GGU" className="w-40 mx-auto mb-4" style={{ filter:'drop-shadow(0 0 20px rgba(232,82,109,0.4))' }} />
            <h1 className="text-2xl font-bold text-white mb-1">{isOAuthMentorFlow ? "Review Your Mentor Account" : "Create Your Mentor Account"}</h1>
            <p className="text-sm text-gray-400">{isOAuthMentorFlow ? "Confirm your account details to continue" : "Join Girls Glowing Up™ as a mentor"}</p>
          </div>
          <div className="rounded-3xl p-6 space-y-4" style={cardStyle}>
            {isOAuthMentorFlow ? (
              <div className="p-3 rounded-xl text-sm text-gray-300 border border-white/10 bg-white/5">
                Your sign-in account is connected. Confirm these details, then continue your mentor application.
              </div>
            ) : (
              <>
                <Button variant="outline" className="w-full h-12 text-sm font-medium bg-white/5 border-white/10 hover:bg-white/10 text-white" onClick={handleAppleSignup}>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.56 1.4-1.32 2.79-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  Sign up with Apple
                </Button>
                <Button variant="outline" className="w-full h-12 text-sm font-medium bg-white/5 border-white/10 hover:bg-white/10 text-white" onClick={handleGoogleSignup}>
                  <GoogleIcon className="w-5 h-5 mr-2"/>Sign up with Google
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"/></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="px-3 text-gray-500" style={{ background:'rgba(13,5,30,0.9)' }}>Or register with email</span></div>
                </div>
              </>
            )}
            {error && <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>}
            <Input placeholder="Full Legal Name" value={fullName} onChange={e=>setFullName(e.target.value)} className="h-12 bg-white/5 border-white/10 text-white placeholder-gray-500"/>
            <Input type="email" placeholder="Email Address" value={email} onChange={e=>setEmail(e.target.value)} readOnly={isOAuthMentorFlow} className="h-12 bg-white/5 border-white/10 text-white placeholder-gray-500"/>
            {!isOAuthMentorFlow && (
              <>
                <Input type="password" placeholder="Password (min 8 characters)" value={password} onChange={e=>setPassword(e.target.value)} className="h-12 bg-white/5 border-white/10 text-white placeholder-gray-500"/>
                <Input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className="h-12 bg-white/5 border-white/10 text-white placeholder-gray-500"/>
              </>
            )}
            <div className="space-y-1">
              <Label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Date of Birth</Label>
              <Input type="date" value={dob} onChange={e=>setDob(e.target.value)} className="h-12 bg-white/5 border-white/10 text-white"/>
            </div>
            <Button className="w-full h-12 font-bold text-white border-0" onClick={isOAuthMentorFlow ? handleContinueOAuthAccount : handleCreateAccount} disabled={loading}
              style={{ background:'linear-gradient(135deg, #e8526d, #f1b610)' }}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>{isOAuthMentorFlow ? 'Saving...' : 'Creating Account...'}</> : (isOAuthMentorFlow ? 'Continue to Application' : 'Create Account')}
            </Button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-6">
            Already have a mentor account?{" "}
            <Link to="/mentor-login" className="text-pink-400 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    );
  }

  // CONFIRMATION (step 11)
  if (step === 11) {
    const firstName = preferredName || fullName.split(" ")[0];
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10" style={bg}>
        <div className="w-full max-w-md text-center space-y-6 z-10">
          <BrandLogo alt="GGU" className="w-36 mx-auto" />
          <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-400"/>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Application Submitted! 🎉</h2>
            <p className="text-gray-400 text-sm mt-2">Thank you, {firstName}. Your GGU Mentor Application is being reviewed.</p>
            <p className="text-pink-400 text-xs font-bold font-mono mt-2">Application ID: {generatedAppId}</p>
          </div>
          <div className="rounded-2xl p-4 text-left" style={cardStyle}>
            <p className="text-xs text-gray-400 font-bold uppercase mb-3">Application Status</p>
            <div className="flex gap-1 mb-2">
              {[1,2,3,4,5,6].map(i => <div key={i} className={`h-2 flex-1 rounded-full ${i===1 ? 'bg-pink-500' : 'bg-white/10'}`}/>)}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span className="text-pink-400 font-semibold">Stage 1: Applied</span>
              <span>Stage 6: Active</span>
            </div>
            <div className="mt-3 space-y-1 text-xs text-gray-400">
              <p>📋 Application Review</p>
              <p>🔍 Background Check (Adult) / Parent Consent (Teen)</p>
              <p>🎙️ Interview</p>
              <p>✅ GGU Mentor Lesson</p>
              <p>📝 Final Approval</p>
              <p>⭐ Active Mentor</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">We will review your application within 5 to 7 business days. Notifications will be sent to <strong className="text-gray-200">{email}</strong>.</p>
          <Button className="w-full h-12 font-bold text-white" onClick={() => window.location.href='/mentor-dashboard'}
            style={{ background:'linear-gradient(135deg, #e8526d, #f1b610)' }}>
            Go to My Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // ONBOARDING STEPS 1-10
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={bg}>
      <div className="w-full max-w-xl relative z-10">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i + 1 <= currentProgressStep ? 'bg-pink-500' : 'bg-white/10'}`}/>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">Step {currentProgressStep} of {totalSteps}</p>
        </div>

        <div className="rounded-3xl p-6" style={cardStyle}>

          {/* STEP 1 — Who You Are */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Who You Are</h3>
              <div className="flex justify-center">
                <label className="relative w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 overflow-hidden flex items-center justify-center cursor-pointer hover:bg-white/15">
                  {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover"/> : <Upload size={28} className="text-gray-400"/>}
                  <input type="file" accept="image/*" onChange={e=>handleUploadFile(e, setAvatarUrl, ()=>{})} className="hidden"/>
                </label>
              </div>
              <Input placeholder="Preferred Name *" value={preferredName} onChange={e=>setPreferredName(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder-gray-500"/>
              <Input placeholder="Pronouns (optional)" value={pronouns} onChange={e=>setPronouns(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder-gray-500"/>
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Short Bio * ({300 - bio.length} chars left)</Label>
                <textarea maxLength={300} value={bio} onChange={e=>setBio(e.target.value)}
                  className="w-full h-24 rounded-lg p-3 text-sm text-white placeholder-gray-500 resize-none bg-white/5 border border-white/10 focus:outline-none focus:border-pink-500"
                  placeholder="Tell us about yourself..."/>
              </div>
              <Input placeholder="School or Workplace *" value={schoolOrWorkplace} onChange={e=>setSchoolOrWorkplace(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder-gray-500"/>
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Languages Spoken</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map(l=>(
                    <div key={l} onClick={()=>toggleMulti(l,languages,setLanguages)}
                      className={`px-3 py-1 rounded-full text-xs cursor-pointer border ${languages.includes(l)?'bg-pink-500/20 border-pink-500 text-white':'border-white/10 text-gray-400 hover:bg-white/5'}`}>
                      {l}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <Button onClick={()=>setStep(0)} variant="ghost" className="text-gray-400"><ArrowLeft size={16}/> Back</Button>
                <Button onClick={nextStep} disabled={!preferredName||!bio||!schoolOrWorkplace}
                  style={{ background:'linear-gradient(135deg, #e8526d, #f1b610)' }} className="text-white">Next</Button>
              </div>
            </div>
          )}

          {/* STEP 2 — Professional Background */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Professional Background</h3>
              <Input placeholder="Current Occupation *" value={occupation} onChange={e=>setOccupation(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder-gray-500"/>
              <Input placeholder="Employer or School (optional)" value={employer} onChange={e=>setEmployer(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder-gray-500"/>
              <select value={education} onChange={e=>setEducation(e.target.value)} className="w-full h-12 rounded-lg px-3 text-white bg-white/5 border border-white/10">
                <option value="">Highest Education Level *</option>
                <option>High School / GED</option><option>Some College</option>
                <option>Associate's Degree</option><option>Bachelor's Degree</option>
                <option>Master's Degree</option><option>Doctorate / PhD</option>
              </select>
              <Input placeholder="Field of Study *" value={fieldOfStudy} onChange={e=>setFieldOfStudy(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder-gray-500"/>
              <select value={experienceYears} onChange={e=>setExperienceYears(e.target.value)} className="w-full h-12 rounded-lg px-3 text-white bg-white/5 border border-white/10">
                <option value="">Years of Experience *</option>
                <option value="0">Less than 1 year</option><option value="1">1-2 years</option>
                <option value="3">3-4 years</option><option value="5">5-8 years</option><option value="9">9+ years</option>
              </select>
              <div className="space-y-2">
                <Label className="text-xs text-gray-400">Worked with youth before? *</Label>
                <div className="flex gap-3">
                  <div onClick={()=>setWorkedWithYouth(true)} className={`flex-1 p-3 rounded-xl border text-center text-sm cursor-pointer ${workedWithYouth===true?'border-pink-500 bg-pink-500/10 text-white':'border-white/10 text-gray-400'}`}>Yes</div>
                  <div onClick={()=>setWorkedWithYouth(false)} className={`flex-1 p-3 rounded-xl border text-center text-sm cursor-pointer ${workedWithYouth===false?'border-pink-500 bg-pink-500/10 text-white':'border-white/10 text-gray-400'}`}>No</div>
                </div>
              </div>
              {workedWithYouth===true && (
                <Input placeholder="Describe your youth experience..." value={youthDesc} onChange={e=>setYouthDesc(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder-gray-500"/>
              )}
              <div className="flex justify-between pt-2">
                <Button onClick={prevStep} variant="ghost" className="text-gray-400"><ArrowLeft size={16}/> Back</Button>
                <Button onClick={nextStep} disabled={!occupation||!education||!fieldOfStudy||!experienceYears||workedWithYouth===null}
                  style={{ background:'linear-gradient(135deg, #e8526d, #f1b610)' }} className="text-white">Next</Button>
              </div>
            </div>
          )}

          {/* STEP 3 — Expertise */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Your Expertise</h3>
              <p className="text-xs text-gray-400">Select all that apply — minimum 1 required</p>
              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {EXPERTISE_OPTIONS.map(opt=>(
                  <div key={opt} onClick={()=>toggleMulti(opt,expertise,setExpertise)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer text-center transition ${expertise.includes(opt)?'border-pink-500 bg-pink-500/10 text-white':'border-white/10 text-gray-400 hover:bg-white/5'}`}>
                    {opt}
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2">
                <Button onClick={prevStep} variant="ghost" className="text-gray-400"><ArrowLeft size={16}/> Back</Button>
                <Button onClick={nextStep} disabled={expertise.length===0}
                  style={{ background:'linear-gradient(135deg, #e8526d, #f1b610)' }} className="text-white">Next</Button>
              </div>
            </div>
          )}

          {/* STEP 4 — Who to Mentor */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Who You Want to Mentor</h3>
              <div className="space-y-1">
                <Label className="text-xs text-gray-400 font-bold">Age Groups *</Label>
                <div className="flex flex-col gap-2">
                  {AGE_GROUP_OPTIONS.map(g=>(
                    <div key={g} onClick={()=>toggleMulti(g,ageGroups,setAgeGroups)}
                      className={`p-3 rounded-xl border text-sm cursor-pointer ${ageGroups.includes(g)?'border-pink-500 bg-pink-500/10 text-white':'border-white/10 text-gray-400'}`}>
                      {g}
                    </div>
                  ))}
                </div>
              </div>
              <select value={mentoringStyle} onChange={e=>setMentoringStyle(e.target.value)} className="w-full h-12 rounded-lg px-3 text-white bg-white/5 border border-white/10">
                <option value="">Mentoring Style *</option>
                <option>One on One</option><option>Group</option><option>Peer</option><option>Career Shadowing</option>
              </select>
              <select value={menteeCount} onChange={e=>setMenteeCount(e.target.value)} className="w-full h-12 rounded-lg px-3 text-white bg-white/5 border border-white/10">
                <option value="">Number of Active Mentees *</option>
                <option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option>
              </select>
              <select value={hoursPerMonth} onChange={e=>setHoursPerMonth(e.target.value)} className="w-full h-12 rounded-lg px-3 text-white bg-white/5 border border-white/10">
                <option value="">Hours Per Month *</option>
                <option>2 to 4</option><option>5 to 8</option><option>9 to 12</option><option>12+</option>
              </select>
              <div className="space-y-1">
                <Label className="text-xs text-gray-400 font-bold">Availability</Label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABILITY_OPTIONS.map(a=>(
                    <div key={a} onClick={()=>toggleMulti(a,availability,setAvailability)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer text-center ${availability.includes(a)?'border-pink-500 bg-pink-500/10 text-white':'border-white/10 text-gray-400'}`}>
                      {a}
                    </div>
                  ))}
                </div>
              </div>
              <select value={sessionPref} onChange={e=>setSessionPref(e.target.value)} className="w-full h-12 rounded-lg px-3 text-white bg-white/5 border border-white/10">
                <option value="">Session Preference *</option>
                <option>Virtual</option><option>In Person</option><option>Both</option>
              </select>
              <div className="flex justify-between pt-2">
                <Button onClick={prevStep} variant="ghost" className="text-gray-400"><ArrowLeft size={16}/> Back</Button>
                <Button onClick={nextStep} disabled={ageGroups.length===0||!mentoringStyle||!menteeCount||!hoursPerMonth||!sessionPref}
                  style={{ background:'linear-gradient(135deg, #e8526d, #f1b610)' }} className="text-white">Next</Button>
              </div>
            </div>
          )}

          {/* STEP 5 — Your Why */}
          {step === 5 && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <h3 className="text-xl font-bold text-white">Your Why</h3>
              {[
                {label:"Why do you want to be a GGU mentor? *",val:whyMentor,set:setWhyMentor},
                {label:"One thing you wish someone told you younger? *",val:wishTold,set:setWishTold},
                {label:"What empowerment means to you? *",val:empowermentMeaning,set:setEmpowermentMeaning},
                {label:"A challenge you overcame that could help a girl? *",val:challengeOvercome,set:setChallengeOvercome},
                {label:"Describe your mentoring style? *",val:styleDesc,set:setStyleDesc},
              ].map(({label,val,set})=>(
                <div key={label} className="space-y-1">
                  <Label className="text-xs text-gray-400">{label} ({300-val.length} chars left)</Label>
                  <textarea maxLength={300} value={val} onChange={e=>set(e.target.value)}
                    className="w-full h-20 rounded-lg p-3 text-sm text-white placeholder-gray-500 resize-none bg-white/5 border border-white/10 focus:outline-none focus:border-pink-500"
                    placeholder="Your answer..."/>
                </div>
              ))}
              <div className="flex justify-between pt-2">
                <Button onClick={prevStep} variant="ghost" className="text-gray-400"><ArrowLeft size={16}/> Back</Button>
                <Button onClick={nextStep} disabled={!whyMentor||!wishTold||!empowermentMeaning||!challengeOvercome||!styleDesc}
                  style={{ background:'linear-gradient(135deg, #e8526d, #f1b610)' }} className="text-white">Next</Button>
              </div>
            </div>
          )}

          {/* STEP 6 — Safety */}
          {step === 6 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Safety and Conduct</h3>
              {mentorTrack === "adult" ? (
                <>
                  <div className="p-4 rounded-xl bg-purple-900/30 border border-purple-500/20 text-xs text-purple-200 leading-relaxed">
                    All adult GGU mentors are required to complete a background check before being approved to work with girls. This is mandatory and protects every girl on our platform.
                  </div>
                  {[
                    {label:"Have you ever been convicted of a felony?",val:convictedFelony,set:setConvictedFelony},
                    {label:"Have you ever had a restraining order filed against you?",val:restrainingOrder,set:setRestrainingOrder},
                    {label:"Have you ever been removed from a role working with minors?",val:removedFromMinors,set:setRemovedFromMinors},
                  ].map(({label,val,set})=>(
                    <div key={label} className="space-y-2">
                      <Label className="text-xs text-gray-300">{label}</Label>
                      <div className="flex gap-3">
                        <div onClick={()=>set(true)} className={`flex-1 p-2 rounded-lg border text-center text-sm cursor-pointer ${val===true?'border-pink-500 bg-pink-500/10 text-white':'border-white/10 text-gray-400'}`}>Yes</div>
                        <div onClick={()=>set(false)} className={`flex-1 p-2 rounded-lg border text-center text-sm cursor-pointer ${val===false?'border-pink-500 bg-pink-500/10 text-white':'border-white/10 text-gray-400'}`}>No</div>
                      </div>
                    </div>
                  ))}
                  {(convictedFelony||restrainingOrder||removedFromMinors) && (
                    <Input placeholder="Please explain..." value={safetyExplanation} onChange={e=>setSafetyExplanation(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder-gray-500"/>
                  )}
                  <div className="space-y-3 pt-2">
                    <div className="flex gap-3 items-start cursor-pointer" onClick={()=>setConsentBgCheck(!consentBgCheck)}>
                      <div className={`w-5 h-5 shrink-0 rounded border border-white/30 flex items-center justify-center mt-0.5 ${consentBgCheck?'bg-pink-500 border-pink-500':''}`}>
                        {consentBgCheck && <Check size={12} className="text-white"/>}
                      </div>
                      <span className="text-xs text-gray-300">I consent to a background check</span>
                    </div>
                    <div className="flex gap-3 items-start cursor-pointer" onClick={()=>setUnderstandHold(!understandHold)}>
                      <div className={`w-5 h-5 shrink-0 rounded border border-white/30 flex items-center justify-center mt-0.5 ${understandHold?'bg-pink-500 border-pink-500':''}`}>
                        {understandHold && <Check size={12} className="text-white"/>}
                      </div>
                      <span className="text-xs text-gray-300">I understand my application will not move forward without a cleared background check</span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <Button onClick={prevStep} variant="ghost" className="text-gray-400"><ArrowLeft size={16}/> Back</Button>
                    <Button onClick={nextStep} disabled={convictedFelony===null||restrainingOrder===null||removedFromMinors===null||!consentBgCheck||!understandHold}
                      style={{ background:'linear-gradient(135deg, #e8526d, #f1b610)' }} className="text-white">Next</Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-xl bg-purple-900/30 border border-purple-500/20 text-xs text-purple-200 leading-relaxed">
                    As a teen mentor you are a peer leader. GGU is committed to keeping our community safe. Your parent or guardian must consent before your application moves forward.
                  </div>
                  <div className="flex gap-3 items-start cursor-pointer pt-2" onClick={()=>setTeenSafetyConsent(!teenSafetyConsent)}>
                    <div className={`w-5 h-5 shrink-0 rounded border border-white/30 flex items-center justify-center mt-0.5 ${teenSafetyConsent?'bg-pink-500 border-pink-500':''}`}>
                      {teenSafetyConsent && <Check size={12} className="text-white"/>}
                    </div>
                    <span className="text-xs text-gray-300">I understand parent or guardian consent is required before my application can move forward</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <Button onClick={prevStep} variant="ghost" className="text-gray-400"><ArrowLeft size={16}/> Back</Button>
                    <Button onClick={nextStep} disabled={!teenSafetyConsent}
                      style={{ background:'linear-gradient(135deg, #e8526d, #f1b610)' }} className="text-white">Next</Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 7 — ID Verification */}
          {step === 7 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">ID Verification</h3>
              <p className="text-xs text-gray-400 italic">Your ID is used for verification only and never shared publicly.</p>
              {mentorTrack === "adult" ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-300 font-bold">Government Issued Photo ID *</Label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/20 cursor-pointer hover:bg-white/5">
                      <Upload size={18} className="text-gray-400 shrink-0"/>
                      <span className="text-sm text-gray-400">{idDocUrl ? '✓ Uploaded' : 'Upload JPG, PNG, or PDF (max 10MB)'}</span>
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e=>handleUploadFile(e,setIdDocUrl,setUploadingId)} className="hidden"/>
                    </label>
                    {uploadingId && <p className="text-xs text-pink-400 animate-pulse">Uploading...</p>}
                    {idDocUrl && <p className="text-xs text-green-400">✓ Government ID uploaded successfully</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-300 font-bold">Professional Headshot *</Label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/20 cursor-pointer hover:bg-white/5">
                      <Upload size={18} className="text-gray-400 shrink-0"/>
                      <span className="text-sm text-gray-400">{facePhotoUrl ? '✓ Uploaded' : 'Upload clear headshot photo'}</span>
                      <input type="file" accept="image/*" onChange={e=>handleUploadFile(e,setFacePhotoUrl,setUploadingFace)} className="hidden"/>
                    </label>
                    {uploadingFace && <p className="text-xs text-pink-400 animate-pulse">Uploading...</p>}
                    {facePhotoUrl && <p className="text-xs text-green-400">✓ Headshot uploaded successfully</p>}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-300 font-bold">School Issued Student ID</Label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/20 cursor-pointer hover:bg-white/5">
                      <Upload size={18} className="text-gray-400 shrink-0"/>
                      <span className="text-sm text-gray-400">{idDocUrl ? '✓ Uploaded' : 'Upload student ID'}</span>
                      <input type="file" accept="image/*,.pdf" onChange={e=>handleUploadFile(e,setIdDocUrl,setUploadingId)} className="hidden"/>
                    </label>
                    {idDocUrl && <p className="text-xs text-green-400">✓ Student ID uploaded</p>}
                    <p className="text-xs text-gray-500">No school ID? Contact mentors@girlsglowingup.com</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-300 font-bold">Recent Clear Face Photo *</Label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/20 cursor-pointer hover:bg-white/5">
                      <Upload size={18} className="text-gray-400 shrink-0"/>
                      <span className="text-sm text-gray-400">{facePhotoUrl ? '✓ Uploaded' : 'Upload recent photo of your face'}</span>
                      <input type="file" accept="image/*" onChange={e=>handleUploadFile(e,setFacePhotoUrl,setUploadingFace)} className="hidden"/>
                    </label>
                    {facePhotoUrl && <p className="text-xs text-green-400">✓ Face photo uploaded</p>}
                  </div>
                </>
              )}
              <div className="flex justify-between pt-2">
                <Button onClick={prevStep} variant="ghost" className="text-gray-400"><ArrowLeft size={16}/> Back</Button>
                <Button onClick={nextStep} disabled={mentorTrack==="adult"?(!idDocUrl||!facePhotoUrl):!facePhotoUrl}
                  style={{ background:'linear-gradient(135deg, #e8526d, #f1b610)' }} className="text-white">Next</Button>
              </div>
            </div>
          )}

          {/* STEP 8 — References (Adult only) */}
          {step === 8 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">References</h3>
              <p className="text-xs text-gray-400">Up to 2 references — professional or personal</p>
              <div className="p-4 rounded-xl bg-white/5 space-y-3">
                <Label className="text-xs font-bold text-pink-400 uppercase">Reference 1</Label>
                <Input placeholder="Full Name" value={ref1Name} onChange={e=>setRef1Name(e.target.value)} className="bg-[#160e1d] border-white/10 text-white placeholder-gray-500"/>
                <select value={ref1Rel} onChange={e=>setRef1Rel(e.target.value)} className="w-full h-12 rounded-lg px-3 text-white bg-[#160e1d] border border-white/10">
                  <option value="">Relationship</option>
                  <option>Professional</option><option>Personal</option><option>Academic</option>
                </select>
                <Input type="email" placeholder="Email Address" value={ref1Email} onChange={e=>setRef1Email(e.target.value)} className="bg-[#160e1d] border-white/10 text-white placeholder-gray-500"/>
              </div>
              <div className="p-4 rounded-xl bg-white/5 space-y-3">
                <Label className="text-xs font-bold text-purple-400 uppercase">Reference 2 (optional)</Label>
                <Input placeholder="Full Name" value={ref2Name} onChange={e=>setRef2Name(e.target.value)} className="bg-[#160e1d] border-white/10 text-white placeholder-gray-500"/>
                <select value={ref2Rel} onChange={e=>setRef2Rel(e.target.value)} className="w-full h-12 rounded-lg px-3 text-white bg-[#160e1d] border border-white/10">
                  <option value="">Relationship</option>
                  <option>Professional</option><option>Personal</option><option>Academic</option>
                </select>
                <Input type="email" placeholder="Email Address" value={ref2Email} onChange={e=>setRef2Email(e.target.value)} className="bg-[#160e1d] border-white/10 text-white placeholder-gray-500"/>
              </div>
              <div className="flex justify-between pt-2">
                <Button onClick={prevStep} variant="ghost" className="text-gray-400"><ArrowLeft size={16}/> Back</Button>
                <div className="flex gap-2">
                  <Button onClick={nextStep} variant="ghost" className="text-pink-400 text-sm">Skip for now</Button>
                  <Button onClick={nextStep} disabled={!ref1Name||!ref1Rel||!ref1Email}
                    style={{ background:'linear-gradient(135deg, #e8526d, #f1b610)' }} className="text-white">Next</Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 9 — Parent Consent (Teen only) */}
          {step === 9 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Parent / Guardian Consent</h3>
              <p className="text-xs text-gray-400">A consent email will be sent to your parent or guardian. Next unlocks after they confirm.</p>
              <Input placeholder="Parent / Guardian Full Name *" value={parentName} onChange={e=>setParentName(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder-gray-500"/>
              <select value={parentRel} onChange={e=>setParentRel(e.target.value)} className="w-full h-12 rounded-lg px-3 text-white bg-white/5 border border-white/10">
                <option value="">Relationship *</option>
                <option>Mother</option><option>Father</option><option>Stepparent</option>
                <option>Grandparent</option><option>Legal Guardian</option><option>Other</option>
              </select>
              <Input type="email" placeholder="Parent Email *" value={parentEmail} onChange={e=>setParentEmail(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder-gray-500"/>
              <Input placeholder="Parent Phone Number" value={parentPhone} onChange={e=>setParentPhone(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder-gray-500"/>
              {!parentConsentSent ? (
                <Button onClick={handleSendParentConsent} className="w-full h-12 font-bold text-white"
                  disabled={!parentName||!parentRel||!parentEmail||loading}
                  style={{ background:'linear-gradient(135deg, #e8526d, #f1b610)' }}>
                  {loading ? 'Sending...' : 'Send Consent Email'}
                </Button>
              ) : (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                  ✓ Consent email sent to {parentEmail}. Ask your parent or guardian to check their inbox and click the approval link.
                </div>
              )}
              <div className="flex justify-between pt-2">
                <Button onClick={prevStep} variant="ghost" className="text-gray-400"><ArrowLeft size={16}/> Back</Button>
                <Button onClick={nextStep} disabled={!parentConsentSent}
                  style={{ background:'linear-gradient(135deg, #e8526d, #f1b610)' }} className="text-white">Next</Button>
              </div>
            </div>
          )}

          {/* STEP 10 — Final Agreement */}
          {step === 10 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Final Review & Sign</h3>
              <div className="p-3 rounded-xl bg-white/5 text-xs text-gray-300 space-y-1">
                <p><span className="text-gray-500">Name:</span> {fullName}</p>
                <p><span className="text-gray-500">Track:</span> {mentorTrack === "adult" ? "Adult Mentor" : "Teen Mentor"}</p>
                <p><span className="text-gray-500">Age Groups:</span> {ageGroups.join(", ")}</p>
                <p><span className="text-gray-500">Expertise:</span> {expertise.slice(0,3).join(", ")}{expertise.length > 3 ? ` +${expertise.length-3} more` : ''}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-400 font-bold">GGU Mentor Terms of Service {!scrolledTos && <span className="text-yellow-400">(scroll to bottom to unlock)</span>}</Label>
                <div ref={tosRef} onScroll={()=>handleScroll(tosRef,setScrolledTos)}
                  className="h-28 overflow-y-auto rounded-lg p-3 text-[11px] text-gray-400 leading-relaxed bg-white/5 border border-white/10">
                  <p className="font-bold text-gray-300 mb-2">GGU Mentor Terms of Service</p>
                  <p>By applying as a GGU Mentor, you agree to uphold the values of Girls Glowing Up™ and commit to the safety, growth, and empowerment of every mentee. You agree to maintain professional boundaries at all times and to report any safety concerns immediately. You understand that your access may be revoked at any time if these terms are violated. You confirm you have provided accurate information and consent to GGU's verification and background check process. GGU reserves the right to modify, suspend, or terminate mentor access at any time. Mentors are volunteers and receive no financial compensation. All content shared on the platform must align with GGU's community guidelines. You grant GGU permission to use your name and likeness in promotional materials unless you opt out in writing. This agreement is governed by applicable laws in your state of residence.</p>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-400 font-bold">Safety and Code of Conduct {!scrolledConduct && <span className="text-yellow-400">(scroll to bottom to unlock)</span>}</Label>
                <div ref={conductRef} onScroll={()=>handleScroll(conductRef,setScrolledConduct)}
                  className="h-28 overflow-y-auto rounded-lg p-3 text-[11px] text-gray-400 leading-relaxed bg-white/5 border border-white/10">
                  <p className="font-bold text-gray-300 mb-2">Safety and Code of Conduct</p>
                  <p>As a GGU Mentor, I commit to: creating a safe and supportive environment for every mentee; never engaging in inappropriate conversations, sharing personal contact information outside the platform, or meeting mentees in unsupervised settings; reporting any concerning behavior to GGU immediately; treating all mentees with respect regardless of their background; maintaining confidentiality; never sharing a mentee's personal information with third parties; adhering to GGU's anti-discrimination and anti-harassment policies; completing all required training before working with girls; and modeling positive behavior and healthy communication at all times.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className={`flex gap-3 items-start ${scrolledTos?'cursor-pointer':'opacity-50 cursor-not-allowed'}`}
                  onClick={()=>scrolledTos&&setAcceptTos(!acceptTos)}>
                  <div className={`w-5 h-5 shrink-0 rounded border border-white/30 flex items-center justify-center mt-0.5 ${acceptTos?'bg-pink-500 border-pink-500':''}`}>
                    {acceptTos && <Check size={12} className="text-white"/>}
                  </div>
                  <span className="text-xs text-gray-300">I have read and accept the GGU Mentor Terms of Service</span>
                </div>
                <div className={`flex gap-3 items-start ${scrolledConduct?'cursor-pointer':'opacity-50 cursor-not-allowed'}`}
                  onClick={()=>scrolledConduct&&setAcceptConduct(!acceptConduct)}>
                  <div className={`w-5 h-5 shrink-0 rounded border border-white/30 flex items-center justify-center mt-0.5 ${acceptConduct?'bg-pink-500 border-pink-500':''}`}>
                    {acceptConduct && <Check size={12} className="text-white"/>}
                  </div>
                  <span className="text-xs text-gray-300">I agree to follow the Safety and Code of Conduct at all times</span>
                </div>
                <div className="flex gap-3 items-start cursor-pointer" onClick={()=>setCertifyTruth(!certifyTruth)}>
                  <div className={`w-5 h-5 shrink-0 rounded border border-white/30 flex items-center justify-center mt-0.5 ${certifyTruth?'bg-pink-500 border-pink-500':''}`}>
                    {certifyTruth && <Check size={12} className="text-white"/>}
                  </div>
                  <span className="text-xs text-gray-300">I certify all information provided is truthful and accurate</span>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-400 font-bold">Electronic Signature *</Label>
                <input type="text" placeholder="Type your full legal name" value={signature} onChange={e=>setSignature(e.target.value)}
                  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                  className="w-full h-12 rounded-lg px-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"/>
              </div>

              <div className="flex justify-between pt-2">
                <Button onClick={prevStep} variant="ghost" className="text-gray-400"><ArrowLeft size={16}/> Back</Button>
                <Button onClick={handleSubmitApplication}
                  disabled={!acceptTos||!acceptConduct||!certifyTruth||signature.length<2||loading}
                  style={{ background:'linear-gradient(135deg, #e8526d, #f1b610)' }} className="text-white font-bold">
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Submitting...</> : 'Submit Application'}
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}