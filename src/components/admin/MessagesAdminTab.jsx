import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageCircle, AlertTriangle, Search, Eye, Shield, User, Clock, ChevronRight } from 'lucide-react';

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
            {selectedConvo.flagged && (
              <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                🚨 Flagged
              </span>
            )}
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
              onClick={() => loadConversation(convo)}
              className="w-full rounded-2xl p-4 text-left transition hover:bg-white/5"
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
    </div>
  );
}