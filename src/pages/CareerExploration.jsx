import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Briefcase, Target, Sparkles, ChevronRight, X, Search, Bookmark, BookmarkCheck } from 'lucide-react';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import CareerQuiz from '@/components/career/CareerQuiz';
import ResumeBuilder from '@/components/career/ResumeBuilder';
import CareerDetail from '@/components/career/CareerDetail';
import { CAREERS, CATEGORIES, EXPERIENCE_LEVELS, CATEGORY_COLORS, EXP_COLORS } from '@/components/career/careerData';

const REAL_WOMEN = [
  { name: 'Kizzmekia Corbett', emoji: '🔬', title: 'Vaccine Scientist', field: 'Science', quote: "Science is not just for certain kinds of people. I want to show young Black girls that they belong in the lab.", fact: "Led development of the Moderna COVID-19 vaccine at the NIH." },
  { name: 'Arlan Hamilton', emoji: '💼', title: 'Venture Capitalist', field: 'Business', quote: "I built a venture capital fund while homeless. The obstacles you face are real, but not the end of your story.", fact: 'Founded Backstage Capital, invested in over 200 companies led by underrepresented founders.' },
  { name: 'Issa Rae', emoji: '🎭', title: 'Actress, Writer & Producer', field: 'Creative & Media', quote: "I'm rooting for everybody Black. Create your own lane.", fact: 'Created, wrote, and starred in Insecure on HBO. Built a media empire through her production company.' },
  { name: 'Lisa Price', emoji: '🌹', title: 'Beauty Brand Founder', field: 'Beauty & Wellness', quote: "I started mixing products in my kitchen with $100. You don't need permission to start.", fact: "Founded Carol's Daughter in her kitchen in 1993. Sold to L'Oreal in 2014 for millions." },
  { name: 'Kimberly Bryant', emoji: '💻', title: 'Tech Founder & Engineer', field: 'Technology', quote: "Black girls belong in tech — not just as users, but as the ones building the future.", fact: 'Founded Black Girls CODE, reaching over 30,000 girls of color in technology education.' },
];

export default function CareerExploration() {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState('explore');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLevel, setActiveLevel] = useState('All Levels');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showRealWomen, setShowRealWomen] = useState(false);
  const [user, setUser] = useState(null);
  const [savedCareerIds, setSavedCareerIds] = useState([]);

  useEffect(() => {
    // Track page view
    base44.analytics.track({ eventName: 'page_view', properties: { page: 'Careers', path: '/careers' } });
    
    base44.auth.me().then(u => {
      setUser(u);
      const saved = JSON.parse(localStorage.getItem(`glu_careers_saved_${u.email}`) || '[]');
      setSavedCareerIds(saved);
    }).catch(() => {});
  }, []);

  const toggleSave = (career, e) => {
    if (e) e.stopPropagation();
    if (!user) return;
    const isSaved = savedCareerIds.includes(career.id);
    const updated = isSaved ? savedCareerIds.filter(id => id !== career.id) : [...savedCareerIds, career.id];
    setSavedCareerIds(updated);
    localStorage.setItem(`ggu_careers_saved_${user.email}`, JSON.stringify(updated));
  };

  const filtered = CAREERS.filter(c => {
    const matchesCat = activeCategory === 'All' || c.category === activeCategory;
    const matchesLevel = activeLevel === 'All Levels' || c.exp === activeLevel;
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesLevel && matchesSearch;
  });

  // If a career is selected, show the full detail screen
  if (selected) {
    return (
      <CareerDetail
        career={selected}
        onClose={() => setSelected(null)}
        onSelectCareer={(career) => setSelected(career)}
        isSaved={savedCareerIds.includes(selected?.id)}
        onToggleSave={() => toggleSave(selected)}
      />
    );
  }

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ background: 'linear-gradient(to bottom, #1a0a2e, #0d0618, #000)' }}>
      <AppBackground />
      <div className="relative z-10">

        {/* Header */}
        <div className="px-4 pt-8 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase size={20} className="text-purple-400" />
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">Career Exploration</span>
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Your Future is Bright 👑</h1>
          <p className="text-white/50 text-sm mt-1">Explore careers, take the quiz, and start building your path today.</p>
        </div>

        {/* Main Tabs */}
        <div className="px-4 mb-5">
          <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { id: 'explore', label: '🔍 Explore' },
              { id: 'jobs', label: '💼 Job Tracker' },
              { id: 'resume', label: '📄 Resume' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setMainTab(tab.id)}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition"
                style={mainTab === tab.id
                  ? { background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff' }
                  : { color: 'rgba(255,255,255,0.4)' }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* EXPLORE TAB */}
        {mainTab === 'explore' && (
          <div>
            {/* Action Cards */}
            <div className="px-4 mb-4 grid grid-cols-2 gap-3">
              <button onClick={() => setShowQuiz(true)}
                className="rounded-2xl p-4 text-left transition hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(236,72,153,0.2))', border: '1px solid rgba(168,85,247,0.3)' }}>
                <Target size={24} className="text-purple-400 mb-2" />
                <p className="text-white font-bold text-sm">Career Match Quiz</p>
                <p className="text-white/50 text-xs">Find your % match</p>
              </button>
              <button onClick={() => setShowRealWomen(true)}
                className="rounded-2xl p-4 text-left transition hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.3), rgba(239,68,68,0.2))', border: '1px solid rgba(236,72,153,0.3)' }}>
                <Sparkles size={24} className="text-pink-400 mb-2" />
                <p className="text-white font-bold text-sm">Real Women</p>
                <p className="text-white/50 text-xs">5 spotlights</p>
              </button>
            </div>

            {/* Search */}
            <div className="px-4 mb-3 relative">
              <Search size={14} className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search careers..."
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            {/* Industry Filter */}
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Industry</p>
            <div className="flex gap-2 overflow-x-auto px-4 pb-1 mb-3 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                  style={activeCategory === cat
                    ? { background: 'rgba(168,85,247,0.2)', borderColor: 'rgba(168,85,247,0.5)', color: '#c084fc' }
                    : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Experience Level Filter */}
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Experience Level</p>
            <div className="flex gap-2 overflow-x-auto px-4 pb-1 mb-4 scrollbar-hide">
              {EXPERIENCE_LEVELS.map(lvl => {
                const lvlColor = EXP_COLORS[lvl] || '#a855f7';
                return (
                  <button key={lvl} onClick={() => setActiveLevel(lvl)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                    style={activeLevel === lvl
                      ? { background: `${lvlColor}25`, borderColor: lvlColor, color: lvlColor }
                      : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                    {lvl}
                  </button>
                );
              })}
            </div>

            <p className="px-4 text-xs text-gray-500 mb-3">{filtered.length} career{filtered.length !== 1 ? 's' : ''} found</p>

            {/* Career List */}
            <div className="px-4 space-y-3">
              {filtered.map(career => {
                const color = CATEGORY_COLORS[career.category] || '#a855f7';
                const expColor = EXP_COLORS[career.exp] || '#a855f7';
                return (
                  <button key={career.id} onClick={() => setSelected(career)}
                    className="w-full text-left rounded-2xl px-4 py-4 transition hover:opacity-90"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                        style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                        {career.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold mb-0.5" style={{ color }}>{career.category}</p>
                        <p className="font-bold text-sm text-white">{career.title}</p>
                        <p className="text-xs font-semibold text-emerald-400 mb-1">{career.salary}</p>
                        <p className="text-xs text-white/50 leading-relaxed">{career.desc}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <button onClick={e => toggleSave(career, e)}>
                          {savedCareerIds.includes(career.id)
                            ? <BookmarkCheck size={15} className="text-purple-400" />
                            : <Bookmark size={15} className="text-gray-600" />}
                        </button>
                        <ChevronRight size={15} className="text-gray-500" />
                      </div>
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-4xl mb-2">🔍</p>
                  <p className="text-gray-400 text-sm">No careers found</p>
                  <button onClick={() => { setActiveCategory('All'); setActiveLevel('All Levels'); setSearch(''); }}
                    className="mt-2 text-xs text-purple-400 font-semibold">Clear filters</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* JOBS TAB */}
        {mainTab === 'jobs' && (
          <div className="px-4">
            <p className="text-sm text-gray-400 mb-4">Track every application from Wishlist to Offer — all in one place.</p>
            <button onClick={() => navigate('/job-tracker')}
              className="w-full flex items-center gap-4 p-5 rounded-2xl mb-4 transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(236,72,153,0.15))', border: '1px solid rgba(168,85,247,0.4)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'rgba(168,85,247,0.3)' }}>💼</div>
              <div className="flex-1 text-left">
                <p className="font-bold text-white">Open My Job Tracker</p>
                <p className="text-xs text-white/50 mt-0.5">Applications, status updates, contacts</p>
              </div>
              <ChevronRight size={18} className="text-purple-400" />
            </button>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { emoji: '📋', title: 'Track Status', desc: 'Wishlist to Offer pipeline' },
                { emoji: '📁', title: 'Store Resumes', desc: 'Upload or paste per application' },
                { emoji: '🎤', title: 'Interview Stage', desc: 'Track progress stages' },
                { emoji: '📞', title: 'Contacts', desc: 'Save recruiter info' },
              ].map(item => (
                <div key={item.title} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-2xl mb-1">{item.emoji}</p>
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-white/40 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/job-tracker')}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
              Go to Job Tracker 💼
            </button>
          </div>
        )}

        {/* RESUME TAB */}
        {mainTab === 'resume' && (
          <div className="px-4">
            <p className="text-sm text-gray-400 mb-4">Build your resume section by section — save drafts and export as a text file.</p>
            <ResumeBuilder />
          </div>
        )}
      </div>

      {/* Real Women Modal */}
      {showRealWomen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={() => setShowRealWomen(false)}>
          <div className="w-full rounded-t-3xl flex flex-col" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
              <div>
                <p className="text-xs text-pink-400 font-semibold uppercase tracking-widest">Real Women</p>
                <h2 className="text-lg font-bold text-white">5 Women Who Made It ✨</h2>
              </div>
              <button onClick={() => setShowRealWomen(false)} className="text-gray-400"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 pb-8 space-y-4">
              {REAL_WOMEN.map((woman, i) => (
                <div key={i} className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(236,72,153,0.3))' }}>
                      {woman.emoji}
                    </div>
                    <div>
                      <p className="font-bold text-white">{woman.name}</p>
                      <p className="text-xs text-gray-400">{woman.title}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold mt-1 inline-block"
                        style={{ background: `${CATEGORY_COLORS[woman.field] || '#a855f7'}20`, color: CATEGORY_COLORS[woman.field] || '#a855f7' }}>
                        {woman.field}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-white/80 italic leading-relaxed mb-2">"{woman.quote}"</p>
                  <p className="text-xs text-gray-400 leading-relaxed">✨ {woman.fact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showQuiz && (
        <CareerQuiz
          onClose={() => setShowQuiz(false)}
          onSelectCategory={(cat) => setActiveCategory(cat)}
        />
      )}

      <BottomNav active="discover" />
    </div>
  );
}