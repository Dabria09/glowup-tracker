import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Save, RotateCcw, Star, Users, TrendingUp, Crown, Zap } from 'lucide-react';

const RANK_ICONS = {
  seed: '🌱',
  sprout: '🌿',
  bloom: '🌸',
  radiant: '✨',
  luminary: '🌟',
};

const RANK_COLORS = {
  seed: '#9ca3af',
  sprout: '#86efac',
  bloom: '#f472b6',
  radiant: '#fbbf24',
  luminary: '#a855f7',
};

export default function MentorRankSettings() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [editedConfigs, setEditedConfigs] = useState({});

  useEffect(() => { loadConfigs(); }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const existing = await base44.entities.MentorRankConfig.list();
      if (existing.length === 0) {
        // Initialize default configs
        const defaults = [
          { rank_tier: 'seed', min_sessions: 0, min_rating: 0, description: 'New mentor', is_active: true },
          { rank_tier: 'sprout', min_sessions: 3, min_rating: 0, description: '3+ sessions', is_active: true },
          { rank_tier: 'bloom', min_sessions: 6, min_rating: 0, description: '6+ sessions', is_active: true },
          { rank_tier: 'radiant', min_sessions: 16, min_rating: 4.5, description: '16+ sessions, 4.5★', is_active: true },
          { rank_tier: 'luminary', min_sessions: 31, min_rating: 4.8, description: '31+ sessions, 4.8★', is_active: true },
        ];
        const me = await base44.auth.me();
        const created = await base44.entities.MentorRankConfig.bulkCreate(
          defaults.map(d => ({ ...d, updated_by: me.email, updated_date: new Date().toISOString() }))
        );
        setConfigs(created);
        created.forEach(c => setEditedConfigs(prev => ({ ...prev, [c.rank_tier]: c })));
      } else {
        setConfigs(existing);
        existing.forEach(c => setEditedConfigs(prev => ({ ...prev, [c.rank_tier]: c })));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const updateField = (tier, field, value) => {
    setEditedConfigs(prev => ({
      ...prev,
      [tier]: { ...prev[tier], [field]: field === 'min_sessions' || field === 'min_rating' ? Number(value) : value },
    }));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const me = await base44.auth.me();
      const updates = Object.values(editedConfigs).map(c => ({
        ...c,
        updated_by: me.email,
        updated_date: new Date().toISOString(),
      }));
      
      for (const update of updates) {
        const existing = configs.find(c => c.rank_tier === update.rank_tier);
        if (existing) {
          await base44.entities.MentorRankConfig.update(existing.id, update);
        }
      }
      
      setSaveSuccess('✅ Rank thresholds saved! Changes will apply to next tier update.');
      setTimeout(() => setSaveSuccess(''), 4000);
      loadConfigs();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const resetToDefaults = async () => {
    const defaults = {
      seed: { min_sessions: 0, min_rating: 0, description: 'New mentor' },
      sprout: { min_sessions: 3, min_rating: 0, description: '3+ sessions' },
      bloom: { min_sessions: 6, min_rating: 0, description: '6+ sessions' },
      radiant: { min_sessions: 16, min_rating: 4.5, description: '16+ sessions, 4.5★' },
      luminary: { min_sessions: 31, min_rating: 4.8, description: '31+ sessions, 4.8★' },
    };
    setEditedConfigs(prev => {
      const updated = { ...prev };
      Object.keys(defaults).forEach(tier => {
        updated[tier] = { ...updated[tier], ...defaults[tier] };
      });
      return updated;
    });
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none text-sm focus:border-purple-500/50 transition";

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="rounded-2xl p-4 border-2" style={{ background: 'rgba(168,85,247,0.08)', border: '2px solid rgba(168,85,247,0.35)' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)' }}>
            <Crown size={20} className="text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-purple-400">👑 Mentor Rank Thresholds</p>
            <p className="text-xs text-gray-400 mt-1">
              Configure the session count and rating requirements for each mentor rank. Changes take effect immediately for future tier updates.
            </p>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="px-4 py-3 rounded-2xl text-xs font-semibold text-emerald-400" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
          {saveSuccess}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={saveAll}
          disabled={saving}
          className="flex-1 py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }}
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Save size={16} /> Save All Changes</>}
        </button>
        <button
          onClick={resetToDefaults}
          className="px-6 py-3 rounded-2xl font-bold text-white text-sm flex items-center gap-2"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {['seed', 'sprout', 'bloom', 'radiant', 'luminary'].map(tier => {
            const config = editedConfigs[tier] || {};
            const icon = RANK_ICONS[tier];
            const color = RANK_COLORS[tier];
            
            return (
              <div key={tier} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}40` }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                    {icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white capitalize">{tier} Rank</p>
                    <p className="text-[10px] text-gray-500">{config.description || 'No description'}</p>
                  </div>
                  {configs.find(c => c.rank_tier === tier)?.updated_date && (
                    <p className="text-[10px] text-gray-600">
                      Updated {new Date(configs.find(c => c.rank_tier === tier).updated_date).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 mb-1 block flex items-center gap-1">
                      <Users size={8} /> Minimum Sessions
                    </label>
                    <input
                      type="number"
                      value={config.min_sessions ?? 0}
                      onChange={e => updateField(tier, 'min_sessions', e.target.value)}
                      className={inputCls}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 mb-1 block flex items-center gap-1">
                      <Star size={8} /> Minimum Rating
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.min_rating ?? 0}
                      onChange={e => updateField(tier, 'min_rating', e.target.value)}
                      className={inputCls}
                      min="0"
                      max="5"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-[10px] text-gray-400 mb-1 block flex items-center gap-1">
                    <TrendingUp size={8} /> Description (shown to mentors)
                  </label>
                  <input
                    value={config.description || ''}
                    onChange={e => updateField(tier, 'description', e.target.value)}
                    placeholder="e.g. '16+ sessions, 4.5★ average'"
                    className={inputCls}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.is_active !== false}
                      onChange={e => updateField(tier, 'is_active', e.target.checked)}
                      className="w-4 h-4 accent-purple-500"
                    />
                    <span className="text-xs text-gray-400">Active (mentors can achieve this rank)</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Card */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="text-xs font-bold text-gray-400 mb-3">📊 How It Works</p>
        <div className="space-y-2 text-xs text-gray-400">
          <p>• Mentors are automatically promoted when they meet BOTH requirements (sessions AND rating)</p>
          <p>• The <span className="text-purple-400 font-semibold">updateMentorTiers</span> function uses these thresholds</p>
          <p>• Run the tier update manually or via the monthly automation</p>
          <p>• Changes apply to future updates only (not retroactive)</p>
        </div>
      </div>
    </div>
  );
}