import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, ChevronDown } from 'lucide-react';

const AGE_GROUP_LABELS = {
  glow_girls: { label: 'Glow Girls', emoji: '🌸', color: '#ec4899' },
  glow_teens: { label: 'Glow Teens', emoji: '✨', color: '#a855f7' },
  glow_women: { label: 'Glow Women', emoji: '👑', color: '#f59e0b' },
};

const ROLES = ['user', 'admin'];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.User.list(),
      base44.entities.UserProfile.list(),
    ]).then(([u, p]) => {
      setUsers(u);
      setProfiles(p);
      setLoading(false);
    });
  }, []);

  const getProfile = (email) => profiles.find(p => p.user_email === email);

  const handleRoleChange = async (user, role) => {
    setSaving(user.id);
    await base44.entities.User.update(user.id, { role });
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role } : u));
    setSaving(null);
    setEditingUser(null);
  };

  const handleAgeGroupChange = async (email, age_group) => {
    const profile = getProfile(email);
    if (!profile) return;
    setSaving(email);
    await base44.entities.UserProfile.update(profile.id, { age_group });
    setProfiles(prev => prev.map(p => p.user_email === email ? { ...p, age_group } : p));
    setSaving(null);
  };

  const filtered = users.filter(u => {
    const matchSearch = u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase());
    const profile = getProfile(u.email);
    const matchGroup = filterGroup === 'all' || profile?.age_group === filterGroup;
    return matchSearch && matchGroup;
  });

  if (loading) return <div className="flex justify-center py-16"><div className="w-6 h-6 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Users', value: users.length, emoji: '👥' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, emoji: '🛡️' },
          { label: 'Profiles', value: profiles.length, emoji: '✨' },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xl mb-0.5">{stat.emoji}</p>
            <p className="font-bold text-white text-lg">{stat.value}</p>
            <p className="text-[10px] text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-2">
          <Search size={14} className="text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
            className="bg-transparent text-sm text-white outline-none flex-1 placeholder-gray-500" />
        </div>
        <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-full px-3 py-2 text-xs text-white outline-none">
          <option value="all" style={{ background: '#1a0a2e' }}>All Worlds</option>
          <option value="glow_girls" style={{ background: '#1a0a2e' }}>🌸 Glow Girls</option>
          <option value="glow_teens" style={{ background: '#1a0a2e' }}>✨ Glow Teens</option>
          <option value="glow_women" style={{ background: '#1a0a2e' }}>👑 Glow Women</option>
        </select>
      </div>

      {/* User List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm">No users found.</div>
        )}
        {filtered.map(u => {
          const profile = getProfile(u.email);
          const ageInfo = AGE_GROUP_LABELS[profile?.age_group];
          return (
            <div key={u.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden">
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    : (u.full_name?.[0] || u.email?.[0] || '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{u.full_name || 'No name'}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {/* Role badge */}
                    <select
                      value={u.role || 'user'}
                      onChange={e => handleRoleChange(u, e.target.value)}
                      disabled={saving === u.id}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full outline-none cursor-pointer"
                      style={{ background: u.role === 'admin' ? 'rgba(236,72,153,0.25)' : 'rgba(255,255,255,0.08)', border: u.role === 'admin' ? '1px solid rgba(236,72,153,0.4)' : '1px solid rgba(255,255,255,0.1)', color: u.role === 'admin' ? '#f9a8d4' : '#9ca3af' }}
                    >
                      {ROLES.map(r => <option key={r} value={r} style={{ background: '#1a0a2e' }}>{r}</option>)}
                    </select>

                    {/* Age group badge */}
                    <select
                      value={profile?.age_group || ''}
                      onChange={e => handleAgeGroupChange(u.email, e.target.value)}
                      disabled={saving === u.email}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full outline-none cursor-pointer"
                      style={{ background: ageInfo ? `${ageInfo.color}20` : 'rgba(255,255,255,0.08)', border: ageInfo ? `1px solid ${ageInfo.color}50` : '1px solid rgba(255,255,255,0.1)', color: ageInfo?.color || '#6b7280' }}
                    >
                      <option value="" style={{ background: '#1a0a2e' }}>No world</option>
                      <option value="glow_girls" style={{ background: '#1a0a2e' }}>🌸 Glow Girls</option>
                      <option value="glow_teens" style={{ background: '#1a0a2e' }}>✨ Glow Teens</option>
                      <option value="glow_women" style={{ background: '#1a0a2e' }}>👑 Glow Women</option>
                    </select>

                    {saving === u.id || saving === u.email ? (
                      <span className="text-[10px] text-pink-400">Saving…</span>
                    ) : null}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-gray-500">{new Date(u.created_date).toLocaleDateString()}</p>
                  {profile?.username && <p className="text-[10px] text-pink-400">@{profile.username}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}