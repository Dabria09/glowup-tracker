import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ShoppingBag, Check, Lock } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const STORE_ITEMS = [
  // Profile Frames
  { id: 'frame_gold', category: 'Profile Frames', name: 'Gold Queen Frame', emoji: '👑', price: 200, desc: 'A shimmering gold border for your profile picture.', preview: 'linear-gradient(135deg,#f1b610,#ffe75c,#f1b610)', profileKey: 'frame_gold' },
  { id: 'frame_pink', category: 'Profile Frames', name: 'Glow Pink Frame', emoji: '🌸', price: 150, desc: 'A soft pink glow border that radiates confidence.', preview: 'linear-gradient(135deg,#e8526d,#ff6a75,#e8526d)', profileKey: 'frame_pink' },
  { id: 'frame_rainbow', category: 'Profile Frames', name: 'Rainbow Frame', emoji: '🌈', price: 300, desc: 'All the colors of your glow in one dazzling frame.', preview: 'linear-gradient(135deg,#f1b610,#e8526d,#a855f7,#3b82f6)', profileKey: 'frame_rainbow' },
  { id: 'frame_purple', category: 'Profile Frames', name: 'Mystic Purple Frame', emoji: '💜', price: 175, desc: 'Deep purple aura for your inner mystic.', preview: 'linear-gradient(135deg,#a855f7,#7c3aed,#a855f7)', profileKey: 'frame_purple' },

  // Profile Titles
  { id: 'title_queen', category: 'Profile Titles', name: '"Glow Queen"', emoji: '✨', price: 250, desc: 'Display this iconic title on your profile.', profileKey: 'title_queen' },
  { id: 'title_champion', category: 'Profile Titles', name: '"Challenge Champion"', emoji: '🔥', price: 300, desc: 'Earned by spending — show off your grit.', profileKey: 'title_champion' },
  { id: 'title_scholar', category: 'Profile Titles', name: '"Scholar"', emoji: '📚', price: 200, desc: 'For the knowledge-hungry glow girl.', profileKey: 'title_scholar' },
  { id: 'title_wellness', category: 'Profile Titles', name: '"Wellness Warrior"', emoji: '🌿', price: 200, desc: 'Honor your commitment to your health.', profileKey: 'title_wellness' },

  // Background Themes
  { id: 'bg_midnight', category: 'App Themes', name: 'Midnight Rose', emoji: '🌹', price: 400, desc: 'Deep crimson tones for a bold, luxe look.', preview: 'radial-gradient(circle,#4a0a1a,#1a0408)', profileKey: 'bg_midnight' },
  { id: 'bg_gold_dust', category: 'App Themes', name: 'Gold Dust', emoji: '✨', price: 450, desc: 'Warm champagne and gold shimmer everywhere.', preview: 'radial-gradient(circle,#4a3000,#1a0e00)', profileKey: 'bg_gold_dust' },
  { id: 'bg_lavender', category: 'App Themes', name: 'Lavender Dream', emoji: '💜', price: 350, desc: 'Soft purple hues for a calming vibe.', preview: 'radial-gradient(circle,#2d1a4a,#0e0818)', profileKey: 'bg_lavender' },

  // Digital Badges
  { id: 'badge_vip', category: 'Special Badges', name: 'VIP Badge', emoji: '💎', price: 500, desc: 'A rare diamond badge displayed on your profile.', profileKey: 'badge_vip' },
  { id: 'badge_pioneer', category: 'Special Badges', name: 'Pioneer Badge', emoji: '🚀', price: 350, desc: 'For the early believers. Rare and respected.', profileKey: 'badge_pioneer' },
  { id: 'badge_star', category: 'Special Badges', name: 'Rising Star Badge', emoji: '⭐', price: 200, desc: 'You\'re on the rise. Let everyone know.', profileKey: 'badge_star' },
];

const CATEGORIES = ['All', 'Profile Frames', 'Profile Titles', 'App Themes', 'Special Badges'];

const PINK = '#e8526d';
const GOLD = '#f1b610';
const GOLD_LT = '#fdcd2d';
const WHITE = '#fff8f0';
const MUTED = '#c4949e';
const MUTED2 = '#8a6070';
const CARD = '#1e0d12';

export default function GlowStore() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsRecord, setPointsRecord] = useState(null);
  const [ownedItems, setOwnedItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [purchasing, setPurchasing] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const [pts, profile] = await Promise.all([
        base44.entities.UserPoints.filter({ user_email: u.email }),
        base44.entities.UserProfile.filter({ user_email: u.email }),
      ]);
      if (pts.length > 0) {
        setTotalPoints(pts[0].total_points || 0);
        setPointsRecord(pts[0]);
      }
      if (profile.length > 0) {
        try { setOwnedItems(JSON.parse(profile[0].owned_store_items || '[]')); } catch { setOwnedItems([]); }
        setOwnedItems(prev => {
          try { return JSON.parse(profile[0].owned_store_items || '[]'); } catch { return []; }
        });
      }
      setLoading(false);
    }).catch(() => navigate('/'));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePurchase = async (item) => {
    if (totalPoints < item.price) return showToast("Not enough points! Keep glowing to earn more. ✨", 'error');
    if (ownedItems.includes(item.id)) return;
    setPurchasing(item.id);
    const newTotal = totalPoints - item.price;
    const newOwned = [...ownedItems, item.id];

    // Update points
    if (pointsRecord) {
      await base44.entities.UserPoints.update(pointsRecord.id, { total_points: newTotal });
    } else {
      await base44.entities.UserPoints.create({ user_email: user.email, total_points: newTotal });
    }

    // Log in history
    await base44.entities.PointsHistory.create({
      user_email: user.email,
      action: 'store_purchase',
      label: `Purchased: ${item.name}`,
      emoji: item.emoji,
      points: -item.price,
      total_after: newTotal,
    });

    // Save to profile
    const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, { owned_store_items: JSON.stringify(newOwned) });
    } else {
      await base44.entities.UserProfile.create({ user_email: user.email, owned_store_items: JSON.stringify(newOwned) });
    }

    setTotalPoints(newTotal);
    setOwnedItems(newOwned);
    setPurchasing(null);
    showToast(`${item.emoji} "${item.name}" is now yours!`);
  };

  const filtered = activeCategory === 'All' ? STORE_ITEMS : STORE_ITEMS.filter(i => i.category === activeCategory);

  return (
    <div className="min-h-screen pb-28 text-white" style={{ background: '#0d0608' }}>
      {/* Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute rounded-full" style={{ width: 500, height: 500, background: 'radial-gradient(circle,rgba(232,82,109,0.35),transparent 70%)', top: -180, left: -120, opacity: .4, filter: 'blur(100px)' }} />
        <div className="absolute rounded-full" style={{ width: 400, height: 400, background: 'radial-gradient(circle,rgba(241,182,16,0.3),transparent 70%)', bottom: -100, right: -80, opacity: .35, filter: 'blur(100px)' }} />
      </div>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'%3E%3Cpath d='M22 34 C11 25 4 18 4 11 C4 7 7.5 3.5 12 3.5 C15.5 3.5 18.5 5.5 22 9 C25.5 5.5 28.5 3.5 32 3.5 C36.5 3.5 40 7 40 11 C40 18 33 25 22 34Z' fill='%23e8526d' opacity='0.04'/%3E%3C/svg%3E\")", backgroundSize: '44px 44px' }} />

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 z-50 rounded-2xl px-5 py-3 text-sm font-bold shadow-xl transition-all" style={{ transform: 'translateX(-50%)', background: toast.type === 'error' ? 'rgba(248,113,113,0.15)' : 'rgba(241,182,16,0.15)', border: `1px solid ${toast.type === 'error' ? 'rgba(248,113,113,0.4)' : 'rgba(241,182,16,0.4)'}`, color: toast.type === 'error' ? '#f87171' : GOLD_LT, maxWidth: 320, textAlign: 'center' }}>
          {toast.msg}
        </div>
      )}

      <div className="relative z-10 px-4 pt-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} style={{ color: GOLD }} />
              <span className="text-xs font-bold tracking-widest" style={{ color: GOLD_LT }}>GLOW STORE™</span>
            </div>
            <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 22, fontWeight: 900 }}>Spend Your Points ✨</h1>
          </div>
        </div>

        {/* Points balance */}
        <div className="flex items-center justify-between rounded-2xl px-5 py-4 mb-5" style={{ background: `linear-gradient(135deg,rgba(241,182,16,0.12),rgba(232,82,109,0.08))`, border: '1px solid rgba(241,182,16,0.3)' }}>
          <div>
            <p className="text-xs font-bold tracking-widest mb-0.5" style={{ color: MUTED2 }}>YOUR BALANCE</p>
            <p style={{ fontFamily: '"Playfair Display",serif', fontSize: 30, fontWeight: 900, background: `linear-gradient(135deg,${GOLD},${GOLD_LT})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
              {totalPoints.toLocaleString()}
            </p>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>Glow Points available</p>
          </div>
          <div style={{ fontSize: 40, filter: 'drop-shadow(0 0 12px rgba(241,182,16,0.7))' }}>🏅</div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className="flex-shrink-0 text-xs font-bold px-3 py-2 rounded-full transition-all" style={{ background: activeCategory === cat ? `linear-gradient(135deg,${PINK},#ff6a75)` : 'rgba(255,255,255,0.06)', color: activeCategory === cat ? 'white' : MUTED, border: `1px solid ${activeCategory === cat ? 'transparent' : 'rgba(255,255,255,0.1)'}`, boxShadow: activeCategory === cat ? '0 4px 12px rgba(232,82,109,0.4)' : 'none' }}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-pink-900 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {filtered.map(item => {
              const owned = ownedItems.includes(item.id);
              const canAfford = totalPoints >= item.price;
              const busy = purchasing === item.id;
              return (
                <div key={item.id} className="rounded-2xl p-4 flex flex-col relative overflow-hidden transition-all" style={{ background: owned ? `linear-gradient(135deg,rgba(241,182,16,0.12),rgba(232,82,109,0.08))` : CARD, border: `1px solid ${owned ? 'rgba(241,182,16,0.4)' : 'rgba(232,82,109,0.18)'}`, opacity: !canAfford && !owned ? 0.7 : 1 }}>
                  {owned && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(241,182,16,0.25)', border: '1px solid rgba(241,182,16,0.5)' }}>
                      <Check size={12} style={{ color: GOLD_LT }} />
                    </div>
                  )}
                  {!canAfford && !owned && (
                    <div className="absolute top-2 right-2">
                      <Lock size={12} style={{ color: MUTED2 }} />
                    </div>
                  )}

                  {/* Preview */}
                  {item.preview ? (
                    <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center text-xl" style={{ background: item.preview }}>
                      {item.emoji}
                    </div>
                  ) : (
                    <span className="text-3xl mb-3 block">{item.emoji}</span>
                  )}

                  <p className="text-xs font-bold mb-0.5" style={{ color: MUTED2 }}>{item.category}</p>
                  <p className="font-bold text-sm mb-1" style={{ color: WHITE, fontFamily: '"Sora","Poppins",sans-serif' }}>{item.name}</p>
                  <p className="text-xs mb-3 flex-1" style={{ color: MUTED, lineHeight: 1.5 }}>{item.desc}</p>

                  {owned ? (
                    <div className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold" style={{ background: 'rgba(241,182,16,0.12)', border: '1px solid rgba(241,182,16,0.3)', color: GOLD_LT }}>
                      <Check size={12} /> Owned
                    </div>
                  ) : (
                    <button onClick={() => handlePurchase(item)} disabled={!canAfford || busy} className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all" style={{ background: canAfford ? `linear-gradient(135deg,${PINK},#ff6a75)` : 'rgba(255,255,255,0.05)', color: canAfford ? 'white' : MUTED2, border: canAfford ? 'none' : '1px solid rgba(255,255,255,0.08)', cursor: canAfford ? 'pointer' : 'not-allowed', boxShadow: canAfford ? '0 4px 12px rgba(232,82,109,0.35)' : 'none' }}>
                      {busy ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>🏅</span>{item.price.toLocaleString()} pts</>}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Earn more nudge */}
        <div className="flex items-center gap-3 rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: 24 }}>💡</span>
          <div>
            <p className="text-sm font-bold" style={{ color: WHITE }}>Need more points?</p>
            <p className="text-xs" style={{ color: MUTED }}>Complete daily check-ins, challenges, and activities to earn more.</p>
          </div>
          <button onClick={() => navigate('/daily-checkin')} className="flex-shrink-0 text-xs font-bold px-3 py-2 rounded-full" style={{ background: `linear-gradient(135deg,${PINK},#ff6a75)`, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(232,82,109,0.35)' }}>
            Earn ✦
          </button>
        </div>
      </div>

      <BottomNav active="me" />
    </div>
  );
}