import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import {
  calculateGirlAgeGroup,
  hasMentorAccount,
  isMentorModeActive,
  loadCurrentUserRecord,
  loadMentorEntityByEmail,
  getMentorTrack,
  saveCurrentUserRecord,
} from "@/lib/authRules";
import { buildOAuthPrefill, saveMentorOAuthPrefill, waitForOAuthUser } from "@/lib/oauthPrefill";

export default function GoogleSetup() {
  const isMentor = new URLSearchParams(window.location.search).get("mentor") === "true";
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await waitForOAuthUser(async () => {
          const authed = await base44.auth.isAuthenticated();
          if (!authed) return null;
          return base44.auth.me();
        });

        if (!u) { window.location.href = isMentor ? "/mentor-register" : "/register"; return; }
        setUser(u);
        if (isMentor) saveMentorOAuthPrefill(buildOAuthPrefill(u));

        if (isMentor) {
          const userRecord = await loadCurrentUserRecord(u);
          const mergedUser = { ...u, ...userRecord };
          const mentorEntity = hasMentorAccount(mergedUser) ? null : await loadMentorEntityByEmail(mergedUser.email);
          if (isMentorModeActive(mergedUser) || mentorEntity) {
            window.location.href = "/mentor-dashboard";
            return;
          }
        }

        // If they already have a DOB set, skip this page
        if (u.date_of_birth) {
          if (isMentor) saveMentorOAuthPrefill(buildOAuthPrefill(u, { dateOfBirth: u.date_of_birth }));
          window.location.href = isMentor ? "/mentor-register?oauth=1" : "/onboarding";
          return;
        }
      } catch (e) {
        window.location.href = isMentor ? "/mentor-register" : "/register";
      } finally {
        setChecking(false);
      }
    };
    init();
  }, []);

  const handleContinue = async () => {
    setError("");
    if (!dob) { setError("Please enter your date of birth."); return; }

    const { age, ageGroup } = calculateGirlAgeGroup(dob);

    setLoading(true);
    try {
      if (isMentor) {
        const mentorType = getMentorTrack(age);
        if (!mentorType) { setError("You must be at least 13 to apply as a mentor."); setLoading(false); return; }
        const prefill = buildOAuthPrefill(user, { dateOfBirth: dob, mentorType });
        const identityFields = {
          ...(prefill.fullName ? { full_name: prefill.fullName } : {}),
          ...(prefill.avatarUrl ? { avatar_url: prefill.avatarUrl } : {}),
        };
        saveMentorOAuthPrefill(prefill);
        await saveCurrentUserRecord(user, {
          ...identityFields,
          date_of_birth: dob,
          age,
          age_group: ageGroup,
          account_type: "mentor",
          mentor_type: mentorType,
          mentor_status: "pending",
          isDeleted: false,
          created_at: new Date().toISOString(),
        });
        window.location.href = "/mentor-register?oauth=1";
      } else {
        if (!ageGroup) { setError("You must be at least 10 years old to join GGU."); setLoading(false); return; }
        const requiresParentalConsent = age < 13;
        const prefill = buildOAuthPrefill(user, { dateOfBirth: dob });
        const identityFields = {
          ...(prefill.fullName ? { full_name: prefill.fullName } : {}),
          ...(prefill.avatarUrl ? { avatar_url: prefill.avatarUrl } : {}),
        };
        await saveCurrentUserRecord(user, {
          ...identityFields,
          date_of_birth: dob,
          age,
          age_group: ageGroup,
          account_type: "girl",
          isDeleted: false,
          requires_parental_consent: requiresParentalConsent,
          parental_consent_confirmed: !requiresParentalConsent,
          created_at: new Date().toISOString(),
        });
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
          <BrandLogo alt="GGU" />
          <h1 className="text-2xl font-bold text-white mb-2">Almost There! ✨</h1>
          <p className="text-sm text-gray-400">
            Hi {user?.full_name?.split(" ")[0] || "there"}! Your Google info has been pre-filled. Just confirm your date of birth.
          </p>
        </div>

        <div className="rounded-3xl p-6 space-y-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>
          )}

          {/* Pre-filled Google info — read only */}
          <div className="p-3 rounded-xl space-y-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">From your Google account</p>
            <div className="flex items-center gap-3">
              {user?.avatar_url && <img src={user.avatar_url} alt="Google avatar" className="w-10 h-10 rounded-full object-cover" />}
              <div>
                <p className="text-sm font-semibold text-white">{user?.full_name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date of Birth *</Label>
            <Input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              className="h-12 bg-white/5 border-white/10 text-white"
            />
            <p className="text-xs text-gray-500">{isMentor ? "Mentors must be at least 13 years old." : "Must be at least 10 years old. Under 13 requires parental consent."}</p>
          </div>

          <Button
            className="w-full h-12 font-bold text-white border-0"
            onClick={handleContinue}
            disabled={loading || !dob}
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Setting up...</> : 'Complete Sign Up'}
          </Button>
        </div>
      </div>
    </div>
  );
}