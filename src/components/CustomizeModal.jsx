import { useRef, useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const COLOR_THEMES = [
  { id: 'classic', name: 'GGU Classic', emoji: '🏅', color: '#8b2d88', desc: 'The original dark plum & pink' },
  { id: 'soft_pink', name: 'Soft Pink', emoji: '💖', color: '#ec4899', desc: 'Blush & rose gold vibes' },
  { id: 'lavender', name: 'Lavender Dream', emoji: '💜', color: '#a855f7', desc: 'Soft purple & lilac' },
  { id: 'mint', name: 'Mint Fresh', emoji: '🌿', color: '#10b981', desc: 'Cool mint & teal energy' },
  { id: 'sunset', name: 'Sunset Glow', emoji: '🧡', color: '#f97316', desc: 'Warm orange & coral fire' },
  { id: 'ocean', name: 'Ocean Blue', emoji: '🌊', color: '#0ea5e9', desc: 'Deep ocean & sapphire' },
  { id: 'golden', name: 'Golden Hour', emoji: '✨', color: '#eab308', desc: 'Gold & champagne luxury' },
  { id: 'midnight', name: 'Midnight Black', emoji: '🌙', color: '#1f2937', desc: 'Pure dark, minimal & sleek' },
  { id: 'rose', name: 'Rose Gold', emoji: '🌹', color: '#be185d', desc: 'Warm rose & blush' },
  { id: 'forest', name: 'Forest', emoji: '🌲', color: '#065f46', desc: 'Deep forest green & emerald' },
  { id: 'neon', name: 'Neon Night', emoji: '⚡', color: '#d946ef', desc: 'Electric neon on black' },
  { id: 'cotton', name: 'Cotton Candy', emoji: '🍭', color: '#f0abfc', desc: 'Pastel pink & baby blue' },
  { id: 'cherry', name: 'Cherry Blossom', emoji: '🌺', color: '#fb7185', desc: 'Soft cherry & petal pink' },
  { id: 'sky', name: 'Sky Dreams', emoji: '☁️', color: '#38bdf8', desc: 'Baby blue & cloud white' },
  { id: 'peach', name: 'Peach Glow', emoji: '🍑', color: '#fdba74', desc: 'Warm peachy sweet vibes' },
  { id: 'grape', name: 'Grape Crush', emoji: '🍇', color: '#7c3aed', desc: 'Bold grape & violet' },
  { id: 'coral', name: 'Coral Reef', emoji: '🪸', color: '#f43f5e', desc: 'Vivid coral & red energy' },
  { id: 'ice', name: 'Ice Queen', emoji: '🧊', color: '#67e8f9', desc: 'Cool ice & crystal blue' },
  { id: 'mocha', name: 'Mocha Latte', emoji: '☕', color: '#92400e', desc: 'Cozy warm brown & cream' },
  { id: 'galaxy', name: 'Galaxy', emoji: '🌌', color: '#4f46e5', desc: 'Deep space indigo & stars' },
  { id: 'ruby', name: 'Ruby Red', emoji: '💎', color: '#dc2626', desc: 'Bold ruby & crimson' },
  { id: 'sage', name: 'Sage Garden', emoji: '🌱', color: '#84cc16', desc: 'Earthy sage & olive green' },
  { id: 'bubblegum', name: 'Bubblegum', emoji: '🫧', color: '#f9a8d4', desc: 'Sweet bubblegum pink' },
  { id: 'holographic', name: 'Holographic', emoji: '🌈', color: '#818cf8', desc: 'Iridescent pastel rainbow' },
];

const PATTERNS = [
  { id: 'none', label: 'Clean', emoji: '✨', desc: 'No pattern, clean look' },
  { id: 'stars', label: 'Stars', emoji: '⭐', desc: 'Twinkling star pattern' },
  { id: 'hearts', label: 'Hearts', emoji: '💗', desc: 'Scattered hearts' },
  { id: 'sparkles', label: 'Sparkles', emoji: '✦', desc: 'Golden sparkle dots' },
  { id: 'flowers', label: 'Flowers', emoji: '🌸', desc: 'Soft floral pattern' },
  { id: 'butterflies', label: 'Butterflies', emoji: '🦋', desc: 'Floating butterfly shapes' },
  { id: 'diamonds', label: 'Diamonds', emoji: '💎', desc: 'Diamond grid pattern' },
  { id: 'crowns', label: 'Crowns', emoji: '👑', desc: 'Royal crown pattern' },
  { id: 'dots', label: 'Polka Dots', emoji: '⚪', desc: 'Subtle dot grid' },
  { id: 'moons', label: 'Moons', emoji: '🌙', desc: 'Crescent moon pattern' },
  { id: 'lightning', label: 'Lightning', emoji: '⚡', desc: 'Electric energy bolts' },
  { id: 'fire', label: 'Fire', emoji: '🔥', desc: 'Flame pattern' },
  { id: 'snowflakes', label: 'Snowflakes', emoji: '❄️', desc: 'Icy snowflake pattern' },
  { id: 'music', label: 'Music Notes', emoji: '♪', desc: 'Musical note pattern' },
  { id: 'rainbow', label: 'Rainbows', emoji: '🌈', desc: 'Rainbow arch pattern' },
  { id: 'clouds', label: 'Clouds', emoji: '☁️', desc: 'Fluffy cloud pattern' },
  { id: 'paws', label: 'Paw Prints', emoji: '🐾', desc: 'Cute paw print pattern' },
  { id: 'lips', label: 'Lips', emoji: '💋', desc: 'Glamorous lip print' },
  { id: 'eyes', label: 'Evil Eye', emoji: '🧿', desc: 'Protective evil eye' },
];

const FONT_STYLES = [
  { id: 'modern', name: 'Modern', family: "'Outfit', sans-serif", google: 'Outfit:wght@400;600;700', desc: 'Your glow era starts now.' },
  { id: 'elegant', name: 'Elegant', family: "'Playfair Display', serif", google: 'Playfair+Display:wght@400;600;700', desc: 'Your glow era starts now.' },
  { id: 'playful', name: 'Playful', family: "'Nunito', sans-serif", google: 'Nunito:wght@400;600;800', desc: 'Your glow era starts now.' },
  { id: 'bold', name: 'Bold', family: "'Montserrat', sans-serif", google: 'Montserrat:wght@400;700;900', desc: 'Your glow era starts now.' },
  { id: 'classic', name: 'Classic', family: "'Lora', serif", google: 'Lora:wght@400;600;700', desc: 'Your glow era starts now.' },
];

const loadAndApplyFont = (font) => {
  const linkId = `gfont-${font.id}`;
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`;
    document.head.appendChild(link);
  }
  document.body.style.fontFamily = font.family;
};

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'es', name: 'Español', flag: '🇪🇸', native: 'Spanish' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', native: 'French' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', native: 'Portuguese' },
  { code: 'ht', name: 'Kreyòl Ayisyen', flag: '🇭🇹', native: 'Haitian Creole' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', native: 'German' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', native: 'Arabic' },
];

const PATTERN_SVGS = {
  stars: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='10' y='42' font-size='30' fill='rgba(255,255,255,0.18)'>&#9733;</text></svg>",
  hearts: "<svg xmlns='http://www.w3.org/2000/svg' width='55' height='55'><text x='8' y='40' font-size='28' fill='rgba(255,255,255,0.18)'>&#9829;</text></svg>",
  sparkles: "<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><text x='5' y='36' font-size='26' fill='rgba(255,255,255,0.2)'>&#10022;</text></svg>",
  flowers: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='8' y='42' font-size='30' fill='rgba(255,255,255,0.18)'>&#10047;</text></svg>",
  butterflies: "<svg xmlns='http://www.w3.org/2000/svg' width='65' height='65'><text x='6' y='46' font-size='32' fill='rgba(255,255,255,0.07)'>&#129419;</text></svg>",
  diamonds: "<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><polygon points='22,3 41,22 22,41 3,22' fill='rgba(255,255,255,0.16)'/></svg>",
  crowns: "<svg xmlns='http://www.w3.org/2000/svg' width='65' height='65'><text x='8' y='46' font-size='32' fill='rgba(255,255,255,0.07)'>&#128081;</text></svg>",
  dots: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='2' fill='rgba(255,255,255,0.16)'/></svg>",
  moons: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='8' y='42' font-size='30' fill='rgba(255,255,255,0.18)'>&#9790;</text></svg>",
  lightning: "<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><text x='8' y='38' font-size='26' fill='rgba(255,255,255,0.07)'>&#9889;</text></svg>",
  fire: "<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><text x='8' y='38' font-size='26' fill='rgba(255,255,255,0.07)'>&#128293;</text></svg>",
  snowflakes: "<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50'><text x='5' y='38' font-size='28' fill='rgba(255,255,255,0.20)'>&#10052;</text></svg>",
  music: "<svg xmlns='http://www.w3.org/2000/svg' width='55' height='55'><text x='6' y='40' font-size='28' fill='rgba(255,255,255,0.18)'>&#9834;</text></svg>",
  rainbow: "<svg xmlns='http://www.w3.org/2000/svg' width='65' height='55'><text x='4' y='42' font-size='30' fill='rgba(255,255,255,0.07)'>&#127752;</text></svg>",
  clouds: "<svg xmlns='http://www.w3.org/2000/svg' width='70' height='50'><text x='4' y='36' font-size='30' fill='rgba(255,255,255,0.07)'>&#9729;</text></svg>",
  paws: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='8' y='42' font-size='28' fill='rgba(255,255,255,0.18)'>&#128062;</text></svg>",
  lips: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='6' y='42' font-size='28' fill='rgba(255,255,255,0.07)'>&#128139;</text></svg>",
  eyes: "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><text x='6' y='42' font-size='28' fill='rgba(255,255,255,0.18)'>&#129535;</text></svg>",
};

const getPatternBg = (patternId) => {
  if (!patternId || patternId === 'none' || !PATTERN_SVGS[patternId]) return {};
  return { backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(PATTERN_SVGS[patternId])}")` };
};

export default function CustomizeModal({
  bgColor, setBgColor,
  bgPattern, setBgPattern,
  bgImage, setBgImage,
  bgImagePos, setBgImagePos,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('color');
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    largeText: false,
    highContrast: false,
    reduceMotion: false,
    hapticFeedback: true,
    soundEffects: true,
    screenReader: false,
  });
  const [textSize, setTextSize] = useState(100);

  const handleTextSize = (val) => {
    setTextSize(val);
    document.documentElement.style.fontSize = (val / 100) * 16 + 'px';
  };

  const applyAccessibility = (settings) => {
    document.body.classList.toggle('large-text', settings.largeText);
    document.body.classList.toggle('high-contrast', settings.highContrast);
    document.body.classList.toggle('reduce-motion', settings.reduceMotion);
    document.body.classList.toggle('screen-reader', settings.screenReader);
    if (settings.hapticFeedback && navigator.vibrate) navigator.vibrate(10);
  };

  const toggleAccessibility = (key) => {
    setAccessibilitySettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      applyAccessibility(next);
      if (key === 'soundEffects' && !prev[key]) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 880; g.gain.setValueAtTime(0.1, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        o.start(); o.stop(ctx.currentTime + 0.2);
      }
      return next;
    });
  };
  const [selectedTheme, setSelectedTheme] = useState('classic');
  const [selectedFont, setSelectedFont] = useState('modern');
  const [selectedLang, setSelectedLang] = useState('en');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
      if (profiles.length && profiles[0].avatar_url) {
        setPhotoUrl(profiles[0].avatar_url);
        setProfileId(profiles[0].id);
      }
    }).catch(() => {});
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setBgImage(file_url);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setPhotoUrl(file_url);
    if (profileId) {
      await base44.entities.UserProfile.update(profileId, { avatar_url: file_url });
    } else {
      const u = await base44.auth.me();
      const p = await base44.entities.UserProfile.create({ user_email: u.email, avatar_url: file_url });
      setProfileId(p.id);
    }
  };

  const Tabs = [
    { id: 'color', label: '🎨 Color Theme', icon: '🎨' },
    { id: 'pattern', label: '🌟 Pattern', icon: '🌟' },
    { id: 'bg_photo', label: '📸 BG Photo', icon: '📸' },
    { id: 'my_photo', label: '🖼️ My Photo', icon: '🖼️' },
    { id: 'language', label: '🌐 Language & Display', icon: '🌐' },
    { id: 'font', label: '✍️ Font Style', icon: '✍️' },
    { id: 'notifications', label: '🔔 Notifications', icon: '🔔' },
    { id: 'privacy', label: '🔒 Privacy', icon: '🔒' },
    { id: 'accessibility', label: '♿ Accessibility', icon: '♿' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-[#130a10] rounded-t-3xl p-5 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Customize My App 🎨</h2>
            <p className="text-xs text-gray-400">Make it yours ✨</p>
          </div>
          <button onClick={onClose}><X size={24} className="text-gray-400" /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          {Tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Color Theme Tab */}
        {activeTab === 'color' && (
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Choose Your Color Theme</h3>
            {/* Live Preview */}
            {(() => {
              const t = COLOR_THEMES.find(t => t.id === selectedTheme);
              return t ? (
                <div className="mb-5 rounded-2xl border border-white/10 backdrop-blur-md overflow-hidden" style={{ backgroundColor: t.color + '18' }}>
                  <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                    <span className="text-pink-400 text-xs">🎨</span>
                    <span className="text-xs font-bold tracking-widest text-white/50">LIVE PREVIEW</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-12 h-12 rounded-full shadow-lg flex-shrink-0" style={{ background: `radial-gradient(circle at 35% 35%, white 0%, ${t.color} 60%)` }} />
                    <div>
                      <p className="font-bold text-white text-base">{t.emoji} {t.name}</p>
                      <p className="text-xs text-white/50">{t.desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 px-4 pb-4">
                    <button className="flex-1 py-2 rounded-full text-sm font-bold text-white" style={{ backgroundColor: t.color }}>Sample Button</button>
                    <button className="flex-1 py-2 rounded-full text-sm font-semibold text-white/70 border border-white/15">Secondary</button>
                  </div>
                </div>
              ) : null;
            })()}
            <div className="grid grid-cols-2 gap-3">
              {COLOR_THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => { setSelectedTheme(theme.id); setBgColor(theme.color); }}
                  className={`p-4 rounded-2xl border-2 transition text-left relative overflow-hidden backdrop-blur-md ${
                    selectedTheme === theme.id
                      ? 'border-pink-500'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  style={{ backgroundColor: theme.color + '18' }}
                >
                  {selectedTheme === theme.id && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full shadow-lg" style={{ backgroundColor: theme.color }} />
                    <span className="font-semibold text-white text-sm">{theme.emoji} {theme.name}</span>
                  </div>
                  <p className="text-xs text-white/50">{theme.desc}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">✨ Your theme and settings are saved automatically</p>
          </div>
        )}

        {/* Pattern Tab */}
        {activeTab === 'pattern' && (
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Choose a Background Pattern</h3>
            <div className="grid grid-cols-2 gap-3">
              {PATTERNS.map(pattern => (
                <button
                  key={pattern.id}
                  onClick={() => setBgPattern(pattern.id)}
                  className={`p-4 rounded-2xl border-2 transition text-left relative overflow-hidden ${
                    bgPattern === pattern.id
                      ? 'border-pink-500'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  style={{ backgroundColor: '#1a0a18', ...getPatternBg(pattern.id) }}
                >
                  {bgPattern === pattern.id && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
                  )}
                  <div className="text-3xl mb-2">{pattern.emoji}</div>
                  <p className="font-semibold text-white text-sm">{pattern.label}</p>
                  <p className="text-xs text-gray-300/70">{pattern.desc}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">✨ Your theme and settings are saved automatically</p>
          </div>
        )}

        {/* BG Photo Tab */}
        {activeTab === 'bg_photo' && (
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Background Photo</h3>
            <p className="text-sm text-gray-400 mb-4">Upload your own photo to use as a soft background across the whole app — just like the star patterns.</p>
            
            {/* Live preview */}
            <div className="mb-4 rounded-2xl overflow-hidden relative" style={{ height: 160, background: '#0d0d0d' }}>
              {bgImage ? (
                <img
                  src={bgImage}
                  alt="bg preview"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: `${bgImagePos?.x ?? 50}% ${bgImagePos?.y ?? 50}%` }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">No photo selected</div>
              )}
            </div>

            {bgImage && setBgImagePos && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 mb-4">
                <p className="text-sm font-semibold text-white mb-3">📐 Position</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Horizontal</span><span>{bgImagePos?.x ?? 50}%</span></div>
                    <input type="range" min={0} max={100} value={bgImagePos?.x ?? 50} onChange={e => setBgImagePos(p => ({ ...p, x: Number(e.target.value) }))} className="w-full accent-pink-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Vertical</span><span>{bgImagePos?.y ?? 50}%</span></div>
                    <input type="range" min={0} max={100} value={bgImagePos?.y ?? 50} onChange={e => setBgImagePos(p => ({ ...p, y: Number(e.target.value) }))} className="w-full accent-pink-500" />
                  </div>
                </div>
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <button
              onClick={() => fileRef.current.click()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm mb-3 hover:opacity-90"
            >
              📸 Choose Photo from Camera Roll
            </button>

            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-3 mb-4 text-xs text-gray-400">
              📸 Your photo will appear as a soft, faded background across the whole app. It blends with your color theme and won't make text hard to read.
            </div>

            <p className="text-xs text-gray-500 text-center">✨ Your theme and settings are saved automatically</p>
          </div>
        )}

        {/* My Photo Tab */}
        {activeTab === 'my_photo' && (
          <div>
            <h3 className="text-lg font-bold text-white mb-4">My Photo</h3>
            
            <div className="bg-gray-800/50 rounded-2xl p-6 flex flex-col items-center mb-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center border-4 border-pink-500 mb-3">
                {photoUrl ? (
                  <img src={photoUrl} alt="profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-5xl">📸</span>
                )}
              </div>
              <p className="text-sm font-semibold text-white">Your current profile photo</p>
            </div>

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            <button
              onClick={() => fileRef.current.click()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm mb-3 hover:opacity-90"
            >
              📸 Choose New Photo
            </button>

            <button className="w-full py-3 rounded-2xl border border-red-900/50 text-red-400 font-semibold text-sm mb-3 hover:bg-red-900/10">
              🗑️ Remove Photo (use avatar instead)
            </button>

            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-3 mb-3 text-xs text-gray-400">
              📸 Your photo will appear on your Home screen in place of your avatar. You can still customize your avatar at any time from the My Avatar page.
            </div>

            <button
              onClick={() => { onClose(); window.location.href = '/avatar'; }}
              className="w-full py-3 rounded-2xl border border-gray-700 text-white font-semibold text-sm hover:bg-gray-800 transition"
            >
              👤 Go to Avatar Creator
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">✨ Your theme and settings are saved automatically</p>
          </div>
        )}

        {/* Language Tab */}
        {activeTab === 'language' && (
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Language / Idioma / Langue</h3>
            <p className="text-xs text-gray-400 mb-4">Choose the language for the app interface</p>
            
            <div className="space-y-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`w-full p-4 rounded-2xl border-2 transition text-left flex items-center gap-3 ${
                    selectedLang === lang.code
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <p className="font-semibold text-white">{lang.name}</p>
                    <p className="text-xs text-gray-400">{lang.native}</p>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">✨ Your theme and settings are saved automatically</p>
          </div>
        )}

        {/* Font Style Tab */}
        {activeTab === 'font' && (
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Font Style</h3>
            <p className="text-xs text-gray-400 mb-4">Choose a font that feels like you.</p>
            
            <div className="space-y-2">
              {FONT_STYLES.map(font => (
                <button
                  key={font.id}
                  onClick={() => { setSelectedFont(font.id); loadAndApplyFont(font); }}
                  className={`w-full p-4 rounded-2xl border-2 transition text-left ${
                    selectedFont === font.id
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <p className={`font-semibold text-white text-lg ${selectedFont === font.id ? 'text-pink-400' : ''}`} style={{ fontFamily: font.family }}>{font.name}</p>
                  <p className="text-xs text-gray-400" style={{ fontFamily: font.family }}>{font.desc}</p>
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">✨ Your theme and settings are saved automatically</p>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div>
            <h3 className="text-lg font-bold text-white mb-2">🔔 Notification Settings</h3>
            <p className="text-xs text-gray-400 mb-4">Control what you hear from us.</p>
            
            <div className="space-y-3">
              {[
                { icon: '📋', title: 'Daily Check-In Reminder', desc: 'Remind me to check in each day' },
                { icon: '🏅', title: 'Badge Earned', desc: 'When you unlock a new badge' },
                { icon: '🔥', title: 'Challenge Updates', desc: 'Progress and completion alerts' },
                { icon: '💬', title: 'New Messages', desc: 'When someone sends you a message' },
                { icon: '🎧', title: 'Glow Talk Rooms', desc: 'When a room you RSVP\'d starts' },
                { icon: '📊', title: 'Weekly Glow Report', desc: 'Your weekly progress summary' },
                { icon: '❤️', title: 'Shout-Outs', desc: 'When someone shouts you out' },
                { icon: '👩‍🏫', title: 'Mentor Messages', desc: 'Messages from your mentor' },
              ].map((notif, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{notif.icon}</span>
                    <div>
                      <p className="font-semibold text-white text-sm">{notif.title}</p>
                      <p className="text-xs text-gray-400">{notif.desc}</p>
                    </div>
                  </div>
                  <div className="w-12 h-6 rounded-full bg-pink-500 relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-white" />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">✨ Your theme and settings are saved automatically</p>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div>
            <h3 className="text-lg font-bold text-white mb-2">🔒 Privacy Controls</h3>
            <p className="text-xs text-gray-400 mb-4">You control who sees what.</p>
            
            <div className="space-y-3 mb-6">
              {[
                { icon: '👤', title: 'Public Profile', desc: 'Anyone can view your profile' },
                { icon: '⭐', title: 'Show Glow Score', desc: 'Display your score on your profile' },
                { icon: '🏆', title: 'Appear on Leaderboard', desc: 'Show your name in rankings' },
                { icon: '💬', title: 'Allow Direct Messages', desc: 'Members can message you' },
                { icon: '🟢', title: 'Show Activity Status', desc: 'Others can see when you\'re active' },
                { icon: '📁', title: 'Diary Cloud Backup', desc: 'Back up your diary entries securely' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-white text-sm">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                  <div className="w-12 h-6 rounded-full bg-pink-500 relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-white" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4">
              <p className="font-semibold text-white mb-2">🚫 Blocked Users</p>
              <p className="text-xs text-gray-400 mb-3">Manage who you've blocked from the Community section.</p>
              <button className="w-full py-2 rounded-full border border-gray-700 text-gray-300 text-sm hover:bg-gray-700">
                View Block List
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">✨ Your theme and settings are saved automatically</p>
          </div>
        )}

        {/* Accessibility Tab */}
        {activeTab === 'accessibility' && (
          <div>
            <h3 className="text-lg font-bold text-white mb-2">♿ Accessibility</h3>
            <p className="text-xs text-gray-400 mb-4">Make GGU work best for you.</p>
            
            <div className="space-y-3 mb-6">
              {[
                { icon: 'Aa', key: 'largeText', title: 'Large Text', desc: 'Increase text size throughout the app' },
                { icon: '◑', key: 'highContrast', title: 'High Contrast', desc: 'Stronger color contrast for readability' },
                { icon: '🎞️', key: 'reduceMotion', title: 'Reduce Motion', desc: 'Minimize animations and transitions' },
                { icon: '📳', key: 'hapticFeedback', title: 'Haptic Feedback', desc: 'Vibration on key interactions' },
                { icon: '🔊', key: 'soundEffects', title: 'Sound Effects', desc: 'Play sounds for achievements and alerts' },
                { icon: '🎙️', key: 'screenReader', title: 'Screen Reader Support', desc: 'Optimized for VoiceOver and TalkBack' },
              ].map((item) => {
                const isOn = accessibilitySettings[item.key];
                return (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-pink-400 w-6 text-center">{item.icon}</span>
                      <div>
                        <p className="font-semibold text-white text-sm">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAccessibility(item.key)}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${isOn ? 'bg-pink-500' : 'bg-gray-700'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${isOn ? 'left-6' : 'left-0.5'}`} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-pink-400">Aa</span>
                  <p className="font-semibold text-white">Text Size</p>
                </div>
                <span className="text-xs text-pink-400 font-bold">{textSize}%</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Adjust the base font size for the app.</p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">A</span>
                <input
                  type="range"
                  min={75}
                  max={150}
                  value={textSize}
                  step={5}
                  onChange={e => handleTextSize(Number(e.target.value))}
                  className="flex-1 accent-pink-500"
                />
                <span className="text-lg text-gray-400">A</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center">✨ Your theme and settings are saved automatically</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm mt-6"
        >
          Done
        </button>
      </div>
    </div>
  );
}