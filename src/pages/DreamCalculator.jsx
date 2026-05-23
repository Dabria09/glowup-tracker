import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import DreamReport from '@/components/dream/DreamReport';
import { CAREER_CATEGORIES, LIFESTYLE_CATEGORIES, KIDS_OPTIONS } from '@/lib/dreamCalculatorData';
import { ChevronLeft, Search, X, ChevronDown } from 'lucide-react';

const STEP = ({ n, label }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
      style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
      {n}
    </div>
    <h2 className="text-lg font-bold text-white">{label}</h2>
  </div>
);

export default function DreamCalculator() {
  const navigate = useNavigate();
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [careerSearch, setCareerSearch] = useState('');
  const [spouseEnabled, setSpouseEnabled] = useState(false);
  const [spouseIncome, setSpouseIncome] = useState(60000);
  const [kids, setKids] = useState(0);
  const [lifestyle, setLifestyle] = useState(() => {
    const defaults = {};
    LIFESTYLE_CATEGORIES.forEach(cat => { defaults[cat.id] = 1; });
    return defaults;
  });

  const lifestyleCost = LIFESTYLE_CATEGORIES.reduce((sum, cat) => {
    return sum + (cat.options[lifestyle[cat.id]]?.cost || 0);
  }, 0);

  const kidsCost = KIDS_OPTIONS.find(k => k.value === kids)?.cost || 0;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const allCareers = CAREER_CATEGORIES.flatMap(c => c.careers.map(j => ({ ...j, catLabel: c.label, catId: c.id })));
  const filteredCareers = careerSearch.trim()
    ? allCareers.filter(c => c.name.toLowerCase().includes(careerSearch.toLowerCase()) || c.catLabel.toLowerCase().includes(careerSearch.toLowerCase()))
    : allCareers;

  useEffect(() => {
    const handleClick = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="min-h-screen text-white pb-32 relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />
      <div className="relative z-10">

        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={20} /></button>
            <span className="text-xs font-bold tracking-widest text-purple-400">DREAM CALCULATOR</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Dream Calculator 💸</h1>
          <p className="text-sm text-gray-400">Design your dream life. Find out exactly what career gets you there.</p>

          {/* Intro banner */}
          <div className="mt-3 rounded-2xl px-4 py-3" style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.4), rgba(139,10,120,0.3))', border: '1px solid rgba(168,85,247,0.25)' }}>
            <p className="text-xs font-bold text-yellow-300 mb-0.5">✨ How it works</p>
            <p className="text-xs text-gray-300">Pick your career → design your lifestyle → see your monthly numbers in real time. Single income is totally doable. Many women build wealth alone. 👑</p>
          </div>
        </div>

        {/* STEP 1: Career */}
        <div className="px-4 mb-6">
          <STEP n={1} label="Choose Your Dream Career" />

          {/* Searchable Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition"
              style={{ background: 'rgba(20,10,35,0.8)', border: '1px solid rgba(168,85,247,0.3)' }}>
              {selectedCareer ? (
                <>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{selectedCareer.name}</p>
                    <p className="text-xs text-purple-300">{selectedCareer.catLabel} • ${(selectedCareer.salary / 1000).toFixed(0)}K/yr avg</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setSelectedCareer(null); setCareerSearch(''); }} className="text-gray-400 hover:text-white">
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <Search size={15} className="text-gray-500" />
                  <span className="text-gray-400 text-sm flex-1">Select a career...</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </>
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-2xl overflow-hidden z-50 shadow-2xl"
                style={{ background: 'rgba(15,8,30,0.98)', border: '1px solid rgba(168,85,247,0.3)', maxHeight: 360 }}>
                <div className="p-3 border-b border-white/10">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={careerSearch} onChange={e => setCareerSearch(e.target.value)}
                      placeholder="Search all careers..." autoFocus
                      className="w-full rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    {careerSearch && <button onClick={() => setCareerSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={12} /></button>}
                  </div>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
                  {filteredCareers.length === 0 && <p className="text-center text-gray-500 text-sm py-6">No careers found</p>}
                  {filteredCareers.map((c, i) => (
                    <button key={i} onClick={() => { setSelectedCareer(c); setDropdownOpen(false); setCareerSearch(''); }}
                      className="w-full flex items-center justify-between px-4 py-3 border-b border-white/5 text-left transition hover:bg-white/5"
                      style={selectedCareer?.name === c.name ? { background: 'rgba(168,85,247,0.2)' } : {}}>
                      <div>
                        <p className="text-sm font-semibold text-white">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.catLabel}</p>
                      </div>
                      <span className="text-sm font-bold text-green-400 flex-shrink-0 ml-4">${(c.salary / 1000).toFixed(0)}K/yr</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedCareer && (
            <div className="mt-3 rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
              <span className="text-2xl">💼</span>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">{selectedCareer.name}</p>
                <p className="text-xs text-gray-400">{selectedCareer.edu}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-white text-sm">${(selectedCareer.salary / 1000).toFixed(0)}K/yr</p>
                <p className="text-xs text-green-400">~${Math.round(selectedCareer.salary * 0.72 / 12).toLocaleString()}/mo take-home</p>
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: Income Boost */}
        <div className="px-4 mb-6">
          <STEP n={2} label="Income Settings" />
          <div className="rounded-2xl p-4 space-y-4" style={{ background: 'rgba(20,10,35,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>

            {/* Spouse toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-white">Add Partner Income</p>
                  <p className="text-xs text-gray-400">Optional — calculate as a couple</p>
                </div>
                <button onClick={() => setSpouseEnabled(!spouseEnabled)}
                  className="w-12 h-6 rounded-full transition-all relative"
                  style={{ background: spouseEnabled ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(255,255,255,0.1)' }}>
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all"
                    style={{ left: spouseEnabled ? 26 : 2 }} />
                </button>
              </div>
              {spouseEnabled && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Partner annual salary: <span className="text-white font-bold">${spouseIncome.toLocaleString()}</span></p>
                  <input type="range" min={30000} max={350000} step={5000} value={spouseIncome}
                    onChange={e => setSpouseIncome(Number(e.target.value))}
                    className="w-full accent-pink-500" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$30K</span><span>$350K</span>
                  </div>
                </div>
              )}
            </div>

            {/* Kids */}
            <div>
              <p className="text-sm font-semibold text-white mb-2">Number of Kids</p>
              <div className="grid grid-cols-5 gap-2">
                {KIDS_OPTIONS.map(k => (
                  <button key={k.value} onClick={() => setKids(k.value)}
                    className="rounded-xl py-2 text-center transition"
                    style={kids === k.value
                      ? { background: 'linear-gradient(135deg, rgba(168,85,247,0.5), rgba(236,72,153,0.4))', border: '2px solid #ec4899' }
                      : { background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)' }}>
                    <p className="text-sm font-bold text-white">{k.value === 4 ? '4+' : k.value}</p>
                    {k.cost > 0 && <p className="text-xs text-gray-400">+${(k.cost / 1000).toFixed(1)}K</p>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: Intro */}
        <div className="px-4 mb-2">
          <STEP n={3} label="Design Your Dream Life" />
          <p className="text-xs text-gray-400 -mt-2 mb-4">Select one option per category. Your monthly total updates in real time.</p>
        </div>

        {/* STEP 4: Lifestyle Selectors */}
        <div className="px-4 mb-6 space-y-4">
          {LIFESTYLE_CATEGORIES.map(cat => (
            <div key={cat.id} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(20,10,35,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <span className="text-xl">{cat.emoji}</span>
                <span className="font-bold text-white text-sm">{cat.label}</span>
              </div>
              <div>
                {cat.options.map((opt, i) => {
                  const isSelected = lifestyle[cat.id] === i;
                  return (
                    <button key={i} onClick={() => setLifestyle(p => ({ ...p, [cat.id]: i }))}
                      className="w-full flex items-center justify-between px-4 py-3 border-b border-white/5 text-left transition"
                      style={isSelected ? { background: 'linear-gradient(135deg, rgba(168,85,247,0.35), rgba(236,72,153,0.25))', borderLeft: '3px solid #ec4899' } : {}}>
                      <span className={`text-sm ${isSelected ? 'font-bold text-white' : 'text-gray-300'}`}>{opt.label}</span>
                      <span className={`text-sm font-bold flex-shrink-0 ml-4 ${isSelected ? 'text-white' : 'text-gray-400'}`}>${opt.cost.toLocaleString()}/mo</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Lifestyle total bar */}
        <div className="mx-4 mb-6 rounded-2xl px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.35)' }}>
          <div>
            <p className="text-xs text-gray-400">Total Lifestyle Cost</p>
            <p className="text-xl font-bold text-white">${lifestyleCost.toLocaleString()}/mo</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Annual</p>
            <p className="text-sm font-bold text-purple-300">${(lifestyleCost * 12).toLocaleString()}/yr</p>
          </div>
        </div>

        {/* STEP 5: Report */}
        <div className="px-4 mb-4">
          <STEP n={4} label="Your Dream Life Report" />
          {!selectedCareer ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(20,10,35,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-3xl mb-2">👆</p>
              <p className="text-sm text-gray-400">Select a career in Step 1 to see your full Dream Life Report</p>
            </div>
          ) : null}
        </div>

        {selectedCareer && (
          <DreamReport
            career={selectedCareer}
            lifestyleCost={lifestyleCost}
            spouseIncome={spouseEnabled ? spouseIncome : 0}
            kidsCount={kids}
            kidsCost={kidsCost}
          />
        )}
      </div>

      <BottomNav active="discover" />
    </div>
  );
}