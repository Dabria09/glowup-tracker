import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppBackground from '@/components/AppBackground';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, DollarSign, Users, TrendingUp, CheckCircle, XCircle, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const PLATFORMS = ['TikTok', 'Instagram', 'YouTube', 'Twitter/X', 'Facebook', 'Snapchat', 'Other'];

export default function AffiliatePartner() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    social_platforms: [{ platform: 'TikTok', handle: '', followers: '' }],
    total_followers: '',
    primary_platform: 'TikTok',
    promotion_plan: '',
    previous_campaigns: '',
    agrees_to_disclosure: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [existingApp, setExistingApp] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const apps = await base44.entities.AffiliateApplication.filter({ user_email: u.email });
      if (apps.length > 0) {
        setExistingApp(apps[0]);
      }
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin('/affiliate-partner'));
  }, []);

  const handleSubmit = async () => {
    if (!formData.full_name.trim()) { toast.error('Please enter your full name'); return; }
    if (formData.social_platforms.length === 0) { toast.error('Add at least one platform'); return; }
    if (!formData.total_followers || formData.total_followers < 0) { toast.error('Enter follower count'); return; }
    if (!formData.promotion_plan.trim()) { toast.error('Describe your promotion plan'); return; }
    if (!formData.agrees_to_disclosure) { toast.error('You must agree to the disclosure requirement'); return; }

    setSubmitting(true);
    try {
      const response = await base44.functions.invoke('submitAffiliateApplication', {
        full_name: formData.full_name,
        social_platforms: formData.social_platforms,
        total_followers: parseInt(formData.total_followers),
        primary_platform: formData.primary_platform,
        promotion_plan: formData.promotion_plan,
        previous_campaigns: formData.previous_campaigns,
        agrees_to_disclosure: true,
      });

      if (response.data.success) {
        toast.success('🎉 Application submitted! Review within 48 hours.');
        setExistingApp(response.data.application);
      } else {
        toast.error(response.data.error || 'Failed to submit');
      }
    } catch (error) {
      toast.error('Failed to submit application');
    }
    setSubmitting(false);
  };

  const addPlatform = () => {
    setFormData(prev => ({
      ...prev,
      social_platforms: [...prev.social_platforms, { platform: 'TikTok', handle: '', followers: '' }],
    }));
  };

  const removePlatform = (idx) => {
    setFormData(prev => ({ ...prev, social_platforms: prev.social_platforms.filter((_, i) => i !== idx) }));
  };

  const updatePlatform = (idx, field, value) => {
    const updated = [...formData.social_platforms];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData(prev => ({ ...prev, social_platforms: updated }));
  };

  const copyCode = () => {
    if (existingApp.affiliate_code) {
      navigator.clipboard.writeText(existingApp.affiliate_code);
      toast.success('Code copied!');
    }
  };

  const shareLink = () => {
    if (existingApp.affiliate_code) {
      const link = `${window.location.origin}/register?ref=${existingApp.affiliate_code}`;
      navigator.clipboard.writeText(link);
      toast.success('Link copied! Share it with your audience.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080810' }}><div className="w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" /></div>;

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
            <h1 className="text-xl font-bold flex items-center gap-2"><DollarSign size={20} className="text-green-400" /> Affiliate Partner Program</h1>
            <p className="text-xs text-gray-400">Earn money for every signup you drive</p>
          </div>
        </div>

        {/* Hero */}
        <div className="rounded-3xl p-5 mb-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.15))', border: '1px solid rgba(34,197,94,0.4)' }}>
          <div className="absolute top-0 right-0 text-[80px] opacity-10 leading-none pointer-events-none">💰</div>
          <h2 className="text-2xl font-bold text-white mb-2">Become an Affiliate Partner</h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">Share GGU with your audience and earn a flat fee for every confirmed signup. No age requirement — just a genuine following and passion for empowering girls.</p>
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1"><Users size={12} className="text-green-400" /> Unlimited earning potential</div>
            <div className="flex items-center gap-1"><TrendingUp size={12} className="text-green-400" /> Track your signups</div>
          </div>
        </div>

        {existingApp ? (
          /* Application Status */
          <div className="space-y-4">
            {existingApp.status === 'approved' ? (
              <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle size={32} className="text-green-400" />
                  <div>
                    <p className="font-bold text-white text-lg">You're Approved! 🎉</p>
                    <p className="text-xs text-gray-400">Start sharing your code now</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Your Affiliate Code</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 rounded-xl text-sm font-bold" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                        {existingApp.affiliate_code}
                      </div>
                      <button onClick={copyCode} className="px-3 py-2 rounded-xl bg-green-600 text-white text-sm font-bold">Copy</button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Your Referral Link</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', wordBreak: 'break-all' }}>
                        {window.location.origin}/register?ref={existingApp.affiliate_code}
                      </div>
                      <button onClick={shareLink} className="px-3 py-2 rounded-xl bg-green-600 text-white text-sm font-bold flex items-center gap-1"><Share2 size={14} /> Share</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p className="text-xs text-gray-400 mb-1">Signups Driven</p>
                      <p className="text-2xl font-bold text-white">{existingApp.signups_driven || 0}</p>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p className="text-xs text-gray-400 mb-1">Total Earned</p>
                      <p className="text-2xl font-bold text-green-400">${(existingApp.total_earned || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="rounded-xl p-3 mt-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-xs text-gray-400 mb-1">Commission Per Signup</p>
                    <p className="text-lg font-bold text-green-400">${existingApp.commission_rate || 0}</p>
                  </div>
                </div>
              </div>
            ) : existingApp.status === 'rejected' ? (
              <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <XCircle size={32} className="text-red-400" />
                  <div>
                    <p className="font-bold text-white text-lg">Application Not Approved</p>
                    <p className="text-xs text-gray-400">Unfortunately, your application was not approved at this time.</p>
                  </div>
                </div>
                {existingApp.rejection_reason && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-xs font-bold text-gray-400 mb-1">Reason</p>
                    <p className="text-sm text-gray-300">{existingApp.rejection_reason}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl p-5" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="font-bold text-white text-lg">Application Pending</p>
                    <p className="text-xs text-gray-400">We'll review within 48 hours</p>
                  </div>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-xs text-gray-400">Submitted: {new Date(existingApp.submitted_date).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-400 mt-1">Code (when approved): {existingApp.affiliate_code}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Application Form */
          <div className="space-y-4">
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="font-bold text-white mb-1">Affiliate Partner Application</p>
              <p className="text-sm text-gray-400">Tell us about your social presence and how you plan to promote GGU.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Full Name *</label>
              <input value={formData.full_name} onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Your full name" className="w-full rounded-xl px-4 py-3 text-sm text-white"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Social Platforms *</label>
              <div className="space-y-2">
                {formData.social_platforms.map((platform, idx) => (
                  <div key={idx} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex gap-2 mb-2">
                      <select value={platform.platform} onChange={(e) => updatePlatform(idx, 'platform', e.target.value)}
                        className="flex-1 text-sm text-white rounded-lg px-3 py-2"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                        {PLATFORMS.map(p => <option key={p} value={p} style={{ background: '#1a0a18' }}>{p}</option>)}
                      </select>
                      {formData.social_platforms.length > 1 && (
                        <button onClick={() => removePlatform(idx)} className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400"><XCircle size={16} /></button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input value={platform.handle} onChange={(e) => updatePlatform(idx, 'handle', e.target.value)}
                        placeholder="@handle" className="text-sm text-white rounded-lg px-3 py-2"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
                      <input value={platform.followers} onChange={(e) => updatePlatform(idx, 'followers', e.target.value)}
                        placeholder="Followers" type="number" className="text-sm text-white rounded-lg px-3 py-2"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addPlatform} className="mt-2 text-sm text-green-400 font-bold flex items-center gap-1">+ Add Another Platform</button>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Total Followers *</label>
              <input value={formData.total_followers} onChange={(e) => setFormData(prev => ({ ...prev, total_followers: e.target.value }))}
                placeholder="Combined total across all platforms" type="number" className="w-full rounded-xl px-4 py-3 text-sm text-white"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Primary Platform *</label>
              <select value={formData.primary_platform} onChange={(e) => setFormData(prev => ({ ...prev, primary_platform: e.target.value }))}
                className="w-full text-sm text-white rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {PLATFORMS.map(p => <option key={p} value={p} style={{ background: '#1a0a18' }}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Promotion Plan *</label>
              <textarea value={formData.promotion_plan} onChange={(e) => setFormData(prev => ({ ...prev, promotion_plan: e.target.value }))}
                placeholder="How will you promote GGU to your audience? (e.g., TikTok videos, Instagram stories, YouTube reviews)"
                rows={4} className="w-full rounded-xl px-4 py-3 text-sm text-white resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Previous Brand Partnerships (Optional)</label>
              <textarea value={formData.previous_campaigns} onChange={(e) => setFormData(prev => ({ ...prev, previous_campaigns: e.target.value }))}
                placeholder="Tell us about any previous brand campaigns you've done..."
                rows={3} className="w-full rounded-xl px-4 py-3 text-sm text-white resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div className="rounded-2xl p-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-xs font-bold text-amber-400 mb-2">⚠️ Disclosure Requirement</p>
              <p className="text-xs text-gray-300 mb-3">
                As a GGU Affiliate Partner, you <strong>must</strong> clearly disclose your paid partnership in all promotional content.
                This is required by FTC guidelines and GGU brand standards.
              </p>
              <div className="space-y-2 text-xs text-gray-400">
                <p>✅ Use <strong>#GGUPartner</strong> or <strong>#ad</strong> in social media posts</p>
                <p>✅ Include "Paid partnership with Girls Glowing Up™" in video descriptions</p>
                <p>✅ Disclose verbally at the start of video content</p>
              </div>
              <label className="flex items-start gap-3 mt-4 cursor-pointer">
                <input type="checkbox" checked={formData.agrees_to_disclosure} onChange={(e) => setFormData(prev => ({ ...prev, agrees_to_disclosure: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 rounded" />
                <span className="text-xs text-gray-300">
                  <strong>I agree to disclose my paid partnership with GGU in all promotional content</strong> using clear language like #GGUPartner, #ad, or "Paid partnership." I understand that failure to disclose may result in termination from the Affiliate Program.
                </span>
              </label>
            </div>

            <button onClick={handleSubmit} disabled={submitting}
              className="w-full py-4 rounded-2xl font-bold text-white text-sm disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              {submitting ? 'Submitting...' : 'Submit Application 💰'}
            </button>
            <p className="text-center text-xs text-gray-600">Applications reviewed within 48 hours. Commission rates set upon approval.</p>
          </div>
        )}
      </div>
      <BottomNav active="discover" />
    </div>
  );
}