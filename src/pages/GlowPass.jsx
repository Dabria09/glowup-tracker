import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Copy, Share2, CheckCircle2, Users, Gift, Zap, Clock } from 'lucide-react';
import { toast } from 'sonner';

// Hardcoded valid pass codes — in production these would come from JoinCode entity
const VALID_PASSES = ['5H3CC4ER55', 'HPZJ686XK5', 'GLOWUP2025', 'PIONEER001', 'SISTERHOOD'];

export default function GlowPass() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myPasses, setMyPasses] = useState([]);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState(null); // null | 'valid' | 'invalid' | 'success'
  const [activeTab, setActiveTab] = useState('my_passes'); // my_passes | redeem | how_it_works

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      // Load any glow passes (join codes of type 'promo' or 'general') assigned to this user
      const codes = await base44.entities.JoinCode.filter({ created_by: u.email, is_active: true });
      setMyPasses(codes);
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin('/glow-pass'));
  }, []);

  const handleRedeemInput = (val) => {
    const v = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setRedeemCode(v);
    if (v.length < 6) { setRedeemStatus(null); return; }
    setRedeemStatus(VALID_PASSES.includes(v) ? 'valid' : 'invalid');
  };

  const handleRedeem = async () => {
    if (redeemStatus !== 'valid') return;
    // Mark the code as used
    const codes = await base44.entities.JoinCode.filter({ code: redeemCode });
    if (codes.length > 0) {
      await base44.entities.JoinCode.update(codes[0].id, {
        current_uses: (codes[0].current_uses || 0) + 1,
      });
    }
    setRedeemStatus('success');
    toast.success('🎉 Glow Pass redeemed! Welcome to the sisterhood.');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const sharePass = (code) => {
    if (navigator.share) {
      navigator.share({
        title: 'Join me on Girls Glowing Up™',
        text: `You've been invited! Use my Glow Pass™ code: ${code} to join the GGU sisterhood. ✨`,
        url: 'https://gguapp.com',
      });
    } else {
      copyToClipboard(`Join me on Girls Glowing Up™! Use my Glow Pass™ code: ${code} at gguapp.com ✨`);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-purple-900 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0d0010' }}>
      <AppBackground />
      <div className="relative z-10 px-4 pt-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">🎟️ Glow Pass™</h1>
            <p className="text-xs text-gray-400">Your invitation into the sisterhood</p>
          </div>
        </div>

        {/* Hero card */}
        <div className="rounded-3xl p-5 mb-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(232,82,109,0.25), rgba(168,85,247,0.2))', border: '1px solid rgba(232,82,109,0.4)' }}>
          <div className="absolute top-0 right-0 text-[80px] opacity-10 leading-none pointer-events-none">🎟️</div>
          <p className="text-xs font-bold tracking-widest text-pink-300 uppercase mb-1">Girls Glowing Up™</p>
          <h2 className="text-2xl font-bold text-white mb-1">Glow Pass™</h2>
          <p className="text-sm text-gray-300 leading-relaxed">Each Glow Pass is a personal invitation. If a girl believed in you enough to share hers, use it here. Each member gets exactly 2 passes to share.</p>
          <div className="flex gap-3 mt-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-yellow-300">
              <Gift size={12} /> Limited invites
            </div>
            <div className="flex items-center gap-1.5 text-xs text-pink-300">
              <Users size={12} /> Verified community
            </div>
            <div className="flex items-center gap-1.5 text-xs text-purple-300">
              <Zap size={12} /> Earn rewards for invites
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { id: 'my_passes', label: '🎟️ My Passes' },
            { id: 'redeem', label: '✨ Redeem' },
            { id: 'how_it_works', label: '❓ How It Works' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition"
              style={activeTab === tab.id
                ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* MY PASSES TAB */}
        {activeTab === 'my_passes' && (
          <div className="space-y-4">
            {/* Your 2 shareable passes */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your Shareable Glow Passes</p>
              <div className="space-y-3">
                {['GLOWUP2025', 'PIONEER001'].map((code, i) => (
                  <div key={code} className="rounded-2xl p-4"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(232,82,109,0.25)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Pass {i + 1} of 2</p>
                        <p className="font-mono font-bold text-xl tracking-widest text-white mt-0.5">{code}</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ background: 'linear-gradient(135deg, rgba(232,82,109,0.3), rgba(168,85,247,0.3))' }}>
                        🎟️
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => copyToClipboard(code)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white"
                        style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)' }}>
                        <Copy size={12} /> Copy Code
                      </button>
                      <button onClick={() => sharePass(code)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white"
                        style={{ background: 'rgba(232,82,109,0.2)', border: '1px solid rgba(232,82,109,0.4)' }}>
                        <Share2 size={12} /> Share Pass
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin-created codes for this user */}
            {myPasses.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your Other Codes</p>
                <div className="space-y-2">
                  {myPasses.map(pass => (
                    <div key={pass.id} className="flex items-center justify-between rounded-xl px-4 py-3"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div>
                        <p className="font-mono font-bold text-sm text-white">{pass.code}</p>
                        {pass.label && <p className="text-xs text-gray-400">{pass.label}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        {pass.valid_until && (
                          <span className="flex items-center gap-1 text-[10px] text-gray-500">
                            <Clock size={10} /> Expires {new Date(pass.valid_until).toLocaleDateString()}
                          </span>
                        )}
                        <button onClick={() => sharePass(pass.code)}
                          className="p-1.5 rounded-lg text-pink-400"
                          style={{ background: 'rgba(236,72,153,0.15)' }}>
                          <Share2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* REDEEM TAB */}
        {activeTab === 'redeem' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(241,182,16,0.08)', border: '1px solid rgba(241,182,16,0.25)' }}>
              <p className="font-bold text-yellow-300 mb-1">👑 Have a Glow Pass?</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">Enter the code a GGU member shared with you to unlock access and be recognized as a founding sisterhood member.</p>

              {redeemStatus === 'success' ? (
                <div className="text-center py-6">
                  <CheckCircle2 size={48} className="text-green-400 mx-auto mb-3" />
                  <p className="font-bold text-white text-lg">Pass Redeemed! 🎉</p>
                  <p className="text-sm text-gray-400 mt-1">Welcome to the GGU sisterhood. You're officially in.</p>
                </div>
              ) : (
                <>
                  <div className="relative mb-3">
                    <input
                      type="text"
                      value={redeemCode}
                      onChange={e => handleRedeemInput(e.target.value)}
                      placeholder="Enter pass code (e.g. GLOWUP2025)"
                      maxLength={12}
                      className="w-full text-center font-mono font-bold text-lg tracking-widest px-4 py-4 rounded-xl outline-none uppercase"
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: `1px solid ${redeemStatus === 'valid' ? '#f1b610' : redeemStatus === 'invalid' ? '#f87171' : 'rgba(241,182,16,0.3)'}`,
                        color: '#fff',
                      }}
                    />
                    {redeemStatus && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
                        {redeemStatus === 'valid' ? '✅' : '❌'}
                      </span>
                    )}
                  </div>
                  {redeemStatus === 'valid' && (
                    <p className="text-xs text-yellow-300 text-center mb-3">✓ Valid Glow Pass! Tap below to redeem.</p>
                  )}
                  {redeemStatus === 'invalid' && (
                    <p className="text-xs text-red-400 text-center mb-3">That code isn't recognized. Check with the girl who invited you.</p>
                  )}
                  <button
                    onClick={handleRedeem}
                    disabled={redeemStatus !== 'valid'}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white disabled:opacity-40"
                    style={{ background: redeemStatus === 'valid' ? 'linear-gradient(135deg, #e8526d, #f1b610)' : 'rgba(232,82,109,0.2)' }}>
                    Redeem Pass ✨
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* HOW IT WORKS TAB */}
        {activeTab === 'how_it_works' && (
          <div className="space-y-3">
            {[
              { icon: '👑', title: 'Each girl gets 2 passes', desc: 'Every GGU member receives exactly 2 Glow Passes™ to share with people they believe in.' },
              { icon: '❤️', title: 'Share with intention', desc: 'A Glow Pass is not just an invite — it\'s an endorsement. Share yours with a girl you genuinely believe in.' },
              { icon: '⏰', title: 'Passes expire in 30 days', desc: 'Unused passes expire 30 days after being issued to keep the community exclusive and intentional.' },
              { icon: '🎁', title: 'Earn rewards for invites', desc: 'When the girl you invited completes onboarding and her first challenge, you earn bonus Glow Points.' },
              { icon: '🔒', title: 'Verified community', desc: 'The pass system keeps the GGU community verified, intentional, and free of spam accounts.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="font-bold text-sm text-white mb-1">{item.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="discover" />
    </div>
  );
}