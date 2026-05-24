import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, Save } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const AFFIRMATIONS = [
  'I am becoming the best version...',
  'I am worthy of everything I desire...',
  'I choose growth over compariso...',
  'I am proud of how far I\'ve come...',
  'I am enough, exactly as I am.',
  'My progress is my power. 👑',
  'I am my own competition.',
];

const FRAMEWORK = [
  {
    id: 'audit',
    title: 'Part 1: The Comparison Audit',
    subtitle: 'Identify who you\'re comparing yourself to and how...',
    icon: '🔍',
    content: 'The world wants you to look sideways at what other girls are doing. The algorithm wants you to compare your behind-the-scenes to their highlight reel. But true leaders don\'t look sideways — they look in the mirror. Start by being honest: who or what are you comparing with in your head? Could be someone at school, an influencer, or a sibling. What are you comparing — looks, grades, followers, popularity? Notice how that comparison makes you feel. Awareness is the first step to freedom.',
  },
  {
    id: 'pivot',
    title: 'Part 2: The Pivot',
    subtitle: 'Shift focus from THEM to YOU — the old you vs...',
    icon: '👁️',
    content: 'When you compare yourself to someone else, you give away your power. Let\'s take it back. Think about who you were one year ago. What is one thing you struggled with back then that you are better at now? (e.g., "I used to let people talk over me. I used to hate my curly hair." "I used to fail math.") Now give yourself credit for the work you\'ve done. How have you grown in that specific area? The pivot is from THEM to YOU.',
  },
  {
    id: 'challenge',
    title: 'Part 3: The Me vs. Me Challenge',
    subtitle: 'Pick 3 areas to level up — you\'re only competing...',
    icon: '🎯',
    content: 'Pick THREE areas of your life where you want to level up. You are not competing against anyone else\'s timeline. You are only competing against yesterday\'s version of yourself. For each area, identify what the Old Me did and what the New Me will do instead. Example — Boundaries: Old Me: Said yes when I meant no. New Me: Will pause 5 seconds before answering. This is your personal growth plan, not a race against anyone else.',
  },
  {
    id: 'promise',
    title: 'Part 4: The Promise to Myself',
    subtitle: 'Sign your name to your commitment to stop...',
    icon: '👍',
    content: 'I promise to stop looking sideways. I promise to stop measuring my worth by someone else\'s ruler. I am running my own race, on my own track, at my own pace. The only person I am trying to be better than is the person I was yesterday. Use your daily journal entries to track your wins, improvements, and affirmations — every entry is proof of your growth.',
  },
];

export default function MeVsMe() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [entries, setEntries] = useState([]);
  const [expandedPart, setExpandedPart] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    win: '',
    pivot: '',
    challenge: '',
    promise: '',
  });
  const [selectedAffirmation, setSelectedAffirmation] = useState('');

  const handleSaveEntry = () => {
    if (!formData.win && !formData.pivot && !formData.challenge && !formData.promise) {
      alert('Please fill in at least one section');
      return;
    }
    const newEntry = { ...formData, id: Date.now(), affirmation: selectedAffirmation };
    setEntries([newEntry, ...entries]);
    setFormData({ date: new Date().toISOString().split('T')[0], win: '', pivot: '', challenge: '', promise: '' });
    setSelectedAffirmation('');
    setShowForm(false);
  };

  const thisWeekCount = entries.filter(e => {
    const entryDate = new Date(e.date);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return entryDate >= weekAgo && entryDate <= now;
  }).length;

  const streak = (() => {
    if (entries.length === 0) return 0;
    let count = 0;
    const now = new Date();
    const sortedDates = entries.map(e => new Date(e.date)).sort((a, b) => b - a);
    for (let i = 0; i < sortedDates.length; i++) {
      const expected = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      expected.setHours(0, 0, 0, 0);
      sortedDates[i].setHours(0, 0, 0, 0);
      if (sortedDates[i].getTime() === expected.getTime()) count++;
      else break;
    }
    return count;
  })();

  if (showForm) {
    return (
      <div className="min-h-screen text-white pb-28"
        style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a18 40%, #0d0610 100%)' }}>
        <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.07]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='%23fff'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />

        <div className="relative z-10 px-4 pt-6 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setShowForm(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">New Me vs Me™ Entry</h1>
              <p className="text-xs text-gray-400">You vs. Yesterday's You 👑</p>
            </div>
            <button onClick={handleSaveEntry}
              className="ml-auto flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold bg-pink-500 text-white">
              <Save size={13} /> Save
            </button>
          </div>

          {/* DATE */}
          <div className="mb-5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">📅 DATE</label>
            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full mt-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
            />
          </div>

          {/* TODAY'S WIN */}
          <div className="mb-5 p-4 rounded-2xl" style={{ background: 'rgba(255,31,142,0.1)', border: '1px solid rgba(255,31,142,0.2)' }}>
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#FF1F8E' }}>❤️ TODAY'S WIN</label>
            <p className="text-xs text-gray-400 mt-1 mb-2">What's one thing you did well today, no matter how small?</p>
            <textarea value={formData.win} onChange={e => setFormData({ ...formData, win: e.target.value })}
              placeholder="e.g. I spoke up in class, I finished my homework early, I chose water over soda..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none text-sm" rows={3}
            />
          </div>

          {/* HOW I IMPROVED */}
          <div className="mb-5 p-4 rounded-2xl" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)' }}>
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#FFD700' }}>✨ HOW I IMPROVED (THE PIVOT)</label>
            <p className="text-xs text-gray-400 mt-1 mb-2">Compare yourself to yesterday's you — not anyone else. How are you better today than you were?</p>
            <textarea value={formData.pivot} onChange={e => setFormData({ ...formData, pivot: e.target.value })}
              placeholder="e.g. Yesterday I scrolled for 2 hours. Today I only scrolled 30 minutes and read instead..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none text-sm" rows={3}
            />
          </div>

          {/* ME VS ME CHALLENGE */}
          <div className="mb-5 p-4 rounded-2xl" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#c084fc' }}>🎯 MY ME VS ME CHALLENGE</label>
            <p className="text-xs text-gray-400 mt-1 mb-2">Pick one area to level up tomorrow. What will the New You do differently?</p>
            <textarea value={formData.challenge} onChange={e => setFormData({ ...formData, challenge: e.target.value })}
              placeholder="e.g. Old Me: Scrolled instead of studying. New Me: Will put my phone in another room during homework time..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none text-sm" rows={3}
            />
          </div>

          {/* PROMISE TO MYSELF */}
          <div className="mb-5 p-4 rounded-2xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#22c55e' }}>💚 MY PROMISE TO MYSELF</label>
            <p className="text-xs text-gray-400 mt-1 mb-2">Write your affirmation — your promise to stop looking sideways and run your own race.</p>
            <textarea value={formData.promise} onChange={e => setFormData({ ...formData, promise: e.target.value })}
              placeholder="e.g. I am running my own race, at my own pace. I am my own competition..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none text-sm" rows={3}
            />
          </div>

          {/* Affirmation Starters */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-2">Tap to use a starter:</p>
            <div className="grid grid-cols-2 gap-2">
              {AFFIRMATIONS.map(aff => (
                <button key={aff} onClick={() => setSelectedAffirmation(aff)}
                  className="px-3 py-2 rounded-full text-xs font-semibold transition text-center border"
                  style={selectedAffirmation === aff
                    ? { background: 'rgba(168,85,247,0.4)', borderColor: 'rgba(168,85,247,0.6)', color: '#c084fc' }
                    : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                  {aff}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSaveEntry}
            className="w-full py-3 rounded-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #FF1F8E, #a855f7)' }}>
            Save Entry 📝
          </button>
        </div>

        <BottomNav active="glow" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pb-28"
      style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a18 40%, #0d0610 100%)' }}>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.07]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='%23fff'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 px-4 pt-10 pb-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate('/discover')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, #FF1F8E, #a855f7)' }}>👑</div>
        </div>
        <h1 className="text-2xl font-bold text-white mt-4 mb-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>Me vs Me™</h1>
        <p className="text-sm text-gray-400 mb-6">The Only Competition That Matters</p>

        {/* Framework quote */}
        <div className="rounded-2xl p-5 mb-6"
          style={{ background: 'linear-gradient(135deg, rgba(90,20,100,0.5), rgba(160,20,80,0.4))', border: '1px solid rgba(255,31,142,0.2)' }}>
          <p className="flex items-center gap-2 text-xs font-bold text-pink-300 uppercase tracking-widest mb-3">
            <span>👑</span> Me vs Me™ Framework
          </p>
          <p className="text-sm text-white/90 italic leading-relaxed">
            "The world wants you to look sideways at what other girls are doing. But true leaders don't look sideways — they look in the mirror. Your only competition is the girl you were yesterday."
          </p>
          <p className="text-xs text-gray-400 mt-3">— Girls Glowing Up Academy</p>
        </div>

        {/* 4 Parts */}
        <div className="space-y-3 mb-6">
          {FRAMEWORK.map(part => (
            <div key={part.id} className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button onClick={() => setExpandedPart(expandedPart === part.id ? null : part.id)}
                className="w-full flex items-center gap-3 p-4 transition"
                style={{ background: expandedPart === part.id ? 'rgba(255,255,255,0.08)' : 'transparent' }}>
                <span className="text-2xl">{part.icon}</span>
                <div className="flex-1 text-left">
                  <p className="font-bold text-white text-sm">{part.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{part.subtitle}</p>
                </div>
                <ChevronDown size={16} className="text-gray-500" style={{ transform: expandedPart === part.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </button>
              {expandedPart === part.id && (
                <div className="px-4 pb-4 pt-0 border-t border-white/5">
                  <p className="text-sm text-white/80 leading-relaxed">{part.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="rounded-2xl p-5 mb-6 border border-pink-500/30"
          style={{ background: 'rgba(255,31,142,0.08)' }}>
          <p className="text-white text-center font-semibold leading-relaxed text-base">
            "I am running my own race, on my own track, at my own pace. The only person I am trying to be better than is the person I was yesterday."
          </p>
          <p className="text-xs text-gray-400 text-center mt-3">— Girls Glowing Up Academy · girlsglowingup.com</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Entries', value: entries.length, color: '#FF1F8E' },
            { label: 'This Week', value: thisWeekCount, color: '#FFD700' },
            { label: 'Streak', value: streak, color: '#22c55e' },
          ].map(stat => (
            <div key={stat.label} className="text-center p-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">👑</p>
            <h2 className="text-xl font-bold text-white mb-2">Start Your Growth Journey</h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Use the 4-part framework above to track your wins, your pivot, your challenge, and your promise. Every entry is proof of your growth.
            </p>
            <button onClick={() => setShowForm(true)}
              className="w-full py-3 rounded-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #FF1F8E, #a855f7)' }}>
              Add Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <div key={entry.id} className="p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs text-gray-400 font-semibold">{new Date(entry.date).toLocaleDateString()}</p>
                {entry.win && <p className="text-sm text-white mt-2">❤️ Win: {entry.win}</p>}
                {entry.pivot && <p className="text-sm text-white mt-2">✨ Pivot: {entry.pivot}</p>}
                {entry.challenge && <p className="text-sm text-white mt-2">🎯 Challenge: {entry.challenge}</p>}
                {entry.promise && <p className="text-sm text-white mt-2">💚 Promise: {entry.promise}</p>}
                {entry.affirmation && <p className="text-xs text-pink-400 mt-2 italic">"{entry.affirmation}"</p>}
              </div>
            ))}
            <button onClick={() => setShowForm(true)}
              className="w-full py-3 rounded-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #FF1F8E, #a855f7)' }}>
              Add New Entry
            </button>
          </div>
        )}
      </div>

      <BottomNav active="glow" />
    </div>
  );
}