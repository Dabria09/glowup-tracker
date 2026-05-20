import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Camera, Upload, Trash2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function Avatar() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('photo');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [photoUnsaved, setPhotoUnsaved] = useState(false);
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
    setPositionChanged(false);
    setPhotoUnsaved(true);
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
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX - imgOffset.x, y: clientY - imgOffset.y };
    setIsDragging(true);
    e.preventDefault();
  };

  const handleDragMove = useCallback((e) => {
    if (!dragStart.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setImgOffset({ x: clientX - dragStart.current.x, y: clientY - dragStart.current.y });
    setPositionChanged(true);
  }, []);

  const handleDragEnd = () => {
    dragStart.current = null;
    setIsDragging(false);
  };

  const savePhoto = async () => {
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { avatar_url: avatarUrl });
      setPhotoUnsaved(false);
    }
  };

  const savePosition = async () => {
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { avatar_offset_x: imgOffset.x, avatar_offset_y: imgOffset.y });
      setPositionChanged(false);
    }
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
                style={{ transform: `translate(${imgOffset.x}px, ${imgOffset.y}px)`, cursor: isDragging ? 'grabbing' : 'grab' }}
                className="w-full h-full object-contain absolute inset-0"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Camera size={32} />
                <span className="text-xs">No photo</span>
              </div>
            )}
          </div>
          {avatarUrl ? (
            <p className="text-xs text-gray-400 mb-2">Drag to reposition • <span className="text-purple-400">tap &amp; drag inside circle</span></p>
          ) : (
            <p className="text-xs text-gray-400 mb-2">No photo uploaded yet</p>
          )}
          <div className="flex gap-2 mb-4">
            {photoUnsaved && (
              <button onClick={savePhoto} className="px-5 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold hover:opacity-90 transition">💾 Save Photo</button>
            )}
            {positionChanged && (
              <button onClick={savePosition} className="px-5 py-1.5 rounded-full bg-pink-500 text-white text-xs font-semibold hover:bg-pink-600 transition">Save Position</button>
            )}
          </div>

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
        <div className="flex flex-col items-center px-4">
          <div className="w-full max-w-sm bg-[#1e1020] border border-gray-700/50 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">✨</div>
            <h2 className="text-lg font-bold mb-2">Build Your Avatar</h2>
            <p className="text-gray-400 text-sm">Custom avatar builder coming soon! For now, upload a real photo to personalize your profile.</p>
            <button
              onClick={() => setTab('photo')}
              className="mt-5 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold"
            >
              Upload a Photo Instead
            </button>
          </div>
        </div>
      )}

      <BottomNav active="me" />
    </div>
  );
}