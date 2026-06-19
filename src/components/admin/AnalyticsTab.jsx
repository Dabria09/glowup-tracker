import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Users, Zap, BarChart2, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [groups, setGroups] = useState([]);
  const [dailyUsers, setDailyUsers] = useState([]);
  const [featureData, setFeatureData] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState({ dauTrend: 0, engagementTrend: 0, pageViewsTrend: 0 });

  useEffect(() => { load(); }, [range, selectedGroup]);

  const load = async () => {
    setLoading(true);
    try {
      const days = parseInt(range);
      const now = Date.now();
      const currentSince = now - days * 86400000;
      const previousSince = currentSince - days * 86400000;
      
      // Fetch groups for filter dropdown
      const groupsList = await base44.entities.ClassGroup.list('-created_date', 100);
      setGroups(groupsList);
      
      // Use PointsHistory as the single source of truth for all activity metrics
      const [pointsHistory, usersRes] = await Promise.all([
        base44.entities.PointsHistory.list('-created_date', 2000),
        base44.functions.invoke('getAdminUsers', {}),
      ]);
      
      // If group filter is selected, get group members to filter metrics
      let groupMemberEmails = null;
      if (selectedGroup !== 'all') {
        const groupMembers = await base44.entities.GroupMember.filter({ group_id: selectedGroup });
        groupMemberEmails = new Set(groupMembers.map(m => m.user_email));
      }
      
      // Filter points by group membership if a group is selected
      const filterByGroup = (points) => {
        if (!groupMemberEmails) return points;
        return points.filter(p => groupMemberEmails.has(p.user_email));
      };
      
      const currentPoints = filterByGroup(pointsHistory.filter(p => p.created_date && new Date(p.created_date).getTime() >= currentSince));
      const previousPoints = filterByGroup(pointsHistory.filter(p => 
        p.created_date && 
        new Date(p.created_date).getTime() >= previousSince && 
        new Date(p.created_date).getTime() < currentSince
      ));
      
      // Daily active users from PointsHistory (consistent with OverviewTab)
      const dayMap = {};
      currentPoints.forEach(p => {
        const day = localDateKey(p.created_date);
        if (!dayMap[day]) dayMap[day] = new Set();
        dayMap[day].add(p.user_email);
      });
      const sortedDays = Object.entries(dayMap).sort((a, b) => a[0].localeCompare(b[0])).slice(-14).map(([date, users]) => ({ date, count: users.size }));
      setDailyUsers(sortedDays);

      // Feature engagement from points history
      const featMap = {};
      currentPoints.forEach(p => {
        if (p.action) featMap[p.action] = (featMap[p.action] || 0) + 1;
      });
      setFeatureData(Object.entries(featMap).sort((a, b) => b[1] - a[1]).slice(0, 8));
      
      // Top pages from page_view actions in PointsHistory
      const pageMap = {};
      currentPoints.forEach(p => {
        if (p.action === 'page_view' && p.metadata) {
          const pageName = typeof p.metadata === 'string' ? p.metadata : (p.metadata.page || p.metadata.path || 'Unknown');
          pageMap[pageName] = (pageMap[pageName] || 0) + 1;
        }
      });
      setTopPages(Object.entries(pageMap).sort((a, b) => b[1] - a[1]).slice(0, 5));
      
      // Calculate page views trend
      const currentPageViews = currentPoints.filter(p => p.action === 'page_view').length;
      const previousPageViews = previousPoints.filter(p => p.action === 'page_view').length;
      const pageViewsTrend = previousPageViews > 0 ? ((currentPageViews - previousPageViews) / previousPageViews) * 100 : currentPageViews > 0 ? 100 : 0;
      
      // Calculate trends (current vs previous period)
      const currentDAU = currentPoints.reduce((set, p) => { set.add(p.user_email); return set; }, new Set()).size;
      const previousDAU = previousPoints.reduce((set, p) => { set.add(p.user_email); return set; }, new Set()).size;
      const dauTrend = previousDAU > 0 ? ((currentDAU - previousDAU) / previousDAU) * 100 : currentDAU > 0 ? 100 : 0;
      
      const currentEngagement = currentPoints.filter(p => p.action).length;
      const previousEngagement = previousPoints.filter(p => p.action).length;
      const engagementTrend = previousEngagement > 0 ? ((currentEngagement - previousEngagement) / previousEngagement) * 100 : currentEngagement > 0 ? 100 : 0;
      
      setTrendData({ dauTrend: Math.round(dauTrend * 10) / 10, engagementTrend: Math.round(engagementTrend * 10) / 10, pageViewsTrend: Math.round(pageViewsTrend * 10) / 10 });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const maxDaily = Math.max(...dailyUsers.map(d => d.count), 1);

  const exportCSV = () => {
    const rows = [
      ['Girls Glowing Up™ Analytics Report', '', ''],
      ['Generated:', new Date().toLocaleString(), ''],
      ['Period:', `Last ${range}`, ''],
      ['', '', ''],
      ['=== SUMMARY METRICS ===', '', ''],
      ['Metric', 'Value', 'Trend vs Prior Period'],
      ['Daily Active Users (avg)', Math.round(dailyUsers.reduce((s, d) => s + d.count, 0) / (dailyUsers.length || 1)), trendData.dauTrend > 0 ? `+${trendData.dauTrend}%` : `${trendData.dauTrend}%`],
      ['Total Engagements', featureData.reduce((s, [, c]) => s + c, 0), trendData.engagementTrend > 0 ? `+${trendData.engagementTrend}%` : `${trendData.engagementTrend}%`],
      ['Total Page Views', topPages.reduce((s, [, c]) => s + c, 0), trendData.pageViewsTrend > 0 ? `+${trendData.pageViewsTrend}%` : `${trendData.pageViewsTrend}%`],
      ['', '', ''],
      ['=== TOP PAGES ===', '', ''],
      ['Page Name', 'Views', ''],
    ];
    topPages.forEach(([page, count]) => rows.push([page, count, '']));
    
    rows.push(['', '', '']);
    rows.push(['=== FEATURE ENGAGEMENT ===', '', '']);
    rows.push(['Feature', 'Uses', '']);
    featureData.forEach(([action, count]) => rows.push([prettyAction(action), count, '']));
    
    rows.push(['', '', '']);
    rows.push(['=== DAILY ACTIVE USERS (Last 14 Days) ===', '', '']);
    rows.push(['Date', 'Unique Users', '']);
    dailyUsers.forEach(day => rows.push([day.date, day.count, '']));
    
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GGU-Analytics-${range}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            className="bg-gray-900 border border-white/10 rounded-full px-3 py-1.5 text-xs text-white outline-none"
          >
            <option value="all" className="bg-gray-900">📊 All Groups (App-wide)</option>
            {groups.map(g => (
              <option key={g.id} value={g.id} className="bg-gray-900">
                🏫 {g.name} ({g.member_count || 0} members)
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            {TIME_RANGES.map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${range === r ? 'text-white' : 'text-gray-400 bg-white/5'}`}
                style={range === r ? { background: 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <button onClick={exportCSV}
          className="px-3 py-1.5 rounded-full text-xs font-semibold text-white flex items-center gap-1.5"
          style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)' }}>
          <Download size={14} /> Export CSV
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-2">
        {selectedGroup !== 'all' ? `🏫 ${groups.find(g => g.id === selectedGroup)?.name || 'Group'} · ` : ''}
        Data for last {range} vs previous {range}
      </p>

      {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div> : (
        <>
          <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-start gap-2">
                <BarChart2 size={14} className="text-pink-400 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-white">Most Visited Pages</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Tracks in-app screens: Dashboard, Discover, Glow, Connect, Me, plus detail pages (e.g., Trip Detail, Community Detail). 
                    Requires page_view tracking calls in each page component.
                  </p>
                </div>
              </div>
              {topPages.length > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${trendData.pageViewsTrend >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={{ background: trendData.pageViewsTrend >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${trendData.pageViewsTrend >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                  {trendData.pageViewsTrend >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {Math.abs(trendData.pageViewsTrend)}% vs prior {range}
                </span>
              )}
            </div>
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
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-white flex items-center gap-2"><Users size={14} className="text-blue-400" /> Daily Active Users (last {range})</p>
              {dailyUsers.length > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${trendData.dauTrend >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={{ background: trendData.dauTrend >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${trendData.dauTrend >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                  {trendData.dauTrend >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {Math.abs(trendData.dauTrend)}% vs prior {range}
                </span>
              )}
            </div>
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
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-white flex items-center gap-2"><Zap size={14} className="text-yellow-400" /> Feature Engagement (Glow Score Events)</p>
              {featureData.length > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${trendData.engagementTrend >= 0 ? 'text-emerald-400' : 'text-red-400'}`} style={{ background: trendData.engagementTrend >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${trendData.engagementTrend >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                  {trendData.engagementTrend >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {Math.abs(trendData.engagementTrend)}% vs prior {range}
                </span>
              )}
            </div>
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