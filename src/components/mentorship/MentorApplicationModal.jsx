import { useState } from 'react';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = ['Career', 'Education', 'Business', 'Wellness', 'Faith', 'Relationships'];
const AVAILABILITY = ['Weekly', 'Bi-weekly', 'Monthly', 'One-time'];
const SESSION_TYPES = ['Video Call', 'Phone Call', 'Chat', 'In-person'];

export default function MentorApplicationModal({ isOpen, onClose, user, onSubmitted }) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    title: '',
    bio: '',
    categories: [],
    expertise: '',
    experience_years: '',
    why_mentor: '',
    availability: '',
    session_type: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.categories.length || !formData.why_mentor) return;

    try {
      setLoading(true);
      await base44.entities.MentorApplication.create({
        user_email: user.email,
        ...formData,
        categories: JSON.stringify(formData.categories),
        submitted_date: new Date().toISOString(),
        status: 'pending',
      });
      onSubmitted();
      onClose();
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (cat) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-6" style={{ background: '#1a0a30' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-lg">✨ Become a Mentor</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(132, 204, 22, 0.1)', border: '1px solid rgba(132, 204, 22, 0.3)' }}>
            <h3 className="font-bold text-white text-sm mb-2">🌱 Mentor Tier Progression</h3>
            <p className="text-xs text-gray-300 mb-3">All mentors start at Seed tier and progress based on sessions and ratings:</p>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center gap-2"><span>🌱</span><span className="text-green-400">Seed</span><span className="text-gray-500">→ Starting out</span></div>
              <div className="flex items-center gap-2"><span>🌿</span><span className="text-green-500">Sprout</span><span className="text-gray-500">→ 3-5 sessions</span></div>
              <div className="flex items-center gap-2"><span>🌸</span><span className="text-pink-400">Bloom</span><span className="text-gray-500">→ 6-15 sessions</span></div>
              <div className="flex items-center gap-2"><span>✨</span><span className="text-yellow-400">Radiant</span><span className="text-gray-500">→ 16-30 sessions, 4.5+ rating</span></div>
              <div className="flex items-center gap-2"><span>👑</span><span className="text-purple-400">Luminary</span><span className="text-gray-500">→ 31+ sessions, 4.8+ rating</span></div>
            </div>
          </div>
        <div>
          <label className="text-xs font-bold text-gray-400 mb-2 block">Full Name *</label>
            <input
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Professional Title</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Software Engineer, Entrepreneur"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="Tell us about yourself..."
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={3}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Categories *</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    formData.categories.includes(cat)
                      ? 'text-white'
                      : 'text-gray-400 bg-gray-800'
                  }`}
                  style={formData.categories.includes(cat) ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Areas of Expertise</label>
            <input
              value={formData.expertise}
              onChange={(e) => setFormData({...formData, expertise: e.target.value})}
              placeholder="e.g., Leadership, Career Transition"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Years of Experience</label>
            <input
              type="number"
              value={formData.experience_years}
              onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value) || 0})}
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Why do you want to mentor? *</label>
            <textarea
              value={formData.why_mentor}
              onChange={(e) => setFormData({...formData, why_mentor: e.target.value})}
              placeholder="Share your motivation..."
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={3}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Availability</label>
            <select
              value={formData.availability}
              onChange={(e) => setFormData({...formData, availability: e.target.value})}
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <option value="">Select availability</option>
              {AVAILABILITY.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Session Type</label>
            <select
              value={formData.session_type}
              onChange={(e) => setFormData({...formData, session_type: e.target.value})}
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <option value="">Select session type</option>
              {SESSION_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!formData.full_name || !formData.categories.length || !formData.why_mentor || loading}
            className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );
}