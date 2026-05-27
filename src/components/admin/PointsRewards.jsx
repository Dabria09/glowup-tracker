import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Zap, Trophy, Plus, Minus } from 'lucide-react';

const DEFAULT_CONFIG = {
  daily_checkin: 10,
  diary_entry: 5,
  shout_out: 15,
  save_quote: 2,
  glow_board_post: 10,
  complete_challenge: 25,
  complete_glow_up_day: 20,
  goals_completed: 10,
  checkin_streak_bonus: 5,
};

const ACTIVITY_LABELS = {
  daily_checkin: { label: 'Daily Check-In', emoji: '✅' },
  diary_entry: { label: 'Diary Entry', emoji: '📔' },
  shout_out: { label: 'Shout Out Posted', emoji: '📣' },
  save_quote: { label: 'Save a Quote', emoji: '💭' },
  glow_board_post: { label: 'Glow Board Post', emoji: '📸' },
  complete_challenge: { label: 'Complete Challenge', emoji: '🔥' },
  complete_glow_up_day: { label: 'Glow Up Day', emoji: '✨' },
  goals_completed: { label: 'Goal Completed', emoji: '🎯' },
  checkin_streak_bonus: { label: 'Streak Bonus', emoji: '🏆' },
};

export default function PointsRewards() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [configId, setConfigId] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [awardEmail, setAwardEmail] = useState('');
  const [awardPoints, setAwardPoints] = useState(0);
  const [awardReason, setAwardReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [awarding, setAwarding] = useState(false);
  const [activeTab, setActiveTab] = useState('config');

  useEffect(() => {
    Promise.all([
      base44.entities.PointsConfig.list(),
      base44.entities.UserPoints.list('-total_points', 50),
      base44.entities.UserProfile.list(),
    ]).then(([cfg, pts, profs]) => {
      if (cfg.length && cfg[0].config_json) {
        try {
          setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(cfg[0].config_json) });
          setConfigId(cfg[0].id);
        } catch {}
      }
      setLeaderboard(pts);
      setProfiles(profs);
    });
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    if (configId) {
      await base44.entities.PointsConfig.update(configId, { config_json: JSON.stringify(config) });
    } else {
      const rec = await base44.entities.PointsConfig.create({ config_json: JSON.stringify(config) });
      setConfigId(rec.id);
    }
    setSaving(false);
    toast.success('Points config saved! ✨');
  };

  const handleAward = async () => {
    if (!awardEmail.trim() || !awardPoints) return;
    setAwarding(true);
    const existing = await base44.entities.UserPoints.filter({ user_email: awardEmail });
    const current = existing.length ? existing[0].total_points || 0 : 0;
    const newTotal = Math.max(0, current + Number(awardPoints));
    if (existing.length) {
      await base44.entities.UserPoints.update(existing[0].id, { total_points: newTotal });
    } else {
      await base44.entities.UserPoints.create({ user_email: awardEmail, total_points: newTotal });
    }
    await base44.entities.PointsHistory.create({
      user_email: awardEmail,
      action: 'admin_adjustment',
      label: awardReason || 'Admin adjustment',
      emoji: '🛡️',
      points: Number(awardPoints),
      total_after: newTotal,
    });
    setLeaderboard(prev => {
      const idx = prev.findIndex(p => p.user_email === awardEmail);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], total_points: newTotal };
        return updated.sort((a, b) => (b.total_points || 0) - (a.total_points || 0));
      }
      return [{ user_email: awardEmail, total_points: newTotal }, ...prev];
    });
    setAwardEmail(''); setAwardPoints(0); setAwardReason('');
    setAwarding(false);
    toast.success(`Points ${Number(awardPoints) >= 0 ? 'awarded' : 'deducted'}! 🏅`);
  };

  const getUsername = (email) => {
    const p = profiles.find(p => p.user_email === email);
    return p?.username || email?.split('@')[0] || email;
  };

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-white/5 rounded-2xl p-1">
        {[{ id: 'config', label: 'Point Config' }, { id: 'award', label: 'Award Points' }, { id: 'leaderboard', label: 'Leaderboard' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${activeTab === t.id ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Config */}
      {activeTab === 'config' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Set point values for each activity. Changes apply to new actions only.</p>
          {Object.entries(config).map(([key, val]) => {
            const meta = ACTIVITY_LABELS[key] || { label: key, emoji: '⭐' };
            return (
              <div key={key} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-lg">{meta.emoji}</span>
                <p className="flex-1 text-sm font-semibold text-white">{meta.label}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setConfig(c => ({ ...c, [key]: Math.max(0, val - 1) }))}
                    className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                    <Minus size={12} />
                  </button>
                  <input
                    type="number"
                    value={val}
                    onChange={e => setConfig(c => ({ ...c, [key]: Number(e.target.value) }))}
                    className="w-12 text-center bg-white/10 border border-white/15 rounded-lg py-1 text-sm font-bold text-yellow-400 outline-none"
                  />
                  <button onClick={() => setConfig(c => ({ ...c, [key]: val + 1 }))}
                    className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            );
          })}
          <button onClick={saveConfig} disabled={saving}
            className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40 transition"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
            {saving ? 'Saving…' : 'Save Config ✨'}
          </button>
        </div>
      )}

      {/* Award Points */}
      {activeTab === 'award' && (
        <div className="space-y-4">
          <p className="text-xs text-gray-400">Manually award or deduct points from any user. Use a negative number to deduct.</p>
          <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1 block">User Email</label>
              <input value={awardEmail} onChange={e => setAwardEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none placeholder-gray-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1 block">Points (negative to deduct)</label>
              <input type="number" value={awardPoints || ''} onChange={e => setAwardPoints(e.target.value)}
                placeholder="e.g. 50 or -10"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none placeholder-gray-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1 block">Reason (optional)</label>
              <input value={awardReason} onChange={e => setAwardReason(e.target.value)}
                placeholder="e.g. Contest winner"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none placeholder-gray-500" />
            </div>
            <button onClick={handleAward} disabled={awarding || !awardEmail.trim() || !awardPoints}
              className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40 transition flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
              <Zap size={16} /> {awarding ? 'Processing…' : Number(awardPoints) < 0 ? 'Deduct Points' : 'Award Points'}
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-2">
          {leaderboard.map((entry, idx) => (
            <div key={entry.id || idx} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: idx === 0 ? 'rgba(251,191,36,0.3)' : idx === 1 ? 'rgba(156,163,175,0.3)' : idx === 2 ? 'rgba(180,83,9,0.3)' : 'rgba(255,255,255,0.08)', color: idx === 0 ? '#fbbf24' : idx === 1 ? '#d1d5db' : idx === 2 ? '#b45309' : '#6b7280' }}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{getUsername(entry.user_email)}</p>
                <p className="text-[10px] text-gray-500 truncate">{entry.user_email}</p>
              </div>
              <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                <Trophy size={13} />
                {(entry.total_points || 0).toLocaleString()}
              </div>
            </div>
          ))}
          {leaderboard.length === 0 && <p className="text-center py-10 text-gray-500 text-sm">No points data yet.</p>}
        </div>
      )}
    </div>
  );
}