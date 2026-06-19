import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, DollarSign, Users, TrendingUp, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const PLATFORM_ICONS = {
  TikTok: '🎵', Instagram: '📸', YouTube: '📺', 'Twitter/X': '🐦', Facebook: '📘', Snapchat: '👻', Other: '🌐'
};

export default function AffiliatesAdminTab() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [selectedApp, setSelectedApp] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [commissionRate, setCommissionRate] = useState(2.00);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    let apps;
    if (filter === 'all') {
      apps = await base44.entities.AffiliateApplication.list('-submitted_date', 100);
    } else {
      apps = await base44.entities.AffiliateApplication.filter({ status: filter }, '-submitted_date', 100);
    }
    setApplications(apps);
    setLoading(false);
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    try {
      await base44.functions.invoke('reviewAffiliateApplication', {
        application_id: selectedApp.id,
        action: 'approve',
        commission_rate: commissionRate,
      });
      toast.success('✅ Affiliate approved!');
      setShowApproveModal(false);
      setSelectedApp(null);
      load();
    } catch (error) {
      toast.error('Failed to approve application');
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    try {
      await base44.functions.invoke('reviewAffiliateApplication', {
        application_id: selectedApp.id,
        action: 'reject',
        rejection_reason: rejectionReason,
      });
      toast.success('Application rejected');
      setShowRejectModal(false);
      setSelectedApp(null);
      load();
    } catch (error) {
      toast.error('Failed to reject application');
    }
  };

  const openApproveModal = (app) => {
    setSelectedApp(app);
    setCommissionRate(2.00);
    setShowApproveModal(true);
  };

  const openRejectModal = (app) => {
    setSelectedApp(app);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Loading applications...</div>;

  const stats = {
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    total: applications.length,
  };

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Affiliate Applications</h2>
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold ${filter === f ? 'bg-pink-600 text-white' : 'bg-white/5 text-gray-400'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' && stats[f] > 0 && `(${stats[f]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <p className="text-xs text-amber-400 mb-1">Pending</p>
          <p className="text-xl font-bold text-white">{stats.pending}</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <p className="text-xs text-green-400 mb-1">Approved</p>
          <p className="text-xl font-bold text-white">{stats.approved}</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <p className="text-xs text-red-400 mb-1">Rejected</p>
          <p className="text-xl font-bold text-white">{stats.rejected}</p>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {applications.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            {filter === 'pending' ? 'No pending applications' : `No ${filter} applications`}
          </div>
        )}

        {applications.map(app => {
          const platforms = JSON.parse(app.social_platforms || '[]');
          return (
            <div key={app.id} className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${app.status === 'approved' ? 'rgba(34,197,94,0.3)' : app.status === 'rejected' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-white">{app.full_name}</p>
                  <p className="text-xs text-gray-400">{app.user_email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {app.status === 'pending' && <span className="text-xs font-bold text-amber-400 px-2 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.1)' }}>⏳ Pending</span>}
                  {app.status === 'approved' && <span className="text-xs font-bold text-green-400 px-2 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.1)' }}>✅ Approved</span>}
                  {app.status === 'rejected' && <span className="text-xs font-bold text-red-400 px-2 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.1)' }}>❌ Rejected</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Followers</p>
                  <p className="text-sm font-bold text-white">{app.total_followers?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Primary Platform</p>
                  <p className="text-sm font-bold text-white">{PLATFORM_ICONS[app.primary_platform] || '🌐'} {app.primary_platform}</p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Social Platforms</p>
                <div className="flex flex-wrap gap-1">
                  {platforms.map((p, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {PLATFORM_ICONS[p.platform] || '🌐'} {p.handle} ({parseInt(p.followers || 0).toLocaleString()})
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Promotion Plan</p>
                <p className="text-sm text-gray-300">{app.promotion_plan}</p>
              </div>

              {app.previous_campaigns && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Previous Campaigns</p>
                  <p className="text-sm text-gray-300">{app.previous_campaigns}</p>
                </div>
              )}

              {app.status === 'approved' && (
                <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">Code</p>
                      <p className="text-xs font-bold text-green-400">{app.affiliate_code}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">Commission</p>
                      <p className="text-xs font-bold text-green-400">${app.commission_rate}/signup</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">Total Earned</p>
                      <p className="text-xs font-bold text-green-400">${(app.total_earned || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-400">{app.signups_driven || 0} signups</span>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/register?ref=${app.affiliate_code}`); toast.success('Link copied!'); }}
                      className="text-xs text-green-400 flex items-center gap-1"><ExternalLink size={10} /> Copy Link</button>
                  </div>
                </div>
              )}

              {app.status === 'rejected' && app.rejection_reason && (
                <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p className="text-xs text-red-400 mb-1">Rejection Reason</p>
                  <p className="text-sm text-gray-300">{app.rejection_reason}</p>
                </div>
              )}

              {app.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => openApproveModal(app)}
                    className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button onClick={() => openRejectModal(app)}
                    className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl p-5 w-full max-w-md" style={{ background: '#1a0a18', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-lg font-bold text-white mb-3">Approve Affiliate?</h3>
            <p className="text-sm text-gray-400 mb-4">
              Approving <strong className="text-white">{selectedApp?.full_name}</strong> will grant them affiliate status and generate a unique referral code.
            </p>
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Commission Per Signup ($)</label>
              <input value={commissionRate} onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                type="number" step="0.01" className="w-full rounded-xl px-4 py-3 text-sm text-white"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleApprove} className="flex-1 py-3 rounded-xl font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>Confirm Approval</button>
              <button onClick={() => setShowApproveModal(false)} className="flex-1 py-3 rounded-xl font-bold text-white text-sm"
                style={{ background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl p-5 w-full max-w-md" style={{ background: '#1a0a18', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-lg font-bold text-white mb-3">Reject Application?</h3>
            <p className="text-sm text-gray-400 mb-4">
              Rejecting <strong className="text-white">{selectedApp?.full_name}</strong>'s application.
            </p>
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Rejection Reason (Optional)</label>
              <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide feedback to the applicant..." rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm text-white resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleReject} className="flex-1 py-3 rounded-xl font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>Confirm Rejection</button>
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-3 rounded-xl font-bold text-white text-sm"
                style={{ background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}