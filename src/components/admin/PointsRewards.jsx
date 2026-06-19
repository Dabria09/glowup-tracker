import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Zap, Trophy, Plus, Minus } from 'lucide-react';

const DEFAULT_CONFIG = {
  // Daily Engagement
  daily_checkin: 10,
  page_view: 1,
  login: 5,
  // Content Creation
  diary_entry: 5,
  shout_out: 15,
  glow_board_post: 10,
  glow_feed_post: 15,
  community_post: 15,
  kitchen_post: 15,
  recipe_added: 20,
  // Learning & Growth
  lesson_completed: 30,
  quiz_completed: 20,
  complete_challenge: 25,
  complete_glow_up_day: 20,
  weekly_challenge: 100,
  daily_task: 25,
  // Wellness & Self-Care
  fitness_log: 20,
  cycle_tracked: 15,
  calm_corner: 25,
  spiritual_habit: 20,
  gratitude_entry: 15,
  meal_plan_created: 20,
  // Goals & Planning
  goals_completed: 10,
  savings_goal: 25,
  homework_task: 15,
  daily_task_completed: 15,
  // Social & Community
  save_quote: 2,
  glow_link_shared: 10,
  glow_link_viewed: 2,
  team_joined: 15,
  community_joined: 10,
  book_club: 20,
  mentor_session: 50,
  // Customization
  avatar_customized: 25,
  glow_persona_created: 30,
  aesthetic_icon_set: 15,
  // Streaks & Milestones
  checkin_streak_bonus: 5,
  week_streak_bonus: 25,
  month_streak_bonus: 100,
  // Achievements
  first_post: 25,
  scholarship_saved: 10,
  job_application: 20,
  contact_added: 5,
  grocery_item: 5,
  sticky_note: 5,
  vision_board_item: 15,
};

const ACTIVITY_LABELS = {
  // Daily Engagement
  daily_checkin: { label: 'Daily Check-In', emoji: '✅' },
  page_view: { label: 'Page View', emoji: '👁️' },
  login: { label: 'Daily Login', emoji: '🔐' },
  // Content Creation
  diary_entry: { label: 'Diary Entry', emoji: '📔' },
  shout_out: { label: 'Shout Out Posted', emoji: '📣' },
  glow_board_post: { label: 'Glow Board Post', emoji: '📸' },
  glow_feed_post: { label: 'Glow Feed Post', emoji: '📱' },
  community_post: { label: 'Community Post', emoji: '💬' },
  kitchen_post: { label: 'Kitchen Post', emoji: '🥘' },
  recipe_added: { label: 'Recipe Added', emoji: '🍳' },
  // Learning & Growth
  lesson_completed: { label: 'Lesson Completed', emoji: '🎓' },
  quiz_completed: { label: 'Quiz Completed', emoji: '📝' },
  complete_challenge: { label: 'Complete Challenge', emoji: '🔥' },
  complete_glow_up_day: { label: 'Glow Up Day', emoji: '✨' },
  weekly_challenge: { label: 'Weekly Challenge', emoji: '🏅' },
  daily_task: { label: 'Daily Task', emoji: '✓' },
  // Wellness & Self-Care
  fitness_log: { label: 'Fitness Log', emoji: '💪' },
  cycle_tracked: { label: 'Cycle Tracked', emoji: '🌸' },
  calm_corner: { label: 'Calm Corner Session', emoji: '🧘' },
  spiritual_habit: { label: 'Spiritual Habit', emoji: '🙏' },
  gratitude_entry: { label: 'Gratitude Entry', emoji: '💖' },
  meal_plan_created: { label: 'Meal Plan Created', emoji: '🥗' },
  // Goals & Planning
  goals_completed: { label: 'Goal Completed', emoji: '🎯' },
  savings_goal: { label: 'Savings Goal Set', emoji: '💰' },
  homework_task: { label: 'Homework Task', emoji: '📖' },
  daily_task_completed: { label: 'Daily Task Completed', emoji: '☑️' },
  // Social & Community
  save_quote: { label: 'Save a Quote', emoji: '💭' },
  glow_link_shared: { label: 'Glow Link Shared', emoji: '🔗' },
  glow_link_viewed: { label: 'Glow Link Viewed', emoji: '👀' },
  team_joined: { label: 'Team Joined', emoji: '👥' },
  community_joined: { label: 'Community Joined', emoji: '🏫' },
  book_club: { label: 'Book Club Activity', emoji: '📚' },
  mentor_session: { label: 'Mentor Session', emoji: '🤝' },
  // Customization
  avatar_customized: { label: 'Avatar Customized', emoji: '🎨' },
  glow_persona_created: { label: 'Glow Persona Created', emoji: '✨' },
  aesthetic_icon_set: { label: 'Aesthetic Icon Set', emoji: '🌸' },
  // Streaks & Milestones
  checkin_streak_bonus: { label: 'Check-in Streak Bonus', emoji: '🏆' },
  week_streak_bonus: { label: 'Week Streak Bonus', emoji: '📅' },
  month_streak_bonus: { label: 'Month Streak Bonus', emoji: '🌙' },
  // Achievements
  first_post: { label: 'First Post', emoji: '🎉' },
  scholarship_saved: { label: 'Scholarship Saved', emoji: '🎓' },
  job_application: { label: 'Job Application', emoji: '💼' },
  contact_added: { label: 'Contact Added', emoji: '📞' },
  grocery_item: { label: 'Grocery Item Added', emoji: '🛒' },
  sticky_note: { label: 'Sticky Note', emoji: '📝' },
  vision_board_item: { label: 'Vision Board Item', emoji: '🌟' },
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