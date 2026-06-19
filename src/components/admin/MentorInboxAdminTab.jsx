import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Inbox, AlertCircle, Clock, CheckCircle, X, ChevronLeft, MessageCircle } from 'lucide-react';

const STATUS_OPTIONS = [
  { id: 'pending', label: '⏳ Pending', color: '#f59e0b' },
  { id: 'in_progress', label: '🔄 In Progress', color: '#3b82f6' },
  { id: 'resolved', label: '✅ Resolved', color: '#10b981' },
  { id: 'dismissed', label: '❌ Dismissed', color: '#6b7280' },
];

export default function MentorInboxAdminTab() {
  const [messages, setMessages] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('all'); // all | pending | in_progress | resolved
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const allMsgs = await base44.entities.MentorMessage.list('-created_date');
      setMessages(allMsgs);

      // Fetch mentor profiles
      const mentorEmails = [...new Set(allMsgs.map(m => m.sender_email))];
      const profiles = await base44.entities.UserProfile.filter({});
      const profileMap = {};
      profiles.forEach(p => profileMap[p.user_email] = p);
      setMentors(profileMap);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const updateStatus = async (msgId, newStatus) => {
    await base44.entities.MentorMessage.update(msgId, { status: newStatus });
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: newStatus } : m));
    if (selectedMsg?.id === msgId) {
      setSelectedMsg(prev => ({ ...prev, status: newStatus }));
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedMsg) return;
    setSending(true);
    try {
      const me = await base44.auth.me();
      await base44.entities.MentorMessage.create({
        sender_email: me.email,
        receiver_email: selectedMsg.sender_email,
        subject: `Re: ${selectedMsg.subject}`,
        content: replyText.trim(),
        in_reply_to: selectedMsg.id,
        status: 'in_progress',
        is_admin_reply: true,
      });
      setReplyText('');
      load();
    } catch (e) {
      console.error(e);
    }
    setSending(false);
  };

  const filtered = messages.filter(m => {
    if (!m.is_admin_message) return false; // only show admin-directed messages
    if (filter !== 'all' && m.status !== filter) return false;
    return true;
  });

  const stats = {
    total: filtered.length,
    pending: filtered.filter(m => m.status === 'pending').length,
    inProgress: filtered.filter(m => m.status === 'in_progress').length,
    resolved: filtered.filter(m => m.status === 'resolved').length,
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

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="rounded-2xl p-4 border-2" style={{ background: 'rgba(59,130,246,0.08)', border: '2px solid rgba(59,130,246,0.35)' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)' }}>
            <Inbox size={20} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-blue-400">📬 Mentor Inbox</p>
            <p className="text-xs text-gray-400 mt-1">
              Direct messages from approved mentors to admin team. Use this for questions, concerns, or support requests.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-lg font-bold text-white">{stats.total}</p>
          <p className="text-[10px] text-gray-500">Total</p>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <p className="text-lg font-bold text-amber-400">{stats.pending}</p>
          <p className="text-[10px] text-gray-400">Pending</p>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
          <p className="text-lg font-bold text-blue-400">{stats.inProgress}</p>
          <p className="text-[10px] text-gray-400">In Progress</p>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <p className="text-lg font-bold text-emerald-400">{stats.resolved}</p>
          <p className="text-[10px] text-gray-400">Resolved</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto">
        {STATUS_OPTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition ${filter === s.id ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={filter === s.id ? { background: s.color, border: `1px solid ${s.color}` } : {}}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : selectedMsg ? (
        // Message Detail View
        <div className="space-y-3">
          <button onClick={() => setSelectedMsg(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
            <ChevronLeft size={16} /> Back to Inbox
          </button>

          {/* Original Message */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-white">{selectedMsg.subject}</p>
                  {STATUS_OPTIONS.find(s => s.id === selectedMsg.status) && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: STATUS_OPTIONS.find(s => s.id === selectedMsg.status).color + '20', color: STATUS_OPTIONS.find(s => s.id === selectedMsg.status).color, border: `1px solid ${STATUS_OPTIONS.find(s => s.id === selectedMsg.status).color}40` }}>
                      {STATUS_OPTIONS.find(s => s.id === selectedMsg.status).label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>From: {mentors[selectedMsg.sender_email]?.username || selectedMsg.sender_email?.split('@')[0]}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {timeAgo(selectedMsg.created_date)} ago
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{selectedMsg.content}</p>
            </div>
          </div>

          {/* Reply Thread */}
          {messages.filter(m => m.in_reply_to === selectedMsg.id || m.id === selectedMsg.id).sort((a, b) => new Date(a.created_date) - new Date(b.created_date)).map((msg, i) => (
            <div key={msg.id} className={`rounded-2xl p-4 ${msg.is_admin_reply ? 'ml-8' : ''}`} style={{ background: msg.is_admin_reply ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-bold text-white">{msg.is_admin_reply ? '👑 Admin' : mentors[msg.sender_email]?.username || msg.sender_email?.split('@')[0]}</p>
                <span className="text-[10px] text-gray-600">{timeAgo(msg.created_date)} ago</span>
              </div>
              <p className="text-sm text-gray-200 whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}

          {/* Status Update */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-xs font-bold text-gray-400 mb-2">Update Status</p>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => updateStatus(selectedMsg.id, s.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition ${selectedMsg.status === s.id ? 'text-white' : 'text-gray-400 bg-white/5'}`}
                  style={selectedMsg.status === s.id ? { background: s.color, border: `1px solid ${s.color}` } : { border: `1px solid ${s.color}40` }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reply Form */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.3)' }}>
            <p className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-1">
              <MessageCircle size={12} /> Send Reply
            </p>
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Type your response to the mentor..."
              className={inputCls}
              rows={4}
            />
            <button
              onClick={sendReply}
              disabled={!replyText.trim() || sending}
              className="w-full mt-3 py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#a855f7)' }}
            >
              {sending ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Send size={16} /> Send Reply</>}
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-sm">
          No messages in this filter
        </div>
      ) : (
        // Message List
        <div className="space-y-2">
          {filtered.map(msg => (
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
                        ⏳ New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {mentors[msg.sender_email]?.username || msg.sender_email?.split('@')[0]} · {msg.content.substring(0, 80)}{msg.content.length > 80 ? '...' : ''}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-gray-600 flex items-center gap-1">
                      <Clock size={8} /> {timeAgo(msg.created_date)} ago
                    </span>
                    {STATUS_OPTIONS.find(s => s.id === msg.status) && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: STATUS_OPTIONS.find(s => s.id === msg.status).color + '20', color: STATUS_OPTIONS.find(s => s.id === msg.status).color, border: `1px solid ${STATUS_OPTIONS.find(s => s.id === msg.status).color}40` }}>
                        {STATUS_OPTIONS.find(s => s.id === msg.status).label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}