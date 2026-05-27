import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, Flag } from 'lucide-react';

export default function TeamsAdminTab() {
  const [subTab, setSubTab] = useState('pending');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const t = await base44.entities.GlowTeam.list('-created_date', 100);
      setTeams(t);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateTeam = async (id, status) => {
    await base44.entities.GlowTeam.update(id, { status });
    load();
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
        subTab === 'pending' ? (
          pending.length === 0 ? (
            <div className="p-8 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-sm text-gray-400">No pending teams to review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(team => (
                <div key={team.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      {TEAM_EMOJIS[team.name] || team.emoji || '🌟'}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{team.name}</p>
                      <p className="text-[10px] text-gray-500">· Captain ID: {team.captain_email?.split('@')[0] || team.created_by?.split('@')[0] || ''}</p>
                      <p className="text-xs text-gray-400">{team.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateTeam(team.id, 'approved')} className="flex-1 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1" style={{ background: 'rgba(16,185,129,0.3)', border: '1px solid rgba(16,185,129,0.4)' }}>
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button onClick={() => updateTeam(team.id, 'rejected')} className="flex-1 py-2 rounded-xl text-xs font-bold text-yellow-400 flex items-center justify-center gap-1" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                      <XCircle size={12} /> Reject
                    </button>
                    <button onClick={() => updateTeam(team.id, 'banned')} className="px-3 py-2 rounded-xl text-xs font-bold text-red-400 flex items-center gap-1" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      Ban
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
    </div>
  );
}