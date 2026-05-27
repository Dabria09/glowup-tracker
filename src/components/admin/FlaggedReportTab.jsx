import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, TrendingUp, FileText, RefreshCw } from 'lucide-react';

export default function FlaggedReportTab() {
  const [loading, setLoading] = useState(true);
  const [wordStats, setWordStats] = useState([]);
  const [totalFlagged, setTotalFlagged] = useState(0);
  const [bySource, setBySource] = useState({ shoutout: 0, community: 0 });
  const [recentFlags, setRecentFlags] = useState([]);

  const load = async () => {
    setLoading(true);
    const [bannedWords, shoutouts, communityPosts] = await Promise.all([
      base44.entities.BannedWord.filter({ is_active: true }),
      base44.entities.ShoutOut.list('-created_date', 200),
      base44.entities.CommunityPost.list('-created_date', 200),
    ]);

    const activeWords = bannedWords.map(w => ({ ...w, wordLower: w.word.toLowerCase() }));
    const hitCounts = {};
    activeWords.forEach(w => { hitCounts[w.word] = { count: 0, category: w.category, word: w.word }; });

    const flaggedItems = [];

    const scanContent = (text, source, post) => {
      if (!text) return;
      const lower = text.toLowerCase();
      activeWords.forEach(w => {
        if (lower.includes(w.wordLower)) {
          hitCounts[w.word].count += 1;
          flaggedItems.push({ content: text, source, email: post.user_email || post.username, date: post.created_date, triggeredWord: w.word });
        }
      });
    };

    shoutouts.forEach(p => scanContent(p.content, 'shoutout', p));
    communityPosts.forEach(p => scanContent(p.content, 'community', p));

    // Sort by hit count desc
    const sorted = Object.values(hitCounts).filter(w => w.count > 0).sort((a, b) => b.count - a.count);
    setWordStats(sorted);

    const shoutoutFlags = flaggedItems.filter(f => f.source === 'shoutout').length;
    const communityFlags = flaggedItems.filter(f => f.source === 'community').length;
    setTotalFlagged(flaggedItems.length);
    setBySource({ shoutout: shoutoutFlags, community: communityFlags });

    // Dedup flagged items (one entry per post per word), show recent 20
    flaggedItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    setRecentFlags(flaggedItems.slice(0, 20));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const CAT_COLORS = { profanity: '#ef4444', hate_speech: '#dc2626', harassment: '#f97316', spam: '#a855f7', other: '#6b7280' };

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-7 h-7 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
      <p className="text-xs text-gray-500">Scanning content…</p>
    </div>
  );

  const maxCount = wordStats[0]?.count || 1;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Flagged Content Report</h2>
          <p className="text-xs text-gray-400">Based on active banned words list</p>
        </div>
        <button onClick={load} className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total Flags', value: totalFlagged, emoji: '🚨' },
          { label: 'Shout Outs', value: bySource.shoutout, emoji: '📢' },
          { label: 'Community', value: bySource.community, emoji: '💬' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-lg mb-0.5">{s.emoji}</p>
            <p className="font-bold text-white text-lg">{s.value}</p>
            <p className="text-[10px] text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Most triggered words */}
      <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,85,247,0.25)' }}>
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-purple-400" />
          <p className="text-sm font-bold text-white">Most Triggered Banned Words</p>
        </div>
        {wordStats.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">No banned words triggered yet.</p>
        ) : (
          <div className="space-y-2.5">
            {wordStats.map((w, i) => (
              <div key={w.word} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 w-4 text-right">{i + 1}.</span>
                    <span className="text-sm font-mono font-semibold text-white">{w.word}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full capitalize"
                      style={{ background: (CAT_COLORS[w.category] || '#6b7280') + '22', color: CAT_COLORS[w.category] || '#9ca3af' }}>
                      {w.category.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white">{w.count}×</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden ml-6">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${(w.count / maxCount) * 100}%`, background: CAT_COLORS[w.category] || '#6b7280' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent flagged posts */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-amber-400" />
          <p className="text-sm font-bold text-white">Recent Flagged Posts</p>
        </div>
        {recentFlags.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-6">No flagged posts found.</p>
        ) : (
          recentFlags.map((f, i) => (
            <div key={i} className="rounded-2xl p-3" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
              <div className="flex items-start gap-2">
                <AlertTriangle size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold text-amber-400 px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.15)' }}>
                      "{f.triggeredWord}"
                    </span>
                    <span className="text-[10px] text-gray-500">{f.source === 'shoutout' ? '📢 Shout Out' : '💬 Community'}</span>
                    <span className="text-[10px] text-gray-600">{timeAgo(f.date)}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">{f.content}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{f.email}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}