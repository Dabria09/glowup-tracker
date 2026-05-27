import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';
import AppBackground from '@/components/AppBackground';
import {
  Edit3, Link2, BookOpen, Image, Quote, Briefcase, GraduationCap,
  MessageSquare, Heart, MessageCircle, LogOut, Trash2, ChevronRight,
  Shield, FileText, Users, Sparkles
} from 'lucide-react';

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
  const [postingThought, setPostingThought] = useState(false);

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

  const handlePostThought = async () => {
    if (!postText.trim() || postingThought) return;
    setPostingThought(true);
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
    setPostingThought(false);
  };

  const handleDeletePost = async (postId) => {
    await base44.entities.GlowUpPost.delete(postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const tier = points?.total_points >= 500 ? 'Radiant' :
    points?.total_points >= 200 ? 'Glowing' :
    points?.total_points >= 50 ? 'Seedling' : 'Spark';
  const tierEmoji = { Radiant: '👑', Glowing: '✨', Seedling: '🌱', Spark: '⚡' }[tier];

  const stats = [
    { label: 'Days', value: profile ? Math.max(1, Math.floor((Date.now() - new Date(profile.created_date || Date.now())) / 86400000)) : 0, icon: '📅' },
    { label: 'Challenges', value: points?.challenges_completed || 0, icon: '🏆' },
    { label: 'Streak', value: points?.check_in_streak || 0, icon: '🔥' },
    { label: 'Badges', value: Math.floor((points?.total_points || 0) / 100), icon: '⭐' },
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0d0018 0%, #1a0030 50%, #0d0018 100%)' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-28 relative overflow-y-auto" style={{ background: 'linear-gradient(160deg, #0d0018 0%, #1a0030 40%, #0d001a 100%)' }}>
      <AppBackground />
      <div className="relative z-10">

        {/* Points badge */}
        <div className="flex justify-end px-4 pt-3 pb-1">
          <button onClick={() => navigate('/glow-score')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
            🏅 {points?.total_points?.toLocaleString() || 0} pts
          </button>
        </div>

        {/* Profile Header Card */}
        <div className="px-4 pb-4">
          <div className="rounded-3xl p-5" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.1))', border: '1px solid rgba(168,85,247,0.25)' }}>
            <div className="flex items-center gap-4 mb-4">
              <div
                onClick={() => navigate('/avatar')}
                className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)', boxShadow: '0 0 20px rgba(236,72,153,0.4)' }}
              >
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl font-bold">{user?.full_name?.[0] || 'G'}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white">{user?.full_name}</h1>
                <p className="text-sm text-gray-400">@{profile?.username || user?.email?.split('@')[0]}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-sm">{tierEmoji}</span>
                  <span className="text-xs font-semibold text-pink-300">{tier}</span>
                  <span className="text-gray-600 text-xs">·</span>
                  <span className="text-xs text-yellow-400 font-semibold">{points?.total_points || 0} pts</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button onClick={() => navigate('/my-glow-link')} className="flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-sm text-white" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                <Edit3 size={15} /> Edit Profile
              </button>
              <button onClick={() => navigate('/my-glow-link')} className="flex items-center justify-center gap-2 py-2.5 rounded-2xl font-semibold text-sm" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#d1d5db' }}>
                <Link2 size={15} /> Glow Link
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {stats.map(s => (
                <div key={s.label} className="text-center p-2.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <p className="text-lg mb-0.5">{s.icon}</p>
                  <p className="font-bold text-white text-base">{s.value}</p>
                  <p className="text-[10px] text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* My Content */}
        <div className="px-4 mb-4">
          <p className="text-[11px] font-bold tracking-widest text-gray-500 mb-2">MY CONTENT</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {MY_CONTENT.map((item, i) => {
              const Icon = item.icon;
              return (
                <button key={item.label} onClick={() => navigate(item.route)} className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition text-left ${i < MY_CONTENT.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <Icon size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-200 flex-1">{item.label}</span>
                  <ChevronRight size={14} className="text-gray-600" />
                </button>
              );
            })}
          </div>
        </div>

        {/* My Activity */}
        <div className="px-4 mb-4">
          <p className="text-[11px] font-bold tracking-widest text-gray-500 mb-2">MY ACTIVITY</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {MY_ACTIVITY.map((item, i) => {
              const Icon = item.icon;
              return (
                <button key={item.label} onClick={() => navigate(item.route)} className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition text-left ${i < MY_ACTIVITY.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <Icon size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-200 flex-1">{item.label}</span>
                  <ChevronRight size={14} className="text-gray-600" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Thread / Photos Tabs */}
        <div className="px-4 mb-4">
          <div className="flex border-b border-white/10 mb-4">
            {[{ id: 'thread', label: 'My Thread', icon: MessageSquare }, { id: 'photos', label: 'My Photos', icon: Image }].map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 pb-3 text-sm font-semibold transition border-b-2 flex items-center justify-center gap-1.5 ${activeTab === tab.id ? 'text-pink-400 border-pink-400' : 'text-gray-500 border-transparent'}`}>
                  <Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'thread' && (
            <div className="space-y-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {POST_TYPES.map(({ type, emoji }) => (
                  <button key={type} onClick={() => setPostType(type)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition"
                    style={postType === type ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)', color: '#fff' } : { background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {emoji} {type}
                  </button>
                ))}
              </div>
              <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <textarea value={postText} onChange={e => setPostText(e.target.value)} placeholder="Share a thought, win, goal, or mood..." className="w-full bg-transparent text-sm text-white placeholder-gray-600 outline-none resize-none min-h-16" />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-600">{postText.length}/500</span>
                  <button onClick={handlePostThought} disabled={!postText.trim() || postingThought} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                    {postingThought ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '➤'} Post
                  </button>
                </div>
              </div>
              {posts.length === 0 ? (
                <p className="text-center py-8 text-gray-500 text-sm">No posts yet. Share your first thought! ✨</p>
              ) : (
                posts.map(post => (
                  <div key={post.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(236,72,153,0.2)', color: '#f9a8d4' }}>
                        💭 {post.post_type || 'Thought'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500">{new Date(post.created_date).toLocaleDateString()}</span>
                        <button onClick={() => handleDeletePost(post.id)} className="text-gray-600 hover:text-red-400 transition"><Trash2 size={13} /></button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-200">{post.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="text-center py-12 space-y-3">
              <div className="text-5xl">📸</div>
              <p className="text-sm text-gray-400">Add up to 5 photos to your profile gallery</p>
              <button onClick={() => navigate('/my-glow-link')} className="px-5 py-2.5 rounded-full text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                + Add Your First Photo
              </button>
            </div>
          )}
        </div>

        {/* My Glow Stage */}
        <div className="px-4 mb-4">
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={15} className="text-pink-400" />
              <p className="text-sm font-bold text-white">My Glow Stage</p>
            </div>
            <p className="text-xs text-gray-500 mb-3">Personalize your app experience for your life stage</p>
            <div className="space-y-2">
              {AGE_GROUPS.map(group => {
                const isActive = profile?.age_group === group.id;
                return (
                  <button key={group.id} onClick={() => handleStageChange(group.id)} disabled={savingStage}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl transition text-left"
                    style={isActive ? { background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.4)' } : { background: 'transparent', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-xl">{group.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{group.label}</p>
                      <p className="text-xs text-gray-500">{group.ages} · {group.desc}</p>
                    </div>
                    {isActive && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(236,72,153,0.3)', color: '#f9a8d4' }}>Active</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="px-4 mb-4">
          <button onClick={async () => { if (window.confirm('Sign out?')) await base44.auth.logout('/'); }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Follow Us */}
        <div className="px-4 mb-4">
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-sm font-bold text-white mb-1">Follow Us 💜</p>
            <p className="text-xs text-gray-500 mb-3">Tap to visit our pages — no account connection, no data sharing</p>
            <div className="flex gap-3 justify-center flex-wrap">
              {SOCIAL_LINKS.map(s => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ background: s.bg }}>{s.icon}</div>
                  <span className="text-[9px] text-gray-500">{s.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Help and Support */}
        <div className="px-4 mb-4">
          <p className="text-[11px] font-bold tracking-widest text-gray-500 mb-2">HELP AND SUPPORT</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={() => navigate('/support')} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition text-left">
              <MessageCircle size={16} className="text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-200">Contact Support</p>
                <p className="text-xs text-gray-500">Report a bug or get help</p>
              </div>
              <ChevronRight size={14} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Legal and Privacy */}
        <div className="px-4 mb-4">
          <p className="text-[11px] font-bold tracking-widest text-gray-500 mb-2">LEGAL AND PRIVACY</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { label: 'Privacy Policy', icon: Shield, route: '/about' },
              { label: 'Terms of Service', icon: FileText, route: '/guidelines' },
              { label: 'Parental Consent (COPPA)', icon: Users, route: '/parent-dashboard' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <button key={item.label} onClick={() => navigate(item.route)} className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition text-left ${i < 2 ? 'border-b border-white/5' : ''}`}>
                  <Icon size={15} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-200 flex-1">{item.label}</span>
                  <ChevronRight size={14} className="text-gray-600" />
                </button>
              );
            })}
          </div>
          <p className="text-center text-[10px] text-gray-600 mt-3">2025 Girls Glowing Up LLC. All rights reserved.</p>
        </div>

        {/* Danger Zone */}
        <div className="px-4 mb-6">
          <div className="rounded-2xl p-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-sm font-bold text-red-400 mb-1">DANGER ZONE</p>
            <p className="text-xs text-gray-500 mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
            <button
              onClick={async () => {
                if (!window.confirm('Are you absolutely sure? This will permanently delete your account.')) return;
                if (profile) await base44.entities.UserProfile.delete(profile.id);
                await base44.auth.logout('/');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}
            >
              <Trash2 size={15} /> Delete My Account
            </button>
          </div>
        </div>

      </div>
      <BottomNav active="me" />
    </div>
  );
}