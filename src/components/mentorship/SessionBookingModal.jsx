import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Calendar, Clock, Video, Phone, MessageCircle, MapPin, Check, AlertCircle } from 'lucide-react';

const sessionTypeIcons = {
  'Video Call': Video,
  'Phone Call': Phone,
  'Chat': MessageCircle,
  'In-person': MapPin,
};

export default function SessionBookingModal({ isOpen, onClose, mentor, user, onBooked }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const TIME_SLOTS = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  useEffect(() => {
    if (isOpen && mentor) {
      generateAvailableDates();
    }
  }, [isOpen, mentor]);

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push({
          full: date.toISOString().split('T')[0],
          display: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        });
      }
    }
    
    setAvailableSlots(dates);
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !topic) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const [hours, minutes] = selectedTime.replace(' AM', '').replace(' PM', '').split(':');
      let hour = parseInt(hours);
      if (selectedTime.includes('PM') && hour !== 12) hour += 12;
      if (selectedTime.includes('AM') && hour === 12) hour = 0;
      
      const sessionDateTime = new Date(selectedDate);
      sessionDateTime.setHours(hour, parseInt(minutes), 0, 0);

      await base44.entities.MentorSession.create({
        mentee_email: user.email,
        mentor_email: mentor.user_email,
        session_date: sessionDateTime.toISOString(),
        session_type: mentor.session_type || 'Video Call',
        topic: topic,
        notes: message || '',
        status: 'pending',
        rating: 0,
      });

      setBookingSuccess(true);
      setTimeout(() => {
        onBooked();
        onClose();
        setBookingSuccess(false);
        setSelectedDate('');
        setSelectedTime('');
        setTopic('');
        setMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error booking session:', error);
      alert('Error booking session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mentor) return null;

  const SessionIcon = sessionTypeIcons[mentor.session_type] || Video;

  if (bookingSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }}>
        <div className="w-full max-w-md mx-4 rounded-2xl p-8 text-center" style={{ background: '#1a0a30' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.2)' }}>
            <Check size={40} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Session Requested!</h2>
          <p className="text-sm text-gray-400">Your mentor will review your request and confirm shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <Calendar size={20} className="text-pink-400" />
            Book a Session
          </h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="rounded-2xl p-4 mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden"
              style={{ background: mentor.avatar_url ? 'transparent' : 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
              {mentor.avatar_url ? (
                <img src={mentor.avatar_url} alt={mentor.full_name} className="w-full h-full object-cover" />
              ) : (
                mentor.full_name?.charAt(0) || 'M'
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">{mentor.full_name}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <SessionIcon size={12} />
                <span>{mentor.session_type || 'Video Call'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">What do you want to work on? *</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Career transition, Resume review"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Select Date *</label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {availableSlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDate(slot.full);
                    setSelectedTime('');
                  }}
                  className={`p-3 rounded-xl text-center transition ${
                    selectedDate === slot.full
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  style={
                    selectedDate === slot.full
                      ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
                  }
                >
                  <div className="text-xs font-bold">{slot.day}</div>
                  <div className="text-xs">{slot.display.split(',')[1]}</div>
                </button>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">Select Time *</label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((time, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 rounded-xl text-xs font-semibold transition ${
                      selectedTime === time
                        ? 'text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                    style={
                      selectedTime === time
                        ? { background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }
                        : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
                    }
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Message to mentor (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share any context or specific goals..."
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={3}
            />
          </div>

          <div className="rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-blue-400 mt-0.5" />
              <p className="text-xs text-gray-300">Your session request will be sent to the mentor for approval. You'll be notified once they confirm.</p>
            </div>
          </div>

          <button
            onClick={handleBook}
            disabled={loading || !selectedDate || !selectedTime || !topic}
            className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
          >
            {loading ? 'Booking...' : 'Request Session'}
          </button>
        </div>
      </div>
    </div>
  );
}