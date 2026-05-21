import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Shield, Lock, Heart, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('signin');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthed = await base44.auth.isAuthenticated();
        if (isAuthed) {
          const me = await base44.auth.me();
          const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
          
          if (profiles.length > 0) {
            navigate('/dashboard');
          } else {
            navigate('/onboarding');
          }
          return;
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    let pollCount = 0;
    const pollInterval = setInterval(async () => {
      pollCount++;
      if (pollCount >= 12) {
        clearInterval(pollInterval);
        return;
      }
      const isAuthed = await base44.auth.isAuthenticated();
      if (isAuthed) {
        clearInterval(pollInterval);
        checkAuth();
      }
    }, 500);
    
    window.addEventListener('focus', checkAuth);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', checkAuth);
    };
  }, [navigate]);

  const handleGoogleSignIn = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0d1f' }}>
        <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#0d0d1f' }}>
      {/* Header Logo */}
      <div className="pt-8 px-4 pb-6 text-center">
        <div className="mb-4 flex justify-center">
          <div className="relative">
            <div className="text-4xl font-bold" style={{
              background: 'linear-gradient(135deg, #ff1493 0%, #ff69b4 50%, #ffb6c1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(255, 20, 147, 0.6))',
              textShadow: '0 0 30px rgba(255, 20, 147, 0.4)',
            }}>
              Girls Glowing Up
            </div>
          </div>
        </div>
        <p className="text-gray-400 text-sm">Your journey to becoming your best self starts here.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 px-4 mb-6">
        <button
          onClick={() => setActiveTab('signin')}
          className={`flex-1 py-2.5 rounded-full font-semibold text-sm transition ${
            activeTab === 'signin'
              ? 'bg-pink-500 text-white'
              : 'bg-white/10 text-gray-400 border border-white/10'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setActiveTab('signup')}
          className={`flex-1 py-2.5 rounded-full font-semibold text-sm transition ${
            activeTab === 'signup'
              ? 'bg-pink-500 text-white'
              : 'bg-white/10 text-gray-400 border border-white/10'
          }`}
        >
          Create Account
        </button>
      </div>

      <div className="px-4 space-y-4">
        {/* Sign In Tab */}
        {activeTab === 'signin' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-white font-bold text-xl mb-2">Welcome Back ✨</h2>
              <p className="text-gray-400 text-sm">Your glow up journey continues here</p>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold text-sm hover:from-pink-600 hover:to-pink-700 transition flex items-center justify-center gap-2"
            >
              <span>✨</span> Sign In with Google
            </button>

            {/* Mentor Sign In */}
            <button
              className="w-full py-3 rounded-full border border-cyan-500 text-cyan-400 font-bold text-sm hover:bg-cyan-500/10 transition flex items-center justify-center gap-2"
            >
              <span>💬</span> Mentor Sign In
            </button>

            {/* Biometric */}
            <button
              className="w-full py-3 rounded-full border border-purple-900 text-gray-300 font-bold text-sm hover:bg-white/5 transition flex items-center justify-center gap-2"
            >
              <span>👆</span> Sign In with Face / Fingerprint
            </button>

            <p className="text-gray-500 text-xs text-center">Face / fingerprint login requires setting it up in your Profile first.</p>
          </div>
        )}

        {/* Create Account Tab */}
        {activeTab === 'signup' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-white font-bold text-xl mb-2">Join Girls Glowing Up 💖</h2>
              <p className="text-gray-400 text-sm">Create your account in seconds with Google. Your sisterhood awaits.</p>
            </div>

            {/* Google Sign Up */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold text-sm hover:from-pink-600 hover:to-pink-700 transition flex items-center justify-center gap-2"
            >
              <span>✨</span> Create Account with Google
            </button>

            <div className="bg-purple-900/20 border border-purple-900/30 rounded-2xl p-4 space-y-2">
              <p className="text-white font-bold text-sm">✨ What happens next</p>
              <ol className="text-gray-300 text-xs space-y-1">
                <li>1. Sign up with Google (we never see your password)</li>
                <li>2. Pick your stage — Girl, Mom, or Sis</li>
                <li>3. Take a quick tour of your new sisterhood</li>
              </ol>
              <p className="text-xs text-gray-500 pt-2">Under 13? A parent or guardian must give consent first — we will guide you through it.</p>
            </div>

            <div className="bg-cyan-900/20 border border-cyan-600/30 rounded-xl p-3 flex gap-2">
              <span className="text-cyan-400 flex-shrink-0">💡</span>
              <p className="text-cyan-300 text-xs">For the best experience, please sign in with Google. Apple sign-in is not currently supported on this platform.</p>
            </div>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="px-4 mt-8 space-y-4">
        <h3 className="text-white font-bold text-sm">GGU Features</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl mb-1">📚</p>
            <p className="text-white font-semibold text-xs">GGU Curriculum</p>
            <p className="text-gray-400 text-xs">5 pillars of growth</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl mb-1">💬</p>
            <p className="text-white font-semibold text-xs">Daily Quotes</p>
            <p className="text-gray-400 text-xs">Inspiration every day</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl mb-1">🌸</p>
            <p className="text-white font-semibold text-xs">Cycle Tracker</p>
            <p className="text-gray-400 text-xs">Know your body</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl mb-1">⚡</p>
            <p className="text-white font-semibold text-xs">Me vs Me</p>
            <p className="text-gray-400 text-xs">Beat your best self</p>
          </div>
        </div>
      </div>

      {/* Become a Mentor */}
      <div className="px-4 mt-8 bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-900/40 rounded-2xl p-6 text-center">
        <p className="text-3xl mb-3">🌟</p>
        <h3 className="text-white font-bold text-lg mb-2">Are you a mentor or educator?</h3>
        <p className="text-gray-300 text-sm mb-4">Join our team of verified mentors and help girls glow up.</p>
        <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm hover:from-blue-600 hover:to-blue-700 transition">
          ✨ Become a Mentor
        </button>
      </div>

      {/* Trust Badges */}
      <div className="px-4 mt-8 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl mb-1">🛡️</p>
            <p className="text-white text-xs font-semibold">Background Checked</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl mb-1">🔒</p>
            <p className="text-white text-xs font-semibold">Data Protected</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl mb-1">✅</p>
            <p className="text-white text-xs font-semibold">Verified Mentors</p>
          </div>
        </div>

        {/* Safety Section */}
        <div className="bg-gradient-to-br from-orange-900/30 to-red-900/20 border border-orange-900/40 rounded-2xl p-4 mt-4">
          <div className="flex gap-3 mb-3">
            <p className="text-2xl">⚠️</p>
            <h4 className="text-orange-400 font-bold">Important Safety Disclosure</h4>
          </div>
          <p className="text-gray-300 text-xs mb-3">
            Girls Glowing Up is a platform designed exclusively for girls and verified mentors. Despite our rigorous screening process, individuals with harmful intentions may attempt to gain access to this platform.
          </p>
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex gap-2">
              <p className="text-gray-500 flex-shrink-0">🔍</p>
              <p>All mentor applications require a background check AND a live Zoom or phone interview before approval.</p>
            </div>
            <div className="flex gap-2">
              <p className="text-gray-500 flex-shrink-0">⚠️</p>
              <p>If any mentor or user makes you feel unsafe, uncomfortable, or asks for personal information — report them immediately using the flag button.</p>
            </div>
            <div className="flex gap-2">
              <p className="text-gray-500 flex-shrink-0">📍</p>
              <p>Never share your home address, school name, phone number, or meet anyone from this platform in person without a trusted adult present.</p>
            </div>
            <div className="flex gap-2">
              <p className="text-gray-500 flex-shrink-0">👨‍👩‍👧</p>
              <p>Parents: you may request a full activity review of your child account at any time by contacting our safety team.</p>
            </div>
          </div>
        </div>

        {/* Report Button */}
        <div className="bg-red-900/20 border border-red-900/40 rounded-xl p-3 text-center mt-3">
          <p className="text-red-400 font-bold text-sm mb-1">🚨 Report suspicious behavior:</p>
          <p className="text-red-300 font-semibold text-xs mb-2">safety@girlsglowingup.com</p>
          <p className="text-gray-500 text-xs">All reports are reviewed within 24 hours. Zero tolerance policy enforced.</p>
        </div>

        {/* Additional Trust */}
        <div className="bg-cyan-900/20 border border-cyan-600/30 rounded-xl p-3 mt-3">
          <p className="text-cyan-300 font-semibold text-xs mb-2">⭐ Trusted by Families</p>
          <p className="text-gray-300 text-xs">GGU is a trusted educational platform for girls empowerment and personal growth.</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3 mt-3">
          <p className="text-white font-semibold text-xs mb-2">📋 Not a Therapy Service</p>
          <p className="text-gray-400 text-xs">GGU mentors are not licensed therapists, counselors, or medical professionals. Girls Glowing Up does not diagnose, treat, or provide clinical advice. If you or someone you know is in crisis, please contact a qualified mental health professional or call 988.</p>
        </div>
      </div>

      {/* Footer Links */}
      <div className="px-4 mt-8 pb-4 space-y-2 text-center">
        <div className="flex gap-4 justify-center text-xs">
          <a href="#" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</a>
          <a href="#" className="text-cyan-400 hover:text-cyan-300">Terms of Service</a>
          <a href="#" className="text-cyan-400 hover:text-cyan-300">Parental Consent (COPPA)</a>
        </div>
        <p className="text-gray-600 text-xs">© 2025 Girls Glowing Up. All rights reserved.</p>
      </div>
    </div>
  );
}