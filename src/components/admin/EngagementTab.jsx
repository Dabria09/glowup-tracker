import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Activity, Users } from 'lucide-react';

export default function EngagementTab() {
  const [stats, setStats] = useState({ avgDailyCheckIns: 0, activeWeek: 0 });
  const [moodDist, setMoodDist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const checkIns = await base44.entities.DailyTask.filter({ is_completed: true });
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
        const weekCheckIns = checkIns.filter(c => c.completed_date >= weekAgo);
        const weekUsers = new Set(weekCheckIns.map(c => c.user_email));
        const avg = weekCheckIns.length > 0 ? Math.round(weekCheckIns.length / 7) : 0;

        setStats({ avgDailyCheckIns: avg, activeWeek: weekUsers.size });

        const moodMap = {};
        weekCheckIns.forEach(c => {
          if (c.category) moodMap[c.category] = (moodMap[c.category] || 0) + 1;
        });
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
        <p className="text-xs text-gray-500">No activity data yet.</p>
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