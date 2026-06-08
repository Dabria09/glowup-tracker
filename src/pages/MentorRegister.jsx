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

const EXPERTISE_AREAS = ['Career Development', 'Financial Literacy', 'College Prep', 'Mental Wellness', 'Entrepreneurship', 'STEM', 'Arts & Creative', 'Athletics', 'Life Skills', 'Other'];
const AGE_GROUPS = ['Glow Girls 5–12', 'Glow Teens 13–18', 'Glow Women 19–26'];
const MENTEE_COUNTS = ['1', '2', '3', '4', '5+'];
const HOURS_PER_MONTH = ['2–4 hrs', '5–8 hrs', '9–12 hrs', '12+ hrs'];

const TOTAL_STEPS = 6;

export default function MentorRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 = account creation
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Account
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState("");

  // Step 2 — Professional
  const [occupation, setOccupation] = useState("");
  const [education, setEducation] = useState("");
  const [expertiseAreas, setExpertiseAreas] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [menteeCount, setMenteeCount] = useState("");
  const [hoursPerMonth, setHoursPerMonth] = useState("");

  // Step 3 — Background check consents
  const [consentBgCheck, setConsentBgCheck] = useState(false);
  const [consentNoMove, setConsentNoMove] = useState(false);

  // Step 4 — ID verification
  const [idFile, setIdFile] = useState(null);
  const [headshot, setHeadshot] = useState(null);
  const [headshotPreview, setHeadshotPreview] = useState(null);
  const [idUploading, setIdUploading] = useState(false);

  // Step 5 — References
  const [ref1, setRef1] = useState({ name: '', relationship: '', email: '' });
  const [ref2, setRef2] = useState({ name: '', relationship: '', email: '' });

  // Step 6 — Agreement
  const [acceptTOS, setAcceptTOS] = useState(false);
  const [acceptConduct, setAcceptConduct] = useState(false);
  const [signature, setSignature] = useState("");

  // Check for OAuth return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("step") === "2") {
      base44.auth.me().then(u => {
        if (u) { setEmail(u.email); setFullName(u.full_name || ""); setStep(1); }
      }).catch(() => {});
    }
  }, []);

  const toggleMulti = (val, arr, setArr) => {
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

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
    if (calcAge(dob) < 18) { setError("You must be at least 18 years old to apply as a mentor"); return; }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      setShowOtp(false);
      setStep(1);
      toast.success("Email verified! Continue your application.");
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === 'id') { setIdFile(file); }
    if (type === 'headshot') {
      setHeadshot(file);
      const reader = new FileReader();
      reader.onloadend = () => setHeadshotPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitApplication = async () => {
    if (!acceptTOS || !acceptConduct || !signature.trim()) {
      setError("Please accept all agreements and provide your electronic signature");
      return;
    }
    setLoading(true);
    try {
      const user = await base44.auth.me();
      let headshotUrl = null;
      let idUrl = null;

      if (headshot) {
        setIdUploading(true);
        const r = await base44.integrations.Core.UploadFile({ file: headshot });
        headshotUrl = r.file_url;
      }
      if (idFile) {
        const r = await base44.integrations.Core.UploadFile({ file: idFile });
        idUrl = r.file_url;
        setIdUploading(false);
      }

      await base44.entities.MentorApplication.create({
        user_email: user?.email || email,
        full_name: fullName,
        occupation,
        education,
        expertise: JSON.stringify(expertiseAreas),
        age_groups: JSON.stringify(ageGroups),
        mentee_count: menteeCount,
        hours_per_month: hoursPerMonth,
        bg_check_consent: consentBgCheck,
        avatar_url: headshotUrl,
        id_url: idUrl,
        ref1_name: ref1.name,
        ref1_relationship: ref1.relationship,
        ref1_email: ref1.email,
        ref2_name: ref2.name,
        ref2_relationship: ref2.relationship,
        ref2_email: ref2.email,
        electronic_signature: signature,
        submitted_date: new Date().toISOString(),
        status: 'pending',
        background_check_status: 'not_started',
        interview_status: 'not_scheduled',
        categories: JSON.stringify(expertiseAreas),
      });

      await base44.auth.updateMe({
        account_type: "mentor",
        mentor_status: "pending",
        active_mode: "mentor",
        full_name: fullName,
      });

      setSubmitted(true);
    } catch (err) {
      setError("Error submitting application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── SUBMITTED CONFIRMATION ──
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-white text-center"
        style={{ background: 'radial-gradient(ellipse at top, #0f0520 0%, #1a0a18 50%, #0d0610 100%)' }}>
        <img src="https://gguapp.com/manus-storage/ggu-logo-glow_54cb14fa.png" alt="GGU" className="w-40 mx-auto mb-6" />
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-3">Application Submitted!</h1>
        <p className="text-gray-300 mb-6 max-w-sm text-sm leading-relaxed">
          Thank you for applying to become a GGU Mentor. Here's what happens next:
        </p>
        <div className="w-full max-w-sm text-left space-y-3 mb-8">
          {[
            { stage: '1', label: 'Application Submitted ✅', desc: 'Your application is in our system' },
            { stage: '2', label: 'Under Review 🔍', desc: 'Admin reviews your background — 3–5 business days' },
            { stage: '3', label: 'Interview Scheduled 📅', desc: 'You\'ll receive a notification to book a time slot' },
            { stage: '4', label: 'Background Check 🔒', desc: 'GGU initiates a mandatory background check' },
            { stage: '5', label: 'GGU Mentor Lesson 📚', desc: 'Complete a short required training module' },
            { stage: '6', label: 'Approved ✅', desc: 'Welcome to the GGU Mentor family!' },
          ].map(s => (
            <div key={s.stage} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #e8526d, #f1b610)' }}>{s.stage}</div>
              <div>
                <div className="text-sm font-bold text-white">{s.label}</div>
                <div className="text-xs text-gray-400">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <Button className="w-full max-w-sm h-12 font-bold text-white" onClick={() => window.location.href = '/mentor-dashboard'}
          style={{ background: 'linear-gradient(135deg, #e8526d, #f1b610)' }}>
          Go to My Dashboard
        </Button>
      </div>
    );
  }

  // ── ACCOUNT CREATION (Step 0) ──
  if (step === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at top, #0f0520 0%, #1a0a18 50%, #0d0610 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute rounded-full" style={{ width: 400, height: 400, top: -100, left: -80, background: 'radial-gradient(circle, rgba(232,82,109,0.15), transparent 70%)', filter: 'blur(70px)' }} />
        </div>

        <div className="w-full max-w-md relative z-10 py-8">
          <div className="text-center mb-8">
            <img
              src="https://media.base44.com/images/public/6a0e12a89992f9565c11e330/845ad74b2_CD382222-BC38-4ADA-BAD6-16F4900160602.png"
              alt="Girls Glowing Up"
              className="w-56 mx-auto mb-5"
              style={{ filter: 'drop-shadow(0 0 20px rgba(232,82,109,0.4))' }}
            />
            <h1 className="text-2xl font-bold text-white mb-1">Mentor Application</h1>
            <p className="text-sm text-gray-400">Create your account to begin</p>
          </div>

          <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>
            {showOtp ? (
              <>
                <h2 className="text-lg font-bold text-white text-center mb-2">Verify Your Email</h2>
                <p className="text-sm text-gray-400 text-center mb-5">We sent a code to <span className="text-pink-400">{email}</span></p>
                <div className="flex justify-center mb-5">
                  <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus>
                    <InputOTPGroup>
                      {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>}
                <Button className="w-full h-12 font-bold text-white mb-3" onClick={handleVerify} disabled={loading || otpCode.length < 6}
                  style={{ background: 'linear-gradient(135deg, #e8526d, #f1b610)' }}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : 'Verify & Continue'}
                </Button>
                <p className="text-center text-sm text-gray-400">
                  Didn't receive it?{" "}
                  <button onClick={() => base44.auth.resendOtp(email)} className="text-pink-400 hover:underline font-semibold">Resend</button>
                </p>
              </>
            ) : (
              <>
                <Button variant="outline" className="w-full h-12 text-sm font-medium mb-3 bg-white/5 border-white/10 hover:bg-white/10 text-white" onClick={handleApple}>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.56 1.4-1.32 2.79-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  Sign up with Apple
                </Button>
                <Button variant="outline" className="w-full h-12 text-sm font-medium mb-5 bg-white/5 border-white/10 hover:bg-white/10 text-white" onClick={handleGoogle}>
                  <GoogleIcon className="w-5 h-5 mr-2" /> Sign up with Google
                </Button>
                <div className="relative mb-5">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-3 text-gray-500">or</span></div>
                </div>
                {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>}
                <form onSubmit={handleAccountSubmit} className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Legal Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input type="text" placeholder="Your full name" value={fullName} onChange={e => setFullName(e.target.value)}
                        className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500" required />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500" required />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date of Birth</Label>
                    <Input type="date" value={dob} onChange={e => setDob(e.target.value)} max={new Date(Date.now() - 18*365.25*24*60*60*1000).toISOString().split('T')[0]}
                      className="mt-1 h-12 bg-white/5 border-white/10 text-white focus:border-pink-500" required />
                    {dob && calcAge(dob) < 18 && <p className="text-xs text-red-400 mt-1">Must be 18 or older</p>}
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                        className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500" required />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Confirm Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 font-bold text-white" disabled={loading}
                    style={{ background: 'linear-gradient(135deg, #e8526d, #f1b610)' }}>
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : 'Create Account & Apply'}
                  </Button>
                </form>
              </>
            )}
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have a mentor account?{" "}
            <Link to="/mentor-login" className="text-pink-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── MULTI-STEP APPLICATION (Steps 1–6) ──
  const stepTitles = [
    '', // step 0 is account creation
    'Professional Background',
    'Background & Safety',
    'ID Verification',
    'References',
    'Agreement & Submit',
  ];

  return (
    <div className="min-h-screen text-white pb-24" style={{ background: 'radial-gradient(ellipse at top, #0f0520 0%, #1a0a18 50%, #0d0610 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 px-5 py-4 flex items-center gap-4" style={{ background: 'rgba(15,5,32,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>
        <img src="https://gguapp.com/manus-storage/ggu-logo-glow_54cb14fa.png" alt="GGU" className="w-28" />
        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-1">Step {step} of {TOTAL_STEPS}</div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: 'linear-gradient(90deg, #e8526d, #f1b610)' }} />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-6">
        <h2 className="text-xl font-bold text-white mb-1">Step {step}: {stepTitles[step]}</h2>
        {error && <div className="mt-3 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>}

        {/* STEP 1 — Professional Background */}
        {step === 1 && (
          <div className="mt-5 space-y-5">
            <Field label="Current Occupation *">
              <input value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="e.g., Software Engineer, Teacher, Entrepreneur"
                className="field-input" style={fieldStyle} />
            </Field>
            <Field label="Highest Level of Education *">
              <select value={education} onChange={e => setEducation(e.target.value)} className="field-input" style={fieldStyle}>
                <option value="">Select...</option>
                {['High School Diploma', 'Some College', "Associate's Degree", "Bachelor's Degree", "Master's Degree", "Doctoral Degree", 'Trade/Vocational Certificate', 'Other'].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Areas of Expertise (select all that apply) *">
              <div className="flex flex-wrap gap-2 mt-1">
                {EXPERTISE_AREAS.map(area => (
                  <button key={area} type="button" onClick={() => toggleMulti(area, expertiseAreas, setExpertiseAreas)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition"
                    style={expertiseAreas.includes(area) ? { background: 'linear-gradient(135deg, #e8526d, #f1b610)', color: '#fff' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
                    {area}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Age Group You Want to Mentor *">
              <div className="flex flex-wrap gap-2 mt-1">
                {AGE_GROUPS.map(ag => (
                  <button key={ag} type="button" onClick={() => toggleMulti(ag, ageGroups, setAgeGroups)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition"
                    style={ageGroups.includes(ag) ? { background: 'linear-gradient(135deg, #a855f7, #e8526d)', color: '#fff' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
                    {ag}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="How many mentees can you commit to at one time?">
              <div className="flex gap-2 mt-1">
                {MENTEE_COUNTS.map(c => (
                  <button key={c} type="button" onClick={() => setMenteeCount(c)}
                    className="flex-1 py-2 rounded-xl text-sm font-bold transition"
                    style={menteeCount === c ? { background: 'linear-gradient(135deg, #e8526d, #f1b610)', color: '#fff' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
                    {c}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Hours per month you can commit?">
              <div className="flex flex-wrap gap-2 mt-1">
                {HOURS_PER_MONTH.map(h => (
                  <button key={h} type="button" onClick={() => setHoursPerMonth(h)}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition"
                    style={hoursPerMonth === h ? { background: 'linear-gradient(135deg, #e8526d, #f1b610)', color: '#fff' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
                    {h}
                  </button>
                ))}
              </div>
            </Field>
            <NavButtons
              onBack={() => setStep(0)}
              onNext={() => {
                if (!occupation || !education || !expertiseAreas.length || !ageGroups.length) { setError("Please complete all required fields"); return; }
                setError(""); setStep(2);
              }}
            />
          </div>
        )}

        {/* STEP 2 — Background & Safety */}
        {step === 2 && (
          <div className="mt-5 space-y-5">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Shield size={20} className="text-red-400" />
                <h3 className="font-bold text-white text-base">Background Check Required</h3>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                All GGU mentors are required to complete a background check before being approved to work with girls. <strong className="text-white">This is non-negotiable</strong> and protects the safety of every girl on our platform.
              </p>
              <p className="text-xs text-gray-400 mt-3">The background check will be initiated by GGU admin after your application is reviewed. You will receive instructions directly from our background check provider via email.</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={consentBgCheck} onChange={e => setConsentBgCheck(e.target.checked)} className="mt-1 w-4 h-4" />
              <span className="text-sm text-gray-200">I consent to a background check being conducted as part of my mentor application process.</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={consentNoMove} onChange={e => setConsentNoMove(e.target.checked)} className="mt-1 w-4 h-4" />
              <span className="text-sm text-gray-200">I understand that my application <strong className="text-white">will not move forward</strong> without a cleared background check.</span>
            </label>

            <NavButtons
              onBack={() => { setError(""); setStep(1); }}
              onNext={() => {
                if (!consentBgCheck || !consentNoMove) { setError("You must accept both background check agreements to proceed"); return; }
                setError(""); setStep(3);
              }}
            />
          </div>
        )}

        {/* STEP 3 — ID Verification */}
        {step === 3 && (
          <div className="mt-5 space-y-5">
            <div className="rounded-2xl p-4 mb-2" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}>
              <p className="text-xs text-blue-300">🔒 Your ID is used for verification only and is not stored publicly or shared with mentees.</p>
            </div>

            <Field label="Government-Issued Photo ID *">
              <div className="mt-1">
                <input type="file" accept="image/*,application/pdf" onChange={e => handleFileChange(e, 'id')} className="hidden" id="id-upload" />
                <label htmlFor="id-upload" className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.05)', border: `1px dashed ${idFile ? '#e8526d' : 'rgba(255,255,255,0.2)'}` }}>
                  <Upload size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-300">{idFile ? idFile.name : 'Upload ID (image or PDF)'}</span>
                  {idFile && <CheckCircle size={16} className="ml-auto text-green-400" />}
                </label>
              </div>
            </Field>

            <Field label="Professional Headshot *">
              <div className="mt-1 flex items-center gap-4">
                {headshotPreview && (
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <img src={headshotPreview} alt="Headshot" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'headshot')} className="hidden" id="headshot-upload" />
                  <label htmlFor="headshot-upload" className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition hover:opacity-80"
                    style={{ background: 'rgba(255,255,255,0.05)', border: `1px dashed ${headshot ? '#e8526d' : 'rgba(255,255,255,0.2)'}` }}>
                    <Upload size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-300">{headshot ? headshot.name : 'Upload headshot photo'}</span>
                    {headshot && <CheckCircle size={16} className="ml-auto text-green-400" />}
                  </label>
                </div>
              </div>
            </Field>

            <NavButtons
              onBack={() => { setError(""); setStep(2); }}
              onNext={() => {
                if (!idFile || !headshot) { setError("Please upload both your ID and a headshot photo"); return; }
                setError(""); setStep(4);
              }}
            />
          </div>
        )}

        {/* STEP 4 — References */}
        {step === 4 && (
          <div className="mt-5 space-y-5">
            <p className="text-sm text-gray-400">References are optional but encouraged. Provide up to 2 professional references who can speak to your character and work.</p>

            {[{ ref: ref1, setRef: setRef1, label: 'Reference 1' }, { ref: ref2, setRef: setRef2, label: 'Reference 2' }].map(({ ref, setRef, label }) => (
              <div key={label} className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-sm font-bold text-white">{label} <span className="text-gray-500 font-normal">(optional)</span></p>
                <input placeholder="Full Name" value={ref.name} onChange={e => setRef({ ...ref, name: e.target.value })} className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none" style={fieldStyle} />
                <input placeholder="Relationship (e.g., Supervisor, Colleague)" value={ref.relationship} onChange={e => setRef({ ...ref, relationship: e.target.value })} className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none" style={fieldStyle} />
                <input type="email" placeholder="Email Address" value={ref.email} onChange={e => setRef({ ...ref, email: e.target.value })} className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none" style={fieldStyle} />
              </div>
            ))}

            <NavButtons onBack={() => { setError(""); setStep(3); }} onNext={() => { setError(""); setStep(5); }} />
          </div>
        )}

        {/* STEP 5 — Agreement */}
        {step === 5 && (
          <div className="mt-5 space-y-5">
            <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-bold text-white">Mentor Terms of Service</h3>
              <div className="text-xs text-gray-400 space-y-2 max-h-36 overflow-y-auto pr-1">
                <p>By becoming a GGU Mentor, you agree to uphold the mission of Girls Glowing Up™ — empowering girls and young women to thrive. You agree to: maintain respectful and professional conduct at all times; keep all mentee interactions within the GGU platform; report any signs of abuse, neglect, or harm; protect the privacy and personal information of all mentees; complete all required vetting steps including a background check; and follow GGU's age-gated interaction guidelines.</p>
                <p><strong className="text-white">Background Check:</strong> All mentors must pass a background check before being approved. This is non-negotiable and protects every girl on our platform.</p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer mt-2">
                <input type="checkbox" checked={acceptTOS} onChange={e => setAcceptTOS(e.target.checked)} className="mt-0.5 w-4 h-4" />
                <span className="text-sm text-gray-200">I have read and accept the Mentor Terms of Service</span>
              </label>
            </div>

            <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-bold text-white">GGU Safety & Code of Conduct</h3>
              <div className="text-xs text-gray-400 space-y-2 max-h-36 overflow-y-auto pr-1">
                <p>I agree to uphold GGU's values of empowerment, authenticity, equity, community, integrity, and wholeness. I will maintain appropriate boundaries with all mentees, never solicit off-platform contact with minors, and immediately report any safety concerns to GGU admin. I understand that violation of this code of conduct may result in immediate removal from the platform.</p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer mt-2">
                <input type="checkbox" checked={acceptConduct} onChange={e => setAcceptConduct(e.target.checked)} className="mt-0.5 w-4 h-4" />
                <span className="text-sm text-gray-200">I have read and accept the GGU Safety and Code of Conduct Agreement</span>
              </label>
            </div>

            <Field label="Electronic Signature *">
              <input placeholder="Type your full legal name as your signature" value={signature} onChange={e => setSignature(e.target.value)}
                className="mt-1 w-full rounded-xl px-4 py-3 text-sm text-white outline-none" style={{ ...fieldStyle, fontStyle: 'italic' }} />
              <p className="text-xs text-gray-500 mt-1">By typing your name, you electronically sign this application</p>
            </Field>

            <Button className="w-full h-12 font-bold text-white" onClick={handleSubmitApplication}
              disabled={!acceptTOS || !acceptConduct || !signature.trim() || loading}
              style={{ background: 'linear-gradient(135deg, #e8526d, #f1b610)' }}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{idUploading ? 'Uploading files...' : 'Submitting...'}</> : 'Submit Application'}
            </Button>

            <button onClick={() => { setError(""); setStep(4); }} className="w-full py-3 text-sm text-gray-400 hover:text-white transition">← Back</button>
          </div>
        )}
      </div>
    </div>
  );
}

// Shared helpers
const fieldStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' };

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

function NavButtons({ onBack, onNext, nextLabel = 'Continue' }) {
  return (
    <div className="flex gap-3 pt-2">
      {onBack && (
        <button onClick={onBack} className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-400 transition hover:text-white"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          ← Back
        </button>
      )}
      <button onClick={onNext} className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #e8526d, #f1b610)' }}>
        {nextLabel} <ChevronRight size={16} />
      </button>
    </div>
  );
}