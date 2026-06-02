import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, ChevronRight, CheckCircle2, Mic, BookOpen, Users } from 'lucide-react';

// ── AGE GROUPS ────────────────────────────────────────────────────────────────
const AGE_GROUPS = [
  { id: 'middle', label: 'Middle School', ages: 'Ages 11–13', emoji: '🌱' },
  { id: 'early_high', label: 'Early High School', ages: 'Ages 14–15', emoji: '✨' },
  { id: 'older_high', label: 'Older High School', ages: 'Ages 16–18', emoji: '👑' },
];

// ── SECTION CATEGORIES ────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'your_voice', label: 'Your Voice', emoji: '🗣️', icon: Mic, color: '#ec4899', desc: 'Speaking up, opinions, respectful communication' },
  { id: 'civics', label: 'Civics', emoji: '🏛️', icon: BookOpen, color: '#3b82f6', desc: 'Community, laws, voting basics, leadership' },
  { id: 'leadership', label: 'Leadership', emoji: '👑', icon: Users, color: '#a855f7', desc: 'Advocacy, service, problem-solving' },
];

// ── ALL TOPICS BY AGE GROUP ───────────────────────────────────────────────────
const ALL_TOPICS = {

  // ── YOUR VOICE ──────────────────────────────────────────────────────────────
  your_voice: {
    middle: [
      {
        id: 'yv_speak_up_middle',
        emoji: '🎤',
        title: 'How to Speak Up Without Freaking Out',
        desc: 'Raise your hand, share your opinion, and be heard — even when it feels scary.',
        why: 'Your ideas matter at every age. Middle school is the perfect time to start using your voice so it becomes natural.',
        sections: [
          { title: 'Why Speaking Up Feels Hard', content: 'It\'s normal to be nervous. Your brain worries about what people think. But staying quiet means your good ideas never get heard. Every time you speak up, it gets a little easier.' },
          { title: 'The 3-Second Rule', content: 'When you want to say something, count to 3 and then speak before your brain talks you out of it. The more you practice, the less scary it becomes.' },
          { title: 'Starting Small', content: 'You don\'t have to give a big speech. Start by answering one question in class a day. Ask one question at the store. Say your order yourself at a restaurant. Small acts of speaking build big confidence.' },
        ],
        activities: [
          'Share one opinion in class today — any class, any topic.',
          'Practice in the mirror: introduce yourself and say one thing you believe.',
          'Write down 3 topics you know something about and could talk about confidently.',
        ],
        quiz: [
          { q: 'What is the 3-Second Rule for speaking up?', options: ['Wait 3 minutes before answering', 'Count to 3 and speak before you talk yourself out of it', 'Only speak if 3 people agree with you', 'Take 3 deep breaths before every sentence'], answer: 1, explanation: 'Counting to 3 and speaking helps you act before fear stops you — it builds the habit of using your voice.' },
        ],
        call_to_action: 'Pick one class tomorrow and commit to raising your hand at least once.',
      },
      {
        id: 'yv_opinions_middle',
        emoji: '💬',
        title: 'It\'s Okay to Have Opinions',
        desc: 'Your thoughts are valid — even when people disagree.',
        why: 'Having and sharing opinions respectfully is a sign of confidence and intelligence.',
        sections: [
          { title: 'What Is an Opinion?', content: 'An opinion is what you personally think or feel about something. It\'s different from a fact. "Pizza is delicious" is an opinion. "Pizza was invented in Italy" is a fact. Both matter!' },
          { title: 'Owning Your Opinion', content: 'Use "I think," "I feel," or "In my opinion" to clearly own what you\'re saying. This makes you sound more confident and it\'s honest — you\'re not claiming your opinion is the only truth.' },
          { title: 'When People Disagree', content: 'Disagreement is normal and healthy. When someone disagrees with you, you don\'t have to change your opinion — but you should listen to theirs. You might learn something or find a middle ground.' },
        ],
        activities: [
          'Write 5 opinions you have about school, food, music, or life.',
          'Practice saying "I think..." instead of "I don\'t know" when asked a question.',
          'Find one news topic and write two sentences stating your opinion on it.',
        ],
        quiz: [
          { q: 'Which sentence uses an opinion starter correctly?', options: ['"Everyone knows that...", "People say that...", "I think that...", "It is a fact that..."'], answer: 2, explanation: '"I think that..." clearly signals this is your personal view, not a universal fact — which is honest and confident.' },
        ],
        call_to_action: 'Next time someone asks your opinion, don\'t say "I don\'t know" — give a real answer with "I think."',
      },
    ],
    early_high: [
      {
        id: 'yv_speak_up_early',
        emoji: '🎤',
        title: 'Speaking Up in Spaces That Feel Uncomfortable',
        desc: 'How to use your voice when the stakes feel higher.',
        why: 'High school raises the stakes. Classes are bigger, opinions feel riskier. But staying silent has a cost too.',
        sections: [
          { title: 'The Cost of Silence', content: 'When you stay silent to avoid conflict or embarrassment, your ideas stay trapped. You miss out on contributing, standing up for yourself, and building confidence. Silence can also signal agreement when you disagree.' },
          { title: 'Respectful Disagreement', content: 'Disagreeing respectfully is a power skill. Say "I see it differently because..." or "I respectfully disagree — here\'s my take." This shows maturity and confidence without starting conflict.' },
          { title: 'Speaking in Groups', content: 'In group projects or discussions, practice summarizing others\' points before adding yours: "So what you\'re saying is... I also think..." This shows you listened and builds your credibility before you even state your view.' },
        ],
        activities: [
          'In your next group discussion, respectfully disagree with one idea using evidence.',
          'Practice the phrase: "That\'s interesting — I see it a little differently because..."',
          'Write about a time you stayed quiet when you should have spoken. What would you say now?',
        ],
        quiz: [
          { q: 'What does "respectful disagreement" look like?', options: ['Saying nothing', 'Attacking the person\'s idea loudly', 'Saying "I see it differently because..." calmly', 'Rolling your eyes'], answer: 2, explanation: 'Respectful disagreement means engaging with the idea, not the person, and explaining your reasoning calmly.' },
        ],
        call_to_action: 'This week, practice disagreeing with one idea — respectfully and with evidence.',
      },
    ],
    older_high: [
      {
        id: 'yv_advocacy_older',
        emoji: '📣',
        title: 'Your Voice as Advocacy',
        desc: 'Speak up for yourself and others — locally and beyond.',
        why: 'Your voice has power beyond the classroom. Learning to advocate effectively shapes the world around you.',
        sections: [
          { title: 'What Is Advocacy?', content: 'Advocacy is using your voice and actions to support a cause or help others. It starts with knowing what you care about and building the courage to say it publicly — to your school, your community, and beyond.' },
          { title: 'Personal vs. Public Voice', content: 'Your personal voice handles things in your immediate life — setting limits, expressing needs, standing up for yourself. Your public voice speaks to broader issues — systemic problems, community needs, social change. Both are essential.' },
          { title: 'Crafting a Message That Moves People', content: 'Effective messages use story, data, and a clear ask. "I experienced X. Research shows Y. I\'m asking for Z." This structure works for speeches, letters, social media, and conversations with decision-makers.' },
        ],
        activities: [
          'Identify one issue in your school or community that matters to you.',
          'Write a 2-minute speech using the structure: Story → Data → Ask.',
          'Find one local organization working on an issue you care about. Email them about how you can help.',
        ],
        quiz: [
          { q: 'What is the recommended structure for an effective advocacy message?', options: ['Opinion → Emotion → Repeat', 'Story → Data → Ask', 'Question → Answer → Question', 'Fact → Fact → Fact'], answer: 1, explanation: 'Story makes it personal and relatable. Data makes it credible. Ask makes it actionable. Together they move people.' },
        ],
        call_to_action: 'Write your first advocacy message about an issue you care about. You don\'t have to send it yet — just write it.',
      },
    ],
  },

  // ── CIVICS ──────────────────────────────────────────────────────────────────
  civics: {
    middle: [
      {
        id: 'civ_community_middle',
        emoji: '🏘️',
        title: 'What Is Community?',
        desc: 'Understand the world you live in and how you fit into it.',
        why: 'Your community affects everything about your daily life. Understanding it is the first step to improving it.',
        sections: [
          { title: 'Community Basics', content: 'A community is any group of people who share something — a neighborhood, a school, a city. Communities have rules, leaders, and systems to make things work.' },
          { title: 'How Your School Is a Community', content: 'Your school has a principal (like a mayor), teachers (like lawmakers), and students (like citizens). There are rules (like laws), and sometimes things you can change if enough people speak up.' },
          { title: 'Community Needs vs. Wants', content: 'Every community has needs (things people must have — safety, clean water, schools) and wants (things that would be nice). Government and community leaders have to balance both.' },
        ],
        activities: [
          'List 3 things your school community does well and 1 thing you\'d improve.',
          'Find out who your principal and school board representative are.',
          'Draw a map of your community and label 5 important places.',
        ],
        quiz: [
          { q: 'What is the difference between a community need and a community want?', options: ['They are the same thing', 'Needs are essential (safety, schools); wants are nice-to-haves', 'Wants are more important than needs', 'Only adults decide what is a need'], answer: 1, explanation: 'Needs are things communities must have to function; wants are additional things that improve quality of life.' },
        ],
        call_to_action: 'Name one thing in your school or neighborhood you\'d change if you could. Tell a teacher or adult about it.',
      },
      {
        id: 'civ_laws_middle',
        emoji: '⚖️',
        title: 'Rules, Laws & Why They Exist',
        desc: 'Why does society have rules — and who makes them?',
        why: 'Understanding where rules come from helps you know when to follow them, when to question them, and how to change them.',
        sections: [
          { title: 'Rules vs. Laws', content: 'Rules are guidelines set by families, schools, or organizations. Laws are formal rules set by governments with consequences if broken. Both exist to keep people safe and make life fair.' },
          { title: 'Who Makes Laws?', content: 'In the U.S., Congress makes federal laws. State legislatures make state laws. City councils make local laws (called ordinances). All of these are made by elected people — people who voters chose.' },
          { title: 'Unfair Laws and Changing Them', content: 'History shows us that some laws were unfair — like laws that kept Black Americans from voting, or laws that let children work dangerous jobs. People organized, protested, and voted, and those laws changed. This is why civic participation matters.' },
        ],
        activities: [
          'Name one school rule you think is unfair. Write a respectful paragraph explaining why and suggesting a change.',
          'Research one law in U.S. history that was changed because people organized to change it.',
        ],
        quiz: [
          { q: 'What is a local law passed by a city council called?', options: ['A federal statute', 'An ordinance', 'A mandate', 'A treaty'], answer: 1, explanation: 'Local laws passed by city councils are called ordinances. They govern local issues like noise, zoning, and local business rules.' },
        ],
        call_to_action: 'Look up one city ordinance in your city. What does it regulate?',
      },
    ],
    early_high: [
      {
        id: 'civ_voting_early',
        emoji: '🗳️',
        title: 'Voting: Why It Actually Matters',
        desc: 'The real impact of your future vote — and what you can do now.',
        why: 'Many major elections are decided by a few thousand votes. Every vote — including yours at 18 — genuinely matters.',
        sections: [
          { title: 'How Close Elections Really Are', content: 'In 2000, the presidential election in Florida was decided by 537 votes. Local school board elections are often won by a few hundred votes. When people think their vote doesn\'t matter, they\'re wrong — especially at the local level.' },
          { title: 'The Voting Process', content: 'To vote, you must be a U.S. citizen, 18 or older, and registered. Registration is required in most states and has deadlines. You can register at vote.gov, at the DMV, or at school in many states.' },
          { title: 'What\'s on a Ballot', content: 'Ballots include presidential and congressional races, but also judges, school board members, local measures, and ballot propositions. Most voters skip the down-ballot races — but those offices have huge impact on daily life.' },
        ],
        activities: [
          'Go to vote.gov and find out the registration requirements in your state.',
          'Research the school board members in your district. What decisions have they made recently?',
          'Interview a family member who votes about what issues they care about most.',
        ],
        quiz: [
          { q: 'Why do down-ballot races (like school board) matter?', options: ['They don\'t matter much', 'They decide who controls your local schools, parks, and courts', 'Only national races affect your life', 'They\'re only for adults'], answer: 1, explanation: 'Down-ballot races like school board, city council, and local judges have direct impact on schools, public safety, and community resources.' },
        ],
        call_to_action: 'Pre-register to vote if your state allows it (many allow pre-registration at 16 or 17). Check at vote.gov.',
      },
    ],
    older_high: [
      {
        id: 'civ_systems_older',
        emoji: '🏛️',
        title: 'Understanding Power & Systems',
        desc: 'How power works, who holds it, and how to navigate it.',
        why: 'The sooner you understand how systems of power work, the sooner you can work within and beyond them.',
        sections: [
          { title: 'What Is a System?', content: 'A system is a set of rules, institutions, and relationships that produce consistent outcomes. Economic systems, legal systems, educational systems — all affect your life in ways you may not see.' },
          { title: 'Checks and Balances', content: 'The U.S. government is designed so no one branch has all the power. Congress makes laws. The president enforces them. Courts interpret them. Each can check the others. Understanding this helps you understand why change takes time — and how to create it.' },
          { title: 'How Regular People Influence Systems', content: 'Systems change when enough people apply consistent pressure: voting, organizing, petitioning, running for office, working in policy, supporting advocacy organizations, or simply educating others. You don\'t need power to influence power.' },
        ],
        activities: [
          'Research one policy that was changed because of grassroots organizing in the last 10 years.',
          'Find out who represents you at all 3 levels of government (local, state, federal).',
          'Write a letter to one of your representatives about an issue you care about.',
        ],
        quiz: [
          { q: 'What is the purpose of checks and balances in the U.S. government?', options: ['To slow everything down', 'To make sure no single branch has too much power', 'To give the president more control', 'To limit voting'], answer: 1, explanation: 'Checks and balances ensure that no one branch of government can dominate the others, protecting against abuse of power.' },
        ],
        call_to_action: 'Go to house.gov and find your U.S. representative. Look at one bill they sponsored and write a short opinion about it.',
      },
    ],
  },

  // ── LEADERSHIP ──────────────────────────────────────────────────────────────
  leadership: {
    middle: [
      {
        id: 'lead_what_is_middle',
        emoji: '🌟',
        title: 'What Is Leadership (Really)?',
        desc: 'You don\'t need a title to lead — here\'s how to start now.',
        why: 'Leadership starts in middle school. The habits you build now shape the leader you become.',
        sections: [
          { title: 'Leaders Aren\'t Just Loud', content: 'Leadership isn\'t about being the most popular or talking the most. It\'s about influence — the ability to make others feel seen, valued, and capable. Quiet, thoughtful people can be the best leaders.' },
          { title: 'Everyday Leadership', content: 'You\'re leading every time you: include someone who feels left out, stand up for someone being treated unfairly, do what\'s right when it\'s hard, or help a classmate understand something.' },
          { title: 'Practice Opportunities', content: 'Look for small leadership opportunities: captain of a group project, organizing a study session, starting a lunch table tradition, or running for a school office. Every chance you take builds your leadership muscle.' },
        ],
        activities: [
          'Identify one person in your school who you could include or encourage this week.',
          'List 3 ways you have already shown leadership without realizing it.',
          'Write about a leader you admire and what specific actions make them a good leader.',
        ],
        quiz: [
          { q: 'Which of these is an example of everyday leadership?', options: ['Ignoring someone being treated unfairly', 'Including someone who feels left out', 'Only doing leadership when there\'s a title', 'Waiting for someone else to take charge'], answer: 1, explanation: 'Everyday leadership happens in small moments — inclusion, encouragement, and doing what\'s right without being told.' },
        ],
        call_to_action: 'Do one act of everyday leadership this week. Then notice how it feels.',
      },
    ],
    early_high: [
      {
        id: 'lead_service_early',
        emoji: '🤝',
        title: 'Leadership Through Service',
        desc: 'The most powerful leaders serve others first.',
        why: 'Servant leadership — leading by serving — is the most respected and effective form. It also looks great on college applications.',
        sections: [
          { title: 'What Is Servant Leadership?', content: 'Servant leadership means your first instinct is to help, not to be helped. You lead from behind, pushing others forward. Great leaders like Mandela, MLK, and Malala Yousafzai all led by serving.' },
          { title: 'Service in High School', content: 'Service doesn\'t mean doing chores. It means volunteering, mentoring younger students, joining community organizations, starting projects that help others, or advocating for those without a platform.' },
          { title: 'Why Service Builds You', content: 'Serving others builds empathy, problem-solving skills, communication skills, and perspective. These skills make you a better leader, friend, student, and eventually, professional.' },
        ],
        activities: [
          'Find one service opportunity in your school or community and commit to showing up.',
          'Write about a time someone served you without being asked. How did it impact you?',
          'Identify one problem in your school you could help solve.',
        ],
        quiz: [
          { q: 'What is servant leadership?', options: ['Following orders from others', 'Leading by helping and serving others first', 'Only leading when given a title', 'Doing all the work yourself'], answer: 1, explanation: 'Servant leaders prioritize the needs of others and the community over their own recognition — and this is what makes them trusted and followed.' },
        ],
        call_to_action: 'Commit to one service activity this month. Track how it changes your perspective.',
      },
    ],
    older_high: [
      {
        id: 'lead_advocacy_older',
        emoji: '🔥',
        title: 'Leading Change: Advocacy in Action',
        desc: 'How to identify a problem and build a movement around it.',
        why: 'The biggest changes in history started with one person who refused to accept the way things were.',
        sections: [
          { title: 'Change Starts With Awareness', content: 'You can\'t fix what you don\'t see. Leadership starts with paying attention — noticing inequities in your school, your community, or your world. When something feels wrong, that discomfort is a leadership signal.' },
          { title: 'Building a Coalition', content: 'You can\'t create change alone. Find others who share your concern. Learn their experiences. Build a common message. Coalitions win — isolated individuals rarely do.' },
          { title: 'Tactics That Work', content: 'Effective advocacy tactics include: petitioning administrators, speaking at school board meetings, writing for the school paper, organizing forums, using social media strategically, partnering with community organizations, and running for student government.' },
        ],
        activities: [
          'Identify one issue in your school or community you want to change.',
          'Find 2 other people who care about the same issue.',
          'Research one successful youth-led advocacy campaign and write a summary of how they won.',
        ],
        quiz: [
          { q: 'Why is building a coalition important in advocacy?', options: ['It isn\'t — one person can change everything', 'Because coalitions have more voices, more reach, and more power than individuals', 'It just makes you look popular', 'Coalitions always fail'], answer: 1, explanation: 'Coalitions combine the voices, experiences, and resources of many people — making change efforts far more powerful and credible than any individual.' },
        ],
        call_to_action: 'Draft a one-page proposal for a change you want to see. Include the problem, the ask, and who you\'d deliver it to.',
      },
    ],
  },
};

function QuizSection({ quiz }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    let s = 0;
    quiz.forEach((q, i) => { if (answers[i] === q.answer) s++; });
    setScore(s);
    setSubmitted(true);
  };

  if (submitted) {
    const pct = Math.round((score / quiz.length) * 100);
    return (
      <div className="rounded-2xl p-4" style={{ background: 'rgba(30,10,50,0.8)', border: '1px solid rgba(168,85,247,0.3)' }}>
        <div className="text-center mb-3">
          <p className="text-xl font-bold text-white">{pct >= 70 ? '🏆' : '📚'} {pct}%</p>
          <p className="text-sm text-gray-400">{score}/{quiz.length} correct</p>
        </div>
        {quiz.map((q, i) => (
          <div key={i} className="mb-2 p-3 rounded-xl" style={{ background: answers[i] === q.answer ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${answers[i] === q.answer ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            <p className="text-xs font-semibold text-white mb-1">{q.q}</p>
            <p className="text-xs text-green-400">✓ {q.options[q.answer]}</p>
            {answers[i] !== q.answer && <p className="text-xs text-red-400">✗ Your answer: {q.options[answers[i]] ?? 'No answer'}</p>}
            <p className="text-xs text-gray-400 italic mt-1">{q.explanation}</p>
          </div>
        ))}
        <button onClick={() => { setAnswers({}); setSubmitted(false); setScore(0); }}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white mt-2"
          style={{ background: 'rgba(168,85,247,0.4)', border: '1px solid rgba(168,85,247,0.5)' }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(30,10,50,0.8)', border: '1px solid rgba(168,85,247,0.3)' }}>
      <p className="font-bold text-white mb-3">❓ Quick Quiz</p>
      {quiz.map((q, qi) => (
        <div key={qi} className="mb-4">
          <p className="text-sm font-semibold text-white mb-2">{qi + 1}. {q.q}</p>
          <div className="space-y-1.5">
            {q.options.map((opt, oi) => (
              <button key={oi} onClick={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}
                className="w-full text-left text-sm px-3 py-2 rounded-xl transition"
                style={{ background: answers[qi] === oi ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.06)', border: `1px solid ${answers[qi] === oi ? 'rgba(168,85,247,0.7)' : 'rgba(255,255,255,0.1)'}`, color: '#fff' }}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={handleSubmit} disabled={Object.keys(answers).length < quiz.length}
        className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
        Submit Answers
      </button>
    </div>
  );
}

function TopicDetail({ topic, onBack }) {
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ggu_voice_completed') || '[]'); } catch { return []; }
  });
  const isDone = completed.includes(topic.id);

  const markDone = () => {
    const updated = [...new Set([...completed, topic.id])];
    setCompleted(updated);
    localStorage.setItem('ggu_voice_completed', JSON.stringify(updated));
    onBack();
  };

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />
      <div className="relative z-10">
        <div className="flex items-center gap-2 px-4 pt-4 pb-3 sticky top-0 z-10" style={{ backgroundColor: '#0d0010' }}>
          <button onClick={onBack} className="flex items-center gap-1 text-gray-400 text-sm">
            <ChevronLeft size={18} /> Back
          </button>
          {isDone && <span className="ml-auto text-xs text-green-400 font-semibold flex items-center gap-1"><CheckCircle2 size={13} /> Done</span>}
        </div>
        <div className="px-4 pb-8 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.6), rgba(139,10,120,0.5))', border: '1px solid rgba(168,85,247,0.4)' }}>
              {topic.emoji}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">{topic.title}</h1>
              <p className="text-sm text-gray-400 mt-1">{topic.desc}</p>
            </div>
          </div>

          <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(109,40,217,0.25)', border: '1px solid rgba(168,85,247,0.3)' }}>
            <p className="text-xs font-bold text-purple-300 mb-1">⭐ Why It Matters</p>
            <p className="text-sm text-gray-200">{topic.why}</p>
          </div>

          <div className="space-y-3">
            {topic.sections.map((sec, i) => (
              <div key={i} className="rounded-2xl px-4 py-4" style={{ background: 'rgba(30,10,50,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="font-bold text-sm mb-2" style={{ color: '#c084fc' }}>{sec.title}</p>
                <p className="text-sm text-gray-200 leading-relaxed">{sec.content}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3"><span className="text-orange-400 text-lg">✏️</span><p className="font-bold text-white">Activities</p></div>
            <div className="space-y-2">
              {topic.activities.map((a, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(15,60,35,0.5)', border: '1px solid rgba(74,222,128,0.15)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ background: 'rgba(34,197,94,0.5)', minWidth: 24 }}>{i + 1}</div>
                  <p className="text-sm text-gray-200 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>

          {topic.quiz?.length > 0 && <QuizSection quiz={topic.quiz} />}

          {topic.call_to_action && (
            <div className="rounded-2xl px-4 py-4" style={{ background: 'rgba(109,40,217,0.3)', border: '1px solid rgba(168,85,247,0.4)' }}>
              <p className="text-xs font-bold text-yellow-300 mb-1">🎯 Call to Action</p>
              <p className="text-sm text-gray-200 leading-relaxed">{topic.call_to_action}</p>
            </div>
          )}

          {!isDone ? (
            <button onClick={markDone} className="w-full py-3 rounded-2xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
              ✓ Mark as Complete
            </button>
          ) : (
            <div className="w-full py-3 rounded-2xl text-sm font-bold text-green-400 text-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
              ✓ Topic Completed!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function YourVoice() {
  const navigate = useNavigate();
  const [ageGroup, setAgeGroup] = useState(() => localStorage.getItem('ggu_voice_age') || 'middle');
  const [activeSection, setActiveSection] = useState('your_voice');
  const [selectedTopic, setSelectedTopic] = useState(null);

  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ggu_voice_completed') || '[]'); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem('ggu_voice_age', ageGroup); }, [ageGroup]);

  const topics = ALL_TOPICS[activeSection]?.[ageGroup] || [];
  const completedCount = topics.filter(t => completed.includes(t.id)).length;
  const currentGroup = AGE_GROUPS.find(a => a.id === ageGroup);
  const currentSection = SECTIONS.find(s => s.id === activeSection);

  if (selectedTopic) {
    return <TopicDetail topic={selectedTopic} onBack={() => {
      setSelectedTopic(null);
      try { setCompleted(JSON.parse(localStorage.getItem('ggu_voice_completed') || '[]')); } catch {}
    }} />;
  }

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />
      <div className="relative z-10">
        <div className="px-4 pt-10 pb-4" style={{ background: 'linear-gradient(180deg, rgba(109,40,217,0.5) 0%, rgba(13,0,16,0) 100%)' }}>
          <button onClick={() => navigate(-1)} className="absolute top-4 left-4 text-gray-400"><ChevronLeft size={20} /></button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(168,85,247,0.3)' }}>🗣️</div>
            <div>
              <h1 className="text-2xl font-bold text-white">Your Voice</h1>
              <p className="text-xs text-gray-300">Speak up · Know your civics · Lead with purpose</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span>⚖️</span>
            <p className="text-xs text-gray-300"><span className="text-white font-semibold">100% Nonpartisan.</span> We help you understand how systems work — not who to vote for.</p>
          </div>
        </div>

        <div className="px-4 space-y-4">
          {/* Age Group Selector */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs text-gray-400 mb-3 font-semibold">Select your age group:</p>
            <div className="grid grid-cols-3 gap-2">
              {AGE_GROUPS.map(a => (
                <button key={a.id} onClick={() => setAgeGroup(a.id)}
                  className="rounded-2xl p-3 text-center transition"
                  style={ageGroup === a.id
                    ? { background: 'rgba(236,72,153,0.25)', border: '2px solid #ec4899' }
                    : { background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)' }}>
                  <div className="text-2xl mb-1">{a.emoji}</div>
                  <p className="text-xs font-bold text-white leading-tight">{a.label}</p>
                  <p className="text-[10px] text-gray-400">{a.ages}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {SECTIONS.map(s => {
              const isActive = activeSection === s.id;
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className="rounded-2xl p-3 text-center transition"
                  style={isActive
                    ? { background: `${s.color}30`, border: `1.5px solid ${s.color}` }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-xl mb-1">{s.emoji}</div>
                  <p className="text-xs font-bold text-white">{s.label}</p>
                </button>
              );
            })}
          </div>

          {/* Progress */}
          <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-lg">{currentSection?.emoji}</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-white">{currentSection?.label} · {currentGroup?.label}</p>
              <p className="text-xs text-gray-400">{currentSection?.desc}</p>
            </div>
            <span className="text-xs text-gray-400 font-semibold">{completedCount}/{topics.length} done</span>
          </div>

          {/* Topic Cards */}
          {topics.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">🚧</p>
              <p className="text-sm text-gray-400">Content for this section is coming soon!</p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {topics.map(topic => {
                const isDone = completed.includes(topic.id);
                return (
                  <button key={topic.id} onClick={() => setSelectedTopic(topic)}
                    className="w-full text-left rounded-2xl overflow-hidden transition hover:opacity-90"
                    style={{ background: 'rgba(20,10,35,0.8)', border: `1px solid ${isDone ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)'}`, borderLeft: `4px solid ${currentSection?.color || '#a855f7'}` }}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{topic.emoji}</span>
                          {isDone && <span className="text-xs text-green-400 font-semibold flex items-center gap-0.5"><CheckCircle2 size={11} /> Done</span>}
                        </div>
                        <ChevronRight size={16} className="text-gray-500" />
                      </div>
                      <h3 className="font-bold text-base text-white leading-snug mb-1">{topic.title}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">{topic.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <BottomNav active="discover" />
    </div>
  );
}