import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Target, Sparkles, ChevronRight, X, Search, ClipboardList, FileText } from 'lucide-react';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import CareerQuiz from '@/components/career/CareerQuiz';
import ResumeBuilder from '@/components/career/ResumeBuilder';

const CATEGORIES = [
  'All', 'Business', 'Healthcare', 'Law', 'Technology', 'Education',
  'Mental Health', 'Creative Arts', 'Finance', 'Media', 'Science', 'Design',
  'Beauty & Wellness', 'Tech & Digital', 'Creative & Media',
  'Education & Social Impact', 'Law & Justice', 'Trades & Entrepreneurship',
];

const EXPERIENCE_LEVELS = ['All Levels', 'Entry Level', 'Mid Level', 'Senior Level', 'Executive'];

const CATEGORY_COLORS = {
  Business: '#a855f7', Healthcare: '#06b6d4', Law: '#f59e0b', Technology: '#22c55e',
  Education: '#f97316', 'Mental Health': '#ec4899', 'Creative Arts': '#ef4444',
  Finance: '#10b981', Media: '#8b5cf6', Science: '#14b8a6', Design: '#6366f1',
  'Beauty & Wellness': '#f472b6', 'Tech & Digital': '#3b82f6', 'Creative & Media': '#e879f9',
  'Education & Social Impact': '#fb923c', 'Law & Justice': '#fbbf24',
  'Trades & Entrepreneurship': '#84cc16',
};

const CAREERS = [
  // Business
  { id: 1, emoji: '👑', category: 'Business', exp: 'Executive', title: 'Entrepreneur / Business Owner', salary: '$30K – $1M+', desc: 'Build something from nothing. Create jobs, solve problems, and be your own boss.' },
  { id: 2, emoji: '📣', category: 'Business', exp: 'Mid Level', title: 'Marketing Manager', salary: '$65K – $150K+', desc: 'Lead marketing strategy, campaigns, and brand growth for companies and organizations.' },
  { id: 3, emoji: '🤝', category: 'Business', exp: 'Mid Level', title: 'Human Resources Manager', salary: '$65K – $130K+', desc: "Manage the most important asset of any company — its people. Hire, develop, and support employees." },
  { id: 4, emoji: '🧾', category: 'Business', exp: 'Mid Level', title: 'Accountant / CPA', salary: '$60K – $150K+', desc: 'Master the language of money — and help individuals and businesses manage, save, and grow their finances.' },
  { id: 5, emoji: '🏠', category: 'Business', exp: 'Mid Level', title: 'Mortgage Loan Officer', salary: '$50K – $200K+', desc: 'Help people achieve the dream of homeownership by guiding them through the mortgage process.' },
  { id: 6, emoji: '📋', category: 'Business', exp: 'Mid Level', title: 'Project Manager', salary: '$70K – $150K+', desc: 'Lead teams, manage timelines, and deliver results — in any industry from tech to construction to healthcare.' },
  { id: 7, emoji: '🎉', category: 'Business', exp: 'Entry Level', title: 'Event Planner', salary: '$40K – $120K+', desc: 'Create unforgettable experiences — from weddings to corporate galas to music festivals.' },
  { id: 8, emoji: '💼', category: 'Business', exp: 'Entry Level', title: 'Sales Executive', salary: '$50K – $250K+', desc: 'Drive revenue, build relationships, and master the art of persuasion in any industry.' },
  { id: 9, emoji: '📊', category: 'Business', exp: 'Senior Level', title: 'Business Consultant', salary: '$70K – $300K+', desc: 'Help companies solve problems, improve performance, and grow — and get paid very well to do it.' },
  { id: 10, emoji: '📱', category: 'Business', exp: 'Entry Level', title: 'Executive Assistant', salary: '$55K – $120K+', desc: 'Be the right hand of top executives — managing schedules, communications, and making things happen.' },
  { id: 11, emoji: '⚙️', category: 'Business', exp: 'Mid Level', title: 'Operations Manager', salary: '$65K – $140K+', desc: 'Keep businesses running smoothly by optimizing processes, managing teams, and driving efficiency.' },
  { id: 12, emoji: '📢', category: 'Business', exp: 'Entry Level', title: 'Public Relations Specialist', salary: '$50K – $130K+', desc: 'Shape how the world sees brands, celebrities, and organizations through strategic communication.' },
  { id: 13, emoji: '🔍', category: 'Business', exp: 'Entry Level', title: 'Recruiter', salary: '$50K – $150K+', desc: 'Connect talented people with their dream jobs and help companies build winning teams.' },
  // Healthcare
  { id: 14, emoji: '🩺', category: 'Healthcare', exp: 'Executive', title: 'Doctor / Physician', salary: '$150K – $400K+', desc: 'Save lives, heal people, and make a real difference in your community every single day.' },
  { id: 15, emoji: '💉', category: 'Healthcare', exp: 'Mid Level', title: 'Nurse / Nurse Practitioner', salary: '$60K – $130K+', desc: 'Be the heartbeat of healthcare — the person patients trust most during their hardest moments.' },
  { id: 16, emoji: '🤰', category: 'Healthcare', exp: 'Executive', title: 'OB-GYN', salary: '$200K – $400K+', desc: "Specialize in women's reproductive health, deliver babies, and be a trusted advocate for women at every life stage." },
  { id: 17, emoji: '🦷', category: 'Healthcare', exp: 'Executive', title: 'Dentist', salary: '$150K – $350K+', desc: 'Protect smiles, relieve pain, and build a highly profitable practice as a dental professional.' },
  { id: 18, emoji: '😁', category: 'Healthcare', exp: 'Executive', title: 'Orthodontist', salary: '$200K – $400K+', desc: 'Straighten smiles and transform confidence through braces, aligners, and orthodontic treatment.' },
  { id: 19, emoji: '💊', category: 'Healthcare', exp: 'Senior Level', title: 'Pharmacist', salary: '$120K – $160K+', desc: 'Be the medication expert patients rely on — ensuring safe, effective drug therapy and counseling.' },
  { id: 20, emoji: '🏃', category: 'Healthcare', exp: 'Mid Level', title: 'Physical Therapist', salary: '$75K – $110K+', desc: 'Help patients recover from injuries and surgeries to regain movement, strength, and quality of life.' },
  { id: 21, emoji: '🤝', category: 'Healthcare', exp: 'Mid Level', title: 'Occupational Therapist', salary: '$70K – $110K+', desc: 'Help people recover from injuries, disabilities, or illness to regain independence in daily life.' },
  { id: 22, emoji: '🔊', category: 'Healthcare', exp: 'Entry Level', title: 'Ultrasound Technician', salary: '$60K – $100K+', desc: 'Use imaging technology to help diagnose conditions and capture some of the most emotional moments in medicine.' },
  { id: 23, emoji: '🩻', category: 'Healthcare', exp: 'Entry Level', title: 'Radiology Technician', salary: '$55K – $95K+', desc: 'Perform X-rays, CT scans, and MRIs that help doctors diagnose and treat patients.' },
  { id: 24, emoji: '🗣️', category: 'Healthcare', exp: 'Mid Level', title: 'Speech Pathologist', salary: '$65K – $110K+', desc: 'Help children and adults overcome speech, language, and swallowing disorders to communicate confidently.' },
  { id: 25, emoji: '🥗', category: 'Healthcare', exp: 'Entry Level', title: 'Nutritionist / Dietitian', salary: '$50K – $100K+', desc: 'Help people transform their health through food, nutrition education, and personalized meal planning.' },
  { id: 26, emoji: '🏥', category: 'Healthcare', exp: 'Entry Level', title: 'Medical Assistant', salary: '$35K – $55K+', desc: 'Support physicians and nurses in clinical and administrative tasks — a fast-entry path into healthcare.' },
  // Law
  { id: 27, emoji: '⚖️', category: 'Law', exp: 'Senior Level', title: 'Lawyer / Attorney', salary: '$70K – $300K+', desc: "Fight for justice, protect people's rights, and use your voice to change the world." },
  // Technology
  { id: 28, emoji: '💻', category: 'Technology', exp: 'Mid Level', title: 'Software Engineer / Tech', salary: '$80K – $300K+', desc: 'Build the apps, platforms, and systems that billions of people use every day.' },
  // Education
  { id: 29, emoji: '📚', category: 'Education', exp: 'Entry Level', title: 'Teacher / Educator', salary: '$40K – $90K+', desc: 'Shape the next generation. Every great leader, doctor, and entrepreneur had a teacher who believed in them.' },
  // Mental Health
  { id: 30, emoji: '🧠', category: 'Mental Health', exp: 'Mid Level', title: 'Psychologist / Therapist', salary: '$60K – $150K+', desc: 'Help people heal, grow, and become the best versions of themselves. Mental health is everything.' },
  // Creative Arts
  { id: 31, emoji: '👗', category: 'Creative Arts', exp: 'Entry Level', title: 'Fashion Designer / Stylist', salary: '$35K – $200K+', desc: 'Turn creativity into a career. Design clothes, style celebrities, or build your own fashion brand.' },
  // Finance
  { id: 32, emoji: '💳', category: 'Finance', exp: 'Mid Level', title: 'Financial Advisor / Banker', salary: '$60K – $250K+', desc: 'Help people build wealth, plan for the future, and achieve financial freedom.' },
  // Media
  { id: 33, emoji: '🎬', category: 'Media', exp: 'Entry Level', title: 'Media / Content Creator', salary: '$20K – $1M+', desc: 'Build a platform, tell your story, and influence millions through content creation.' },
  // Science
  { id: 34, emoji: '🔬', category: 'Science', exp: 'Mid Level', title: 'Scientist / Researcher', salary: '$55K – $150K+', desc: 'Discover cures, solve global problems, and push the boundaries of what humanity knows.' },
  // Design
  { id: 35, emoji: '🏛️', category: 'Design', exp: 'Mid Level', title: 'Architect / Interior Designer', salary: '$50K – $130K+', desc: 'Design the spaces where people live, work, learn, and dream. Shape the world around you.' },
  // Beauty & Wellness
  { id: 36, emoji: '💄', category: 'Beauty & Wellness', exp: 'Entry Level', title: 'Makeup Artist', salary: '$35K – $150K+', desc: 'Transform faces, boost confidence, and turn artistry into a thriving career in film, TV, weddings, and editorial work.' },
  { id: 37, emoji: '🌸', category: 'Beauty & Wellness', exp: 'Entry Level', title: 'Esthetician', salary: '$35K – $90K+', desc: 'Specialize in skincare treatments, facials, and helping clients achieve their best skin ever.' },
  { id: 38, emoji: '✂️', category: 'Beauty & Wellness', exp: 'Entry Level', title: 'Hairstylist', salary: '$30K – $120K+', desc: 'Create stunning hair transformations and build a loyal clientele in salons, on sets, or in your own suite.' },
  { id: 39, emoji: '💅', category: 'Beauty & Wellness', exp: 'Entry Level', title: 'Nail Technician', salary: '$28K – $80K+', desc: 'Master the art of nail design and build a creative, flexible career with loyal clients.' },
  { id: 40, emoji: '👁️', category: 'Beauty & Wellness', exp: 'Entry Level', title: 'Lash Technician', salary: '$35K – $100K+', desc: 'Specialize in eyelash extensions and become a sought-after beauty professional with premium pricing.' },
  { id: 41, emoji: '🪒', category: 'Beauty & Wellness', exp: 'Entry Level', title: 'Barber', salary: '$35K – $100K+', desc: 'Master the art of cuts, fades, and grooming — a high-demand, recession-proof career with loyal clients.' },
  { id: 42, emoji: '🧴', category: 'Beauty & Wellness', exp: 'Executive', title: 'Skincare Brand Owner', salary: '$40K – $500K+', desc: 'Create and sell your own skincare line — from formulation to branding to building a loyal customer base.' },
  { id: 43, emoji: '🌹', category: 'Beauty & Wellness', exp: 'Mid Level', title: 'Perfumer', salary: '$45K – $200K+', desc: 'Create signature fragrances for luxury brands, celebrities, or your own perfume line.' },
  { id: 44, emoji: '🪞', category: 'Beauty & Wellness', exp: 'Mid Level', title: 'Image Consultant', salary: '$45K – $150K+', desc: 'Help clients discover their personal style, build confidence, and present their best selves professionally.' },
  { id: 45, emoji: '👗', category: 'Beauty & Wellness', exp: 'Mid Level', title: 'Personal Stylist', salary: '$40K – $200K+', desc: 'Curate outfits and looks for celebrities, executives, and everyday clients who want to look their best.' },
  { id: 46, emoji: '🔬', category: 'Beauty & Wellness', exp: 'Senior Level', title: 'Cosmetic Chemist', salary: '$60K – $130K+', desc: 'Develop the formulas behind your favorite beauty products — from serums to foundations to shampoos.' },
  { id: 47, emoji: '🧖', category: 'Beauty & Wellness', exp: 'Executive', title: 'Spa Owner', salary: '$50K – $300K+', desc: 'Create a luxury wellness destination where clients come to relax, rejuvenate, and feel their best.' },
  { id: 48, emoji: '📸', category: 'Beauty & Wellness', exp: 'Entry Level', title: 'Beauty Influencer', salary: '$20K – $1M+', desc: 'Build a loyal audience by sharing beauty tips, tutorials, and product reviews across social platforms.' },
  // Tech & Digital
  { id: 49, emoji: '🎨', category: 'Tech & Digital', exp: 'Mid Level', title: 'UX Designer', salary: '$75K – $150K+', desc: 'Design the apps and websites people love to use — combining psychology, design, and technology.' },
  { id: 50, emoji: '🖌️', category: 'Tech & Digital', exp: 'Entry Level', title: 'Graphic Designer', salary: '$45K – $100K+', desc: 'Create visual identities, marketing materials, and digital art that makes brands come alive.' },
  { id: 51, emoji: '📱', category: 'Tech & Digital', exp: 'Mid Level', title: 'App Developer', salary: '$80K – $160K+', desc: 'Build the mobile apps that people use every day — from social media to health trackers to games.' },
  { id: 52, emoji: '📈', category: 'Tech & Digital', exp: 'Entry Level', title: 'Data Analyst', salary: '$65K – $130K+', desc: 'Turn raw data into insights that drive business decisions — one of the most in-demand skills of our time.' },
  { id: 53, emoji: '🔐', category: 'Tech & Digital', exp: 'Mid Level', title: 'Cybersecurity Analyst', salary: '$80K – $160K+', desc: 'Protect companies and individuals from hackers, data breaches, and cyber threats.' },
  { id: 54, emoji: '📲', category: 'Tech & Digital', exp: 'Entry Level', title: 'Social Media Manager', salary: '$45K – $100K+', desc: 'Build and grow brand presence across social platforms through strategic content and community management.' },
  { id: 55, emoji: '📈', category: 'Tech & Digital', exp: 'Entry Level', title: 'Digital Marketer', salary: '$55K – $130K+', desc: 'Drive traffic, leads, and sales through SEO, ads, email marketing, and digital strategy.' },
  { id: 56, emoji: '🎬', category: 'Tech & Digital', exp: 'Entry Level', title: 'Content Creator', salary: '$20K – $1M+', desc: 'Build a personal brand and audience by creating videos, posts, and content that entertains, educates, or inspires.' },
  { id: 57, emoji: '🎞️', category: 'Tech & Digital', exp: 'Entry Level', title: 'Video Editor', salary: '$45K – $120K+', desc: 'Transform raw footage into compelling stories for YouTube, film, TV, and social media.' },
  { id: 58, emoji: '🌐', category: 'Tech & Digital', exp: 'Entry Level', title: 'Web Designer', salary: '$50K – $120K+', desc: 'Create beautiful, functional websites that help businesses and creators look professional online.' },
  { id: 59, emoji: '🤖', category: 'Tech & Digital', exp: 'Mid Level', title: 'AI Prompt Engineer', salary: '$60K – $200K+', desc: 'Master the art of communicating with AI to get powerful results — one of the newest and most exciting careers in tech.' },
  { id: 60, emoji: '🎮', category: 'Tech & Digital', exp: 'Mid Level', title: 'Game Designer', salary: '$60K – $150K+', desc: 'Create the worlds, characters, and mechanics behind video games that millions of people play.' },
  // Creative & Media
  { id: 61, emoji: '🎭', category: 'Creative & Media', exp: 'Entry Level', title: 'Actress', salary: '$20K – $20M+', desc: 'Bring characters to life on stage, film, and television — and inspire audiences around the world.' },
  { id: 62, emoji: '🎤', category: 'Creative & Media', exp: 'Entry Level', title: 'Singer', salary: '$20K – $50M+', desc: 'Use your voice to move people, tell stories, and build a career in music.' },
  { id: 63, emoji: '💃', category: 'Creative & Media', exp: 'Entry Level', title: 'Dancer / Choreographer', salary: '$25K – $200K+', desc: 'Express yourself through movement and build a career in performance, choreography, or dance education.' },
  { id: 64, emoji: '✍️', category: 'Creative & Media', exp: 'Entry Level', title: 'Author / Writer', salary: '$20K – $1M+', desc: 'Tell stories, share knowledge, and build a legacy through books, journalism, and creative writing.' },
  { id: 65, emoji: '📰', category: 'Creative & Media', exp: 'Entry Level', title: 'Journalist / Reporter', salary: '$35K – $100K+', desc: 'Uncover the truth, break stories, and hold the powerful accountable through investigative reporting.' },
  { id: 66, emoji: '🎙️', category: 'Creative & Media', exp: 'Entry Level', title: 'Podcast Host', salary: '$20K – $500K+', desc: 'Build an audience through audio storytelling and become a voice that people tune in to every week.' },
  { id: 67, emoji: '📷', category: 'Creative & Media', exp: 'Entry Level', title: 'Photographer', salary: '$30K – $150K+', desc: "Capture the world's most powerful moments through a lens — from portraits to fashion to photojournalism." },
  // Education & Social Impact
  { id: 68, emoji: '🏫', category: 'Education & Social Impact', exp: 'Senior Level', title: 'School Principal', salary: '$80K – $130K+', desc: 'Lead a school community, support teachers, and shape the culture and vision that educates generations.' },
  { id: 69, emoji: '🤲', category: 'Education & Social Impact', exp: 'Entry Level', title: 'Social Worker', salary: '$45K – $80K+', desc: 'Advocate for vulnerable people and communities — one of the most impactful careers you can choose.' },
  { id: 70, emoji: '🌍', category: 'Education & Social Impact', exp: 'Senior Level', title: 'Nonprofit Director', salary: '$60K – $150K+', desc: 'Lead an organization that creates real change in your community and the world.' },
  { id: 71, emoji: '🏛️', category: 'Education & Social Impact', exp: 'Mid Level', title: 'Policy Analyst', salary: '$60K – $130K+', desc: "Shape the laws and policies that affect millions of people's lives — and make government work better." },
  { id: 72, emoji: '👩‍🏫', category: 'Education & Social Impact', exp: 'Senior Level', title: 'College Professor', salary: '$60K – $150K+', desc: 'Inspire the next generation of leaders at universities and colleges while advancing your field.' },
  { id: 73, emoji: '🌱', category: 'Education & Social Impact', exp: 'Entry Level', title: 'Community Organizer', salary: '$35K – $80K+', desc: 'Mobilize communities, advocate for change, and build power from the ground up.' },
  // Law & Justice
  { id: 74, emoji: '🏛️', category: 'Law & Justice', exp: 'Executive', title: 'Judge', salary: '$100K – $250K+', desc: 'Preside over court proceedings, interpret the law, and ensure justice is served fairly and impartially.' },
  { id: 75, emoji: '🔍', category: 'Law & Justice', exp: 'Mid Level', title: 'Criminal Investigator / Detective', salary: '$60K – $120K+', desc: 'Solve crimes, bring justice to victims, and protect communities as a detective or federal agent.' },
  { id: 76, emoji: '📜', category: 'Law & Justice', exp: 'Entry Level', title: 'Paralegal', salary: '$45K – $80K+', desc: 'Support attorneys, conduct legal research, and build a career at the heart of the justice system.' },
  { id: 77, emoji: '🚔', category: 'Law & Justice', exp: 'Entry Level', title: 'Law Enforcement Officer', salary: '$50K – $100K+', desc: 'Protect and serve your community as a police officer, marshal, or federal agent.' },
  { id: 78, emoji: '🛡️', category: 'Law & Justice', exp: 'Senior Level', title: 'Civil Rights Attorney', salary: '$50K – $200K+', desc: 'Fight for equality, justice, and the rights of people who have been wronged by the system.' },
  // Trades & Entrepreneurship
  { id: 79, emoji: '🔧', category: 'Trades & Entrepreneurship', exp: 'Entry Level', title: 'Electrician', salary: '$50K – $100K+', desc: 'Power homes, businesses, and infrastructure — a skilled trade with strong job security and great pay.' },
  { id: 80, emoji: '🏗️', category: 'Trades & Entrepreneurship', exp: 'Mid Level', title: 'Construction Manager', salary: '$75K – $150K+', desc: 'Oversee building projects from blueprint to completion — managing people, timelines, and budgets.' },
  { id: 81, emoji: '🛠️', category: 'Trades & Entrepreneurship', exp: 'Entry Level', title: 'Plumber', salary: '$55K – $100K+', desc: 'Master a trade that will always be in demand — and build a business or franchise of your own.' },
  { id: 82, emoji: '🚗', category: 'Trades & Entrepreneurship', exp: 'Entry Level', title: 'Auto Technician', salary: '$40K – $90K+', desc: 'Keep vehicles running and build a career in one of the most in-demand skilled trades.' },
  { id: 83, emoji: '👩‍💼', category: 'Trades & Entrepreneurship', exp: 'Senior Level', title: 'Franchise Owner', salary: '$60K – $500K+', desc: 'Own your business with the backing of a proven brand — the entrepreneurial path with a safety net.' },
  { id: 84, emoji: '🍽️', category: 'Trades & Entrepreneurship', exp: 'Mid Level', title: 'Restaurant Owner', salary: '$35K – $500K+', desc: 'Build your own food empire — from a local diner to a franchise chain — doing what you love every day.' },
];

const REAL_WOMEN = [
  {
    name: 'Kizzmekia Corbett', emoji: '🔬', title: 'Vaccine Scientist', field: 'Science',
    quote: "Science is not just for certain kinds of people. I want to show young Black girls that they belong in the lab, in the boardroom, everywhere.",
    fact: 'Led the development of the Moderna COVID-19 vaccine at the NIH. Named one of TIME\'s 100 Most Influential People.',
  },
  {
    name: 'Arlan Hamilton', emoji: '💼', title: 'Venture Capitalist', field: 'Business',
    quote: "I built a venture capital fund while homeless. The obstacles you face are real, but they are not the end of your story.",
    fact: 'Founded Backstage Capital and invested in over 200 companies led by underrepresented founders.',
  },
  {
    name: 'Issa Rae', emoji: '🎭', title: 'Actress, Writer & Producer', field: 'Creative & Media',
    quote: "I'm rooting for everybody Black. Create your own lane — nobody is going to hand you the keys.",
    fact: 'Created, wrote, and starred in Insecure on HBO. Built a media empire through her own production company.',
  },
  {
    name: 'Lisa Price', emoji: '🌹', title: 'Beauty Brand Founder', field: 'Beauty & Wellness',
    quote: "I started mixing products in my kitchen with $100. You don't need permission to start. You just need to start.",
    fact: "Founded Carol's Daughter in her kitchen in 1993. Sold to L'Oréal in 2014 for millions.",
  },
  {
    name: 'Kimberly Bryant', emoji: '💻', title: 'Tech Founder & Engineer', field: 'Technology',
    quote: "Black girls belong in tech — not just as users, but as the ones building the future.",
    fact: 'Founded Black Girls CODE, a nonprofit that has reached over 30,000 girls of color in technology education.',
  },
];

const DETAIL_INFO = {
  skills: {
    Business: ['Communication', 'Leadership', 'Strategic thinking', 'Financial literacy', 'Networking'],
    Healthcare: ['Empathy', 'Attention to detail', 'Science knowledge', 'Critical thinking', 'Stamina'],
    Law: ['Analytical reasoning', 'Writing', 'Public speaking', 'Research', 'Persuasion'],
    Technology: ['Coding', 'Problem solving', 'Logic', 'Continuous learning', 'Collaboration'],
    Education: ['Patience', 'Communication', 'Organization', 'Creativity', 'Empathy'],
    'Mental Health': ['Active listening', 'Empathy', 'Boundaries', 'Psychology knowledge', 'Patience'],
    'Creative Arts': ['Creativity', 'Visual thinking', 'Trend awareness', 'Business acumen', 'Passion'],
    Finance: ['Math', 'Analysis', 'Trustworthiness', 'Communication', 'Risk assessment'],
    Media: ['Storytelling', 'Content creation', 'Adaptability', 'Branding', 'Audience growth'],
    Science: ['Curiosity', 'Research skills', 'Data analysis', 'Precision', 'Persistence'],
    Design: ['Spatial thinking', 'Creativity', 'Technical drawing', 'Client communication', 'Software skills'],
    'Beauty & Wellness': ['Artistic skill', 'Customer service', 'Attention to detail', 'Business skills', 'Trendspotting'],
    'Tech & Digital': ['Design thinking', 'Digital tools', 'Creativity', 'Data literacy', 'Adaptability'],
    'Creative & Media': ['Storytelling', 'Performance', 'Creativity', 'Resilience', 'Self-promotion'],
    'Education & Social Impact': ['Advocacy', 'Communication', 'Empathy', 'Leadership', 'Community building'],
    'Law & Justice': ['Critical thinking', 'Ethics', 'Investigation', 'Communication', 'Attention to detail'],
    'Trades & Entrepreneurship': ['Technical skills', 'Problem solving', 'Physical stamina', 'Business sense', 'Reliability'],
  },
  steps: {
    Business: ['Take business or entrepreneurship classes in school', 'Start a small side hustle to learn basics', 'Get a degree in Business, Marketing, or Finance', 'Intern at a company or startup', 'Network and find a mentor in your field'],
    Healthcare: ['Excel in science and biology in school', 'Volunteer at a hospital or clinic', 'Get a pre-med or nursing degree', 'Complete clinical hours and residency', 'Get licensed and certified in your specialty'],
    Law: ['Build strong reading and writing skills', 'Join debate club or mock trial', 'Get a 4-year degree (any major)', 'Take the LSAT and apply to law school', 'Pass the bar exam and start practicing'],
    Technology: ['Learn to code (Python, JavaScript, or Swift)', 'Build small projects and apps', 'Get a CS degree or attend a coding bootcamp', 'Contribute to open-source projects', 'Apply for internships at tech companies'],
    Education: ['Study hard and develop patience', 'Volunteer or tutor younger students', 'Get a degree in Education', 'Complete student teaching hours', 'Get your teaching certification'],
  },
};

function getSteps(category) {
  return DETAIL_INFO.steps[category] || [
    'Research the field and talk to professionals',
    'Take relevant classes or workshops',
    'Get an internship or entry-level experience',
    'Build a portfolio or certifications',
    'Network and apply for positions',
  ];
}

function getSkills(category) {
  return DETAIL_INFO.skills[category] || ['Communication', 'Problem solving', 'Dedication', 'Creativity', 'Continuous learning'];
}

const EXP_COLORS = {
  'Entry Level': '#22c55e',
  'Mid Level': '#3b82f6',
  'Senior Level': '#f59e0b',
  'Executive': '#ec4899',
};

export default function CareerExploration() {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState('explore'); // explore | jobs | resume
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLevel, setActiveLevel] = useState('All Levels');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showRealWomen, setShowRealWomen] = useState(false);

  const filtered = CAREERS.filter(c => {
    const matchesCat = activeCategory === 'All' || c.category === activeCategory;
    const matchesLevel = activeLevel === 'All Levels' || c.exp === activeLevel;
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesLevel && matchesSearch;
  });

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ background: 'linear-gradient(to bottom, #1a0a2e, #0d0618, #000)' }}>
      <AppBackground />
      <div className="relative z-10">

        {/* Header */}
        <div className="px-4 pt-8 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase size={20} className="text-purple-400" />
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">Career Exploration</span>
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Your Future is Bright 👑</h1>
          <p className="text-white/50 text-sm mt-1">Explore careers, take the quiz, and start building your path today.</p>
        </div>

        {/* Main Tabs */}
        <div className="px-4 mb-5">
          <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { id: 'explore', label: '🔍 Explore', },
              { id: 'jobs', label: '💼 Job Tracker' },
              { id: 'resume', label: '📄 Resume' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setMainTab(tab.id)}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition"
                style={mainTab === tab.id
                  ? { background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff' }
                  : { color: 'rgba(255,255,255,0.4)' }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── EXPLORE TAB ── */}
        {mainTab === 'explore' && (
          <div>
            {/* Action Cards */}
            <div className="px-4 mb-4 grid grid-cols-2 gap-3">
              <button onClick={() => setShowQuiz(true)}
                className="rounded-2xl p-4 text-left transition hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(236,72,153,0.2))', border: '1px solid rgba(168,85,247,0.3)' }}>
                <Target size={24} className="text-purple-400 mb-2" />
                <p className="text-white font-bold text-sm">Career Match Quiz</p>
                <p className="text-white/50 text-xs">Find your % match</p>
              </button>
              <button onClick={() => setShowRealWomen(true)}
                className="rounded-2xl p-4 text-left transition hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.3), rgba(239,68,68,0.2))', border: '1px solid rgba(236,72,153,0.3)' }}>
                <Sparkles size={24} className="text-pink-400 mb-2" />
                <p className="text-white font-bold text-sm">Real Women</p>
                <p className="text-white/50 text-xs">5 spotlights</p>
              </button>
            </div>

            {/* Search */}
            <div className="px-4 mb-3 relative">
              <Search size={14} className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search careers..."
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            {/* Industry Filter */}
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Industry</p>
            <div className="flex gap-2 overflow-x-auto px-4 pb-1 mb-3 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                  style={activeCategory === cat
                    ? { background: 'rgba(168,85,247,0.2)', borderColor: 'rgba(168,85,247,0.5)', color: '#c084fc' }
                    : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Experience Level Filter */}
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Experience Level</p>
            <div className="flex gap-2 overflow-x-auto px-4 pb-1 mb-4 scrollbar-hide">
              {EXPERIENCE_LEVELS.map(lvl => {
                const color = EXP_COLORS[lvl] || '#a855f7';
                return (
                  <button key={lvl} onClick={() => setActiveLevel(lvl)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                    style={activeLevel === lvl
                      ? { background: `${color}25`, borderColor: color, color }
                      : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                    {lvl}
                  </button>
                );
              })}
            </div>

            {/* Results count */}
            <p className="px-4 text-xs text-gray-500 mb-3">{filtered.length} career{filtered.length !== 1 ? 's' : ''} found</p>

            {/* Career List */}
            <div className="px-4 space-y-3">
              {filtered.map(career => {
                const color = CATEGORY_COLORS[career.category] || '#a855f7';
                const expColor = EXP_COLORS[career.exp] || '#a855f7';
                return (
                  <button key={career.id} onClick={() => setSelected(career)}
                    className="w-full text-left rounded-2xl px-4 py-4 transition hover:opacity-90"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                        style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                        {career.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-xs font-semibold" style={{ color }}>{career.category}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: `${expColor}20`, color: expColor }}>{career.exp}</span>
                        </div>
                        <p className="font-bold text-sm text-white">{career.title}</p>
                        <p className="text-xs font-semibold text-emerald-400 mb-1">{career.salary}</p>
                        <p className="text-xs text-white/50 leading-relaxed">{career.desc}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-500 mt-1 flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-4xl mb-2">🔍</p>
                  <p className="text-gray-400 text-sm">No careers found</p>
                  <button onClick={() => { setActiveCategory('All'); setActiveLevel('All Levels'); setSearch(''); }}
                    className="mt-2 text-xs text-purple-400 font-semibold">Clear filters</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── JOBS TAB ── */}
        {mainTab === 'jobs' && (
          <div className="px-4">
            <p className="text-sm text-gray-400 mb-4">Track every application from Wishlist to Offer — all in one place.</p>
            <button onClick={() => navigate('/job-tracker')}
              className="w-full flex items-center gap-4 p-5 rounded-2xl mb-4 transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(236,72,153,0.15))', border: '1px solid rgba(168,85,247,0.4)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'rgba(168,85,247,0.3)' }}>💼</div>
              <div className="flex-1 text-left">
                <p className="font-bold text-white">Open My Job Tracker</p>
                <p className="text-xs text-white/50 mt-0.5">Applications, status updates, contacts</p>
              </div>
              <ChevronRight size={18} className="text-purple-400" />
            </button>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-2xl mb-1">📋</p>
                <p className="text-sm font-bold text-white">Track Status</p>
                <p className="text-xs text-white/40 mt-1">Wishlist → Offer pipeline</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-2xl mb-1">📁</p>
                <p className="text-sm font-bold text-white">Store Resumes</p>
                <p className="text-xs text-white/40 mt-1">Upload or paste per application</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-2xl mb-1">🎤</p>
                <p className="text-sm font-bold text-white">Interview Stage</p>
                <p className="text-xs text-white/40 mt-1">Track progress stages</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-2xl mb-1">📞</p>
                <p className="text-sm font-bold text-white">Contacts</p>
                <p className="text-xs text-white/40 mt-1">Save recruiter info</p>
              </div>
            </div>
            <button onClick={() => navigate('/job-tracker')}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
              Go to Job Tracker 💼
            </button>
          </div>
        )}

        {/* ── RESUME TAB ── */}
        {mainTab === 'resume' && (
          <div className="px-4">
            <p className="text-sm text-gray-400 mb-4">Build your resume section by section — save drafts and export as a text file.</p>
            <ResumeBuilder />
          </div>
        )}
      </div>

      {/* Career Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={() => setSelected(null)}>
          <div className="w-full rounded-t-3xl flex flex-col" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
              <button onClick={() => setSelected(null)} className="text-gray-400"><X size={20} /></button>
              <div className="w-5" />
            </div>
            <div className="overflow-y-auto flex-1 px-5 pb-8">
              {/* Career Header */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: `${CATEGORY_COLORS[selected.category] || '#a855f7'}25` }}>
                  {selected.emoji}
                </div>
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: CATEGORY_COLORS[selected.category] || '#a855f7' }}>{selected.category}</p>
                  <h2 className="text-xl font-bold text-white leading-tight">{selected.title}</h2>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">{selected.salary}</p>
                </div>
              </div>

              <p className="text-sm text-white/70 leading-relaxed mb-5">{selected.desc}</p>

              {/* Skills */}
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Key Skills Needed</p>
                <div className="flex flex-wrap gap-2">
                  {getSkills(selected.category).map(skill => (
                    <span key={skill} className="text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{ background: `${CATEGORY_COLORS[selected.category] || '#a855f7'}20`, color: CATEGORY_COLORS[selected.category] || '#a855f7', border: `1px solid ${CATEGORY_COLORS[selected.category] || '#a855f7'}30` }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">How to Get There</p>
                <div className="space-y-2">
                  {getSteps(selected.category).map((step, i) => (
                    <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${CATEGORY_COLORS[selected.category] || '#a855f7'}30`, color: CATEGORY_COLORS[selected.category] || '#a855f7' }}>
                        {i + 1}
                      </span>
                      <p className="text-xs text-white/70 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setShowQuiz(true)}
                className="w-full py-3.5 rounded-2xl font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
                🎯 Take the Career Match Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real Women Modal */}
      {showRealWomen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={() => setShowRealWomen(false)}>
          <div className="w-full rounded-t-3xl flex flex-col" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
              <div>
                <p className="text-xs text-pink-400 font-semibold uppercase tracking-widest">Real Women</p>
                <h2 className="text-lg font-bold text-white">5 Women Who Made It ✨</h2>
              </div>
              <button onClick={() => setShowRealWomen(false)} className="text-gray-400"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 pb-8 space-y-4">
              {REAL_WOMEN.map((woman, i) => (
                <div key={i} className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(236,72,153,0.3))' }}>
                      {woman.emoji}
                    </div>
                    <div>
                      <p className="font-bold text-white">{woman.name}</p>
                      <p className="text-xs text-gray-400">{woman.title}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold mt-1 inline-block"
                        style={{ background: `${CATEGORY_COLORS[woman.field] || '#a855f7'}20`, color: CATEGORY_COLORS[woman.field] || '#a855f7' }}>
                        {woman.field}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-white/80 italic leading-relaxed mb-2">"{woman.quote}"</p>
                  <p className="text-xs text-gray-400 leading-relaxed">✨ {woman.fact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showQuiz && (
        <CareerQuiz
          onClose={() => setShowQuiz(false)}
          onSelectCategory={(cat) => setActiveCategory(cat)}
        />
      )}

      <BottomNav active="discover" />
    </div>
  );
}