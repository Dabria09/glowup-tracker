import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Search, Plus, Users, Flame, Star, Heart, Trash2 } from 'lucide-react';
import useAgeGroup from '@/lib/useAgeGroup';

export default function GlowSquads() {
  const navigate = useNavigate();
  const { ageGroup, worldInfo, filterForWorld } = useAgeGroup();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [squads, setSquads] = useState([]);
  const [mySquads, setMySquads] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSquad, setNewSquad] = useState({ name: '', description: '', emoji: '💜', max_members: 10 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const u = await base44.auth.me();
          setUser(u);
          
          const [allSquads, myMemberships] = await Promise.all([
            base44.entities.GlowSquad.list(),
            base44.entities.SquadMember.filter({ user_email: u.email })
          ]);
          
          setSquads(filterForWorld(allSquads));
          setMySquads(myMemberships);
        }
      } catch (err) {
        console.error('Error loading squads:', err);
      }
      setLoading(false);
    };
    
    loadData();
  }, []);

  const filteredSquads = squads.filter(squad => 
    squad.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSquad = async () => {
    if (!newSquad.name.trim()) return;
    try {
      const squad = await base44.entities.GlowSquad.create({
        name: newSquad.name,
        description: newSquad.description,
        emoji: newSquad.emoji,
        member_count: 1,
        max_members: newSquad.max_members,
        is_private: true,
        created_by: user.email,
        squad_points: 0,
        current_streak: 0,
        longest_streak: 0,
        challenges_completed: 0,
        age_group: ageGroup || undefined,
      });
      
      await base44.entities.SquadMember.create({
        squad_id: squad.id,
        user_email: user.email,
        role: 'captain',
        joined_date: new Date().toISOString(),
        personal_streak: 0,
      });
      
      setShowCreateModal(false);
      setNewSquad({ name: '', description: '', emoji: '💜', max_members: 10 });
      
      const updated = await base44.entities.GlowSquad.list();
      const myUpdated = await base44.entities.SquadMember.filter({ user_email: user.email });
      setSquads(updated);
      setMySquads(myUpdated);
    } catch (err) {
      console.error('Error creating squad:', err);
    }
  };

  const handleJoinSquad = async (squad) => {
    try {
      await base44.entities.SquadMember.create({
        squad_id: squad.id,
        user_email: user.email,
        role: 'member',
        joined_date: new Date().toISOString(),
        personal_streak: 0,
      });
      setMySquads(prev => [...prev, { squad_id: squad.id }]);
    } catch (err) {
      console.error('Error joining squad:', err);
    }
  };

  const handleDeleteSquad = async (squad, e) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${squad.name}"? This will remove all members and challenges.`)) return;
    try {
      // Delete all members first
      const members = await base44.entities.SquadMember.filter({ squad_id: squad.id });
      for (const member of members) {
        await base44.entities.SquadMember.delete(member.id);
      }
      // Delete the squad
      await base44.entities.GlowSquad.delete(squad.id);
      setSquads(prev => prev.filter(s => s.id !== squad.id));
      setMySquads(prev => prev.filter(m => m.squad_id !== squad.id));
    } catch (err) {
      console.error('Error deleting squad:', err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative overflow-y-auto" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">

        {/* World Banner */}
        {worldInfo && (
          <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5 mb-4" style={{ background: worldInfo.bgColor, border: `1px solid ${worldInfo.borderColor}` }}>
            <span className="text-lg">{worldInfo.emoji}</span>
            <div>
              <p className="text-xs font-bold" style={{ color: worldInfo.color }}>{worldInfo.label}</p>
              <p className="text-[10px] text-gray-400">Squads in your world only</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">👑 Glow Squads</h1>
            <p className="text-xs text-gray-400">Create or join a smaller group for support, accountability, encouragement, and shared glow-up goals.</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 rounded-full font-bold text-white text-sm bg-pink-500 hover:bg-pink-600 transition flex items-center gap-2">
            <Plus size={16} /> Create
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <div className="flex items-center backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-4 py-2.5 gap-2">
            <Search size={16} className="text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search squads..."
              className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
            />
          </div>
        </div>

        {/* My Squads */}
        {mySquads.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold tracking-widest text-gray-400 mb-3">MY SQUADS</h2>
            <div className="space-y-3">
              {mySquads.map(membership => {
                const squad = squads.find(s => s.id === membership.squad_id);
                if (!squad) return null;
                return (
                  <div
                    key={squad.id}
                    onClick={() => navigate(`/glow-squads/${squad.id}`)}
                    className="rounded-2xl p-4 cursor-pointer transition hover:scale-[1.02]"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xl flex-shrink-0">
                        {squad.emoji || '💜'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-white text-sm">{squad.name}</p>
                          <div className="flex items-center gap-2">
                            {squad.current_streak > 0 && (
                              <div className="flex items-center gap-1 text-xs text-orange-400">
                                <Flame size={12} /> {squad.current_streak} day streak
                              </div>
                            )}
                            {squad.created_by === user?.email && (
                              <button onClick={(e) => handleDeleteSquad(squad, e)} className="text-gray-500 hover:text-red-400">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{squad.description || 'Private squad'}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Users size={12} /> {squad.member_count}/{squad.max_members} members</span>
                          <span className="flex items-center gap-1"><Star size={12} /> {squad.squad_points} pts</span>
                          <span className="flex items-center gap-1"><Flame size={12} /> {squad.challenges_completed} challenges</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Discover Squads */}
        <div>
          <h2 className="text-sm font-bold tracking-widest text-gray-400 mb-3">DISCOVER SQUADS</h2>
          {filteredSquads.filter(s => !mySquads.some(m => m.squad_id === s.id)).length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-3 block">✨</span>
              <p className="text-gray-400 text-sm">No squads yet. Create your first squad!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSquads.filter(s => !mySquads.some(m => m.squad_id === s.id)).map(squad => {
                const isJoined = mySquads.some(m => m.squad_id === squad.id);
                return (
                  <div
                    key={squad.id}
                    className="rounded-2xl p-4"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xl flex-shrink-0">
                        {squad.emoji || '💜'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm mb-1">{squad.name}</p>
                        <p className="text-xs text-gray-400 mb-2">{squad.description || 'Private squad'}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Users size={12} /> {squad.member_count}/{squad.max_members}</span>
                            <span className="flex items-center gap-1"><Heart size={12} /> {squad.squad_points} pts</span>
                          </div>
                          {isJoined ? (
                            <button className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                              ✓ Joined
                            </button>
                          ) : (
                            <button
                              onClick={() => handleJoinSquad(squad)}
                              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-pink-500 hover:bg-pink-600 transition"
                            >
                              Join
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Create Squad Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowCreateModal(false)}>
          <div
            className="w-full rounded-t-3xl flex flex-col max-h-[90vh] h-full"
            style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <h3 className="text-lg font-bold">Create Glow Squad</h3>
              <button onClick={() => setShowCreateModal(false)}><Plus size={20} className="rotate-45" /></button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Squad Name *</label>
                <input
                  value={newSquad.name}
                  onChange={e => setNewSquad({ ...newSquad, name: e.target.value })}
                  placeholder="e.g., Future CEOs 💕"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Description</label>
                <textarea
                  value={newSquad.description}
                  onChange={e => setNewSquad({ ...newSquad, description: e.target.value })}
                  placeholder="What's your squad about?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none resize-none min-h-20"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Max Members</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map(num => (
                    <button
                      key={num}
                      onClick={() => setNewSquad({ ...newSquad, max_members: num })}
                      className={`px-3 py-2 rounded-full text-xs font-semibold transition ${
                        newSquad.max_members === num
                          ? 'bg-pink-500 text-white'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {num} girls
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleCreateSquad}
                disabled={!newSquad.name.trim()}
                className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40 transition"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
              >
                Create Squad 💜
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}