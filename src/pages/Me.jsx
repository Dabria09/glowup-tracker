import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { deleteCurrentAccount } from '@/lib/accountDeletion';
import BottomNav from '@/components/BottomNav';
import UserAvatarDisplay from '@/components/UserAvatarDisplay';
import {
  Edit3, BookOpen, Image, Quote, Briefcase, GraduationCap,
  MessageSquare, Heart, MessageCircle, LogOut, Trash2, ChevronRight,
  Shield, FileText, Users, Sparkles, X, Check, Copy, ExternalLink, Camera,
  AlertTriangle,
} from 'lucide-react';

const BG = '#0d0608';
const PINK = '#e8526d';
const PINK_HOT = '#ff6a75';
const PINK_DEEP = '#c44a55';
const GOLD = '#f1b610';
const GOLD_LT = '#fdcd2d';
const WHITE = '#fff8f0';
const MUTED = '#c4949e';
const MUTED2 = '#8a6070';
const CARD = '#1e0d12';
const BORDER = 'rgba(232,82,109,0.2)';

const AGE_GROUPS = [
  { id: 'glow_girls', emoji: '🌸', label: 'Glow Girl',  ages: 'Ages 10–13', desc: 'Your glow journey starts here', minAge: 10, maxAge: 13 },
  { id: 'glow_teens', emoji: '✨', label: 'Glow Teen',  ages: 'Ages 14–18', desc: 'Level up your life',          minAge: 14, maxAge: 18 },
  { id: 'glow_women', emoji: '👑', label: 'Glow Woman', ages: 'Ages 19+',   desc: 'Own your era',               minAge: 19, maxAge: 999 },
];

const POST_TYPES = [
  { type: 'Thought',   emoji: '💭' },
  { type: 'Win',       emoji: '🏆' },
  { type: 'Goal',      emoji: '🎯' },
  { type: 'Mood',      emoji: '💜' },
  { type: 'Gratitude', emoji: '🙏' },
];

const MY_CONTENT = [
  { label: 'My Diary',              icon: BookOpen,      route: '/diary' },
  { label: 'My Vision Board',       icon: Image,         route: '/vision-board' },
  { label: 'My Saved Quotes',       icon: Quote,         route: '/saved-quotes' },
  { label: 'My Career Bookmarks',   icon: Briefcase,     route: '/saved-careers' },
  { label: 'My Saved Scholarships', icon: GraduationCap, route: '/saved-scholarships' },
];

const MY_ACTIVITY = [
  { label: 'My Posts',     icon: MessageSquare, route: '/glow-feed?filter=my_posts' },
  { label: 'My Reactions', icon: Heart,         route: '/glow-feed?filter=my_reactions' },
  { label: 'My Comments',  icon: MessageCircle, route: '/glow-feed?filter=my_comments' },
];

const SOCIAL_LINKS = [
  { icon: '📸', label: 'Instagram', url: 'https://instagram.com/girlsglowingup',     bg: 'linear-gradient(135deg,#e1306c,#833ab4)' },
  { icon: '🎵', label: 'TikTok',    url: 'https://tiktok.com/@girlsglowingup',       bg: '#111' },
  { icon: '▶️', label: 'YouTube',   url: 'https://youtube.com/@girlsglowingup',      bg: '#ff0000' },
  { icon: '📘', label: 'Facebook',  url: 'https://facebook.com/girlsglowingup',      bg: '#1877f2' },
  { icon: '👻', label: 'Snapchat',  url: 'https://snapchat.com/add/girlsglowingup',  bg: '#fffc00' },
];

function SectionLabel({ text }) {
  return <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUTED2, marginBottom: 8 }}>{text}</p>;
}

// ── Edit Profile Modal ─────────────────────────────────────────────────────
function EditProfileModal({ user, profile, onSave, onClose }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState(profile?.username || user?.email?.split('@')[0] || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    const updates = { username: username.trim(), bio: bio.trim() };
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, updates);
    } else {
      await base44.entities.UserProfile.create({ user_email: user.email, ...updates });
    }
    onSave(updates);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl p-5 pb-10" style={{ background: '#140a10', border: '1px solid rgba(232,82,109,0.25)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg text-white">Edit Profile</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-5">
          <UserAvatarDisplay profile={profile} size={80} fallback={user?.full_name?.[0] || 'G'} showRing />
          <button onClick={() => { onClose(); navigate('/avatar'); }}
            className="mt-2 flex items-center gap-1 text-xs font-semibold"
            style={{ color: PINK }}>
            <Camera size={12} /> Change Profile Picture
          </button>
        </div>

        {/* Name (read-only — from auth) */}
        <div className="mb-4">
          <label className="block text-xs font-bold mb-1" style={{ color: MUTED2 }}>Full Name</label>
          <div className="px-3 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, color: MUTED }}>
            {user?.full_name} <span className="text-xs opacity-50">(managed by account)</span>
          </div>
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-xs font-bold mb-1" style={{ color: MUTED2 }}>Username</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value.replace(/[^a-z0-9_.]/gi, '').toLowerCase())}
            maxLength={30}
            placeholder="yourname"
            className="w-full px-3 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, color: WHITE }}
          />
          <p className="text-xs mt-1" style={{ color: MUTED2 }}>girlsglowingup.com/glowlink/{username || '...'}</p>
        </div>

        {/* Bio */}
        <div className="mb-5">
          <label className="block text-xs font-bold mb-1" style={{ color: MUTED2 }}>Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value.slice(0, 150))}
            placeholder="Tell the community about yourself..."
            rows={3}
            className="w-full px-3 py-3 rounded-xl text-sm outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, color: WHITE }}
          />
          <p className="text-xs text-right" style={{ color: MUTED2 }}>{bio.length}/150</p>
        </div>

        <button onClick={save} disabled={saving}
          className="w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${PINK_DEEP}, ${PINK_HOT})`, boxShadow: '0 4px 16px rgba(232,82,109,0.4)' }}>
          {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// ── Delete Account Modal ───────────────────────────────────────────────────
function DeleteAccountModal({ onClose }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const doDelete = async () => {
    if (confirmText !== 'DELETE') return;
    try {
      setIsDeleting(true);
      await deleteCurrentAccount(confirmText);
    } catch (error) {
      alert('Deletion failed. Please try again. Error: ' + error.message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: '#1a0508', border: '1px solid rgba(220,38,38,0.4)' }}>
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.15)' }}>
            <AlertTriangle size={28} className="text-red-400" />
          </div>
        </div>
        <h3 className="text-center font-bold text-lg text-white mb-2">Are you sure?</h3>
        <p className="text-center text-sm mb-4" style={{ color: MUTED }}>
          Deleting your account is permanent and cannot be undone. All your Glow Score, challenges, goals, diary entries, and saved content will be removed forever.
        </p>
        <p className="text-center text-xs font-bold text-red-400 mb-4">This action CANNOT be undone.</p>
        <div className="mb-5">
          <p className="text-xs font-semibold mb-2" style={{ color: MUTED }}>Type <span className="font-bold text-red-400">DELETE</span> to confirm:</p>
          <input
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full px-3 py-3 rounded-xl text-sm outline-none text-center font-bold tracking-widest"
            style={{ background: 'rgba(220,38,38,0.08)', border: `1px solid ${confirmText === 'DELETE' ? '#dc2626' : 'rgba(220,38,38,0.3)'}`, color: '#fff' }}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: 'rgba(255,255,255,0.05)', color: MUTED }}
          >
            Cancel
          </button>
          <button
            onClick={doDelete}
            disabled={isDeleting || confirmText !== 'DELETE'}
            className="flex-1 py-3 rounded-2xl font-bold text-sm text-white disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)' }}
          >
            {isDeleting && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Me Page ───────────────────────────────────────────────────────────
export default function Me() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('thread');
  const [posts, setPosts] = useState([]);
  const [savingStage, setSavingStage] = useState(false);
  const [postText, setPostText] = useState('');
  const [postType, setPostType] = useState('Thought');
  const [posting, setPosting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [glowLinkCopied, setGlowLinkCopied] = useState(false);
  const [postMediaUrls, setPostMediaUrls] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const mediaFileRef = useRef();
  const galleryFileRef = useRef();
  const [personaImages, setPersonaImages] = useState({});
  const [galleryImages, setGalleryImages] = useState([]);

  const loadProfile = async (email) => {
    const profiles = await base44.entities.UserProfile.filter({ user_email: email });
    if (profiles.length) {
      const p = profiles[0];
      setProfile(p);
      if (p.glow_persona_images) {
        try { setPersonaImages(JSON.parse(p.glow_persona_images)?.images || {}); } catch {}
      }
      if (p.gallery_images) {
        try { setGalleryImages(JSON.parse(p.gallery_images) || []); } catch {}
      }
    }
  };

  useEffect(() => {
    let userEmail = null;
    const load = async () => {
      try {
        const u = await base44.auth.me();
        userEmail = u.email;
        setUser(u);
        const [profiles, pts, userPosts] = await Promise.all([
          base44.entities.UserProfile.filter({ user_email: u.email }),
          base44.entities.UserPoints.filter({ user_email: u.email }),
          base44.entities.GlowUpPost.filter({ user_email: u.email }),
        ]);
        if (profiles.length) {
          const p = profiles[0];
          setProfile(p);
          if (p.glow_persona_images) {
            try { setPersonaImages(JSON.parse(p.glow_persona_images)?.images || {}); } catch {}
          }
          if (p.gallery_images) {
            try { setGalleryImages(JSON.parse(p.gallery_images) || []); } catch {}
          }
        }
        if (pts.length) setPoints(pts[0]);
        setPosts(userPosts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      } catch {
        base44.auth.redirectToLogin();
      }
      setLoading(false);
    };
    load();

    // Re-fetch profile when user navigates back (e.g. after changing avatar)
    const onFocus = () => { if (userEmail) loadProfile(userEmail); };
    document.addEventListener('visibilitychange', onFocus);
    return () => document.removeEventListener('visibilitychange', onFocus);
  }, []);

  // ── Media Upload (Thread) ────────────────────────────────────────────────
  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingMedia(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPostMediaUrls(prev => [...prev, file_url]);
    }
    setUploadingMedia(false);
    e.target.value = '';
  };

  // ── Gallery Upload ────────────────────────────────────────────────────────
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingGallery(true);
    const newUrls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newUrls.push(file_url);
    }
    const updated = [...galleryImages, ...newUrls];
    await base44.entities.UserProfile.update(profile.id, { gallery_images: JSON.stringify(updated) });
    setGalleryImages(updated);
    setUploadingGallery(false);
    e.target.value = '';
  };

  // ── Delete Photo ──────────────────────────────────────────────────────────
  const handleDeletePhoto = async (photo) => {
    if (!profile) return;
    if (photo.type === 'avatar') {
      await base44.entities.UserProfile.update(profile.id, { avatar_url: null });
      setProfile(p => ({ ...p, avatar_url: null }));
    } else if (photo.type === 'persona') {
      const newImages = { ...personaImages };
      delete newImages[photo.key];
      await base44.entities.UserProfile.update(profile.id, { glow_persona_images: JSON.stringify({ images: newImages }) });
      setPersonaImages(newImages);
    } else if (photo.type === 'gallery') {
      const updated = galleryImages.filter(url => url !== photo.url);
      await base44.entities.UserProfile.update(profile.id, { gallery_images: JSON.stringify(updated) });
      setGalleryImages(updated);
    }
  };

  // ── Glow Stage age gate ──────────────────────────────────────────────────
  const handleStageChange = async (group) => {
    if (!profile) return;
    const userAge = profile.age || null;
    // If we have age data, enforce it
    if (userAge) {
      if (userAge < group.minAge) {
        alert(`You must be at least ${group.minAge} to join ${group.label}.`);
        return;
      }
      if (userAge > group.maxAge && group.id !== 'glow_women') {
        alert(`${group.label} is for ages ${group.ages}.`);
        return;
      }
    }
    setSavingStage(true);
    await base44.entities.UserProfile.update(profile.id, { age_group: group.id });
    setProfile(p => ({ ...p, age_group: group.id }));
    setSavingStage(false);
  };

  // ── Glow Link ────────────────────────────────────────────────────────────
  const handleGlowLink = () => {
    const username = profile?.username || user?.email?.split('@')[0] || '';
    const url = `${window.location.origin}/glowlink/${username}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setGlowLinkCopied(true);
        setTimeout(() => setGlowLinkCopied(false), 2500);
      });
    } else {
      window.open(url, '_blank');
    }
  };

  // ── Post ─────────────────────────────────────────────────────────────────
  const handlePost = async () => {
    if (!postText.trim() || posting) return;
    setPosting(true);
    const post = await base44.entities.GlowUpPost.create({
      user_email: user.email,
      content: postText.trim(),
      media_urls: JSON.stringify(postMediaUrls),
      visibility: 'followers',
      likes: 0,
      comments: 0,
      post_type: postType,
    });
    setPosts(prev => [post, ...prev]);
    setPostText('');
    setPostMediaUrls([]);
    setPosting(false);
  };

  const handleDeletePost = async (postId) => {
    await base44.entities.GlowUpPost.delete(postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const tier = points?.total_points >= 500 ? 'Radiant' : points?.total_points >= 200 ? 'Glowing' : points?.total_points >= 50 ? 'Seedling' : 'Spark';
  const tierEmoji = { Radiant: '👑', Glowing: '✨', Seedling: '🌱', Spark: '⚡' }[tier];

  const stats = [
    { label: 'Days',       value: profile ? Math.max(1, Math.floor((Date.now() - new Date(profile.created_date || Date.now())) / 86400000)) : 0, icon: '📅' },
    { label: 'Challenges', value: points?.challenges_completed || 0, icon: '🏆' },
    { label: 'Streak',     value: points?.check_in_streak || 0, icon: '🔥' },
    { label: 'Badges',     value: Math.floor((points?.total_points || 0) / 100), icon: '⭐' },
  ];

  // ── Photos for "My Photos" tab ────────────────────────────────────────────
  const allPhotos = [
    ...(profile?.avatar_url ? [{ url: profile.avatar_url, label: 'Profile Photo', type: 'avatar' }] : []),
    ...Object.entries(personaImages).map(([id, url]) => ({ url, label: id.replace(/_/g, ' '), type: 'persona', key: id })),
    ...galleryImages.map(url => ({ url, label: 'Gallery Photo', type: 'gallery' })),
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="w-8 h-8 border-4 border-red-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: BG, color: WHITE, fontFamily: '"DM Sans","Inter",sans-serif', paddingBottom: 120, overflowX: 'hidden' }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute rounded-full" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(232,82,109,0.35), transparent 70%)', top: -250, left: -180, filter: 'blur(100px)' }} />
        <div className="absolute rounded-full" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(241,182,16,0.2), transparent 70%)', top: '35%', right: -150, filter: 'blur(100px)' }} />
      </div>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Cpath d='M22 34 C11 25 4 18 4 11 C4 7 7.5 3.5 12 3.5 C15.5 3.5 18.5 5.5 22 9 C25.5 5.5 28.5 3.5 32 3.5 C36.5 3.5 40 7 40 11 C40 18 33 25 22 34Z' fill='%23e8526d' opacity='0.04'/%3E%3C/svg%3E\")", backgroundSize: '44px 44px' }} />

      <div className="relative z-10 px-4">

        {/* Points badge */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 12, paddingBottom: 4 }}>
          <button onClick={() => navigate('/glow-score')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(241,182,16,0.1)', border: '1.5px solid rgba(241,182,16,0.35)', color: GOLD_LT, fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 20, cursor: 'pointer' }}>
            🏅 {points?.total_points?.toLocaleString() || 0} pts
          </button>
        </div>

        {/* ── Profile Header ───────────────────────────────────── */}
        <div style={{ background: 'linear-gradient(135deg, rgba(232,82,109,0.12), rgba(196,74,85,0.07))', border: `1px solid ${BORDER}`, borderRadius: 24, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <button onClick={() => navigate('/avatar')}>
              <UserAvatarDisplay profile={profile} size={80} fallback={user?.full_name?.[0] || 'G'} showRing />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 20, color: WHITE, margin: 0 }}>{user?.full_name}</p>
              <p style={{ fontSize: 13, color: MUTED, margin: '2px 0 0' }}>@{profile?.username || user?.email?.split('@')[0]}</p>
              {profile?.bio && <p style={{ fontSize: 12, color: MUTED2, margin: '4px 0 0', lineHeight: 1.4 }}>{profile.bio}</p>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span>{tierEmoji}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#ffb2c0' }}>{tier}</span>
                <span style={{ color: MUTED2 }}>·</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: GOLD_LT }}>{points?.total_points || 0} pts</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <button onClick={() => navigate('/my-glow-link')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: `linear-gradient(135deg, ${PINK_DEEP}, ${PINK}, ${PINK_HOT})`, color: '#fff', fontWeight: 800, fontSize: 14, padding: '11px', borderRadius: 14, border: 'none', cursor: 'pointer', boxShadow: `0 4px 16px rgba(232,82,109,0.4)` }}>
              <Edit3 size={15} /> Edit Profile
            </button>
            <button onClick={handleGlowLink} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(241,182,16,0.08)', border: '1.5px solid rgba(241,182,16,0.35)', color: GOLD_LT, fontWeight: 700, fontSize: 14, padding: '11px', borderRadius: 14, cursor: 'pointer' }}>
              {glowLinkCopied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Glow Link</>}
            </button>
          </div>

          {/* Glow Link preview */}
          <button onClick={() => navigate(`/glowlink/${profile?.username || user?.email?.split('@')[0]}`)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left"
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}>
            <ExternalLink size={12} style={{ color: MUTED2, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: MUTED2, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {window.location.origin}/glowlink/{profile?.username || user?.email?.split('@')[0]}
            </span>
            <span style={{ fontSize: 10, color: PINK, fontWeight: 700 }}>View →</span>
          </button>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 12 }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '10px 4px', borderRadius: 14, background: 'rgba(0,0,0,0.35)', border: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: 18, margin: '0 0 2px' }}>{s.icon}</p>
                <p style={{ fontWeight: 800, fontSize: 17, color: WHITE, margin: '0 0 1px' }}>{s.value}</p>
                <p style={{ fontSize: 10, color: MUTED2, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── My Content ───────────────────────────────────────── */}
        <div style={{ marginBottom: 16 }}>
          <SectionLabel text="My Content" />
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, overflow: 'hidden' }}>
            {MY_CONTENT.map((item, i) => {
              const Icon = item.icon;
              return (
                <button key={item.label} onClick={() => navigate(item.route)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', borderBottom: i < MY_CONTENT.length - 1 ? `1px solid ${BORDER}` : 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <Icon size={16} style={{ color: MUTED, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 14, color: WHITE }}>{item.label}</span>
                  <ChevronRight size={14} style={{ color: MUTED2 }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── My Activity ──────────────────────────────────────── */}
        <div style={{ marginBottom: 16 }}>
          <SectionLabel text="My Activity" />
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, overflow: 'hidden' }}>
            {MY_ACTIVITY.map((item, i) => {
              const Icon = item.icon;
              return (
                <button key={item.label} onClick={() => navigate(item.route)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', borderBottom: i < MY_ACTIVITY.length - 1 ? `1px solid ${BORDER}` : 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <Icon size={16} style={{ color: MUTED, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 14, color: WHITE }}>{item.label}</span>
                  <ChevronRight size={14} style={{ color: MUTED2 }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Thread / Photos Tabs ──────────────────────────────── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, marginBottom: 16 }}>
            {[{ id: 'thread', label: 'My Thread', icon: MessageSquare }, { id: 'photos', label: 'My Photos', icon: Image }].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, paddingBottom: 12, fontSize: 14, fontWeight: 600, background: 'none', border: 'none', borderBottom: `2px solid ${active ? PINK : 'transparent'}`, color: active ? PINK_HOT : MUTED2, cursor: 'pointer' }}>
                  <Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'thread' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Post type chips */}
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {POST_TYPES.map(({ type, emoji }) => (
                  <button key={type} onClick={() => setPostType(type)} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: postType === type ? `linear-gradient(135deg, ${PINK_DEEP}, ${PINK_HOT})` : 'rgba(232,82,109,0.07)', color: postType === type ? '#fff' : MUTED, border: postType === type ? 'none' : `1px solid ${BORDER}`, boxShadow: postType === type ? '0 2px 8px rgba(232,82,109,0.35)' : 'none' }}>
                    {emoji} {type}
                  </button>
                ))}
              </div>

              {/* Post input */}
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 12 }}>
                <textarea
                  value={postText}
                  onChange={e => setPostText(e.target.value.slice(0, 500))}
                  placeholder="Share a thought, win, goal, or mood..."
                  style={{ width: '100%', background: 'transparent', border: 'none', color: WHITE, fontSize: 14, outline: 'none', resize: 'none', minHeight: 72, fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
                {/* Media attach buttons */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <button onClick={() => mediaFileRef.current?.click()}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, background: 'rgba(232,82,109,0.1)', border: `1px solid ${BORDER}`, color: PINK, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    📷 Photo
                  </button>
                  <button onClick={() => { mediaFileRef.current.accept = 'video/*'; mediaFileRef.current?.click(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, background: 'rgba(232,82,109,0.1)', border: `1px solid ${BORDER}`, color: PINK, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    🎬 Video
                  </button>
                  {uploadingMedia && <span style={{ fontSize: 11, color: MUTED2, alignSelf: 'center' }}>Uploading...</span>}
                </div>
                {postMediaUrls.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    {postMediaUrls.map((url, i) => (
                      <div key={i} style={{ position: 'relative', width: 64, height: 64, borderRadius: 10, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                        {url.match(/\.(mp4|webm|mov)/i)
                          ? <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        <button onClick={() => setPostMediaUrls(prev => prev.filter((_, j) => j !== i))}
                          style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: postText.length >= 450 ? '#f59e0b' : MUTED2 }}>{postText.length}/500</span>
                  </div>
                  <button onClick={handlePost} disabled={!postText.trim() || posting}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 18px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: `linear-gradient(135deg, ${PINK_DEEP}, ${PINK_HOT})`, color: '#fff', border: 'none', cursor: 'pointer', opacity: (!postText.trim() || posting) ? 0.4 : 1 }}>
                    {posting ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '➤'} Post
                  </button>
                </div>
              </div>

              {posts.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '32px 0', color: MUTED2, fontSize: 14 }}>No posts yet. Share your first thought! ✨</p>
              ) : (
                posts.map(post => (
                  <div key={post.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(232,82,109,0.15)', border: `1px solid ${BORDER}`, color: '#ffb2c0' }}>
                        {POST_TYPES.find(p => p.type === post.post_type)?.emoji || '💭'} {post.post_type || 'Thought'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, color: MUTED2 }}>{new Date(post.created_date).toLocaleDateString()}</span>
                        <button onClick={() => handleDeletePost(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED2 }}><Trash2 size={13} /></button>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: WHITE, margin: 0 }}>{post.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div>
              {/* Photo action buttons */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button onClick={() => galleryFileRef.current?.click()} disabled={uploadingGallery}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 14, background: `linear-gradient(135deg, ${PINK_DEEP}, ${PINK_HOT})`, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', opacity: uploadingGallery ? 0.6 : 1 }}>
                  {uploadingGallery ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : '📸'}
                  {uploadingGallery ? 'Uploading...' : 'Add Photos'}
                </button>
                <button onClick={() => navigate('/avatar')}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, color: MUTED, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  <Camera size={14} /> Change Profile Pic
                </button>
              </div>
              {allPhotos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 48 }}>📸</div>
                  <p style={{ fontSize: 14, color: MUTED }}>No photos yet.</p>
                  <p style={{ fontSize: 12, color: MUTED2, maxWidth: 240 }}>Tap "Add Photos" above to upload photos to your gallery.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {allPhotos.map((photo, i) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}` }}>
                      <img src={photo.url} alt={photo.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '4px 6px', background: 'linear-gradient(to top,rgba(0,0,0,0.8),transparent)' }}>
                        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', margin: 0, textTransform: 'capitalize' }}>{photo.label}</p>
                      </div>
                      <button onClick={() => handleDeletePhoto(photo)}
                        style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: '50%', background: 'rgba(220,38,38,0.9)', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {/* Add More tile */}
                  <button
                    onClick={() => galleryFileRef.current?.click()}
                    disabled={uploadingGallery}
                    style={{ aspectRatio: '1', borderRadius: 14, background: 'rgba(232,82,109,0.05)', border: `2px dashed ${BORDER}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', color: MUTED2 }}>
                    {uploadingGallery
                      ? <div className="w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                      : <>
                          <Camera size={20} style={{ color: PINK }} />
                          <span style={{ fontSize: 10, fontWeight: 600, color: PINK }}>Add More</span>
                        </>}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── My Glow Stage ────────────────────────────────────── */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Sparkles size={15} style={{ color: PINK }} />
            <p style={{ fontWeight: 700, fontSize: 14, color: WHITE, margin: 0 }}>My Glow Stage</p>
          </div>
          <p style={{ fontSize: 12, color: MUTED2, marginBottom: 12 }}>Your stage shapes your content, challenges, and community</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {AGE_GROUPS.map(group => {
              const isActive = profile?.age_group === group.id;
              const userAge = profile?.age;
              const isAgeRestricted = userAge && userAge < group.minAge;
              return (
                <button key={group.id} onClick={() => handleStageChange(group)} disabled={savingStage || isAgeRestricted}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 14, background: isActive ? 'rgba(232,82,109,0.12)' : 'rgba(0,0,0,0.2)', border: isActive ? `1px solid ${PINK}` : `1px solid ${BORDER}`, cursor: isAgeRestricted ? 'not-allowed' : 'pointer', textAlign: 'left', opacity: isAgeRestricted ? 0.45 : 1 }}>
                  <span style={{ fontSize: 20 }}>{group.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: WHITE, margin: 0 }}>{group.label}</p>
                    <p style={{ fontSize: 11, color: MUTED2, margin: 0 }}>{group.ages} · {group.desc}</p>
                  </div>
                  {isActive && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(232,82,109,0.25)', border: `1px solid ${BORDER}`, color: '#ffb2c0' }}>Active</span>}
                  {isAgeRestricted && <span style={{ fontSize: 10, color: MUTED2 }}>🔒</span>}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: MUTED2, marginTop: 8, lineHeight: 1.4 }}>
            Age restrictions protect younger members. If your stage is locked, it's based on your registered age.
          </p>
        </div>

        {/* ── Sign Out ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 16 }}>
          <button onClick={async () => { if (window.confirm('Sign out of Girls Glowing Up?')) await base44.auth.logout('/'); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 16, background: CARD, border: `1px solid ${BORDER}`, color: MUTED, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* ── Follow Us ────────────────────────────────────────── */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 16, marginBottom: 16 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: WHITE, margin: '0 0 2px' }}>Follow Us 💜</p>
          <p style={{ fontSize: 12, color: MUTED2, margin: '0 0 12px' }}>Opens the external app — no account connection, no data sharing</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {SOCIAL_LINKS.map(s => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '2px solid rgba(255,255,255,0.1)' }}>{s.icon}</div>
                <span style={{ fontSize: 9, color: MUTED2 }}>{s.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* ── Help & Support ───────────────────────────────────── */}
        <div style={{ marginBottom: 16 }}>
          <SectionLabel text="Help and Support" />
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, overflow: 'hidden' }}>
            <button onClick={() => navigate('/support')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', borderBottom: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <MessageCircle size={16} style={{ color: MUTED, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, color: WHITE, margin: 0 }}>Contact Support</p>
                <p style={{ fontSize: 11, color: MUTED2, margin: 0 }}>Report a bug, ask for help, or give feedback</p>
              </div>
              <ChevronRight size={14} style={{ color: MUTED2 }} />
            </button>
          </div>
        </div>

        {/* ── Legal ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 16 }}>
          <SectionLabel text="Legal and Privacy" />
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, overflow: 'hidden' }}>
            {[
              { label: 'Privacy Policy',            icon: Shield,   route: '/privacy-policy' },
              { label: 'Terms of Service',           icon: FileText, route: '/terms-of-service' },
              { label: 'Parental Consent (COPPA)',   icon: Users,    route: '/parent-dashboard' },
            ].map((item, i, arr) => {
              const Icon = item.icon;
              return (
                <button key={item.label} onClick={() => navigate(item.route)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <Icon size={15} style={{ color: MUTED, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 14, color: WHITE }}>{item.label}</span>
                  <ChevronRight size={14} style={{ color: MUTED2 }} />
                </button>
              );
            })}
          </div>
          <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(196,148,158,0.35)', marginTop: 10 }}>© 2025 Girls Glowing Up LLC. All rights reserved.</p>
        </div>

        {/* ── Danger Zone ──────────────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ background: 'rgba(196,74,85,0.07)', border: '1px solid rgba(196,74,85,0.3)', borderRadius: 18, padding: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#f87171', margin: '0 0 4px' }}>DANGER ZONE</p>
            <p style={{ fontSize: 12, color: MUTED2, margin: '0 0 12px', lineHeight: 1.5 }}>Permanently delete your account and all data. This cannot be undone and your Glow Points, posts, and achievements will be lost forever.</p>
            <button onClick={() => setShowDeleteModal(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 14, background: 'linear-gradient(135deg, #dc2626, #991b1b)', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              <Trash2 size={15} /> Delete My Account
            </button>
          </div>
        </div>

      </div>

      <input ref={mediaFileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => { handleMediaUpload(e); if (mediaFileRef.current) mediaFileRef.current.accept = 'image/*,video/*'; }} />
      <input ref={galleryFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />

      <BottomNav active="me" />

      {/* Modals */}

      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}
    </div>
  );
}