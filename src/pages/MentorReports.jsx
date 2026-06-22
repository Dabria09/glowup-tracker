import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  ArrowLeft, Users, MessageCircle, Star, Calendar, TrendingUp, Award, Sparkles, Activity,
} from 'lucide-react';
import MentorBottomNav from '@/components/mentorship/MentorBottomNav';

const parseArr = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
};

export default function MentorReports() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [sess, qs] = await Promise.all([
          base44.entities.MentorSession.filter({ mentor_email: u.email }),
          base44.entities.AnonymousQuestion.list('-created_date', 200),
        ]);
        setSessions(sess);
        setQuestions(qs);
      } catch {
        base44.auth.redirectToLogin();
      }
      setLoading(false);
    };
    load();
  }, []);

  // ── Compute metrics ────────────────────────────────────────────────────
  const myAnsweredQuestions = questions.filter((q) => {
    const responses = parseArr(q.mentor_responses);
    return responses.some((r) => r && r.mentor_email === user?.email);
  });

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const uniqueMentees = new Set(completedSessions.map((s) => s.mentee_email).filter(Boolean));
  const ratings = completedSessions.map((s) => s.rating).filter((r) => r && r > 0);
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—';

  // This month's activity
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sessionsThisMonth = completedSessions.filter((s) => s.session_date && new Date(s.session_date) >= monthStart).length;
  const questionsThisMonth = myAnsweredQuestions.filter((q) => {
    const responses = parseArr(q.mentor_responses);
    const myResp = responses.find((r) => r && r.mentor_email === user?.email);
    const dateStr = myResp?.answered_date || q.answered_date;
    return dateStr && new Date(dateStr) >= monthStart;
  }).length;

  // ── Daily trend (last 30 days) ──────────────────────────────────────────
  const days = [];
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // Track unique mentees seen up to each day (cumulative growth)
  const menteesSeen = new Set();

  for (let i = 0; i < 30; i++) {
    const day = new Date(thirtyDaysAgo);
    day.setDate(thirtyDaysAgo.getDate() + i);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    const daySessions = completedSessions.filter((s) => {
      if (!s.session_date) return false;
      const d = new Date(s.session_date);
      return d >= dayStart && d <= dayEnd;
    }).length;

    const dayQuestions = myAnsweredQuestions.filter((q) => {
      const responses = parseArr(q.mentor_responses);
      const myResp = responses.find((r) => r && r.mentor_email === user?.email);
      const dateStr = myResp?.answered_date || q.answered_date;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= dayStart && d <= dayEnd;
    }).length;

    // Add any mentees from sessions on or before this day
    completedSessions.forEach((s) => {
      if (s.mentee_email && s.session_date) {
        const d = new Date(s.session_date);
        if (d <= dayEnd) menteesSeen.add(s.mentee_email);
      }
    });

    days.push({
      label: `${day.getMonth() + 1}/${day.getDate()}`,
      Sessions: daySessions,
      Answers: dayQuestions,
      Mentees: menteesSeen.size,
    });
  }

  // ── Category breakdown ──────────────────────────────────────────────────
  const categoryMap = {};
  myAnsweredQuestions.forEach((q) => {
    const cat = q.category || 'General';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const maxCat = categories.length ? Math.max(...categories.map((c) => c[1])) : 1;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#07050e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontSize: 28, fontWeight: 900, background: 'linear-gradient(135deg, #e8526d, #f1b610)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Girls Glowing Up™</div>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(232,82,109,0.2)', borderTop: '3px solid #e8526d', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading your reports...</p>
      </div>
    );
  }

  const stats = [
    { label: 'Mentees Helped', value: uniqueMentees.size, icon: <Users size={16} />, accent: '#e8526d', sub: 'unique via sessions' },
    { label: 'Sessions Done', value: completedSessions.length, icon: <Calendar size={16} />, accent: '#a855f7', sub: `${sessionsThisMonth} this month` },
    { label: 'Questions Answered', value: myAnsweredQuestions.length, icon: <MessageCircle size={16} />, accent: '#f1b610', sub: `${questionsThisMonth} this month` },
    { label: 'Avg Rating', value: avgRating, icon: <Star size={16} />, accent: '#34d399', sub: `${ratings.length} reviews` },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#07050e', fontFamily: 'Outfit, sans-serif', color: '#fff', paddingBottom: 90, overflowX: 'hidden' }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, top: -150, left: -120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,82,109,0.18), transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', width: 350, height: 350, bottom: '20%', right: -80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* Header */}
      <div style={{ background: 'rgba(7,5,14,0.95)', borderBottom: '1px solid rgba(232,82,109,0.12)', backdropFilter: 'blur(24px)', position: 'sticky', top: 0, zIndex: 50, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('/mentor-dashboard')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} color="#fff" />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.2px' }}>Impact Reports</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>Your mentorship activity & trends</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: 'linear-gradient(135deg, rgba(232,82,109,0.15), rgba(241,182,16,0.1))', border: '1px solid rgba(232,82,109,0.25)' }}>
          <TrendingUp size={13} color="#f1b610" />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#f1b610' }}>Last 30 Days</span>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px 0', position: 'relative', zIndex: 1 }}>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 18, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${s.accent}, transparent)` }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${s.accent}18`, border: `1px solid ${s.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: s.accent }}>{s.icon}</span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.5px' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Daily Activity Line Graph (last 30 days) ── */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <Activity size={14} color="#e8526d" />
            <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Daily Activity · Last 30 Days</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={days} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Outfit' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval={4} />
              <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ background: 'rgba(15,8,20,0.95)', border: '1px solid rgba(232,82,109,0.3)', borderRadius: 12, fontFamily: 'Outfit', fontSize: 12 }}
                labelStyle={{ color: '#fff', fontWeight: 700 }}
                itemStyle={{ color: 'rgba(255,255,255,0.8)' }}
                cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Outfit', paddingTop: 8 }} iconType="circle" />
              <Line type="monotone" dataKey="Sessions" stroke="#e8526d" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#e8526d' }} />
              <Line type="monotone" dataKey="Answers" stroke="#f1b610" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#f1b610' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ── Mentee Growth Line Graph (cumulative, last 30 days) ── */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <Users size={14} color="#a855f7" />
            <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Mentee Count · Cumulative Growth</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={days} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Outfit' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval={4} />
              <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ background: 'rgba(15,8,20,0.95)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 12, fontFamily: 'Outfit', fontSize: 12 }}
                labelStyle={{ color: '#fff', fontWeight: 700 }}
                itemStyle={{ color: 'rgba(255,255,255,0.8)' }}
                cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }}
              />
              <Line type="monotone" dataKey="Mentees" stroke="#a855f7" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#a855f7' }} />
            </LineChart>
          </ResponsiveContainer>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 12, textAlign: 'center' }}>
            Tracks unique mentees you've helped through completed sessions over the last 30 days.
          </p>
        </div>

        {/* ── Category Breakdown ── */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Award size={14} color="#f1b610" />
            <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Questions by Category</span>
          </div>
          {categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
              No answered questions yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {categories.map(([cat, count]) => (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{cat}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#f1b610' }}>{count}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, #e8526d, #f1b610)', width: `${(count / maxCat) * 100}%`, transition: 'width 0.4s' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Insight Summary ── */}
        <div style={{ background: 'linear-gradient(135deg, rgba(232,82,109,0.1), rgba(168,85,247,0.07))', border: '1px solid rgba(232,82,109,0.2)', borderRadius: 20, padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 16 }}>💜</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Your Impact This Month</span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
            You've completed <strong style={{ color: '#e8526d' }}>{sessionsThisMonth} sessions</strong> and answered <strong style={{ color: '#f1b610' }}>{questionsThisMonth} questions</strong> this month.
            {uniqueMentees.size > 0 && <> You've personally helped <strong style={{ color: '#a855f7' }}>{uniqueMentees.size} unique mentee{uniqueMentees.size > 1 ? 's' : ''}</strong> through sessions.</>}
            {avgRating !== '—' && <> Your average rating is <strong style={{ color: '#34d399' }}>{avgRating} ★</strong>.</>} Keep glowing! ✨
          </p>
        </div>

      </div>

      <MentorBottomNav active="dashboard" />
    </div>
  );
}