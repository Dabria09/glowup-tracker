import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import UserAvatarDisplay from '@/components/UserAvatarDisplay';
import { ChevronLeft, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GlowFollowers() {
  const { username } = useParams();
  const navigate = useNavigate();
  const type = new URLSearchParams(window.location.search).get('type') || 'followers';

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [targetProfile, setTargetProfile] = useState(null);
  const [people, setPeople] = useState([]);
  const [following, setFollowing] = useState({}); // email → followRecordId
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      const [profiles, cu] = await Promise.all([
        base44.entities.UserProfile.filter({ username }),
        base44.auth.me().catch(() => null),
      ]);
      if (!profiles.length) { setLoading(false); return; }
      const target = profiles[0];
      setTargetProfile(target);
      setCurrentUser(cu);

      // Fetch the follow relationships
      let followRecords = [];
      if (type === 'followers') {
        followRecords = await base44.entities.GlowFollow.filter({ followed_email: target.user_email, status: 'active' });
      } else {
        followRecords = await base44.entities.GlowFollow.filter({ follower_email: target.user_email, status: 'active' });
      }

      // Get profiles for each person
      const emails = followRecords.map(r => type === 'followers' ? r.follower_email : r.followed_email);
      const profilePromises = emails.map(email => base44.entities.UserProfile.filter({ user_email: email }).then(r => r[0]).catch(() => null));
      const fetchedProfiles = (await Promise.all(profilePromises)).filter(Boolean);
      setPeople(fetchedProfiles);

      // Check which of these people the current user is following
      if (cu) {
        const myFollowing = await base44.entities.GlowFollow.filter({ follower_email: cu.email, status: 'active' });
        const followMap = {};
        myFollowing.forEach(r => { followMap[r.followed_email] = r.id; });
        setFollowing(followMap);
      }

      setLoading(false);
    };
    load();
  }, [username, type]);

  const handleFollow = async (person) => {
    if (!currentUser) { base44.auth.redirectToLogin(); return; }
    if (currentUser.email === person.user_email) return;
    const alreadyFollowing = following[person.user_email];
    if (alreadyFollowing) {
      await base44.entities.GlowFollow.delete(alreadyFollowing);
      setFollowing(prev => { const n = { ...prev }; delete n[person.user_email]; return n; });
    } else {
      const record = await base44.entities.GlowFollow.create({
        follower_email: currentUser.email,
        followed_email: person.user_email,
        follower_username: currentUser.email.split('@')[0],
        followed_username: person.username || person.user_email.split('@')[0],
        status: 'active',
      });
      setFollowing(prev => ({ ...prev, [person.user_email]: record.id }));
      // Create follow notification
      base44.entities.Notification.create({
        recipient_email: person.user_email,
        type: 'follow',
        actor_email: currentUser.email,
        actor_username: currentUser.email.split('@')[0],
        message: 'Started following you',
        link: `/glowlink/${person.username || person.user_email.split('@')[0]}/followers?type=followers`,
        is_read: false,
      }).catch(() => {});
    }
  };

  const filtered = people.filter(p => {
    const q = search.toLowerCase();
    return !q || (p.username || '').toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen text-white pb-10" style={{ backgroundColor: '#0d0608' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(13,6,8,0.9)', borderBottom: '1px solid rgba(236,72,153,0.15)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold capitalize">{type}</h1>
          <p className="text-xs text-gray-500">@{username}</p>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-5"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Search size={15} className="text-gray-500 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search..." className="bg-transparent text-sm text-white placeholder-gray-600 outline-none flex-1" />
          {search && <button onClick={() => setSearch('')}><X size={14} className="text-gray-500" /></button>}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-gray-400 text-sm">{search ? 'No results found.' : `No ${type} yet.`}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((person, i) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <button onClick={() => navigate(`/glowlink/${person.username || person.user_email.split('@')[0]}`)}>
                  <UserAvatarDisplay profile={person} size={48} fallback={(person.username?.[0] || '✨').toUpperCase()} showRing />
                </button>
                <div className="flex-1 min-w-0">
                  <button onClick={() => navigate(`/glowlink/${person.username || person.user_email.split('@')[0]}`)}>
                    <p className="text-sm font-bold text-white">@{person.username || person.user_email.split('@')[0]}</p>
                  </button>
                  {person.glow_era && (
                    <p className="text-xs text-pink-400 font-medium">✨ {person.glow_era}</p>
                  )}
                  {person.bio && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">{person.bio}</p>
                  )}
                </div>
                {currentUser && currentUser.email !== person.user_email && (
                  <button
                    onClick={() => handleFollow(person)}
                    className="px-4 py-2 rounded-full text-xs font-bold transition flex-shrink-0"
                    style={following[person.user_email]
                      ? { background: 'rgba(255,255,255,0.1)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.15)' }
                      : { background: 'linear-gradient(135deg,#c44a55,#ec4899)', color: '#fff' }
                    }
                  >
                    {following[person.user_email] ? 'Following' : 'Follow'}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}