import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Users, Sparkles } from 'lucide-react';

export default function MentorModeToggle() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState(() => localStorage.getItem('ggu_mentor_mode') || 'ggu');
  const [isMentor, setIsMentor] = useState(false);

  useEffect(() => {
    const checkMentorStatus = async () => {
      try {
        const user = await base44.auth.me();
        const mentors = await base44.entities.Mentor.filter({ user_email: user.email, is_approved: true });
        const teenMentors = await base44.entities.TeenMentor.filter({ user_email: user.email, is_approved: true });
        setIsMentor(mentors.length > 0 || teenMentors.length > 0);
        
        // If mentor and on dashboard, check if they should default to mentor mode
        if ((mentors.length > 0 || teenMentors.length > 0) && location.pathname === '/dashboard') {
          const savedMode = localStorage.getItem('ggu_mentor_mode');
          if (!savedMode) {
            // First time - default to mentor mode for approved mentors
            setMode('mentor');
            localStorage.setItem('ggu_mentor_mode', 'mentor');
            navigate('/mentor-dashboard', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error checking mentor status:', error);
      }
    };
    checkMentorStatus();
  }, [location.pathname, navigate]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    localStorage.setItem('ggu_mentor_mode', newMode);
    if (newMode === 'mentor') {
      navigate('/mentor-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  if (!isMentor) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-full p-1" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)' }}>
      <button
        onClick={() => handleModeChange('ggu')}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition ${mode === 'ggu' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
        style={mode === 'ggu' ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' } : {}}
      >
        <Sparkles size={14} />
        <span>GGU Mode</span>
      </button>
      <button
        onClick={() => handleModeChange('mentor')}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition ${mode === 'mentor' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
        style={mode === 'mentor' ? { background: 'linear-gradient(135deg, #06b6d4, #0891b2)' } : {}}
      >
        <Users size={14} />
        <span>Mentor Mode</span>
      </button>
    </div>
  );
}