import { Link } from 'react-router-dom';
import useTranslation from '@/lib/useTranslation';
import { Home, Compass, Sparkles, Users, User } from 'lucide-react';

export default function BottomNav({ active }) {
  const { t } = useTranslation();

  const tabs = [
    { id: 'home', label: t('nav_home'), icon: Home, route: '/dashboard' },
    { id: 'discover', label: t('nav_discover'), icon: Compass, route: '/discover' },
    { id: 'glow', label: t('nav_glow'), icon: Sparkles, route: '/glow' },
    { id: 'connect', label: t('nav_connect'), icon: Users, route: '/connect' },
    { id: 'me', label: t('nav_me'), icon: User, route: '/me' },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: 'rgba(7,5,14,0.92)',
      backdropFilter: 'blur(32px)',
      WebkitBackdropFilter: 'blur(32px)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      boxShadow: '0 -1px 0 rgba(232,82,109,0.1), 0 -20px 60px rgba(0,0,0,0.6)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      <div className="flex items-center justify-around px-1 py-1.5" style={{ width: '100%' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <Link
              key={tab.id}
              to={tab.route}
              className="flex flex-col items-center gap-0.5 relative transition-all duration-200"
              style={{
                padding: '8px 16px',
                borderRadius: 16,
                minWidth: 56,
              }}
            >
              {/* Active glow blob behind icon */}
              {isActive && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 16,
                  background: 'linear-gradient(135deg, rgba(232,82,109,0.15), rgba(168,85,247,0.1))',
                  border: '1px solid rgba(232,82,109,0.2)',
                }} />
              )}
              <div className="relative" style={{
                transform: isActive ? 'translateY(-1px)' : 'none',
                transition: 'transform 0.2s ease',
              }}>
                {isActive ? (
                  <div style={{
                    background: 'linear-gradient(135deg, #e8526d, #a855f7)',
                    borderRadius: 8, padding: 1,
                    boxShadow: '0 4px 16px rgba(232,82,109,0.5)',
                  }}>
                    <Icon size={20} strokeWidth={2.5} color="white" />
                  </div>
                ) : (
                  <Icon size={20} strokeWidth={1.6} color="rgba(255,255,255,0.35)" />
                )}
              </div>
              <span style={{
                fontSize: 10,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#e8526d' : 'rgba(255,255,255,0.3)',
                letterSpacing: isActive ? '0.3px' : '0',
                transition: 'color 0.2s',
              }}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}