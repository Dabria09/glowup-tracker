import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, Bookmark, ExternalLink, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

const SCHOLARSHIPS = [
  { id: 's1', category: 'Black Girls / Minority', title: 'Gates Millennium Scholars Program', org: 'Bill & Melinda Gates Foundation', desc: 'Covers full cost of attendance for outstanding minority students with financial need.', amount: 'Full tuition + expenses', grade: '12th', deadline: 'January', gpa: '3.3+', url: 'https://gmsp.org' },
  { id: 's2', category: 'Black Girls / Minority', title: 'UNCF Scholarships', org: 'United Negro College Fund', desc: 'Hundreds of scholarships for Black students across all fields of study.', amount: '$2,000 – $10,000+', grade: 'College', deadline: 'Varies', gpa: '2.5+', url: 'https://uncf.org' },
  { id: 's3', category: 'Black Girls / Minority', title: 'Ron Brown Scholar Program', org: 'Ron Brown Scholar Fund', desc: 'For academically talented, community-involved African American students.', amount: '$40,000 ($10K/year)', grade: '12th', deadline: 'January', gpa: '3.0+', url: 'https://ronbrown.org' },
  { id: 's4', category: 'HBCU', title: 'Thurgood Marshall College Fund', org: 'TMCF', desc: 'Supports students at Historically Black Colleges and Universities (HBCUs).', amount: 'Up to $10,000', grade: 'College', deadline: 'Varies', gpa: '3.0+', url: 'https://tmcf.org' },
  { id: 's5', category: 'Black Girls / Minority', title: 'Jackie Robinson Foundation Scholarship', org: 'Jackie Robinson Foundation', desc: 'For minority students with exceptional leadership potential and financial need.', amount: '$30,000 ($7,500/year)', grade: '12th', deadline: 'February', gpa: '3.0+', url: 'https://jackierobinson.org' },
  { id: 's6', category: 'Black Girls / Minority', title: 'National Achievement Scholarship', org: 'National Merit Scholarship Corporation', desc: 'For outstanding Black American students who take the PSAT/NMSQT.', amount: '$2,500+', grade: '11th', deadline: 'October (PSAT)', gpa: null, url: 'https://nationalmerit.org' },
  { id: 's7', category: 'Financial Need', title: 'Dell Scholars Program', org: 'Michael & Susan Dell Foundation', desc: 'For students who have overcome significant challenges and have financial need.', amount: '$20,000 + laptop + support', grade: '12th', deadline: 'December', gpa: '2.4+', url: 'https://dellscholars.org' },
  { id: 's8', category: 'Financial Need', title: 'QuestBridge National College Match', org: 'QuestBridge', desc: 'Links high-achieving, low-income students to full scholarships at top colleges.', amount: 'Full 4-year scholarship', grade: '12th', deadline: 'September', gpa: '3.5+', url: 'https://questbridge.org' },
  { id: 's9', category: 'Leadership', title: 'Coca-Cola Scholars Program', org: 'Coca-Cola Scholars Foundation', desc: 'For students who demonstrate leadership, service, and academic achievement.', amount: '$20,000', grade: '12th', deadline: 'October', gpa: '3.0+', url: 'https://coca-colascholarsfoundation.org' },
  { id: 's10', category: 'Leadership', title: 'Elks National Foundation Most Valuable Student', org: 'Elks National Foundation', desc: 'Based on scholarship, leadership, and financial need.', amount: '$4,000 – $50,000', grade: '12th', deadline: 'November', gpa: null, url: 'https://elks.org/scholars' },
  { id: 's11', category: 'General', title: 'AXA Achievement Scholarship', org: 'AXA Foundation', desc: 'For students who have demonstrated ambition and self-drive.', amount: '$2,000 – $25,000', grade: '12th', deadline: 'December', gpa: null, url: 'https://us.axa.com' },
  { id: 's12', category: 'STEM / Women', title: 'Society of Women Engineers Scholarship', org: 'SWE', desc: 'For women pursuing STEM degrees at accredited colleges and universities.', amount: '$1,000 – $15,000', grade: 'College', deadline: 'February', gpa: '3.0+', url: 'https://swe.org/scholarships' },
  { id: 's13', category: 'Local / Alabama', title: 'Community Foundation of Greater Birmingham', org: 'CFGB', desc: 'Multiple local scholarships for Birmingham-area students with community involvement.', amount: '$500 – $5,000', grade: '12th', deadline: 'February', gpa: '2.5+', url: 'https://foundationbirmingham.org' },
  { id: 's14', category: 'HBCU', title: 'Miles College Scholarships', org: 'Miles College (HBCU)', desc: 'Birmingham HBCU with multiple scholarships for Black students. Apply early!', amount: '$1,000 – Full tuition', grade: '12th', deadline: 'Rolling', gpa: '2.5+', url: 'https://miles.edu' },
  { id: 's15', category: 'HBCU', title: 'Stillman College Scholarships', org: 'Stillman College (HBCU)', desc: 'Tuscaloosa HBCU with strong financial aid packages for Black students.', amount: '$1,000 – Full tuition', grade: '12th', deadline: 'Rolling', gpa: '2.5+', url: 'https://stillman.edu' },
  { id: 's16', category: 'HBCU', title: 'Alabama A&M University Scholarships', org: 'Alabama A&M University (HBCU)', desc: 'Huntsville HBCU with excellent STEM programs and scholarship opportunities.', amount: '$1,000 – Full tuition', grade: '12th', deadline: 'Rolling', gpa: '2.5+', url: 'https://aamu.edu' },
  { id: 's17', category: 'Local / Alabama', title: 'Montgomery Area Community Foundation', org: 'Montgomery Area Community Foundation', desc: 'Multiple scholarships for Montgomery-area students with financial need and community involvement.', amount: '$500 – $3,000', grade: '12th', deadline: 'March', gpa: '2.5+', url: 'https://mgmfoundation.org' },
  { id: 's18', category: 'Local / Alabama', title: 'Alabama Power Foundation Scholarship', org: 'Alabama Power Foundation', desc: 'Statewide scholarship from Alabama Power for students pursuing STEM and business careers.', amount: '$2,000 – $5,000', grade: '12th', deadline: 'February', gpa: '3.0+', url: 'https://alabamapower.com/community/education' },
  { id: 's19', category: 'Local / Alabama', title: 'UAB Blazer Scholarship', org: 'University of Alabama at Birmingham', desc: 'UAB is right here in Birmingham! Multiple merit and need-based scholarships for incoming freshmen.', amount: '$2,000 – Full tuition', grade: '12th', deadline: 'December', gpa: '3.0+', url: 'https://uab.edu/admissions/scholarships' },
];

const FILTERS = ['All', 'Black Girls / Minority', 'HBCU', 'Financial Need', 'Leadership', 'General', 'STEM / Women', 'Local / Alabama'];

const BIG_SISTER_TIPS = [
  { emoji: '🔍', title: 'Start Early — Like, NOW', body: 'Junior year of high school is the sweet spot. Many scholarships open in September–October for the following year. Don\'t wait until senior spring!' },
  { emoji: '📋', title: 'Build Your "Brag Sheet"', body: 'Keep a running document of your GPA, activities, volunteer hours, awards, and jobs. You\'ll use this for EVERY application. Update it monthly.' },
  { emoji: '✍️', title: 'The Essay Is Everything', body: 'Most scholarships are won or lost on the essay. Be SPECIFIC. Tell a real story. Show growth. Generic essays = rejected applications.' },
  { emoji: '🎯', title: 'Apply Wide, Not Just to Big Names', body: 'Thousands of local, church, and small scholarships go UNCLAIMED every year because nobody applies. A $500 scholarship is still $500!' },
  { emoji: '📅', title: 'Track Every Deadline', body: 'Use the Tracker tab to log every scholarship you\'re applying for. Missing a deadline by one day means starting over next year.' },
  { emoji: '🔄', title: 'Recycle and Repurpose', body: 'Write a strong personal statement once, then adapt it. Build a "scholarship essay bank" of your best paragraphs. Work smarter, not harder.' },
  { emoji: '💌', title: 'Letters of Rec — Ask Early', body: 'Ask teachers, coaches, or mentors at least 6–8 weeks before your deadline. Give them your brag sheet. Follow up politely 2 weeks before.' },
  { emoji: '🏆', title: 'Apply Every Single Year', body: 'Most scholarships are renewable or repeat annually. College freshmen, sophomores, and juniors can still win big. Don\'t stop after high school!' },
];

const MAIN_TABS = ['Find', 'Tracker', 'Essays', 'Glow Wins'];
const STATUS_COLORS = {
  'Not Started': 'rgba(107,114,128,0.3)',
  'In Progress': 'rgba(234,179,8,0.3)',
  'Submitted': 'rgba(59,130,246,0.3)',
  'Won': 'rgba(34,197,94,0.3)',
  'Rejected': 'rgba(239,68,68,0.2)',
};

export default function Scholarships() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Find');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [guideOpen, setGuideOpen] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [showPersonalized, setShowPersonalized] = useState(false);
  const [user, setUser] = useState(null);

  // Tracker state
  const [trackerItems, setTrackerItems] = useState([]);
  const [showAddTracker, setShowAddTracker] = useState(false);
  const [newTracker, setNewTracker] = useState({ title: '', deadline: '', status: 'Not Started', amount: '' });

  // Essays state
  const [essays, setEssays] = useState([]);
  const [showAddEssay, setShowAddEssay] = useState(false);
  const [newEssay, setNewEssay] = useState({ prompt: '', content: '', scholarship: '' });

  // Wins state
  const [wins, setWins] = useState([]);
  const [showAddWin, setShowAddWin] = useState(false);
  const [newWin, setNewWin] = useState({ scholarship_name: '', amount: '', message: '' });
  const [submittingWin, setSubmittingWin] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const saved = JSON.parse(localStorage.getItem(`ggu_scholarships_saved_${u.email}`) || '[]');
      setSavedIds(saved);
      const tracker = JSON.parse(localStorage.getItem(`ggu_scholarship_tracker_${u.email}`) || '[]');
      setTrackerItems(tracker);
      const savedEssays = JSON.parse(localStorage.getItem(`ggu_scholarship_essays_${u.email}`) || '[]');
      setEssays(savedEssays);
      const winsList = await base44.entities.ScholarshipWin.list('-created_date');
      setWins(winsList);
    }).catch(() => {});
  }, []);

  const toggleSave = (id) => {
    const updated = savedIds.includes(id) ? savedIds.filter(s => s !== id) : [...savedIds, id];
    setSavedIds(updated);
    if (user) localStorage.setItem(`ggu_scholarships_saved_${user.email}`, JSON.stringify(updated));
    toast.success(savedIds.includes(id) ? 'Removed from saved' : 'Scholarship saved! 🔖');
  };

  const addTracker = () => {
    if (!newTracker.title) return;
    const updated = [...trackerItems, { ...newTracker, id: Date.now().toString() }];
    setTrackerItems(updated);
    if (user) localStorage.setItem(`ggu_scholarship_tracker_${user.email}`, JSON.stringify(updated));
    setNewTracker({ title: '', deadline: '', status: 'Not Started', amount: '' });
    setShowAddTracker(false);
    toast.success('Added to tracker! 📋');
  };

  const updateTrackerStatus = (id, status) => {
    const updated = trackerItems.map(t => t.id === id ? { ...t, status } : t);
    setTrackerItems(updated);
    if (user) localStorage.setItem(`ggu_scholarship_tracker_${user.email}`, JSON.stringify(updated));
  };

  const deleteTracker = (id) => {
    const updated = trackerItems.filter(t => t.id !== id);
    setTrackerItems(updated);
    if (user) localStorage.setItem(`ggu_scholarship_tracker_${user.email}`, JSON.stringify(updated));
  };

  const saveEssay = () => {
    if (!newEssay.prompt) return;
    const updated = [...essays, { ...newEssay, id: Date.now().toString(), date: new Date().toLocaleDateString() }];
    setEssays(updated);
    if (user) localStorage.setItem(`ggu_scholarship_essays_${user.email}`, JSON.stringify(updated));
    setNewEssay({ prompt: '', content: '', scholarship: '' });
    setShowAddEssay(false);
    toast.success('Essay saved! ✍️');
  };

  const deleteEssay = (id) => {
    const updated = essays.filter(e => e.id !== id);
    setEssays(updated);
    if (user) localStorage.setItem(`ggu_scholarship_essays_${user.email}`, JSON.stringify(updated));
  };

  const submitWin = async () => {
    if (!newWin.scholarship_name || !user) return;
    setSubmittingWin(true);
    const created = await base44.entities.ScholarshipWin.create({
      ...newWin,
      user_email: user.email,
      user_name: user.full_name || user.email.split('@')[0],
    });
    setWins(prev => [created, ...prev]);
    setNewWin({ scholarship_name: '', amount: '', message: '' });
    setShowAddWin(false);
    setSubmittingWin(false);
    toast.success("Win shared! You're inspiring everyone 🏆");
  };

  const filtered = SCHOLARSHIPS.filter(s => {
    const matchCat = filter === 'All' || s.category === filter;
    const matchSearch = !search.trim() || s.title.toLowerCase().includes(search.toLowerCase()) || s.org.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={22} /></button>
          <div>
            <h1 className="text-2xl font-bold text-white">Scholarship Hub 🎓</h1>
            <p className="text-xs text-gray-400">Your future is funded, girl 🌟</p>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none mb-5 pb-1">
          {MAIN_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition whitespace-nowrap"
              style={activeTab === tab
                ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)', color: '#fff', boxShadow: '0 4px 15px rgba(236,72,153,0.3)' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
              {tab === 'Find' ? '🔍' : tab === 'Tracker' ? '✅' : tab === 'Essays' ? '📝' : '👑'} {tab}
            </button>
          ))}
        </div>

        {/* ── FIND TAB ── */}
        {activeTab === 'Find' && (
          <div className="space-y-4">
            <button onClick={() => setShowPersonalized(!showPersonalized)}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left"
              style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.5), rgba(236,72,153,0.35))', border: '1px solid rgba(168,85,247,0.4)' }}>
              <span className="text-3xl">✨</span>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">Get Personalized Matches</p>
                <p className="text-xs text-gray-300">Tell us about yourself → see scholarships made for YOU</p>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>

            {showPersonalized && (
              <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(30,10,50,0.95)', border: '1px solid rgba(168,85,247,0.4)' }}>
                <p className="text-sm font-bold text-purple-300">Tell us about yourself</p>
                {[
                  { label: 'Grade Level', options: ['9th', '10th', '11th', '12th', 'College Freshman', 'College Sophomore', 'College Junior', 'College Senior'] },
                  { label: 'GPA Range', options: ['4.0+', '3.5–3.9', '3.0–3.4', '2.5–2.9', 'Below 2.5'] },
                  { label: 'Interest Area', options: ['STEM', 'Business', 'Arts & Humanities', 'Social Work', 'Healthcare', 'Education', 'Law', 'General'] },
                ].map(field => (
                  <div key={field.label}>
                    <p className="text-xs text-gray-400 mb-1">{field.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {field.options.map(opt => (
                        <button key={opt} className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#d1d5db' }}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={() => { toast.success('Showing matches for you! ✨'); setShowPersonalized(false); }}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                  Show My Matches ✨
                </button>
              </div>
            )}

            <div className="relative">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search scholarships..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap"
                  style={filter === f
                    ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#9ca3af' }}>
                  {f}
                </button>
              ))}
            </div>

            <button onClick={() => setGuideOpen(!guideOpen)}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-left"
              style={{ background: 'rgba(50,15,80,0.7)', border: '1px solid rgba(168,85,247,0.25)' }}>
              <span className="text-2xl">🦁</span>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">Big Sister Scholarship Guide</p>
                <p className="text-xs text-gray-400">Real talk on how to find, apply, and WIN scholarships</p>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${guideOpen ? 'rotate-180' : ''}`} />
            </button>

            {guideOpen && (
              <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(30,10,50,0.95)', border: '1px solid rgba(168,85,247,0.3)' }}>
                {BIG_SISTER_TIPS.map((tip, i) => (
                  <div key={i} className="flex gap-3 pb-3" style={{ borderBottom: i < BIG_SISTER_TIPS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <span className="text-xl flex-shrink-0">{tip.emoji}</span>
                    <div>
                      <p className="text-sm font-bold text-white mb-0.5">{tip.title}</p>
                      <p className="text-xs text-gray-300 leading-relaxed">{tip.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500">{filtered.length} scholarship{filtered.length !== 1 ? 's' : ''} found</p>

            <div className="space-y-4">
              {filtered.map(s => (
                <div key={s.id} className="rounded-2xl p-4" style={{ background: 'rgba(20,8,40,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <span className="inline-flex items-center gap-1 text-xs font-bold mb-2" style={{ color: '#fbbf24' }}>
                        👑 {s.category}
                      </span>
                      <h3 className="text-base font-bold text-white leading-snug">{s.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{s.org}</p>
                    </div>
                    <div className="flex gap-2 ml-2 flex-shrink-0">
                      <button onClick={() => toggleSave(s.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: savedIds.includes(s.id) ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <Bookmark size={14} className={savedIds.includes(s.id) ? 'fill-purple-400 text-purple-400' : 'text-gray-400'} />
                      </button>
                      <a href={s.url} target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <ExternalLink size={14} className="text-gray-400" />
                      </a>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-3">{s.desc}</p>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(234,179,8,0.15)' }}>
                      <p className="text-xs font-bold text-yellow-300">{s.amount}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Amount</p>
                    </div>
                    <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(59,130,246,0.12)' }}>
                      <p className="text-xs font-bold text-blue-300">{s.grade}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Grade</p>
                    </div>
                    <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(168,85,247,0.12)' }}>
                      <p className="text-xs font-bold text-purple-300">{s.deadline}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Deadline</p>
                    </div>
                  </div>
                  {s.gpa && <p className="text-xs text-gray-500">Min GPA: <span className="font-semibold text-gray-300">{s.gpa}</span></p>}
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-4" style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)' }}>
              <p className="text-sm text-yellow-200 leading-relaxed">
                💡 <span className="font-bold">Pro tip:</span> Apply to at least 10 scholarships every year. Free money doesn't run out — you just have to find it!
              </p>
            </div>
          </div>
        )}

        {/* ── TRACKER TAB ── */}
        {activeTab === 'Tracker' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">📋 Application Tracker</h2>
                <p className="text-xs text-gray-400">Track every scholarship you're applying to</p>
              </div>
              <button onClick={() => setShowAddTracker(true)}
                className="px-4 py-2 rounded-full text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                + Add
              </button>
            </div>

            {showAddTracker && (
              <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(30,10,50,0.95)', border: '1px solid rgba(168,85,247,0.4)' }}>
                <p className="text-sm font-bold text-purple-300">Add Scholarship</p>
                <input value={newTracker.title} onChange={e => setNewTracker({ ...newTracker, title: e.target.value })}
                  placeholder="Scholarship name *" className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                <input value={newTracker.amount} onChange={e => setNewTracker({ ...newTracker, amount: e.target.value })}
                  placeholder="Award amount" className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                <input type="date" value={newTracker.deadline} onChange={e => setNewTracker({ ...newTracker, deadline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', colorScheme: 'dark' }} />
                <div className="flex gap-2">
                  <button onClick={addTracker} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>Save</button>
                  <button onClick={() => setShowAddTracker(false)} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>Cancel</button>
                </div>
              </div>
            )}

            {trackerItems.length === 0 ? (
              <div className="text-center py-14 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-4xl mb-3">📋</p>
                <p className="text-gray-400 text-sm">No scholarships tracked yet</p>
                <p className="text-gray-500 text-xs mt-1">Tap + Add to start tracking your applications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trackerItems.map(item => (
                  <div key={item.id} className="rounded-2xl p-4" style={{ background: 'rgba(20,8,40,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm">{item.title}</p>
                        {item.amount && <p className="text-xs text-yellow-300 mt-0.5">{item.amount}</p>}
                        {item.deadline && <p className="text-xs text-gray-500 mt-0.5">Due: {new Date(item.deadline).toLocaleDateString()}</p>}
                      </div>
                      <button onClick={() => deleteTracker(item.id)} className="text-gray-600 text-lg ml-2">×</button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {Object.keys(STATUS_COLORS).map(status => (
                        <button key={status} onClick={() => updateTrackerStatus(item.id, status)}
                          className="px-3 py-1 rounded-full text-xs font-semibold transition"
                          style={{ background: item.status === status ? STATUS_COLORS[status] : 'rgba(255,255,255,0.05)', border: `1px solid ${item.status === status ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`, color: item.status === status ? '#fff' : '#6b7280' }}>
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ESSAYS TAB ── */}
        {activeTab === 'Essays' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">✍️ Essay Bank</h2>
                <p className="text-xs text-gray-400">Save and reuse your best scholarship essays</p>
              </div>
              <button onClick={() => setShowAddEssay(true)}
                className="px-4 py-2 rounded-full text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                + Add
              </button>
            </div>

            <div className="rounded-2xl p-4" style={{ background: 'rgba(109,40,217,0.15)', border: '1px solid rgba(168,85,247,0.25)' }}>
              <p className="text-xs font-bold text-purple-300 mb-1">💡 Big Sister Tip</p>
              <p className="text-xs text-gray-300 leading-relaxed">Write one strong personal statement, then adapt it for each scholarship. Save your best essays here so you can recycle and repurpose them!</p>
            </div>

            {showAddEssay && (
              <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(30,10,50,0.95)', border: '1px solid rgba(168,85,247,0.4)' }}>
                <p className="text-sm font-bold text-purple-300">Save Essay</p>
                <input value={newEssay.scholarship} onChange={e => setNewEssay({ ...newEssay, scholarship: e.target.value })}
                  placeholder="Scholarship name" className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                <input value={newEssay.prompt} onChange={e => setNewEssay({ ...newEssay, prompt: e.target.value })}
                  placeholder="Essay prompt *" className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                <textarea value={newEssay.content} onChange={e => setNewEssay({ ...newEssay, content: e.target.value })}
                  placeholder="Paste your essay here..." rows={5}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                <div className="flex gap-2">
                  <button onClick={saveEssay} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>Save Essay</button>
                  <button onClick={() => setShowAddEssay(false)} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>Cancel</button>
                </div>
              </div>
            )}

            {essays.length === 0 ? (
              <div className="text-center py-14 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-4xl mb-3">✍️</p>
                <p className="text-gray-400 text-sm">No essays saved yet</p>
                <p className="text-gray-500 text-xs mt-1">Save your best essays to reuse them later</p>
              </div>
            ) : (
              <div className="space-y-3">
                {essays.map(essay => (
                  <div key={essay.id} className="rounded-2xl p-4" style={{ background: 'rgba(20,8,40,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        {essay.scholarship && <p className="text-xs text-purple-400 font-semibold mb-0.5">{essay.scholarship}</p>}
                        <p className="text-sm font-bold text-white">{essay.prompt}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{essay.date}</p>
                      </div>
                      <button onClick={() => deleteEssay(essay.id)} className="text-gray-600 text-lg ml-2">×</button>
                    </div>
                    {essay.content && <p className="text-xs text-gray-400 mt-2 leading-relaxed line-clamp-3">{essay.content}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── GLOW WINS TAB ── */}
        {activeTab === 'Glow Wins' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5 text-center" style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(234,179,8,0.3)' }}>
              <p className="text-4xl mb-2">👑</p>
              <h2 className="text-xl font-bold text-white mb-1">Glow Wins Wall</h2>
              <p className="text-sm text-gray-300 mb-4">Celebrate every scholarship won by the GGU community!</p>
              <button onClick={() => setShowAddWin(true)}
                className="px-8 py-3 rounded-full text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                Share My Win 🎉
              </button>
            </div>

            {wins.length === 0 ? (
              <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-4xl mb-3">🏆</p>
                <p className="text-gray-400 text-sm">No wins shared yet</p>
                <p className="text-gray-500 text-xs mt-1">Be the first to inspire the community!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {wins.map(win => (
                  <div key={win.id} className="rounded-2xl p-4" style={{ background: 'rgba(20,8,40,0.8)', border: '1px solid rgba(234,179,8,0.25)' }}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🏆</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">{win.scholarship_name}</p>
                        {win.amount && <p className="text-xs font-semibold text-yellow-300 mt-0.5">{win.amount}</p>}
                        {win.message && <p className="text-xs text-gray-300 mt-1 leading-relaxed">"{win.message}"</p>}
                        <p className="text-xs text-gray-500 mt-1">— {win.user_name || 'Anonymous'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Share Win Modal */}
            {showAddWin && (
              <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowAddWin(false)}>
                <div className="w-full rounded-t-3xl p-6 space-y-3" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
                  <p className="text-lg font-bold text-white">🏆 Share Your Win!</p>
                  <input value={newWin.scholarship_name} onChange={e => setNewWin({ ...newWin, scholarship_name: e.target.value })}
                    placeholder="Scholarship name *" className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                  <input value={newWin.amount} onChange={e => setNewWin({ ...newWin, amount: e.target.value })}
                    placeholder="Award amount (e.g. $5,000)" className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                  <textarea value={newWin.message} onChange={e => setNewWin({ ...newWin, message: e.target.value })}
                    placeholder="Say something to inspire the community..." rows={3}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none resize-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
                  <div className="flex gap-2">
                    <button onClick={submitWin} disabled={!newWin.scholarship_name || submittingWin}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                      {submittingWin ? 'Sharing...' : 'Share My Win 🎉'}
                    </button>
                    <button onClick={() => setShowAddWin(false)} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400"
                      style={{ background: 'rgba(255,255,255,0.05)' }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
      <BottomNav active="discover" />
    </div>
  );
}