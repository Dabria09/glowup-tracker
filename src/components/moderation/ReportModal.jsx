import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const REASONS = [
  { value: 'spam', label: '📢 Spam', desc: 'Promotional or repetitive content' },
  { value: 'harassment', label: '😠 Harassment', desc: 'Targeted abuse or intimidation' },
  { value: 'hate_speech', label: '💔 Hate Speech', desc: 'Discriminatory or harmful language' },
  { value: 'inappropriate', label: '🚫 Inappropriate', desc: 'Not suitable for minors' },
  { value: 'bullying', reportValue: 'harassment', label: '👊 Bullying', desc: 'Mean-spirited or hurtful behavior' },
  { value: 'other', label: '📝 Other', desc: 'Different reason' },
];

export default function ReportModal({ onClose, contentType, contentId, contentText, reportedUserEmail }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submitReport = async () => {
    if (!selectedReason) {
      setError('Please select a reason for reporting.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const me = await base44.auth.me();
      const reportReason = REASONS.find(reason => reason.value === selectedReason)?.reportValue || selectedReason;
      const report = await base44.entities.ContentReport.create({
        reported_content_id: contentId,
        content_type: contentType,
        reason: reportReason,
        description: description.trim(),
        reported_by: me.email,
        reported_user_email: reportedUserEmail,
        content_snapshot: contentText,
        status: 'pending',
      });
      await base44.functions.invoke('notifyModerationAlert', {
        report,
        alertType: reportReason,
      });
      toast.success('Report submitted. Thank you for helping keep GGU safe! 🛡️');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl" style={{ background: '#1a0a1f', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-400" />
            <h3 className="text-sm font-bold text-white">Report Content</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        {/* Content preview */}
        <div className="p-4 border-b border-white/10">
          <p className="text-[10px] text-gray-500 mb-1">Reporting this content:</p>
          <p className="text-xs text-gray-300 line-clamp-3 italic">"{contentText}"</p>
        </div>

        {/* Reasons */}
        <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400">Why are you reporting this?</p>
          {REASONS.map(r => (
            <button
              key={r.value}
              onClick={() => { setSelectedReason(r.value); setError(''); }}
              className={`w-full text-left p-3 rounded-xl border transition ${
                selectedReason === r.value
                  ? 'border-pink-500 bg-pink-500/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <p className="text-sm font-semibold text-white">{r.label}</p>
              <p className="text-[10px] text-gray-500">{r.desc}</p>
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="p-4 border-t border-white/10">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add details (optional but helpful)..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 outline-none resize-none"
            rows={3}
            maxLength={500}
          />
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-white/10 flex gap-2 pb-safe">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl text-sm font-semibold text-gray-400 bg-white/5">
            Cancel
          </button>
          <button
            onClick={submitReport}
            disabled={submitting || !selectedReason}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}
          >
            {submitting ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}