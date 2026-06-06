import { useState, useEffect, useRef } from 'react';
import { Shuffle, Save, Download, Share2, Check, Sparkles } from 'lucide-react';
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

// Headwear styles that support hat color
const HAT_STYLES = ['hat', 'hijab', 'turban', 'winterHat1', 'froBand'];

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

const HAT_COLORS = [
  { label: 'Black', value: '262e33' },
  { label: 'Blue', value: '65c9ff' },
  { label: 'Navy', value: '5199e4' },
  { label: 'Pink', value: 'ff488e' },
  { label: 'Purple', value: 'a855f7' },
  { label: 'Red', value: 'ff5c5c' },
  { label: 'White', value: 'ffffff' },
  { label: 'Gray', value: 'e6e6e6' },
  { label: 'Gold', value: 'fef08a' },
  { label: 'Mint', value: 'a7ffc4' },
  { label: 'Lavender', value: 'ede9fe' },
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

const GRAPHIC_DESIGNS = [
  { label: 'Bat', value: 'bat' },
  { label: 'Cumbia', value: 'cumbia' },
  { label: 'Deer', value: 'deer' },
  { label: 'Diamond', value: 'diamond' },
  { label: 'Hola', value: 'hola' },
  { label: 'Pizza', value: 'pizza' },
  { label: 'Resist', value: 'resist' },
  { label: 'Selena', value: 'selena' },
  { label: 'Bear', value: 'bear' },
  { label: 'Skull', value: 'skull' },
  { label: 'Skull 2', value: 'skullOutline' },
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

const ACCESSORIES_COLORS = [
  { label: 'Black', value: '262e33' },
  { label: 'Blue', value: '65c9ff' },
  { label: 'Gold', value: 'fef08a' },
  { label: 'Pink', value: 'ff488e' },
  { label: 'Purple', value: 'a855f7' },
  { label: 'Red', value: 'ff5c5c' },
  { label: 'Silver', value: 'e8e1e1' },
  { label: 'Pastel Blue', value: 'b1e2ff' },
  { label: 'Pastel Pink', value: 'ffafb9' },
  { label: 'White', value: 'ffffff' },
];

const BACKGROUNDS = [
  { label: 'Sky Blue', value: 'b6e3f4' },
  { label: 'GGU Pink', value: 'FCE4EC' },
  { label: 'GGU Purple', value: 'F3E5F5' },
  { label: 'Blue', value: 'DBEAFE' },
  { label: 'Mint', value: 'D1FAE5' },
  { label: 'Lavender', value: 'EDE9FE' },
  { label: 'Cream', value: 'FEF3C7' },
  { label: 'Dark', value: '1F2937' },
  { label: 'Gold', value: 'FEF08A' },
];

// ── Aesthetic Presets ──────────────────────────────────────────────────────
const PRESETS = [
  {
    id: 'future_ceo',
    label: 'Future CEO 💼',
    config: {
      skin: 'edb98a', hairStyle: 'straight01', hairColor: '2c1b18',
      eyes: 'default', eyebrows: 'raisedExcited', mouth: 'smile',
      clothes: 'blazerAndShirt', clothesColor: '262e33',
      accessories: 'prescription01', accessoriesColor: 'fef08a',
      hatColor: '262e33', graphicDesign: 'diamond',
      background: 'FEF3C7',
    },
  },
  {
    id: 'soft_girl',
    label: 'Soft Girl 🌸',
    config: {
      skin: 'ffdbb4', hairStyle: 'longButNotTooLong', hairColor: 'f59797',
      eyes: 'hearts', eyebrows: 'raisedExcitedNatural', mouth: 'twinkle',
      clothes: 'hoodie', clothesColor: 'ffafb9',
      accessories: '', accessoriesColor: 'ff488e',
      hatColor: 'ff488e', graphicDesign: 'diamond',
      background: 'FCE4EC',
    },
  },
  {
    id: 'sporty_chic',
    label: 'Sporty Chic ⚡',
    config: {
      skin: 'd08b5b', hairStyle: 'curly', hairColor: '4a312c',
      eyes: 'squint', eyebrows: 'raisedExcited', mouth: 'smile',
      clothes: 'hoodie', clothesColor: '5199e4',
      accessories: 'sunglasses', accessoriesColor: '262e33',
      hatColor: '5199e4', graphicDesign: 'bat',
      background: 'DBEAFE',
    },
  },
  {
    id: 'study_gram',
    label: 'Study Gram 📚',
    config: {
      skin: 'ae5d29', hairStyle: 'bob', hairColor: '724133',
      eyes: 'default', eyebrows: 'defaultNatural', mouth: 'serious',
      clothes: 'collarAndSweater', clothesColor: 'b1e2ff',
      accessories: 'round', accessoriesColor: '262e33',
      hatColor: 'b1e2ff', graphicDesign: 'diamond',
      background: 'EDE9FE',
    },
  },
  {
    id: 'ethereal_goddess',
    label: 'Ethereal Goddess ✨',
    config: {
      skin: 'ffdbb4', hairStyle: 'bigHair', hairColor: 'd6b370',
      eyes: 'hearts', eyebrows: 'raisedExcitedNatural', mouth: 'twinkle',
      clothes: 'shirtScoopNeck', clothesColor: 'ede9fe',
      accessories: 'kurt', accessoriesColor: 'fef08a',
      hatColor: 'fef08a', graphicDesign: 'diamond',
      background: 'F3E5F5',
    },
  },
  {
    id: 'street_style',
    label: 'Street Style 🔥',
    config: {
      skin: '614335', hairStyle: 'fro', hairColor: '2c1b18',
      eyes: 'wink', eyebrows: 'angry', mouth: 'smile',
      clothes: 'graphicShirt', clothesColor: 'ff5c5c',
      accessories: 'wayfarers', accessoriesColor: '262e33',
      hatColor: '262e33', graphicDesign: 'skull',
      background: '1F2937',
    },
  },
];

const TABS = [
  { id: 'presets', label: '✨ Presets' },
  { id: 'skin', label: 'Skin' },
  { id: 'hairStyle', label: 'Hair' },
  { id: 'hairColor', label: 'Hair Color' },
  { id: 'hatColor', label: 'Hat Color' },
  { id: 'eyes', label: 'Eyes' },
  { id: 'eyebrows', label: 'Brows' },
  { id: 'mouth', label: 'Mouth' },
  { id: 'clothes', label: 'Outfit' },
  { id: 'clothesColor', label: 'Outfit Color' },
  { id: 'graphicDesign', label: 'Graphic' },
  { id: 'accessories', label: 'Glasses' },
  { id: 'accessoriesColor', label: 'Frame Color' },
  { id: 'background', label: 'BG' },
];

const DEFAULT_CONFIG = {
  skin: 'd08b5b',
  hairStyle: 'fro',
  hairColor: '2c1b18',
  hatColor: 'ff488e',
  eyes: 'happy',
  eyebrows: 'default',
  mouth: 'smile',
  clothes: 'hoodie',
  clothesColor: 'ff488e',
  graphicDesign: 'diamond',
  accessories: '',
  accessoriesColor: '262e33',
  background: 'FCE4EC',
};

function buildUrl(config, format = 'svg', size = null) {
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
  });

  // Hat/headwear color
  if (HAT_STYLES.includes(config.hairStyle) && config.hatColor) {
    params.set('hatColor', config.hatColor);
  }

  // Graphic shirt design
  if (config.clothes === 'graphicShirt' && config.graphicDesign) {
    params.set('clothingGraphic', config.graphicDesign);
  }

  // Accessories / glasses
  if (config.accessories) {
    params.set('accessoriesVariant', config.accessories);
    params.set('accessoriesProbability', '100');
    if (config.accessoriesColor) {
      params.set('accessoriesColor', config.accessoriesColor);
    }
  } else {
    params.set('accessoriesProbability', '0');
  }

  if (size) params.set('size', String(size));

  return `https://api.dicebear.com/10.x/avataaars/${format}?${params.toString()}`;
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)].value;
}

export default function DiceBearBuilder({ profile, user, onSaved }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState('presets');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!profile?.avatar_builder_config) return;
    try {
      const saved = JSON.parse(profile.avatar_builder_config);
      setConfig(prev => ({ ...DEFAULT_CONFIG, ...saved }));
    } catch {}
  }, [profile]);

  const avatarUrl = buildUrl(config, 'svg');

  const set = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

  const applyPreset = (preset) => {
    setConfig({ ...DEFAULT_CONFIG, ...preset.config });
    setActiveTab('skin'); // switch to customization after preset
  };

  const randomize = () => {
    setConfig({
      skin: randomFrom(SKIN_COLORS),
      hairStyle: randomFrom(HAIR_STYLES),
      hairColor: randomFrom(HAIR_COLORS),
      hatColor: randomFrom(HAT_COLORS),
      eyes: randomFrom(EYES),
      eyebrows: randomFrom(EYEBROWS),
      mouth: randomFrom(MOUTH),
      clothes: randomFrom(CLOTHES),
      clothesColor: randomFrom(CLOTHES_COLORS),
      graphicDesign: randomFrom(GRAPHIC_DESIGNS),
      accessories: randomFrom(ACCESSORIES),
      accessoriesColor: randomFrom(ACCESSORIES_COLORS),
      background: randomFrom(BACKGROUNDS),
    });
  };

  const save = async () => {
    setSaving(true);
    const pngUrl = buildUrl(config, 'png', 256);
    const data = {
      avatar_url: pngUrl,
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
    if (onSaved) await onSaved(pngUrl);
  };

  const downloadAvatar = async () => {
    setDownloading(true);
    const pngUrl = buildUrl(config, 'png', 400);
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = 'my-ggu-avatar.png';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setDownloading(false), 1000);
  };

  const shareToFeed = async () => {
    setSharing(true);
    const pngUrl = buildUrl(config, 'png', 256);
    try {
      await base44.entities.ShoutOut.create({
        user_email: user?.email || '',
        username: profile?.username || user?.full_name || 'GGU Member',
        content: '✨ Just customized my avatar on Girls Glowing Up! Check out my new look 🎨💅',
        media_url: pngUrl,
        media_type: 'image',
        age_group: profile?.age_group || 'glow_teens',
      });
      setSavedMsg('🌟 Shared to Shout-Outs feed!');
      setTimeout(() => setSavedMsg(''), 2500);
    } catch {
      setSavedMsg('❌ Could not share. Try again!');
      setTimeout(() => setSavedMsg(''), 2500);
    }
    setSharing(false);
  };

  const OPTIONS_MAP = {
    skin: SKIN_COLORS,
    hairStyle: HAIR_STYLES,
    hairColor: HAIR_COLORS,
    hatColor: HAT_COLORS,
    eyes: EYES,
    eyebrows: EYEBROWS,
    mouth: MOUTH,
    clothes: CLOTHES,
    clothesColor: CLOTHES_COLORS,
    graphicDesign: GRAPHIC_DESIGNS,
    accessories: ACCESSORIES,
    accessoriesColor: ACCESSORIES_COLORS,
    background: BACKGROUNDS,
  };

  // Determine which tabs are relevant
  const isHatStyle = HAT_STYLES.includes(config.hairStyle);
  const isGraphicShirt = config.clothes === 'graphicShirt';
  const hasAccessory = !!config.accessories;

  const visibleTabs = TABS.filter(tab => {
    if (tab.id === 'hatColor') return isHatStyle;
    if (tab.id === 'graphicDesign') return isGraphicShirt;
    if (tab.id === 'accessoriesColor') return hasAccessory;
    return true;
  });

  const currentOptions = OPTIONS_MAP[activeTab] || [];
  const currentValue = config[activeTab];

  return (
    <div className="flex flex-col items-center">
      {/* Preview */}
      <div className="relative mb-4">
        <div
          className="w-48 h-48 rounded-full overflow-hidden border-4 flex items-center justify-center"
          style={{ borderColor: 'rgba(236,72,153,0.5)', background: `#${config.background}` }}
        >
          <img
            src={avatarUrl}
            alt="avatar preview"
            className="w-full h-full object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      </div>

      {/* Action Buttons Row 1 */}
      <div className="flex gap-2 mb-2 flex-wrap justify-center">
        <button onClick={randomize}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-white"
          style={{ background: 'rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.5)' }}>
          <Shuffle size={13} /> Randomize 🎲
        </button>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
          {saving
            ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
            : <><Save size={13} /> Save ✨</>}
        </button>
      </div>

      {/* Action Buttons Row 2: Download + Share */}
      <div className="flex gap-2 mb-4 flex-wrap justify-center">
        <button onClick={downloadAvatar} disabled={downloading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-white disabled:opacity-50"
          style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)' }}>
          {downloading ? '⏳ Downloading...' : <><Download size={13} /> Download PNG</>}
        </button>
        <button onClick={shareToFeed} disabled={sharing}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-white disabled:opacity-50"
          style={{ background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.4)' }}>
          {sharing ? '⏳ Sharing...' : <><Share2 size={13} /> Share to Feed</>}
        </button>
      </div>

      {savedMsg && (
        <p className="text-green-400 text-sm font-semibold mb-3 text-center">{savedMsg}</p>
      )}

      {/* Tab Bar */}
      <div className="w-full overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-2 px-1 min-w-max">
          {visibleTabs.map(tab => {
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

      {/* Presets Tab */}
      {activeTab === 'presets' ? (
        <div className="w-full grid grid-cols-2 gap-2 px-1">
          {PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="flex items-center gap-2 px-3 py-3 rounded-2xl text-xs font-bold text-white text-left transition hover:scale-105 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <Sparkles size={13} className="text-yellow-400 flex-shrink-0" />
              {preset.label}
            </button>
          ))}
        </div>
      ) : (
        /* Options Row */
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
                  {/* Color swatches for color tabs */}
                  {['hairColor', 'hatColor', 'clothesColor', 'accessoriesColor', 'background', 'skin'].includes(activeTab) && (
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-1 align-middle border border-white/20"
                      style={{ background: `#${opt.value}` }}
                    />
                  )}
                  {opt.label}
                  {isSelected && <Check size={10} className="inline ml-1 text-pink-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[10px] text-gray-600 mt-4 text-center">Powered by DiceBear · Free & open source</p>
    </div>
  );
}