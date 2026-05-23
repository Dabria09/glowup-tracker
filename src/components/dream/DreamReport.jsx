import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GLOW_ROADMAP, CAREER_CATEGORIES } from '@/lib/dreamCalculatorData';

function fmt(n) {
  return '$' + Math.abs(Math.round(n)).toLocaleString();
}

// Related category groups — career suggestions stay within these clusters
const RELATED_CATS = {
  beauty_wellness: ['beauty_wellness', 'creative_arts', 'creative_media', 'education_social'],
  business: ['business', 'finance', 'tech_digital', 'technology', 'law'],
  creative_media: ['creative_media', 'creative_arts', 'media', 'tech_digital'],
  creative_arts: ['creative_arts', 'creative_media', 'media', 'business'],
  design: ['design', 'tech_digital', 'creative_arts', 'trades'],
  education: ['education', 'education_social', 'mental_health'],
  education_social: ['education_social', 'education', 'mental_health', 'law_justice'],
  finance: ['finance', 'business', 'technology', 'law'],
  healthcare: ['healthcare', 'mental_health', 'education_social'],
  law: ['law', 'law_justice', 'business', 'finance'],
  law_justice: ['law_justice', 'law', 'education_social'],
  media: ['media', 'creative_media', 'creative_arts', 'tech_digital'],
  mental_health: ['mental_health', 'healthcare', 'education_social'],
  science: ['science', 'healthcare', 'technology', 'tech_digital'],
  tech_digital: ['tech_digital', 'technology', 'business', 'design'],
  technology: ['technology', 'tech_digital', 'business', 'finance'],
  trades: ['trades', 'business', 'design'],
};

// Career-specific side hustles — tailored to the exact role
const SIDE_HUSTLES_BY_CAREER = {
  // Beauty
  'Makeup Artist': ['Bridal/event bookings', 'Sell makeup tutorials on YouTube', 'Launch a cosmetics line', 'Teach makeup classes', 'Brand collaborations & UGC'],
  'Esthetician': ['Private facial clients', 'Sell skincare products', 'Teach esthetic courses online', 'Brand ambassador deals', 'Launch a skincare line'],
  'Hairstylist': ['Private clients / house calls', 'Sell hair care products', 'Teach styling tutorials online', 'Bridal hair bookings', 'Sell hair extensions'],
  'Nail Technician': ['Private nail clients', 'Sell nail supplies on Etsy', 'Teach nail art tutorials', 'Nail art content creation', 'Press-on nail business'],
  'Lash Technician': ['Private lash clients', 'Sell lash kits', 'Teach lash extension courses', 'Lash content creation', 'Supply lash artists'],
  'Barber': ['Private clients / mobile barbering', 'Sell grooming products', 'Teach barbering workshops', 'Grooming content creation'],
  'Personal Stylist': ['Online styling consults', 'Sell style guides or lookbooks', 'Fashion content creation', 'Capsule wardrobe coaching'],
  'Beauty Influencer': ['Sponsored content / brand deals', 'Affiliate marketing', 'Sell a preset or filter pack', 'Launch a product line', 'Paid beauty coaching'],

  // Business
  'Entrepreneur / Business Owner': ['Launch a second revenue stream', 'Business coaching', 'Sell an online course', 'Invest in real estate', 'Franchise licensing'],
  'Marketing Manager': ['Freelance marketing for small businesses', 'Social media management', 'Teach marketing courses online', 'Brand strategy consulting'],
  'Accountant / CPA': ['Tax preparation (side season)', 'Personal finance coaching', 'Teach bookkeeping online', 'CFO consulting for startups'],
  'Event Planner': ['Weekend events & weddings', 'Sell event planning templates', 'Day-of coordination', 'Virtual event planning'],
  'Sales Executive': ['Affiliate marketing', 'Commission-based side sales', 'Sales coaching', 'High-ticket product sales'],
  'Project Manager': ['Freelance project consulting', 'Teach PMP prep courses', 'Process improvement consulting'],
  'Recruiter': ['Independent recruiting contracts', 'Resume writing service', 'Career coaching', 'LinkedIn profile consulting'],

  // Creative & Media
  'Actress': ['UGC content creation', 'Acting coaching', 'Voiceover work', 'Brand deals & partnerships'],
  'Singer': ['Singing lessons (private/online)', 'Session vocals', 'Sell original music', 'Perform at private events'],
  'Dancer / Choreographer': ['Teach dance classes', 'Choreograph for artists', 'Dance fitness content', 'Workshop facilitation'],
  'Author / Writer': ['Ghostwriting', 'Sell digital guides or ebooks', 'Freelance copywriting', 'Content coaching'],
  'Screenwriter': ['Freelance copywriting', 'Script doctoring', 'Write short films', 'Teach writing workshops online'],
  'Photographer': ['Wedding/event photography', 'Sell stock photos', 'Photography courses', 'Brand photography for businesses'],
  'Journalist': ['Freelance writing', 'Newsletter monetization', 'Teach writing online', 'Podcast hosting'],
  'Influencer': ['Brand sponsorships', 'Sell a digital product', 'Affiliate marketing', 'Paid community or Patreon'],
  'YouTuber': ['Brand deals', 'Sell merchandise or courses', 'Affiliate links', 'Podcast spinoff'],
  'Music Producer': ['Sell beats online', 'Produce for artists', 'Teach music production', 'Sample pack sales'],

  // Tech
  'Software Engineer / Tech': ['Freelance app/web development', 'Build & sell a SaaS tool', 'Teach coding online', 'Open source consulting'],
  'UX Designer': ['Freelance UX projects', 'Sell UI kits on Figma', 'Teach UX design online', 'Design consulting for startups'],
  'Graphic Designer': ['Sell templates on Creative Market', 'Freelance branding', 'Social media design packages', 'Print-on-demand products'],
  'App Developer': ['Build & monetize apps', 'Freelance mobile development', 'Teach coding bootcamp', 'App consulting for startups'],
  'Data Analyst': ['Freelance data projects', 'Teach Excel/SQL online', 'Analytics consulting', 'Build and sell dashboards'],
  'Cybersecurity Analyst': ['Security consulting', 'Teach cybersecurity courses', 'Bug bounty programs', 'Freelance pentesting'],
  'Social Media Manager': ['Manage accounts for small businesses', 'Sell social media templates', 'Teach social media courses', 'Content strategy consulting'],
  'Video Editor': ['Freelance video editing', 'Sell LUTs or Premiere templates', 'Teach editing online', 'YouTube channel management'],
  'Web Designer': ['Freelance websites for small businesses', 'Sell website templates', 'Teach web design online', 'Website auditing service'],

  // Healthcare
  'Registered Nurse (RN)': ['Travel nursing', 'Health coaching', 'Teach CNA/nursing prep courses', 'Medical writing'],
  'Nurse Practitioner': ['Telehealth consulting', 'Health coaching', 'Medical writing', 'Teach nursing courses'],
  'Doctor / Physician': ['Telehealth consulting', 'Medical writing', 'Locum tenens work', 'Medical expert witness'],
  'Pharmacist': ['Medication therapy management', 'Teach pharmacy prep', 'Compounding consulting', 'Health coaching'],
  'Physical Therapist': ['Private PT clients', 'Online exercise programming', 'Corporate wellness consulting', 'Teach PT courses'],
  'Nutritionist / Dietitian': ['Private nutrition coaching', 'Sell meal plans online', 'Recipe development', 'Corporate wellness programs'],

  // Education
  'Teacher / Educator': ['Tutoring (private/online)', 'Sell lesson plans on Teachers Pay Teachers', 'Educational YouTube channel', 'Online course creation'],
  'School Counselor': ['Private life coaching', 'College application consulting', 'Mental health workshops', 'Parenting seminars'],
  'College Professor': ['Consulting in your field', 'Write and publish books', 'Online courses', 'Speaking engagements'],
  'Life Coach': ['Group coaching programs', 'Sell a digital course', 'Motivational speaking', 'Write a self-help book'],

  // Law
  'Lawyer / Attorney': ['Contract review for startups', 'Legal writing/blogging', 'Notary services', 'Mediation services'],
  'Paralegal': ['Freelance legal research', 'Document preparation services', 'Legal content writing'],
  'Police Officer': ['Security consulting', 'Safety training courses', 'Corporate security work'],

  // Finance
  'Financial Advisor / Banker': ['Personal finance coaching', 'Teach financial literacy courses', 'Tax season prep help', 'Budgeting workshops'],

  // Trades
  'Electrician': ['Side residential jobs', 'Teach electrical courses', 'Electrical inspection consulting'],
  'Interior Designer': ['E-design packages', 'Sell mood board services', 'Home staging', 'Teach interior design online'],
  'Realtor / Property Investor': ['Property management', 'Flip & sell properties', 'Teach real estate investing', 'Rental income'],
  'Welder': ['Custom fabrication orders', 'Teach welding courses', 'Metal art & Etsy shop'],
  'Truck Driver / Owner Operator': ['Own your rig & go owner-operator', 'Hotshot hauling', 'Freight brokering'],

  // Mental Health
  'Psychologist / Therapist': ['Private pay clients', 'Online therapy platform', 'Write a mental health book', 'Corporate wellness consulting'],
  'Social Worker': ['Private coaching', 'Grant writing consulting', 'Nonprofit consulting', 'Workshops & speaking'],
};

function getSideHustles(career) {
  // First try specific career name match
  if (SIDE_HUSTLES_BY_CAREER[career.name]) return SIDE_HUSTLES_BY_CAREER[career.name];
  // Fallback by category
  const catFallbacks = {
    beauty_wellness: ['Private clients on weekends', 'Sell a product or course online', 'Brand partnerships & UGC', 'Teach your skill via workshops'],
    business: ['Freelance consulting', 'Sell an online course', 'Affiliate marketing', 'Business coaching'],
    creative_media: ['Brand deals & sponsorships', 'Sell digital products', 'Freelance creative projects', 'Teach your craft online'],
    healthcare: ['Telehealth consulting', 'Health coaching', 'Medical writing', 'Teach in your specialty'],
    law: ['Freelance legal consulting', 'Contract review', 'Legal content writing', 'Notary services'],
    tech_digital: ['Freelance projects', 'Sell templates or tools', 'Teach tech skills online', 'Build a SaaS side project'],
    education: ['Tutoring', 'Sell lesson plans online', 'Online course creation', 'Educational content creation'],
    finance: ['Financial coaching', 'Tax prep side season', 'Teach financial literacy', 'Budgeting workshops'],
  };
  return catFallbacks[career.catId] || ['Freelance your core skills', 'Start a content channel in your field', 'Teach what you know online', 'Consulting or coaching services'];
};

export default function DreamReport({ career, lifestyleCost, spouseIncome, kidsCount, kidsCost }) {
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const [roadmapExpanded, setRoadmapExpanded] = useState({});
  const [realityOpen, setRealityOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);

  if (!career) return null;

  // ── Income calculations ──
  const gross = career.salary / 12;
  const tax = gross * 0.28;
  const takeHome = gross - tax;
  const spouseTakeHome = spouseIncome > 0 ? (spouseIncome / 12) * 0.75 : 0;
  const combined = takeHome + spouseTakeHome;

  const essentialsSingle = takeHome * 0.15;
  const essentialsDual = combined * 0.15;
  const totalExpensesSingle = lifestyleCost + essentialsSingle + kidsCost;
  const totalExpensesDual = lifestyleCost + essentialsDual + kidsCost;

  const singleSavings = takeHome - totalExpensesSingle;
  const dualSavings = combined - totalExpensesDual;

  // Use dual if partner income enabled, else single
  const activeSavings = spouseIncome > 0 ? dualSavings : singleSavings;
  const activeExpenses = spouseIncome > 0 ? totalExpensesDual : totalExpensesSingle;
  const activeIncome = spouseIncome > 0 ? combined : takeHome;
  const activeEssentials = spouseIncome > 0 ? essentialsDual : essentialsSingle;
  const canAfford = activeSavings >= 0;
  const savingsRate = activeIncome > 0 ? Math.round((activeSavings / activeIncome) * 100) : 0;

  // ── Career suggestions ── only careers that CAN afford the lifestyle, prioritizing same/related fields
  const requiredSolo = totalExpensesSingle / 0.72;
  const allCareers = CAREER_CATEGORIES.flatMap(c => c.careers.map(j => ({ ...j, catId: c.id, catLabel: c.label })));
  const relatedCatIds = RELATED_CATS[career.catId] || [career.catId];
  const affordable = allCareers.filter(c => c.salary >= requiredSolo && c.name !== career.name);
  // Sort: same/related category first, then by salary ascending
  const matchingCareers = [
    ...affordable.filter(c => relatedCatIds.includes(c.catId)).sort((a, b) => a.salary - b.salary),
    ...affordable.filter(c => !relatedCatIds.includes(c.catId)).sort((a, b) => a.salary - b.salary),
  ].slice(0, 7);

  // ── Side hustles ── specific to the chosen career
  const sideHustles = getSideHustles(career);

  const hiddenCosts = [
    { label: 'Student Loan Payment', desc: 'Average for professional degrees', amount: career.salary > 100000 ? 400 : 250 },
    { label: 'Health Insurance', desc: 'If not covered by employer', amount: 350 },
    { label: 'Emergency Fund (3-6 mo)', desc: '10% of expenses monthly until funded', amount: Math.round(activeExpenses * 0.1) },
    { label: 'Retirement (401k/IRA)', desc: '10% recommended minimum', amount: Math.round(activeIncome * 0.1) },
  ];
  const totalHidden = hiddenCosts.reduce((s, c) => s + c.amount, 0);

  const statusLabel = (savings) => {
    if (savings > 1000) return { label: 'Living the Dream', color: '#4ade80', emoji: '✅' };
    if (savings > 0) return { label: 'Tight', color: '#fbbf24', emoji: '⚠️' };
    if (savings > -2000) return { label: 'Adjust', color: '#f97316', emoji: '⚠️' };
    return { label: 'Not Affordable', color: '#f87171', emoji: '🚨' };
  };

  const singleStatus = statusLabel(singleSavings);
  const dualStatus = spouseIncome > 0 ? statusLabel(dualSavings) : null;

  return (
    <div className="px-4 pb-6 space-y-4">

      {/* Single vs Dual Income Comparison */}
      <div className={`grid gap-3 ${spouseIncome > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(20,10,35,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-xs text-gray-400 mb-1">Single Income</p>
          <p className="text-xl font-bold" style={{ color: singleSavings >= 0 ? '#4ade80' : '#f87171' }}>
            {singleSavings >= 0 ? '+' : ''}{fmt(singleSavings)}/mo
          </p>
          <p className="text-xs mt-1 font-semibold" style={{ color: singleStatus.color }}>{singleStatus.emoji} {singleStatus.label}</p>
        </div>
        {spouseIncome > 0 && (
          <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(109,40,217,0.3)', border: '1px solid rgba(168,85,247,0.4)' }}>
            <p className="text-xs text-gray-400 mb-1">Dual Income</p>
            <p className="text-xl font-bold" style={{ color: dualSavings >= 0 ? '#4ade80' : '#f87171' }}>
              {dualSavings >= 0 ? '+' : ''}{fmt(dualSavings)}/mo
            </p>
            <p className="text-xs mt-1 font-semibold" style={{ color: dualStatus.color }}>{dualStatus.emoji} {dualStatus.label}</p>
          </div>
        )}
      </div>

      {/* Main Result Card */}
      <div className="rounded-3xl p-5" style={{ background: canAfford ? 'rgba(15,40,25,0.85)' : 'rgba(60,10,10,0.85)', border: `1px solid ${canAfford ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">{canAfford ? '✅' : '⚠️'}</div>
          <p className="text-xl font-bold text-white">{canAfford ? 'You can afford this life!' : "You'll need to adjust"}</p>
          <p className="text-sm mt-1" style={{ color: canAfford ? '#86efac' : '#fca5a5' }}>
            {canAfford
              ? `You'd have ${fmt(activeSavings)}/mo left to save & invest`
              : `You're ${fmt(Math.abs(activeSavings))}/mo short of this lifestyle`}
          </p>
        </div>

        <div className="space-y-2.5 border-t border-white/10 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">{spouseIncome > 0 ? 'Combined Take-Home' : 'Monthly Take-Home'}</span>
            <span className="font-bold text-green-400">+{fmt(activeIncome)}</span>
          </div>
          {spouseIncome > 0 && <>
            <div className="flex justify-between text-sm"><span className="text-gray-400 pl-4">Your income</span><span className="text-gray-300">+{fmt(takeHome)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400 pl-4">Partner income</span><span className="text-gray-300">+{fmt(spouseTakeHome)}</span></div>
          </>}
          <div className="flex justify-between text-sm"><span className="text-gray-300">Lifestyle Costs</span><span className="font-bold text-red-400">-{fmt(lifestyleCost)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-300">Food &amp; Essentials (~15%)</span><span className="text-red-400">-{fmt(activeEssentials)}</span></div>
          {kidsCost > 0 && <div className="flex justify-between text-sm"><span className="text-gray-300">Kids ({kidsCount === 4 ? '4+' : kidsCount})</span><span className="text-red-400">-{fmt(kidsCost)}</span></div>}
          <div className="flex justify-between text-sm font-bold border-t border-white/10 pt-2 mt-2">
            <span className="text-white">Monthly Savings</span>
            <span style={{ color: canAfford ? '#4ade80' : '#f87171' }}>{activeSavings >= 0 ? '+' : ''}{Math.round(activeSavings).toLocaleString()}</span>
          </div>
        </div>

        {canAfford ? (
          <div className="mt-4 rounded-2xl px-4 py-3 text-center" style={{ background: 'rgba(20,83,45,0.6)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <p className="text-sm font-bold text-green-400">Savings Rate: {savingsRate}%</p>
            <p className="text-xs text-green-300 mt-0.5">{savingsRate >= 20 ? '🌟 Outstanding savings habit!' : savingsRate >= 10 ? '✨ Good! Keep building that savings habit.' : '💡 Try to increase your savings rate to 20%+'}</p>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl px-4 py-3" style={{ background: 'rgba(60,20,10,0.6)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-xs font-bold text-yellow-300 mb-2">💡 Ways to make it work:</p>
            <ul className="space-y-1">{['Consider a higher-paying career path', 'Add a side hustle to supplement income', 'Adjust 1-2 lifestyle choices', 'Dual income could make this very affordable', 'Build income streams over time'].map((t, i) => <li key={i} className="text-xs text-gray-300">• {t}</li>)}</ul>
          </div>
        )}
      </div>

      {/* Career Match Suggestions */}
      <button onClick={() => setSuggestionsOpen(!suggestionsOpen)} className="w-full rounded-2xl p-4 text-left" style={{ background: 'rgba(20,10,40,0.9)', border: '1px solid rgba(168,85,247,0.35)' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <span className="font-bold text-purple-300 text-sm">Career Match Suggestions ✨</span>
          {suggestionsOpen ? <ChevronUp size={16} className="text-purple-400 ml-auto" /> : <ChevronDown size={16} className="text-purple-400 ml-auto" />}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Girls with this lifestyle often pursue careers like:</p>
      </button>

      {suggestionsOpen && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(15,8,30,0.9)', border: '1px solid rgba(168,85,247,0.2)' }}>
          {matchingCareers.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-6">Your selected career can already support this lifestyle! 🎉</p>
          ) : (
            matchingCareers.map((c, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3.5 border-b border-white/5">
                <div>
                  <p className="text-sm font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.edu}</p>
                </div>
                <span className="text-sm font-bold text-pink-400 flex-shrink-0 ml-4">${(c.salary / 1000).toFixed(0)}K/yr</span>
              </div>
            ))
          )}
          <div className="px-4 py-3" style={{ background: 'rgba(168,85,247,0.1)' }}>
            <p className="text-xs text-purple-300 italic">💡 Tip: You only need ONE of these to unlock your dream life.</p>
          </div>
        </div>
      )}

      {/* Side Hustles */}
      {!canAfford && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(20,10,35,0.9)', border: '1px solid rgba(251,191,36,0.3)' }}>
          <div className="px-4 py-3 border-b border-white/5" style={{ background: 'rgba(251,191,36,0.08)' }}>
            <p className="font-bold text-yellow-300 text-sm">💰 Side Hustles for {career.name}s</p>
            <p className="text-xs text-gray-400 mt-0.5">Boost your income while you build your career</p>
          </div>
          <div className="space-y-2 p-4">
            {sideHustles.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: 'rgba(251,191,36,0.4)', minWidth: 20 }}>{i + 1}</div>
                <p className="text-sm text-gray-200">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reality Check */}
      <button onClick={() => setRealityOpen(!realityOpen)} className="w-full rounded-2xl p-4 text-left" style={{ background: 'rgba(30,15,5,0.8)', border: '1px solid rgba(245,158,11,0.3)' }}>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400">⚠️</span>
          <span className="font-bold text-yellow-400 text-sm">Reality Check 🔎</span>
          {realityOpen ? <ChevronUp size={16} className="text-yellow-400 ml-auto" /> : <ChevronDown size={16} className="text-yellow-400 ml-auto" />}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Hidden costs most people forget to budget for</p>
      </button>

      {realityOpen && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(25,15,5,0.9)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div className="space-y-3 p-4">
            {hiddenCosts.map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <span className="text-sm font-bold text-orange-400 flex-shrink-0">-{fmt(item.amount)}/mo</span>
              </div>
            ))}
          </div>
          <div className="px-4 pb-4">
            <div className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <p className="text-xs text-yellow-300"><span className="font-bold">💡 Big Sis Tip</span> — These hidden costs can add {fmt(totalHidden)}/mo to your budget. Plan for them BEFORE you get your first paycheck!</p>
            </div>
          </div>
        </div>
      )}

      {/* Education summary */}
      <div className="rounded-2xl p-4 text-center" style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.4), rgba(139,10,120,0.3))', border: '1px solid rgba(168,85,247,0.3)' }}>
        <p className="font-bold text-white text-base mb-0.5">Your dream life is possible. 👑</p>
        <p className="text-xs text-gray-300">Education: <span className="text-purple-300 font-semibold">{career.edu}</span></p>
        <p className="text-xs text-gray-400 mt-1">Start planning now. Future you will thank you.</p>
      </div>

      {/* Glow Plan Roadmap */}
      <button onClick={() => setRoadmapOpen(!roadmapOpen)} className="w-full rounded-2xl p-4 text-left" style={{ background: 'rgba(20,15,35,0.8)', border: '1px solid rgba(168,85,247,0.3)' }}>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400">📍</span>
          <span className="font-bold text-yellow-400 text-sm">Glow Plan Roadmap 👑</span>
          {roadmapOpen ? <ChevronUp size={16} className="text-yellow-400 ml-auto" /> : <ChevronDown size={16} className="text-yellow-400 ml-auto" />}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Your age-by-age blueprint to living this life</p>
      </button>

      {roadmapOpen && (
        <div className="space-y-2">
          {GLOW_ROADMAP.map((phase, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(15,10,30,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <button onClick={() => setRoadmapExpanded(p => ({ ...p, [i]: !p[i] }))} className="w-full flex items-center gap-3 px-4 py-3.5">
                <span className="text-xl">{phase.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-white">{phase.age}</p>
                  <p className="text-xs font-semibold" style={{ color: phase.color }}>{phase.label}</p>
                </div>
                {roadmapExpanded[i] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              {roadmapExpanded[i] && (
                <div className="px-4 pb-4 space-y-2">
                  {phase.steps.map((step, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" style={{ background: phase.color }}>{j + 1}</div>
                      <p className="text-sm text-gray-200">{step}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <p className="text-xs text-center text-gray-500 py-2">This roadmap is built for girls who refuse to settle. 👑</p>
        </div>
      )}
    </div>
  );
}