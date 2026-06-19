import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, Flag, Users, X, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';

export default function TeamsAdminTab() {
  const [subTab, setSubTab] = useState('pending');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showBanConfirm, setShowBanConfirm] = useState(null);
  const [banning, setBanning] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const t = await base44.entities.GlowTeam.list('-created_date', 100);
      setTeams(t);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadTeamMembers = async (team) => {
    try {
      const members = await base44.entities.TeamMember.filter({ team_id: team.id });
      setTeamMembers(members);
      setSelectedTeam(team);
    } catch (e) { console.error(e); }
  };

  const updateTeam = async (id, status) => {
    await base44.entities.GlowTeam.update(id, { status });
    load();
    if (selectedTeam?.id === id) setSelectedTeam(null);
  };

  const handleBan = async () => {
    if (!showBanConfirm) return;
    setBanning(true);
    try {
      await base44.entities.GlowTeam.update(showBanConfirm.id, { status: 'banned' });
      alert('✅ Team banned. Members are not affected - they can join other teams.');
      setShowBanConfirm(null);
      load();
    } catch (e) {
      alert('Failed to ban: ' + e.message);
    }
    setBanning(false);
  };

  const pending = teams.filter(t => !t.status || t.status === 'pending');
  const reported = teams.filter(t => t.status === 'reported');

  const TEAM_EMOJIS = { 'Future CEOs': '💼', 'Soft Life Era': '🌸', 'Study Queens': '📚', 'Faith & Growth': '🙏' };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[
          { id: 'pending', label: `⏳ Pending (${pending.length})` },
          { id: 'reports', label: `🚩 Reports (${reported.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${subTab === t.id ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={subTab === t.id ? { background: 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div> : (
        selectedTeam ? (
          // Team Detail View
          <div className="space-y-4">
            <button onClick={() => setSelectedTeam(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
              <ChevronLeft size={16} /> Back to List
            </button>
            
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  {TEAM_EMOJIS[selectedTeam.name] || selectedTeam.emoji || '🌟'}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-base">{selectedTeam.name}</p>
                  <p className="text-[10px] text-gray-500">{selectedTeam.category}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                  {teamMembers.length} members
                </span>
              </div>
              
              {selectedTeam.description && (
                <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-sm text-gray-200">{selectedTeam.description}</p>
                </div>
              )}
              
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1">
                  <Users size={12} /> Team Members
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {teamMembers.length > 0 ? teamMembers.map((m, i) => (
                    <div key={m.id || i} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: m.role === 'admin' ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.1)' }}>
                          {m.role === 'admin' ? '👑' : '👤'}
                        </div>
                        <div>
                          <p className="text-xs text-white font-semibold">{m.user_email?.split('@')[0]}</p>
                          <p className="text-[10px] text-gray-500 capitalize">{m.role}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-600">{m.joined_date ? new Date(m.joined_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  )) : (
                    <p className="text-xs text-gray-500 text-center py-4">No members found</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => updateTeam(selectedTeam.id, 'approved')} className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2" style={{ background: 'rgba(16,185,129,0.3)', border: '1px solid rgba(16,185,129,0.4)' }}>
                  <CheckCircle size={14} /> Approve Team
                </button>
                <button onClick={() => updateTeam(selectedTeam.id, 'rejected')} className="flex-1 py-3 rounded-xl text-sm font-bold text-yellow-400 flex items-center justify-center gap-2" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <XCircle size={14} /> Reject
                </button>
              </div>
              <button onClick={() => setShowBanConfirm(selectedTeam)} className="w-full mt-2 py-3 rounded-xl text-sm font-bold text-red-400 flex items-center justify-center gap-2" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <AlertTriangle size={14} /> Ban Team
              </button>
              <p className="text-[10px] text-gray-500 text-center mt-2">⚠️ Ban marks team as inactive. Members are NOT banned and can join other teams.</p>
            </div>
          </div>
        ) : subTab === 'pending' ? (
          pending.length === 0 ? (
            <div className="p-8 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-sm text-gray-400">No pending teams to review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(team => (
                <div key={team.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <button onClick={() => loadTeamMembers(team)} className="w-full text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        {TEAM_EMOJIS[team.name] || team.emoji || '🌟'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm">{team.name}</p>
                        <p className="text-[10px] text-gray-500">Captain: {team.created_by?.split('@')[0] || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{team.description}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-500" />
                    </div>
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => updateTeam(team.id, 'approved')} className="flex-1 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1" style={{ background: 'rgba(16,185,129,0.3)', border: '1px solid rgba(16,185,129,0.4)' }}>
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button onClick={() => updateTeam(team.id, 'rejected')} className="flex-1 py-2 rounded-xl text-xs font-bold text-yellow-400 flex items-center justify-center gap-1" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                      <XCircle size={12} /> Reject
                    </button>
                    <button onClick={() => setShowBanConfirm(team)} className="px-3 py-2 rounded-xl text-xs font-bold text-red-400 flex items-center gap-1" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <AlertTriangle size={12} /> Ban
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          reported.length === 0 ? (
            <div className="p-8 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-sm text-gray-400">No reported teams.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reported.map(team => (
                <div key={team.id} className="p-4 rounded-2xl" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p className="font-semibold text-white text-sm">{team.name}</p>
                  <p className="text-xs text-gray-400">{team.description}</p>
                  <Flag size={14} className="text-red-400 mt-2" />
                </div>
              ))}
            </div>
          )
        )
      )}

      {/* Ban Confirmation Modal */}
      {showBanConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-5" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-400" />
                Ban Team
              </h3>
              <button onClick={() => setShowBanConfirm(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-300 mb-2">
                Are you sure you want to ban <span className="font-bold text-white">"{showBanConfirm.name}"</span>?
              </p>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <p className="text-xs text-red-400 font-semibold mb-1">⚠️ This will:</p>
                <ul className="text-xs text-gray-400 space-y-1 ml-4 list-disc">
                  <li>Mark the team as banned and inactive</li>
                  <li>Prevent any new contest entries</li>
                  <li>Remove from public team listings</li>
                </ul>
                <p className="text-xs text-green-400 mt-2">✅ Team members are NOT affected - they can join other teams.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowBanConfirm(null)}
                disabled={banning}
                className="flex-1 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-40"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                disabled={banning}
                className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}
              >
                {banning ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><AlertTriangle size={16} /> Confirm Ban</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}