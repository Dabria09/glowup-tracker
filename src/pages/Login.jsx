import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, Crown } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const calculateAgeGroup = (dobStr) => {
    if (!dobStr) return { age: 0, ageGroup: "glow_girls" };
    const birthDate = new Date(dobStr);
    const ageDiff = Date.now() - birthDate.getTime();
    const age = Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
    if (age >= 5 && age <= 12) return { age, ageGroup: "glow_girls" };
    if (age >= 13 && age <= 15) return { age, ageGroup: "glow_tweens" };
    if (age >= 16 && age <= 18) return { age, ageGroup: "glow_teens" };
    return { age, ageGroup: "glow_women" };
  };

  const handleSignIn = async () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setError("");
    setLoading(true);
    try {
      // 1. Login
      await base44.auth.loginViaEmailPassword(email, password);
      // 2. Get user
      const currentUser = await base44.auth.me();
      if (!currentUser) throw new Error("Failed to load user session.");

      // For admin accounts, skip extra checks and go straight to dashboard
      if (currentUser.role === 'admin') {
        window.location.href = "/dashboard";
        return;
      }

      // 3. Check user record
      const profiles = await base44.entities.UserProfile.filter({ user_email: currentUser.email });

      // 4. Check isDeleted
      if (currentUser.isDeleted === true) {
        await base44.auth.logout();
        localStorage.clear();
        sessionStorage.clear();
        setError("This account has been deleted. Please create a new account.");
        setLoading(false);
        return;
      }

      // 5. Check account_type === 'girl'
      if (currentUser.account_type === "mentor") {
        await base44.auth.logout();
        setError("This email is registered as a mentor account. Please use Mentor Sign In.");
        setLoading(false);
        return;
      }

      // 6. Check parental consent for minors
      if (currentUser.requires_parental_consent === true && currentUser.parental_consent_confirmed !== true) {
        await base44.auth.logout();
        setError("Your account is awaiting parental consent before it can be accessed.");
        setLoading(false);
        return;
      }

      // 7. Recalculate age group dynamically on each login
      if (currentUser.date_of_birth) {
        const { age, ageGroup } = calculateAgeGroup(currentUser.date_of_birth);
        await base44.auth.updateMe({ age, age_group: ageGroup });
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back ✨</h1>
          <p className="text-sm text-gray-400">Sign in to continue your glow journey</p>
        </div>

        <div className="rounded-3xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>
          <Button variant="outline" className="w-full h-12 text-sm font-medium bg-white/5 border-white/10 hover:bg-white/10 text-white"
            onClick={() => base44.auth.loginWithProvider("apple", "/dashboard")}>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.56 1.4-1.32 2.79-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            Sign in with Apple
          </Button>
          <Button variant="outline" className="w-full h-12 text-sm font-medium bg-white/5 border-white/10 hover:bg-white/10 text-white"
            onClick={() => base44.auth.loginWithProvider("google", "/dashboard")}>
            <GoogleIcon className="w-5 h-5 mr-2" />
            Sign in with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="px-3 text-gray-500" style={{ background: 'rgba(26,10,24,0.9)' }}>OR</span></div>
          </div>

          {error && <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>}

          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input type="email" autoFocus placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</Label>
                <Link to="/forgot-password" className="text-xs text-pink-400 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500"
                  onKeyDown={e => e.key === 'Enter' && handleSignIn()} />
              </div>
            </div>
            <Button className="w-full h-12 font-bold text-white border-0" onClick={handleSignIn} disabled={loading}
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : 'Sign In'}
            </Button>
          </div>

          <div className="mt-4 p-3 rounded-2xl" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <p className="text-xs text-purple-300 font-semibold mb-1 flex items-center gap-1"><Crown size={12} /> Are you a mentor?</p>
            <div className="flex gap-3">
              <Link to="/mentor-login" className="text-xs text-purple-400 hover:underline">Sign in →</Link>
              <span className="text-gray-600">|</span>
              <Link to="/mentor-register" className="text-xs text-purple-400 hover:underline">Apply Now →</Link>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-pink-400 font-semibold hover:underline">Join the Sisterhood</Link>
        </p>
      </div>
    </div>
  );
}