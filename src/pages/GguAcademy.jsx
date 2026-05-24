import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ChevronDown, BookOpen, Award, Clock } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const ACADEMY_DATA = {
  pillars: [
    {
      id: 'glow_from_within',
      title: 'Glow From Within',
      description: 'Discover your inner beauty, confidence, and authentic self',
      emoji: '✨',
      color: '#FFD700',
      lessons: {
        'Elementary (Ages 6-10)': [
          {
            id: 'what_makes_you_glow',
            title: 'What Makes You Glow?',
            description: 'Explore what makes you uniquely beautiful inside and out.',
            duration: '45 min',
            activities: [
              'Draw your inner glow self-portrait with 5 character words',
              'Write a letter to your future self about your best qualities',
              'Create a Glow Board collage of things that make you happy',
              'Share one kind thing you did this week with the class',
            ],
          },
        ],
        'Middle School (Ages 11-13)': [
          {
            id: 'authentic_beauty',
            title: 'Authentic Beauty in a Filter World',
            description: 'Navigate social media, filters, and unrealistic beauty standards with confidence.',
            duration: '60 min',
            activities: [
              'Social media audit: unfollow accounts that make you feel bad',
              'Post one unfiltered photo and journal about how it felt',
              'Create a list of 10 things you love about your appearance that have nothing to do with filters',
              'Research one woman you admire and find out what makes her beautiful beyond appearance',
            ],
          },
          {
            id: 'i_am_enough',
            title: 'I Am Enough',
            description: 'Build unshakeable self-worth and learn to love yourself completely.',
            duration: '50 min',
            activities: [
              'Write an I Am poem with 10 positive self-statements',
              'Mirror affirmation practice: say 3 affirmations daily for one week',
              'Decorate a journal cover with your name and things you love about yourself',
              'Compliment circle: give genuine compliments to 3 classmates',
            ],
          },
          {
            id: 'confidence_crown',
            title: 'Confidence is Your Crown',
            description: 'Wear your confidence like a crown and step into your power.',
            duration: '55 min',
            activities: [
              'Practice the Power Pose for 2 minutes each morning',
              'Create a Confidence Crown craft with affirmations written on each point',
              'Role-play confident introductions with a partner',
              'Write about a time you felt really confident',
            ],
          },
        ],
        'High School (Ages 14-18)': [
          {
            id: 'identity_beyond_mirror',
            title: 'Identity Beyond the Mirror',
            description: 'Construct a powerful, multidimensional identity that goes far beyond physical appearance.',
            duration: '75 min',
            activities: [
              'Write your personal values list and rank your top 5',
              'Create a vision board for who you want to be at 25',
              'Journal: What would you do if you knew you couldn\'t fail?',
              'Interview someone you admire about how they developed their identity',
            ],
          },
          {
            id: 'healing_self_compassion',
            title: 'Healing & Self-Compassion',
            description: 'Learn to heal from past wounds and practice radical self-compassion.',
            duration: '90 min',
            activities: [
              'Write an unsent letter to someone who hurt you (for your eyes only)',
              'Practice the self-compassion break: acknowledge pain, common humanity, kindness',
              'Identify 3 coping strategies that genuinely help when you\'re struggling',
              'Research one therapist or counselor in your area or online',
            ],
          },
        ],
      },
    },
    {
      id: 'healthy_mind_heart',
      title: 'Healthy Mind Healthy Heart',
      description: 'Nurture your mental health, emotional intelligence, and inner peace',
      emoji: '💜',
      color: '#EC4899',
      lessons: {
        'Elementary (Ages 6-10)': [
          {
            id: 'feelings_are_ok',
            title: 'All Feelings Are Okay',
            description: 'Learn that every emotion is valid and healthy ways to express them.',
            duration: '40 min',
            activities: [
              'Create an emotions wheel with different faces',
              'Practice naming 3 feelings you had today',
              'Draw a picture of when you felt happy/sad/angry',
              'Learn the calm-down corner techniques',
            ],
          },
        ],
        'Middle School (Ages 11-13)': [
          {
            id: 'managing_big_emotions',
            title: 'Managing Big Emotions',
            description: 'Develop tools to handle intense feelings in healthy ways.',
            duration: '60 min',
            activities: [
              'Create a personal calm-down toolkit',
              'Practice the 5-4-3-2-1 grounding technique',
              'Write about a time you handled a big emotion well',
              'Learn box breathing and practice for 2 minutes',
            ],
          },
        ],
        'High School (Ages 14-18)': [
          {
            id: 'emotional_intelligence',
            title: 'Emotional Intelligence Mastery',
            description: 'Understand and manage your emotions while empathizing with others.',
            duration: '90 min',
            activities: [
              'Keep an emotion journal for one week',
              'Practice active listening with a friend',
              'Identify your emotional triggers and patterns',
              'Create a self-care plan for stressful times',
            ],
          },
        ],
      },
    },
    {
      id: 'glow_up_life_skills',
      title: 'Glow Up Life Skills',
      description: 'Master the practical skills that will set you up for success',
      emoji: '⚡',
      color: '#FBBF24',
      lessons: {
        'Elementary (Ages 6-10)': [
          {
            id: 'morning_routine',
            title: 'My Amazing Morning Routine',
            description: 'Create a morning routine that sets you up for a great day.',
            duration: '35 min',
            activities: [
              'Design your ideal morning routine chart',
              'Practice making your bed',
              'Choose 3 healthy breakfast options',
              'Create a backpack checklist',
            ],
          },
        ],
        'Middle School (Ages 11-13)': [
          {
            id: 'time_management',
            title: 'Time Management Queen',
            description: 'Learn to balance school, activities, and fun without stress.',
            duration: '55 min',
            activities: [
              'Create a weekly planner with all your commitments',
              'Learn the Pomodoro technique',
              'Identify your time-wasters',
              'Set 3 realistic goals for this month',
            ],
          },
        ],
        'High School (Ages 14-18)': [
          {
            id: 'adulting_101',
            title: 'Adulting 101',
            description: 'Essential life skills every grown-up needs to know.',
            duration: '120 min',
            activities: [
              'Create a basic budget with income and expenses',
              'Learn to read a pay stub',
              'Practice writing a professional email',
              'Research basic car/home maintenance tasks',
            ],
          },
        ],
      },
    },
    {
      id: 'future_queen',
      title: 'Future Queen',
      description: 'Step into your power as a leader, entrepreneur, and changemaker',
      emoji: '👑',
      color: '#A855F7',
      lessons: {
        'Elementary (Ages 6-10)': [
          {
            id: 'what_is_leadership',
            title: 'What Is Leadership?',
            description: 'Discover that everyone can be a leader in their own way.',
            duration: '40 min',
            activities: [
              'Draw a picture of yourself as a leader',
              'Identify 3 leaders you admire',
              'Practice leading a group activity',
              'Write about a time you helped someone',
            ],
          },
        ],
        'Middle School (Ages 11-13)': [
          {
            id: 'finding_your_voice',
            title: 'Finding Your Voice',
            description: 'Learn to speak up for yourself and others with confidence.',
            duration: '60 min',
            activities: [
              'Practice using "I" statements',
              'Write a speech about something you care about',
              'Role-play standing up to peer pressure',
              'Identify causes you\'re passionate about',
            ],
          },
        ],
        'High School (Ages 14-18)': [
          {
            id: 'entrepreneurial_mindset',
            title: 'Entrepreneurial Mindset',
            description: 'Think like a business owner and create opportunities.',
            duration: '90 min',
            activities: [
              'Brainstorm 3 business ideas',
              'Create a basic business plan',
              'Research successful women entrepreneurs',
              'Practice your elevator pitch',
            ],
          },
        ],
      },
    },
    {
      id: 'glow_girl_community',
      title: 'Glow Girl Community',
      description: 'Build authentic friendships, navigate social dynamics, and find your tribe',
      emoji: '🌸',
      color: '#F472B6',
      lessons: {
        'Elementary (Ages 6-10)': [
          {
            id: 'being_a_good_friend',
            title: 'Being a Good Friend',
            description: 'Learn what makes a friendship healthy and fun.',
            duration: '45 min',
            activities: [
              'Draw a picture of you and your friends',
              'Practice saying kind words',
              'Learn how to join a game',
              'Write about what you look for in a friend',
            ],
          },
        ],
        'Middle School (Ages 11-13)': [
          {
            id: 'navigating_drama',
            title: 'Navigating Drama',
            description: 'Handle friendship challenges and social situations with grace.',
            duration: '60 min',
            activities: [
              'Identify the difference between drama and conflict',
              'Practice conflict resolution steps',
              'Write about a friendship challenge you overcame',
              'Create boundaries with difficult peers',
            ],
          },
        ],
        'High School (Ages 14-18)': [
          {
            id: 'building_your_tribe',
            title: 'Building Your Tribe',
            description: 'Create a supportive network of authentic friendships.',
            duration: '75 min',
            activities: [
              'Map out your current social circle',
              'Identify qualities you want in close friends',
              'Plan ways to deepen existing friendships',
              'Practice vulnerability with someone you trust',
            ],
          },
        ],
      },
    },
  ],
  addOns: [
    { id: 'relationships', title: 'Relationships', emoji: '💕', ages: 'Ages 13+', description: 'Navigate healthy relationships' },
    { id: 'boundaries', title: 'Boundaries', emoji: '🎀', ages: 'Ages 11+', description: 'Set and respect boundaries' },
    { id: 'dating', title: 'Dating', emoji: '💋', ages: 'Ages 14+', description: 'Healthy dating habits' },
    { id: 'sexual_decision', title: 'Sexual Decision-Making', emoji: '🌿', ages: 'Ages 15+', description: 'Make informed choices' },
    { id: 'queen_standards', title: 'Queen Standards', emoji: '👑', ages: 'Ages 12+', description: 'Know your worth' },
    { id: 'hygiene', title: 'Hygiene', emoji: '🌸', ages: 'Ages 8+', description: 'Self-care essentials' },
    { id: 'me_vs_me', title: 'Me vs Me', emoji: '⚡', ages: 'Ages 10+', description: 'Beat comparison' },
  ],
};

function PillarCard({ pillar, expanded, onExpand }) {
  const totalLessons = Object.values(pillar.lessons).reduce((sum, lessons) => sum + lessons.length, 0);
  const completedLessons = 0; // Would track from backend

  return (
    <div className="rounded-2xl p-5 transition" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <button
        onClick={() => onExpand(pillar.id)}
        className="w-full text-left"
      >
        <div className="flex items-start gap-3 mb-3">
          <span className="text-3xl">{pillar.emoji}</span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{pillar.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{pillar.description}</p>
          </div>
          <ChevronDown size={18} className="text-gray-500 mt-1" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}%`, backgroundColor: pillar.color }} />
          </div>
          <span className="text-xs font-bold text-gray-400">{completedLessons}/{totalLessons}</span>
        </div>
      </button>

      {expanded && Object.keys(pillar.lessons).length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          {Object.entries(pillar.lessons).map(([ageGroup, lessons]) => (
            <div key={ageGroup}>
              <p className="text-xs font-bold tracking-widest text-gray-500 mb-2 uppercase">{ageGroup}</p>
              <div className="space-y-2">
                {lessons.map(lesson => (
                  <div key={lesson.id} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{lesson.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{lesson.description}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{lesson.duration}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-bold text-pink-400 uppercase mb-2">Activities</p>
                      <ul className="space-y-1">
                        {lesson.activities.map((activity, idx) => (
                          <li key={idx} className="text-xs text-gray-300 flex gap-2">
                            <span className="text-pink-400 flex-shrink-0">•</span>
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GguAcademy() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const totalPillars = ACADEMY_DATA.pillars.length;
  const totalLessons = ACADEMY_DATA.pillars.reduce((sum, pillar) => {
    return sum + Object.values(pillar.lessons).reduce((s, lessons) => s + lessons.length, 0);
  }, 0);

  return (
    <div className="min-h-screen text-white pb-24" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.05]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='%23fff'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 px-4 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/discover')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} className="text-pink-400" />
              <span className="text-xs font-bold tracking-widest text-pink-400">GGU ACADEMY</span>
            </div>
            <h1 className="text-2xl font-bold">Your Learning Path</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Award size={18} className="text-yellow-400" />
              <p className="text-xs font-bold text-yellow-400">PILLARS</p>
            </div>
            <p className="text-2xl font-bold text-white">{totalPillars}</p>
            <p className="text-xs text-gray-400 mt-1">Core Areas</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={18} className="text-pink-400" />
              <p className="text-xs font-bold text-pink-400">LESSONS</p>
            </div>
            <p className="text-2xl font-bold text-white">{totalLessons}</p>
            <p className="text-xs text-gray-400 mt-1">Total Lessons</p>
          </div>
        </div>

        {/* Pillars */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Core Pillars</h2>
          <div className="space-y-3">
            {ACADEMY_DATA.pillars.map(pillar => (
              <PillarCard
                key={pillar.id}
                pillar={pillar}
                expanded={expanded === pillar.id}
                onExpand={(id) => setExpanded(expanded === id ? null : id)}
              />
            ))}
          </div>
        </div>

        {/* Add-On Modules */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>✨</span> Add-On Modules
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {ACADEMY_DATA.addOns.map(addon => (
              <div key={addon.id} className="rounded-2xl p-4 text-center transition hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-3xl mb-2">{addon.emoji}</p>
                <p className="font-semibold text-white text-sm">{addon.title}</p>
                <p className="text-xs text-gray-400 mt-1">{addon.ages}</p>
                <p className="text-xs text-gray-500 mt-1">{addon.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="discover" />
    </div>
  );
}