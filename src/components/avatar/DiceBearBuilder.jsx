import { useState, useEffect } from 'react';
import { Shuffle, Save, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SKIN_COLORS = [
  { label: 'Light', value: 'ffdbb4' },
  { label: 'Pale', value: 'edb98a' },
  { label: 'Mellow', value: 'd08b5b' },
  { label: 'Wheat', value: 'ae5d29' },
  { label: 'Brown', value: '614335' },
  { label: 'Dark Brown', value: '4a312c' },
];

const HAIR_STYLES = [
  { label: 'Big Hair', value: 'bigHair' },
  { label: 'Bob', value: 'bob' },
  { label: 'Bun', value: 'bun' },
  { label: 'Curly', value: 'curly' },
  { label: 'Curvy', value: 'curvy' },
  { label: 'Dreads', value: 'dreads' },
  { label: 'Frida', value: 'frida' },
  { label: 'Frizzle', value: 'frizzle' },
  { label: 'Fro', value: 'fro' },
  { label: 'Fro Band', value: 'froBand' },
  { label: 'Hat', value: 'hat' },
  { label: 'Hijab', value: 'hijab' },
  { label: 'Long Curvy', value: 'longButNotTooLong' },
  { label: 'Mia Wallace', value: 'miaWallace' },
  { label: 'Shaggy', value: 'shaggyMullet' },
  { label: 'Shaved Sides', value: 'shavedSides' },
  { label: 'Short Curly', value: 'shortCurly' },
  { label: 'Short Flat', value: 'shortFlat' },
  { label: 'Short Round', value: 'shortRound' },
  { label: 'Short Waved', value: 'shortWaved' },
  { label: 'Sides', value: 'sides' },
  { label: 'Straight', value: 'straight01' },
  { label: 'Straight 2', value: 'straight02' },
  { label: 'The Caesar', value: 'theCaesar' },
  { label: 'Caesar Side', value: 'theCaesarAndSidePart' },
  { label: 'Turban', value: 'turban' },
  { label: 'Winter Hat', value: 'winterHat1' },
];

const HAIR_COLORS = [
  { label: 'Auburn', value: 'a55728' },
  { label: 'Black', value: '2c1b18' },
  { label: 'Blonde', value: 'b58143' },
  { label: 'Golden', value: 'd6b370' },
  { label: 'Brown', value: '724133' },
  { label: 'Dark Brown', value: '4a312c' },
  { label: 'Pastel Pink', value: 'f59797' },
  { label: 'Blue', value: '6bd9e9' },
  { label: 'Platinum', value: 'ecdcbf' },
  { label: 'Red', value: 'c93305' },
  { label: 'Silver', value: 'e8e1e1' },
];

const EYES = [
  { label: 'Default', value: 'default' },
  { label: 'Happy', value: 'happy' },
  { label: 'Closed', value: 'closed' },
  { label: 'Cry', value: 'cry' },
  { label: 'Dizzy', value: 'xDizzy' },
  { label: 'Eye Roll', value: 'eyeRoll' },
  { label: 'Hearts', value: 'hearts' },
  { label: 'Side', value: 'side' },
  { label: 'Squint', value: 'squint' },
  { label: 'Surprised', value: 'surprised' },
  { label: 'Wink', value: 'wink' },
  { label: 'Wink Wacky', value: 'winkWacky' },
];

const EYEBROWS = [
  { label: 'Default', value: 'default' },
  { label: 'Natural', value: 'defaultNatural' },
  { label: 'Angry', value: 'angry' },
  { label: 'Angry Natural', value: 'angryNatural' },
  { label: 'Flat Natural', value: 'flatNatural' },
  { label: 'Raised Excited', value: 'raisedExcited' },
  { label: 'Raised Natural', value: 'raisedExcitedNatural' },
  { label: 'Sad Concerned', value: 'sadConcerned' },
  { label: 'Sad Natural', value: 'sadConcernedNatural' },
  { label: 'Unibrow', value: 'unibrowNatural' },
  { label: 'Up Down', value: 'upDown' },
  { label: 'Up Down Natural', value: 'upDownNatural' },
];

const MOUTH = [
  { label: 'Smile', value: 'smile' },
  { label: 'Default', value: 'default' },
  { label: 'Concerned', value: 'concerned' },
  { label: 'Disbelief', value: 'disbelief' },
  { label: 'Eating', value: 'eating' },
  { label: 'Grimace', value: 'grimace' },
  { label: 'Sad', value: 'sad' },
  { label: 'Scream Open', value: 'screamOpen' },
  { label: 'Serious', value: 'serious' },
  { label: 'Tongue', value: 'tongue' },
  { label: 'Twinkle', value: 'twinkle' },
];

const CLOTHES = [
  { label: 'Blazer + Shirt', value: 'blazerAndShirt' },
  { label: 'Blazer + Sweater', value: 'blazerAndSweater' },
  { label: 'Collar Sweater', value: 'collarAndSweater' },
  { label: 'Graphic Shirt', value: 'graphicShirt' },
  { label: 'Hoodie', value: 'hoodie' },
  { label: 'Overall', value: 'overall' },
  { label: 'Crew Neck', value: 'shirtCrewNeck' },
  { label: 'Scoop Neck', value: 'shirtScoopNeck' },
  { label: 'V Neck', value: 'shirtVNeck' },
];

const CLOTHES_COLORS = [
  { label: 'Black', value: '262e33' },
  { label: 'Blue', value: '65c9ff' },
  { label: 'Navy', value: '5199e4' },
  { label: 'Sky', value: '25557c' },
  { label: 'Gray', value: 'e6e6e6' },
  { label: 'Heather', value: '929598' },
  { label: 'Pastel Blue', value: 'b1e2ff' },
  { label: 'Pastel Green', value: 'a7ffc4' },
  { label: 'Pastel Orange', value: 'ffdeb5' },
  { label: 'Pastel Red', value: 'ffafb9' },
  { label: 'Pastel Yellow', value: 'ffffb1' },
  { label: 'Pink', value: 'ff488e' },
  { label: 'Red', value: 'ff5c5c' },
  { label: 'White', value: 'ffffff' },
];

const ACCESSORIES = [
  { label: 'None', value: '' },
  { label: 'Kurt', value: 'kurt' },
  { label: 'Prescription 01', value: 'prescription01' },
  { label: 'Prescription 02', value: 'prescription02' },
  { label: 'Round', value: 'round' },
  { label: 'Sunglasses', value: 'sunglasses' },
  { label: 'Wayfarers', value: 'wayfarers' },
];

const BACKGROUNDS = [
  { label: 'Transparent', value: 'b6e3f4' },
  { label: 'GGU Pink', value: 'FCE4EC' },
  { label: 'GGU Purple', value: 'F3E5F5' },
  { label: 'Sky Blue', value: 'DBEAFE' },
  { label: 'Mint', value: 'D1FAE5' },
  { label: 'Lavender', value: 'EDE9FE' },
  { label: 'Cream', value: 'FEF3C7' },
  { label: 'Black', value: '1F2937' },
  { label: 'Gold', value: 'FEF08A' },
];

const TABS = [
  { id: 'skin', label: 'Skin' },
  { id: 'hairStyle', label: 'Hair' },
  { id: 'hairColor', label: 'Hair Color' },
  { id: 'eyes', label: 'Eyes' },
  { id: 'eyebrows', label: 'Brows' },
  { id: 'mouth', label: 'Mouth' },
  { id: 'clothes', label: 'Outfit' },
  { id: 'clothesColor', label: 'Color' },
  { id: 'accessories', label: 'Glasses' },
  { id: 'background', label: 'BG' },
];

const DEFAULT_CONFIG = {
  skin: 'd08b5b',
  hairStyle: 'fro',
  hairColor: '2c1b18',
  eyes: 'happy',
  eyebrows: 'default',
  mouth: 'smile',
  clothes: 'hoodie',
  clothesColor: 'ff488e',
  accessories: '',
  background: 'FCE4EC',
};

function buildUrl(config) {
  // DiceBear 10.x avataaars correct parameter names
  const params = new URLSearchParams({
    skinColor: config.skin,
    topVariant: config.hairStyle,
    hairColor: config.hairColor,
    eyesVariant: config.eyes,
    eyebrowsVariant: config.eyebrows,
    mouthVariant: config.mouth,
    clothesVariant: config.clothes,
    clothesColor: config.clothesColor,
    backgroundColor: config.background,
    size: '200',
  });
  if (config.accessories) {
    params.set('accessoriesVariant', config.accessories);
    params.set('accessoriesProbability', '100');
  } else {
    params.set('accessoriesProbability', '0');
  }
  return `https://api.dicebear.com/10.x/avataaars/png?${params.toString()}`;
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)].value;
}

export default function DiceBearBuilder({ profile, user, onSaved }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    if (!profile?.avatar_builder_config) return;
    try {
      const saved = JSON.parse(profile.avatar_builder_config);
      setConfig(saved);
    } catch {}
  }, [profile]);
  const [activeTab, setActiveTab] = useState('skin');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const avatarUrl = buildUrl(config);

  const set = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

  const randomize = () => {
    setConfig({
      skin: randomFrom(SKIN_COLORS),
      hairStyle: randomFrom(HAIR_STYLES),
      hairColor: randomFrom(HAIR_COLORS),
      eyes: randomFrom(EYES),
      eyebrows: randomFrom(EYEBROWS),
      mouth: randomFrom(MOUTH),
      clothes: randomFrom(CLOTHES),
      clothesColor: randomFrom(CLOTHES_COLORS),
      accessories: randomFrom(ACCESSORIES),
      background: randomFrom(BACKGROUNDS),
    });
  };

  const save = async () => {
    setSaving(true);
    const data = {
      avatar_url: avatarUrl,
      avatar_builder_config: JSON.stringify(config),
      identity_type: 'selfie',
    };
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, data);
    } else if (user) {
      await base44.entities.UserProfile.create({ user_email: user.email, ...data });
    }
    setSaving(false);
    setSavedMsg('✅ Avatar saved as your profile picture!');
    setTimeout(() => setSavedMsg(''), 2500);
    if (onSaved) await onSaved(avatarUrl);
  };

  const OPTIONS_MAP = {
    skin: SKIN_COLORS,
    hairStyle: HAIR_STYLES,
    hairColor: HAIR_COLORS,
    eyes: EYES,
    eyebrows: EYEBROWS,
    mouth: MOUTH,
    clothes: CLOTHES,
    clothesColor: CLOTHES_COLORS,
    accessories: ACCESSORIES,
    background: BACKGROUNDS,
  };

  const currentOptions = OPTIONS_MAP[activeTab] || [];
  const currentValue = config[activeTab];

  return (
    <div className="flex flex-col items-center">
      {/* Preview */}
      <div className="relative mb-4">
        <div className="w-48 h-48 rounded-full overflow-hidden border-4 flex items-center justify-center"
          style={{ borderColor: 'rgba(236,72,153,0.5)', background: `#${config.background}` }}>
          <img
            src={avatarUrl}
            alt="avatar preview"
            className="w-full h-full object-cover"
            style={{ imageRendering: 'auto' }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-5">
        <button onClick={randomize}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-white"
          style={{ background: 'rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.5)' }}>
          <Shuffle size={14} /> Randomize 🎲
        </button>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
          {saving
            ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
            : <><Save size={14} /> Save ✨</>}
        </button>
      </div>

      {savedMsg && (
        <p className="text-green-400 text-sm font-semibold mb-3 text-center">{savedMsg}</p>
      )}

      {/* Tab Bar */}
      <div className="w-full overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-2 px-1 min-w-max">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition"
                style={isActive
                  ? { background: '#C2185B', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Options */}
      <div className="w-full overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-2 px-1 min-w-max">
          {currentOptions.map(opt => {
            const isSelected = currentValue === opt.value;
            return (
              <button key={opt.value} onClick={() => set(activeTab, opt.value)}
                className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition"
                style={isSelected
                  ? { background: 'rgba(194,24,91,0.25)', border: '2px solid #C2185B', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                {opt.label}
                {isSelected && <Check size={10} className="inline ml-1 text-pink-400" />}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-gray-600 mt-4 text-center">Powered by DiceBear · Free & open source</p>
    </div>
  );
}