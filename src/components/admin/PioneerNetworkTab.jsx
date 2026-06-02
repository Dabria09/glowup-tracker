import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Crown, CheckCircle2, XCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function PioneerNetworkTab() {
  const [applicants, setApplicants] = useState([]);
  const [pioneers, setPioneers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('applicants'); // applicants | confirmed

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      // Applicants: profiles where glow_era starts with 'Pioneer Applicant:'
      const allProfiles = await base44.entities.UserProfile.list('-created_date', 200);
      const apps = allProfiles.filter(p => p.glow_era?.startsWith('Pioneer Applicant:'));
      const confirmed = allProfiles.filter(p => p.glow_era?.toLowerCase() === 'pioneer' || p.glow_era?.toLowerCase().startsWith('founding pioneer') || p.glow_era?.toLowerCase().startsWith('pioneer tier'));
      setApplicants(apps);
      setPioneers(confirmed);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const approve = async (profile) => {
    await base44.entities.UserProfile.update(profile.id, { glow_era: 'Pioneer' });
    toast.success(`${profile.username || profile.display_name || profile.user_email} approved as Pioneer 👑`);
    load();
  };

  const reject = async (profile) => {
    await base44.entities.UserProfile.update(profile.id, { glow_era: '' });
    toast.success('Application rejected.');
    load();
  };

  const revoke = async (profile) => {
    if (!window.confirm('Revoke Pioneer status for this user?')) return;
    await base44.entities.UserProfile.update(profile.id, { glow_era: '' });
    toast.success('Pioneer status revoked.');
    load();
  };

  const getNote = (profile) => {
    const era = profile.glow_era || '';
    return era.startsWith('Pioneer Applicant:') ? era.replace('Pioneer Applicant:', '').trim() : '';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <p className="text-base font-bold text-white flex items-center gap-2"><Crown size={16} className="text-yellow-400" /> Pioneer Network™</p>
        <p className="text-xs text-gray-400 mt-0.5">{applicants.length} pending · {pioneers.length} confirmed Pioneers</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'applicants', label: `📋 Applications (${applicants.length})` },
          { id: 'confirmed', label: `👑 Confirmed (${pioneers.length})` },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveView(tab.id)}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition"
            style={activeView === tab.id
              ? { background: 'linear-gradient(135deg, #f1b610, #e8526d)', color: '#fff' }
              : { background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : activeView === 'applicants' ? (
        applicants.length === 0 ? (
          <div className="p-10 text-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Crown size={28} className="text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No pending applications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applicants.map(profile => (
              <div key={profile.id} className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(241,182,16,0.25)' }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #f1b610, #e8526d)' }}>
                    {(profile.username || profile.user_email || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white">{profile.display_name || profile.username || 'Unknown'}</p>
                    <p className="text-xs text-gray-400 truncate">{profile.user_email}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {profile.age_group === 'glow_girls' ? 'Tween World' : profile.age_group === 'glow_teens' ? 'Teen World' : profile.age_group === 'glow_women' ? "Women's World" : profile.age_group || 'Unknown World'}
                    </p>
                  </div>
                </div>
                {getNote(profile) && (
                  <div className="rounded-xl p-3 mb-3"
                    style={{ background: 'rgba(241,182,16,0.08)', border: '1px solid rgba(241,182,16,0.2)' }}>
                    <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider mb-1">Application Note</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{getNote(profile)}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => approve(profile)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white"
                    style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)' }}>
                    <CheckCircle2 size={12} /> Approve
                  </button>
                  <button onClick={() => reject(profile)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-red-400"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <XCircle size={12} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        pioneers.length === 0 ? (
          <div className="p-10 text-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Users size={28} className="text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No confirmed Pioneers yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pioneers.map((profile, i) => (
              <div key={profile.id} className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(241,182,16,0.15)' }}>
                <span className="text-yellow-400 font-bold text-xs w-6">#{i + 1}</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #f1b610, #e8526d)' }}>
                  {(profile.username || profile.user_email || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{profile.display_name || profile.username || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 truncate">{profile.user_email}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: 'rgba(241,182,16,0.2)', color: '#fde047', border: '1px solid rgba(241,182,16,0.3)' }}>
                  Pioneer
                </span>
                <button onClick={() => revoke(profile)} className="text-red-400 text-xs hover:text-red-300 flex-shrink-0">Revoke</button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}