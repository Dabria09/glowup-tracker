import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, Loader2, Shuffle, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import AvatarPreview from './AvatarPreview';
import {
  SKIN_TONES, HAIR_STYLES, HAIR_COLORS, EYE_STYLES, EYE_COLORS,
  EYEBROW_STYLES, TOP_STYLES, BOTTOM_STYLES, SHOE_STYLES,
  ACCESSORIES, CLOTHING_COLORS, BG_COLORS, filterByAgeGroup,
} from './avatarData';

const LIP_COLORS = [
  { id: 'nude_light', label: 'Nude Light', color: '#e8c0a8' },
  { id: 'nude_medium', label: 'Nude Medium', color: '#c98a6a' },
  { id: 'nude_dark', label: 'Nude Dark', color: '#9a5e42' },
  { id: 'pink_soft', label: 'Soft Pink', color: '#f0a0b0' },
  { id: 'pink_hot', label: 'Hot Pink', color: '#e8527a' },
  { id: 'red_classic', label: 'Classic Red', color: '#c82030' },
  { id: 'red_dark', label: 'Dark Red', color: '#8b1a28' },
  { id: 'mauve', label: 'Mauve', color: '#b06880' },
  { id: 'berry', label: 'Berry', color: '#883060' },
  { id: 'coral', label: 'Coral', color: '#e07050' },
  { id: 'peach', label: 'Peach', color: '#f0a870' },
  { id: 'plum', label: 'Plum', color: '#6a2850' },
  { id: 'brown_rose', label: 'Brown Rose', color: '#8a4848' },
  { id: 'gloss_clear', label: 'Clear Gloss', color: '#f5e0d8' },
];

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
  blush: true,
  lashes: true,
  lipColor: 'pink_soft',
};

const CATEGORIES = [
  { id: 'skin', label: 'Skin', emoji: '✨' },
  { id: 'hair', label: 'Hair', emoji: '💇' },
  { id: 'face', label: 'Face', emoji: '💄' },
  { id: 'top', label: 'Top', emoji: '👕' },
  { id: 'bottom', label: 'Bottom', emoji: '👖' },
  { id: 'shoes', label: 'Shoes', emoji: '👟' },
  { id: 'accessories', label: 'Extras', emoji: '💎' },
  { id: 'bg', label: 'BG', emoji: '🌈' },
];

const HAIR_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'natural', label: 'Natural' },
  { id: 'braided', label: 'Braided' },
  { id: 'straight', label: 'Straight' },
  { id: 'curly', label: 'Curly' },
  { id: 'protective', label: 'Protective' },
];

export default function AvatarBuilder({ profile, setProfile, user }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [activeCategory, setActiveCategory] = useState('skin');
  const [hairCat, setHairCat] = useState('all');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ageGroup, setAgeGroup] = useState('glow_girls');

  useEffect(() => {
    if (profile?.avatar_builder_config) {
      try { setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(profile.avatar_builder_config) }); } catch {}
    }
    if (profile?.age_group) setAgeGroup(profile.age_group);
  }, [profile]);

  const update = useCallback((key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const randomize = useCallback(() => {
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const tops = filterByAgeGroup(TOP_STYLES, ageGroup);
    const bots = filterByAgeGroup(BOTTOM_STYLES, ageGroup);
    const shoes = filterByAgeGroup(SHOE_STYLES, ageGroup);
    const acc = filterByAgeGroup(ACCESSORIES, ageGroup).filter(a => a.id !== 'none');
    setConfig({
      ...DEFAULT_CONFIG,
      skinTone: pick(SKIN_TONES).id,
      hairColor: pick(HAIR_COLORS).id,
      hairStyle: pick(HAIR_STYLES).id,
      eyeStyle: pick(EYE_STYLES).id,
      eyeColor: pick(EYE_COLORS).id,
      eyebrowStyle: pick(EYEBROW_STYLES).id,
      topStyle: pick(tops).id,
      topColor: pick(CLOTHING_COLORS).id,
      bottomStyle: pick(bots).id,
      bottomColor: pick(CLOTHING_COLORS).id,
      shoeStyle: pick(shoes).id,
      shoeColor: pick(CLOTHING_COLORS).id,
      accessory: pick(acc).id,
      blush: Math.random() > 0.4,
      lashes: true,
      lipColor: pick(LIP_COLORS).id,
    });
    setSaved(false);
  }, [ageGroup]);

  const handleSave = async () => {
    setSaving(true);
    const configStr = JSON.stringify(config);
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { avatar_builder_config: configStr });
    } else if (user) {
      const np = await base44.entities.UserProfile.create({ user_email: user.email, avatar_builder_config: configStr });
      setProfile(np);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── Color Swatch ──────────────────────────────────────────────────────────────
  const ColorSwatch = ({ c, selected, onSelect }) => {
    const isGrad = typeof c.color === 'string' && c.color.includes('gradient');
    return (
      <button onClick={() => onSelect(c.id)} title={c.label}
        className="relative flex-shrink-0 transition-all active:scale-90"
        style={{ width: 36, height: 36, borderRadius: '50%' }}>
        <div className="w-full h-full rounded-full"
          style={{
            background: isGrad ? 'linear-gradient(135deg,#ff69b4,#9b59b6,#3498db)' : c.color,
            border: selected === c.id ? '3px solid white' : '3px solid transparent',
            boxShadow: selected === c.id ? `0 0 0 2px #ec4899, 0 3px 10px rgba(0,0,0,0.4)` : '0 2px 8px rgba(0,0,0,0.35)',
          }}/>
        {selected === c.id && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center">
            <Check size={13} className="text-white drop-shadow" strokeWidth={3}/>
          </div>
        )}
      </button>
    );
  };

  // ── Option Pill ───────────────────────────────────────────────────────────────
  const OptionPill = ({ option, selected, onSelect }) => {
    const isSelected = selected === option.id;
    return (
      <button onClick={() => onSelect(option.id)}
        className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl transition-all active:scale-95"
        style={{
          background: isSelected ? 'linear-gradient(135deg,rgba(236,72,153,0.3),rgba(168,85,247,0.25))' : 'rgba(255,255,255,0.05)',
          border: `1.5px solid ${isSelected ? 'rgba(236,72,153,0.7)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: isSelected ? '0 0 12px rgba(236,72,153,0.25)' : 'none',
          minWidth: 64,
        }}>
        <span style={{ fontSize: 22 }}>{option.emoji}</span>
        <span style={{ fontSize: 9.5, color: isSelected ? '#fff' : '#9ca3af', fontWeight: isSelected ? 700 : 500, textAlign: 'center', lineHeight: 1.2, maxWidth: 62 }}>{option.label}</span>
        {isSelected && <div className="w-1 h-1 rounded-full bg-pink-400 mt-0.5"/>}
      </button>
    );
  };

  // ── Toggle Switch ─────────────────────────────────────────────────────────────
  const Toggle = ({ value, onChange, label, emoji }) => (
    <div className="flex items-center justify-between px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-2">
        <span>{emoji}</span>
        <span className="text-sm font-semibold text-white">{label}</span>
      </div>
      <button onClick={() => onChange(!value)}
        className="relative transition-all"
        style={{ width: 46, height: 26, borderRadius: 13, background: value ? 'linear-gradient(135deg,#ec4899,#a855f7)' : 'rgba(255,255,255,0.12)', boxShadow: value ? '0 0 10px rgba(236,72,153,0.4)' : 'none' }}>
        <div className="absolute top-1 transition-all" style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', left: value ? 25 : 3, boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}/>
      </button>
    </div>
  );

  // ── Skin Tone Picker ──────────────────────────────────────────────────────────
  const SkinPicker = () => (
    <div>
      <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-widest">Skin Tone</p>
      <div className="flex flex-wrap gap-3">
        {SKIN_TONES.map(s => {
          const isSelected = config.skinTone === s.id;
          return (
            <button key={s.id} onClick={() => update('skinTone', s.id)}
              className="relative flex flex-col items-center gap-1 transition-all active:scale-90">
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: s.color,
                border: isSelected ? '3px solid white' : '3px solid transparent',
                boxShadow: isSelected ? `0 0 0 2.5px #ec4899, 0 4px 14px rgba(0,0,0,0.4)` : '0 3px 10px rgba(0,0,0,0.4)',
              }}/>
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ top: 0, height: 44 }}>
                  <Check size={14} className="text-white drop-shadow" strokeWidth={3}/>
                </div>
              )}
              <span style={{ fontSize: 9, color: isSelected ? '#ec4899' : '#6b7280', fontWeight: isSelected ? 700 : 400, textAlign: 'center', maxWidth: 44, lineHeight: 1.2 }}>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Render category content ───────────────────────────────────────────────────
  const renderContent = () => {
    const tops  = filterByAgeGroup(TOP_STYLES, ageGroup);
    const bots  = filterByAgeGroup(BOTTOM_STYLES, ageGroup);
    const shoes = filterByAgeGroup(SHOE_STYLES, ageGroup);
    const acc   = filterByAgeGroup(ACCESSORIES, ageGroup);

    switch (activeCategory) {
      case 'skin': return <SkinPicker/>;

      case 'hair':
        return (
          <div className="space-y-4">
            {/* Hair category filter */}
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-widest">Style</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {HAIR_CATEGORIES.map(hc => (
                  <button key={hc.id} onClick={() => setHairCat(hc.id)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition"
                    style={{ background: hairCat === hc.id ? 'linear-gradient(135deg,#ec4899,#a855f7)' : 'rgba(255,255,255,0.06)', color: hairCat === hc.id ? 'white' : '#9ca3af', border: `1px solid ${hairCat === hc.id ? 'transparent' : 'rgba(255,255,255,0.08)'}` }}>
                    {hc.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 overflow-x-auto pt-3 pb-1" style={{ scrollbarWidth: 'none' }}>
                {HAIR_STYLES.filter(h => hairCat === 'all' || h.category === hairCat).map(h => (
                  <OptionPill key={h.id} option={h} selected={config.hairStyle} onSelect={id => update('hairStyle', id)}/>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-widest">Color</p>
              <div className="flex flex-wrap gap-3">
                {HAIR_COLORS.map(c => <ColorSwatch key={c.id} c={c} selected={config.hairColor} onSelect={id => update('hairColor', id)}/>)}
              </div>
            </div>
          </div>
        );

      case 'face':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-widest">Eye Shape</p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {EYE_STYLES.map(e => <OptionPill key={e.id} option={e} selected={config.eyeStyle} onSelect={id => update('eyeStyle', id)}/>)}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-widest">Eye Color</p>
              <div className="flex flex-wrap gap-3">
                {EYE_COLORS.map(c => <ColorSwatch key={c.id} c={c} selected={config.eyeColor} onSelect={id => update('eyeColor', id)}/>)}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-widest">Eyebrows</p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {EYEBROW_STYLES.map(b => <OptionPill key={b.id} option={b} selected={config.eyebrowStyle} onSelect={id => update('eyebrowStyle', id)}/>)}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-widest">Lip Color</p>
              <div className="flex flex-wrap gap-3">
                {LIP_COLORS.map(c => <ColorSwatch key={c.id} c={c} selected={config.lipColor} onSelect={id => update('lipColor', id)}/>)}
              </div>
            </div>
            <div className="space-y-2.5 pt-1">
              <Toggle value={config.lashes} onChange={v => update('lashes', v)} label="Lashes" emoji="👁️"/>
              <Toggle value={config.blush} onChange={v => update('blush', v)} label="Blush" emoji="🌸"/>
            </div>
          </div>
        );

      case 'top':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-widest">Style</p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {tops.map(t => <OptionPill key={t.id} option={t} selected={config.topStyle} onSelect={id => update('topStyle', id)}/>)}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-widest">Color</p>
              <div className="flex flex-wrap gap-3">
                {CLOTHING_COLORS.map(c => <ColorSwatch key={c.id} c={c} selected={config.topColor} onSelect={id => update('topColor', id)}/>)}
              </div>
            </div>
          </div>
        );

      case 'bottom':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-widest">Style</p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {bots.map(b => <OptionPill key={b.id} option={b} selected={config.bottomStyle} onSelect={id => update('bottomStyle', id)}/>)}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-widest">Color</p>
              <div className="flex flex-wrap gap-3">
                {CLOTHING_COLORS.map(c => <ColorSwatch key={c.id} c={c} selected={config.bottomColor} onSelect={id => update('bottomColor', id)}/>)}
              </div>
            </div>
          </div>
        );

      case 'shoes':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-widest">Style</p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {shoes.map(s => <OptionPill key={s.id} option={s} selected={config.shoeStyle} onSelect={id => update('shoeStyle', id)}/>)}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-widest">Color</p>
              <div className="flex flex-wrap gap-3">
                {CLOTHING_COLORS.map(c => <ColorSwatch key={c.id} c={c} selected={config.shoeColor} onSelect={id => update('shoeColor', id)}/>)}
              </div>
            </div>
          </div>
        );

      case 'accessories':
        return (
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-widest">Accessory</p>
            <div className="flex gap-2 flex-wrap">
              {acc.map(a => <OptionPill key={a.id} option={a} selected={config.accessory} onSelect={id => update('accessory', id)}/>)}
            </div>
          </div>
        );

      case 'bg':
        return (
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-widest">Background</p>
            <div className="flex flex-wrap gap-3">
              {BG_COLORS.map(c => <ColorSwatch key={c.id} c={c} selected={config.bg} onSelect={id => update('bg', id)}/>)}
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="flex flex-col items-center w-full" style={{ fontFamily: '"DM Sans","Inter",sans-serif' }}>
      
      {/* ── Avatar Preview ─────────────────────────────────────────────── */}
      <div className="relative mb-5">
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)', transform: 'scale(1.15)', filter: 'blur(16px)' }}/>
        <div className="relative rounded-full overflow-hidden" style={{ boxShadow: '0 0 0 3px rgba(236,72,153,0.4), 0 12px 40px rgba(0,0,0,0.5)' }}>
          <AvatarPreview config={config} size={220}/>
        </div>
        {/* Randomize floating button */}
        <button onClick={randomize}
          className="absolute -bottom-2 -right-2 w-11 h-11 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"
          style={{ background: 'linear-gradient(135deg,#1a0a2e,#2a1040)', border: '1.5px solid rgba(236,72,153,0.5)' }}>
          <Shuffle size={16} className="text-pink-400"/>
        </button>
      </div>

      {/* ── Save Button ─────────────────────────────────────────────────── */}
      <button onClick={handleSave} disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white mb-5 transition-all active:scale-98 disabled:opacity-60"
        style={{ maxWidth: 320, background: saved ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#c44a55,#e8526d,#ff6a75)', boxShadow: saved ? '0 6px 20px rgba(34,197,94,0.35)' : '0 8px 28px rgba(232,82,109,0.45)', fontSize: 15, letterSpacing: '-.2px' }}>
        {saving ? <Loader2 size={16} className="animate-spin"/> : saved ? <Check size={16}/> : <Save size={16}/>}
        {saving ? 'Saving your glow...' : saved ? '✓ Saved!' : 'Save Avatar'}
      </button>

      {/* ── Category Tabs ──────────────────────────────────────────────── */}
      <div className="w-full mb-4" style={{ maxWidth: 380 }}>
        <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className="flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all"
                style={{
                  background: isActive ? 'linear-gradient(135deg,rgba(236,72,153,0.25),rgba(168,85,247,0.2))' : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${isActive ? 'rgba(236,72,153,0.5)' : 'rgba(255,255,255,0.07)'}`,
                  minWidth: 52,
                }}>
                <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                <span style={{ fontSize: 9, color: isActive ? '#fff' : '#6b7280', fontWeight: isActive ? 700 : 500 }}>{cat.label}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-pink-400"/>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Options Panel ──────────────────────────────────────────────── */}
      <div className="w-full rounded-3xl p-4 mb-4" style={{ maxWidth: 380, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>
        {renderContent()}
      </div>

      {/* Age info */}
      {ageGroup !== 'glow_women' && (
        <p className="text-xs text-center px-4 pb-4" style={{ color: '#6b7280', maxWidth: 320 }}>
          {ageGroup === 'glow_girls' ? '🔒 Some styles unlock as you grow' : '🔒 Full wardrobe unlocks at 19'}
        </p>
      )}
    </div>
  );
}