import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Gift, Clock, CheckCircle, XCircle, Truck, Mail, User, MapPin, AlertCircle, Search, Filter } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', icon: Clock },
  approved: { label: 'Approved', color: '#10b981', icon: CheckCircle },
  denied: { label: 'Denied', color: '#ef4444', icon: XCircle },
  fulfilled: { label: 'Fulfilled', color: '#8b5cf6', icon: Truck },
};

export default function RedemptionsTab() {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedRedemption, setSelectedRedemption] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRedemptions();
  }, []);

  const loadRedemptions = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.PrizeRedemption.list('-requested_date', 100);
      setRedemptions(all);
    } catch (err) {
      console.error('Error loading redemptions:', err);
    }
    setLoading(false);
  };

  const handleApprove = async (redemption) => {
    if (!confirm('Approve this redemption? Points have already been deducted.')) return;
    setProcessing(true);
    try {
      await base44.entities.PrizeRedemption.update(redemption.id, {
        status: 'approved',
        approved_date: new Date().toISOString(),
        admin_notes: adminNotes || redemption.admin_notes,
      });
      toast.success('Redemption approved! ✅');
      loadRedemptions();
      setSelectedRedemption(null);
      setAdminNotes('');
    } catch (err) {
      toast.error('Failed to approve');
    }
    setProcessing(false);
  };

  const handleDeny = async (redemption) => {
    const reason = prompt('Enter reason for denial (points will be refunded):');
    if (!reason) return;
    setProcessing(true);
    try {
      // Refund points
      const userPoints = await base44.entities.UserPoints.filter({ user_email: redemption.user_email });
      if (userPoints.length > 0) {
        const newTotal = (userPoints[0].total_points || 0) + redemption.points_deducted;
        await base44.entities.UserPoints.update(userPoints[0].id, { total_points: newTotal });
      }
      
      // Record refund in history
      await base44.entities.PointsHistory.create({
        user_email: redemption.user_email,
        action: 'redemption_refund',
        label: `Refund: ${redemption.prize_name}`,
        emoji: '↩️',
        points: redemption.points_deducted,
        total_after: (userPoints[0]?.total_points || 0) + redemption.points_deducted,
      });

      // Update redemption
      await base44.entities.PrizeRedemption.update(redemption.id, {
        status: 'denied',
        admin_notes: reason,
      });
      toast.success('Redemption denied & points refunded');
      loadRedemptions();
      setSelectedRedemption(null);
    } catch (err) {
      toast.error('Failed to deny');
    }
    setProcessing(false);
  };

  const handleFulfill = async (redemption) => {
    if (!confirm('Mark this redemption as fulfilled?')) return;
    setProcessing(true);
    try {
      await base44.entities.PrizeRedemption.update(redemption.id, {
        status: 'fulfilled',
        fulfilled_date: new Date().toISOString(),
        admin_notes: adminNotes || redemption.admin_notes,
      });
      toast.success('Marked as fulfilled! 🎁');
      loadRedemptions();
      setSelectedRedemption(null);
      setAdminNotes('');
    } catch (err) {
      toast.error('Failed to update');
    }
    setProcessing(false);
  };

  const filtered = redemptions.filter(r => {
    const matchFilter = filter === 'all' || r.status === filter;
    const matchSearch = !search || 
      r.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      r.prize_name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    pending: redemptions.filter(r => r.status === 'pending').length,
    approved: redemptions.filter(r => r.status === 'approved').length,
    fulfilled: redemptions.filter(r => r.status === 'fulfilled').length,
    total: redemptions.length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Gift, color: '#8b5cf6' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: '#f59e0b' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: '#10b981' },
          { label: 'Fulfilled', value: stats.fulfilled, icon: Truck, color: '#8b5cf6' },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={16} style={{ color: stat.color }} />
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
          <Search size={16} className="text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by user or prize..."
            className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
          <option value="fulfilled">Fulfilled</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No redemptions found</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(redemption => {
            const statusConfig = STATUS_CONFIG[redemption.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusConfig.icon;
            return (
              <div
                key={redemption.id}
                className="rounded-2xl p-4 cursor-pointer hover:scale-[1.01] transition"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                onClick={() => setSelectedRedemption(redemption)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${statusConfig.color}20`, border: `1px solid ${statusConfig.color}40` }}>
                      <StatusIcon size={16} style={{ color: statusConfig.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{redemption.prize_name}</p>
                      <p className="text-xs text-gray-400 truncate">{redemption.user_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Points</p>
                      <p className="text-sm font-bold text-yellow-400">{redemption.points_deducted}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold`} style={{ background: `${statusConfig.color}20`, color: statusConfig.color }}>
                      {statusConfig.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRedemption && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setSelectedRedemption(null)}>
          <div
            className="w-full rounded-t-3xl max-h-[90vh] overflow-y-auto"
            style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1a0a2e]">
              <h3 className="text-lg font-bold">Redemption Details</h3>
              <button onClick={() => setSelectedRedemption(null)}><XCircle size={20} className="rotate-45" /></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Prize Info */}
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-bold text-gray-400 mb-1">PRIZE</p>
                <p className="text-lg font-bold text-white">{selectedRedemption.prize_name}</p>
                <p className="text-sm text-gray-400 mt-1">{selectedRedemption.prize_description}</p>
              </div>

              {/* User Info */}
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-pink-400" />
                  <p className="text-xs font-bold text-gray-400">USER</p>
                </div>
                <p className="text-sm font-semibold text-white">{selectedRedemption.user_email}</p>
                <p className="text-xs text-gray-400 mt-1">Requested: {new Date(selectedRedemption.requested_date).toLocaleString()}</p>
              </div>

              {/* Points */}
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)' }}>
                <p className="text-xs font-bold text-gray-400 mb-1">POINTS DEDUCTED</p>
                <p className="text-2xl font-bold text-yellow-400">{selectedRedemption.points_deducted}</p>
              </div>

              {/* Shipping Address */}
              {selectedRedemption.shipping_address && (
                <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-purple-400" />
                    <p className="text-xs font-bold text-gray-400">SHIPPING ADDRESS</p>
                  </div>
                  <p className="text-sm text-white whitespace-pre-line">{selectedRedemption.shipping_address}</p>
                </div>
              )}

              {/* Status Timeline */}
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-bold text-gray-400 mb-3">STATUS TIMELINE</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-gray-300">Requested: {new Date(selectedRedemption.requested_date).toLocaleString()}</span>
                  </div>
                  {selectedRedemption.approved_date && (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-400" />
                      <span className="text-gray-300">Approved: {new Date(selectedRedemption.approved_date).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedRedemption.fulfilled_date && (
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-purple-400" />
                      <span className="text-gray-300">Fulfilled: {new Date(selectedRedemption.fulfilled_date).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none resize-none min-h-20"
                />
              </div>

              {/* Actions */}
              {selectedRedemption.status === 'pending' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleApprove(selectedRedemption)}
                    disabled={processing}
                    className="py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleDeny(selectedRedemption)}
                    disabled={processing}
                    className="py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                  >
                    ✕ Deny & Refund
                  </button>
                </div>
              )}

              {selectedRedemption.status === 'approved' && (
                <button
                  onClick={() => handleFulfill(selectedRedemption)}
                  disabled={processing}
                  className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
                >
                  🚚 Mark as Fulfilled
                </button>
              )}

              {selectedRedemption.status !== 'pending' && selectedRedemption.status !== 'approved' && (
                <div className={`p-3 rounded-xl text-center text-sm font-semibold`} style={{ background: `${STATUS_CONFIG[selectedRedemption.status].color}20`, color: STATUS_CONFIG[selectedRedemption.status].color }}>
                  {STATUS_CONFIG[selectedRedemption.status].label} on {new Date(selectedRedemption.approved_date || selectedRedemption.fulfilled_date || selectedRedemption.requested_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}