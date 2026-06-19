import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Trophy, Award, Users, Crown } from 'lucide-react';

const TIERS = [
  { name: 'founding', label: 'Founding Pioneer', emoji: '👑', color: '#e8526d', range: '1-100' },
  { name: 'pioneer', label: 'Pioneer', emoji: '⚡', color: '#f1b610', range: '101-500' },
  { name: 'early_adopter', label: 'Early Adopter', emoji: '✨', color: '#a855f7', range: '501-1000' },
];

export default function FoundingMembersAdminTab() {
  const [pioneerMembers, setPioneerMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [members, allUsers] = await Promise.all([
      base44.entities.PioneerMember.list('-granted_date', 100),
      base44.entities.User.list('-created_date', 1000),
    ]);
    setPioneerMembers(members);
    setUsers(allUsers);
    setLoading(false);
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Loading...</div>;

  const stats = {
    founding: pioneerMembers.filter(p => p.tier === 'founding').length,
    pioneer: pioneerMembers.filter(p => p.tier === 'pioneer').length,
    earlyAdopter: pioneerMembers.filter(p => p.tier === 'early_adopter').length,
    total: pioneerMembers.length,
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(232,82,109,0.2)', border: '1px solid rgba(232,82,109,0.3)' }}>
          <Trophy size={20} className="text-pink-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Founding Members</h2>
          <p className="text-xs text-gray-400">Automatic Pioneer status for first 1,000 users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl p-3" style={{ background: 'rgba(232,82,109,0.1)', border: '1px solid rgba(232,82,109,0.3)' }}>
          <p className="text-xs text-pink-400 mb-1">Founding</p>
          <p className="text-xl font-bold text-white">{stats.founding}/100</p>
          <p className="text-[10px] text-gray-500">First 100</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'rgba(241,182,16,0.1)', border: '1px solid rgba(241,182,16,0.3)' }}>
          <p className="text-xs text-yellow-400 mb-1">Pioneer</p>
          <p className="text-xl font-bold text-white">{stats.pioneer}/400</p>
          <p className="text-[10px] text-gray-500">101-500</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
          <p className="text-xs text-purple-400 mb-1">Early Adopter</p>
          <p className="text-xl font-bold text-white">{stats.earlyAdopter}/500</p>
          <p className="text-[10px] text-gray-500">501-1000</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-white">Pioneer Network Progress</p>
          <p className="text-xs text-gray-400">{stats.total}/1000 members</p>
        </div>
        <div className="h-3 rounded-full bg-white/10 overflow-hidden flex">
          <div style={{ width: `${(stats.founding / 1000) * 100}%`, background: '#e8526d' }} />
          <div style={{ width: `${(stats.pioneer / 1000) * 100}%`, background: '#f1b610' }} />
          <div style={{ width: `${(stats.earlyAdopter / 1000) * 100}%`, background: '#a855f7' }} />
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#e8526d' }} />
            <span className="text-[10px] text-gray-400">Founding</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#f1b610' }} />
            <span className="text-[10px] text-gray-400">Pioneer</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#a855f7' }} />
            <span className="text-[10px] text-gray-400">Early Adopter</span>
          </div>
        </div>
      </div>

      {/* Recent Founding Members */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Award size={16} className="text-pink-400" /> Recent Founding Pioneers
        </h3>
        
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {pioneerMembers.filter(p => p.tier === 'founding').slice(0, 10).map((member) => {
            const user = users.find(u => u.email === member.user_email);
            return (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(232,82,109,0.2)', border: '1px solid rgba(232,82,109,0.3)' }}>
                  #{member.pioneer_number}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{user?.full_name || member.user_email.split('@')[0]}</p>
                  <p className="text-xs text-gray-400">{member.user_email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-pink-400 font-bold">Founding</p>
                  <p className="text-[10px] text-gray-500">{new Date(member.granted_date).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
          
          {pioneerMembers.filter(p => p.tier === 'founding').length === 0 && (
            <div className="text-center py-6 text-gray-500 text-sm">
              No Founding Pioneers yet. The first 100 users to sign up will automatically receive this status.
            </div>
          )}
        </div>
      </div>

      {/* All Pioneer Members */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Users size={16} className="text-gray-400" /> All Pioneer Members ({pioneerMembers.length})
        </h3>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {pioneerMembers.map((member) => {
            const tier = TIERS.find(t => t.name === member.tier);
            const user = users.find(u => u.email === member.user_email);
            return (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `${tier?.color}20`, border: `1px solid ${tier?.color}40` }}>
                  {tier?.emoji || '✨'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{user?.full_name || member.user_email.split('@')[0]}</p>
                  <p className="text-xs text-gray-400">{member.user_email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold" style={{ color: tier?.color }}>{tier?.label}</p>
                  <p className="text-[10px] text-gray-500">#{member.pioneer_number}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-4 rounded-2xl p-4" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <p className="text-xs font-bold text-blue-400 mb-2">ℹ️ How Founding Member Status Works</p>
        <ul className="space-y-1 text-xs text-gray-400">
          <li>• <strong>Founding Pioneer (1-100):</strong> First 100 users to complete onboarding + 1 check-in within 7 days</li>
          <li>• <strong>Pioneer (101-500):</strong> Next 400 users with same requirements</li>
          <li>• <strong>Early Adopter (501-1000):</strong> Next 500 users with same requirements</li>
          <li>• Status granted automatically via backend automation</li>
          <li>• All tiers receive permanent badge on profile</li>
        </ul>
      </div>
    </div>
  );
}