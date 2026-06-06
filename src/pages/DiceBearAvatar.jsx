import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';
import DiceBearBuilder from '@/components/avatar/DiceBearBuilder';

export default function DiceBearAvatar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
      if (profiles.length) setProfile(profiles[0]);
    }).catch(() => navigate('/'));
  }, []);

  return (
    <div className="min-h-screen text-white pb-32 overflow-x-hidden"
      style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a18 40%, #0d0610 100%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-300 text-sm">
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          Avatar Builder 🎨
        </h1>
        <div className="w-16" />
      </div>

      <div className="px-4 pt-2">
        <p className="text-xs text-gray-400 text-center mb-6">Build your illustrated avatar — tap to customize each feature</p>
        <DiceBearBuilder
          profile={profile}
          user={user}
          onSaved={() => {}}
        />
      </div>

      <BottomNav active="me" />
    </div>
  );
}