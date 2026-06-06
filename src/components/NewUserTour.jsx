import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { X, ChevronRight, Sparkles, Users, BookOpen, Calendar, Target, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Your Glow Journey! ✨',
    description: 'You\'re officially part of the Girls Glowing Up community. Let\'s explore what makes GGU your safe space to grow, learn, and shine.',
    emoji: '🎉',
    gradient: 'from-pink-500 via-rose-500 to-fuchsia-500',
  },
  {
    id: 'daily-checkin',
    title: 'Daily Glow Check-In',
    description: 'Start each day by checking in with yourself. Track your mood, earn points, and build self-awareness habits that last a lifetime.',
    emoji: '📅',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    action: '/daily-checkin',
    actionLabel: 'Try Check-In',
  },
  {
    id: 'dashboard',
    title: 'Your Personalized Dashboard',
    description: 'Customize your home screen with the features you use most. Drag, drop, and organize your glow journey your way.',
    emoji: '🏠',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
  },
  {
    id: 'challenges',
    title: 'Glow Up Challenges',
    description: 'Transform your life one challenge at a time. 30-day programs for confidence, wellness, career, and personal growth.',
    emoji: '⚡',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    action: '/glow-up-challenges',
    actionLabel: 'View Challenges',
  },
  {
    id: 'community',
    title: 'Find Your Tribe',
    description: 'Join communities, connect with mentors, and meet girls who share your interests. You\'re never alone on this journey.',
    emoji: '👯',
    gradient: 'from-teal-500 via-cyan-500 to-blue-500',
    action: '/community-hub',
    actionLabel: 'Explore Communities',
  },
  {
    id: 'mentorship',
    title: 'Mentorship Hub',
    description: 'Get guidance from women who\'ve walked the path. Book 1-on-1 sessions, ask anonymous questions, or become a mentor yourself.',
    emoji: '🌟',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    action: '/mentorship',
    actionLabel: 'Find a Mentor',
  },
  {
    id: 'points',
    title: 'Earn & Redeem Glow Points',
    description: 'Every action earns points — check-ins, challenges, community posts. Level up and unlock exclusive rewards in the Glow Store.',
    emoji: '🏆',
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
    action: '/glow-store',
    actionLabel: 'Visit Store',
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 💖',
    description: 'You\'re ready to start glowing. Remember: this is your safe space to be authentic, grow, and support other girls on their journey.',
    emoji: '💕',
    gradient: 'from-pink-500 via-rose-500 to-red-500',
  },
];

export default function NewUserTour({ onComplete }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showTour, setShowTour] = useState(true);

  const step = TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAction = (route) => {
    if (route) {
      navigate(route);
      handleComplete();
    }
  };

  const handleComplete = () => {
    setShowTour(false);
    if (onComplete) onComplete();
    // Mark tour as complete in user profile
    base44.auth.me().then(async (user) => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      if (profiles.length) {
        // Could add a tour_complete flag to UserProfile if needed
      }
    });
  };

  const handleSkip = () => {
    if (window.confirm('Skip the tour? You can always explore features on your own.')) {
      handleComplete();
    }
  };

  if (!showTour) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
      
      <div className="w-full max-w-lg relative">
        {/* Close button */}
        <button onClick={handleSkip} className="absolute -top-12 right-0 text-gray-400 hover:text-white transition">
          <X size={24} />
        </button>

        {/* Card */}
        <div className="rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: 'rgba(20,10,30,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
          
          {/* Gradient header */}
          <div className={`h-32 bg-gradient-to-r ${step.gradient} relative overflow-hidden`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-7xl drop-shadow-lg">{step.emoji}</span>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10" />
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Step {currentStep + 1} of {TOUR_STEPS.length}</span>
                <button onClick={handleSkip} className="text-gray-500 hover:text-gray-300">Skip tour</button>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }} />
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">{step.title}</h2>
            <p className="text-sm text-gray-300 leading-relaxed mb-6">{step.description}</p>

            {/* Action buttons */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button onClick={handleBack} variant="outline"
                  className="flex-1 h-12 bg-white/5 border-white/10 hover:bg-white/10 text-white">
                  Back
                </Button>
              )}
              
              {step.action && step.actionLabel ? (
                <Button onClick={() => handleAction(step.action)}
                  className="flex-1 h-12 font-bold text-white"
                  style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
                  variant="default">
                  {step.actionLabel}
                </Button>
              ) : (
                <Button onClick={handleNext}
                  className="flex-1 h-12 font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                  {currentStep === TOUR_STEPS.length - 1 ? "Let's Glow! ✨" : 'Next'}
                  {currentStep < TOUR_STEPS.length - 1 && <ChevronRight size={18} className="ml-1" />}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {TOUR_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === currentStep ? 'w-8 bg-pink-500' : 'bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}