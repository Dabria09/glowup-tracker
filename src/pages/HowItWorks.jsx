import { useNavigate } from 'react-router-dom';
import { ChevronLeft, BookOpen, Award, Users } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function HowItWorks() {
  const navigate = useNavigate();

  const steps = [
    {
      icon: BookOpen,
      title: '1. Create Your Profile',
      description: 'Sign up and personalize your avatar. Tell us about yourself so we can tailor your experience.',
      color: 'rgba(236, 72, 153, 0.1)',
      border: 'rgba(236, 72, 153, 0.2)',
      iconColor: 'text-pink-500',
    },
    {
      icon: Award,
      title: '2. Choose Your Path',
      description: 'Explore different pillars and challenges. Pick what resonates with you and start your journey.',
      color: 'rgba(168, 85, 247, 0.1)',
      border: 'rgba(168, 85, 247, 0.2)',
      iconColor: 'text-purple-500',
    },
    {
      icon: Users,
      title: '3. Connect & Grow',
      description: 'Join communities, participate in challenges, track your progress, and celebrate your wins!',
      color: 'rgba(251, 191, 36, 0.1)',
      border: 'rgba(251, 191, 36, 0.2)',
      iconColor: 'text-yellow-500',
    },
  ];

  return (
    <div className="min-h-screen text-white pb-24" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="px-4 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/discover')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h1 className="text-2xl font-bold">How It Works</h1>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="rounded-2xl p-6 transition"
                style={{ background: step.color, border: `1px solid ${step.border}` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <Icon size={24} className={step.iconColor} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-8 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="text-lg font-bold text-white mb-3">✨ What to Expect</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• Daily challenges to build positive habits</li>
            <li>• Weekly themes to keep you motivated</li>
            <li>• Community support from girls like you</li>
            <li>• Track your progress and earn rewards</li>
            <li>• Access to exclusive resources and content</li>
          </ul>
        </div>
      </div>

      <BottomNav active="discover" />
    </div>
  );
}