import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageCircle, CheckCircle, Clock, ChevronLeft, Send, Inbox } from 'lucide-react';

export default function MentorInbox({ questions, user, onRefresh }) {
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const myQuestions = questions.filter(q => q.assigned_mentor_email === user?.email);
  const unclaimedQuestions = questions.filter(q => !q.assigned_mentor_email && q.status === 'pending');
  const allVisible = [...myQuestions, ...unclaimedQuestions];

  const pending = allVisible.filter(q => q.status !== 'answered');
  const answered = allVisible.filter(q => q.status === 'answered');

  const handleClaim = async (q) => {
    await base44.entities.AnonymousQuestion.update(q.id, {
      assigned_mentor_email: user.email,
      status: 'pending',
    });
    onRefresh();
    setSelected({ ...q, assigned_mentor_email: user.email });
  };

  const handleSubmit = async () => {
    if (!reply.trim() || !selected) return;
    setSubmitting(true);
    await base44.entities.AnonymousQuestion.update(selected.id, {
      answer: reply.trim(),
      status: 'answered',
      answered_date: new Date().toISOString(),
      assigned_mentor_email: user.email,
    });
    setSubmitting(false);
    setReply('');
    onRefresh();
    setSelected(prev => ({ ...prev, answer: reply.trim(), status: 'answered' }));
  };

  // ── Thread view ─────────────────────────────────────────────────────────────
  if (selected) {
    const isMine = selected.assigned_mentor_email === user?.email;
    const isAnswered = selected.status === 'answered';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Back */}
        <button
          onClick={() => { setSelected(null); setReply(''); onRefresh(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, width: 'fit-content' }}
        >
          <ChevronLeft size={16} /> Inbox
        </button>

        {/* Category + date */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#f1b610', background: 'rgba(241,182,16,0.12)', border: '1px solid rgba(241,182,16,0.25)', borderRadius: 8, padding: '3px 10px' }}>{selected.category}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            {new Date(selected.submitted_date || selected.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Question bubble */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, borderTopLeftRadius: 6, padding: '14px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Anonymous Girl</div>
          <p style={{ fontSize: 14, color: '#fff', lineHeight: 1.65, margin: 0 }}>{selected.question}</p>
        </div>

        {/* Existing answer */}
        {isAnswered && selected.answer && (
          <div style={{ background: 'linear-gradient(135deg, rgba(232,82,109,0.12), rgba(241,182,16,0.08))', border: '1px solid rgba(232,82,109,0.25)', borderRadius: 18, borderTopRightRadius: 6, padding: '14px 16px', marginLeft: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#f48fb1', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Your Answer</div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, margin: 0 }}>{selected.answer}</p>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle size={13} color="#4ade80" />
              <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 700 }}>Resolved</span>
            </div>
          </div>
        )}

        {/* Claim prompt */}
        {!isMine && !isAnswered && (
          <div style={{ background: 'rgba(241,182,16,0.06)', border: '1px solid rgba(241,182,16,0.2)', borderRadius: 14, padding: '14px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>Claim this question to answer it</p>
            <button
              onClick={() => handleClaim(selected)}
              style={{ padding: '10px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #f1b610, #e8a900)', color: '#1a0a04', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
            >
              Claim Question
            </button>
          </div>
        )}

        {/* Reply box */}
        {isMine && !isAnswered && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Share your wisdom and guidance…"
              rows={5}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 14px', color: '#fff', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'Poppins, sans-serif', lineHeight: 1.6, boxSizing: 'border-box' }}
            />
            <button
              onClick={handleSubmit}
              disabled={!reply.trim() || submitting}
              style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: reply.trim() ? 'linear-gradient(135deg, #e8526d, #f1b610)' : 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: reply.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: reply.trim() ? 1 : 0.5, boxShadow: reply.trim() ? '0 4px 18px rgba(232,82,109,0.3)' : 'none', transition: 'all 0.2s' }}
            >
              <Send size={15} /> {submitting ? 'Sending…' : 'Send Answer'}
            </button>
          </div>
        )}

        {/* Edit answer */}
        {isMine && isAnswered && (
          <button
            onClick={() => { setReply(selected.answer || ''); setSelected(prev => ({ ...prev, status: 'pending', answer: '' })); }}
            style={{ width: '100%', padding: '11px', borderRadius: 14, border: '1px solid rgba(232,82,109,0.3)', background: 'transparent', color: '#f48fb1', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            ✏️ Edit Answer
          </button>
        )}
      </div>
    );
  }

  // ── Inbox list ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { label: 'Pending', value: pending.length, icon: '⏳', color: '#f1b610' },
          { label: 'Answered', value: answered.length, icon: '✅', color: '#4ade80' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending section */}
      {pending.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={13} color="#f1b610" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>Needs Reply ({pending.length})</span>
          </div>
          {pending.map((q, i) => (
            <QuestionRow
              key={q.id}
              question={q}
              userEmail={user?.email}
              onClick={() => { setSelected(q); setReply(''); }}
              isLast={i === pending.length - 1}
            />
          ))}
        </div>
      )}

      {/* Answered section */}
      {answered.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={13} color="#4ade80" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>Answered ({answered.length})</span>
          </div>
          {answered.map((q, i) => (
            <QuestionRow
              key={q.id}
              question={q}
              userEmail={user?.email}
              onClick={() => { setSelected(q); setReply(''); }}
              isLast={i === answered.length - 1}
            />
          ))}
        </div>
      )}

      {allVisible.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'rgba(255,255,255,0.3)' }}>
          <Inbox size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Inbox is empty</div>
          <div style={{ fontSize: 12 }}>Questions from girls will appear here once assigned</div>
        </div>
      )}
    </div>
  );
}

function QuestionRow({ question: q, userEmail, onClick, isLast }) {
  const isMine = q.assigned_mentor_email === userEmail;
  const isAnswered = q.status === 'answered';

  return (
    <button
      onClick={onClick}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'transparent', border: 'none', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Icon */}
      <div style={{ width: 42, height: 42, borderRadius: 13, background: isAnswered ? 'rgba(74,222,128,0.15)' : isMine ? 'linear-gradient(135deg, rgba(232,82,109,0.25), rgba(241,182,16,0.15))' : 'rgba(241,182,16,0.12)', border: `1px solid ${isAnswered ? 'rgba(74,222,128,0.3)' : isMine ? 'rgba(232,82,109,0.3)' : 'rgba(241,182,16,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {isAnswered ? <CheckCircle size={16} color="#4ade80" /> : <MessageCircle size={16} color={isMine ? '#f48fb1' : '#f1b610'} />}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#f1b610' }}>{q.category}</span>
          {!isMine && !isAnswered && (
            <span style={{ fontSize: 9, fontWeight: 700, color: '#f1b610', background: 'rgba(241,182,16,0.15)', borderRadius: 6, padding: '1px 6px', textTransform: 'uppercase' }}>Open</span>
          )}
        </div>
        <div style={{ fontSize: 13, color: isAnswered ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isAnswered ? 400 : 500 }}>
          {q.question}
        </div>
      </div>

      {/* Status */}
      <div style={{ fontSize: 10, fontWeight: 700, color: isAnswered ? '#4ade80' : 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
        {isAnswered ? '✓' : '›'}
      </div>
    </button>
  );
}