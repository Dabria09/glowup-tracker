import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ChevronDown, Plus } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const CURRICULUM_DATA = {
  pillars: [
    {
      id: 'glow_from_within',
      title: 'Glow From Within',
      description: 'Discover your inner beauty, confidence, and authentic self...',
      emoji: '✨',
      color: '#FFD700',
      lessons: {
        'Elementary (Ages 6-10)': [
          {
            id: 'what_makes_you_glow',
            title: 'What Makes You Glow?',
            description: 'Explore what makes you uniquely beautiful inside and out.',
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
            activities: [
              'Practice the Power Pose for 2 minutes each morning',
              'Deepen your glow: bring the week and journal about how it felt',
              'Create a Confidence Crown craft with affirmations written on each point',
              'Role-play confident introductions with a partner',
            ],
          },
        ],
        'High School (Ages 14-18)': [
          {
            id: 'identity_beyond_mirror',
            title: 'Identity Beyond the Mirror',
            description: 'Construct a powerful, multidimensional identity that goes far beyond physical appearance.',
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
      description: 'Nurture your mental health, emotional intelligence, and inner peace...',
      emoji: '💜',
      color: '#EC4899',
      lessons: {},
    },
    {
      id: 'glow_up_life_skills',
      title: 'Glow Up Life Skills',
      description: 'Master the practical skills that will set you up for success...',
      emoji: '⚡',
      color: '#FBBF24',
      lessons: {},
    },
    {
      id: 'future_queen',
      title: 'Future Queen',
      description: 'Step into your power as a leader, entrepreneur, and changemaker...',
      emoji: '👑',
      color: '#A855F7',
      lessons: {},
    },
    {
      id: 'glow_girl_community',
      title: 'Glow Girl Community',
      description: 'Build authentic friendships, navigate social dynamics, and find your tribe...',
      emoji: '🌸',
      color: '#F472B6',
      lessons: {},
    },
  ],
  addOns: [
    { id: 'relationships', title: 'Relationships', emoji: '💕', ages: 'Ages 13+' },
    { id: 'boundaries', title: 'Boundaries', emoji: '🎀', ages: 'Ages 11+' },
    { id: 'dating', title: 'Dating', emoji: '💋', ages: 'Ages 14+' },
    { id: 'sexual_decision', title: 'Sexual Decision-Making', emoji: '🌿', ages: 'Ages 15+ (Parent/Guardian Guidance Recommended)' },
    { id: 'queen_standards', title: 'Queen Standards', emoji: '👑', ages: 'Ages 12+' },
    { id: 'hygiene', title: 'Hygiene', emoji: '🌸', ages: 'Ages 8+' },
    { id: 'me_vs_me', title: 'Me vs Me', emoji: '⚡', ages: 'Ages 10+' },
  ],
};

function PillarCard({ pillar, expanded, onExpand }) {
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
            <div className="h-full rounded-full" style={{ width: '0%', backgroundColor: pillar.color }} />
          </div>
          <span className="text-xs font-bold text-gray-400">0/0</span>
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
                    <p className="text-sm font-semibold text-white">{lesson.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{lesson.description}</p>
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

export default function Curriculum() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

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
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">✨</span>
              <span className="text-xs font-bold tracking-widest text-pink-400">GGU ACADEMY</span>
            </div>
            <h1 className="text-3xl font-bold">Your Curriculum</h1>
            <p className="text-sm text-gray-400 mt-1">5 pillars to your best self</p>
          </div>
        </div>

        {/* Recommended */}
        <div className="rounded-2xl p-5 mb-8" style={{ background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
          <div className="flex items-start gap-3">
            <Plus size={20} className="text-pink-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-pink-400 uppercase tracking-widest">Recommended For You</p>
              <p className="text-sm text-gray-300 mt-2">Personalized curriculum based on your interests and goals</p>
            </div>
          </div>
        </div>

        {/* Pillars */}
        <div className="space-y-3 mb-8">
          {CURRICULUM_DATA.pillars.map(pillar => (
            <PillarCard
              key={pillar.id}
              pillar={pillar}
              expanded={expanded === pillar.id}
              onExpand={(id) => setExpanded(expanded === id ? null : id)}
            />
          ))}
        </div>

        {/* Add-On Modules */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>✨</span> Add-On Modules
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {CURRICULUM_DATA.addOns.map(addon => (
              <div key={addon.id} className="rounded-2xl p-4 text-center transition hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-3xl mb-2">{addon.emoji}</p>
                <p className="font-semibold text-white text-sm">{addon.title}</p>
                <p className="text-xs text-gray-400 mt-2">{addon.ages}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="discover" />
    </div>
  );
}