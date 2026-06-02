import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, Crown, Users, Star, Zap, Award, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const PIONEER_BENEFITS = [
  { emoji: '👑', title: 'Founding Member Badge', desc: 'A permanent Pioneer badge on your profile, recognizing you as a founding member of GGU.' },
  { emoji: '⚡', title: 'Early Access', desc: 'Pioneers get first access to every new feature, world, and tool before general release.' },
  { emoji: '🎁', title: 'Bonus Glow Points', desc: '2× points on all activities during your first 90 days. The earlier you join, the more you earn.' },
  { emoji: '🗣️', title: 'Direct Feedback Channel', desc: "Your voice shapes GGU's roadmap. Pioneers get access to feedback sessions with the GGU team." },
  { emoji: '🔑', title: '2 Glow Passes™ to Share', desc: 'Every Pioneer receives 2 Glow Passes to invite the girls they believe in — helping grow the sisterhood.' },
  { emoji: '🌟', title: 'Pioneer Network Directory', desc: 'Connect with other Pioneers across all three worlds: Tween, Teen, and Women\'s.' },
];

const PIONEER_TIERS = [
  { name: 'Founding Pioneer', emoji: '🌸', range: 'First 100 members', color: '#e8526d', perks: ['All Pioneer benefits', 'Exclusive Founding badge', '3× points for 90 days'] },
  { name: 'Pioneer', emoji: '⚡', range: 'Members 101–500', color: '#f1b610', perks: ['All Pioneer benefits', 'Pioneer badge', '2× points for 90 days'] },
  { name: 'Early Adopter', emoji: '✨', range: 'Members 501–1000', color: '#a855f7', perks: ['Pioneer badge', 'Early feature access'] },
];

export default function PioneerNetwork() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [isPioneer, setIsPioneer] = useState(false);
  const [applyNote, setApplyNote] = useState('');
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        // Check pioneer status via glow_era or owned_store_items
        const era = profiles[0].glow_era || '';
        setIsPioneer(era.toLowerCase().includes('pioneer'));
      }
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin('/pioneer-network'));
  }, []);

  const handleApply = async () => {
    if (!applyNote.trim()) { toast.error('Please tell us why you want to be a Pioneer.'); return; }
    // Store the pioneer application note in the user profile glow_era
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, {
        glow_era: `Pioneer Applicant: ${applyNote.trim()}`,
      });
    }
    setApplied(true);
    toast.success('🎉 Pioneer application submitted! We\'ll review it shortly.');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}>
      <div className="w-8 h-8 border-4 border-yellow-900 border-t-yellow-400 rounded-full animate-spin" />
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
            <h1 className="text-xl font-bold flex items-center gap-2"><Crown size={20} className="text-yellow-400" /> Pioneer Network™</h1>
            <p className="text-xs text-gray-400">Founding members who built GGU from the ground up</p>
          </div>
        </div>

        {/* Hero */}
        <div className="rounded-3xl p-5 mb-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(241,182,16,0.2), rgba(232,82,109,0.15))', border: '1px solid rgba(241,182,16,0.4)' }}>
          <div className="absolute top-0 right-0 text-[80px] opacity-10 leading-none pointer-events-none">👑</div>
          <p className="text-xs font-bold tracking-widest text-yellow-300 uppercase mb-1">Girls Glowing Up™</p>
          <h2 className="text-2xl font-bold text-white mb-2">Pioneer Network™</h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">Pioneers are the girls and women who showed up first — before the crowds, before the fame. They are GGU's founding sisterhood. Every world, every feature, and every community built here started with them.</p>
          {isPioneer && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(241,182,16,0.25)', border: '1px solid rgba(241,182,16,0.5)', color: '#fde047' }}>
              <Crown size={12} /> You are a Pioneer ✨
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { id: 'about', label: '👑 About' },
            { id: 'benefits', label: '🎁 Benefits' },
            { id: 'tiers', label: '🌟 Tiers' },
            { id: 'apply', label: '✍️ Apply' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition"
              style={activeTab === tab.id
                ? { background: 'linear-gradient(135deg, #f1b610, #e8526d)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="font-bold text-white mb-2">What is the Pioneer Network™?</p>
              <p className="text-sm text-gray-300 leading-relaxed">The Pioneer Network is GGU's founding membership — the first 1,000 users who joined and helped shape the platform. Pioneers exist across all three worlds: Tween World, Teen World, and Women's World. Together, they are the heartbeat of the sisterhood.</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="font-bold text-white mb-2">Why it matters</p>
              <p className="text-sm text-gray-300 leading-relaxed">GGU was built for girls and women, by people who believe in them. Pioneer members are the proof of concept — the ones who said "yes" before anyone else did. Their feedback, activity, and presence set the standard for every user who comes after them.</p>
            </div>
            {[
              { icon: Users, label: 'Cross-World Community', desc: 'Pioneers from Tween, Teen, and Women\'s worlds are all part of the same founding network.' },
              { icon: Star, label: 'Permanent Recognition', desc: 'Pioneer status is permanent. No matter how large GGU grows, Pioneers are always the founding generation.' },
              { icon: Zap, label: 'Shape the Platform', desc: 'Pioneers directly influence which features are built, prioritized, and improved.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex gap-3 rounded-2xl p-4"
                  style={{ background: 'rgba(241,182,16,0.06)', border: '1px solid rgba(241,182,16,0.15)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(241,182,16,0.2)' }}>
                    <Icon size={18} className="text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white mb-0.5">{item.label}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* BENEFITS TAB */}
        {activeTab === 'benefits' && (
          <div className="space-y-3">
            {PIONEER_BENEFITS.map((b, i) => (
              <div key={i} className="flex gap-4 rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-2xl flex-shrink-0">{b.emoji}</span>
                <div>
                  <p className="font-bold text-sm text-white mb-1">{b.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TIERS TAB */}
        {activeTab === 'tiers' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 mb-2">Pioneer tiers are assigned based on when you joined. The earlier you joined, the higher your tier — forever.</p>
            {PIONEER_TIERS.map((tier, i) => (
              <div key={i} className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${tier.color}40` }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{tier.emoji}</span>
                  <div>
                    <p className="font-bold text-base text-white">{tier.name}</p>
                    <p className="text-xs" style={{ color: tier.color }}>{tier.range}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {tier.perks.map((perk, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-gray-300">
                      <span style={{ color: tier.color }}>✓</span> {perk}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* APPLY TAB */}
        {activeTab === 'apply' && (
          <div className="space-y-4">
            {isPioneer ? (
              <div className="rounded-2xl p-5 text-center"
                style={{ background: 'rgba(241,182,16,0.1)', border: '1px solid rgba(241,182,16,0.3)' }}>
                <Crown size={40} className="text-yellow-400 mx-auto mb-3" />
                <p className="font-bold text-white text-lg mb-1">You're already a Pioneer! 👑</p>
                <p className="text-sm text-gray-400">Your Pioneer status is confirmed and permanent. Thank you for being here from the beginning.</p>
              </div>
            ) : applied ? (
              <div className="rounded-2xl p-5 text-center"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <Award size={40} className="text-green-400 mx-auto mb-3" />
                <p className="font-bold text-white text-lg mb-1">Application Submitted! 🎉</p>
                <p className="text-sm text-gray-400">We'll review your application and notify you within 48 hours. Welcome to the process, future Pioneer.</p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="font-bold text-white mb-1">Apply for Pioneer Status</p>
                  <p className="text-sm text-gray-400 leading-relaxed">Pioneer status is reviewed by the GGU admin team. Tell us why you want to be a Pioneer and what you bring to the sisterhood.</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Why do you want to be a Pioneer? *</label>
                  <textarea
                    value={applyNote}
                    onChange={e => setApplyNote(e.target.value)}
                    placeholder="Tell us what GGU means to you and what you'll bring to the Pioneer Network..."
                    rows={5}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none resize-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
                <button
                  onClick={handleApply}
                  disabled={!applyNote.trim()}
                  className="w-full py-4 rounded-2xl font-bold text-white text-sm disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #f1b610, #e8526d)' }}>
                  Submit Pioneer Application 👑
                </button>
                <p className="text-center text-xs text-gray-600">Applications are reviewed within 48 hours by the GGU admin team.</p>
              </>
            )}
          </div>
        )}
      </div>

      <BottomNav active="discover" />
    </div>
  );
}