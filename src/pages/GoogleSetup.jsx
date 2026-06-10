import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const calculateAgeGroup = (dobStr) => {
  const birthDate = new Date(dobStr);
  const age = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  let ageGroup = "glow_girls";
  if (age >= 5 && age <= 12) ageGroup = "glow_girls";
  else if (age >= 13 && age <= 15) ageGroup = "glow_tweens";
  else if (age >= 16 && age <= 18) ageGroup = "glow_teens";
  else if (age >= 19) ageGroup = "glow_women";
  return { age, ageGroup };
};

export default function GoogleSetup() {
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) { window.location.href = "/register"; return; }

        const u = await base44.auth.me();
        setUser(u);

        // If they already have a DOB set, skip this page
        if (u.date_of_birth) {
          window.location.href = "/onboarding";
          return;
        }
      } catch (e) {
        window.location.href = "/register";
      } finally {
        setChecking(false);
      }
    };
    init();
  }, []);

  const handleContinue = async () => {
    setError("");
    if (!dob) { setError("Please enter your date of birth."); return; }

    const { age, ageGroup } = calculateAgeGroup(dob);
    if (age < 5) { setError("You must be at least 5 years old to join GGU."); return; }
    if (age > 26) { setError("GGU serves girls and young women ages 5 to 26."); return; }

    setLoading(true);
    try {
      const requiresParentalConsent = age < 13;
      await base44.auth.updateMe({
        date_of_birth: dob,
        age,
        age_group: ageGroup,
        account_type: "girl",
        isDeleted: false,
        requires_parental_consent: requiresParentalConsent,
        parental_consent_confirmed: !requiresParentalConsent,
      });

      if (requiresParentalConsent) {
        window.location.href = "/parent-consent";
      } else {
        window.location.href = "/onboarding";
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a18 40%, #0d0610 100%)' }}>
        <div className="w-8 h-8 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a18 40%, #0d0610 100%)' }}>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <img src="https://gguapp.com/manus-storage/ggu-logo-glow_54cb14fa.png" alt="GGU" className="w-40 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Almost There! ✨</h1>
          <p className="text-sm text-gray-400">
            Hi {user?.full_name?.split(" ")[0] || "there"}! We just need your date of birth to get you set up.
          </p>
        </div>

        <div className="rounded-3xl p-6 space-y-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date of Birth</Label>
            <Input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              className="h-12 bg-white/5 border-white/10 text-white"
            />
            <p className="text-xs text-gray-500">GGU serves girls and young women ages 5 to 26.</p>
          </div>

          <Button
            className="w-full h-12 font-bold text-white border-0"
            onClick={handleContinue}
            disabled={loading || !dob}
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Setting up...</> : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}