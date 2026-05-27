import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Activity, CheckCircle, Zap, BookOpen, TrendingUp } from 'lucide-react';

export default function OverviewTab() {
  const [stats, setStats] = useState({ totalUsers: 0, activeToday: 0, activeWeek: 0, totalCheckIns: 0, totalPoints: 0, diaryEntries: 0 });
  const [topMoods, setTopMoods] = useState([]);
  const [dailyCheckIns, setDailyCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [users, checkIns, points, diary] = await Promise.all([
          base44.entities.UserProfile.list(),
          base44.entities.DailyTask.filter({ is_completed: true }),
          base44.entities.UserPoints.list(),
          base44.entities.DiaryEntry.list(),
        ]);

        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        const todayCheckIns = checkIns.filter(c => c.completed_date === today);
        const weekUsers = new Set(checkIns.filter(c => c.completed_date >= weekAgo.split('T')[0]).map(c => c.user_email));

        const totalPts = points.reduce((s, p) => s + (p.total_points || 0), 0);

        setStats({
          totalUsers: users.length,
          activeToday: todayCheckIns.length,
          activeWeek: weekUsers.size,
          totalCheckIns: checkIns.length,
          totalPoints: totalPts,
          diaryEntries: diary.length,
        });

        // Mood distribution from recent check-in tasks
        const moodMap = {};
        checkIns.slice(0, 200).forEach(c => {
          if (c.category) moodMap[c.category] = (moodMap[c.category] || 0) + 1;
        });
        const sorted = Object.entries(moodMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
        setTopMoods(sorted);

        // Daily check-ins last 7 days
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(Date.now() - i * 86400000);
          const ds = d.toISOString().split('T')[0];
          const count = checkIns.filter(c => c.completed_date === ds).length;
          days.push({ date: ds, count, label: d.toLocaleDateString('en-US', { weekday: 'short' }) });
        }
        setDailyCheckIns(days);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#a855f7' },
    { label: 'Active Today', value: stats.activeToday, icon: Activity, color: '#ec4899' },
    { label: 'Active This Week', value: stats.activeWeek, icon: TrendingUp, color: '#3b82f6' },
    { label: 'Total Check-Ins', value: stats.totalCheckIns, icon: CheckCircle, color: '#10b981' },
    { label: 'Total Glow Points', value: stats.totalPoints.toLocaleString(), icon: Zap, color: '#f59e0b' },
    { label: 'Diary Entries', value: stats.diaryEntries, icon: BookOpen, color: '#f43f5e' },
  ];

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>;

  const maxCheckIn = Math.max(...dailyCheckIns.map(d => d.count), 1);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: card.color + '20' }}>
                  <Icon size={16} style={{ color: card.color }} />
                </div>
                <span className="text-xs text-gray-400">{card.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">🩷 Top Moods Reported</p>
        {topMoods.length === 0 ? <p className="text-xs text-gray-500">No check-in data yet.</p> : (
          <div className="space-y-2">
            {topMoods.map(([mood, count]) => (
              <div key={mood} className="flex items-center gap-2">
                <span className="text-xs text-gray-300 w-24 capitalize">{mood}</span>
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-pink-500 rounded-full" style={{ width: `${(count / topMoods[0][1]) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-400">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Activity size={14} className="text-pink-400" /> Daily Check-Ins (Last 7 Days)</p>
        {dailyCheckIns.every(d => d.count === 0) ? <p className="text-xs text-gray-500">No check-in data yet.</p> : (
          <div className="flex items-end gap-2 h-20">
            {dailyCheckIns.map(day => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-md bg-pink-500/60" style={{ height: `${(day.count / maxCheckIn) * 60}px`, minHeight: day.count > 0 ? 4 : 0 }} />
                <span className="text-[9px] text-gray-500">{day.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="text-sm font-bold text-white mb-1 flex items-center gap-2">⭐ Most Used Features (This Week)</p>
        <p className="text-xs text-gray-500">Activity tracked via check-ins, diary, and glow points.</p>
      </div>
    </div>
  );
}