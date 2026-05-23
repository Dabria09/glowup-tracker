import { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ConnectionRequestModal({ isOpen, onClose, mentor, user, onSubmitted }) {
  const [formData, setFormData] = useState({
    topic: '',
    session_date: '',
    session_time: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      const time12 = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
      slots.push({ value: `${hour}:00`, label: time12 });
      slots.push({ value: `${hour}:30`, label: time12.replace(':00', ':30') });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const minDate = new Date().toISOString().split('T')[0];

  const handleSubmit = async () => {
    if (!formData.topic.trim() || !formData.session_date || !formData.session_time) return;

    try {
      setLoading(true);
      const sessionDateTime = `${formData.session_date}T${formData.session_time}`;
      await base44.entities.MentorSession.create({
        mentee_email: user.email,
        mentor_email: mentor.user_email,
        session_date: sessionDateTime,
        topic: formData.topic.trim(),
        notes: formData.message.trim(),
        status: 'scheduled',
      });
      onSubmitted();
      onClose();
    } catch (error) {
      console.error('Error sending request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-lg">🔍 Request Connection</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)' }}>
          <p className="text-sm text-white font-semibold">{mentor.full_name}</p>
          {mentor.title && <p className="text-xs text-gray-400">{mentor.title}</p>}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">What would you like to discuss? *</label>
            <textarea
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
              placeholder="e.g., Career transition, Building confidence, Starting a business..."
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block flex items-center gap-1">
                <Calendar size={12} /> Select Date *
              </label>
              <input
                type="date"
                value={formData.session_date}
                onChange={(e) => setFormData({...formData, session_date: e.target.value})}
                min={minDate}
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block flex items-center gap-1">
                <Clock size={12} /> Select Time *
              </label>
              <select
                value={formData.session_time}
                onChange={(e) => setFormData({...formData, session_time: e.target.value})}
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <option value="">Pick a time</option>
                {timeSlots.map(slot => (
                  <option key={slot.value} value={slot.value}>{slot.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Message (optional)</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="Share any additional context..."
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={3}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!formData.topic.trim() || !formData.session_date || !formData.session_time || loading}
            className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
          >
            {loading ? 'Sending...' : 'Send Connection Request'}
          </button>
        </div>
      </div>
    </div>
  );
}