import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Send } from 'lucide-react';

const SUB_TABS = ['Quotes', 'Glow Tips', 'Ms. Glow Live', 'Shout Outs'];

const QUOTE_CATS = ['general', 'confidence', 'wellness', 'career', 'spiritual', 'relationships'];
const TIP_CATS = ['general', 'wellness', 'confidence', 'academic', 'spiritual', 'money'];
const MSG_TYPES = ['written', 'video', 'voice'];

export default function ContentTab() {
  const [sub, setSub] = useState('Quotes');
  const [quotes, setQuotes] = useState([]);
  const [tips, setTips] = useState([]);
  const [messages, setMessages] = useState([]);
  const [shoutOuts, setShoutOuts] = useState([]);
  const [newQuote, setNewQuote] = useState({ quote_text: '', author: '', category: 'general' });
  const [newTip, setNewTip] = useState({ tip_text: '', category: 'general' });
  const [newMsg, setNewMsg] = useState({ title: '', content: '', message_type: 'written' });
  const [loading, setLoading] = useState(false);

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

  const addQuote = async () => {
    if (!newQuote.quote_text.trim()) return;
    await base44.entities.AdminQuote.create(newQuote);
    setNewQuote({ quote_text: '', author: '', category: 'general' });
    loadAll();
  };

  const addTip = async () => {
    if (!newTip.tip_text.trim()) return;
    await base44.entities.AdminGlowTip.create(newTip);
    setNewTip({ tip_text: '', category: 'general' });
    loadAll();
  };

  const addMsg = async () => {
    if (!newMsg.title.trim() || !newMsg.content.trim()) return;
    await base44.entities.MsGlowMessage.create(newMsg);
    setNewMsg({ title: '', content: '', message_type: 'written' });
    loadAll();
  };

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
          <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="font-bold text-white text-sm">Add New Quote</p>
            <textarea value={newQuote.quote_text} onChange={e => setNewQuote({ ...newQuote, quote_text: e.target.value })} placeholder="Quote text..." className={inputCls} rows={3} />
            <div className="grid grid-cols-2 gap-2">
              <input value={newQuote.author} onChange={e => setNewQuote({ ...newQuote, author: e.target.value })} placeholder="Author (optional)" className={inputCls} />
              <select value={newQuote.category} onChange={e => setNewQuote({ ...newQuote, category: e.target.value })} className={selectCls}>
                {QUOTE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={addQuote} className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
              <Plus size={16} /> Add Quote
            </button>
          </div>
          {quotes.length === 0 ? <p className="text-center text-sm text-gray-500 py-4">No custom quotes yet.</p> : (
            <div className="space-y-2">
              {quotes.map(q => (
                <div key={q.id} className="p-3 rounded-2xl flex items-start gap-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex-1">
                    <p className="text-sm text-white">"{q.quote_text}"</p>
                    {q.author && <p className="text-xs text-gray-400 mt-1">— {q.author}</p>}
                    <span className="text-[10px] text-pink-400">{q.category}</span>
                  </div>
                  <button onClick={() => base44.entities.AdminQuote.delete(q.id).then(loadAll)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {sub === 'Glow Tips' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="font-bold text-white text-sm">Add New Glow Tip</p>
            <textarea value={newTip.tip_text} onChange={e => setNewTip({ ...newTip, tip_text: e.target.value })} placeholder="Tip text..." className={inputCls} rows={3} />
            <select value={newTip.category} onChange={e => setNewTip({ ...newTip, category: e.target.value })} className={selectCls}>
              {TIP_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={addTip} className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
              <Plus size={16} /> Add Glow Tip
            </button>
          </div>
          {tips.length === 0 ? <p className="text-center text-sm text-gray-500 py-4">No custom tips yet.</p> : (
            <div className="space-y-2">
              {tips.map(t => (
                <div key={t.id} className="p-3 rounded-2xl flex items-start gap-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex-1">
                    <p className="text-sm text-white">{t.tip_text}</p>
                    <span className="text-[10px] text-purple-400">{t.category}</span>
                  </div>
                  <button onClick={() => base44.entities.AdminGlowTip.delete(t.id).then(loadAll)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
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
            <button onClick={addMsg} className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
              <Send size={16} /> Post Message
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