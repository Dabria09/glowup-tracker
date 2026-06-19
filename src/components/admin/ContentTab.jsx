import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Send, Eye, EyeOff, Star } from 'lucide-react';

const QUOTE_MAX = 280;

const SUB_TABS = ['Quotes', 'Glow Tips', 'Ms. Glow Live', 'Shout Outs'];

const QUOTE_CATS = [
  'general',
  // Five Pillars
  'wellness',
  'financial_literacy',
  'mentorship',
  'career_exploration',
  'civic_education',
  // Supporting themes
  'confidence',
  'spiritual',
  'relationships',
  'leadership',
  'self_image',
];

const QUOTE_CAT_LABELS = {
  general: 'General',
  wellness: '💆 Wellness',
  financial_literacy: '💰 Financial Literacy',
  mentorship: '🤝 Mentorship',
  career_exploration: '🚀 Career Exploration',
  civic_education: '🗳️ Civic Education',
  confidence: '✨ Confidence',
  spiritual: '🙏 Spiritual',
  relationships: '💞 Relationships',
  leadership: '👑 Leadership',
  self_image: '🪞 Self-Image',
};

const TIP_CATS = [
  // Five Pillars
  'wellness',
  'financial_literacy',
  'mentorship',
  'career_exploration',
  'civic_education',
  // Supporting themes
  'confidence',
  'mindset',
  'school',
  'relationships',
  'money',
  'leadership',
  'self_image',
];

const TIP_CAT_LABELS = {
  wellness: '💆 Wellness',
  financial_literacy: '💰 Financial Literacy',
  mentorship: '🤝 Mentorship',
  career_exploration: '🚀 Career Exploration',
  civic_education: '🗳️ Civic Education',
  confidence: '✨ Confidence',
  mindset: '🧠 Mindset',
  school: '📚 School',
  relationships: '💞 Relationships',
  money: '💵 Money',
  leadership: '👑 Leadership',
  self_image: '🪞 Self-Image',
};
const TIP_AGE_GROUPS = ['all', 'middle', 'early_high', 'older_high'];
const TIP_AGE_LABELS = { all: 'All Ages', middle: 'Middle School (11–13)', early_high: 'Early High School (14–15)', older_high: 'Older High School (16–18)' };
const MSG_TYPES = ['written', 'video', 'voice'];

export default function ContentTab() {
  const [sub, setSub] = useState('Quotes');
  const [quotes, setQuotes] = useState([]);
  const [tips, setTips] = useState([]);
  const [messages, setMessages] = useState([]);
  const [shoutOuts, setShoutOuts] = useState([]);
  const [newQuote, setNewQuote] = useState({ quote_text: '', author: '', category: 'general' });
  const [newTip, setNewTip] = useState({ tip_text: '', category: 'confidence', age_group: 'all', is_featured: false, scheduled_date: '' });
  const [editingTip, setEditingTip] = useState(null);
  const [newMsg, setNewMsg] = useState({ title: '', content: '', message_type: 'written' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [q, t, m, s] = await Promise.all([
        base44.entities.AdminQuote.list('-created_date'),
        base44.entities.AdminGlowTip.list('-created_date'),
        base44.entities.MsGlowMessage.list('-created_date'),
        base44.entities.ShoutOut.list('-created_date', 50),
      ]);
      setQuotes(q); setTips(t); setMessages(m); setShoutOuts(s);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const withSave = async (fn, successMsg = 'Saved! ✅') => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      await fn();
      setSaveSuccess(successMsg);
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (e) {
      console.error(e);
      setSaveError(e.message || 'Something went wrong. Please try again.');
    }
    setSaving(false);
  };

  const importQuotesCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSaving(true);
    setSaveError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  quote_text: { type: 'string' },
                  author: { type: 'string' },
                  category: { type: 'string' },
                },
              },
            },
          },
        },
      });
      const rows = (result.output?.items || result.output || []).filter(r => r.quote_text?.trim());
      if (!rows.length) { setSaveError('No valid quotes found in file. Ensure columns: quote_text, author, category'); setSaving(false); return; }
      const valid = rows.map(r => ({
        quote_text: r.quote_text.trim(),
        author: r.author?.trim() || '',
        category: QUOTE_CATS.includes(r.category) ? r.category : 'general',
      }));
      await base44.entities.AdminQuote.bulkCreate(valid);
      loadAll();
    } catch (err) {
      setSaveError(err.message || 'Import failed. Check your CSV format.');
    }
    setSaving(false);
    e.target.value = '';
  };

  const addQuote = () => withSave(async () => {
    if (!newQuote.quote_text.trim()) { setSaveError('Quote text is required.'); return; }
    if (newQuote.quote_text.length > QUOTE_MAX) { setSaveError(`Quote must be ${QUOTE_MAX} characters or less.`); return; }
    await base44.entities.AdminQuote.create({ ...newQuote, is_active: true, is_featured: false });
    setNewQuote({ quote_text: '', author: '', category: 'general' });
    setShowPreview(false);
    loadAll();
  }, 'Quote added! ✅');

  const toggleQuoteField = async (q, field) => {
    await base44.entities.AdminQuote.update(q.id, { [field]: !q[field] });
    setQuotes(prev => prev.map(x => x.id === q.id ? { ...x, [field]: !x[field] } : x));
  };

  const addTip = () => withSave(async () => {
    if (!newTip.tip_text.trim()) { setSaveError('Tip text is required.'); return; }
    const payload = { ...newTip };
    if (!payload.scheduled_date) delete payload.scheduled_date;
    await base44.entities.AdminGlowTip.create(payload);
    setNewTip({ tip_text: '', category: 'confidence', age_group: 'all', is_featured: false, scheduled_date: '' });
    loadAll();
  });

  const updateTip = () => withSave(async () => {
    if (!editingTip) return;
    const payload = { ...editingTip };
    if (!payload.scheduled_date) delete payload.scheduled_date;
    await base44.entities.AdminGlowTip.update(editingTip.id, payload);
    setEditingTip(null);
    loadAll();
  });

  const addMsg = () => withSave(async () => {
    if (!newMsg.title.trim() || !newMsg.content.trim()) { setSaveError('Title and message are required.'); return; }
    await base44.entities.MsGlowMessage.create(newMsg);
    setNewMsg({ title: '', content: '', message_type: 'written' });
    loadAll();
  });

  const deleteShoutOut = async (id) => {
    await base44.entities.ShoutOut.delete(id);
    loadAll();
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm";
  const selectCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none text-sm";

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {SUB_TABS.map(t => (
          <button key={t} onClick={() => setSub(t)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition ${sub === t ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={sub === t ? { background: 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}>
            {t}
          </button>
        ))}
      </div>

      {sub === 'Quotes' && (
        <div className="space-y-4">
          {/* Add form */}
          <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="font-bold text-white text-sm">Add New Quote</p>
            <div className="relative">
              <textarea
                value={newQuote.quote_text}
                onChange={e => { setSaveError(''); setSaveSuccess(''); setNewQuote({ ...newQuote, quote_text: e.target.value }); }}
                placeholder="Quote text..."
                className={inputCls}
                rows={3}
                maxLength={QUOTE_MAX}
              />
              <span className={`absolute bottom-2 right-3 text-[10px] ${newQuote.quote_text.length > QUOTE_MAX * 0.9 ? 'text-red-400' : 'text-gray-600'}`}>
                {newQuote.quote_text.length}/{QUOTE_MAX}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={newQuote.author} onChange={e => setNewQuote({ ...newQuote, author: e.target.value })} placeholder="Author (optional)" className={inputCls} />
              <select value={newQuote.category} onChange={e => setNewQuote({ ...newQuote, category: e.target.value })} className={selectCls}>
                {QUOTE_CATS.map(c => <option key={c} value={c} style={{ background: '#1a0a2e' }}>{QUOTE_CAT_LABELS[c] || c}</option>)}
              </select>
            </div>

            {/* Preview toggle */}
            {newQuote.quote_text.trim() && (
              <button onClick={() => setShowPreview(p => !p)} className="flex items-center gap-1.5 text-xs text-purple-400">
                {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
                {showPreview ? 'Hide Preview' : 'Preview how it looks in-app'}
              </button>
            )}
            {showPreview && newQuote.quote_text.trim() && (
              <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(236,72,153,0.15))', border: '1px solid rgba(168,85,247,0.35)' }}>
                <p className="text-[10px] font-bold tracking-wider text-pink-400 mb-2">PREVIEW · How it appears to girls</p>
                {newQuote.category && <span className="text-[10px] text-purple-300 mb-2 block">{QUOTE_CAT_LABELS[newQuote.category] || newQuote.category}</span>}
                <p className="text-2xl font-bold text-purple-300 mb-2 leading-none opacity-60">"</p>
                <p className="text-base font-bold text-white leading-relaxed mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{newQuote.quote_text}</p>
                {newQuote.author && <p className="text-xs text-pink-300 font-semibold">— {newQuote.author}</p>}
              </div>
            )}

            {saveError && sub === 'Quotes' && <p className="text-xs text-red-400">{saveError}</p>}
            {saveSuccess && sub === 'Quotes' && <p className="text-xs text-emerald-400 font-semibold">{saveSuccess}</p>}

            <div className="flex gap-2">
              <button onClick={addQuote} disabled={saving} className="flex-1 py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
                {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Plus size={16} /> Add Quote</>}
              </button>
              <label className={`py-3 px-4 rounded-2xl font-bold text-white text-sm flex items-center gap-2 cursor-pointer ${saving ? 'opacity-60 pointer-events-none' : ''}`} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                📥 CSV
                <input type="file" accept=".csv" className="hidden" onChange={importQuotesCSV} disabled={saving} />
              </label>
            </div>
            <p className="text-[10px] text-gray-600">CSV columns: <span className="text-gray-500">quote_text, author (optional), category (optional)</span></p>
          </div>

          {/* Quote list */}
          {quotes.length === 0 ? <p className="text-center text-sm text-gray-500 py-4">No custom quotes yet.</p> : (
            <div className="space-y-2">
              {quotes.map(q => (
                <div key={q.id} className="p-3 rounded-2xl flex items-start gap-2" style={{
                  background: q.is_active === false ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${q.is_active === false ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)'}`,
                  opacity: q.is_active === false ? 0.6 : 1,
                }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white leading-snug">"{q.quote_text}"</p>
                    {q.author && <p className="text-xs text-gray-400 mt-0.5">— {q.author}</p>}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] text-pink-400">{QUOTE_CAT_LABELS[q.category] || q.category}</span>
                      {q.is_featured && <span className="text-[10px] text-yellow-400">⭐ Featured</span>}
                      {q.is_active === false && <span className="text-[10px] text-gray-500">Inactive</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0 items-end">
                    {/* Active toggle */}
                    <button
                      onClick={() => toggleQuoteField(q, 'is_active')}
                      title={q.is_active === false ? 'Activate' : 'Deactivate'}
                      className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full transition"
                      style={{ background: q.is_active === false ? 'rgba(255,255,255,0.06)' : 'rgba(16,185,129,0.15)', border: `1px solid ${q.is_active === false ? 'rgba(255,255,255,0.1)' : 'rgba(16,185,129,0.35)'}`, color: q.is_active === false ? '#6b7280' : '#34d399' }}>
                      {q.is_active === false ? <EyeOff size={10} /> : <Eye size={10} />}
                      {q.is_active === false ? 'Off' : 'On'}
                    </button>
                    {/* Featured toggle */}
                    <button
                      onClick={() => toggleQuoteField(q, 'is_featured')}
                      title={q.is_featured ? 'Unfeature' : 'Feature'}
                      className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full transition"
                      style={{ background: q.is_featured ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${q.is_featured ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.1)'}`, color: q.is_featured ? '#fbbf24' : '#6b7280' }}>
                      <Star size={10} /> {q.is_featured ? 'Featured' : 'Feature'}
                    </button>
                    <button onClick={() => base44.entities.AdminQuote.delete(q.id).then(loadAll)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {sub === 'Glow Tips' && (
        <div className="space-y-4">
          {/* Add / Edit Form */}
          <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="font-bold text-white text-sm">{editingTip ? '✏️ Edit Glow Tip' : 'Add New Glow Tip'}</p>
            <textarea
              value={editingTip ? editingTip.tip_text : newTip.tip_text}
              onChange={e => editingTip ? setEditingTip({ ...editingTip, tip_text: e.target.value }) : setNewTip({ ...newTip, tip_text: e.target.value })}
              placeholder="Tip text..." className={inputCls} rows={3} />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={editingTip ? editingTip.category : newTip.category}
                onChange={e => editingTip ? setEditingTip({ ...editingTip, category: e.target.value }) : setNewTip({ ...newTip, category: e.target.value })}
                className={selectCls}>
                {TIP_CATS.map(c => <option key={c} value={c} style={{ background: '#1a0a2e' }}>{TIP_CAT_LABELS[c] || c}</option>)}
              </select>
              <select
                value={editingTip ? editingTip.age_group : newTip.age_group}
                onChange={e => editingTip ? setEditingTip({ ...editingTip, age_group: e.target.value }) : setNewTip({ ...newTip, age_group: e.target.value })}
                className={selectCls}>
                {TIP_AGE_GROUPS.map(g => <option key={g} value={g} style={{ background: '#1a0a2e' }}>{TIP_AGE_LABELS[g]}</option>)}
              </select>
            </div>
            <input
              type="date"
              value={editingTip ? (editingTip.scheduled_date || '') : newTip.scheduled_date}
              onChange={e => editingTip ? setEditingTip({ ...editingTip, scheduled_date: e.target.value }) : setNewTip({ ...newTip, scheduled_date: e.target.value })}
              placeholder="Schedule date (optional)"
              className={inputCls} />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox"
                checked={editingTip ? !!editingTip.is_featured : newTip.is_featured}
                onChange={e => editingTip ? setEditingTip({ ...editingTip, is_featured: e.target.checked }) : setNewTip({ ...newTip, is_featured: e.target.checked })}
                className="w-4 h-4 accent-pink-500" />
              <span className="text-sm text-white">⭐ Feature this tip (shows in Today's Glow Tip)</span>
            </label>
            {saveError && sub === 'Glow Tips' && <p className="text-xs text-red-400">{saveError}</p>}
            <div className="flex gap-2">
              {editingTip ? (
                <>
                  <button onClick={updateTip} disabled={saving} className="flex-1 py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
                    {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
                  </button>
                  <button onClick={() => { setEditingTip(null); setSaveError(''); }} className="px-4 py-3 rounded-2xl text-sm text-gray-400 bg-white/5">Cancel</button>
                </>
              ) : (
                <button onClick={addTip} disabled={saving} className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
                  {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Plus size={16} /> Add Glow Tip</>}
                </button>
              )}
            </div>
          </div>

          {/* Filter by age */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['all_filter', ...TIP_AGE_GROUPS].map(g => {
              const label = g === 'all_filter' ? 'All' : TIP_AGE_LABELS[g];
              return null; // rendered inline below for simplicity
            })}
          </div>

          {tips.length === 0 ? <p className="text-center text-sm text-gray-500 py-4">No custom tips yet.</p> : (
            <div className="space-y-2">
              {tips.map(t => (
                <div key={t.id} className="p-3 rounded-2xl" style={{ background: editingTip?.id === t.id ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${editingTip?.id === t.id ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.1)'}` }}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-white">{t.tip_text}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] text-purple-400">{TIP_CAT_LABELS[t.category] || t.category}</span>
                        <span className="text-[10px] text-blue-400">{TIP_AGE_LABELS[t.age_group] || t.age_group}</span>
                        {t.is_featured && <span className="text-[10px] text-yellow-400">⭐ Featured</span>}
                        {t.scheduled_date && <span className="text-[10px] text-gray-400">📅 {t.scheduled_date}</span>}
                        {!t.is_active && <span className="text-[10px] text-red-400">Inactive</span>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingTip(t)} className="text-blue-400 hover:text-blue-300 p-1">✏️</button>
                      <button onClick={() => base44.entities.AdminGlowTip.delete(t.id).then(loadAll)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {sub === 'Ms. Glow Live' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="font-bold text-white text-sm">Post a Ms. Glow Live Message</p>
            <div className="flex gap-2">
              {MSG_TYPES.map(type => (
                <button key={type} onClick={() => setNewMsg({ ...newMsg, message_type: type })}
                  className={`flex-1 py-2 rounded-full text-sm font-semibold capitalize transition ${newMsg.message_type === type ? 'text-white' : 'text-gray-400 bg-white/5'}`}
                  style={newMsg.message_type === type ? { background: 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}>
                  {type}
                </button>
              ))}
            </div>
            <input value={newMsg.title} onChange={e => setNewMsg({ ...newMsg, title: e.target.value })} placeholder="Message title..." className={inputCls} />
            <textarea value={newMsg.content} onChange={e => setNewMsg({ ...newMsg, content: e.target.value })} placeholder="Your message to the girls..." className={inputCls} rows={4} />
            {saveError && sub === 'Ms. Glow Live' && <p className="text-xs text-red-400">{saveError}</p>}
            <button onClick={addMsg} disabled={saving} className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
              {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Send size={16} /> Post Message</>}
            </button>
          </div>
          {messages.length === 0 ? <p className="text-center text-sm text-gray-500 py-4">No messages yet.</p> : (
            <div className="space-y-2">
              {messages.map(m => (
                <div key={m.id} className="p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{m.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{m.content}</p>
                      <span className="text-[10px] text-pink-400 capitalize">{m.message_type}</span>
                    </div>
                    <button onClick={() => base44.entities.MsGlowMessage.delete(m.id).then(loadAll)} className="text-red-400 hover:text-red-300 flex-shrink-0"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {sub === 'Shout Outs' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">{shoutOuts.length} posts total</p>
          {shoutOuts.length === 0 ? <p className="text-center text-sm text-gray-500 py-4">No shout outs yet.</p> : (
            shoutOuts.map(s => (
              <div key={s.id} className="p-3 rounded-2xl flex items-start gap-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="text-pink-400 text-sm">🩷</span>
                <div className="flex-1">
                  <p className="text-sm text-white">{s.message || s.achievement || s.content}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.created_date ? new Date(s.created_date).toLocaleDateString() : ''} · {s.likes || 0} hearts</p>
                </div>
                <button onClick={() => deleteShoutOut(s.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}