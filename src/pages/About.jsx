import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, Sparkles, Users } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white pb-24" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="px-4 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/discover')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h1 className="text-2xl font-bold">About GGU</h1>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="rounded-2xl p-6" style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
            <div className="flex items-center gap-3 mb-4">
              <Heart size={24} className="text-pink-500" />
              <h2 className="text-xl font-bold">Our Mission</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Girls Glowing Up (GGU) is dedicated to empowering young girls to discover their inner beauty, 
              build confidence, and glow from within. We provide a safe, supportive community where every girl 
              can thrive and become her best self.
            </p>
          </div>

          <div className="rounded-2xl p-6" style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles size={24} className="text-purple-500" />
              <h2 className="text-xl font-bold">What We Offer</h2>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>Personal development programs tailored for different age groups</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>Wellness and mental health resources</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>Career exploration and scholarship opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>A supportive community of peers and mentors</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl p-6" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
            <div className="flex items-center gap-3 mb-4">
              <Users size={24} className="text-yellow-500" />
              <h2 className="text-xl font-bold">Our Community</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Join thousands of girls worldwide who are on their glow up journey. 
              Our community is built on kindness, respect, and mutual support. 
              Here, you'll find friends, mentors, and resources to help you shine.
            </p>
          </div>
        </div>
      </div>

      <BottomNav active="discover" />
    </div>
  );
}