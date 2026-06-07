import React, { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Sparkles, Crown, Loader2, LogOut, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppModeGate() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [location.pathname]);

  const handleToggleMode = async () => {
    if (!user || user.account_type !== "linked") return;
    const nextMode = user.active_mode === "mentor" ? "girl" : "mentor";
    
    await base44.auth.updateMe({ active_mode: nextMode });
    setUser({ ...user, active_mode: nextMode });
    
    if (nextMode === "mentor") {
      navigate("/mentor-dashboard");
    } else {
      navigate("/dashboard");
    }
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

  // Pending Mentor Check
  if (user.account_type === "mentor" && user.mentor_status === "pending") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-white text-center">
        <div className="w-20 h-20 bg-yellow-500/15 border border-yellow-500/30 rounded-full flex items-center justify-center mb-6">
          <Clock className="w-10 h-10 text-yellow-400 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Application Pending Review ✨</h1>
        <p className="text-gray-400 max-w-sm mb-6 text-sm">
          Welcome, {user.full_name || "Mentor"}! Our admin team is currently reviewing your ID verification and professional credentials.
        </p>
        <div className="rounded-2xl p-4 bg-white/5 border border-white/10 text-xs text-left max-w-sm mb-6">
          <span className="font-bold text-gray-200 block mb-1">Estimated Vetting Time</span>
          <p className="text-gray-400">Applications are typically vetted within 3-5 business days. You will receive an email confirmation once approved.</p>
        </div>
        <Button onClick={() => base44.auth.logout("/")} variant="destructive" className="w-full max-w-xs h-12 rounded-xl font-bold">
          <LogOut size={16} className="mr-2" /> Sign Out
        </Button>
      </div>
    );
  }

  // Suspended Mentor Check
  if (user.account_type === "mentor" && user.mentor_status === "suspended") {
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

  // Security Routing Gates
  const isMentorPath = location.pathname.startsWith("/mentor-");
  const isGirlPath = ["/dashboard", "/discover", "/glow", "/connect", "/me"].some(p => location.pathname.startsWith(p));

  if (user.account_type === "mentor" && isGirlPath) {
    return <Navigate to="/mentor-dashboard" replace />;
  }
  if (user.account_type === "girl" && isMentorPath) {
    return <Navigate to="/dashboard" replace />;
  }
  if (user.account_type === "linked") {
    if (user.active_mode === "mentor" && isGirlPath) {
      return <Navigate to="/mentor-dashboard" replace />;
    }
    if (user.active_mode === "girl" && isMentorPath) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  const isMentorModeActive = user.account_type === "mentor" || (user.account_type === "linked" && user.active_mode === "mentor");

  return (
    <div className={`min-h-screen transition-all duration-300 ${isMentorModeActive ? "bg-[#0c0414] text-purple-100" : "bg-[#0d0608] text-white"}`}>
      {isMentorModeActive && (
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent pointer-events-none z-0" />
      )}

      {user.account_type === "linked" && (
        <div className="sticky top-0 z-50 w-full flex items-center justify-between px-5 py-3 border-b"
          style={{
            background: isMentorModeActive ? "rgba(12, 4, 20, 0.9)" : "rgba(13, 6, 8, 0.9)",
            borderColor: isMentorModeActive ? "rgba(168, 85, 247, 0.15)" : "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)"
          }}>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {isMentorModeActive ? "👑 Pro Dashboard" : "✨ Member View"}
          </span>

          <button onClick={handleToggleMode} className="relative flex items-center gap-1.5 p-1 rounded-full border transition"
            style={{
              background: isMentorModeActive ? "rgba(168, 85, 247, 0.15)" : "rgba(236, 72, 153, 0.15)",
              borderColor: isMentorModeActive ? "rgba(168, 85, 247, 0.4)" : "rgba(236, 72, 153, 0.4)"
            }}>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isMentorModeActive ? "bg-purple-600 text-white shadow" : "text-gray-400"}`}>
              <Crown size={12} />
              <span>Mentor Mode</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${!isMentorModeActive ? "bg-pink-600 text-white shadow" : "text-gray-400"}`}>
              <Sparkles size={12} />
              <span>GGU Mode</span>
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