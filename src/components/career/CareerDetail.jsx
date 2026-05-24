import { useState } from 'react';
import { ChevronRight, Bookmark } from 'lucide-react';
import { CATEGORY_COLORS, getCareerData } from './careerData';

const START_NOW_COLORS = {
  classes: '#3b82f6',
  clubs: '#a855f7',
  experience: '#22c55e',
  certifications: '#f59e0b',
  competitions: '#ec4899',
};

export default function CareerDetail({ career, onClose, onSelectCareer }) {
  const [tab, setTab] = useState('overview');
  const data = getCareerData(career);
  const color = CATEGORY_COLORS[career.category] || '#a855f7';

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(to bottom, #1a0a2e, #0d0618, #000)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-4 flex-shrink-0">
        <button onClick={onClose} className="flex items-center gap-1.5 text-gray-400 text-sm font-semibold">
          <ChevronRight size={16} className="rotate-180" /> Back
        </button>
        <button className="flex items-center gap-1.5 text-gray-400 text-sm font-semibold">
          <Bookmark size={15} /> Save
        </button>
      </div>

      {/* Career Hero */}
      <div className="px-4 pb-4 flex-shrink-0">
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color }}>{career.category}</p>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
            style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
            {career.emoji}
          </div>
          <h1 className="text-2xl font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            {career.title}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'path', label: 'Career Path' },
            { id: 'start', label: 'Start Now' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition"
              style={tab === t.id
                ? { background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff' }
                : { color: 'rgba(255,255,255,0.4)' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto flex-1 px-4 pb-8 space-y-4">

        {tab === 'overview' && (
          <>
            {/* Why This Career Glows */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span>⭐</span>
                <p className="text-sm font-bold text-yellow-300">Why This Career Glows</p>
              </div>
              <p className="text-sm text-white/80 italic leading-relaxed">"{data.glow_quote}"</p>
            </div>

            {/* Income Range */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-emerald-400 text-sm font-bold">$</span>
                <p className="text-sm font-bold text-white">Income Range</p>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{career.salary}</p>
              <p className="text-xs text-gray-500 mt-0.5">Annual salary (varies by experience and location)</p>
            </div>

            {/* A Day in the Life */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span>⚡</span>
                <p className="text-sm font-bold text-white">A Day in the Life</p>
              </div>
              <div className="space-y-2">
                {data.day_in_life.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ border: `1.5px solid ${color}` }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                    </div>
                    <p className="text-sm text-white/80">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Skills */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span>🎯</span>
                <p className="text-sm font-bold text-white">Key Skills</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.skills.map(skill => (
                  <span key={skill} className="text-xs px-3 py-1.5 rounded-full font-medium"
                    style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Side Hustle Ideas */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span>💡</span>
                <p className="text-sm font-bold text-white">Side Hustle Ideas</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.side_hustles.map(hustle => (
                  <span key={hustle} className="text-xs px-3 py-1.5 rounded-full font-medium"
                    style={{ background: 'rgba(234,179,8,0.12)', color: '#fde047', border: '1px solid rgba(234,179,8,0.25)' }}>
                    {hustle}
                  </span>
                ))}
              </div>
            </div>

            {/* Real Woman Spotlight */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span>👤</span>
                <p className="text-sm font-bold text-white">Real Woman Spotlight</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)' }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(236,72,153,0.4))' }}>
                    {data.real_woman.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-bold text-white text-sm">{data.real_woman.name}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(236,72,153,0.25)', color: '#f9a8d4' }}>
                        {data.real_woman.badge}
                      </span>
                    </div>
                    <p className="text-xs font-semibold" style={{ color }}>{data.real_woman.title}</p>
                    <p className="text-[10px] text-gray-500">{data.real_woman.school}</p>
                  </div>
                </div>
                <div className="border-l-2 pl-3 mb-3" style={{ borderColor: color }}>
                  <p className="text-sm text-white/80 italic leading-relaxed">"{data.real_woman.quote}"</p>
                </div>
                <p className="text-xs text-purple-400 font-semibold">Read her full story</p>
              </div>
            </div>

            {/* You May Also Like */}
            {data.related && data.related.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span>👤</span>
                  <p className="text-sm font-bold text-white">You May Also Like...</p>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  {data.related.map(rel => (
                    <button key={rel.id} onClick={() => onSelectCareer(rel)}
                      className="flex-shrink-0 w-36 rounded-2xl p-3 text-left transition hover:opacity-80"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="text-2xl mb-2">{rel.emoji}</div>
                      <p className="text-xs font-bold text-white leading-tight mb-1">{rel.title}</p>
                      <p className="text-[10px] font-semibold text-emerald-400">{rel.salary}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'path' && (
          <>
            {/* Education Path */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span>🎓</span>
                <p className="text-sm font-bold text-white">Education Path</p>
              </div>
              <div className="space-y-2">
                {data.education_path.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
                      style={{ background: 'rgba(59,130,246,0.3)', color: '#60a5fa', border: '1.5px solid rgba(59,130,246,0.5)' }}>
                      {i + 1}
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Ladder */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span>📈</span>
                <p className="text-sm font-bold text-white">Career Ladder</p>
              </div>
              <div className="space-y-3">
                {data.career_ladder.map((rung, i) => (
                  <div key={i} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-bold text-white text-sm">{rung.title}</p>
                      <p className="text-xs font-bold text-emerald-400 flex-shrink-0">{rung.salary}</p>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{rung.years}</p>
                    <p className="text-xs text-white/60 leading-relaxed">{rung.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Licensing */}
            {data.licensing && data.licensing.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span>📖</span>
                  <p className="text-sm font-bold text-white">Licensing and Exams</p>
                </div>
                <div className="space-y-2">
                  {data.licensing.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ border: `1.5px solid ${color}` }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                      </div>
                      <p className="text-sm text-white/80">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'start' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <span>⚡</span>
              <p className="text-sm font-bold text-white">Start Now in High School</p>
            </div>
            {Object.entries(data.start_now).map(([key, items]) => {
              const sectionColor = START_NOW_COLORS[key] || '#a855f7';
              return (
                <div key={key} className="rounded-2xl p-4"
                  style={{ background: `${sectionColor}10`, border: `1px solid ${sectionColor}30` }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: sectionColor }}>
                    {key.toUpperCase()}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item, i) => (
                      <span key={i} className="text-xs px-3 py-1.5 rounded-full font-medium text-white/80"
                        style={{ background: `${sectionColor}18`, border: `1px solid ${sectionColor}25` }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}