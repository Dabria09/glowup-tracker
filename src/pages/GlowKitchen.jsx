import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Plus, Star } from 'lucide-react';

const TABS = [
  { id: 'grocery', label: 'Grocery', emoji: '🛒' },
  { id: 'budget', label: 'Budget', emoji: '💰' },
  { id: 'cultural', label: 'Cultural', emoji: '🌍' },
  { id: 'mentoring', label: 'Mentoring', emoji: '👩‍🍳', important: true },
  { id: 'basics', label: 'Basics', emoji: '⭐' },
  { id: 'healthy', label: 'Healthy', emoji: '🥗' },
];

export default function GlowKitchen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mentoring');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => base44.auth.redirectToLogin());
  }, []);

  const activeTabData = TABS.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="text-gray-400">
            <ChevronLeft size={22} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">🍓 Glow Kitchen</h1>
            </div>
            <p className="text-xs text-gray-400">Cook, share, and grow together</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition relative ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                style={
                  isActive
                    ? tab.important
                      ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)' }
                      : { background: 'linear-gradient(135deg, #ec4899, #a855f7)' }
                    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
                {tab.important && isActive && (
                  <Star size={14} className="ml-1 fill-yellow-300 text-yellow-300" />
                )}
                {tab.important && !isActive && (
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Section */}
        {activeTab === 'mentoring' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))', border: '2px solid rgba(236,72,153,0.3)' }}>
              <div className="text-5xl mb-3">👩‍🍳</div>
              <h2 className="text-2xl font-bold text-white mb-2">Cooking Mentoring</h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Get 1-on-1 guidance from experienced cooks in our community. Learn at your own pace, ask questions, and level up your kitchen skills.
              </p>
              <div className="flex gap-3 mt-5 justify-center">
                <button className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                  <Plus size={16} /> Request a Mentor
                </button>
                <button className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white text-sm"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  🎓 Become a Mentor
                </button>
              </div>
            </div>

            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">How It Works</p>
              <div className="space-y-3">
                {[
                  { num: '1', text: 'Submit a request with your cooking topic and availability' },
                  { num: '2', text: 'We match you with an experienced mentor from our community' },
                  { num: '3', text: 'Connect for a 1-on-1 session online or in-person' },
                  { num: '4', text: 'Learn, cook, and grow your kitchen confidence!' },
                ].map((item) => (
                  <div key={item.num} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(236, 72, 153, 0.2)' }}>
                      <span className="text-xs font-bold text-pink-400">{item.num}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-0.5">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Available Mentors</p>
              <div className="text-center py-8">
                <div className="text-3xl mb-2">👨‍🍳</div>
                <p className="text-gray-400 text-sm">Mentors coming soon!</p>
                <p className="text-gray-500 text-xs mt-1">Submit a request and we'll match you with the right mentor.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'grocery' && (
          <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-gray-400">Grocery section coming soon</p>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-gray-400">Budget meals section coming soon</p>
          </div>
        )}

        {activeTab === 'cultural' && (
          <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-gray-400">Cultural recipes section coming soon</p>
          </div>
        )}

        {activeTab === 'basics' && (
          <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-gray-400">Cooking basics section coming soon</p>
          </div>
        )}

        {activeTab === 'healthy' && (
          <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-gray-400">Healthy eating section coming soon</p>
          </div>
        )}
      </div>

      <BottomNav active="discover" />
    </div>
  );
}