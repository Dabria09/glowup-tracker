import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Video, X, CheckCircle, Calendar, Clock, Users } from 'lucide-react';

export default function CreateTestSessionModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    mentor_email: '',
    mentee_email: '',
    session_date: new Date().toISOString().split('T')[0],
    session_time: '',
    topic: 'Test Session',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.mentor_email || !formData.mentee_email || !formData.session_time) {
        throw new Error('All fields are required');
      }

      const sessionDateTime = new Date(`${formData.session_date}T${formData.session_time}`).toISOString();

      const res = await base44.functions.invoke('createMentorSession', {
        mentor_email: formData.mentor_email,
        mentee_email: formData.mentee_email,
        session_date: sessionDateTime,
        session_type: 'Video Call',
        topic: formData.topic || 'Test Session',
      });

      if (res.data.error) {
        throw new Error(res.data.error);
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.(res.data.session);
        onClose();
        setSuccess(false);
        setFormData({
          mentor_email: '',
          mentee_email: '',
          session_date: new Date().toISOString().split('T')[0],
          session_time: '',
          topic: 'Test Session',
        });
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-2xl p-5" style={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Video size={18} className="text-blue-400" />
              Create Test Session
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Quick test session for video monitoring</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <p className="text-white font-semibold">Session Created!</p>
            <p className="text-xs text-gray-400 mt-1">Go to Video tab to join the session.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Mentor Email */}
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1.5 block">Mentor Email *</label>
              <input
                type="email"
                value={formData.mentor_email}
                onChange={e => setFormData({ ...formData, mentor_email: e.target.value })}
                placeholder="mentor@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 outline-none text-sm"
                required
              />
            </div>

            {/* Mentee Email */}
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1.5 block">Mentee Email *</label>
              <input
                type="email"
                value={formData.mentee_email}
                onChange={e => setFormData({ ...formData, mentee_email: e.target.value })}
                placeholder="mentee@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 outline-none text-sm"
                required
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1.5 block">Date *</label>
                <input
                  type="date"
                  value={formData.session_date}
                  onChange={e => setFormData({ ...formData, session_date: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none text-sm"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1.5 block">Time *</label>
                <input
                  type="time"
                  value={formData.session_time}
                  onChange={e => setFormData({ ...formData, session_time: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none text-sm"
                  required
                />
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1.5 block">Topic</label>
              <input
                type="text"
                value={formData.topic}
                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Test Session"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 outline-none text-sm"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl text-xs text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={16} /> Create Session</>}
            </button>

            <div className="p-3 rounded-xl text-[10px] text-gray-500" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              💡 <strong>Tip:</strong> Set the time 5-10 minutes from now to test the join functionality immediately.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}