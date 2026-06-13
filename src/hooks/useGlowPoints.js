/**
 * useGlowPoints — returns the current user's total points from the global UserContext.
 * This ensures the same value is shown everywhere in the app without extra fetches.
 * Falls back to a direct fetch if called outside UserProvider (shouldn't happen).
 */
import { useUserContext } from '@/lib/UserContext';

export default function useGlowPoints() {
  const { totalPoints } = useUserContext();
  return totalPoints;
}