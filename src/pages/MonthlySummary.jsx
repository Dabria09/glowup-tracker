import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, TrendingUp, Zap, Calendar, Star, Trophy } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getMonthRange(year, month) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  return { start, end };
}

export default function MonthlySummary() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const [hist, pts] = await Promise.all([
        base44.entities.PointsHistory.filter({ user_email: u.email }, '-created_date', 500),
        base44.entities.UserPoints.filter({ user_email: u.email }),
      ]);
      setHistory(hist);
      setTotalPoints(pts.length > 0 ? pts[0].total_points || 0 : 0);
      setLoading(false);
    }).catch(() => { setLoading(false); navigate('/'); });
  }, []);

  const { start, end } = getMonthRange(viewYear, viewMonth);
  const monthEntries = history.filter(e => {
    const d = new Date(e.created_date);
    return d >= start && d <= end;
  });

  // Previous month
  const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
  const { start: pStart, end: pEnd } = getMonthRange(prevYear, prevMonth);
  const prevMonthEntries = history.filter(e => {
    const d = new Date(e.created_date);
    return d >= pStart && d <= pEnd;
  });

  const monthPoints = monthEntries.reduce((s, e) => s + (e.points || 0), 0);
  const prevPoints = prevMonthEntries.reduce((s, e) => s + (e.points || 0), 0);
  const pointsDiff = monthPoints - prevPoints;
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  // Group by activity
  const byAction = monthEntries.reduce((acc, e) => {
    const key = e.action;
    if (!acc[key]) acc[key] = { label: e.label || e.action, emoji: e.emoji || '✨', count: 0, points: 0 };
    acc[key].count++;
    acc[key].points += e.points || 0;
    return acc;
  }, {});
  const topActivities = Object.values(byAction).sort((a, b) => b.points - a.points);

  // Daily breakdown for simple bar chart (days 1–daysInMonth)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const dailyPoints = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return monthEntries
      .filter(e => new Date(e.created_date).getDate() === day)
      .reduce((s, e) => s + (e.points || 0), 0);
  });
  const maxDaily = Math.max(...dailyPoints, 1);

  const canGoBack = history.some(e => {
    const d = new Date(e.created_date);
    return d < start;
  });
  const canGoForward = viewYear < now.getFullYear() || (viewYear === now.getFullYear() && viewMonth < now.getMonth());

  function prevMonthNav() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonthNav() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

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
            <h1 className="text-2xl font-bold">Monthly Summary 📅</h1>
            <p className="text-xs text-gray-400">Track your glow growth month by month</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Month navigator */}
            <div className="flex items-center justify-between mb-6 px-1">
              <button onClick={prevMonthNav} disabled={!canGoBack}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center disabled:opacity-30 hover:bg-white/20 transition">
                <ChevronLeft size={18} />
              </button>
              <div className="text-center">
                <p className="text-lg font-bold">{MONTH_NAMES[viewMonth]} {viewYear}</p>
                {isCurrentMonth && <span className="text-[10px] text-pink-400 font-semibold">Current Month</span>}
              </div>
              <button onClick={nextMonthNav} disabled={!canGoForward}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center disabled:opacity-30 hover:bg-white/20 transition"
                style={{ transform: 'rotate(180deg)' }}>
                <ChevronLeft size={18} />
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-2xl p-4 text-center" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.1))', border: '1px solid rgba(168,85,247,0.3)' }}>
                <Zap size={18} className="mx-auto text-yellow-400 mb-1" />
                <p className="text-2xl font-bold text-white">{monthPoints.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400">Points Earned</p>
              </div>
              <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Calendar size={18} className="mx-auto text-pink-400 mb-1" />
                <p className="text-2xl font-bold text-white">{monthEntries.length}</p>
                <p className="text-[10px] text-gray-400">Activities</p>
              </div>
              <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <TrendingUp size={18} className="mx-auto text-green-400 mb-1" />
                <p className={`text-2xl font-bold ${pointsDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {pointsDiff >= 0 ? '+' : ''}{pointsDiff.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-400">vs Last Month</p>
              </div>
            </div>

            {/* Total all-time */}
            <div className="rounded-2xl px-5 py-3 mb-6 flex items-center justify-between"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2">
                <Star size={16} className="text-yellow-400" />
                <span className="text-sm text-gray-300">All-Time Total</span>
              </div>
              <span className="text-lg font-bold text-yellow-400">{totalPoints.toLocaleString()} pts</span>
            </div>

            {/* Challenge Leaderboard link */}
            <button onClick={() => navigate('/challenge-leaderboard')}
              className="w-full flex items-center justify-between rounded-2xl px-5 py-4 mb-6 transition hover:opacity-80"
              style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(236,72,153,0.15))', border: '1px solid rgba(168,85,247,0.4)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.3)' }}>
                  <Trophy size={18} className="text-yellow-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Challenge Leaderboard</p>
                  <p className="text-xs text-gray-400">See how you rank against other Glow Girls</p>
                </div>
              </div>
              <ChevronLeft size={16} className="text-gray-400" style={{ transform: 'rotate(180deg)' }} />
            </button>

            {/* Daily bar chart */}
            {monthPoints > 0 && (
              <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Daily Activity</p>
                <div className="flex items-end gap-0.5 h-16">
                  {dailyPoints.map((pts, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5 group">
                      <div
                        className="w-full rounded-sm transition-all"
                        style={{
                          height: pts > 0 ? `${Math.max(4, Math.round((pts / maxDaily) * 56))}px` : '2px',
                          background: pts > 0
                            ? 'linear-gradient(180deg, #ec4899, #a855f7)'
                            : 'rgba(255,255,255,0.06)',
                        }}
                        title={`Day ${i + 1}: ${pts} pts`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-gray-600">1</span>
                  <span className="text-[9px] text-gray-600">{Math.ceil(daysInMonth / 2)}</span>
                  <span className="text-[9px] text-gray-600">{daysInMonth}</span>
                </div>
              </div>
            )}

            {/* Top activities */}
            {topActivities.length > 0 ? (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Activity Breakdown</p>
                <div className="space-y-2">
                  {topActivities.map((act) => {
                    const pct = Math.round((act.points / monthPoints) * 100);
                    return (
                      <div key={act.label} className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl">{act.emoji}</span>
                          <span className="flex-1 text-sm text-gray-200">{act.label}</span>
                          <span className="text-xs text-gray-500">{act.count}×</span>
                          <span className="text-sm font-bold text-yellow-400">+{act.points} pts</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #ec4899, #a855f7)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <span className="text-5xl mb-4 block">🌱</span>
                <p className="text-gray-400 text-sm">No activity recorded this month yet.</p>
                <button onClick={() => navigate('/daily-checkin')}
                  className="mt-4 px-5 py-2.5 rounded-full text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                  Start Your Day ✦
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav active="glow" />
    </div>
  );
}