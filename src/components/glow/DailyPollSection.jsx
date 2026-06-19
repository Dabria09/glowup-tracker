import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const PINK = '#e8526d';
const GOLD = '#f1b610';
const GOLD_LT = '#fdcd2d';
const WHITE = '#fff8f0';
const MUTED2 = '#8a6070';
const CARD = '#1e0d12';
const BORDER = 'rgba(232,82,109,0.2)';

const CATEGORY_COLORS = {
  'Confidence': '#e8a0bf',
  'Friendships': '#a855f7',
  'Leadership': '#f59e0b',
  'School': '#3b82f6',
  'Bullying': '#ef4444',
  'Social Media': '#ec4899',
  'Relationships': '#f472b6',
  'Self-Esteem': '#e8526d',
  'Decision Making': '#10b981',
  'Career Exploration': '#6366f1',
  'Money': GOLD,
  'Mental Wellness': '#8b5cf6',
};

export default function DailyPollSection({ userEmail, userAgeGroup, onPointsAwarded }) {
  const [poll, setPoll] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [myTextResponse, setMyTextResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const [textInput, setTextInput] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!userEmail) return;
    loadPoll();
  }, [userEmail, userAgeGroup]);

  const loadPoll = async () => {
    setLoading(true);
    try {
      let allPolls = await base44.entities.DailyPoll.filter({ is_active: true }, '-scheduled_date').catch(() => []);
      
      let polls = allPolls.filter(p => {
        if (!p.age_group || p.age_group === 'All Ages') return true;
        if (!userAgeGroup) return true;
        if (userAgeGroup === 'girls_10_20') {
          return ['Girls 10-14', 'Teens 15-17', 'Teens 18-20', 'All Ages'].includes(p.age_group);
        }
        if (userAgeGroup === 'women_21_plus') {
          return ['Women 21+', 'All Ages'].includes(p.age_group);
        }
        return true;
      });
      
      let todaysPolls = polls.filter(p => p.scheduled_date === todayStr);
      if (todaysPolls.length === 0) {
        todaysPolls = polls.slice(0, 1);
      }
      
      if (!todaysPolls.length) { setLoading(false); return; }

      const p = todaysPolls[0];
      setPoll(p);
      setTotalVotes((p.votes_a || 0) + (p.votes_b || 0) + (p.votes_c || 0) + (p.votes_d || 0) + (p.open_text_response_count || 0));

      const votes = await base44.entities.DailyPollVote.filter({ poll_id: p.id, user_email: userEmail, vote_date: todayStr });
      if (votes.length) {
        setMyVote(votes[0].choice);
        setMyTextResponse(votes[0].text_response || '');
      }
    } catch {}
    setLoading(false);
  };

  const handleVote = async (choice, textResponse = '') => {
    if (myVote || submitting || !poll) return;
    setSubmitting(true);
    try {
      await base44.entities.DailyPollVote.create({ 
        poll_id: poll.id, 
        user_email: userEmail, 
        choice: choice || 'text', 
        text_response: textResponse,
        vote_date: todayStr 
      });

      if (choice) {
        const countKey = `votes_${choice}`;
        const newCount = (poll[countKey] || 0) + 1;
        await base44.entities.DailyPoll.update(poll.id, { [countKey]: newCount });
      } else {
        await base44.entities.DailyPoll.update(poll.id, { open_text_response_count: (poll.open_text_response_count || 0) + 1 });
      }

      if (poll.points_awarded > 0) {
        const userPts = await base44.entities.UserPoints.filter({ user_email: userEmail });
        if (userPts.length) {
          const newTotal = (userPts[0].total_points || 0) + poll.points_awarded;
          await base44.entities.UserPoints.update(userPts[0].id, { total_points: newTotal });
          await base44.entities.PointsHistory.create({
            user_email: userEmail,
            action: 'daily_poll',
            label: 'Daily Poll Vote',
            emoji: '🗳️',
            points: poll.points_awarded,
            total_after: newTotal,
          });
          if (onPointsAwarded) onPointsAwarded(poll.points_awarded);
        }
      }

      setMyVote(choice || 'text');
      setMyTextResponse(textResponse);
      if (choice) {
        const updated = { ...poll, [`votes_${choice}`]: (poll[`votes_${choice}`] || 0) + 1 };
        setPoll(updated);
        setTotalVotes((updated.votes_a || 0) + (updated.votes_b || 0) + (updated.votes_c || 0) + (updated.votes_d || 0) + (updated.open_text_response_count || 0));
      } else {
        const updated = { ...poll, open_text_response_count: (poll.open_text_response_count || 0) + 1 };
        setPoll(updated);
        setTotalVotes((updated.votes_a || 0) + (updated.votes_b || 0) + (updated.votes_c || 0) + (updated.votes_d || 0) + (updated.open_text_response_count || 0));
      }
    } catch {}
    setSubmitting(false);
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    handleVote(null, textInput.trim());
  };

  if (loading || !poll) return null;

  const catColor = CATEGORY_COLORS[poll.category] || PINK;
  const options = [
    { key: 'a', label: 'A', text: poll.option_a, insight: poll.insight_a, votes: poll.votes_a || 0 },
    { key: 'b', label: 'B', text: poll.option_b, insight: poll.insight_b, votes: poll.votes_b || 0 },
    { key: 'c', label: 'C', text: poll.option_c, insight: poll.insight_c, votes: poll.votes_c || 0 },
    { key: 'd', label: 'D', text: poll.option_d, insight: poll.insight_d, votes: poll.votes_d || 0 },
  ].filter(o => o.text);

  const isMultipleChoice = poll.response_type === 'multiple_choice';
  const isOpenText = poll.response_type === 'open_text';
  const isHybrid = poll.response_type === 'hybrid';

  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '16px', marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
      {/* Top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${catColor}, ${PINK})` }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>🗳️</span>
          <p style={{ fontSize: 13, fontWeight: 800, color: WHITE, margin: 0 }}>What Would You Do?</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {poll.category && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${catColor}20`, color: catColor, border: `1px solid ${catColor}40` }}>
              {poll.category}
            </span>
          )}
          {!myVote && <span style={{ fontSize: 10, fontWeight: 700, color: '#6abf6a' }}>+{poll.points_awarded || 15} pts</span>}
          {myVote && <span style={{ fontSize: 10, fontWeight: 700, color: '#6abf6a' }}>✓ Voted</span>}
        </div>
      </div>

      {/* Question */}
      <p style={{ fontSize: 14, color: WHITE, lineHeight: 1.6, margin: '0 0 12px', fontWeight: 600 }}>{poll.question}</p>

      {/* Multiple Choice Options */}
      {!isOpenText && options.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {options.map(opt => {
            const pct = myVote && totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
            const isMyVote = myVote === opt.key;
            return (
              <button key={opt.key} onClick={() => handleVote(opt.key)} disabled={!!myVote || submitting}
                style={{ borderRadius: 12, padding: '10px 12px', textAlign: 'left', border: `2px solid ${isMyVote ? catColor : 'rgba(255,255,255,0.1)'}`, background: isMyVote ? `${catColor}15` : 'rgba(255,255,255,0.04)', cursor: myVote ? 'default' : 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: myVote ? 6 : 0 }}>
                  <div style={{ minWidth: 22, height: 22, borderRadius: '50%', background: isMyVote ? catColor : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: isMyVote ? '#fff' : MUTED2, flexShrink: 0 }}>
                    {opt.label}
                  </div>
                  <span style={{ fontSize: 12, color: isMyVote ? WHITE : '#ddd', lineHeight: 1.4, flex: 1, fontWeight: isMyVote ? 700 : 400 }}>{opt.text}</span>
                  {myVote && <span style={{ fontSize: 12, fontWeight: 800, color: isMyVote ? catColor : MUTED2, flexShrink: 0 }}>{pct}%</span>}
                </div>
                {myVote && (
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: isMyVote ? catColor : 'rgba(255,255,255,0.2)', borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Open Text Input */}
      {(isOpenText || isHybrid) && !myVote && (
        <div style={{ marginTop: 12 }}>
          {poll.open_text_prompt && <p style={{ fontSize: 12, color: MUTED2, marginBottom: 8 }}>{poll.open_text_prompt}</p>}
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="w-full text-sm rounded-xl p-3 resize-none"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: WHITE }}
          />
          <button
            onClick={handleTextSubmit}
            disabled={submitting || !textInput.trim()}
            style={{ marginTop: 8, width: '100%', padding: '10px', borderRadius: 12, fontWeight: 700, fontSize: 13, color: WHITE, background: textInput.trim() ? `linear-gradient(135deg,${catColor},${PINK})` : '#555', cursor: textInput.trim() ? 'pointer' : 'not-allowed' }}
          >
            {submitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </div>
      )}

      {/* Post-vote: show text response */}
      {myVote === 'text' && myTextResponse && (
        <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 14, background: 'linear-gradient(135deg, rgba(232,82,109,0.1), rgba(168,85,247,0.08))', border: `1px solid ${BORDER}` }}>
          <p style={{ fontSize: 11, color: MUTED2, margin: '0 0 6px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Your Response</p>
          <p style={{ fontSize: 12, color: WHITE, lineHeight: 1.6, margin: 0 }}>{myTextResponse}</p>
          {poll.coaching_tip && (
            <>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '12px 0' }} />
              <p style={{ fontSize: 11, color: MUTED2, margin: '0 0 3px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Coaching Tip</p>
              <p style={{ fontSize: 12, color: '#f0e0e8', lineHeight: 1.6, margin: 0 }}>{poll.coaching_tip}</p>
            </>
          )}
          {totalVotes > 0 && <p style={{ fontSize: 10, color: MUTED2, margin: '8px 0 0', textAlign: 'right' }}>{totalVotes} responses today</p>}
        </div>
      )}

      {/* Post-vote: coaching tip for multiple choice */}
      {myVote && myVote !== 'text' && (
        <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 14, background: 'linear-gradient(135deg, rgba(232,82,109,0.1), rgba(168,85,247,0.08))', border: `1px solid ${BORDER}` }}>
          {options.find(o => o.key === myVote)?.insight && (
            <p style={{ fontSize: 12, color: WHITE, lineHeight: 1.6, margin: '0 0 8px', fontStyle: 'italic' }}>
              ✨ <strong>Your Choice Says:</strong> {options.find(o => o.key === myVote).insight}
            </p>
          )}
          {poll.coaching_tip && (
            <>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />
              <p style={{ fontSize: 11, color: MUTED2, margin: '0 0 3px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Coaching Tip</p>
              <p style={{ fontSize: 12, color: '#f0e0e8', lineHeight: 1.6, margin: 0 }}>{poll.coaching_tip}</p>
            </>
          )}
          {totalVotes > 0 && <p style={{ fontSize: 10, color: MUTED2, margin: '8px 0 0', textAlign: 'right' }}>{totalVotes} responses today</p>}
        </div>
      )}
    </div>
  );
}