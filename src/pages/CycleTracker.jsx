import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Settings, Plus, Shield, Share2 } from 'lucide-react';
import useGlowPoints from '@/hooks/useGlowPoints';
import { toast } from 'sonner';

const SYMPTOMS = [
  { id: 'cramps', label: 'Cramps', emoji: '😣' },
  { id: 'headache', label: 'Headache', emoji: '🤕' },
  { id: 'bloating', label: 'Bloating', emoji: '🫧' },
  { id: 'acne', label: 'Acne', emoji: '🤔' },
  { id: 'back_pain', label: 'Back Pain', emoji: '😨' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { id: 'cravings', label: 'Cravings', emoji: '🍫' },
  { id: 'mood_swings', label: 'Mood Swings', emoji: '🎭' },
  { id: 'nausea', label: 'Nausea', emoji: '🤢' },
  { id: 'tender_breasts', label: 'Tender Breasts', emoji: '💗' },
  { id: 'heavy_flow', label: 'Heavy Flow', emoji: '💧' },
  { id: 'light_flow', label: 'Light Flow', emoji: '🩸' },
  { id: 'spotting', label: 'Spotting', emoji: '🔴' },
];

const MOODS = [
  { id: 'amazing', label: 'Amazing', emoji: '🤩' },
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'grateful', label: 'Grateful', emoji: '🙏' },
  { id: 'excited', label: 'Excited', emoji: '🎉' },
  { id: 'okay', label: 'Okay', emoji: '😐' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'stressed', label: 'Stressed', emoji: '😰' },
  { id: 'angry', label: 'Angry', emoji: '😤' },
];

const EDUCATION_CARDS = [
  { id: 'doctor', emoji: '🏥', title: 'When to See a Doctor', content: "See a doctor if: periods are extremely painful (can't function), bleeding soaks more than 1 pad/hour for 2+ hours, periods stop for 3+ months without pregnancy, or you have severe pelvic pain." },
  { id: 'heavy', emoji: '💧', title: 'Heavy Bleeding', content: 'Heavy flow means soaking a pad or tampon every 1-2 hours. If this happens for more than 2 hours, contact a doctor. Keep track of how many pads you use — this info helps your doctor.' },
  { id: 'cramps', emoji: '😣', title: 'Severe Cramps', content: "Mild to moderate cramps are normal. But if cramps are so severe you can't go to school or do daily activities, that's worth talking to a doctor about. Conditions like endometriosis are real and treatable." },
  { id: 'irregular', emoji: '📅', title: 'Irregular Periods', content: "It's normal for periods to be irregular when you first start. But if you've had periods for 2+ years and they're still very unpredictable, or if they suddenly change pattern, talk to a doctor." },
  { id: 'hydration', emoji: '💧', title: 'Hydration Matters', content: 'Drinking 8+ glasses of water during your period reduces bloating, headaches, and fatigue. Herbal teas (ginger, chamomile, peppermint) also help with cramps and nausea.' },
  { id: 'hygiene', emoji: '🌸', title: 'Period Hygiene', content: 'Change pads every 4-6 hours, tampons every 4-8 hours (never more than 8). Wash hands before and after. Avoid scented products near your vagina — they disrupt your natural pH.' },
  { id: 'products', emoji: '✅', title: 'Safe Products', content: 'Pads, tampons, menstrual cups, and period underwear are all safe options. Choose what feels comfortable for you. Avoid leaving tampons in too long (risk of TSS). Unscented is always better.' },
  { id: 'normal', emoji: '💡', title: "What's Normal?", content: 'Normal: 3-7 day periods, 21-35 day cycles, some cramping, mood changes, light to heavy flow. Not normal: periods lasting 10+ days, extreme pain, very heavy bleeding, or no period for 3+ months.' },
];

const CYCLE_PHASES = [
  { name: 'Menstrual', color: '#ec4899', emoji: '🩸', days: 'Days 1-5', desc: 'Period. Uterine lining sheds.' },
  { name: 'Follicular', color: '#22c55e', emoji: '🌱', days: 'Days 6-13', desc: 'Egg follicles mature. Estrogen rises.' },
  { name: 'Ovulation', color: '#a855f7', emoji: '✨', days: 'Day 14 (+/-2)', desc: 'Egg released. Peak fertility window.' },
  { name: 'Luteal', color: '#6366f1', emoji: '🌙', days: 'Days 15-28', desc: 'Progesterone rises. PMS may appear.' },
];

const OVULATION_SIGNS = [
  { emoji: '💧', title: 'Cervical Mucus', desc: "Clear, stretchy, egg-white consistency — your body's natural signal of peak fertility." },
  { emoji: '🌡️', title: 'Basal Body Temp', desc: 'A slight rise (0.2-0.5°F) after ovulation. Track first thing in the morning before getting up.' },
  { emoji: '💗', title: 'Mild Cramping', desc: 'Some girls feel a twinge or ache on one side of the lower abdomen — called mittelschmerz.' },
  { emoji: '✨', title: 'Heightened Energy', desc: "Many girls feel their most confident and social during ovulation — that's estrogen peaking!" },
  { emoji: '🌸', title: 'Breast Tenderness', desc: 'Slight tenderness or fullness can occur as hormones shift around ovulation.' },
  { emoji: '🔴', title: 'Light Spotting', desc: 'A small amount of light spotting can happen mid-cycle when the follicle releases the egg.' },
];

const SCHOOL_SURVIVAL = {
  kit: ['Extra pads/tampons in your bag', 'Pain reliever (ask parent/guardian)', 'Heating patch (stick-on)', 'Dark-colored backup pants or shorts', 'Snacks (crackers, chocolate)', 'Wet wipes'],
  affirmations: ["I am strong even when I don't feel like it. 💪", 'My body is doing something powerful. I honor it. 🌸', 'I can handle today. One hour at a time. ✨', 'I am not behind. I am human. 💜', 'Rest is part of my success strategy. 🌙'],
  studyTips: ['Study in shorter bursts (25 min on, 5 min off)', 'Choose easier tasks on heavy flow days', 'Use voice notes instead of writing if hands hurt', 'Ask for extensions if you genuinely need them', "Reward yourself after each task — you're doing great"],
  selfCare: ['Eat something warm before school', 'Wear your most comfortable outfit', "Tell a trusted friend or teacher if you're struggling", 'Give yourself permission to take bathroom breaks', 'Be proud — showing up is already a win'],
};

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getCurrentPhaseInfo(lastPeriodStart, cycleLength = 28) {
  if (!lastPeriodStart) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(lastPeriodStart + 'T00:00:00');
  const dayOfCycle = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
  const adjustedDay = ((dayOfCycle - 1) % cycleLength) + 1;

  if (adjustedDay <= 5) return { phase: 'Menstrual Phase', day: adjustedDay, total: cycleLength, color: '#ec4899', desc: 'Your body is shedding and renewing. Rest, hydrate, and be gentle with yourself.', tip1: '🩸 Light movement like yoga can help with cramps.', tip2: '🍵 Warm teas and heating pads are your best friends.' };
  if (adjustedDay <= 13) return { phase: 'Follicular Phase', day: adjustedDay, total: cycleLength, color: '#22c55e', desc: 'Energy is rising! Great time to start new projects and be social.', tip1: '✨ Your creativity and motivation are building.', tip2: '💪 This is a great time to work out and try new things.' };
  if (adjustedDay <= 15) return { phase: 'Ovulation Phase', day: adjustedDay, total: cycleLength, color: '#a855f7', desc: 'Peak energy and confidence. You are magnetic right now!', tip1: '✨ Confidence and energy may feel higher than usual.', tip2: '💡 Good week for interviews, content creation, and social events.', weeklyTips: ['Show up for that opportunity', 'Record content or go live', 'Network or meet new people', 'Speak your truth boldly'], energyLevel: 95 };
  return { phase: 'Luteal Phase', day: adjustedDay, total: cycleLength, color: '#6366f1', desc: 'Slowing down is natural. Honor your need for rest and self-care.', tip1: '🌙 PMS symptoms may appear — be extra kind to yourself.', tip2: '📓 Journaling and light exercise can help mood shifts.' };
}

function getNextPeriods(lastPeriodStart, cycleLength = 28) {
  if (!lastPeriodStart) return [];
  return [1, 2, 3].map(i => ({ date: addDays(lastPeriodStart, cycleLength * i), offset: cycleLength * i }));
}

function getOvulationInfo(lastPeriodStart, cycleLength = 28) {
  if (!lastPeriodStart) return null;
  const ovDay = Math.round(cycleLength / 2);
  const ovDate = addDays(lastPeriodStart, ovDay - 1);
  const fertileStart = addDays(ovDate, -5);
  const fertileEnd = addDays(ovDate, 1);
  const nextOvDate = addDays(ovDate, cycleLength);
  const nextFertileStart = addDays(nextOvDate, -5);
  const nextFertileEnd = addDays(nextOvDate, 1);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const inFertileWindow = today >= new Date(fertileStart + 'T00:00:00') && today <= new Date(fertileEnd + 'T00:00:00');
  return { ovDate, fertileStart, fertileEnd, nextOvDate, nextFertileStart, nextFertileEnd, inFertileWindow };
}

function MiniCalendar({ lastPeriodStart, cycleLength = 28 }) {
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const periodDays = new Set();
  const ovDays = new Set();
  const fertileDays = new Set();

  if (lastPeriodStart) {
    for (let i = -2; i <= 4; i++) {
      const cycleStart = addDays(lastPeriodStart, cycleLength * i);
      for (let d = 0; d < 5; d++) {
        const pd = addDays(cycleStart, d);
        const pDate = new Date(pd + 'T00:00:00');
        if (pDate.getMonth() === month && pDate.getFullYear() === year) periodDays.add(pDate.getDate());
      }
      const ovDate = addDays(cycleStart, Math.round(cycleLength / 2) - 1);
      const ovD = new Date(ovDate + 'T00:00:00');
      if (ovD.getMonth() === month && ovD.getFullYear() === year) ovDays.add(ovD.getDate());
      for (let d = -5; d <= 1; d++) {
        const fd = addDays(ovDate, d);
        const fDate = new Date(fd + 'T00:00:00');
        if (fDate.getMonth() === month && fDate.getFullYear() === year) fertileDays.add(fDate.getDate());
      }
    }
  }

  const today = new Date();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="glass rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => { const d = new Date(viewDate); d.setMonth(d.getMonth() - 1); setViewDate(d); }} className="text-gray-400 hover:text-white"><ChevronLeft size={18} /></button>
        <span className="text-white font-bold">{monthName}</span>
        <button onClick={() => { const d = new Date(viewDate); d.setMonth(d.getMonth() + 1); setViewDate(d); }} className="text-gray-400 hover:text-white text-lg">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-center text-xs text-gray-500">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
          const isPeriod = periodDays.has(d);
          const isOv = ovDays.has(d);
          const isFertile = fertileDays.has(d) && !isOv;
          return (
            <div key={i} className={`flex items-center justify-center h-8 w-8 mx-auto rounded-full text-xs font-medium
              ${isToday ? 'ring-2 ring-white' : ''}
              ${isPeriod ? 'bg-pink-500 text-white' : isOv ? 'bg-purple-500 text-white' : isFertile ? 'bg-purple-500/30 text-purple-300' : 'text-gray-300'}`}>
              {d}
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-3 justify-center text-xs text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" /> Period</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Ovulation</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500/40 inline-block" /> Fertile</span>
      </div>
    </div>
  );
}

export default function CycleTracker() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cycleLogs, setCycleLogs] = useState([]);
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('period');
  const [showSetup, setShowSetup] = useState(false);
  const [setupDate, setSetupDate] = useState('');
  const [setupCycleLen, setSetupCycleLen] = useState(28);

  const [sympTab, setSympTab] = useState('log');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [painLevel, setPainLevel] = useState(1);
  const [selectedMood, setSelectedMood] = useState('');
  const [notes, setNotes] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const totalPoints = useGlowPoints(user?.email);
  const [expandedCard, setExpandedCard] = useState(null);
  const [expandedSchool, setExpandedSchool] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const [logs, syms] = await Promise.all([
        base44.entities.CycleLog.filter({ user_email: u.email }),
        base44.entities.CycleSymptomLog.filter({ user_email: u.email }),
      ]);
      setCycleLogs(logs.sort((a, b) => b.period_start.localeCompare(a.period_start)));
      setSymptomLogs(syms.sort((a, b) => b.log_date.localeCompare(a.log_date)));
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const lastLog = cycleLogs[0];
  const lastPeriodStart = lastLog?.period_start;
  const cycleLength = lastLog?.cycle_length || 28;
  const phaseInfo = getCurrentPhaseInfo(lastPeriodStart, cycleLength);
  const nextPeriods = getNextPeriods(lastPeriodStart, cycleLength);
  const ovInfo = getOvulationInfo(lastPeriodStart, cycleLength);

  const handleSetupSave = async () => {
    if (!setupDate) return;
    const log = await base44.entities.CycleLog.create({ user_email: user.email, period_start: setupDate, cycle_length: setupCycleLen, period_length: 5 });
    setCycleLogs([log]);
    setShowSetup(false);
    toast.success('Cycle set up! 🌸');
  };

  const toggleSymptom = (id) => {
    setSelectedSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const saveSymptoms = async () => {
    setSaving(true);
    const existing = symptomLogs.find(s => s.log_date === logDate);
    const data = { user_email: user.email, log_date: logDate, symptoms: JSON.stringify(selectedSymptoms), pain_level: painLevel, mood: selectedMood, notes };
    if (existing) {
      await base44.entities.CycleSymptomLog.update(existing.id, data);
      setSymptomLogs(prev => prev.map(s => s.log_date === logDate ? { ...s, ...data } : s));
    } else {
      const s = await base44.entities.CycleSymptomLog.create(data);
      setSymptomLogs(prev => [s, ...prev]);
    }
    setSaving(false);
    toast.success('Symptoms saved! 💜');
    setSelectedSymptoms([]); setSelectedMood(''); setNotes(''); setPainLevel(1);
  };

  useEffect(() => {
    const existing = symptomLogs.find(s => s.log_date === logDate);
    if (existing) {
      setSelectedSymptoms(JSON.parse(existing.symptoms || '[]'));
      setPainLevel(existing.pain_level || 1);
      setSelectedMood(existing.mood || '');
      setNotes(existing.notes || '');
    } else {
      setSelectedSymptoms([]); setPainLevel(1); setSelectedMood(''); setNotes('');
    }
  }, [logDate, symptomLogs]);

  const recentSyms = symptomLogs.slice(0, 3).flatMap(s => JSON.parse(s.symptoms || '[]'));
  const allSyms = [...selectedSymptoms, ...recentSyms];
  const glowCareItems = [];
  if (allSyms.includes('headache')) glowCareItems.push({ emoji: '😣', title: 'Headache Care', tips: ['Drink a full glass of water first', 'Dim your screen brightness', 'Light neck and shoulder massage', 'Rest in a dark, quiet room'] });
  if (allSyms.includes('acne')) glowCareItems.push({ emoji: '🌸', title: 'Skin Care', tips: ['Avoid touching your face', 'Use a gentle, non-comedogenic cleanser', 'Stay hydrated — water is your BFF', 'Zinc-rich foods help (pumpkin seeds, chickpeas)'] });
  if (allSyms.includes('nausea')) glowCareItems.push({ emoji: '🫚', title: 'Nausea Relief', tips: ['Ginger tea or ginger chews', 'Eat small amounts frequently', 'Avoid strong smells if possible', 'Fresh air and slow deep breaths'] });
  if (allSyms.includes('cramps')) glowCareItems.push({ emoji: '🔥', title: 'Cramp Relief', tips: ['Apply a heating pad to your lower abdomen', 'Try gentle yoga or stretching', 'Magnesium-rich foods help (dark chocolate, bananas)', 'Ibuprofen works best taken early'] });

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0b1a' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">

        <div className="flex justify-end mb-2">
          <div className="glass rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1">
            <span>🏅</span><span className="text-yellow-400">{totalPoints !== null ? totalPoints.toLocaleString() : '...'} pts</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={22} /></button>
            <div>
              <p className="text-xs text-purple-400 font-semibold tracking-wider">🌸 CYCLE &amp; WELLNESS</p>
              <h1 className="text-2xl font-bold text-white">Know Your Body</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-full glass flex items-center justify-center text-gray-400"><Settings size={18} /></button>
            <button onClick={() => setShowSetup(true)} className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center"><Plus size={18} /></button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'period', label: '🩸 Period' },
            { id: 'ovulation', label: '✨ Ovulation' },
            { id: 'symptoms', label: '📊 Symptoms' },
            { id: 'insights', label: '💡 Insights' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition ${activeTab === tab.id ? 'text-white' : 'glass text-gray-400'}`}
              style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' } : {}}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 glass rounded-xl px-3 py-2 mb-4 text-xs text-gray-400">
          <Shield size={14} className="text-purple-400" />
          Your cycle data is private and only visible to you.
        </div>

        {/* PERIOD TAB */}
        {activeTab === 'period' && (
          <>
            {!lastPeriodStart ? (
              <div className="glass rounded-2xl p-6 text-center mb-4">
                <p className="text-4xl mb-3">🌸</p>
                <p className="text-white font-bold mb-2">Start Tracking Your Cycle</p>
                <p className="text-gray-400 text-sm mb-4">Log your last period to get personalized insights and predictions.</p>
                <button onClick={() => setShowSetup(true)} className="px-6 py-2.5 rounded-full font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                  + Log First Period
                </button>
              </div>
            ) : (
              <>
                {phaseInfo && (
                  <div className="rounded-2xl p-4 mb-4 border" style={{ background: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.3)' }}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs text-purple-400 font-semibold tracking-wider">CURRENT PHASE</p>
                      <p className="text-xs text-gray-400">Day {phaseInfo.day} of {phaseInfo.total}</p>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">✨</span>
                      <p className="text-lg font-bold" style={{ color: phaseInfo.color }}>{phaseInfo.phase}</p>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{phaseInfo.desc}</p>
                    <div className="w-full h-1.5 bg-white/10 rounded-full mb-3">
                      <div className="h-full rounded-full" style={{ width: `${(phaseInfo.day / phaseInfo.total) * 100}%`, background: 'linear-gradient(90deg, #ec4899, #a855f7)' }} />
                    </div>
                    <p className="text-sm text-gray-300">{phaseInfo.tip1}</p>
                    <p className="text-sm text-gray-300 mt-1">{phaseInfo.tip2}</p>
                  </div>
                )}

                <div className="glass rounded-2xl p-4 mb-4">
                  <p className="font-bold text-white mb-3">Predicted Next Periods</p>
                  {nextPeriods.map((p, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />
                        <span className="text-sm text-white">{formatDate(p.date)}</span>
                      </div>
                      <span className="text-xs text-gray-500">{i === 0 ? 'Next' : `+${p.offset}d`}</span>
                    </div>
                  ))}
                </div>

                <MiniCalendar lastPeriodStart={lastPeriodStart} cycleLength={cycleLength} />
              </>
            )}
          </>
        )}

        {/* OVULATION TAB */}
        {activeTab === 'ovulation' && (
          <>
            {!ovInfo ? (
              <div className="glass rounded-2xl p-6 text-center mb-4">
                <p className="text-white font-bold mb-2">Log your period first</p>
                <button onClick={() => setShowSetup(true)} className="px-5 py-2 rounded-full text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>+ Log Period</button>
              </div>
            ) : (
              <>
                <div className="rounded-2xl p-4 mb-4 border" style={{ background: 'rgba(168,85,247,0.12)', borderColor: 'rgba(168,85,247,0.4)' }}>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs text-purple-400 font-semibold tracking-wider">OVULATION WINDOW</p>
                    {ovInfo.inFertileWindow && <span className="text-xs bg-purple-500 px-2 py-0.5 rounded-full text-white font-bold">✨ Fertile Now</span>}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">✨</span>
                    <p className="text-lg font-bold text-white">{ovInfo.inFertileWindow ? "You're in your fertile window!" : `Predicted ovulation: ${formatShort(ovInfo.ovDate)}`}</p>
                  </div>
                  {ovInfo.inFertileWindow && <p className="text-gray-400 text-sm mb-3">Predicted ovulation: {formatShort(ovInfo.ovDate)}</p>}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[
                      { label: 'FERTILE START', date: ovInfo.fertileStart },
                      { label: 'OVULATION', date: ovInfo.ovDate, highlight: true },
                      { label: 'FERTILE END', date: ovInfo.fertileEnd },
                    ].map((item, i) => (
                      <div key={i} className={`rounded-xl p-2 text-center ${item.highlight ? 'bg-purple-500' : 'bg-white/5'}`}>
                        <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                        <p className={`font-bold text-sm ${item.highlight ? 'text-white' : 'text-gray-200'}`}>{formatShort(item.date)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-4 mb-4">
                  <p className="font-bold text-white mb-2">Next Cycle Ovulation</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xl font-bold text-white">{formatShort(ovInfo.nextOvDate)}</p>
                      <p className="text-xs text-gray-400">Fertile window: {formatShort(ovInfo.nextFertileStart)} – {formatShort(ovInfo.nextFertileEnd)}</p>
                    </div>
                    <span className="text-2xl">🌙</span>
                  </div>
                </div>

                <div className="glass rounded-2xl p-4 mb-4">
                  <p className="font-bold text-white mb-3">Signs of Ovulation</p>
                  <div className="space-y-3">
                    {OVULATION_SIGNS.map((s, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-xl flex-shrink-0">{s.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold text-white">{s.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-4 mb-4">
                  <p className="font-bold text-white mb-3">Your Cycle Phases</p>
                  <div className="space-y-3">
                    {CYCLE_PHASES.map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: p.color + '30', border: `1px solid ${p.color}50` }}>{p.emoji}</div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="text-sm font-semibold" style={{ color: p.color }}>{p.name}</p>
                            <p className="text-xs text-gray-500">{p.days}</p>
                          </div>
                          <p className="text-xs text-gray-400">{p.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl p-4 mb-4 border border-yellow-500/30" style={{ background: 'rgba(234,179,8,0.08)' }}>
                  <p className="font-bold text-yellow-400 mb-2">💡 Good to Know</p>
                  <p className="text-sm text-gray-300">These predictions are based on your average cycle length. Everyone's body is different — stress, illness, and lifestyle can shift your ovulation date. For family planning or health concerns, always consult a healthcare provider.</p>
                </div>
              </>
            )}
          </>
        )}

        {/* SYMPTOMS TAB */}
        {activeTab === 'symptoms' && (
          <>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setSympTab('log')} className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold transition ${sympTab === 'log' ? 'text-white' : 'glass text-gray-400'}`} style={sympTab === 'log' ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' } : {}}>
                📋 Log Symptoms
              </button>
              <button onClick={() => setSympTab('history')} className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold transition ${sympTab === 'history' ? 'text-white' : 'glass text-gray-400'}`} style={sympTab === 'history' ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' } : {}}>
                📅 History
              </button>
            </div>

            {sympTab === 'log' && (
              <>
                <div className="glass rounded-2xl p-3 mb-4">
                  <p className="text-xs text-gray-500 mb-1">DATE</p>
                  <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)}
                    className="bg-transparent text-white text-sm outline-none w-full" />
                </div>

                <div className="glass rounded-2xl p-4 mb-4">
                  <p className="text-xs text-pink-400 font-semibold tracking-wider mb-3">SYMPTOMS — TAP ALL THAT APPLY</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SYMPTOMS.map(s => (
                      <button key={s.id} onClick={() => toggleSymptom(s.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm border transition ${selectedSymptoms.includes(s.id) ? 'bg-pink-500/20 border-pink-500/60 text-white' : 'bg-white/5 border-white/10 text-gray-300'}`}>
                        <span>{s.emoji}</span> {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-4 mb-4">
                  <p className="text-xs text-yellow-400 font-semibold tracking-wider mb-3">PAIN LEVEL: {painLevel}/10</p>
                  <input type="range" min="1" max="10" value={painLevel} onChange={e => setPainLevel(Number(e.target.value))}
                    className="w-full accent-pink-500" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 — No pain</span><span>10 — Severe</span>
                  </div>
                </div>

                <div className="glass rounded-2xl p-4 mb-4">
                  <p className="text-xs text-purple-400 font-semibold mb-3">💜 MOOD</p>
                  <div className="grid grid-cols-4 gap-2">
                    {MOODS.map(m => (
                      <button key={m.id} onClick={() => setSelectedMood(m.id === selectedMood ? '' : m.id)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition ${selectedMood === m.id ? 'bg-purple-500/30 border-purple-500/60' : 'bg-white/5 border-white/10'}`}>
                        <span className="text-xl">{m.emoji}</span>
                        <span className="text-xs text-gray-300">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-4 mb-4">
                  <p className="text-xs text-gray-500 font-semibold tracking-wider mb-2">NOTES (OPTIONAL)</p>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="How are you feeling overall? Any other symptoms?"
                    className="w-full bg-transparent text-white text-sm outline-none resize-none placeholder-gray-600 h-16" />
                </div>

                <button onClick={saveSymptoms} disabled={saving}
                  className="w-full py-3.5 rounded-2xl font-bold text-white text-sm mb-4 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                  💜 {saving ? 'Saving...' : 'Save Symptoms'}
                </button>
              </>
            )}

            {sympTab === 'history' && (
              <div className="space-y-3">
                {symptomLogs.length === 0 ? (
                  <div className="glass rounded-2xl p-8 text-center">
                    <p className="text-3xl mb-2">📊</p>
                    <p className="text-white font-semibold">No logs yet</p>
                    <p className="text-gray-400 text-sm mt-1">Start logging your symptoms to see history here.</p>
                  </div>
                ) : symptomLogs.map(log => {
                  const syms = JSON.parse(log.symptoms || '[]');
                  return (
                    <div key={log.id} className="glass rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-bold text-white">{formatDate(log.log_date)}</p>
                        {log.mood && <span className="text-lg">{MOODS.find(m => m.id === log.mood)?.emoji}</span>}
                      </div>
                      {syms.length > 0 && <div className="flex flex-wrap gap-1 mb-2">{syms.map(s => {
                        const sym = SYMPTOMS.find(x => x.id === s);
                        return sym ? <span key={s} className="text-xs bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/30">{sym.emoji} {sym.label}</span> : null;
                      })}</div>}
                      {log.pain_level > 1 && <p className="text-xs text-gray-400">Pain: {log.pain_level}/10</p>}
                      {log.notes && <p className="text-xs text-gray-500 mt-1">{log.notes}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <>
            {phaseInfo ? (
              <div className="rounded-2xl p-4 mb-4 border" style={{ background: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.3)' }}>
                <p className="text-xs text-purple-400 font-semibold tracking-wider mb-2">{phaseInfo.phase.toUpperCase()} · DAY {phaseInfo.day}</p>
                <p className="text-white font-bold text-lg mb-2">{phaseInfo.desc}</p>
                {phaseInfo.energyLevel && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Energy Level</span><span>{phaseInfo.energyLevel}%</span></div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full"><div className="h-full rounded-full" style={{ width: `${phaseInfo.energyLevel}%`, background: 'linear-gradient(90deg,#ec4899,#a855f7)' }} /></div>
                  </div>
                )}
                <p className="text-sm text-gray-300">{phaseInfo.tip1}</p>
                <p className="text-sm text-gray-300 mt-1">{phaseInfo.tip2}</p>
                {phaseInfo.weeklyTips && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">THIS WEEK, TRY:</p>
                    {phaseInfo.weeklyTips.map((t, i) => <p key={i} className="text-sm text-gray-300 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />{t}</p>)}
                  </div>
                )}
                <button className="mt-3 w-full py-2 rounded-xl glass text-xs text-gray-400 flex items-center justify-center gap-2">
                  <Share2 size={14} /> Share This Phase Quote
                </button>
              </div>
            ) : (
              <div className="glass rounded-2xl p-4 text-center mb-4">
                <p className="text-2xl mb-2">💡</p>
                <p className="text-sm text-gray-400">Log symptoms for 3+ days to unlock your personal cycle insights.</p>
              </div>
            )}

            {glowCareItems.length > 0 && (
              <div className="glass rounded-2xl p-4 mb-4">
                <p className="font-bold text-white mb-1">💜 Glow Care for You <span className="text-xs text-gray-500 font-normal ml-1">Based on your recent symptoms</span></p>
                <div className="space-y-3 mt-3">
                  {glowCareItems.map((item, i) => (
                    <div key={i} className="border border-pink-500/20 rounded-xl p-3">
                      <p className="font-semibold text-white text-sm mb-2">{item.emoji} {item.title}</p>
                      {item.tips.map((t, j) => <p key={j} className="text-xs text-gray-400 flex items-start gap-1.5 mb-1"><span className="text-pink-400 mt-0.5">•</span>{t}</p>)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass rounded-2xl p-4 mb-4">
              <p className="font-bold text-white mb-3">📚 Know Your Body <span className="text-xs text-gray-500 font-normal ml-1">Education cards</span></p>
              <div className="space-y-2">
                {EDUCATION_CARDS.map(card => (
                  <div key={card.id} className={`rounded-xl border transition ${expandedCard === card.id ? 'border-purple-500/40 bg-purple-500/10' : 'border-white/10 bg-white/5'}`}>
                    <button className="w-full flex items-center justify-between px-3 py-3" onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}>
                      <span className="flex items-center gap-2 text-sm font-semibold text-white"><span>{card.emoji}</span>{card.title}</span>
                      <span className="text-gray-500 text-xs">{expandedCard === card.id ? '▲' : '▼'}</span>
                    </button>
                    {expandedCard === card.id && (
                      <div className="px-3 pb-3 text-sm text-gray-300">{card.content}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4 mb-4">
              <button className="w-full flex items-center justify-between" onClick={() => setExpandedSchool(!expandedSchool)}>
                <div className="text-left">
                  <p className="font-bold text-white">🎒 School Survival Mode 🩸</p>
                  <p className="text-xs text-gray-500">Period week tips for school days</p>
                </div>
                <span className="text-gray-500 text-xs flex-shrink-0">{expandedSchool ? '▲' : '▼'}</span>
              </button>
              {expandedSchool && (
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs text-red-400 font-semibold tracking-wider mb-2">🔴 EMERGENCY KIT CHECKLIST</p>
                    {SCHOOL_SURVIVAL.kit.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 py-1">
                        <div className="w-4 h-4 rounded-full border-2 border-purple-500 flex-shrink-0" />
                        <p className="text-sm text-gray-300">{item}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs text-purple-400 font-semibold tracking-wider mb-2">💜 AFFIRMATIONS FOR TODAY</p>
                    {SCHOOL_SURVIVAL.affirmations.map((a, i) => (
                      <div key={i} className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-2 mb-2">
                        <p className="text-sm text-gray-200 italic">{a}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs text-green-400 font-semibold tracking-wider mb-2">📚 LOW-ENERGY STUDY TIPS</p>
                    {SCHOOL_SURVIVAL.studyTips.map((t, i) => <p key={i} className="text-sm text-gray-300 flex items-start gap-1.5 mb-1"><span className="text-green-400 mt-0.5">•</span>{t}</p>)}
                  </div>
                  <div>
                    <p className="text-xs text-pink-400 font-semibold tracking-wider mb-2">🌸 SELF-CARE REMINDERS</p>
                    {SCHOOL_SURVIVAL.selfCare.map((t, i) => <p key={i} className="text-sm text-gray-300 flex items-start gap-1.5 mb-1"><span className="text-pink-400 mt-0.5">•</span>{t}</p>)}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showSetup && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4" onClick={() => setShowSetup(false)}>
          <div className="w-full max-w-lg glass-strong rounded-3xl p-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <p className="text-white font-bold text-lg">🌸 Log Period</p>
              <button onClick={() => setShowSetup(false)} className="text-gray-400 hover:text-white text-xl leading-none">✕</button>
            </div>
            <p className="text-xs text-gray-400 mb-1">When did your last period start?</p>
            <input type="date" value={setupDate} onChange={e => setSetupDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-white text-sm outline-none mb-3" />
            <p className="text-xs text-gray-400 mb-1">Average cycle length (days)</p>
            <input type="number" value={setupCycleLen} onChange={e => setSetupCycleLen(Number(e.target.value))} min="21" max="35"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-white text-sm outline-none mb-4" />
            <button onClick={handleSetupSave} disabled={!setupDate}
              className="w-full py-3 rounded-2xl font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
              Save
            </button>
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}