import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Sparkles, ArrowRight, Star } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-white"
      style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a18 40%, #0d0610 100%)' }}>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.07]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='%23fff'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
          <Sparkles size={14} className="text-purple-400" />
          <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">Girls Glowing Up™</span>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Welcome to Girls Glowing Up
        </h1>
        
        <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
          Your all-in-one platform for growth, wellness, and community
        </p>

        <button onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #FF1F8E, #a855f7)' }}>
          Get Started <ArrowRight size={18} />
        </button>

        <div className="mt-4">
          <button onClick={() => base44.auth.isAuthenticated().then(auth => navigate(auth ? '/onboarding?mentor=true' : '/onboarding?mentor=true'))}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm text-white"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)' }}>
            <Star size={15} className="text-yellow-400" /> Become a Mentor
          </button>
        </div>
      </div>
    </div>
  );
}