import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, User, Bell } from "lucide-react";

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/mentor-dashboard' },
  { id: 'profile', label: 'My Profile', icon: User, path: '/mentor-dashboard?tab=Profile' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
];

export default function MentorBottomNav({ active }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bottom-nav-safe"
      style={{ background: 'rgba(13,6,8,0.97)', borderTop: '1px solid rgba(232,82,109,0.15)', backdropFilter: 'blur(20px)' }}>
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <Link key={tab.id} to={tab.path}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all flex-1"
              style={{ color: isActive ? '#e8526d' : 'rgba(255,255,255,0.35)' }}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
              {isActive && <div className="w-4 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, #e8526d, #f1b610)' }} />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}