import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ChevronDown, BookOpen, Award, Clock, GraduationCap, CheckCircle2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import QuizModal from '@/components/ggu-academy/QuizModal';
import { QUIZ_DATA } from '@/components/ggu-academy/quizData';

// Lesson content keyed by lesson id
const LESSON_CONTENT = {
  what_makes_you_glow: "Every girl has a unique glow — something special that lives inside her that no one else has. Your glow isn't about what you look like or what you own. It's about your kindness, your creativity, your bravery, and the way you make others feel. When you know what makes you YOU, your confidence grows from the inside out. Take time today to think about your gifts: What do people come to you for? What do you love doing even when no one is watching? What makes you feel most alive? These are the seeds of your glow.",
  authentic_beauty: "Social media shows us a world full of filters, edits, and carefully curated highlight reels. But the girls who glow the brightest aren't the most filtered — they're the most real. Authentic beauty means loving what makes you different: your skin, your hair, your laugh, your story. When you scroll past an image that makes you feel less than, remember you're comparing your behind-the-scenes to someone else's highlight reel. Your natural self is not a flaw to fix — it is a gift to celebrate.",
  i_am_enough: "You are enough right now. Not when you lose weight, not when you get the grades, not when someone likes you back. RIGHT NOW. Self-worth doesn't come from achievements or approval — it comes from knowing who you are and deciding that she is worth protecting, loving, and celebrating. Practice saying 'I am enough' every single day until you feel it in your bones. Because it's true — it has always been true.",
  confidence_crown: "Confidence is not something you're born with — it's something you build, one brave moment at a time. Every time you speak up in class, try something new, or stand up for yourself, you add a jewel to your confidence crown. Posture matters: when you stand tall, your brain actually starts to feel more confident. Walk into every room like you belong there — because you do. Your crown may be invisible, but it is always on your head.",
  identity_beyond_mirror: "You are so much more than what you see in the mirror. You are your values, your dreams, your relationships, your experiences, and your choices. When you build your identity from the inside out — based on what you believe and who you choose to be — no one can take that from you. Spend time this week asking: What do I stand for? What would I never compromise? Who do I want to be remembered as? These answers are your identity blueprint.",
  healing_self_compassion: "Healing is not linear and it is not loud. Sometimes it looks like giving yourself permission to rest. Sometimes it looks like crying and letting the feelings move through you. Self-compassion means treating yourself with the same kindness you would give your best friend. When you make a mistake, instead of beating yourself up, try saying: 'That was hard. I'm learning. I deserve grace.' You can hold yourself accountable AND be gentle with yourself at the same time.",
  feelings_are_ok: "Every single feeling you have is valid — happiness, sadness, anger, fear, excitement, confusion. Feelings aren't good or bad, they are information. When you feel something strongly, your body is trying to tell you something important. The key is learning to express feelings in healthy ways instead of bottling them up or letting them explode. Naming your feelings is the first step: 'I feel scared because...' or 'I feel angry because...' This small habit builds massive emotional strength.",
  managing_big_emotions: "Big emotions like rage, grief, or anxiety can feel overwhelming — like a wave that knocks you over. But you can learn to ride the wave instead of drowning in it. Grounding techniques (like the 5-4-3-2-1 method: 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste) can bring you back to the present moment. Box breathing — inhale 4 counts, hold 4, exhale 4, hold 4 — calms your nervous system in minutes. You have more power over your emotions than you think.",
  emotional_intelligence: "Emotional intelligence (EQ) is your ability to understand and manage your own emotions, and to empathize with others. Research shows EQ predicts success more than IQ. The four pillars of EQ are: self-awareness (knowing what you feel), self-management (choosing how to respond), social awareness (reading others), and relationship management (building strong connections). Start by noticing your emotional patterns this week — what triggers you, what calms you, and what helps you show up as your best self.",
  morning_routine: "How you start your morning sets the tone for your entire day. A strong morning routine doesn't have to be long — even 15-20 minutes of intentional time can transform your energy. Consider including: movement (stretch, dance, walk), hydration (a glass of water before anything else), a moment of quiet (prayer, breathing, journaling), and getting dressed in something that makes you feel good. When you take care of yourself first thing, you show yourself you matter — and that confidence carries through the whole day.",
  time_management: "Time is the one resource that cannot be refilled. Queens who glow protect their time. Start by auditing where your time actually goes — you might be surprised. The Pomodoro technique (25 minutes focused work, 5 minute break) boosts productivity and reduces burnout. Prioritize tasks by importance AND urgency. And remember: saying no to things that drain you is saying yes to things that build you. Your time is sacred — treat it that way.",
  adulting_101: "Adulting doesn't have to be scary — it just takes practice. Some essentials every girl should know: how to create a basic budget (income minus expenses equals what you have left), how to read a pay stub (gross pay vs net pay, and what all those deductions mean), how to write a professional email (subject line, greeting, clear message, professional sign-off), and basic home and car maintenance. Learning these skills now puts you ahead of most adults. You're building the foundation for your future queen life.",
  what_is_leadership: "A leader is not the loudest person in the room — a leader is someone who makes others feel seen, heard, and capable. Leadership is about influence, not authority. You are a leader every time you choose kindness over cruelty, truth over gossip, or courage over comfort. Leadership looks like standing up for someone being bullied, organizing a study group, encouraging a friend to try out, or simply being the person others know they can count on. You were born to lead.",
  finding_your_voice: "Your voice is one of the most powerful tools you have. Using it confidently doesn't mean being loud or aggressive — it means being clear, honest, and unapologetic about who you are and what you believe. Practice using 'I' statements: 'I feel...', 'I need...', 'I think...' instead of blaming language. When you speak up — in class, with friends, or for yourself — you practice using your voice and it gets stronger every time. The world needs to hear what you have to say.",
  entrepreneurial_mindset: "Every successful business starts with someone who saw a problem and decided to solve it. You don't have to wait until you're 'old enough' to think like an entrepreneur. Start now: What problems do you notice in your school or community? What are you good at that others might pay for? What ideas light you up? An entrepreneurial mindset means being creative, resilient, and always looking for opportunity. It means seeing failure as data, not defeat. Your next big idea might change everything.",
  being_a_good_friend: "A real friend is rare and precious. Being a good friend means showing up consistently — not just when things are fun, but when things are hard. It means celebrating your friends' wins without jealousy, being honest with love, and keeping confidences. It also means knowing when a friendship isn't healthy. Signs of a healthy friendship: you feel good after spending time together, you can be yourself, you trust each other, and you build each other up. Be the kind of friend you wish you had.",
  navigating_drama: "Drama is exhausting and often unnecessary. Most drama comes from miscommunication, insecurity, or unspoken expectations. The most powerful thing you can do in a dramatic situation is stay calm and choose your response intentionally. Before reacting, ask: Is this actually my problem? Does engaging help or hurt? What do I actually want from this situation? Walking away from drama is not weakness — it is wisdom. Your peace is more valuable than winning any argument.",
  building_your_tribe: "Your circle should inspire you, challenge you gently, and support you fiercely. The people you spend the most time with influence your mindset, your habits, and your dreams. Evaluate your friendships honestly: Are you growing? Are you respected? Do you feel safe being real? Building your tribe takes courage — you may need to let some people go and intentionally pursue new connections. Quality over quantity. Five deep, genuine friendships are worth more than fifty shallow ones.",
};

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
    {
      id: 'relationships',
      title: 'Relationships',
      emoji: '💕',
      ages: 'Ages 13+',
      description: 'Navigate healthy relationships',
      lessons: [
        {
          title: 'Healthy vs Unhealthy Relationships',
          duration: '60 min',
          activities: [
            'Create a T-chart of healthy vs unhealthy relationship traits',
            'Identify red flags and green flags in relationships',
            'Write about a relationship that makes you feel good',
            'Practice recognizing manipulation tactics',
          ],
        },
        {
          title: 'Communication Skills',
          duration: '50 min',
          activities: [
            'Practice active listening with a partner',
            'Learn and use "I" statements',
            'Role-play difficult conversations',
            'Write a letter expressing your feelings clearly',
          ],
        },
      ],
    },
    {
      id: 'boundaries',
      title: 'Boundaries',
      emoji: '🎀',
      ages: 'Ages 11+',
      description: 'Set and respect boundaries',
      lessons: [
        {
          title: 'What Are Boundaries?',
          duration: '45 min',
          activities: [
            'Draw your personal boundary circle',
            'List 5 things you will and won\'t accept',
            'Practice saying "no" in the mirror',
            'Identify where your boundaries have been crossed',
          ],
        },
        {
          title: 'Enforcing Your Boundaries',
          duration: '55 min',
          activities: [
            'Role-play boundary conversations',
            'Write scripts for common boundary situations',
            'Create a boundary mantra',
            'Journal about how it feels to protect your energy',
          ],
        },
      ],
    },
    {
      id: 'dating',
      title: 'Dating',
      emoji: '💋',
      ages: 'Ages 14+',
      description: 'Healthy dating habits',
      lessons: [
        {
          title: 'What to Look For in a Partner',
          duration: '70 min',
          activities: [
            'Create your non-negotiables list',
            'Identify your values and dealbreakers',
            'Research signs of a healthy relationship',
            'Write your ideal relationship vision',
          ],
        },
        {
          title: 'Navigating First Relationships',
          duration: '60 min',
          activities: [
            'Discuss peer pressure in dating',
            'Learn about consent and respect',
            'Create a dating safety plan',
            'Identify trusted adults to talk to',
          ],
        },
      ],
    },
    {
      id: 'sexual_decision',
      title: 'Sexual Decision-Making',
      emoji: '🌿',
      ages: 'Ages 15+',
      description: 'Make informed choices',
      lessons: [
        {
          title: 'Understanding Consent',
          duration: '90 min',
          activities: [
            'Learn the FRIES model of consent',
            'Practice consent conversations',
            'Identify coercion tactics',
            'Create a personal consent statement',
          ],
        },
        {
          title: 'Making Informed Choices',
          duration: '75 min',
          activities: [
            'Research sexual health resources',
            'Identify trusted healthcare providers',
            'Learn about protection and safety',
            'Write about your personal values around intimacy',
          ],
        },
      ],
    },
    {
      id: 'queen_standards',
      title: 'Queen Standards',
      emoji: '👑',
      ages: 'Ages 12+',
      description: 'Know your worth',
      lessons: [
        {
          title: 'What Are Your Standards?',
          duration: '50 min',
          activities: [
            'Write your Queen Standards manifesto',
            'Identify areas where you\'ve settled',
            'Create affirmations for your worth',
            'List ways you deserve to be treated',
          ],
        },
        {
          title: 'Raising Your Standards',
          duration: '60 min',
          activities: [
            'Audit your current friendships and habits',
            'Set 3 new standards for this month',
            'Practice holding yourself accountable',
            'Celebrate times you honored your standards',
          ],
        },
      ],
    },
    {
      id: 'hygiene',
      title: 'Hygiene',
      emoji: '🌸',
      ages: 'Ages 8+',
      description: 'Self-care essentials',
      lessons: [
        {
          title: 'Daily Hygiene Routine',
          duration: '40 min',
          activities: [
            'Create a morning and evening checklist',
            'Learn proper handwashing technique',
            'Understand dental care basics',
            'Practice hair care routines',
          ],
        },
        {
          title: 'Body Changes & Care',
          duration: '50 min',
          activities: [
            'Learn about puberty changes',
            'Create a self-care kit',
            'Understand skincare basics',
            'Discuss body odor and management',
          ],
        },
      ],
    },
    {
      id: 'me_vs_me',
      title: 'Me vs Me',
      emoji: '⚡',
      ages: 'Ages 10+',
      description: 'Beat comparison',
      lessons: [
        {
          title: 'Comparison is the Thief of Joy',
          duration: '55 min',
          activities: [
            'Identify your comparison triggers',
            'Social media detox challenge',
            'Write about your unique journey',
            'Create a "progress not perfection" reminder',
          ],
        },
        {
          title: 'Compete With Your Past Self',
          duration: '60 min',
          activities: [
            'Track your personal growth weekly',
            'Set goals based on your values, not others\'',
            'Celebrate small wins daily',
            'Write a letter to your past self',
          ],
        },
      ],
    },
  ],
};

function AddOnCard({ addon, expanded, onExpand, onTakeQuiz }) {
  return (
    <div className="rounded-2xl p-4 transition" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <button
        onClick={() => onExpand(addon.id)}
        className="w-full text-left"
      >
        <div className="flex items-start gap-3">
          <span className="text-3xl">{addon.emoji}</span>
          <div className="flex-1">
            <p className="font-semibold text-white text-sm">{addon.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{addon.ages}</p>
            <p className="text-xs text-gray-500 mt-1">{addon.description}</p>
          </div>
          <ChevronDown size={18} className="text-gray-500 mt-1" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </div>
      </button>

      {expanded && addon.lessons && addon.lessons.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          {addon.lessons.map((lesson, idx) => (
            <div key={idx} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{lesson.title}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>{lesson.duration}</span>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs font-bold text-pink-400 uppercase mb-2">Activities</p>
                <ul className="space-y-1">
                  {lesson.activities.map((activity, actIdx) => (
                    <li key={actIdx} className="text-xs text-gray-300 flex gap-2">
                      <span className="text-pink-400 flex-shrink-0">•</span>
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTakeQuiz(lesson);
                  }}
                  className="mt-3 w-full py-2 rounded-lg font-bold text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #EC4899, #A855F7)' }}
                >
                  <GraduationCap size={16} />
                  Take Quiz (15 Questions)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PillarCard({ pillar, expanded, onExpand, onTakeQuiz }) {
  const [lessonRead, setLessonRead] = useState({});
  const totalLessons = Object.values(pillar.lessons).reduce((sum, lessons) => sum + lessons.length, 0);
  const completedLessons = 0;

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
                      {LESSON_CONTENT[lesson.id] && (
                        <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)' }}>
                          <p className="text-xs font-bold text-yellow-400 uppercase mb-2">📖 Lesson</p>
                          <p className="text-xs text-gray-300 leading-relaxed mb-2">{LESSON_CONTENT[lesson.id]}</p>
                          {!lessonRead[lesson.id] ? (
                            <button onClick={(e) => { e.stopPropagation(); setLessonRead(prev => ({ ...prev, [lesson.id]: true })); }}
                              className="w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                              style={{ background: 'rgba(255,215,0,0.15)', color: '#fcd34d' }}>
                              <CheckCircle2 size={12} /> I've Read This Lesson
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-green-400 font-semibold">
                              <CheckCircle2 size={12} /> Lesson complete ✓
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-xs font-bold text-pink-400 uppercase mb-2">✏️ Activities</p>
                      <ul className="space-y-1">
                        {lesson.activities.map((activity, idx) => (
                          <li key={idx} className="text-xs text-gray-300 flex gap-2">
                            <span className="text-pink-400 flex-shrink-0">•</span>
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (LESSON_CONTENT[lesson.id] && !lessonRead[lesson.id]) return;
                        onTakeQuiz(lesson);
                      }}
                      className="mt-3 w-full py-2 rounded-lg font-bold text-white text-sm flex items-center justify-center gap-2"
                      style={{ background: LESSON_CONTENT[lesson.id] && !lessonRead[lesson.id] ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #EC4899, #A855F7)', cursor: LESSON_CONTENT[lesson.id] && !lessonRead[lesson.id] ? 'not-allowed' : 'pointer', opacity: LESSON_CONTENT[lesson.id] && !lessonRead[lesson.id] ? 0.5 : 1 }}
                    >
                      <GraduationCap size={16} />
                      {LESSON_CONTENT[lesson.id] && !lessonRead[lesson.id] ? 'Read Lesson First to Unlock Quiz' : 'Take Quiz (15 Questions)'}
                    </button>
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
  const [quizLesson, setQuizLesson] = useState(null);

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
                onTakeQuiz={setQuizLesson}
              />
            ))}
          </div>
        </div>

        {/* Add-On Modules */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>✨</span> Add-On Modules
          </h2>
          <div className="space-y-3">
            {ACADEMY_DATA.addOns.map(addon => (
              <AddOnCard
                key={addon.id}
                addon={addon}
                expanded={expanded === addon.id}
                onExpand={(id) => setExpanded(expanded === id ? null : id)}
                onTakeQuiz={setQuizLesson}
              />
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="discover" />

      {quizLesson && (
        <QuizModal
          lesson={quizLesson}
          questions={QUIZ_DATA[quizLesson.id] || []}
          onClose={() => setQuizLesson(null)}
          onComplete={(score) => {
            console.log('Quiz completed with score:', score);
            setQuizLesson(null);
          }}
        />
      )}
    </div>
  );
}