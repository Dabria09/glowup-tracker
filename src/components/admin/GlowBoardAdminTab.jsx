import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, X, Maximize2, AlertTriangle, Flag, Settings, Save } from 'lucide-react';

const STATUS_FILTERS = ['Pending', 'Approved', 'Rejected', 'All'];

export default function GlowBoardAdminTab() {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(null);
  const [tempSettings, setTempSettings] = useState(null);


  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([
        base44.entities.GlowBoard.list('-created_date', 100),
        base44.entities.GlowBoardSettings.list(),
      ]);
      setPosts(p);
      setSettings(s[0] || { feature_enabled: true, accepting_submissions: true, require_approval: true, disabled_message: 'Glow Board is temporarily unavailable.' });
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
      const report = await base44.entities.ContentReport.create({
        reported_content_id: post.id,
        content_type: 'glow_board',
        content_snapshot: JSON.stringify({ title: post.title, user: post.user_email, image_url: post.image_url }),
        reported_by: me.email,
        reason: 'inappropriate',
        description: `GlowBoard safety violation: ${reason}`,
        status: 'pending',
      });
      await base44.entities.GlowBoard.update(post.id, { flagged_for_moderation: true, linked_content_report_id: report.id, status: 'flagged' });
      alert('✅ Reported to Moderation. ContentReport created.');
      load();
    } catch (e) { alert('Failed: ' + e.message); }
    setProcessing(false);
  };

  const saveSettings = async () => {
    setProcessing(true);
    try {
      const me = await base44.auth.me();
      if (settings?.id) {
        await base44.entities.GlowBoardSettings.update(settings.id, { ...tempSettings, last_updated_by: me.email, last_updated_date: new Date().toISOString() });
      } else {
        await base44.entities.GlowBoardSettings.create({ ...tempSettings, last_updated_by: me.email, last_updated_date: new Date().toISOString() });
      }
      setSettings(tempSettings);
      setShowSettings(false);
      alert('✅ Settings saved');
    } catch (e) { alert('Failed: ' + e.message); }
    setProcessing(false);
  };

  const filtered = filter === 'All' ? posts : posts.filter(p => {
    const s = p.status || 'pending';
    return filter === 'Pending' ? s === 'pending' : s === filter.toLowerCase();
  });

  return (
    <div className="space-y-4">
      {/* Header with Settings Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-white flex items-center gap-2">📸 Glow Board Submissions</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{posts.length} total</span>
          <button onClick={() => { setTempSettings(settings || { feature_enabled: true, accepting_submissions: true, require_approval: true, disabled_message: 'Glow Board is temporarily unavailable.' }); setShowSettings(true); }} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}>
            <Settings size={16} className="text-purple-400" />
          </button>
        </div>
      </div>

      {/* Feature Status Banner */}
      {settings && (
        <div className={`rounded-2xl p-4 border-2 ${settings.feature_enabled ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${settings.feature_enabled ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {settings.feature_enabled ? '✅' : '🚫'}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold ${settings.feature_enabled ? 'text-green-400' : 'text-red-400'}`}>
                {settings.feature_enabled ? 'Feature ENABLED' : 'Feature DISABLED'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {settings.feature_enabled 
                  ? `Accepting submissions: ${settings.accepting_submissions ? 'Yes' : 'No'} • Approval required: ${settings.require_approval ? 'Yes' : 'No'}`
                  : `Users see: "${settings.disabled_message}"`}
              </p>
            </div>
          </div>
        </div>
      )}

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
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedPost.title || 'Untitled'}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedPost.user_email?.split('@')[0]} • {selectedPost.category}</p>
              </div>
              <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-4 bg-black/50">
              {selectedPost.image_url ? <img src={selectedPost.image_url} alt={selectedPost.title} className="w-full h-auto rounded-xl" /> : <div className="w-full h-64 flex items-center justify-center text-gray-500">No image</div>}
            </div>
            {selectedPost.description && <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}><p className="text-sm text-gray-300">{selectedPost.description}</p></div>}
            {(!selectedPost.status || selectedPost.status === 'pending') && (
              <div className="p-4 border-t space-y-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="flex gap-3">
                  <button onClick={() => { updatePost(selectedPost.id, 'approved'); setSelectedPost(null); }} className="flex-1 py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}><CheckCircle size={16} /> Approve</button>
                  <button onClick={() => { updatePost(selectedPost.id, 'rejected', 'Does not meet guidelines'); setSelectedPost(null); }} className="flex-1 py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}><XCircle size={16} /> Reject</button>
                </div>
                <button onClick={() => { setShowReportModal(true); setSelectedPost(null); }} className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }}><Flag size={16} /> 🚨 Report to Moderation</button>
              </div>
            )}
            {selectedPost.status && selectedPost.status !== 'pending' && (
              <div className="p-4 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${selectedPost.status === 'approved' ? 'bg-green-500/20 text-green-400' : selectedPost.status === 'flagged' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'}`}>{selectedPost.status.toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-4" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-white text-sm flex items-center gap-2"><Flag size={16} className="text-red-400" />Report to Moderation</p>
              <button onClick={() => { setShowReportModal(false); setReportReason(''); }} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p className="text-xs text-red-400 font-semibold flex items-center gap-1"><AlertTriangle size={12} /> This will escalate to safety moderation</p>
              <p className="text-[10px] text-gray-400 mt-1">Creates ContentReport for review.</p>
            </div>
            <div><label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Safety Concern *</label><textarea value={reportReason} onChange={e => setReportReason(e.target.value)} placeholder="Describe violation..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm resize-none" rows={4} /></div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowReportModal(false); setReportReason(''); }} disabled={processing} className="flex-1 py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>Cancel</button>
              <button onClick={() => { reportToModeration(selectedPost, reportReason); setShowReportModal(false); setReportReason(''); }} disabled={!reportReason.trim() || processing} className="flex-1 py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>{processing ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Flag size={16} /> Escalate</>}</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && tempSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Settings size={18} className="text-purple-400" />Glow Board Settings</h3>
                <p className="text-xs text-gray-400 mt-0.5">Control feature availability & moderation</p>
              </div>
              <button onClick={() => { setShowSettings(false); setTempSettings(settings); }} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Master Toggle */}
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-white">🚫 Master Feature Toggle</p>
                  <button onClick={() => setTempSettings({ ...tempSettings, feature_enabled: !tempSettings.feature_enabled })} className={`w-12 h-6 rounded-full transition ${tempSettings.feature_enabled ? 'bg-green-500' : 'bg-red-500'}`}><div className={`w-5 h-5 rounded-full bg-white transition-transform ${tempSettings.feature_enabled ? 'translate-x-6' : 'translate-x-0.5'}`} /></button>
                </div>
                <p className="text-xs text-gray-400">{tempSettings.feature_enabled ? 'Feature is ENABLED - users can access Glow Board' : 'Feature is DISABLED - users see blocked message'}</p>
              </div>

              {tempSettings.feature_enabled && (
                <>
                  {/* Accepting Submissions */}
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-white">📥 Accepting New Submissions</p>
                      <button onClick={() => setTempSettings({ ...tempSettings, accepting_submissions: !tempSettings.accepting_submissions })} className={`w-12 h-6 rounded-full transition ${tempSettings.accepting_submissions ? 'bg-green-500' : 'bg-gray-500'}`}><div className={`w-5 h-5 rounded-full bg-white transition-transform ${tempSettings.accepting_submissions ? 'translate-x-6' : 'translate-x-0.5'}`} /></button>
                    </div>
                    <p className="text-xs text-gray-400">{tempSettings.accepting_submissions ? 'Users can submit new photos' : 'Submit button hidden - view only'}</p>
                  </div>

                  {/* Approval Required */}
                  <div className="rounded-2xl p-4" style={{ background: tempSettings.require_approval ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${tempSettings.require_approval ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-white">✅ Require Admin Approval</p>
                      <button onClick={() => setTempSettings({ ...tempSettings, require_approval: !tempSettings.require_approval })} className={`w-12 h-6 rounded-full transition ${tempSettings.require_approval ? 'bg-green-500' : 'bg-amber-500'}`}><div className={`w-5 h-5 rounded-full bg-white transition-transform ${tempSettings.require_approval ? 'translate-x-6' : 'translate-x-0.5'}`} /></button>
                    </div>
                    <p className="text-xs text-gray-400">{tempSettings.require_approval ? 'Posts hidden until approved (RECOMMENDED for minors)' : '⚠️ Posts appear immediately - higher safety risk'}</p>
                  </div>
                </>
              )}

              {/* Disabled Message */}
              {!tempSettings.feature_enabled && (
                <div><label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2 block">Disabled Message</label><textarea value={tempSettings.disabled_message} onChange={e => setTempSettings({ ...tempSettings, disabled_message: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 outline-none text-sm resize-none" rows={3} /></div>
              )}
            </div>
            <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <button onClick={saveSettings} disabled={processing} className="w-full py-3 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }}>{processing ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Save size={16} /> Save Settings</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}