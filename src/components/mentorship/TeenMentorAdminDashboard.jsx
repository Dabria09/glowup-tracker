import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Check, AlertCircle, CheckCircle, XCircle, User, Calendar, FileText, Star } from 'lucide-react';

const STATUS_COLORS = {
  pending: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b' },
  background_check: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6' },
  interview: { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)', text: '#a855f7' },
  approved: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', text: '#22c55e' },
  rejected: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' },
};

export default function TeenMentorAdminDashboard({ isOpen, onClose }) {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      loadApplications();
    }
  }, [isOpen]);

  const loadApplications = async () => {
    try {
      const apps = await base44.entities.TeenMentorApplication.list();
      setApplications(apps.sort((a, b) => new Date(b.submitted_date) - new Date(a.submitted_date)));
      setLoading(false);
    } catch (error) {
      console.error('Error loading applications:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (app) => {
    if (!confirm('Are you sure you want to approve this teen mentor?')) return;
    
    try {
      setActionLoading(true);
      const user = await base44.auth.me();
      
      // Create TeenMentor entity record
      await base44.entities.TeenMentor.create({
        user_email: app.user_email,
        full_name: app.full_name,
        age: app.age,
        grade: app.grade || '',
        bio: app.bio || '',
        categories: app.categories,
        availability: app.availability || '',
        session_type: app.session_type || 'Video Call',
        avatar_url: app.avatar_url || '',
        is_approved: true,
        rating: 0,
        sessions_count: 0,
      });
      
      // Update application status
      await base44.entities.TeenMentorApplication.update(app.id, {
        status: 'approved',
        approved_date: new Date().toISOString(),
        approved_by: user.email,
        background_check_status: 'cleared',
        background_check_date: new Date().toISOString(),
        interview_status: 'completed',
        interview_date: new Date().toISOString(),
      });
      
      await loadApplications();
      setSelectedApp(null);
      setActionLoading(false);
      alert('Teen mentor approved successfully!');
    } catch (error) {
      console.error('Error approving mentor:', error);
      setActionLoading(false);
      alert('Error approving mentor: ' + error.message);
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setActionLoading(true);
    base44.entities.TeenMentorApplication.update(selectedApp.id, {
      status: 'rejected',
      rejection_reason: rejectionReason,
    }).then(() => {
      loadApplications();
      setSelectedApp(null);
      setShowRejectModal(false);
      setRejectionReason('');
      setActionLoading(false);
    }).catch((error) => {
      console.error('Error rejecting application:', error);
      setActionLoading(false);
      alert('Error rejecting application');
    });
  };

  const advanceToBackgroundCheck = (app) => {
    setActionLoading(true);
    base44.entities.TeenMentorApplication.update(app.id, { status: 'background_check' })
      .then(() => {
        loadApplications();
        setSelectedApp(null);
        setActionLoading(false);
      })
      .catch((error) => {
        console.error('Error updating application:', error);
        setActionLoading(false);
      });
  };

  const advanceToInterview = (app) => {
    setActionLoading(true);
    base44.entities.TeenMentorApplication.update(app.id, {
      status: 'interview',
      background_check_status: 'cleared',
      background_check_date: new Date().toISOString(),
    }).then(() => {
      loadApplications();
      setSelectedApp(null);
      setActionLoading(false);
    }).catch((error) => {
      console.error('Error updating application:', error);
      setActionLoading(false);
    });
  };

  const filteredApps = filter === 'all' ? applications : applications.filter(app => app.status === filter);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <Star size={20} className="text-yellow-400" />
            Teen Mentor Applications ({applications.length})
          </h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'background_check', 'interview', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition"
              style={
                filter === status
                  ? { background: 'linear-gradient(135deg, #f59e0b, #f97316)' }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
              }
            >
              {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-400 text-sm">Loading applications...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-10">
            <FileText size={40} className="mx-auto mb-3 text-gray-600" />
            <p className="text-sm text-gray-400">No applications found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApps.map(app => (
              <div
                key={app.id}
                className="rounded-xl p-4 cursor-pointer transition hover:opacity-80"
                style={{ 
                  background: STATUS_COLORS[app.status]?.bg || 'rgba(255,255,255,0.04)',
                  border: `1px solid ${STATUS_COLORS[app.status]?.border || 'rgba(255,255,255,0.08)'}`
                }}
                onClick={() => setSelectedApp(app)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-white">{app.full_name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: STATUS_COLORS[app.status]?.bg, color: STATUS_COLORS[app.status]?.text }}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Age: {app.age} | Grade: {app.grade || 'N/A'}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(app.submitted_date).toLocaleDateString()}
                      </span>
                      <span>{app.user_email}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedApp && (
          <div className="fixed inset-0 z-[101] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setSelectedApp(null)}>
            <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white text-lg">Application Details</h3>
                <button onClick={() => setSelectedApp(null)}><X size={20} className="text-gray-400" /></button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden"
                    style={{ background: selectedApp.avatar_url ? 'transparent' : 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                    {selectedApp.avatar_url ? (
                      <img src={selectedApp.avatar_url} alt={selectedApp.full_name} className="w-full h-full object-cover" />
                    ) : (
                      selectedApp.full_name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedApp.full_name}</h2>
                    <p className="text-sm text-gray-400">Age: {selectedApp.age} | Grade: {selectedApp.grade || 'N/A'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 rounded-full text-xs font-bold"
                        style={{ background: STATUS_COLORS[selectedApp.status]?.bg, color: STATUS_COLORS[selectedApp.status]?.text }}>
                        {selectedApp.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h4 className="font-bold text-white text-sm mb-2">Application Info</h4>
                  <p className="text-sm text-gray-300 mb-2"><span className="text-gray-500">Email:</span> {selectedApp.user_email}</p>
                  <p className="text-sm text-gray-300 mb-2"><span className="text-gray-500">Categories:</span> {JSON.parse(selectedApp.categories || '[]').join(', ')}</p>
                  <p className="text-sm text-gray-300"><span className="text-gray-500">Submitted:</span> {new Date(selectedApp.submitted_date).toLocaleString()}</p>
                </div>

                <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h4 className="font-bold text-white text-sm mb-2">Why Mentor?</h4>
                  <p className="text-sm text-gray-300">{selectedApp.why_mentor}</p>
                </div>

                {selectedApp.agreements_accepted && (
                  <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400" />
                      Accepted Agreements
                    </h4>
                    <p className="text-xs text-gray-400">{JSON.parse(selectedApp.agreements_accepted || '[]').length} / 4 agreements accepted</p>
                  </div>
                )}

                {selectedApp.parent_email && (
                  <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                      <User size={16} className="text-yellow-400" />
                      Parent/Guardian
                    </h4>
                    <p className="text-sm text-gray-300">Email: {selectedApp.parent_email}</p>
                    {selectedApp.parent_consent && (
                      <p className="text-xs text-gray-400 mt-1">Consent: {JSON.parse(selectedApp.parent_consent).status}</p>
                    )}
                  </div>
                )}

                {selectedApp.status === 'pending' && (
                  <button onClick={() => advanceToBackgroundCheck(selectedApp)} disabled={actionLoading}
                    className="w-full py-3 rounded-xl font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                    Advance to Background Check
                  </button>
                )}

                {selectedApp.status === 'background_check' && (
                  <button onClick={() => advanceToInterview(selectedApp)} disabled={actionLoading}
                    className="w-full py-3 rounded-xl font-bold text-white mb-3"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #9333ea)' }}>
                    Mark BG Cleared - Advance to Interview
                  </button>
                )}

                {selectedApp.status === 'interview' && (
                  <div className="flex gap-3">
                    <button onClick={() => handleApprove(selectedApp)} disabled={actionLoading}
                      className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                      <Check size={18} /> Approve
                    </button>
                    <button onClick={() => setShowRejectModal(true)} disabled={actionLoading}
                      className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                      style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <X size={18} /> Reject
                    </button>
                  </div>
                )}

                {selectedApp.status === 'approved' && (
                  <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                    <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
                    <p className="text-sm font-bold text-green-400">Approved</p>
                    {selectedApp.approved_date && (
                      <p className="text-xs text-gray-400 mt-1">
                        On {new Date(selectedApp.approved_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showRejectModal && (
          <div className="fixed inset-0 z-[102] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={() => setShowRejectModal(false)}>
            <div className="w-full max-w-md mx-4 rounded-2xl p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-white text-lg mb-4">Reject Application</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none mb-4"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                rows={4}
              />
              <div className="flex gap-3">
                <button onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-white"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  Cancel
                </button>
                <button onClick={handleReject}
                  className="flex-1 py-3 rounded-xl font-bold text-white"
                  style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}