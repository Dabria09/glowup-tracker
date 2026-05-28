import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const AESTHETIC_ICONS = [
  // Celestial / Nature
  { id: 'moon_glow', emoji: '🌙', label: 'Moon Glow', bg: 'linear-gradient(135deg,#1e1b4b,#4c1d95)', accent: '#a78bfa' },
  { id: 'star_field', emoji: '⭐', label: 'Star Field', bg: 'linear-gradient(135deg,#0f172a,#1e3a5f)', accent: '#93c5fd' },
  { id: 'rose_bloom', emoji: '🌹', label: 'Rose Bloom', bg: 'linear-gradient(135deg,#4c0519,#881337)', accent: '#fb7185' },
  { id: 'cherry_blossom', emoji: '🌸', label: 'Cherry Blossom', bg: 'linear-gradient(135deg,#831843,#9d174d)', accent: '#f9a8d4' },
  { id: 'sunflower', emoji: '🌻', label: 'Sunflower', bg: 'linear-gradient(135deg,#713f12,#92400e)', accent: '#fbbf24' },
  { id: 'butterfly', emoji: '🦋', label: 'Butterfly', bg: 'linear-gradient(135deg,#5b21b6,#7c3aed)', accent: '#c084fc' },
  // Vibes
  { id: 'crown_queen', emoji: '👑', label: 'Crown Queen', bg: 'linear-gradient(135deg,#78350f,#b45309)', accent: '#fcd34d' },
  { id: 'diamond', emoji: '💎', label: 'Diamond', bg: 'linear-gradient(135deg,#0c4a6e,#075985)', accent: '#7dd3fc' },
  { id: 'fire_spirit', emoji: '🔥', label: 'Fire Spirit', bg: 'linear-gradient(135deg,#7f1d1d,#b91c1c)', accent: '#f97316' },
  { id: 'lightning', emoji: '⚡', label: 'Lightning', bg: 'linear-gradient(135deg,#1c1917,#292524)', accent: '#facc15' },
  { id: 'peacock', emoji: '🦚', label: 'Peacock', bg: 'linear-gradient(135deg,#064e3b,#065f46)', accent: '#34d399' },
  { id: 'galaxy', emoji: '🌌', label: 'Galaxy', bg: 'linear-gradient(135deg,#1e1b4b,#312e81)', accent: '#818cf8' },
  // Soft / Aesthetic
  { id: 'cloud_nine', emoji: '☁️', label: 'Cloud Nine', bg: 'linear-gradient(135deg,#1e3a5f,#1e40af)', accent: '#bfdbfe' },
  { id: 'crystal_ball', emoji: '🔮', label: 'Crystal Ball', bg: 'linear-gradient(135deg,#4a044e,#701a75)', accent: '#e879f9' },
  { id: 'rainbow', emoji: '🌈', label: 'Rainbow', bg: 'linear-gradient(135deg,#1e1b4b,#4c1d95)', accent: '#e879f9' },
  { id: 'lotus', emoji: '🪷', label: 'Lotus', bg: 'linear-gradient(135deg,#500724,#881337)', accent: '#fda4af' },
  // Confidence / Power
  { id: 'comet', emoji: '☄️', label: 'Comet', bg: 'linear-gradient(135deg,#0c0a09,#1c1917)', accent: '#f5f5f4' },
  { id: 'dove', emoji: '🕊️', label: 'Dove', bg: 'linear-gradient(135deg,#172554,#1e3a8a)', accent: '#e0f2fe' },
  { id: 'magic_wand', emoji: '🪄', label: 'Magic Wand', bg: 'linear-gradient(135deg,#2e1065,#4c1d95)', accent: '#ddd6fe' },
  { id: 'infinity', emoji: '♾️', label: 'Infinity', bg: 'linear-gradient(135deg,#042f2e,#134e4a)', accent: '#5eead4' },
];

export default function AestheticIconPicker({ selectedIcon, onSelect }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-4 text-center">Tap an icon to set as your profile picture</p>
      <div className="grid grid-cols-4 gap-3">
        {AESTHETIC_ICONS.map((icon, i) => {
          const isSelected = selectedIcon === icon.id;
          return (
            <motion.button
              key={icon.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(icon)}
              className="relative flex flex-col items-center gap-1.5 rounded-2xl p-2 pt-3 transition-all"
              style={{
                background: isSelected ? icon.bg : 'rgba(255,255,255,0.05)',
                border: isSelected ? `1.5px solid ${icon.accent}` : '1.5px solid rgba(255,255,255,0.08)',
                boxShadow: isSelected ? `0 0 20px ${icon.accent}40` : 'none',
              }}
            >
              {/* Emoji in a circle */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: isSelected ? 'rgba(255,255,255,0.15)' : icon.bg }}
              >
                {icon.emoji}
              </div>
              <span className="text-[9px] text-gray-400 font-medium text-center leading-tight">{icon.label}</span>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: icon.accent }}
                >
                  <Check size={10} className="text-white" strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export { AESTHETIC_ICONS };