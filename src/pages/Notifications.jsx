import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import UserAvatarDisplay from '@/components/UserAvatarDisplay';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Bell, BellOff, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_META = {
  follow:       { emoji: '💜', label: 'followed you', color: '#ec4899' },
  reaction:     { emoji: '✨', label: 'reacted to your Glow Link', color: '#a855f7' },
  profile_view: { emoji: '👀', label: 'viewed your Glow Link', color: '#3b82f6' },
  shoutout:     { emoji: '📣', label: 'shouted you out', color: '#f59e0b' },
  level_up:     { emoji: '🎉', label: 'you leveled up!', color: '#fbbf24' },
  moderation_alert: { emoji: '🚨', label: 'safety alert', color: '#ef4444' },
  announcement: { emoji: '📢', label: 'GGU announcement', color: '#ec4899' },
  system:       { emoji: '⚙️', label: 'system update', color: '#6b7280' },
};

const SYSTEM_STYLE_TYPES = new Set(['level_up', 'moderation_alert', 'system', 'announcement']);

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [actorProfiles, setActorProfiles] = useState({});
  const [showSettings, setShowSettings] = useState(false);

  const DEFAULT_PREFS = {
    follow: true, reaction: true, profile_view: true, shoutout: true,
    level_up: true, moderation_alert: true, system: true,
    comment: true, challenge: true, mentorship: true, community: true,
    team: true, squad: true, announcement: true,
  };
  const [prefs, setPrefs] = useState(() => {
    try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem('ggu_notif_prefs') || '{}') }; }
    catch { return DEFAULT_PREFS; }
  });

  const PREF_LABELS = [
    { key: 'level_up',       label: 'Level up celebrations',   emoji: '🎉' },
    { key: 'follow',         label: 'New followers',           emoji: '💜' },
    { key: 'reaction',       label: 'Reactions on your posts', emoji: '✨' },
    { key: 'comment',        label: 'Comments on your posts',  emoji: '💬' },
    { key: 'profile_view',   label: 'Profile views',           emoji: '👀' },
    { key: 'shoutout',       label: 'Shout outs',              emoji: '📣' },
    { key: 'moderation_alert', label: 'Safety alerts',         emoji: '🚨' },
    { key: 'team',           label: 'Team activity',           emoji: '🏆' },
    { key: 'squad',          label: 'Squad activity',          emoji: '👑' },
    { key: 'challenge',      label: 'Challenge reminders',     emoji: '🔥' },
    { key: 'mentorship',     label: 'Mentorship updates',      emoji: '🎓' },
    { key: 'community',      label: 'Community Hub activity',  emoji: '🌸' },
    { key: 'announcement',   label: 'Announcements',           emoji: '📢' },
    { key: 'system',         label: 'System updates',          emoji: '⚙️' },
  ];

  const togglePref = (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    localStorage.setItem('ggu_notif_prefs', JSON.stringify(updated));
  };

  const filteredNotifications = notifications.filter(n => {
    const prefValue = prefs[n.type];
    return prefValue !== false && prefValue !== undefined;
  });

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const notifs = await base44.entities.Notification.filter(
        { recipient_email: u.email },
        '-created_date',
        50
      );
      setNotifications(notifs);

      // Fetch actor profiles for avatars (skip system notifications)
      const uniqueEmails = [...new Set(notifs
        .filter(n => n.actor_email && n.type !== 'system' && n.type !== 'level_up')
        .map(n => n.actor_email))];
      if (uniqueEmails.length) {
        const profiles = await Promise.all(
          uniqueEmails.map(email =>
            base44.entities.UserProfile.filter({ user_email: email }).then(r => r[0] || null)
          )
        );
        const map = {};
        uniqueEmails.forEach((email, i) => { if (profiles[i]) map[email] = profiles[i]; });
        setActorProfiles(map);
      }

      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen text-white pb-28" style={{ backgroundColor: '#0d0608' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute rounded-full" style={{ width: 400, height: 400, top: -100, left: -80, background: 'radial-gradient(circle, rgba(236,72,153,0.15), transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
        style={{ background: 'rgba(13,6,8,0.94)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <Bell size={16} className="text-pink-400" />
            Notifications
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'linear-gradient(135deg,#c44a55,#ec4899)', color: '#fff' }}>
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-[11px] text-gray-500">Updates, announcements &amp; Glow Link activity</p>
        </div>
        <button onClick={() => setShowSettings(s => !s)}
          className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
          style={{ background: showSettings ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.08)' }}>
          <Settings size={16} className={showSettings ? 'text-pink-400' : 'text-gray-400'} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="relative z-20 mx-4 mt-2 mb-1 rounded-2xl p-4" style={{ background: 'rgba(30,10,40,0.95)', border: '1px solid rgba(236,72,153,0.2)' }}>
          <p className="text-xs font-bold tracking-widest text-gray-400 mb-3">NOTIFICATION PREFERENCES</p>
          <div className="space-y-2">
            {PREF_LABELS.map(({ key, label, emoji }) => (
              <div key={key} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-200">{emoji} {label}</span>
                <button onClick={() => togglePref(key)}
                  className="w-11 h-6 rounded-full transition-all flex-shrink-0"
                  style={{ background: prefs[key] ? 'linear-gradient(135deg,#ec4899,#a855f7)' : 'rgba(255,255,255,0.1)' }}>
                  <div className="w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5"
                    style={{ transform: prefs[key] ? 'translateX(20px)' : 'translateX(0)' }} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-600 mt-3">Preferences saved automatically</p>
        </div>
      )}

      <div className="relative z-10 px-4 pt-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center px-8"
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)' }}>
              <BellOff size={32} className="text-pink-400 opacity-60" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">No notifications yet</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              When someone follows you or interacts with your Glow Link, you'll see it here.
            </p>
            <button
              onClick={() => navigate('/my-glow-link')}
              className="mt-6 px-6 py-3 rounded-full text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#c44a55,#ec4899)' }}>
              Set Up Glow Link ✨
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredNotifications.map((notif, i) => {
                const meta = TYPE_META[notif.type] || TYPE_META.follow;
                const actorProfile = actorProfiles[notif.actor_email];
                const isUnread = !notif.is_read;

                return (
                  <motion.button
                    key={notif.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => notif.link && navigate(notif.link)}
                    className="w-full flex items-center gap-3 p-4 rounded-3xl text-left transition active:scale-98"
                    style={{
                      background: isUnread
                        ? `linear-gradient(135deg, rgba(236,72,153,0.07), rgba(168,85,247,0.07))`
                        : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isUnread ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.07)'}`,
                    }}
                  >
                    {/* Avatar or emoji */}
                    <div className="relative flex-shrink-0">
                      {actorProfile ? (
                        <UserAvatarDisplay profile={actorProfile} size={46} fallback={(notif.actor_username?.[0] || '?').toUpperCase()} showRing={false} />
                      ) : (
                        <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
                          style={{ background: `${meta.color}20`, border: `1px solid ${meta.color}40` }}>
                          {meta.emoji}
                        </div>
                      )}
                      {/* Type badge */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        style={{ background: meta.color, boxShadow: '0 0 0 2px #0d0608' }}>
                        {meta.emoji}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white leading-snug">
                        {SYSTEM_STYLE_TYPES.has(notif.type) ? (
                          <span>{meta.label}</span>
                        ) : (
                          <>
                            <span style={{ color: meta.color }}>@{notif.actor_username || 'Someone'}</span>
                            {' '}{meta.label}
                          </>
                        )}
                      </p>
                      {notif.message && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{notif.message}</p>
                      )}
                      {notif.priority && (
                        <p className="text-[10px] font-bold mt-0.5 capitalize" style={{ color: notif.priority === 'urgent' ? '#ef4444' : notif.priority === 'high' ? '#f97316' : '#a855f7' }}>
                          {notif.priority} priority
                        </p>
                      )}
                      <p className="text-[10px] text-gray-600 mt-1">{timeAgo(notif.created_date)}</p>
                    </div>

                    {/* Unread dot */}
                    {isUnread && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: '#ec4899', boxShadow: '0 0 6px rgba(236,72,153,0.6)' }} />
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <BottomNav active="connect" />
    </div>
  );
}