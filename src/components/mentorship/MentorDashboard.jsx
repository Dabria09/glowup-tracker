import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { deleteCurrentAccount } from '@/lib/accountDeletion';
import {
  ACCOUNT_TYPES,
  clearAuthSession,
  getAccountType,
  isAdminUser,
  isDeletedAccount,
  loadMentorApplicationByEmail,
  loadCurrentUserRecord,
  loadMentorEntityByEmail,
} from '@/lib/authRules';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, CheckCircle, Star, Calendar, User, BookOpen, Sparkles, Award, LogOut, Trash2, Crown, Camera, Loader2, Mail } from 'lucide-react';
import MentorBottomNav from '@/components/mentorship/MentorBottomNav';
import ApplicationStatusTracker from './ApplicationStatusTracker';
import MentorLesson from './MentorLesson';
import MentorInbox from './MentorInbox';
import MySessionsTab from './MySessionsTab';

const TABS = ['Overview', 'Inbox', 'My Mentees', 'Sessions', 'Lesson', 'Profile'];

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    return TABS.includes(tab) ? tab : 'Overview';
  });
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [menteeFilter, setMenteeFilter] = useState('all'); // 'all' | 'pending' | 'answered'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showGguModal, setShowGguModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);
  const [application, setApplication] = useState(null);
  const [stats, setStats] = useState({ total_questions: 0, pending: 0, answered: 0, helpful_count: 0, sessions_completed: 0, rating: 0 });

  useEffect(() => {
    const loadData = async () => {
      let currentUser = null;
      try {
        const authUser = await base44.auth.me();
        const userRecord = await loadCurrentUserRecord(authUser);
        if (!userRecord && !isAdminUser(authUser)) {
          await clearAuthSession();
          window.location.href = '/mentor-login';
          return;
        }
        if (isDeletedAccount(userRecord)) {
          await clearAuthSession();
          window.location.href = '/mentor-login';
          return;
        }

        let inferredMentorProfile = null;
        const mentorApplication = await loadMentorApplicationByEmail(authUser.email);
        inferredMentorProfile = await loadMentorEntityByEmail(authUser.email);
        const isMentorAccount = Boolean(inferredMentorProfile || mentorApplication);
        
        // Build currentUser object first
        currentUser = { ...authUser, ...(userRecord || {}) };
        const isAdmin = isAdminUser(currentUser);
        
        if (!isMentorAccount && !isAdmin) {
          // Not a mentor account - redirect appropriately
          if (getAccountType(userRecord) === ACCOUNT_TYPES.GIRL) {
            console.log('[MentorDashboard] User is a girl account, redirecting to /dashboard');
            window.location.href = '/dashboard';
            return;
          }

          console.log('[MentorDashboard] Not a mentor account, redirecting to /mentor-login');
          await clearAuthSession();
          window.location.href = '/mentor-login';
          return;
        }
        
        // IS a mentor account - ensure account_type and mentor_status are set correctly
        if (inferredMentorProfile) {
          currentUser.account_type = ACCOUNT_TYPES.MENTOR;
          currentUser.mentor_status = 'approved';
          currentUser.mentor_type = currentUser.mentor_type || inferredMentorProfile.mentor_type || inferredMentorProfile.type;
          // Update auth metadata
          try {
            await base44.auth.updateMe({ account_type: 'mentor', mentor_status: 'approved' });
            console.log('[MentorDashboard] Updated auth metadata for approved mentor');
          } catch (updateErr) {
            console.warn('[MentorDashboard] Failed to update auth metadata:', updateErr);
          }
        } else if (mentorApplication && mentorApplication.status !== 'rejected') {
          currentUser.account_type = ACCOUNT_TYPES.MENTOR;
          currentUser.mentor_status = mentorApplication.status === 'approved' ? 'approved' : 'pending';
          // Update auth metadata
          try {
            await base44.auth.updateMe({ account_type: 'mentor', mentor_status: 'pending' });
            console.log('[MentorDashboard] Updated auth metadata for pending mentor applicant');
          } catch (updateErr) {
            console.warn('[MentorDashboard] Failed to update auth metadata:', updateErr);
          }
        }
        if (currentUser.account_type === ACCOUNT_TYPES.LINKED && currentUser.active_mode !== ACCOUNT_TYPES.MENTOR) {
          await base44.auth.updateMe({ active_mode: ACCOUNT_TYPES.MENTOR });
          currentUser.active_mode = ACCOUNT_TYPES.MENTOR;
        }
        currentUser._mentorProfile = inferredMentorProfile;
        setUser(currentUser);
      } catch (e) {
        setLoading(false);
        return;
      }

      let mentorProfile = null;
      try {
        mentorProfile = currentUser._mentorProfile || await loadMentorEntityByEmail(currentUser.email);
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

      try {
        const apps = await base44.entities.MentorApplication.filter({ user_email: currentUser.email });
        if (apps.length > 0) setApplication(apps[0]);
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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploadingAvatar(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Mentor.update(profile.id, { avatar_url: file_url });
      setProfile({ ...profile, avatar_url: file_url });
    } catch (err) {
      console.error('Avatar upload failed', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleGguToggle = async () => {
    if (user?.account_type === 'linked') {
      await base44.auth.updateMe({ active_mode: 'girl' });
      window.location.href = '/dashboard';
    } else {
      setShowGguModal(true);
    }
  };

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const pendingApplications = questions.filter(q => q.status === 'pending' && !q.assigned_mentor_email);
  const myQuestions = questions.filter(q => q.assigned_mentor_email === user?.email);

  const tierLabel = profile?.mentor_tier
    ? profile.mentor_tier.charAt(0).toUpperCase() + profile.mentor_tier.slice(1) + ' Mentor'
    : 'GGU Mentor';

  return (
    <div style={{ minHeight: '100vh', background: '#07050e', fontFamily: 'Outfit, sans-serif', color: '#fff', paddingBottom: 90, overflowX: 'hidden' }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, top: -150, left: -120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,82,109,0.18), transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', width: 350, height: 350, bottom: '20%', right: -80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* Mode Toggle Bar */}
      <div style={{ background: 'rgba(7,5,14,0.96)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', position: 'sticky', top: 0, zIndex: 60, padding: '10px 20px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 32, padding: 4, gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 28, background: 'linear-gradient(135deg, #e8526d, #c2185b)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'default', boxShadow: '0 4px 14px rgba(232,82,109,0.4)', letterSpacing: '0.2px' }}>
            <Crown size={13} /> Mentor Mode
          </div>
          <button
            onClick={handleGguToggle}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 28, background: 'transparent', color: 'rgba(255,255,255,0.38)', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', letterSpacing: '0.2px' }}
          >
            <Sparkles size={13} /> GGU App
          </button>
        </div>
      </div>

      {/* Header */}
      <div style={{ background: 'rgba(7,5,14,0.95)', borderBottom: '1px solid rgba(232,82,109,0.12)', backdropFilter: 'blur(24px)', position: 'relative', zIndex: 50, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #e8526d, #f1b610)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff', flexShrink: 0, overflow: 'hidden', boxShadow: '0 4px 14px rgba(232,82,109,0.35)' }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : initials}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.2px' }}>{profile?.full_name || user?.full_name || 'Mentor'}</div>
            <div style={{ fontSize: 11, color: '#f1b610', fontWeight: 600, marginTop: 2, letterSpacing: '0.2px' }}>{tierLabel}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/mentor-contact-admin')} style={{ padding: '8px 14px', borderRadius: 22, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.08)', color: '#60a5fa', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, letterSpacing: '0.1px' }}>
            <Mail size={11} /> Contact Admin
          </button>
          <button onClick={() => navigate('/mentor-reports')} style={{ padding: '8px 14px', borderRadius: 22, border: '1px solid rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.08)', color: '#c084fc', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, letterSpacing: '0.1px' }}>
            📊 Reports
          </button>
          <button onClick={() => setActiveTab('My Mentees')} style={{ padding: '8px 14px', borderRadius: 22, border: '1px solid rgba(241,182,16,0.3)', background: 'rgba(241,182,16,0.08)', color: '#f1b610', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1px' }}>
            My Mentees
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px 0', position: 'relative', zIndex: 1 }}>

        {/* Hero Banner */}
        <div style={{ borderRadius: 24, overflow: 'hidden', marginBottom: 24, position: 'relative', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
          <div style={{ background: 'linear-gradient(135deg, #e8526d 0%, #c2185b 45%, #7b1fa2 100%)', padding: '28px 22px 22px' }}>
            {/* Decorative orbs */}
            <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(241,182,16,0.12)', pointerEvents: 'none', filter: 'blur(20px)' }} />
            <div style={{ position: 'absolute', bottom: -20, right: 30, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
            {/* Top accent line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(241,182,16,0.5), rgba(255,255,255,0.1))' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, position: 'relative' }}>
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '2.5px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, flexShrink: 0, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : initials}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.3px' }}>{profile?.full_name || user?.full_name || 'Mentor'}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 3, letterSpacing: '0.1px' }}>{profile?.title || 'Girls Glowing Up™ Mentor'}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                  {expertise.slice(0, 2).map(e => (
                    <span key={e} style={{ background: 'rgba(241,182,16,0.25)', border: '1px solid rgba(241,182,16,0.45)', borderRadius: 10, padding: '3px 9px', fontSize: 10, color: '#fde68a', fontWeight: 700, letterSpacing: '0.2px' }}>{e}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, position: 'relative' }}>
              {[
                { label: 'Questions', value: stats.total_questions, icon: '💬' },
                { label: 'Open', value: stats.pending, icon: '⏳' },
                { label: 'Answered', value: stats.answered, icon: '✅' },
                { label: 'Helpful', value: stats.helpful_count, icon: '❤️' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', borderRadius: 14, padding: '12px 4px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.18)' }}>
                  <div style={{ fontSize: 15, marginBottom: 3 }}>{s.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.3px' }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
          {TABS.map(tab => {
            const isLessonUnlocked = tab === 'Lesson' && application?.checklist_interview_completed && !application?.checklist_lesson_passed;
            const isLessonPassed = tab === 'Lesson' && application?.checklist_lesson_passed;
            const hasUnread = tab === 'Inbox' && questions.filter(q => q.status === 'pending' && (!q.assigned_mentor_email || q.assigned_mentor_email === user?.email)).length > 0;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 22,
                  border: isActive ? 'none' : isLessonUnlocked ? '1px solid rgba(147,51,234,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  background: isActive ? 'linear-gradient(135deg, #e8526d, #f1b610)' : isLessonUnlocked ? 'rgba(147,51,234,0.12)' : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#fff' : isLessonUnlocked ? '#c084fc' : isLessonPassed ? '#4ade80' : 'rgba(255,255,255,0.45)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 6px 18px rgba(232,82,109,0.4)' : 'none',
                  transition: 'all 0.18s',
                  flexShrink: 0,
                  position: 'relative',
                  letterSpacing: '0.2px',
                }}
              >
                {tab}{isLessonPassed && ' ✓'}{isLessonUnlocked && ' 🔓'}
                {hasUnread && !isActive && (
                  <span style={{ position: 'absolute', top: 3, right: 3, width: 7, height: 7, borderRadius: '50%', background: '#e8526d', border: '1.5px solid #07050e' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'Overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Alert banner */}
            {pendingApplications.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg, rgba(241,182,16,0.1), rgba(241,182,16,0.05))', border: '1px solid rgba(241,182,16,0.35)', borderRadius: 18, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#f1b610', letterSpacing: '0.1px' }}>🔔 {pendingApplications.length} New Question{pendingApplications.length > 1 ? 's' : ''}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>Girls are waiting for your wisdom</div>
                </div>
                <button onClick={() => setActiveTab('Inbox')} style={{ padding: '8px 16px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #f1b610, #e8a900)', color: '#1a0a04', fontSize: 11, fontWeight: 800, cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 12px rgba(241,182,16,0.35)' }}>
                  Open Inbox →
                </button>
              </div>
            )}

            {/* Lesson unlock alert */}
            {application?.checklist_interview_completed && !application?.checklist_lesson_passed && (
              <div style={{ background: 'linear-gradient(135deg, rgba(147,51,234,0.12), rgba(79,70,229,0.08))', border: '1px solid rgba(147,51,234,0.35)', borderRadius: 18, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#c084fc', letterSpacing: '0.1px' }}>📚 Mentor Lesson Unlocked!</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>Complete your certification lesson to finish Stage 5</div>
                </div>
                <button onClick={() => setActiveTab('Lesson')} style={{ padding: '8px 16px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #9333ea, #6366f1)', color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 12px rgba(147,51,234,0.4)' }}>
                  Start →
                </button>
              </div>
            )}

            {/* Application Status */}
            <ApplicationStatusTracker profile={profile} application={application} />

            {/* Upcoming Sessions */}
            <Section title="Upcoming Sessions" icon={<Calendar size={14} />}>
              {upcomingSessions.length === 0 ? (
                <EmptyState emoji="📅" text="No upcoming sessions" />
              ) : upcomingSessions.slice(0, 3).map(s => (
                <SessionRow key={s.id} session={s} />
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
        {activeTab === 'My Mentees' && (() => {
          const filteredQuestions = menteeFilter === 'pending'
            ? myQuestions.filter(q => q.status !== 'answered')
            : menteeFilter === 'answered'
            ? myQuestions.filter(q => q.status === 'answered')
            : myQuestions;
          const pendingCount = myQuestions.filter(q => q.status !== 'answered').length;
          const answeredCount = myQuestions.filter(q => q.status === 'answered').length;

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Section header */}
              <div style={{ background: 'linear-gradient(135deg, rgba(232,82,109,0.1), rgba(168,85,247,0.07))', border: '1px solid rgba(232,82,109,0.2)', borderRadius: 20, padding: '20px 20px 16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #e8526d, #a855f7, transparent)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(232,82,109,0.15)', border: '1px solid rgba(232,82,109,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={16} color="#e8526d" />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '-0.2px' }}>Find Mentees</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{myQuestions.length} question{myQuestions.length !== 1 ? 's' : ''} assigned to you</div>
                  </div>
                </div>
                {/* Filter pills */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { key: 'all',      label: `All (${myQuestions.length})` },
                    { key: 'pending',  label: `Pending (${pendingCount})` },
                    { key: 'answered', label: `Answered (${answeredCount})` },
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setMenteeFilter(f.key)}
                      style={{
                        padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.2px',
                        background: menteeFilter === f.key
                          ? 'linear-gradient(135deg, #e8526d, #c2185b)'
                          : 'rgba(255,255,255,0.07)',
                        color: menteeFilter === f.key ? '#fff' : 'rgba(255,255,255,0.45)',
                        boxShadow: menteeFilter === f.key ? '0 3px 10px rgba(232,82,109,0.35)' : 'none',
                        transition: 'all 0.15s',
                      }}
                    >{f.label}</button>
                  ))}
                </div>
              </div>

              {/* Question list */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '4px 0', overflow: 'hidden' }}>
                {filteredQuestions.length === 0 ? (
                  <EmptyState emoji="📭" text={myQuestions.length === 0 ? 'No questions assigned yet. Claim some from your Inbox!' : `No ${menteeFilter} questions.`} />
                ) : filteredQuestions.map(q => (
                  <QuestionCard key={q.id} question={q} isOwned onRespond={() => { setSelectedQuestion(q); setShowResponseModal(true); }} />
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── INBOX TAB ── */}
        {activeTab === 'Inbox' && (
          <MentorInbox
            questions={questions}
            user={user}
            onRefresh={async () => {
              const allQ = await base44.entities.AnonymousQuestion.list('-created_date', 100);
              const filtered = allQ.filter(q =>
                q.assigned_mentor_email === user.email ||
                (q.status === 'pending' && !q.assigned_mentor_email)
              );
              setQuestions(filtered);
            }}
          />
        )}

        {/* ── SESSIONS TAB ── */}
        {activeTab === 'Sessions' && user && (
          <MySessionsTab user={user} />
        )}



        {/* ── LESSON TAB ── */}
        {activeTab === 'Lesson' && (
          <MentorLesson
            application={application}
            user={user}
            onComplete={async () => {
              const apps = await base44.entities.MentorApplication.filter({ user_email: user.email });
              if (apps.length > 0) setApplication(apps[0]);
            }}
          />
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === 'Profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Avatar Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8, paddingBottom: 4 }}>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarUpload}
              />
              <div style={{ position: 'relative', width: 96, height: 96, marginBottom: 12 }}>
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, #e8526d, #f1b610)', border: '3px solid rgba(232,82,109,0.5)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900, color: '#fff' }}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : initials}
                </div>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: '50%', background: '#e8526d', border: '2px solid #0d0608', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  {uploadingAvatar ? <Loader2 size={13} color="#fff" style={{ animation: 'spin 0.8s linear infinite' }} /> : <Camera size={13} color="#fff" />}
                </button>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Tap the camera icon to update your photo</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
              {[
                { label: 'Full Name', value: profile?.full_name || user?.full_name || '—', icon: <User size={14} /> },
                { label: 'Mentor Title', value: profile?.title || 'GGU Mentor', icon: <Award size={14} /> },
                { label: 'Status', value: <StatusBadge status="approved" customLabel="Approved Mentor" />, icon: <CheckCircle size={14} /> },
                { label: 'Member Since', value: profile?.created_date ? new Date(profile.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—', icon: <Calendar size={14} /> },
                { label: 'Rating', value: `⭐ ${profile?.rating?.toFixed(1) || 'New'} / 5.0`, icon: <Star size={14} /> },
                { label: 'Sessions Completed', value: stats.sessions_completed, icon: <CheckCircle size={14} /> },
              ].map((item, i, arr) => (
                <div key={item.label} style={{ padding: '15px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(232,82,109,0.08)', border: '1px solid rgba(232,82,109,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#e8526d' }}>{item.icon}</span>
                    </div>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif' }}>{item.label}</span>
                  </div>
                  {typeof item.value === 'string'
                    ? <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.1px' }}>{item.value}</span>
                    : item.value}
                </div>
              ))}
            </div>

            {/* Application Status */}
            <ApplicationStatusTracker profile={profile} application={application} />

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

            {/* Sign Out */}
            <button onClick={() => base44.auth.logout('/')} style={{ width: '100%', marginTop: 8, padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <LogOut size={16} /> Sign Out
            </button>

            {/* Delete Account */}
            <button
              onClick={() => {
                setDeleteConfirmText('');
                setShowDeleteModal(true);
              }}
              style={{ width: '100%', padding: 14, borderRadius: 14, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Trash2 size={16} /> Delete Account
            </button>
          </div>
        )}
      </div>

      <MentorBottomNav active="dashboard" />



      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: '#1a0508', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
              <h2 style={{ color: '#ef4444', fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Are you sure?</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.5 }}>
                Deleting your account is permanent and cannot be undone. All your mentor data, application history, and profile will be removed.
              </p>
              <p style={{ color: '#ef4444', fontSize: 12, fontWeight: 800, marginTop: 12 }}>
                Type DELETE to confirm.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                disabled={deleteLoading}
                placeholder="DELETE"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: 14,
                  border: `1px solid ${deleteConfirmText === 'DELETE' ? '#ef4444' : 'rgba(239,68,68,0.3)'}`,
                  background: 'rgba(239,68,68,0.08)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: 2,
                  textAlign: 'center',
                  outline: 'none',
                }}
              />
              <button
                disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
                onClick={async () => {
                  if (deleteConfirmText !== 'DELETE') return;
                  try {
                    setDeleteLoading(true);
                    await deleteCurrentAccount(deleteConfirmText);
                  } catch (err) {
                    setDeleteLoading(false);
                    alert('Deletion failed. Please try again. Error: ' + err.message);
                  }
                }}
                style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', background: '#ef4444', color: '#fff', fontSize: 14, fontWeight: 800, cursor: deleteLoading || deleteConfirmText !== 'DELETE' ? 'not-allowed' : 'pointer', opacity: deleteLoading || deleteConfirmText !== 'DELETE' ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {deleteLoading && <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
                {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmText('');
                  setShowDeleteModal(false);
                }}
                disabled={deleteLoading}
                style={{ width: '100%', padding: 12, borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
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

      {/* GGU Account Modal */}
      {showGguModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={() => setShowGguModal(false)}>
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: '#130810', border: '1px solid rgba(232,82,109,0.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✨</div>
              <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Access GGU App</h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.5 }}>Link a GGU account to switch between your mentor dashboard and the GGU app seamlessly.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => { setShowGguModal(false); window.location.href = '/login?link=true'; }}
                style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #e8526d, #f1b610)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                🔗 Log in with existing GGU account
              </button>
              <button
                onClick={() => { setShowGguModal(false); window.location.href = '/register?link=true'; }}
                style={{ width: '100%', padding: 14, borderRadius: 14, border: '1px solid rgba(232,82,109,0.35)', background: 'transparent', color: '#f48fb1', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                ✨ Create a GGU account with the same email
              </button>
              <button
                onClick={() => setShowGguModal(false)}
                style={{ width: '100%', padding: 12, borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.35)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Status badge palette ── */
const STATUS_STYLES = {
  // Question statuses
  pending:    { bg: 'rgba(241,182,16,0.1)',   border: 'rgba(241,182,16,0.3)',   color: '#f1b610',  dot: '#f1b610',  label: 'Pending'   },
  answered:   { bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.28)',  color: '#34d399',  dot: '#34d399',  label: 'Answered'  },
  // Session statuses
  scheduled:  { bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.28)',  color: '#60a5fa',  dot: '#60a5fa',  label: 'Upcoming'  },
  live:       { bg: 'rgba(232,82,109,0.12)',   border: 'rgba(232,82,109,0.35)', color: '#e8526d',  dot: '#e8526d',  label: 'Live'      },
  completed:  { bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.28)',  color: '#34d399',  dot: '#34d399',  label: 'Completed' },
  cancelled:  { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)', dot: 'rgba(255,255,255,0.25)', label: 'Cancelled' },
  // Mentor account status
  approved:   { bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.28)',  color: '#34d399',  dot: '#34d399',  label: 'Approved'  },
  active:     { bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.28)',  color: '#34d399',  dot: '#34d399',  label: 'Active'    },
  inactive:   { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)', dot: 'rgba(255,255,255,0.25)', label: 'Inactive' },
};

function StatusBadge({ status, customLabel }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const label = customLabel || s.label;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20,
      background: s.bg, border: `1px solid ${s.border}`,
      fontSize: 10, fontWeight: 700, color: s.color,
      textTransform: 'uppercase', letterSpacing: '0.6px',
      fontFamily: 'Outfit, sans-serif',
      flexShrink: 0,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}

/* ── Small reusable sub-components ── */

function Section({ title, icon, children }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '18px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ color: '#e8526d' }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: 'Outfit, sans-serif' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ emoji, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 16px', color: 'rgba(255,255,255,0.3)', fontSize: 13, fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.7 }}>{emoji}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

function SessionRow({ session: s }) {
  const statusKey = s.status || 'scheduled';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 13, background: 'linear-gradient(135deg, #e8526d, #c2185b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, flexShrink: 0, boxShadow: '0 4px 12px rgba(232,82,109,0.3)' }}>
          {(s.mentee_email || 'M')[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.1px' }}>{s.mentee_email}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.topic || s.session_type || 'Session'}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
        <StatusBadge status={statusKey} />
        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>{s.session_date ? new Date(s.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</div>
      </div>
    </div>
  );
}

function QuestionCard({ question: q, isOwned, onRespond }) {
  return (
    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: '#f1b610', fontWeight: 700, letterSpacing: '0.2px' }}>{q.category || 'General'}</span>
        <StatusBadge status={q.status === 'answered' ? 'answered' : 'pending'} />
      </div>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 10px', lineHeight: 1.55 }}>{q.question?.slice(0, 100)}{q.question?.length > 100 ? '…' : ''}</p>
      {q.status !== 'answered' && isOwned && (
        <button onClick={onRespond} style={{ padding: '7px 16px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #e8526d, #c2185b)', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 10px rgba(232,82,109,0.3)', letterSpacing: '0.2px' }}>
          ✍️ Respond
        </button>
      )}
      {q.status === 'answered' && isOwned && (
        <button onClick={onRespond} style={{ padding: '7px 16px', borderRadius: 12, border: '1px solid rgba(232,82,109,0.3)', background: 'rgba(232,82,109,0.06)', color: '#f48fb1', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.2px' }}>
          ✏️ Edit Response
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