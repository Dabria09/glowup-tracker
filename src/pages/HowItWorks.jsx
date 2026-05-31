import { useNavigate } from 'react-router-dom';
import { ChevronLeft, BookOpen, Award, Users, Sparkles, Target, Heart, Zap, Star, MessageCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const PINK = '#e8526d';
const GOLD = '#f1b610';
const PURPLE = '#a855f7';

const steps = [
  {
    icon: BookOpen,
    number: '01',
    title: 'Create Your Profile',
    description: 'Sign up and personalize your avatar. Tell us about yourself so we can tailor your experience to your goals and age group.',
    color: 'rgba(236, 72, 153, 0.1)',
    border: 'rgba(236, 72, 153, 0.25)',
    iconBg: 'rgba(236, 72, 153, 0.2)',
    iconColor: '#ec4899',
    accent: '#ec4899',
    link: '/onboarding',
    linkLabel: 'Start Onboarding →',
  },
  {
    icon: Target,
    number: '02',
    title: 'Choose Your Path',
    description: 'Explore 6 Glow Up Challenges, the Academy, and daily check-ins. Pick what resonates and build habits that last.',
    color: 'rgba(168, 85, 247, 0.1)',
    border: 'rgba(168, 85, 247, 0.25)',
    iconBg: 'rgba(168, 85, 247, 0.2)',
    iconColor: '#a855f7',
    accent: '#a855f7',
    link: '/glow-up-challenges',
    linkLabel: 'Browse Challenges →',
  },
  {
    icon: Users,
    number: '03',
    title: 'Connect & Grow',
    description: 'Join squads, post in the community feed, give shout-outs, and lift each other up. You are never on this journey alone.',
    color: 'rgba(251, 191, 36, 0.1)',
    border: 'rgba(251, 191, 36, 0.25)',
    iconBg: 'rgba(251, 191, 36, 0.2)',
    iconColor: '#fbbf24',
    accent: '#fbbf24',
    link: '/connect',
    linkLabel: 'Explore Community →',
  },
  {
    icon: Award,
    number: '04',
    title: 'Earn Rewards',
    description: 'Collect points, unlock badges, climb the leaderboard, and earn real certificates for completing milestones.',
    color: 'rgba(232, 82, 109, 0.1)',
    border: 'rgba(232, 82, 109, 0.25)',
    iconBg: 'rgba(232, 82, 109, 0.2)',
    iconColor: PINK,
    accent: PINK,
    link: '/glow-score',
    linkLabel: 'See Your Score →',
  },
];

const features = [
  { icon: Sparkles, label: 'Daily Check-Ins', desc: 'Build consistency and earn streak bonuses every day.' },
  { icon: Zap, label: 'Glow Up Challenges', desc: '30-day journeys across confidence, wellness, money & more.' },
  { icon: Star, label: 'Academy Lessons', desc: 'Self-development content designed for girls like you.' },
  { icon: Heart, label: 'Community Support', desc: 'Squads, shout-outs, and a feed full of good vibes.' },
  { icon: Target, label: 'Vision Board', desc: 'Map out your dreams and check back as they come true.' },
  { icon: MessageCircle, label: 'Ms. Glow AI', desc: 'Your personal coach available anytime you need her.' },
];

const faqs = [
  { q: 'Is Girls Glowing Up free?', a: 'Yes! The core experience is completely free to join and use.' },
  { q: 'What age groups is this for?', a: 'GGU welcomes Glow Girls (tweens), Glow Teens, and Glow Women — each with a tailored experience.' },
  { q: 'How do I earn points?', a: 'Complete daily check-ins, finish challenges, vote in polls, post in the community, and more. Every action counts!' },
  { q: 'Is it safe for young girls?', a: 'Safety is our #1 priority. We have content moderation, parental consent for under-13, and strict community guidelines.' },
  { q: 'Can I invite my friends?', a: 'Absolutely! Use the Glow Pass to invite friends and unlock exclusive rewards together.' },
];

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white pb-28" style={{ backgroundColor: '#0d0608' }}>
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute rounded-full" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(232,82,109,0.2), transparent 70%)', top: -150, left: -100, filter: 'blur(80px)' }} />
        <div className="absolute rounded-full" style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(168,85,247,0.15), transparent 70%)', bottom: '30%', right: -80, filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <ChevronLeft size={20} className="text-white" />
          </button>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: GOLD, textTransform: 'uppercase', margin: 0 }}>Your Glow Journey</p>
            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 26, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>
              <span style={{ color: '#ec4899' }}>How It</span>{' '}
              <span style={{ background: `linear-gradient(135deg, ${GOLD}, #ffe75c)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Works</span>
            </h1>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'rgba(196,148,158,0.8)', marginBottom: 28, lineHeight: 1.6 }}>
          Everything you need to glow up — in 4 simple steps.
        </p>

        {/* ── SECTION 1: Steps ── */}
        <div className="space-y-4 mb-10">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} style={{ borderRadius: 20, padding: '18px 16px', background: step.color, border: `1px solid ${step.border}`, position: 'relative', overflow: 'hidden' }}>
                {/* Step number watermark */}
                <div style={{ position: 'absolute', top: -10, right: 12, fontSize: 64, fontWeight: 900, color: `${step.accent}12`, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>{step.number}</div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: step.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={22} color={step.iconColor} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: step.iconColor, letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 3px' }}>Step {step.number}</p>
                    <h3 style={{ fontWeight: 800, fontSize: 16, color: '#fff8f0', margin: '0 0 6px' }}>{step.title}</h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,248,240,0.7)', lineHeight: 1.6, margin: '0 0 10px' }}>{step.description}</p>
                    <button onClick={() => navigate(step.link)} style={{ fontSize: 12, fontWeight: 700, color: step.iconColor, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      {step.linkLabel}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── SECTION 2: What's Inside ── */}
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: GOLD, margin: '0 0 12px' }}>✨ What's Inside</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
          {features.map((f, i) => {
            const FIcon = f.icon;
            return (
              <div key={i} style={{ borderRadius: 16, padding: '14px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(232,82,109,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <FIcon size={18} color={PINK} />
                </div>
                <p style={{ fontWeight: 700, fontSize: 13, color: '#fff8f0', margin: '0 0 3px' }}>{f.label}</p>
                <p style={{ fontSize: 11, color: 'rgba(196,148,158,0.8)', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* ── SECTION 3: FAQ ── */}
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: PURPLE, margin: '0 0 12px' }}>💬 FAQs</p>
        </div>
        <div className="space-y-3 mb-10">
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderRadius: 16, padding: '14px 16px', background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: '#fff8f0', margin: '0 0 5px' }}>Q: {faq.q}</p>
              <p style={{ fontSize: 12, color: 'rgba(196,148,158,0.85)', margin: 0, lineHeight: 1.6 }}>{faq.a}</p>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div style={{ borderRadius: 24, padding: '24px 20px', background: 'linear-gradient(135deg, rgba(232,82,109,0.18), rgba(168,85,247,0.12))', border: '1px solid rgba(232,82,109,0.3)', textAlign: 'center', marginBottom: 8, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${PINK}, ${PURPLE}, ${GOLD})` }} />
          <p style={{ fontSize: 28, margin: '0 0 8px' }}>✨</p>
          <h3 style={{ fontWeight: 900, fontSize: 20, color: '#fff8f0', margin: '0 0 6px', fontFamily: '"Playfair Display", serif' }}>Ready to Glow Up?</h3>
          <p style={{ fontSize: 13, color: 'rgba(196,148,158,0.85)', margin: '0 0 16px', lineHeight: 1.6 }}>Your journey starts with a single step. Join thousands of girls already glowing.</p>
          <button onClick={() => navigate('/join')} style={{ padding: '12px 28px', borderRadius: 14, background: `linear-gradient(135deg, #c44a55, ${PINK})`, color: '#fff', fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(232,82,109,0.4)' }}>
            Join Girls Glowing Up 💜
          </button>
        </div>
      </div>

      <BottomNav active="discover" />
    </div>
  );
}