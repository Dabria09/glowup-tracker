import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageCircle, AlertTriangle, Search, Eye, Shield, User, Clock, ChevronRight, ThumbsUp, Ban, Mail, CheckCircle, XCircle, Flag } from 'lucide-react';

const FLAGGED_KEYWORDS = [
  'address', 'meet', 'location', 'phone', 'snapchat', 'instagram', 'discord',
  'secret', 'don\'t tell', 'parents', 'alone', 'come over', 'pick up',
];

// Weighted risk scoring system
const KEYWORD_WEIGHTS = {
  // HIGH RISK (weight: 3) - Grooming/secrecy indicators
  'secret': 3,
  'don\'t tell': 3,
  'alone': 3,
  'come over': 3,
  
  // MEDIUM RISK (weight: 2) - Contact information/meetup
  'address': 2,
  'meet': 2,
  'location': 2,
  'pick up': 2,
  
  // LOWER RISK (weight: 1) - Social platforms/contact
  'phone': 1,
  'snapchat': 1,
  'instagram': 1,
  'discord': 1,
  'parents': 1,
};

// Dangerous combinations that boost risk score
const DANGEROUS_COMBOS = [
  ['secret', 'alone'],
  ['don\'t tell', 'parents'],
  ['come over', 'alone'],
  ['meet', 'location'],
  ['address', 'pick up'],
];

function calculateRiskScore(messages) {
  let score = 0;
  const foundKeywords = new Set();
  
  messages.forEach(msg => {
    const content = msg.content.toLowerCase();
    Object.keys(KEYWORD_WEIGHTS).forEach(kw => {
      if (content.includes(kw)) {
        score += KEYWORD_WEIGHTS[kw];
        foundKeywords.add(kw);
      }
    });
  });
  
  // Boost score for dangerous combinations
  DANGEROUS_COMBOS.forEach(combo => {
    if (combo.every(kw => foundKeywords.has(kw))) {
      score += 5; // Significant boost for dangerous combos
    }
  });
  
  return score;
}

function getAlertLevel(score) {
  if (score >= 10) return 'urgent';    // Red - Immediate action needed
  if (score >= 5) return 'high';       // Orange - Review soon
  if (score >= 2) return 'medium';     // Yellow - Monitor
  return 'low';                        // Gray - Low priority
}

const ALERT_LEVEL_META = {
  urgent: { label: '🚨 URGENT', color: '#ef4444', bg: 'rgba(239,68,68,0.2)', border: 'rgba(239,68,68,0.4)' },
  high: { label: '⚠️ HIGH', color: '#f97316', bg: 'rgba(249,115,22,0.2)', border: 'rgba(249,115,22,0.4)' },
  medium: { label: '⚡ MEDIUM', color: '#eab308', bg: 'rgba(234,179,8,0.2)', border: 'rgba(234,179,8,0.4)' },
  low: { label: '✓ LOW', color: '#6b7280', bg: 'rgba(107,113,128,0.2)', border: 'rgba(107,113,128,0.4)' },
};

export default function MessagesAdminTab() {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'flagged' | 'mentor'
  const [searchQuery, setSearchQuery] = useState('');
  const [mentors, setMentors] = useState([]);
  const [showActionModal, setShowActionModal] = useState(null); // { type: 'warn'|'escalate'|'ban'|'clear', users: [] }
  const [actionNote, setActionNote] = useState('');
  const [processing, setProcessing] = useState(false);

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

      // Analyze conversations for flags with risk scoring
      const HIGH_RISK_COMBOS = [
        ['secret', 'alone'], ['secret', 'come over'],
        ['don\'t tell', 'alone'], ['don\'t tell', 'come over'],
        ['don\'t tell', 'meet'], ['alone', 'come over'],
        ['alone', 'meet'], ['come over', 'pick up'],
      ];

      const KEYWORD_SEVERITY = {
        'come over': 3, 'alone': 3, 'don\'t tell': 3, 'secret': 3, 'meet': 3, 'pick up': 3,
        'address': 2, 'location': 2, 'phone': 2,
        'snapchat': 1, 'instagram': 1, 'discord': 1, 'parents': 1,
      };

      const convos = Object.values(convoMap).map(convo => {
        let riskScore = 0;
        let hasHighRiskCombo = false;
        const flaggedMessages = [];

        convo.messages.forEach(m => {
          const contentLower = m.content.toLowerCase();
          
          // Check for high-risk combinations
          for (const combo of HIGH_RISK_COMBOS) {
            if (combo.every(kw => contentLower.includes(kw))) {
              hasHighRiskCombo = true;
              break;
            }
          }

          // Calculate risk score
          let msgScore = 0;
          const foundKeywords = [];
          for (const [keyword, severity] of Object.entries(KEYWORD_SEVERITY)) {
            if (contentLower.includes(keyword)) {
              msgScore += severity;
              foundKeywords.push(keyword);
            }
          }
          
          if (hasHighRiskCombo) msgScore += 5; // Add combo bonus
          
          if (msgScore > 0) {
            riskScore += msgScore;
            flaggedMessages.push({ message: m, score: msgScore, keywords: foundKeywords });
          }
        });

        const flagged = riskScore > 0;
        const flagged = riskScore > 0;
        const alertLevel = getAlertLevel(riskScore);

        return {
          ...convo,
          flagged,
          riskScore,
          alertLevel,
          hasHighRiskCombo,
          flaggedMessages,
          mentorMessageCount: convo.messages.filter(m => mentorEmails.includes(m.sender_email)).length,
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

  const handleModerationAction = async (actionType) => {
    if (!selectedConvo) return;
    if (actionType === 'clear') {
      // Just mark as reviewed - no user action needed
      alert('✅ Conversation marked as reviewed');
      setShowActionModal(null);
      setSelectedConvo(null);
      load(); // Refresh to update counts
      return;
    }

    if (!actionNote.trim() && actionType !== 'clear') {
      alert('Please provide a note explaining this action');
      return;
    }

    setProcessing(true);
    try {
      const me = await base44.auth.me();
      const users = selectedConvo.participants;

      if (actionType === 'warn') {
        // Send warning notification to both users
        for (const email of users) {
          await base44.entities.Notification.create({
            recipient_email: email,
            type: 'moderation_alert',
            actor_email: me.email,
            actor_username: 'GGU Admin',
            message: `⚠️ Warning: Your recent messages contained content that violated our safety guidelines. Please review our community guidelines and ensure all communication remains appropriate.`,
            link: '/messages',
            priority: 'high',
          });
        }
        alert(`⚠️ Warning sent to ${users.length} user(s)`);
      } else if (actionType === 'escalate') {
        // Create a support ticket for review
        await base44.entities.SupportTicket.create({
          user_email: users[0],
          subject: 'Escalated Chat Safety Concern',
          description: `Conversation flagged for review:\n\nParticipants: ${users.join(', ')}\nConversation ID: ${selectedConvo.id}\n\nAdmin Note: ${actionNote}`,
          status: 'pending',
          priority: 'high',
        });
        alert('📋 Escalated to support team for review');
      } else if (actionType === 'ban') {
        // Hard ban users
        for (const email of users) {
          await base44.entities.BannedUser.create({
            user_email: email,
            username: email.split('@')[0],
            user_name: email.split('@')[0],
            ban_type: 'hard',
            reason: `Chat safety violation: ${actionNote}`,
            banned_by: me.email,
            banned_date: new Date().toISOString(),
            email_blocked_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            username_blocked_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
          });
          // Log the action
          await base44.entities.AdminLogs.create({
            action_type: 'hard_ban',
            performed_by: me.email,
            target_email: email,
            target_username: email.split('@')[0],
            details: `Chat safety violation: ${actionNote}`,
          });
        }
        alert('🚫 Users banned for 30 days');
      }

      setShowActionModal(null);
      setActionNote('');
      setSelectedConvo(null);
      load();
    } catch (e) {
      alert('Action failed: ' + e.message);
    }
    setProcessing(false);
  };

  const getUserInfo = async (email) => {
    const profiles = await base44.entities.UserProfile.filter({ user_email: email });
    return profiles[0] || null;
  };

  const filteredConvos = conversations
    .filter(convo => {
      if (filter === 'urgent' && convo.alertLevel !== 'urgent') return false;
      if (filter === 'high' && convo.alertLevel !== 'high') return false;
      if (filter === 'flagged' && !convo.flagged) return false;
      if (filter === 'mentor' && !convo.isMentorConvo) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return convo.messages.some(m => m.content.toLowerCase().includes(q));
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by alert level urgency first, then by most recent
      const levelOrder = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };
      if (levelOrder[a.alertLevel] !== levelOrder[b.alertLevel]) {
        return levelOrder[a.alertLevel] - levelOrder[b.alertLevel];
      }
      return new Date(b.lastMsg.timestamp) - new Date(a.lastMsg.timestamp);
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
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)' }}>
          <p className="text-lg font-bold" style={{ color: '#f87171' }}>{conversations.filter(c => c.alertLevel === 'urgent').length}</p>
          <p className="text-[10px] text-gray-400">🚨 Urgent</p>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}>
          <p className="text-lg font-bold text-orange-400">{conversations.filter(c => c.alertLevel === 'high').length}</p>
          <p className="text-[10px] text-gray-400">⚠️ High</p>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
          <p className="text-lg font-bold text-purple-400">{conversations.filter(c => c.isMentorConvo).length}</p>
          <p className="text-[10px] text-gray-400">Mentor Involved</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { id: 'all', label: 'All', icon: MessageCircle },
          { id: 'urgent', label: '🚨 Urgent', icon: AlertTriangle },
          { id: 'high', label: '⚠️ High', icon: AlertTriangle },
          { id: 'flagged', label: 'All Flagged', icon: Shield },
          { id: 'mentor', label: '👑 Mentor', icon: User },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => { setFilter(f.id); setSelectedConvo(null); }}
            className={`flex-shrink-0 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${filter === f.id ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={filter === f.id ? { 
              background: f.id === 'urgent' ? 'linear-gradient(135deg,#ef4444,#dc2626)' :
                        f.id === 'high' ? 'linear-gradient(135deg,#f97316,#ea580c)' :
                        f.id === 'flagged' ? 'linear-gradient(135deg,#eab308,#ca8a04)' :
                        f.id === 'mentor' ? 'linear-gradient(135deg,#a855f7,#ec4899)' :
                        'linear-gradient(135deg,#3b82f6,#a855f7)'
            } : {}}
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
                <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: ALERT_LEVEL_META[selectedConvo.alertLevel]?.bg, color: ALERT_LEVEL_META[selectedConvo.alertLevel]?.color, border: `1px solid ${ALERT_LEVEL_META[selectedConvo.alertLevel]?.border}` }}>
                  {ALERT_LEVEL_META[selectedConvo.alertLevel]?.label}
                </span>
              )}
              {selectedConvo.riskScore > 0 && (
                <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: 'rgba(255,255,255,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                  Risk Score: {selectedConvo.riskScore}
                </span>
              )}
            </div>
          </div>

          {/* Moderation Actions */}
          {selectedConvo.flagged && (
            <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(239,68,68,0.05)' }}>
              <p className="text-xs font-bold text-red-400 mb-3 flex items-center gap-2">
                <Shield size={14} /> Moderation Actions
              </p>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setShowActionModal('warn')}
                  disabled={processing}
                  className="py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1 disabled:opacity-40"
                  style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.3)' }}
                >
                  <Mail size={12} /> Warn
                </button>
                <button
                  onClick={() => setShowActionModal('escalate')}
                  disabled={processing}
                  className="py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1 disabled:opacity-40"
                  style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}
                >
                  <Flag size={12} /> Escalate
                </button>
                <button
                  onClick={() => setShowActionModal('ban')}
                  disabled={processing}
                  className="py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1 disabled:opacity-40"
                  style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  <Ban size={12} /> Ban
                </button>
                <button
                  onClick={() => setShowActionModal('clear')}
                  disabled={processing}
                  className="py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1 disabled:opacity-40"
                  style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                  <CheckCircle size={12} /> Clear
                </button>
              </div>
            </div>
          )}

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
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: ALERT_LEVEL_META[convo.alertLevel]?.bg, color: ALERT_LEVEL_META[convo.alertLevel]?.color, border: `1px solid ${ALERT_LEVEL_META[convo.alertLevel]?.border}` }}>
                        {convo.alertLevel === 'urgent' ? '🚨' : convo.alertLevel === 'high' ? '⚠️' : '⚡'}
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

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-5" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {showActionModal === 'warn' && <Mail size={18} className="text-yellow-400" />}
                {showActionModal === 'escalate' && <Flag size={18} className="text-purple-400" />}
                {showActionModal === 'ban' && <Ban size={18} className="text-red-400" />}
                {showActionModal === 'clear' && <CheckCircle size={18} className="text-green-400" />}
                {showActionModal === 'warn' ? 'Send Warning' : showActionModal === 'escalate' ? 'Escalate to Support' : showActionModal === 'ban' ? 'Ban Users' : 'Mark as Reviewed'}
              </h3>
              <button onClick={() => { setShowActionModal(null); setActionNote(''); }} className="text-gray-400 hover:text-white">
                <XCircle size={20} />
              </button>
            </div>

            {showActionModal !== 'clear' && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">
                  {showActionModal === 'warn' && 'This will send a warning notification to both participants.'}
                  {showActionModal === 'escalate' && 'This will create a support ticket for further review.'}
                  {showActionModal === 'ban' && '⚠️ This will ban both users for 30 days. This action is logged.'}
                </p>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Admin Note *</label>
                <textarea
                  value={actionNote}
                  onChange={e => setActionNote(e.target.value)}
                  placeholder="Document the reason for this action..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm resize-none"
                  rows={4}
                />
              </div>
            )}

            {showActionModal === 'clear' && (
              <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <p className="text-sm text-green-400">✅ Marking this conversation as reviewed will remove the flag but keep all messages intact.</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowActionModal(null); setActionNote(''); }}
                disabled={processing}
                className="flex-1 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-40"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleModerationAction(showActionModal)}
                disabled={processing || (!actionNote.trim() && showActionModal !== 'clear')}
                className="flex-1 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-40"
                style={{
                  background: showActionModal === 'warn' ? 'linear-gradient(135deg,#f59e0b,#d97706)' :
                              showActionModal === 'escalate' ? 'linear-gradient(135deg,#a855f7,#ec4899)' :
                              showActionModal === 'ban' ? 'linear-gradient(135deg,#ef4444,#dc2626)' :
                              'linear-gradient(135deg,#10b981,#059669)',
                }}
              >
                {processing ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" /> :
                 showActionModal === 'warn' ? 'Send Warning' :
                 showActionModal === 'escalate' ? 'Escalate' :
                 showActionModal === 'ban' ? 'Ban Users' : 'Mark Reviewed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}