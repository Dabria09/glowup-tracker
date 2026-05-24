import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Download, Share2, Trophy } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function MyCertificates() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      try {
        const certs = await base44.entities.GlowUpCertificate.filter({ user_email: u.email }).catch(() => []);
        setCertificates(certs);
      } catch (err) {
        console.error('Error fetching certificates:', err);
      }
      setLoading(false);
    }).catch(() => {
      setUser(null);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen text-white pb-28" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.05]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='55'%3E%3Ctext x='8' y='40' font-size='28' fill='%23fff'%3E%E2%99%A5%3C/text%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 px-4 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/discover')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="text-7xl">🏆</div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            My <span style={{ color: '#FFD700' }}>Certificates</span>
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed max-w-sm mx-auto">
            Your proof of transformation. Download, print, and share your achievements!
          </p>
        </div>

        {/* Certificates List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-gray-700 border-t-pink-500 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📜</div>
            <h2 className="text-xl font-bold text-white mb-2">No Certificates Yet</h2>
            <p className="text-gray-400 text-sm mb-6">Complete the Glow Up Challenges to earn your first certificate!</p>
            <button 
              onClick={() => navigate('/glow-up-challenges')}
              className="px-6 py-3 rounded-full font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #FF1F8E, #a855f7)' }}
            >
              Start Challenges
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {certificates.map((cert) => (
              <div 
                key={cert.id}
                className="rounded-2xl p-6 border"
                style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,180,0,0.05))', border: '1px solid rgba(255,215,0,0.3)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,180,0,0.1))' }}>
                      🏆
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg mb-1">Glow Crown Certificate</h3>
                      <p className="text-xs text-gray-400 mb-2">
                        {cert.total_days_completed || 0} days completed • {cert.total_points || 0} points earned
                      </p>
                      <p className="text-xs text-yellow-400">
                        Earned {new Date(cert.earned_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-white transition">
                    <Trophy size={20} />
                  </button>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-2 px-4 rounded-full font-semibold text-white flex items-center justify-center gap-2" style={{ background: 'rgba(255,215,0,0.2)' }}>
                    <Download size={16} />
                    Download
                  </button>
                  <button className="flex-1 py-2 px-4 rounded-full font-semibold text-white flex items-center justify-center gap-2" style={{ background: 'rgba(255,215,0,0.2)' }}>
                    <Share2 size={16} />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="rounded-2xl p-6 mb-8" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="font-bold text-white mb-4">How to Earn Certificates</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="text-2xl flex-shrink-0">🎯</span>
              <div>
                <p className="font-semibold text-white text-sm">Complete All 6 Glow Up Challenges</p>
                <p className="text-xs text-gray-400">Finish 180 days across all challenge categories</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl flex-shrink-0">📜</span>
              <div>
                <p className="font-semibold text-white text-sm">Receive Your Certificate</p>
                <p className="text-xs text-gray-400">Automatically earned when you complete your final challenge</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl flex-shrink-0">🌟</span>
              <div>
                <p className="font-semibold text-white text-sm">Share Your Achievement</p>
                <p className="text-xs text-gray-400">Download, print, or share your certificate with the community</p>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Progress */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="font-bold text-white mb-4">Challenge Progress</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Challenges Completed</span>
              <span className="text-sm font-bold text-yellow-400">0/6</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: '0%', background: 'linear-gradient(90deg, #FFD700, #FFA500)' }} />
            </div>
            <p className="text-xs text-gray-400 text-center">Complete all 6 challenges to earn your Glow Crown Certificate</p>
          </div>
        </div>
      </div>

      <BottomNav active="glow" />
    </div>
  );
}