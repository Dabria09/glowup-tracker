import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import LibraryQuiz from '@/components/LibraryQuiz';
import BookClub from '@/components/BookClub';
import QUIZZES from '@/lib/libraryQuizzes';
import { BookOpen, ChevronLeft, ChevronRight, Heart } from 'lucide-react';

const SECTION_TABS = [
  { id: 'resources', label: 'Resources', emoji: '📚' },
  { id: 'book_club', label: 'Book Club', emoji: '📖' },
];

const CAT_META = {
  hygiene:         { label: 'Hygiene',              emoji: '🚿', labelColor: '#c084fc', cardBg: 'rgba(88,28,135,0.55)' },
  skincare:        { label: 'Skincare',              emoji: '✨', labelColor: '#c084fc', cardBg: 'rgba(88,28,135,0.55)' },
  budgeting:       { label: 'Budgeting',             emoji: '💰', labelColor: '#fb923c', cardBg: 'rgba(88,28,135,0.55)' },
  scholarships:    { label: 'Scholarships',          emoji: '🎓', labelColor: '#c084fc', cardBg: 'rgba(88,28,135,0.55)' },
  college:         { label: 'College',               emoji: '🏢', labelColor: '#c084fc', cardBg: 'rgba(60,40,100,0.6)' },
  entrepreneurship:{ label: 'Entrepreneurship',      emoji: '🚀', labelColor: '#fb923c', cardBg: 'rgba(100,20,20,0.55)' },
  interview:       { label: 'Interview Prep',        emoji: '💼', labelColor: '#34d399', cardBg: 'rgba(6,78,59,0.5)' },
  safety:          { label: 'Safety',                emoji: '🛡️', labelColor: '#f87171', cardBg: 'rgba(127,29,29,0.5)' },
  studying:        { label: 'Studying',              emoji: '📖', labelColor: '#c084fc', cardBg: 'rgba(88,28,135,0.55)' },
  black_hair:      { label: 'Black Hair Care',       emoji: '👑', labelColor: '#c084fc', cardBg: 'rgba(88,28,135,0.55)' },
  mental_wellness: { label: 'Mental Wellness',       emoji: '🧘‍♀️', labelColor: '#4ade80', cardBg: 'rgba(6,78,59,0.45)' },
  growth_mindset:  { label: 'Growth Mindset',        emoji: '🧠', labelColor: '#c084fc', cardBg: 'rgba(88,28,135,0.55)' },
  real_life:       { label: 'Real Life Skills',      emoji: '🗺️', labelColor: '#c084fc', cardBg: 'rgba(88,28,135,0.55)' },
  road_rules:      { label: 'Real Life Road Rules',  emoji: '🚗', labelColor: '#c084fc', cardBg: 'rgba(88,28,135,0.55)' },
  beauty:          { label: 'Beauty & Glow Up',      emoji: '💅', labelColor: '#f472b6', cardBg: 'rgba(131,24,67,0.45)' },
  character:       { label: 'Character & Values',    emoji: '💡', labelColor: '#c084fc', cardBg: 'rgba(88,28,135,0.55)' },
  life_skills:     { label: 'Life Skills',            emoji: '🏛️', labelColor: '#c084fc', cardBg: 'rgba(88,28,135,0.55)' },
  healthy_eating:  { label: 'Healthy Eating',         emoji: '🥗', labelColor: '#4ade80', cardBg: 'rgba(6,78,59,0.45)' },
  time_mgmt:       { label: 'Time Management',        emoji: '⏰', labelColor: '#c084fc', cardBg: 'rgba(88,28,135,0.55)' },
  adhd:            { label: 'ADHD',                   emoji: '⚡', labelColor: '#fbbf24', cardBg: 'rgba(120,53,15,0.5)' },
  caring_for_pets: { label: 'Caring for Pets',        emoji: '🐾', labelColor: '#4ade80', cardBg: 'rgba(6,78,59,0.45)' },
  parenthood:      { label: 'Parenthood',             emoji: '👶', labelColor: '#f472b6', cardBg: 'rgba(131,24,67,0.45)' },
  good_parenting:  { label: 'Good Parenting',         emoji: '💝', labelColor: '#f472b6', cardBg: 'rgba(131,24,67,0.45)' },
};

const RESOURCES = [
  { id: 1,  cat: 'hygiene',          emoji: '🚿', title: 'Daily Hygiene Routine',
    desc: 'Your complete guide to looking and feeling fresh every single day.',
    tips: ['Shower or bathe daily, especially after exercise','Brush teeth twice a day and floss daily','Use deodorant or antiperspirant every morning','Wash your face morning and night','Change underwear and socks daily','Wash your hair regularly (every 2–3 days or as needed for your hair type)'],
    actions: ['Build a 10-minute morning routine','Keep hygiene products organized in one place','Create a nighttime routine that includes washing your face','Set phone reminders for flossing or skincare steps','Track your routine for one week to build the habit'] },

  { id: 2,  cat: 'hygiene',          emoji: '🌸', title: 'Period Hygiene & Care',
    desc: 'Everything you need to know about managing your period with confidence.',
    tips: ['Change pads every 4–6 hours, or sooner if needed','Never leave a tampon in for more than 8 hours','Always wash your hands before and after changing products','Use a heating pad or ibuprofen early for cramps','Track your cycle so you\'re always prepared'],
    actions: ['Build a period kit for your bag (pads, wipes, pain reliever, backup underwear)','Download a period tracking app','Talk to a trusted adult or doctor if you have unusual symptoms','Stock up on supplies at the beginning of each month','Create a self-care plan for your first day'] },

  { id: 3,  cat: 'skincare',         emoji: '✨', title: 'Skincare for Glowing Skin',
    desc: 'Simple skincare routines that actually work — no matter your skin type.',
    tips: ['Wash your face morning and night with a gentle cleanser','Always wear SPF in the morning — even on cloudy days','Moisturize while your skin is still slightly damp','Never sleep in makeup','Change your pillowcase weekly'],
    actions: ['Identify your skin type (oily, dry, combination, sensitive)','Build a basic 3-step routine: cleanse, moisturize, SPF','Shop drugstore heroes: CeraVe, Neutrogena, La Roche-Posay','Drink 8 glasses of water daily for hydrated skin','Track your skin for 4 weeks to see what works'] },

  { id: 4,  cat: 'skincare',         emoji: '💆‍♀️', title: 'Managing Acne & Breakouts',
    desc: 'Acne is normal. Here\'s how to manage it without damaging your skin.',
    tips: ['Never pop pimples — it causes scarring and spreads bacteria','Avoid touching your face throughout the day','Change your pillowcase 2x per week','Clean your phone screen daily','Don\'t over-wash — it strips skin and causes more oil'],
    actions: ['Try a salicylic acid cleanser for 4 weeks','Add niacinamide serum to reduce redness','Keep a skin diary to track triggers (food, stress, products)','See a dermatologist if OTC products don\'t work after 3 months','Build a consistent routine and stick to it'] },

  { id: 5,  cat: 'budgeting',        emoji: '💰', title: 'Budgeting 101',
    desc: 'Learn how to manage your money so your money doesn\'t manage you.',
    tips: ['Pay yourself first — save before you spend','Track every purchase for one week to see where money goes','Use the 50/30/20 rule: needs/wants/savings','Ask "need or want?" before every purchase','Small savings add up — $5/day is $1,825/year'],
    actions: ['Write down all your income sources this month','Track every purchase for 7 days (even small ones)','Set one specific savings goal with a deadline','Download a budgeting app (YNAB, Mint, or Greenlight)','Set up automatic transfers to savings on payday'] },

  { id: 6,  cat: 'budgeting',        emoji: '💼', title: 'Teen Side Hustles',
    desc: 'Real ways to make money right now — no degree required.',
    tips: ['Start with one hustle and master it before adding more','Tell your network — word of mouth is the best marketing','Deliver great work and ask for referrals','Track your income and save at least 20%','Every problem around you is a potential business opportunity'],
    actions: ['List 3 skills or services you could offer starting this week','Set a fair price by researching what others charge','Create a simple flyer or social media post','Tell 10 people in your network about your hustle','Open a separate savings account for business income'] },

  { id: 7,  cat: 'scholarships',     emoji: '🎓', title: 'Finding Scholarships',
    desc: 'Free money for college exists — you just have to find it and apply.',
    tips: ['Start searching during junior year of high school','Apply to small local scholarships — less competition!','Never use a generic essay — customize every application','Get 2+ people to proofread before submitting','Track all deadlines in a spreadsheet'],
    actions: ['Create profiles on Fastweb.com, Bold.org, and Going Merry','Visit your school counselor\'s office for local opportunities','Fill out the FAFSA as soon as it opens (October 1st senior year)','Draft a master essay you can customize for each application','Apply to at least 5 scholarships this month'] },

  { id: 8,  cat: 'college',          emoji: '🏫', title: 'College Prep Guide',
    desc: 'Everything you need to know to get into the college of your dreams.',
    tips: ['Start preparing in 9th grade — not senior year','Take challenging courses to show academic rigor','Your college essay is the most important part of your application','Build a balanced list: safety, match, and reach schools','Visit campuses virtually if you can\'t go in person'],
    actions: ['Research 5–10 colleges that fit your goals and budget','Request recommendation letters the summer before 12th grade','Start drafting your college essay during junior year','Make a timeline of all application deadlines','Fill out the FAFSA as soon as it opens'] },

  { id: 9,  cat: 'entrepreneurship', emoji: '🚀', title: 'Starting Your Own Business',
    desc: 'You don\'t need to wait until you\'re an adult to be an entrepreneur.',
    tips: ['Start small — test before you invest','Research your idea: is there real demand?','Open a separate account for business money','Create a simple Instagram or Etsy page to reach customers','The best time to start is before you feel ready'],
    actions: ['Write a one-page simple business plan (what, who, how much, how)','Research your competition and identify what makes you different','Tell 10 people about your business idea this week','Set up a free Canva account to create your branding','Apply to the Young Entrepreneurs Academy or SCORE mentoring'] },

  { id: 10, cat: 'interview',        emoji: '💼', title: 'Interview Prep & Job Skills',
    desc: 'How to walk into any interview — job, college, scholarship — and own the room.',
    tips: ['Research the company or program before every interview','Arrive 10–15 minutes early — never late','Prepare your "Tell me about yourself" answer in under 60 seconds','Send a thank-you email within 24 hours after the interview','Practice in front of a mirror or with a trusted friend'],
    actions: ['Write out your answers to the 5 most common interview questions','Plan your interview outfit (neat, clean, professional)','Practice your handshake and eye contact','Do a mock interview with a parent, teacher, or counselor','Follow up every interview with a handwritten or email thank-you'] },

  { id: 11, cat: 'safety',           emoji: '🛡️', title: 'Personal Safety',
    desc: 'Know your rights, trust your instincts, and always protect yourself.',
    tips: ['Trust your gut — if something feels wrong, it probably is','Stay aware in public — headphones in both ears reduces awareness','Share your location with a trusted person when going out','Walk confidently — eyes up, shoulders back','Know the red flags of a controlling or dangerous relationship'],
    actions: ['Save 911 and 5 trusted contacts on your phone\'s speed dial','Download the Companion app for walking home safely','Learn the signs of an unhealthy relationship','Share your location with a trusted adult when you go out at night','Know the National DV Hotline: 1-800-799-7233'] },

  { id: 12, cat: 'safety',           emoji: '🔒', title: 'Online Safety & Digital Privacy: Protect Yourself Online',
    desc: 'The internet is powerful — but it can also be dangerous.',
    tips: ['Never share your home address, school name, or daily schedule online','Anything you post can live forever — even after you delete it','Reverse image search profile photos to check for catfishing','Enable 2-factor authentication on all accounts','Regularly audit who follows you on private accounts'],
    actions: ['Audit your social media privacy settings this week','Remove your home address or school from all public profiles','Report any suspicious accounts or messages immediately','Screenshot evidence before deleting anything harmful','Visit cybertipline.org to report exploitation'] },

  { id: 13, cat: 'studying',         emoji: '📖', title: 'Study Skills & Academic Success',
    desc: 'Master the art of studying smarter, not harder.',
    tips: ['Use active recall: close the book and quiz yourself','Study a little every day instead of cramming the night before','Use the Pomodoro method: 25 min focus, 5 min break','Teach what you learned to someone else to lock it in','Get 8+ hours of sleep the night before any test'],
    actions: ['Create a weekly study schedule and stick to it for 2 weeks','Set up a clean, distraction-free study space','Put your phone in another room during study sessions','Practice active recall on your last 3 topics today','Review notes within 24 hours of every class'] },

  { id: 14, cat: 'studying',         emoji: '✏️', title: 'Note-Taking Strategies That Actually Work',
    desc: 'Transform your notes from messy scribbles into powerful study tools.',
    tips: ['Write notes in your own words — never copy word for word','Use abbreviations and symbols to write faster','Color code by topic for easier review','Leave white space — your brain needs breathing room','Review and add to notes within 24 hours of class'],
    actions: ['Try the Cornell Method for your next class','Experiment with mind maps for a visual subject','Create a color coding system for your notes this week','Review last week\'s notes for 10 minutes each morning','Compare notes with a classmate to fill in gaps'] },

  { id: 15, cat: 'studying',         emoji: '🎯', title: 'Test Prep & Exam Strategy',
    desc: 'Walk into every exam confident, prepared, and ready to show what you know.',
    tips: ['Start reviewing 2 weeks before any major test','Do a light review only the night before — no cramming','Get 8–9 hours of sleep before your exam — non-negotiable','Eat a protein-rich breakfast on test day','Use 4-7-8 breathing to manage test anxiety'],
    actions: ['Make a study schedule starting 2 weeks before your next test','Complete at least one full practice test before the real thing','Create flashcards for all key vocabulary and formulas','Identify your weakest topics and spend extra time on them','Prepare your bag, outfit, and breakfast the night before'] },

  { id: 16, cat: 'studying',         emoji: '🏆', title: 'College Readiness & SAT/ACT Prep',
    desc: 'Start preparing early for college admissions and standardized tests.',
    tips: ['Start SAT/ACT prep at least 3–6 months in advance','Many schools are now test-optional — research each school\'s policy','Take a full-length practice test first to identify weak areas','Consistency beats cramming — 30 minutes a day beats 5 hours on Sunday','Khan Academy offers free official SAT prep'],
    actions: ['Take a free diagnostic SAT or ACT test this week','Create a Khan Academy account and link it to College Board','Research the test policies for your top 5 colleges','Register for your first SAT or ACT by junior year','Practice 2–3 math and reading questions every single day'] },

  { id: 17, cat: 'black_hair',       emoji: '👑', title: 'Natural Hair Care Basics',
    desc: 'Love and care for your natural hair with the knowledge and tools to keep it healthy.',
    tips: ['Moisture is everything — black hair needs consistent hydration','Use the LOC method: Liquid → Oil → Cream for maximum moisture retention','Deep condition every wash day with heat for 15–30 minutes','Always detangle gently from ends to roots','Sleep with a satin bonnet or pillowcase every night'],
    actions: ['Start the LOC method on your next wash day','Get a deep conditioner and use it weekly for one month','Buy a satin bonnet or pillowcase this week','Build a wash day routine and stick to it for 30 days','Research which products work best for your curl pattern'] },

  { id: 18, cat: 'black_hair',       emoji: '💧', title: 'Understanding Hair Porosity',
    desc: 'Knowing your hair\'s porosity is the key to choosing products that actually work.',
    tips: ['Test your porosity: drop a clean hair strand in a glass of water','Low porosity hair needs lightweight products and heat to absorb moisture','High porosity hair needs heavier creams, butters, and protein treatments','Normal porosity hair works well with most products','Once you know your porosity, stop wasting money on products that don\'t work'],
    actions: ['Do the water glass porosity test today','Research your porosity type and recommended products','Audit your current products to see if they match your porosity needs','Try a protein treatment if you have high porosity hair','Share your porosity type with a stylist at your next appointment'] },

  { id: 19, cat: 'black_hair',       emoji: '✨', title: 'Protective Styles Guide',
    desc: 'Protective styles are a powerful tool for length retention and low manipulation.',
    tips: ['Never braid too tight — pain means damage and traction alopecia','Moisturize your scalp weekly even while in a protective style','Take down protective styles before 8 weeks to prevent matting','Deep condition your hair immediately after taking a style down','Protect your edges — never glue near your hairline'],
    actions: ['Book your next protective style with a trusted natural hair stylist','Buy a satin bonnet to wear every night during your style','Set a calendar reminder to take your style down by week 8','Deep condition the week after your style comes out','Research which protective style is best for your hair goals'] },

  { id: 20, cat: 'black_hair',       emoji: '🌱', title: 'Growing Long, Healthy Natural Hair',
    desc: 'Healthy hair grows from the inside out — learn the habits that lead to length retention.',
    tips: ['Retention is the key — hair grows, but breakage keeps it short','Handle your hair with minimal manipulation','Eat foods rich in protein, iron, and biotin for hair growth','Trim split ends regularly — they cause more breakage if left','Protective styles help retain the length you\'ve already grown'],
    actions: ['Start taking a biotin or hair growth supplement (consult a doctor first)','Commit to one protective style for the next 6–8 weeks','Trim split ends at your next salon visit','Drink at least 8 glasses of water daily for internal hydration','Take monthly length check photos to track your progress'] },

  { id: 21, cat: 'mental_wellness',  emoji: '🙋‍♀️', title: 'People Pleasing: Are You Doing Too Much?',
    desc: 'Do you say yes when you mean no? That\'s people pleasing — and it\'s stealing your peace.',
    tips: ['Pause before responding: "let me think about that and get back to you"','Feeling guilty for saying no doesn\'t mean you did something wrong','You are not responsible for managing other people\'s emotions','Real friends respect your boundaries','Saying no to what doesn\'t serve you is saying yes to yourself'],
    actions: ['Identify one situation this week where you said yes but meant no','Practice saying "I can\'t make it" without over-explaining','Journal about where your people pleasing comes from','Set one boundary this week and stick to it','Talk to a counselor if people pleasing is affecting your mental health'] },

  { id: 22, cat: 'mental_wellness',  emoji: '🧘‍♀️', title: 'Mental Wellness & Self-Care',
    desc: 'Your mental health matters just as much as your physical health.',
    tips: ['Sleep 8–9 hours — this is the #1 mental health tool','Move your body daily — even a 20-minute walk helps','Limit social media to 2 hours a day maximum','Journal to get thoughts out of your head and onto paper','Do one thing you genuinely enjoy every single day'],
    actions: ['Set a consistent bedtime and wake-up time this week','Take a 20-minute walk outside today','Set a daily screen time limit on your phone','Start a 5-minute journaling habit every morning or night','Text 988 or reach out to a counselor if you\'re struggling'] },

  { id: 23, cat: 'mental_wellness',  emoji: '🌿', title: 'Staying Present in the Moment',
    desc: 'How to stop living in your phone, your worries, or your past — and actually experience your life.',
    tips: ['The most important moment of your life is always right now','Use the 5-4-3-2-1 technique to ground yourself when anxious','Put your phone down during meals and conversations','No phone for the first 30 minutes after waking up','Mindfulness just means paying attention on purpose'],
    actions: ['Practice the 5-4-3-2-1 grounding technique once today','Have one phone-free meal today and tomorrow','Set a "no phone in bed" rule starting tonight','Take a 5-minute mindful walk outside without any devices','Notice 3 beautiful things around you right now'] },

  { id: 24, cat: 'mental_wellness',  emoji: '🔓', title: 'Breaking Free from Victim Thinking',
    desc: 'How to recognize negative thought patterns that keep you stuck.',
    tips: ['Victim thinking: "this always happens to me." Growth: "what can I do about this?"','You can acknowledge pain AND take responsibility for your response','Accountability is power — blaming others keeps you stuck','Your story does not have to define your future','Healing is possible — but it requires honesty with yourself'],
    actions: ['Journal about one situation where you felt powerless — find one thing you could have controlled','Replace one "I can\'t" with "I\'m choosing not to" this week','Apologize for one thing this week without making excuses','Read "The Obstacle Is the Way" by Ryan Holiday','Talk to a counselor if you feel stuck in negative patterns'] },

  { id: 25, cat: 'growth_mindset',   emoji: '🧠', title: 'Growth Mindset vs Fixed Mindset',
    desc: 'Your mindset is the story you tell yourself about who you are and what you\'re capable of.',
    tips: ['Add the word "yet" to your fixed mindset thoughts','Every struggle is evidence that you\'re growing','What you believe about yourself shapes what\'s possible for you','Failure is information — not a verdict on your worth','The most successful people failed the most times'],
    actions: ['Write down 3 fixed mindset thoughts you had this week and rewrite them with growth mindset','Notice when you say "I\'m just not good at this" and add "yet"','Read "Mindset" by Carol Dweck','Seek out a challenge you\'ve been avoiding this week','Celebrate effort, not just results — praise yourself for trying'] },

  { id: 26, cat: 'growth_mindset',   emoji: '🔄', title: 'Reframe Your Thoughts: Fixed → Growth',
    desc: 'Your inner voice is powerful. Learn to catch fixed mindset thoughts and flip them.',
    tips: ['Notice the thought → acknowledge it → redirect it','Your inner critic is telling a story, not the truth','"I failed" is not the same as "I am a failure"','Challenge every absolute ("always", "never", "can\'t") you tell yourself','Your brain literally changes when you think differently'],
    actions: ['Keep a "thought reframe" journal for one week','Write down one fixed thought per day and rewrite it as a growth thought','Share your reframes with a friend or in a journal','Practice positive self-talk out loud in the mirror each morning','Teach the reframe concept to someone you know'] },

  { id: 27, cat: 'growth_mindset',   emoji: '📚', title: 'Growth Mindset at School',
    desc: 'School is literally designed to challenge you. Here\'s how to use a growth mindset to win.',
    tips: ['Every hard class is a growth opportunity — not a threat','A bad grade is feedback — not a final verdict','Ask for help early — waiting makes it harder','Teachers respect students who show effort even when struggling','Your GPA does not define your intelligence or your future'],
    actions: ['Email one teacher this week and ask for extra help or feedback','Reframe your least favorite subject as your biggest growth opportunity','Write down what you LEARNED from your last bad grade','Set a specific academic improvement goal for next semester','Find a study partner or tutoring resource for your hardest class'] },

  { id: 28, cat: 'real_life',        emoji: '🚗', title: 'Buying Your First Car',
    desc: 'Everything you need to know about buying a car — don\'t let a dealership play you.',
    tips: ['Car payment should be no more than 15% of your monthly income','Always get pre-approved for financing BEFORE visiting a dealership','Research fair market value on Kelley Blue Book (KBB) first','Never sign the same day — always sleep on it','Read every single line before you sign anything'],
    actions: ['Look up the fair market value on KBB for 3 cars you\'re considering','Get pre-approved at your bank or credit union before shopping','Run a Carfax or AutoCheck report on any used car you\'re considering','Get an independent mechanic inspection before buying any used car','List all monthly car costs: payment + insurance + gas + maintenance'] },

  { id: 29, cat: 'real_life',        emoji: '📋', title: 'Car Registration & Title',
    desc: 'The paperwork side of owning a car — registration, titles, and what to do when things change.',
    tips: ['Your car title proves ownership — keep it in a safe place (not in the car)','Registration must be renewed every year — keep the sticker on your plate','If you move, update your registration address within 30 days in most states','You need the title to sell your car, get a loan, or transfer ownership','Driving with expired tags can result in a ticket or your car being impounded'],
    actions: ['Locate your car\'s title and store it safely at home','Set a calendar reminder 30 days before your registration expires','Research your state\'s requirements for registration renewal','If you buy a used car, transfer the title within the required timeframe','Keep a copy of your registration in your glove box at all times'] },

  { id: 30, cat: 'real_life',        emoji: '🏡', title: 'Buying a Home',
    desc: 'Homeownership is one of the biggest wealth-building tools available.',
    tips: ['Renting builds the landlord\'s wealth; owning builds yours','Building credit NOW affects your ability to buy a home later','Start saving for a down payment as early as possible','FHA loans allow as little as 3.5% down for first-time buyers','Your monthly mortgage payment should be under 28% of your income'],
    actions: ['Check your credit score today using Credit Karma (free)','Open a high-yield savings account specifically for a future down payment','Learn the difference between pre-qualification and pre-approval','Research first-time homebuyer programs in your city or state','Calculate what a monthly mortgage payment would look like for your dream home'] },

  { id: 31, cat: 'real_life',        emoji: '🪪', title: 'Getting Your Driver\'s License',
    desc: 'Step-by-step guide to getting your permit, passing your test, and hitting the road.',
    tips: ['Study the driver\'s handbook — test questions come directly from it','Log all required practice hours with a licensed adult driver','Practice in different conditions: rain, night, highways, parking','Know the rules for your graduated license if you\'re under 18','Distracted driving is the #1 cause of teen driving accidents'],
    actions: ['Download your state\'s driver\'s handbook and study it this week','Schedule your written permit test at your local DMV','Log all required practice hours with a licensed adult','Practice parallel parking and three-point turns until confident','Schedule your road test at least 2 weeks before you need your license'] },

  { id: 32, cat: 'real_life',        emoji: '🛡️', title: 'Understanding Insurance',
    desc: 'Insurance protects everything you\'ve worked for. Here\'s a plain-English breakdown.',
    tips: ['Car insurance is the law — never drive without it','Health insurance prevents one emergency from bankrupting you','Renters insurance is cheap and protects your belongings','Life insurance is most affordable when you\'re young and healthy','A deductible is what you pay before insurance kicks in — know yours'],
    actions: ['Learn what types of insurance you currently have (through parents)','Research the cost of renters insurance for when you move out','Understand your deductible and coverage limit for car insurance','Compare 3 car insurance quotes when you\'re ready to buy a car','Talk to a trusted adult about what insurance you\'ll need as an adult'] },

  { id: 33, cat: 'real_life',        emoji: '🚦', title: 'Driver & Passenger Safety',
    desc: 'How to stay safe in a car — as the driver AND as a passenger.',
    tips: ['You always have the right to ask a driver to slow down or pull over','Never get in a car with a driver who is impaired — period','Wear your seatbelt every single time, no exceptions','No phone while driving — pull over if you must use it','A car full of teens dramatically increases crash risk'],
    actions: ['Save the numbers of 3 people you can always call for a safe ride','Practice saying: "Can you slow down? I\'m not comfortable."','Research your state\'s graduated driver\'s license rules for passengers','Install a driving safety app if you\'re a new driver','Create a family safety agreement about safe driving expectations'] },

  { id: 34, cat: 'real_life',        emoji: '🚪', title: 'How to Leave an Uncomfortable Situation',
    desc: 'Real scripts, safety strategies, and exit plans for getting yourself out.',
    tips: ['You never need a reason to leave a situation that doesn\'t feel right','The "fake call" trick: set a timer so your phone goes off as an excuse to leave','A real friend will never be upset that you left to keep yourself safe','Trust your gut — physical discomfort is a real signal','Getting out is never overreacting'],
    actions: ['Memorize 2–3 exit scripts you can use comfortably','Download the Companion app for safe solo walks','Tell a trusted friend your plans and share your location before going out','Practice saying "no" to small things so it\'s easier for bigger things','Create a safety plan with a trusted friend or family member'] },

  { id: 35, cat: 'real_life',        emoji: '✋', title: 'Saying No to Drugs & Peer Pressure',
    desc: 'Real talk about drugs, peer pressure, and how to protect your future.',
    tips: ['"Everyone\'s doing it" is almost never actually true','Your "no" does not require explanation or justification','Real friends respect your boundaries — every single time','Drugs can change your brain chemistry permanently at your age','One decision made under pressure can follow you for years'],
    actions: ['Practice your "no" scripts out loud until they feel natural','Identify 2–3 trusted friends who share your values','Research the real effects of common drugs teens encounter','Talk to a school counselor if you\'re feeling pressured','Create a code word with a parent so they can "rescue" you without awkwardness'] },

  { id: 36, cat: 'road_rules',       emoji: '🚗', title: 'Tag Renewal & Registration Basics',
    desc: 'Your car registration isn\'t just a sticker — it\'s a legal requirement.',
    tips: ['Driving with expired tags can result in a ticket or your car being impounded','Registration must match the state you LIVE in, not where you bought the car','You can often renew online or at a kiosk — no appointment needed','Keep proof of insurance and registration in your glove box always','Some states offer reduced fees for low-income drivers'],
    actions: ['Find the renewal date on your current registration sticker','Set a phone reminder 45 days before your tags expire','Locate your nearest DMV and check their hours','Understand what documents you need for renewal in your state','Store digital copies of your registration and insurance on your phone'] },

  { id: 37, cat: 'road_rules',       emoji: '🛡️', title: 'Car Insurance 101',
    desc: 'Car insurance isn\'t optional — it\'s the law.',
    tips: ['Liability insurance is required in almost every state — know your minimums','Your deductible is what you pay before insurance covers the rest','Good grades can earn you a discount — ask your insurer','Staying on your parents\' policy is usually the cheapest option for teens','Always carry proof of insurance in the car and on your phone'],
    actions: ['Learn what coverage you currently have (through parents)','Ask about the good student discount at your family\'s insurance provider','Get 3 quotes when it\'s time to get your own policy','Understand what happens if you get in an accident with no insurance','Set a reminder to review your coverage every year'] },

  { id: 38, cat: 'road_rules',       emoji: '📋', title: 'Traffic Tickets & Points on Your License',
    desc: 'Getting a ticket feels like a one-time thing — but the effects can follow you for years.',
    tips: ['Points on your license can raise your insurance rates significantly','You can often contest a ticket in court — it\'s worth trying','Traffic school can remove points from your record in many states','Multiple tickets can lead to license suspension','Speeding tickets go on your record and follow you — slow down'],
    actions: ['If you get a ticket, research your options before just paying it','Look into traffic school to remove points from your record','Request a hearing if you believe the ticket was issued in error','Calculate how a ticket would affect your insurance premium','Keep a clean driving record by being intentional every time you drive'] },

  { id: 39, cat: 'road_rules',       emoji: '🚨', title: 'How to Handle Getting Pulled Over',
    desc: 'Getting pulled over is stressful — but knowing exactly what to do keeps you safe.',
    tips: ['Turn on hazard lights, slow down, and pull to the right','Keep hands visible on the steering wheel at all times','Ask before reaching for anything: "May I reach for my license?"','You have the right to remain silent beyond providing required documents','Address any rights violations in court — not on the roadside'],
    actions: ['Practice saying: "My license is in my wallet. May I reach for it?"','Know where your registration and insurance card are at all times','Look up your state\'s specific laws about traffic stops','Program a trusted adult\'s number to call right after a stop if needed','Know the non-emergency police number in your city'] },

  { id: 40, cat: 'road_rules',       emoji: '⚠️', title: 'The Real Cost of a DUI',
    desc: 'A DUI isn\'t just a ticket — it\'s a life-altering event.',
    tips: ['The legal BAC limit is 0.08% for adults, ZERO tolerance for under 21 in most states','A DUI can cost $10,000+ when all fees, lawyers, and consequences are added up','A DUI stays on your record and affects jobs, housing, and scholarships','If you\'ve been drinking, use a rideshare or call a parent — no judgment','Never get in a car with a drunk driver — your life is worth more'],
    actions: ['Save Uber and Lyft on your phone for every night out','Create a no-questions-asked agreement with a parent for safe rides','Research your state\'s Zero Tolerance law for underage drinking and driving','Share this information with friends before a party or event','Make a pact with your friend group: designated driver or rideshare, always'] },

  { id: 41, cat: 'road_rules',       emoji: '🚫', title: 'License Suspension & Reinstatement',
    desc: 'A suspended license doesn\'t mean your driving problems are over — it means they\'re beginning.',
    tips: ['Driving on a suspended license is a serious crime — don\'t do it','Suspension can happen for unpaid tickets, too many points, or a DUI','Reinstatement requires paying fines, completing a course, and waiting','SR-22 insurance (high-risk) is often required after suspension','Prevention is everything — one decision can cost years of driving freedom'],
    actions: ['Know the point system for your state\'s driver\'s license','Never ignore a traffic ticket — unpaid tickets lead to suspension','If suspended, find out the exact steps to reinstate your license','Look into hardship licenses if you need to drive for work or school','Commit to a clean record: one careful choice at a time'] },

  { id: 42, cat: 'road_rules',       emoji: '💸', title: 'Paying Tickets & Fines the Smart Way',
    desc: 'Getting a ticket is stressful — but knowing your options can save you money.',
    tips: ['You often have 3 options: pay, contest, or attend traffic school','Traffic school can keep the ticket off your record in many states','Contesting a ticket is often worth it — officers sometimes don\'t show up','Never ignore a ticket — ignoring it makes everything worse','Some courts offer payment plans if you can\'t pay all at once'],
    actions: ['Read your ticket carefully — it lists your options and deadline','Research if your state allows traffic school to remove the violation','Look up the contest process for your court online','Ask about a payment plan if you can\'t pay the fine in full','Set a phone reminder for the ticket due date so you never miss it'] },

  { id: 43, cat: 'road_rules',       emoji: '📂', title: 'Important Adult Documents: What to Keep & Where',
    desc: 'Adulting means knowing where your important documents are.',
    tips: ['Never keep your Social Security card in your wallet — only bring it when required','Keep originals in a fireproof safe or secure location at home','Have digital backup copies of every critical document','Birth certificate, SS card, and passport are the hardest to replace','Start collecting and organizing your documents now — before you need them'],
    actions: ['Locate your birth certificate, Social Security card, and any ID documents','Buy a small fireproof document safe or folder','Scan and save digital copies to a secure cloud folder','Know where your vaccination records and school transcripts are','Make a checklist of every adult document you\'ll need in the next 5 years'] },

  { id: 44, cat: 'road_rules',       emoji: '💡', title: 'What I Wish I Knew: Real Life Lessons',
    desc: 'Nobody teaches you this stuff in school. These are the lessons people learn the hard way.',
    tips: ['Your credit score follows you everywhere — protect it from day one','No one is coming to save you — build your own financial foundation','The friends you keep will shape who you become','Compound interest is either your best friend or your worst enemy','Your reputation is built slowly and destroyed quickly'],
    actions: ['Check your credit score today (Credit Karma is free)','Write down 3 life lessons you\'ve already learned the hard way','Make a list of the habits you want to build in the next 12 months','Audit the 5 people you spend the most time with — are they helping you grow?','Start one habit today that your future self will thank you for'] },

  { id: 45, cat: 'safety',           emoji: '🚗', title: 'Car & Passenger Safety: Protecting Yourself in the Car',
    desc: 'Being in a car with a reckless driver is dangerous — and you have the right to speak up.',
    tips: ['You always have the right to ask to get out of a car','Wearing a seatbelt reduces your chance of dying in a crash by 45%','Distracted driving kills more teens than drunk driving','If the driver is impaired, call 911 or a trusted adult for a safe ride','No destination is worth risking your life'],
    actions: ['Practice saying: "Please slow down — I\'m not comfortable."','Save 3 trusted numbers on speed dial for emergencies','Never get in a car with a driver who has been drinking','Research your state\'s graduated license rules about passengers under 18','Create a family safety code word you can text to get picked up'] },

  { id: 46, cat: 'beauty',           emoji: '💅', title: 'Nails on a Budget',
    desc: 'Keep your nails looking clean, polished, and cute without spending a lot.',
    tips: ['Always apply a base coat before color — it protects your nails','Reapply top coat every 2–3 days to make polish last longer','Apply cuticle oil daily for healthy, soft cuticles','File nails in one direction only — back-and-forth causes breakage','Clean, short nails look more polished than chipped long ones'],
    actions: ['Buy the essential tools: file, buffer, base coat, top coat, and cuticle oil','Try a simple at-home manicure this weekend','Research Sally Hansen, Essie, or Wet n Wild for affordable polishes','Set a weekly nail care routine (5–10 minutes)','Apply cuticle oil every night before bed for one week'] },

  { id: 47, cat: 'beauty',           emoji: '✨', title: 'Glam Nail Looks',
    desc: 'Level up your nail game with salon-worthy looks you can do at home or on a budget.',
    tips: ['Nail tape and stickers make geometric designs accessible for beginners','Gel polish kits can give you salon-quality results at home','Accent nails on one finger make a simple look intentional','Chrome powder can be applied on top of regular gel for a chrome look','Nail art doesn\'t have to be complex — a single stripe goes a long way'],
    actions: ['Watch 3 beginner nail art tutorials on YouTube or TikTok','Buy a nail art brush set (under $10 on Amazon)','Try a simple accent nail design on your next manicure','Invest in a gel nail lamp kit if you want long-lasting home nails','Follow nail artists on Instagram for daily inspiration'] },

  { id: 48, cat: 'beauty',           emoji: '💇‍♀️', title: 'Hair Care on a Budget',
    desc: 'Keep your hair healthy, clean, and styled without breaking the bank.',
    tips: ['Washing your hair too often strips natural oils','Silk or satin bonnets prevent frizz and breakage overnight','Deep conditioning once a week transforms hair health over time','Heat protectant is non-negotiable before ANY heat styling','Trimming split ends regularly prevents more breakage'],
    actions: ['Identify your hair type and build a routine around it','Buy a satin bonnet this week and use it every single night','Find a drugstore shampoo and conditioner for your hair type','Schedule a trim every 8–12 weeks to maintain healthy ends','Do a DIY deep conditioning treatment with products you already have'] },

  { id: 49, cat: 'beauty',           emoji: '👑', title: 'Glam Hair Looks',
    desc: 'Elevated hairstyles that look expensive and polished — from sleek to voluminous.',
    tips: ['A sleek bun with edge control looks sophisticated and takes 5 minutes','Blowouts on natural hair can be achieved at home with the right tools','Flexi rods and perm rods create beautiful heatless curls overnight','Adding accessories (clips, ribbons, headbands) elevates any hairstyle instantly','YouTube tutorials for your specific hair type are the best free resource'],
    actions: ['Watch 3 YouTube tutorials for your hair type and length this week','Try one new hairstyle this week that\'s outside your comfort zone','Invest in one quality styling tool: a diffuser, flat iron, or curling wand','Stock up on hair accessories that complement your style','Practice one updo or protective style until you can do it in 10 minutes'] },

  { id: 50, cat: 'beauty',           emoji: '💄', title: 'Everyday Makeup on a Budget',
    desc: 'Look polished and put-together every day without spending a lot.',
    tips: ['The 5 essentials: tinted moisturizer, concealer, mascara, tinted lip balm, and brow gel','Always remove your makeup completely at night — no exceptions','Blend everything — harsh lines are the #1 beginner mistake','Match foundation to your jaw, not your wrist or hand','Less is more — build up gradually rather than applying too much at once'],
    actions: ['Start with just 2–3 products and master them before adding more','Research e.l.f., Wet n Wild, or NYX for quality drugstore picks','Watch a beginner\'s makeup tutorial for your skin tone','Buy a good makeup sponge or brush for seamless blending','Clean your makeup brushes once a week to prevent breakouts'] },

  { id: 51, cat: 'beauty',           emoji: '🌟', title: 'Glam Makeup Looks',
    desc: 'Turn up the glam for special occasions, events, or just because you feel like it.',
    tips: ['A glam look starts with skin prep: primer makes everything last longer','Eyeshadow primer prevents creasing all day and night','Cut crease technique with concealer makes any eyeshadow color pop','Setting spray locks makeup in place for up to 16 hours','Glam makeup takes practice — tutorials are your best teacher'],
    actions: ['Watch tutorials for your eye shape and skin tone on YouTube','Invest in one good highlighter and mascara for elevated everyday looks','Practice a glam smoky eye before the event — not the night of','Research drugstore dupes for high-end products you love','Build a "special occasion" makeup kit separate from your daily products'] },

  { id: 52, cat: 'beauty',           emoji: '💎', title: 'Full Glow Up on a Budget',
    desc: 'Look and feel your absolute best without spending a lot — a complete guide to affordable beauty.',
    tips: ['A glow up is 80% lifestyle: sleep, water, exercise, and confidence','You don\'t need expensive products to look elevated and put-together','Grooming basics (clean nails, fresh hair, pressed clothes) go further than luxury brands','Confidence is the most attractive thing you can wear — it costs nothing','A few quality basics beats 20 mediocre products'],
    actions: ['Identify the 5 things that would make you feel most confident in your appearance','Shop drugstore and dupes before buying expensive products','Build a morning and evening routine that makes you feel good','Declutter your beauty products and keep only what you actually use','Set a realistic monthly beauty budget and stick to it'] },

  { id: 53, cat: 'character',        emoji: '💡', title: 'The Power of Honesty',
    desc: 'Why being truthful — with yourself and others — is one of the most powerful things you can do.',
    tips: ['Self-honesty is harder than honesty with others — and more important','Honest people build trust that takes years to build but moments to destroy','Honesty delivered with kindness is not the same as harshness','Admitting when you\'re wrong shows strength, not weakness','The truth always surfaces eventually — choose the short-term discomfort'],
    actions: ['Have one honest conversation you\'ve been avoiding this week','Journal about one area where you haven\'t been fully honest with yourself','Practice giving a gentle but honest opinion to a friend who asks','Own one mistake this week fully — no excuses, no deflecting','Notice how you feel after an honest moment versus a dishonest one'] },

  { id: 54, cat: 'mental_wellness',  emoji: '🌿', title: 'Breaking Free from Victim Thinking',
    desc: 'How to recognize negative thought patterns that keep you stuck.',
    tips: ['Victim thinking keeps you stuck; ownership moves you forward','Acknowledging pain and taking responsibility are not opposites','Accountability is freedom — blame keeps you powerless','Your past does not determine your future unless you let it','Healing requires honesty with yourself about your patterns'],
    actions: ['Journal: "Where in my life am I giving my power away?"','Replace "why does this always happen to me?" with "what can I do about this?"','Identify one pattern in your life you want to change — then take one action','Talk to a counselor if you feel stuck in helplessness','Read "The Courage to Be Disliked" or "The Obstacle Is the Way"'] },

  { id: 55, cat: 'life_skills',      emoji: '🏛️', title: 'Sororities & Greek Life: What You Need to Know',
    desc: 'Everything about joining a sorority — the culture, the sisterhood, and how to prepare.',
    tips: ['Maintain a strong GPA — most chapters require 2.5–3.0+','Get involved in community service before rush','Learn each organization\'s values and history before committing','Real sisterhood is built on mutual respect — not hazing','Dues can range from hundreds to thousands per semester — plan financially'],
    actions: ['Research the Divine Nine NPHC sororities and NPC sororities','Attend a college\'s Greek Week or info sessions virtually','Build your GPA and service record before rushing','Talk to current members to get an honest perspective','Understand all financial commitments before pledging'] },

  { id: 56, cat: 'life_skills',      emoji: '🚗', title: 'Car Maintenance Every Girl Should Know',
    desc: 'You don\'t need a mechanic for everything. Learn the basics that keep you safe.',
    tips: ['Check your oil level monthly — don\'t wait for the warning light','Correct tire pressure is on the door jamb sticker — not on the tire itself','An oil change every 5,000–10,000 miles is non-negotiable','If your check engine light comes on, get it diagnosed soon','Keep an emergency kit in your trunk: jumper cables, flashlight, blanket'],
    actions: ['Check your oil level this week using the dipstick','Check your tire pressure this week (use a gauge, check when cold)','Schedule an oil change if you\'re overdue','Build a car emergency kit for your trunk','Download your car\'s owner manual app or find it in the glove box'] },

  { id: 57, cat: 'life_skills',      emoji: '💰', title: 'Understanding Taxes: What Nobody Taught You',
    desc: 'Taxes are not optional and not as scary as they seem.',
    tips: ['If you earn income, you are required to file taxes','The US uses a progressive tax system — higher income = higher bracket','A tax refund means you overpaid during the year — not free money','W-2 forms come from employers; 1099 forms come from freelance work','Free tax filing is available through IRS Free File if you earn under $73,000'],
    actions: ['Learn the difference between gross pay and net pay on a pay stub','Look up the current federal tax brackets for your income range','Set up an account on IRS.gov to understand your tax history','File your first taxes using IRS Free File or FreeTaxUSA','Set aside 25–30% of any freelance income for taxes from day one'] },

  { id: 58, cat: 'life_skills',      emoji: '📊', title: 'Interest Rates: Cars, Homes & Credit Cards',
    desc: 'Interest is either working for you or against you — there is no neutral.',
    tips: ['A higher credit score = lower interest rate = thousands saved over a lifetime','Credit card interest (20%+) is the most expensive debt you can carry','Compound interest on savings GROWS your money over time','Pay more than the minimum on credit cards — always','A 1% difference in mortgage interest on a 30-year loan can cost you $30,000+'],
    actions: ['Calculate how much interest you\'d pay on a $20,000 car loan at 5% vs. 12%','Check your credit score today (Credit Karma is free)','Learn what APR means on any credit card offer you see','Use a compound interest calculator to see what $100/month becomes over 10 years','Commit to paying your credit card balance in full every month'] },

  { id: 59, cat: 'character',        emoji: '✌️', title: 'Conflict Resolution & Fighting',
    desc: 'Real talk on how to handle beef, drama, and conflict with integrity.',
    tips: ['Most conflicts are about unmet needs, not the surface issue','Address conflict directly with the person — not through social media or others','Use "I feel" statements instead of "you always"','Taking a breath before responding prevents 90% of escalation','You don\'t have to win every argument — you have to choose your peace'],
    actions: ['Identify one unresolved conflict in your life and plan a calm conversation','Practice "I feel [emotion] when [situation]" statements','Next time you\'re angry, wait 24 hours before responding','Learn the difference between assertiveness and aggression','Decide: is this worth your energy? Not every battle deserves your attention'] },

  { id: 60, cat: 'character',        emoji: '🔒', title: 'Breaking Generational Curses',
    desc: 'Understanding the patterns, trauma, and behaviors passed down — and how to stop them.',
    tips: ['You can\'t fix what you don\'t acknowledge — awareness comes first','Breaking a generational curse means choosing differently than what was modeled for you','Therapy is one of the most powerful tools for breaking inherited patterns','You are not responsible for what happened to you, but you are responsible for your healing','The bravest thing you can do for your future is heal now'],
    actions: ['Journal about patterns in your family you want to break','Research therapy options available to you (school counselor, BetterHelp, local resources)','Read "It Didn\'t Start With You" by Mark Wolynn','Have an honest conversation with a trusted mentor about your family patterns','Commit to one new habit that represents who you\'re becoming'] },

  { id: 61, cat: 'character',        emoji: '💎', title: 'Owning Your Accountability',
    desc: 'What it really means to take responsibility for your actions, choices, and growth.',
    tips: ['Accountability is not self-punishment — it\'s self-honesty','Making excuses keeps you stuck; ownership moves you forward','Apologizing without changing behavior is just manipulation','You can be a good person who made a bad choice — own it and grow','The people who grow the fastest hold themselves accountable honestly'],
    actions: ['Identify one situation this week where you deflected blame — own your part','Practice a full apology: what you did, why it was wrong, what you\'ll do differently','Stop using "but" after an apology — it cancels the apology','Journal: "What would I do differently if I took full responsibility for this?"','Find an accountability partner who will be honest with you'] },

  { id: 62, cat: 'safety',           emoji: '🛡️', title: 'Sexual Abuse: Know Your Rights & How to Heal',
    desc: 'What sexual abuse is, how to recognize it, and what to do if it happens to you.',
    tips: ['Sexual abuse is NEVER your fault — not your clothes, not your behavior','You have the right to say no to any unwanted touch — always','Grooming often starts with gifts, special treatment, and secret-keeping','Trauma responses are normal — freezing does not mean consent','Healing is possible — with the right support, survivors thrive'],
    actions: ['Know the RAINN hotline: 1-800-656-HOPE (4673)','Tell a trusted adult if something has happened or is happening to you','Know that you will be believed — reach out for help','Research trauma-informed therapists in your area if you need support','Learn the signs of grooming behavior to protect yourself and your friends'] },

  { id: 63, cat: 'life_skills',      emoji: '🏠', title: 'Keeping Your Space Clean: Home & Car',
    desc: 'A clean space = a clear mind. Learn how to maintain your environment.',
    tips: ['Clean as you go — 2-minute rule: if it takes less than 2 minutes, do it now','Your environment directly affects your mood, focus, and stress levels','Declutter first, then organize — no point organizing things you don\'t need','A clean car reflects how you care for your possessions','Weekly resets prevent the overwhelm of massive deep-cleaning sessions'],
    actions: ['Set a 10-minute daily cleaning habit (make bed, clear surfaces)','Do a weekly Sunday reset: clean room, laundry, organize your week','Declutter one drawer or closet section this week','Clean your car inside and out this weekend','Set a monthly deep-clean day on your calendar'] },

  { id: 64, cat: 'life_skills',      emoji: '🎤', title: 'Public Speaking & Owning the Room',
    desc: 'Your voice matters. Learn how to speak with confidence in any setting.',
    tips: ['Preparation eliminates 80% of public speaking anxiety','Slow down — nervous speakers always talk too fast','Eye contact builds trust and confidence — look at people, not your notes','Start strong: the first 10 seconds determines how people receive you','Your posture communicates confidence before you say a single word'],
    actions: ['Join your school\'s speech team, debate club, or drama class','Practice your next presentation out loud at least 3 times','Record yourself speaking and watch it back once','Work on your opening line until it\'s powerful, clear, and memorable','Volunteer to speak in class at least once a week to build comfort'] },

  { id: 65, cat: 'character',        emoji: '💪', title: 'Handling Rejection & Hearing No',
    desc: 'No is not the end of your story. Learn how to handle rejection with grace and resilience.',
    tips: ['Rejection is redirection — it often protects you from what wasn\'t right for you','Don\'t take rejection personally — often it has nothing to do with your worth','Every successful person has a rejection story — sometimes hundreds','How you respond to "no" says more about you than the rejection itself','Give yourself 24 hours to feel it, then move forward'],
    actions: ['Journal about your last major rejection: what did you learn?','Apply to something you\'re afraid of being rejected from this month','Practice celebrating your efforts regardless of the outcome','Read about a successful person\'s rejection story (J.K. Rowling, Michael Jordan)','Reframe your last rejection: "What door did this close? What door might it open?"'] },

  { id: 66, cat: 'adhd', emoji: '⚡', title: 'Understanding ADHD',
    desc: 'ADHD is not a flaw — it\'s a different way of thinking. Learn what it means and how to work with your brain.',
    tips: ['ADHD affects focus, impulse control, and time perception — not intelligence','Girls with ADHD are often underdiagnosed because symptoms look different than in boys','Hyperfocus is a real ADHD trait — use it as a superpower','Your brain needs structure, not shame','Medication is one tool — not the only one, and not for everyone'],
    actions: ['Talk to a doctor or school counselor if you suspect you have ADHD','Research the difference between ADHD-Inattentive and ADHD-Combined types','Try body doubling (working alongside someone) for focus','Use timers and alarms to manage transitions between tasks','Build external structure: planners, checklists, and visual reminders'] },

  { id: 67, cat: 'adhd', emoji: '📋', title: 'ADHD Study Strategies That Actually Work',
    desc: 'Standard study advice doesn\'t always work for ADHD brains. Here\'s what actually does.',
    tips: ['Short focused bursts work better than long study sessions for ADHD brains','Movement before studying improves focus significantly','Visual timers make time feel real and manageable','Remove distractions BEFORE you start — not after you\'re already distracted','Background music or brown noise can help ADHD brains focus'],
    actions: ['Try the Pomodoro method: 15 min on, 5 min break','Use a visual timer app like Forest or Focusmate','Study in a distraction-free environment — phone in another room','Try walking while reviewing notes or flashcards','Ask your school about accommodations like extended time or a quiet testing room'] },

  { id: 68, cat: 'adhd', emoji: '💊', title: 'Managing ADHD Without Shame',
    desc: 'Living with ADHD means building systems that work for YOUR brain — not forcing yourself into neurotypical boxes.',
    tips: ['Shame spirals are common with ADHD — break the cycle with self-compassion','You are not lazy. You are not broken. Your brain works differently.','Consistent routines reduce the mental load of ADHD significantly','Accountability partners and coaches are powerful ADHD tools','Many successful women — CEOs, athletes, artists — have ADHD'],
    actions: ['Build a simple morning routine you can follow on autopilot','Find an accountability partner who understands your brain','Follow ADHD creators who normalize the experience (e.g. @HowToADHD)','Research IEPs and 504 plans at your school for academic support','Practice self-compassion: "I am not behind. I am learning how my brain works."'] },

  { id: 69, cat: 'caring_for_pets', emoji: '🐾', title: 'Basic Pet Care 101',
    desc: 'Owning a pet is one of the most rewarding responsibilities you can have. Learn the basics to keep your pet happy and healthy.',
    tips: ['Pets need consistent feeding, water, and veterinary care — not just when convenient','Spaying or neutering your pet prevents health issues and overpopulation','Annual vet checkups catch health problems before they become emergencies','Pets need mental stimulation and exercise — not just food and shelter','A pet\'s behavior reflects the care and training it receives'],
    actions: ['Set up a consistent daily feeding and exercise schedule for your pet','Schedule an annual vet checkup if you haven\'t already','Research your specific pet\'s needs: diet, exercise, grooming, and lifespan','Invest in proper ID tags and microchipping for safety','Learn the signs of illness in your pet species so you catch problems early'] },

  { id: 70, cat: 'caring_for_pets', emoji: '🐕', title: 'Dog Care & Training Basics',
    desc: 'Dogs are loyal companions — but they need structure, love, and training to thrive.',
    tips: ['Consistency is the key to dog training — same rules every time','Positive reinforcement works better than punishment','Dogs need daily exercise — a tired dog is a well-behaved dog','Socialization early in life prevents fear and aggression later','Never leave dogs in hot cars — even for a few minutes'],
    actions: ['Establish house rules for your dog and stick to them consistently','Research basic commands: sit, stay, come, leave it, and down','Sign up for a beginner obedience class if you have a new puppy','Create a daily walk and play schedule for your dog','Puppy-proof your home and yard for their safety'] },

  { id: 71, cat: 'caring_for_pets', emoji: '🐈', title: 'Cat Care Essentials',
    desc: 'Cats are independent but deeply loving — and they have real needs that require your attention.',
    tips: ['Indoor cats live significantly longer than outdoor cats','Clean the litter box daily — cats avoid dirty boxes','Cats need scratch posts to maintain claw health','Regular brushing reduces shedding and hairballs','Cats can develop stress-related illnesses — they need a calm environment'],
    actions: ['Set up a litter box area and clean it every day','Buy a scratching post near where your cat likes to scratch','Schedule an annual vet visit including vaccinations','Provide climbing spaces and window perches for mental stimulation','Learn the signs of stress in cats: hiding, over-grooming, or litter box issues'] },

  { id: 72, cat: 'parenthood', emoji: '👶', title: 'Teen Pregnancy: What You Need to Know',
    desc: 'Honest, non-judgmental information about teen pregnancy — because knowledge protects you.',
    tips: ['Pregnancy can occur even with contraception — no method is 100% effective except abstinence','Early prenatal care dramatically improves outcomes for mom and baby','You are not alone — there are resources and support systems for teen moms','Your education does not have to end — many schools have programs for pregnant teens','Making an informed decision requires all the facts'],
    actions: ['Take a pregnancy test if you\'re concerned — the sooner you know, the more options you have','Call 1-800-672-2296 (Option Line) for free, confidential pregnancy support','Talk to a trusted adult, doctor, or counselor right away','Research your state\'s laws and available resources for pregnant teens','Know that you have rights: at school, medically, and legally'] },

  { id: 73, cat: 'parenthood', emoji: '💪', title: 'If You\'re Already a Teen Mom',
    desc: 'Being a teen mom is hard — but it doesn\'t define your ceiling. Here\'s how to keep moving forward.',
    tips: ['Your child needs you to take care of yourself first','Accepting help is strength — not weakness','Your education is one of the greatest gifts you can give your child','Financial assistance programs exist specifically for young parents','You are building a legacy — not just surviving'],
    actions: ['Apply for WIC, SNAP, Medicaid, and childcare assistance in your state','Research GED programs or online school options if needed','Connect with a teen parent support group in your community','Create a realistic budget that includes childcare, food, and housing','Identify one long-term goal and take one small step toward it every week'] },

  { id: 74, cat: 'good_parenting', emoji: '💝', title: 'What Makes a Good Parent',
    desc: 'Parenting is one of the most important things anyone will ever do. Here\'s what actually matters.',
    tips: ['Consistency and presence matter more than perfection','Children need to feel safe, seen, heard, and loved — every day','Your child learns from watching you — not just listening to you','Repair matters: how you recover from conflict teaches resilience','Love is not just a feeling — it\'s an action expressed every day'],
    actions: ['Put your phone down for 30 minutes of undivided attention with your child each day','Learn the difference between discipline and punishment','Read "The Whole-Brain Child" by Daniel Siegel','Apologize to your child when you\'re wrong — it teaches accountability','Identify your own childhood wounds so they don\'t become your child\'s'] },

  { id: 75, cat: 'good_parenting', emoji: '🧠', title: 'Raising Emotionally Intelligent Kids',
    desc: 'Emotional intelligence is one of the greatest gifts you can give a child — and it starts with you.',
    tips: ['Name feelings out loud: "It sounds like you\'re feeling frustrated"','Allow children to feel emotions without immediately trying to fix them','Children learn emotional regulation by watching adults regulate emotions','Validate before you redirect: "I understand you\'re upset AND we still can\'t..."','Read-alouds about emotions build emotional vocabulary in young children'],
    actions: ['Practice naming your own emotions out loud in front of your child','Use feeling charts or emotion cards with younger children','Watch "Inside Out" together and discuss the emotions as a family','Respond to tantrums with calm — even when it\'s hard','Create a calm-down corner in your home with sensory tools and books'] },

  { id: 76, cat: 'good_parenting', emoji: '🛡️', title: 'Protecting Your Child from Abuse',
    desc: 'Every parent needs to know how to recognize, prevent, and respond to child abuse.',
    tips: ['Teach body safety early using correct anatomical names','Teach children that secrets about bodies are never okay — only surprises are okay','Know the signs: behavioral changes, age-inappropriate knowledge, withdrawal','Most abuse is perpetrated by someone the family knows and trusts','Believe children when they disclose — your response determines whether they tell again'],
    actions: ['Read "My Body Belongs to Me" with young children','Have age-appropriate conversations about body safety regularly','Know the Childhelp National Child Abuse Hotline: 1-800-422-4453','Research Darkness to Light\'s Stewards of Children program for parents','Review who has unsupervised access to your child and trust your instincts'] },

  { id: 77, cat: 'healthy_eating', emoji: '🥗', title: 'Eating for Energy & Glow',
    desc: 'What you eat directly affects your skin, mood, focus, and energy. Here\'s how to fuel your body right.',
    tips: ['Eat protein at every meal to stabilize blood sugar and reduce cravings','Hydration affects your skin, focus, and energy more than any supplement','Ultra-processed foods cause energy crashes, acne, and brain fog','Eating colorful fruits and vegetables gives your body antioxidants that fight inflammation','You don\'t need to diet — you need to nourish'],
    actions: ['Drink a full glass of water first thing every morning before anything else','Add one fruit or vegetable to every meal this week','Swap one processed snack for a whole food alternative (apple + almond butter, etc.)','Meal prep simple protein-based snacks for the week on Sunday','Track how different foods make you feel for 7 days — you\'ll notice patterns'] },

  { id: 78, cat: 'healthy_eating', emoji: '🚫', title: 'Breaking Bad Eating Habits',
    desc: 'Emotional eating, skipping meals, and diet culture are real — here\'s how to build a healthier relationship with food.',
    tips: ['Skipping meals slows your metabolism and increases bingeing later','Eating out of boredom or stress is emotional eating — pause and identify the real need','Food is not a reward or punishment — it\'s fuel and enjoyment','Diet culture profits from your insecurity — don\'t buy into it','Progress over perfection: one healthy choice at a time'],
    actions: ['Eat breakfast every day for one week and note the difference in your energy','Identify your top 3 emotional eating triggers and a healthy alternative for each','Stop labeling food as "good" or "bad" — all foods can fit in moderation','Plan and prep 3 nutritious meals this week before the week starts','Talk to a doctor or dietitian if your relationship with food causes distress'] },

  { id: 79, cat: 'healthy_eating', emoji: '💧', title: 'Hydration: Why Water Is Everything',
    desc: 'Most girls are chronically dehydrated — and it\'s affecting their skin, mood, and focus without them knowing.',
    tips: ['Even mild dehydration causes fatigue, headaches, and poor focus','Your skin clears up significantly when you drink enough water consistently','The 8x8 rule: aim for 8 glasses of 8oz water per day as a baseline','Coffee, soda, and energy drinks are diuretics — they cause dehydration','Hunger is often actually thirst — drink water before reaching for a snack'],
    actions: ['Buy a 32oz water bottle and aim to fill it twice daily','Set hourly phone reminders to drink water if you forget','Drink a full glass of water before every meal','Replace one sugary drink per day with water or herbal tea','Add lemon, cucumber, or fruit to your water if plain water feels boring'] },

  { id: 80, cat: 'time_mgmt', emoji: '⏰', title: 'Time Management 101',
    desc: 'You have the same 24 hours as everyone else. Here\'s how to use them intentionally.',
    tips: ['Time blocking — scheduling tasks into specific time slots — doubles productivity','Your hardest task should be done first, when your energy is highest','Saying yes to everything means saying no to your priorities','A 10-minute weekly planning session saves hours of confusion during the week','Done is better than perfect — perfectionism is procrastination in disguise'],
    actions: ['Write down your top 3 priorities for tomorrow before you go to sleep tonight','Try time blocking your schedule for one week using Google Calendar or a planner','Identify your biggest time waster and cut it by 50% this week','Do a weekly Sunday planning session: review the week and plan the next one','Say no to one non-essential commitment this week'] },

  { id: 81, cat: 'time_mgmt', emoji: '📵', title: 'Beating Procrastination',
    desc: 'Procrastination is not a character flaw — it\'s a habit you can break.',
    tips: ['Procrastination is usually caused by anxiety or overwhelm — not laziness','The 2-minute rule: if it takes less than 2 minutes, do it right now','Start with 5 minutes only — getting started is the hardest part','Break large tasks into tiny, non-scary next steps','Accountability — telling someone your plan — dramatically increases follow-through'],
    actions: ['Identify one task you\'ve been avoiding and do just 5 minutes on it right now','Break your biggest current project into 10 small steps and do step 1 today','Tell a friend or accountability partner your deadline','Remove your biggest distraction (phone, social media) during work blocks','Reward yourself after completing a task — build positive associations with getting things done'] },

  { id: 82, cat: 'time_mgmt', emoji: '🗓️', title: 'Planning Your Week Like a Boss',
    desc: 'The most productive girls don\'t work harder — they plan smarter.',
    tips: ['Weekly planning is the most high-leverage 15 minutes you can invest','Identify your MIT (Most Important Task) for each day the night before','Schedule self-care, rest, and fun — not just work and obligations','Batch similar tasks together to reduce mental switching costs','Review what went wrong last week before planning the next one — iterate and improve'],
    actions: ['Set a Sunday planning ritual: review last week, plan this week','Use a planner, journal, or digital calendar — whichever you\'ll actually use','Write your top 3 priorities for the week every Sunday night','Schedule study blocks, workouts, and rest the same way you schedule appointments','End each day with a 5-minute review: what got done, what moves to tomorrow'] },
];

export default function GirlsLibrary() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('resources');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedResource, setSelectedResource] = useState(null);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const ALL_CATS = Object.keys(CAT_META);
  const filtered = (() => {
    let list = activeCategory === 'all' ? RESOURCES : RESOURCES.filter(r => r.cat === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || CAT_META[r.cat]?.label.toLowerCase().includes(q));
    }
    return list;
  })();
  const categoryTiles = ALL_CATS.map(id => ({ id, ...CAT_META[id] }));

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />

      <div className="relative z-10">
        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => navigate(-1)} className="text-gray-400"><ChevronLeft size={20} /></button>
            <div className="flex items-center gap-1.5">
              <BookOpen size={13} className="text-purple-400" />
              <span className="text-xs font-bold tracking-widest text-purple-400">GIRLS LIBRARY</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-0.5">Girls Library 📚</h1>
          <p className="text-sm text-gray-400 mb-3">Knowledge, guides, and curated books to help you thrive.</p>
          <div className="rounded-2xl px-4 py-3 mb-3"
            style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.4), rgba(139,10,120,0.3))', border: '1px solid rgba(168,85,247,0.25)' }}>
            <p className="text-xs font-bold text-yellow-300 mb-0.5">✨ Recommended For You</p>
            <p className="text-xs text-gray-300">Resources handpicked based on your interests and growth stage</p>
          </div>
          {/* Search */}
          <div className="relative mt-3">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="w-full rounded-2xl px-4 py-3 pl-10 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">✕</button>
            )}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none">
          {SECTION_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveSection(tab.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap"
              style={activeSection === tab.id
                ? { background: 'rgba(139,92,246,0.35)', border: '1px solid rgba(168,85,247,0.5)', color: '#fff' }
                : { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
              <span>{tab.emoji}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 overflow-x-auto px-4 pt-3 pb-3 scrollbar-none">
          <button onClick={() => setActiveCategory('all')}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition whitespace-nowrap"
            style={activeCategory === 'all'
              ? { background: 'rgba(139,92,246,0.4)', border: '1px solid rgba(168,85,247,0.6)', color: '#fff' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
            All
          </button>
          {ALL_CATS.map(id => {
            const m = CAT_META[id];
            return (
              <button key={id} onClick={() => setActiveCategory(id)}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap"
                style={activeCategory === id
                  ? { background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
                <span>{m.emoji}</span>{m.label}
              </button>
            );
          })}
        </div>

        {/* Book Club Section */}
        {activeSection === 'book_club' && user && <BookClub user={user} />}
        {activeSection === 'book_club' && !user && (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
        )}

        {/* Resource List */}
        {activeSection === 'resources' && (() => {
          if (activeCategory === 'all' && !search.trim()) {
            return (
              <div className="px-4 pb-6 space-y-7">
                {ALL_CATS.filter(catId => RESOURCES.some(r => r.cat === catId)).map(catId => {
                  const meta = CAT_META[catId];
                  const catResources = RESOURCES.filter(r => r.cat === catId);
                  return (
                    <div key={catId}>
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <span className="text-lg">{meta.emoji}</span>
                        <h3 className="text-sm font-bold tracking-wide" style={{ color: meta.labelColor }}>{meta.label}</h3>
                        <span className="text-xs text-gray-600 ml-auto">{catResources.length} articles</span>
                      </div>
                      <div className="space-y-2">
                        {catResources.map(r => (
                          <button key={r.id} onClick={() => setSelectedResource(r)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition active:opacity-80"
                            style={{ background: meta.cardBg, border: '1px solid rgba(255,255,255,0.07)' }}>
                            <span className="text-xl flex-shrink-0">{r.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-white leading-snug">{r.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{r.desc}</p>
                            </div>
                            <ChevronRight size={15} className="text-gray-500 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }
          return (
            <div className="space-y-2 px-4 pb-6">
              {search.trim() && <p className="text-xs text-gray-500 mb-3">{filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;</p>}
              {filtered.length === 0 && <div className="text-center py-12 text-gray-500 text-sm">No resources found</div>}
              {filtered.map(r => {
                const meta = CAT_META[r.cat];
                return (
                  <button key={r.id} onClick={() => setSelectedResource(r)}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-left transition hover:opacity-90"
                    style={{ background: meta.cardBg, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                      style={{ background: 'rgba(255,255,255,0.08)' }}>
                      {r.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold mb-0.5" style={{ color: meta.labelColor }}>{meta.label}</p>
                      <p className="font-bold text-sm text-white leading-snug">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{r.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-500 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Resource Detail (only for resources tab) */}
      {activeSection === 'resources' && selectedResource && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: '#0d0010' }}>
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 sticky top-0 z-10" style={{ backgroundColor: '#0d0010' }}>
            <button onClick={() => setSelectedResource(null)} className="flex items-center gap-1 text-gray-400 text-sm hover:text-white transition">
              <ChevronLeft size={18} /> Back to Girls Library
            </button>
          </div>

          <div className="px-4 pb-32">
            {/* Resource header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: CAT_META[selectedResource.cat].cardBg, border: '1px solid rgba(255,255,255,0.1)' }}>
                {selectedResource.emoji}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold mb-1" style={{ color: CAT_META[selectedResource.cat].labelColor }}>
                  {CAT_META[selectedResource.cat].label.toUpperCase()}
                </p>
                <h1 className="text-2xl font-bold italic text-white leading-tight">{selectedResource.title}</h1>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-5">{selectedResource.desc}</p>

            {/* Tips & Guidance */}
            {selectedResource.tips && selectedResource.tips.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400 text-lg">💡</span>
                  <p className="font-bold text-white text-base">Tips &amp; Guidance</p>
                </div>
                <div className="space-y-2">
                  {selectedResource.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-2xl"
                      style={{ background: 'rgba(60,15,90,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ border: '2px solid #ec4899' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                      </div>
                      <p className="text-sm text-gray-200 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Steps */}
            {selectedResource.actions && selectedResource.actions.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <p className="font-bold text-white text-base">Action Steps</p>
                </div>
                <div className="space-y-2">
                  {selectedResource.actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-2xl"
                      style={{ background: 'rgba(15,60,35,0.5)', border: '1px solid rgba(74,222,128,0.15)' }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                        style={{ background: 'rgba(34,197,94,0.5)', minWidth: 24 }}>
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-200 leading-relaxed">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quiz */}
            <LibraryQuiz key={selectedResource.id} quiz={QUIZZES[selectedResource.id]} />
          </div>
        </div>
      )}

      <BottomNav active="discover" />
    </div>
  );
}