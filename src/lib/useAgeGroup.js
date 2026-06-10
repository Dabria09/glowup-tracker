/**
 * useAgeGroup
 * Reads the current user's age_group from their UserProfile and provides:
 *  - ageGroup  : 'glow_girls' | 'glow_teens' | 'glow_women' | null
 *  - worldInfo : { label, desc, color, emoji, bgColor }
 *  - filterForWorld(items, field?) : filters an array to only items matching this age group
 *  - isLoading
 *
 * Age groups (set during onboarding via StepDOB):
 *   glow_girls  → ages 10-13
 *   glow_teens  → ages 14-19
 *   glow_women  → ages 20+
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const WORLD_INFO = {
  glow_girls: {
    label: 'Glow Girls World',
    desc: 'Ages 10–13',
    emoji: '🌱',
    color: '#10b981',
    bgColor: 'rgba(16,185,129,0.12)',
    borderColor: 'rgba(16,185,129,0.35)',
  },
  glow_teens: {
    label: 'Glow Teens World',
    desc: 'Ages 14–19',
    emoji: '🌸',
    color: '#e8526d',
    bgColor: 'rgba(232,82,109,0.12)',
    borderColor: 'rgba(232,82,109,0.35)',
  },
  glow_women: {
    label: 'Glow Women World',
    desc: 'Ages 20+',
    emoji: '👑',
    color: '#a855f7',
    bgColor: 'rgba(168,85,247,0.12)',
    borderColor: 'rgba(168,85,247,0.35)',
  },
};

// Module-level cache keyed by user email so it auto-busts on account switch/login
let _cachedAgeGroup = null;
let _cachedEmail = null;

export default function useAgeGroup() {
  const [ageGroup, setAgeGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      // If the logged-in user changed, clear the old cache
      if (_cachedEmail !== u.email) {
        _cachedAgeGroup = null;
        _cachedEmail = u.email;
      }
      if (_cachedAgeGroup) {
        setAgeGroup(_cachedAgeGroup);
        setIsLoading(false);
        return;
      }
      const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
      const group = profiles[0]?.age_group || u.age_group || null;
      _cachedAgeGroup = group;
      setAgeGroup(group);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  /**
   * Filters an array of records to only those matching the current user's age group.
   * @param {Array} items - Array of objects
   * @param {string} field - The field name that stores age_group (default: 'age_group')
   * @returns {Array} filtered items, or all items if no age group is set (graceful fallback)
   */
  const filterForWorld = (items = [], field = 'age_group') => {
    if (!ageGroup) return items; // not loaded yet → show everything gracefully
    return items.filter(item => !item[field] || item[field] === ageGroup);
  };

  return {
    ageGroup,
    worldInfo: ageGroup ? WORLD_INFO[ageGroup] : null,
    WORLD_INFO,
    filterForWorld,
    isLoading,
  };
}

/**
 * Helper to get age group from a DOB string or age number (for non-hook contexts)
 */
export function getAgeGroup(ageOrDob) {
  let age = ageOrDob;
  if (typeof ageOrDob === 'string' && ageOrDob.includes('-')) {
    const today = new Date();
    const birth = new Date(ageOrDob);
    age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  }
  if (age >= 10 && age <= 13) return 'glow_girls';
  if (age >= 14 && age <= 19) return 'glow_teens';
  if (age >= 20) return 'glow_women';
  return null;
}