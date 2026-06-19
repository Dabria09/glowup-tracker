import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Users, Zap, BarChart2 } from 'lucide-react';

const TIME_RANGES = ['7d', '14d', '30d', '90d'];

// Convert any date/ISO string to a LOCAL YYYY-MM-DD key (matches how activity
// is recorded in the app, which uses the user's local date — not UTC).
const localDateKey = (d) => {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const prettyAction = (a) => a.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function AnalyticsTab() {
  const [range, setRange] = useState('30d');
  const [dailyUsers, setDailyUsers] = useState([]);
  const [featureData, setFeatureData] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [range]);

  const load = async () => {
    setLoading(true);
    try {
      const days = parseInt(range);
      const since = Date.now() - days * 86400000;
      
      // Use PointsHistory as the single source of truth for all activity metrics
      const [pointsHistory, usersRes] = await Promise.all([
        base44.entities.PointsHistory.list('-created_date', 2000),
        base44.functions.invoke('getAdminUsers', {}),
      ]);
      
      const recentPoints = pointsHistory.filter(p => p.created_date && new Date(p.created_date).getTime() >= since);
      const allUsers = usersRes.data?.users || [];
      
      // Daily active users from PointsHistory (consistent with OverviewTab)
      const dayMap = {};
      recentPoints.forEach(p => {
        const day = localDateKey(p.created_date);
        if (!dayMap[day]) dayMap[day] = new Set();
        dayMap[day].add(p.user_email);
      });
      const sortedDays = Object.entries(dayMap).sort((a, b) => a[0].localeCompare(b[0])).slice(-14).map(([date, users]) => ({ date, count: users.size }));
      setDailyUsers(sortedDays);

      // Feature engagement from points history
      const featMap = {};
      recentPoints.forEach(p => {
        if (p.action) featMap[p.action] = (featMap[p.action] || 0) + 1;
      });
      setFeatureData(Object.entries(featMap).sort((a, b) => b[1] - a[1]).slice(0, 8));
      
      // Top pages from page_view actions in PointsHistory
      const pageMap = {};
      recentPoints.forEach(p => {
        if (p.action === 'page_view' && p.metadata) {
          const pageName = typeof p.metadata === 'string' ? p.metadata : (p.metadata.page || p.metadata.path || 'Unknown');
          pageMap[pageName] = (pageMap[pageName] || 0) + 1;
        }
      });
      setTopPages(Object.entries(pageMap).sort((a, b) => b[1] - a[1]).slice(0, 5));
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
            <p className="text-sm font-bold text-white mb-3 flex items-center gap-2"><BarChart2 size={14} className="text-pink-400" /> Most Visited Pages</p>
            {topPages.length === 0 ? (
              <p className="text-xs text-gray-500">No page views recorded yet. Pages will appear here once users start visiting.</p>
            ) : (
              <div className="space-y-2">
                {topPages.map(([page, count]) => (
                  <div key={page} className="flex items-center gap-2">
                    <span className="text-xs text-gray-300 w-32 truncate">{page}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(count / topPages[0][1]) * 100}%`, background: 'linear-gradient(90deg,#ec4899,#a855f7)' }} />
                    </div>
                    <span className="text-xs text-gray-400">{count}</span>
                  </div>
                ))}
              </div>
            )}
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
                    <span className="text-xs text-gray-300 w-32 truncate">{prettyAction(action)}</span>
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