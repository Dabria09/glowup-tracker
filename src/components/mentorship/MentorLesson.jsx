import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Lock, BookOpen, CheckCircle, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';

// ── Lesson Content ────────────────────────────────────────────────────────────

const LESSONS = [
  {
    id: 'values',
    emoji: '🌟',
    title: 'GGU Values & Mission',
    content: [
      {
        heading: 'Our Core Mission',
        body: "Girls Glowing Up™ exists to empower young women and girls through mentorship, community, and education. Every mentor is a reflection of GGU's values: safety, empowerment, integrity, and care.",
      },
      {
        heading: 'The GGU Values',
        bullets: [
          '💜 Empowerment — uplift every girl you interact with',
          '🛡️ Safety — create a judgment-free, secure environment',
          '🌱 Growth — encourage progress over perfection',
          '🤝 Integrity — be honest, consistent, and trustworthy',
          '✨ Inclusivity — every girl deserves to glow, regardless of background',
        ],
      },
      {
        heading: 'Your Role as a Mentor',
        body: "You are a guide, not a fixer. Your job is to listen, share wisdom, and inspire — not to solve every problem. Trust the process and trust the girl.",
      },
    ],
  },
  {
    id: 'safe_comms',
    emoji: '🛡️',
    title: 'Safe Communication with Minors',
    content: [
      {
        heading: 'Why This Matters',
        body: "Many of the girls you will mentor are under 18. Safe communication protects them — and you. Follow these rules in every interaction.",
      },
      {
        heading: 'Always Do',
        bullets: [
          '✅ Keep all communications inside the GGU platform',
          '✅ Use professional, encouraging language at all times',
          '✅ Respond to messages within 48 hours when possible',
          '✅ Document any concerns using the Report feature',
          '✅ Treat every girl with equal respect and dignity',
        ],
      },
      {
        heading: 'Never Do',
        bullets: [
          '🚫 Share personal contact info (phone, personal email, social media)',
          '🚫 Meet a mentee in person without GGU authorization',
          '🚫 Discuss topics outside your mentoring scope',
          '🚫 Share a mentee\'s personal information with anyone',
          '🚫 Continue a conversation that makes you uncomfortable — escalate immediately',
        ],
      },
    ],
  },
  {
    id: 'dos_donts',
    emoji: '📋',
    title: 'What Mentors Can & Cannot Do',
    content: [
      {
        heading: 'Mentors Can',
        bullets: [
          '✅ Answer questions from assigned mentees',
          '✅ Share personal experiences as appropriate',
          '✅ Provide guidance on career, school, wellness, and relationships',
          '✅ Offer encouragement and celebrate mentee wins',
          '✅ Suggest GGU resources (lessons, tools, community)',
        ],
      },
      {
        heading: 'Mentors Cannot',
        bullets: [
          '🚫 Provide medical, legal, or financial advice',
          '🚫 Promise outcomes or guarantees to mentees',
          '🚫 Contact mentees outside of GGU channels',
          '🚫 Discuss topics involving explicit content of any kind',
          '🚫 Act outside your assigned mentoring track',
        ],
      },
      {
        heading: 'Important Boundaries',
        body: "If a mentee shares something concerning — abuse, self-harm, or danger — do not try to handle it alone. Use the Report button immediately and notify GGU admin. You are not a therapist or crisis counselor.",
      },
    ],
  },
  {
    id: 'sessions',
    emoji: '📅',
    title: 'How Sessions Work',
    content: [
      {
        heading: 'Session Types',
        bullets: [
          '💬 Chat — async text-based Q&A through the platform',
          '📹 Video Call — live scheduled sessions via GGU video',
          '📞 Phone Call — scheduled voice calls through GGU',
        ],
      },
      {
        heading: 'Before a Session',
        bullets: [
          'Review the mentee\'s profile and submitted question',
          'Prepare key points or resources you want to share',
          'Ensure you\'re in a private, distraction-free space',
          'Have the GGU reporting tool ready just in case',
        ],
      },
      {
        heading: 'After a Session',
        bullets: [
          'Submit a brief session report through your dashboard',
          'Note any follow-up items for your next interaction',
          'Flag any concerns to GGU admin immediately',
          'Celebrate the connection — you made a difference!',
        ],
      },
    ],
  },
  {
    id: 'reporting',
    emoji: '🚨',
    title: 'How to Report Concerns',
    content: [
      {
        heading: 'When to Report',
        body: "Report immediately if a mentee discloses abuse, expresses intent to harm themselves or others, shares inappropriate content, or if you feel unsafe in any interaction.",
      },
      {
        heading: 'How to Report',
        bullets: [
          '1️⃣ Use the Report button on any message or session screen',
          '2️⃣ Select the concern type (safety, abuse, inappropriate content)',
          '3️⃣ Add a brief description of what occurred',
          '4️⃣ Submit — GGU admin is notified within minutes',
          '5️⃣ Do not discuss the report with the mentee',
        ],
      },
      {
        heading: 'Mandatory Reporting',
        body: "As a GGU mentor, you have an ethical obligation to report disclosures of abuse or danger to GGU admin immediately. GGU will handle escalation to appropriate authorities. You are never alone in this.",
      },
    ],
  },
];

// ── Quiz ──────────────────────────────────────────────────────────────────────

const QUIZ = [
  {
    q: 'What is the minimum passing score for this mentor lesson quiz?',
    options: ['50%', '70%', '80%', '100%'],
    correct: 2,
  },
  {
    q: 'Which of the following is ALWAYS required when communicating with mentees?',
    options: ['Use your personal phone number', 'Keep all communication inside the GGU platform', 'Meet in person when convenient', 'Share your social media handles'],
    correct: 1,
  },
  {
    q: 'A mentee discloses that they are being abused at home. What should you do?',
    options: ['Try to handle it yourself to protect the mentee', 'Ignore it and stay focused on the session topic', 'Use the Report feature and notify GGU admin immediately', 'Ask the mentee to keep it private'],
    correct: 2,
  },
  {
    q: 'Which of the following CAN a GGU mentor do?',
    options: ['Provide legal advice to a mentee', 'Share personal career experience as guidance', 'Contact a mentee on Instagram', 'Guarantee a specific outcome for a mentee'],
    correct: 1,
  },
  {
    q: 'What is a GGU mentor\'s primary role?',
    options: ['Fix every problem the mentee has', 'Act as a therapist for mentees', 'Listen, share wisdom, and inspire — not solve', 'Be available 24/7 at all times'],
    correct: 2,
  },
  {
    q: 'Which GGU value means treating every girl with equal respect regardless of background?',
    options: ['Empowerment', 'Growth', 'Integrity', 'Inclusivity'],
    correct: 3,
  },
  {
    q: 'After completing a session, what should a mentor do?',
    options: ['Nothing — the session is done', 'Submit a session report through the dashboard', 'Contact the mentee on WhatsApp to follow up', 'Post about the session publicly'],
    correct: 1,
  },
  {
    q: 'Teen mentors on GGU can mentor which age groups?',
    options: ['Only Glow Women (19–26)', 'All age groups equally', 'Glow Girls (5–12) and Glow Teens (13–18) only', 'Only their own age group'],
    correct: 2,
  },
  {
    q: 'Which of these is NEVER allowed for a GGU mentor?',
    options: ['Sharing personal career stories', 'Encouraging mentee progress', 'Sharing a mentee\'s personal information with anyone', 'Celebrating mentee wins'],
    correct: 2,
  },
  {
    q: 'What should you do if a conversation makes you feel uncomfortable?',
    options: ['Push through and finish the session', 'Escalate immediately using the Report feature', 'Tell the mentee to stop', 'Ignore it and move on'],
    correct: 1,
  },
];

const PASS_THRESHOLD = 0.8;

// ── Main Component ────────────────────────────────────────────────────────────

export default function MentorLesson({ application, user, onComplete }) {
  const [phase, setPhase] = useState('intro'); // intro | lesson | quiz | result
  const [lessonIdx, setLessonIdx] = useState(0);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(null);

  const isUnlocked = application?.checklist_interview_completed === true || application?.checklist_lesson_passed === true;
  const alreadyPassed = application?.checklist_lesson_passed === true;

  // ── Locked state ────────────────────────────────────────────────────────────
  if (!isUnlocked) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Lock size={28} color="rgba(255,255,255,0.25)" />
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Mentor Lesson Locked</div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: 300 }}>
          This lesson unlocks once your interview has been completed and confirmed by GGU admin. Check back after Stage 4 of your approval checklist.
        </p>
        <div style={{ marginTop: 20, padding: '10px 16px', borderRadius: 12, background: 'rgba(241,182,16,0.08)', border: '1px solid rgba(241,182,16,0.2)' }}>
          <div style={{ fontSize: 11, color: '#f1b610', fontWeight: 700 }}>📋 Required: Interview Completed</div>
        </div>
      </div>
    );
  }

  // ── Already passed ──────────────────────────────────────────────────────────
  if (alreadyPassed && phase === 'intro') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🎓</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#4ade80', marginBottom: 6 }}>Lesson Passed!</div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>You have successfully completed the GGU Mentor Lesson. Your checklist has been updated.</p>
        <button
          onClick={() => setPhase('intro')}
          style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
        >
          Review Lesson Again
        </button>
      </div>
    );
  }

  const currentLesson = LESSONS[lessonIdx];
  const totalLessonSections = currentLesson?.content?.length || 1;
  const isLastLesson = lessonIdx === LESSONS.length - 1;
  const isLastSection = sectionIdx === totalLessonSections - 1;

  const handleNextSection = () => {
    if (!isLastSection) {
      setSectionIdx(s => s + 1);
    } else if (!isLastLesson) {
      setLessonIdx(l => l + 1);
      setSectionIdx(0);
    } else {
      setPhase('quiz');
    }
  };

  const handlePrevSection = () => {
    if (sectionIdx > 0) {
      setSectionIdx(s => s - 1);
    } else if (lessonIdx > 0) {
      setLessonIdx(l => l - 1);
      setSectionIdx(LESSONS[lessonIdx - 1].content.length - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    const correct = QUIZ.filter((q, i) => answers[i] === q.correct).length;
    const pct = correct / QUIZ.length;
    setScore({ correct, total: QUIZ.length, pct });
    setPhase('result');

    if (pct >= PASS_THRESHOLD && application?.id) {
      setSubmitting(true);
      await base44.entities.MentorApplication.update(application.id, {
        checklist_lesson_passed: true,
      });
      // Notify admin via email
      try {
        await base44.integrations.Core.SendEmail({
          to: 'admin@girlsglowingup.com',
          subject: `✅ Mentor Lesson Passed — ${user?.full_name || user?.email}`,
          body: `Mentor ${user?.full_name || ''} (${user?.email}) has passed the GGU Mentor Lesson with a score of ${Math.round(pct * 100)}% (${correct}/${QUIZ.length}).\n\nPlease review their checklist and proceed to final approval if all other steps are complete.`,
        });
      } catch {}
      setSubmitting(false);
      if (onComplete) onComplete();
    }
  };

  // ── Intro ───────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ borderRadius: 18, overflow: 'hidden', background: 'linear-gradient(135deg, #4a1a6b 0%, #1a0a3a 100%)', padding: '24px 20px', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>📚</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 6 }}>How to Be a GGU Mentor</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 16, lineHeight: 1.5 }}>
            Required certification lesson · 5 modules · 10-question quiz<br />Pass with 80% or higher to complete your checklist
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {LESSONS.map(l => (
              <div key={l.id} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '6px 10px', fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                {l.emoji} {l.title}
              </div>
            ))}
          </div>
          <button
            onClick={() => { setPhase('lesson'); setLessonIdx(0); setSectionIdx(0); }}
            style={{ padding: '13px 32px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #e8526d, #f1b610)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 20px rgba(232,82,109,0.4)' }}
          >
            Begin Lesson →
          </button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>What You'll Learn</div>
          {LESSONS.map((l, i) => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < LESSONS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ fontSize: 20, width: 28, textAlign: 'center', flexShrink: 0 }}>{l.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{l.title}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Lesson Reading ──────────────────────────────────────────────────────────
  if (phase === 'lesson') {
    const section = currentLesson.content[sectionIdx];
    const globalIdx = LESSONS.slice(0, lessonIdx).reduce((s, l) => s + l.content.length, 0) + sectionIdx;
    const totalSections = LESSONS.reduce((s, l) => s + l.content.length, 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Progress */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Module {lessonIdx + 1} of {LESSONS.length}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{globalIdx + 1}/{totalSections}</span>
          </div>
          <div style={{ height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((globalIdx + 1) / totalSections) * 100}%`, background: 'linear-gradient(90deg, #e8526d, #f1b610)', borderRadius: 3, transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Lesson card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ fontSize: 28 }}>{currentLesson.emoji}</div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#e8526d', textTransform: 'uppercase', letterSpacing: 1 }}>Module {lessonIdx + 1}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{currentLesson.title}</div>
            </div>
          </div>

          <div style={{ fontSize: 14, fontWeight: 800, color: '#f1b610', marginBottom: 10 }}>{section.heading}</div>

          {section.body && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: 0 }}>{section.body}</p>
          )}

          {section.bullets && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {section.bullets.map((b, i) => (
                <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                  {b}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handlePrevSection}
            disabled={lessonIdx === 0 && sectionIdx === 0}
            style={{ flex: 1, padding: '12px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: lessonIdx === 0 && sectionIdx === 0 ? 0.3 : 1 }}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <button
            onClick={handleNextSection}
            style={{ flex: 2, padding: '12px', borderRadius: 14, border: 'none', background: isLastLesson && isLastSection ? 'linear-gradient(135deg, #e8526d, #f1b610)' : 'rgba(232,82,109,0.2)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: isLastLesson && isLastSection ? '0 4px 14px rgba(232,82,109,0.3)' : 'none' }}
          >
            {isLastLesson && isLastSection ? '🎯 Start Quiz' : 'Next'} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz ────────────────────────────────────────────────────────────────────
  if (phase === 'quiz') {
    const allAnswered = QUIZ.every((_, i) => answers[i] !== undefined);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: 'rgba(241,182,16,0.08)', border: '1px solid rgba(241,182,16,0.25)', borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <AlertCircle size={16} color="#f1b610" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f1b610', marginBottom: 2 }}>Quiz — 10 Questions</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>You must score 80% or higher (8/10) to pass. Answer all questions before submitting.</div>
          </div>
        </div>

        {QUIZ.map((q, qi) => (
          <div key={qi} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#e8526d', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Question {qi + 1}</div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12, lineHeight: 1.5 }}>{q.q}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}
                    style={{
                      width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 12,
                      border: selected ? '2px solid #e8526d' : '1px solid rgba(255,255,255,0.1)',
                      background: selected ? 'rgba(232,82,109,0.15)' : 'rgba(255,255,255,0.03)',
                      color: selected ? '#fff' : 'rgba(255,255,255,0.65)',
                      fontSize: 13, fontWeight: selected ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <button
          onClick={handleSubmitQuiz}
          disabled={!allAnswered || submitting}
          style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', background: allAnswered ? 'linear-gradient(135deg, #e8526d, #f1b610)' : 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: allAnswered ? 'pointer' : 'not-allowed', opacity: allAnswered ? 1 : 0.5, boxShadow: allAnswered ? '0 4px 20px rgba(232,82,109,0.35)' : 'none' }}
        >
          {submitting ? 'Submitting...' : 'Submit Quiz →'}
        </button>
      </div>
    );
  }

  // ── Result ──────────────────────────────────────────────────────────────────
  if (phase === 'result' && score) {
    const passed = score.pct >= PASS_THRESHOLD;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{
          borderRadius: 20, padding: '28px 20px', textAlign: 'center',
          background: passed ? 'linear-gradient(135deg, rgba(74,222,128,0.12), rgba(34,197,94,0.06))' : 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.06))',
          border: passed ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(239,68,68,0.3)',
        }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{passed ? '🎓' : '😔'}</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: passed ? '#4ade80' : '#f87171', marginBottom: 6 }}>
            {passed ? 'You Passed!' : 'Not Quite — Try Again'}
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
            {score.correct}/{score.total}
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
            {Math.round(score.pct * 100)}% — {passed ? 'Checklist updated! Admin has been notified.' : 'You need 80% to pass. Review the lesson and try again.'}
          </div>
          {!passed && (
            <button
              onClick={() => { setPhase('intro'); setAnswers({}); setScore(null); }}
              style={{ padding: '12px 28px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #e8526d, #f1b610)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
            >
              Review Lesson & Retry
            </button>
          )}
        </div>

        {/* Answer review */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Answer Review</div>
          {QUIZ.map((q, qi) => {
            const userAns = answers[qi];
            const correct = userAns === q.correct;
            return (
              <div key={qi} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: qi < QUIZ.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4, lineHeight: 1.4 }}>Q{qi + 1}: {q.q}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: correct ? '#4ade80' : '#f87171' }}>
                  {correct ? '✓' : '✗'} Your answer: {q.options[userAns]}
                </div>
                {!correct && (
                  <div style={{ fontSize: 11, color: 'rgba(74,222,128,0.8)', marginTop: 2 }}>
                    ✓ Correct: {q.options[q.correct]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}