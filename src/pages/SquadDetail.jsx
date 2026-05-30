import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Users, Flame, Star, Heart, Trophy, MessageCircle, Plus, X, Crown, Medal, Send, Shield, Megaphone, UserMinus, ChevronDown, Upload } from 'lucide-react';

export default function SquadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [squad, setSquad] = useState(null);
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [isCaptain, setIsCaptain] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInText, setCheckInText] = useState('');
  const [todayCheckIn, setTodayCheckIn] = useState(null);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [squadChallenges, setSquadChallenges] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showCaptainPanel, setShowCaptainPanel] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [announceForm, setAnnounceForm] = useState({ title: '', body: '' });
  const [postingAnnounce, setPostingAnnounce] = useState(false);
  const [savingMember, setSavingMember] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [profiles, setProfiles] = useState({});
  const [checkIns, setCheckIns] = useState([]);
  const [iconUploading, setIconUploading] = useState(false);
  const chatRoomId = `squad_${id}`;

  const loadChatMessages = async () => {
    try {
      const msgs = await base44.entities.ChatMessage.filter({ conversation_id: chatRoomId }, 'timestamp', 60);
      setChatMessages(msgs);
    } catch (e) { console.error('Chat load error', e); }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || sendingMsg) return;
    setSendingMsg(true);
    try {
      await base44.entities.ChatMessage.create({
        conversation_id: chatRoomId,
        sender_email: user?.email,
        sender_name: user?.full_name || user?.email?.split('@')[0] || 'Member',
        receiver_email: chatRoomId,
        content: chatInput.trim(),
        timestamp: new Date().toISOString(),
        is_read: false,
      });
      setChatInput('');
      await loadChatMessages();
    } catch (e) { console.error('Send error', e); }
    setSendingMsg(false);
  };

  // Poll chat when open
  useEffect(() => {
    if (!showChat) return;
    setChatLoading(true);
    loadChatMessages().finally(() => setChatLoading(false));
    const interval = setInterval(loadChatMessages, 5000);
    return () => clearInterval(interval);
  }, [showChat]);

  const [newChallenge, setNewChallenge] = useState({
    challenge_name: '',
    challenge_type: 'streak',
    description: '',
    target_value: 7,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const u = await base44.auth.me();
          setUser(u);
          
          const [squads, squadMembers, challenges] = await Promise.all([
            base44.entities.GlowSquad.filter({ id }),
            base44.entities.SquadMember.filter({ squad_id: id }),
            base44.entities.SquadChallenge.filter({ squad_id: id })
          ]);
          
          if (squads.length > 0) {
            setSquad(squads[0]);
            setMembers(squadMembers);
            setIsMember(squadMembers.some(m => m.user_email === u.email));
            setIsCaptain(squadMembers.some(m => m.user_email === u.email && m.role === 'captain'));
            setSquadChallenges(challenges);
            // Fetch member profiles
            const profilesList = await base44.entities.UserProfile.filter({});
            const pm = {};
            profilesList.forEach(p => { pm[p.user_email] = p; });
            setProfiles(pm);
            // Fetch squad check-ins
            const allAnns = await base44.entities.Announcement.filter({ group_id: id });
            setCheckIns(allAnns.filter(a => a.status === 'checkin').sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
          }
        }
      } catch (err) {
        console.error('Error loading squad:', err);
      }
      setLoading(false);
    };
    
    loadData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  if (!squad) {
    return (
      <div className="min-h-screen text-white pb-24" style={{ backgroundColor: '#080810' }}>
        <AppBackground />
        <div className="px-4 pt-4 text-center">
          <p className="text-gray-400">Squad not found</p>
          <button onClick={() => navigate('/glow-squads')} className="mt-4 px-4 py-2 bg-pink-500 rounded-full">Back to Squads</button>
        </div>
      </div>
    );
  }

  const sortedMembers = [...members].sort((a, b) => b.personal_streak - a.personal_streak);

  const handlePromote = async (member) => {
    setSavingMember(member.id);
    await base44.entities.SquadMember.update(member.id, { role: 'captain' });
    setMembers(prev => prev.map(m => m.id === member.id ? { ...m, role: 'captain' } : m));
    setSavingMember(null);
  };

  const handleDemote = async (member) => {
    setSavingMember(member.id);
    await base44.entities.SquadMember.update(member.id, { role: 'member' });
    setMembers(prev => prev.map(m => m.id === member.id ? { ...m, role: 'member' } : m));
    setSavingMember(null);
  };

  const handleRemoveMember = async (member) => {
    if (!confirm(`Remove ${member.user_email?.split('@')[0]} from the squad?`)) return;
    setSavingMember(member.id);
    await base44.entities.SquadMember.delete(member.id);
    setMembers(prev => prev.filter(m => m.id !== member.id));
    await base44.entities.GlowSquad.update(squad.id, { member_count: Math.max(0, squad.member_count - 1) });
    setSavingMember(null);
  };

  const handlePostAnnouncement = async () => {
    if (!announceForm.title.trim() || !announceForm.body.trim()) return;
    setPostingAnnounce(true);
    await base44.entities.Announcement.create({
      title: announceForm.title.trim(),
      body: announceForm.body.trim(),
      send_to: 'specific_group',
      group_id: squad.id,
      sent_by: user.email,
      sent_date: new Date().toISOString(),
      status: 'sent',
    });
    setAnnounceForm({ title: '', body: '' });
    setPostingAnnounce(false);
    setShowAnnounceModal(false);
    alert('Announcement posted to your squad! 📣');
  };

  return (
    <div className="min-h-screen text-white pb-24 relative overflow-y-auto" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10">

        {/* Header */}
        <div className="sticky top-0 z-20 backdrop-blur-md bg-black/30 border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold">{squad.name}</h1>
              <p className="text-xs text-gray-400">Private Squad</p>
            </div>
            {!isMember ? (
              <button
                onClick={async () => {
                  if (squad.member_count >= squad.max_members) {
                    alert('Squad is full!');
                    return;
                  }
                  await base44.entities.SquadMember.create({
                    squad_id: squad.id,
                    user_email: user.email,
                    role: 'member',
                    joined_date: new Date().toISOString(),
                    personal_streak: 0,
                  });
                  setIsMember(true);
                  setMembers(prev => [...prev, { user_email: user.email, role: 'member', personal_streak: 0 }]);
                  await base44.entities.GlowSquad.update(squad.id, { member_count: squad.member_count + 1 });
                }}
                className="px-4 py-2 rounded-full font-bold text-white text-sm bg-pink-500 hover:bg-pink-600 transition"
              >
                Join Squad
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                ✓ Member
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-4 space-y-6">

          {/* Squad Stats Card */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-pink-900/30 to-purple-900/30 border border-pink-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
                  {squad.cover_image
                    ? <img src={squad.cover_image} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">{squad.emoji || '💜'}</div>}
                </div>
                {isCaptain && (
                  <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer" style={{ background: '#ec4899' }}>
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files[0]; if (!file) return;
                      setIconUploading(true);
                      const { file_url } = await base44.integrations.Core.UploadFile({ file });
                      await base44.entities.GlowSquad.update(squad.id, { cover_image: file_url });
                      setSquad(prev => ({ ...prev, cover_image: file_url }));
                      setIconUploading(false);
                    }} />
                    {iconUploading ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : <Upload size={10} className="text-white" />}
                  </label>
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-white text-lg">{squad.name}</h2>
                <p className="text-xs text-gray-400">{squad.description || 'Your intimate circle'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 rounded-xl bg-white/5">
                <Users className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                <p className="font-bold text-white">{squad.member_count || members.length}</p>
                <p className="text-[10px] text-gray-400">Members</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/5">
                <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <p className="font-bold text-white">{squad.current_streak || 0}</p>
                <p className="text-[10px] text-gray-400">Day Streak</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/5">
                <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="font-bold text-white">{squad.squad_points || 0}</p>
                <p className="text-[10px] text-gray-400">Squad Points</p>
              </div>
            </div>

            {/* Daily Check-in Button */}
            {isMember && (
              <button
                onClick={() => setShowCheckIn(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition"
              >
                <Heart size={16} /> Daily Squad Check-in
              </button>
            )}
          </div>

          {/* Member Leaderboard */}
          <div>
            <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-3 flex items-center gap-2">
              <Trophy size={16} className="text-yellow-400" /> MEMBER LEADERBOARD
            </h3>
            <div className="space-y-2">
              {sortedMembers.map((member, idx) => (
                <div key={member.id || idx} className={`flex items-center gap-3 p-3 rounded-xl border ${
                  member.user_email === user.email 
                    ? 'bg-pink-500/10 border-pink-500/30' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="w-8 flex-shrink-0 text-center">
                    {idx === 0 ? <Crown className="text-yellow-400" size={20} /> :
                     idx === 1 ? <Medal className="text-gray-400" size={20} /> :
                     idx === 2 ? <Medal className="text-amber-600" size={20} /> :
                     <span className="text-sm font-bold text-gray-400">#{idx + 1}</span>}
                  </div>
                  <button onClick={() => { const p = profiles[member.user_email]; if (p?.username) navigate(`/glowlink/${p.username}`); }}
                    className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
                    {profiles[member.user_email]?.avatar_url
                      ? <img src={profiles[member.user_email].avatar_url} alt="" className="w-full h-full object-cover" />
                      : <span className="text-sm font-bold text-white flex items-center justify-center h-full">{member.user_email?.[0]?.toUpperCase() || 'M'}</span>}
                  </button>
                  <div className="flex-1">
                    <button onClick={() => { const p = profiles[member.user_email]; if (p?.username) navigate(`/glowlink/${p.username}`); }}
                      className="text-sm font-semibold text-white hover:text-pink-400 transition text-left">
                      {profiles[member.user_email]?.username || member.user_email?.split('@')[0] || 'Member'}
                      {member.role === 'captain' && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">Captain</span>}
                    </button>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Flame size={10} /> {member.personal_streak} day streak</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-pink-400">{member.personal_streak}</p>
                    <p className="text-[10px] text-gray-400">streak</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Squad Check-In Feed */}
          {isMember && checkIns.length > 0 && (
            <div>
              <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <Heart size={16} className="text-pink-400" /> SQUAD CHECK-INS
              </h3>
              <div className="space-y-2">
                {checkIns.map(ci => {
                  const profile = profiles[ci.sent_by];
                  return (
                    <div key={ci.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                      <button onClick={() => profile?.username && navigate(`/glowlink/${profile.username}`)}
                        className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden"
                        style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
                        {profile?.avatar_url
                          ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          : <span className="text-xs font-bold text-white flex items-center justify-center h-full">{(ci.sent_by || 'M')[0].toUpperCase()}</span>}
                      </button>
                      <div className="flex-1">
                        <button onClick={() => profile?.username && navigate(`/glowlink/${profile.username}`)}
                          className="text-xs font-bold text-pink-400 hover:underline">
                          {profile?.username || ci.sent_by?.split('@')[0] || 'Member'}
                        </button>
                        <p className="text-sm text-gray-200 mt-0.5">{ci.body}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{new Date(ci.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Captain Panel */}
          {isCaptain && (
            <div>
              <button
                onClick={() => setShowCaptainPanel(!showCaptainPanel)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-purple-500/30 bg-purple-500/10 mb-2"
              >
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-purple-400" />
                  <span className="text-sm font-bold text-purple-300">Captain Controls</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">Captain</span>
                </div>
                <ChevronDown size={16} className={`text-purple-400 transition-transform ${showCaptainPanel ? 'rotate-180' : ''}`} />
              </button>

              {showCaptainPanel && (
                <div className="rounded-2xl border border-purple-500/20 bg-purple-900/10 p-4 space-y-4">

                  {/* Post Announcement */}
                  <button
                    onClick={() => setShowAnnounceModal(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/15 transition text-left"
                  >
                    <Megaphone size={18} className="text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-300">Post Squad Announcement</p>
                      <p className="text-xs text-gray-400">Send a message to all squad members</p>
                    </div>
                  </button>

                  {/* Member Management */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 tracking-widest mb-2">MANAGE MEMBERS</p>
                    <div className="space-y-2">
                      {members.filter(m => m.user_email !== user.email).map(member => (
                        <div key={member.id} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {member.user_email?.[0]?.toUpperCase() || 'M'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{member.user_email?.split('@')[0]}</p>
                            <p className="text-[10px] text-gray-500">{member.role === 'captain' ? '👑 Captain' : '👤 Member'}</p>
                          </div>
                          {savingMember === member.id ? (
                            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <div className="flex items-center gap-1">
                              {member.role === 'member' ? (
                                <button
                                  onClick={() => handlePromote(member)}
                                  className="text-[10px] px-2 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition"
                                >
                                  Promote
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleDemote(member)}
                                  className="text-[10px] px-2 py-1 rounded-full font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30 transition"
                                >
                                  Demote
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveMember(member)}
                                className="p-1 rounded-full text-red-400 hover:bg-red-500/20 transition"
                              >
                                <UserMinus size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Squad Challenges */}
          {isMember && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold tracking-widest text-gray-400 flex items-center gap-2">
                  <Trophy size={16} className="text-yellow-400" /> SQUAD CHALLENGES
                </h3>
                <button
                  onClick={() => setShowCreateChallenge(true)}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold bg-pink-500 hover:bg-pink-600 transition flex items-center gap-1"
                >
                  <Plus size={12} /> Create
                </button>
              </div>
              {squadChallenges.length === 0 ? (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <p className="text-sm text-gray-400">No challenges yet. Create your first squad challenge!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {squadChallenges.map(challenge => (
                    <div key={challenge.id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-white text-sm">{challenge.challenge_name}</p>
                          <p className="text-xs text-gray-400">{challenge.description}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          challenge.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          challenge.status === 'ended' ? 'bg-gray-500/20 text-gray-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {challenge.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                        <span className="flex items-center gap-1"><Flame size={10} /> {challenge.challenge_type}</span>
                        <span>Target: {challenge.target_value}</span>
                        <span>Ends: {new Date(challenge.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-pink-500 to-purple-600" style={{ width: '0%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Squad Progress */}
          <div>
            <h3 className="text-sm font-bold tracking-widest text-gray-400 mb-3 flex items-center gap-2">
              <Star size={16} className="text-purple-400" /> SQUAD PROGRESS
            </h3>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Challenges Completed</span>
                <span className="text-sm font-bold text-white">{squad.challenges_completed || 0}</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 to-purple-600" style={{ width: `${Math.min((squad.challenges_completed || 0) * 10, 100)}%` }} />
              </div>
            </div>
          </div>

        </div>

        {/* Check-in Modal */}
        {showCheckIn && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowCheckIn(false)}>
            <div
              className="w-full rounded-t-3xl flex flex-col max-h-[90vh] h-full"
              style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
                <h3 className="text-lg font-bold">Daily Check-in</h3>
                <button onClick={() => setShowCheckIn(false)}><X size={20} /></button>
              </div>
              <div className="overflow-y-auto p-6 space-y-4 flex-1">
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">How's your squad doing today?</label>
                  <textarea
                    value={checkInText}
                    onChange={e => setCheckInText(e.target.value)}
                    placeholder="Share your progress, wins, or challenges..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none resize-none min-h-24"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!checkInText.trim()) return;
                    await base44.entities.Announcement.create({
                      title: checkInText.trim(),
                      body: checkInText.trim(),
                      send_to: 'specific_group',
                      group_id: squad.id,
                      sent_by: user.email,
                      sent_date: new Date().toISOString(),
                      status: 'checkin',
                    });
                    const updated = await base44.entities.Announcement.filter({ group_id: id });
                    setCheckIns(updated.filter(a => a.status === 'checkin').sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
                    setCheckInText('');
                    setShowCheckIn(false);
                  }}
                  className="w-full py-3 rounded-2xl font-bold text-white text-sm bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition"
                >
                  Check In 💜
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Announce Modal */}
        {showAnnounceModal && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={() => setShowAnnounceModal(false)}>
            <div
              className="w-full rounded-t-3xl"
              style={{ background: '#1a0a2e', border: '1px solid rgba(234,179,8,0.3)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Megaphone size={18} className="text-yellow-400" />
                  <h3 className="text-lg font-bold text-white">Squad Announcement</h3>
                </div>
                <button onClick={() => setShowAnnounceModal(false)}><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4" style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom,0px))' }}>
                       <div>
                        <label className="text-sm font-semibold text-gray-300 mb-2 block">Title *</label>
                  <input
                    value={announceForm.title}
                    onChange={e => setAnnounceForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g., This week's challenge focus 🔥"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">Message *</label>
                  <textarea
                    value={announceForm.body}
                    onChange={e => setAnnounceForm(f => ({ ...f, body: e.target.value }))}
                    placeholder="Motivate your squad, share goals, or give updates..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none resize-none min-h-28"
                  />
                </div>
                <button
                  onClick={handlePostAnnouncement}
                  disabled={!announceForm.title.trim() || !announceForm.body.trim() || postingAnnounce}
                  className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition"
                  style={{ background: 'linear-gradient(135deg,#eab308,#f59e0b)' }}
                >
                  {postingAnnounce ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Megaphone size={16} /> Post Announcement</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Challenge Modal */}
        {showCreateChallenge && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowCreateChallenge(false)}>
            <div
              className="w-full rounded-t-3xl flex flex-col max-h-[90vh] h-full"
              style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
                <h3 className="text-lg font-bold">Create Squad Challenge</h3>
                <button onClick={() => setShowCreateChallenge(false)}><X size={20} /></button>
              </div>
              <div className="overflow-y-auto p-6 space-y-4 flex-1">
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">Challenge Name *</label>
                  <input
                    value={newChallenge.challenge_name}
                    onChange={e => setNewChallenge({ ...newChallenge, challenge_name: e.target.value })}
                    placeholder="e.g., 7 Day Streak Challenge"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">Challenge Type *</label>
                  <select
                    value={newChallenge.challenge_type}
                    onChange={e => setNewChallenge({ ...newChallenge, challenge_type: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
                  >
                    <option value="streak">🔥 Streak Challenge</option>
                    <option value="points">⭐ Points Challenge</option>
                    <option value="challenges">✓ Challenges Completed</option>
                    <option value="checkins">📅 Daily Check-ins</option>
                    <option value="custom">✨ Custom Challenge</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">Description</label>
                  <textarea
                    value={newChallenge.description}
                    onChange={e => setNewChallenge({ ...newChallenge, description: e.target.value })}
                    placeholder="What's the goal?"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none resize-none min-h-20"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">Target Value *</label>
                  <input
                    type="number"
                    value={newChallenge.target_value}
                    onChange={e => setNewChallenge({ ...newChallenge, target_value: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 block">Start Date *</label>
                    <input
                      type="date"
                      value={newChallenge.start_date}
                      onChange={e => setNewChallenge({ ...newChallenge, start_date: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-300 mb-2 block">End Date *</label>
                    <input
                      type="date"
                      value={newChallenge.end_date}
                      onChange={e => setNewChallenge({ ...newChallenge, end_date: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!newChallenge.challenge_name.trim()) return;
                    await base44.entities.SquadChallenge.create({
                      squad_id: squad.id,
                      challenge_name: newChallenge.challenge_name,
                      challenge_type: newChallenge.challenge_type,
                      description: newChallenge.description,
                      target_value: newChallenge.target_value,
                      start_date: newChallenge.start_date,
                      end_date: newChallenge.end_date,
                      created_by: user.email,
                      status: 'active',
                    });
                    setShowCreateChallenge(false);
                    setNewChallenge({
                      challenge_name: '',
                      challenge_type: 'streak',
                      description: '',
                      target_value: 7,
                      start_date: new Date().toISOString().split('T')[0],
                      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    });
                    const updated = await base44.entities.SquadChallenge.filter({ squad_id: squad.id });
                    setSquadChallenges(updated);
                    alert("Challenge created! Let's go! 💜");
                  }}
                  className="w-full py-3 rounded-2xl font-bold text-white text-sm bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition"
                >
                  Create Challenge 🏆
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Floating Chat Button */}
      {isMember && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)', boxShadow: '0 4px 20px rgba(236,72,153,0.4)' }}
        >
          <MessageCircle size={22} />
        </button>
      )}

      {/* Squad Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end">
          <div
            className="w-full flex flex-col"
            style={{ height: '85vh', background: '#0f0a1e', borderTop: '1px solid rgba(168,85,247,0.3)', borderRadius: '24px 24px 0 0' }}
          >
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 flex-shrink-0">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ background: 'rgba(168,85,247,0.2)' }}>
                {squad.emoji || '💜'}
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">{squad.name} · Squad Chat</p>
                <p className="text-[10px] text-gray-500">{members.length} members · coordinate your goals 🔥</p>
              </div>
              <button onClick={() => setShowChat(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {chatLoading && chatMessages.length === 0 ? (
                <div className="flex justify-center pt-8">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="text-4xl mb-3">💬</span>
                  <p className="font-bold text-white text-sm mb-1">No messages yet</p>
                  <p className="text-xs text-gray-500">Be the first to motivate your squad!</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const isMe = msg.sender_email === user?.email;
                  return (
                    <div key={idx} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <button onClick={() => { const p = profiles[msg.sender_email]; if (p?.username) navigate(`/glowlink/${p.username}`); }}
                        className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold"
                        style={{ background: isMe ? 'linear-gradient(135deg,#ec4899,#a855f7)' : 'rgba(255,255,255,0.1)' }}>
                        {profiles[msg.sender_email]?.avatar_url
                          ? <img src={profiles[msg.sender_email].avatar_url} alt="" className="w-full h-full object-cover" />
                          : (msg.sender_name || msg.sender_email || 'M')[0].toUpperCase()}
                      </button>
                      <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                        {!isMe && <p className="text-[10px] text-gray-500 px-1">{msg.sender_name || msg.sender_email?.split('@')[0]}</p>}
                        <div className="px-3 py-2 rounded-2xl text-sm"
                          style={{ background: isMe ? 'linear-gradient(135deg,#ec4899,#a855f7)' : 'rgba(255,255,255,0.08)', color: 'white' }}>
                          {msg.message || msg.content}
                        </div>
                        <p className="text-[9px] text-gray-600 px-1">
                          {msg.created_date ? new Date(msg.created_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/10 flex-shrink-0" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom,0px))' }}>
              <div className="flex items-center gap-2 rounded-2xl px-4 py-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(168,85,247,0.3)' }}>
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                  placeholder="Motivate your squad... 💜"
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || sendingMsg}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}
                >
                  {sendingMsg ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}