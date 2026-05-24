import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Check, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const THEMES = [
  {
    id: 'hustle_week',
    title: 'Hustle Week',
    emoji: '🔥',
    tagline: 'Work hard, stay humble.',
    quote: '"Success is not given. It is earned on the track, in the field, in the classroom. — Anonymous"',
    color: '#FF6B35',
    todaysFocus: 'Sunday: Plan your most productive week ever',
    sevenDayPlan: [
      { day: 'Monday', task: 'Set your top 3 priorities for the week' },
      { day: 'Tuesday', task: 'Work on your hardest task first' },
      { day: 'Wednesday', task: 'Eliminate one distraction from your workspace' },
      { day: 'Thursday', task: 'Push through when you feel like quitting' },
      { day: 'Friday', task: 'Review what you accomplished this week' },
      { day: 'Saturday', task: 'Rest intentionally — recovery is part of the hustle' },
      { day: 'Sunday', task: 'Plan your most productive week ever' },
    ],
    weeklyChallenges: [
      { task: 'Complete your homework before any entertainment', icon: '📚' },
      { task: 'Work on a personal project for 30 min daily', icon: '⚡' },
      { task: 'Wake up at the same time every day', icon: '🌅' },
      { task: 'Put your phone in another room while studying', icon: '📱' },
      { task: 'Do your best at one thing you\'ve been avoiding', icon: '💪' },
    ],
    familyChallenges: [
      { task: 'Cook dinner together at least once this week', icon: '👨‍🍳' },
      { task: 'No phones at the dinner table — full family focus', icon: '🚫' },
      { task: 'Take a family walk or outdoor activity together', icon: '🚶' },
      { task: 'Save $20 together as a family this week', icon: '💰' },
      { task: 'Give every family member a genuine compliment daily', icon: '💜' },
      { task: 'Play a board game or card game as a family', icon: '🎮' },
      { task: 'Read or watch something educational together', icon: '📖' },
      { task: 'Deep clean one room of the house as a team', icon: '🧹' },
      { task: 'Share one thing you\'re grateful for at dinner', icon: '✨' },
      { task: 'Write a note of appreciation to a family member', icon: '💌' },
    ],
  },
  {
    id: 'confidence_week',
    title: 'Confidence Week',
    emoji: '👑',
    tagline: 'Own your power, leader.',
    quote: '"You are braver than you believe, stronger than you seem, and smarter than you think. — A.A. Milne"',
    color: '#FF1F8E',
    todaysFocus: 'Sunday: Declare who you are becoming',
    sevenDayPlan: [
      { day: 'Monday', task: 'Write 5 things you\'re proud of about yourself' },
      { day: 'Tuesday', task: 'Practice a power pose for 2 minutes' },
      { day: 'Wednesday', task: 'Wear something that makes you feel powerful' },
      { day: 'Thursday', task: 'Say yes to one thing that scares you' },
      { day: 'Friday', task: 'Compliment yourself out loud (yes, really!)' },
      { day: 'Saturday', task: 'Take up space unapologetically today' },
      { day: 'Sunday', task: 'Declare who you are becoming' },
    ],
    weeklyChallenges: [
      { task: 'Speak up in class even if you\'re not 100% sure', icon: '🗣️' },
      { task: 'Make eye contact when talking to someone', icon: '👀' },
      { task: 'Share your authentic opinion without overthinking', icon: '💭' },
      { task: 'Post something that\'s truly you on social media', icon: '📸' },
      { task: 'Ask for help when you need it', icon: '🤝' },
    ],
    familyChallenges: [
      { task: 'Share your goals with your family', icon: '🎯' },
      { task: 'Ask for feedback on something you\'re working on', icon: '💬' },
      { task: 'Celebrate a family member\'s win genuinely', icon: '🎉' },
      { task: 'Stand up for yourself respectfully at home', icon: '💪' },
      { task: 'Share something vulnerable with your family', icon: '💝' },
      { task: 'Lead a family activity or game night', icon: '👑' },
      { task: 'Give yourself permission to rest without guilt', icon: '😌' },
    ],
  },
  {
    id: 'money_week',
    title: 'Money Week',
    emoji: '💰',
    tagline: 'Build your bag, build your future.',
    quote: '"An investment in knowledge pays the best interest. — Benjamin Franklin"',
    color: '#FFD700',
    todaysFocus: 'Sunday: Create your money vision',
    sevenDayPlan: [
      { day: 'Monday', task: 'Track every dollar you spend' },
      { day: 'Tuesday', task: 'Learn one money skill (budgeting, investing, etc.)' },
      { day: 'Wednesday', task: 'Identify ways to save $5 this week' },
      { day: 'Thursday', task: 'Research a side hustle idea' },
      { day: 'Friday', task: 'Review your spending patterns' },
      { day: 'Saturday', task: 'No-spend challenge day' },
      { day: 'Sunday', task: 'Create your money vision' },
    ],
    weeklyChallenges: [
      { task: 'Save $10 this week (however you can)', icon: '🏦' },
      { task: 'Research one investment or savings option', icon: '📊' },
      { task: 'Do a no-spend day challenge', icon: '🚫' },
      { task: 'Start tracking your income and expenses', icon: '📝' },
      { task: 'Negotiate for something (chores, job, etc.)', icon: '💵' },
    ],
    familyChallenges: [
      { task: 'Talk about money goals as a family', icon: '💬' },
      { task: 'Create a family savings challenge together', icon: '🎯' },
      { task: 'Learn about budgeting as a team', icon: '📚' },
      { task: 'Plan a free family activity', icon: '🎪' },
      { task: 'Teach a younger sibling about saving', icon: '👶' },
    ],
  },
  {
    id: 'boundary_week',
    title: 'Boundary Week',
    emoji: '🛡️',
    tagline: 'Your peace is non-negotiable.',
    quote: '"Daring to set boundaries is about having the courage to love ourselves even when we risk disappointing others. — Brené Brown"',
    color: '#FF6B9D',
    todaysFocus: 'Sunday: Map your personal boundaries',
    sevenDayPlan: [
      { day: 'Monday', task: 'Identify 3 boundaries you need' },
      { day: 'Tuesday', task: 'Communicate one boundary kindly' },
      { day: 'Wednesday', task: 'Say no to something that doesn\'t serve you' },
      { day: 'Thursday', task: 'Practice a boundary in writing first' },
      { day: 'Friday', task: 'Protect your time intentionally' },
      { day: 'Saturday', task: 'Do something just for you' },
      { day: 'Sunday', task: 'Map your personal boundaries' },
    ],
    weeklyChallenges: [
      { task: 'Say no to one request this week (guilt-free)', icon: '❌' },
      { task: 'Set phone/social media boundaries', icon: '📵' },
      { task: 'Create quiet time for yourself daily', icon: '🤫' },
      { task: 'Communicate a boundary to one person', icon: '💬' },
      { task: 'Protect your energy from draining people', icon: '⚡' },
    ],
    familyChallenges: [
      { task: 'Discuss healthy family boundaries together', icon: '💬' },
      { task: 'Respect everyone\'s personal space this week', icon: '🚪' },
      { task: 'Create screen-free family time', icon: '📱' },
      { task: 'Listen without judgment', icon: '👂' },
      { task: 'Apologize if you\'ve crossed a boundary', icon: '🤝' },
    ],
  },
  {
    id: 'self_love_week',
    title: 'Self-Love Week',
    emoji: '💖',
    tagline: 'You are enough, always.',
    quote: '"To love oneself is the beginning of a lifelong romance. — Oscar Wilde"',
    color: '#FF69B4',
    todaysFocus: 'Sunday: Celebrate the masterpiece you are',
    sevenDayPlan: [
      { day: 'Monday', task: 'Do one thing purely for joy' },
      { day: 'Tuesday', task: 'Journal about self-appreciation' },
      { day: 'Wednesday', task: 'Practice self-compassion when you mess up' },
      { day: 'Thursday', task: 'Treat yourself like you treat your best friend' },
      { day: 'Friday', task: 'Celebrate one win, no matter how small' },
      { day: 'Saturday', task: 'Do a full self-care ritual' },
      { day: 'Sunday', task: 'Celebrate the masterpiece you are' },
    ],
    weeklyChallenges: [
      { task: 'Give yourself 3 genuine compliments this week', icon: '🪞' },
      { task: 'Do your favorite self-care activity twice', icon: '🛀' },
      { task: 'Spend time doing something just for you', icon: '🎨' },
      { task: 'Forgive yourself for one past mistake', icon: '🕊️' },
      { task: 'Wear something that makes you feel beautiful', icon: '👗' },
    ],
    familyChallenges: [
      { task: 'Tell each family member why you\'re proud of them', icon: '👏' },
      { task: 'Do a spa day or wellness activity together', icon: '💆' },
      { task: 'Create affirmations as a family', icon: '✨' },
      { task: 'Share vulnerable moments with each other', icon: '💬' },
      { task: 'Celebrate each other\'s growth', icon: '🌱' },
    ],
  },
];

const COMING_UP = [
  { title: 'Mental Wellness Week', tagline: 'Check in with yourself.', icon: '🧠' },
  { title: 'Academic Excellence Week', tagline: 'Own your education journey.', icon: '📚' },
  { title: 'Community Service Week', tagline: 'Give back, lift up.', icon: '🤲' },
];

export default function WeeklyTheme() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [completedDays, setCompletedDays] = useState({});

  const currentTheme = THEMES[currentThemeIndex];

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const toggleDay = (day) => {
    setCompletedDays(prev => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  return (
    <div className="min-h-screen text-white pb-28"
      style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a18 40%, #0d0610 100%)' }}>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.07]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='%23fff'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 px-4 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/discover')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-white">Weekly Theme</h1>
        </div>

        {/* Theme Header */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: `linear-gradient(135deg, ${currentTheme.color}30, ${currentTheme.color}10)`, border: `1px solid ${currentTheme.color}40` }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentTheme.emoji}</span>
              <div>
                <h2 className="text-3xl font-bold text-white">{currentTheme.title}</h2>
                <p className="text-sm text-gray-300">{currentTheme.tagline}</p>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="rounded-xl p-4 mt-4 italic" style={{ background: 'rgba(0,0,0,0.3)', borderLeft: `3px solid ${currentTheme.color}` }}>
            <p className="text-sm text-gray-200">{currentTheme.quote}</p>
          </div>
        </div>

        {/* Today's Focus */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: `rgba(236,72,153,0.1)`, border: '1px solid rgba(236,72,153,0.3)' }}>
          <p className="text-xs font-bold text-pink-400 tracking-widest mb-2">TODAY'S FOCUS</p>
          <p className="text-white font-bold">{currentTheme.todaysFocus}</p>
        </div>

        {/* 7-Day Plan */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Your 7-Day Plan 📋</h3>
          <div className="space-y-2">
            {currentTheme.sevenDayPlan.map((item, idx) => (
              <div
                key={idx}
                onClick={() => toggleDay(idx)}
                className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition"
                style={{ background: completedDays[idx] ? `rgba(255,255,255,0.08)` : 'rgba(255,255,255,0.05)', opacity: completedDays[idx] ? 0.6 : 1 }}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${completedDays[idx] ? 'bg-green-500' : 'border-2 border-gray-500'}`}>
                  {completedDays[idx] && <Check size={14} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${completedDays[idx] ? 'text-gray-500 line-through' : 'text-white'}`}>
                    {item.day}: {item.task}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Challenges */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Weekly Challenges 🚀</h3>
          <div className="space-y-3">
            {currentTheme.weeklyChallenges.map((challenge, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-xl mt-0.5">{challenge.icon}</div>
                <p className="text-sm text-gray-200 flex-1">{challenge.task}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Family Challenges */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-bold text-white">Family Challenges</h3>
            <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">New</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">Do these together with your family this week</p>
          <div className="space-y-3">
            {currentTheme.familyChallenges.map((challenge, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-xl mt-0.5">{challenge.icon}</div>
                <p className="text-sm text-gray-200 flex-1">{challenge.task}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Up */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Coming Up 📋</h3>
          <div className="space-y-3">
            {COMING_UP.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{item.icon}</span>
                  <div>
                    <p className="font-bold text-white">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.tagline}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-500 mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Theme Navigation */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setCurrentThemeIndex(Math.max(0, currentThemeIndex - 1))}
            disabled={currentThemeIndex === 0}
            className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            ← Previous
          </button>
          <button
            onClick={() => setCurrentThemeIndex(Math.min(THEMES.length - 1, currentThemeIndex + 1))}
            disabled={currentThemeIndex === THEMES.length - 1}
            className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            Next →
          </button>
        </div>

        <p className="text-center text-xs text-gray-500">Theme {currentThemeIndex + 1} of {THEMES.length}</p>
      </div>

      <BottomNav active="discover" />
    </div>
  );
}