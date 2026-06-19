import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * useGlowLevel - Calculates user's current Glow Level based on total points
 * and checks against GlowLevel entity thresholds in real-time.
 * 
 * @param {string} userEmail - Current user's email
 * @returns {Object} - { currentLevel, nextLevel, progress, allLevels }
 */
export default function useGlowLevel(userEmail) {
  const [currentLevel, setCurrentLevel] = useState(null);
  const [nextLevel, setNextLevel] = useState(null);
  const [progress, setProgress] = useState({ pointsInLevel: 0, pointsNeeded: 0, percentage: 0 });
  const [allLevels, setAllLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    loadLevels();
  }, [userEmail]);

  const loadLevels = async () => {
    setLoading(true);
    try {
      // Fetch Glow Levels from database
      const levels = await base44.entities.GlowLevel.filter({ is_active: true }, 'level_number');
      setAllLevels(levels);

      // Fetch user's total points
      const userPoints = await base44.entities.UserPoints.filter({ user_email: userEmail });
      const totalPoints = userPoints.length ? (userPoints[0].total_points || 0) : 0;

      // Find current level
      const current = levels.find(lvl => totalPoints >= (lvl.min_points || 0) && totalPoints < (lvl.max_points || Infinity));
      const currentOrFirst = current || levels[0];
      setCurrentLevel(currentOrFirst);

      // Find next level
      const nextIdx = levels.findIndex(lvl => lvl.id === currentOrFirst?.id);
      const next = levels[nextIdx + 1];
      setNextLevel(next || null);

      // Calculate progress
      if (currentOrFirst) {
        const minPts = currentOrFirst.min_points || 0;
        const maxPts = currentOrFirst.max_points === 99999 ? Infinity : (currentOrFirst.max_points || 100);
        const pointsInLevel = totalPoints - minPts;
        const pointsNeeded = maxPts === Infinity ? 1 : maxPts - minPts;
        const percentage = maxPts === Infinity ? 100 : Math.min(100, (pointsInLevel / pointsNeeded) * 100);
        
        setProgress({
          pointsInLevel,
          pointsNeeded,
          percentage,
          totalPoints,
        });
      }
    } catch (error) {
      console.error('Failed to load glow levels:', error);
    }
    setLoading(false);
  };

  return { currentLevel, nextLevel, progress, allLevels, loading, refresh: loadLevels };
}