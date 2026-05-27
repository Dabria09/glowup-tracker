import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';
import {
  Edit3, Link2, BookOpen, Image, Quote, Briefcase, GraduationCap,
  MessageSquare, Heart, MessageCircle, LogOut, Trash2, ChevronRight,
  Shield, FileText, Users, Sparkles
} from 'lucide-react';

// Match home page color tokens exactly
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
  { id: 'glow_girls', emoji: '🌸', label: 'Glow Girl', ages: 'Ages 10–13', desc: 'Your glow journey starts here' },
  { id: 'glow_teens', emoji: '✨', label: 'Glow Teen', ages: 'Ages 14–18', desc: 'Level up your life' },
  { id: 'glow_women', emoji: '👑', label: 'Glow Woman', ages: 'Ages 19+', desc: 'Own your era' },
];

const POST_TYPES = [
  { type: 'Thought', emoji: '💭' },
  { type: 'Win', emoji: '🏆' },
  { type: 'Goal', emoji: '🎯' },
  { type: 'Mood', emoji: '💜' },
  { type: 'Gratitude', emoji: '🙏' },
];

const MY_CONTENT = [
  { label: 'My Diary', icon: BookOpen, route: '/diary' },
  { label: 'My Vision Board', icon: Image, route: '/vision-board' },
  { label: 'My Saved Quotes', icon: Quote, route: '/daily-quotes' },
  { label: 'My Career Bookmarks', icon: Briefcase, route: '/careers' },
  { label: 'My Saved Scholarships', icon: GraduationCap, route: '/scholarships' },
];

const MY_ACTIVITY = [
  { label: 'My Posts', icon: MessageSquare, route: '/glow-feed' },
  { label: 'My Reactions', icon: Heart, route: '/glow-feed' },
  { label: 'My Comments', icon: MessageCircle, route: '/glow-feed' },
];

const SOCIAL_LINKS = [
  { icon: '📸', label: 'Instagram', url: 'https://instagram.com/girlsglowingup', bg: 'linear-gradient(135deg,#e1306c,#833ab4)' },
  { icon: '🎵', label: 'TikTok', url: 'https://tiktok.com/@girlsglowingup', bg: '#111' },
  { icon: '▶️', label: 'YouTube', url: 'https://youtube.com/@girlsglowingup', bg: '#ff0000' },
  { icon: '📘', label: 'Facebook', url: 'https://facebook.com/girlsglowingup', bg: '#1877f2' },
  { icon: '👻', label: 'Snapchat', url: 'https://snapchat.com/add/girlsglowingup', bg: '#fffc00' },
];

const LEGAL = [
  { label: 'Privacy Policy', icon: Shield, route: '/about' },
  { label: 'Terms of Service', icon: FileText, route: '/guidelines' },
  { label: 'Parental Consent (COPPA)', icon: Users, route: '/parent-dashboard' },
];

function SectionLabel({ text }) {
  return <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUTED2, marginBottom: 8 }}>{text}</p>;
}

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

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [profiles, pts, userPosts] = await Promise.all([
          base44.entities.UserProfile.filter({ user_email: u.email }),
          base44.entities.UserPoints.filter({ user_email: u.email }),
          base44.entities.GlowUpPost.filter({ user_email: u.email }),
        ]);
        if (profiles.length) setProfile(profiles[0]);
        if (pts.length) setPoints(pts[0]);
        setPosts(userPosts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      } catch {
        base44.auth.redirectToLogin();
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleStageChange = async (ageGroupId) => {
    if (!profile) return;
    setSavingStage(true);
    await base44.entities.UserProfile.update(profile.id, { age_group: ageGroupId });
    setProfile(p => ({ ...p, age_group: ageGroupId }));
    setSavingStage(false);
  };

  const handlePost = async () => {
    if (!postText.trim() || posting) return;
    setPosting(true);
    const post = await base44.entities.GlowUpPost.create({
      user_email: user.email,
      content: postText.trim(),
      media_urls: '[]',
      visibility: 'followers',
      likes: 0,
      comments: 0,
      post_type: postType,
    });
    setPosts(prev => [post, ...prev]);
    setPostText('');
    setPosting(false);
  };

  const handleDeletePost = async (postId) => {
    await base44.entities.GlowUpPost.delete(postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const tier = points?.total_points >= 500 ? 'Radiant' : points?.total_points >= 200 ? 'Glowing' : points?.total_points >= 50 ? 'Seedling' : 'Spark';
  const tierEmoji = { Radiant: '👑', Glowing: '✨', Seedling: '🌱', Spark: '⚡' }[tier];

  const stats = [
    { label: 'Days', value: profile ? Math.max(1, Math.floor((Date.now() - new Date(profile.created_date || Date.now())) / 86400000)) : 0, icon: '📅' },
    { label: 'Challenges', value: points?.challenges_completed || 0, icon: '🏆' },
    { label: 'Streak', value: points?.check_in_streak || 0, icon: '🔥' },
    { label: 'Badges', value: Math.floor((points?.total_points || 0) / 100), icon: '⭐' },
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="w-8 h-8 border-4 border-red-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: BG, color: WHITE, fontFamily: '"DM Sans","Inter",sans-serif', paddingBottom: 110, overflowX: 'hidden' }}>
      {/* Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute rounded-full" style={{ width: 600, height: 600, background: `radial-gradient(circle, rgba(232,82,109,0.35), transparent 70%)`, top: -250, left: -180, filter: 'blur(100px)' }} />
        <div className="absolute rounded-full" style={{ width: 400, height: 400, background: `radial-gradient(circle, rgba(241,182,16,0.2), transparent 70%)`, top: '35%', right: -150, filter: 'blur(100px)' }} />
        <div className="absolute rounded-full" style={{ width: 350, height: 350, background: `radial-gradient(circle, rgba(196,74,85,0.18), transparent 70%)`, bottom: '10%', left: '10%', filter: 'blur(100px)' }} />
      </div>
      {/* Hearts pattern */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'%3E%3Cpath d='M22 34 C11 25 4 18 4 11 C4 7 7.5 3.5 12 3.5 C15.5 3.5 18.5 5.5 22 9 C25.5 5.5 28.5 3.5 32 3.5 C36.5 3.5 40 7 40 11 C40 18 33 25 22 34Z' fill='%23e8526d' opacity='0.04'/%3E%3C/svg%3E\")", backgroundSize: '44px 44px' }} />

      <div className="relative z-10 px-4">

        {/* Points badge */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 12, paddingBottom: 4 }}>
          <button onClick={() => navigate('/glow-score')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(241,182,16,0.1)', border: '1.5px solid rgba(241,182,16,0.35)', color: GOLD_LT, fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 20, cursor: 'pointer' }}>
            🏅 {points?.total_points?.toLocaleString() || 0} pts
          </button>
        </div>

        {/* Profile Header */}
        <div style={{ background: 'linear-gradient(135deg, rgba(232,82,109,0.12), rgba(196,74,85,0.07))', border: `1px solid ${BORDER}`, borderRadius: 24, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div onClick={() => navigate('/avatar')} style={{ width: 80, height: 80, borderRadius: 18, background: `linear-gradient(135deg, ${PINK_DEEP}, ${PINK_HOT})`, boxShadow: `0 0 24px rgba(232,82,109,0.45)`, overflow: 'hidden', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900 }}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.full_name?.[0] || 'G')}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 20, color: WHITE, margin: 0 }}>{user?.full_name}</p>
              <p style={{ fontSize: 13, color: MUTED, margin: '2px 0 0' }}>@{profile?.username || user?.email?.split('@')[0]}</p>
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
            <button onClick={() => navigate('/my-glow-link')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(241,182,16,0.08)', border: '1.5px solid rgba(241,182,16,0.35)', color: GOLD_LT, fontWeight: 700, fontSize: 14, padding: '11px', borderRadius: 14, cursor: 'pointer' }}>
              <Link2 size={15} /> Glow Link
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '10px 4px', borderRadius: 14, background: 'rgba(0,0,0,0.35)', border: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: 18, margin: '0 0 2px' }}>{s.icon}</p>
                <p style={{ fontWeight: 800, fontSize: 17, color: WHITE, margin: '0 0 1px' }}>{s.value}</p>
                <p style={{ fontSize: 10, color: MUTED2, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* My Content */}
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

        {/* My Activity */}
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

        {/* Thread / Photos Tabs */}
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
                  <button key={type} onClick={() => setPostType(type)} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: postType === type ? `linear-gradient(135deg, ${PINK_DEEP}, ${PINK_HOT})` : 'rgba(232,82,109,0.07)', color: postType === type ? '#fff' : MUTED, border: postType === type ? 'none' : `1px solid ${BORDER}`, boxShadow: postType === type ? `0 2px 8px rgba(232,82,109,0.35)` : 'none' }}>
                    {emoji} {type}
                  </button>
                ))}
              </div>

              {/* Post input */}
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 12 }}>
                <textarea value={postText} onChange={e => setPostText(e.target.value)} placeholder="Share a thought, win, goal, or mood..." style={{ width: '100%', background: 'transparent', border: 'none', color: WHITE, fontSize: 14, outline: 'none', resize: 'none', minHeight: 64, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: MUTED2 }}>{postText.length}/500</span>
                  <button onClick={handlePost} disabled={!postText.trim() || posting} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: `linear-gradient(135deg, ${PINK_DEEP}, ${PINK_HOT})`, color: '#fff', border: 'none', cursor: 'pointer', opacity: (!postText.trim() || posting) ? 0.4 : 1 }}>
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
                        💭 {post.post_type || 'Thought'}
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
            <div style={{ textAlign: 'center', padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 48 }}>📸</div>
              <p style={{ fontSize: 14, color: MUTED }}>Add up to 5 photos to your profile gallery</p>
              <button onClick={() => navigate('/my-glow-link')} style={{ padding: '10px 24px', borderRadius: 20, fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg, ${PINK_DEEP}, ${PINK_HOT})`, color: '#fff', border: 'none', cursor: 'pointer', boxShadow: `0 4px 16px rgba(232,82,109,0.4)` }}>
                + Add Your First Photo
              </button>
            </div>
          )}
        </div>

        {/* My Glow Stage */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Sparkles size={15} style={{ color: PINK }} />
            <p style={{ fontWeight: 700, fontSize: 14, color: WHITE, margin: 0 }}>My Glow Stage</p>
          </div>
          <p style={{ fontSize: 12, color: MUTED2, marginBottom: 12 }}>Personalize your app experience for your life stage</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {AGE_GROUPS.map(group => {
              const isActive = profile?.age_group === group.id;
              return (
                <button key={group.id} onClick={() => handleStageChange(group.id)} disabled={savingStage} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 14, background: isActive ? 'rgba(232,82,109,0.12)' : 'rgba(0,0,0,0.2)', border: isActive ? `1px solid ${PINK}` : `1px solid ${BORDER}`, cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: 20 }}>{group.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: WHITE, margin: 0 }}>{group.label}</p>
                    <p style={{ fontSize: 11, color: MUTED2, margin: 0 }}>{group.ages} · {group.desc}</p>
                  </div>
                  {isActive && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(232,82,109,0.25)', border: `1px solid ${BORDER}`, color: '#ffb2c0' }}>Active</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sign Out */}
        <div style={{ marginBottom: 16 }}>
          <button onClick={async () => { if (window.confirm('Sign out?')) await base44.auth.logout('/'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 16, background: CARD, border: `1px solid ${BORDER}`, color: MUTED, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Follow Us */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 16, marginBottom: 16 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: WHITE, margin: '0 0 2px' }}>Follow Us 💜</p>
          <p style={{ fontSize: 12, color: MUTED2, margin: '0 0 12px' }}>Tap to visit our pages — no account connection, no data sharing</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {SOCIAL_LINKS.map(s => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
                <span style={{ fontSize: 9, color: MUTED2 }}>{s.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Help and Support */}
        <div style={{ marginBottom: 16 }}>
          <SectionLabel text="Help and Support" />
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, overflow: 'hidden' }}>
            <button onClick={() => navigate('/support')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <MessageCircle size={16} style={{ color: MUTED, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, color: WHITE, margin: 0 }}>Contact Support</p>
                <p style={{ fontSize: 11, color: MUTED2, margin: 0 }}>Report a bug or get help</p>
              </div>
              <ChevronRight size={14} style={{ color: MUTED2 }} />
            </button>
          </div>
        </div>

        {/* Legal and Privacy */}
        <div style={{ marginBottom: 16 }}>
          <SectionLabel text="Legal and Privacy" />
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, overflow: 'hidden' }}>
            {LEGAL.map((item, i) => {
              const Icon = item.icon;
              return (
                <button key={item.label} onClick={() => navigate(item.route)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', borderBottom: i < LEGAL.length - 1 ? `1px solid ${BORDER}` : 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <Icon size={15} style={{ color: MUTED, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 14, color: WHITE }}>{item.label}</span>
                  <ChevronRight size={14} style={{ color: MUTED2 }} />
                </button>
              );
            })}
          </div>
          <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(196,148,158,0.35)', marginTop: 10 }}>2025 Girls Glowing Up LLC. All rights reserved.</p>
        </div>

        {/* Danger Zone */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ background: 'rgba(196,74,85,0.07)', border: '1px solid rgba(196,74,85,0.3)', borderRadius: 18, padding: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#f87171', margin: '0 0 4px' }}>DANGER ZONE</p>
            <p style={{ fontSize: 12, color: MUTED2, margin: '0 0 12px' }}>Permanently delete your account and all data. Cannot be undone.</p>
            <button onClick={async () => { if (!window.confirm('Delete account permanently?')) return; if (profile) await base44.entities.UserProfile.delete(profile.id); await base44.auth.logout('/'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 14, background: 'linear-gradient(135deg, #dc2626, #991b1b)', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              <Trash2 size={15} /> Delete My Account
            </button>
          </div>
        </div>

      </div>
      <BottomNav active="me" />
    </div>
  );
}