import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_FILTERS = ['Pending', 'Approved', 'Rejected', 'All'];

const ADULT_CHECKLIST_KEYS = [
  { key: 'checklist_identity_verified', label: 'Identity Verified' },
  { key: 'checklist_background_cleared', label: 'Background Check Cleared' },
  { key: 'checklist_interview_completed', label: 'Interview Completed' },
  { key: 'checklist_lesson_passed', label: 'GGU Mentor Lesson Passed' },
  { key: 'checklist_tos_signed', label: 'Terms of Service Signed' },
  { key: 'checklist_final_approved', label: 'Final Approval by Admin' },
];

const TEEN_CHECKLIST_KEYS = [
  { key: 'parent_consent_given', label: 'Parent/Guardian Consent' },
  { key: 'checklist_identity_verified', label: 'Identity Verified (School ID / Parent)' },
  { key: 'checklist_interview_completed', label: 'Interview Completed' },
  { key: 'checklist_lesson_passed', label: 'GGU Mentor Lesson Passed' },
  { key: 'checklist_tos_signed', label: 'ToS Signed (countersigned by parent)' },
  { key: 'checklist_final_approved', label: 'Final Approval by Admin' },
];

function ApplicationCard({ app, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  const isTeenTrack = app.mentor_track === 'teen';
  const checklist = isTeenTrack ? TEEN_CHECKLIST_KEYS : ADULT_CHECKLIST_KEYS;

  const toggleChecklistItem = async (key, currentValue) => {
    setSaving(true);
    const updates = { [key]: !currentValue };
    // If final_approved is being checked, also flip the application status
    if (key === 'checklist_final_approved' && !currentValue) {
      updates.status = 'approved';
      updates.approved_date = new Date().toISOString();
    }
    await base44.entities.MentorApplication.update(app.id, updates);
    if (key === 'checklist_final_approved' && !currentValue && app.created_by_id) {
      try { await base44.entities.User.update(app.created_by_id, { mentor_status: 'approved' }); } catch {}
    }
    setSaving(false);
    onUpdate();
  };

  const setFinalStatus = async (status) => {
    setSaving(true);
    await base44.entities.MentorApplication.update(app.id, {
      status,
      approved_date: status === 'approved' ? new Date().toISOString() : undefined,
      checklist_final_approved: status === 'approved',
    });
    if (app.created_by_id) {
      const mentorStatus = status === 'approved' ? 'approved' : status === 'rejected' ? 'suspended' : 'pending';
      try { await base44.entities.User.update(app.created_by_id, { mentor_status: mentorStatus }); } catch {}
    }
    setSaving(false);
    onUpdate();
  };

  const completedCount = checklist.filter(item => app[item.key] === true).length + 1; // +1 for submitted
  const totalCount = checklist.length + 1;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Card Header */}
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-semibold text-white text-sm">{app.full_name}</p>
              <span style={{
                fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 8,
                background: isTeenTrack ? 'rgba(74,222,128,0.15)' : 'rgba(232,82,109,0.15)',
                color: isTeenTrack ? '#4ade80' : '#f48fb1',
                border: `1px solid ${isTeenTrack ? 'rgba(74,222,128,0.35)' : 'rgba(232,82,109,0.3)'}`,
              }}>
                {isTeenTrack ? 'Teen Mentor 🌱' : 'Adult Track ✅'}
              </span>
            </div>
            <p className="text-xs text-gray-400">{app.user_email}</p>
            {isTeenTrack && app.parent_email && (
              <p className="text-xs mt-0.5" style={{ color: app.parent_consent_given ? '#4ade80' : '#fbbf24' }}>
                👩‍👧 Parent: {app.parent_email} — {app.parent_consent_given ? 'Consent ✓' : app.parent_consent_sent ? 'Email sent, awaiting...' : 'Consent pending'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              app.status === 'approved' ? 'bg-green-500/20 text-green-400' :
              app.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>{app.status}</span>
            {expanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-500">Checklist progress</span>
            <span className="text-[10px] text-gray-400 font-bold">{completedCount}/{totalCount}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div style={{
              height: '100%',
              width: `${(completedCount / totalCount) * 100}%`,
              background: app.status === 'approved' ? '#4ade80' : 'linear-gradient(90deg, #e8526d, #f1b610)',
              borderRadius: 4, transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Expanded checklist */}
      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-2" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {isTeenTrack ? '🌱 Teen Mentor Checklist' : '✅ Adult Mentor Checklist'}
          </p>

          {/* Application Submitted — always done */}
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.4)', color: '#4ade80', fontSize: 10 }}>✓</div>
            <span className="text-xs" style={{ color: '#4ade80' }}>Application Submitted</span>
          </div>

          {checklist.map(item => {
            const checked = app[item.key] === true;
            return (
              <button
                key={item.key}
                disabled={saving}
                onClick={() => toggleChecklistItem(item.key, checked)}
                className="flex items-center gap-3 w-full text-left transition-opacity"
                style={{ opacity: saving ? 0.5 : 1 }}
              >
                <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{
                  background: checked ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.05)',
                  border: checked ? '1px solid rgba(74,222,128,0.5)' : '1px solid rgba(255,255,255,0.15)',
                  color: checked ? '#4ade80' : 'transparent',
                  fontSize: 10,
                }}>
                  {checked ? '✓' : ''}
                </div>
                <span className="text-xs" style={{ color: checked ? '#4ade80' : 'rgba(255,255,255,0.6)' }}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Final actions */}
          {app.status === 'pending' && (
            <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button
                onClick={() => setFinalStatus('approved')}
                disabled={saving}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1"
                style={{ background: 'rgba(16,185,129,0.3)', border: '1px solid rgba(16,185,129,0.4)' }}
              >
                <CheckCircle size={12} /> Approve
              </button>
              <button
                onClick={() => setFinalStatus('rejected')}
                disabled={saving}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-orange-400 flex items-center justify-center gap-1"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
              >
                <XCircle size={12} /> Reject
              </button>
            </div>
          )}
          {app.status === 'approved' && (
            <div className="mt-3 pt-3 text-xs text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', color: '#4ade80' }}>
              ✅ Approved on {app.approved_date ? new Date(app.approved_date).toLocaleDateString() : '—'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MentorsAdminTab() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [newsletter, setNewsletter] = useState({ subject: '', body: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const apps = await base44.entities.MentorApplication.list('-created_date');
      setApplications(apps);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const sendNewsletter = async () => {
    if (!newsletter.subject.trim()) return;
    const approved = applications.filter(a => a.status === 'approved');
    for (const mentor of approved) {
      await base44.integrations.Core.SendEmail({ to: mentor.user_email, subject: newsletter.subject, body: newsletter.body });
    }
    setComposing(false);
    setNewsletter({ subject: '', body: '' });
    alert(`Newsletter sent to ${approved.length} mentors!`);
  };

  const filtered = filter === 'All' ? applications : applications.filter(a => a.status === filter.toLowerCase());
  const teenCount = applications.filter(a => a.mentor_track === 'teen').length;
  const adultCount = applications.filter(a => a.mentor_track !== 'teen').length;

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm";

  return (
    <div className="space-y-4">
      {/* Track summary */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
          <div className="text-lg font-black" style={{ color: '#4ade80' }}>{teenCount}</div>
          <div className="text-[10px] font-bold" style={{ color: 'rgba(74,222,128,0.7)' }}>Teen Mentors 🌱</div>
        </div>
        <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: 'rgba(232,82,109,0.08)', border: '1px solid rgba(232,82,109,0.2)' }}>
          <div className="text-lg font-black" style={{ color: '#f48fb1' }}>{adultCount}</div>
          <div className="text-[10px] font-bold" style={{ color: 'rgba(244,143,177,0.7)' }}>Adult Mentors ✅</div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(251,191,36,0.3)' }}>
        <div className="p-4 flex items-center justify-between" style={{ background: 'rgba(251,191,36,0.1)' }}>
          <div>
            <p className="font-bold text-white text-sm flex items-center gap-2">👑 Ms. Glow Newsletter</p>
            <p className="text-xs text-gray-400 mt-0.5">Send a monthly newsletter to all approved mentors.</p>
          </div>
          <button onClick={() => setComposing(!composing)} className="px-3 py-1.5 rounded-full text-xs font-bold transition" style={{ background: composing ? 'rgba(251,191,36,0.4)' : 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.4)', color: '#fbbf24' }}>
            {composing ? '✕ Close' : 'Compose'}
          </button>
        </div>
        {composing && (
          <div className="p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', borderTop: '1px solid rgba(251,191,36,0.2)' }}>
            <p className="text-xs text-yellow-400 font-semibold">Recipients: {applications.filter(a => a.status === 'approved').length} approved mentor{applications.filter(a => a.status === 'approved').length !== 1 ? 's' : ''}</p>
            <input value={newsletter.subject} onChange={e => setNewsletter({ ...newsletter, subject: e.target.value })} placeholder="Email subject..." className={inputCls} />
            <textarea value={newsletter.body} onChange={e => setNewsletter({ ...newsletter, body: e.target.value })} placeholder="Newsletter body..." className={inputCls} rows={5} />
            <button onClick={sendNewsletter} disabled={!newsletter.subject.trim() || applications.filter(a => a.status === 'approved').length === 0} className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
              Send to All Approved Mentors
            </button>
            {applications.filter(a => a.status === 'approved').length === 0 && (
              <p className="text-xs text-gray-500 text-center">No approved mentors yet — approve applications first.</p>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {STATUS_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition ${filter === f ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={filter === f ? { background: 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="p-8 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-sm text-gray-400">No {filter.toLowerCase()} applications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => (
            <ApplicationCard key={app.id} app={app} onUpdate={load} />
          ))}
        </div>
      )}
    </div>
  );
}