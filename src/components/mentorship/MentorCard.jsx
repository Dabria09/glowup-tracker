import { Star, MapPin, Calendar, Video, Phone, MessageCircle } from 'lucide-react';

const sessionTypeIcons = {
  'Video Call': Video,
  'Phone Call': Phone,
  'Chat': MessageCircle,
  'In-person': MapPin,
};

export default function MentorCard({ mentor, onBookSession, onStartChat }) {
  const categories = JSON.parse(mentor.categories || '[]');
  const SessionIcon = sessionTypeIcons[mentor.session_type] || Video;

  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
          {mentor.full_name?.charAt(0) || 'M'}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-white">{mentor.full_name}</h3>
              {mentor.title && <p className="text-xs text-gray-400">{mentor.title}</p>}
            </div>
            {mentor.is_featured && (
              <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                👑 Ms. Glow
              </span>
            )}
          </div>

          {mentor.expertise && (
            <p className="text-xs text-gray-300 mt-2 line-clamp-2">{mentor.expertise}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            {categories.slice(0, 3).map((cat, i) => (
              <span key={i} className="px-2 py-1 rounded-full text-xs"
                style={{ background: 'rgba(236,72,153,0.2)', color: '#ec4899' }}>
                {cat}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            {mentor.experience_years && (
              <span>{mentor.experience_years}+ years</span>
            )}
            {mentor.sessions_count > 0 && (
              <span className="flex items-center gap-1">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                {mentor.rating?.toFixed(1) || '5.0'} ({mentor.sessions_count})
              </span>
            )}
            <span className="flex items-center gap-1">
              <SessionIcon size={12} />
              {mentor.session_type || 'Video'}
            </span>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onStartChat && onStartChat(mentor)}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <MessageCircle size={14} /> Chat
            </button>
            <button
              onClick={() => onBookSession(mentor)}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
            >
              Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}