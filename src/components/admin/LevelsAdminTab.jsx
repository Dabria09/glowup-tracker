import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Edit3, Zap } from 'lucide-react';

const DEFAULTS = [
  { level_number: 1, name: 'Glow Seedling', emoji: '🌱', min_points: 0, max_points: 100, unlock_reward: 'Pink Bloom Badge', unlock_emoji: '🌸', unlock_type: 'badge', description: 'Your glow journey begins here.', streak_requirement: 0, badge_requirement: 0, challenge_requirement: 0 },
  { level_number: 2, name: 'Glow Budding', emoji: '🌷', min_points: 100, max_points: 250, unlock_reward: 'Golden Glow Frame', unlock_emoji: '🖼️', unlock_type: 'frame', description: 'You are starting to bloom.', streak_requirement: 3, badge_requirement: 0, challenge_requirement: 0 },
  { level_number: 3, name: 'Glow Blooming', emoji: '🌸', min_points: 250, max_points: 500, unlock_reward: 'Star Queen Theme', unlock_emoji: '⭐', unlock_type: 'theme', description: 'Your glow is growing stronger.', streak_requirement: 7, badge_requirement: 1, challenge_requirement: 0 },
  { level_number: 4, name: 'Glow Rising', emoji: '⭐', min_points: 500, max_points: 800, unlock_reward: 'Diamond Profile Banner', unlock_emoji: '💎', unlock_type: 'banner', description: 'You are rising to your power.', streak_requirement: 14, badge_requirement: 2, challenge_requirement: 1 },
  { level_number: 5, name: 'Glow Thriving', emoji: '👑', min_points: 800, max_points: 1200, unlock_reward: 'Crown Avatar Ring', unlock_emoji: '👑', unlock_type: 'avatar_item', description: 'You are thriving in your glow era.', streak_requirement: 21, badge_requirement: 3, challenge_requirement: 2 },
  { level_number: 6, name: 'Glow Queen', emoji: '✨', min_points: 1200, max_points: 99999, unlock_reward: 'Glow Legend Background', unlock_emoji: '✨', unlock_type: 'background', description: 'You are a Glow Queen. Nothing can stop you.', streak_requirement: 30, badge_requirement: 5, challenge_requirement: 3 },
];

const EMPTY = { level_number: 1, name: '', emoji: '🌟', min_points: 0, max_points: 100, unlock_reward: '', unlock_emoji: '🎁', unlock_type: 'badge', description: '', streak_requirement: 0, badge_requirement: 0, challenge_requirement: 0, is_active: true };

const UNLOCK_TYPES = ['badge','frame','theme','banner','background','avatar_item'];

export default function LevelsAdminTab() {
  const [levels, setLevels] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.GlowLevel.list();
    setLevels(data.sort((a, b) => (a.level_number || 0) - (b.level_number || 0)));
    setLoading(false);
  };

  const seedDefaults = async () => {
    if (!confirm('This will add the default 6 Glow Levels. Continue?')) return;
    setSeeding(true);
    for (const lvl of DEFAULTS) {
      await base44.entities.GlowLevel.create({ ...lvl, is_active: true });
    }
    await load();
    setSeeding(false);
  };

  const save = async () => {
    setSaving(true);
    if (editId) {
      await base44.entities.GlowLevel.update(editId, form);
    } else {
      await base44.entities.GlowLevel.create(form);
    }
    setForm(EMPTY);
    setEditId(null);
    setShowForm(false);
    await load();
    setSaving(false);
  };

  const deleteLevel = async (id) => {
    if (!confirm('Delete this level?')) return;
    await base44.entities.GlowLevel.delete(id);
    setLevels(levels.filter(l => l.id !== id));
  };

  const startEdit = (lvl) => {
    setForm({ ...lvl });
    setEditId(lvl.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: key.includes('points') || key.includes('requirement') || key === 'level_number' ? Number(e.target.value) : e.target.value }));

  if (loading) return <div className="text-center py-8 text-gray-400">Loading levels...</div>;

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-white">Glow Level System</h2>
        <div className="flex gap-2">
          {levels.length === 0 && (
            <button onClick={seedDefaults} disabled={seeding} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-white" style={{ background: 'rgba(241,182,16,0.2)', border: '1px solid rgba(241,182,16,0.3)', color: '#fdcd2d' }}>
              <Zap size={12} /> {seeding ? 'Seeding...' : 'Seed Defaults'}
            </button>
          )}
          <button onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(!showForm); }}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
            <Plus size={14} /> {showForm ? 'Cancel' : 'New Level'}
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-4">Configure each Glow Level — points required, rewards unlocked, and requirements.</p>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl p-4 mb-6 space-y-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="text-sm font-bold text-white">{editId ? 'Edit Level' : 'Create Level'}</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Level Number</p>
              <input type="number" value={form.level_number} onChange={f('level_number')} className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Emoji</p>
              <input value={form.emoji} onChange={f('emoji')} className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">Level Name *</p>
            <input value={form.name} onChange={f('name')} placeholder="e.g. Glow Blooming" className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">Description</p>
            <input value={form.description} onChange={f('description')} placeholder="Short description of this level..." className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
          </div>

          <p className="text-xs font-bold text-yellow-400">Points Range</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Min Points</p>
              <input type="number" value={form.min_points} onChange={f('min_points')} className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Max Points</p>
              <input type="number" value={form.max_points} onChange={f('max_points')} className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
            </div>
          </div>

          <p className="text-xs font-bold text-pink-400">Unlock Reward</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Reward Name</p>
              <input value={form.unlock_reward} onChange={f('unlock_reward')} placeholder="Pink Glitter Frame" className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Reward Emoji</p>
              <input value={form.unlock_emoji} onChange={f('unlock_emoji')} className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">Reward Type</p>
            <select value={form.unlock_type} onChange={f('unlock_type')} className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              {UNLOCK_TYPES.map(t => <option key={t} value={t} style={{ background: '#1a0a18' }}>{t}</option>)}
            </select>
          </div>

          <p className="text-xs font-bold text-purple-400">Additional Requirements</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Streak Days</p>
              <input type="number" value={form.streak_requirement} onChange={f('streak_requirement')} className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Badges</p>
              <input type="number" value={form.badge_requirement} onChange={f('badge_requirement')} className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Challenges</p>
              <input type="number" value={form.challenge_requirement} onChange={f('challenge_requirement')} className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
            </div>
          </div>

          <button onClick={save} disabled={saving || !form.name}
            className="w-full py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: saving ? '#555' : 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
            {saving ? 'Saving...' : editId ? 'Update Level' : 'Create Level'}
          </button>
        </div>
      )}

      {/* Levels List */}
      <div className="space-y-3">
        {levels.length === 0 && (
          <div className="text-center py-10 rounded-2xl" style={{ border: '1px dashed rgba(255,255,255,0.15)' }}>
            <p className="text-2xl mb-2">🌱</p>
            <p className="text-sm text-gray-400 mb-4">No levels configured yet.</p>
            <button onClick={seedDefaults} disabled={seeding} className="px-6 py-2 rounded-full text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
              {seeding ? 'Seeding...' : '✨ Seed Default 6 Levels'}
            </button>
          </div>
        )}
        {levels.map(lvl => (
          <div key={lvl.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }}>{lvl.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-bold text-white text-sm">Lv.{lvl.level_number} · {lvl.name}</p>
                  {!lvl.is_active && <span className="text-xs text-gray-600 font-bold">INACTIVE</span>}
                </div>
                <p className="text-xs text-gray-400">{lvl.min_points.toLocaleString()} – {lvl.max_points >= 99999 ? '∞' : lvl.max_points.toLocaleString()} pts</p>
                {lvl.unlock_reward && (
                  <p className="text-xs text-yellow-400 mt-0.5">{lvl.unlock_emoji} Unlocks: {lvl.unlock_reward} <span className="text-gray-500">({lvl.unlock_type})</span></p>
                )}
                {(lvl.streak_requirement > 0 || lvl.badge_requirement > 0 || lvl.challenge_requirement > 0) && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Req: {lvl.streak_requirement > 0 ? `🔥${lvl.streak_requirement} streak ` : ''}{lvl.badge_requirement > 0 ? `⭐${lvl.badge_requirement} badges ` : ''}{lvl.challenge_requirement > 0 ? `🏆${lvl.challenge_requirement} challenges` : ''}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => startEdit(lvl)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <Edit3 size={13} className="text-gray-300" />
                </button>
                <button onClick={() => deleteLevel(lvl.id)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}