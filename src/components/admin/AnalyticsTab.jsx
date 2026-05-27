import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Users, Zap } from 'lucide-react';

const TIME_RANGES = ['7d', '14d', '30d', '90d'];

export default function AnalyticsTab() {
  const [range, setRange] = useState('30d');
  const [dailyUsers, setDailyUsers] = useState([]);
  const [featureData, setFeatureData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [range]);

  const load = async () => {
    setLoading(true);
    try {
      const days = parseInt(range);
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const [checkIns, points] = await Promise.all([
        base44.entities.DailyTask.filter({ is_completed: true }),
        base44.entities.PointsHistory.list('-created_date', 500),
      ]);

      const recentCheckIns = checkIns.filter(c => c.completed_date >= since.split('T')[0]);
      const recentPoints = points.filter(p => p.created_date >= since);

      // Daily active users
      const dayMap = {};
      recentCheckIns.forEach(c => {
        const day = c.completed_date;
        if (!dayMap[day]) dayMap[day] = new Set();
        dayMap[day].add(c.user_email);
      });
      const sortedDays = Object.entries(dayMap).sort((a, b) => a[0].localeCompare(b[0])).slice(-14).map(([date, users]) => ({ date, count: users.size }));
      setDailyUsers(sortedDays);

      // Feature engagement from points history
      const featMap = {};
      recentPoints.forEach(p => {
        if (p.action) featMap[p.action] = (featMap[p.action] || 0) + 1;
      });
      setFeatureData(Object.entries(featMap).sort((a, b) => b[1] - a[1]).slice(0, 8));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const maxDaily = Math.max(...dailyUsers.map(d => d.count), 1);

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {TIME_RANGES.map(r => (
          <button key={r} onClick={() => setRange(r)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${range === r ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={range === r ? { background: 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}>
            {r}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div> : (
        <>
          <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-sm font-bold text-white mb-3 flex items-center gap-2"><TrendingUp size={14} className="text-pink-400" /> Most Visited Pages</p>
            <p className="text-xs text-gray-500">No page views recorded yet. Pages will appear here once users start visiting.</p>
          </div>

          <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Users size={14} className="text-blue-400" /> Daily Active Users (last {range})</p>
            {dailyUsers.length === 0 ? <p className="text-xs text-gray-500">No active user data yet.</p> : (
              <div className="flex items-end gap-1 h-24">
                {dailyUsers.map(day => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-sm" style={{ height: `${(day.count / maxDaily) * 70}px`, minHeight: 2, background: 'linear-gradient(to top, #ec4899, #a855f7)' }} />
                    <span className="text-[8px] text-gray-600">{new Date(day.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Zap size={14} className="text-yellow-400" /> Feature Engagement (Glow Score Events)</p>
            {featureData.length === 0 ? <p className="text-xs text-gray-500">No feature engagement data yet.</p> : (
              <div className="space-y-2">
                {featureData.map(([action, count]) => (
                  <div key={action} className="flex items-center gap-2">
                    <span className="text-xs text-gray-300 w-32 truncate capitalize">{action.replace(/_/g, ' ')}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(count / featureData[0][1]) * 100}%`, background: 'linear-gradient(90deg,#fbbf24,#f59e0b)' }} />
                    </div>
                    <span className="text-xs text-gray-400">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}