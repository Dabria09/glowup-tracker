import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';

const WORKOUT_TYPES = [
  { id: 'cardio', label: 'Cardio', emoji: '🏃‍♀️' },
  { id: 'strength', label: 'Strength', emoji: '💪' },
  { id: 'yoga', label: 'Yoga', emoji: '🧘‍♀️' },
  { id: 'dance', label: 'Dance', emoji: '💃' },
  { id: 'walk', label: 'Walk', emoji: '🚶‍♀️' },
  { id: 'stretch', label: 'Stretch', emoji: '🤸‍♀️' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'swim', label: 'Swim', emoji: '🏊‍♀️' },
];

const TIPS = [
  { emoji: '💧', text: 'Drink water before, during, and after workouts' },
  { emoji: '😴', text: 'Rest days are part of your glow-up — your body repairs during rest' },
  { emoji: '🎵', text: 'Create a hype playlist to power through tough workouts' },
  { emoji: '🧘‍♀️', text: 'Even 10 minutes of movement counts — consistency beats perfection' },
  { emoji: '🥗', text: 'Fuel your body with protein and veggies after working out' },
];

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const todayLabel = () => new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

export default function FitnessTracker() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [todayLog, setTodayLog] = useState(null);

  const [workoutType, setWorkoutType] = useState([]);
  const [minutes, setMinutes] = useState('');
  const [calories, setCalories] = useState('');
  const [steps, setSteps] = useState('');
  const [waterOz, setWaterOz] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const allLogs = await base44.entities.FitnessLog.filter({ user_email: u.email });
      setLogs(allLogs);
      const tlog = allLogs.find(l => l.log_date === today());
      if (tlog) {
        setTodayLog(tlog);
        setWorkoutType(tlog.workout_type ? tlog.workout_type.split(',') : []);
        setMinutes(tlog.minutes || '');
        setCalories(tlog.calories || '');
        setSteps(tlog.steps || '');
        setWaterOz(tlog.water_oz || 0);
        setNotes(tlog.notes || '');
      }
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  // Stats from last 7 days
  const last7 = logs.filter(l => {
    const d = new Date(l.log_date);
    const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });
  const activeDays = last7.length;
  const totalMinutes = last7.reduce((s, l) => s + (l.minutes || 0), 0);
  const totalSteps = last7.reduce((s, l) => s + (l.steps || 0), 0);
  const totalWater = last7.reduce((s, l) => s + (l.water_oz || 0), 0);

  const handleSave = async () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    setSaving(true);
    setSaveError('');
    const data = {
      user_email: user.email,
      log_date: today(),
      workout_type: workoutType.join(','),
      minutes: Number(minutes) || 0,
      calories: Number(calories) || 0,
      steps: Number(steps) || 0,
      water_oz: waterOz,
      notes,
    };
    try {
      if (todayLog) {
        await base44.entities.FitnessLog.update(todayLog.id, data);
        setLogs(prev => prev.map(l => l.id === todayLog.id ? { ...l, ...data } : l));
      } else {
        const created = await base44.entities.FitnessLog.create(data);
        setTodayLog(created);
        setLogs(prev => [...prev, created]);
      }
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setSaving(false);
      setSaveError('Failed to save. Please try again.');
    }
  };

  return (
    <div className="min-h-screen text-white pb-24" style={{ backgroundColor: '#0d0d0d' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/discover')} className="text-gray-400 hover:text-white">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Fitness Tracker</h1>
            <p className="text-xs text-gray-400">{todayLabel()}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs font-bold">
          <span>🏅</span><span className="text-yellow-400">15 pts</span>
        </div>
      </div>

      <div className="px-4 mt-3 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Active Days', value: activeDays, suffix: '/7', color: 'text-pink-400' },
            { label: 'Workout Time', value: totalMinutes, suffix: ' min', color: 'text-pink-400' },
            { label: 'Total Steps', value: totalSteps >= 1000 ? (totalSteps / 1000).toFixed(1) + 'k' : totalSteps, suffix: '', color: 'text-purple-400' },
            { label: 'Water (7 days)', value: totalWater, suffix: ' oz', color: 'text-purple-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900/80 border border-white/5 rounded-2xl p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}<span className="text-sm text-gray-400">{stat.suffix}</span></p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Today's Log */}
        <div className="bg-gray-900/80 border border-white/5 rounded-2xl p-4">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <span>📅</span> Today's Log
          </h2>

          {/* Workout Type */}
          <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">WORKOUT TYPE</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {WORKOUT_TYPES.map(w => (
              <button
                key={w.id}
                onClick={() => setWorkoutType(prev => prev.includes(w.id) ? prev.filter(x => x !== w.id) : [...prev, w.id])}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition ${
                  workoutType.includes(w.id)
                    ? 'border-pink-500 bg-pink-500/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className="text-2xl">{w.emoji}</span>
                <span className="text-[10px] text-gray-300">{w.label}</span>
              </button>
            ))}
          </div>

          {/* Minutes & Calories */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs font-bold tracking-widest text-gray-500 mb-2">MINUTES</p>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 gap-2">
                <span>🔥</span>
                <input
                  type="number"
                  value={minutes}
                  onChange={e => setMinutes(e.target.value)}
                  placeholder="0"
                  className="bg-transparent text-white outline-none w-full text-sm"
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-gray-500 mb-2">CALORIES</p>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 gap-2">
                <span>⚡</span>
                <input
                  type="number"
                  value={calories}
                  onChange={e => setCalories(e.target.value)}
                  placeholder="0"
                  className="bg-transparent text-white outline-none w-full text-sm"
                />
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-bold tracking-widest text-gray-500">👟 STEPS</p>
              <p className="text-xs text-gray-500">Goal: 8,000</p>
            </div>
            <input
              type="number"
              value={steps}
              onChange={e => setSteps(e.target.value)}
              placeholder="0"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none"
            />
            {steps > 0 && (
              <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" style={{ width: `${Math.min((steps / 8000) * 100, 100)}%` }} />
              </div>
            )}
          </div>

          {/* Water Intake */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-bold tracking-widest text-gray-500">💧 WATER INTAKE</p>
              <p className="text-xs text-gray-500">Goal: 64 oz</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-center text-sm text-white mb-2">
              {waterOz} oz / 64 oz
            </div>
            {waterOz > 0 && (
              <div className="mb-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${Math.min((waterOz / 64) * 100, 100)}%` }} />
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setWaterOz(w => Math.max(0, w - 8))}
                className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition"
              >
                − 8 oz
              </button>
              <button
                onClick={() => setWaterOz(w => w + 8)}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition"
              >
                + 8 oz
              </button>
              <button
                onClick={() => setWaterOz(w => w + 16)}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition"
              >
                + 16 oz
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <p className="text-xs font-bold tracking-widest text-gray-500 mb-2">NOTES (OPTIONAL)</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How did you feel? What did you do?"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none resize-none placeholder-gray-600"
            />
          </div>

          {/* Save Button */}
          {saveError && <p className="text-red-400 text-xs text-center mb-2">{saveError}</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-60"
          >
            {saving ? 'Saving...' : saved ? '✅ Saved!' : '✅ Save Today\'s Log'}
          </button>
        </div>

        {/* Glow Fitness Tips */}
        <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/30 border border-white/5 rounded-2xl p-4 mb-4">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <span>💜</span> Glow Fitness Tips
          </h2>
          <div className="space-y-3">
            {TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{tip.emoji}</span>
                <p className="text-sm text-gray-300 leading-snug">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Past Logs */}
        {logs.filter(l => l.log_date !== today()).length > 0 && (
          <div className="bg-gray-900/80 border border-white/5 rounded-2xl p-4 mb-4">
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <span>📋</span> Past Logs
            </h2>
            <div className="space-y-3">
              {logs
                .filter(l => l.log_date !== today())
                .sort((a, b) => b.log_date.localeCompare(a.log_date))
                .map(log => (
                  <div key={log.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">
                          {new Date(log.log_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {log.workout_type && log.workout_type.split(',').filter(Boolean).map(t => {
                            const w = WORKOUT_TYPES.find(x => x.id === t);
                            return w ? <span key={t} className="text-xs bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full">{w.emoji} {w.label}</span> : null;
                          })}
                        </div>
                        <div className="flex gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
                          {log.minutes > 0 && <span>🔥 {log.minutes} min</span>}
                          {log.steps > 0 && <span>👟 {Number(log.steps).toLocaleString()} steps</span>}
                          {log.water_oz > 0 && <span>💧 {log.water_oz} oz</span>}
                          {log.calories > 0 && <span>⚡ {log.calories} cal</span>}
                        </div>
                        {log.notes && <p className="text-xs text-gray-500 mt-1 truncate">{log.notes}</p>}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setTodayLog(log);
                            setWorkoutType(log.workout_type ? log.workout_type.split(',') : []);
                            setMinutes(log.minutes || '');
                            setCalories(log.calories || '');
                            setSteps(log.steps || '');
                            setWaterOz(log.water_oz || 0);
                            setNotes(log.notes || '');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-xs px-3 py-1.5 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm('Delete this log?')) return;
                            setDeletingId(log.id);
                            await base44.entities.FitnessLog.delete(log.id);
                            setLogs(prev => prev.filter(l => l.id !== log.id));
                            setDeletingId(null);
                          }}
                          disabled={deletingId === log.id}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-900/40 text-red-400 hover:bg-red-900/60 transition disabled:opacity-50"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav active="discover" />
    </div>
  );
}