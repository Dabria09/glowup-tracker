import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, Loader2 } from 'lucide-react';
import AvatarPreview from './AvatarPreview';

const SKIN_TONES = ['#fde8d8', '#f5c5a3', '#e8a87c', '#c68642', '#8d5524', '#4a2912'];
const HAIR_COLORS = ['#f5e642', '#e8a87c', '#c68642', '#8b4513', '#2c1a0e', '#1a1a1a', '#e75480', '#9b59b6', '#3498db', '#2ecc71', '#ffffff'];
const OUTFIT_COLORS = ['#e91e8c', '#9c27b0', '#3f51b5', '#2196f3', '#00bcd4', '#4caf50', '#ff9800', '#f44336', '#ff69b4', '#1a1a2e', '#ffffff', '#ffd700'];
const BG_COLORS = ['#1a0a2e', '#0a1a2e', '#0a2e0a', '#2e1a0a', '#2e0a0a', '#0a2e2e', '#1a1a2e', '#2e2e0a', '#13001a', '#001a13'];

const HAIR_STYLES = [
  { id: 'short', label: 'Short', emoji: '🧑' },
  { id: 'long', label: 'Long', emoji: '👩' },
  { id: 'curly', label: 'Curly', emoji: '🌀' },
  { id: 'bun', label: 'Bun', emoji: '🎀' },
  { id: 'ponytail', label: 'Ponytail', emoji: '🐎' },
  { id: 'none', label: 'Bald', emoji: '✨' },
];

const EYE_STYLES = [
  { id: 'normal', label: 'Normal', emoji: '👀' },
  { id: 'cool', label: 'Cool', emoji: '😎' },
  { id: 'stars', label: 'Star', emoji: '🌟' },
  { id: 'hearts', label: 'Hearts', emoji: '💗' },
  { id: 'wink', label: 'Wink', emoji: '😉' },
];

const OUTFIT_STYLES = [
  { id: 'tee', label: 'T-Shirt', emoji: '👕' },
  { id: 'hoodie', label: 'Hoodie', emoji: '🧥' },
  { id: 'dress', label: 'Dress', emoji: '👗' },
  { id: 'jacket', label: 'Jacket', emoji: '🧤' },
];

const ACCESSORIES = [
  { id: 'none', label: 'None', emoji: '❌' },
  { id: 'crown', label: 'Crown', emoji: '👑' },
  { id: 'glasses', label: 'Glasses', emoji: '👓' },
  { id: 'bow', label: 'Bow', emoji: '🎀' },
  { id: 'halo', label: 'Halo', emoji: '😇' },
  { id: 'headphones', label: 'Phones', emoji: '🎧' },
];

const CATEGORIES = [
  { id: 'skin', label: '🎨 Skin' },
  { id: 'hair', label: '💇 Hair' },
  { id: 'eyes', label: '👀 Eyes' },
  { id: 'outfit', label: '👗 Outfit' },
  { id: 'extras', label: '✨ Extras' },
  { id: 'bg', label: '🌈 BG' },
];

const DEFAULT_CONFIG = {
  bg: '#1a0a2e',
  skinTone: '#f5c5a3',
  hairColor: '#2c1a0e',
  hairStyle: 'short',
  eyeStyle: 'normal',
  outfitColor: '#e91e8c',
  outfitStyle: 'tee',
  accessory: 'none',
  blush: false,
};

export default function AvatarBuilder({ profile, setProfile, user }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [activeCategory, setActiveCategory] = useState('skin');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile?.avatar_builder_config) {
      try {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(profile.avatar_builder_config) });
      } catch {}
    }
  }, [profile]);

  const update = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const configStr = JSON.stringify(config);
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { avatar_builder_config: configStr });
    } else if (user) {
      const newProfile = await base44.entities.UserProfile.create({ user_email: user.email, avatar_builder_config: configStr });
      setProfile(newProfile);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ColorPicker = ({ colors, selected, onSelect }) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {colors.map(c => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className="w-9 h-9 rounded-full border-2 transition-transform hover:scale-110"
          style={{ backgroundColor: c, borderColor: selected === c ? '#fff' : 'transparent', boxShadow: selected === c ? '0 0 0 2px #e91e8c' : 'none' }}
        />
      ))}
    </div>
  );

  const OptionGrid = ({ options, selected, onSelect }) => (
    <div className="grid grid-cols-3 gap-2 mt-2">
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onSelect(o.id)}
          className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-semibold transition ${selected === o.id ? 'border-pink-500 bg-pink-500/20 text-white' : 'border-gray-700 bg-gray-800/60 text-gray-400 hover:border-gray-500'}`}
        >
          <span className="text-xl">{o.emoji}</span>
          {o.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col items-center px-4 w-full">
      {/* Preview */}
      <div className="mb-4 drop-shadow-2xl">
        <AvatarPreview config={config} size={160} />
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="mb-4 px-8 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition flex items-center gap-2 disabled:opacity-60"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : '💾'}
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Avatar'}
      </button>

      {/* Category tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto w-full pb-1 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${activeCategory === cat.id ? 'bg-pink-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="w-full max-w-sm bg-[#1e1020] border border-gray-700/50 rounded-2xl p-4 mb-4">
        {activeCategory === 'skin' && (
          <>
            <p className="text-xs text-gray-400 font-semibold mb-1">Skin Tone</p>
            <ColorPicker colors={SKIN_TONES} selected={config.skinTone} onSelect={v => update('skinTone', v)} />
          </>
        )}
        {activeCategory === 'hair' && (
          <>
            <p className="text-xs text-gray-400 font-semibold mb-1">Hair Style</p>
            <OptionGrid options={HAIR_STYLES} selected={config.hairStyle} onSelect={v => update('hairStyle', v)} />
            <p className="text-xs text-gray-400 font-semibold mt-3 mb-1">Hair Color</p>
            <ColorPicker colors={HAIR_COLORS} selected={config.hairColor} onSelect={v => update('hairColor', v)} />
          </>
        )}
        {activeCategory === 'eyes' && (
          <>
            <p className="text-xs text-gray-400 font-semibold mb-1">Eye Style</p>
            <OptionGrid options={EYE_STYLES} selected={config.eyeStyle} onSelect={v => update('eyeStyle', v)} />
          </>
        )}
        {activeCategory === 'outfit' && (
          <>
            <p className="text-xs text-gray-400 font-semibold mb-1">Outfit Style</p>
            <OptionGrid options={OUTFIT_STYLES} selected={config.outfitStyle} onSelect={v => update('outfitStyle', v)} />
            <p className="text-xs text-gray-400 font-semibold mt-3 mb-1">Outfit Color</p>
            <ColorPicker colors={OUTFIT_COLORS} selected={config.outfitColor} onSelect={v => update('outfitColor', v)} />
          </>
        )}
        {activeCategory === 'extras' && (
          <>
            <p className="text-xs text-gray-400 font-semibold mb-1">Accessory</p>
            <OptionGrid options={ACCESSORIES} selected={config.accessory} onSelect={v => update('accessory', v)} />
            <div className="flex items-center gap-3 mt-4">
              <p className="text-xs text-gray-400 font-semibold">Blush</p>
              <button
                onClick={() => update('blush', !config.blush)}
                className={`w-10 h-6 rounded-full transition-colors ${config.blush ? 'bg-pink-500' : 'bg-gray-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white mx-1 transition-transform ${config.blush ? 'translate-x-4' : ''}`} />
              </button>
            </div>
          </>
        )}
        {activeCategory === 'bg' && (
          <>
            <p className="text-xs text-gray-400 font-semibold mb-1">Background Color</p>
            <ColorPicker colors={BG_COLORS} selected={config.bg} onSelect={v => update('bg', v)} />
          </>
        )}
      </div>
    </div>
  );
}