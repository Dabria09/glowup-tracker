import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function BanGate({ children }) {
  const [ban, setBan] = useState(null);

  useEffect(() => {
    const check = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) return;
        const user = await base44.auth.me();
        if (!user || user.role === 'admin') return;
        const bans = await base44.entities.BannedUser.filter({ user_email: user.email, is_active: true });
        if (bans.length) setBan(bans[0]);
      } catch { /* allow through on error */ }
    };
    check();
  }, []);

  if (ban) {
    const isHard = ban.ban_type === 'hard';
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-white" style={{ backgroundColor: '#080810' }}>
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="text-6xl">{isHard ? '🔴' : '🟠'}</div>
          <div>
            <h1 className="text-xl font-bold mb-2">
              {isHard ? 'Account Permanently Suspended' : 'Account Temporarily Suspended'}
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              {isHard
                ? 'Your account has been permanently banned from Girls Glowing Up™. This email address may not be used to create a new account for one year.'
                : 'Your account has been suspended from Girls Glowing Up™. You may create a new account using a different email address.'}
            </p>
          </div>
          {ban.reason && (
            <div className="p-4 rounded-2xl text-left" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-xs text-gray-400 mb-1">Reason</p>
              <p className="text-sm text-white">{ban.reason}</p>
            </div>
          )}
          {isHard && ban.email_blocked_until && (
            <p className="text-xs text-gray-500">
              Email blocked until: {new Date(ban.email_blocked_until).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
          <div className="space-y-2">
            <p className="text-xs text-gray-500">If you believe this is an error, contact:</p>
            <a href="mailto:safety@girlsglowingup.com" className="block text-sm text-pink-400 hover:text-pink-300">
              safety@girlsglowingup.com
            </a>
          </div>
          <button onClick={() => base44.auth.logout('/')} className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-400 bg-white/5">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return children;
}