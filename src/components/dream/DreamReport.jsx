import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GLOW_ROADMAP } from '@/lib/dreamCalculatorData';

function fmt(n) {
  return '$' + Math.abs(Math.round(n)).toLocaleString();
}

export default function DreamReport({ career, lifestyleCost, spouseIncome, kidsCount, kidsCost }) {
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const [roadmapExpanded, setRoadmapExpanded] = useState({});
  const [realityOpen, setRealityOpen] = useState(false);

  if (!career) return null;

  const gross = career.salary / 12;
  const tax = gross * 0.28;
  const takeHome = gross - tax;
  const spouseTakeHome = spouseIncome > 0 ? (spouseIncome / 12) * 0.75 : 0;
  const combined = takeHome + spouseTakeHome;
  const essentials = combined * 0.15;
  const totalExpenses = lifestyleCost + essentials + kidsCost;
  const savings = combined - totalExpenses;
  const savingsRate = combined > 0 ? Math.round((savings / combined) * 100) : 0;
  const canAfford = savings >= 0;

  const hiddenCosts = [
    { label: 'Student Loan Payment', desc: 'Average for professional degrees', amount: career.salary > 100000 ? 400 : 250 },
    { label: 'Health Insurance', desc: 'If not covered by employer', amount: 350 },
    { label: 'Emergency Fund (3-6 mo)', desc: '10% of expenses monthly until funded', amount: Math.round(totalExpenses * 0.1) },
    { label: 'Retirement (401k/IRA)', desc: '10% recommended minimum', amount: Math.round(combined * 0.1) },
  ];
  const totalHidden = hiddenCosts.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="px-4 pb-6 space-y-4">
      {/* Main Result Card */}
      <div className="rounded-3xl p-5" style={{ background: canAfford ? 'rgba(15,40,25,0.85)' : 'rgba(60,10,10,0.85)', border: `1px solid ${canAfford ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">{canAfford ? '✅' : '⚠️'}</div>
          <p className="text-xl font-bold text-white">{canAfford ? 'You can afford this life!' : "You'll need to adjust"}</p>
          <p className="text-sm mt-1" style={{ color: canAfford ? '#86efac' : '#fca5a5' }}>
            {canAfford
              ? `You'd have ${fmt(savings)}/mo left to save & invest`
              : `You're ${fmt(Math.abs(savings))}/mo short of this lifestyle`}
          </p>
        </div>

        <div className="space-y-2.5 border-t border-white/10 pt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">Monthly Take-Home</span>
            <span className="font-bold text-green-400">+{fmt(combined)}</span>
          </div>
          {spouseTakeHome > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400 pl-4">Your income</span>
              <span className="text-gray-300">+{fmt(takeHome)}</span>
            </div>
          )}
          {spouseTakeHome > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400 pl-4">Partner income</span>
              <span className="text-gray-300">+{fmt(spouseTakeHome)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">Lifestyle Costs</span>
            <span className="font-bold text-red-400">-{fmt(lifestyleCost)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">Food &amp; Essentials (~15%)</span>
            <span className="text-red-400">-{fmt(essentials)}</span>
          </div>
          {kidsCost > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300">Kids ({kidsCount === 4 ? '4+' : kidsCount})</span>
              <span className="text-red-400">-{fmt(kidsCost)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-sm font-bold border-t border-white/10 pt-2 mt-2">
            <span className="text-white">Monthly Savings</span>
            <span style={{ color: canAfford ? '#4ade80' : '#f87171' }}>{savings >= 0 ? '+' : ''}{Math.round(savings).toLocaleString()}</span>
          </div>
        </div>

        {canAfford ? (
          <div className="mt-4 rounded-2xl px-4 py-3 text-center" style={{ background: 'rgba(20,83,45,0.6)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <p className="text-sm font-bold text-green-400">Savings Rate: {savingsRate}%</p>
            <p className="text-xs text-green-300 mt-0.5">
              {savingsRate >= 20 ? '🌟 Outstanding savings habit!' : savingsRate >= 10 ? '✨ Good! Keep building that savings habit.' : '💡 Try to increase your savings rate to 20%+'}
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl px-4 py-3" style={{ background: 'rgba(60,20,10,0.6)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-xs font-bold text-yellow-300 mb-2">💡 Ways to make it work:</p>
            <ul className="space-y-1">
              {['Consider a higher-paying career path', 'Start a side hustle or business', 'Adjust 1-2 lifestyle choices', 'A dual income could make this very affordable', 'Build income streams over time'].map((tip, i) => (
                <li key={i} className="text-xs text-gray-300">• {tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

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

      {/* Career education summary */}
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
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" style={{ background: phase.color }}>
                        {j + 1}
                      </div>
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