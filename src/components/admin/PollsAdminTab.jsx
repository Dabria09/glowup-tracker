import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Edit3, BarChart2, Calendar, Upload, Copy, X } from 'lucide-react';

const CATEGORIES = ['Confidence','Friendships','Leadership','School','Bullying','Social Media','Relationships','Self-Esteem','Decision Making','Career Exploration','Money','Mental Wellness'];
const AGE_GROUPS = ['All Ages', 'Girls 10-14', 'Teens 15-17', 'Teens 18-20', 'Women 21+'];

const EMPTY = { question: '', category: 'Confidence', response_type: 'multiple_choice', option_a: '', option_b: '', option_c: '', option_d: '', insight_a: '', insight_b: '', insight_c: '', insight_d: '', coaching_tip: '', open_text_prompt: '', points_awarded: 15, scheduled_date: '', age_group: 'All Ages', is_active: true };

// Get default poll points from config
const getDefaultPollPoints = (config) => {
  if (!config) return 15;
  return config.daily_poll || config.daily_checkin || 15;
};

export default function PollsAdminTab() {
  const [polls, setPolls] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [pointsConfig, setPointsConfig] = useState(null);
  
  // New features state
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [createMode, setCreateMode] = useState('single'); // 'single' | 'multiple'
  const [bulkPolls, setBulkPolls] = useState([{ ...EMPTY }]);
  const [csvData, setCsvData] = useState(null);
  const [importStatus, setImportStatus] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [data, configList] = await Promise.all([
      base44.entities.DailyPoll.list('-scheduled_date', 100),
      base44.entities.PointsConfig.list()
    ]);
    setPolls(data);
    if (configList && configList.length > 0) {
      try {
        const config = JSON.parse(configList[0].config_json);
        setPointsConfig(config);
      } catch (e) {
        console.error('Failed to parse points config:', e);
      }
    }
    setLoading(false);
  };

  const save = async () => {
    setSaving(true);
    if (editId) {
      await base44.entities.DailyPoll.update(editId, form);
    } else {
      await base44.entities.DailyPoll.create({ ...form, votes_a: 0, votes_b: 0, votes_c: 0, votes_d: 0, open_text_response_count: 0 });
    }
    setForm(EMPTY);
    setEditId(null);
    setShowForm(false);
    await load();
    setSaving(false);
  };

  const saveBulk = async () => {
    setSaving(true);
    const validPolls = bulkPolls.filter(p => p.question && (p.response_type === 'open_text' || (p.option_a && p.option_b)));
    for (const poll of validPolls) {
      await base44.entities.DailyPoll.create({ ...poll, votes_a: 0, votes_b: 0, votes_c: 0, votes_d: 0, open_text_response_count: 0 });
    }
    setBulkPolls([{ ...EMPTY }]);
    setCreateMode('single');
    await load();
    setSaving(false);
  };

  const deletePoll = async (id) => {
    if (!confirm('Delete this poll?')) return;
    await base44.entities.DailyPoll.delete(id);
    setPolls(polls.filter(p => p.id !== id));
  };

  const startEdit = (poll) => {
    setForm({ ...poll });
    setEditId(poll.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  // CSV Import
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const parsed = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((h, idx) => { obj[h] = values[idx] || ''; });
        if (obj.question && obj.option_a && obj.option_b) {
          parsed.push({
            question: obj.question,
            category: obj.category || 'Confidence',
            option_a: obj.option_a,
            option_b: obj.option_b,
            option_c: obj.option_c || '',
            option_d: obj.option_d || '',
            insight_a: obj.insight_a || '',
            insight_b: obj.insight_b || '',
            insight_c: obj.insight_c || '',
            insight_d: obj.insight_d || '',
            coaching_tip: obj.coaching_tip || '',
            points_awarded: parseInt(obj.points_awarded) || 15,
            scheduled_date: obj.scheduled_date || '',
            age_group: obj.age_group || 'All Ages',
            is_active: obj.is_active !== 'false'
          });
        }
      }
      setCsvData(parsed);
      setImportStatus({ type: 'preview', count: parsed.length });
    };
    reader.readAsText(file);
  };

  const confirmCsvImport = async () => {
    if (!csvData) return;
    setSaving(true);
    for (const poll of csvData) {
      await base44.entities.DailyPoll.create({ ...poll, votes_a: 0, votes_b: 0, votes_c: 0, votes_d: 0 });
    }
    setImportStatus({ type: 'success', count: csvData.length });
    setCsvData(null);
    await load();
    setSaving(false);
    setTimeout(() => setImportStatus(null), 3000);
  };

  // Bulk form helpers
  const addBulkPoll = () => setBulkPolls([...bulkPolls, { ...EMPTY }]);
  const removeBulkPoll = (idx) => setBulkPolls(bulkPolls.filter((_, i) => i !== idx));
  const updateBulkPoll = (idx, field, value) => {
    const updated = [...bulkPolls];
    updated[idx] = { ...updated[idx], [field]: value };
    setBulkPolls(updated);
  };

  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  // Calendar view helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  
  const getPollsForDay = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return polls.filter(p => p.scheduled_date === dateStr);
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Loading polls...</div>;

  return (
    <div className="pb-10">
      {/* Header with view toggles */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-bold text-white">Daily Polls</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-xl overflow-hidden border border-white/15">
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1 ${viewMode === 'list' ? 'bg-pink-600 text-white' : 'bg-white/5 text-gray-400'}`}>
              <BarChart2 size={12} /> List
            </button>
            <button onClick={() => setViewMode('calendar')} className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1 ${viewMode === 'calendar' ? 'bg-pink-600 text-white' : 'bg-white/5 text-gray-400'}`}>
              <Calendar size={12} /> Calendar
            </button>
          </div>
          <button onClick={() => { setCreateMode(createMode === 'single' ? 'multiple' : 'single'); setShowForm(true); setEditId(null); setForm(EMPTY); }}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
            {createMode === 'single' ? <Copy size={14} /> : <Plus size={14} />} {createMode === 'single' ? 'Create Multiple' : 'New Poll'}
          </button>
          <label className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white cursor-pointer"
            style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <Upload size={14} /> Import CSV
            <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Import Status */}
      {importStatus && (
        <div className={`rounded-xl p-3 mb-4 text-sm ${importStatus.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-amber-500/20 border border-amber-500/30 text-amber-300'}`}>
          {importStatus.type === 'success' ? `✓ Imported ${importStatus.count} polls!` : `📊 Found ${importStatus.count} polls in CSV. Ready to import.`}
          {importStatus.type === 'preview' && (
            <button onClick={confirmCsvImport} disabled={saving} className="ml-3 px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-bold">Confirm Import</button>
          )}
        </div>
      )}

      {/* Create Multiple Form */}
      {showForm && createMode === 'multiple' && (
        <div className="rounded-2xl p-4 mb-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">Create Multiple Polls</h3>
            <button onClick={() => { setShowForm(false); setCreateMode('single'); }} className="text-gray-400 hover:text-white"><X size={16} /></button>
          </div>
          
          {bulkPolls.map((poll, idx) => (
            <div key={idx} className="rounded-xl p-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-pink-400">Poll #{idx + 1}</p>
                {bulkPolls.length > 1 && <button onClick={() => removeBulkPoll(idx)} className="text-red-400 hover:text-red-300"><Trash2 size={12} /></button>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input value={poll.question} onChange={(e) => updateBulkPoll(idx, 'question', e.target.value)} placeholder="Question *" className="text-sm text-white rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
                <select value={poll.category || 'Confidence'} onChange={(e) => updateBulkPoll(idx, 'category', e.target.value)} className="text-sm text-white rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#1a0a18' }}>{c}</option>)}
                </select>
                <select value={poll.response_type || 'multiple_choice'} onChange={(e) => updateBulkPoll(idx, 'response_type', e.target.value)} className="text-sm text-white rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="open_text">Open Text</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                {poll.response_type !== 'open_text' && (
                  <>
                    <input value={poll.option_a || ''} onChange={(e) => updateBulkPoll(idx, 'option_a', e.target.value)} placeholder="Option A" className="text-sm text-white rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
                    <input value={poll.option_b || ''} onChange={(e) => updateBulkPoll(idx, 'option_b', e.target.value)} placeholder="Option B" className="text-sm text-white rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
                  </>
                )}
                {poll.response_type !== 'multiple_choice' && (
                  <input value={poll.open_text_prompt || ''} onChange={(e) => updateBulkPoll(idx, 'open_text_prompt', e.target.value)} placeholder="Text prompt..." className="text-sm text-white rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
                )}
                <input type="date" value={poll.scheduled_date || ''} onChange={(e) => updateBulkPoll(idx, 'scheduled_date', e.target.value)} className="text-sm text-white rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', colorScheme: 'dark' }} />
                <select value={poll.age_group || 'All Ages'} onChange={(e) => updateBulkPoll(idx, 'age_group', e.target.value)} className="text-sm text-white rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  {AGE_GROUPS.map(ag => <option key={ag} value={ag} style={{ background: '#1a0a18' }}>{ag}</option>)}
                </select>
              </div>
            </div>
          ))}
          
          <div className="flex gap-2 mt-4">
            <button onClick={addBulkPoll} className="flex-1 py-2 rounded-xl font-bold text-white text-sm" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              + Add Another Poll
            </button>
            <button onClick={saveBulk} disabled={saving} className="flex-1 py-2 rounded-xl font-bold text-white text-sm"
              style={{ background: saving ? '#555' : 'linear-gradient(135deg,#ec4899,#a855f7)', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : `Save ${bulkPolls.filter(p => p.question && p.option_a && p.option_b).length} Polls`}
            </button>
          </div>
        </div>
      )}

      {/* Single Create/Edit Form */}
      {showForm && createMode === 'single' && (
        <div className="rounded-2xl p-4 mb-6 space-y-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="text-sm font-bold text-white mb-2">{editId ? 'Edit Poll' : 'Create New Poll'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Category</p>
              <select value={form.category} onChange={f('category')} className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#1a0a18' }}>{c}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Response Type</p>
              <select value={form.response_type} onChange={f('response_type')} className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <option value="multiple_choice" style={{ background: '#1a0a18' }}>Multiple Choice (A/B/C/D)</option>
                <option value="open_text" style={{ background: '#1a0a18' }}>Open Text Only</option>
                <option value="hybrid" style={{ background: '#1a0a18' }}>Hybrid (Choices + Text)</option>
              </select>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Question *</p>
            <textarea value={form.question} onChange={f('question')} rows={3} placeholder="If someone said someone was talking about you, would you..." className="w-full text-sm text-white rounded-xl p-2.5 resize-none" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
          </div>
          {form.response_type !== 'open_text' && (
            <div className="grid grid-cols-2 gap-3">
              {['a','b','c','d'].map(letter => (
                <div key={letter}>
                  <p className="text-xs text-gray-400 mb-1">Option {letter.toUpperCase()} {form.response_type === 'hybrid' ? '(optional)' : '*'}</p>
                  <input value={form[`option_${letter}`]} onChange={f(`option_${letter}`)} placeholder={`Option ${letter.toUpperCase()}`} className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
                </div>
              ))}
            </div>
          )}
          {form.response_type !== 'multiple_choice' && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Open Text Prompt *</p>
              <textarea value={form.open_text_prompt} onChange={f('open_text_prompt')} rows={2} placeholder="Share your thoughts..." className="w-full text-sm text-white rounded-xl p-2.5 resize-none" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
            </div>
          )}
          <p className="text-xs font-bold text-pink-400 mt-2">Insights (shown after voting)</p>
          <div className="grid grid-cols-2 gap-3">
            {['a','b','c','d'].map(letter => (
              <div key={letter}>
                <p className="text-xs text-gray-400 mb-1">Insight {letter.toUpperCase()}</p>
                <textarea value={form[`insight_${letter}`]} onChange={f(`insight_${letter}`)} rows={2} placeholder="What this choice reveals..." className="w-full text-xs text-white rounded-xl p-2 resize-none" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Coaching Tip (shown after voting)</p>
            <textarea value={form.coaching_tip} onChange={f('coaching_tip')} rows={2} placeholder="A brief coaching message for all voters..." className="w-full text-sm text-white rounded-xl p-2.5 resize-none" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Scheduled Date</p>
              <input type="date" value={form.scheduled_date} onChange={f('scheduled_date')} className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', colorScheme: 'dark' }} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Points Awarded</p>
              <input type="number" value={form.points_awarded} onChange={f('points_awarded')} className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: pointsConfig?.daily_poll ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.08)', border: `1px solid ${pointsConfig?.daily_poll ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.15)'}` }} readOnly={!!pointsConfig?.daily_poll} />
              {pointsConfig?.daily_poll && <p className="text-[10px] text-green-400 mt-1">✨ Synced from Points Config</p>}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Age Group Target</p>
            <select value={form.age_group} onChange={f('age_group')} className="w-full text-sm text-white rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              {AGE_GROUPS.map(ag => <option key={ag} value={ag} style={{ background: '#1a0a18' }}>{ag}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="poll_active" checked={form.is_active} onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))} />
            <label htmlFor="poll_active" className="text-sm text-gray-300">Active (visible to users)</label>
          </div>
          <button onClick={save} disabled={saving || !form.question || (form.response_type !== 'open_text' && (!form.option_a || !form.option_b)) || (form.response_type !== 'multiple_choice' && !form.open_text_prompt)}
            className="w-full py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: saving ? '#555' : 'linear-gradient(135deg,#ec4899,#a855f7)', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : editId ? 'Update Poll' : 'Create Poll'}
          </button>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { const m = currentMonth - 1; if (m < 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } else setCurrentMonth(m); }} className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm">←</button>
            <h3 className="text-sm font-bold text-white">{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
            <button onClick={() => { const m = currentMonth + 1; if (m > 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } else setCurrentMonth(m); }} className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm">→</button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="text-center text-xs font-bold text-gray-500 py-2">{d}</div>)}
            {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dayPolls = getPollsForDay(day);
              const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
              return (
                <div key={day} className={`rounded-lg p-1.5 min-h-[60px] ${isToday ? 'bg-pink-600/20 border border-pink-500/30' : 'bg-white/5 border border-white/10'}`}>
                  <p className={`text-xs font-bold mb-1 ${isToday ? 'text-pink-400' : 'text-gray-400'}`}>{day}</p>
                  {dayPolls.map(p => (
                    <div key={p.id} className="text-[9px] truncate px-1 py-0.5 rounded mb-0.5" style={{ background: p.is_active ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.1)', color: p.is_active ? '#fff' : '#888' }}>
                      {p.category}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {polls.length === 0 && <p className="text-center text-gray-500 text-sm py-8">No polls yet. Create your first one!</p>}
          {polls.map(poll => {
            const totalVotes = (poll.votes_a || 0) + (poll.votes_b || 0) + (poll.votes_c || 0) + (poll.votes_d || 0);
            const isExpanded = expandedId === poll.id;
            return (
              <div key={poll.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${poll.is_active ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(236,72,153,0.15)', color: '#ec4899' }}>{poll.category}</span>
                      {poll.scheduled_date && <span className="text-xs text-gray-500">📅 {poll.scheduled_date}</span>}
                      {poll.age_group && poll.age_group !== 'All Ages' && <span className="text-xs text-purple-400 font-semibold">👥 {poll.age_group}</span>}
                      {!poll.is_active && <span className="text-xs text-gray-600 font-bold">ARCHIVED</span>}
                    </div>
                    <p className="text-sm text-white font-semibold">{poll.question}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <button onClick={() => setExpandedId(isExpanded ? null : poll.id)} className="flex items-center gap-1 text-xs text-gray-400">
                        <BarChart2 size={11} /> {totalVotes} votes {isExpanded ? '▲' : '▼'}
                      </button>
                      <span className="text-xs text-green-400 font-bold">+{poll.points_awarded} pts</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(poll)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <Edit3 size={13} className="text-gray-300" />
                    </button>
                    <button onClick={() => deletePoll(poll.id)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                    {[['A', poll.option_a, poll.votes_a], ['B', poll.option_b, poll.votes_b], ['C', poll.option_c, poll.votes_c], ['D', poll.option_d, poll.votes_d]].map(([ltr, txt, votes]) => {
                      if (!txt) return null;
                      const pct = totalVotes > 0 ? Math.round(((votes || 0) / totalVotes) * 100) : 0;
                      return (
                        <div key={ltr}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-300"><strong className="text-pink-400">{ltr}.</strong> {txt}</span>
                            <span className="text-gray-400 font-bold">{votes || 0} ({pct}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#ec4899,#a855f7)' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}