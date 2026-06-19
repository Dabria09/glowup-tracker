import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, Settings, Save, X, RotateCcw, Plus, Trash2, Crown } from 'lucide-react';

const RANK_ICONS = {
  seed: '🌱',
  sprout: '🌿',
  bloom: '🌸',
  radiant: '✨',
  luminary: '🌟',
};

const RANK_COLORS = {
  seed: { color: '#9ca3af', bg: 'rgba(156,163,175,0.15)', border: 'rgba(156,163,175,0.3)' },
  sprout: { color: '#86efac', bg: 'rgba(134,239,172,0.15)', border: 'rgba(134,239,172,0.3)' },
  bloom: { color: '#f472b6', bg: 'rgba(244,114,182,0.15)', border: 'rgba(244,114,182,0.3)' },
  radiant: { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)' },
  luminary: { color: '#a855f7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)' },
};

export default function MentorRankSettings() {
  const [configs, setConfigs] = useState([]);
  const [editedConfigs, setEditedConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  // If not showing modal, render a button to open it
  if (!showModal) {
    return (
      <div className="pb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Mentor Rank Requirements</h2>
            <p className="text-xs text-gray-400">Configure session counts and rating thresholds for each tier</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }}
          >
            <Settings size={16} /> Configure Ranks
          </button>
        </div>
        <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Crown size={48} className="text-purple-400 mx-auto mb-4" />
          <p className="text-sm text-gray-400 mb-4">Configure mentor rank requirements and thresholds</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 rounded-full text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }}
          >
            Open Rank Settings
          </button>
        </div>
      </div>
    );
  }

  const loadConfigs = async () => {
    try {
      const list = await base44.entities.MentorRankConfig.list('-min_sessions');
      setConfigs(list);
      const edits = {};
      list.forEach(c => {
        edits[c.id] = {
          min_sessions: c.min_sessions,
          min_rating: c.min_rating,
          description: c.description,
        };
      });
      setEditedConfigs(edits);
    } catch (e) {
      console.error('Failed to load rank configs:', e);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const me = await base44.auth.me();
      const updates = Object.entries(editedConfigs).map(async ([id, data]) => {
        await base44.entities.MentorRankConfig.update(id, {
          ...data,
          updated_by: me.email,
          updated_date: new Date().toISOString(),
        });
      });
      await Promise.all(updates);
      
      // Auto-trigger tier recalculation
      await base44.functions.invoke('updateMentorTiers', {});
      
      alert('✅ Rank requirements saved! Mentor tiers are being recalculated.');
      setShowModal(false);
    } catch (e) {
      console.error('Save failed:', e);
      alert('Failed to save: ' + e.message);
    }
    setSaving(false);
  };

  const handleAddTier = async () => {
    const newTierName = prompt('Enter new tier name (e.g., master, legend):');
    if (!newTierName) return;
    
    const tierKey = newTierName.toLowerCase().trim().replace(/\s+/g, '_');
    if (!tierKey) return;
    
    try {
      const me = await base44.auth.me();
      const newConfig = await base44.entities.MentorRankConfig.create({
        rank_tier: tierKey,
        min_sessions: 50,
        min_rating: 4.5,
        description: `Custom tier: ${newTierName}`,
        is_active: true,
        updated_by: me.email,
        updated_date: new Date().toISOString(),
      });
      
      setConfigs([...configs, newConfig]);
      setEditedConfigs(prev => ({
        ...prev,
        [newConfig.id]: {
          min_sessions: 50,
          min_rating: 4.5,
          description: `Custom tier: ${newTierName}`,
        },
      }));
      alert(`✅ Added "${newTierName}" tier! Configure its requirements below.`);
    } catch (e) {
      alert('Failed to add tier: ' + e.message);
    }
  };

  const handleDeleteTier = async (config) => {
    if (!confirm(`Delete "${config.rank_tier}" tier? This cannot be undone.`)) return;
    
    try {
      await base44.entities.MentorRankConfig.delete(config.id);
      setConfigs(configs.filter(c => c.id !== config.id));
      setEditedConfigs(prev => {
        const next = { ...prev };
        delete next[config.id];
        return next;
      });
      alert('✅ Tier deleted!');
    } catch (e) {
      alert('Failed to delete: ' + e.message);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all rank requirements to defaults?')) return;
    const defaults = {
      seed: { min_sessions: 0, min_rating: 0, description: 'New mentor starting their journey' },
      sprout: { min_sessions: 3, min_rating: 0, description: 'Completed 3+ sessions' },
      bloom: { min_sessions: 6, min_rating: 0, description: 'Completed 6+ sessions' },
      radiant: { min_sessions: 16, min_rating: 4.5, description: 'Completed 16+ sessions with 4.5+ average rating' },
      luminary: { min_sessions: 31, min_rating: 4.8, description: 'Completed 31+ sessions with 4.8+ average rating' },
    };
    
    setSaving(true);
    try {
      const me = await base44.auth.me();
      const updates = configs.map(async c => {
        const def = defaults[c.rank_tier];
        if (def) {
          await base44.entities.MentorRankConfig.update(c.id, {
            ...def,
            updated_by: me.email,
            updated_date: new Date().toISOString(),
          });
          setEditedConfigs(prev => ({
            ...prev,
            [c.id]: def,
          }));
        }
      });
      await Promise.all(updates);
      alert('✅ Reset to default requirements!');
    } catch (e) {
      alert('Reset failed: ' + e.message);
    }
    setSaving(false);
  };

  const updateEdit = (id, field, value) => {
    setEditedConfigs(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: field === 'min_sessions' || field === 'min_rating' ? parseFloat(value) || 0 : value,
      },
    }));
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 outline-none text-sm";

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between sticky top-0" style={{ background: '#1a0a2e', borderColor: 'rgba(255,255,255,0.1)' }}>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings size={18} className="text-purple-400" />
              Mentor Rank Requirements
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Configure session counts and rating thresholds for each tier</p>
          </div>
          <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Config Cards */}
        <div className="p-4 space-y-3">
          {configs.sort((a, b) => a.min_sessions - b.min_sessions).map(config => {
            const edit = editedConfigs[config.id] || {};
            const meta = RANK_COLORS[config.rank_tier] || RANK_COLORS.seed;
            const icon = RANK_ICONS[config.rank_tier] || '🌱';
            const isCustom = !RANK_ICONS[config.rank_tier];
            
            return (
              <div key={config.id} className="rounded-xl p-4" style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <h3 className="text-sm font-bold text-white capitalize">{config.rank_tier.replace(/_/g, ' ')} {isCustom && '(Custom)'}</h3>
                  </div>
                  {isCustom && (
                    <button
                      onClick={() => handleDeleteTier(config)}
                      className="text-gray-400 hover:text-red-400 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 block">Min Sessions *</label>
                    <input
                      type="number"
                      min="0"
                      value={edit.min_sessions ?? config.min_sessions}
                      onChange={e => updateEdit(config.id, 'min_sessions', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 block">Min Rating *</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={edit.min_rating ?? config.min_rating}
                      onChange={e => updateEdit(config.id, 'min_rating', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
                
                <div className="mb-2">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 block">Description</label>
                  <input
                    type="text"
                    value={edit.description ?? config.description}
                    onChange={e => updateEdit(config.id, 'description', e.target.value)}
                    placeholder="e.g., Completed 6+ sessions"
                    className={inputCls}
                  />
                </div>
              </div>
            );
          })}
          
          {/* Add New Tier Button */}
          <button
            onClick={handleAddTier}
            className="w-full py-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 font-bold text-sm transition"
            style={{ background: 'rgba(168,85,247,0.08)', borderColor: 'rgba(168,85,247,0.4)', color: '#a855f7' }}
          >
            <Plus size={16} /> Add Custom Tier
          </button>
        </div>

        {/* Info Box */}
        <div className="p-4 mx-4 mb-4 rounded-xl" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}>
          <p className="text-xs text-purple-300">
            💡 <strong>How it works:</strong> Mentors are automatically promoted when they meet these requirements. 
            Changes here will trigger an immediate recalculation of all mentor tiers.
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 border-t flex gap-3 sticky bottom-0" style={{ background: '#1a0a2e', borderColor: 'rgba(255,255,255,0.1)' }}>
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <RotateCcw size={16} /> Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }}
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Save size={16} /> Save & Recalculate</>}
          </button>
        </div>
      </div>
    </div>
  );
}