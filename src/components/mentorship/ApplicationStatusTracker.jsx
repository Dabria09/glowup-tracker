import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const STAGES = [
  {
    key: 'submitted',
    label: 'Application Submitted',
    emoji: '✅',
    description: 'Your mentor application has been received by our team.',
    required: 'No action needed — your application is in the queue.',
    timeframe: 'Immediate',
    statuses: ['pending_review'],
  },
  {
    key: 'under_review',
    label: 'Under Review',
    emoji: '🔍',
    description: 'Our admin team is reviewing your professional credentials and application details.',
    required: 'Ensure your bio, expertise, and experience are fully filled in.',
    timeframe: '1–3 business days',
    statuses: ['pending_review'],
  },
  {
    key: 'interview',
    label: 'Interview Scheduled',
    emoji: '📅',
    description: 'You have been selected for a screening interview with our team.',
    required: 'Check your email for calendar invite and join the call on time.',
    timeframe: '3–5 business days after review',
    statuses: ['interview_scheduled', 'interview_complete'],
  },
  {
    key: 'background',
    label: 'Background Check',
    emoji: '🔒',
    description: 'A background and identity check is being conducted to ensure a safe environment for our girls.',
    required: 'Complete the background check form sent to your email.',
    timeframe: '3–7 business days',
    statuses: ['background_check_pending', 'background_check_complete'],
  },
  {
    key: 'lesson',
    label: 'Mentor Lesson Required',
    emoji: '📚',
    description: 'You must complete the GGU Mentor Training module before going live.',
    required: 'Complete the online mentor certification lesson.',
    timeframe: 'Self-paced (typically 1–2 hours)',
    statuses: [],
  },
  {
    key: 'decision',
    label: 'Decision',
    emoji: null, // dynamic
    label_approved: 'Approved ✅',
    label_rejected: 'Declined ✗',
    description_approved: 'Congratulations! You are now a verified GGU Mentor.',
    description_rejected: 'Unfortunately your application was not approved at this time. Contact support for details.',
    required: 'No action needed.',
    timeframe: 'After all stages complete',
    statuses: ['approved', 'rejected'],
  },
];

function getStageIndex(applicationStatus, isApproved) {
  if (isApproved || applicationStatus === 'approved') return 5;
  if (applicationStatus === 'rejected') return 5;
  if (applicationStatus === 'background_check_complete') return 4;
  if (applicationStatus === 'background_check_pending') return 3;
  if (applicationStatus === 'interview_complete') return 3;
  if (applicationStatus === 'interview_scheduled') return 2;
  return 1; // pending_review = under review
}

export default function ApplicationStatusTracker({ profile }) {
  const [expanded, setExpanded] = useState(false);

  const appStatus = profile?.application_status || 'pending_review';
  const isApproved = profile?.is_approved === true || appStatus === 'approved';
  const isRejected = appStatus === 'rejected';
  const currentStageIdx = getStageIndex(appStatus, isApproved);

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(232,82,109,0.2)',
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onClick={() => setExpanded(e => !e)}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Application Status</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: isApproved ? '#4ade80' : isRejected ? '#f87171' : '#f1b610' }}>
            {isApproved ? '✅ Approved — Active Mentor' : isRejected ? '✗ Not Approved' : `Stage ${currentStageIdx + 1} of 6 — ${STAGES[currentStageIdx].label}`}
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ padding: '0 16px 14px', display: 'flex', alignItems: 'center', gap: 4 }}>
        {STAGES.map((stage, idx) => {
          const done = idx < currentStageIdx;
          const active = idx === currentStageIdx;
          const isFinalRejected = isRejected && idx === 5;
          return (
            <div key={stage.key} style={{ display: 'flex', alignItems: 'center', flex: idx < 5 ? 1 : 'none' }}>
              <div style={{
                width: active ? 28 : 18,
                height: 18,
                borderRadius: 9,
                flexShrink: 0,
                background: isFinalRejected ? '#ef4444' : done || active ? 'linear-gradient(135deg, #e8526d, #f1b610)' : 'rgba(255,255,255,0.1)',
                border: active ? '2px solid rgba(255,255,255,0.5)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 8,
                fontWeight: 900,
                color: '#fff',
                transition: 'all 0.2s',
              }}>
                {done ? '✓' : active ? idx + 1 : ''}
              </div>
              {idx < 5 && (
                <div style={{ flex: 1, height: 2, background: done ? 'linear-gradient(90deg, #e8526d, #f1b610)' : 'rgba(255,255,255,0.08)', marginLeft: 4 }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
          {STAGES.map((stage, idx) => {
            const done = idx < currentStageIdx;
            const active = idx === currentStageIdx;
            const isFinalRejected = isRejected && idx === 5;
            const isFinalApproved = isApproved && idx === 5;

            const label = idx === 5
              ? (isApproved ? stage.label_approved : isRejected ? stage.label_rejected : 'Approved ✅ / Declined ✗')
              : stage.label;

            const description = idx === 5
              ? (isApproved ? stage.description_approved : isRejected ? stage.description_rejected : 'Final approval or decline based on all completed stages.')
              : stage.description;

            return (
              <div key={stage.key} style={{
                display: 'flex',
                gap: 12,
                paddingBottom: idx < 5 ? 16 : 0,
                marginBottom: idx < 5 ? 16 : 0,
                borderBottom: idx < 5 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                opacity: !done && !active ? 0.45 : 1,
              }}>
                {/* Icon + connector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: isFinalRejected ? 'rgba(239,68,68,0.2)' : done || active ? 'linear-gradient(135deg, rgba(232,82,109,0.3), rgba(241,182,16,0.2))' : 'rgba(255,255,255,0.06)',
                    border: active ? '2px solid #e8526d' : done ? '1px solid rgba(232,82,109,0.4)' : '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                  }}>
                    {idx === 5 ? (isApproved ? '✅' : isRejected ? '✗' : '⏳') : stage.emoji}
                  </div>
                  {idx < 5 && <div style={{ width: 1, flex: 1, marginTop: 4, background: done ? 'rgba(232,82,109,0.35)' : 'rgba(255,255,255,0.07)' }} />}
                </div>

                {/* Text */}
                <div style={{ paddingBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: active ? '#f1b610' : done ? '#4ade80' : isFinalRejected ? '#f87171' : '#fff' }}>
                      Stage {idx + 1} — {label}
                    </span>
                    {active && <span style={{ fontSize: 9, fontWeight: 700, background: 'rgba(241,182,16,0.2)', color: '#f1b610', borderRadius: 6, padding: '2px 6px' }}>CURRENT</span>}
                    {done && <span style={{ fontSize: 9, fontWeight: 700, background: 'rgba(74,222,128,0.15)', color: '#4ade80', borderRadius: 6, padding: '2px 6px' }}>DONE</span>}
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '0 0 6px', lineHeight: 1.5 }}>{description}</p>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                    <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Required: </span>{stage.required}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                    <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Est. time: </span>{stage.timeframe}
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