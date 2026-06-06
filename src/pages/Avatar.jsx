import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Camera, Upload, Trash2, Sparkles, Crown, Check } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import AestheticIconPicker, { AESTHETIC_ICONS } from '@/components/glow-identity/AestheticIconPicker';
import DiceBearBuilder from '@/components/avatar/DiceBearBuilder';

const IDENTITY_TABS = [
  { id: 'selfie', label: 'Real Selfie', emoji: '📸', desc: 'Your actual photo' },
  { id: 'persona', label: 'Glow Persona', emoji: '✨', desc: 'AI transformation' },
  { id: 'icon', label: 'Aesthetic Icon', emoji: '🎨', desc: 'Express yourself' },
  { id: 'illustrated', label: 'Illustrated', emoji: '🖼️', desc: 'Build your avatar' },
];

export default function Avatar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('selfie');

  // Selfie state
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [zoom, setZoom] = useState(1);
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [positionChanged, setPositionChanged] = useState(false);
  const lastPinchDist = useRef(null);
  const dragStart = useRef(null);
  const fileRef = useRef();

  // Persona state
  const [personaImages, setPersonaImages] = useState({});
  const [activePersonaId, setActivePersonaId] = useState(null);

  // Icon state
  const [selectedIconId, setSelectedIconId] = useState(null);

  // Current identity type
  const [identityType, setIdentityType] = useState('selfie');

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
      if (profiles.length) {
        const p = profiles[0];
        setProfile(p);
        setAvatarUrl(p.avatar_url || null);
        setImgOffset({ x: p.avatar_offset_x || 0, y: p.avatar_offset_y || 0 });
        setZoom(p.avatar_zoom || 1);
        if (p.identity_type) {
          setIdentityType(p.identity_type);
          setActiveTab(p.identity_type === 'persona' ? 'persona' : p.identity_type === 'icon' ? 'icon' : 'selfie');
        }
        if (p.active_persona_id) setActivePersonaId(p.active_persona_id);
        if (p.selected_icon_id) setSelectedIconId(p.selected_icon_id);
        if (p.glow_persona_images) {
          try { setPersonaImages(JSON.parse(p.glow_persona_images).images || {}); } catch {}
        }
      }
    }).catch(() => navigate('/'));
  }, []);

  // ── Selfie drag/zoom logic ────────────────────────────────────────────────────
  const handleDragStart = (e) => {
    if (e.touches && e.touches.length === 2) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX - imgOffset.x, y: clientY - imgOffset.y };
    setIsDragging(true);
    e.preventDefault();
  };

  const handleDragMove = useCallback((e) => {
    if (e.touches && e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastPinchDist.current !== null) {
        const delta = (dist - lastPinchDist.current) / 100;
        setZoom(z => Math.min(4, Math.max(0.5, z + delta)));
        setPositionChanged(true);
      }
      lastPinchDist.current = dist;
      return;
    }
    lastPinchDist.current = null;
    if (!dragStart.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setImgOffset({ x: clientX - dragStart.current.x, y: clientY - dragStart.current.y });
    setPositionChanged(true);
  }, []);

  const handleDragEnd = () => { dragStart.current = null; lastPinchDist.current = null; setIsDragging(false); };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File too large. Max 5 MB.'); return; }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setAvatarUrl(file_url);
    setImgOffset({ x: 0, y: 0 });
    setZoom(1);
    setPositionChanged(false);
    if (profile) await base44.entities.UserProfile.update(profile.id, { avatar_url: file_url, avatar_offset_x: 0, avatar_offset_y: 0, avatar_zoom: 1 });
    else if (user) { const np = await base44.entities.UserProfile.create({ user_email: user.email, avatar_url: file_url, avatar_offset_x: 0, avatar_offset_y: 0, avatar_zoom: 1 }); setProfile(np); }
    setUploading(false);
  };

  const saveSelfie = async () => {
    if (!avatarUrl) return;
    setSaving(true);
    const data = { avatar_url: avatarUrl, avatar_offset_x: imgOffset.x, avatar_offset_y: imgOffset.y, avatar_zoom: zoom, identity_type: 'selfie' };
    if (profile) await base44.entities.UserProfile.update(profile.id, data);
    else if (user) { const np = await base44.entities.UserProfile.create({ user_email: user.email, ...data }); setProfile(np); }
    setIdentityType('selfie');
    setPositionChanged(false);
    setSaving(false);
    setSavedMsg('✅ Saved as your profile picture!');
    setTimeout(() => setSavedMsg(''), 2500);
  };

  const savePersona = async (personaId) => {
    const url = personaImages[personaId];
    if (!url) return;
    setSaving(true);
    const data = { avatar_url: url, identity_type: 'persona', active_persona_id: personaId };
    if (profile) await base44.entities.UserProfile.update(profile.id, data);
    else if (user) { const np = await base44.entities.UserProfile.create({ user_email: user.email, ...data }); setProfile(np); }
    setActivePersonaId(personaId);
    setIdentityType('persona');
    setSaving(false);
    setSavedMsg('✨ Glow Persona set as profile picture!');
    setTimeout(() => setSavedMsg(''), 2500);
  };

  const saveIcon = async (icon) => {
    setSaving(true);
    const data = { avatar_url: null, identity_type: 'icon', selected_icon_id: icon.id };
    if (profile) await base44.entities.UserProfile.update(profile.id, data);
    else if (user) { const np = await base44.entities.UserProfile.create({ user_email: user.email, ...data }); setProfile(np); }
    setSelectedIconId(icon.id);
    setIdentityType('icon');
    setSaving(false);
    setSavedMsg('🎨 Aesthetic icon set as your identity!');
    setTimeout(() => setSavedMsg(''), 2500);
  };

  // Active identity preview
  const currentIcon = AESTHETIC_ICONS.find(i => i.id === selectedIconId);
  const currentPersonaUrl = activePersonaId ? personaImages[activePersonaId] : null;

  const identityPreviewContent = () => {
    if (identityType === 'selfie' && avatarUrl) return <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />;
    if (identityType === 'persona' && currentPersonaUrl) return <img src={currentPersonaUrl} alt="persona" className="w-full h-full object-cover" />;
    if (identityType === 'icon' && currentIcon) return <span className="text-4xl">{currentIcon.emoji}</span>;
    return <span className="text-4xl">✨</span>;
  };

  const identityBg = () => {
    if (identityType === 'icon' && currentIcon) return currentIcon.bg;
    return 'linear-gradient(135deg,#ec4899,#a855f7)';
  };

  const firstName = user?.full_name?.split(' ')[0] || 'You';

  return (
    <div className="min-h-screen bg-[#130a10] text-white pb-40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-300 text-sm">
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Glow Identity</h1>
        <div className="w-16" />
      </div>

      {/* Current Identity Preview */}
      <div className="flex flex-col items-center px-4 pt-4 pb-6">
        <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-3">Your Current Identity</p>
        <motion.div
          key={identityType + (selectedIconId || '') + (activePersonaId || '')}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center relative mb-2"
          style={{
            background: identityBg(),
            boxShadow: '0 0 0 3px rgba(236,72,153,0.4), 0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {identityPreviewContent()}
        </motion.div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)', color: '#f9a8d4' }}>
          {identityType === 'selfie' && <><Camera size={11} /> Real Selfie</>}
          {identityType === 'persona' && <><Sparkles size={11} /> Glow Persona</>}
          {identityType === 'icon' && <><span className="text-xs">🎨</span> Aesthetic Icon</>}
        </div>
      </div>

      {/* Save message */}
      <AnimatePresence>
        {savedMsg && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-green-400 text-sm font-semibold mb-3 px-4"
          >
            {savedMsg}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Tab Switcher */}
      <div className="px-4 mb-5">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3 text-center">Choose Your Glow Identity</p>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {IDENTITY_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-1.5 py-3 px-3 rounded-2xl transition-all flex-shrink-0"
                style={{
                  minWidth: 80,
                  background: isActive
                    ? 'linear-gradient(135deg,rgba(236,72,153,0.25),rgba(168,85,247,0.25))'
                    : 'rgba(255,255,255,0.05)',
                  border: isActive ? '1.5px solid rgba(236,72,153,0.5)' : '1.5px solid rgba(255,255,255,0.08)',
                }}
              >
                <span className="text-xl">{tab.emoji}</span>
                <span className={`text-[11px] font-bold ${isActive ? 'text-pink-300' : 'text-gray-400'}`}>{tab.label}</span>
                <span className="text-[9px] text-gray-600">{tab.desc}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >

          {/* ── SELFIE TAB ─────────────────────────────── */}
          {activeTab === 'selfie' && (
            <div className="flex flex-col items-center px-4">
              {/* Circle preview */}
              <div
                className="w-40 h-40 rounded-full border-4 border-purple-600/60 overflow-hidden bg-gray-800 flex items-center justify-center mb-3 relative select-none"
                onMouseMove={avatarUrl ? handleDragMove : undefined}
                onMouseUp={avatarUrl ? handleDragEnd : undefined}
                onMouseLeave={avatarUrl ? handleDragEnd : undefined}
                onTouchMove={avatarUrl ? handleDragMove : undefined}
                onTouchEnd={avatarUrl ? handleDragEnd : undefined}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    draggable={false}
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                    style={{ transform: `translate(${imgOffset.x}px, ${imgOffset.y}px) scale(${zoom})`, cursor: isDragging ? 'grabbing' : 'grab', transformOrigin: 'center' }}
                    className="w-full h-full object-contain absolute inset-0"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Camera size={28} />
                    <span className="text-xs">No photo</span>
                  </div>
                )}
              </div>

              {avatarUrl && (
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => { setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(1))); setPositionChanged(true); }} className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600">−</button>
                  <span className="text-xs text-gray-400">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => { setZoom(z => Math.min(4, +(z + 0.1).toFixed(1))); setPositionChanged(true); }} className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600">+</button>
                </div>
              )}

              <p className="text-xs text-gray-500 mb-4">
                {avatarUrl ? 'Drag to reposition · pinch or +/− to zoom' : 'Upload a clear selfie'}
              </p>

              {avatarUrl && (
                <button
                  onClick={saveSelfie}
                  disabled={saving}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm mb-4 hover:opacity-90 transition disabled:opacity-40 flex items-center gap-2"
                >
                  {saving ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</> : <><Check size={16} /> Set as Profile Picture</>}
                </button>
              )}

              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <button
                onClick={() => fileRef.current.click()}
                disabled={uploading}
                className="w-full max-w-sm flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#1e1020] border border-gray-700/50 text-white font-semibold text-sm mb-3 hover:bg-[#2a1530] transition disabled:opacity-50"
              >
                {uploading
                  ? <><div className="w-4 h-4 border-2 border-gray-500 border-t-pink-400 rounded-full animate-spin" /> Uploading...</>
                  : <><Upload size={16} /> {avatarUrl ? 'Choose New Photo' : 'Upload Selfie'}</>}
              </button>

              {avatarUrl && (
                <button
                  onClick={async () => { setAvatarUrl(null); if (profile) await base44.entities.UserProfile.update(profile.id, { avatar_url: null }); }}
                  className="w-full max-w-sm flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-900/40 text-red-400 text-sm hover:bg-red-900/10 transition"
                >
                  <Trash2 size={15} /> Remove Photo
                </button>
              )}

              <p className="text-xs text-gray-600 mt-4">Max 5 MB · JPG, PNG, WEBP</p>
            </div>
          )}

          {/* ── GLOW PERSONA TAB ───────────────────────── */}
          {activeTab === 'persona' && (
            <div className="px-4">
              {Object.keys(personaImages).length === 0 ? (
                <div className="flex flex-col items-center py-8">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5"
                    style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}
                  >
                    ✨
                  </motion.div>
                  <h3 className="text-lg font-bold mb-2">No Glow Personas Yet</h3>
                  <p className="text-sm text-gray-400 text-center mb-6 max-w-xs leading-relaxed">
                    Create AI-powered persona transformations — Soft Girl, Future CEO, Ethereal Goddess, and more.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/glow-persona')}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-sm shadow-xl shadow-pink-500/30 relative overflow-hidden group"
                    style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <Sparkles size={18} className="text-yellow-300" />
                    Create My Glow Persona
                    <Crown size={16} className="text-yellow-300" />
                  </motion.button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-4">Choose Your Active Persona</p>
                  {activePersonaId && (
                    <div className="mb-4 p-3 rounded-2xl flex items-center gap-3"
                      style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)' }}>
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <img src={personaImages[activePersonaId]} alt="active" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-pink-300">Currently Active</p>
                        <p className="text-[11px] text-gray-400">Tap any persona below to switch</p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {Object.entries(personaImages).map(([id, url], i) => {
                      const isActive = activePersonaId === id;
                      return (
                        <motion.button
                          key={id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.08 }}
                          whileHover={{ scale: 1.03, y: -4 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => savePersona(id)}
                          className="relative rounded-2xl overflow-hidden border-2 transition-all"
                          style={{ borderColor: isActive ? '#ec4899' : 'rgba(255,255,255,0.1)', boxShadow: isActive ? '0 0 20px rgba(236,72,153,0.4)' : 'none' }}
                        >
                          <img src={url} alt={id} className="w-full aspect-square object-cover" />
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center bg-pink-500 shadow-lg"
                            >
                              <Check size={14} className="text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-2">
                            <p className="text-[10px] font-bold text-white truncate capitalize">{id.replace(/_/g,' ')}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/glow-persona')}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm border border-pink-500/30 text-pink-300 hover:bg-pink-500/10 transition"
                  >
                    <Sparkles size={16} /> Create More Personas
                  </motion.button>
                </>
              )}
            </div>
          )}

          {/* ── AESTHETIC ICON TAB ─────────────────────── */}
          {activeTab === 'icon' && (
            <div className="px-4">
              <AestheticIconPicker
                selectedIcon={selectedIconId}
                onSelect={(icon) => saveIcon(icon)}
              />
            </div>
          )}

          {/* ── ILLUSTRATED AVATAR TAB ─────────────────── */}
          {activeTab === 'illustrated' && (
            <div className="px-4">
              <DiceBearBuilder
                profile={profile}
                user={user}
                onSaved={(url) => {
                  setAvatarUrl(url);
                  setIdentityType('selfie');
                  setSavedMsg('🖼️ Illustrated avatar saved as your profile picture!');
                  setTimeout(() => setSavedMsg(''), 2500);
                }}
              />
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      <BottomNav active="me" />
    </div>
  );
}