import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Award, BookOpen, Users, Heart, Shield, Star, CheckCircle, Loader2 } from 'lucide-react';

const STEPS = ['welcome', 'professional', 'safety', 'agreements', 'complete'];

export default function MentorOnboarding({ user }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    categories: [],
    expertise: '',
    experience_years: '',
    why_mentor: '',
    availability: 'Weekly',
    session_type: 'Video Call',
    agreements_accepted: [],
  });

  const CATEGORIES = [
    'Career', 'Education', 'Business', 'Wellness', 'Faith', 
    'Relationships', 'Leadership', 'Confidence', 'Mental Health', 'Life Skills'
  ];

  const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create mentor application
      await base44.entities.MentorApplication.create({
        user_email: user.email,
        full_name: user.full_name,
        title: formData.title,
        bio: formData.bio,
        categories: JSON.stringify(formData.categories),
        expertise: formData.expertise,
        experience_years: parseFloat(formData.experience_years) || 0,
        why_mentor: formData.why_mentor,
        availability: formData.availability,
        session_type: formData.session_type,
        status: 'pending',
        submitted_date: new Date().toISOString(),
        agreements_accepted: JSON.stringify(formData.agreements_accepted),
        agreements_timestamp: new Date().toISOString(),
      });

      // Create mentor profile
      await base44.entities.Mentor.create({
        user_email: user.email,
        full_name: user.full_name,
        title: formData.title,
        bio: formData.bio,
        categories: JSON.stringify(formData.categories),
        expertise: formData.expertise,
        availability: formData.availability,
        session_type: formData.session_type,
        application_status: 'pending_review',
        is_approved: false,
      });

      // Update user account
      await base44.auth.updateMe({
        account_type: 'mentor',
        mentor_status: 'pending',
        active_mode: 'mentor',
      });

      navigate('/mentor-dashboard');
    } catch (err) {
      console.error('Mentor onboarding failed:', err);
      alert('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = STEPS[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0608] via-[#1a0a10] to-[#2d0f1a] text-white px-6 py-8 font-['Poppins',sans-serif]">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e8526d] to-[#f1b610] flex items-center justify-center">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mentor Registration</h1>
            <p className="text-sm text-white/50">Complete your application to join Girls Glowing Up™</p>
          </div>
        </div>

        {/* Progress */}
        {currentStep !== 'complete' && (
          <div className="flex gap-2">
            {STEPS.filter(s => s !== 'complete').map((s, i) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  i <= step ? 'bg-gradient-to-r from-[#e8526d] to-[#f1b610]' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto">
        {/* STEP 1: Welcome */}
        {currentStep === 'welcome' && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
            <div className="text-6xl mb-6">👩‍🏫</div>
            <h2 className="text-3xl font-bold mb-4">Welcome, Mentor!</h2>
            <p className="text-white/60 mb-8 leading-relaxed">
              Thank you for wanting to make a difference in the lives of girls and young women. 
              Your wisdom, experience, and guidance can transform lives.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: Heart, label: 'Make an Impact', color: '#e8526d' },
                { icon: Users, label: 'Guide Future Leaders', color: '#f1b610' },
                { icon: BookOpen, label: 'Share Your Knowledge', color: '#a855f7' },
                { icon: Shield, label: 'Safe & Supported', color: '#06b6d4' },
              ].map(item => (
                <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <item.icon size={24} style={{ color: item.color }} className="mx-auto mb-2" />
                  <p className="text-xs font-semibold">{item.label}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 rounded-2xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #e8526d, #f1b610)' }}
            >
              Start Application →
            </button>
          </div>
        )}

        {/* STEP 2: Professional Info */}
        {currentStep === 'professional' && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Award size={24} /> Professional Background
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Professional Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Software Engineer, Therapist, Entrepreneur"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#e8526d]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Bio *</label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself, your background, and what makes you unique..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#e8526d] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Areas of Expertise *</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        const exists = formData.categories.includes(cat);
                        setFormData({
                          ...formData,
                          categories: exists
                            ? formData.categories.filter(c => c !== cat)
                            : [...formData.categories, cat]
                        });
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        formData.categories.includes(cat)
                          ? 'bg-gradient-to-r from-[#e8526d] to-[#f1b610] text-white'
                          : 'bg-white/5 border border-white/10 text-white/60 hover:border-[#e8526d]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Years of Experience *</label>
                <input
                  type="number"
                  value={formData.experience_years}
                  onChange={e => setFormData({ ...formData, experience_years: e.target.value })}
                  placeholder="e.g., 5"
                  min="0"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#e8526d]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Specific Expertise *</label>
                <input
                  type="text"
                  value={formData.expertise}
                  onChange={e => setFormData({ ...formData, expertise: e.target.value })}
                  placeholder="e.g., Career transitions, Public speaking, Work-life balance"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#e8526d]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={handleBack} className="flex-1 py-3 rounded-xl font-semibold text-white/60 border border-white/10 hover:bg-white/5">
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!formData.title || !formData.bio || formData.categories.length === 0 || !formData.experience_years}
                className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #e8526d, #f1b610)' }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Safety & Preferences */}
        {currentStep === 'safety' && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield size={24} /> Safety & Availability
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Why do you want to mentor? *</label>
                <textarea
                  value={formData.why_mentor}
                  onChange={e => setFormData({ ...formData, why_mentor: e.target.value })}
                  placeholder="Share your motivation for wanting to mentor..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#e8526d] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Availability *</label>
                <select
                  value={formData.availability}
                  onChange={e => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e8526d]"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-weekly">Bi-weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="One-time">One-time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Preferred Session Type *</label>
                <select
                  value={formData.session_type}
                  onChange={e => setFormData({ ...formData, session_type: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#e8526d]"
                >
                  <option value="Video Call">Video Call</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="Chat">Chat</option>
                  <option value="In-person">In-person</option>
                </select>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm text-white/70 mb-3">
                  ✓ I understand that all mentors must pass a background check and complete training before being approved.
                </p>
                <p className="text-xs text-white/50">
                  This ensures the safety of our community members.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={handleBack} className="flex-1 py-3 rounded-xl font-semibold text-white/60 border border-white/10 hover:bg-white/5">
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!formData.why_mentor}
                className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #e8526d, #f1b610)' }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Agreements */}
        {currentStep === 'agreements' && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CheckCircle size={24} /> Terms & Agreements
            </h2>

            <div className="space-y-4 mb-8">
              {[
                { id: 'tos', text: 'I agree to the Terms of Service' },
                { id: 'privacy', text: 'I agree to the Privacy Policy' },
                { id: 'conduct', text: 'I agree to follow the Mentor Code of Conduct' },
                { id: 'safety', text: 'I understand my duty to report any safety concerns' },
              ].map(item => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={formData.agreements_accepted.includes(item.id)}
                    onChange={e => {
                      const checked = e.target.checked;
                      setFormData({
                        ...formData,
                        agreements_accepted: checked
                          ? [...formData.agreements_accepted, item.id]
                          : formData.agreements_accepted.filter(a => a !== item.id)
                      });
                    }}
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-[#e8526d] focus:ring-[#e8526d]"
                  />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                    {item.text}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={handleBack} className="flex-1 py-3 rounded-xl font-semibold text-white/60 border border-white/10 hover:bg-white/5">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={formData.agreements_accepted.length < 4 || loading}
                className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #e8526d, #f1b610)' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} />}
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Complete */}
        {currentStep === 'complete' && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold mb-4">Application Submitted!</h2>
            <p className="text-white/60 mb-8 leading-relaxed">
              Thank you for applying to become a mentor. Our team will review your application 
              and contact you within 5-7 business days.
            </p>
            <button
              onClick={() => navigate('/mentor-dashboard')}
              className="px-8 py-4 rounded-2xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #e8526d, #f1b610)' }}
            >
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}