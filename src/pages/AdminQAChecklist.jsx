import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, CheckCircle, AlertCircle, XCircle, Wrench, RefreshCw } from 'lucide-react';

const STATUS = {
  working:  { label: 'Working',      icon: CheckCircle,   color: '#22c55e', bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)' },
  partial:  { label: 'Partial',      icon: AlertCircle,   color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.3)' },
  broken:   { label: 'Broken',       icon: XCircle,       color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)' },
  fixing:   { label: 'In Progress',  icon: Wrench,        color: '#a855f7', bg: 'rgba(168,85,247,0.15)',  border: 'rgba(168,85,247,0.3)' },
};

const INITIAL_MODULES = [
  { section: 'Core App',        name: 'Home / Landing',          status: 'working',  note: 'Loads correctly' },
  { section: 'Core App',        name: 'Dashboard',               status: 'working',  note: 'Points, daily tasks showing' },
  { section: 'Core App',        name: 'Me / Profile',            status: 'working',  note: 'Profile editing works' },
  { section: 'Core App',        name: 'Onboarding Flow',         status: 'working',  note: 'Age group, username, TOS' },
  { section: 'Core App',        name: 'Avatar Builder',          status: 'partial',  note: 'Basic works; advanced skins TBD' },
  { section: 'Core App',        name: 'Glow Persona',            status: 'partial',  note: 'UI shows; persona save needs QA' },

  { section: 'Connect',         name: 'Glow Feed',               status: 'working',  note: 'Posts, reactions showing' },
  { section: 'Connect',         name: 'Glow Board',              status: 'partial',  note: 'Photo board works; reactions TBD' },
  { section: 'Connect',         name: 'Shout Outs',              status: 'working',  note: 'Media upload added' },
  { section: 'Connect',         name: 'Glow Teams',              status: 'partial',  note: 'Back nav fixed; discussions fixed' },
  { section: 'Connect',         name: 'Glow Squads',             status: 'partial',  note: 'Chat works; squad posts TBD' },
  { section: 'Connect',         name: 'Team Contests',           status: 'working',  note: 'Contribution logging works' },
  { section: 'Connect',         name: 'Community Hub',           status: 'partial',  note: 'Media upload added; chat/feed separated' },
  { section: 'Connect',         name: 'Notifications',           status: 'partial',  note: 'Prefs added; push TBD' },
  { section: 'Connect',         name: 'Leaderboard',             status: 'working',  note: 'Points-based ranking works' },
  { section: 'Connect',         name: 'My Glow Link',            status: 'working',  note: 'Public profile works' },
  { section: 'Connect',         name: 'Glow Talk',               status: 'partial',  note: 'Basic chat; needs QA' },

  { section: 'Glow (Wellness)', name: 'Daily Check-in',          status: 'working',  note: 'Points awarded on check-in' },
  { section: 'Glow (Wellness)', name: 'Daily Challenges',        status: 'working',  note: 'Tasks load and complete' },
  { section: 'Glow (Wellness)', name: 'Glow Up Challenges',      status: 'working',  note: '30-day challenge detail works' },
  { section: 'Glow (Wellness)', name: 'Diary',                   status: 'working',  note: 'Entries save with mood' },
  { section: 'Glow (Wellness)', name: 'Vision Board',            status: 'working',  note: 'Drag-drop, themes, export' },
  { section: 'Glow (Wellness)', name: 'Spiritual Glow',          status: 'working',  note: 'Habits and reflections' },
  { section: 'Glow (Wellness)', name: 'Cycle Tracker',           status: 'working',  note: 'Logs save correctly' },
  { section: 'Glow (Wellness)', name: 'Fitness Tracker',         status: 'working',  note: 'Workout logs work' },
  { section: 'Glow (Wellness)', name: 'Wellness Hub',            status: 'partial',  note: 'Content shows; integration TBD' },
  { section: 'Glow (Wellness)', name: 'Glow Score',              status: 'working',  note: 'Points + level display' },
  { section: 'Glow (Wellness)', name: 'Shout Outs (reactions)',  status: 'working',  note: 'Likes work in real-time' },

  { section: 'Discover',        name: 'Discover Page',           status: 'working',  note: 'Navigation hub works' },
  { section: 'Discover',        name: 'GGU Academy',             status: 'partial',  note: 'Courses show; quizzes need QA' },
  { section: 'Discover',        name: 'Curriculum',              status: 'partial',  note: 'Lessons display; progress TBD' },
  { section: 'Discover',        name: 'Scholarships',            status: 'working',  note: 'Search and save work' },
  { section: 'Discover',        name: 'Career Exploration',      status: 'working',  note: 'Cards, quiz, resume builder' },
  { section: 'Discover',        name: 'Mentorship',              status: 'partial',  note: 'Directory works; booking needs QA' },
  { section: 'Discover',        name: 'Growth Mindset',          status: 'partial',  note: 'Content shows; streak TBD' },
  { section: 'Discover',        name: 'Girls Library',           status: 'working',  note: 'Resources and quiz work' },
  { section: 'Discover',        name: 'Audio Library',           status: 'partial',  note: 'UI works; uploads TBD' },
  { section: 'Discover',        name: 'Daily Quotes',            status: 'working',  note: 'Random quote works' },
  { section: 'Discover',        name: 'Glow Tips',               status: 'working',  note: 'Tips load from admin entries' },
  { section: 'Discover',        name: 'Weekly Theme',            status: 'working',  note: 'Theme displays correctly' },
  { section: 'Discover',        name: 'Glow Playlist',           status: 'partial',  note: 'UI shows; music links TBD' },
  { section: 'Discover',        name: 'Book Club',               status: 'partial',  note: 'Nominations work; voting TBD' },

  { section: 'Life Tools',      name: 'Glow Kitchen',            status: 'working',  note: 'Recipes and posts work' },
  { section: 'Life Tools',      name: 'Meal Planner',            status: 'working',  note: 'Weekly plan saves' },
  { section: 'Life Tools',      name: 'Money Tracker',           status: 'working',  note: 'Income/expense logs work' },
  { section: 'Life Tools',      name: 'Savings Goals',           status: 'working',  note: 'Goals create and track' },
  { section: 'Life Tools',      name: 'Homework Tracker',        status: 'working',  note: 'Tasks and deadlines work' },
  { section: 'Life Tools',      name: 'Time Management',         status: 'working',  note: 'Schedule saves' },
  { section: 'Life Tools',      name: 'Trip Planner',            status: 'working',  note: 'Trips with details work' },
  { section: 'Life Tools',      name: 'Countdown',               status: 'working',  note: 'Events countdown correctly' },
  { section: 'Life Tools',      name: 'Sticky Notes',            status: 'working',  note: 'CRUD and drag works' },
  { section: 'Life Tools',      name: 'My Calendar',             status: 'working',  note: 'Events display and add' },
  { section: 'Life Tools',      name: 'Cleaning Calendar',       status: 'working',  note: 'Task rotation works' },
  { section: 'Life Tools',      name: 'Birthday Planner',        status: 'working',  note: 'Event detail view works' },
  { section: 'Life Tools',      name: 'Grocery List',            status: 'working',  note: 'List management works' },
  { section: 'Life Tools',      name: 'Password Vault',          status: 'working',  note: 'Encrypted notes save' },
  { section: 'Life Tools',      name: 'Important Contacts',      status: 'working',  note: 'Contacts save and display' },

  { section: 'Admin',           name: 'Admin Panel',             status: 'working',  note: 'All admin tabs accessible' },
  { section: 'Admin',           name: 'Admin Logs',              status: 'working',  note: 'Action logs display' },
  { section: 'Admin',           name: 'Points Settings',         status: 'working',  note: 'Points config saves' },
  { section: 'Admin',           name: 'Manage Mentor Apps',      status: 'working',  note: 'Admin-only, confirmed' },
  { section: 'Admin',           name: 'Manage Teen Apps',        status: 'working',  note: 'Admin-only, confirmed' },
  { section: 'Admin',           name: 'Parent Dashboard',        status: 'partial',  note: 'Parental consent flow TBD' },
  { section: 'Admin',           name: 'Support Tickets',         status: 'working',  note: 'Tickets visible to admin' },
  { section: 'Admin',           name: 'Join Codes',              status: 'working',  note: 'Code creation works' },
  { section: 'Admin',           name: 'Banned Words',            status: 'working',  note: 'Filter list saves' },
  { section: 'Admin',           name: 'User Management',         status: 'partial',  note: 'View/ban works; bulk actions TBD' },
];

const SECTIONS = [...new Set(INITIAL_MODULES.map(m => m.section))];

export default function AdminQAChecklist() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [modules, setModules] = useState(() => {
    try {
      const saved = localStorage.getItem('ggu_qa_modules');
      return saved ? JSON.parse(saved) : INITIAL_MODULES;
    } catch { return INITIAL_MODULES; }
  });
  const [activeSection, setActiveSection] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u.role !== 'admin') { navigate('/dashboard'); return; }
      setUser(u);
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const updateStatus = (idx, status) => {
    const updated = modules.map((m, i) => i === idx ? { ...m, status } : m);
    setModules(updated);
    localStorage.setItem('ggu_qa_modules', JSON.stringify(updated));
  };

  const updateNote = (idx, note) => {
    const updated = modules.map((m, i) => i === idx ? { ...m, note } : m);
    setModules(updated);
    localStorage.setItem('ggu_qa_modules', JSON.stringify(updated));
  };

  const resetToDefault = () => {
    if (!confirm('Reset all statuses to default?')) return;
    setModules(INITIAL_MODULES);
    localStorage.removeItem('ggu_qa_modules');
  };

  const filtered = activeSection === 'All' ? modules : modules.filter(m => m.section === activeSection);

  const counts = {
    working: modules.filter(m => m.status === 'working').length,
    partial: modules.filter(m => m.status === 'partial').length,
    broken: modules.filter(m => m.status === 'broken').length,
    fixing: modules.filter(m => m.status === 'fixing').length,
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-28 relative" style={{ backgroundColor: '#080810' }}>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute rounded-full" style={{ width: 400, height: 400, top: -100, left: -80, background: 'radial-gradient(circle,rgba(236,72,153,0.12),transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(8,8,16,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-bold text-white">🔧 GGU QA Checklist</h1>
            <p className="text-[10px] text-gray-500">Admin only · Tap to update status</p>
          </div>
        </div>
        <button onClick={resetToDefault} className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
          <RefreshCw size={12} /> Reset
        </button>
      </div>

      <div className="relative z-10 px-4 pt-4">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {Object.entries(counts).map(([key, count]) => {
            const s = STATUS[key];
            const Icon = s.icon;
            return (
              <div key={key} className="rounded-2xl p-3 text-center" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <Icon size={18} className="mx-auto mb-1" style={{ color: s.color }} />
                <p className="font-bold text-white text-lg leading-none">{count}</p>
                <p className="text-[9px] mt-0.5" style={{ color: s.color }}>{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Overall Progress</span>
            <span>{Math.round((counts.working / modules.length) * 100)}% Working</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(counts.working / modules.length) * 100}%`, background: 'linear-gradient(90deg,#22c55e,#4ade80)' }} />
          </div>
        </div>

        {/* Section filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {['All', ...SECTIONS].map(s => (
            <button key={s} onClick={() => setActiveSection(s)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition"
              style={activeSection === s
                ? { background: 'linear-gradient(135deg,#ec4899,#a855f7)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.07)', color: '#9ca3af' }}>
              {s}
            </button>
          ))}
        </div>

        {/* Module list */}
        <div className="space-y-2">
          {filtered.map((mod, i) => {
            const realIdx = modules.indexOf(mod);
            const s = STATUS[mod.status];
            const Icon = s.icon;
            return (
              <div key={realIdx} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${s.border}` }}>
                <div className="flex items-start gap-3">
                  <Icon size={18} className="flex-shrink-0 mt-0.5" style={{ color: s.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-white truncate">{mod.name}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: s.bg, color: s.color }}>
                        {mod.section}
                      </span>
                    </div>
                    <input
                      value={mod.note}
                      onChange={e => updateNote(realIdx, e.target.value)}
                      className="w-full text-xs bg-transparent text-gray-400 outline-none border-b border-transparent focus:border-white/20 transition"
                      placeholder="Add note..."
                    />
                    {/* Status buttons */}
                    <div className="flex gap-1.5 mt-2">
                      {Object.entries(STATUS).map(([key, val]) => (
                        <button key={key} onClick={() => updateStatus(realIdx, key)}
                          className="text-[10px] px-2 py-0.5 rounded-full font-semibold transition"
                          style={{
                            background: mod.status === key ? val.bg : 'rgba(255,255,255,0.05)',
                            color: mod.status === key ? val.color : '#6b7280',
                            border: `1px solid ${mod.status === key ? val.border : 'transparent'}`,
                          }}>
                          {val.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav active="me" />
    </div>
  );
}