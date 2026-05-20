import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, Loader2, Shuffle, Save } from 'lucide-react';
import AvatarPreview from './AvatarPreview';
import {
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  EYE_STYLES,
  EYE_COLORS,
  EYEBROW_STYLES,
  TOP_STYLES,
  BOTTOM_STYLES,
  SHOE_STYLES,
  ACCESSORIES,
  CLOTHING_COLORS,
  BG_COLORS,
  filterByAgeGroup,
} from './avatarData';

const DEFAULT_CONFIG = {
  bg: 'dark_purple',
  skinTone: 'warm_beige',
  hairColor: 'dark_brown',
  hairStyle: 'afro_full',
  eyeStyle: 'almond',
  eyeColor: 'dark_brown',
  eyebrowStyle: 'thick_natural',
  topStyle: 'hoodie_classic',
  topColor: 'hot_pink',
  bottomStyle: 'jeans_skinny',
  bottomColor: 'navy',
  shoeStyle: 'sneakers_classic',
  shoeColor: 'white',
  accessory: 'none',
  blush: false,
};

const CATEGORIES = [
  { id: 'skin', label: '🎨 Skin' },
  { id: 'hair', label: '💇 Hair' },
  { id: 'face', label: '😊 Face' },
  { id: 'top', label: '👕 Top' },
  { id: 'bottom', label: '👖 Bottom' },
  { id: 'shoes', label: '👟 Shoes' },
  { id: 'accessories', label: '✨ Extras' },
  { id: 'bg', label: '🌈 BG' },
];

export default function AvatarBuilder({ profile, setProfile, user }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [activeCategory, setActiveCategory] = useState('skin');
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ageGroup, setAgeGroup] = useState('glow_girls');

  useEffect(() => {
    if (profile?.avatar_builder_config) {
      try {
        const savedConfig = JSON.parse(profile.avatar_builder_config);
        setConfig({ ...DEFAULT_CONFIG, ...savedConfig });
      } catch {}
    }
    if (profile?.age_group) {
      setAgeGroup(profile.age_group);
    }
  }, [profile]);

  const update = useCallback((key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const randomize = useCallback(() => {
    const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const filteredTops = filterByAgeGroup(TOP_STYLES, ageGroup);
    const filteredBottoms = filterByAgeGroup(BOTTOM_STYLES, ageGroup);
    const filteredShoes = filterByAgeGroup(SHOE_STYLES, ageGroup);
    const filteredAccessories = filterByAgeGroup(ACCESSORIES, ageGroup);

    setConfig({
      ...DEFAULT_CONFIG,
      skinTone: randomItem(SKIN_TONES).id,
      hairColor: randomItem(HAIR_COLORS).id,
      hairStyle: randomItem(HAIR_STYLES).id,
      eyeStyle: randomItem(EYE_STYLES).id,
      eyeColor: randomItem(EYE_COLORS).id,
      eyebrowStyle: randomItem(EYEBROW_STYLES).id,
      topStyle: randomItem(filteredTops).id,
      topColor: randomItem(CLOTHING_COLORS).id,
      bottomStyle: randomItem(filteredBottoms).id,
      bottomColor: randomItem(CLOTHING_COLORS).id,
      shoeStyle: randomItem(filteredShoes).id,
      shoeColor: randomItem(CLOTHING_COLORS).id,
      accessory: randomItem(filteredAccessories.filter(a => a.id !== 'none')).id,
      blush: Math.random() > 0.5,
    });
    setSaved(false);
  }, [ageGroup]);

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
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${c.color.includes('gradient') ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500' : ''}`}
          style={!c.color.includes('gradient') ? { backgroundColor: c.color, borderColor: selected === c.id ? '#fff' : 'transparent', boxShadow: selected === c.id ? '0 0 0 2px #e91e8c' : 'none' } : {}}
          title={c.label}
        />
      ))}
    </div>
  );

  const OptionCard = ({ option, selected, onSelect, showLabel = true }) => {
    const isLocked = option.ageGroup && (
      (ageGroup === 'glow_girls' && option.ageGroup !== 'women') ||
      (ageGroup === 'glow_teens' && option.ageGroup === 'women')
    );

    if (isLocked) {
      return (
        <div className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl border border-gray-800 bg-gray-900/30 text-gray-600 opacity-50 cursor-not-allowed">
          <span className="text-2xl grayscale">{option.emoji}</span>
          {showLabel && <span className="text-[10px] text-center leading-tight line-through">{option.label}</span>}
        </div>
      );
    }

    return (
      <button
        onClick={() => !option.tier || ageGroup === 'glow_women' ? onSelect(option.id) : null}
        className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs font-semibold transition-all ${
          selected === option.id
            ? 'border-pink-500 bg-pink-500/20 text-white scale-105'
            : 'border-gray-700 bg-gray-800/60 text-gray-300 hover:border-gray-500 hover:bg-gray-700/60'
        }`}
      >
        <span className="text-2xl">{option.emoji}</span>
        {showLabel && <span className="text-[10px] text-center leading-tight">{option.label}</span>}
        {option.tier && <span className="text-[8px] text-yellow-400">👑</span>}
      </button>
    );
  };

  const HorizontalScroll = ({ children }) => (
    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
      {children}
    </div>
  );

  const renderCategory = () => {
    const filteredTops = filterByAgeGroup(TOP_STYLES, ageGroup);
    const filteredBottoms = filterByAgeGroup(BOTTOM_STYLES, ageGroup);
    const filteredShoes = filterByAgeGroup(SHOE_STYLES, ageGroup);
    const filteredAccessories = filterByAgeGroup(ACCESSORIES, ageGroup);

    switch (activeCategory) {
      case 'skin':
        return (
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-2">Choose Your Skin Tone</p>
            <HorizontalScroll>
              {SKIN_TONES.map(skin => (
                <OptionCard
                  key={skin.id}
                  option={{ ...skin, emoji: '🎨' }}
                  selected={config.skinTone}
                  onSelect={(id) => update('skinTone', id)}
                />
              ))}
            </HorizontalScroll>
          </div>
        );

      case 'hair':
        return (
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-2">Hair Style</p>
            <HorizontalScroll>
              {HAIR_STYLES.map(hair => (
                <OptionCard
                  key={hair.id}
                  option={hair}
                  selected={config.hairStyle}
                  onSelect={(id) => update('hairStyle', id)}
                />
              ))}
            </HorizontalScroll>
            <p className="text-xs text-gray-400 font-semibold mt-4 mb-2">Hair Color</p>
            <ColorPicker colors={HAIR_COLORS} selected={config.hairColor} onSelect={(id) => update('hairColor', id)} />
          </div>
        );

      case 'face':
        return (
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-2">Eye Style</p>
            <HorizontalScroll>
              {EYE_STYLES.map(eye => (
                <OptionCard
                  key={eye.id}
                  option={eye}
                  selected={config.eyeStyle}
                  onSelect={(id) => update('eyeStyle', id)}
                />
              ))}
            </HorizontalScroll>
            <p className="text-xs text-gray-400 font-semibold mt-4 mb-2">Eye Color</p>
            <ColorPicker colors={EYE_COLORS} selected={config.eyeColor} onSelect={(id) => update('eyeColor', id)} />
            <p className="text-xs text-gray-400 font-semibold mt-4 mb-2">Eyebrows</p>
            <HorizontalScroll>
              {EYEBROW_STYLES.map(brow => (
                <OptionCard
                  key={brow.id}
                  option={brow}
                  selected={config.eyebrowStyle}
                  onSelect={(id) => update('eyebrowStyle', id)}
                />
              ))}
            </HorizontalScroll>
            <div className="flex items-center gap-3 mt-4">
              <p className="text-xs text-gray-400 font-semibold">Blush</p>
              <button
                onClick={() => update('blush', !config.blush)}
                className={`w-12 h-6 rounded-full transition-colors ${config.blush ? 'bg-pink-500' : 'bg-gray-700'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white mx-0.5 transition-transform ${config.blush ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        );

      case 'top':
        return (
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-2">Top Style</p>
            <HorizontalScroll>
              {filteredTops.map(top => (
                <OptionCard
                  key={top.id}
                  option={top}
                  selected={config.topStyle}
                  onSelect={(id) => update('topStyle', id)}
                />
              ))}
            </HorizontalScroll>
            <p className="text-xs text-gray-400 font-semibold mt-4 mb-2">Top Color</p>
            <ColorPicker colors={CLOTHING_COLORS} selected={config.topColor} onSelect={(id) => update('topColor', id)} />
          </div>
        );

      case 'bottom':
        return (
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-2">Bottom Style</p>
            <HorizontalScroll>
              {filteredBottoms.map(bottom => (
                <OptionCard
                  key={bottom.id}
                  option={bottom}
                  selected={config.bottomStyle}
                  onSelect={(id) => update('bottomStyle', id)}
                />
              ))}
            </HorizontalScroll>
            <p className="text-xs text-gray-400 font-semibold mt-4 mb-2">Bottom Color</p>
            <ColorPicker colors={CLOTHING_COLORS} selected={config.bottomColor} onSelect={(id) => update('bottomColor', id)} />
          </div>
        );

      case 'shoes':
        return (
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-2">Shoe Style</p>
            <HorizontalScroll>
              {filteredShoes.map(shoe => (
                <OptionCard
                  key={shoe.id}
                  option={shoe}
                  selected={config.shoeStyle}
                  onSelect={(id) => update('shoeStyle', id)}
                />
              ))}
            </HorizontalScroll>
            <p className="text-xs text-gray-400 font-semibold mt-4 mb-2">Shoe Color</p>
            <ColorPicker colors={CLOTHING_COLORS} selected={config.shoeColor} onSelect={(id) => update('shoeColor', id)} />
          </div>
        );

      case 'accessories':
        return (
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-2">Accessories</p>
            <HorizontalScroll>
              {filteredAccessories.map(acc => (
                <OptionCard
                  key={acc.id}
                  option={acc}
                  selected={config.accessory}
                  onSelect={(id) => update('accessory', id)}
                />
              ))}
            </HorizontalScroll>
          </div>
        );

      case 'bg':
        return (
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-2">Background</p>
            <ColorPicker colors={BG_COLORS} selected={config.bg} onSelect={(id) => update('bg', id)} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center px-4 w-full">
      {/* Preview */}
      <div className="mb-4 drop-shadow-2xl">
        <AvatarPreview config={config} size={180} ageGroup={ageGroup} />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={randomize}
          className="px-6 py-2.5 rounded-full bg-gray-800 text-white font-bold text-sm hover:bg-gray-700 transition flex items-center gap-2"
        >
          <Shuffle size={14} /> Randomize
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Avatar'}
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto w-full pb-1 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              activeCategory === cat.id
                ? 'bg-pink-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Options panel */}
      <div className="w-full max-w-md bg-[#1e1020] border border-gray-700/50 rounded-2xl p-4 mb-4">
        {renderCategory()}
      </div>

      {/* Age group info */}
      <p className="text-xs text-gray-500 text-center max-w-sm">
        {ageGroup === 'glow_girls' && '🔒 Teen+ styles locked - grow your style as you grow!'}
        {ageGroup === 'glow_teens' && "🔒 Women's styles locked - unlock at 19!"}
        {ageGroup === 'glow_women' && '✨ Full wardrobe unlocked!'}
      </p>
    </div>
  );
}