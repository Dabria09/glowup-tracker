import { Link } from 'react-router-dom';
import useTranslation from '@/lib/useTranslation';
import { Home, Compass, Sparkles, Users, User } from 'lucide-react';



export default function BottomNav({ active }) {
  const { t } = useTranslation();

  const tabs = [
    { id: 'home', label: t('nav_home'), icon: Home, route: '/dashboard' },
    { id: 'discover', label: t('nav_discover'), icon: Compass, route: '/discover' },
    { id: 'glow', label: t('nav_glow'), icon: Sparkles, route: '/glow-board' },
    { id: 'connect', label: t('nav_connect'), icon: Users, route: '/connect' },
    { id: 'me', label: t('nav_me'), icon: User, route: '/me' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-2 py-2 z-50" style={{background:'rgba(8,6,20,0.82)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',borderTop:'1px solid rgba(255,255,255,0.1)',boxShadow:'0 -4px 30px rgba(0,0,0,0.4)'}} >
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