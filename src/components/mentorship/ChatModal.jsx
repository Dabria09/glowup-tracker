import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ChatModal({ isOpen, onClose, mentor, user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const conversationId = user && mentor ? 
    [user.email, mentor.user_email].sort().join('-') : '';

  const loadMessages = async () => {
    if (!conversationId) return;
    try {
      const response = await base44.functions.invoke('getChatMessages', { conversation_id: conversationId });
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      setLoading(true);
      await base44.functions.invoke('sendChatMessage', {
        conversation_id: conversationId,
        receiver_email: mentor.user_email,
        content: newMessage.trim()
      });
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && conversationId) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md max-h-[80vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ background: '#1a0a30' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
              👑
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{mentor.full_name}</h3>
              <p className="text-xs text-gray-400">{mentor.title}</p>
            </div>
          </div>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-10">
              <MessageCircle size={40} className="mx-auto mb-3 text-gray-600" />
              <p className="text-sm text-gray-400">Start the conversation!</p>
              <p className="text-xs text-gray-500 mt-1">Send a message to connect with {mentor.full_name}</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender_email === user.email ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    msg.sender_email === user.email
                      ? 'text-white'
                      : 'text-gray-200'
                  }`}
                  style={
                    msg.sender_email === user.email
                      ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' }
                      : { background: 'rgba(255,255,255,0.1)' }
                  }
                >
                  <p className="leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${
                    msg.sender_email === user.email ? 'text-pink-200' : 'text-gray-400'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-full text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || loading}
              className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}