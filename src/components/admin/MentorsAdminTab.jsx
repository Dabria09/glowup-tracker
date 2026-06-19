import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, ChevronRight, Mail, Phone, MapPin, BookOpen, Briefcase, GraduationCap, Star, Users, Heart, MessageSquare, Plus, Link2 } from 'lucide-react';

const STATUS_FILTERS = ['Pending', 'Approved', 'Rejected', 'All'];
const RANK_FILTERS = ['All', 'Luminary', 'Radiant', 'Bloom', 'Sprout', 'Seed'];
const SESSION_TYPE_FILTERS = ['All', 'In-person', 'Video Call', 'Phone Call', 'Chat'];
const IN_PERSON_FILTERS = ['All', 'In-Person Approved'];

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

function ApplicationCard({ app, onUpdate, matches, groups, setShowAssign, setAssignForm }) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('overview'); // 'overview' | 'details' | 'checklist'

  const isTeenTrack = app.mentor_track === 'teen';
  const checklist = isTeenTrack ? TEEN_CHECKLIST_KEYS : ADULT_CHECKLIST_KEYS;

  const categories = JSON.parse(app.categories || '[]');
  const ageGroups = JSON.parse(app.age_groups || '[]');
  const availability = JSON.parse(app.availability || '[]');
  const agreements = JSON.parse(app.agreements_accepted || '[]');
  const bgCleared = app.checklist_background_cleared === true || app.background_check_status === 'cleared';

  const mentorMatches = matches?.filter(m => m.mentor_email === app.user_email) || [];
  const getGroupName = (groupId) => {
    const g = groups?.find(x => x.id === groupId);
    return g ? g.group_name : null;
  };

  // Calculate mentor stats from sessions (would need to be fetched from parent or via backend)
  const sessionsCount = app.sessions_count || 0;
  const avgRating = app.rating || 0;

  const InfoRow = ({ icon: Icon, label, value, color = '#9ca3af' }) => {
    if (!value) return null;
    return (
      <div className="flex items-center gap-2 mb-2">
        <Icon size={12} className="flex-shrink-0" style={{ color }} />
        <span className="text-[10px] text-gray-500">{label}:</span>
        <span className="text-xs text-gray-200">{value}</span>
      </div>
    );
  };

  const RankBadge = ({ tier }) => {
    const RANK_META = {
      seed: { label: 'Seed', color: '#9ca3af', bg: 'rgba(156,163,175,0.15)', border: 'rgba(156,163,175,0.3)' },
      sprout: { label: 'Sprout', color: '#86efac', bg: 'rgba(134,239,172,0.15)', border: 'rgba(134,239,172,0.3)' },
      bloom: { label: 'Bloom', color: '#f472b6', bg: 'rgba(244,114,182,0.15)', border: 'rgba(244,114,182,0.3)' },
      radiant: { label: 'Radiant', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)' },
      luminary: { label: 'Luminary', color: '#a855f7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)' },
    };
    const meta = RANK_META[tier] || RANK_META.seed;
    return (
      <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
        🌟 {meta.label}
      </span>
    );
  };

  const RankProgress = ({ tier, sessionsCount, avgRating }) => {
    const RANK_CRITERIA = [
      { tier: 'seed', label: 'Seed', minSessions: 0, minRating: 0, desc: 'New mentor' },
      { tier: 'sprout', label: 'Sprout', minSessions: 3, minRating: 0, desc: '3+ sessions' },
      { tier: 'bloom', label: 'Bloom', minSessions: 6, minRating: 0, desc: '6+ sessions' },
      { tier: 'radiant', label: 'Radiant', minSessions: 16, minRating: 4.5, desc: '16+ sessions, 4.5★' },
      { tier: 'luminary', label: 'Luminary', minSessions: 31, minRating: 4.8, desc: '31+ sessions, 4.8★' },
    ];
    const currentIndex = RANK_CRITERIA.findIndex(r => r.tier === tier);
    const nextRank = RANK_CRITERIA[currentIndex + 1];
    const progress = nextRank
      ? Math.min(100, (sessionsCount / nextRank.minSessions) * 100)
      : 100;

    return (
      <div className="rounded-xl p-3 mt-3" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-purple-400">📈 Rank Progress</p>
          <span className="text-[10px] text-gray-400">{sessionsCount} sessions · {avgRating > 0 ? `${avgRating.toFixed(1)}★` : 'No ratings'}</span>
        </div>
        {nextRank ? (
          <>
            <p className="text-[10px] text-gray-300 mb-1">
              Next: <span className="font-semibold text-purple-300">{nextRank.label}</span> — {nextRank.desc}
            </p>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[9px] text-gray-500 mt-1">{Math.round(progress)}% to {nextRank.label}</p>
          </>
        ) : (
          <p className="text-[10px] text-emerald-400">✅ Maximum rank achieved!</p>
        )}
      </div>
    );
  };

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

  const toggleInPersonApproval = async () => {
    setSaving(true);
    const me = await base44.auth.me();
    const updates = {
      in_person_approved: !app.in_person_approved,
      in_person_approval_date: !app.in_person_approved ? new Date().toISOString() : null,
      in_person_approved_by: !app.in_person_approved ? me.email : null,
    };
    await base44.entities.MentorApplication.update(app.id, updates);
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

  const SectionButton = ({ id, label, emoji }) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${activeSection === id ? 'text-white' : 'text-gray-400 bg-white/5'}`}
      style={activeSection === id ? { background: 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}
    >
      {emoji} {label}
    </button>
  );

  // Background check status helpers
  const bgStatus = app.background_check_status || 'not_started';
  const bgDate = app.background_check_date ? new Date(app.background_check_date).toLocaleDateString() : null;
  const bgNotes = app.background_check_notes;

  const BG_STATUS_META = {
    not_started: { label: 'Not Started', color: '#6b7280', bg: 'rgba(107,113,128,0.15)', border: 'rgba(107,113,128,0.3)' },
    in_progress: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
    cleared: { label: 'Cleared ✅', color: '#4ade80', bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.3)' },
    failed: { label: 'Failed ❌', color: '#f87171', bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.3)' },
  };

  return (
    <div data-mentor-id={app.id} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Card Header */}
      <div className="p-4">
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
            {app.status === 'approved' && <RankBadge tier={app.mentor_tier || 'seed'} />}
            {app.status === 'approved' && app.in_person_approved && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid rgba(16,185,129,0.4)' }}>
                📍 In-Person
              </span>
            )}
            <button onClick={() => setExpanded(e => !e)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5">
              {expanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
            </button>
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

      {/* Expanded Application Details */}
      {expanded && (
        <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          {/* Section tabs */}
          <div className="flex gap-1 p-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <SectionButton id="overview" label="Overview" emoji="📋" />
            <SectionButton id="details" label="Full Application" emoji="📝" />
            <SectionButton id="checklist" label="Checklist" emoji="✅" />
          </div>

          <div className="p-4 max-h-[600px] overflow-y-auto">
            {/* OVERVIEW SECTION */}
            {activeSection === 'overview' && (
              <div className="space-y-4">
                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[10px] text-gray-500 mb-1">Submitted</p>
                    <p className="text-sm font-semibold text-white">{app.submitted_date ? new Date(app.submitted_date).toLocaleDateString() : '—'}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[10px] text-gray-500 mb-1">Track</p>
                    <p className="text-sm font-semibold text-white">{isTeenTrack ? '🌱 Teen Mentor' : '✅ Adult Mentor'}</p>
                  </div>
                </div>

                {/* BACKGROUND CHECK STATUS - ADULT MENTORS ONLY */}
                {!isTeenTrack && (
                  <div className="rounded-2xl p-4 border-2" style={{
                    background: bgCleared ? 'rgba(74,222,128,0.08)' : bgStatus === 'failed' ? 'rgba(248,113,113,0.08)' : 'rgba(251,191,36,0.08)',
                    border: `2px solid ${bgCleared ? 'rgba(74,222,128,0.4)' : bgStatus === 'failed' ? 'rgba(248,113,113,0.4)' : 'rgba(251,191,36,0.3)'}`,
                  }}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: BG_STATUS_META[bgStatus].bg, border: `1px solid ${BG_STATUS_META[bgStatus].border}` }}>
                          {bgStatus === 'cleared' ? '✅' : bgStatus === 'failed' ? '❌' : bgStatus === 'in_progress' ? '⏳' : '📋'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Background Check (Adult Mentor)</p>
                          <p className={`text-[10px] font-semibold`} style={{ color: BG_STATUS_META[bgStatus].color }}>
                            {BG_STATUS_META[bgStatus].label}
                          </p>
                        </div>
                      </div>
                      {!bgCleared && app.status === 'pending' && (
                        <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}>
                          ⚠️ REQUIRED BEFORE APPROVAL
                        </span>
                      )}
                    </div>
                    {bgDate && (
                      <p className="text-[10px] text-gray-400 mb-1">Completed: <span className="text-gray-300">{bgDate}</span></p>
                    )}
                    {bgNotes && (
                      <div className="mt-2 p-2 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <p className="text-[10px] text-gray-500 mb-0.5">Admin Notes:</p>
                        <p className="text-xs text-gray-300">{bgNotes}</p>
                      </div>
                    )}
                    {!bgCleared && app.status === 'pending' && (
                      <div className="mt-3 p-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                        <p className="text-[10px] text-red-400 font-semibold">
                          ⚠️ This adult mentor applicant CANNOT be approved until background check is marked as cleared in the Checklist tab.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Bio */}
                {app.bio && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.25)' }}>
                    <p className="text-[10px] font-bold text-pink-400 mb-1 flex items-center gap-1">
                      <Heart size={10} /> About Me
                    </p>
                    <p className="text-sm text-gray-200 leading-relaxed">{app.bio}</p>
                  </div>
                )}

                {/* Why Mentor */}
                {app.why_mentor && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}>
                    <p className="text-[10px] font-bold text-purple-400 mb-1 flex items-center gap-1">
                      <Star size={10} /> Why They Want to Mentor
                    </p>
                    <p className="text-sm text-gray-200 leading-relaxed">{app.why_mentor}</p>
                  </div>
                )}

                {/* Categories */}
                {categories.length > 0 && (
                  <div>
                    <p className="text-[10px] text-gray-500 mb-2">Mentorship Categories</p>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map((cat, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 rounded-full font-semibold" style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.35)', color: '#c084fc' }}>
                          {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-lg font-bold text-white">{app.experience_years || 0}</p>
                    <p className="text-[10px] text-gray-500">Years Exp</p>
                  </div>
                  <div className="text-center rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-lg font-bold text-white">{app.mentee_count || '0'}</p>
                    <p className="text-[10px] text-gray-500">Want to Mentor</p>
                  </div>
                  <div className="text-center rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-lg font-bold text-white">{app.hours_per_month || '—'}</p>
                    <p className="text-[10px] text-gray-500">Hours/Month</p>
                  </div>
                </div>

                {/* Rank Progression - Approved Mentors Only */}
                {app.status === 'approved' && (
                  <RankProgress tier={app.mentor_tier || 'seed'} sessionsCount={sessionsCount} avgRating={avgRating} />
                )}


              </div>
            )}

            {/* FULL APPLICATION SECTION */}
            {activeSection === 'details' && (
              <div className="space-y-4">
                {/* Contact Info */}
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-[10px] font-bold text-gray-400 mb-2">CONTACT INFORMATION</p>
                  {app.phone && <InfoRow icon={Phone} label="Phone" value={app.phone} color="#4ade80" />}
                  {app.city && app.state && <InfoRow icon={MapPin} label="Location" value={`${app.city}, ${app.state}`} color="#f59e0b" />}
                  {isTeenTrack && app.parent_email && <InfoRow icon={Mail} label="Parent Email" value={app.parent_email} color="#ec4899" />}
                  {isTeenTrack && app.parent_name && <InfoRow icon={Users} label="Parent/Guardian Name" value={app.parent_name} color="#ec4899" />}
                  {isTeenTrack && app.parent_relationship && <InfoRow icon={Heart} label="Parent Relationship" value={app.parent_relationship} color="#ec4899" />}
                </div>

                {/* Professional Background */}
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-[10px] font-bold text-gray-400 mb-2">PROFESSIONAL BACKGROUND</p>
                  <InfoRow icon={Briefcase} label="Occupation" value={app.occupation} color="#3b82f6" />
                  <InfoRow icon={Briefcase} label="Employer/School" value={app.employer || app.school_or_workplace} color="#3b82f6" />
                  <InfoRow icon={GraduationCap} label="Education" value={app.education} color="#8b5cf6" />
                  <InfoRow icon={GraduationCap} label="Field of Study/Industry" value={app.field_of_study} color="#8b5cf6" />
                  <InfoRow icon={Star} label="Years of Experience" value={app.experience_years ? `${app.experience_years} years` : 'Not specified'} color="#f59e0b" />
                  {app.languages && <InfoRow icon={MessageSquare} label="Languages" value={app.languages} color="#4ade80" />}
                </div>

                {/* Mentorship Preferences */}
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-[10px] font-bold text-gray-400 mb-2">MENTORSHIP PREFERENCES</p>
                  {ageGroups.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-gray-500 mb-1">Age Groups</p>
                      <div className="flex flex-wrap gap-1">
                        {ageGroups.map((g, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(236,72,153,0.2)', border: '1px solid rgba(236,72,153,0.3)', color: '#f48fb1' }}>
                            {g.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {availability.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-gray-500 mb-1">Availability</p>
                      <div className="flex flex-wrap gap-1">
                        {availability.map((a, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }}>
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <InfoRow icon={MessageSquare} label="Session Type" value={app.session_type} color="#4ade80" />
                  <InfoRow icon={Users} label="Mentoring Type" value={app.mentoring_type} color="#4ade80" />
                </div>

                {/* Essays */}
                {(app.why_mentor || app.wish_someone_told || app.empowerment_meaning || app.challenge_overcome || app.mentoring_style) && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[10px] font-bold text-gray-400 mb-2">ESSAY RESPONSES</p>
                    {app.why_mentor && (
                      <div className="mb-3 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                        <p className="text-[10px] text-pink-400 font-semibold mb-1">💜 Why do you want to mentor?</p>
                        <p className="text-sm text-gray-200 leading-relaxed">{app.why_mentor}</p>
                      </div>
                    )}
                    {app.wish_someone_told && (
                      <div className="mb-3 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                        <p className="text-[10px] text-purple-400 font-semibold mb-1">✨ What do you wish someone had told you?</p>
                        <p className="text-sm text-gray-200 leading-relaxed">{app.wish_someone_told}</p>
                      </div>
                    )}
                    {app.empowerment_meaning && (
                      <div className="mb-3 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                        <p className="text-[10px] text-blue-400 font-semibold mb-1">🌟 What does empowerment mean to you?</p>
                        <p className="text-sm text-gray-200 leading-relaxed">{app.empowerment_meaning}</p>
                      </div>
                    )}
                    {app.challenge_overcome && (
                      <div className="mb-3 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                        <p className="text-[10px] text-amber-400 font-semibold mb-1">💪 Challenge you've overcome</p>
                        <p className="text-sm text-gray-200 leading-relaxed">{app.challenge_overcome}</p>
                      </div>
                    )}
                    {app.mentoring_style && (
                      <div>
                        <p className="text-[10px] text-green-400 font-semibold mb-1">🎯 Mentoring style</p>
                        <p className="text-sm text-gray-200 leading-relaxed">{app.mentoring_style}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Youth Experience */}
                {app.worked_with_youth && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)' }}>
                    <p className="text-[10px] font-bold text-green-400 mb-1">Youth Experience</p>
                    <p className="text-sm text-gray-200">{app.worked_with_youth === 'yes' ? '✅ Has worked with youth before' : '❌ No prior youth experience'}</p>
                    {app.youth_experience_description && (
                      <p className="text-xs text-gray-300 mt-2 leading-relaxed">{app.youth_experience_description}</p>
                    )}
                  </div>
                )}

                {/* References */}
                {(app.reference_1_name || app.reference_2_name) && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[10px] font-bold text-gray-400 mb-2">REFERENCES</p>
                    {app.reference_1_name && (
                      <div className="mb-3 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                        <p className="text-xs font-semibold text-white mb-1">Reference 1: {app.reference_1_name}</p>
                        {app.reference_1_relationship && <p className="text-[10px] text-gray-500">Relationship: {app.reference_1_relationship}</p>}
                        {app.reference_1_email && <p className="text-[10px] text-gray-500">Email: {app.reference_1_email}</p>}
                      </div>
                    )}
                    {app.reference_2_name && (
                      <div>
                        <p className="text-xs font-semibold text-white mb-1">Reference 2: {app.reference_2_name}</p>
                        {app.reference_2_relationship && <p className="text-[10px] text-gray-500">Relationship: {app.reference_2_relationship}</p>}
                        {app.reference_2_email && <p className="text-[10px] text-gray-500">Email: {app.reference_2_email}</p>}
                      </div>
                    )}
                  </div>
                )}

                {/* Agreements */}
                {agreements.length > 0 && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[10px] font-bold text-gray-400 mb-2">ACCEPTED AGREEMENTS</p>
                    <div className="space-y-1">
                      {agreements.map((agr, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-green-400" />
                          <p className="text-xs text-gray-300">{agr}</p>
                        </div>
                      ))}
                    </div>
                    {app.agreements_timestamp && (
                      <p className="text-[10px] text-gray-500 mt-2">Signed: {new Date(app.agreements_timestamp).toLocaleString()}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CHECKLIST SECTION */}
            {activeSection === 'checklist' && (
              <div className="space-y-2">
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
                      disabled={saving || (!isTeenTrack && !bgCleared)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: (!isTeenTrack && !bgCleared) ? 'rgba(107,113,128,0.3)' : 'rgba(16,185,129,0.3)', border: (!isTeenTrack && !bgCleared) ? '1px solid rgba(107,113,128,0.4)' : '1px solid rgba(16,185,129,0.4)' }}
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

                {/* In-Person Approval Toggle (Approved mentors only) */}
                {app.status === 'approved' && (
                  <div className="mt-4 pt-3 rounded-xl p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: app.in_person_approved ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)' }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-white flex items-center gap-1">
                          📍 In-Person Mentoring Approval
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {app.in_person_approved 
                            ? `Approved ${app.in_person_approval_date ? new Date(app.in_person_approval_date).toLocaleDateString() : ''}`
                            : 'Not yet approved for in-person sessions'}
                        </p>
                      </div>
                      <button
                        onClick={toggleInPersonApproval}
                        disabled={saving}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition disabled:opacity-40 ${
                          app.in_person_approved 
                            ? 'text-emerald-400' 
                            : 'text-gray-400'
                        }`}
                        style={app.in_person_approved 
                          ? { background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)' }
                          : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                      >
                        {app.in_person_approved ? '✓ Approved' : 'Grant Approval'}
                      </button>
                    </div>
                    {app.in_person_approved && app.in_person_approved_by && (
                      <p className="text-[10px] text-gray-500">
                        By: {app.in_person_approved_by.split('@')[0]}
                      </p>
                    )}
                  </div>
                )}
                {!isTeenTrack && !bgCleared && app.status === 'pending' && (
                  <p className="text-[10px] text-red-400 text-center mt-2 flex items-center justify-center gap-1">
                    <span>⚠️</span>
                    <span>Background check must be cleared before approving adult mentors</span>
                  </p>
                )}
                {app.status === 'approved' && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs text-emerald-400 font-semibold">✅ Approved {app.approved_date ? new Date(app.approved_date).toLocaleDateString() : ''}</span>
                      <button
                        onClick={() => { setShowAssign(app.id); setAssignForm({ mentee_email: '', group_id: '', goal: '' }); }}
                        className="text-xs px-3 py-1.5 rounded-full font-bold text-white flex items-center gap-1"
                        style={{ background: 'linear-gradient(135deg,#3b82f6,#a855f7)' }}
                      >
                        <Link2 size={11} /> Assign
                      </button>
                    </div>
                    
                    {/* In-Person Approval Toggle */}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">📍 In-Person Approved:</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${app.in_person_approved ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {app.in_person_approved ? 'Yes ✓' : 'No'}
                        </span>
                      </div>
                      <button
                        onClick={async () => {
                          const newVal = !app.in_person_approved;
                          await base44.entities.MentorApplication.update(app.id, {
                            in_person_approved: newVal,
                            in_person_approval_date: newVal ? new Date().toISOString() : null,
                            in_person_approved_by: newVal ? (await base44.auth.me()).email : null,
                          });
                          onUpdate();
                        }}
                        className={`text-[10px] px-2 py-1 rounded-full font-bold transition ${app.in_person_approved ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                      >
                        {app.in_person_approved ? '✕ Remove' : '+ Add'}
                      </button>
                    </div>
                    {mentorMatches.length === 0 ? <p className="text-[10px] text-gray-500">No assignments yet</p> : (
                      <div className="space-y-1 mt-2">
                        <p className="text-[10px] text-gray-500 font-semibold">{mentorMatches.length} mentee{mentorMatches.length !== 1 ? 's' : ''}:</p>
                        {mentorMatches.slice(0, 3).map(m => (
                          <div key={m.id} className="text-[10px] text-gray-300 flex items-center gap-1">
                            <span>•</span>
                            <span>{m.mentee_email?.split('@')[0]}</span>
                            {m.goal && <span className="text-gray-500"> — {m.goal}</span>}
                          </div>
                        ))}
                        {mentorMatches.length > 3 && <p className="text-[10px] text-gray-500">+ {mentorMatches.length - 3} more</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MentorsAdminTab() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [rankFilter, setRankFilter] = useState('All');
  const [sessionTypeFilter, setSessionTypeFilter] = useState('All');
  const [inPersonFilter, setInPersonFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [newsletter, setNewsletter] = useState({ subject: '', body: '' });
  const [matches, setMatches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showAssign, setShowAssign] = useState(null);
  const [assignForm, setAssignForm] = useState({ mentee_email: '', group_id: '', goal: '' });
  const [flaggedMentors, setFlaggedMentors] = useState([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [apps, m, g, sessions] = await Promise.all([
        base44.entities.MentorApplication.list('-created_date'),
        base44.entities.MentorshipProgress.list('-created_date'),
        base44.entities.ClassGroup.filter({ is_active: true }, '-created_date'),
        base44.entities.MentorSession.filter({ status: 'completed' }, '-session_date'),
      ]);
      setApplications(apps);
      setMatches(m);
      setGroups(g);
      
      // Calculate flagged mentors (low ratings or safety concerns)
      const mentorStats = {};
      sessions.forEach(s => {
        if (!mentorStats[s.mentor_email]) {
          mentorStats[s.mentor_email] = { sessions: [], ratings: [], safetyFlags: 0 };
        }
        mentorStats[s.mentor_email].sessions.push(s);
        if (s.rating > 0) mentorStats[s.mentor_email].ratings.push(s.rating);
        if (s.feedback && /safety|concern|inappropriate|uncomfortable/i.test(s.feedback)) {
          mentorStats[s.mentor_email].safetyFlags++;
        }
      });
      
      const flagged = apps.filter(a => {
        const stats = mentorStats[a.user_email];
        if (!stats) return false;
        const avgRating = stats.ratings.length > 0 
          ? stats.ratings.reduce((sum, r) => sum + r, 0) / stats.ratings.length 
          : 0;
        // Flag if: avg rating < 3.5 with 3+ reviews, OR has safety flags
        return (stats.ratings.length >= 3 && avgRating < 3.5) || stats.safetyFlags > 0;
      }).map(a => {
        const stats = mentorStats[a.user_email];
        const avgRating = stats.ratings.length > 0 
          ? stats.ratings.reduce((sum, r) => sum + r, 0) / stats.ratings.length 
          : 0;
        return {
          ...a,
          _avgRating: Math.round(avgRating * 10) / 10,
          _reviewCount: stats.ratings.length,
          _safetyFlags: stats.safetyFlags,
          _totalSessions: stats.sessions.length,
        };
      });
      setFlaggedMentors(flagged);
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

  const assignMentor = async (appId) => {
    if (!assignForm.mentee_email.trim()) return;
    const app = applications.find(a => a.id === appId);
    await base44.entities.MentorshipProgress.create({
      mentor_email: app.user_email,
      mentee_email: assignForm.mentee_email,
      goal: assignForm.goal || '',
      group_id: assignForm.group_id || null,
      progress_percentage: 0,
      status: 'active',
    });
    setShowAssign(null);
    setAssignForm({ mentee_email: '', group_id: '', goal: '' });
    load();
  };



  const filtered = applications.filter(a => {
    if (statusFilter !== 'All' && a.status !== statusFilter.toLowerCase()) return false;
    if (statusFilter === 'Approved' && rankFilter !== 'All') {
      const mentorTier = a.mentor_tier || 'seed';
      if (mentorTier !== rankFilter.toLowerCase()) return false;
    }
    if (sessionTypeFilter !== 'All' && a.session_type !== sessionTypeFilter) return false;
    if (inPersonFilter === 'In-Person Approved' && !a.in_person_approved) return false;
    return true;
  });
  const teenCount = applications.filter(a => a.mentor_track === 'teen').length;
  const adultCount = applications.filter(a => a.mentor_track !== 'teen').length;

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm";

  return (
    <div className="space-y-4">
      {/* Performance Alerts */}
      {flaggedMentors.length > 0 && (
        <div className="rounded-2xl p-4 border-2" style={{ background: 'rgba(239,68,68,0.08)', border: '2px solid rgba(239,68,68,0.35)' }}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}>
                  <span className="text-lg">⚠️</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-red-400">Mentors Needing Review</p>
                  <p className="text-[10px] text-gray-400">{flaggedMentors.length} mentor{flaggedMentors.length !== 1 ? 's' : ''} flagged for low ratings or safety concerns</p>
                </div>
              </div>
              <div className="space-y-2">
                {flaggedMentors.slice(0, 3).map(fm => (
                  <div key={fm.id} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex-1">
                      <p className="text-xs text-white font-semibold">{fm.full_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {fm._avgRating > 0 && fm._avgRating < 3.5 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                            {fm._avgRating}★ ({fm._reviewCount} reviews)
                          </span>
                        )}
                        {fm._safetyFlags > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                            🚨 {fm._safetyFlags} safety flag{fm._safetyFlags !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const card = document.querySelector(`[data-mentor-id="${fm.id}"]`);
                        if (card) {
                          const expandBtn = card.querySelector('button[onClick*="setExpanded"]');
                          if (expandBtn) expandBtn.click();
                          setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
                        }
                      }}
                      className="text-[10px] px-3 py-1.5 rounded-full font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}
                    >
                      Review
                    </button>
                  </div>
                ))}
                {flaggedMentors.length > 3 && (
                  <p className="text-[10px] text-gray-500 text-center">+ {flaggedMentors.length - 3} more</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Track summary + Tier Update */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
          <div className="text-lg font-black" style={{ color: '#4ade80' }}>{teenCount}</div>
          <div className="text-[10px] font-bold" style={{ color: 'rgba(74,222,128,0.7)' }}>Teen Mentors 🌱</div>
        </div>
        <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: 'rgba(232,82,109,0.08)', border: '1px solid rgba(232,82,109,0.2)' }}>
          <div className="text-lg font-black" style={{ color: '#f48fb1' }}>{adultCount}</div>
          <div className="text-[10px] font-bold" style={{ color: 'rgba(244,143,177,0.7)' }}>Adult Mentors ✅</div>
        </div>
        <button
          onClick={async () => {
            try {
              const res = await base44.functions.invoke('updateMentorTiers', {});
              alert(`✅ ${res.data?.message || 'Mentor tiers updated!'}`);
              load();
            } catch (e) {
              alert('Error: ' + e.message);
            }
          }}
          className="flex-1 rounded-2xl p-3 text-center" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}
        >
          <div className="text-lg font-black" style={{ color: '#a855f7' }}>🔄</div>
          <div className="text-[10px] font-bold" style={{ color: 'rgba(168,85,247,0.7)' }}>Update Tiers</div>
        </button>
      </div>

      {/* Rank Criteria Info */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm font-bold text-purple-300 mb-2">🌟 Mentor Rank Progression</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                { tier: 'seed', label: 'Seed', req: '0-2 sessions', color: '#9ca3af' },
                { tier: 'sprout', label: 'Sprout', req: '3-5 sessions', color: '#86efac' },
                { tier: 'bloom', label: 'Bloom', req: '6-15 sessions', color: '#f472b6' },
                { tier: 'radiant', label: 'Radiant', req: '16-30 + 4.5★', color: '#fbbf24' },
                { tier: 'luminary', label: 'Luminary', req: '31+ + 4.8★', color: '#a855f7' },
              ].map(r => (
                <div key={r.tier} className="text-center rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${r.color}40` }}>
                  <p className="text-xs font-bold" style={{ color: r.color }}>{r.label}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{r.req}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              💡 Ranks update automatically based on completed sessions and average ratings. Manual refresh available above.
            </p>
          </div>
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

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {STATUS_FILTERS.map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition ${statusFilter === f ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={statusFilter === f ? { background: 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}>
            {f}
          </button>
        ))}
      </div>

      {/* Rank Filters (Approved mentors only) */}
      {statusFilter === 'Approved' && (
        <div className="flex gap-2 overflow-x-auto">
          {RANK_FILTERS.map(r => (
            <button key={r} onClick={() => setRankFilter(r)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${rankFilter === r ? 'text-white' : 'text-gray-400 bg-white/5'}`}
              style={rankFilter === r ? { background: 'linear-gradient(135deg,#a855f7,#ec4899)' } : {}}>
              {r === 'All' ? 'All Ranks' : `🌟 ${r}`}
            </button>
          ))}
        </div>
      )}

      {/* Session Type Filter */}
      <div className="flex gap-2 overflow-x-auto">
        {SESSION_TYPE_FILTERS.map(t => (
          <button key={t} onClick={() => setSessionTypeFilter(t)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${sessionTypeFilter === t ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={sessionTypeFilter === t ? { background: t === 'In-person' ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#3b82f6,#a855f7)' } : {}}>
            {t === 'In-person' ? '📍 ' : t === 'Video Call' ? '📹 ' : t === 'Phone Call' ? '📞 ' : t === 'Chat' ? '💬 ' : ''}{t}
          </button>
        ))}
      </div>
      {sessionTypeFilter === 'In-person' && (
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <p className="text-xs text-emerald-400 font-semibold">
            📍 Showing {filtered.length} in-person mentor{filtered.length !== 1 ? 's' : ''} — perfect for events &amp; community tables
          </p>
        </div>
      )}

      {/* In-Person Approval Filter */}
      <div className="flex gap-2 overflow-x-auto">
        {IN_PERSON_FILTERS.map(f => (
          <button key={f} onClick={() => setInPersonFilter(f)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${inPersonFilter === f ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={inPersonFilter === f ? { background: 'linear-gradient(135deg,#10b981,#059669)' } : {}}>
            {f === 'All' ? 'All Mentors' : '📍 In-Person Approved Only'}
          </button>
        ))}
      </div>
      {inPersonFilter === 'In-Person Approved' && (
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <p className="text-xs text-emerald-400 font-semibold">
            📍 Showing {filtered.length} in-person approved mentor{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* In-Person Approval Filter */}
      <div className="flex gap-2 overflow-x-auto">
        {['All', 'In-Person Approved'].map(f => (
          <button key={f} onClick={() => setInPersonFilter(f)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${inPersonFilter === f ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={inPersonFilter === f ? { background: 'linear-gradient(135deg,#10b981,#059669)', border: '1px solid rgba(16,185,129,0.4)' } : {}}>
            {f === 'All' ? 'All Mentors' : '📍 In-Person Approved Only'}
          </button>
        ))}
      </div>
      {inPersonFilter === 'In-Person Approved' && (
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <p className="text-xs text-emerald-400 font-semibold">
            📍 Showing {filtered.length} in-person approved mentor{filtered.length !== 1 ? 's' : ''} — cleared for face-to-face meetings
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="p-8 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-sm text-gray-400">No {statusFilter.toLowerCase()} applications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => (
            <ApplicationCard key={app.id} app={app} onUpdate={load} matches={matches} groups={groups} setShowAssign={setShowAssign} setAssignForm={setAssignForm} />
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {showAssign && applications.find(a => a.id === showAssign) && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-4" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-white text-sm">Assign Mentor</p>
              <button onClick={() => { setShowAssign(null); setAssignForm({ mentee_email: '', group_id: '', goal: '' }); }} className="text-gray-400 hover:text-white"><XCircle size={18} /></button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Assign <span className="text-white font-semibold">{applications.find(a => a.id === showAssign)?.full_name}</span> to a mentee or group
            </p>
            <div className="space-y-3">
              <input
                value={assignForm.mentee_email}
                onChange={e => setAssignForm({ ...assignForm, mentee_email: e.target.value })}
                placeholder="Mentee email..."
                className={inputCls}
              />
              <select
                value={assignForm.group_id}
                onChange={e => setAssignForm({ ...assignForm, group_id: e.target.value })}
                className={inputCls}
              >
                <option value="">No group (1-on-1)</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id} style={{ background: '#1a0a2e' }}>{g.group_name}</option>
                ))}
              </select>
              <input
                value={assignForm.goal}
                onChange={e => setAssignForm({ ...assignForm, goal: e.target.value })}
                placeholder="Program goal (optional)..."
                className={inputCls}
              />
              <button
                onClick={() => assignMentor(showAssign)}
                disabled={!assignForm.mentee_email.trim()}
                className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#a855f7)' }}
              >
                Create Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}