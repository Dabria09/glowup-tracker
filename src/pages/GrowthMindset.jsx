import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Brain, RefreshCcw, HelpCircle, BookOpen, Lightbulb, XCircle, CheckCircle, Sparkles, NotebookPen, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserPoints } from '@/lib/pointsHelper';

const SITUATIONS = [
  {
    situation: "You fail a test",
    fixed: "I'm just not smart. I'll never get math.",
    fixedBelief: "I'm not smart",
    growth: "I didn't get it yet. Let me figure out what I missed and try again.",
    growthBelief: "I haven't mastered it yet"
  },
  {
    situation: "Someone is better at something than you",
    fixed: "She's just naturally talented. I can't compete with that.",
    fixedBelief: "She's just gifted",
    growth: "She's been working at this. What can I learn from watching her?",
    growthBelief: "She's been putting in work"
  },
  {
    situation: "You try something new and struggle",
    fixed: "I'm terrible at this. I should just quit before I embarrass myself.",
    fixedBelief: "I'm terrible at this",
    growth: "This is hard right now because it's new. Every expert was once a beginner.",
    growthBelief: "This is just the beginning"
  },
  {
    situation: "You get criticized",
    fixed: "They're attacking me. They don't like me.",
    fixedBelief: "They're attacking me",
    growth: "This feedback is uncomfortable but it's showing me where I can grow.",
    growthBelief: "This is useful information"
  },
  {
    situation: "You see someone successful",
    fixed: "Must be nice to be born lucky. Some people just have it.",
    fixedBelief: "She got lucky",
    growth: "What did she do to get there? I can study her path and build my own.",
    growthBelief: "She built that — I can too"
  },
  {
    situation: "You make a mistake in front of people",
    fixed: "I'm so embarrassing. Everyone thinks I'm stupid now.",
    fixedBelief: "I'm so embarrassing",
    growth: "Mistakes are proof I'm trying. I'll laugh it off and keep going.",
    growthBelief: "Mistakes mean I'm growing"
  },
];

const REFRAMES = [
  { fixed: "I'm bad at this.", growth: "I'm still learning this." },
  { fixed: "I give up.", growth: "Let me try a different approach." },
  { fixed: "This is too hard.", growth: "This is going to take some effort." },
  { fixed: "I made a mistake.", growth: "Mistakes help me learn." },
  { fixed: "She's so much better than me.", growth: "She inspires me to keep growing." },
  { fixed: "I can't do math.", growth: "I can't do math yet." },
  { fixed: "I'm not a leader.", growth: "I'm developing my leadership skills." },
  { fixed: "I'll never be good enough.", growth: "I'm becoming better every day." },
  { fixed: "I failed.", growth: "I found a way that doesn't work — now I know more." },
  { fixed: "Nobody believes in me.", growth: "I believe in myself and I'm proving it." },
];

const QUIZ_QUESTIONS = [
  {
    q: "You bomb a presentation in class. Your first thought is:",
    options: [
      { text: "I'm terrible at public speaking. I'll never be good at this.", type: "fixed" },
      { text: "That was rough. What can I do differently next time?", type: "growth" },
      { text: "Everyone's going to remember that forever.", type: "fixed" },
      { text: "I need more practice — this is just one moment.", type: "growth" },
    ]
  },
  {
    q: "Your friend gets a higher grade than you on a test you both studied for. You think:",
    options: [
      { text: "She's just smarter than me.", type: "fixed" },
      { text: "Maybe her study method worked better — I'll ask her about it.", type: "growth" },
      { text: "I'll never be as smart as her.", type: "fixed" },
      { text: "We studied differently. I can adjust my approach.", type: "growth" },
    ]
  },
  {
    q: "You try out for the team and don't make it. You:",
    options: [
      { text: "Decide you're just not athletic and quit trying.", type: "fixed" },
      { text: "Ask the coach what you need to work on and train harder.", type: "growth" },
      { text: "Feel embarrassed and never try out for anything again.", type: "fixed" },
      { text: "Use this as fuel to get better and try again next season.", type: "growth" },
    ]
  },
  {
    q: "Someone gives you critical feedback on your work. You feel:",
    options: [
      { text: "Attacked. They just don't like me.", type: "fixed" },
      { text: "Uncomfortable but curious — what can I improve?", type: "growth" },
      { text: "Like giving up. Why even try if it's not good enough?", type: "fixed" },
      { text: "Grateful for the honest input, even if it stings.", type: "growth" },
    ]
  },
  {
    q: "You're learning something new and struggling. You tell yourself:",
    options: [
      { text: "I'm just not built for this.", type: "fixed" },
      { text: "This is hard right now, but hard things get easier with practice.", type: "growth" },
      { text: "Other people pick this up so easily — something must be wrong with me.", type: "fixed" },
      { text: "Every expert started as a beginner. I'm in my beginner era.", type: "growth" },
    ]
  },
];

const JOURNAL_PROMPTS = [
  { id: "reflection", emoji: "🔎", title: "REFLECTION", prompt: "Think of a time you gave up on something because it felt too hard. What would a growth mindset version of you have done differently?" },
  { id: "evidence", emoji: "💪", title: "EVIDENCE OF GROWTH", prompt: "What is one skill you used to be terrible at that you're now decent at? How did that happen? What does that tell you about your ability to grow?" },
  { id: "reframing", emoji: "🎯", title: "REFRAMING", prompt: "Name one area of your life where you've been telling yourself 'I'm just not good at this.' Now rewrite that story using a growth mindset. What would change if you believed you could improve?" },
  { id: "role_models", emoji: "🌱", title: "ROLE MODELS", prompt: "Who in your life has a growth mindset? What do you notice about how they handle setbacks? How can you adopt some of their habits?" },
  { id: "courage", emoji: "🔥", title: "COURAGE", prompt: "What challenge are you currently avoiding because you're afraid of failing? Write about what would happen if you tried anyway — even if you didn't succeed right away." },
  { id: "lessons", emoji: "⭐", title: "LESSONS FROM FAILURE", prompt: "Write about a failure or setback that actually taught you something valuable. What did you learn? How did it make you stronger or smarter?" },
];

function SituationAccordion({ item, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <button className="w-full flex items-start justify-between px-4 py-4 text-left" onClick={() => setOpen(!open)}>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Situation {index + 1}</p>
          <p className="text-white font-semibold text-sm">{item.situation}</p>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400 mt-1 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 mt-1 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div className="flex items-center gap-2 text-xs font-bold text-red-300"><XCircle size={14} /> FIXED MINDSET</div>
            <p className="text-white text-sm italic">"{item.fixed}"</p>
            <p className="text-xs text-red-400">Core belief: "{item.fixedBelief}"</p>
          </div>
          <div className="flex justify-center"><RefreshCcw size={16} className="text-gray-500" /></div>
          <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <div className="flex items-center gap-2 text-xs font-bold text-green-300"><CheckCircle size={14} /> GROWTH MINDSET</div>
            <p className="text-white text-sm italic">"{item.growth}"</p>
            <p className="text-xs text-green-400">Core belief: "{item.growthBelief}"</p>
          </div>
        </div>
      )}
    </div>
  );
}

function JournalPrompt({ item }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (!text.trim()) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <button className="w-full flex items-center justify-between px-4 py-4 text-left" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <span className="text-xl">{item.emoji}</span>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.title}</p>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-sm text-gray-300">{item.prompt}</p>
          <textarea
            rows={4}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write your thoughts here..."
            className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <div className="flex justify-end">
            <button onClick={save} className="text-sm font-semibold" style={{ color: '#a855f7' }}>
              {saved ? '✓ Saved!' : 'Save Reflection →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GrowthMindset() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('learn');
  const [userPoints, setUserPoints] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => getUserPoints(u.email).then(setUserPoints)).catch(() => {});
  }, []);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizDone, setQuizDone] = useState(false);

  const handleAnswer = (type) => {
    const newAnswers = [...quizAnswers, type];
    if (quizIndex < QUIZ_QUESTIONS.length - 1) {
      setQuizAnswers(newAnswers);
      setQuizIndex(quizIndex + 1);
    } else {
      setQuizAnswers(newAnswers);
      setQuizDone(true);
    }
  };

  const retakeQuiz = () => {
    setQuizIndex(0);
    setQuizAnswers([]);
    setQuizDone(false);
  };

  const growthCount = quizAnswers.filter(a => a === 'growth').length;
  const fixedCount = quizAnswers.filter(a => a === 'fixed').length;

  const quizResult = growthCount > fixedCount
    ? { label: 'Growth Mindset 🌱', desc: 'You embrace challenges and believe in your ability to grow. Keep pushing!', color: '#22c55e' }
    : growthCount < fixedCount
    ? { label: 'Fixed Mindset 🔒', desc: "You have some limiting beliefs holding you back. That's okay — awareness is the first step!", color: '#ef4444' }
    : { label: 'In Transition 🔄', desc: "You're right in the middle — sometimes growth, sometimes fixed. The good news? You're aware, and awareness is the first step to change.", color: '#a855f7' };

  const TABS = [
    { id: 'learn', label: 'Learn', emoji: '📖' },
    { id: 'compare', label: 'Compare', emoji: '⚡' },
    { id: 'reframe', label: 'Reframe', emoji: '🖥️' },
    { id: 'quiz', label: 'Quiz', emoji: '🧠' },
    { id: 'journal', label: 'Journal', emoji: '📝' },
  ];

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={22} /></button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2"><Brain size={22} className="text-purple-400" />Growth Mindset</h1>
            <p className="text-xs text-gray-400">vs Fixed Mindset</p>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: 'rgba(255,200,0,0.15)', border: '1px solid rgba(255,200,0,0.3)' }}>
            🏅 {userPoints !== null ? userPoints.toLocaleString() : '—'} pts
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 px-3 py-2 rounded-xl font-semibold text-xs transition"
              style={activeTab === tab.id
                ? { background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }
              }
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {/* LEARN */}
        {activeTab === 'learn' && (
          <div className="space-y-5">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(99,60,180,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">🧠 Your Mindset Is Your Superpower</h2>
              <p className="text-sm text-gray-300">Your mindset is the lens through which you see yourself and the world. It shapes how you respond to challenges, setbacks, criticism, and success. The difference between a growth mindset and a fixed mindset isn't about how smart you are — it's about what you <span className="font-bold text-white">believe</span> about your ability to grow.</p>
            </div>

            <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <h3 className="text-lg font-bold text-red-300 flex items-center gap-2"><XCircle size={20} /> Fixed Mindset</h3>
              <p className="text-sm text-gray-300">A <span className="font-bold text-red-300">fixed mindset</span> is the belief that your intelligence, talent, and abilities are set in stone — you either have it or you don't. People with a fixed mindset avoid challenges because failure feels like proof of their limitations.</p>
              <ul className="space-y-2 text-sm text-gray-300">
                {["Avoids challenges to look smart","Gives up when things get hard","Sees effort as pointless — 'if I have to try, I must not be good at it'","Ignores feedback and criticism","Feels threatened by other people's success","Believes talent alone creates success"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2"><XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />{item}</li>
                ))}
              </ul>
              <div className="rounded-xl p-3 italic text-sm text-red-200" style={{ border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)' }}>
                "I'm just not a math person. I never will be."
              </div>
            </div>

            <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <h3 className="text-lg font-bold text-green-300 flex items-center gap-2"><CheckCircle size={20} /> Growth Mindset</h3>
              <p className="text-sm text-gray-300">A <span className="font-bold text-green-300">growth mindset</span> is the belief that your abilities can be developed through dedication, hard work, and learning. People with a growth mindset embrace challenges because they know struggle is part of the process.</p>
              <ul className="space-y-2 text-sm text-gray-300">
                {["Embraces challenges as opportunities to grow","Persists through obstacles and setbacks","Sees effort as the path to mastery","Learns from criticism and feedback","Finds inspiration in others' success","Believes dedication and hard work build talent"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2"><CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />{item}</li>
                ))}
              </ul>
              <div className="rounded-xl p-3 italic text-sm text-green-200" style={{ border: '1px solid rgba(34,197,94,0.4)', background: 'rgba(34,197,94,0.1)' }}>
                "I'm not great at math yet — but I'm working on it and I'm getting better."
              </div>
            </div>

            <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="text-lg font-bold flex items-center gap-2">💡 The Science Behind It</h2>
              <p className="text-sm text-gray-300">Dr. Carol Dweck, a Stanford psychologist, spent decades studying how mindset affects achievement. Her research found that students who believed their intelligence could grow performed significantly better over time — even when they started at the same level as students with fixed mindsets.</p>
              <p className="text-sm text-gray-300">The brain is <span className="font-bold text-purple-300">neuroplastic</span> — it literally changes and grows when you learn new things. Every time you struggle through something hard, your brain is building new neural connections. Difficulty isn't a sign that you can't do it — it's a sign that your brain is growing.</p>
              <div className="rounded-xl p-3 text-sm space-y-1" style={{ background: 'rgba(180,140,0,0.2)', border: '1px solid rgba(234,179,8,0.3)' }}>
                <p className="font-bold text-yellow-300">The Power of "Yet"</p>
                <p className="text-yellow-200">Adding the word "yet" to the end of a fixed mindset statement completely changes its meaning. "I can't do this" becomes "I can't do this <span className="font-bold">yet</span>." That one word opens the door to possibility.</p>
              </div>
            </div>

            <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(99,60,180,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}>
              <h2 className="text-lg font-bold flex items-center gap-2">☆ Why This Matters for Your Glow Up</h2>
              <p className="text-sm text-gray-300">Your glow up isn't just about how you look — it's about who you're <span className="font-bold text-white">becoming</span>. A growth mindset is the foundation of every goal you'll set, every challenge you'll face, and every version of yourself you'll grow into. The girls who glow the hardest aren't the ones who never struggle — they're the ones who refuse to let struggle stop them.</p>
            </div>

            <button
              onClick={() => setActiveTab('compare')}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
            >
              See Side-by-Side Comparisons →
            </button>
          </div>
        )}

        {/* COMPARE */}
        {activeTab === 'compare' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-sm text-gray-300">Same situation. Two completely different responses. See how mindset changes everything — and practice recognizing which voice is speaking in your own head.</p>
            </div>
            {SITUATIONS.map((item, index) => (
              <SituationAccordion key={index} item={item} index={index} />
            ))}
          </div>
        )}

        {/* REFRAME */}
        {activeTab === 'reframe' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(99,60,180,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <h2 className="text-lg font-bold mb-2">The Reframe Tool</h2>
              <p className="text-sm text-gray-300">Fixed mindset thoughts sneak in automatically. The skill is catching them and consciously rewriting them. Practice these reframes until they become your default.</p>
            </div>
            <div className="space-y-3">
              {REFRAMES.map((item, i) => (
                <div key={i} className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-2 text-sm text-red-300 line-through"><XCircle size={14} />{item.fixed}</div>
                  <div className="flex items-center gap-2 text-sm text-green-300"><CheckCircle size={14} />{item.growth}</div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(180,140,0,0.15)', border: '1px solid rgba(234,179,8,0.3)' }}>
              <p className="font-bold text-yellow-300 text-sm flex items-center gap-2">💡 Practice Tip</p>
              <p className="text-yellow-200 text-sm">Every morning this week, pick one fixed mindset thought you've been carrying and rewrite it. Say the growth version out loud 3 times. Your brain will start to believe what you repeat.</p>
            </div>
          </div>
        )}

        {/* QUIZ */}
        {activeTab === 'quiz' && (
          <div className="space-y-4">
            {!quizDone ? (
              <>
                <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400">Question {quizIndex + 1} of {QUIZ_QUESTIONS.length}</p>
                    <div className="flex gap-1">
                      {QUIZ_QUESTIONS.map((_, i) => (
                        <div key={i} className="w-3 h-3 rounded-full" style={{ background: i < quizIndex ? '#a855f7' : i === quizIndex ? '#ec4899' : 'rgba(255,255,255,0.15)' }} />
                      ))}
                    </div>
                  </div>
                  <div className="h-1 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="h-1 rounded-full transition-all" style={{ background: 'linear-gradient(90deg,#7c3aed,#ec4899)', width: `${((quizIndex) / QUIZ_QUESTIONS.length) * 100}%` }} />
                  </div>
                  <p className="font-bold text-white text-base">{QUIZ_QUESTIONS[quizIndex].q}</p>
                </div>
                <div className="space-y-3">
                  {QUIZ_QUESTIONS[quizIndex].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt.type)}
                      className="w-full text-left px-4 py-4 rounded-2xl text-sm text-white transition hover:opacity-80"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl p-5 text-center" style={{ background: 'rgba(99,60,180,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
                  <h2 className="text-xl font-bold mb-2" style={{ color: quizResult.color }}>{quizResult.label}</h2>
                  <p className="text-sm text-gray-300">{quizResult.desc}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                    <p className="text-4xl font-bold text-green-300">{growthCount}</p>
                    <p className="text-xs text-green-400 mt-1">Growth Responses</p>
                  </div>
                  <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <p className="text-4xl font-bold text-red-300">{fixedCount}</p>
                    <p className="text-xs text-red-400 mt-1">Fixed Responses</p>
                  </div>
                </div>
                <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Your Answers</p>
                  {quizAnswers.map((type, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      {type === 'growth' ? <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" /> : <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />}
                      <span className={type === 'growth' ? 'text-green-200' : 'text-red-200'}>{QUIZ_QUESTIONS[i].options.find(o => o.type === type)?.text}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={retakeQuiz}
                  className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                >
                  <RefreshCcw size={16} /> Retake Quiz
                </button>
                <button
                  onClick={() => setActiveTab('journal')}
                  className="w-full text-center text-sm font-semibold py-2"
                  style={{ color: '#a855f7' }}
                >
                  Journal About Your Results →
                </button>
              </div>
            )}
          </div>
        )}

        {/* JOURNAL */}
        {activeTab === 'journal' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(99,60,180,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <h2 className="text-lg font-bold mb-2">Growth Mindset Journal</h2>
              <p className="text-sm text-gray-300">Writing about your mindset helps you catch fixed patterns and consciously shift them. Take your time with these prompts.</p>
            </div>
            {JOURNAL_PROMPTS.map(item => (
              <JournalPrompt key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
      <BottomNav active="discover" />
    </div>
  );
}