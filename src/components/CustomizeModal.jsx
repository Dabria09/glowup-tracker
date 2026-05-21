import { useRef, useState } from 'react';
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
  { id: 'modern', name: 'Modern', desc: 'Your glow era starts now.' },
  { id: 'elegant', name: 'Elegant', desc: 'Your glow era starts now.' },
  { id: 'playful', name: 'Playful', desc: 'Your glow era starts now.' },
  { id: 'bold', name: 'Bold', desc: 'Your glow era starts now.' },
  { id: 'classic', name: 'Classic', desc: 'Your glow era starts now.' },
];

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'es', name: 'Español', flag: '🇪🇸', native: 'Spanish' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', native: 'French' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', native: 'Portuguese' },
  { code: 'ht', name: 'Kreyòl Ayisyen', flag: '🇭🇹', native: 'Haitian Creole' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', native: 'German' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', native: 'Arabic' },
];

export default function CustomizeModal({
  bgColor, setBgColor,
  bgPattern, setBgPattern,
  bgImage, setBgImage,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('color');
  const [selectedTheme, setSelectedTheme] = useState('classic');
  const [selectedFont, setSelectedFont] = useState('modern');
  const [selectedLang, setSelectedLang] = useState('en');
  const [photoUrl, setPhotoUrl] = useState(null);
  const fileRef = useRef();

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
            <div className="grid grid-cols-2 gap-3">
              {COLOR_THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-4 rounded-2xl border-2 transition text-left ${
                    selectedTheme === theme.id
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.color }} />
                    <span className="font-semibold text-white text-sm">{theme.name}</span>
                  </div>
                  <p className="text-xs text-gray-400">{theme.desc}</p>
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
                  className={`p-4 rounded-2xl border-2 transition text-left ${
                    bgPattern === pattern.id
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-3xl mb-2">{pattern.emoji}</div>
                  <p className="font-semibold text-white text-sm">{pattern.label}</p>
                  <p className="text-xs text-gray-400">{pattern.desc}</p>
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
            
            <div className="bg-gray-800/50 rounded-2xl p-6 flex flex-col items-center mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-2">
                {bgImage ? (
                  <img src={bgImage} alt="preview" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-3xl">🖼️</span>
                )}
              </div>
              <p className="text-sm font-semibold text-white">{bgImage ? 'Preview' : 'Preview'}</p>
              <p className="text-xs text-gray-400">{bgImage ? 'Background photo set' : 'No background photo'}</p>
            </div>

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

            <button className="w-full py-3 rounded-2xl border border-gray-700 text-white font-semibold text-sm">
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
                  onClick={() => setSelectedFont(font.id)}
                  className={`w-full p-4 rounded-2xl border-2 transition text-left ${
                    selectedFont === font.id
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <p className={`font-semibold text-white text-lg ${selectedFont === font.id ? 'text-pink-400' : ''}`}>{font.name}</p>
                  <p className="text-xs text-gray-400">{font.desc}</p>
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
                { icon: 'Abc', title: 'Large Text', desc: 'Increase text size throughout the app' },
                { icon: '◐◑', title: 'High Contrast', desc: 'Stronger color contrast for readability' },
                { icon: '📼', title: 'Reduce Motion', desc: 'Minimize animations and transitions' },
                { icon: '📳', title: 'Haptic Feedback', desc: 'Vibration on key interactions' },
                { icon: '🔊', title: 'Sound Effects', desc: 'Play sounds for achievements and alerts' },
                { icon: '🎙️', title: 'Screen Reader Support', desc: 'Optimized for VoiceOver and TalkBack' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-pink-400 w-6 text-center">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-white text-sm">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                  <div className="w-12 h-6 rounded-full bg-gray-700 relative cursor-pointer">
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-bold text-pink-400">Α</span>
                <p className="font-semibold text-white">Text Size</p>
              </div>
              <p className="text-xs text-gray-400 mb-3">Adjust the base font size for the app.</p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">A</span>
                <div className="flex-1 h-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600">
                  <div className="w-1/2 h-1 rounded-full bg-white" />
                </div>
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