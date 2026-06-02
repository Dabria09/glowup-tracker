import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Global Glow Points hook — single source of truth.
 * Returns totalPoints (number) or null while loading.
 * Usage: const totalPoints = useGlowPoints(user?.email);
 */
export default function useGlowPoints(userEmail) {
  const [totalPoints, setTotalPoints] = useState(null);

  useEffect(() => {
    if (!userEmail) return;
    base44.entities.UserPoints.filter({ user_email: userEmail })
      .then(pts => setTotalPoints(pts.length ? (pts[0].total_points || 0) : 0))
      .catch(() => setTotalPoints(0));
  }, [userEmail]);

  return totalPoints;
}