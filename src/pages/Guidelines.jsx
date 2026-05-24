import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, Heart, Users } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function Guidelines() {
  const navigate = useNavigate();

  const guidelines = [
    {
      icon: Heart,
      title: 'Be Kind',
      description: 'Treat everyone with respect and kindness. No bullying, harassment, or negative behavior will be tolerated.',
      color: 'rgba(236, 72, 153, 0.1)',
      border: 'rgba(236, 72, 153, 0.2)',
      iconColor: 'text-pink-500',
    },
    {
      icon: Shield,
      title: 'Stay Safe',
      description: 'Never share personal information like your address, phone number, or school. Keep your account secure.',
      color: 'rgba(168, 85, 247, 0.1)',
      border: 'rgba(168, 85, 247, 0.2)',
      iconColor: 'text-purple-500',
    },
    {
      icon: Users,
      title: 'Support Each Other',
      description: 'Encourage and uplift your fellow Glow Girls. We\'re all on this journey together!',
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
          <h1 className="text-2xl font-bold">Community Guidelines</h1>
        </div>

        {/* Guidelines */}
        <div className="space-y-4">
          {guidelines.map((guideline, index) => {
            const Icon = guideline.icon;
            return (
              <div
                key={index}
                className="rounded-2xl p-6 transition"
                style={{ background: guideline.color, border: `1px solid ${guideline.border}` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <Icon size={24} className={guideline.iconColor} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{guideline.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{guideline.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Rules */}
        <div className="mt-8 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="text-lg font-bold text-white mb-3">📋 Additional Rules</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• No inappropriate content or language</li>
            <li>• Respect privacy and boundaries</li>
            <li>• No spam or self-promotion</li>
            <li>• Report any concerns to a trusted adult or admin</li>
            <li>• Have fun and glow up! ✨</li>
          </ul>
        </div>

        {/* Consequences */}
        <div className="mt-6 rounded-2xl p-6" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h3 className="text-lg font-bold text-white mb-2">⚠️ Violations</h3>
          <p className="text-gray-300 text-sm">
            Breaking these guidelines may result in warnings, temporary suspension, or permanent removal from the community. 
            Our goal is to keep GGU safe and positive for everyone.
          </p>
        </div>
      </div>

      <BottomNav active="discover" />
    </div>
  );
}