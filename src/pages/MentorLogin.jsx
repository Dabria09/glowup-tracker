import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, Crown, Eye, EyeOff } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import BrandLogo from "@/components/BrandLogo";
import { ACCOUNT_TYPES, completeEmailPasswordSignIn } from "@/lib/authRules";


export default function MentorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const handleSignIn = async () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setError("");
    setLoading(true);
    try {
      const result = await completeEmailPasswordSignIn({
        email,
        password,
        expectedAccountType: ACCOUNT_TYPES.MENTOR,
      });
      window.location.href = result.route || "/mentor-dashboard";
    } catch (err) {
      setError(err.message || "Invalid email or password.");
      setLoading(false);
    }
  };

  const handleApple = () => { localStorage.setItem('ggu_oauth_flow', 'mentor'); base44.auth.loginWithProvider("apple", window.location.origin + "/google-setup?mentor=true&intent=signin"); };
  const handleGoogle = () => { localStorage.setItem('ggu_oauth_flow', 'mentor'); base44.auth.loginWithProvider("google", window.location.origin + "/google-setup?mentor=true&intent=signin"); };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at top, #0f0520 0%, #1a0a18 50%, #0d0610 100%)' }}
    >
      {/* Background glow orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute rounded-full" style={{ width: 500, height: 500, top: -150, left: -100, background: 'radial-gradient(circle, rgba(232,82,109,0.15), transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full" style={{ width: 400, height: 400, bottom: -100, right: -80, background: 'radial-gradient(circle, rgba(241,182,16,0.12), transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo + Title */}
        <div className="text-center mb-8">
          <BrandLogo
            className="w-44 mx-auto mb-4"
            style={{ filter: 'drop-shadow(0 0 20px rgba(232,82,109,0.4))' }}
          />
          <div className="flex items-center justify-center gap-2 mb-1">
            <Crown size={16} className="text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">Mentor Sign In</h1>
          </div>
          <p className="text-sm text-gray-400">Welcome back to your mentor portal</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>

          {/* Apple */}
          <Button
            variant="outline"
            className="w-full h-12 text-sm font-medium bg-white/5 border-white/10 hover:bg-white/10 text-white"
            onClick={handleApple}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.56 1.4-1.32 2.79-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Sign in with Apple
          </Button>

          {/* Google */}
          <Button
            variant="outline"
            className="w-full h-12 text-sm font-medium bg-white/5 border-white/10 hover:bg-white/10 text-white"
            onClick={handleGoogle}
          >
            <GoogleIcon className="w-5 h-5 mr-2" />
            Sign in with Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-3 text-gray-500" style={{ background: 'rgba(13,5,20,0.9)' }}>OR</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="email"
                placeholder="mentor@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</Label>
              <Link to="/forgot-password" className="text-xs text-pink-400 hover:underline">Forgot Password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500"
                onKeyDown={e => e.key === 'Enter' && handleSignIn()}
              />
              <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign In button */}
          <Button
            className="w-full h-12 font-bold text-white border-0"
            onClick={handleSignIn}
            disabled={loading || !email || !password}
            style={{ background: 'linear-gradient(135deg, #e8526d, #f1b610)' }}
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : 'Sign In'}
          </Button>
        </div>

        {/* Apply Now link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have a mentor account?{" "}
          <Link to="/mentor-register" className="text-pink-400 font-semibold hover:underline">Apply Now</Link>
        </p>
      </div>
    </div>
  );
}