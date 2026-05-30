import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';
import UserAvatarDisplay from '@/components/UserAvatarDisplay';
import GlowProfilePreview from '@/components/glowlink/GlowProfilePreview';
import {
  ChevronLeft, ChevronRight, Plus, X, Upload, Check, Copy, Share2, ExternalLink,
  Trash2, Link2, Sparkles, Camera, Lock, Eye, User, Palette, Globe, Star,
  Settings, LogOut, Shield, Bell, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GLOW_THEMES, PROFILE_FRAMES, getGlowLevel, getTheme, computeBadges } from '@/components/glowlink/GlowThemes';

/* ── Constants ─────────────────────────────────── */
const GLOW_ERAS = [
  'Confidence Era','Glow Up Era','Boss Era','Healing Era','Growth Era',
  'Abundance Era','Queen Era','Unbothered Era','Focused Era','Elevation Era',
];
const PRONOUN_OPTIONS = ['she/her','he/him','they/them','she/they','he/they','any/all'];
const VIBE_OPTIONS = [
  { id: 'soft_girl',   label: 'Soft Girl',    emoji: '🌸' },
  { id: 'boss_era',    label: 'Boss Era',     emoji: '👑' },
  { id: 'fitness',     label: 'Fitness Glow', emoji: '💪' },
  { id: 'creative',   label: 'Creative',     emoji: '🎨' },
  { id: 'wellness',   label: 'Wellness',     emoji: '🧘' },
  { id: 'academic',   label: 'Academic',     emoji: '📚' },
  { id: 'spiritual',  label: 'Spiritual',    emoji: '✨' },
  { id: 'adventure',  label: 'Adventure',    emoji: '🌍' },
];
const INTEREST_OPTIONS = [
  'Fashion','Beauty','Fitness','Mental Health','Cooking','Travel',
  'Music','Art','Dance','Reading','Gaming','Finance','Career','Spirituality',
];
const DEFAULT_PRIVACY = {
  public_profile: true, allow_followers: true, show_achievements: true,
  show_streak: true, show_goals: true, show_links: true,
  show_timeline: true, show_photos: true, show_interests: true, show_vibe: true,
};

/* ── Sub-components ─────────────────────────────── */
function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} className="relative w-12 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ background: on ? '#ec4899' : 'rgba(255,255,255,0.15)' }}>
      <motion.div animate={{ x: on ? 24 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow" />
    </button>
  );
}

function SectionCard({ icon, title, subtitle, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-4 py-4 text-left">
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-base flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,rgba(236,72,153,0.2),rgba(168,85,247,0.2))', border: '1px solid rgba(236,72,153,0.2)' }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">{title}</p>
          {subtitle && <p className="text-xs text-gray-500 truncate mt-0.5">{subtitle}</p>}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-gray-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-5 pt-1 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FieldLabel({ children }) {
  return <p className="text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">{children}</p>;
}

function TextInput({ value, onChange, placeholder, maxLength, ...rest }) {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength}
      className="w-full rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none"
      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
      {...rest} />
  );
}

function TextArea({ value, onChange, placeholder, maxLength, rows = 3 }) {
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength} rows={rows}
      className="w-full rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none resize-none"
      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
  );
}

/* ── Main Component ─────────────────────────────── */
export default function MyGlowLink() {
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const usernameTimer = useRef(null);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [posts, setPosts] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsRecord, setPointsRecord] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
  const bannerInputRef = useRef();

  // Identity fields
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [motto, setMotto] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [glowEra, setGlowEra] = useState('Glow Up Era');
  const [vibe, setVibe] = useState('');
  const [interests, setInterests] = useState([]);
  const [usernameStatus, setUsernameStatus] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);

  // Customization
  const [profileTheme, setProfileTheme] = useState('default');
  const [profileFrame, setProfileFrame] = useState('default');

  // Featured / Personalization
  const [featuredMood, setFeaturedMood] = useState('');
  const [featuredAffirmation, setFeaturedAffirmation] = useState('');
  const [featuredGoal, setFeaturedGoal] = useState('');
  const [featuredQuote, setFeaturedQuote] = useState('');

  // Links
  const [links, setLinks] = useState([]);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Privacy
  const [privacy, setPrivacy] = useState(DEFAULT_PRIVACY);

  const theme = getTheme(profileTheme);
  const glowLinkUrl = `${window.location.origin}/glowlink/${username || user?.email?.split('@')[0] || 'me'}`;
  const glowLevel = getGlowLevel(totalPoints);
  const badges = computeBadges(totalPoints, pointsRecord?.check_in_streak, pointsRecord?.challenges_completed, posts.length);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const [profiles, pts, userPosts] = await Promise.all([
        base44.entities.UserProfile.filter({ user_email: u.email }),
        base44.entities.UserPoints.filter({ user_email: u.email }),
        base44.entities.GlowUpPost.filter({ user_email: u.email }, '-created_date', 30),
      ]);
      if (profiles.length) {
        const p = profiles[0];
        setProfile(p);
        setUsername(p.username || '');
        setDisplayName(p.display_name || '');
        setBio(p.bio || '');
        setMotto(p.motto || '');
        setPronouns(p.pronouns || '');
        setGlowEra(p.glow_era || 'Glow Up Era');
        setVibe(p.vibe || '');
        setProfileTheme(p.profile_theme || 'default');
        setProfileFrame(p.profile_frame || 'default');
        setBannerUrl(p.custom_banner_url || '');
        setFeaturedQuote(p.featured_quote || '');
        try { setLinks(p.links ? JSON.parse(p.links) : []); } catch {}
        try { setInterests(p.interests ? JSON.parse(p.interests) : []); } catch {}
        try { setPrivacy({ ...DEFAULT_PRIVACY, ...(p.privacy_settings ? JSON.parse(p.privacy_settings) : {}) }); } catch {}
        try {
          const fs = p.featured_sections ? JSON.parse(p.featured_sections) : {};
          setFeaturedMood(fs.mood || '');
          setFeaturedAffirmation(fs.affirmation || '');
          setFeaturedGoal(fs.goal || '');
        } catch {}
      }
      if (pts.length) { setTotalPoints(pts[0].total_points || 0); setPointsRecord(pts[0]); }
      setPosts(userPosts);
      setIsAdmin(u.role === 'admin');
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const checkUsername = (val) => {
    setUsername(val);
    clearTimeout(usernameTimer.current);
    if (!val.trim()) { setUsernameStatus(''); return; }
    setUsernameStatus('checking');
    usernameTimer.current = setTimeout(async () => {
      const existing = await base44.entities.UserProfile.filter({ username: val.trim() });
      const taken = existing.some(p => p.user_email !== user?.email);
      if (taken) {
        setUsernameStatus('taken');
        setUsernameSuggestions([`${val}${Math.floor(Math.random()*99)+1}`, `${val}_glow`, `${val}.ggу`]);
      } else {
        setUsernameStatus('available');
        setUsernameSuggestions([]);
      }
    }, 600);
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setBannerUrl(file_url);
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { custom_banner_url: file_url });
      setProfile(p => ({ ...p, custom_banner_url: file_url }));
    }
    setUploadingBanner(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const updates = { avatar_url: file_url, identity_type: 'selfie' };
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, updates);
      setProfile(p => ({ ...p, ...updates }));
    }
    setUploadingPhoto(false);
  };

  const handleSave = async () => {
    if (usernameStatus === 'taken') {
      setSaveMsg('❌ Username is already taken.');
      setTimeout(() => setSaveMsg(''), 3000);
      return;
    }
    setSaving(true);
    const data = {
      bio: bio.trim(), motto: motto.trim(), display_name: displayName.trim(),
      pronouns: pronouns.trim(), glow_era: glowEra, username: username.trim(),
      vibe, interests: JSON.stringify(interests), custom_banner_url: bannerUrl,
      links: JSON.stringify(links),
      privacy_settings: JSON.stringify(privacy),
      profile_theme: profileTheme, profile_frame: profileFrame,
      featured_quote: featuredQuote.trim(),
      featured_sections: JSON.stringify({
        mood: featuredMood.trim(),
        affirmation: featuredAffirmation.trim(),
        goal: featuredGoal.trim(),
      }),
    };
    try {
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, data);
        setProfile(p => ({ ...p, ...data }));
      } else {
        const np = await base44.entities.UserProfile.create({ user_email: user.email, ...data });
        setProfile(np);
      }
      setSaveMsg('✅ Profile saved!');
    } catch {
      setSaveMsg('❌ Save failed. Try again.');
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(glowLinkUrl);
    setSaveMsg('📋 Link copied!');
    setTimeout(() => setSaveMsg(''), 2000);
  };

  const toggleInterest = (tag) => {
    setInterests(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#0d0608' }}>

      {/* ── Sticky Header ──────────────────────────────── */}
      <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
        style={{ background: 'rgba(13,6,8,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-white">Edit Profile</h1>
          <p className="text-[11px]" style={{ color: theme.textAccent }}>{glowLevel.emoji} {glowLevel.name} · {totalPoints.toLocaleString()} pts</p>
        </div>
        <button onClick={() => setShowPreview(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#cbd5e1' }}>
          <Eye size={13} /> Preview
        </button>
      </div>

      {/* ── Save Status Toast ──────────────────────────── */}
      <AnimatePresence>
        {saveMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mx-4 mt-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-center"
            style={{
              background: saveMsg.startsWith('✅') || saveMsg.startsWith('📋') ? 'rgba(52,211,153,0.12)' : 'rgba(239,68,68,0.12)',
              border: `1px solid ${saveMsg.startsWith('✅') || saveMsg.startsWith('📋') ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
            {saveMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Avatar Block ──────────────────────────── */}
      <div className="relative flex flex-col items-center py-8"
        style={{ background: 'linear-gradient(180deg, rgba(236,72,153,0.08) 0%, transparent 100%)' }}>
        {/* Level glow ring */}
        <div className="relative mb-3">
          <div className="absolute inset-0 rounded-full" style={{ margin: -12, background: `radial-gradient(circle, ${glowLevel.color}40, transparent 70%)`, filter: 'blur(12px)' }} />
          <div className="relative" style={{ background: glowLevel.gradient, padding: 3, borderRadius: '50%' }}>
            <div style={{ background: '#0d0608', borderRadius: '50%', padding: 3 }}>
              <UserAvatarDisplay profile={profile} size={90} fallback={user?.full_name?.[0] || '✨'} showRing={false} />
            </div>
          </div>
          <button onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)', border: '2px solid #0d0608' }}>
            {uploadingPhoto
              ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Camera size={14} className="text-white" />}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </div>

        <h2 className="text-xl font-black text-white">{user?.full_name}</h2>
        <p className="text-sm font-medium mt-0.5" style={{ color: theme.textAccent }}>@{username || user?.email?.split('@')[0]}</p>

        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: glowLevel.gradient, boxShadow: `0 4px 16px ${glowLevel.color}40` }}>
            <span>{glowLevel.emoji}</span> <span className="text-white">{glowLevel.name}</span>
          </div>
          <button onClick={() => navigate('/avatar')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border"
            style={{ borderColor: 'rgba(236,72,153,0.4)', color: '#f9a8d4' }}>
            <Sparkles size={11} /> Change Identity
          </button>
        </div>

        {badges.length > 0 && (
          <div className="flex gap-1.5 flex-wrap justify-center mt-3 px-6">
            {badges.slice(0, 4).map(b => (
              <span key={b.id} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', color: '#f9a8d4' }}>
                {b.emoji} {b.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Scrollable Sections ────────────────────────── */}
      <div className="px-4 space-y-3 pb-40">

        {/* 1. Profile Identity */}
        <SectionCard icon="🪪" title="Profile Identity" subtitle="Name, username, bio & more" defaultOpen>

          <div>
            <FieldLabel>Full Name</FieldLabel>
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-sm text-gray-300 flex-1">{user?.full_name}</p>
              <span className="text-[10px] text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">Managed by account</span>
            </div>
          </div>

          <div>
            <FieldLabel>Display Name</FieldLabel>
            <TextInput value={displayName} onChange={e => setDisplayName(e.target.value.slice(0,40))} placeholder="How you want to be known..." maxLength={40} />
          </div>

          <div>
            <FieldLabel>Username</FieldLabel>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${usernameStatus === 'taken' ? 'rgba(239,68,68,0.5)' : usernameStatus === 'available' ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.1)'}` }}>
              <span className="text-pink-400 font-bold text-sm">@</span>
              <input value={username}
                onChange={e => checkUsername(e.target.value.replace(/[^a-z0-9_.]/gi,'').toLowerCase())}
                maxLength={30} placeholder="yourname"
                className="bg-transparent text-white outline-none flex-1 text-sm" />
              {usernameStatus === 'checking' && <div className="w-4 h-4 border-2 border-gray-500 border-t-pink-400 rounded-full animate-spin" />}
              {usernameStatus === 'available' && <Check size={15} className="text-green-400" />}
              {usernameStatus === 'taken' && <X size={15} className="text-red-400" />}
            </div>
            <p className="text-[11px] text-gray-600 mt-1.5 px-1">girlsglowingup.com/glowlink/{username || '...'}</p>
            {usernameStatus === 'taken' && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {usernameSuggestions.map(s => (
                  <button key={s} onClick={() => { setUsername(s); setUsernameStatus(''); }}
                    className="text-xs px-3 py-1 rounded-full font-semibold"
                    style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#86efac' }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <FieldLabel>Pronouns (optional)</FieldLabel>
            <div className="flex gap-2 flex-wrap">
              {PRONOUN_OPTIONS.map(p => (
                <button key={p} onClick={() => setPronouns(pronouns === p ? '' : p)}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold transition"
                  style={{ background: pronouns === p ? 'linear-gradient(135deg,#ec4899,#a855f7)' : 'rgba(255,255,255,0.06)', border: `1px solid ${pronouns === p ? 'transparent' : 'rgba(255,255,255,0.1)'}`, color: pronouns === p ? '#fff' : '#9ca3af' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel>Bio</FieldLabel>
              <span className="text-[10px] text-gray-600">{bio.length}/300</span>
            </div>
            <TextArea value={bio} onChange={e => setBio(e.target.value.slice(0,300))} placeholder="Tell your glow story..." maxLength={300} rows={3} />
          </div>

          <div>
            <FieldLabel>Personal Motto / Tagline</FieldLabel>
            <TextInput value={motto} onChange={e => setMotto(e.target.value.slice(0,150))} placeholder="Your power phrase..." maxLength={150} />
          </div>

          <div>
            <FieldLabel>Glow Era</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {GLOW_ERAS.map(era => (
                <button key={era} onClick={() => setGlowEra(era)}
                  className="px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left"
                  style={{ background: glowEra === era ? 'linear-gradient(135deg,#c44a55,#ec4899)' : 'rgba(255,255,255,0.05)', border: `1px solid ${glowEra === era ? 'transparent' : 'rgba(255,255,255,0.08)'}`, color: glowEra === era ? '#fff' : '#9ca3af' }}>
                  {era}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* 2. Personality & Vibe */}
        <SectionCard icon="✨" title="Personality & Vibe" subtitle="Your energy, interests & mood">

          <div>
            <FieldLabel>Your Vibe</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {VIBE_OPTIONS.map(v => (
                <button key={v.id} onClick={() => setVibe(vibe === v.id ? '' : v.id)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm font-semibold transition"
                  style={{ background: vibe === v.id ? 'linear-gradient(135deg,rgba(236,72,153,0.3),rgba(168,85,247,0.3))' : 'rgba(255,255,255,0.05)', border: `1.5px solid ${vibe === v.id ? 'rgba(236,72,153,0.6)' : 'rgba(255,255,255,0.08)'}`, color: vibe === v.id ? '#f9a8d4' : '#9ca3af' }}>
                  <span>{v.emoji}</span> <span>{v.label}</span>
                  {vibe === v.id && <Check size={12} className="ml-auto text-pink-400" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Interests</FieldLabel>
            <div className="flex gap-2 flex-wrap">
              {INTEREST_OPTIONS.map(tag => (
                <button key={tag} onClick={() => toggleInterest(tag)}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold transition"
                  style={{ background: interests.includes(tag) ? 'linear-gradient(135deg,#ec4899,#a855f7)' : 'rgba(255,255,255,0.06)', border: `1px solid ${interests.includes(tag) ? 'transparent' : 'rgba(255,255,255,0.1)'}`, color: interests.includes(tag) ? '#fff' : '#9ca3af' }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Current Mood</FieldLabel>
            <TextInput value={featuredMood} onChange={e => setFeaturedMood(e.target.value.slice(0,80))} placeholder="How are you feeling right now?" maxLength={80} />
          </div>

          <div>
            <FieldLabel>Current Goal</FieldLabel>
            <TextInput value={featuredGoal} onChange={e => setFeaturedGoal(e.target.value.slice(0,150))} placeholder="What are you working toward?" maxLength={150} />
          </div>

          <div>
            <FieldLabel>Favorite Affirmation</FieldLabel>
            <TextInput value={featuredAffirmation} onChange={e => setFeaturedAffirmation(e.target.value.slice(0,150))} placeholder="Your current affirmation..." maxLength={150} />
          </div>

          <div>
            <FieldLabel>Featured Quote</FieldLabel>
            <TextArea value={featuredQuote} onChange={e => setFeaturedQuote(e.target.value.slice(0,200))} placeholder="A quote that defines you..." maxLength={200} rows={2} />
          </div>
        </SectionCard>

        {/* 3. Profile Style */}
        <SectionCard icon="🎨" title="Profile Style" subtitle="Theme, frame & visual identity">

          <div>
            <div className="flex items-center justify-between mb-3">
              <FieldLabel>Profile Theme</FieldLabel>
              <span className="text-[10px] text-gray-600">Unlock with points ✨</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {GLOW_THEMES.map(t => {
                const isUnlocked = isAdmin || totalPoints >= t.requiredPoints;
                const isActive = profileTheme === t.id;
                return (
                  <button key={t.id} onClick={() => isUnlocked && setProfileTheme(t.id)}
                    className="relative rounded-2xl p-3 text-left transition-all overflow-hidden"
                    style={{ background: isActive ? t.gradient : 'rgba(255,255,255,0.05)', border: `1.5px solid ${isActive ? t.accent : 'rgba(255,255,255,0.08)'}`, opacity: isUnlocked ? 1 : 0.5, boxShadow: isActive ? `0 4px 20px ${t.glow}` : 'none' }}>
                    {!isUnlocked && <div className="absolute top-2 right-2"><Lock size={10} className="text-gray-500" /></div>}
                    {isActive && <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center bg-white/20"><Check size={10} className="text-white" /></div>}
                    <p className="text-lg mb-1">{t.emoji}</p>
                    <p className="text-xs font-bold text-white">{t.name}</p>
                    <p className="text-[10px] text-white/60">{t.requiredPoints === 0 ? 'Free' : `${t.requiredPoints} pts`}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <FieldLabel>Profile Frame</FieldLabel>
            <div className="grid grid-cols-4 gap-2">
              {PROFILE_FRAMES.map(f => {
                const isUnlocked = isAdmin || totalPoints >= f.requiredPoints;
                const isActive = profileFrame === f.id;
                const fStyle = f.style(theme.accent);
                return (
                  <button key={f.id} onClick={() => isUnlocked && setProfileFrame(f.id)}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition"
                    style={{ background: isActive ? `${theme.accent}20` : 'rgba(255,255,255,0.05)', border: `1.5px solid ${isActive ? theme.accent : 'rgba(255,255,255,0.08)'}`, opacity: isUnlocked ? 1 : 0.5 }}>
                    <div style={{ ...fStyle, borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                      {f.emoji}
                    </div>
                    <p className="text-[9px] text-center text-gray-400 leading-tight">{f.name}</p>
                    {!isUnlocked && <Lock size={8} className="text-gray-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Banner Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <FieldLabel>Profile Banner</FieldLabel>
              {isAdmin
                ? <span className="text-[10px] text-green-400">Admin — all unlocked</span>
                : <span className="text-[10px] text-gray-600">Unlocks at 100 pts</span>
              }
            </div>
            {bannerUrl ? (
              <div className="relative rounded-2xl overflow-hidden mb-2" style={{ height: 80 }}>
                <img src={bannerUrl} alt="banner" className="w-full h-full object-cover" />
                <button onClick={() => setBannerUrl('')}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-black/70 text-white text-xs">
                  x
                </button>
              </div>
            ) : (
              <div className="h-16 rounded-2xl flex items-center justify-center mb-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.15)' }}>
                <p className="text-xs text-gray-500">No banner set — uses theme gradient</p>
              </div>
            )}
            <button onClick={() => (isAdmin || totalPoints >= 100) ? bannerInputRef.current?.click() : null}
              disabled={uploadingBanner || (!isAdmin && totalPoints < 100)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
              {uploadingBanner
                ? <div className="w-4 h-4 border-2 border-gray-400 border-t-pink-400 rounded-full animate-spin" />
                : <Upload size={14} />}
              {uploadingBanner ? 'Uploading...' : bannerUrl ? 'Change Banner' : 'Upload Banner'}
            </button>
            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
          </div>

          {/* Future premium placeholder */}
          <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: 'rgba(251,191,36,0.05)', border: '1px dashed rgba(251,191,36,0.2)' }}>
            <span className="text-xl">🔮</span>
            <div>
              <p className="text-xs font-bold text-yellow-400">Coming Soon: Premium Effects</p>
              <p className="text-[11px] text-gray-500">Profile music, animations &amp; seasonal styles</p>
            </div>
          </div>
        </SectionCard>

        {/* 4. Glow Link */}
        <SectionCard icon="🔗" title="Glow Link" subtitle={`glowlink/${username || '...'}`}>

          <div className="px-3 py-3 rounded-2xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <p className="text-xs text-gray-500 mb-1">Your public link</p>
            <p className="text-sm font-mono text-yellow-400 break-all">{glowLinkUrl}</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={copyLink} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Copy size={18} className="text-pink-400" />
              <span className="text-xs text-gray-400 font-medium">Copy</span>
            </button>
            <button onClick={() => navigator.share ? navigator.share({ url: glowLinkUrl }).catch(() => {}) : copyLink()}
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Share2 size={18} className="text-purple-400" />
              <span className="text-xs text-gray-400 font-medium">Share</span>
            </button>
            <button onClick={() => navigate(`/glowlink/${username || user?.email?.split('@')[0]}`)}
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <ExternalLink size={18} className="text-blue-400" />
              <span className="text-xs text-gray-400 font-medium">View</span>
            </button>
          </div>

          <div>
            <FieldLabel>Custom Links ({links.length}/3)</FieldLabel>
            <div className="space-y-2 mb-2">
              {links.map((link, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Link2 size={14} className="text-pink-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{link.label}</p>
                    <p className="text-xs text-gray-500 truncate">{link.url}</p>
                  </div>
                  <button onClick={() => setLinks(prev => prev.filter((_, j) => j !== i))} className="text-gray-600 hover:text-red-400 transition p-1">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            {links.length < 3 && !showLinkForm && (
              <button onClick={() => setShowLinkForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,rgba(236,72,153,0.2),rgba(168,85,247,0.2))', border: '1px solid rgba(236,72,153,0.3)' }}>
                <Plus size={15} /> Add Link
              </button>
            )}
            {showLinkForm && (
              <div className="p-3 rounded-2xl space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(236,72,153,0.15)' }}>
                <TextInput value={newLinkLabel} onChange={e => setNewLinkLabel(e.target.value)} placeholder="Label (e.g. TikTok, Portfolio)" />
                <TextInput value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="https://..." />
                <div className="flex gap-2">
                  <button onClick={() => { setShowLinkForm(false); setNewLinkLabel(''); setNewLinkUrl(''); }}
                    className="flex-1 py-2.5 rounded-xl text-sm text-gray-400" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    Cancel
                  </button>
                  <button onClick={() => {
                    if (newLinkLabel.trim() && newLinkUrl.trim()) {
                      setLinks(prev => [...prev, { label: newLinkLabel.trim(), url: newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : 'https://' + newLinkUrl.trim() }]);
                      setShowLinkForm(false); setNewLinkLabel(''); setNewLinkUrl('');
                    }
                  }} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#c44a55,#ec4899)' }}>
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* 5. Privacy & Social */}
        <SectionCard icon="🔒" title="Privacy & Social" subtitle="Control who sees what">
          <div className="rounded-2xl overflow-hidden divide-y" style={{ border: '1px solid rgba(255,255,255,0.08)', divideColor: 'rgba(255,255,255,0.06)' }}>
            {[
              { key: 'public_profile',    label: 'Public Profile',     desc: 'Anyone can view your Glow Link', emoji: '🌍' },
              { key: 'allow_followers',   label: 'Allow Followers',    desc: 'Let others follow your glow', emoji: '💜' },
              { key: 'show_achievements', label: 'Show Achievements',  desc: 'Display badges & stats', emoji: '🏅' },
              { key: 'show_streak',       label: 'Show Streak',        desc: 'Show your day streak', emoji: '🔥' },
              { key: 'show_links',        label: 'Show Links',         desc: 'Show your custom links', emoji: '🔗' },
              { key: 'show_timeline',     label: 'Show Timeline',      desc: 'Show your posts', emoji: '📝' },
              { key: 'show_photos',       label: 'Show Photos',        desc: 'Show your photos tab', emoji: '📸' },
              { key: 'show_interests',    label: 'Show Interests',     desc: 'Display your interest tags', emoji: '🏷️' },
              { key: 'show_vibe',         label: 'Show Vibe',          desc: 'Show your personality vibe', emoji: '✨' },
              { key: 'show_goals',        label: 'Show Goals',         desc: 'Show your current goal', emoji: '🎯' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between px-4 py-3.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-base">{item.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
                <Toggle on={!!privacy[item.key]} onToggle={() => setPrivacy(p => ({ ...p, [item.key]: !p[item.key] }))} />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 6. Account */}
        <SectionCard icon="⚙️" title="Account Settings" subtitle="Email, security & more">

          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-base">📧</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm text-white truncate">{user?.email}</p>
            </div>
            <span className="text-[10px] text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">Verified</span>
          </div>

          <button onClick={() => setShowPasswordInfo(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-base">🔑</span>
            <span className="text-sm font-semibold text-white flex-1 text-left">Password Reset</span>
            <ChevronRight size={15} className="text-gray-500" />
          </button>

          <button onClick={() => navigate('/support')}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Bell size={16} className="text-gray-400" />
            <span className="text-sm font-semibold text-white flex-1 text-left">Help &amp; Support</span>
            <ChevronRight size={15} className="text-gray-500" />
          </button>

          <button onClick={() => base44.auth.logout()}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition hover:opacity-80"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <LogOut size={16} className="text-red-400" />
            <span className="text-sm font-semibold text-red-400 flex-1 text-left">Sign Out</span>
          </button>
        </SectionCard>

      </div>

      {/* ── Floating Save Bar (safe-area aware) ────────── */}
      <div style={{ position: 'fixed', bottom: 'calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px))', left: 0, right: 0, zIndex: 40, background: 'rgba(13,6,8,0.97)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px' }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving || usernameStatus === 'taken'}
          className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#c44a55,#ec4899)', boxShadow: '0 4px 24px rgba(236,72,153,0.4)' }}>
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : '✨ Save Profile'}
        </motion.button>
      </div>

      {/* ── Bottom Nav ─────────────────────────────────── */}
      <BottomNav active="me" />

      {/* Password Reset Info Modal */}
      {showPasswordInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: '#140a10', border: '1px solid rgba(232,82,109,0.25)' }}>
            <div className="text-center mb-4">
              <p className="text-3xl mb-2">🔑</p>
              <h3 className="text-lg font-bold text-white">Password Reset</h3>
            </div>
            <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-sm text-gray-300 leading-relaxed">
                To reset your password, sign out then tap <strong className="text-pink-400">Forgot Password</strong> on the login screen. A reset link will be sent to your email.
              </p>
            </div>
            <button onClick={() => setShowPasswordInfo(false)}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg,#c44a55,#ec4899)' }}>
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <GlowProfilePreview
          profile={profile}
          overrides={{ bio, motto, glowEra, profileTheme, profileFrame, links, featuredMood, featuredAffirmation, featuredGoal, featuredQuote, vibe, interests, privacy, bannerUrl }}
          posts={posts}
          pointsRecord={pointsRecord}
          username={username}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}