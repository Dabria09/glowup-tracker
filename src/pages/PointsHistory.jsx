import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PointsHistory() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const [hist, pts] = await Promise.all([
        base44.entities.PointsHistory.filter({ user_email: u.email }, '-created_date', 100),
        base44.entities.UserPoints.filter({ user_email: u.email }),
      ]);
      setHistory(hist);
      setTotalPoints(pts.length > 0 ? pts[0].total_points || 0 : 0);
      setLoading(false);
    }).catch(() => { setLoading(false); navigate('/'); });
  }, []);

  // Group by date
  const grouped = history.reduce((acc, entry) => {
    const day = formatDate(entry.created_date);
    if (!acc[day]) acc[day] = [];
    acc[day].push(entry);
    return acc;
  }, {});

  return (
    <div className="min-h-screen text-white pb-28" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='%23fff'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 px-4 pt-6 pb-8 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Points History 📈</h1>
            <p className="text-xs text-gray-400">Every action that leveled up your glow</p>
          </div>
        </div>

        {/* Total banner */}
        <div className="rounded-2xl px-5 py-4 mb-6 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(236,72,153,0.15))', border: '1px solid rgba(168,85,247,0.35)' }}>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Total Points Earned</p>
            <p className="text-3xl font-bold text-white">{totalPoints.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-0.5">Activities Logged</p>
            <p className="text-3xl font-bold text-purple-300">{history.length}</p>
          </div>
        </div>

        {/* History */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block">✨</span>
            <p className="text-gray-400 text-sm">No points earned yet.</p>
            <p className="text-gray-600 text-xs mt-1">Start checking in, writing diary entries, and completing challenges!</p>
            <button onClick={() => navigate('/daily-checkin')}
              className="mt-5 px-5 py-2.5 rounded-full text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
              Do Your Daily Check-In ✦
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([day, entries]) => (
              <div key={day}>
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">{day}</p>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs font-bold text-pink-400">
                    +{entries.reduce((s, e) => s + (e.points || 0), 0)} pts
                  </span>
                </div>
                <div className="space-y-2">
                  {entries.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: 'rgba(168,85,247,0.15)' }}>
                        {entry.emoji || '✨'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{entry.label || entry.action}</p>
                        <p className="text-xs text-gray-500">{timeAgo(entry.created_date)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-yellow-400">+{entry.points} pts</p>
                        {entry.total_after != null && (
                          <p className="text-[10px] text-gray-600">{entry.total_after.toLocaleString()} total</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="me" />
    </div>
  );
}