import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Heart, Send, Image, X as XIcon, Flag } from 'lucide-react';
import { toast } from 'sonner';
import useAgeGroup from '@/lib/useAgeGroup';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ShoutOuts() {
  const navigate = useNavigate();
  const { ageGroup, worldInfo, filterForWorld } = useAgeGroup();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [realPoints, setRealPoints] = useState(0);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const [data, pts] = await Promise.all([
        base44.entities.ShoutOut.list('-created_date', 100),
        base44.entities.UserPoints.filter({ user_email: u.email }),
      ]);
      // Only show approved posts (or user's own pending posts)
      const visiblePosts = data.filter(p => p.status === 'approved' || (p.status === 'pending' && p.user_email === u.email));
      setPosts(filterForWorld(visiblePosts));
      if (pts.length) setRealPoints(pts[0].total_points || 0);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
    setMediaPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setMediaFile(null); setMediaPreview(null); setMediaType(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handlePost = async () => {
    if (!draft.trim() && !mediaFile) return;
    
    // Check for banned words BEFORE posting
    if (draft.trim()) {
      try {
        const banCheck = await base44.functions.invoke('checkBannedWords', { content: draft.trim() });
        if (banCheck.blocked) {
          toast.error('Your message contains inappropriate language. Please remove the flagged words and try again. 💜');
          return;
        }
        if (banCheck.flagged) {
          // Post will be created but flagged for review
          toast.info('Your post contains flagged content and will be reviewed by admins. 💜');
        }
        if (banCheck.replaced) {
          // TODO: Implement word replacement logic
          toast.info('Some words in your message have been replaced. 💜');
        }
      } catch (e) {
        console.error('Banned word check failed:', e);
        // Continue posting even if check fails (fail-safe)
      }
    }
    
    setPosting(true);
    let media_url = null;
    if (mediaFile) {
      const res = await base44.integrations.Core.UploadFile({ file: mediaFile });
      media_url = res.file_url;
    }
    const displayName = user.full_name?.split(' ')[0] || 'Glow Girl';
    
    // Check if moderation is enabled
    let status = 'approved'; // Default to auto-approve for backwards compatibility
    try {
      const modSettings = await base44.entities.ContentModerationSettings.list();
      if (modSettings.length > 0 && modSettings[0].shoutout_require_approval) {
        status = 'pending';
      }
    } catch (e) {
      console.error('Failed to check moderation settings:', e);
    }
    
    const post = await base44.entities.ShoutOut.create({
      user_email: user.email,
      username: displayName,
      content: draft.trim(),
      likes: 0,
      liked_by: '[]',
      age_group: ageGroup || undefined,
      status: status,
      ...(media_url && { media_url, media_type: mediaType }),
    });
    
    setPosts(prev => [post, ...prev]);
    setDraft('');
    clearMedia();
    setPosting(false);
    
    if (status === 'pending') {
      toast.info('Shout out submitted for review! 👑✨');
    } else {
      toast.success('Shout out posted! 👑✨');
    }
  };

  const handleLike = async (post) => {
    const likedBy = JSON.parse(post.liked_by || '[]');
    const alreadyLiked = likedBy.includes(user.email);
    const newLikedBy = alreadyLiked
      ? likedBy.filter(e => e !== user.email)
      : [...likedBy, user.email];
    const newLikes = newLikedBy.length;
    await base44.entities.ShoutOut.update(post.id, { likes: newLikes, liked_by: JSON.stringify(newLikedBy) });
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: newLikes, liked_by: JSON.stringify(newLikedBy) } : p));
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0010' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0010' }}>
      {/* Heart pattern */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='rgba(180,50,120,0.1)'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />
      <AppBackground />

      <div className="relative z-10 px-4 pt-4">
        {/* Points */}
        <div className="flex justify-end mb-2">
          <div className="rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1"
            style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
            <span>🏅</span><span className="text-yellow-400">{realPoints.toLocaleString()} pts</span>
          </div>
        </div>

        {/* World Banner */}
        {worldInfo && (
          <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5 mb-3" style={{ background: worldInfo.bgColor, border: `1px solid ${worldInfo.borderColor}` }}>
            <span className="text-lg">{worldInfo.emoji}</span>
            <div>
              <p className="text-xs font-bold" style={{ color: worldInfo.color }}>{worldInfo.label}</p>
              <p className="text-[10px] text-gray-400">You're seeing shout-outs from your world</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={22} /></button>
          <h1 className="text-3xl font-bold text-white">Shout Out Wall 👑✨</h1>
        </div>

        {/* Hype card */}
        <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(120,40,100,0.35)', border: '1px solid rgba(236,72,153,0.25)' }}>
          <p className="text-sm leading-relaxed mb-3">
            <span className="text-pink-400 font-bold">This is YOUR spotlight moment, girl.</span>
            {' '}No achievement is too small — got a B on that hard test?{' '}
            <span className="text-yellow-400 font-bold">POST IT.</span> Said no to drama?{' '}
            <span className="text-yellow-400 font-bold">POST IT.</span> Drank your water today?{' '}
            <span className="text-yellow-400 font-bold">GIRL, POST IT.</span> Remembered to take your vitamins?{' '}
            <span className="text-yellow-400 font-bold">THAT COUNTS TOO.</span>
          </p>
          <p className="text-sm text-gray-300 leading-relaxed">
            This wall is for wins only — big, small, and everything in between. Drop your glow moment and watch your community cheer you on. This is a judgment-free zone where every W gets celebrated. Because around here, we clap for each other.{' '}
            <span className="text-pink-400 font-semibold">Every. Single. Time.</span> 🔥✨
          </p>
        </div>

        {/* Media preview */}
        {mediaPreview && (
          <div className="relative mb-3 rounded-2xl overflow-hidden">
            {mediaType === 'video'
              ? <video src={mediaPreview} controls className="w-full rounded-2xl max-h-48 object-cover" />
              : <img src={mediaPreview} alt="preview" className="w-full rounded-2xl max-h-48 object-cover" />}
            <button onClick={clearMedia} className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center">
              <XIcon size={13} className="text-white" />
            </button>
          </div>
        )}

        {/* Post input */}
        <div className="rounded-2xl px-4 py-3 mb-5"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
              <span className="text-base">❆</span>
            </div>
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePost()}
              placeholder="Share a win or affirmation..."
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder-gray-500"
            />
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaChange} />
            <button onClick={() => fileRef.current?.click()} className="text-gray-500 hover:text-pink-400 transition">
              <Image size={17} />
            </button>
            {(draft.trim().length > 0 || mediaFile) && (
              <button onClick={handlePost} disabled={posting}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                {posting ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
              </button>
            )}
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-3">
          {posts.length === 0 && (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">👑</p>
              <p className="text-white font-semibold">Be the first to shine!</p>
              <p className="text-gray-500 text-sm mt-1">Share your win above and get the wall started.</p>
            </div>
          )}
          {posts.map(post => {
            const likedBy = JSON.parse(post.liked_by || '[]');
            const liked = likedBy.includes(user.email);
            const initial = (post.username || 'G')[0].toUpperCase();
            return (
              <div key={post.id} className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                    {initial}
                  </div>
                  <span className="font-semibold text-sm text-white">{post.username || 'Glow Girl'}</span>
                  <span className="text-gray-500 text-xs">· {timeAgo(post.created_date)}</span>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed mb-3">{post.content}</p>
                {post.media_url && (
                  post.media_type === 'video'
                    ? <video src={post.media_url} controls className="w-full rounded-xl max-h-56 object-cover mb-3" />
                    : <img src={post.media_url} alt="" className="w-full rounded-xl max-h-56 object-cover mb-3" />
                )}
                <div className="flex items-center justify-between">
                  <button onClick={() => handleLike(post)}
                    className={`flex items-center gap-1.5 text-sm transition ${liked ? 'text-pink-400' : 'text-gray-500 hover:text-pink-400'}`}>
                    <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                    <span>{post.likes || 0}</span>
                  </button>
                  <div className="flex items-center gap-3">
                    {post.user_email !== user.email && (
                      <button
                        onClick={async () => {
                          if (!window.confirm(`Report this post for review?\n\nReason: Inappropriate content\n\nThis will send an anonymous report to GGU admins.`)) return;
                          await base44.entities.ContentReport.create({
                            reported_content_id: post.id,
                            content_type: 'shoutout',
                            content_snapshot: post.content,
                            reported_by: user.email,
                            reason: 'inappropriate',
                            status: 'pending',
                          });
                          toast.success('Report submitted. Thank you for keeping GGU safe! 💜');
                        }}
                        className="text-gray-600 hover:text-amber-400 transition text-xs flex items-center gap-1">
                        <Flag size={12} /> Report
                      </button>
                    )}
                    {(post.user_email === user.email || user.role === 'admin') && (
                      <button
                        onClick={async () => {
                          if (!window.confirm('Delete this shout out?')) return;
                          await base44.entities.ShoutOut.delete(post.id);
                          setPosts(prev => prev.filter(p => p.id !== post.id));
                        }}
                        className="text-gray-600 hover:text-red-400 transition text-xs">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav active="connect" />
    </div>
  );
}