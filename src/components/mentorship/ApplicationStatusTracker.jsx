import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// ── Checklist definitions ────────────────────────────────────────────────────

const ADULT_CHECKLIST = [
  {
    key: 'submitted',
    label: 'Application Submitted',
    emoji: '📝',
    auto: true, // always true once profile exists
    description: 'Your application has been received by the GGU team.',
    required: 'None — automatically marked when you submit.',
    timeframe: 'Immediate',
  },
  {
    key: 'checklist_identity_verified',
    label: 'Identity Verified',
    emoji: '🪪',
    description: 'Our team has confirmed your identity via government-issued ID.',
    required: 'Ensure your ID was uploaded during the application.',
    timeframe: '1–3 business days',
  },
  {
    key: 'checklist_background_cleared',
    label: 'Background Check Cleared',
    emoji: '🔒',
    description: 'A background check has been completed and cleared.',
    required: 'Complete the background check form sent to your email.',
    timeframe: '3–7 business days',
  },
  {
    key: 'checklist_interview_completed',
    label: 'Interview Completed',
    emoji: '📅',
    description: 'You have successfully completed your screening interview with GGU.',
    required: 'Join your scheduled interview call on time.',
    timeframe: '3–5 business days after review',
  },
  {
    key: 'checklist_lesson_passed',
    label: 'GGU Mentor Lesson Passed',
    emoji: '📚',
    description: 'You have completed the mandatory GGU Mentor Training module.',
    required: 'Complete the online mentor certification lesson.',
    timeframe: 'Self-paced (1–2 hours)',
  },
  {
    key: 'checklist_tos_signed',
    label: 'Terms of Service Signed',
    emoji: '✍️',
    description: 'You have agreed to the GGU Mentor Terms of Service.',
    required: 'Sign the digital ToS sent to your email.',
    timeframe: 'Immediate once received',
  },
  {
    key: 'checklist_final_approved',
    label: 'Final Approval by GGU Admin',
    emoji: '✅',
    description: 'A GGU administrator has granted final approval to your mentor account.',
    required: 'No action needed — admin decision.',
    timeframe: 'After all stages complete',
  },
];

const TEEN_CHECKLIST = [
  {
    key: 'submitted',
    label: 'Application Submitted',
    emoji: '📝',
    auto: true,
    description: 'Your application has been received by the GGU team.',
    required: 'None — automatically marked when you submit.',
    timeframe: 'Immediate',
  },
  {
    key: 'parent_consent_given',
    label: 'Parent / Guardian Consent Submitted',
    emoji: '👩‍👧',
    description: 'A consent email was sent to your parent or guardian. Their approval is required before we proceed.',
    required: 'Ask your parent/guardian to check their email and approve.',
    timeframe: '1–2 days (parent must respond)',
  },
  {
    key: 'checklist_identity_verified',
    label: 'Identity Verified',
    emoji: '🪪',
    description: 'Identity confirmed via school ID or parent/guardian confirmation.',
    required: 'School ID or parent confirmation accepted — no government ID needed.',
    timeframe: '1–3 business days',
  },
  {
    key: 'checklist_interview_completed',
    label: 'Interview Completed',
    emoji: '📅',
    description: 'You have successfully completed your screening interview with GGU.',
    required: 'Join your scheduled interview call on time.',
    timeframe: '3–5 business days after review',
  },
  {
    key: 'checklist_lesson_passed',
    label: 'GGU Mentor Lesson Passed',
    emoji: '📚',
    description: 'You have completed the mandatory GGU Mentor Training module.',
    required: 'Complete the online mentor certification lesson.',
    timeframe: 'Self-paced (1–2 hours)',
  },
  {
    key: 'checklist_tos_signed',
    label: 'Terms of Service Signed',
    emoji: '✍️',
    description: 'You and your parent/guardian have co-signed the GGU Mentor Terms of Service.',
    required: 'Both you and your parent/guardian must sign the digital ToS.',
    timeframe: 'Immediate once received',
  },
  {
    key: 'checklist_final_approved',
    label: 'Final Approval by GGU Admin',
    emoji: '✅',
    description: 'A GGU administrator has granted final approval to your Teen Mentor account.',
    required: 'No action needed — admin decision.',
    timeframe: 'After all stages complete',
  },
];

function isChecked(item, profile, application) {
  if (item.auto) return true; // application submitted = always done
  if (item.key === 'parent_consent_given') return application?.parent_consent_given === true;
  return application?.[item.key] === true || profile?.[item.key] === true;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ApplicationStatusTracker({ profile, application }) {
  const [expanded, setExpanded] = useState(false);

  // Detect track: teen if mentor_track === 'teen' or is TeenMentor entity
  const isTeenTrack = application?.mentor_track === 'teen' || profile?.mentor_track === 'teen';
  const checklist = isTeenTrack ? TEEN_CHECKLIST : ADULT_CHECKLIST;

  const isApproved = profile?.is_approved === true || profile?.application_status === 'approved' || application?.status === 'approved';
  const isRejected = profile?.application_status === 'rejected' || application?.status === 'rejected';

  const completedCount = checklist.filter(item => isChecked(item, profile, application)).length;
  const totalCount = checklist.length;
  const allDone = completedCount === totalCount;

  // Current step = first unchecked
  const currentIdx = allDone ? totalCount - 1 : checklist.findIndex(item => !isChecked(item, profile, application));

  const trackBadge = isTeenTrack
    ? { label: 'Teen Mentor 🌱', bg: 'rgba(74,222,128,0.15)', color: '#4ade80', border: 'rgba(74,222,128,0.35)' }
    : { label: 'Verified Mentor ✅ Background Check Cleared', bg: 'rgba(232,82,109,0.12)', color: '#f48fb1', border: 'rgba(232,82,109,0.3)' };

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(232,82,109,0.2)', borderRadius: 18, overflow: 'hidden' }}>

      {/* Track Badge */}
      <div style={{ padding: '10px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 10, background: trackBadge.bg, color: trackBadge.color, border: `1px solid ${trackBadge.border}` }}>
          {trackBadge.label}
        </span>
      </div>

      {/* Header — tappable */}
      <div
        style={{ padding: '12px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Approval Checklist</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: isApproved ? '#4ade80' : isRejected ? '#f87171' : '#f1b610' }}>
            {isApproved ? '✅ Fully Approved — Active Mentor' : isRejected ? '✗ Not Approved' : `${completedCount} of ${totalCount} steps completed`}
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '0 16px 14px' }}>
        <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(completedCount / totalCount) * 100}%`,
            background: isApproved ? '#4ade80' : 'linear-gradient(90deg, #e8526d, #f1b610)',
            borderRadius: 4,
            transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{Math.round((completedCount / totalCount) * 100)}% complete</div>
      </div>

      {/* Expanded checklist */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
          {checklist.map((item, idx) => {
            const checked = isChecked(item, profile, application);
            const isCurrent = !checked && idx === currentIdx;

            return (
              <div key={item.key} style={{
                display: 'flex',
                gap: 12,
                paddingBottom: idx < checklist.length - 1 ? 16 : 0,
                marginBottom: idx < checklist.length - 1 ? 16 : 0,
                borderBottom: idx < checklist.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                opacity: !checked && !isCurrent ? 0.45 : 1,
              }}>
                {/* Check circle + connector line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: checked ? 'linear-gradient(135deg, #4ade80, #22c55e)' : isCurrent ? 'rgba(241,182,16,0.2)' : 'rgba(255,255,255,0.06)',
                    border: checked ? 'none' : isCurrent ? '2px solid #f1b610' : '1px solid rgba(255,255,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: checked ? 13 : 14,
                    color: '#fff',
                    flexShrink: 0,
                  }}>
                    {checked ? '✓' : item.emoji}
                  </div>
                  {idx < checklist.length - 1 && (
                    <div style={{ width: 1, flex: 1, marginTop: 4, background: checked ? 'rgba(74,222,128,0.35)' : 'rgba(255,255,255,0.07)' }} />
                  )}
                </div>

                {/* Text */}
                <div style={{ paddingBottom: 4, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: checked ? '#4ade80' : isCurrent ? '#f1b610' : '#fff' }}>
                      {item.label}
                    </span>
                    {isCurrent && <span style={{ fontSize: 9, fontWeight: 700, background: 'rgba(241,182,16,0.2)', color: '#f1b610', borderRadius: 6, padding: '2px 6px' }}>UP NEXT</span>}
                    {checked && !item.auto && <span style={{ fontSize: 9, fontWeight: 700, background: 'rgba(74,222,128,0.15)', color: '#4ade80', borderRadius: 6, padding: '2px 6px' }}>DONE</span>}
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '0 0 5px', lineHeight: 1.5 }}>{item.description}</p>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                    <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.45)' }}>Required: </span>{item.required}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                    <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.45)' }}>Est. time: </span>{item.timeframe}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}