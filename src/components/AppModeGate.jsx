import React, { useState, useEffect, useCallback } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ACCOUNT_TYPES,
  getAccountType,
  hasMentorAccount,
  isAdminUser,
  isMentorModeActive,
  isDeletedAccount,
  loadCurrentUserRecord,
  loadMentorEntityByEmail,
} from "@/lib/authRules";
import { Sparkles, Crown, Loader2, LogOut, ShieldAlert, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function AppModeGate() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const loadUser = useCallback(async () => {
    try {
      const authUser = await base44.auth.me();
      const userRecord = await loadCurrentUserRecord(authUser);
      // Don't kick out users just because their User entity row doesn't exist yet
      // (new OAuth signups mid-setup). Only reject explicitly deleted accounts.
      if (userRecord && isDeletedAccount(userRecord)) {
        setUser(null);
        return;
      }
      const u = { ...authUser, ...(userRecord || {}) };

      // Admins skip ALL mentor/onboarding processing — return immediately
      if (isAdminUser(u)) {
        setUser(u);
        return;
      }

      let mentorEntity = null;
      // Only attempt mentor promotion if the account is not already explicitly set to 'girl'.
      // This prevents stale Mentor entity records from overriding a legitimate community user.
      const explicitlyGirl = u.account_type === ACCOUNT_TYPES.GIRL;
      if (!hasMentorAccount(u) && !explicitlyGirl) {
        mentorEntity = await loadMentorEntityByEmail(u.email);
        // loadMentorEntityByEmail already only returns approved mentors.
        if (mentorEntity) {
          u.account_type = ACCOUNT_TYPES.MENTOR;
          u.mentor_status = "approved";
          u.mentor_type = u.mentor_type || mentorEntity.mentor_type || mentorEntity.type;
        }
      }

      // Sync onboarding_complete and parental consent from UserProfile into the user object
      if (getAccountType(u) === ACCOUNT_TYPES.GIRL && u.role !== "admin") {
        try {
          const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
          if (profiles.length > 0) {
            const p = profiles[0];
            u.onboarding_complete = p.onboarding_complete || false;
            // Teen requires admin consent approval before access is granted
            u.requires_parental_consent = p.parental_consent_sent && !p.admin_consent_approved;
            u.parental_consent_confirmed = p.admin_consent_approved || false;
          }
        } catch {}
      }

      // If user has mentor account type but status not yet approved, sync from DB
      // (skip if account was explicitly girl — we never want to re-promote them)
      if (!explicitlyGirl && hasMentorAccount(u) && u.mentor_status !== "approved") {
        try {
          mentorEntity = mentorEntity || await loadMentorEntityByEmail(u.email);
          if (mentorEntity) {
            await base44.auth.updateMe({ mentor_status: "approved" });
            u.mentor_status = "approved";
          }
        } catch {}
      }

      setUser(u);
    } catch (err) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadUser().finally(() => setLoading(false));
  }, [location.pathname]);

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    await loadUser();
    setRefreshing(false);
  };

  const handleToggleMode = async () => {
    if (!user || user.account_type !== "linked") return;
    const nextMode = user.active_mode === "mentor" ? "girl" : "mentor";
    await base44.auth.updateMe({ active_mode: nextMode });
    setUser({ ...user, active_mode: nextMode });
    navigate(nextMode === "mentor" ? "/mentor-dashboard" : "/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admins always get full access — skip ALL role/mentor/onboarding gates
  if (isAdminUser(user)) {
    if (location.pathname === "/dashboard") {
      return <Navigate to="/admin" replace />;
    }

    return (
      <div className="min-h-screen bg-[#0d0608] text-white relative z-10">
        <Outlet />
      </div>
    );
  }

  const mentorModeActive = isMentorModeActive(user);

  // Suspended Mentor
  if (mentorModeActive && user.mentor_status === "suspended") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-white text-center">
        <div className="w-20 h-20 bg-red-500/15 border border-red-500/30 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Account Restricted</h1>
        <p className="text-gray-400 max-w-sm mb-6 text-sm">
          Your mentor status has been temporarily suspended. Please contact our support team.
        </p>
        <Button onClick={() => base44.auth.logout("/")} variant="destructive" className="w-full max-w-xs h-12 rounded-xl font-bold">
          <LogOut size={16} className="mr-2" /> Sign Out
        </Button>
      </div>
    );
  }

  // ── Onboarding Gate ──────────────────────────────────────────────────────
  // Girl accounts must have completed onboarding before accessing the app.
  // Exception: minors (age < 13) who are waiting on parental consent get a
  // dedicated waiting screen instead of being bounced to /onboarding.
  if (getAccountType(user) === ACCOUNT_TYPES.GIRL && user.role !== "admin" && !mentorModeActive) {
    const onboardingComplete = user.onboarding_complete;
    const requiresConsent = user.requires_parental_consent === true;
    const consentGiven = user.parental_consent_confirmed === true;

    if (requiresConsent && !consentGiven) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-white text-center" style={{ background: '#0d0608' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(241,182,16,0.12)', border: '1px solid rgba(241,182,16,0.3)' }}>
            <Clock className="w-10 h-10 text-yellow-400 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Awaiting Consent Verification ✨</h1>
          <p className="text-gray-400 max-w-sm mb-6 text-sm">
            A consent email was sent to your parent or guardian. Our safety team will verify and approve your account once parental consent is confirmed.
          </p>
          <div className="rounded-2xl p-4 max-w-sm mb-6 text-xs text-left" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="font-bold text-gray-200 block mb-1">What happens next?</span>
            <p className="text-gray-400">Ask your parent to check their email (and spam folder). Once they respond, our team will review and activate your account — usually within 24 hours.</p>
          </div>
          <Button
            onClick={handleRefreshStatus}
            disabled={refreshing}
            className="w-full max-w-xs h-12 rounded-xl font-bold mb-3"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <RefreshCw size={16} className={`mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Checking..." : "Check Approval Status"}
          </Button>
          <Button onClick={() => base44.auth.logout("/")} variant="destructive" className="w-full max-w-xs h-12 rounded-xl font-bold">
            <LogOut size={16} className="mr-2" /> Sign Out
          </Button>
        </div>
      );
    }

    if (!onboardingComplete) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  // Security Routing Gates
  const isMentorPath = location.pathname.startsWith("/mentor-");
  const isGirlPath = ["/dashboard", "/discover", "/glow", "/connect", "/me"].some(p => location.pathname.startsWith(p));

  if (mentorModeActive && isGirlPath) return <Navigate to="/mentor-dashboard" replace />;
  if (user.account_type === "girl" && isMentorPath && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  if (user.account_type === "linked") {
    if (user.active_mode === "mentor" && isGirlPath) return <Navigate to="/mentor-dashboard" replace />;
    if (user.active_mode === "girl" && isMentorPath) return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${mentorModeActive ? "bg-[#0c0414] text-purple-100" : "bg-[#0d0608] text-white"}`}>
      {mentorModeActive && (
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent pointer-events-none z-0" />
      )}

      {user.account_type === "linked" && (
        <div className="sticky top-0 z-50 w-full flex items-center justify-between px-5 py-3 border-b"
          style={{
            background: mentorModeActive ? "rgba(12, 4, 20, 0.9)" : "rgba(13, 6, 8, 0.9)",
            borderColor: mentorModeActive ? "rgba(168, 85, 247, 0.15)" : "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)"
          }}>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {mentorModeActive ? "👑 Pro Dashboard" : "✨ Member View"}
          </span>
          <button onClick={handleToggleMode} className="relative flex items-center gap-1.5 p-1 rounded-full border transition"
            style={{
              background: mentorModeActive ? "rgba(168, 85, 247, 0.15)" : "rgba(236, 72, 153, 0.15)",
              borderColor: mentorModeActive ? "rgba(168, 85, 247, 0.4)" : "rgba(236, 72, 153, 0.4)"
            }}>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${mentorModeActive ? "bg-purple-600 text-white shadow" : "text-gray-400"}`}>
              <Crown size={12} /><span>Mentor Mode</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${!mentorModeActive ? "bg-pink-600 text-white shadow" : "text-gray-400"}`}>
              <Sparkles size={12} /><span>GGU Mode</span>
            </div>
          </button>
        </div>
      )}

      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}