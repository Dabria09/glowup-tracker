import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import UserAvatarDisplay from '@/components/UserAvatarDisplay';
import { ChevronLeft, Send, Search, Plus, X, MessageCircle, Lock } from 'lucide-react';

function makeConvoId(emailA, emailB) {
  return [emailA, emailB].sort().join('__dm__');
}

export default function DirectMessages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetEmail = searchParams.get('to');
  const targetUsername = searchParams.get('username');

  const [user, setUser] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ageBlocked, setAgeBlocked] = useState(false);

  // Inbox state
  const [conversations, setConversations] = useState([]); // [{email, username, profile, lastMsg, unread}]
  const [profilesMap, setProfilesMap] = useState({});

  // Chat state
  const [activeEmail, setActiveEmail] = useState(targetEmail || null);
  const [activeUsername, setActiveUsername] = useState(targetUsername || null);
  const [activeProfile, setActiveProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const messagesEndRef = useRef(null);

  // Load auth + inbox
  useEffect(() => {
    const init = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { navigate('/'); return; }
      const u = await base44.auth.me();
      setUser(u);

      // Fetch my profile for age check
      const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
      const myP = profiles[0] || null;
      setMyProfile(myP);

      // Age gate: block if age < 14 and age is set
      if (myP?.age && myP.age < 14) {
        setAgeBlocked(true);
        setLoading(false);
        return;
      }
      // Also block glow_girls world (under 13)
      if (myP?.age_group === 'glow_girls') {
        setAgeBlocked(true);
        setLoading(false);
        return;
      }

      await loadInbox(u.email);
      setLoading(false);
    };
    init();
  }, []);

  const loadInbox = async (myEmail) => {
    // Get all DM messages involving me
    const [sent, received] = await Promise.all([
      base44.entities.ChatMessage.filter({ sender_email: myEmail }, '-timestamp', 200),
      base44.entities.ChatMessage.filter({ receiver_email: myEmail }, '-timestamp', 200),
    ]);

    // Only DMs (conversation_id contains __dm__)
    const allDms = [...sent, ...received].filter(m => m.conversation_id?.includes('__dm__'));

    // Build conversation map: other person's email -> latest message
    const convoMap = {};
    allDms.forEach(m => {
      const otherEmail = m.sender_email === myEmail ? m.receiver_email : m.sender_email;
      if (!convoMap[otherEmail] || new Date(m.timestamp) > new Date(convoMap[otherEmail].timestamp)) {
        convoMap[otherEmail] = m;
      }
    });

    // Fetch profiles for other users
    const emails = Object.keys(convoMap);
    let pMap = {};
    if (emails.length > 0) {
      const allProfiles = await base44.entities.UserProfile.filter({});
      allProfiles.forEach(p => { pMap[p.user_email] = p; });
    }
    setProfilesMap(pMap);

    const convos = Object.entries(convoMap)
      .map(([email, lastMsg]) => ({
        email,
        lastMsg,
        profile: pMap[email] || null,
        username: pMap[email]?.username || email.split('@')[0],
        unread: !lastMsg.is_read && lastMsg.receiver_email === myEmail,
      }))
      .sort((a, b) => new Date(b.lastMsg.timestamp) - new Date(a.lastMsg.timestamp));

    setConversations(convos);
  };

  // When activeEmail changes, load chat
  useEffect(() => {
    if (!activeEmail || !user) return;
    // Load profile for active chat partner
    if (profilesMap[activeEmail]) {
      setActiveProfile(profilesMap[activeEmail]);
    } else {
      base44.entities.UserProfile.filter({ user_email: activeEmail }).then(r => setActiveProfile(r[0] || null));
    }
    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, [activeEmail, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!activeEmail || !user) return;
    setChatLoading(true);
    const convoId = makeConvoId(user.email, activeEmail);
    const msgs = await base44.entities.ChatMessage.filter({ conversation_id: convoId }, 'timestamp', 100);
    setMessages(msgs);
    // Mark received messages as read
    msgs.filter(m => m.receiver_email === user.email && !m.is_read)
      .forEach(m => base44.entities.ChatMessage.update(m.id, { is_read: true }).catch(() => {}));
    setChatLoading(false);
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || sending || !user || !activeEmail) return;
    setSending(true);
    const convoId = makeConvoId(user.email, activeEmail);
    await base44.entities.ChatMessage.create({
      conversation_id: convoId,
      sender_email: user.email,
      receiver_email: activeEmail,
      content: chatInput.trim(),
      timestamp: new Date().toISOString(),
      is_read: false,
    });
    setChatInput('');
    await loadMessages();
    setSending(false);
  };

  const doSearch = async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const all = await base44.entities.UserProfile.filter({});
    const filtered = all.filter(p =>
      p.user_email !== user?.email &&
      p.age_group !== 'glow_girls' &&
      (!p.age || p.age >= 14) &&
      (p.username?.toLowerCase().includes(q.toLowerCase()) || p.display_name?.toLowerCase().includes(q.toLowerCase()))
    );
    setSearchResults(filtered.slice(0, 20));
    setSearching(false);
  };

  const openChat = (email, username, profile) => {
    setActiveEmail(email);
    setActiveUsername(username);
    setActiveProfile(profile || null);
    setShowSearch(false);
    setSearchQ('');
    setSearchResults([]);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  if (ageBlocked) return (
    <div className="min-h-screen text-white pb-24 relative overflow-y-auto" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-8 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: 'rgba(236,72,153,0.1)', border: '2px solid rgba(236,72,153,0.3)' }}>
          <Lock size={32} className="text-pink-400" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Direct Messages</h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Direct messaging is available for members aged 14 and older. Keep glowing! 💜
        </p>
        <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-full font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
          Go Back
        </button>
      </div>
      <BottomNav active="connect" />
    </div>
  );

  // ── Chat View ──
  if (activeEmail) {
    const displayName = activeProfile?.username || activeUsername || activeEmail.split('@')[0];
    return (
      <div className="min-h-screen text-white flex flex-col" style={{ backgroundColor: '#080810', height: '100dvh' }}>
        {/* Header */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/10" style={{ background: 'rgba(8,8,16,0.95)', backdropFilter: 'blur(16px)' }}>
          <button onClick={() => { setActiveEmail(null); setMessages([]); loadInbox(user.email); }}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <UserAvatarDisplay profile={activeProfile} size={38} fallback={displayName[0]?.toUpperCase() || '?'} showRing />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm truncate">@{displayName}</p>
            <p className="text-[10px] text-gray-500">Direct Message</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {chatLoading && messages.length === 0 ? (
            <div className="flex justify-center pt-12">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-5xl mb-3">💬</span>
              <p className="font-bold text-white mb-1">Start a conversation</p>
              <p className="text-xs text-gray-500">Say hi to @{displayName}!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.sender_email === user.email;
              return (
                <div key={msg.id || i} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMe && (
                    <UserAvatarDisplay profile={activeProfile} size={32} fallback={displayName[0]?.toUpperCase() || '?'} showRing={false} />
                  )}
                  <div className={`max-w-[75%] flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                      style={isMe
                        ? { background: 'linear-gradient(135deg,#ec4899,#a855f7)', color: 'white' }
                        : { background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {msg.content}
                    </div>
                    <p className="text-[9px] text-gray-600 px-1">
                      {new Date(msg.timestamp || msg.created_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-white/10"
          style={{ background: 'rgba(8,8,16,0.95)', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom,0px))' }}>
          <div className="flex items-center gap-2 rounded-2xl px-4 py-2"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={`Message @${displayName}...`}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
            />
            <button onClick={sendMessage} disabled={!chatInput.trim() || sending}
              className="w-9 h-9 rounded-full flex items-center justify-center transition disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
              {sending ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Inbox View ──
  return (
    <div className="min-h-screen text-white pb-24 relative overflow-y-auto" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10">

        {/* Header */}
        <div className="sticky top-0 z-20 px-4 py-3 flex items-center gap-3 border-b border-white/10"
          style={{ background: 'rgba(8,8,16,0.95)', backdropFilter: 'blur(16px)' }}>
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-black text-white">Messages</h1>
            <p className="text-[10px] text-gray-500">Private · 14+ only</p>
          </div>
          <button onClick={() => setShowSearch(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
            <Plus size={18} />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Search size={15} className="text-gray-500 flex-shrink-0" />
            <input
              placeholder="Search conversations..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
              readOnly
              onClick={() => setShowSearch(true)}
            />
          </div>
        </div>

        {/* Conversation List */}
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8">
            <MessageCircle size={48} className="text-pink-500/40 mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">No messages yet</h2>
            <p className="text-sm text-gray-500 mb-6">Start a private conversation with another member.</p>
            <button onClick={() => setShowSearch(true)}
              className="px-6 py-3 rounded-full font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
              + New Message
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {conversations.map(({ email, username, profile, lastMsg, unread }) => (
              <button key={email} onClick={() => openChat(email, username, profile)}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-white/5 transition text-left">
                <div className="relative flex-shrink-0">
                  <UserAvatarDisplay profile={profile} size={50} fallback={username[0]?.toUpperCase() || '?'} showRing />
                  {unread && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-pink-500 border-2 border-gray-950" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm font-bold truncate ${unread ? 'text-white' : 'text-gray-200'}`}>@{username}</p>
                    <p className="text-[10px] text-gray-600 flex-shrink-0 ml-2">
                      {new Date(lastMsg.timestamp || lastMsg.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <p className={`text-xs truncate ${unread ? 'text-gray-200 font-semibold' : 'text-gray-500'}`}>
                    {lastMsg.sender_email === user?.email ? 'You: ' : ''}{lastMsg.content}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New Message Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#080810' }}>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <button onClick={() => { setShowSearch(false); setSearchQ(''); setSearchResults([]); }}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
              <X size={18} />
            </button>
            <div className="flex-1 flex items-center gap-2 rounded-2xl px-4 py-2.5"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Search size={15} className="text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                value={searchQ}
                onChange={e => { setSearchQ(e.target.value); doSearch(e.target.value); }}
                placeholder="Search by username..."
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {searching ? (
              <div className="flex justify-center pt-12">
                <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : searchResults.length === 0 && searchQ ? (
              <div className="text-center py-16 text-gray-500 text-sm">No users found</div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-16 text-gray-600 text-sm">Start typing to search members</div>
            ) : (
              searchResults.map(profile => (
                <button key={profile.id} onClick={() => openChat(profile.user_email, profile.username || profile.user_email.split('@')[0], profile)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition">
                  <UserAvatarDisplay profile={profile} size={44} fallback={profile.username?.[0]?.toUpperCase() || '?'} showRing />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-bold text-white truncate">@{profile.username || profile.user_email.split('@')[0]}</p>
                    {profile.bio && <p className="text-xs text-gray-500 truncate">{profile.bio}</p>}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <BottomNav active="connect" />
    </div>
  );
}