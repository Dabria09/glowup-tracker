import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, CheckCircle, Clock, AlertCircle, Plus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [consents, setConsents] = useState([]);
  const [teenSessions, setTeenSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConsentForm, setShowConsentForm] = useState(false);
  const [form, setForm] = useState({ teen_email: '', consent_type: 'all', parent_name: '', relationship: 'Mother' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const c = await base44.entities.ParentConsent.filter({ parent_email: u.email });
      setConsents(c);

      // Load sessions for all teens this parent has consented for
      const teenEmails = [...new Set(c.map(x => x.teen_email))];
      let sessions = [];
      for (const email of teenEmails) {
        const s = await base44.entities.MentorSession.filter({ mentee_email: email });
        sessions = [...sessions, ...s];
      }
      setTeenSessions(sessions.sort((a, b) => new Date(b.session_date) - new Date(a.session_date)));
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const giveConsent = async () => {
    if (!form.teen_email || !form.parent_name) return;
    setSaving(true);
    await base44.entities.ParentConsent.create({
      parent_email: user.email,
      teen_email: form.teen_email,
      consent_type: form.consent_type,
      parent_name: form.parent_name,
      relationship: form.relationship,
      is_consent_given: true,
      consent_date: new Date().toISOString(),
    });
    setShowConsentForm(false);
    setForm({ teen_email: '', consent_type: 'all' });
    setSaving(false);
    loadData();
  };

  const revokeConsent = async (id) => {
    if (!confirm('Revoke consent for this teen?')) return;
    await base44.entities.ParentConsent.update(id, { is_consent_given: false });
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0010' }}>
        <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeConsents = consents.filter(c => c.is_consent_given);

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={22} /></button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield size={26} className="text-blue-400" />
              Parent Dashboard
            </h1>
            <p className="text-xs text-gray-400">Monitor your teen's mentorship activity</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle size={20} className="mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold text-white">{activeConsents.length}</p>
            <p className="text-xs text-gray-300">Active Consents</p>
          </div>
          <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
            <Clock size={20} className="mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold text-white">{teenSessions.length}</p>
            <p className="text-xs text-gray-300">Total Sessions</p>
          </div>
        </div>

        {/* Consents */}
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Shield size={18} className="text-blue-400" />
              Consent Records
            </h3>
            <button
              onClick={() => setShowConsentForm(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {consents.length === 0 ? (
            <div className="text-center py-8">
              <Shield size={36} className="mx-auto mb-3 text-gray-600" />
              <p className="text-sm text-gray-400">No consent records yet</p>
              <p className="text-xs text-gray-500 mt-1">Add consent for your teen to enable mentorship</p>
            </div>
          ) : (
            <div className="space-y-3">
              {consents.map(c => (
                <div key={c.id} className="rounded-xl p-4 flex items-center justify-between"
                  style={{ background: c.is_consent_given ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)', border: `1px solid ${c.is_consent_given ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                  <div>
                    <p className="text-sm font-semibold text-white">{c.teen_email}</p>
                    <p className="text-xs text-gray-400 mt-1">Type: {c.consent_type} • {c.is_consent_given ? '✅ Active' : '❌ Revoked'}</p>
                    {c.consent_date && <p className="text-xs text-gray-500">Given: {new Date(c.consent_date).toLocaleDateString()}</p>}
                  </div>
                  {c.is_consent_given && (
                    <button
                      onClick={() => revokeConsent(c.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Teen Session Activity */}
        {teenSessions.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Clock size={18} className="text-purple-400" />
              Recent Session Activity
            </h3>
            <div className="space-y-3">
              {teenSessions.slice(0, 10).map(session => (
                <div key={session.id} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Teen: <span className="text-white">{session.mentee_email.split('@')[0]}</span></p>
                      <p className="text-xs text-gray-400">Mentor: <span className="text-white">{session.mentor_email.split('@')[0]}</span></p>
                      {session.topic && <p className="text-xs text-gray-500 mt-1">📝 {session.topic}</p>}
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        session.status === 'completed' ? 'text-green-400' :
                        session.status === 'scheduled' ? 'text-blue-400' : 'text-gray-400'
                      }`} style={{ background: session.status === 'completed' ? 'rgba(34,197,94,0.1)' : session.status === 'scheduled' ? 'rgba(59,130,246,0.1)' : 'rgba(107,114,128,0.1)' }}>
                        {session.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{new Date(session.session_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {session.safety_concerns && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
                      <AlertCircle size={12} />
                      Safety concern reported
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Consent Form Modal */}
      {showConsentForm && (
        <div className="fixed inset-0 z-[100] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowConsentForm(false)}>
          <div className="w-full rounded-t-3xl p-6" style={{ background: '#1a0a30', paddingBottom: 'calc(1.5rem + var(--bottom-nav-h, 64px) + env(safe-area-inset-bottom, 0px))' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white text-lg">Give Consent</h3>
              <button onClick={() => setShowConsentForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Parent/Guardian Full Name *</label>
                <input value={form.parent_name} onChange={e => setForm({...form, parent_name: e.target.value})}
                  placeholder="Your full name"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Relationship to Child</label>
                <select value={form.relationship} onChange={e => setForm({...form, relationship: e.target.value})}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Teen's Email *</label>
                <select value={form.consent_type} onChange={e => setForm({...form, consent_type: e.target.value})}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <option value="all">All (Full Consent)</option>
                  <option value="mentorship">Mentorship Only</option>
                  <option value="video_sessions">Video Sessions</option>
                  <option value="data_sharing">Data Sharing</option>
                </select>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
                <p className="text-xs text-gray-300">By giving consent, you authorize GGU Mentorship Hub to facilitate mentorship sessions for the teen listed above, subject to all platform safety guidelines.</p>
              </div>
              <button onClick={giveConsent} disabled={saving || !form.teen_email || !form.parent_name}
                className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                {saving ? 'Saving...' : '✓ Give Consent'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}