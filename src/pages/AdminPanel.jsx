import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, BarChart2, Users, TrendingUp, FileText, Building2, Megaphone, Shield, UserCheck, ChefHat, Video, Link2, MessageSquare, Image, Crown, Settings, Activity, Tag, AlertTriangle } from 'lucide-react';
import AppBackground from '@/components/AppBackground';

import OverviewTab from '@/components/admin/OverviewTab';
import UserManagement from '@/components/admin/UserManagement';
import EngagementTab from '@/components/admin/EngagementTab';
import ContentTab from '@/components/admin/ContentTab';
import GroupsTab from '@/components/admin/GroupsTab';
import AnnounceTab from '@/components/admin/AnnounceTab';
import ContentModeration from '@/components/admin/ContentModeration';
import MentorsAdminTab from '@/components/admin/MentorsAdminTab';
import KitchenMentorsTab from '@/components/admin/KitchenMentorsTab';
import VideoMonitorTab from '@/components/admin/VideoMonitorTab';
import MatchesTab from '@/components/admin/MatchesTab';
import SupportTab from '@/components/admin/SupportTab';
import GlowBoardAdminTab from '@/components/admin/GlowBoardAdminTab';
import TeamsAdminTab from '@/components/admin/TeamsAdminTab';
import SettingsTab from '@/components/admin/SettingsTab';
import AnalyticsTab from '@/components/admin/AnalyticsTab';
import PointsRewards from '@/components/admin/PointsRewards';
import CodesTab from '@/components/admin/CodesTab';
import FlaggedReportTab from '@/components/admin/FlaggedReportTab';
import PollsAdminTab from '@/components/admin/PollsAdminTab';
import LevelsAdminTab from '@/components/admin/LevelsAdminTab';

const TABS = [
  { id: 'overview',    label: 'Overview',         icon: BarChart2 },
  { id: 'users',       label: 'Users',             icon: Users },
  { id: 'engagement',  label: 'Engagement',        icon: TrendingUp },
  { id: 'content',     label: 'Content',           icon: FileText },
  { id: 'groups',      label: 'Groups',            icon: Building2 },
  { id: 'announce',    label: 'Announce',          icon: Megaphone },
  { id: 'moderation',  label: 'Moderation',        icon: Shield },
  { id: 'mentors',     label: 'Mentors',           icon: UserCheck },
  { id: 'kitchen',     label: 'Kitchen Mentors',   icon: ChefHat },
  { id: 'video',       label: 'Video',             icon: Video },
  { id: 'matches',     label: 'Matches',           icon: Link2 },
  { id: 'support',     label: 'Support',           icon: MessageSquare },
  { id: 'glowboard',   label: 'Glow Board',        icon: Image },
  { id: 'teams',       label: 'Teams',             icon: Crown },
  { id: 'settings',    label: 'Settings',          icon: Settings },
  { id: 'analytics',   label: 'Analytics',         icon: Activity },
  { id: 'points',      label: 'Points & Rewards',  icon: BarChart2 },
  { id: 'codes',       label: 'Join Codes',         icon: Tag },
  { id: 'flagreport',  label: 'Flag Report',        icon: AlertTriangle },
  { id: 'polls',       label: 'Daily Polls',        icon: MessageSquare },
  { id: 'levels',      label: 'Glow Levels',        icon: Crown },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u.role !== 'admin') { navigate('/dashboard'); return; }
      setUser(u);
      setLoading(false);
    }).catch(() => navigate('/dashboard'));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':   return <OverviewTab />;
      case 'users':      return <UserManagement />;
      case 'engagement': return <EngagementTab />;
      case 'content':    return <ContentTab />;
      case 'groups':     return <GroupsTab />;
      case 'announce':   return <AnnounceTab />;
      case 'moderation': return <ContentModeration />;
      case 'mentors':    return <MentorsAdminTab />;
      case 'kitchen':    return <KitchenMentorsTab />;
      case 'video':      return <VideoMonitorTab />;
      case 'matches':    return <MatchesTab />;
      case 'support':    return <SupportTab />;
      case 'glowboard':  return <GlowBoardAdminTab />;
      case 'teams':      return <TeamsAdminTab />;
      case 'settings':   return <SettingsTab />;
      case 'analytics':  return <AnalyticsTab />;
      case 'points':     return <PointsRewards />;
      case 'codes':      return <CodesTab />;
      case 'flagreport':  return <FlaggedReportTab />;
      case 'polls':      return <PollsAdminTab />;
      case 'levels':     return <LevelsAdminTab />;
      default:           return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen text-white pb-10 relative" style={{ backgroundColor: '#080810' }}>
      <AppBackground />
      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-20 backdrop-blur-md bg-black/60 border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => navigate('/dashboard')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-base font-bold leading-tight">GGU Admin Dashboard</h1>
              <p className="text-[10px] text-gray-400">Girls Glowing Up™</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
              <Crown size={16} className="text-white" />
            </div>
          </div>

          {/* Scrollable tab bar */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200 bg-white/5'}`}
                  style={isActive ? { background: 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}
                >
                  <Icon size={12} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 pt-4">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}