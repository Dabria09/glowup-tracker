import { useState, useEffect } from 'react';
import AgoraRoom from '@/components/AgoraRoom';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Plus, Mic, Calendar, Radio, Users, X, Lock, Globe } from 'lucide-react';

const CATEGORIES = ['General', 'Glow Up', 'Faith & Spirituality', 'STEM & Tech', 'Mental Health', 'Entrepreneurship', 'Fitness', 'Study Grind', 'Career', 'Relationships'];
const ROOM_TYPES = ['Community Room', 'Panel Room', 'Mentor Talk', 'Study Room', 'Prayer Room'];
const MAX_OPTIONS = [10, 25, 50, 100, 'Unlimited'];

const CATEGORY_EMOJIS = {
  'General': '💬', 'Glow Up': '✨', 'Faith & Spirituality': '🙏', 'STEM & Tech': '💻',
  'Mental Health': '🧠', 'Entrepreneurship': '💼', 'Fitness': '💪',
  'Study Grind': '📚', 'Career': '👩‍💼', 'Relationships': '💜',
};

export default function GlowTalk() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [activeTab, setActiveTab] = useState('live');
  const [showCreate, setShowCreate] = useState(false);
  const [joining, setJoining] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [newRoom, setNewRoom] = useState({
    title: '', description: '', category: 'General', room_type: 'Community Room',
    max_listeners: 25, is_public: true, scheduled_at: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) setUser(await base44.auth.me());
        const all = await base44.entities.GlowRoom.list('-created_date', 50);
        setRooms(all);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const liveRooms = rooms.filter(r => r.status === 'live');
  const scheduledRooms = rooms.filter(r => r.status === 'scheduled');
  const recordings = rooms.filter(r => r.status === 'ended' && r.recording_url);

  const displayRooms = activeTab === 'live' ? liveRooms : activeTab === 'scheduled' ? scheduledRooms : recordings;

  const handleCreate = async () => {
    if (!newRoom.title.trim() || !user) return;
    const status = newRoom.scheduled_at ? 'scheduled' : 'live';
    const created = await base44.entities.GlowRoom.create({
      ...newRoom,
      host_email: user.email,
      host_name: user.full_name || user.email.split('@')[0],
      status,
      listener_count: status === 'live' ? 1 : 0,
      listeners: status === 'live' ? JSON.stringify([user.email]) : '[]',
    });
    setShowCreate(false);
    setNewRoom({ title: '', description: '', category: 'General', room_type: 'Community Room', max_listeners: 25, is_public: true, scheduled_at: '' });
    const updated = await base44.entities.GlowRoom.list('-created_date', 50);
    setRooms(updated);
    if (status === 'live') setActiveRoom(created);
  };

  const handleJoin = async (room) => {
    if (!user) { navigate('/onboarding'); return; }
    setJoining(room.id);
    const listeners = JSON.parse(room.listeners || '[]');
    if (!listeners.includes(user.email)) {
      listeners.push(user.email);
      await base44.entities.GlowRoom.update(room.id, {
        listeners: JSON.stringify(listeners),
        listener_count: listeners.length,
      });
      const updated = await base44.entities.GlowRoom.list('-created_date', 50);
      setRooms(updated);
    }
    setJoining(null);
    setActiveRoom(room);
  };

  const handleLeave = async (room) => {
    if (!user) return;
    const listeners = JSON.parse(room.listeners || '[]').filter(e => e !== user.email);
    if (room.host_email === user.email) {
      await base44.entities.GlowRoom.update(room.id, { status: 'ended', ended_at: new Date().toISOString(), listeners: '[]', listener_count: 0 });
    } else {
      await base44.entities.GlowRoom.update(room.id, { listeners: JSON.stringify(listeners), listener_count: listeners.length });
    }
    const updated = await base44.entities.GlowRoom.list('-created_date', 50);
    setRooms(updated);
  };

  const isInRoom = (room) => user && JSON.parse(room.listeners || '[]').includes(user.email);
  const isHost = (room) => user && room.host_email === user.email;

  const handleAgoraLeave = async () => {
    if (activeRoom) await handleLeave(activeRoom);
    setActiveRoom(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <>
    {activeRoom && <AgoraRoom room={activeRoom} user={user} onLeave={handleAgoraLeave} />}
    <div className="min-h-screen text-white pb-24 relative overflow-y-auto" style={{ backgroundColor: '#080810' }}>
      <AppBackground />

      {/* Hero Header */}
      <div className="relative z-10" style={{ background: 'linear-gradient(135deg, #c2185b 0%, #e91e8c 50%, #9c27b0 100%)' }}>
        <div className="px-4 pt-4 pb-5">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Mic size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Glow Talk</h1>
                <p className="text-xs text-white/70">Live audio rooms for the community</p>
              </div>
            </div>
            <button
              onClick={() => { if (!user) { navigate('/onboarding'); return; } setShowCreate(true); }}
              className="px-4 py-2 rounded-full font-bold text-sm bg-white/20 hover:bg-white/30 transition border border-white/30"
            >
              + Create
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white font-medium">{liveRooms.length} rooms live now</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5">
              <span>📅</span>
              <span className="text-white font-medium">{scheduledRooms.length} upcoming</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 pt-4">
        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white/5 rounded-2xl p-1">
          {[
            { id: 'live', label: 'Live Now', icon: '🔴' },
            { id: 'scheduled', label: 'Scheduled', icon: '📅' },
            { id: 'recordings', label: 'Recordings', icon: '🎙️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === tab.id ? 'bg-white/15 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Room List */}
        {displayRooms.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">
              {activeTab === 'live' ? '🎧' : activeTab === 'scheduled' ? '📅' : '🎙️'}
            </div>
            <p className="text-white font-semibold text-lg mb-1">
              {activeTab === 'live' ? 'No live rooms right now' : activeTab === 'scheduled' ? 'No upcoming rooms' : 'No recordings yet'}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {activeTab === 'live' ? 'Be the first to start a conversation!' :
               activeTab === 'scheduled' ? 'Check back soon or create a room.' :
               'Recordings from Ms. Glow Live and Mentor Talk will appear here.'}
            </p>
            {activeTab === 'live' && (
              <button
                onClick={() => { if (!user) { navigate('/onboarding'); return; } setShowCreate(true); }}
                className="px-6 py-3 rounded-full font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
              >
                + Start a Room
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayRooms.map(room => {
              const inRoom = isInRoom(room);
              const host = isHost(room);
              const listeners = JSON.parse(room.listeners || '[]');
              return (
                <div key={room.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {room.status === 'live' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> LIVE
                          </span>
                        )}
                        {room.status === 'scheduled' && (
                          <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full px-2 py-0.5">
                            📅 SCHEDULED
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 bg-white/5 rounded-full px-2 py-0.5">
                          {CATEGORY_EMOJIS[room.category] || '💬'} {room.category}
                        </span>
                        {!room.is_public && <Lock size={10} className="text-gray-400" />}
                      </div>
                      <h3 className="font-bold text-white text-base leading-tight">{room.title}</h3>
                      {room.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{room.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Mic size={12} /> {room.host_name || 'Host'}</span>
                      <span className="flex items-center gap-1"><Users size={12} /> {room.listener_count || 0} listeners</span>
                      <span className="text-[10px] bg-white/5 rounded-full px-2 py-0.5">{room.room_type}</span>
                    </div>
                    {room.status === 'live' && (
                      inRoom ? (
                        <button
                          onClick={() => handleLeave(room)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition"
                        >
                          {host ? 'End Room' : 'Leave'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoin(room)}
                          disabled={joining === room.id}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold text-white transition disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
                        >
                          {joining === room.id ? '...' : 'Join Room'}
                        </button>
                      )
                    )}
                    {room.status === 'scheduled' && room.scheduled_at && (
                      <span className="text-xs text-blue-300">{new Date(room.scheduled_at).toLocaleDateString()} {new Date(room.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4" onClick={() => setShowCreate(false)}>
          <div
            className="w-full rounded-3xl flex flex-col max-h-[85vh]"
            style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <h3 className="text-lg font-bold">Create a Room</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreate}
                  disabled={!newRoom.title.trim()}
                  className="px-4 py-2 rounded-full font-bold text-white text-sm disabled:opacity-40 transition"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
                >
                  Go Live ✨
                </button>
                <button onClick={() => setShowCreate(false)}><X size={20} className="text-gray-400" /></button>
              </div>
            </div>
            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Room Title *</label>
                <input
                  value={newRoom.title}
                  onChange={e => setNewRoom({ ...newRoom, title: e.target.value })}
                  placeholder="e.g. Building Confidence in High School"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Topic / Description</label>
                <textarea
                  value={newRoom.description}
                  onChange={e => setNewRoom({ ...newRoom, description: e.target.value })}
                  placeholder="What will you discuss?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none resize-none min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">Category</label>
                  <select
                    value={newRoom.category}
                    onChange={e => setNewRoom({ ...newRoom, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#1a0a2e' }}>{CATEGORY_EMOJIS[c]} {c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">Room Type</label>
                  <select
                    value={newRoom.room_type}
                    onChange={e => setNewRoom({ ...newRoom, room_type: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
                  >
                    {ROOM_TYPES.map(t => <option key={t} value={t} style={{ background: '#1a0a2e' }}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 mb-1 block">Schedule (optional)</label>
                  <input
                    type="datetime-local"
                    value={newRoom.scheduled_at}
                    onChange={e => setNewRoom({ ...newRoom, scheduled_at: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 mb-1 block">Max Listeners</label>
                  <select
                    value={newRoom.max_listeners}
                    onChange={e => setNewRoom({ ...newRoom, max_listeners: e.target.value === 'Unlimited' ? 9999 : Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-white text-xs outline-none"
                  >
                    {MAX_OPTIONS.map(m => <option key={m} value={m} style={{ background: '#1a0a2e' }}>{m} {m !== 'Unlimited' ? 'listeners' : ''}</option>)}
                  </select>
                </div>
              </div>
              <button
                onClick={() => setNewRoom({ ...newRoom, is_public: !newRoom.is_public })}
                className={`flex items-center gap-3 w-full p-4 rounded-2xl border transition ${newRoom.is_public ? 'border-pink-500/40 bg-pink-500/10' : 'border-white/10 bg-white/5'}`}
              >
                <div className={`w-11 h-6 rounded-full flex items-center transition-all ${newRoom.is_public ? 'bg-pink-500' : 'bg-gray-600'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${newRoom.is_public ? 'ml-5' : 'ml-0.5'}`} />
                </div>
                <div className="flex items-center gap-2">
                  {newRoom.is_public ? <Globe size={16} className="text-pink-400" /> : <Lock size={16} className="text-gray-400" />}
                  <span className="font-semibold text-sm">{newRoom.is_public ? 'Public Room' : 'Private Room'}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
    </>
  );
}