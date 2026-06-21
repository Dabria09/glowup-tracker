import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageCircle, CheckCircle, Clock, ChevronLeft, Send, Inbox, Filter } from 'lucide-react';

const CATEGORIES = ['All', 'Career', 'Education', 'Business', 'Wellness', 'Faith', 'Relationships'];

function parseClaimed(q) {
  try { return JSON.parse(q.claimed_by || '[]'); } catch { return []; }
}

function parseResponses(q) {
  try { return JSON.parse(q.mentor_responses || '[]'); } catch { return []; }
}

function ClaimSlots({ q }) {
  const claimed = parseClaimed(q);
  const filled = claimed.length;
  const total = 3;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: i < filled ? '#e8526d' : 'rgba(255,255,255,0.15)',
          border: `1px solid ${i < filled ? 'rgba(232,82,109,0.5)' : 'rgba(255,255,255,0.2)'}`,
        }} />
      ))}
      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginLeft: 4, fontWeight: 700 }}>{filled}/3</span>
    </div>
  );
}

export default function MentorInbox({ questions, user, onRefresh }) {
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [tab, setTab] = useState('open'); // 'open' | 'mine' | 'answered'

  // Derive question buckets
  const openQuestions = questions.filter(q => {
    const claimed = parseClaimed(q);
    return q.status === 'pending' && claimed.length < 3 && !claimed.includes(user?.email) && q.assigned_mentor_email !== user?.email;
  });
  const myQuestions = questions.filter(q => {
    const claimed = parseClaimed(q);
    return (claimed.includes(user?.email) || q.assigned_mentor_email === user?.email) && q.status !== 'answered';
  });
  const answeredQuestions = questions.filter(q => {
    const responses = parseResponses(q);
    return responses.some(r => r.mentor_email === user?.email) || (q.assigned_mentor_email === user?.email && q.status === 'answered');
  });

  const applyFilter = (list) => categoryFilter === 'All' ? list : list.filter(q => q.category === categoryFilter);

  const visibleOpen = applyFilter(openQuestions);
  const visibleMine = applyFilter(myQuestions);
  const visibleAnswered = applyFilter(answeredQuestions);

  const activeList = tab === 'open' ? visibleOpen : tab === 'mine' ? visibleMine : visibleAnswered;

  const handleClaim = async (q) => {
    const claimed = parseClaimed(q);
    if (claimed.includes(user.email) || claimed.length >= 3) return;
    const newClaimed = [...claimed, user.email];
    await base44.entities.AnonymousQuestion.update(q.id, {
      claimed_by: JSON.stringify(newClaimed),
      assigned_mentor_email: q.assigned_mentor_email || user.email,
      status: 'pending',
    });
    onRefresh();
    setSelected({ ...q, claimed_by: JSON.stringify(newClaimed), assigned_mentor_email: user.email });
    setTab('mine');
  };

  const handleSubmit = async () => {
    if (!reply.trim() || !selected) return;
    setSubmitting(true);
    const responses = parseResponses(selected);
    const existing = responses.findIndex(r => r.mentor_email === user.email);
    const entry = { mentor_email: user.email, mentor_name: user.full_name || 'Mentor', answer: reply.trim(), answered_date: new Date().toISOString() };
    if (existing >= 0) responses[existing] = entry;
    else responses.push(entry);
    const allAnswered = parseClaimed(selected).length > 0 && responses.length >= parseClaimed(selected).length;
    await base44.entities.AnonymousQuestion.update(selected.id, {
      mentor_responses: JSON.stringify(responses),
      response_count: responses.length,
      answer: responses[0]?.answer || reply.trim(),
      status: allAnswered ? 'answered' : 'answered',
      answered_date: new Date().toISOString(),
      assigned_mentor_email: user.email,
    });
    setSubmitting(false);
    setReply('');
    onRefresh();
    setSelected(prev => ({ ...prev, mentor_responses: JSON.stringify(responses), status: 'answered', answer: reply.trim() }));
  };

  // ── Thread view ──────────────────────────────────────────────────────────────
  if (selected) {
    const claimed = parseClaimed(selected);
    const isMine = claimed.includes(user?.email) || selected.assigned_mentor_email === user?.email;
    const responses = parseResponses(selected);
    const myResponse = responses.find(r => r.mentor_email === user?.email);
    const isAnsweredByMe = Boolean(myResponse);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <button
          onClick={() => { setSelected(null); setReply(''); onRefresh(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, width: 'fit-content' }}
        >
          <ChevronLeft size={16} /> Back to Inbox
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#f1b610', background: 'rgba(241,182,16,0.12)', border: '1px solid rgba(241,182,16,0.25)', borderRadius: 8, padding: '3px 10px' }}>{selected.category}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ClaimSlots q={selected} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
              {new Date(selected.submitted_date || selected.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Question */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, borderTopLeftRadius: 6, padding: '14px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Anonymous Girl</div>
          <p style={{ fontSize: 14, color: '#fff', lineHeight: 1.65, margin: 0 }}>{selected.question}</p>
        </div>

        {/* All mentor responses */}
        {responses.length > 0 && responses.map((r, i) => (
          <div key={i} style={{ background: r.mentor_email === user?.email ? 'linear-gradient(135deg, rgba(232,82,109,0.12), rgba(241,182,16,0.08))' : 'rgba(168,85,247,0.08)', border: `1px solid ${r.mentor_email === user?.email ? 'rgba(232,82,109,0.25)' : 'rgba(168,85,247,0.2)'}`, borderRadius: 18, borderTopRightRadius: 6, padding: '14px 16px', marginLeft: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: r.mentor_email === user?.email ? '#f48fb1' : '#c084fc', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              {r.mentor_email === user?.email ? 'Your Answer' : `Mentor ${i + 1}`}
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, margin: 0 }}>{r.answer}</p>
          </div>
        ))}

        {/* Claim prompt */}
        {!isMine && (
          <div style={{ background: 'rgba(241,182,16,0.06)', border: '1px solid rgba(241,182,16,0.2)', borderRadius: 14, padding: '14px 16px', textAlign: 'center' }}>
            <ClaimSlots q={selected} />
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '10px 0 12px' }}>Claim this question to answer it</p>
            <button
              onClick={() => handleClaim(selected)}
              style={{ padding: '10px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #f1b610, #e8a900)', color: '#1a0a04', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(241,182,16,0.3)' }}
            >
              ✋ Claim Question
            </button>
          </div>
        )}

        {/* Reply box — show even if already answered (to let them edit) */}
        {isMine && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {isAnsweredByMe && (
              <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle size={13} /> You've already answered — update your response below
              </div>
            )}
            <textarea
              value={reply || (isAnsweredByMe ? myResponse.answer : '')}
              onChange={e => setReply(e.target.value)}
              placeholder="Share your wisdom and guidance…"
              rows={5}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 14px', color: '#fff', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'Outfit, sans-serif', lineHeight: 1.6, boxSizing: 'border-box' }}
            />
            <button
              onClick={handleSubmit}
              disabled={!(reply || (isAnsweredByMe ? myResponse.answer : '')).trim() || submitting}
              style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #e8526d, #f1b610)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (reply || (isAnsweredByMe ? myResponse.answer : '')).trim() ? 1 : 0.4, boxShadow: '0 4px 18px rgba(232,82,109,0.3)', transition: 'opacity 0.2s' }}
            >
              <Send size={15} /> {submitting ? 'Sending…' : isAnsweredByMe ? 'Update Answer' : 'Send Answer'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Inbox list ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { key: 'open',     label: 'Open',     value: openQuestions.length,     icon: '📬', color: '#f1b610' },
          { key: 'mine',     label: 'Claimed',  value: myQuestions.length,       icon: '✋', color: '#e8526d' },
          { key: 'answered', label: 'Answered', value: answeredQuestions.length, icon: '✅', color: '#4ade80' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setTab(s.key)}
            style={{ background: tab === s.key ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${tab === s.key ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
          >
            <div style={{ fontSize: 18, marginBottom: 3 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: tab === s.key ? s.color : 'rgba(255,255,255,0.6)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Category filter pills */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
        <Filter size={13} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0, marginTop: 5 }} />
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            style={{ padding: '5px 13px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: '0.2px', transition: 'all 0.15s',
              background: categoryFilter === cat ? 'linear-gradient(135deg, #e8526d, #f1b610)' : 'rgba(255,255,255,0.06)',
              color: categoryFilter === cat ? '#fff' : 'rgba(255,255,255,0.4)',
              boxShadow: categoryFilter === cat ? '0 3px 10px rgba(232,82,109,0.3)' : 'none',
            }}
          >{cat}</button>
        ))}
      </div>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {tab === 'open' && <><Clock size={13} color="#f1b610" /><span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1px' }}>Open Questions — Waiting for a Mentor</span></>}
        {tab === 'mine' && <><MessageCircle size={13} color="#e8526d" /><span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1px' }}>My Claimed Questions</span></>}
        {tab === 'answered' && <><CheckCircle size={13} color="#4ade80" /><span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1px' }}>My Answered Questions</span></>}
      </div>

      {/* Question list */}
      {activeList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'rgba(255,255,255,0.3)' }}>
          <Inbox size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
            {tab === 'open' ? 'No open questions right now' : tab === 'mine' ? "You haven't claimed any questions yet" : 'No answered questions yet'}
          </div>
          <div style={{ fontSize: 11 }}>
            {tab === 'open' ? 'Check back soon — new questions are added regularly' : tab === 'mine' ? 'Browse Open Questions and claim one to get started' : 'Answer a claimed question to see it here'}
          </div>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden' }}>
          {activeList.map((q, i) => (
            <QuestionRow
              key={q.id}
              question={q}
              userEmail={user?.email}
              onClick={() => { setSelected(q); setReply(''); }}
              isLast={i === activeList.length - 1}
              tab={tab}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionRow({ question: q, userEmail, onClick, isLast, tab }) {
  const claimed = parseClaimed(q);
  const isMine = claimed.includes(userEmail) || q.assigned_mentor_email === userEmail;
  const isFull = claimed.length >= 3;

  return (
    <button
      onClick={onClick}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'transparent', border: 'none', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Icon */}
      <div style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: tab === 'answered' ? 'rgba(74,222,128,0.15)' : isMine ? 'linear-gradient(135deg, rgba(232,82,109,0.2), rgba(241,182,16,0.12))' : 'rgba(241,182,16,0.1)',
        border: `1px solid ${tab === 'answered' ? 'rgba(74,222,128,0.3)' : isMine ? 'rgba(232,82,109,0.3)' : 'rgba(241,182,16,0.25)'}`,
      }}>
        {tab === 'answered' ? <CheckCircle size={16} color="#4ade80" /> : <MessageCircle size={16} color={isMine ? '#f48fb1' : '#f1b610'} />}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#f1b610' }}>{q.category}</span>
          {tab === 'open' && (
            <span style={{ fontSize: 9, fontWeight: 700, color: isFull ? '#ef4444' : '#f1b610', background: isFull ? 'rgba(239,68,68,0.12)' : 'rgba(241,182,16,0.12)', borderRadius: 6, padding: '1px 6px', textTransform: 'uppercase' }}>
              {isFull ? 'Full' : 'Open'}
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: tab === 'answered' ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: tab === 'answered' ? 400 : 500 }}>
          {q.question}
        </div>
        <div style={{ marginTop: 5 }}>
          <ClaimSlots q={q} />
        </div>
      </div>

      <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>›</div>
    </button>
  );
}