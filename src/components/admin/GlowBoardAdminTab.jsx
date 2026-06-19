import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, X, Maximize2, AlertTriangle, Flag } from 'lucide-react';

const STATUS_FILTERS = ['Pending', 'Approved', 'Rejected', 'All'];

export default function GlowBoardAdminTab() {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const p = await base44.entities.GlowBoard.list('-created_date', 100);
      setPosts(p);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updatePost = async (id, status, reason = '') => {
    const me = await base44.auth.me();
    const updates = { 
      status,
      [status === 'approved' ? 'approved_by' : 'rejected_by']: me.email,
      [status === 'approved' ? 'approved_date' : 'rejected_date']: new Date().toISOString(),
    };
    if (status === 'rejected' && reason) updates.rejection_reason = reason;
    await base44.entities.GlowBoard.update(id, updates);
    load();
  };

  const reportToModeration = async (post, reason) => {
    setProcessing(true);
    try {
      const me = await base44.auth.me();
      // Create ContentReport
      const report = await base44.entities.ContentReport.create({
        reported_content_id: post.id,
        content_type: 'glow_board',
        content_snapshot: JSON.stringify({
          title: post.title,
          user: post.user_email,
          image_url: post.image_url,
        }),
        reported_by: me.email,
        reason: 'inappropriate',
        description: `GlowBoard safety violation: ${reason}`,
        status: 'pending',
      });
      // Update post
      await base44.entities.GlowBoard.update(post.id, {
        flagged_for_moderation: true,
        linked_content_report_id: report.id,
        status: 'flagged',
      });
      alert('✅ Reported to Moderation. ContentReport created.');
      load();
    } catch (e) {
      alert('Failed to report: ' + e.message);
    }
    setProcessing(false);
  };

  const filtered = filter === 'All' ? posts : posts.filter(p => {
    const s = p.status || 'pending';
    return filter === 'Pending' ? s === 'pending' : s === filter.toLowerCase();
  });

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm resize-none";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-white flex items-center gap-2">📸 Glow Board Submissions</p>
        <span className="text-xs text-gray-400">{posts.length} total</span>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {STATUS_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition ${filter === f ? 'text-white' : 'text-gray-400 bg-white/5'}`}
            style={filter === f ? { background: 'linear-gradient(135deg,#ec4899,#a855f7)' } : {}}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div> :
        filtered.length === 0 ? (
          <div className="p-8 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-sm text-gray-400">No {filter.toLowerCase()} submissions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(post => (
              <div key={post.id} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {post.image_url && (
                  <button onClick={() => setSelectedPost(post)} className="w-full h-28 relative group">
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Maximize2 size={24} className="text-white" />
                    </div>
                  </button>
                )}
                <div className="p-3">
                  <p className="text-xs font-semibold text-white truncate">{post.title || 'Untitled'}</p>
                  <p className="text-[10px] text-gray-400">{post.category || 'Glow Style'}</p>
                  <p className="text-[10px] text-gray-500">{post.user_email?.split('@')[0] || 'User'}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      (post.status || 'pending') === 'approved' ? 'bg-green-500/20 text-green-400' :
                      (post.status || 'pending') === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      (post.status || 'pending') === 'flagged' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>{post.status || 'pending'}</span>
                    {(!post.status || post.status === 'pending') && (
                      <div className="flex gap-1">
                        <button onClick={() => updatePost(post.id, 'approved')} className="text-green-400 hover:text-green-300"><CheckCircle size={14} /></button>
                        <button onClick={() => updatePost(post.id, 'rejected')} className="text-red-400 hover:text-red-300"><XCircle size={14} /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {/* Full-Size Preview Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.9)' }} onClick={() => setSelectedPost(null)}>
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedPost.title || 'Untitled'}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedPost.user_email?.split('@')[0]} • {selectedPost.category} • {selectedPost.created_date ? new Date(selectedPost.created_date).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Full-Size Image */}
            <div className="p-4 bg-black/50">
              {selectedPost.image_url ? (
                <img src={selectedPost.image_url} alt={selectedPost.title} className="w-full h-auto rounded-xl" />
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-gray-500">No image</div>
              )}
            </div>

            {/* Description */}
            {selectedPost.description && (
              <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <p className="text-sm text-gray-300">{selectedPost.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            {(!selectedPost.status || selectedPost.status === 'pending') && (
              <div className="p-4 border-t flex gap-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <button
                  onClick={() => { updatePost(selectedPost.id, 'approved'); setSelectedPost(null); }}
                  className="flex-1 py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
                >
                  <CheckCircle size={16} /> Approve
                </button>
                <button
                  onClick={() => { updatePost(selectedPost.id, 'rejected', 'Does not meet community guidelines'); setSelectedPost(null); }}
                  className="flex-1 py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}
                >
                  <XCircle size={16} /> Reject
                </button>
                <button
                  onClick={() => { setShowReportModal(true); setSelectedPost(null); }}
                  className="flex-1 py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }}
                >
                  <Flag size={16} /> Report
                </button>
              </div>
            )}

            {selectedPost.status && selectedPost.status !== 'pending' && (
              <div className="p-4 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                  selectedPost.status === 'approved' ? 'bg-green-500/20 text-green-400' : 
                  selectedPost.status === 'flagged' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {selectedPost.status.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report to Moderation Modal */}
      {showReportModal && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-4" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-white text-sm flex items-center gap-2">
                <Flag size={16} className="text-red-400" />
                Report to Moderation
              </p>
              <button onClick={() => { setShowReportModal(false); setReportReason(''); }} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p className="text-xs text-red-400 font-semibold flex items-center gap-1">
                <AlertTriangle size={12} /> This will escalate to the safety moderation team
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                Creates a ContentReport for review. User will be notified their submission violated guidelines.
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Safety Concern *</label>
              <textarea
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                placeholder="Describe the violation (e.g., 'Inappropriate attire', 'Suggestive pose', etc.)..."
                className={inputCls}
                rows={4}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowReportModal(false); setReportReason(''); }}
                disabled={processing}
                className="flex-1 py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { reportToModeration(selectedPost, reportReason); setShowReportModal(false); setReportReason(''); }}
                disabled={!reportReason.trim() || processing}
                className="flex-1 py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}
              >
                {processing ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Flag size={16} /> Escalate</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}