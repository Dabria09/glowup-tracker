import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Lock, CheckCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { CERTIFICATES, getEarnedCertificates, getNextCertificate, POINT_VALUES } from '@/lib/pointsHelper';

const ACTIVITY_GUIDE = [
  { label: 'Daily Check-In', action: 'daily_checkin', emoji: '✦' },
  { label: 'Diary Entry', action: 'diary_entry', emoji: '📔' },
  { label: 'Daily Task', action: 'daily_task', emoji: '✅' },
  { label: 'Glow Feed Post', action: 'glow_feed_post', emoji: '📸' },
  { label: 'Glow Board Post', action: 'glow_board_post', emoji: '🖼️' },
  { label: 'Recipe Added', action: 'recipe_added', emoji: '🍳' },
  { label: 'Fitness Log', action: 'fitness_log', emoji: '💪' },
  { label: 'Calm Corner Session', action: 'calm_corner', emoji: '🧘' },
  { label: 'Savings Goal', action: 'savings_goal', emoji: '💰' },
  { label: 'Community Post', action: 'community_post', emoji: '💬' },
  { label: 'Spiritual Habit', action: 'spiritual_habit', emoji: '🙏' },
  { label: 'Book Club', action: 'book_club', emoji: '📚' },
  { label: 'Vision Board Item', action: 'vision_board_item', emoji: '✨' },
  { label: 'Lesson Completed', action: 'lesson_completed', emoji: '🎓' },
  { label: 'Cycle Tracked', action: 'cycle_tracked', emoji: '🌸' },
  { label: 'Job Application', action: 'job_application', emoji: '💼' },
  { label: 'Shout Out Given', action: 'shoutout_given', emoji: '📣' },
  { label: 'Challenge Day', action: 'challenge_day', emoji: '🔥' },
  { label: 'Weekly Challenge', action: 'weekly_challenge', emoji: '🏅' },
  { label: 'Mentor Session', action: 'mentor_session', emoji: '🤝' },
  { label: 'Glow Up Challenge', action: 'glow_up_challenge', emoji: '👑' },
];

export default function MyCertificates() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('certificates');

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const pts = await base44.entities.UserPoints.filter({ user_email: u.email });
      setTotalPoints(pts.length > 0 ? pts[0].total_points || 0 : 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const earnedCerts = getEarnedCertificates(totalPoints);
  const nextCert = getNextCertificate(totalPoints);
  const progressToNext = nextCert
    ? Math.min(100, Math.round((totalPoints / nextCert.points) * 100))
    : 100;

  return (
    <div className="min-h-screen text-white pb-28" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='%23fff'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 px-4 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">My Certificates 🏆</h1>
            <p className="text-xs text-gray-400">Earn points. Unlock certificates.</p>
          </div>
        </div>

        {/* Points Summary */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(236,72,153,0.2))', border: '1px solid rgba(168,85,247,0.4)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Total Points</p>
              <p className="text-4xl font-bold text-white">{loading ? '...' : totalPoints.toLocaleString()}</p>
              <p className="text-xs text-purple-300 mt-1">🏅 {earnedCerts.length} of {CERTIFICATES.length} certificates earned</p>
            </div>
            <div className="text-6xl">{earnedCerts.length > 0 ? earnedCerts[earnedCerts.length - 1].emoji : '✨'}</div>
          </div>
          {nextCert && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Next: {nextCert.name} ({nextCert.points.toLocaleString()} pts)</span>
                <span>{progressToNext}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${progressToNext}%`, background: nextCert.gradient }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">{(nextCert.points - totalPoints).toLocaleString()} more points to go</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[{ id: 'certificates', label: '🏆 Certificates' }, { id: 'earn', label: '⚡ How to Earn' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition"
              style={activeTab === tab.id
                ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            {CERTIFICATES.map((cert) => {
              const earned = totalPoints >= cert.points;
              return (
                <div
                  key={cert.id}
                  className="rounded-2xl p-5 flex items-center gap-4"
                  style={earned
                    ? { background: cert.gradient.replace('linear-gradient', 'linear-gradient').replace(')', ', opacity(0.15))').replace('linear-gradient(', 'linear-gradient(').slice(0, -1) + ')', border: `1px solid ${cert.color}50`, background: `rgba(0,0,0,0.4)`, borderColor: `${cert.color}60` }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                  style={earned
                    ? { background: 'rgba(20,10,30,0.8)', border: `1px solid ${cert.color}50` }
                    : { background: 'rgba(20,10,30,0.4)', border: '1px solid rgba(255,255,255,0.07)' }
                  }
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                    style={earned ? { background: cert.gradient } : { background: 'rgba(255,255,255,0.05)' }}>
                    {earned ? cert.emoji : <Lock size={22} className="text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-bold text-base ${earned ? 'text-white' : 'text-gray-600'}`}>{cert.name}</p>
                      {earned && <CheckCircle size={16} style={{ color: cert.color }} />}
                    </div>
                    <p className={`text-xs mb-2 ${earned ? 'text-gray-300' : 'text-gray-600'}`}>{cert.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: earned ? cert.color : '#4b5563' }}>
                        {cert.points.toLocaleString()} pts required
                      </span>
                      {earned && <span className="text-[10px] bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded-full border border-green-500/30">EARNED ✓</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* How to Earn Tab */}
        {activeTab === 'earn' && (
          <div>
            <p className="text-xs text-gray-400 mb-4">Every action on Girls Glowing Up earns you points. The more you engage, the more you glow! 🌟</p>
            <div className="space-y-2">
              {ACTIVITY_GUIDE.map(({ label, action, emoji }) => (
                <div key={action} className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{emoji}</span>
                    <span className="text-sm text-gray-200">{label}</span>
                  </div>
                  <span className="text-sm font-bold text-yellow-400">+{POINT_VALUES[action]} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav active="glow" />
    </div>
  );
}