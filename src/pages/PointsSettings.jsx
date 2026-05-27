import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { POINT_VALUES } from '@/lib/pointsHelper';
import { RefreshCw } from 'lucide-react';

const ACTIVITY_LABELS = {
  daily_checkin:      { label: 'Daily Check-In', emoji: '✦', category: 'Daily Engagement' },
  grocery_item:       { label: 'Grocery Item Added', emoji: '🛒', category: 'Daily Engagement' },
  scholarship_saved:  { label: 'Scholarship Saved', emoji: '🎓', category: 'Daily Engagement' },
  shoutout_given:     { label: 'Shout Out Given', emoji: '📣', category: 'Daily Engagement' },
  contact_added:      { label: 'Contact Added', emoji: '📞', category: 'Daily Engagement' },
  diary_entry:        { label: 'Diary Entry', emoji: '📔', category: 'Content & Creativity' },
  sticky_note:        { label: 'Sticky Note', emoji: '📝', category: 'Content & Creativity' },
  glow_feed_post:     { label: 'Glow Feed Post', emoji: '📸', category: 'Content & Creativity' },
  glow_board_post:    { label: 'Glow Board Post', emoji: '🖼️', category: 'Content & Creativity' },
  community_post:     { label: 'Community Post', emoji: '💬', category: 'Content & Creativity' },
  vision_board_item:  { label: 'Vision Board Item', emoji: '✨', category: 'Content & Creativity' },
  recipe_added:       { label: 'Recipe Added', emoji: '🍳', category: 'Content & Creativity' },
  kitchen_post:       { label: 'Kitchen Post', emoji: '🥘', category: 'Content & Creativity' },
  book_club:          { label: 'Book Club Activity', emoji: '📚', category: 'Content & Creativity' },
  fitness_log:        { label: 'Fitness Log', emoji: '💪', category: 'Health & Wellness' },
  meal_plan_created:  { label: 'Meal Plan Created', emoji: '🥗', category: 'Health & Wellness' },
  cycle_tracked:      { label: 'Cycle Tracked', emoji: '🌸', category: 'Health & Wellness' },
  calm_corner:        { label: 'Calm Corner Session', emoji: '🧘', category: 'Health & Wellness' },
  spiritual_habit:    { label: 'Spiritual Habit', emoji: '🙏', category: 'Health & Wellness' },
  gratitude_entry:    { label: 'Gratitude Entry', emoji: '💖', category: 'Health & Wellness' },
  daily_task:         { label: 'Daily Task Completed', emoji: '✅', category: 'Growth & Learning' },
  savings_goal:       { label: 'Savings Goal Set', emoji: '💰', category: 'Growth & Learning' },
  job_application:    { label: 'Job Application', emoji: '💼', category: 'Growth & Learning' },
  homework_task:      { label: 'Homework Task', emoji: '📖', category: 'Growth & Learning' },
  lesson_completed:   { label: 'Lesson Completed', emoji: '🎓', category: 'Growth & Learning' },
  challenge_day:      { label: 'Challenge Day', emoji: '🔥', category: 'Challenges' },
  weekly_challenge:   { label: 'Weekly Challenge', emoji: '🏅', category: 'Challenges' },
  glow_up_challenge:  { label: 'Glow Up Challenge', emoji: '👑', category: 'Challenges' },
  mentor_session:     { label: 'Mentor Session', emoji: '🤝', category: 'Challenges' },
};

const CATEGORIES = ['Daily Engagement', 'Content & Creativity', 'Health & Wellness', 'Growth & Learning', 'Challenges'];

export default function PointsSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [values, setValues] = useState({ ...POINT_VALUES });
  const [configId, setConfigId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      if (u.role !== 'admin') { navigate('/dashboard'); return; }
      setUser(u);
      const configs = await base44.entities.PointsConfig.list();
      if (configs.length > 0) {
        setConfigId(configs[0].id);
        try {
          const parsed = JSON.parse(configs[0].config_json);
          setValues({ ...POINT_VALUES, ...parsed });
        } catch {}
      }
    }).catch(() => navigate('/'));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (configId) {
        await base44.entities.PointsConfig.update(configId, { config_json: JSON.stringify(values) });
      } else {
        const rec = await base44.entities.PointsConfig.create({ config_json: JSON.stringify(values) });
        setConfigId(rec.id);
      }
      if (typeof window !== 'undefined') window.__pointsConfigCache = null;
      toast.success('Point values saved! ✨');
    } catch {
      toast.error('Failed to save. Please try again.');
    }
    setSaving(false);
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await base44.functions.invoke('recalculateTotals', {});
      toast.success(`Done! Updated ${res.data.users_updated} user totals. 🎉`);
    } catch (err) {
      toast.error('Recalculation failed: ' + (err.message || 'Unknown error'));
    }
    setRecalculating(false);
  };

  const handleReset = () => {
    setValues({ ...POINT_VALUES });
    toast.info('Reset to default values. Hit Save to apply.');
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-16" style={{ backgroundColor: '#080810' }}>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='%23fff'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 px-4 pt-6 pb-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Points Settings ⚙️</h1>
            <p className="text-xs text-gray-400">Customize how many points each activity awards</p>
          </div>
        </div>

        {/* Recalculate banner */}
        <div className="mb-6 rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
          style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)' }}>
          <div>
            <p className="text-sm font-bold text-purple-300">Recalculate All User Totals</p>
            <p className="text-xs text-gray-400 mt-0.5">After saving new values, apply them retroactively to every user's score based on their full history.</p>
          </div>
          <button onClick={handleRecalculate} disabled={recalculating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white flex-shrink-0 disabled:opacity-50 transition"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
            <RefreshCw size={14} className={recalculating ? 'animate-spin' : ''} />
            {recalculating ? 'Working…' : 'Recalculate'}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-8 justify-end">
          <button onClick={handleRecalculate} disabled={recalculating}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-purple-300 border border-purple-500/30 hover:bg-purple-500/10 transition disabled:opacity-50">
            <RefreshCw size={14} className={recalculating ? 'animate-spin' : ''} />
            {recalculating ? 'Recalculating…' : 'Recalculate Totals'}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-white disabled:opacity-50 transition"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
            <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {CATEGORIES.map(cat => {
          const entries = Object.entries(ACTIVITY_LABELS).filter(([, v]) => v.category === cat);
          return (
            <div key={cat} className="mb-8">
              <p className="text-xs font-bold tracking-widest text-gray-500 mb-3 uppercase">{cat}</p>
              <div className="space-y-3">
                {entries.map(([action, meta]) => (
                  <div key={action} className="flex items-center gap-4 px-4 py-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="text-xl w-8 text-center flex-shrink-0">{meta.emoji}</span>
                    <span className="flex-1 text-sm text-gray-200">{meta.label}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={values[action] ?? 0}
                        onChange={e => setValues(prev => ({ ...prev, [action]: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="w-20 text-center rounded-xl px-3 py-2 text-sm font-bold text-yellow-400 outline-none"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
                      />
                      <span className="text-xs text-gray-500 w-6">pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-50 transition"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
          {saving ? 'Saving…' : 'Save All Changes ✨'}
        </button>
      </div>
    </div>
  );
}