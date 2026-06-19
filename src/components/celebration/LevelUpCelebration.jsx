import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * LevelUpCelebration - Shows celebration modal when user levels up
 * Triggered by levelUpDetected prop or localStorage event
 */
export default function LevelUpCelebration({ levelData, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (levelData && levelData.leveledUp) {
      setVisible(true);
      
      // Trigger confetti explosion
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ec4899', '#a855f7', '#fbbf24', '#f472b6'],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ec4899', '#a855f7', '#fbbf24', '#f472b6'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [levelData]);

  if (!visible || !levelData?.currentLevel) return null;

  const { currentLevel } = levelData;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="relative w-full max-w-md animate-bounce-in" style={{ animation: 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}>
        {/* Celebration Card */}
        <div className="rounded-3xl p-8 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0a18, #2d1b2e)', border: '2px solid rgba(236,72,153,0.5)', boxShadow: '0 0 60px rgba(236,72,153,0.4)' }}>
          
          {/* Glow effect */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(236,72,153,0.2), transparent 70%)' }} />
          
          {/* Close button */}
          <button onClick={() => { setVisible(false); onClose?.(); }} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>

          {/* Content */}
          <div className="relative z-10">
            {/* Level emoji */}
            <div className="text-8xl mb-4 animate-pulse">{currentLevel.emoji}</div>
            
            {/* Title */}
            <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
              🎉 Level Up!
            </h2>
            
            {/* Level name */}
            <p className="text-xl font-semibold text-pink-400 mb-3">
              {currentLevel.name}
            </p>
            
            {/* Description */}
            <p className="text-sm text-gray-300 mb-6">
              {levelData.previousLevel 
                ? `You've advanced from ${levelData.previousLevel}!` 
                : 'Your glow journey continues!'}
            </p>

            {/* Unlock reward */}
            {currentLevel.unlock_reward && (
              <div className="rounded-2xl p-4 mb-6" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <p className="text-xs text-gray-400 mb-1 font-semibold tracking-wider">UNLOCKED</p>
                <p className="text-lg font-bold text-yellow-400">
                  {currentLevel.unlock_emoji} {currentLevel.unlock_reward}
                </p>
                <p className="text-xs text-gray-500 mt-1">({currentLevel.unlock_type})</p>
              </div>
            )}

            {/* Continue button */}
            <button onClick={() => { setVisible(false); onClose?.(); }}
              className="w-full py-3 rounded-full font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
              ✨ Keep Glowing
            </button>
          </div>
        </div>
      </div>

      {/* Inline styles for animation */}
      <style>{`
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(-50px);
          }
          50% {
            transform: scale(1.05) translateY(10px);
          }
          70% {
            transform: scale(0.9) translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-bounce-in {
          animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  );
}