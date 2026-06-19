import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, ShieldOff, Shield, AlertTriangle, X, RefreshCw, CheckCircle, Clock, Trash2 } from 'lucide-react';

const AGE_GROUP_LABELS = {
  glow_girls: { label: 'Glow Girls', emoji: '🌸', color: '#ec4899' },
  glow_teens: { label: 'Glow Teens', emoji: '✨', color: '#a855f7' },
  glow_women: { label: 'Glow Women', icon: 'https://media.base44.com/images/public/6a0e12a89992f9565c11e330/68085ba5f_generated_image.png', color: '#f59e0b' },
};

const ROLES = ['user', 'admin'];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [pointsMap, setPointsMap] = useState({});
  const [bans, setBans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [saving, setSaving] = useState(null);
  const [banModal, setBanModal] = useState(null);
  const [banForm, setBanForm] = useState({ ban_type: 'soft', reason: '' });
  const [adminEmail, setAdminEmail] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // email being confirmed for deletion
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, p, b, pts, me] = await Promise.all([
        base44.functions.invoke('getAdminUsers', {}),
        base44.entities.UserProfile.list('-created_date', 200),
        base44.entities.BannedUser.filter({ is_active: true }),
        base44.entities.UserPoints.list('-total_points', 500),
        base44.auth.me(),
      ]);
      setUsers(usersRes.data?.users || []);
      setProfiles(p);
      setBans(b);
      const pm = {};
      pts.forEach(pt => { pm[pt.user_email] = pt.total_points || 0; });
      setPointsMap(pm);
      setAdminEmail(me.email);
    } catch (e) {
      setError(e.message || 'Failed to load users');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getProfile = (email) => profiles.find(p => p.user_email === email);
  const getActiveBan = (email) => bans.find(b => b.user_email === email && b.is_active);

  const handleRoleChange = async (user, role) => {
    setSaving(user.id);
    await base44.entities.User.update(user.id, { role });
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role } : u));
    setSaving(null);
  };

  const handleAgeGroupChange = async (email, age_group) => {
    const profile = getProfile(email);
    if (!profile) return;
    setSaving(email);
    await base44.entities.UserProfile.update(profile.id, { age_group });
    setProfiles(prev => prev.map(p => p.user_email === email ? { ...p, age_group } : p));
    setSaving(null);
  };

  const handleApproveConsent = async (email) => {
    const profile = getProfile(email);
    if (!profile) return;
    setSaving(email);
    const now = new Date().toISOString();

    await base44.entities.UserProfile.update(profile.id, {
      admin_consent_approved: true,
      admin_consent_approved_by: adminEmail,
      admin_consent_approved_date: now,
      onboarding_complete: true,
    });

    await base44.entities.AdminLogs.create({
      action_type: 'consent_approved',
      performed_by: adminEmail,
      target_email: email,
      target_username: profile.username || '',
      details: 'Parental consent manually approved by admin',
      metadata: JSON.stringify({ approved_date: now }),
    });

    // Send activation email to the teen
    const userName = users.find(u => u.email === email)?.full_name || profile.username || 'there';
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: '🌟 Your Girls Glowing Up™ Account is Active!',
      body: `<html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;">
        <div style="text-align:center;padding:30px 0 10px;">
          <h1 style="background:linear-gradient(135deg,#e8526d,#f1b610);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:26px;margin:0;">Girls Glowing Up™</h1>
        </div>
        <p>Hey ${userName}! 🎉</p>
        <p>Great news — your parental consent has been verified and your Girls Glowing Up™ account is now <strong>fully active</strong>!</p>
        <p>You can now sign in and start exploring everything GGU has to offer:</p>
        <ul style="line-height:2;">
          <li>✨ Daily challenges &amp; Glow-Up check-ins</li>
          <li>💬 Community spaces with girls your age</li>
          <li>📚 Lessons, wellness tools &amp; more</li>
          <li>🏆 Earn points and level up your Glow!</li>
        </ul>
        <div style="text-align:center;margin:30px 0;">
          <a href="https://gguapp.com/login" style="background:linear-gradient(135deg,#e8526d,#f1b610);color:white;padding:14px 32px;text-decoration:none;border-radius:30px;font-weight:bold;display:inline-block;">
            Sign In &amp; Start Glowing ✨
          </a>
        </div>
        <p style="margin-top:30px;border-top:1px solid #eee;padding-top:20px;font-size:13px;color:#999;">
          With love and purpose,<br/>
          <strong>The Girls Glowing Up™ Team</strong><br/>
          girlsglowingup.com | gguapp.com
        </p>
      </body></html>`,
    });

    setProfiles(prev => prev.map(p => p.user_email === email
      ? { ...p, admin_consent_approved: true, admin_consent_approved_by: adminEmail, admin_consent_approved_date: now, onboarding_complete: true }
      : p
    ));
    setSaving(null);
  };

  const openBanModal = (user, profile) => {
    setBanModal({ user, profile });
    setBanForm({ ban_type: 'soft', reason: '' });
  };

  const submitBan = async () => {
    if (!banModal || !banForm.reason.trim()) return;
    setSaving(banModal.user.id);
    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    const profile = getProfile(banModal.user.email);

    const banData = {
      user_email: banModal.user.email,
      username: profile?.username || '',
      user_name: banModal.user.full_name || '',
      ban_type: banForm.ban_type,
      reason: banForm.reason,
      banned_by: adminEmail,
      banned_date: now.toISOString(),
      is_active: true,
      ...(banForm.ban_type === 'hard' ? {
        email_blocked_until: oneYearLater.toISOString(),
        username_blocked_until: oneYearLater.toISOString(),
      } : {}),
    };

    const created = await base44.entities.BannedUser.create(banData);
    await base44.entities.AdminLogs.create({
      action_type: banForm.ban_type === 'hard' ? 'hard_ban' : 'soft_ban',
      performed_by: adminEmail,
      target_email: banModal.user.email,
      target_username: profile?.username || '',
      details: banForm.reason,
      metadata: JSON.stringify({ ban_id: created.id, ban_type: banForm.ban_type, ...(banForm.ban_type === 'hard' ? { blocked_until: oneYearLater.toISOString() } : {}) }),
    });
    setBans(prev => [...prev, created]);
    setSaving(null);
    setBanModal(null);
  };

  const handleDeleteUser = async (email) => {
    setDeleting(email);
    try {
      await base44.functions.invoke('adminDeleteUser', { targetEmail: email });
      setUsers(prev => prev.filter(u => u.email !== email));
      setProfiles(prev => prev.filter(p => p.user_email !== email));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
    setDeleting(null);
    setDeleteConfirm(null);
  };

  const liftBan = async (email) => {
    const ban = getActiveBan(email);
    if (!ban) return;
    setSaving(email);
    await base44.entities.BannedUser.update(ban.id, {
      is_active: false,
      lifted_by: adminEmail,
      lifted_date: new Date().toISOString(),
    });
    await base44.entities.AdminLogs.create({
      action_type: 'ban_lifted',
      performed_by: adminEmail,
      target_email: email,
      target_username: ban.username || '',
      details: `${ban.ban_type} ban lifted`,
      metadata: JSON.stringify({ original_ban_id: ban.id, original_ban_type: ban.ban_type }),
    });
    setBans(prev => prev.filter(b => b.id !== ban.id));
    setSaving(null);
  };

  const filtered = users.filter(u => {
    const matchSearch = u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase());
    const profile = getProfile(u.email);
    const effectiveGroup = profile?.age_group || u.age_group || '';
    const matchGroup = filterGroup === 'all' || effectiveGroup === filterGroup;
    const ban = getActiveBan(u.email);
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'banned' && ban) ||
      (filterStatus === 'active' && !ban) ||
      (filterStatus === 'pending_consent' && profile?.parental_consent_sent && !profile?.admin_consent_approved);
    return matchSearch && matchGroup && matchStatus;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
      <p className="text-xs text-gray-500">Loading users…</p>
    </div>
  );

  if (error) return (
    <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
      <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
      <p className="text-sm text-red-300 mb-3">{error}</p>
      <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white mx-auto" style={{ background: 'rgba(239,68,68,0.3)' }}>
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  );

  const pendingConsentCount = profiles.filter(p => p.parental_consent_sent && !p.admin_consent_approved).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total', value: users.length, emoji: '👥' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, emoji: '🛡️' },
          { label: 'Banned', value: bans.length, emoji: '🚫' },
          { label: 'Consent ⏳', value: pendingConsentCount, emoji: '🔑' },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-lg mb-0.5">{stat.emoji}</p>
            <p className="font-bold text-white text-base">{stat.value}</p>
            <p className="text-[10px] text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[160px] flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-2">
          <Search size={14} className="text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
            className="bg-transparent text-sm text-white outline-none flex-1 placeholder-gray-500" />
        </div>
        <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
          className="bg-gray-900 border border-white/10 rounded-full px-3 py-2 text-xs text-white outline-none">
          <option value="all">All Worlds</option>
          <option value="glow_girls">🌸 Glow Girls</option>
          <option value="glow_teens">✨ Glow Teens</option>
          <option value="glow_women">👑 Glow Women</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-gray-900 border border-white/10 rounded-full px-3 py-2 text-xs text-white outline-none">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
          <option value="pending_consent">⏳ Pending Consent</option>
        </select>
        <button onClick={load} className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white">
          <RefreshCw size={14} />
        </button>
      </div>

      <p className="text-xs text-gray-500">{filtered.length} of {users.length} users</p>

      {/* User List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm">No users found.</div>
        )}
        {filtered.map(u => {
          const profile = getProfile(u.email);
          const effectiveAgeGroup = profile?.age_group || u.age_group || '';
          const ageInfo = AGE_GROUP_LABELS[effectiveAgeGroup];
          const isMentor = !!u.mentor_status;
          const ban = getActiveBan(u.email);
          const consentPending = profile?.parental_consent_sent && !profile?.admin_consent_approved;
          const consentApproved = profile?.admin_consent_approved;
          return (
            <div key={u.id} className="rounded-2xl p-4" style={{
              background: ban ? 'rgba(239,68,68,0.06)' : consentPending ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0.05)',
              border: ban ? '1px solid rgba(239,68,68,0.25)' : consentPending ? '1px solid rgba(251,191,36,0.25)' : '1px solid rgba(255,255,255,0.08)',
            }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden">
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    : (u.full_name?.[0] || u.email?.[0] || '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white text-sm truncate">{u.full_name || 'No name'}</p>
                    {ban && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${ban.ban_type === 'hard' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {ban.ban_type === 'hard' ? '🔴 Hard Ban' : '🟠 Soft Ban'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  {profile?.username && <p className="text-[10px] text-pink-400">@{profile.username}</p>}

                  {/* Parental Consent Status */}
                  {profile?.parental_consent_sent && (
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      {consentApproved ? (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
                          <CheckCircle size={10} /> Consent Approved
                        </span>
                      ) : (
                        <>
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
                            <Clock size={10} /> Consent Pending
                          </span>
                          <button
                            onClick={() => handleApproveConsent(u.email)}
                            disabled={saving === u.email}
                            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-semibold transition disabled:opacity-50"
                            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', color: '#34d399' }}
                          >
                            <CheckCircle size={10} /> {saving === u.email ? 'Approving…' : 'Approve Access'}
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Ban details */}
                  {ban && (
                    <div className="mt-1 p-2 rounded-xl text-[10px] text-gray-400" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <p><span className="text-gray-500">Reason:</span> {ban.reason}</p>
                      {ban.ban_type === 'hard' && ban.email_blocked_until && (
                        <p><span className="text-gray-500">Email blocked until:</span> {new Date(ban.email_blocked_until).toLocaleDateString()}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <select
                      value={u.role || 'user'}
                      onChange={e => handleRoleChange(u, e.target.value)}
                      disabled={saving === u.id}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full outline-none cursor-pointer"
                      style={{ background: u.role === 'admin' ? 'rgba(236,72,153,0.25)' : 'rgba(255,255,255,0.08)', border: u.role === 'admin' ? '1px solid rgba(236,72,153,0.4)' : '1px solid rgba(255,255,255,0.1)', color: u.role === 'admin' ? '#f9a8d4' : '#9ca3af' }}
                    >
                      {ROLES.map(r => <option key={r} value={r} style={{ background: '#1a0a2e' }}>{r}</option>)}
                    </select>

                    {isMentor && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc' }}>
                        🎓 Mentor{u.mentor_type === 'teen' ? ' (Teen)' : ''}
                      </span>
                    )}
                    <select
                      value={effectiveAgeGroup}
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

                    {pointsMap[u.email] !== undefined && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
                        ⭐ {pointsMap[u.email].toLocaleString()} pts
                      </span>
                    )}
                    {(saving === u.id || saving === u.email) && (
                      <span className="text-[10px] text-pink-400">Saving…</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <p className="text-[10px] text-gray-500">{u.created_date ? new Date(u.created_date).toLocaleDateString() : '—'}</p>
                  {ban ? (
                    <button
                      onClick={() => liftBan(u.email)}
                      disabled={saving === u.email}
                      className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-semibold text-green-400 hover:text-green-300 transition"
                      style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
                    >
                      <Shield size={10} /> Lift Ban
                    </button>
                  ) : (
                    <button
                      onClick={() => openBanModal(u, profile)}
                      className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-semibold text-red-400 hover:text-red-300 transition"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
                    >
                      <ShieldOff size={10} /> Ban
                    </button>
                  )}
                  {u.email !== adminEmail && (
                    deleteConfirm === u.email ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDeleteUser(u.email)}
                          disabled={deleting === u.email}
                          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-bold text-white transition"
                          style={{ background: 'rgba(239,68,68,0.7)', border: '1px solid rgba(239,68,68,0.8)' }}
                        >
                          {deleting === u.email ? '...' : 'Confirm'}
                        </button>
                        <button onClick={() => setDeleteConfirm(null)} className="text-[10px] px-2 py-1 rounded-full text-gray-400" style={{ background: 'rgba(255,255,255,0.05)' }}>✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(u.email)}
                        className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-semibold text-gray-500 hover:text-red-400 transition"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <Trash2 size={10} /> Delete
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ban Modal */}
      {banModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={() => setBanModal(null)}>
          <div
            className="w-full rounded-t-3xl p-6 space-y-4"
            style={{ background: '#0f0a1e', border: '1px solid rgba(239,68,68,0.3)', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Ban User</h3>
              <button onClick={() => setBanModal(null)}><X size={20} className="text-gray-400" /></button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                {(banModal.user.full_name?.[0] || banModal.user.email?.[0] || '?').toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{banModal.user.full_name || 'No name'}</p>
                <p className="text-xs text-gray-400">{banModal.user.email}</p>
                {banModal.profile?.username && <p className="text-[10px] text-pink-400">@{banModal.profile.username}</p>}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-300 mb-2">Ban Type</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setBanForm(f => ({ ...f, ban_type: 'soft' }))}
                  className="p-3 rounded-2xl text-left transition"
                  style={{ background: banForm.ban_type === 'soft' ? 'rgba(251,146,60,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${banForm.ban_type === 'soft' ? 'rgba(251,146,60,0.5)' : 'rgba(255,255,255,0.1)'}` }}
                >
                  <p className="text-sm font-bold text-orange-400 mb-1">🟠 Soft Ban</p>
                  <p className="text-[10px] text-gray-400">User is banned but their email and username are immediately available for a new account.</p>
                </button>
                <button
                  onClick={() => setBanForm(f => ({ ...f, ban_type: 'hard' }))}
                  className="p-3 rounded-2xl text-left transition"
                  style={{ background: banForm.ban_type === 'hard' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${banForm.ban_type === 'hard' ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}` }}
                >
                  <p className="text-sm font-bold text-red-400 mb-1">🔴 Hard Ban</p>
                  <p className="text-[10px] text-gray-400">Email + username are blocked for 1 year. No new account can be created with these.</p>
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-300 mb-2">Reason *</p>
              <textarea
                value={banForm.reason}
                onChange={e => setBanForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Why is this user being banned?"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setBanModal(null)} className="py-3 rounded-2xl text-sm font-semibold text-gray-400 bg-white/5">Cancel</button>
              <button
                onClick={submitBan}
                disabled={!banForm.reason.trim() || saving}
                className="py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-40"
                style={{ background: banForm.ban_type === 'hard' ? 'linear-gradient(135deg,#dc2626,#991b1b)' : 'linear-gradient(135deg,#f97316,#c2410c)' }}
              >
                {banForm.ban_type === 'hard' ? '🔴 Hard Ban' : '🟠 Soft Ban'} User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}