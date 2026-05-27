import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Plus, Users, MapPin, Building2, School, Heart, MessageCircle, Search } from 'lucide-react';
import useAgeGroup from '@/lib/useAgeGroup';

const COMMUNITY_TYPES = [
  { id: 'school', label: 'School', emoji: '🏫', icon: School, color: '#ec4899' },
  { id: 'organization', label: 'Organization', emoji: '🏢', icon: Building2, color: '#a855f7' },
  { id: 'location', label: 'Location', emoji: '📍', icon: MapPin, color: '#f59e0b' },
  { id: 'interest', label: 'Interest Group', emoji: '💜', icon: Heart, color: '#8b5cf6' },
];

const FEATURED_COMMUNITIES = [
  { id: 1, name: 'GGU University', type: 'school', members: 1250, emoji: '🎓', description: 'Official GGU University community' },
  { id: 2, name: 'Teen Entrepreneurs', type: 'interest', members: 890, emoji: '💼', description: 'Young girls building businesses' },
  { id: 3, name: 'Los Angeles Glowers', type: 'location', members: 567, emoji: '🌴', description: 'Glow girls in LA' },
  { id: 4, name: 'STEM Sisters', type: 'interest', members: 2340, emoji: '🔬', description: 'Girls in science and tech' },
];

export default function CommunityHub() {
  const navigate = useNavigate();
  const { ageGroup, worldInfo, filterForWorld } = useAgeGroup();
  const [user, setUser] = useState(null);
  const [myCommunities, setMyCommunities] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: '', type: 'school', description: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [allCommunities, setAllCommunities] = useState([]);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Fetch all communities
      base44.entities.Community.filter({}).then(comms => {
        const worldComms = filterForWorld(comms);
        setAllCommunities(worldComms);
        // Set my communities (where user is member)
        base44.entities.CommunityMember.filter({ user_email: u.email }).then(memberships => {
          const myCommIds = memberships.map(m => m.community_id);
          setMyCommunities(comms.filter(c => myCommIds.includes(c.id)));
        });
      });
    }).catch(() => {});
  }, []);

  async function handleCreateCommunity() {
    if (!newCommunity.name || !user) return;
    const community = await base44.entities.Community.create({
      name: newCommunity.name,
      type: newCommunity.type,
      description: newCommunity.description,
      created_by: user.email,
      member_count: 1,
      is_public: true,
      age_group: ageGroup || undefined,
    });
    setMyCommunities(prev => [...prev, community]);
    setNewCommunity({ name: '', type: 'school', description: '' });
    setShowCreateModal(false);
  }

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />
      <div className="relative z-10">
        {/* World Banner */}
        {worldInfo && (
          <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5 mx-4 mt-4" style={{ background: worldInfo.bgColor, border: `1px solid ${worldInfo.borderColor}` }}>
            <span className="text-lg">{worldInfo.emoji}</span>
            <div>
              <p className="text-xs font-bold" style={{ color: worldInfo.color }}>{worldInfo.label}</p>
              <p className="text-[10px] text-gray-400">Communities in your world only</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-4 pt-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={20} /></button>
            <h1 className="text-2xl font-bold text-white">Community Hub 💜</h1>
          </div>
          <p className="text-sm text-gray-400">Girls lifting girls. Always. 💜</p>
        </div>

        <div className="px-4 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search communities (schools, organizations, locations...)"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          {/* Create Community Banner */}
          <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(236,72,153,0.3))', border: '1px solid rgba(168,85,247,0.5)' }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <Users size={24} className="text-pink-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-base mb-1">Create Your Community</p>
                <p className="text-xs text-gray-300">Start a community for your school, organization, or interest group</p>
              </div>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
              <Plus size={18} /> Create Community
            </button>
          </div>

          {/* My Communities */}
          {myCommunities.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold tracking-widest text-gray-500">MY COMMUNITIES</p>
                <span className="text-xs text-gray-600">{myCommunities.length}</span>
              </div>
              <div className="space-y-2">
                {myCommunities.map(c => (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(168,85,247,0.2)' }}>
                      {COMMUNITY_TYPES.find(t => t.id === c.type)?.emoji || '💜'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.member_count || 1} members</p>
                    </div>
                    <button onClick={() => navigate(`/community-hub/${c.id}`)} className="text-xs font-semibold text-pink-400 px-3 py-1.5 rounded-full" style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)' }}>
                      Open
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results or Featured Communities */}
          {searchQuery.trim() ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold tracking-widest text-gray-500">SEARCH RESULTS</p>
                <span className="text-xs text-gray-600">{allCommunities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length}</span>
              </div>
              <div className="space-y-2">
                {allCommunities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-gray-400 text-sm">No communities found for "{searchQuery}"</p>
                  </div>
                ) : (
                  allCommunities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                    <div key={c.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(168,85,247,0.2)' }}>
                        {COMMUNITY_TYPES.find(t => t.id === c.type)?.emoji || '💜'}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.description || 'Community'}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{c.member_count || 1} members</p>
                      </div>
                      <button onClick={() => navigate(`/community-hub/${c.id}`)} className="text-xs font-semibold text-purple-400 px-3 py-1.5 rounded-full" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                        View
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">FEATURED COMMUNITIES</p>
              <div className="space-y-2">
                {FEATURED_COMMUNITIES.map(c => (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(168,85,247,0.2)' }}>
                      {c.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.description}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{c.members.toLocaleString()} members</p>
                    </div>
                    <button onClick={() => navigate(`/community-hub/${c.id}`)} className="text-xs font-semibold text-purple-400 px-3 py-1.5 rounded-full" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Community Types */}
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500 mb-3">EXPLORE BY TYPE</p>
            <div className="grid grid-cols-2 gap-3">
              {COMMUNITY_TYPES.map(t => {
                const Icon = t.icon;
                return (
                  <div key={t.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={18} style={{ color: t.color }} />
                      <p className="font-bold text-white text-sm">{t.label}</p>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Find communities related to {t.label.toLowerCase()}s</p>
                    <button className="w-full py-2 rounded-lg text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.08)', color: t.color, border: `1px solid ${t.color}30` }}>
                      Browse {t.emoji}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Community Benefits */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(20,10,40,0.8)', border: '1px solid rgba(168,85,247,0.25)' }}>
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle size={18} className="text-purple-400" />
              <p className="font-bold text-purple-300 text-sm">Why Join Communities?</p>
            </div>
            <div className="space-y-2">
              {[
                'Connect with girls who share your interests',
                'Get support and advice from your peers',
                'Share your journey and inspire others',
                'Access exclusive resources and events',
                'Build lasting friendships',
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-pink-400 text-xs mt-0.5">✓</span>
                  <p className="text-xs text-gray-300">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100]" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowCreateModal(false)}>
          <div className="fixed bottom-0 left-0 right-0 flex flex-col max-h-[75vh] mb-20" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-white text-lg">Create Community</p>
                <button onClick={() => setShowCreateModal(false)}><ChevronLeft size={20} className="text-gray-400 rotate-180" /></button>
              </div>

              {/* Community Type */}
              <div>
                <p className="text-xs font-bold text-gray-400 mb-2">What type of community?</p>
                <div className="grid grid-cols-2 gap-2">
                  {COMMUNITY_TYPES.map(t => {
                    const Icon = t.icon;
                    return (
                      <button key={t.id} onClick={() => setNewCommunity(prev => ({ ...prev, type: t.id }))}
                        className="rounded-xl p-3 text-left transition"
                        style={newCommunity.type === t.id
                          ? { background: 'rgba(168,85,247,0.4)', border: '2px solid rgba(168,85,247,0.7)' }
                          : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon size={16} style={{ color: t.color }} />
                          <span className="text-xl">{t.emoji}</span>
                        </div>
                        <p className="text-sm font-semibold text-white">{t.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <input value={newCommunity.name} onChange={e => setNewCommunity(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Community name"
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }} />

              <textarea value={newCommunity.description} onChange={e => setNewCommunity(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description (optional)"
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }} />

              <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs text-gray-400">
                  By creating a community, you'll become the admin and can invite members, post updates, and organize events.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 p-6 flex-shrink-0">
              <button onClick={handleCreateCommunity} disabled={!newCommunity.name}
                className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                Create Community 💜
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}