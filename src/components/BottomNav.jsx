import { Link } from 'react-router-dom';
import { Home, Compass, Sparkles, Users, User } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', icon: Home, route: '/dashboard' },
  { id: 'discover', label: 'Discover', icon: Compass, route: '/discover' },
  { id: 'glow', label: 'Glow', icon: Sparkles, route: '/glow' },
  { id: 'connect', label: 'Connect', icon: Users, route: '/connect' },
  { id: 'me', label: 'Me', icon: User, route: '/me' },
];

export default function BottomNav({ active }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur border-t border-gray-800 flex items-center justify-around px-2 py-2 z-50">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <Link
            key={tab.id}
            to={tab.route}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${isActive ? 'text-pink-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{tab.label}</span>
            {isActive && <div className="w-1 h-1 rounded-full bg-pink-500 mt-0.5" />}
          </Link>
        );
      })}
    </div>
  );
}