import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Heart } from 'lucide-react';

export default function GlowProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      // Look up profile by username (no world filter — public access)
      const profiles = await base44.entities.UserProfile.filter({ username });
      if (!profiles.length) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const p = profiles[0];
      setProfile(p);

      const [userPosts, userPoints] = await Promise.all([
        base44.entities.GlowUpPost.filter({ user_email: p.user_email }, '-created_date', 20),
        base44.entities.UserPoints.filter({ user_email: p.user_email }),
      ]);

      setPosts(userPosts.filter(post => post.visibility === 'public'));
      if (userPoints.length) setPoints(userPoints[0]);
      setLoading(false);
    };
    load();
  }, [username]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white pb-24" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10 text-center px-6">
        <p className="text-5xl mb-4">✨</p>
        <h1 className="text-xl font-bold mb-2">Profile Not Found</h1>
        <p className="text-gray-400 text-sm mb-6">@{username} doesn't exist or hasn't set up their Glow Link yet.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-full font-bold text-white" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
          Go Back
        </button>
      </div>
    </div>
  );

  const links = profile.links ? JSON.parse(profile.links) : [];
  const totalPoints = points?.total_points || 0;
  const tier = totalPoints >= 500 ? 'Radiant' : totalPoints >= 200 ? 'Glowing' : 'Spark';

  return (
    <div className="min-h-screen text-white pb-24 relative overflow-y-auto" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10">

        {/* Header */}
        <div className="sticky top-0 z-20 backdrop-blur-md bg-black/30 border-b border-white/10 px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">@{profile.username}</h1>
            <p className="text-xs text-gray-400">Glow Link™</p>
          </div>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: `${profile.username}'s Glow Link`, url: window.location.href }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="px-4 py-2 rounded-full font-bold text-white text-sm bg-pink-500/20 border border-pink-500/40 text-pink-300"
          >
            Share
          </button>
        </div>

        <div className="px-4 py-5 space-y-5">

          {/* Profile Card */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-2xl font-bold flex-shrink-0 overflow-hidden">
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  : (profile.username?.[0] || '✨').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-lg">@{profile.username}</p>
                {profile.glow_era && (
                  <p className="text-sm text-pink-400 font-semibold">{profile.glow_era}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
                    👑 {tier}
                  </span>
                  {totalPoints > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }}>
                      🏅 {totalPoints.toLocaleString()} pts
                    </span>
                  )}
                </div>
              </div>
            </div>

            {profile.bio && (
              <p className="text-sm text-gray-200 mb-3 pb-3 border-b border-white/10">{profile.bio}</p>
            )}

            {profile.motto && (
              <p className="text-xs text-gray-400 italic mb-3 pb-3 border-b border-white/10">"{profile.motto}"</p>
            )}

            {links.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {links.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30 hover:bg-pink-500/30 transition">
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          {totalPoints > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Streak', value: `${points?.check_in_streak || 0}🔥` },
                { label: 'Challenges', value: `${points?.challenges_completed || 0}✓` },
                { label: 'Tier', value: tier },
              ].map(stat => (
                <div key={stat.label} className="text-center rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="font-bold text-white text-sm">{stat.value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Posts */}
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">GLOW POSTS</p>
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">✨</p>
                <p className="text-gray-400 text-sm">No public posts yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map(post => (
                  <div key={post.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden">
                        {profile.avatar_url
                          ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                          : (profile.username?.[0] || '✨').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-xs">@{profile.username}</p>
                        <p className="text-[10px] text-gray-500">{new Date(post.created_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed mb-2">{post.content}</p>
                    {post.media_urls && JSON.parse(post.media_urls || '[]').length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {JSON.parse(post.media_urls).slice(0, 4).map((url, i) => (
                          <img key={i} src={url} alt="post" className="w-full h-28 rounded-xl object-cover" />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Heart size={12} /> <span>{post.likes || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
      <BottomNav active="me" />
    </div>
  );
}