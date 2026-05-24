import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bookmark, BookmarkCheck, Search } from 'lucide-react';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';

const TIPS = [
  { id: 1, category: 'Skincare', emoji: '✨', tip: 'Always double cleanse at night — first an oil cleanser, then a foam — to truly remove makeup and sunscreen.', tag: 'Evening Routine' },
  { id: 2, category: 'Skincare', emoji: '💧', tip: 'Apply your skincare from thinnest to thickest: toner, serum, moisturizer, then SPF.', tag: 'Pro Tip' },
  { id: 3, category: 'Skincare', emoji: '🌞', tip: 'SPF is the #1 anti-aging product. Wear it every single day — rain or shine, indoors or out.', tag: 'Must Know' },
  { id: 4, category: 'Skincare', emoji: '🍯', tip: 'Honey is a natural humectant. Apply raw honey as a 10-min mask for instant hydration and glow.', tag: 'DIY' },
  { id: 5, category: 'Skincare', emoji: '🧊', tip: 'Ice rolling your face in the morning reduces puffiness and gives your skin an instant glow-up.', tag: 'Morning Glow' },
  { id: 6, category: 'Skincare', emoji: '🌙', tip: 'Retinol is your nighttime bestie — it speeds up cell turnover and fades dark spots over time.', tag: 'Evening Routine' },
  { id: 7, category: 'Skincare', emoji: '💦', tip: 'Drink at least 8 glasses of water daily. Hydrated skin glows from the inside out.', tag: 'Wellness' },
  { id: 8, category: 'Skincare', emoji: '🧴', tip: 'Never sleep in your makeup. Even one night can clog pores and cause breakouts.', tag: 'Must Know' },
  { id: 9, category: 'Haircare', emoji: '💆', tip: 'Scalp massages with castor oil stimulate hair growth and improve circulation. Do it weekly!', tag: 'Growth' },
  { id: 10, category: 'Haircare', emoji: '🚿', tip: 'Always condition from mid-length to ends — not your roots — to avoid weighing hair down.', tag: 'Pro Tip' },
  { id: 11, category: 'Haircare', emoji: '🌿', tip: 'Deep condition at least once a week to restore moisture and strengthen your strands.', tag: 'Must Do' },
  { id: 12, category: 'Haircare', emoji: '🧣', tip: 'Sleep on a silk or satin pillowcase to reduce friction, breakage, and frizz overnight.', tag: 'Game Changer' },
  { id: 13, category: 'Haircare', emoji: '✂️', tip: 'Trim your ends every 8 to 12 weeks to prevent split ends from traveling up the hair shaft.', tag: 'Maintenance' },
  { id: 14, category: 'Haircare', emoji: '🍌', tip: 'A banana + honey + coconut oil mask is a powerful DIY deep conditioner for dry hair.', tag: 'DIY' },
  { id: 15, category: 'Haircare', emoji: '💎', tip: 'Protective styles are not just cute — they reduce manipulation and help retain length.', tag: 'Growth' },
  { id: 16, category: 'Nails', emoji: '💅', tip: 'Always apply a base coat before polish to prevent staining and make your manicure last longer.', tag: 'Pro Tip' },
  { id: 17, category: 'Nails', emoji: '🌸', tip: 'Cuticle oil daily is the secret to healthy, strong nails. Apply before bed every night.', tag: 'Daily Habit' },
  { id: 18, category: 'Nails', emoji: '💪', tip: 'Biotin supplements help strengthen brittle nails and support healthy nail growth over time.', tag: 'Wellness' },
  { id: 19, category: 'Nails', emoji: '🧴', tip: 'Wearing gloves while cleaning protects your nails and cuticles from harsh chemicals.', tag: 'Protection' },
  { id: 20, category: 'Nails', emoji: '✨', tip: 'Wrap your nail tips with polish to prevent chipping and get salon-lasting results at home.', tag: 'DIY' },
  { id: 21, category: 'Makeup', emoji: '🪞', tip: 'Primer is non-negotiable. It creates a smooth canvas, shrinks pores, and makes makeup last all day.', tag: 'Must Have' },
  { id: 22, category: 'Makeup', emoji: '💡', tip: 'Apply concealer in an upside-down triangle under your eyes — it lifts and brightens your whole face.', tag: 'Pro Technique' },
  { id: 23, category: 'Makeup', emoji: '🌹', tip: 'Blend blush toward your temples for a natural, sun-kissed look that never looks cakey.', tag: 'Technique' },
  { id: 24, category: 'Makeup', emoji: '✨', tip: 'Setting spray is the final step that transforms your makeup from flat to flawless. Never skip it.', tag: 'Must Know' },
  { id: 25, category: 'Makeup', emoji: '👄', tip: 'Line your lips slightly outside your natural lip line to create the illusion of fuller lips.', tag: 'Pro Tip' },
  { id: 26, category: 'Makeup', emoji: '🌟', tip: 'Highlighter belongs on the high points — brow bone, inner corner, and collarbone.', tag: 'Glow Up' },
  { id: 27, category: 'Fashion', emoji: '👗', tip: 'Invest in quality basics — white tee, black jeans, nude heels. They elevate every outfit instantly.', tag: 'Style' },
  { id: 28, category: 'Fashion', emoji: '👠', tip: 'Monochromatic outfits (one color head to toe) always look chic, expensive, and intentional.', tag: 'Style Hack' },
  { id: 29, category: 'Fashion', emoji: '👜', tip: 'Your bag and shoes do not have to match exactly — but they should complement each other.', tag: 'Pro Tip' },
  { id: 30, category: 'Fashion', emoji: '🪡', tip: 'Tailoring is the secret weapon of stylish women. Even a $20 piece looks expensive when it fits perfectly.', tag: 'Game Changer' },
  { id: 31, category: 'Fashion', emoji: '💍', tip: 'Layering dainty gold jewelry creates a luxe, effortless look that works for any occasion.', tag: 'Accessory' },
  { id: 32, category: 'Fashion', emoji: '🛍️', tip: 'Thrift stores are treasure troves. Shop secondhand for unique, affordable pieces with personality.', tag: 'Budget Tip' },
  { id: 33, category: 'Mindset', emoji: '🧠', tip: 'Your morning routine sets the tone for your entire day. Make the first 30 minutes count.', tag: 'Morning' },
  { id: 34, category: 'Mindset', emoji: '📓', tip: 'Journaling 3 things you are grateful for each night rewires your brain for positivity over time.', tag: 'Daily Habit' },
  { id: 35, category: 'Mindset', emoji: '🌙', tip: 'Protect your peace ruthlessly. Not everyone deserves access to your energy and attention.', tag: 'Boundaries' },
  { id: 36, category: 'Mindset', emoji: '💪', tip: 'Discipline gets you further than motivation. Motivation fades — systems and habits do not.', tag: 'Growth' },
  { id: 37, category: 'Mindset', emoji: '🌟', tip: 'Speak to yourself like you would speak to your best friend. Self-talk shapes self-worth.', tag: 'Self Love' },
  { id: 38, category: 'Mindset', emoji: '🦋', tip: 'Comparison is the thief of joy. Your only competition is who you were yesterday.', tag: 'Reminder' },
  { id: 39, category: 'Wellness', emoji: '🏃', tip: 'Walking 8,000 to 10,000 steps a day is one of the most underrated glow-up habits. Start today.', tag: 'Movement' },
  { id: 40, category: 'Wellness', emoji: '😴', tip: '7 to 9 hours of sleep is the best beauty treatment. Your skin repairs itself while you rest.', tag: 'Beauty Sleep' },
  { id: 41, category: 'Wellness', emoji: '🥗', tip: 'Eat the rainbow — colorful fruits and veggies are packed with antioxidants that make skin glow.', tag: 'Nutrition' },
  { id: 42, category: 'Wellness', emoji: '🧘', tip: 'Even 5 minutes of deep breathing reduces cortisol (stress hormone) that causes breakouts.', tag: 'Stress Relief' },
  { id: 43, category: 'Wellness', emoji: '💊', tip: 'Omega-3s, Vitamin C, and Zinc are the holy trinity for glowing skin and strong hair.', tag: 'Supplements' },
  { id: 44, category: 'Wellness', emoji: '🌊', tip: 'Cold showers in the morning boost circulation, tighten pores, and energize you for the day.', tag: 'Morning Glow' },
];

const CATEGORIES = ['All', 'Skincare', 'Haircare', 'Nails', 'Makeup', 'Fashion', 'Mindset', 'Wellness'];

const CAT_COLORS = {
  Skincare: '#ec4899', Haircare: '#a855f7', Nails: '#f472b6',
  Makeup: '#e879f9', Fashion: '#f59e0b', Mindset: '#3b82f6', Wellness: '#22c55e',
};

const SAVED_KEY = 'ggu_saved_glow_tips';

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); } catch { return []; }
}

export default function GlowTips() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('tips');
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(loadSaved);
  const [expanded, setExpanded] = useState(null);

  const toggleSave = (id) => {
    setSaved(prev => {
      const updated = prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id];
      localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const filtered = TIPS.filter(t => {
    const matchesCat = activeCategory === 'All' || t.category === activeCategory;
    const matchesSearch = !search || t.tip.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const matchesTab = tab === 'saved' ? saved.includes(t.id) : true;
    return matchesCat && matchesSearch && matchesTab;
  });

  const dayIndex = new Date().getDate() % TIPS.length;
  const dailyTip = TIPS[dayIndex];

  return (
    <div className="min-h-screen text-white pb-24 relative" style={{ backgroundColor: '#0a0a0f' }}>
      <AppBackground />
      <div className="relative z-10">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-10 pb-4">
          <button onClick={() => navigate('/discover')} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>✨ Glow Tips</h1>
            <p className="text-xs text-gray-400">{TIPS.length} beauty, style and mindset tips</p>
          </div>
          <div className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,215,0,0.12)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.25)' }}>
            {saved.length} Saved
          </div>
        </div>

        {/* Daily Tip Banner */}
        <div className="mx-4 mb-5 rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, rgba(123,47,190,0.4), rgba(255,31,142,0.3))', border: '1px solid rgba(255,31,142,0.25)' }}>
          <p className="text-[10px] font-bold text-pink-300 uppercase tracking-widest mb-1">✨ Today's Glow Tip</p>
          <p className="text-sm text-white/90 leading-relaxed">{dailyTip.tip}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
              style={{ background: `${CAT_COLORS[dailyTip.category] || '#a855f7'}25`, color: CAT_COLORS[dailyTip.category] || '#a855f7' }}>
              {dailyTip.category}
            </span>
            <button onClick={() => toggleSave(dailyTip.id)} className="text-pink-400">
              {saved.includes(dailyTip.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-4">
          <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { id: 'tips', label: '✨ Tips' },
              { id: 'saved', label: '🔖 Saved' },
              { id: 'all', label: '📋 All Tips' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition"
                style={tab === t.id
                  ? { background: 'linear-gradient(135deg, #7B2FBE, #FF1F8E)', color: '#fff' }
                  : { color: 'rgba(255,255,255,0.4)' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search (All Tips tab) */}
        {tab === 'all' && (
          <div className="px-4 mb-3 relative">
            <Search size={14} className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tips..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-1 mb-4 scrollbar-hide">
          {CATEGORIES.map(cat => {
            const catColor = CAT_COLORS[cat] || '#a855f7';
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                style={activeCategory === cat
                  ? { background: `${catColor}25`, borderColor: catColor, color: catColor }
                  : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                {cat}
              </button>
            );
          })}
        </div>

        {/* Tips List */}
        <div className="px-4">
          {tab === 'saved' && filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔖</p>
              <p className="text-white font-semibold mb-1">No saved tips yet</p>
              <p className="text-gray-500 text-sm">Tap the bookmark on any tip to save it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(tip => {
                const color = CAT_COLORS[tip.category] || '#a855f7';
                const isSaved = saved.includes(tip.id);
                const isExpanded = expanded === tip.id;
                return (
                  <div key={tip.id} className="rounded-2xl p-4 transition"
                    style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${isSaved ? color + '40' : 'rgba(255,255,255,0.08)'}` }}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: `${color}18`, border: `1px solid ${color}25` }}>
                        {tip.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${color}18`, color, border: `1px solid ${color}25` }}>
                            {tip.category}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">{tip.tag}</span>
                        </div>
                        <p className={`text-sm text-white/80 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>{tip.tip}</p>
                        {tip.tip.length > 90 && (
                          <button onClick={() => setExpanded(isExpanded ? null : tip.id)}
                            className="text-[11px] font-semibold mt-1" style={{ color }}>
                            {isExpanded ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>
                      <button onClick={() => toggleSave(tip.id)} className="mt-0.5 flex-shrink-0 transition"
                        style={{ color: isSaved ? color : '#4b5563' }}>
                        {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                      </button>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="text-gray-400 text-sm">No tips found</p>
                  <button onClick={() => { setSearch(''); setActiveCategory('All'); }}
                    className="mt-2 text-xs text-pink-400 font-semibold">Clear filters</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <BottomNav active="discover" />
    </div>
  );
}