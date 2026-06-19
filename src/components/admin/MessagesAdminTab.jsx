import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageCircle, AlertTriangle, Search, Eye, Shield, User, Clock, ChevronRight, Ban, CheckCircle, XCircle, Send, Flag, FileText } from 'lucide-react';

const FLAGGED_KEYWORDS = [
  'address', 'meet', 'location', 'phone', 'snapchat', 'instagram', 'discord',
  'secret', 'don\'t tell', 'parents', 'alone', 'come over', 'pick up',
];

export default function MessagesAdminTab() {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'flagged' | 'mentor'
  const [searchQuery, setSearchQuery] = useState('');
  const [mentors, setMentors] = useState([]);
  const [showActionModal, setShowActionModal] = useState(null);
  const [actionType, setActionType] = useState(null); // 'warn', 'escalate', 'ban', 'clear', 'report'
  const [actionForm, setActionForm] = useState({ reason: '', banType: 'soft', targetEmail: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      // Get all chat messages
      const allMessages = await base44.entities.ChatMessage.list('-timestamp', 500);
      
      // Get approved mentors
      const mentorApps = await base44.entities.MentorApplication.filter({ status: 'approved' });
      const mentorEmails = mentorApps.map(m => m.user_email);
      setMentors(mentorApps);

      // Build conversation map
      const convoMap = {};
      allMessages.forEach(msg => {
        const convoId = msg.conversation_id;
        if (!convoMap[convoId]) {
          convoMap[convoId] = {
            id: convoId,
            participants: [msg.sender_email, msg.receiver_email],
            messages: [],
            lastMsg: msg,
            isMentorConvo: mentorEmails.includes(msg.sender_email) || mentorEmails.includes(msg.receiver_email),
          };
        }
        convoMap[convoId].messages.push(msg);
        if (new Date(msg.timestamp) > new Date(convoMap[convoId].lastMsg.timestamp)) {
          convoMap[convoId].lastMsg = msg;
        }
      });

      // Analyze conversations for flags
      const convos = Object.values(convoMap).map(convo => {
        const flagged = convo.messages.some(m => 
          FLAGGED_KEYWORDS.some(kw => m.content.toLowerCase().includes(kw))
        );
        const mentorMsgs = convo.messages.filter(m => mentorEmails.includes(m.sender_email)).length;
        return {
          ...convo,
          flagged,
          mentorMessageCount: mentorMsgs,
        };
      });

      setConversations(convos);
      setMessages(allMessages);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const loadConversation = async (convo) => {
    setSelectedConvo(convo);
    setChatMessages(convo.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
  };

  const getUserInfo = async (email) => {
    const profiles = await base44.entities.UserProfile.filter({ user_email: email });
    return profiles[0] || null;
  };

  const handleModerationAction = async () => {
    if (!showActionModal) return;
    setActionLoading(true);
    try {
      const me = await base44.auth.me();
      const convo = showActionModal;
      
      if (actionType === 'clear') {
        // Mark as reviewed in AdminLogs
        await base44.entities.AdminLogs.create({
          action_type: 'other',
          performed_by: me.email,
          target_email: convo.participants.join(', '),
          details: `Marked conversation ${convo.id} as reviewed/cleared`,
          metadata: JSON.stringify({ conversation_id: convo.id, action: 'cleared' }),
        });
        alert('✅ Conversation marked as reviewed');
      } else if (actionType === 'warn') {
        // Send warning email to user(s)
        const targets = actionForm.targetEmail ? [actionForm.targetEmail] : convo.participants;
        for (const email of targets) {
          await base44.integrations.Core.SendEmail({
            to: email,
            subject: '⚠️ GGU Safety Warning',
            body: `Dear GGU Member,\n\nThis is a safety warning regarding your recent messages on the platform. Our monitoring system detected content that may violate our Community Guidelines.\n\nReason: ${actionForm.reason || 'Safety policy violation'}\n\nPlease review our guidelines and ensure all communications remain appropriate. Continued violations may result in account suspension.\n\nStay safe,\nGGU Safety Team`,
          });
        }
        await base44.entities.AdminLogs.create({
          action_type: 'other',
          performed_by: me.email,
          target_email: targets.join(', '),
          details: `Sent safety warning: ${actionForm.reason}`,
          metadata: JSON.stringify({ conversation_id: convo.id, action: 'warn', reason: actionForm.reason }),
        });
        alert(`✅ Warning sent to ${targets.length} user(s)`);
      } else if (actionType === 'escalate') {
        // Create high-priority admin message
        await base44.entities.MentorMessage.create({
          sender_email: me.email,
          receiver_email: 'admin-escalation@ggu.com',
          subject: '🚨 ESCALATED: Flagged Conversation',
          content: `Conversation ${convo.id} escalated for review.\n\nParticipants: ${convo.participants.join(', ')}\n\nReason: ${actionForm.reason}\n\nPlease review in Messages tab.`,
          category: 'safety_concern',
          is_admin_message: true,
        });
        await base44.entities.AdminLogs.create({
          action_type: 'other',
          performed_by: me.email,
          target_email: convo.participants.join(', '),
          details: `Escalated to senior admin: ${actionForm.reason}`,
          metadata: JSON.stringify({ conversation_id: convo.id, action: 'escalate' }),
        });
        alert('✅ Escalated to senior admin team');
      } else if (actionType === 'ban') {
        // Ban user(s)
        const targets = actionForm.targetEmail ? [actionForm.targetEmail] : convo.participants;
        for (const email of targets) {
          await base44.entities.BannedUser.create({
            user_email: email,
            username: email.split('@')[0],
            user_name: email.split('@')[0],
            ban_type: actionForm.banType,
            reason: actionForm.reason || 'Safety violation from flagged conversation',
            banned_by: me.email,
            banned_date: new Date().toISOString(),
            is_active: true,
          });
          await base44.entities.AdminLogs.create({
            action_type: actionForm.banType === 'hard' ? 'hard_ban' : 'soft_ban',
            performed_by: me.email,
            target_email: email,
            details: actionForm.reason || 'Safety violation',
          });
        }
        alert(`✅ ${actionForm.banType === 'hard' ? 'Hard' : 'Soft'} ban applied to ${targets.length} user(s)`);
      } else if (actionType === 'report') {
        // Create ContentReport for formal tracking
        await base44.entities.ContentReport.create({
          reported_content_id: convo.id,
          content_type: 'chat_message',
          content_snapshot: JSON.stringify({
            participants: convo.participants,
            messageCount: convo.messages.length,
            flaggedMessages: convo.messages.filter(m => 
              ['address', 'meet', 'location', 'phone', 'snapchat', 'instagram', 'discord', 'secret', 'don\'t tell', 'parents', 'alone', 'come over', 'pick up'].some(kw => m.content.toLowerCase().includes(kw))
            ).map(m => m.content),
          }),
          reported_by: me.email,
          reason: 'other',
          description: actionForm.reason || 'Flagged conversation requiring review',
          status: 'pending',
        });
        await base44.entities.AdminLogs.create({
          action_type: 'other',
          performed_by: me.email,
          target_email: convo.participants.join(', '),
          details: `Created content report: ${actionForm.reason}`,
          metadata: JSON.stringify({ conversation_id: convo.id, action: 'report' }),
        });
        alert('✅ Content report created for moderation queue');
      }
      
      setShowActionModal(null);
      setActionForm({ reason: '', banType: 'soft', targetEmail: '' });
      load();
    } catch (e) {
      console.error('Moderation action failed:', e);
      alert('Failed: ' + e.message);
    }
    setActionLoading(false);
  };

  const filteredConvos = conversations.filter(convo => {
    if (filter === 'flagged' && !convo.flagged) return false;
    if (filter === 'mentor' && !convo.isMentorConvo) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return convo.messages.some(m => m.content.toLowerCase().includes(q));
    }
    return true;
  });

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <div className="space-y-4">
      {/* Safety Alert Banner */}
      <div className="rounded-2xl p-4 border-2" style={{ background: 'rgba(239,68,68,0.08)', border: '2px solid rgba(239,68,68,0.35)' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}>
            <Shield size={20} className="text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-400">🛡️ Chat Safety Monitoring</p>
            <p className="text-xs text-gray-400 mt-1">
              All direct messages are monitored for safety. Flagged conversations contain keywords that may indicate inappropriate contact attempts.
              <br />
              <span className="text-[10px] text-gray-500">Keywords: {FLAGGED_KEYWORDS.join(', ')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-lg font-bold text-white">{conversations.length}</p>
          <p className="text-[10px] text-gray-500">Total Convos</p>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <p className="text-lg font-bold text-red-400">{conversations.filter(c => c.flagged).length}</p>
          <p className="text-[10px] text-gray-400">Flagged</p>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
          <p className="text-lg font-bold text-purple-400">{conversations.filter(c => c.isMentorConvo).length}</p>
          <p className="text-[10px] text-gray-400">Mentor Involved</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All', icon: MessageCircle },
          { id: 'flagged', label: '🚨 Flagged', icon: AlertTriangle },
          { id: 'mentor', label: '👑 Mentor', icon: User },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => { setFilter(f.id); setSelectedConvo(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${filter === f.id ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={filter === f.id ? { background: f.id === 'flagged' ? 'linear-gradient(135deg,#ef4444,#dc2626)' : f.id === 'mentor' ? 'linear-gradient(135deg,#a855f7,#ec4899)' : 'linear-gradient(135deg,#3b82f6,#a855f7)' } : {}}
          >
            <f.icon size={12} /> {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Search size={15} className="text-gray-500 flex-shrink-0" />
        <input
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setSelectedConvo(null); }}
          placeholder="Search message content..."
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-gray-500 hover:text-white">
            <Eye size={14} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : selectedConvo ? (
        // Conversation Detail View
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            <button onClick={() => setSelectedConvo(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10">
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Conversation Details</p>
              <p className="text-[10px] text-gray-500">
                {selectedConvo.participants[0]?.split('@')[0]} ↔️ {selectedConvo.participants[1]?.split('@')[0]}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedConvo.flagged && (
                <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                  🚨 Flagged
                </span>
              )}
              {selectedConvo.flagged && (
                <button
                  onClick={() => { setShowActionModal(selectedConvo); setActionType(null); }}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5 transition hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}
                >
                  <Shield size={12} /> Take Action
                </button>
              )}
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto p-4 space-y-2">
            {chatMessages.map((msg, i) => {
              const isFlagged = FLAGGED_KEYWORDS.some(kw => msg.content.toLowerCase().includes(kw));
              return (
                <div key={msg.id || i} className={`rounded-xl p-3 ${isFlagged ? 'border-2 border-red-500/30' : ''}`} style={{ background: isFlagged ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-white">
                      {msg.sender_email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-gray-600">{timeAgo(msg.timestamp)}</p>
                  </div>
                  <p className="text-sm text-gray-200">{msg.content}</p>
                  {isFlagged && (
                    <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertTriangle size={8} /> Flagged for review
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : filteredConvos.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-sm">
          No conversations found
        </div>
      ) : (
        // Conversation List
        <div className="space-y-2">
          {filteredConvos.slice(0, 50).map((convo, i) => (
            <button
              key={convo.id || i}
              onClick={() => { console.log('Opening convo:', convo.id); loadConversation(convo); }}
              className="w-full rounded-2xl p-4 text-left transition hover:bg-white/5 cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.05)', border: convo.flagged ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-bold text-white truncate">
                      {convo.participants[0]?.split('@')[0]} ↔️ {convo.participants[1]?.split('@')[0]}
                    </p>
                    {convo.flagged && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                        🚨
                      </span>
                    )}
                    {convo.isMentorConvo && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                        👑
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{convo.lastMsg.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-gray-600 flex items-center gap-1">
                      <Clock size={8} /> {timeAgo(convo.lastMsg.timestamp)} ago
                    </span>
                    <span className="text-[10px] text-gray-600">{convo.messages.length} messages</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-500 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Moderation Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between sticky top-0" style={{ background: '#1a0a2e', borderColor: 'rgba(255,255,255,0.1)' }}>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield size={18} className="text-orange-400" />
                  Moderation Actions
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Participants: {showActionModal.participants.map(p => p.split('@')[0]).join(' ↔ ')}
                </p>
              </div>
              <button onClick={() => { setShowActionModal(null); setActionType(null); }} className="text-gray-400 hover:text-white">
                <XCircle size={20} />
              </button>
            </div>

            {!actionType ? (
              // Action Selection
              <div className="p-4 space-y-3">
                <p className="text-xs text-gray-400 mb-2">Select an action for this flagged conversation:</p>
                
                <button
                  onClick={() => setActionType('clear')}
                  className="w-full p-4 rounded-xl text-left flex items-center gap-3 transition hover:bg-white/5"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)' }}>
                    <CheckCircle size={18} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-400">Mark as Reviewed</p>
                    <p className="text-[10px] text-gray-400">Clear the flag and mark as reviewed</p>
                  </div>
                </button>

                <button
                  onClick={() => setActionType('warn')}
                  className="w-full p-4 rounded-xl text-left flex items-center gap-3 transition hover:bg-white/5"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.2)' }}>
                    <Send size={18} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-400">Send Warning</p>
                    <p className="text-[10px] text-gray-400">Email safety warning to user(s)</p>
                  </div>
                </button>

                <button
                  onClick={() => setActionType('escalate')}
                  className="w-full p-4 rounded-xl text-left flex items-center gap-3 transition hover:bg-white/5"
                  style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.2)' }}>
                    <Flag size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-purple-400">Escalate to Senior Admin</p>
                    <p className="text-[10px] text-gray-400">Forward to leadership team</p>
                  </div>
                </button>

                <button
                  onClick={() => setActionType('ban')}
                  className="w-full p-4 rounded-xl text-left flex items-center gap-3 transition hover:bg-white/5"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.2)' }}>
                    <Ban size={18} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-400">Ban User</p>
                    <p className="text-[10px] text-gray-400">Soft or hard ban from platform</p>
                  </div>
                </button>

                <button
                  onClick={() => setActionType('report')}
                  className="w-full p-4 rounded-xl text-left flex items-center gap-3 transition hover:bg-white/5"
                  style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.2)' }}>
                    <FileText size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-400">Create Content Report</p>
                    <p className="text-[10px] text-gray-400">Add to formal moderation queue</p>
                  </div>
                </button>
              </div>
            ) : (
              // Action Form
              <div className="p-4 space-y-4">
                {actionType === 'clear' && (
                  <div className="text-center py-8">
                    <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                    <p className="text-white font-semibold mb-2">Mark as Reviewed?</p>
                    <p className="text-xs text-gray-400 mb-4">This will clear the flag and log the review action.</p>
                    <div className="flex gap-3">
                      <button onClick={() => setActionType(null)} className="flex-1 py-3 rounded-xl font-bold text-white text-sm" style={{ background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
                      <button onClick={handleModerationAction} disabled={actionLoading} className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>{actionLoading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={16} /> Confirm</>}</button>
                    </div>
                  </div>
                )}

                {actionType === 'warn' && (
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-amber-400">Send Safety Warning</p>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block">Target</label>
                      <select
                        value={actionForm.targetEmail}
                        onChange={e => setActionForm({ ...actionForm, targetEmail: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none text-sm"
                      >
                        <option value="">All Participants</option>
                        {showActionModal.participants.map(p => (
                          <option key={p} value={p} style={{ background: '#1a0a2e' }}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block">Reason *</label>
                      <textarea
                        value={actionForm.reason}
                        onChange={e => setActionForm({ ...actionForm, reason: e.target.value })}
                        placeholder="Describe the safety concern..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 outline-none text-sm resize-none"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setActionType(null)} className="flex-1 py-3 rounded-xl font-bold text-white text-sm" style={{ background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
                      <button onClick={handleModerationAction} disabled={actionLoading || !actionForm.reason.trim()} className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>{actionLoading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Send size={16} /> Send Warning</>}</button>
                    </div>
                  </div>
                )}

                {actionType === 'escalate' && (
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-purple-400">Escalate to Senior Admin</p>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block">Reason for Escalation *</label>
                      <textarea
                        value={actionForm.reason}
                        onChange={e => setActionForm({ ...actionForm, reason: e.target.value })}
                        placeholder="Why does this need senior review?"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 outline-none text-sm resize-none"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setActionType(null)} className="flex-1 py-3 rounded-xl font-bold text-white text-sm" style={{ background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
                      <button onClick={handleModerationAction} disabled={actionLoading || !actionForm.reason.trim()} className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }}>{actionLoading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Flag size={16} /> Escalate</>}</button>
                    </div>
                  </div>
                )}

                {actionType === 'ban' && (
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-red-400">Ban User</p>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block">Target</label>
                      <select
                        value={actionForm.targetEmail}
                        onChange={e => setActionForm({ ...actionForm, targetEmail: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none text-sm"
                      >
                        <option value="">All Participants</option>
                        {showActionModal.participants.map(p => (
                          <option key={p} value={p} style={{ background: '#1a0a2e' }}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block">Ban Type *</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActionForm({ ...actionForm, banType: 'soft' })}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${actionForm.banType === 'soft' ? 'text-white' : 'text-gray-400'}`}
                          style={actionForm.banType === 'soft' ? { background: 'rgba(239,68,68,0.3)', borderColor: 'rgba(239,68,68,0.5)' } : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                        >
                          🟡 Soft Ban (can view)
                        </button>
                        <button
                          onClick={() => setActionForm({ ...actionForm, banType: 'hard' })}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${actionForm.banType === 'hard' ? 'text-white' : 'text-gray-400'}`}
                          style={actionForm.banType === 'hard' ? { background: 'rgba(239,68,68,0.5)', borderColor: 'rgba(239,68,68,0.7)' } : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                        >
                          🔴 Hard Ban (full block)
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block">Reason *</label>
                      <textarea
                        value={actionForm.reason}
                        onChange={e => setActionForm({ ...actionForm, reason: e.target.value })}
                        placeholder="Violation details..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 outline-none text-sm resize-none"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setActionType(null)} className="flex-1 py-3 rounded-xl font-bold text-white text-sm" style={{ background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
                      <button onClick={handleModerationAction} disabled={actionLoading || !actionForm.reason.trim()} className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>{actionLoading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Ban size={16} /> Apply Ban</>}</button>
                    </div>
                  </div>
                )}

                {actionType === 'report' && (
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-blue-400">Create Content Report</p>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block">Description *</label>
                      <textarea
                        value={actionForm.reason}
                        onChange={e => setActionForm({ ...actionForm, reason: e.target.value })}
                        placeholder="Details for moderation team..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 outline-none text-sm resize-none"
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setActionType(null)} className="flex-1 py-3 rounded-xl font-bold text-white text-sm" style={{ background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
                      <button onClick={handleModerationAction} disabled={actionLoading || !actionForm.reason.trim()} className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}>{actionLoading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><FileText size={16} /> Create Report</>}</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}