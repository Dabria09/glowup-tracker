import { useState } from 'react';
import { X, Upload, User, CheckCircle, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = ['Career', 'Education', 'Business', 'Wellness', 'Faith', 'Relationships', 'Cooking', 'Identity', 'Find Your Purpose', 'Skill Building'];
const AVAILABILITY = ['Weekly', 'Bi-weekly', 'Monthly', 'One-time'];
const SESSION_TYPES = ['Video Call', 'Phone Call', 'Chat', 'In-person'];

const AGREEMENTS = [
  {
    id: 'code_of_conduct',
    title: 'Code of Conduct',
    text: 'I agree to uphold GGU\'s values of empowerment, authenticity, equity, community, integrity, and wholeness in all interactions.',
  },
  {
    id: 'mandatory_reporting',
    title: 'Mandatory Reporting Disclosure',
    text: 'I understand that as a mentor, I am required to report any signs of abuse, neglect, or harm disclosed during mentorship sessions.',
  },
  {
    id: 'confidentiality',
    title: 'Confidentiality Agreement',
    text: 'I agree to protect the privacy and personal information of all mentees and keep session content confidential.',
  },
  {
    id: 'age_gating',
    title: 'Age-Gated Interaction Policy',
    text: 'I understand: no 1:1 video with girls under 14; group sessions only at 13; 1:1 only with verified parental consent for ages 14-18.',
  },
  {
    id: 'platform_rules',
    title: 'Platform Rules',
    text: 'I agree to keep all interactions within the GGU App and will not initiate off-platform contact or exchange personal contact information with minors.',
  },
  {
    id: 'media_release',
    title: 'Media/Photo Release Awareness',
    text: 'I understand what can and cannot be shared publicly regarding my mentorship activities and mentee information.',
  },
];

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
    avatar_url: '',
  });
  const [acceptedAgreements, setAcceptedAgreements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;
    
    try {
      setUploading(true);
      const response = await base44.integrations.Core.UploadFile({ file: avatarFile });
      setUploading(false);
      return response.file_url;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setUploading(false);
      return null;
    }
  };

  const toggleAgreement = (id) => {
    setAcceptedAgreements(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.categories.length || !formData.why_mentor) {
      alert('Please fill in all required fields');
      return;
    }
    if (!formData.bio || formData.bio.length < 50) {
      alert('Please write a bio with at least 50 characters');
      return;
    }
    if (acceptedAgreements.length !== AGREEMENTS.length) {
      alert('You must accept all agreements to proceed');
      return;
    }

    try {
      setLoading(true);
      let avatarUrl = formData.avatar_url;
      
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      await base44.entities.MentorApplication.create({
        user_email: user.email,
        ...formData,
        avatar_url: avatarUrl,
        categories: JSON.stringify(formData.categories),
        submitted_date: new Date().toISOString(),
        status: 'pending',
        agreements_accepted: JSON.stringify(acceptedAgreements),
        agreements_timestamp: new Date().toISOString(),
        background_check_status: 'not_started',
        interview_status: 'not_scheduled',
      });
      onSubmitted();
      onClose();
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
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

        {/* Info Banner */}
        <div className="rounded-2xl p-4 mb-6" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-bold text-white text-sm mb-1">Vetting Process</h3>
              <p className="text-xs text-gray-300">All mentors must complete a background check and interview before being approved. This process ensures the safety of our GGU community.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Profile Picture Upload */}
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden flex-shrink-0"
                style={{ background: avatarPreview || formData.avatar_url ? 'transparent' : 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                {avatarPreview || formData.avatar_url ? (
                  <img src={avatarPreview || formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-white/50" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white cursor-pointer transition hover:opacity-80"
                  style={{ background: 'rgba(236,72,153,0.2)', border: '1px solid rgba(236,72,153,0.4)' }}
                >
                  <Upload size={16} />
                  {uploading ? 'Uploading...' : 'Choose Photo'}
                </label>
                <p className="text-xs text-gray-400 mt-1">Recommended: 400x400px</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{ background: 'rgba(132, 204, 22, 0.1)', border: '1px solid rgba(132, 204, 22, 0.3)' }}>
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
            <label className="text-xs font-bold text-gray-400 mb-2 block">About Me *</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="Share your story, background, and what makes you unique as a mentor... (minimum 50 characters)"
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              rows={4}
            />
            <p className="text-xs text-gray-400 mt-1">This will be visible on your mentor profile</p>
            {formData.bio && formData.bio.length < 50 && (
              <p className="text-xs text-red-400 mt-1">
                Minimum 50 characters required ({formData.bio.length}/50)
              </p>
            )}
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

          {/* Agreements Section */}
          <div className="mt-6">
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-400" />
              Required Agreements
            </h3>
            <p className="text-xs text-gray-400 mb-4">You must accept all agreements to submit your application</p>
            
            <div className="space-y-3">
              {AGREEMENTS.map(agreement => (
                <div
                  key={agreement.id}
                  className={`rounded-xl p-4 transition ${
                    acceptedAgreements.includes(agreement.id)
                      ? 'bg-green-900/20 border-green-500/30'
                      : 'bg-gray-800/50 border-gray-700'
                  }`}
                  style={{ border: '1px solid' }}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={acceptedAgreements.includes(agreement.id)}
                      onChange={() => toggleAgreement(agreement.id)}
                      className="mt-1 w-4 h-4 rounded border-gray-600 text-pink-500 focus:ring-pink-500"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-1">{agreement.title}</h4>
                      <p className="text-xs text-gray-300">{agreement.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!formData.full_name || !formData.categories.length || !formData.why_mentor || acceptedAgreements.length !== AGREEMENTS.length || loading}
            className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40 mt-6"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );
}