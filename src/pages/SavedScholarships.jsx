import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, GraduationCap, ExternalLink, Bookmark } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import AppBackground from '@/components/AppBackground';
import { toast } from 'sonner';

const ALL_SCHOLARSHIPS = [
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

export default function SavedScholarships() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      const saved = JSON.parse(localStorage.getItem(`ggu_scholarships_saved_${u.email}`) || '[]');
      setSavedIds(saved);
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const unsave = (id) => {
    const updated = savedIds.filter(s => s !== id);
    setSavedIds(updated);
    if (user) localStorage.setItem(`ggu_scholarships_saved_${user.email}`, JSON.stringify(updated));
    toast.success('Removed from saved');
  };

  const saved = ALL_SCHOLARSHIPS.filter(s => savedIds.includes(s.id));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0010' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-28 relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap size={20} className="text-yellow-400" />
            <div>
              <h1 className="text-xl font-bold">My Saved Scholarships</h1>
              <p className="text-xs text-gray-400">{saved.length} scholarship{saved.length !== 1 ? 's' : ''} saved</p>
            </div>
          </div>
        </div>

        {saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-lg font-bold text-white mb-2">No Saved Scholarships Yet</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              Browse the Scholarship Hub and tap the bookmark icon to save scholarships here.
            </p>
            <button
              onClick={() => navigate('/scholarships')}
              className="px-6 py-3 rounded-full font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
            >
              Browse Scholarships 🔍
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {saved.map(s => (
              <div key={s.id} className="rounded-2xl p-4" style={{ background: 'rgba(20,8,40,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-yellow-400">👑 {s.category}</span>
                    <h3 className="text-sm font-bold text-white mt-1 leading-snug">{s.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{s.org}</p>
                  </div>
                  <div className="flex gap-2 ml-2 flex-shrink-0">
                    <button onClick={() => unsave(s.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(168,85,247,0.3)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      <Bookmark size={14} className="fill-purple-400 text-purple-400" />
                    </button>
                    <a href={s.url} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      <ExternalLink size={14} className="text-gray-400" />
                    </a>
                  </div>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed mb-3">{s.desc}</p>
                <div className="grid grid-cols-3 gap-2">
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
                {s.gpa && <p className="text-xs text-gray-500 mt-2">Min GPA: <span className="font-semibold text-gray-300">{s.gpa}</span></p>}
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav active="me" />
    </div>
  );
}