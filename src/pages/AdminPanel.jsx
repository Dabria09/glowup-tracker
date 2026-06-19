import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, BarChart2, Users, TrendingUp, FileText, Building2, Megaphone, Shield, UserCheck, Video, Link2, MessageSquare, Image, Crown, Settings, Activity, Tag, AlertTriangle, Trash2, ShieldAlert, Bell, Inbox, X, ChevronRight, FileWarning, Mail, UserPlus, DollarSign, Trophy } from 'lucide-react';
import AppBackground from '@/components/AppBackground';

import OverviewTab from '@/components/admin/OverviewTab';
import UserManagement from '@/components/admin/UserManagement';
import EngagementTab from '@/components/admin/EngagementTab';
import ContentTab from '@/components/admin/ContentTab';
import GroupsTab from '@/components/admin/GroupsTab';
import AnnounceTab from '@/components/admin/AnnounceTab';
import ContentModeration from '@/components/admin/ContentModeration';
import MentorsAdminTab from '@/components/admin/MentorsAdminTab';
import MentorActivityTab from '@/components/admin/MentorActivityTab';
import MessagesAdminTab from '@/components/admin/MessagesAdminTab';
import MentorInboxAdminTab from '@/components/admin/MentorInboxAdminTab';
import MentorRankSettings from '@/components/admin/MentorRankSettings';
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
import PioneerNetworkTab from '@/components/admin/PioneerNetworkTab';
import GlowPassAdminTab from '@/components/admin/GlowPassAdminTab';
import DeleteUsersTab from '@/components/admin/DeleteUsersTab';
import BannedWordsTab from '@/components/admin/BannedWordsTab';
import AffiliatesAdminTab from '@/components/admin/AffiliatesAdminTab';
import FoundingMembersAdminTab from '@/components/admin/FoundingMembersAdminTab';

const TABS = [
  { id: 'overview',    label: 'Overview',         icon: BarChart2 },
  { id: 'users',       label: 'Users',             icon: Users },
  { id: 'engagement',  label: 'Engagement',        icon: TrendingUp },
  { id: 'content',     label: 'Content',           icon: FileText },
  { id: 'groups',      label: 'Groups',            icon: Building2 },
  { id: 'announce',    label: 'Announce',          icon: Megaphone },
  { id: 'moderation',  label: 'Moderation',        icon: Shield },
  { id: 'mentors',     label: 'Mentors',           icon: UserCheck },
  { id: 'messages',    label: 'Messages',          icon: MessageSquare },
  { id: 'mentor_inbox', label: 'Mentor Inbox',     icon: Inbox },
  { id: 'mentor_ranks', label: 'Rank Settings',    icon: Crown },
  { id: 'mentor_activity', label: 'Mentor Activity', icon: TrendingUp },
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
  { id: 'pioneer',     label: 'Pioneer Network',    icon: Crown },
  { id: 'glowpasses',  label: 'Glow Passes',        icon: Tag },
  { id: 'deleteusers',  label: '🗑️ Delete Users',   icon: Trash2 },
  { id: 'bannedwords',  label: '🚫 Banned Words',   icon: ShieldAlert },
  { id: 'affiliates',  label: '💰 Affiliates',   icon: DollarSign },
  { id: 'founding',  label: '👑 Founding',   icon: Trophy },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [notificationCounts, setNotificationCounts] = useState({
    contentReports: 0,
    mentorMessages: 0,
    mentorApplications: 0,
    total: 0,
  });
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [pendingItems, setPendingItems] = useState({ reports: [], messages: [], applications: [] });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const highlightParam = params.get('highlight');
    
    if (tabParam && TABS.some(t => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
    
    const load = async () => {
      try {
        const u = await base44.auth.me();
        if (u.role !== 'admin') { navigate('/dashboard'); return; }
        setUser(u);
        
        // Count all notification sources
        const [reports, messages, applications] = await Promise.all([
          base44.entities.ContentReport.filter({ status: 'pending' }, '-created_date', 20),
          base44.entities.MentorMessage.filter({ is_admin_message: true, status: 'pending' }, '-created_date', 20),
          base44.entities.MentorApplication.filter({ status: 'pending' }, '-created_date', 20),
        ]);
        
        setNotificationCounts({
          contentReports: reports.length,
          mentorMessages: messages.length,
          mentorApplications: applications.length,
          total: reports.length + messages.length + applications.length,
        });
        setPendingItems({ reports, messages, applications });
        
        setLoading(false);
      } catch (e) {
        navigate('/dashboard');
      }
    };
    load();
  }, [navigate]);

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
      case 'messages':   return <MessagesAdminTab />;
      case 'mentor_inbox': return <MentorInboxAdminTab />;
      case 'mentor_ranks': return <MentorRankSettings />;
      case 'mentor_activity': return <MentorActivityTab />;
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
      case 'pioneer':    return <PioneerNetworkTab />;
      case 'glowpasses':   return <GlowPassAdminTab />;
      case 'deleteusers':  return <DeleteUsersTab />;
      case 'bannedwords':  return <BannedWordsTab />;
      case 'affiliates':   return <AffiliatesAdminTab />;
      case 'founding':     return <FoundingMembersAdminTab />;
      default:             return <OverviewTab />;
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
            <button onClick={() => setShowNotificationPanel(true)} className="relative w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
              <Bell size={16} className="text-white" />
              {notificationCounts.total > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#080810]">
                  {notificationCounts.total > 9 ? '9+' : notificationCounts.total}
                </span>
              )}
            </button>
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

      {/* Notification Panel Modal */}
      {showNotificationPanel && (
        <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowNotificationPanel(false)}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bell size={18} className="text-pink-400" />
                  Notifications
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{notificationCounts.total} pending items requiring attention</p>
              </div>
              <button onClick={() => setShowNotificationPanel(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4">
              {/* Content Reports */}
              {pendingItems.reports.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <FileWarning size={16} className="text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">Content Reports</p>
                      <p className="text-xs text-gray-400">{pendingItems.reports.length} flagged posts/comments</p>
                    </div>
                    <button onClick={() => { setShowNotificationPanel(false); setActiveTab('moderation'); }} className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1">
                      View All <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {pendingItems.reports.slice(0, 3).map(report => (
                      <button 
                        key={report.id} 
                        className="w-full text-left p-3 rounded-xl transition-colors hover:bg-white/5" 
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                        onClick={() => {
                          const destination = `/admin?tab=moderation&highlight=${report.id}`;
                          navigate(destination);
                          setShowNotificationPanel(false);
                          setActiveTab('moderation');
                        }}
                      >
                        <p className="text-xs text-white font-semibold capitalize">{report.content_type.replace('_', ' ')}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Reported by: {report.reported_by?.split('@')[0]}</p>
                        <p className="text-[10px] text-red-400 mt-1">Reason: {report.reason}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mentor Messages */}
              {pendingItems.messages.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}>
                      <Mail size={16} className="text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">Mentor Messages</p>
                      <p className="text-xs text-gray-400">{pendingItems.messages.length} messages from mentors</p>
                    </div>
                    <button onClick={() => { setShowNotificationPanel(false); setActiveTab('mentor_inbox'); }} className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1">
                      View All <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {pendingItems.messages.slice(0, 3).map(msg => (
                      <div key={msg.id} className="p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
                        <p className="text-xs text-white font-semibold">{msg.subject}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">From: {msg.sender_email?.split('@')[0]}</p>
                        <p className="text-[10px] text-purple-400 mt-1 capitalize">{msg.category.replace('_', ' ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mentor Applications */}
              {pendingItems.applications.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.3)' }}>
                      <UserPlus size={16} className="text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">Mentor Applications</p>
                      <p className="text-xs text-gray-400">{pendingItems.applications.length} pending approvals</p>
                    </div>
                    <button onClick={() => { setShowNotificationPanel(false); setActiveTab('mentors'); }} className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1">
                      View All <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {pendingItems.applications.slice(0, 3).map(app => (
                      <div key={app.id} className="p-3 rounded-xl" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
                        <p className="text-xs text-white font-semibold">{app.full_name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{app.user_email?.split('@')[0]}</p>
                        <p className="text-[10px] text-green-400 mt-1 capitalize">{app.mentor_track} track</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {notificationCounts.total === 0 && (
                <div className="text-center py-8">
                  <Bell size={48} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No pending notifications</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}