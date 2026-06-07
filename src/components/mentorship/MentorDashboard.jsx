import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, CheckCircle, Clock, Users, Star, Heart, Search } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import MenteeDashboard from './MenteeDashboard';

const TABS = ['Overview', 'My Mentees', 'Sessions', 'Applications', 'My Profile'];

const statusColors = {
  active:    { bg: '#E8F5E9', text: '#1B5E20' },
  new:       { bg: '#F3E5F5', text: '#6A1B9A' },
  pending:   { bg: '#FFF8E1', text: '#F57F17' },
  completed: { bg: '#F5F5F5', text: '#616161' },
  upcoming:  { bg: '#FCE4EC', text: '#C2185B' },
};

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showMenteeSearch, setShowMenteeSearch] = useState(false);
  const [stats, setStats] = useState({ total_questions: 0, pending: 0, answered: 0, helpful_count: 0, sessions_completed: 0, rating: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Load mentor profile (check both Mentor and TeenMentor entities)
        const mentors = await base44.entities.Mentor.filter({ user_email: currentUser.email });
        if (mentors.length > 0) {
          setProfile(mentors[0]);
        } else {
          const teenMentors = await base44.entities.TeenMentor.filter({ user_email: currentUser.email });
          if (teenMentors.length > 0) setProfile(teenMentors[0]);
        }

        // Load anonymous questions
        const allQuestions = await base44.entities.AnonymousQuestion.list('-submitted_date', 100);
        const mentorQuestions = allQuestions.filter(q =>
          (q.assigned_mentor_email === currentUser.email) ||
          (q.status === 'pending' && !q.assigned_mentor_email)
        );
        setQuestions(mentorQuestions);

        // Load sessions
        const mentorSessions = await base44.entities.MentorSession.filter({ mentor_email: currentUser.email });
        setSessions(mentorSessions);

        // Stats
        const assignedQuestions = allQuestions.filter(q => q.assigned_mentor_email === currentUser.email);
        setStats({
          total_questions: assignedQuestions.length,
          pending: assignedQuestions.filter(q => q.status === 'pending').length,
          answered: assignedQuestions.filter(q => q.status === 'answered').length,
          helpful_count: assignedQuestions.reduce((sum, q) => sum + (q.helpful_count || 0), 0),
          sessions_completed: mentorSessions.filter(s => s.status === 'completed').length,
          rating: profile?.rating || 0,
        });
      } catch (error) {
        console.error('Error loading mentor dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleClaimQuestion = async (question) => {
    await base44.entities.AnonymousQuestion.update(question.id, { assigned_mentor_email: user.email, status: 'pending' });
    const allQ = await base44.entities.AnonymousQuestion.list('-submitted_date', 100);
    setQuestions(allQ.filter(q => (q.assigned_mentor_email === user.email) || (q.status === 'pending' && !q.assigned_mentor_email)));
  };

  const handleResponseSubmitted = async () => {
    const allQ = await base44.entities.AnonymousQuestion.list('-submitted_date', 100);
    setQuestions(allQ.filter(q => (q.assigned_mentor_email === user.email) || (q.status === 'pending' && !q.assigned_mentor_email)));
    setShowResponseModal(false);
    setSelectedQuestion(null);
  };

  const expertise = (() => {
    try { return profile?.categories ? JSON.parse(profile.categories) : []; } catch { return []; }
  })();

  const initials = profile?.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'M';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 50%, #0D1A2E 100%)' }}>
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'rgba(194,24,91,0.2)', borderTopColor: '#C2185B' }} />
      </div>
    );
  }

  const upcomingSessions = sessions.filter(s => s.status === 'upcoming' || s.status === 'scheduled');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const pendingApplications = questions.filter(q => q.status === 'pending' && !q.assigned_mentor_email);
  const myQuestions = questions.filter(q => q.assigned_mentor_email === user?.email);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 50%, #0D1A2E 100%)', fontFamily: "'Poppins', sans-serif", color: '#fff', overflowX: 'hidden', paddingBottom: 100 }}>

      {/* Floating orbs */}
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ position: 'fixed', borderRadius: '50%', background: i % 2 === 0 ? 'radial-gradient(circle, rgba(194,24,91,0.12) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(106,27,154,0.12) 0%, transparent 70%)', width: `${200 + i * 60}px`, height: `${200 + i * 60}px`, top: `${5 + i * 18}%`, left: `${i % 2 === 0 ? -5 : 65 + i * 4}%`, pointerEvents: 'none', zIndex: 0 }} />
      ))}

      {/* Top Bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,13,26,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(194,24,91,0.25)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #C2185B, #6A1B9A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>{initials}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>Girls Glowing Up™</div>
            <div style={{ fontSize: 11, color: '#C2185B' }}>{profile?.mentor_tier ? profile.mentor_tier.charAt(0).toUpperCase() + profile.mentor_tier.slice(1) + ' Mentor' : 'Mentor'}</div>
          </div>
        </div>
        <button onClick={() => setShowMenteeSearch(true)} style={{ padding: '6px 14px', borderRadius: 16, border: '1px solid rgba(194,24,91,0.4)', background: 'rgba(194,24,91,0.1)', color: '#F48FB1', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
          🔍 Find Mentor
        </button>
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', padding: '16px 16px 0' }}>

        {/* Hero Card */}
        <div style={{ background: 'linear-gradient(135deg, rgba(194,24,91,0.2), rgba(106,27,154,0.2))', border: '1px solid rgba(194,24,91,0.3)', borderRadius: 20, padding: 24, marginBottom: 20, backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(135deg, #C2185B, #6A1B9A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, border: '3px solid rgba(194,24,91,0.5)', boxShadow: '0 0 20px rgba(194,24,91,0.3)' }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{profile?.full_name || user?.full_name || 'Mentor'}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>{profile?.title || 'GGU Mentor'}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {expertise.slice(0, 3).map(e => (
                  <span key={e} style={{ background: 'rgba(194,24,91,0.2)', border: '1px solid rgba(194,24,91,0.4)', borderRadius: 10, padding: '2px 8px', fontSize: 10, color: '#F48FB1', fontWeight: 600 }}>{e}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'Questions', value: stats.total_questions, icon: '💬' },
              { label: 'Pending', value: stats.pending, icon: '💜' },
              { label: 'Answered', value: stats.answered, icon: '⏰' },
              { label: 'Helpful', value: stats.helpful_count, icon: '⭐' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, marginBottom: 2 }}>{stat.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#F48FB1' }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 14px', borderRadius: 20, border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.15)', background: activeTab === tab ? 'linear-gradient(135deg, #C2185B, #6A1B9A)' : 'rgba(255,255,255,0.05)', color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.3s' }}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'Overview' && (
          <div>
            {/* Upcoming Sessions */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Upcoming Sessions</div>
              {upcomingSessions.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No upcoming sessions</div>
              ) : upcomingSessions.slice(0, 2).map(s => (
                <div key={s.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(194,24,91,0.2)', borderRadius: 14, padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #C2185B, #6A1B9A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>{(s.mentee_name || s.mentee_email || 'M')[0]}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{s.mentee_name || s.mentee_email}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{s.topic || s.session_type || 'Session'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#F48FB1' }}>{s.scheduled_date ? new Date(s.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{s.scheduled_time || ''}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pending Questions Alert */}
            {pendingApplications.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg, rgba(249,168,37,0.15), rgba(249,168,37,0.08))', border: '1px solid rgba(249,168,37,0.4)', borderRadius: 14, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#F9A825', marginBottom: 4 }}>🔔 {pendingApplications.length} New Question{pendingApplications.length > 1 ? 's' : ''} Available</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>Girls are waiting for your wisdom</div>
                <button onClick={() => setActiveTab('Applications')} style={{ background: 'linear-gradient(135deg, #F9A825, #F57F17)', border: 'none', borderRadius: 10, padding: '8px 16px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Review Questions →</button>
              </div>
            )}

            {/* Recent Questions */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>My Assigned Questions</div>
              {myQuestions.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No questions assigned yet</div>
              ) : myQuestions.slice(0, 3).map(q => (
                <div key={q.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: '#06b6d4', fontWeight: 600 }}>{q.category}</span>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 8, background: q.status === 'answered' ? 'rgba(34,197,94,0.2)' : 'rgba(249,168,37,0.2)', color: q.status === 'answered' ? '#4ade80' : '#fbbf24', fontWeight: 700 }}>{q.status}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>{q.question?.slice(0, 100)}{q.question?.length > 100 ? '...' : ''}</p>
                  {q.status === 'pending' && (
                    <button onClick={() => { setSelectedQuestion(q); setShowResponseModal(true); }} style={{ padding: '7px 14px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C2185B, #6A1B9A)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✍️ Respond</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MY MENTEES TAB ── */}
        {activeTab === 'My Mentees' && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>All Assigned Questions ({myQuestions.length})</div>
            {myQuestions.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>No questions assigned yet. Claim some from Applications!</div>
              </div>
            ) : myQuestions.map(q => (
              <div key={q.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 18, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #C2185B, #6A1B9A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800 }}>?</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#F48FB1' }}>{q.category}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{new Date(q.submitted_date || q.created_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: q.status === 'answered' ? statusColors.active.bg : statusColors.pending.bg, color: q.status === 'answered' ? statusColors.active.text : statusColors.pending.text }}>{q.status}</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>{q.question}</p>
                {q.answer && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}><p style={{ fontSize: 12, color: '#4ade80' }}>{q.answer}</p></div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setSelectedQuestion(q); setShowResponseModal(true); }} style={{ flex: 1, padding: 8, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #C2185B, #6A1B9A)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {q.answer ? '✏️ Edit Response' : '✍️ Respond'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SESSIONS TAB ── */}
        {activeTab === 'Sessions' && (
          <div>
            {[{ label: '⏰ Upcoming', items: upcomingSessions }, { label: '✅ Completed', items: completedSessions }].map(({ label, items }) => (
              <div key={label} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>{label}</div>
                {items.length === 0 ? (
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>None</div>
                ) : items.map(s => (
                  <div key={s.id} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${label.includes('Upcoming') ? 'rgba(194,24,91,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 14, padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: label.includes('Upcoming') ? 'linear-gradient(135deg, #C2185B, #6A1B9A)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>
                        {(s.mentee_name || s.mentee_email || 'M')[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{s.mentee_name || s.mentee_email}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{s.topic || s.session_type}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: label.includes('Upcoming') ? '#F48FB1' : 'rgba(255,255,255,0.5)' }}>
                        {s.scheduled_date ? new Date(s.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{s.scheduled_time || ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {sessions.length === 0 && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>No sessions recorded yet</div>
              </div>
            )}
          </div>
        )}

        {/* ── APPLICATIONS TAB (unclaimed questions) ── */}
        {activeTab === 'Applications' && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Mentee Questions</div>
            {questions.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>No pending questions!</div>
              </div>
            ) : questions.map(q => {
              const isAssigned = q.assigned_mentor_email === user?.email;
              return (
                <div key={q.id} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${isAssigned ? 'rgba(194,24,91,0.4)' : 'rgba(249,168,37,0.3)'}`, borderRadius: 16, padding: 18, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, #F9A825, #F57F17)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800 }}>?</div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800 }}>{q.category}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{new Date(q.submitted_date || q.created_date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: isAssigned ? '#E8F5E9' : '#FFF8E1', color: isAssigned ? '#1B5E20' : '#F57F17' }}>
                      {isAssigned ? '✓ Claimed' : 'Pending'}
                    </span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 12, marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Question</div>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>"{q.question}"</p>
                  </div>
                  {!isAssigned ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleClaimQuestion(q)} style={{ flex: 1, padding: 10, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>✓ Claim Question</button>
                    </div>
                  ) : (
                    <button onClick={() => { setSelectedQuestion(q); setShowResponseModal(true); }} style={{ width: '100%', padding: 10, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #C2185B, #6A1B9A)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      {q.answer ? '✏️ Edit Response' : '✍️ Respond'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── MY PROFILE TAB ── */}
        {activeTab === 'My Profile' && (
          <div>
            {[
              { label: 'Full Name', value: profile?.full_name || user?.full_name || '—' },
              { label: 'Mentor Title', value: profile?.title || 'GGU Mentor' },
              { label: 'Status', value: '✅ Approved Mentor' },
              { label: 'Member Since', value: profile?.created_date ? new Date(profile.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—' },
              { label: 'Rating', value: `⭐ ${profile?.rating?.toFixed(1) || 'New'} / 5.0` },
              { label: 'Sessions', value: stats.sessions_completed },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 18px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{item.value}</span>
              </div>
            ))}

            {expertise.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Areas of Expertise</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {expertise.map(e => (
                    <span key={e} style={{ background: 'linear-gradient(135deg, rgba(194,24,91,0.2), rgba(106,27,154,0.2))', border: '1px solid rgba(194,24,91,0.4)', borderRadius: 14, padding: '6px 14px', fontSize: 13, fontWeight: 600, color: '#F48FB1' }}>{e}</span>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => navigate('/mentorship')} style={{ width: '100%', marginTop: 24, padding: 14, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #C2185B, #6A1B9A)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              🏠 Visit Mentorship Hub
            </button>
            <button onClick={() => navigate('/my-glow-link')} style={{ width: '100%', marginTop: 10, padding: 14, borderRadius: 14, border: '1px solid rgba(194,24,91,0.4)', background: 'transparent', color: '#F48FB1', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              🔗 View My Glow Link
            </button>
          </div>
        )}
      </div>

      <BottomNav active="connect" />

      {/* Find Mentor Modal */}
      {showMenteeSearch && (
        <div className="fixed inset-0 z-[100] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowMenteeSearch(false)}>
          <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-white text-lg">Find a Mentor</h2>
              <button onClick={() => setShowMenteeSearch(false)}><span className="text-2xl text-gray-400">×</span></button>
            </div>
            <MenteeDashboard user={user} />
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedQuestion && (
        <ResponseModal
          question={selectedQuestion}
          onClose={() => { setShowResponseModal(false); setSelectedQuestion(null); }}
          onResponseSubmitted={handleResponseSubmitted}
          user={user}
        />
      )}
    </div>
  );
}

function ResponseModal({ question, onClose, onResponseSubmitted, user }) {
  const [response, setResponse] = useState(question.answer || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!response.trim()) return;
    setLoading(true);
    await base44.entities.AnonymousQuestion.update(question.id, {
      answer: response.trim(),
      status: 'answered',
      answered_date: new Date().toISOString(),
      assigned_mentor_email: user.email,
    });
    setLoading(false);
    onResponseSubmitted();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-lg">{question.answer ? '✏️ Edit Response' : '✍️ Respond to Question'}</h2>
          <button onClick={onClose}><span className="text-2xl text-gray-400">×</span></button>
        </div>
        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)' }}>
          <p className="text-xs text-gray-400 mb-1">Category</p>
          <p className="text-sm font-semibold text-cyan-400">{question.category}</p>
        </div>
        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-xs text-gray-400 mb-1">Question</p>
          <p className="text-sm text-white">{question.question}</p>
        </div>
        <div className="mb-4">
          <label className="text-xs font-bold text-gray-400 mb-2 block">Your Response *</label>
          <textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Share your wisdom and guidance..." className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} rows={6} />
          <p className="text-xs text-gray-500 mt-1">{response.length}/1000</p>
        </div>
        <button onClick={handleSubmit} disabled={!response.trim() || loading} className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #C2185B, #6A1B9A)' }}>
          {loading ? 'Submitting...' : question.answer ? 'Update Response' : 'Submit Response'}
        </button>
      </div>
    </div>
  );
}