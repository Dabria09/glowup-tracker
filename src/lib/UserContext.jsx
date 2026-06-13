/**
 * UserContext — single source of truth for the current user's profile and points.
 * Provides: profile (UserProfile entity), totalPoints (number), username (string), refreshProfile(), refreshPoints()
 * Uses real-time subscriptions so all components stay in sync automatically.
 */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [userEmail, setUserEmail] = useState(null);
  const [profile, setProfile] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load the current user's email once
  useEffect(() => {
    base44.auth.me()
      .then(u => { if (u?.email) setUserEmail(u.email); })
      .catch(() => {});
  }, []);

  const refreshProfile = useCallback(async (email) => {
    const e = email || userEmail;
    if (!e) return;
    try {
      const profiles = await base44.entities.UserProfile.filter({ user_email: e });
      setProfile(profiles[0] || null);
    } catch {}
    setProfileLoaded(true);
  }, [userEmail]);

  const refreshPoints = useCallback(async (email) => {
    const e = email || userEmail;
    if (!e) return;
    try {
      const pts = await base44.entities.UserPoints.filter({ user_email: e });
      setTotalPoints(pts[0]?.total_points || 0);
    } catch {}
  }, [userEmail]);

  // Initial load + real-time subscription
  useEffect(() => {
    if (!userEmail) return;
    refreshProfile(userEmail);
    refreshPoints(userEmail);

    // Subscribe to UserProfile changes
    const unsubProfile = base44.entities.UserProfile.subscribe((event) => {
      if (event.data?.user_email === userEmail || event.type === 'update') {
        refreshProfile(userEmail);
      }
    });

    // Subscribe to UserPoints changes
    const unsubPoints = base44.entities.UserPoints.subscribe((event) => {
      if (event.data?.user_email === userEmail || event.type === 'update') {
        refreshPoints(userEmail);
      }
    });

    return () => {
      unsubProfile();
      unsubPoints();
    };
  }, [userEmail]);

  // Derive username: UserProfile.username → auth full_name prefix → email prefix
  const username = profile?.username || null;

  return (
    <UserContext.Provider value={{
      profile,
      totalPoints,
      username,
      userEmail,
      profileLoaded,
      refreshProfile: () => refreshProfile(userEmail),
      refreshPoints: () => refreshPoints(userEmail),
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUserContext must be used inside UserProvider');
  return ctx;
}