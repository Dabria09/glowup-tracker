import { useState, useEffect } from 'react';
import { Shuffle, Save, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SKIN_COLORS = [
  { label: 'Light', value: 'light' },
  { label: 'Pale', value: 'pale' },
  { label: 'Mellow', value: 'mellow' },
  { label: 'Wheat', value: 'wheat' },
  { label: 'Tan', value: 'tan' },
  { label: 'Warm Gray', value: 'warmGray' },
  { label: 'Bronze', value: 'bronze' },
  { label: 'Brown', value: 'brown' },
  { label: 'Dark Brown', value: 'darkBrown' },
  { label: 'Black', value: 'black' },
];

const HAIR_STYLES = [
  { label: 'No Hair', value: 'NoHair' },
  { label: 'Eyepatch', value: 'Eyepatch' },
  { label: 'Hat', value: 'Hat' },
  { label: 'Hijab', value: 'Hijab' },
  { label: 'Turban', value: 'Turban' },
  { label: 'Winter Hat', value: 'WinterHat1' },
  { label: 'Long Straight', value: 'LongHairStraight' },
  { label: 'Long Straight 2', value: 'LongHairStraight2' },
  { label: 'Long Curved', value: 'LongHairNotTooLong' },
  { label: 'Long Big Hair', value: 'LongHairBigHair' },
  { label: 'Long Bob', value: 'LongHairBob' },
  { label: 'Long Bun', value: 'LongHairBun' },
  { label: 'Long Curly', value: 'LongHairCurly' },
  { label: 'Long Dreads', value: 'LongHairDreads' },
  { label: 'Long Frida', value: 'LongHairFrida' },
  { label: 'Long Fro', value: 'LongHairFro' },
  { label: 'Long Fro Band', value: 'LongHairFroBand' },
  { label: 'Long Shaved Sides', value: 'LongHairShavedSides' },
  { label: 'Long Mia Wallace', value: 'LongHairMiaWallace' },
  { label: 'Short Dreads 01', value: 'ShortHairDreads01' },
  { label: 'Short Dreads 02', value: 'ShortHairDreads02' },
  { label: 'Short Frizzle', value: 'ShortHairFrizzle' },
  { label: 'Short Shaggy', value: 'ShortHairShaggyMullet' },
  { label: 'Short Curly', value: 'ShortHairShortCurly' },
  { label: 'Short Flat', value: 'ShortHairShortFlat' },
  { label: 'Short Round', value: 'ShortHairShortRound' },
  { label: 'Short Waved', value: 'ShortHairShortWaved' },
  { label: 'Short Sides', value: 'ShortHairSides' },
  { label: 'Short Caesar', value: 'ShortHairTheCaesar' },
  { label: 'Short Caesar Side', value: 'ShortHairTheCaesarSidePart' },
];

const HAIR_COLORS = [
  { label: 'Auburn', value: 'Auburn' },
  { label: 'Black', value: 'Black' },
  { label: 'Blonde', value: 'Blonde' },
  { label: 'Golden', value: 'BlondeGolden' },
  { label: 'Brown', value: 'Brown' },
  { label: 'Dark Brown', value: 'BrownDark' },
  { label: 'Pastel Pink', value: 'PastelPink' },
  { label: 'Blue', value: 'Blue' },
  { label: 'Platinum', value: 'Platinum' },
  { label: 'Red', value: 'Red' },
  { label: 'Silver', value: 'SilverGray' },
];

const EYES = [
  { label: 'Default', value: 'Default' },
  { label: 'Happy', value: 'Happy' },
  { label: 'Close', value: 'Close' },
  { label: 'Cry', value: 'Cry' },
  { label: 'Dizzy', value: 'Dizzy' },
  { label: 'Eye Roll', value: 'EyeRoll' },
  { label: 'Hearts', value: 'Hearts' },
  { label: 'Side', value: 'Side' },
  { label: 'Squint', value: 'Squint' },
  { label: 'Surprised', value: 'Surprised' },
  { label: 'Wink', value: 'Wink' },
  { label: 'Wink Wacky', value: 'WinkWacky' },
];

const EYEBROWS = [
  { label: 'Default', value: 'Default' },
  { label: 'Natural', value: 'DefaultNatural' },
  { label: 'Angry', value: 'Angry' },
  { label: 'Angry Natural', value: 'AngryNatural' },
  { label: 'Flat Natural', value: 'FlatNatural' },
  { label: 'Raised Excited', value: 'RaisedExcited' },
  { label: 'Raised Excited Natural', value: 'RaisedExcitedNatural' },
  { label: 'Sad Concerned', value: 'SadConcerned' },
  { label: 'Sad Natural', value: 'SadConcernedNatural' },
  { label: 'Unibrow', value: 'UnibrowNatural' },
  { label: 'Up Down', value: 'UpDown' },
  { label: 'Up Down Natural', value: 'UpDownNatural' },
];

const MOUTH = [
  { label: 'Smile', value: 'Smile' },
  { label: 'Default', value: 'Default' },
  { label: 'Concerned', value: 'Concerned' },
  { label: 'Disbelief', value: 'Disbelief' },
  { label: 'Eating', value: 'Eating' },
  { label: 'Grimace', value: 'Grimace' },
  { label: 'Sad', value: 'Sad' },
  { label: 'Scream Open', value: 'ScreamOpen' },
  { label: 'Serious', value: 'Serious' },
  { label: 'Tongue', value: 'Tongue' },
  { label: 'Twinkle', value: 'Twinkle' },
];

const CLOTHES = [
  { label: 'Blazer + Shirt', value: 'BlazerShirt' },
  { label: 'Blazer + Sweater', value: 'BlazerSweater' },
  { label: 'Collar Sweater', value: 'CollarSweater' },
  { label: 'Graphic Shirt', value: 'GraphicShirt' },
  { label: 'Hoodie', value: 'Hoodie' },
  { label: 'Overall', value: 'Overall' },
  { label: 'Crew Neck', value: 'ShirtCrewNeck' },
  { label: 'Scoop Neck', value: 'ShirtScoopNeck' },
  { label: 'V Neck', value: 'ShirtVNeck' },
];

const CLOTHES_COLORS = [
  { label: 'Black', value: 'Black' },
  { label: 'Blue', value: 'Blue01' },
  { label: 'Navy', value: 'Blue02' },
  { label: 'Sky', value: 'Blue03' },
  { label: 'Gray', value: 'Gray01' },
  { label: 'Light Gray', value: 'Gray02' },
  { label: 'Heather', value: 'Heather' },
  { label: 'Pastel Blue', value: 'PastelBlue' },
  { label: 'Pastel Green', value: 'PastelGreen' },
  { label: 'Pastel Orange', value: 'PastelOrange' },
  { label: 'Pastel Red', value: 'PastelRed' },
  { label: 'Pastel Yellow', value: 'PastelYellow' },
  { label: 'Pink', value: 'Pink' },
  { label: 'Red', value: 'Red' },
  { label: 'White', value: 'White' },
];

const ACCESSORIES = [
  { label: 'None', value: 'Blank' },
  { label: 'Kurt', value: 'Kurt' },
  { label: 'Prescription 01', value: 'Prescription01' },
  { label: 'Prescription 02', value: 'Prescription02' },
  { label: 'Round', value: 'Round' },
  { label: 'Sunglasses', value: 'Sunglasses' },
  { label: 'Wayfarers', value: 'Wayfarers' },
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
  { id: 'hairStyle', label: 'Hair Style' },
  { id: 'hairColor', label: 'Hair Color' },
  { id: 'eyes', label: 'Eyes' },
  { id: 'eyebrows', label: 'Brows' },
  { id: 'mouth', label: 'Mouth' },
  { id: 'clothes', label: 'Clothes' },
  { id: 'clothesColor', label: 'Color' },
  { id: 'accessories', label: 'Extras' },
  { id: 'background', label: 'BG' },
];

const DEFAULT_CONFIG = {
  skin: 'brown',
  hairStyle: 'LongHairFro',
  hairColor: 'Black',
  eyes: 'Happy',
  eyebrows: 'Default',
  mouth: 'Smile',
  clothes: 'Hoodie',
  clothesColor: 'Pink',
  accessories: 'Blank',
  background: 'FCE4EC',
};

function buildUrl(config) {
  const params = new URLSearchParams({
    skinColor: config.skin,
    top: config.hairStyle,
    hairColor: config.hairColor,
    eyes: config.eyes,
    eyebrows: config.eyebrows,
    mouth: config.mouth,
    clothe: config.clothes,
    clotheColor: config.clothesColor,
    accessories: config.accessories,
    backgroundColor: config.background,
  });
  return `https://api.dicebear.com/7.x/avataaars/png?${params.toString()}&size=200`;
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