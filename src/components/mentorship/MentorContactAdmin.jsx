import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Inbox, HelpCircle, AlertCircle, MessageCircle, X } from 'lucide-react';

const CATEGORIES = [
  { id: 'question', label: '❓ General Question', emoji: '❓' },
  { id: 'concern', label: '⚠️ Concern', emoji: '⚠️' },
  { id: 'technical_issue', label: '🔧 Technical Issue', emoji: '🔧' },
  { id: 'safety_concern', label: '🚨 Safety Concern', emoji: '🚨' },
  { id: 'feedback', label: '💡 Feedback', emoji: '💡' },
  { id: 'other', label: '📝 Other', emoji: '📝' },
];

export default function MentorContactAdmin() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', content: '', category: 'question' });
  const [sending, setSending] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);
      await loadMessages(u.email);
      setLoading(false);
    };
    init();
  }, []);

  const loadMessages = async (email) => {
    const allMsgs = await base44.entities.MentorMessage.filter({ sender_email: email }, '-created_date');
    setMessages(allMsgs);
  };

  const sendMessage = async () => {
    if (!form.subject.trim() || !form.content.trim()) return;
    setSending(true);
    try {
      await base44.entities.MentorMessage.create({
        sender_email: user.email,
        receiver_email: 'admin@gguapp.com', // or fetch admin emails
        subject: form.subject.trim(),
        content: form.content.trim(),
        category: form.category,
        status: 'pending',
        is_admin_message: true,
      });
      setForm({ subject: '', content: '', category: 'question' });
      setShowForm(false);
      await loadMessages(user.email);
    } catch (e) {
      console.error(e);
    }
    setSending(false);
  };

  const sendReply = async (originalMsg) => {
    if (!replyText.trim()) return;
    try {
      await base44.entities.MentorMessage.create({
        sender_email: user.email,
        receiver_email: originalMsg.receiver_email,
        subject: `Re: ${originalMsg.subject}`,
        content: replyText.trim(),
        in_reply_to: originalMsg.id,
        category: originalMsg.category,
        is_admin_message: false,
      });
      setReplyText('');
      await loadMessages(user.email);
      if (selectedMsg?.id === originalMsg.id) {
        const updated = await base44.entities.MentorMessage.filter({ sender_email: user.email }, '-created_date');
        setSelectedMsg(updated.find(m => m.in_reply_to === originalMsg.id) || null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#080810' }}>
      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-20 backdrop-blur-md bg-black/60 border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">Contact Admin</h1>
              <p className="text-[10px] text-gray-500">Questions? Concerns? We're here to help.</p>
            </div>
            {!showForm && !selectedMsg && (
              <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-full text-xs font-bold text-white flex items-center gap-1" style={{ background: 'linear-gradient(135deg,#3b82f6,#a855f7)' }}>
                <MessageCircle size={14} /> New Message
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          {showForm ? (
            // New Message Form
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-white">Send Message to Admin</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setForm({ ...form, category: cat.id })}
                      className={`p-3 rounded-xl text-xs font-semibold text-left transition ${form.category === cat.id ? 'text-white' : 'text-gray-400 bg-white/5'}`}
                      style={form.category === cat.id ? { background: 'linear-gradient(135deg,#3b82f6,#a855f7)', border: '1px solid rgba(59,130,246,0.3)' } : { border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      {cat.emoji} {cat.label.replace(/❓|⚠️|🔧|🚨|💡|📝/, '').trim()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Subject</label>
                <input
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  placeholder="Brief summary..."
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Message</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Describe your question or concern..."
                  className={inputCls}
                  rows={6}
                />
              </div>

              <button
                onClick={sendMessage}
                disabled={!form.subject.trim() || !form.content.trim() || sending}
                className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#a855f7)' }}
              >
                {sending ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Send size={16} /> Send to Admin</>}
              </button>
            </div>
          ) : selectedMsg ? (
            // Message Thread View
            <div className="space-y-3">
              <button onClick={() => setSelectedMsg(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition mb-2">
                ← Back to Messages
              </button>

              {/* Original Message */}
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
                    {CATEGORIES.find(c => c.id === selectedMsg.category)?.emoji || '📝'} {selectedMsg.category?.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500">{timeAgo(selectedMsg.created_date)} ago</span>
                </div>
                <p className="text-sm font-bold text-white mb-1">{selectedMsg.subject}</p>
                <p className="text-sm text-gray-200 whitespace-pre-wrap">{selectedMsg.content}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: selectedMsg.status === 'resolved' ? 'rgba(16,185,129,0.2)' : selectedMsg.status === 'in_progress' ? 'rgba(59,130,246,0.2)' : 'rgba(245,158,11,0.2)', color: selectedMsg.status === 'resolved' ? '#10b981' : selectedMsg.status === 'in_progress' ? '#3b82f6' : '#f59e0b', border: `1px solid ${selectedMsg.status === 'resolved' ? 'rgba(16,185,129,0.3)' : selectedMsg.status === 'in_progress' ? 'rgba(59,130,246,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                    {selectedMsg.status === 'resolved' ? '✅ Resolved' : selectedMsg.status === 'in_progress' ? '🔄 In Progress' : '⏳ Pending'}
                  </span>
                </div>
              </div>

              {/* Replies */}
              {messages.filter(m => m.in_reply_to === selectedMsg.id).sort((a, b) => new Date(a.created_date) - new Date(b.created_date)).map(msg => (
                <div key={msg.id} className={`rounded-2xl p-4 ${msg.sender_email === user.email ? 'ml-8' : ''}`} style={{ background: msg.sender_email === user.email ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs font-bold text-white">{msg.sender_email === user.email ? '👤 You' : '👑 Admin'}</p>
                    <span className="text-[10px] text-gray-600">{timeAgo(msg.created_date)} ago</span>
                  </div>
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}

              {/* Reply Form */}
              <div className="rounded-2xl p-4" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.3)' }}>
                <p className="text-xs font-bold text-blue-400 mb-2">Send Follow-up</p>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Add more details or ask a follow-up..."
                  className={inputCls}
                  rows={3}
                />
                <button
                  onClick={() => sendReply(selectedMsg)}
                  disabled={!replyText.trim()}
                  className="w-full mt-3 py-2 rounded-xl font-bold text-white text-xs flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#a855f7)' }}
                >
                  <Send size={14} /> Send Follow-up
                </button>
              </div>
            </div>
          ) : messages.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Inbox size={48} className="text-blue-500/40 mb-4" />
              <h2 className="text-lg font-bold text-white mb-2">No Messages Yet</h2>
              <p className="text-sm text-gray-500 mb-6">Reach out to admin with any questions or concerns.</p>
              <button onClick={() => setShowForm(true)} className="px-6 py-3 rounded-full font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg,#3b82f6,#a855f7)' }}>
                Send First Message
              </button>
            </div>
          ) : (
            // Message List
            <div className="space-y-2">
              {messages.filter(m => !m.in_reply_to).map(msg => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMsg(msg)}
                  className="w-full rounded-2xl p-4 text-left transition hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.05)', border: msg.status === 'pending' ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-white truncate">{msg.subject}</p>
                        {msg.status === 'pending' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                            ⏳
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{msg.content.substring(0, 60)}{msg.content.length > 60 ? '...' : ''}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-gray-600">{timeAgo(msg.created_date)} ago</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
                          {CATEGORIES.find(c => c.id === msg.category)?.emoji || '📝'} {msg.category?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}