import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, CheckCircle, Clock, Star, Calendar, User, BookOpen, Home, ExternalLink, ChevronRight, Sparkles, Award, LogOut, Trash2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import MenteeDashboard from './MenteeDashboard';

const TABS = ['Overview', 'My Mentees', 'Sessions', 'Applications', 'Profile'];

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [stats, setStats] = useState({ total_questions: 0, pending: 0, answered: 0, helpful_count: 0, sessions_completed: 0, rating: 0 });

  useEffect(() => {
    const loadData = async () => {
      let currentUser = null;
      try {
        currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        setLoading(false);
        return;
      }

      let mentorProfile = null;
      try {
        const mentors = await base44.entities.Mentor.filter({ user_email: currentUser.email });
        if (mentors.length > 0) {
          mentorProfile = mentors[0];
        } else {
          const teenMentors = await base44.entities.TeenMentor.filter({ user_email: currentUser.email });
          if (teenMentors.length > 0) mentorProfile = teenMentors[0];
        }
        setProfile(mentorProfile);
      } catch (e) {}

      let allQuestions = [];
      try {
        allQuestions = await base44.entities.AnonymousQuestion.list('-created_date', 100);
        const mentorQuestions = allQuestions.filter(q =>
          (q.assigned_mentor_email === currentUser.email) ||
          (q.status === 'pending' && !q.assigned_mentor_email)
        );
        setQuestions(mentorQuestions);
      } catch (e) {}

      let mentorSessions = [];
      try {
        mentorSessions = await base44.entities.MentorSession.filter({ mentor_email: currentUser.email });
        setSessions(mentorSessions);
      } catch (e) {}

      const assignedQuestions = allQuestions.filter(q => q.assigned_mentor_email === currentUser.email);
      setStats({
        total_questions: assignedQuestions.length,
        pending: assignedQuestions.filter(q => q.status === 'pending').length,
        answered: assignedQuestions.filter(q => q.status === 'answered').length,
        helpful_count: assignedQuestions.reduce((sum, q) => sum + (q.helpful_count || 0), 0),
        sessions_completed: mentorSessions.filter(s => s.status === 'completed').length,
        rating: mentorProfile?.rating || 0,
      });

      setLoading(false);
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

  const initials = profile?.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || user?.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'M';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0608', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontSize: 28, fontWeight: 900, background: 'linear-gradient(135deg, #e8526d, #f1b610)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Girls Glowing Up™</div>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(232,82,109,0.2)', borderTop: '3px solid #e8526d', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading your mentor dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0608', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
        <div style={{ fontSize: 40 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Mentor Access Required</div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center' }}>Please sign in with your mentor account to access this dashboard.</p>
      </div>
    );
  }

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const pendingApplications = questions.filter(q => q.status === 'pending' && !q.assigned_mentor_email);
  const myQuestions = questions.filter(q => q.assigned_mentor_email === user?.email);

  const tierLabel = profile?.mentor_tier
    ? profile.mentor_tier.charAt(0).toUpperCase() + profile.mentor_tier.slice(1) + ' Mentor'
    : 'GGU Mentor';

  return (
    <div style={{ minHeight: '100vh', background: '#0d0608', fontFamily: "'Poppins', sans-serif", color: '#fff', paddingBottom: 90, overflowX: 'hidden' }}>

      {/* Header */}
      <div style={{ background: 'rgba(13,6,8,0.97)', borderBottom: '1px solid rgba(232,82,109,0.15)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #e8526d, #f1b610)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{profile?.full_name || user?.full_name || 'Mentor'}</div>
            <div style={{ fontSize: 11, color: '#f1b610', fontWeight: 600 }}>{tierLabel}</div>
          </div>
        </div>
        <button onClick={() => setShowMenteeSearch(true)} style={{ padding: '7px 14px', borderRadius: 20, border: '1px solid rgba(241,182,16,0.35)', background: 'rgba(241,182,16,0.1)', color: '#f1b610', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
          Find Mentors
        </button>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 0' }}>

        {/* Hero Banner */}
        <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 20, position: 'relative' }}>
          <div style={{ background: 'linear-gradient(135deg, #e8526d 0%, #c2185b 40%, #7b1fa2 100%)', padding: '24px 20px 20px' }}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(241,182,16,0.15)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -30, right: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, position: 'relative' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{profile?.full_name || user?.full_name || 'Mentor'}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{profile?.title || 'Girls Glowing Up™ Mentor'}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {expertise.slice(0, 2).map(e => (
                    <span key={e} style={{ background: 'rgba(241,182,16,0.3)', border: '1px solid rgba(241,182,16,0.5)', borderRadius: 8, padding: '2px 8px', fontSize: 10, color: '#fde68a', fontWeight: 600 }}>{e}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, position: 'relative' }}>
              {[
                { label: 'Assigned', value: stats.total_questions, icon: '💬' },
                { label: 'Pending', value: stats.pending, icon: '⏳' },
                { label: 'Answered', value: stats.answered, icon: '✅' },
                { label: 'Helpful', value: stats.helpful_count, icon: '❤️' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 12, padding: '10px 4px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ fontSize: 14, marginBottom: 2 }}>{s.icon}</div>
                  <div style={{ fontSize: 19, fontWeight: 900, color: '#fff' }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 14px',
                borderRadius: 20,
                border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.12)',
                background: activeTab === tab ? 'linear-gradient(135deg, #e8526d, #f1b610)' : 'rgba(255,255,255,0.04)',
                color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.5)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: activeTab === tab ? '0 4px 14px rgba(232,82,109,0.35)' : 'none',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'Overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Alert banner */}
            {pendingApplications.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg, rgba(241,182,16,0.12), rgba(241,182,16,0.06))', border: '1px solid rgba(241,182,16,0.4)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f1b610' }}>🔔 {pendingApplications.length} New Question{pendingApplications.length > 1 ? 's' : ''}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Girls are waiting for your wisdom</div>
                </div>
                <button onClick={() => setActiveTab('Applications')} style={{ padding: '7px 14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #f1b610, #e8a900)', color: '#1a0a04', fontSize: 11, fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>
                  Review →
                </button>
              </div>
            )}

            {/* Upcoming Sessions */}
            <Section title="Upcoming Sessions" icon={<Calendar size={14} />}>
              {upcomingSessions.length === 0 ? (
                <EmptyState emoji="📅" text="No upcoming sessions" />
              ) : upcomingSessions.slice(0, 3).map(s => (
                <SessionRow key={s.id} session={s} accent="#e8526d" />
              ))}
            </Section>

            {/* My Questions */}
            <Section title="My Assigned Questions" icon={<MessageCircle size={14} />}>
              {myQuestions.length === 0 ? (
                <EmptyState emoji="💬" text="No questions assigned yet" />
              ) : myQuestions.slice(0, 3).map(q => (
                <QuestionCard key={q.id} question={q} isOwned onRespond={() => { setSelectedQuestion(q); setShowResponseModal(true); }} />
              ))}
            </Section>
          </div>
        )}

        {/* ── MY MENTEES TAB ── */}
        {activeTab === 'My Mentees' && (
          <Section title={`All Assigned Questions (${myQuestions.length})`} icon={<BookOpen size={14} />}>
            {myQuestions.length === 0 ? (
              <EmptyState emoji="📭" text="No questions assigned yet. Claim some from Applications!" />
            ) : myQuestions.map(q => (
              <QuestionCard key={q.id} question={q} isOwned onRespond={() => { setSelectedQuestion(q); setShowResponseModal(true); }} />
            ))}
          </Section>
        )}

        {/* ── SESSIONS TAB ── */}
        {activeTab === 'Sessions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Section title="⏰ Upcoming" icon={<Clock size={14} />}>
              {upcomingSessions.length === 0 ? <EmptyState emoji="📅" text="No upcoming sessions" /> :
                upcomingSessions.map(s => <SessionRow key={s.id} session={s} accent="#e8526d" />)}
            </Section>
            <Section title="✅ Completed" icon={<CheckCircle size={14} />}>
              {completedSessions.length === 0 ? <EmptyState emoji="🎉" text="No completed sessions yet" /> :
                completedSessions.map(s => <SessionRow key={s.id} session={s} accent="rgba(255,255,255,0.3)" />)}
            </Section>
          </div>
        )}

        {/* ── APPLICATIONS TAB ── */}
        {activeTab === 'Applications' && (
          <Section title="Mentee Questions" icon={<Sparkles size={14} />}>
            {questions.length === 0 ? (
              <EmptyState emoji="🎉" text="No pending questions!" />
            ) : questions.map(q => {
              const isAssigned = q.assigned_mentor_email === user?.email;
              return (
                <div key={q.id} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${isAssigned ? 'rgba(232,82,109,0.35)' : 'rgba(241,182,16,0.25)'}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: isAssigned ? 'linear-gradient(135deg, #e8526d, #c2185b)' : 'linear-gradient(135deg, #f1b610, #e8a900)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>?</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{q.category}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{new Date(q.submitted_date || q.created_date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: isAssigned ? 'rgba(232,82,109,0.2)' : 'rgba(241,182,16,0.2)', color: isAssigned ? '#f48fb1' : '#f1b610' }}>
                      {isAssigned ? '✓ Claimed' : 'Open'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', margin: '0 0 12px', lineHeight: 1.5 }}>"{q.question}"</p>
                  {!isAssigned ? (
                    <button onClick={() => handleClaimQuestion(q)} style={{ width: '100%', padding: '10px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #e8526d, #f1b610)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      Claim Question
                    </button>
                  ) : (
                    <button onClick={() => { setSelectedQuestion(q); setShowResponseModal(true); }} style={{ width: '100%', padding: '10px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #e8526d, #c2185b)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      {q.answer ? 'Edit Response' : 'Respond'}
                    </button>
                  )}
                </div>
              );
            })}
          </Section>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === 'Profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Full Name', value: profile?.full_name || user?.full_name || '—', icon: <User size={14} /> },
              { label: 'Mentor Title', value: profile?.title || 'GGU Mentor', icon: <Award size={14} /> },
              { label: 'Status', value: '✅ Approved Mentor', icon: <CheckCircle size={14} /> },
              { label: 'Member Since', value: profile?.created_date ? new Date(profile.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—', icon: <Calendar size={14} /> },
              { label: 'Rating', value: `⭐ ${profile?.rating?.toFixed(1) || 'New'} / 5.0`, icon: <Star size={14} /> },
              { label: 'Sessions Completed', value: stats.sessions_completed, icon: <CheckCircle size={14} /> },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#e8526d' }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{item.value}</span>
              </div>
            ))}

            {expertise.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginTop: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Areas of Expertise</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {expertise.map(e => (
                    <span key={e} style={{ background: 'linear-gradient(135deg, rgba(232,82,109,0.2), rgba(241,182,16,0.15))', border: '1px solid rgba(232,82,109,0.35)', borderRadius: 12, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#f48fb1' }}>{e}</span>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => navigate('/mentorship')} style={{ width: '100%', marginTop: 8, padding: 14, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #e8526d, #f1b610)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              🏠 Visit Mentorship Hub
            </button>
            <button onClick={() => navigate('/my-glow-link')} style={{ width: '100%', padding: 14, borderRadius: 14, border: '1px solid rgba(232,82,109,0.35)', background: 'transparent', color: '#f48fb1', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              🔗 View My Glow Link
            </button>

            {/* Sign Out */}
            <button onClick={() => base44.auth.logout('/')} style={{ width: '100%', marginTop: 8, padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <LogOut size={16} /> Sign Out
            </button>

            {/* Delete Account */}
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{ width: '100%', padding: 14, borderRadius: 14, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Trash2 size={16} /> Delete Account
            </button>
          </div>
        )}
      </div>

      <BottomNav active="connect" />

      {/* Find Mentor Modal */}
      {showMenteeSearch && (
        <div className="fixed inset-0 z-[100] flex items-end" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={() => setShowMenteeSearch(false)}>
          <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#130810' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-white text-lg">Find a Mentor</h2>
              <button onClick={() => setShowMenteeSearch(false)} className="text-2xl text-gray-400">×</button>
            </div>
            <MenteeDashboard user={user} />
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: '#1a0508', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
              <h2 style={{ color: '#ef4444', fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Delete Account</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.5 }}>This is permanent and cannot be undone. Your profile, sessions, and all data will be deleted forever.</p>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 8, fontWeight: 700 }}>Type <span style={{ color: '#ef4444' }}>DELETE</span> to confirm:</p>
            <input
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE here"
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none', marginBottom: 16, boxSizing: 'border-box' }}
            />
            <button
              disabled={deleteConfirmText !== 'DELETE'}
              onClick={async () => {
                await base44.functions.invoke('deleteAccount', {});
                base44.auth.logout('/');
              }}
              style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', background: deleteConfirmText === 'DELETE' ? '#ef4444' : 'rgba(239,68,68,0.2)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed', marginBottom: 10, opacity: deleteConfirmText === 'DELETE' ? 1 : 0.5 }}
            >
              Permanently Delete My Account
            </button>
            <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }} style={{ width: '100%', padding: 12, borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
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

/* ── Small reusable sub-components ── */

function Section({ title, icon, children }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <span style={{ color: '#e8526d' }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 1 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ emoji, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 16px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{emoji}</div>
      {text}
    </div>
  );
}

function SessionRow({ session: s, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, #e8526d, #c2185b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
          {(s.mentee_email || 'M')[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{s.mentee_email}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{s.topic || s.session_type || 'Session'}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: accent }}>{s.session_date ? new Date(s.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{s.session_type || ''}</div>
      </div>
    </div>
  );
}

function QuestionCard({ question: q, isOwned, onRespond }) {
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: '#f1b610', fontWeight: 700 }}>{q.category}</span>
        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 8, background: q.status === 'answered' ? 'rgba(34,197,94,0.15)' : 'rgba(241,182,16,0.15)', color: q.status === 'answered' ? '#4ade80' : '#f1b610', fontWeight: 700 }}>{q.status}</span>
      </div>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '0 0 8px', lineHeight: 1.5 }}>{q.question?.slice(0, 100)}{q.question?.length > 100 ? '…' : ''}</p>
      {q.status !== 'answered' && isOwned && (
        <button onClick={onRespond} style={{ padding: '6px 14px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #e8526d, #c2185b)', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
          ✍️ Respond
        </button>
      )}
      {q.status === 'answered' && isOwned && (
        <button onClick={onRespond} style={{ padding: '6px 14px', borderRadius: 10, border: '1px solid rgba(232,82,109,0.35)', background: 'transparent', color: '#f48fb1', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
          ✏️ Edit
        </button>
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
    <div className="fixed inset-0 z-[100] flex items-end" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#130810', border: '1px solid rgba(232,82,109,0.2)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontWeight: 800, color: '#fff', fontSize: 16 }}>{question.answer ? '✏️ Edit Response' : '✍️ Respond to Question'}</h2>
          <button onClick={onClose} style={{ fontSize: 24, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ background: 'rgba(241,182,16,0.08)', border: '1px solid rgba(241,182,16,0.25)', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>Category</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#f1b610' }}>{question.category}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 14px', marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>Question</p>
          <p style={{ fontSize: 13, color: '#fff', lineHeight: 1.5 }}>{question.question}</p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Your Response</label>
          <textarea
            value={response}
            onChange={e => setResponse(e.target.value)}
            placeholder="Share your wisdom and guidance..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 14px', color: '#fff', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'Poppins, sans-serif', lineHeight: 1.6 }}
            rows={6}
          />
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{response.length}/1000</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!response.trim() || loading}
          style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #e8526d, #f1b610)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: !response.trim() || loading ? 0.5 : 1 }}
        >
          {loading ? 'Submitting...' : question.answer ? 'Update Response' : 'Submit Response'}
        </button>
      </div>
    </div>
  );
}