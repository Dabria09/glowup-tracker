import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, ShieldCheck } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

/**
 * OtpVerifyStep — shown after password/OAuth sign-in to verify the user owns the email.
 * Uses Base44's built-in resendOtp + verifyOtp flow.
 * 
 * Props:
 *   email        {string}   — the email to verify
 *   onVerified   {fn}       — called when OTP is confirmed; receives access_token
 *   onError      {fn}       — called with error message string
 */
export default function OtpVerifyStep({ email, onVerified, onError }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Send OTP on mount
  useEffect(() => {
    sendCode();
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sendCode = async () => {
    setError("");
    setResending(true);
    try {
      await base44.auth.resendOtp(email);
      setSent(true);
      setCountdown(60);
    } catch (e) {
      setError("Could not send verification code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length < 6) { setError("Please enter the full 6-digit code."); return; }
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode: otp });
      const token = result?.access_token || result?.data?.access_token;
      if (token) base44.auth.setToken(token);
      onVerified(token);
    } catch (e) {
      setError("Incorrect code. Please check your email and try again.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a18 40%, #0d0610 100%)' }}
    >
      {/* Glow orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute rounded-full" style={{ width: 400, height: 400, top: -100, left: -80, background: 'radial-gradient(circle, rgba(232,82,109,0.18), transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute rounded-full" style={{ width: 300, height: 300, bottom: 0, right: -60, background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <BrandLogo />
          <div className="flex items-center justify-center gap-2 mb-1">
            <ShieldCheck size={20} className="text-pink-400" />
            <h1 className="text-2xl font-bold text-white">Verify It's You ✨</h1>
          </div>
          <p className="text-sm text-gray-400">
            {sent
              ? <>We sent a 6-digit code to <span className="text-pink-300 font-medium">{email}</span></>
              : "Sending your verification code..."}
          </p>
        </div>

        <div className="rounded-3xl p-6 space-y-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>
          )}

          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup className="gap-2">
                {[0,1,2,3,4,5].map(i => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="w-11 h-14 text-xl font-bold text-white rounded-xl border-white/20 bg-white/5 focus:border-pink-500"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            className="w-full h-12 font-bold text-white border-0"
            onClick={handleVerify}
            disabled={loading || otp.length < 6}
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : 'Verify & Continue'}
          </Button>

          <p className="text-center text-xs text-gray-500">
            Didn't get it?{" "}
            {countdown > 0 ? (
              <span className="text-gray-400">Resend in {countdown}s</span>
            ) : (
              <button
                onClick={sendCode}
                disabled={resending}
                className="text-pink-400 font-semibold hover:underline disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend Code"}
              </button>
            )}
          </p>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          Check your spam folder if you don't see it within a minute.
        </p>
      </div>
    </div>
  );
}