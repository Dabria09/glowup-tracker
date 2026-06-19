import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ShoppingBag, Check, Lock, Sparkles, Gift, Truck, AlertCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import useAgeGroup from '@/lib/useAgeGroup';

const STORE_ITEMS = [
  // Profile Frames
  { id: 'frame_gold',    category: 'Profile Frames',  name: 'Gold Queen Frame',      emoji: '👑', price: 200, desc: 'A shimmering gold border for your profile picture.', preview: 'linear-gradient(135deg,#f1b610,#ffe75c,#f1b610)', isFrame: true, featured: true },
  { id: 'frame_pink',    category: 'Profile Frames',  name: 'Glow Pink Frame',        emoji: '🌸', price: 150, desc: 'A soft pink glow border that radiates confidence.',  preview: 'linear-gradient(135deg,#e8526d,#ff6a75,#e8526d)', isFrame: true },
  { id: 'frame_rainbow', category: 'Profile Frames',  name: 'Rainbow Frame',          emoji: '🌈', price: 300, desc: 'All the colors of your glow in one dazzling frame.', preview: 'linear-gradient(135deg,#f1b610,#e8526d,#a855f7,#3b82f6)', isFrame: true },
  { id: 'frame_purple',  category: 'Profile Frames',  name: 'Mystic Purple Frame',    emoji: '💜', price: 175, desc: 'Deep purple aura for your inner mystic.',            preview: 'linear-gradient(135deg,#a855f7,#7c3aed,#a855f7)', isFrame: true },

  // Profile Titles
  { id: 'title_queen',     category: 'Profile Titles', name: '"Glow Queen"',          emoji: '✨', price: 250, desc: 'Display this iconic title on your profile.',            titleColor: '#fbbf24' },
  { id: 'title_champion',  category: 'Profile Titles', name: '"Challenge Champion"',  emoji: '🔥', price: 300, desc: 'Earned by spending — show off your grit.',              titleColor: '#ef4444', featured: true },
  { id: 'title_scholar',   category: 'Profile Titles', name: '"Scholar"',             emoji: '📚', price: 200, desc: 'For the knowledge-hungry glow girl.',                   titleColor: '#60a5fa' },
  { id: 'title_wellness',  category: 'Profile Titles', name: '"Wellness Warrior"',    emoji: '🌿', price: 200, desc: 'Honor your commitment to your health.',                 titleColor: '#10b981' },
  { id: 'title_icon',      category: 'Profile Titles', name: '"Glow Icon"',           emoji: '🌟', price: 500, desc: 'Reserved for those who shine the brightest.',           titleColor: '#a855f7' },

  // App Themes
  { id: 'bg_midnight',   category: 'App Themes', name: 'Midnight Rose',   emoji: '🌹', price: 400, desc: 'Deep crimson tones for a bold, luxe look.',          preview: 'radial-gradient(circle,#4a0a1a,#1a0408)' },
  { id: 'bg_gold_dust',  category: 'App Themes', name: 'Gold Dust',       emoji: '✨', price: 450, desc: 'Warm champagne and gold shimmer everywhere.',         preview: 'radial-gradient(circle,#4a3000,#1a0e00)', featured: true },
  { id: 'bg_lavender',   category: 'App Themes', name: 'Lavender Dream',  emoji: '💜', price: 350, desc: 'Soft purple hues for a calming vibe.',                preview: 'radial-gradient(circle,#2d1a4a,#0e0818)' },
  { id: 'bg_ocean',      category: 'App Themes', name: 'Ocean Depths',    emoji: '🌊', price: 350, desc: 'Cool teal and navy for a refreshing aesthetic.',      preview: 'radial-gradient(circle,#0c3a4a,#050d12)' },

  // Special Badges
  { id: 'badge_vip',      category: 'Special Badges', name: 'VIP Badge',          emoji: '💎', price: 500, desc: 'A rare diamond badge displayed on your profile.',      badgeColor: '#a855f7', featured: true },
  { id: 'badge_pioneer',  category: 'Special Badges', name: 'Pioneer Badge',      emoji: '🚀', price: 350, desc: 'For the early believers. Rare and respected.',          badgeColor: '#3b82f6' },
  { id: 'badge_star',     category: 'Special Badges', name: 'Rising Star Badge',  emoji: '⭐', price: 200, desc: "You're on the rise. Let everyone know.",               badgeColor: '#f59e0b' },
  { id: 'badge_heart',    category: 'Special Badges', name: 'Heart of Gold Badge',emoji: '💛', price: 275, desc: 'Kindness is your superpower.',                         badgeColor: '#fbbf24' },
  { id: 'badge_fire',     category: 'Special Badges', name: 'Fire Badge',         emoji: '🔥', price: 400, desc: 'Unstoppable energy. Reserved for the dedicated.',      badgeColor: '#ef4444' },
];

const CATEGORIES = ['All', 'Profile Frames', 'Profile Titles', 'App Themes', 'Special Badges'];
const TABS = ['Store', 'My Collection', 'Redeem'];

const PINK = '#e8526d';
const GOLD = '#f1b610';
const GOLD_LT = '#fdcd2d';
const WHITE = '#fff8f0';
const MUTED = '#c4949e';
const MUTED2 = '#8a6070';
const CARD = '#1a0a10';

function FramePreview({ gradient, emoji }) {
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <div className="absolute inset-0 rounded-full" style={{ background: gradient, padding: 3 }}>
        <div className="w-full h-full rounded-full flex items-center justify-center text-xl" style={{ background: '#1a0a10' }}>
          {emoji}
        </div>
      </div>
    </div>
  );
}

function BadgePreview({ emoji, color }) {
  return (
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
      style={{ background: `${color}20`, border: `2px solid ${color}50`, boxShadow: `0 0 14px ${color}30` }}>
      {emoji}
    </div>
  );
}

function TitlePreview({ emoji, color, name }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}40` }}>
      <span style={{ fontSize: 18 }}>{emoji}</span>
      <span className="text-xs font-bold" style={{ color, fontFamily: '"Sora","Poppins",sans-serif' }}>{name}</span>
    </div>
  );
}

function ThemePreview({ gradient, emoji }) {
  return (
    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 overflow-hidden" style={{ background: gradient, border: '1px solid rgba(255,255,255,0.1)' }}>
      {emoji}
    </div>
  );
}

function ItemPreviewWidget({ item }) {
  if (item.isFrame) return <FramePreview gradient={item.preview} emoji={item.emoji} />;
  if (item.badgeColor) return <BadgePreview emoji={item.emoji} color={item.badgeColor} />;
  if (item.titleColor) return <TitlePreview emoji={item.emoji} color={item.titleColor} name={item.name} />;
  if (item.preview) return <ThemePreview gradient={item.preview} emoji={item.emoji} />;
  return <span style={{ fontSize: 32 }}>{item.emoji}</span>;
}

export default function GlowStore() {
  const navigate = useNavigate();
  const { ageGroup } = useAgeGroup();
  const [user, setUser] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsRecord, setPointsRecord] = useState(null);
  const [ownedItems, setOwnedItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('Store');
  const [purchasing, setPurchasing] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [equippedItems, setEquippedItems] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [redeeming, setRedeeming] = useState(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const [pts, profile, prizesData, redemptionsData] = await Promise.all([
        base44.entities.UserPoints.filter({ user_email: u.email }),
        base44.entities.UserProfile.filter({ user_email: u.email }),
        base44.entities.Prize.filter({ is_active: true }),
        base44.entities.PrizeRedemption.filter({ user_email: u.email }),
      ]);
      if (pts.length > 0) {
        setTotalPoints(pts[0].total_points || 0);
        setPointsRecord(pts[0]);
      }
      if (profile.length > 0) {
        setUserProfile(profile[0]);
        try { setOwnedItems(JSON.parse(profile[0].owned_store_items || '[]')); } catch { setOwnedItems([]); }
        try { setEquippedItems(JSON.parse(profile[0].equipped_store_items || '[]')); } catch { setEquippedItems([]); }
      }
      // Filter prizes by age group
      const filteredPrizes = prizesData.filter(p => {
        if (!p.is_active) return false;
        if (p.age_group === 'both') return true;
        if (ageGroup === 'girls' && (p.age_group === 'girls' || p.age_group === 'both')) return true;
        if (ageGroup === 'women' && (p.age_group === 'women' || p.age_group === 'both')) return true;
        return false;
      });
      setPrizes(filteredPrizes);
      setRedemptions(redemptionsData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading store data:', err);
      navigate('/');
    }
  };

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

    if (pointsRecord) {
      await base44.entities.UserPoints.update(pointsRecord.id, { total_points: newTotal });
    } else {
      const rec = await base44.entities.UserPoints.create({ user_email: user.email, total_points: newTotal });
      setPointsRecord(rec);
    }
    await base44.entities.PointsHistory.create({
      user_email: user.email, action: 'store_purchase',
      label: `Purchased: ${item.name}`, emoji: item.emoji,
      points: -item.price, total_after: newTotal,
    });
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

  const getPrizePoints = (prize) => {
    return ageGroup === 'women' ? (prize.points_cost_women || prize.points_cost_girls || 0) : (prize.points_cost_girls || 0);
  };

  const canRedeemPhysical = () => {
    // Check if user is eligible for physical rewards (paid subscriber or school code user)
    const isPaidSubscriber = userProfile?.is_paid_subscriber === true && 
      userProfile?.subscription_tier !== 'free' && 
      (!userProfile?.subscription_expires || new Date(userProfile.subscription_expires) > new Date());
    const isSchoolCodeUser = userProfile?.joined_via_code && userProfile?.school_code_verified === true;
    return isPaidSubscriber || isSchoolCodeUser;
  };

  const handleRedeemClick = (prize) => {
    const pointsNeeded = getPrizePoints(prize);
    if (totalPoints < pointsNeeded) {
      showToast("Not enough points! Keep glowing to earn more. ✨", 'error');
      return;
    }
    if (prize.stock_quantity <= 0) {
      showToast("Sorry, this prize is out of stock!", 'error');
      return;
    }
    // Check eligibility for physical rewards
    if (prize.shipping_required && !canRedeemPhysical()) {
      showToast("Physical rewards are only available for paid subscribers and school code users. ✨", 'error');
      return;
    }
    setSelectedPrize(prize);
    setShowRedeemModal(true);
  };

  const handleRedeemConfirm = async () => {
    if (!selectedPrize) return;
    setRedeeming(selectedPrize.id);
    try {
      const pointsNeeded = getPrizePoints(selectedPrize);
      const newTotal = totalPoints - pointsNeeded;
      
      // Deduct points
      if (pointsRecord) {
        await base44.entities.UserPoints.update(pointsRecord.id, { total_points: newTotal });
      } else {
        const rec = await base44.entities.UserPoints.create({ user_email: user.email, total_points: newTotal });
        setPointsRecord(rec);
      }
      
      // Record in history
      await base44.entities.PointsHistory.create({
        user_email: user.email,
        action: 'prize_redemption',
        label: `Redeemed: ${selectedPrize.name}`,
        emoji: '🎁',
        points: -pointsNeeded,
        total_after: newTotal,
      });
      
      // Create redemption request
      await base44.entities.PrizeRedemption.create({
        prize_id: selectedPrize.id,
        prize_name: selectedPrize.name,
        prize_description: selectedPrize.description,
        prize_category: selectedPrize.category,
        user_email: user.email,
        points_deducted: pointsNeeded,
        status: 'pending',
        requested_date: new Date().toISOString(),
        shipping_address: selectedPrize.shipping_required ? shippingAddress : null,
        user_world: ageGroup === 'women' ? 'Women (21+)' : 'Girls (10-20)',
        requires_parent_approval: ageGroup === 'girls' && pointsNeeded >= 1000,
      });
      
      // Update stock
      if (selectedPrize.stock_quantity < 999) {
        await base44.entities.Prize.update(selectedPrize.id, { stock_quantity: selectedPrize.stock_quantity - 1 });
      }
      
      setTotalPoints(newTotal);
      setShowRedeemModal(false);
      setSelectedPrize(null);
      setShippingAddress('');
      showToast('Redemption request submitted! Admin will review soon. 🎁');
      loadData();
    } catch (err) {
      console.error('Error redeeming prize:', err);
      showToast('Failed to redeem. Please try again.', 'error');
    }
    setRedeeming(null);
  };

  const handleEquip = async (item) => {
    const newEquipped = equippedItems.includes(item.id)
      ? equippedItems.filter(id => id !== item.id)
      : [...equippedItems.filter(id => {
          const existing = STORE_ITEMS.find(s => s.id === id);
          return existing && existing.category !== item.category;
        }), item.id];

    const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, { equipped_store_items: JSON.stringify(newEquipped) });
    }
    setEquippedItems(newEquipped);
    showToast(equippedItems.includes(item.id) ? `${item.emoji} Unequipped` : `${item.emoji} Equipped to your profile!`);
  };

  const filtered = activeCategory === 'All' ? STORE_ITEMS : STORE_ITEMS.filter(i => i.category === activeCategory);
  const collectionItems = STORE_ITEMS.filter(i => ownedItems.includes(i.id));
  const featuredItems = STORE_ITEMS.filter(i => i.featured);

  return (
    <div className="min-h-screen pb-28 text-white" style={{ background: '#0d0608' }}>
      {/* Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute rounded-full" style={{ width: 500, height: 500, background: 'radial-gradient(circle,rgba(232,82,109,0.35),transparent 70%)', top: -180, left: -120, opacity: .4, filter: 'blur(100px)' }} />
        <div className="absolute rounded-full" style={{ width: 400, height: 400, background: 'radial-gradient(circle,rgba(241,182,16,0.3),transparent 70%)', bottom: -100, right: -80, opacity: .35, filter: 'blur(100px)' }} />
      </div>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Cpath d='M22 34 C11 25 4 18 4 11 C4 7 7.5 3.5 12 3.5 C15.5 3.5 18.5 5.5 22 9 C25.5 5.5 28.5 3.5 32 3.5 C36.5 3.5 40 7 40 11 C40 18 33 25 22 34Z' fill='%23e8526d' opacity='0.04'/%3E%3C/svg%3E\")", backgroundSize: '44px 44px' }} />

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 z-50 rounded-2xl px-5 py-3 text-sm font-bold shadow-xl" style={{ transform: 'translateX(-50%)', background: toast.type === 'error' ? 'rgba(248,113,113,0.15)' : 'rgba(241,182,16,0.15)', border: `1px solid ${toast.type === 'error' ? 'rgba(248,113,113,0.4)' : 'rgba(241,182,16,0.4)'}`, color: toast.type === 'error' ? '#f87171' : GOLD_LT, maxWidth: 340, textAlign: 'center', whiteSpace: 'nowrap' }}>
          {toast.msg}
        </div>
      )}

      <div className="relative z-10 px-4 pt-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} style={{ color: GOLD }} />
              <span className="text-xs font-bold tracking-widest" style={{ color: GOLD_LT }}>GLOW STORE™</span>
            </div>
            <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 22, fontWeight: 900 }}>Spend Your Points</h1>
          </div>
        </div>

        {/* Points balance */}
        <div className="flex items-center justify-between rounded-2xl px-5 py-4 mb-5" style={{ background: 'linear-gradient(135deg,rgba(241,182,16,0.12),rgba(232,82,109,0.08))', border: '1px solid rgba(241,182,16,0.3)' }}>
          <div>
            <p className="text-xs font-bold tracking-widest mb-0.5" style={{ color: MUTED2 }}>YOUR BALANCE</p>
            <p style={{ fontFamily: '"Playfair Display",serif', fontSize: 32, fontWeight: 900, background: `linear-gradient(135deg,${GOLD},${GOLD_LT})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
              {totalPoints.toLocaleString()}
            </p>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>Glow Points available</p>
          </div>
          <div className="text-right">
            <div style={{ fontSize: 38, filter: 'drop-shadow(0 0 12px rgba(241,182,16,0.7))' }}>🏅</div>
            {collectionItems.length > 0 && (
              <p className="text-xs font-bold mt-1" style={{ color: GOLD_LT }}>{collectionItems.length} owned</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 p-1 rounded-2xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="flex-shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: activeTab === tab ? `linear-gradient(135deg,${PINK},#ff6a75)` : 'transparent', color: activeTab === tab ? 'white' : MUTED, boxShadow: activeTab === tab ? '0 4px 12px rgba(232,82,109,0.4)' : 'none' }}>
              {tab === 'Store' ? <><Sparkles size={13} /> Store</> : tab === 'My Collection' ? <><Gift size={13} /> My Collection {collectionItems.length > 0 && <span className="ml-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>{collectionItems.length}</span>}</> : <><Truck size={13} /> Redeem {redemptions.filter(r => r.status === 'pending').length > 0 && <span className="ml-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.3)', color: '#f59e0b' }}>{redemptions.filter(r => r.status === 'pending').length}</span>}</>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-pink-900 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : activeTab === 'My Collection' ? (
          /* ── MY COLLECTION TAB ── */
          collectionItems.length === 0 ? (
            <div className="text-center py-16">
              <div style={{ fontSize: 52 }}>🛍️</div>
              <p className="font-bold text-lg mt-4" style={{ color: WHITE }}>Your collection is empty</p>
              <p className="text-sm mt-2" style={{ color: MUTED }}>Head to the Store tab to spend your points on exclusive items!</p>
              <button onClick={() => setActiveTab('Store')} className="mt-5 px-6 py-3 rounded-2xl font-bold text-sm" style={{ background: `linear-gradient(135deg,${PINK},#ff6a75)`, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 6px 16px rgba(232,82,109,0.4)' }}>
                Browse Store →
              </button>
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              <p className="text-xs font-bold tracking-widest mb-3" style={{ color: MUTED2 }}>TAP AN ITEM TO EQUIP / UNEQUIP IT</p>
              {collectionItems.map(item => {
                const equipped = equippedItems.includes(item.id);
                return (
                  <div key={item.id} onClick={() => handleEquip(item)}
                    className="flex items-center gap-4 rounded-2xl p-4 cursor-pointer transition-all active:scale-[0.98]"
                    style={{ background: equipped ? `linear-gradient(135deg,rgba(241,182,16,0.12),rgba(232,82,109,0.08))` : CARD, border: `1.5px solid ${equipped ? 'rgba(241,182,16,0.45)' : 'rgba(232,82,109,0.15)'}` }}>
                    <ItemPreviewWidget item={item} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold mb-0.5" style={{ color: MUTED2 }}>{item.category}</p>
                      <p className="font-bold text-sm" style={{ color: WHITE, fontFamily: '"Sora","Poppins",sans-serif' }}>{item.name}</p>
                      <p className="text-xs truncate" style={{ color: MUTED }}>{item.desc}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {equipped ? (
                        <div className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(241,182,16,0.15)', border: '1px solid rgba(241,182,16,0.4)', color: GOLD_LT }}>
                          <Check size={11} /> On
                        </div>
                      ) : (
                        <div className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: MUTED }}>
                          Equip
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : activeTab === 'Redeem' ? (
        /* ── REDEEM TAB ── */
        <div className="space-y-4">
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: MUTED2 }}>REAL-WORLD PRIZES & REWARDS</p>
          {prizes.length === 0 ? (
            <div className="text-center py-16">
              <div style={{ fontSize: 52 }}>🎁</div>
              <p className="font-bold text-lg mt-4" style={{ color: WHITE }}>No prizes available yet</p>
              <p className="text-sm mt-2" style={{ color: MUTED }}>Check back soon for exciting rewards!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prizes.map(prize => {
                const pointsNeeded = getPrizePoints(prize);
                const canAfford = totalPoints >= pointsNeeded;
                const inStock = prize.stock_quantity > 0;
                const CategoryIcon = prize.category === 'digital' ? Sparkles : prize.category === 'gift_card' ? ShoppingBag : prize.category === 'physical' ? Truck : Gift;

                return (
                  <div key={prize.id} className="rounded-2xl p-4" style={{ background: CARD, border: `1px solid ${inStock && canAfford ? 'rgba(232,82,109,0.25)' : 'rgba(255,255,255,0.08)'}`, opacity: !inStock ? 0.6 : 1 }}>
                    <div className="flex items-start gap-3">
                      {prize.image_url ? (
                        <img src={prize.image_url} alt={prize.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <CategoryIcon size={32} className="text-gray-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-white text-sm">{prize.name}</h3>
                            {prize.retail_value && <p className="text-xs text-gray-400 mt-0.5">{prize.retail_value}</p>}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0`} style={{ background: prize.category === 'digital' ? 'rgba(59,130,246,0.2)' : prize.category === 'gift_card' ? 'rgba(16,185,129,0.2)' : prize.category === 'physical' ? 'rgba(245,158,11,0.2)' : 'rgba(236,72,153,0.2)', color: prize.category === 'digital' ? '#60a5fa' : prize.category === 'gift_card' ? '#10b981' : prize.category === 'physical' ? '#f59e0b' : '#ec4899' }}>
                            {prize.category.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{prize.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                              <span>🏅</span> {pointsNeeded.toLocaleString()} pts
                            </span>
                            {!inStock && <span className="text-[10px] text-red-400">Out of stock</span>}
                            {prize.shipping_required && <span className="text-[10px] text-gray-500">📦 Shipping</span>}
                          </div>
                          <button
                            onClick={() => handleRedeemClick(prize)}
                            disabled={!canAfford || !inStock || redeeming === prize.id}
                            className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1"
                            style={{ background: canAfford && inStock ? `linear-gradient(135deg,${PINK},#ff6a75)` : 'rgba(255,255,255,0.05)', color: canAfford && inStock ? 'white' : 'gray', cursor: canAfford && inStock ? 'pointer' : 'not-allowed' }}
                          >
                            {redeeming === prize.id ? '...' : 'Redeem'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Redemption History */}
          {redemptions.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold tracking-widest mb-3" style={{ color: MUTED2 }}>YOUR REDEMPTIONS</p>
              <div className="space-y-2">
                {redemptions.slice(0, 5).map(red => (
                  <div key={red.id} className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <p className="text-sm font-bold text-white">{red.prize_name}</p>
                      <p className="text-xs text-gray-500">{new Date(red.requested_date).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold`} style={{ background: red.status === 'pending' ? 'rgba(245,158,11,0.2)' : red.status === 'approved' ? 'rgba(16,185,129,0.2)' : red.status === 'fulfilled' ? 'rgba(139,92,246,0.2)' : 'rgba(239,68,68,0.2)', color: red.status === 'pending' ? '#f59e0b' : red.status === 'approved' ? '#10b981' : red.status === 'fulfilled' ? '#8b5cf6' : '#ef4444' }}>
                      {red.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        ) : (
        /* ── STORE TAB ── */
        <>
            {/* Featured banner */}
            {activeCategory === 'All' && (
              <div className="mb-5">
                <p className="text-xs font-bold tracking-widest mb-3" style={{ color: MUTED2 }}>⭐ FEATURED</p>
                <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                  {featuredItems.map(item => {
                    const owned = ownedItems.includes(item.id);
                    const canAfford = totalPoints >= item.price;
                    return (
                      <div key={item.id} className="flex-shrink-0 rounded-2xl p-4 w-44 relative overflow-hidden"
                        style={{ background: owned ? `linear-gradient(135deg,rgba(241,182,16,0.15),rgba(232,82,109,0.1))` : `linear-gradient(135deg,${CARD},rgba(232,82,109,0.06))`, border: `1px solid ${owned ? 'rgba(241,182,16,0.4)' : 'rgba(232,82,109,0.25)'}` }}>
                        <div className="mb-3"><ItemPreviewWidget item={item} /></div>
                        <p className="font-bold text-sm mb-1" style={{ color: WHITE }}>{item.name}</p>
                        <p className="text-[10px] mb-2" style={{ color: MUTED }}>{item.category}</p>
                        {owned ? (
                          <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full w-fit" style={{ background: 'rgba(241,182,16,0.15)', color: GOLD_LT }}>
                            <Check size={9} /> Owned
                          </div>
                        ) : (
                          <button onClick={() => handlePurchase(item)} disabled={!canAfford || purchasing === item.id}
                            className="w-full text-[11px] font-bold py-1.5 rounded-xl transition-all"
                            style={{ background: canAfford ? `linear-gradient(135deg,${PINK},#ff6a75)` : 'rgba(255,255,255,0.05)', color: canAfford ? 'white' : MUTED2, border: 'none', cursor: canAfford ? 'pointer' : 'not-allowed' }}>
                            {purchasing === item.id ? '...' : `🏅 ${item.price.toLocaleString()} pts`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className="flex-shrink-0 text-xs font-bold px-3 py-2 rounded-full transition-all"
                  style={{ background: activeCategory === cat ? `linear-gradient(135deg,${PINK},#ff6a75)` : 'rgba(255,255,255,0.06)', color: activeCategory === cat ? 'white' : MUTED, border: `1px solid ${activeCategory === cat ? 'transparent' : 'rgba(255,255,255,0.1)'}`, boxShadow: activeCategory === cat ? '0 4px 12px rgba(232,82,109,0.4)' : 'none' }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {filtered.map(item => {
                const owned = ownedItems.includes(item.id);
                const canAfford = totalPoints >= item.price;
                const busy = purchasing === item.id;
                return (
                  <div key={item.id} className="rounded-2xl p-4 flex flex-col relative overflow-hidden transition-all"
                    style={{ background: owned ? 'linear-gradient(135deg,rgba(241,182,16,0.1),rgba(232,82,109,0.06))' : CARD, border: `1px solid ${owned ? 'rgba(241,182,16,0.35)' : 'rgba(232,82,109,0.15)'}`, opacity: !canAfford && !owned ? 0.7 : 1 }}>
                    {owned && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(241,182,16,0.25)', border: '1px solid rgba(241,182,16,0.5)' }}>
                        <Check size={12} style={{ color: GOLD_LT }} />
                      </div>
                    )}
                    {!canAfford && !owned && (
                      <div className="absolute top-2.5 right-2.5">
                        <Lock size={11} style={{ color: MUTED2 }} />
                      </div>
                    )}

                    <div className="mb-3">
                      <ItemPreviewWidget item={item} />
                    </div>

                    <p className="text-[10px] font-bold mb-0.5" style={{ color: MUTED2 }}>{item.category}</p>
                    <p className="font-bold text-sm mb-1 leading-tight" style={{ color: WHITE, fontFamily: '"Sora","Poppins",sans-serif' }}>{item.name}</p>
                    <p className="text-xs mb-3 flex-1" style={{ color: MUTED, lineHeight: 1.5 }}>{item.desc}</p>

                    {owned ? (
                      <div className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold" style={{ background: 'rgba(241,182,16,0.1)', border: '1px solid rgba(241,182,16,0.3)', color: GOLD_LT }}>
                        <Check size={11} /> Owned
                      </div>
                    ) : (
                      <button onClick={() => handlePurchase(item)} disabled={!canAfford || busy}
                        className="flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold transition-all"
                        style={{ background: canAfford ? `linear-gradient(135deg,${PINK},#ff6a75)` : 'rgba(255,255,255,0.05)', color: canAfford ? 'white' : MUTED2, border: canAfford ? 'none' : '1px solid rgba(255,255,255,0.08)', cursor: canAfford ? 'pointer' : 'not-allowed', boxShadow: canAfford ? '0 4px 12px rgba(232,82,109,0.35)' : 'none' }}>
                        {busy ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>🏅</span>{item.price.toLocaleString()} pts</>}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Earn more nudge */}
            <div className="flex items-center gap-3 rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 22 }}>💡</span>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: WHITE }}>Need more points?</p>
                <p className="text-xs" style={{ color: MUTED }}>Complete daily check-ins and challenges to earn more Glow Points.</p>
              </div>
              <button onClick={() => navigate('/daily-checkin')} className="flex-shrink-0 text-xs font-bold px-3 py-2 rounded-full" style={{ background: `linear-gradient(135deg,${PINK},#ff6a75)`, color: 'white', border: 'none', cursor: 'pointer' }}>
                Earn ✦
              </button>
            </div>
          </>
        )}
      </div>

      {/* Redeem Modal */}
      {showRedeemModal && selectedPrize && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowRedeemModal(false)}>
          <div
            className="w-full rounded-t-3xl max-h-[90vh] overflow-y-auto"
            style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1a0a2e]">
              <h3 className="text-lg font-bold">Redeem Prize</h3>
              <button onClick={() => setShowRedeemModal(false)}><span className="text-2xl">×</span></button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Prize Preview */}
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-3">
                  {selectedPrize.image_url ? (
                    <img src={selectedPrize.image_url} alt={selectedPrize.name} className="w-16 h-16 rounded-xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <Gift size={32} className="text-gray-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-white">{selectedPrize.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{selectedPrize.retail_value}</p>
                  </div>
                </div>
              </div>
              
              {/* Points */}
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)' }}>
                <p className="text-xs font-bold text-gray-400 mb-1">POINTS REQUIRED</p>
                <p className="text-2xl font-bold text-yellow-400">{getPrizePoints(selectedPrize).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Your balance: {totalPoints.toLocaleString()}</p>
              </div>
              
              {/* Shipping Address */}
              {selectedPrize.shipping_required && (
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">Shipping Address *</label>
                  <textarea
                    value={shippingAddress}
                    onChange={e => setShippingAddress(e.target.value)}
                    placeholder="Enter your full shipping address..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none resize-none min-h-24"
                  />
                  <p className="text-xs text-gray-500 mt-1">We'll ship your prize to this address once approved.</p>
                </div>
              )}
              
              {/* Eligibility Notice for Physical Rewards */}
              {selectedPrize.shipping_required && (
                <div className="rounded-2xl p-4" style={{ background: canRedeemPhysical() ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${canRedeemPhysical() ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                  <div className="flex items-start gap-2">
                    {canRedeemPhysical() ? <Check size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" /> : <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />}
                    <div>
                      <p className={`text-sm font-bold ${canRedeemPhysical() ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {canRedeemPhysical() ? '✓ Eligible for Physical Rewards' : 'Physical Rewards Eligibility Required'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {canRedeemPhysical() 
                          ? 'You qualify for physical prize redemptions as a paid subscriber or school code user.' 
                          : 'Physical rewards are only available for paid subscribers and school code users. Upgrade your subscription or join with a school code to unlock.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Parental Approval Notice */}
              {ageGroup === 'girls' && getPrizePoints(selectedPrize) >= 1000 && (
                <div className="rounded-2xl p-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-amber-400">Parental Approval Required</p>
                      <p className="text-xs text-gray-400 mt-1">Since this prize is over 1000 points, a parent/guardian will need to approve before it can be sent to you.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Info */}
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs text-gray-400">
                  <strong className="text-white">Note:</strong> Your points will be deducted immediately. Admin will review your request within 48 hours. If denied, points will be refunded.
                </p>
              </div>
              
              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowRedeemModal(false)}
                  className="py-3 rounded-2xl font-bold text-white text-sm"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRedeemConfirm}
                  disabled={redeeming === selectedPrize.id || (selectedPrize.shipping_required && (!shippingAddress.trim() || !canRedeemPhysical()))}
                  className="py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
                >
                  {redeeming ? 'Processing...' : selectedPrize.shipping_required && !canRedeemPhysical() ? 'Not Eligible' : `Redeem 🎁`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <BottomNav active="me" />
    </div>
  );
}