import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Activity, Users } from 'lucide-react';

// Must match OverviewTab — convert any date to LOCAL YYYY-MM-DD key
const localDateKey = (d) => {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const prettyAction = (a) => a.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function EngagementTab() {
  const [stats, setStats] = useState({ avgDailyCheckIns: 0, activeWeek: 0 });
  const [mostUsed, setMostUsed] = useState([]);
  const [moodDist, setMoodDist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Single source of truth: PointsHistory — same as OverviewTab
        const pointsHistory = await base44.entities.PointsHistory.list('-created_date', 2000);
        const weekAgoMs = Date.now() - 7 * 86400000;
        const weekHistory = pointsHistory.filter(p => p.created_date && new Date(p.created_date).getTime() >= weekAgoMs);

        // Active This Week — unique users with any activity in the last 7 days
        const weekUsers = new Set(weekHistory.map(p => p.user_email));

        // Avg daily check-ins — unique active users / 7
        const avg = weekUsers.size > 0 ? Math.round(weekUsers.size / 7) : 0;

        setStats({ avgDailyCheckIns: avg, activeWeek: weekUsers.size });

        // Most Used Features (7 Days) — ranked by count
        const featureMap = {};
        weekHistory.forEach(p => { if (p.action) featureMap[p.action] = (featureMap[p.action] || 0) + 1; });
        setMostUsed(Object.entries(featureMap).sort((a, b) => b[1] - a[1]).slice(0, 6));

        // Mood Distribution — from DailyTask (category field) for mood-specific data
        const checkIns = await base44.entities.DailyTask.filter({ is_completed: true });
        const weekAgoKey = localDateKey(new Date(weekAgoMs));
        const weekCheckIns = checkIns.filter(c => c.completed_date && localDateKey(c.completed_date) >= weekAgoKey);
        const moodMap = {};
        weekCheckIns.forEach(c => { if (c.category) moodMap[c.category] = (moodMap[c.category] || 0) + 1; });
        setMoodDist(Object.entries(moodMap).sort((a, b) => b[1] - a[1]));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Avg Daily Check-Ins', value: stats.avgDailyCheckIns, icon: Activity, color: '#a855f7' },
          { label: 'Active This Week', value: stats.activeWeek, icon: Users, color: '#ec4899' },
        ].map(card => {
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
        <p className="text-sm font-bold text-white mb-3">Most Used Features (7 Days)</p>
        {mostUsed.length === 0 ? <p className="text-xs text-gray-500">No activity data yet.</p> : (
          <div className="space-y-2">
            {mostUsed.map(([feature, count], idx) => (
              <div key={feature} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 w-4">{idx + 1}</span>
                <span className="text-xs text-gray-300 flex-1 truncate">{prettyAction(feature)}</span>
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden max-w-[120px]">
                  <div className="h-full rounded-full" style={{ width: `${(count / mostUsed[0][1]) * 100}%`, background: 'linear-gradient(90deg,#a855f7,#ec4899)' }} />
                </div>
                <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="text-sm font-bold text-white mb-3">Mood Distribution</p>
        {moodDist.length === 0 ? <p className="text-xs text-gray-500">No mood data yet.</p> : (
          <div className="space-y-2">
            {moodDist.map(([mood, count]) => (
              <div key={mood} className="flex items-center gap-2">
                <span className="text-xs text-gray-300 w-28 capitalize">{mood}</span>
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" style={{ width: `${(count / moodDist[0][1]) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-400">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 rounded-2xl" style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)' }}>
        <p className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Activity size={14} className="text-purple-400" /> Engagement Insight</p>
        <p className="text-xs text-gray-300 leading-relaxed">Girls who complete their first Glow Check-In are <span className="text-pink-400 font-bold">3× more likely</span> to return the next day. Encourage first-time check-ins through onboarding to maximize retention.</p>
      </div>
    </div>
  );
}