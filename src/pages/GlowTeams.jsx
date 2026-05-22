import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Search, Plus, Users, MessageCircle, Trophy, Flame } from 'lucide-react';

const TEAM_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🌟' },
  { id: 'STEM & Tech', label: 'STEM & Tech', emoji: '💻' },
  { id: 'Entrepreneurship', label: 'Entrepreneurship', emoji: '💼' },
  { id: 'Fitness & Wellness', label: 'Fitness & Wellness', emoji: '💪' },
  { id: 'Faith & Spirituality', label: 'Faith & Spirituality', emoji: '🙏' },
  { id: 'Academic Excellence', label: 'Academic Excellence', emoji: '📚' },
  { id: 'Lifestyle & Vibes', label: 'Lifestyle & Vibes', emoji: '✨' },
  { id: 'Arts & Creativity', label: 'Arts & Creativity', emoji: '🎨' },
  { id: 'Mental Health', label: 'Mental Health', emoji: '🧠' },
];

const SAMPLE_TEAMS = [
  { name: 'Tech Queens 👑', category: 'STEM & Tech', members: 234, description: 'Girls in tech supporting each other', emoji: '💻' },
  { name: 'Future CEOs', category: 'Entrepreneurship', members: 189, description: 'Building businesses together', emoji: '💼' },
  { name: 'Fit & Fabulous', category: 'Fitness & Wellness', members: 456, description: 'Wellness journey together', emoji: '💪' },
  { name: 'Faith Over Fear', category: 'Faith & Spirituality', members: 312, description: 'Spiritual growth community', emoji: '🙏' },
  { name: 'Honor Roll Heroes', category: 'Academic Excellence', members: 278, description: 'Academic excellence squad', emoji: '📚' },
  { name: 'Aesthetic Vibes', category: 'Lifestyle & Vibes', members: 523, description: 'Living our best lives', emoji: '✨' },
];

export default function GlowTeams() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [teams, setTeams] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '', category: 'Lifestyle & Vibes', emoji: '✨' });

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      try {
        const [allTeams, myMemberships] = await Promise.all([
          base44.entities.GlowTeam.list(),
          base44.entities.TeamMember.filter({ user_email: u.email })
        ]);
        
        setTeams(allTeams.length > 0 ? allTeams : SAMPLE_TEAMS.map(t => ({ ...t, id: t.name })));
        setMyTeams(myMemberships);
      } catch (err) {
        console.error('Error loading teams:', err);
        setTeams(SAMPLE_TEAMS.map(t => ({ ...t, id: t.name })));
      }
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const filteredTeams = teams.filter(team => {
    const matchSearch = team.name.toLowerCase().includes(search.toLowerCase()) ||
                       team.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'all' || team.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleCreateTeam = async () => {
    if (!newTeam.name.trim()) return;
    try {
      await base44.entities.GlowTeam.create({
        name: newTeam.name,
        description: newTeam.description,
        category: newTeam.category,
        emoji: newTeam.emoji,
        member_count: 1,
        is_public: true,
        created_by: user.email,
        total_points: 0,
      });
      setShowCreateModal(false);
      setNewTeam({ name: '', description: '', category: 'Lifestyle & Vibes', emoji: '✨' });
      // Refresh teams
      const updated = await base44.entities.GlowTeam.list();
      setTeams(updated);
    } catch (err) {
      console.error('Error creating team:', err);
    }
  };

  const handleJoinTeam = async (team) => {
    try {
      await base44.entities.TeamMember.create({
        team_id: team.id,
        user_email: user.email,
        role: 'member',
        joined_date: new Date().toISOString(),
        contribution_points: 0,
      });
      setMyTeams(prev => [...prev, { team_id: team.id }]);
    } catch (err) {
      console.error('Error joining team:', err);
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">✨ Glow Teams</h1>
            <p className="text-xs text-gray-400">Find your people. Build your community. Rise together.</p>
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
              placeholder="Search teams..."
              className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
          {TEAM_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition ${
                selectedCategory === cat.id 
                  ? 'text-white bg-pink-500' 
                  : 'text-gray-400 bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* My Teams */}
        {myTeams.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold tracking-widest text-gray-400 mb-3">MY TEAMS</h2>
            <div className="grid grid-cols-2 gap-3">
              {myTeams.map(membership => {
                const team = teams.find(t => t.id === membership.team_id) || SAMPLE_TEAMS.find(t => t.id === membership.team_id);
                if (!team) return null;
                return (
                  <div
                    key={membership.team_id}
                    onClick={() => navigate(`/glow-teams/${membership.team_id}`)}
                    className="rounded-2xl p-4 cursor-pointer transition hover:scale-[1.02]"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <div className="text-2xl mb-2">{team.emoji || '🌟'}</div>
                    <p className="font-semibold text-white text-sm mb-1">{team.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Users size={12} /> {team.member_count || 0} members
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Discover Teams */}
        <div>
          <h2 className="text-sm font-bold tracking-widest text-gray-400 mb-3">DISCOVER TEAMS</h2>
          <div className="space-y-3">
            {filteredTeams.map(team => {
              const isJoined = myTeams.some(m => m.team_id === team.id);
              return (
                <div
                  key={team.id}
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xl flex-shrink-0">
                      {team.emoji || '🌟'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm mb-1">{team.name}</p>
                      <p className="text-xs text-gray-400 mb-2">{team.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Users size={12} /> {team.member_count || 0} members</span>
                          <span className="flex items-center gap-1"><MessageCircle size={12} /> {team.total_points || 0} pts</span>
                        </div>
                        {isJoined ? (
                          <button className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                            ✓ Joined
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoinTeam(team)}
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
        </div>

      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowCreateModal(false)}>
          <div
            className="w-full rounded-t-3xl flex flex-col max-h-[90vh] h-full"
            style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <h3 className="text-lg font-bold">Create Glow Team</h3>
              <button onClick={() => setShowCreateModal(false)}><Plus size={20} className="rotate-45" /></button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Team Name *</label>
                <input
                  value={newTeam.name}
                  onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="e.g., Tech Queens 👑"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Description</label>
                <textarea
                  value={newTeam.description}
                  onChange={e => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="What's your team about?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none resize-none min-h-20"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Category *</label>
                <div className="grid grid-cols-2 gap-2">
                  {TEAM_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setNewTeam({ ...newTeam, category: cat.id })}
                      className={`px-3 py-2 rounded-full text-xs font-semibold transition ${
                        newTeam.category === cat.id
                          ? 'bg-pink-500 text-white'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleCreateTeam}
                disabled={!newTeam.name.trim() || !newTeam.category}
                className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40 transition"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
              >
                Create Team ✨
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}