import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Users, MessageCircle, Calendar, Star, Settings, Plus, Send, Heart, MoreVertical, Mail, Copy, Flag, Check, Image, X as XIcon, Upload, BarChart2, Trash2 } from 'lucide-react';

const COMMUNITY_TYPES = {
  school: { emoji: '🏫', color: '#ec4899' },
  organization: { emoji: '🏢', color: '#a855f7' },
  location: { emoji: '📍', color: '#f59e0b' },
  interest: { emoji: '💜', color: '#8b5cf6' },
};

const TABS = [
  { id: 'feed', label: 'Feed', icon: MessageCircle },
  { id: 'polls', label: 'Polls', icon: BarChart2 },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'about', label: 'About', icon: Star },
];

export default function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [community, setCommunity] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ name: '', description: '' });
  const [savingSettings, setSavingSettings] = useState(false);
  const [profiles, setProfiles] = useState({});
  const [iconUploading, setIconUploading] = useState(false);
  const [polls, setPolls] = useState([]);
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [submittingPoll, setSubmittingPoll] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load community
      const comm = await base44.entities.Community.get(id);
      setCommunity(comm);

      // Check membership
      const membership = await base44.entities.CommunityMember.filter({ community_id: id, user_email: currentUser.email });
      setIsMember(membership.length > 0);
      setIsAdmin(membership.length > 0 && membership[0].role === 'admin');

      // Load posts (feed only - exclude chat messages)
      const communityPosts = await base44.entities.CommunityPost.filter({ community_id: id }, '-created_date');
      // Only show approved posts (or user's own pending posts)
      const visiblePosts = communityPosts.filter(p => p.status === 'approved' || (p.status === 'pending' && p.user_email === user.email));
      setPosts(visiblePosts.filter(p => p.post_type !== 'chat'));

      // Load members
      const communityMembers = await base44.entities.CommunityMember.filter({ community_id: id });
      setMembers(communityMembers);
      // Load member profiles
      const profilesList = await base44.entities.UserProfile.filter({});
      const pm = {};
      profilesList.forEach(p => { pm[p.user_email] = p; });
      setProfiles(pm);

      // Load events
      const communityEvents = await base44.entities.CommunityEvent.filter({ community_id: id }, '-event_date');
      setEvents(communityEvents);

      // Calculate recent activity (posts + new members in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentPosts = communityPosts.filter(p => new Date(p.created_date) > sevenDaysAgo);
      const recentMembers = communityMembers.filter(m => new Date(m.joined_date) > sevenDaysAgo);
      
      // Calculate growth metrics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const membersLast30Days = communityMembers.filter(m => new Date(m.joined_date) > thirtyDaysAgo).length;
      const membersPrevious30Days = communityMembers.filter(m => {
        const d = new Date(m.joined_date);
        return d <= thirtyDaysAgo && d > new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000);
      }).length;
      const growthRate = membersPrevious30Days > 0 ? Math.round(((membersLast30Days - membersPrevious30Days) / membersPrevious30Days) * 100) : membersLast30Days > 0 ? 100 : 0;
      
      setRecentActivity([
        { type: 'posts', count: recentPosts.length, label: 'New Posts' },
        { type: 'members', count: recentMembers.length, label: 'New Members' },
        { type: 'growth', count: growthRate > 0 ? `+${growthRate}%` : `${growthRate}%`, label: 'Growth' },
      ]);

      // Load polls
      const communityPolls = await base44.entities.CommunityPoll.filter({ community_id: id }, '-created_date').catch(() => []);
      setPolls(communityPolls);

      // Load chat messages (separate from feed)
    } catch (error) {
      console.error('Error loading community:', error);
    }
  }

  async function handleJoin() {
    if (!user || !community) return;
    await base44.entities.CommunityMember.create({
      community_id: id,
      user_email: user.email,
      role: 'member',
      joined_date: new Date().toISOString(),
    });
    // Update member count
    await base44.entities.Community.update(id, { member_count: (community.member_count || 0) + 1 });
    setIsMember(true);
    loadData();
  }

  async function handleLeave() {
    if (!user) return;
    const membership = await base44.entities.CommunityMember.filter({ community_id: id, user_email: user.email });
    if (membership.length > 0) {
      await base44.entities.CommunityMember.delete(membership[0].id);
      const comm = await base44.entities.Community.get(id);
      await base44.entities.Community.update(id, { member_count: Math.max(0, (comm.member_count || 1) - 1) });
      setIsMember(false);
      loadData();
    }
  }

  async function handleCreatePost() {
    if (!newPost.trim() && !mediaFile) return;
    if (!user) return;
    
    // Check for banned words BEFORE posting
    if (newPost.trim()) {
      try {
        const banCheck = await base44.functions.invoke('checkBannedWords', { content: newPost.trim() });
        if (banCheck.blocked) {
          alert('Your message contains inappropriate language. Please remove the flagged words and try again. 💜');
          return;
        }
        if (banCheck.flagged) {
          // Post will be created but flagged for review
          alert('Your post contains flagged content and will be reviewed by admins. 💜');
        }
        if (banCheck.replaced) {
          // TODO: Implement word replacement logic
          alert('Some words in your message have been replaced. 💜');
        }
      } catch (e) {
        console.error('Banned word check failed:', e);
        // Continue posting even if check fails (fail-safe)
      }
    }
    
    setUploading(true);
    let media_url = null;
    if (mediaFile) {
      const res = await base44.integrations.Core.UploadFile({ file: mediaFile });
      media_url = res.file_url;
    }
    
    // Check if moderation is enabled
    let status = 'approved'; // Default to auto-approve for backwards compatibility
    try {
      const modSettings = await base44.entities.ContentModerationSettings.list();
      if (modSettings.length > 0 && modSettings[0].community_require_approval) {
        status = 'pending';
      }
    } catch (e) {
      console.error('Failed to check moderation settings:', e);
    }
    
    await base44.entities.CommunityPost.create({
      community_id: id,
      user_email: user.email,
      username: user.full_name || user.email.split('@')[0],
      content: newPost,
      likes: 0,
      liked_by: '[]',
      post_type: 'feed',
      status: status,
      ...(media_url && { media_url, media_type: mediaType }),
    });
    setNewPost('');
    setMediaFile(null); setMediaPreview(null); setMediaType(null);
    setShowPostModal(false);
    setUploading(false);
    loadData();
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !user) return;
    // Send invitation email
    await base44.integrations.Core.SendEmail({
      to: inviteEmail,
      subject: `You're invited to join ${community.name}!`,
      body: `Hi! ${user.full_name || user.email.split('@')[0]} has invited you to join ${community.name} on Money Moves. Click here to join: ${window.location.origin}/community-hub/${id}`,
    });
    setInviteEmail('');
    setShowInviteModal(false);
    alert('Invitation sent! 💜');
  }

  async function handleCopyInviteLink() {
    const inviteLink = `${window.location.origin}/community-hub/${id}`;
    await navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied! Share it with your friends 💜');
  }

  async function handleLikePost(postId, likedBy) {
    if (!user) return;
    const likedArray = JSON.parse(likedBy || '[]');
    const isLiked = likedArray.includes(user.email);
    
    let newLikedArray;
    let newLikes;
    
    if (isLiked) {
      newLikedArray = likedArray.filter(email => email !== user.email);
      newLikes = Math.max(0, (posts.find(p => p.id === postId)?.likes || 0) - 1);
    } else {
      newLikedArray = [...likedArray, user.email];
      newLikes = (posts.find(p => p.id === postId)?.likes || 0) + 1;
    }

    await base44.entities.CommunityPost.update(postId, {
      likes: newLikes,
      liked_by: JSON.stringify(newLikedArray),
    });
    loadData();
  }

  async function handleDeletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    await base44.entities.CommunityPost.delete(postId);
    loadData();
  }

  async function handleDeleteCommunity() {
    if (!confirm('Are you sure you want to delete this community? This will remove all posts, members, and events. This action cannot be undone.')) return;
    // Delete all related records first
    const postsToDelete = await base44.entities.CommunityPost.filter({ community_id: id });
    for (const post of postsToDelete) {
      await base44.entities.CommunityPost.delete(post.id);
    }
    const membersToDelete = await base44.entities.CommunityMember.filter({ community_id: id });
    for (const member of membersToDelete) {
      await base44.entities.CommunityMember.delete(member.id);
    }
    const eventsToDelete = await base44.entities.CommunityEvent.filter({ community_id: id });
    for (const event of eventsToDelete) {
      await base44.entities.CommunityEvent.delete(event.id);
    }
    // Delete the community
    await base44.entities.Community.delete(id);
    navigate('/community-hub');
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !user) return;
    await base44.entities.CommunityPost.create({
      community_id: id,
      user_email: user.email,
      username: user.full_name || user.email.split('@')[0],
      content: newMessage,
      likes: 0,
      liked_by: '[]',
      post_type: 'chat',
    });
    setNewMessage('');
    loadData();
  }

  async function handleSaveSettings() {
    if (!community) return;
    setSavingSettings(true);
    await base44.entities.Community.update(id, {
      name: settingsForm.name || community.name,
      description: settingsForm.description || community.description,
    });
    setCommunity(prev => ({ ...prev, name: settingsForm.name || prev.name, description: settingsForm.description || prev.description }));
    setSavingSettings(false);
    setShowSettingsModal(false);
  }

  async function handleRoleChange(memberId, newRole) {
    await base44.entities.CommunityMember.update(memberId, { role: newRole });
    loadData();
    setShowRoleModal(false);
    setSelectedMember(null);
  }

  async function handleVotePoll(poll, optionIndex) {
    if (!user) return;
    const votes = JSON.parse(poll.votes || '{}');
    // Check if already voted
    const alreadyVoted = Object.values(votes).some(arr => arr.includes(user.email));
    if (alreadyVoted) return;
    const key = String(optionIndex);
    votes[key] = [...(votes[key] || []), user.email];
    await base44.entities.CommunityPoll.update(poll.id, { votes: JSON.stringify(votes) });
    setPolls(prev => prev.map(p => p.id === poll.id ? { ...p, votes: JSON.stringify(votes) } : p));
  }

  async function handleCreatePoll() {
    const validOptions = pollOptions.filter(o => o.trim());
    if (!pollQuestion.trim() || validOptions.length < 2 || !user) return;
    setSubmittingPoll(true);
    await base44.entities.CommunityPoll.create({
      community_id: id,
      user_email: user.email,
      username: user.full_name || user.email.split('@')[0],
      question: pollQuestion,
      options: JSON.stringify(validOptions),
      votes: '{}',
      is_active: true,
    });
    setPollQuestion('');
    setPollOptions(['', '']);
    setShowPollModal(false);
    setSubmittingPoll(false);
    loadData();
  }

  async function handleDeletePoll(pollId) {
    if (!confirm('Delete this poll?')) return;
    await base44.entities.CommunityPoll.delete(pollId);
    setPolls(prev => prev.filter(p => p.id !== pollId));
  }

  async function handleReportPost(post) {
    if (!confirm(`Report this post for inappropriate content?\n\nCommunity admins will be notified to review this post.`)) return;
    // Send email notification to community admins
    const adminMembers = members.filter(m => m.role === 'admin');
    for (const admin of adminMembers) {
      await base44.integrations.Core.SendEmail({
        to: admin.user_email,
        subject: `Post Report in ${community.name}`,
        body: `A post has been reported in ${community.name}.\n\nPost by: ${post.username}\nContent: ${post.content}\n\nPlease review and take appropriate action.`,
      });
    }
    alert('Thank you for helping keep our community safe. Admins have been notified. 💜');
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0010' }}>
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const typeInfo = COMMUNITY_TYPES[community.type] || COMMUNITY_TYPES.interest;

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />
      <div className="relative z-10">
        {/* Header */}
        <div className="px-4 pt-4 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={20} /></button>
            <h1 className="text-xl font-bold text-white">Community</h1>
          </div>

          {/* Community Info */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(168,85,247,0.2)', border: `2px solid ${typeInfo.color}` }}>
                  {community.cover_image
                    ? <img src={community.cover_image} alt="" className="w-full h-full object-cover" />
                    : <span>{typeInfo.emoji}</span>}
                </div>
                {(isAdmin || community.created_by === user?.email || user?.role === 'admin') && (
                  <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer" style={{ background: '#ec4899' }}>
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files[0]; if (!file) return;
                      setIconUploading(true);
                      const { file_url } = await base44.integrations.Core.UploadFile({ file });
                      await base44.entities.Community.update(id, { cover_image: file_url });
                      setCommunity(prev => ({ ...prev, cover_image: file_url }));
                      setIconUploading(false);
                    }} />
                    {iconUploading ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : <Upload size={10} className="text-white" />}
                  </label>
                )}
              </div>
              <div className="flex-1">
               <h2 className="text-xl font-bold text-white mb-1">{community.name}</h2>
               <p className="text-xs text-gray-400 mb-2">{community.description}</p>
               <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                 <span className="flex items-center gap-1"><Users size={12} /> {community.member_count || 0} members</span>
                 <span className="flex items-center gap-1"><Star size={12} /> {COMMUNITY_TYPES[community.type]?.label || 'Community'}</span>
               </div>
               {/* Recent Activity Summary */}
               <div className="flex flex-wrap gap-2 text-xs">
                 {recentActivity.map((activity, i) => (
                   <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#d8b4fe' }}>
                     {activity.type === 'posts' ? '💬' : activity.type === 'growth' ? '📈' : '👥'} {activity.count} {activity.label} (7d)
                   </span>
                 ))}
               </div>
              </div>
            </div>

            {isMember ? (
              <button onClick={handleLeave} className="w-full py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                Leave Community
              </button>
            ) : (
              <button onClick={handleJoin} className="w-full py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                Join Community 💜
              </button>
            )}
            
            {/* Invite Button for Members */}
            {isMember && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => setShowInviteModal(true)} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: 'rgba(168,85,247,0.25)', border: '1px solid rgba(168,85,247,0.4)' }}>
                  <Mail size={14} /> Invite
                </button>
                <button onClick={handleCopyInviteLink} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <Copy size={14} /> Copy Link
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
          {TABS.filter(tab => tab.id !== 'chat' || isMember).map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap"
                style={activeTab === tab.id
                  ? { background: 'rgba(139,92,246,0.35)', border: '1px solid rgba(168,85,247,0.5)', color: '#fff' }
                  : { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
                <Icon size={14} />{tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="px-4 pb-6">
          {activeTab === 'chat' && (
            <div className="space-y-3">
              {!isMember ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🔒</div>
                  <p className="text-white font-bold mb-2">Join to Access Chat</p>
                  <p className="text-gray-400 text-sm mb-4">You need to be a member of this community to participate in group conversations</p>
                  <button onClick={handleJoin} className="px-6 py-3 rounded-xl text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                    Join Community 💜
                  </button>
                </div>
              ) : (
            <div className="space-y-3">
              {/* Chat Messages */}
              <div className="space-y-2 mb-4" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                {chatMessages.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-3">💬</div>
                    <p className="text-gray-400 text-sm">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  chatMessages.map(msg => {
                    const isMyMessage = user && msg.user_email === user.email;
                    return (
                      <div key={msg.id} className={`flex gap-2 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                        <button onClick={() => { const p = profiles[msg.user_email]; if (p?.username) navigate(`/glowlink/${p.username}`); }}
                          className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden"
                          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                          {profiles[msg.user_email]?.avatar_url
                            ? <img src={profiles[msg.user_email].avatar_url} alt="" className="w-full h-full object-cover" />
                            : <span className="text-xs font-bold text-white flex items-center justify-center h-full">{msg.username?.[0]?.toUpperCase() || 'U'}</span>}
                        </button>
                        <div className={`max-w-[75%] rounded-2xl p-3 ${isMyMessage ? 'rounded-br-none' : 'rounded-bl-none'}`}
                          style={{ background: isMyMessage ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.08)' }}>
                          <button onClick={() => { const p = profiles[msg.user_email]; if (p?.username) navigate(`/glowlink/${p.username}`); }}
                            className="text-xs font-semibold mb-1 hover:underline text-left block" style={{ color: isMyMessage ? '#fff' : '#d8b4fe' }}>
                            {msg.username}
                          </button>
                          <p className="text-sm text-white">{msg.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="flex gap-2 items-center">
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <button onClick={handleSendMessage} disabled={!newMessage.trim()}
                  className="w-12 h-12 rounded-xl flex items-center justify-center disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                  <Send size={18} className="text-white" />
                </button>
              </div>
            </div>
              )}
            </div>
          )}

          {activeTab === 'polls' && (
            <div className="space-y-4">
              {isMember && (
                <button onClick={() => setShowPollModal(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
                    <Plus size={16} className="text-white" />
                  </div>
                  <p className="text-sm text-gray-400 text-left">Create a poll for the community...</p>
                </button>
              )}
              {polls.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">🗳️</div>
                  <p className="text-gray-400 text-sm">No polls yet. {isMember ? 'Create one!' : 'Join to create polls!'}</p>
                </div>
              ) : (
                polls.map(poll => {
                  const options = JSON.parse(poll.options || '[]');
                  const votes = JSON.parse(poll.votes || '{}');
                  const totalVotes = Object.values(votes).reduce((sum, arr) => sum + arr.length, 0);
                  const myVoteIdx = Object.keys(votes).find(k => votes[k].includes(user?.email));
                  const hasVoted = myVoteIdx !== undefined;
                  return (
                    <div key={poll.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <p className="text-xs text-purple-400 font-semibold mb-1">{poll.username} · {new Date(poll.created_date).toLocaleDateString()}</p>
                          <p className="text-sm font-bold text-white">{poll.question}</p>
                        </div>
                        {(poll.user_email === user?.email || isAdmin) && (
                          <button onClick={() => handleDeletePoll(poll.id)} className="text-gray-500 hover:text-red-400 flex-shrink-0">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {options.map((opt, i) => {
                          const count = (votes[String(i)] || []).length;
                          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                          const isMyVote = String(i) === myVoteIdx;
                          return (
                            <button key={i} onClick={() => !hasVoted && handleVotePoll(poll, i)}
                              disabled={hasVoted}
                              className="w-full rounded-xl overflow-hidden text-left"
                              style={{ border: `1.5px solid ${isMyVote ? '#a855f7' : 'rgba(255,255,255,0.1)'}`, background: isMyVote ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.04)', cursor: hasVoted ? 'default' : 'pointer', position: 'relative' }}>
                              {hasVoted && (
                                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`, background: isMyVote ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.06)', transition: 'width 0.4s ease', borderRadius: 10 }} />
                              )}
                              <div className="relative flex items-center justify-between px-3 py-2.5">
                                <span className="text-sm text-white">{opt}</span>
                                {hasVoted && (
                                  <span className="text-xs font-bold" style={{ color: isMyVote ? '#d8b4fe' : '#9ca3af' }}>{pct}%</span>
                                )}
                                {isMyVote && <Check size={13} className="text-purple-400 ml-1 flex-shrink-0" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-right">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</p>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'feed' && (
            <div className="space-y-4">
              {/* Create Post Button */}
              {isMember && (
                <button onClick={() => setShowPostModal(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">
                      {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 text-left">Share something with the community...</p>
                </button>
              )}

              {/* Posts */}
              {posts.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-gray-400 text-sm">No posts yet. Be the first to share!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map(post => {
                    const likedByArray = JSON.parse(post.liked_by || '[]');
                    const isLiked = user && likedByArray.includes(user.email);
                    return (
                      <div key={post.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="flex items-start gap-3 mb-3">
                          <button onClick={() => { const p = profiles[post.user_email]; if (p?.username) navigate(`/glowlink/${p.username}`); }}
                            className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden"
                            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                            {profiles[post.user_email]?.avatar_url
                              ? <img src={profiles[post.user_email].avatar_url} alt="" className="w-full h-full object-cover" />
                              : <span className="text-xs font-bold text-white flex items-center justify-center h-full">{post.username?.[0]?.toUpperCase() || 'U'}</span>}
                          </button>
                          <div className="flex-1">
                            <button onClick={() => { const p = profiles[post.user_email]; if (p?.username) navigate(`/glowlink/${p.username}`); }}
                              className="text-sm font-semibold text-white hover:text-pink-400 transition text-left">{post.username}</button>
                            <p className="text-xs text-gray-500">{new Date(post.created_date).toLocaleDateString()}</p>
                          </div>
                          <div className="relative">
                            <button className="text-gray-500 hover:text-white"><MoreVertical size={16} /></button>
                            {(post.user_email === user?.email || isAdmin || (members.find(m => m.user_email === user?.email)?.role === 'moderator')) && (
                              <button onClick={() => handleDeletePost(post.id)} className="absolute right-0 top-8 text-xs text-red-400 bg-gray-900 px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-200 mb-3">{post.content}</p>
                        {post.media_url && (
                          post.media_type === 'video'
                            ? <video src={post.media_url} controls className="w-full rounded-xl max-h-56 object-cover mb-3" />
                            : <img src={post.media_url} alt="" className="w-full rounded-xl max-h-56 object-cover mb-3" />
                        )}
                        <div className="flex items-center gap-4">
                          <button onClick={() => handleLikePost(post.id, post.liked_by)}
                            className="flex items-center gap-1.5 text-xs transition"
                            style={{ color: isLiked ? '#ec4899' : '#9ca3af' }}>
                            <Heart size={14} fill={isLiked ? '#ec4899' : 'none'} />
                            {post.likes || 0}
                          </button>
                          <button className="flex items-center gap-1.5 text-xs text-gray-400">
                            <MessageCircle size={14} /> Reply
                          </button>
                          {post.user_email !== user?.email && (
                            <button onClick={() => handleReportPost(post)}
                              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition">
                              <Flag size={14} /> Report
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-2">
              {members.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">👥</div>
                  <p className="text-gray-400 text-sm">No members yet. Invite your friends!</p>
                </div>
              ) : (
                members.map(member => (
                  <div key={member.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                      <span className="text-sm font-bold text-white">
                        {member.user_email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{member.user_email?.split('@')[0] || 'Member'}</p>
                      <p className="text-xs text-gray-500">Joined {new Date(member.joined_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const roleBadges = {
                          admin: { emoji: '👑', label: 'Admin', bg: 'rgba(168,85,247,0.2)', border: 'rgba(168,85,247,0.4)', text: 'text-purple-300' },
                          moderator: { emoji: '🛡️', label: 'Moderator', bg: 'rgba(59,130,246,0.2)', border: 'rgba(59,130,246,0.4)', text: 'text-blue-300' },
                          member: { emoji: '💜', label: 'Member', bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.2)', text: 'text-gray-400' },
                        };
                        const roleBadge = roleBadges[member.role] || roleBadges.member;
                        return (
                          <>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${roleBadge.text}`}
                              style={{ background: roleBadge.bg, border: `1px solid ${roleBadge.border}` }}>
                              <span className="text-xs">{roleBadge.emoji}</span>
                              {roleBadge.label}
                            </span>
                            {isAdmin && member.user_email !== user?.email && (
                              <button onClick={() => { setSelectedMember(member); setShowRoleModal(true); }}
                                className="text-xs text-gray-400 hover:text-white px-2 py-1">
                                Edit
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-gray-400 text-sm">No upcoming events</p>
                  {isAdmin && (
                    <button onClick={() => navigate(`/community-hub/${id}/create-event`)}
                      className="mt-3 text-sm font-semibold text-purple-400">
                      + Create Event
                    </button>
                  )}
                </div>
              ) : (
                events.map(event => (
                  <div key={event.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}>
                        📅
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">{event.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{event.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(event.event_date).toLocaleDateString()}</span>
                          <span>🕐 {event.time || 'TBD'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-bold text-gray-400 mb-2">ABOUT</p>
                <p className="text-sm text-gray-200">{community.description || 'No description available'}</p>
              </div>

              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-bold text-gray-400 mb-2">COMMUNITY TYPE</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{typeInfo.emoji}</span>
                  <span className="text-sm text-white capitalize">{community.type}</span>
                </div>
              </div>

              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-bold text-gray-400 mb-2">FOUNDED</p>
                <p className="text-sm text-white">{new Date(community.created_date).toLocaleDateString()}</p>
              </div>

              {community.rules && (
                <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-xs font-bold text-gray-400 mb-2">COMMUNITY RULES</p>
                  <div className="space-y-1">
                    {JSON.parse(community.rules).map((rule, i) => (
                      <p key={i} className="text-xs text-gray-300">• {rule}</p>
                    ))}
                  </div>
                </div>
              )}

              {(isAdmin || community.created_by === user?.email || user?.role === 'admin') && (
                <div className="space-y-3">
                  <button onClick={() => { setSettingsForm({ name: community.name || '', description: community.description || '' }); setShowSettingsModal(true); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <Settings size={16} /> Manage Community
                  </button>
                  <button onClick={handleDeleteCommunity}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }}>
                    <MoreVertical size={16} /> Delete Community
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Poll Modal */}
      {showPollModal && (
        <div className="fixed inset-0 z-[100]" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowPollModal(false)}>
          <div className="fixed bottom-0 left-0 right-0 rounded-t-3xl" style={{ background: '#1a0a30', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom,0px))' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <p className="font-bold text-white text-lg">Create Poll</p>
              <button onClick={() => setShowPollModal(false)} className="text-gray-400 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-5" style={{ maxHeight: '70vh', overflowY: 'auto', paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom,0px))' }}>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block">Question</label>
                <input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)}
                  placeholder="Ask the community something..."
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">Options (min 2)</label>
                <div className="space-y-2">
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={opt} onChange={e => { const next = [...pollOptions]; next[i] = e.target.value; setPollOptions(next); }}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }} />
                      {pollOptions.length > 2 && (
                        <button onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))} className="text-gray-500 hover:text-red-400">
                          <XIcon size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 6 && (
                    <button onClick={() => setPollOptions([...pollOptions, ''])} className="text-sm text-purple-400 hover:text-purple-300 font-semibold">+ Add option</button>
                  )}
                </div>
              </div>
              <button onClick={handleCreatePoll} disabled={!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2 || submittingPoll}
                className="w-full py-3 rounded-2xl font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                {submittingPoll ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><BarChart2 size={16} /> Post Poll</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-[100]" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowPostModal(false)}>
          <div className="fixed bottom-0 left-0 right-0 flex flex-col max-h-[70vh] mb-20" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-white text-lg">Create Post</p>
                <button onClick={() => setShowPostModal(false)}><ChevronLeft size={20} className="text-gray-400 rotate-180" /></button>
              </div>
              <textarea value={newPost} onChange={e => setNewPost(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }} />
              {mediaPreview && (
                <div className="relative mt-2 rounded-xl overflow-hidden">
                  {mediaType === 'video'
                    ? <video src={mediaPreview} controls className="w-full max-h-40 object-cover rounded-xl" />
                    : <img src={mediaPreview} alt="preview" className="w-full max-h-40 object-cover rounded-xl" />}
                  <button onClick={() => { setMediaFile(null); setMediaPreview(null); setMediaType(null); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center">
                    <XIcon size={13} className="text-white" />
                  </button>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => {
                const f = e.target.files[0]; if (!f) return;
                setMediaFile(f); setMediaType(f.type.startsWith('video/') ? 'video' : 'image');
                setMediaPreview(URL.createObjectURL(f));
              }} />
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition mt-2">
                <Image size={16} /> Add Photo/Video
              </button>
              <button onClick={handleCreatePost} disabled={(!newPost.trim() && !mediaFile) || uploading}
                className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                {uploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={18} /> Post</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100]" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowInviteModal(false)}>
          <div className="fixed bottom-0 left-0 right-0 flex flex-col max-h-[50vh] mb-20" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-white text-lg">Invite Members</p>
                <button onClick={() => setShowInviteModal(false)}><ChevronLeft size={20} className="text-gray-400 rotate-180" /></button>
              </div>
              <p className="text-sm text-gray-400 mb-4">Invite friends to join {community.name} via email</p>
              <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                placeholder="friend@example.com"
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none mb-3"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <p className="text-xs text-gray-500">They'll receive an email with a link to join the community</p>
            </div>
            <div className="border-t border-white/10 p-6 flex-shrink-0">
              <button onClick={handleInvite} disabled={!inviteEmail.trim()}
                className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                <Mail size={18} /> Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Community Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[100]" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowSettingsModal(false)}>
          <div className="fixed bottom-0 left-0 right-0 rounded-t-3xl" style={{ background: '#1a0a30', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom,0px))' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <p className="font-bold text-white text-lg">Manage Community</p>
              <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom,0px))' }}>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block">Community Name</label>
                <input value={settingsForm.name} onChange={e => setSettingsForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block">Description</label>
                <textarea value={settingsForm.description} onChange={e => setSettingsForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <button onClick={handleSaveSettings} disabled={savingSettings}
                className="w-full py-3 rounded-2xl font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                {savingSettings ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save Changes'}
              </button>
              <button onClick={handleDeleteCommunity}
                className="w-full py-3 rounded-2xl font-semibold text-red-400"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                Delete Community
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {showRoleModal && selectedMember && (
        <div className="fixed inset-0 z-[100]" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowRoleModal(false)}>
          <div className="fixed bottom-0 left-0 right-0 flex flex-col max-h-[40vh] mb-20" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-white text-lg">Manage Role</p>
                <button onClick={() => setShowRoleModal(false)}><ChevronLeft size={20} className="text-gray-400 rotate-180" /></button>
              </div>
              <p className="text-sm text-gray-400 mb-4">Change role for {selectedMember.user_email?.split('@')[0]}</p>
              <div className="space-y-2">
                {[
                  { role: 'admin', label: 'Admin', desc: 'Full control over community' },
                  { role: 'moderator', label: 'Moderator', desc: 'Can delete posts and manage members' },
                  { role: 'member', label: 'Member', desc: 'Regular community member' },
                ].map(r => (
                  <button key={r.role} onClick={() => handleRoleChange(selectedMember.id, r.role)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                      selectedMember.role === r.role ? 'bg-purple-500/20 border-purple-500/40' : 'bg-white/5 border-white/10'
                    }`}
                    style={{ border: '1px solid' }}>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{r.label}</p>
                      <p className="text-xs text-gray-400">{r.desc}</p>
                    </div>
                    {selectedMember.role === r.role && (
                      <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                        <Check size={12} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}