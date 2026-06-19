import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Inbox, AlertTriangle, Clock, CheckCircle, X, ChevronLeft, MessageCircle, Shield, AlertCircle, Flag, Search } from 'lucide-react';

const STATUS_FILTERS = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

const CATEGORY_META = {
  bug: { label: '🐛 Bug', color: '#3b82f6' },
  account: { label: '👤 Account', color: '#10b981' },
  content: { label: '📝 Content', color: '#8b5cf6' },
  billing: { label: '💳 Billing', color: '#f59e0b' },
  safety_concern: { label: '🚨 Safety Concern', color: '#ef4444' },
  technical_issue: { label: '💻 Technical Issue', color: '#6366f1' },
  feedback: { label: '💡 Feedback', color: '#14b8a6' },
  feature_request: { label: '✨ Feature Request', color: '#a855f7' },
  accessibility: { label: '♿ Accessibility', color: '#06b6d4' },
  privacy: { label: '🔒 Privacy', color: '#ec4899' },
  other: { label: '📋 Other', color: '#6b7280' },
};

const STATUS_COLORS = {
  open: { bg: 'rgba(59,130,246,0.2)', text: 'text-blue-400', border: 'rgba(59,130,246,0.3)' },
  in_progress: { bg: 'rgba(245,158,11,0.2)', text: 'text-yellow-400', border: 'rgba(245,158,11,0.3)' },
  resolved: { bg: 'rgba(16,185,129,0.2)', text: 'text-green-400', border: 'rgba(16,185,129,0.3)' },
  closed: { bg: 'rgba(107,113,128,0.2)', text: 'text-gray-400', border: 'rgba(107,113,128,0.3)' },
};

const PRIORITY_META = {
  low: { label: 'Low', color: '#6b7280', bg: 'rgba(107,113,128,0.15)', border: 'rgba(107,113,128,0.3)', icon: '📝' },
  medium: { label: 'Medium', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', icon: '📌' },
  high: { label: 'High', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', icon: '⚠️' },
  urgent: { label: '🚨 URGENT', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', icon: '🚨' },
};



const SAFETY_KEYWORDS = [
  'harassment', 'threat', 'hurt', 'danger', 'unsafe', 'scared', 'afraid',
  'bullying', 'abuse', 'assault', 'inappropriate', 'uncomfortable',
  'meet', 'secret', 'alone', 'come over', 'pick up',
];

export default function SupportTab() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [escalating, setEscalating] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const t = await base44.entities.SupportTicket.list('-created_date');
      setTickets(t);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await base44.entities.SupportTicket.update(id, { 
      status, 
      resolved_date: status === 'resolved' ? new Date().toISOString() : undefined 
    });
    load();
    if (selectedTicket?.id === id) {
      setSelectedTicket(prev => ({ ...prev, status }));
    }
  };

  const updatePriority = async (id, priority) => {
    await base44.entities.SupportTicket.update(id, { priority });
    load();
    if (selectedTicket?.id === id) {
      setSelectedTicket(prev => ({ ...prev, priority }));
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSending(true);
    try {
      const me = await base44.auth.me();
      const currentReplies = selectedTicket.admin_replies || '[]';
      const replies = JSON.parse(currentReplies);
      replies.push({
        admin_email: me.email,
        content: replyText.trim(),
        timestamp: new Date().toISOString(),
      });
      await base44.entities.SupportTicket.update(selectedTicket.id, { 
        admin_replies: JSON.stringify(replies),
        last_admin_reply: new Date().toISOString(),
      });
      // Send email notification to user
      await base44.integrations.Core.SendEmail({
        to: selectedTicket.user_email,
        subject: `Re: ${selectedTicket.title}`,
        body: `Hello,\n\nAn admin has responded to your support ticket:\n\n${replyText.trim()}\n\nBest regards,\nGGU Admin Team`,
      });
      setReplyText('');
      load();
    } catch (e) {
      console.error(e);
    }
    setSending(false);
  };

  const saveInternalNote = async () => {
    if (!internalNote.trim() || !selectedTicket) return;
    setSavingNote(true);
    try {
      const me = await base44.auth.me();
      const currentNotes = selectedTicket.admin_notes || '';
      const timestamp = new Date().toLocaleString();
      const newNote = `${currentNotes ? currentNotes + '\n\n' : ''}[${timestamp}] ${me.email}: ${internalNote.trim()}`;
      await base44.entities.SupportTicket.update(selectedTicket.id, { admin_notes: newNote });
      setInternalNote('');
      load();
    } catch (e) { console.error(e); }
    setSavingNote(false);
  };

  const escalateToModeration = async () => {
    if (!escalationReason.trim() || !selectedTicket) return;
    setEscalating(true);
    try {
      const me = await base44.auth.me();
      // Create ContentReport
      const report = await base44.entities.ContentReport.create({
        reported_content_id: selectedTicket.id,
        content_type: 'support_ticket',
        content_snapshot: JSON.stringify({
          title: selectedTicket.title,
          description: selectedTicket.description,
          user: selectedTicket.user_email,
        }),
        reported_by: me.email,
        reason: 'safety_concern',
        description: `Escalated from Support Ticket: ${escalationReason.trim()}`,
        status: 'pending',
      });
      // Link back to ticket
      await base44.entities.SupportTicket.update(selectedTicket.id, {
        escalated_to_moderation: true,
        linked_content_report_id: report.id,
      });
      setShowEscalateModal(false);
      setEscalationReason('');
      load();
      alert('✅ Ticket escalated to Moderation. ContentReport created for review.');
    } catch (e) {
      alert('Failed to escalate: ' + e.message);
    }
    setEscalating(false);
  };

  const detectSafetyKeywords = (text) => {
    const found = [];
    const lower = text.toLowerCase();
    SAFETY_KEYWORDS.forEach(kw => {
      if (lower.includes(kw)) found.push(kw);
    });
    return found;
  };

  const filterKey = filter === 'All' ? null : filter.toLowerCase().replace(' ', '_');
  const filtered = tickets.filter(t => {
    if (filterKey && t.status !== filterKey) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (searchEmail && !t.user_email?.toLowerCase().includes(searchEmail.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: filtered.length,
    open: filtered.filter(t => t.status === 'open').length,
    inProgress: filtered.filter(t => t.status === 'in_progress').length,
    resolved: filtered.filter(t => t.status === 'resolved').length,
    urgent: filtered.filter(t => t.priority === 'urgent').length,
    safety: filtered.filter(t => t.category === 'safety_concern' || (t.safety_keywords_detected && JSON.parse(t.safety_keywords_detected || '[]').length > 0)).length,
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
      {/* Safety Alert Banner */}
      <div className="rounded-2xl p-4 border-2" style={{ background: 'rgba(239,68,68,0.08)', border: '2px solid rgba(239,68,68,0.35)' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}>
            <Shield size={20} className="text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-400">🛡️ Safety Keyword Detection</p>
            <p className="text-xs text-gray-400 mt-1">
              Tickets containing safety keywords are auto-flagged. Use "Escalate to Moderation" for urgent safety concerns.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-lg font-bold text-white">{stats.total}</p>
          <p className="text-[10px] text-gray-500">Total</p>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
          <p className="text-lg font-bold text-blue-400">{stats.open}</p>
          <p className="text-[10px] text-gray-400">Open</p>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <p className="text-lg font-bold text-amber-400">{stats.inProgress}</p>
          <p className="text-[10px] text-gray-400">In Progress</p>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <p className="text-lg font-bold text-emerald-400">{stats.resolved}</p>
          <p className="text-[10px] text-gray-400">Resolved</p>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <p className="text-lg font-bold text-red-400">{stats.urgent}</p>
          <p className="text-[10px] text-gray-400">🚨 Urgent</p>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)' }}>
          <p className="text-lg font-bold" style={{ color: '#f87171' }}>{stats.safety}</p>
          <p className="text-[10px] text-gray-400">🛡️ Safety</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto mb-2">
        {STATUS_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition ${filter === f ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={filter === f ? { background: 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}>
            {f}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto mb-2">
        {['all', 'urgent', 'high', 'medium', 'low'].map(p => {
          const meta = p === 'all' ? { label: 'All Priorities', color: '#6b7280' } : PRIORITY_META[p];
          return (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${priorityFilter === p ? 'text-white' : 'text-gray-400 bg-white/5'}`}
              style={priorityFilter === p ? { background: meta.color, border: `1px solid ${meta.color}` } : { border: `1px solid ${meta.color}40` }}
            >
              {p === 'all' ? 'All' : `${meta.icon} ${meta.label}`}
            </button>
          );
        })}
      </div>

      {/* Search by Email */}
      <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Search size={15} className="text-gray-500 flex-shrink-0" />
        <input
          value={searchEmail}
          onChange={e => setSearchEmail(e.target.value)}
          placeholder="Search by user email..."
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
        />
        {searchEmail && (
          <button onClick={() => setSearchEmail('')} className="text-gray-500 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {['all', 'safety_concern', 'bug', 'account', 'content', 'billing', 'technical_issue', 'feedback', 'feature_request', 'accessibility', 'privacy', 'other'].map(c => {
          const meta = c === 'all' ? { label: 'All Categories', color: '#6b7280' } : CATEGORY_META[c];
          return (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${categoryFilter === c ? 'text-white' : 'text-gray-400 bg-white/5'}`}
              style={categoryFilter === c ? { background: meta.color + '20', border: `1px solid ${meta.color}40` } : { border: `1px solid rgba(255,255,255,0.1)` }}
            >
              {c === 'all' ? 'All' : meta.label}
            </button>
          );
        })}
      </div>
      <div className="rounded-xl p-3" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}>
        <p className="text-[10px] font-bold text-purple-400 mb-2">📋 Available Categories</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs">{meta.label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : selectedTicket ? (
        // Ticket Detail View
        <div className="space-y-3">
          <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
            <ChevronLeft size={16} /> Back to List
          </button>

          {/* Ticket Header */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-bold text-white">{selectedTicket.title}</p>
                  {selectedTicket.status && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: STATUS_COLORS[selectedTicket.status]?.bg, color: STATUS_COLORS[selectedTicket.status]?.text, border: `1px solid ${STATUS_COLORS[selectedTicket.status]?.border}` }}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                  )}
                  {selectedTicket.priority && selectedTicket.priority !== 'medium' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: PRIORITY_META[selectedTicket.priority].bg, color: PRIORITY_META[selectedTicket.priority].color, border: `1px solid ${PRIORITY_META[selectedTicket.priority].border}` }}>
                      {PRIORITY_META[selectedTicket.priority].icon} {PRIORITY_META[selectedTicket.priority].label}
                    </span>
                  )}
                  {selectedTicket.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: CATEGORY_META[selectedTicket.category].color + '20', color: CATEGORY_META[selectedTicket.category].color, border: `1px solid ${CATEGORY_META[selectedTicket.category].color}40` }}>
                      {CATEGORY_META[selectedTicket.category].label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{selectedTicket.user_email ? `User: ${selectedTicket.user_email}` : `User #${selectedTicket.id?.slice(0, 7)}`}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{timeAgo(selectedTicket.created_date)} ago</p>
              </div>
            </div>
            
            {/* Safety Keywords Detected */}
            {selectedTicket.safety_keywords_detected && JSON.parse(selectedTicket.safety_keywords_detected || '[]').length > 0 && (
              <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <p className="text-[10px] font-bold text-red-400 mb-1 flex items-center gap-1">
                  <AlertTriangle size={10} /> Safety Keywords Detected
                </p>
                <div className="flex flex-wrap gap-1">
                  {JSON.parse(selectedTicket.safety_keywords_detected).map((kw, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {selectedTicket.description && (
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{selectedTicket.description}</p>
              </div>
            )}

            {/* Escalated Badge */}
            {selectedTicket.escalated_to_moderation && (
              <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)' }}>
                <p className="text-xs font-bold text-red-400 flex items-center gap-2">
                  <Flag size={12} /> Escalated to Moderation
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">ContentReport ID: {selectedTicket.linked_content_report_id}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Priority & Status */}
            <div className="space-y-3">
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-xs font-bold text-gray-400 mb-2">🚨 Priority</p>
                <div className="flex flex-col gap-2">
                  {Object.entries(PRIORITY_META).map(([key, meta]) => (
                    <button
                      key={key}
                      onClick={() => updatePriority(selectedTicket.id, key)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${selectedTicket.priority === key ? 'text-white' : 'text-gray-400 bg-white/5'}`}
                      style={selectedTicket.priority === key ? { background: meta.color, border: `1px solid ${meta.color}` } : { border: `1px solid ${meta.color}40` }}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-xs font-bold text-gray-400 mb-2">Update Status</p>
                <div className="flex flex-col gap-2">
                  {Object.entries(STATUS_COLORS).map(([key, meta]) => (
                    <button
                      key={key}
                      onClick={() => updateStatus(selectedTicket.id, key)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${selectedTicket.status === key ? 'text-white' : 'text-gray-400 bg-white/5'}`}
                      style={selectedTicket.status === key ? { background: meta.bg, border: `1px solid ${meta.border}`, color: meta.text } : { border: `1px solid ${meta.border}40` }}
                    >
                      {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Escalation & Notes */}
            <div className="space-y-3">
              {!selectedTicket.escalated_to_moderation && (
                <button
                  onClick={() => setShowEscalateModal(true)}
                  className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}
                >
                  <Flag size={16} /> Escalate to Moderation
                </button>
              )}

              <div className="rounded-2xl p-4" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.3)' }}>
                <p className="text-xs font-bold text-purple-400 mb-2 flex items-center gap-1">
                  👁️ Internal Notes
                </p>
                {selectedTicket.admin_notes && (
                  <div className="mb-3 p-3 rounded-xl bg-black/30 max-h-24 overflow-y-auto">
                    <p className="text-xs text-gray-300 whitespace-pre-wrap">{selectedTicket.admin_notes}</p>
                  </div>
                )}
                <textarea
                  value={internalNote}
                  onChange={e => setInternalNote(e.target.value)}
                  placeholder="Add internal note..."
                  className={inputCls}
                  rows={3}
                />
                <button
                  onClick={saveInternalNote}
                  disabled={!internalNote.trim() || savingNote}
                  className="w-full mt-3 py-2.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }}
                >
                  {savingNote ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={16} /> Save Note</>}
                </button>
              </div>
            </div>
          </div>

          {/* Admin Replies */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.3)' }}>
            <p className="text-xs font-bold text-blue-400 mb-3 flex items-center gap-1">
              <MessageCircle size={12} /> Admin Replies
            </p>
            {selectedTicket.admin_replies && JSON.parse(selectedTicket.admin_replies || '[]').length > 0 && (
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {JSON.parse(selectedTicket.admin_replies).map((reply, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-bold text-blue-300">{reply.admin_email?.split('@')[0]}</p>
                      <p className="text-[10px] text-gray-500">{timeAgo(reply.timestamp)} ago</p>
                    </div>
                    <p className="text-sm text-gray-200">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Type reply to user (email will be sent)..."
              className={inputCls}
              rows={4}
            />
            <button
              onClick={sendReply}
              disabled={!replyText.trim() || sending}
              className="w-full mt-3 py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#a855f7)' }}
            >
              {sending ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Send size={16} /> Send Reply & Email User</>}
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-sm">
          No tickets found
        </div>
      ) : (
        // Ticket List
        <div className="space-y-2">
          {filtered.map(ticket => {
            const detectedKeywords = ticket.safety_keywords_detected ? JSON.parse(ticket.safety_keywords_detected || '[]') : [];
            return (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="w-full rounded-2xl p-4 text-left transition hover:bg-white/5"
                style={{ background: 'rgba(255,255,255,0.05)', border: ticket.status === 'open' ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-bold text-white truncate">{ticket.title}</p>
                      {ticket.status && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: STATUS_COLORS[ticket.status]?.bg, color: STATUS_COLORS[ticket.status]?.text, border: `1px solid ${STATUS_COLORS[ticket.status]?.border}` }}>
                          {ticket.status}
                        </span>
                      )}
                      {ticket.priority && ticket.priority !== 'medium' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: PRIORITY_META[ticket.priority].bg, color: PRIORITY_META[ticket.priority].color, border: `1px solid ${PRIORITY_META[ticket.priority].border}` }}>
                          {PRIORITY_META[ticket.priority].icon} {PRIORITY_META[ticket.priority].label}
                        </span>
                      )}
                      {ticket.category === 'safety_concern' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                          🚨 Safety
                        </span>
                      )}
                      {detectedKeywords.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                          <AlertTriangle size={8} className="inline mr-1" />
                          {detectedKeywords.length} keyword{detectedKeywords.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {ticket.user_email?.split('@')[0]} · {ticket.description?.substring(0, 80) || 'No description'}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-gray-600 flex items-center gap-1">
                        <Clock size={8} /> {timeAgo(ticket.created_date)} ago
                      </span>
                      {ticket.escalated_to_moderation && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                          <Flag size={8} className="inline mr-1" />
                          Escalated
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Escalation Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-4" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-white text-sm flex items-center gap-2">
                <Flag size={16} className="text-red-400" />
                Escalate to Moderation
              </p>
              <button onClick={() => { setShowEscalateModal(false); setEscalationReason(''); }} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              This will create a ContentReport for the moderation team to review. The ticket will be linked to the report.
            </p>
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Reason for Escalation *</label>
              <textarea
                value={escalationReason}
                onChange={e => setEscalationReason(e.target.value)}
                placeholder="Describe the safety concern..."
                className={inputCls}
                rows={4}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowEscalateModal(false); setEscalationReason(''); }}
                disabled={escalating}
                className="flex-1 py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                Cancel
              </button>
              <button
                onClick={escalateToModeration}
                disabled={!escalationReason.trim() || escalating}
                className="flex-1 py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}
              >
                {escalating ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Flag size={16} /> Escalate</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}