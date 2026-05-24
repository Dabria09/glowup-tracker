import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, MessageCircle, HelpCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function Support() {
  const navigate = useNavigate();

  const supportOptions = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get in touch via email for general inquiries',
      contact: 'support@girlsglowingup.com',
      color: 'rgba(236, 72, 153, 0.1)',
      border: 'rgba(236, 72, 153, 0.2)',
      iconColor: 'text-pink-500',
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      contact: 'Available 9 AM - 6 PM EST',
      color: 'rgba(168, 85, 247, 0.1)',
      border: 'rgba(168, 85, 247, 0.2)',
      iconColor: 'text-purple-500',
    },
    {
      icon: HelpCircle,
      title: 'FAQ',
      description: 'Find answers to common questions',
      contact: 'Browse our help center',
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
          <h1 className="text-2xl font-bold">Help {'&'} Support</h1>
        </div>

        {/* Support Options */}
        <div className="space-y-4 mb-8">
          {supportOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <div
                key={index}
                className="rounded-2xl p-6 transition cursor-pointer hover:bg-opacity-20"
                style={{ background: option.color, border: `1px solid ${option.border}` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <Icon size={24} className={option.iconColor} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{option.title}</h3>
                    <p className="text-gray-300 text-sm mb-2">{option.description}</p>
                    <p className="text-white text-sm font-medium">{option.contact}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Help */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="text-lg font-bold text-white mb-3">💡 Quick Help</h3>
          <div className="space-y-3 text-gray-300 text-sm">
            <p>
              <strong className="text-white">Account Issues:</strong> Go to Settings → Account to manage your profile, 
              privacy settings, and notification preferences.
            </p>
            <p>
              <strong className="text-white">Technical Problems:</strong> Try refreshing the page or clearing your 
              browser cache. If the issue persists, contact support.
            </p>
            <p>
              <strong className="text-white">Safety Concerns:</strong> Report any inappropriate behavior immediately 
              using the report button or contact a trusted adult.
            </p>
          </div>
        </div>

        {/* Emergency Resources */}
        <div className="mt-6 rounded-2xl p-6" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <h3 className="text-lg font-bold text-white mb-2">🆘 Emergency Resources</h3>
          <p className="text-gray-300 text-sm mb-3">
            If you're in crisis or need immediate help, please reach out to these resources:
          </p>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• National Suicide Prevention Lifeline: 988</li>
            <li>• Crisis Text Line: Text HOME to 741741</li>
            <li>• Childhelp National Child Abuse Hotline: 1-800-422-4453</li>
          </ul>
        </div>
      </div>

      <BottomNav active="discover" />
    </div>
  );
}