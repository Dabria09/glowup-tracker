import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Shield, Users, Flag, Trophy, ChevronLeft } from 'lucide-react';
import UserManagement from '@/components/admin/UserManagement';
import ContentModeration from '@/components/admin/ContentModeration';
import PointsRewards from '@/components/admin/PointsRewards';

const TABS = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'moderation', label: 'Moderation', icon: Flag },
  { id: 'points', label: 'Points & Rewards', icon: Trophy },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u.role !== 'admin') {
        navigate('/dashboard');
        return;
      }
      setUser(u);
      setLoading(false);
    }).catch(() => navigate('/dashboard'));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-10" style={{ backgroundColor: '#080810' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-black/40 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/dashboard')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center">
              <Shield size={16} className="text-pink-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Admin Panel</h1>
              <p className="text-[10px] text-gray-400">Girls Glowing Up</p>
            </div>
          </div>
          <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: 'rgba(236,72,153,0.2)', border: '1px solid rgba(236,72,153,0.4)', color: '#f9a8d4' }}>
            ADMIN
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-2xl p-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === tab.id ? 'bg-pink-500 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon size={13} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-4">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'moderation' && <ContentModeration />}
        {activeTab === 'points' && <PointsRewards />}
      </div>
    </div>
  );
}