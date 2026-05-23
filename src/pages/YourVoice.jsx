import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

// ── CIVIC TOPICS DATA ──────────────────────────────────────────────────────────
const STAGES = [
  { id: 'glow_girls',  label: 'Glow Girls',  ages: 'Ages 10–13', emoji: '🌱' },
  { id: 'glow_teens',  label: 'Glow Teens',  ages: 'Ages 14–17', emoji: '🌸' },
  { id: 'glow_women',  label: 'Glow Women',  ages: 'Ages 18–26', emoji: '👑' },
];

const CIVIC_TOPICS = [
  {
    id: 'how_voting_works',
    stages: ['glow_girls','glow_teens','glow_women'],
    category: 'How Voting Works',
    emoji: '🗳️',
    title: 'How Voting Works',
    desc: 'Your vote is your voice. Here\'s how to use it.',
    why_it_matters: 'Voting is one of the most direct ways citizens shape their communities. Understanding how it works empowers you to participate confidently.',
    key_facts: ['In the U.S., citizens can vote starting at age 18 in most elections.', 'You must register to vote before Election Day in most states.', 'Voting happens at local polling places or by mail/absentee ballot.', 'Elections happen at local, state, and national levels.'],
    sections: [
      { title: 'What Is Voting?', content: 'Voting is the process by which citizens choose their representatives and decide on important issues. When more people vote, the results better reflect what the community actually wants.' },
      { title: 'Who Can Vote?', content: 'In the United States, you can vote if you are a U.S. citizen, at least 18 years old on Election Day, and registered to vote in your state. Some states allow 17-year-olds to vote in primaries.' },
      { title: 'How Do You Register?', content: 'You can register to vote online at vote.gov, at your local DMV, at your school or library, or by mail. Registration deadlines vary by state.' },
      { title: 'What Happens on Election Day?', content: 'On Election Day, you go to your assigned polling place, show your ID if required, receive a ballot, mark your choices privately, and submit it. You can also vote early or by mail in many states.' },
      { title: 'Types of Elections', content: 'Primary elections determine which candidates represent each party. General elections are the main elections where winners are chosen. Local elections decide mayors, school boards, city councils, and judges.' },
    ],
    activities: ['Find Your Polling Place: Visit vote.gov and look up where you would vote if you were 18 today.', 'Hold a mock election in your group on a fun topic — run a real voting process with registration, secret ballot, and counting.', 'Research the top 3 reasons people give for not voting. Write a response to "my vote doesn\'t matter."'],
    quiz: [
      { q: 'At what age can most U.S. citizens vote in federal elections?', options: ['16','17','18','21'], answer: 2, explanation: 'The 26th Amendment (1971) lowered the voting age to 18 for all federal, state, and local elections.' },
      { q: 'What must you do before you can vote in most states?', options: ['Pay a fee','Register to vote','Pass a test','Own property'], answer: 1, explanation: 'Voter registration is required in most states. You can register online at vote.gov, at the DMV, or by mail.' },
      { q: 'Which type of election determines which candidates represent each party?', options: ['General election','Primary election','Midterm election','Local election'], answer: 1, explanation: 'Primary elections let voters within a party choose their candidate for the general election.' },
      { q: 'What is an absentee ballot?', options: ['A ballot for people who missed the last election','A ballot cast in person on Election Day','A ballot mailed to voters who cannot go to a polling place','A ballot for candidates who dropped out'], answer: 2, explanation: 'Absentee (mail-in) ballots allow voters to cast their vote by mail if they cannot go to a polling place in person.' },
    ],
    call_to_action: 'If you\'re 18 or close to it, register at vote.gov right now. It takes 5 minutes. If you\'re younger, help a family member or neighbor register.',
  },
  {
    id: 'local_government',
    stages: ['glow_girls','glow_teens','glow_women'],
    category: 'Government',
    emoji: '🏛️',
    title: 'What Local Government Does',
    desc: 'The government closest to you has the most direct impact on your daily life.',
    why_it_matters: 'Local government controls your schools, roads, parks, police, and zoning. Most people have no idea how much power their city council or school board actually has.',
    key_facts: ['Local government includes city councils, mayors, county commissioners, and school boards.', 'Local officials are often elected with very few votes — your vote counts more here.', 'Local government controls property taxes, zoning laws, and local services.', 'School boards decide curriculum, budgets, and policies for your school district.'],
    sections: [
      { title: 'Levels of Government', content: 'The U.S. has three levels of government: federal (national), state, and local. Local government includes your city or town government, county government, and special districts like school districts.' },
      { title: 'What Does City Government Do?', content: 'City governments manage local services like trash collection, parks, libraries, local roads, and zoning. They are run by a mayor and city council, who pass local laws called ordinances.' },
      { title: 'What Does a School Board Do?', content: 'School boards are elected bodies that oversee public school districts. They hire and fire the superintendent, approve the school budget, and set policies on curriculum and discipline. School board elections often have very low turnout — meaning a small number of voters decide huge issues.' },
      { title: 'County Government', content: 'Counties handle services like courts, jails, property records, elections, and social services. County commissioners are elected to run county government. In rural areas, county government is often the most important level.' },
    ],
    activities: ['Look up the name of your mayor and two city council members. Find one decision your city council made in the last year.', 'Attend a city council or school board meeting (in person or virtually) and write 3 things you observed.', 'If you were on your city council, what is one thing you would change? Write a short proposal.'],
    quiz: [
      { q: 'Which body is responsible for setting policies for your public school district?', options: ['The mayor','The school board','The governor','The city council'], answer: 1, explanation: 'School boards are elected bodies that oversee public school districts, including curriculum, budgets, and policies.' },
      { q: 'What is a city ordinance?', options: ['A federal law','A state regulation','A local law passed by a city council','A court ruling'], answer: 2, explanation: 'Ordinances are local laws passed by city or county councils. They govern things like noise levels, zoning, and local business rules.' },
      { q: 'Which level of government is typically responsible for local roads and parks?', options: ['Federal','State','Local','All equally'], answer: 2, explanation: 'Local governments (cities and counties) are primarily responsible for local roads, parks, libraries, and other community services.' },
    ],
    call_to_action: 'Look up when your next school board meeting is. You can attend, watch online, or even speak during public comment. Your voice matters at every level.',
  },
  {
    id: 'understanding_elections',
    stages: ['glow_girls','glow_teens','glow_women'],
    category: 'How Voting Works',
    emoji: '🏆',
    title: 'Understanding Elections',
    desc: 'How candidates get on the ballot — and how winners are decided.',
    why_it_matters: 'Understanding how elections work helps you see through misinformation and understand why results look the way they do.',
    key_facts: ['Presidential elections happen every 4 years. Congressional elections happen every 2 years.', 'The Electoral College, not the popular vote, decides the U.S. president.', 'Gerrymandering is the practice of drawing district lines to favor one party.', 'Campaign finance laws regulate how much money candidates can raise and spend.'],
    sections: [
      { title: 'How Candidates Get on the Ballot', content: 'To run for office, candidates must meet eligibility requirements, file paperwork with election officials, and often collect voter signatures. Major party candidates typically win their party\'s primary election first.' },
      { title: 'The Electoral College', content: 'The President of the United States is not directly elected by popular vote. Each state has a number of "electors" equal to its total Congressional representation. A candidate needs 270 of 538 electoral votes to win.' },
      { title: 'How Votes Are Counted', content: 'After polls close, election workers count ballots. Results are certified by state officials and then by Congress. Recounts can be requested if results are very close.' },
      { title: 'Campaign Finance', content: 'Candidates raise money from individual donors, PACs, and party organizations. Federal law limits direct donations to campaigns. Super PACs can raise unlimited money but cannot coordinate directly with campaigns.' },
    ],
    activities: ['Look up how many electoral votes your state has. Find the 5 states with the most electoral votes. Why do campaigns focus on "swing states"?', 'Design a mock campaign for a school or community issue. Create a platform, a slogan, and one campaign ad.'],
    quiz: [
      { q: 'How many electoral votes does a presidential candidate need to win?', options: ['269','270','300','538'], answer: 1, explanation: 'A candidate needs 270 of 538 total electoral votes to win the presidency.' },
      { q: 'What is a primary election?', options: ['The most important election','An election where party members choose their candidate','The first round of a general election','An election for local offices only'], answer: 1, explanation: 'Primary elections allow voters within a political party to choose which candidate will represent their party in the general election.' },
      { q: 'What is gerrymandering?', options: ['A type of voter fraud','Drawing district lines to favor one party or group','A campaign finance violation','A recount process'], answer: 1, explanation: 'Gerrymandering is the manipulation of electoral district boundaries to give one political party an advantage over others.' },
    ],
    call_to_action: 'Watch a documentary or read one article about how elections work in your state. Understanding the process is the first step to participating in it.',
  },
  {
    id: 'how_laws_are_made',
    stages: ['glow_girls','glow_teens','glow_women'],
    category: 'Laws & Rights',
    emoji: '⚖️',
    title: 'How Laws Are Made',
    desc: 'A bill becomes a law — and you can influence every step.',
    why_it_matters: 'Laws affect every part of your life — from school policies to healthcare to what you can do online. Understanding how they\'re made means you can influence them.',
    key_facts: ['Any member of Congress can introduce a bill.', 'A bill must pass both the House and Senate before going to the president.', 'The president can sign a bill into law or veto it.', 'Congress can override a veto with a 2/3 majority vote.'],
    sections: [
      { title: 'What Is a Law?', content: 'A law is a rule made by a government that everyone in its jurisdiction must follow. Laws can be made at the federal, state, or local level.' },
      { title: 'The Legislative Process', content: 'A bill starts when a member of Congress introduces it. It is assigned to a committee that studies it. If the committee approves it, the full House or Senate debates and votes on it. If both chambers pass the same version, it goes to the president.' },
      { title: 'The President\'s Role', content: 'The president can sign the bill into law, veto it, or do nothing. Congress can override a presidential veto with a 2/3 majority vote in both chambers.' },
      { title: 'How Citizens Influence Laws', content: 'Citizens can contact their representatives, sign petitions, testify at public hearings, organize advocacy campaigns, vote for candidates who support their positions, and run for office themselves.' },
    ],
    activities: ['Go to congress.gov and find a bill that interests you. What committee is it in? Has it passed either chamber? Write a one-paragraph summary.', 'Find your U.S. Representative at house.gov. Write a short, respectful letter about an issue you care about.'],
    quiz: [
      { q: 'Which two bodies must both pass a bill before it goes to the president?', options: ['The Supreme Court and the Senate','The House of Representatives and the Senate','The president and the Senate','The House and the Supreme Court'], answer: 1, explanation: 'Both the House of Representatives and the Senate must pass the same version of a bill before it can be sent to the president.' },
      { q: 'What happens when the president vetoes a bill?', options: ['The bill automatically becomes law','The bill dies permanently','Congress can override the veto with a 2/3 majority','The Supreme Court decides'], answer: 2, explanation: 'Congress can override a presidential veto if 2/3 of both the House and Senate vote to do so.' },
    ],
    call_to_action: 'Find one law that affects your life directly (like school funding, healthcare, or social media). Research who sponsored it and how it passed.',
  },
  {
    id: 'research_candidates',
    stages: ['glow_teens','glow_women'],
    category: 'How Voting Works',
    emoji: '🔍',
    title: 'How to Research Candidates',
    desc: 'Make your vote count by knowing who you\'re voting for.',
    why_it_matters: 'Voting for candidates you don\'t know is like buying a product without reading the label. A little research goes a long way.',
    key_facts: ['Candidates\' voting records are public information.', 'Campaign websites, debates, and voter guides are the best starting points.', 'Your local League of Women Voters chapter often publishes nonpartisan voter guides.', 'BallotReady.org and Vote411.org provide candidate information for local races.'],
    sections: [
      { title: 'Where to Start', content: 'Start with your sample ballot — you can usually find it on your county election website. For major offices there is usually lots of information available. For local races like school board or city council, you may need to dig deeper.' },
      { title: 'Evaluating Candidates', content: 'Look at their background and experience. Read their positions on issues that matter to you. For incumbents, look at their voting record — what did they actually do, not just say? Check who is funding their campaign.' },
      { title: 'Nonpartisan Resources', content: 'Vote411.org (League of Women Voters) provides nonpartisan candidate information. BallotReady.org covers local races. Ballotpedia.org covers all levels of government. Avoid relying solely on social media or partisan sources.' },
    ],
    activities: ['Go to Vote411.org or BallotReady.org and look up a candidate running for a local office in your area. Write a one-paragraph summary.', 'Make a list of the 3 issues that matter most to you. Then find where two candidates stand on those issues.'],
    quiz: [
      { q: 'What is a voter guide?', options: ['A pamphlet telling you who to vote for','A nonpartisan resource with information about candidates and ballot measures','A list of polling places','A government-issued ID for voting'], answer: 1, explanation: 'Voter guides provide factual, nonpartisan information about candidates\' backgrounds, positions, and records to help voters make informed decisions.' },
      { q: 'What is an incumbent?', options: ['A first-time candidate','A candidate who lost the last election','A person currently holding the office being contested','A write-in candidate'], answer: 2, explanation: 'An incumbent is a person who currently holds the office that is up for election.' },
    ],
    call_to_action: 'Go to Vote411.org and look up candidates in your area. Even if you can\'t vote yet, knowing who is running shapes the conversations you can have.',
  },
  {
    id: 'debate_discussion',
    stages: ['glow_girls','glow_teens','glow_women'],
    category: 'Community',
    emoji: '💬',
    title: 'Debate & Respectful Discussion',
    desc: 'Strong opinions + respectful dialogue = real progress.',
    why_it_matters: 'The ability to discuss difficult topics respectfully is one of the most valuable skills in civic life, relationships, and careers.',
    key_facts: ['Listening is more important than talking in productive debates.', 'Attacking a person instead of their argument is called an ad hominem fallacy.', 'The strongest arguments acknowledge the strongest counterarguments.', 'Changing your mind based on evidence is a sign of intelligence, not weakness.'],
    sections: [
      { title: 'What Makes a Good Debate?', content: 'A good debate is not about winning — it\'s about getting closer to the truth. Good debaters listen carefully, respond to what was actually said, use evidence to support their claims, and remain respectful.' },
      { title: 'Logical Fallacies to Avoid', content: 'Ad hominem: attacking the person instead of their argument. Straw man: misrepresenting someone\'s argument to make it easier to attack. False dichotomy: presenting only two options when more exist. Bandwagon: arguing something is true because many people believe it.' },
      { title: 'How to Disagree Respectfully', content: 'Use "I" statements instead of "you" accusations. Acknowledge what the other person got right before explaining where you disagree. Ask questions to understand their perspective better. Know when to end a conversation.' },
    ],
    activities: ['Choose a nonpartisan civic topic (e.g., "Should voting be mandatory?"). Assign sides randomly. Focus on evidence and logic, not emotion.', 'Pick a position you disagree with. Write the strongest possible argument FOR that position (steelmanning). This builds empathy and critical thinking.'],
    quiz: [
      { q: 'What is an ad hominem fallacy?', options: ['Using too much evidence','Attacking the person making an argument instead of the argument itself','Agreeing with someone too quickly','Using Latin in a debate'], answer: 1, explanation: 'An ad hominem fallacy occurs when you attack the person making an argument rather than addressing the argument itself.' },
      { q: 'What does "steelmanning" mean?', options: ['Refusing to change your position','Presenting the strongest version of an opposing argument','Using aggressive debate tactics','Repeating your argument louder'], answer: 1, explanation: 'Steelmanning means presenting the strongest possible version of an opposing argument — the opposite of a straw man.' },
    ],
    call_to_action: 'The next time you disagree with someone, try to understand their perspective before responding. Ask one genuine question before making your counterargument.',
  },


  {
    id: 'manipulation',
    stages: ['glow_teens','glow_women'],
    category: 'Relationships & Safety',
    emoji: '🛡️',
    title: 'Manipulation: How to Spot It & Not Be It',
    desc: 'Real ones don\'t need to manipulate. Learn the difference.',
    why_it_matters: 'Manipulation is one of the most common tools used in unhealthy relationships. Learning to recognize it protects you. Learning not to use it makes you a trustworthy, respected person.',
    key_facts: ['Manipulation is when someone tries to influence you through dishonest, unfair, or emotional tactics instead of honest communication.', 'Manipulators often target people who are kind, empathetic, or eager to please.', 'Gaslighting — making someone question their own reality — is one of the most harmful forms of manipulation.', 'You can be manipulative without realizing it. Self-awareness is key.'],
    sections: [
      { title: 'What Is Manipulation?', content: 'Manipulation is using indirect, dishonest, or emotionally coercive tactics to get what you want from someone. It\'s different from persuasion. Persuasion is honest — you share your perspective, make your case, and respect the other person\'s right to say no.' },
      { title: 'Common Manipulation Tactics to Watch For', content: 'Guilt-tripping: making you feel responsible for their emotions. Silent treatment: withdrawing affection as punishment. Gaslighting: making you question your memory or sanity. Love bombing: overwhelming you with affection early on. Isolation: slowly cutting you off from friends and family.' },
      { title: 'How to Know If You\'re Being Manipulated', content: 'You often feel confused, guilty, or like you\'re "going crazy" after conversations. You apologize constantly. You feel drained after spending time with them. You\'ve changed who you are to keep them happy. These are warning signs. Trust your gut.' },
      { title: 'How to Respond to Manipulation', content: 'Name it calmly: "I feel like I\'m being guilt-tripped right now. Can we talk about this directly?" Set a boundary: "I\'m not going to continue this conversation when it feels like this." Take space: You don\'t have to respond immediately.' },
      { title: 'How NOT to Be a Manipulator', content: 'Practice direct, honest communication. Say what you mean. Ask for what you need. Accept no as an answer. Respect other people\'s boundaries. This is how you build real, lasting relationships.' },
      { title: 'Healthy Influence vs. Manipulation', content: 'Healthy influence: "I really want your company, but I understand if you can\'t." Manipulation: "If you were really my friend, you\'d come." The difference is respect. You can be persuasive and influential without being manipulative.' },
    ],
    activities: ['Think of a time when you felt confused or drained after an interaction. Can you identify any manipulation tactics? Write about it in your journal.', 'Have you ever used guilt-tripping or the silent treatment? Write about one situation and how you could have handled it more directly.', 'Take a manipulative statement and rewrite it as honest communication. Practice with 3 different scenarios.'],
    quiz: [
      { q: 'What is gaslighting?', options: ['Giving someone too many compliments','Making someone question their own memory, perception, or reality','Ignoring someone\'s texts','Being overly honest'], answer: 1, explanation: 'Gaslighting is a form of manipulation where someone makes you doubt your own perception of reality — often saying things like "That never happened" or "You\'re overreacting."' },
      { q: 'What is the key difference between persuasion and manipulation?', options: ['Persuasion is louder than manipulation','Persuasion is honest and respects the other person\'s right to say no; manipulation does not','Manipulation is only used by bad people','There is no difference'], answer: 1, explanation: 'Persuasion is honest — you make your case and respect the other person\'s choice. Manipulation bypasses their free choice through dishonest or coercive tactics.' },
      { q: 'Which of these is a sign that YOU might be manipulating someone?', options: ['You ask for what you need directly','You accept "no" as an answer','You give people the silent treatment when you\'re upset instead of talking about it','You share your honest feelings'], answer: 2, explanation: 'Using the silent treatment as punishment instead of communicating directly is a form of manipulation. Healthy communication means expressing your feelings honestly.' },
    ],
    call_to_action: 'This week, practice one thing: when you want something from someone, ask for it directly and honestly — and accept their answer with grace, whatever it is.',
  },

  {
    id: 'good_employee',
    stages: ['glow_teens','glow_women'],
    category: 'School & Career Skills',
    emoji: '💼',
    title: 'How to Be a Good Employee',
    desc: 'Your first job is your first audition. Make it count.',
    why_it_matters: 'How you show up as an employee shapes your reputation, your opportunities, and your income for years to come. The workplace has unwritten rules — and knowing them gives you a serious advantage.',
    key_facts: ['93% of employers say professionalism and work ethic matter more than technical skills for entry-level positions.', 'Most people are not fired for incompetence — they\'re let go for attitude, reliability, or interpersonal issues.', 'Your reputation follows you — industries are smaller than they look, and people talk.', 'The habits you build in your first job often follow you throughout your career.'],
    sections: [
      { title: 'What Employers Actually Want', content: 'Beyond the job description, employers are looking for people who show up on time, communicate clearly, take initiative, handle feedback professionally, and get along with others. Technical skills can be taught. Character and work ethic are much harder to train.' },
      { title: 'Professionalism: The Basics', content: 'Show up on time — actually, show up early. Keep your phone put away during work hours. Speak respectfully to everyone — the janitor and the CEO deserve the same courtesy.' },
      { title: 'How to Handle Feedback and Criticism', content: 'When your manager gives you feedback, the right response is: listen fully without interrupting, say "thank you," ask clarifying questions if needed, and then actually implement the feedback. Do not get defensive or make excuses.' },
      { title: 'Communication in the Workplace', content: 'Respond to messages and emails promptly. If you\'re going to be late or absent, notify your supervisor as early as possible. Speak up in meetings. Learn to write professional emails — no slang, proper punctuation, clear subject lines.' },
      { title: 'Taking Initiative and Going Beyond', content: 'The employees who get promoted are not just the ones who do their jobs — they\'re the ones who notice what needs to be done and do it without being asked.' },
      { title: 'Know Your Rights as an Employee', content: 'You have the right to a safe work environment, free from harassment and discrimination. You have the right to be paid for all hours worked — wage theft is illegal. If you\'re under 18, there are specific child labor laws that limit your hours.' },
    ],
    activities: ['Think about your current or most recent job. How would your supervisor describe your work ethic? Write 3 things you do well and 1 thing you want to improve.', 'Write a professional email to a teacher, mentor, or employer. Use proper formatting, no slang, and a clear subject line.', 'Look up the minimum wage and basic employee rights in your state. Find one law that protects workers your age.'],
    quiz: [
      { q: 'What is the most common reason employees are let go from jobs?', options: ['Not knowing enough technical skills','Attitude, reliability, or interpersonal issues','Being too young','Not having enough education'], answer: 1, explanation: 'Most people are not fired for incompetence — they\'re let go for attitude, reliability, or how they treat others. Soft skills matter enormously in the workplace.' },
      { q: 'When your manager gives you critical feedback, the best response is:', options: ['Defend yourself and explain why you did it that way','Point out what your coworkers are doing wrong too','Listen fully, thank them, ask clarifying questions, and implement the feedback','Ignore it and keep doing things your way'], answer: 2, explanation: 'Receiving feedback gracefully and acting on it quickly is one of the fastest ways to advance in any workplace. Defensiveness and excuses signal that you\'re not coachable.' },
      { q: 'What should you do if you\'re going to be late or absent from work?', options: ['Text a coworker to cover for you','Notify your supervisor as early as possible','Just show up when you can without saying anything','Call in sick even if you\'re not'], answer: 1, explanation: 'Notifying your supervisor as early as possible is the professional thing to do. It shows respect for the team and demonstrates reliability even when you can\'t be there.' },
    ],
    call_to_action: 'Identify one professional habit from this resource that you want to build. Practice it every day for the next 30 days and notice how people respond to you differently.',
  },
];

const CATEGORIES = ['All', 'How Voting Works', 'Government', 'Laws & Rights', 'Mindset & Growth', 'Relationships & Safety', 'School & Career Skills', 'Community', 'Health & Wellness'];

const STAGE_TOPICS = {
  glow_girls: (t) => t.stages.includes('glow_girls'),
  glow_teens: (t) => t.stages.includes('glow_teens'),
  glow_women: (t) => t.stages.includes('glow_women'),
};

function QuizSection({ quiz, topicId }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (qi, oi) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qi]: oi }));
  };

  const handleSubmit = () => {
    let s = 0;
    quiz.forEach((q, i) => { if (answers[i] === q.answer) s++; });
    setScore(s);
    setSubmitted(true);
  };

  const handleReset = () => { setAnswers({}); setSubmitted(false); setScore(0); };

  const pct = quiz.length > 0 ? Math.round((score / quiz.length) * 100) : 0;

  if (submitted) {
    return (
      <div className="rounded-2xl p-4" style={{ background: 'rgba(30,10,50,0.8)', border: '1px solid rgba(168,85,247,0.3)' }}>
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">{pct >= 70 ? '🏆' : '📚'}</div>
          <p className="text-xl font-bold text-white">{pct}%</p>
          <p className="text-sm text-gray-400">{score}/{quiz.length} correct</p>
          <p className="text-xs text-purple-300 mt-1">{pct >= 70 ? 'Great job! Keep learning.' : 'Review the material and try again!'}</p>
        </div>
        {quiz.map((q, i) => (
          <div key={i} className="mb-3 p-3 rounded-xl" style={{ background: answers[i] === q.answer ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${answers[i] === q.answer ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            <p className="text-sm font-semibold text-white mb-1">{q.q}</p>
            <p className="text-xs text-green-400 mb-1">✓ {q.options[q.answer]}</p>
            {answers[i] !== q.answer && <p className="text-xs text-red-400 mb-1">✗ Your answer: {q.options[answers[i]] ?? 'No answer'}</p>}
            <p className="text-xs text-gray-400 italic">{q.explanation}</p>
          </div>
        ))}
        <button onClick={handleReset} className="w-full py-2.5 rounded-xl text-sm font-bold text-white mt-2" style={{ background: 'rgba(168,85,247,0.4)', border: '1px solid rgba(168,85,247,0.5)' }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(30,10,50,0.8)', border: '1px solid rgba(168,85,247,0.3)' }}>
      <p className="font-bold text-white mb-3 flex items-center gap-2"><span className="text-red-400">❓</span> Quiz — {quiz.length} Questions</p>
      {quiz.map((q, qi) => (
        <div key={qi} className="mb-4">
          <p className="text-sm font-semibold text-white mb-2">{qi + 1}. {q.q}</p>
          <div className="space-y-1.5">
            {q.options.map((opt, oi) => (
              <button key={oi} onClick={() => handleSelect(qi, oi)}
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

export default function YourVoice() {
  const navigate = useNavigate();
  const [stage, setStage] = useState(() => localStorage.getItem('ggu_civic_stage') || 'glow_girls');
  const [activeCat, setActiveCat] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ggu_civic_completed') || '[]'); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem('ggu_civic_stage', stage); }, [stage]);
  useEffect(() => { localStorage.setItem('ggu_civic_completed', JSON.stringify(completed)); }, [completed]);

  const visibleTopics = CIVIC_TOPICS.filter(t => t.stages.includes(stage)).filter(t => activeCat === 'All' || t.category === activeCat);
  const stageTopics = CIVIC_TOPICS.filter(t => t.stages.includes(stage));
  const completedCount = stageTopics.filter(t => completed.includes(t.id)).length;
  const quizCount = stageTopics.reduce((sum, t) => sum + t.quiz.length, 0);
  const progressPct = stageTopics.length > 0 ? Math.round((completedCount / stageTopics.length) * 100) : 0;

  const markDone = (id) => { if (!completed.includes(id)) setCompleted(prev => [...prev, id]); };

  if (selectedTopic) {
    const isDone = completed.includes(selectedTopic.id);
    return (
      <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0010' }}>
        <AppBackground />
        <div className="relative z-10">
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 sticky top-0 z-10" style={{ backgroundColor: '#0d0010' }}>
            <button onClick={() => setSelectedTopic(null)} className="flex items-center gap-1 text-gray-400 text-sm hover:text-white transition">
              <ChevronLeft size={18} /> Back to Your Voice
            </button>
            {isDone && <span className="ml-auto text-xs text-green-400 font-semibold flex items-center gap-1"><CheckCircle2 size={13} /> Done</span>}
          </div>
          <div className="px-4 pb-6">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.6), rgba(139,10,120,0.5))', border: '1px solid rgba(168,85,247,0.4)' }}>
                {selectedTopic.emoji}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold mb-1" style={{ color: '#c084fc' }}>{selectedTopic.category.toUpperCase()}</p>
                <h1 className="text-2xl font-bold italic text-white leading-tight">{selectedTopic.title}</h1>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4">{selectedTopic.desc}</p>

            {/* Why It Matters */}
            <div className="rounded-2xl px-4 py-3 mb-4" style={{ background: 'rgba(109,40,217,0.25)', border: '1px solid rgba(168,85,247,0.3)' }}>
              <p className="text-xs font-bold text-purple-300 mb-1">⭐ Why It Matters</p>
              <p className="text-sm text-gray-200">{selectedTopic.why_it_matters}</p>
            </div>

            {/* Key Facts */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-yellow-400 text-lg">💡</span>
                <p className="font-bold text-white text-base">Key Facts</p>
              </div>
              <div className="space-y-2">
                {selectedTopic.key_facts.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(60,15,90,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: '2px solid #ec4899' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed">{f}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div className="mb-5 space-y-3">
              {selectedTopic.sections.map((sec, i) => (
                <div key={i} className="rounded-2xl px-4 py-4" style={{ background: 'rgba(30,10,50,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="font-bold text-sm mb-2" style={{ color: '#c084fc' }}>{sec.title}</p>
                  <p className="text-sm text-gray-200 leading-relaxed">{sec.content}</p>
                </div>
              ))}
            </div>

            {/* Activities */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-orange-400 text-lg">✏️</span>
                <p className="font-bold text-white text-base">Activities</p>
              </div>
              <div className="space-y-2">
                {selectedTopic.activities.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-2xl" style={{ background: 'rgba(15,60,35,0.5)', border: '1px solid rgba(74,222,128,0.15)' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ background: 'rgba(34,197,94,0.5)', minWidth: 24 }}>{i + 1}</div>
                    <p className="text-sm text-gray-200 leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz */}
            {selectedTopic.quiz.length > 0 && (
              <div className="mb-5">
                <QuizSection quiz={selectedTopic.quiz} topicId={selectedTopic.id} />
              </div>
            )}

            {/* Call to Action */}
            {selectedTopic.call_to_action && (
              <div className="rounded-2xl px-4 py-4 mb-5" style={{ background: 'rgba(109,40,217,0.3)', border: '1px solid rgba(168,85,247,0.4)' }}>
                <p className="text-xs font-bold text-yellow-300 mb-1">🎯 Call to Action</p>
                <p className="text-sm text-gray-200 leading-relaxed">{selectedTopic.call_to_action}</p>
              </div>
            )}

            {/* Mark Done */}
            {!isDone ? (
              <button onClick={() => { markDone(selectedTopic.id); setSelectedTopic(null); }}
                className="w-full py-3 rounded-2xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                ✓ Mark as Complete
              </button>
            ) : (
              <div className="w-full py-3 rounded-2xl text-sm font-bold text-green-400 text-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                ✓ Topic Completed!
              </div>
            )}
          </div>
        </div>
        <BottomNav active="discover" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />
      <div className="relative z-10">
        {/* Hero Header */}
        <div className="px-4 pt-12 pb-6" style={{ background: 'linear-gradient(180deg, rgba(109,40,217,0.6) 0%, rgba(13,0,16,0) 100%)' }}>
          <button onClick={() => navigate(-1)} className="absolute top-4 left-4 text-gray-400"><ChevronLeft size={20} /></button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(168,85,247,0.3)' }}>🗳️</div>
            <div>
              <h1 className="text-2xl font-bold text-white">Your Voice</h1>
              <p className="text-xs text-gray-300">Civic education for future leaders</p>
            </div>
          </div>
          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-xs font-semibold text-gray-300">Your Progress</p>
              <p className="text-xs text-gray-400">{completedCount}/{stageTopics.length} topics</p>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #a855f7, #ec4899)' }} />
            </div>
          </div>
          {/* Nonpartisan badge */}
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-base">⚖️</span>
            <p className="text-xs text-gray-300"><span className="text-white font-semibold">100% Nonpartisan.</span> We help you understand how systems work — not who to vote for.</p>
          </div>
        </div>

        <div className="px-4 pb-4 space-y-4">
          {/* Stage Selector */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs text-gray-400 mb-3">Select your stage:</p>
            <div className="grid grid-cols-3 gap-2">
              {STAGES.map(s => (
                <button key={s.id} onClick={() => { setStage(s.id); setActiveCat('All'); }}
                  className="rounded-2xl p-3 text-center transition"
                  style={stage === s.id
                    ? { background: 'rgba(236,72,153,0.25)', border: '2px solid #ec4899' }
                    : { background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)' }}>
                  <div className="text-2xl mb-1">{s.emoji}</div>
                  <p className="text-xs font-bold text-white">{s.label}</p>
                  <p className="text-xs text-gray-400">{s.ages}</p>
                </button>
              ))}
            </div>
          </div>


          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Topics', value: stageTopics.length, emoji: '📚' },
              { label: 'Completed', value: completedCount, emoji: '✅' },
              { label: 'Quizzes', value: quizCount, emoji: '🏆' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-2xl mb-1">{s.emoji}</div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <button onClick={() => navigate('/mock-vote')} className="w-full rounded-2xl p-4 text-left mb-3" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 20px rgba(245,158,11,0.4)' }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🗳️</span>
              <div>
                <p className="font-bold text-white text-sm">Mock Vote: What Matters to You?</p>
                <p className="text-xs text-yellow-100">Practice your civic voice — vote on issues that affect your school and community.</p>
              </div>
            </div>
            <p className="text-sm font-bold text-white text-center">Cast Your Mock Vote →</p>
          </button>
          {stage === 'glow_women' && (
            <a href="https://www.vote.gov" target="_blank" rel="noopener noreferrer" className="block w-full rounded-2xl p-4 text-left" style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 4px 20px rgba(22,163,74,0.4)' }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📋</span>
                <div>
                  <p className="font-bold text-white text-sm">Are You Registered to Vote?</p>
                  <p className="text-xs text-green-100">It takes 5 minutes at vote.gov. Your voice matters.</p>
                </div>
              </div>
              <p className="text-sm font-bold text-white text-center">Register at vote.gov →</p>
            </a>
          )}

          {/* Topic List */}
          {activeCat === 'All' ? (
            // Grouped by category
            <div className="space-y-5">
              {CATEGORIES.filter(c => c !== 'All' && visibleTopics.some(t => t.category === c)).map(cat => {
                const catTopics = visibleTopics.filter(t => t.category === cat);
                return (
                  <div key={cat}>
                    <p className="text-xs font-bold text-gray-400 mb-2 px-1">{cat} ({catTopics.length})</p>
                    <div className="space-y-2">
                      {catTopics.map(topic => <TopicCard key={topic.id} topic={topic} completed={completed} onPress={() => setSelectedTopic(topic)} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-400 mb-3">All Topics ({visibleTopics.length})</p>
              <div className="space-y-2">
                {visibleTopics.map(topic => <TopicCard key={topic.id} topic={topic} completed={completed} onPress={() => setSelectedTopic(topic)} />)}
              </div>
            </div>
          )}
        </div>
      </div>
      <BottomNav active="discover" />
    </div>
  );
}

function TopicCard({ topic, completed, onPress }) {
  const isDone = completed.includes(topic.id);
  const quizPct = 0; // Could track per-topic quiz scores later
  const catColors = {
    'How Voting Works': '#3b82f6',
    'Government': '#8b5cf6',
    'Laws & Rights': '#a855f7',
    'Media Literacy': '#06b6d4',
    'Community': '#10b981',
    'Health & Wellness': '#ec4899',
    'Mindset & Growth': '#f59e0b',
    'Relationships & Safety': '#ef4444',
    'School & Career Skills': '#84cc16',
  };
  const borderColor = catColors[topic.category] || '#8b5cf6';

  return (
    <button onClick={onPress} className="w-full text-left rounded-2xl overflow-hidden transition hover:opacity-90"
      style={{ background: 'rgba(20,10,35,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: `4px solid ${borderColor}` }}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-base">{topic.emoji}</span>
            <span className="text-xs font-semibold" style={{ color: borderColor }}>{topic.category}</span>
            {isDone && <span className="text-xs text-green-400 font-semibold flex items-center gap-0.5"><CheckCircle2 size={11} /> Done</span>}
          </div>
          <ChevronRight size={16} className="text-gray-500" />
        </div>
        <h3 className="font-bold text-base text-white leading-snug mb-1">{topic.title}</h3>
        <p className="text-xs text-gray-400 leading-relaxed mb-3">{topic.desc}</p>
        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full" style={{ width: isDone ? '100%' : '0%', background: `linear-gradient(90deg, ${borderColor}, #ec4899)` }} />
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>📖 {topic.sections.length} sections</span>
          <span>✏️ {topic.activities.length} activities</span>
          <span style={{ color: '#f87171' }}>❓ {topic.quiz.length} quiz questions</span>
        </div>
      </div>
    </button>
  );
}