import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Camera, Upload, Trash2, Sparkles, Crown } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import AvatarBuilder from '@/components/avatar/AvatarBuilder';

export default function Avatar() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('photo');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [photoUnsaved, setPhotoUnsaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [zoom, setZoom] = useState(1);
  const lastPinchDist = useRef(null);
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [positionChanged, setPositionChanged] = useState(false);
  const dragStart = useRef(null);
  const fileRef = useRef();

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
      if (profiles.length) {
        setProfile(profiles[0]);
        setAvatarUrl(profiles[0].avatar_url || null);
        setImgOffset({ x: profiles[0].avatar_offset_x || 0, y: profiles[0].avatar_offset_y || 0 });
        setZoom(profiles[0].avatar_zoom || 1);
      }
    }).catch(() => navigate('/'));
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Max 5 MB.');
      return;
    }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setAvatarUrl(file_url);
    setImgOffset({ x: 0, y: 0 });
    setZoom(1);
    setPositionChanged(false);
    // Auto-save immediately after upload
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { avatar_url: file_url, avatar_offset_x: 0, avatar_offset_y: 0, avatar_zoom: 1 });
    } else if (user) {
      const newProfile = await base44.entities.UserProfile.create({ user_email: user.email, avatar_url: file_url, avatar_offset_x: 0, avatar_offset_y: 0, avatar_zoom: 1 });
      setProfile(newProfile);
    }
    setPhotoUnsaved(false);
    setUploading(false);
  };

  const handleRemove = async () => {
    setAvatarUrl(null);
    setImgOffset({ x: 0, y: 0 });
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { avatar_url: null, avatar_offset_x: 0, avatar_offset_y: 0 });
    }
  };

  const handleDragStart = (e) => {
    if (e.touches && e.touches.length === 2) return; // let pinch handle it
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX - imgOffset.x, y: clientY - imgOffset.y };
    setIsDragging(true);
    e.preventDefault();
  };

  const handleDragMove = useCallback((e) => {
    if (e.touches && e.touches.length === 2) {
      // pinch zoom
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

  const handleDragEnd = () => {
    dragStart.current = null;
    lastPinchDist.current = null;
    setIsDragging(false);
  };

  const showSaved = (msg) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(''), 2500);
  };

  const saveAll = async () => {
    if (!avatarUrl) return;
    setSaving(true);
    const data = { avatar_url: avatarUrl, avatar_offset_x: imgOffset.x, avatar_offset_y: imgOffset.y, avatar_zoom: zoom };
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, data);
    } else if (user) {
      const newProfile = await base44.entities.UserProfile.create({ user_email: user.email, ...data });
      setProfile(newProfile);
    }
    setPositionChanged(false);
    setSaving(false);
    showSaved('✅ Saved!');
  };

  const firstName = user?.full_name?.split(' ')[0] || 'You';

  return (
    <div className="min-h-screen bg-[#130a10] text-white pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-300 text-sm">
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-lg font-bold">My Avatar</h1>
        <div className="flex items-center gap-1 bg-gray-800/80 rounded-full px-3 py-1 text-xs font-bold">
          <span>🏅</span><span className="text-yellow-400">15 pts</span>
        </div>
      </div>

      {/* Info banner */}
      <div className="mx-4 mt-2 mb-4 space-y-3">
        <div className="bg-gradient-to-r from-pink-900/40 to-purple-900/40 border border-pink-700/30 rounded-xl p-3">
          <p className="text-xs text-pink-200">✨ Create your unique Roblox-style avatar! Mix and match hundreds of styles.</p>
        </div>
        <button
          onClick={() => navigate('/glow-persona')}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white font-bold text-sm hover:opacity-90 transition shadow-xl shadow-pink-500/30 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"/>
          <Sparkles size={18} className="text-yellow-300 animate-pulse" />
          Try AI Glow Persona — Premium Transformation
          <Crown size={16} className="text-yellow-300" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-full bg-gray-800/60 p-1 mx-4 mt-3 mb-6">
        <button
          onClick={() => setTab('photo')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition ${tab === 'photo' ? 'bg-white text-black' : 'text-gray-400'}`}
        >
          <Camera size={15} /> My Photo
        </button>
        <button
          onClick={() => setTab('build')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition ${tab === 'build' ? 'bg-white text-black' : 'text-gray-400'}`}
        >
          ✨ Build Avatar
        </button>
      </div>

      {tab === 'photo' ? (
        <div className="flex flex-col items-center px-4">
          {/* Circle photo */}
          <div
            className="w-44 h-44 rounded-full border-4 border-purple-600/60 overflow-hidden bg-gray-800 flex items-center justify-center mb-3 relative select-none"
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
                <Camera size={32} />
                <span className="text-xs">No photo</span>
              </div>
            )}
          </div>
          {avatarUrl && (
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => { setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(1))); setPositionChanged(true); }} className="w-8 h-8 rounded-full bg-gray-700 text-white text-lg flex items-center justify-center hover:bg-gray-600 transition">−</button>
              <span className="text-xs text-gray-400">{Math.round(zoom * 100)}%</span>
              <button onClick={() => { setZoom(z => Math.min(4, +(z + 0.1).toFixed(1))); setPositionChanged(true); }} className="w-8 h-8 rounded-full bg-gray-700 text-white text-lg flex items-center justify-center hover:bg-gray-600 transition">+</button>
            </div>
          )}
          {avatarUrl ? (
            <p className="text-xs text-gray-400 mb-2">Drag to reposition · pinch or +/− to zoom</p>
          ) : (
            <p className="text-xs text-gray-400 mb-2">No photo uploaded yet</p>
          )}
          <button
            onClick={saveAll}
            disabled={saving || !avatarUrl}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm mb-4 hover:opacity-90 transition disabled:opacity-40 flex items-center gap-2"
          >
            {saving ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</> : '💾 Save Photo'}
          </button>
          {savedMsg && <p className="text-green-400 text-sm font-semibold mb-3">{savedMsg}</p>}

          {/* Upload card */}
          <div className="w-full max-w-sm bg-[#1e1020] border border-gray-700/50 rounded-2xl p-5 mb-4 text-center">
            <p className="font-semibold text-base mb-1">Upload Your Own Picture 🤳</p>
            <p className="text-xs text-gray-400">Choose a photo from your camera roll to use as your profile picture. It will appear on your profile, in the Glow Feed, and on the leaderboard.</p>
          </div>

          {/* Buttons */}
          <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif" className="hidden" onChange={handleFileChange} />

          <button
            onClick={() => fileRef.current.click()}
            disabled={uploading}
            className="w-full max-w-sm flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#1e1020] border border-gray-700/50 text-white font-semibold text-sm mb-3 hover:bg-[#2a1530] transition disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-gray-500 border-t-pink-400 rounded-full animate-spin" /> Uploading...</span>
            ) : (
              <><Upload size={16} /> Choose New Photo</>
            )}
          </button>

          {avatarUrl && (
            <button
              onClick={handleRemove}
              className="w-full max-w-sm flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#1e1020] border border-red-900/40 text-red-400 font-semibold text-sm mb-4 hover:bg-red-900/10 transition"
            >
              <Trash2 size={16} /> Remove Photo
            </button>
          )}

          <p className="text-xs text-gray-600">Max file size: 5 MB · Supported: JPG, PNG, WEBP, GIF</p>
        </div>
      ) : (
        <AvatarBuilder profile={profile} setProfile={setProfile} user={user} />
      )}

      <BottomNav active="me" />
    </div>
  );
}