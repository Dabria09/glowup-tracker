import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';
import UserAvatarDisplay from '@/components/UserAvatarDisplay';
import {
  ChevronLeft, Plus, X, Upload, Check, Copy, Share2, ExternalLink,
  Trash2, Link2, Sparkles, Camera, Lock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { GLOW_THEMES, PROFILE_FRAMES, getGlowLevel, getTheme, computeBadges } from '@/components/glowlink/GlowThemes';
import GlowProfilePreview from '@/components/glowlink/GlowProfilePreview';

const GLOW_ERAS = [
  'Confidence Era','Glow Up Era','Boss Era','Healing Era','Growth Era',
  'Abundance Era','Queen Era','Unbothered Era','Focused Era','Elevation Era',
];

const DEFAULT_PRIVACY = {
  public_profile: true,
  show_achievements: true,
  show_streak: true,
  show_goals: true,
  show_links: true,
  show_timeline: true,
  show_photos: true,
};

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle}
      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ background: on ? '#ec4899' : 'rgba(255,255,255,0.15)' }}>
      <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
        style={{ transform: on ? 'translateX(22px)' : 'translateX(2px)' }} />
    </button>
  );
}

export default function MyGlowLink() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [posts, setPosts] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsRecord, setPointsRecord] = useState(null);

  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [glowEra, setGlowEra] = useState('Glow Up Era');
  const [bio, setBio] = useState('');
  const [motto, setMotto] = useState('');
  const [links, setLinks] = useState([]);
  const [privacy, setPrivacy] = useState(DEFAULT_PRIVACY);

  // Customization
  const [profileTheme, setProfileTheme] = useState('default');
  const [profileFrame, setProfileFrame] = useState('default');
  const [featuredMood, setFeaturedMood] = useState('');
  const [featuredAffirmation, setFeaturedAffirmation] = useState('');
  const [featuredGoal, setFeaturedGoal] = useState('');

  const [showLinkForm, setShowLinkForm] = useState(false);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const [showPreview, setShowPreview] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postText, setPostText] = useState('');
  const [postVisibility, setPostVisibility] = useState('public');
  const [postingPost, setPostingPost] = useState(false);

  const fileInputRef = useRef();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const usernameTimer = useRef(null);

  const theme = getTheme(profileTheme);

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
        setGlowEra(p.glow_era || 'Glow Up Era');
        setBio(p.bio || '');
        setMotto(p.motto || '');
        setProfileTheme(p.profile_theme || 'default');
        setProfileFrame(p.profile_frame || 'default');
        try { setLinks(p.links ? JSON.parse(p.links) : []); } catch {}
        try { setPrivacy({ ...DEFAULT_PRIVACY, ...(p.privacy_settings ? JSON.parse(p.privacy_settings) : {}) }); } catch {}
        try {
          const fs = p.featured_sections ? JSON.parse(p.featured_sections) : {};
          setFeaturedMood(fs.mood || '');
          setFeaturedAffirmation(fs.affirmation || '');
          setFeaturedGoal(fs.goal || '');
        } catch {}
      }

      if (pts.length) {
        setTotalPoints(pts[0].total_points || 0);
        setPointsRecord(pts[0]);
      }
      setPosts(userPosts);
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
        setUsernameSuggestions([`${val}${Math.floor(Math.random()*99)+1}`, `${val}_glow`, `${val}_ggу`]);
      } else {
        setUsernameStatus('available');
        setUsernameSuggestions([]);
      }
    }, 600);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Max 5 MB'); return; }
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
    if (usernameStatus === 'taken') { setSaveMsg('❌ Username is taken. Please choose another.'); setTimeout(() => setSaveMsg(''), 3000); return; }
    setSaving(true);
    const data = {
      bio: bio.trim(),
      motto: motto.trim(),
      glow_era: glowEra,
      username: username.trim(),
      links: JSON.stringify(links),
      privacy_settings: JSON.stringify(privacy),
      profile_theme: profileTheme,
      profile_frame: profileFrame,
      featured_sections: JSON.stringify({ mood: featuredMood.trim(), affirmation: featuredAffirmation.trim(), goal: featuredGoal.trim() }),
    };
    try {
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, data);
        setProfile(p => ({ ...p, ...data }));
      } else {
        const np = await base44.entities.UserProfile.create({ user_email: user.email, ...data });
        setProfile(np);
      }
      setSaveMsg('✅ Glow Link saved!');
    } catch {
      setSaveMsg('❌ Save failed. Try again.');
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handlePost = async () => {
    if (!postText.trim() || postingPost) return;
    setPostingPost(true);
    const post = await base44.entities.GlowUpPost.create({
      user_email: user.email,
      content: postText.trim(),
      media_urls: '[]',
      visibility: postVisibility,
      likes: 0,
      comments: 0,
    });
    setPosts(prev => [post, ...prev]);
    setPostText('');
    setPostingPost(false);
    setShowPostForm(false);
  };

  const handleDeletePost = async (id) => {
    await base44.entities.GlowUpPost.delete(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const glowLinkUrl = `${window.location.origin}/glowlink/${username || user?.email?.split('@')[0] || 'me'}`;
  const glowLevel = getGlowLevel(totalPoints);
  const badges = computeBadges(totalPoints, pointsRecord?.check_in_streak, pointsRecord?.challenges_completed, posts.length);

  const copyLink = () => {
    navigator.clipboard?.writeText(glowLinkUrl);
    setSaveMsg('📋 Link copied!');
    setTimeout(() => setSaveMsg(''), 2000);
  };

  const shareLink = () => {
    if (navigator.share) navigator.share({ title: 'My Glow Link', url: glowLinkUrl }).catch(() => {});
    else copyLink();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-28" style={{ backgroundColor: '#0d0608' }}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(13,6,8,0.9)', borderBottom: '1px solid rgba(232,82,109,0.15)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold">My Glow Link™</h1>
          <p className="text-xs text-gray-500">{glowLevel.emoji} {glowLevel.name} · {totalPoints} pts</p>
        </div>
        <button onClick={() => setShowPreview(true)}
          className="px-4 py-2 rounded-full font-bold text-sm transition"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0' }}>
          👁 Preview
        </button>
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2 rounded-full font-bold text-white text-sm disabled:opacity-60 transition"
          style={{ background: 'linear-gradient(135deg,#c44a55,#ec4899)' }}>
          {saving ? '...' : 'Save'}
        </button>
      </div>

      {saveMsg && (
        <div className="mx-4 mt-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-center"
          style={{ background: saveMsg.startsWith('✅') || saveMsg.startsWith('📋') ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${saveMsg.startsWith('✅') || saveMsg.startsWith('📋') ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
          {saveMsg}
        </div>
      )}

      <div className="px-4 pt-4 space-y-5">

        {/* ── Glow Level Card ───────────────────────────────────── */}
        <div className="rounded-3xl p-4 overflow-hidden relative" style={{ background: glowLevel.gradient, boxShadow: `0 8px 32px ${glowLevel.color}30` }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4), transparent 60%)' }} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/70">Your Glow Level</p>
                <h2 className="text-2xl font-black text-white">{glowLevel.emoji} {glowLevel.name}</h2>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-white">{totalPoints}</p>
                <p className="text-xs text-white/70">points</p>
              </div>
            </div>
            {glowLevel.next && (
              <div>
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100,(totalPoints/glowLevel.next)*100)}%` }} />
                </div>
                <p className="text-xs text-white/60 mt-1">{glowLevel.next - totalPoints} pts to next level</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Earned Badges ─────────────────────────────────────── */}
        {badges.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Your Badges ({badges.length})</p>
            <div className="flex flex-wrap gap-2">
              {badges.map(badge => (
                <div key={badge.id} title={badge.desc} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.3)', color: '#f9a8d4' }}>
                  {badge.emoji} {badge.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Profile Preview ───────────────────────────────────── */}
        <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(232,82,109,0.2)' }}>
          <div className="h-14 relative" style={{ background: theme.gradient }}>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(255,255,255,0.05) 10px,rgba(255,255,255,0.05) 20px)' }} />
          </div>
          <div className="px-4 pb-4">
            <div className="flex items-end gap-3 -mt-8 mb-3">
              <div className="relative flex-shrink-0">
                <UserAvatarDisplay profile={profile} size={64} fallback={user?.full_name?.[0] || 'G'} showRing />
                <button onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: '#ec4899', border: '2px solid #0d0608' }}>
                  <Camera size={11} className="text-white" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
              <div className="flex-1 min-w-0 pt-8">
                <p className="font-bold text-white text-base truncate">{user?.full_name}</p>
                <p className="text-xs text-gray-400">@{username || user?.email?.split('@')[0]}</p>
              </div>
              <div className="pb-1">
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: glowLevel.gradient, color: '#fff' }}>{glowLevel.emoji} {glowLevel.name}</span>
              </div>
            </div>
            {bio && <p className="text-sm text-gray-300 leading-relaxed">{bio}</p>}
          </div>
        </div>

        {/* ── Link URL bar ──────────────────────────────────────── */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-widest">Your Link</p>
          <div className="px-3 py-2.5 rounded-xl mb-3" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <p className="text-sm font-mono text-yellow-400 truncate">{glowLinkUrl}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={copyLink} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: 'rgba(236,72,153,0.4)', color: '#f9a8d4' }}>
              <Copy size={14} /> Copy
            </button>
            <button onClick={shareLink} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: 'rgba(236,72,153,0.4)', color: '#f9a8d4' }}>
              <Share2 size={14} /> Share
            </button>
            <button onClick={() => navigate(`/glowlink/${username || user?.email?.split('@')[0]}`)}
              className="w-11 flex items-center justify-center rounded-xl border" style={{ borderColor: 'rgba(236,72,153,0.4)', color: '#f9a8d4' }}>
              <ExternalLink size={16} />
            </button>
          </div>
        </div>

        {/* ── New Post ─────────────────────────────────────────── */}
        <button onClick={() => setShowPostForm(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl"
          style={{ background: 'linear-gradient(135deg,rgba(236,72,153,0.15),rgba(168,85,247,0.15))', border: '1px solid rgba(236,72,153,0.25)' }}>
          <Plus size={18} className="text-pink-400" />
          <span className="text-sm font-semibold text-pink-400">Share a post</span>
        </button>

        {/* ── Tabs ─────────────────────────────────────────────── */}
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {['timeline','customize','settings'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-xl font-semibold text-xs capitalize transition"
              style={{ background: activeTab === tab ? 'linear-gradient(135deg,#c44a55,#ec4899)' : 'transparent', color: activeTab === tab ? '#fff' : '#9ca3af' }}>
              {tab === 'timeline' ? '📝 Posts' : tab === 'customize' ? '🎨 Style' : '⚙️ Settings'}
            </button>
          ))}
        </div>

        {/* ── Timeline Tab ─────────────────────────────────────── */}
        {activeTab === 'timeline' && (
          <div className="space-y-3 pb-4">
            {posts.length === 0 ? (
              <div className="text-center py-14">
                <span className="text-4xl block mb-3">✨</span>
                <p className="text-gray-400 text-sm">No posts yet. Share your glow journey!</p>
              </div>
            ) : posts.map(post => (
              <div key={post.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UserAvatarDisplay profile={profile} size={32} fallback={user?.full_name?.[0]} />
                    <div>
                      <p className="text-xs font-semibold text-white">{user?.full_name}</p>
                      <p className="text-[10px] text-gray-500">{new Date(post.created_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: post.visibility === 'public' ? 'rgba(52,211,153,0.15)' : 'rgba(168,85,247,0.15)', color: post.visibility === 'public' ? '#86efac' : '#d8b4fe' }}>
                      {post.visibility === 'public' ? '🌍' : '👥'}
                    </span>
                    <button onClick={() => handleDeletePost(post.id)} className="text-gray-600 hover:text-red-400 transition">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed">{post.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Customize Tab ────────────────────────────────────── */}
        {activeTab === 'customize' && (
          <div className="space-y-7 pb-6">

            {/* Profile Themes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Profile Theme</h3>
                <span className="text-xs text-gray-600">Unlock with points ✨</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {GLOW_THEMES.map(t => {
                  const isUnlocked = totalPoints >= t.requiredPoints;
                  const isActive = profileTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => isUnlocked && setProfileTheme(t.id)}
                      className="relative rounded-2xl p-3 text-left transition-all overflow-hidden"
                      style={{
                        background: isActive ? t.gradient : 'rgba(255,255,255,0.05)',
                        border: `1.5px solid ${isActive ? t.accent : 'rgba(255,255,255,0.08)'}`,
                        opacity: isUnlocked ? 1 : 0.5,
                        boxShadow: isActive ? `0 4px 20px ${t.glow}` : 'none',
                      }}
                    >
                      {!isUnlocked && (
                        <div className="absolute top-2 right-2"><Lock size={10} className="text-gray-500" /></div>
                      )}
                      {isActive && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center bg-white/20">
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                      <p className="text-lg mb-1">{t.emoji}</p>
                      <p className="text-xs font-bold text-white">{t.name}</p>
                      <p className="text-[10px] text-white/60">{t.requiredPoints === 0 ? 'Free' : `${t.requiredPoints} pts`}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profile Frames */}
            <div>
              <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-3 uppercase">Profile Frame</h3>
              <div className="grid grid-cols-4 gap-2">
                {PROFILE_FRAMES.map(f => {
                  const isUnlocked = totalPoints >= f.requiredPoints;
                  const isActive = profileFrame === f.id;
                  const fStyle = f.style(theme.accent);
                  return (
                    <button
                      key={f.id}
                      onClick={() => isUnlocked && setProfileFrame(f.id)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition"
                      style={{ background: isActive ? `${theme.accent}20` : 'rgba(255,255,255,0.05)', border: `1.5px solid ${isActive ? theme.accent : 'rgba(255,255,255,0.08)'}`, opacity: isUnlocked ? 1 : 0.5 }}
                    >
                      <div style={{ ...fStyle, borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                        {f.emoji}
                      </div>
                      <p className="text-[9px] text-center text-gray-400 leading-tight">{f.name}</p>
                      {!isUnlocked && <Lock size={8} className="text-gray-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Featured Sections */}
            <div>
              <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-3 uppercase">Featured Sections</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">😊 Current Mood</p>
                  <input value={featuredMood} onChange={e => setFeaturedMood(e.target.value.slice(0, 80))}
                    placeholder="How are you feeling right now?"
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">💬 Affirmation</p>
                  <input value={featuredAffirmation} onChange={e => setFeaturedAffirmation(e.target.value.slice(0, 150))}
                    placeholder="Your current affirmation..."
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">🎯 Current Goal</p>
                  <input value={featuredGoal} onChange={e => setFeaturedGoal(e.target.value.slice(0, 150))}
                    placeholder="What are you working toward?"
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full py-4 rounded-2xl font-bold text-white text-sm disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)', boxShadow: '0 4px 20px rgba(236,72,153,0.35)' }}>
              {saving ? 'Saving...' : 'Save Customization 🎨'}
            </button>
          </div>
        )}

        {/* ── Settings Tab ─────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="space-y-6 pb-6">

            <div>
              <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-3 uppercase">Profile Photo</h3>
              <div className="flex items-center gap-4">
                <UserAvatarDisplay profile={profile} size={72} fallback={user?.full_name?.[0]} showRing />
                <div className="flex flex-col gap-2">
                  <button onClick={() => navigate('/avatar')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#c44a55,#ec4899)' }}>
                    <Sparkles size={14} /> Change Identity
                  </button>
                  <label className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer" style={{ border: '1px solid rgba(236,72,153,0.4)', color: '#f9a8d4' }}>
                    {uploadingPhoto ? 'Uploading...' : <><Upload size={13} /> Upload Photo</>}
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-3 uppercase">Username</h3>
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${usernameStatus === 'taken' ? 'rgba(239,68,68,0.5)' : usernameStatus === 'available' ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.1)'}` }}>
                <span className="text-gray-400 font-semibold">@</span>
                <input value={username} onChange={e => checkUsername(e.target.value.replace(/[^a-z0-9_.]/gi, '').toLowerCase())}
                  maxLength={30} placeholder="yourname"
                  className="bg-transparent text-white outline-none flex-1 text-sm" />
                {usernameStatus === 'checking' && <div className="w-4 h-4 border-2 border-gray-500 border-t-pink-400 rounded-full animate-spin" />}
                {usernameStatus === 'available' && <Check size={16} className="text-green-400" />}
                {usernameStatus === 'taken' && <X size={16} className="text-red-400" />}
              </div>
              {usernameStatus === 'taken' && (
                <div className="mt-2">
                  <p className="text-xs text-red-400 font-semibold mb-1">✕ Already taken. Try:</p>
                  <div className="flex gap-2 flex-wrap">
                    {usernameSuggestions.map(s => (
                      <button key={s} onClick={() => { setUsername(s); setUsernameStatus(''); }}
                        className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#86efac' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-3 uppercase">Glow Era</h3>
              <div className="grid grid-cols-2 gap-2">
                {GLOW_ERAS.map(era => (
                  <button key={era} onClick={() => setGlowEra(era)}
                    className="px-3 py-2.5 rounded-xl text-xs font-semibold transition"
                    style={{ background: glowEra === era ? 'linear-gradient(135deg,#c44a55,#ec4899)' : 'rgba(255,255,255,0.05)', border: `1px solid ${glowEra === era ? 'transparent' : 'rgba(255,255,255,0.1)'}`, color: glowEra === era ? '#fff' : '#9ca3af' }}>
                    {era}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-1 uppercase">Your Bio</h3>
              <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 500))}
                placeholder="Your bio..."
                className="w-full rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', minHeight: 80 }} />
              <p className="text-xs text-right text-gray-600 mt-1">{bio.length}/500</p>
            </div>

            <div>
              <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-3 uppercase">Personal Motto</h3>
              <input value={motto} onChange={e => setMotto(e.target.value.slice(0, 150))}
                placeholder="Your personal motto or favorite quote..."
                className="w-full rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div>
              <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-3 uppercase">Your Links ({links.length}/3)</h3>
              <div className="space-y-2 mb-3">
                {links.map((link, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Link2 size={14} className="text-pink-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{link.label}</p>
                      <p className="text-xs text-gray-500 truncate">{link.url}</p>
                    </div>
                    <button onClick={() => setLinks(prev => prev.filter((_, j) => j !== i))} className="text-gray-600 hover:text-red-400 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              {links.length < 3 && !showLinkForm && (
                <button onClick={() => setShowLinkForm(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
                  <Plus size={16} /> Add Link
                </button>
              )}
              {showLinkForm && (
                <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(236,72,153,0.2)' }}>
                  <input value={newLinkLabel} onChange={e => setNewLinkLabel(e.target.value)} placeholder="Label (e.g. TikTok, Portfolio)"
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <input value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="https://..."
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <div className="flex gap-2">
                    <button onClick={() => { setShowLinkForm(false); setNewLinkLabel(''); setNewLinkUrl(''); }} className="flex-1 py-2 rounded-xl text-sm text-gray-400" style={{ background: 'rgba(255,255,255,0.05)' }}>Cancel</button>
                    <button onClick={() => { if (newLinkLabel.trim() && newLinkUrl.trim()) { setLinks(prev => [...prev, { label: newLinkLabel.trim(), url: newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : 'https://' + newLinkUrl.trim() }]); setShowLinkForm(false); setNewLinkLabel(''); setNewLinkUrl(''); }}} className="flex-1 py-2 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#c44a55,#ec4899)' }}>Add</button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-3 uppercase">Privacy Controls</h3>
              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {[
                  { key: 'public_profile',    label: 'Public Profile',    desc: 'Anyone can view your Glow Link' },
                  { key: 'allow_followers',   label: 'Allow Followers',   desc: 'Let others follow your glow journey' },
                  { key: 'show_achievements', label: 'Show Achievements', desc: 'Display your badges and stats' },
                  { key: 'show_streak',       label: 'Show Streak',       desc: 'Show your current streak' },
                  { key: 'show_links',        label: 'Show Links',        desc: 'Show your custom links' },
                  { key: 'show_timeline',     label: 'Show Timeline',     desc: 'Show your posts' },
                  { key: 'show_photos',       label: 'Show Photos',       desc: 'Show your photos tab' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <Toggle on={privacy[item.key]} onToggle={() => setPrivacy(p => ({ ...p, [item.key]: !p[item.key] }))} />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleSave} disabled={saving || usernameStatus === 'taken'}
              className="w-full py-4 rounded-2xl font-bold text-white text-sm disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)', boxShadow: '0 4px 20px rgba(236,72,153,0.35)' }}>
              {saving ? 'Saving...' : 'Save My Glow Link 💜'}
            </button>
          </div>
        )}

      </div>

      {/* Post Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={() => setShowPostForm(false)}>
          <div className="w-full rounded-t-3xl p-5 pb-8" style={{ background: '#1a0a14', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">New Post</h3>
              <div className="flex items-center gap-2">
                <button onClick={handlePost} disabled={!postText.trim() || postingPost}
                  className="px-5 py-2 rounded-full font-bold text-sm text-white disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#c44a55,#ec4899)' }}>
                  {postingPost ? '...' : 'Post'}
                </button>
                <button onClick={() => setShowPostForm(false)}><X size={20} className="text-gray-400" /></button>
              </div>
            </div>
            <textarea value={postText} onChange={e => setPostText(e.target.value.slice(0, 500))}
              placeholder="What's on your mind? ✨"
              className="w-full rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none resize-none mb-3"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', minHeight: 100 }} />
            <p className="text-xs text-gray-600 text-right mb-3">{postText.length}/500</p>
            <div className="flex gap-2">
              {['public', 'followers'].map(v => (
                <button key={v} onClick={() => setPostVisibility(v)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition"
                  style={{ background: postVisibility === v ? 'linear-gradient(135deg,#c44a55,#ec4899)' : 'rgba(255,255,255,0.05)', color: postVisibility === v ? '#fff' : '#9ca3af', border: `1px solid ${postVisibility === v ? 'transparent' : 'rgba(255,255,255,0.1)'}` }}>
                  {v === 'public' ? '🌍 Public' : '👥 Followers'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <GlowProfilePreview
          profile={profile}
          overrides={{ bio, motto, glowEra, profileTheme, profileFrame, links, featuredMood, featuredAffirmation, featuredGoal }}
          posts={posts}
          pointsRecord={pointsRecord}
          username={username}
          onClose={() => setShowPreview(false)}
        />
      )}

      <BottomNav active="connect" />
    </div>
  );
}