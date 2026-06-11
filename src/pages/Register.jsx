import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { calculateGirlAgeGroup } from "@/lib/authRules";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pendingAge, setPendingAge] = useState(null);

  const handleRegister = async () => {
    setError("");
    if (!fullName || !email || !password || !confirmPassword || !dob) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const { age, ageGroup } = calculateGirlAgeGroup(dob);

    if (age === null || !ageGroup) { setError("You must be at least 10 years old to join GGU."); return; }

    setPendingAge({ age, ageGroup });
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

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);

      const requiresParentalConsent = pendingAge.age < 13;

      // Create user profile record
      await base44.auth.updateMe({
        full_name: fullName,
        date_of_birth: dob,
        age: pendingAge.age,
        age_group: pendingAge.ageGroup,
        account_type: "girl",
        isDeleted: false,
        requires_parental_consent: requiresParentalConsent,
        parental_consent_confirmed: !requiresParentalConsent,
        created_at: new Date().toISOString()
      });

      window.location.href = "/onboarding";
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await base44.auth.resendOtp(email);
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  if (showOtp) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a18 40%, #0d0610 100%)' }}>
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <img src="https://gguapp.com/manus-storage/ggu-logo-glow_54cb14fa.png" alt="Girls Glowing Up" className="w-40 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email ✉️</h1>
            <p className="text-sm text-gray-400">We sent a 6-digit code to</p>
            <p className="text-sm text-pink-400 font-semibold">{email}</p>
          </div>
          <div className="rounded-3xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>
            {error && <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>}
            <div className="flex justify-center mb-4">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus>
                <InputOTPGroup>
                  <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                  <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button className="w-full h-12 font-bold text-white" onClick={handleVerify} disabled={loading || otpCode.length < 6}
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : <><Sparkles className="w-4 h-4 mr-2" />Verify & Continue</>}
            </Button>
            <p className="text-center text-sm text-gray-400">
              Didn't get the code?{" "}
              <button onClick={handleResend} className="text-pink-400 font-semibold hover:underline">Resend</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a18 40%, #0d0610 100%)' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute rounded-full" style={{ width: 400, height: 400, top: -100, left: -80, background: 'radial-gradient(circle, rgba(232,82,109,0.18), transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute rounded-full" style={{ width: 300, height: 300, top: '40%', right: -60, background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <img src="https://gguapp.com/manus-storage/ggu-logo-glow_54cb14fa.png" alt="Girls Glowing Up" className="w-40 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Join the Sisterhood ✨</h1>
          <p className="text-sm text-gray-400">Create your account and start glowing</p>
        </div>

        <div className="rounded-3xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>
          <Button variant="outline" className="w-full h-12 text-sm font-medium bg-white/5 border-white/10 hover:bg-white/10 text-white"
            onClick={() => base44.auth.loginWithProvider("apple", "/google-setup")}>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.56 1.4-1.32 2.79-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            Sign up with Apple
          </Button>
          <Button variant="outline" className="w-full h-12 text-sm font-medium bg-white/5 border-white/10 hover:bg-white/10 text-white"
            onClick={() => base44.auth.loginWithProvider("google", "/google-setup")}>
            <GoogleIcon className="w-5 h-5 mr-2" />
            Sign up with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="px-3 text-gray-500" style={{ background: 'rgba(26,10,24,0.9)' }}>Or register with email</span></div>
          </div>

          {error && <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>}

          <div className="space-y-3">
            <Input placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className="h-12 bg-white/5 border-white/10 text-white placeholder-gray-500" />
            <Input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="h-12 bg-white/5 border-white/10 text-white placeholder-gray-500" />
            <Input type="password" placeholder="Password (min 8 characters)" value={password} onChange={e => setPassword(e.target.value)} className="h-12 bg-white/5 border-white/10 text-white placeholder-gray-500" />
            <Input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-12 bg-white/5 border-white/10 text-white placeholder-gray-500" />
            <div className="space-y-1">
              <Label className="text-xs text-gray-400 font-bold uppercase tracking-widest">Date of Birth</Label>
              <Input type="date" value={dob} onChange={e => setDob(e.target.value)} className="h-12 bg-white/5 border-white/10 text-white" />
            </div>
            <Button className="w-full h-12 font-bold text-white border-0" onClick={handleRegister} disabled={loading}
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : 'Create Account'}
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-pink-400 font-semibold hover:underline">Sign In</Link>
        </p>
        <p className="text-center text-[10px] text-gray-600 mt-2">
          By signing up, you agree to our{" "}
          <Link to="/terms-of-service" className="underline">Terms</Link> and{" "}
          <Link to="/privacy-policy" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}