import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, Users, Sparkles, CheckCircle, AlertCircle, Upload, User, UserPlus } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const CATEGORIES = ['Career', 'Education', 'Business', 'Wellness', 'Faith', 'Relationships', 'Cooking', 'Identity', 'Find Your Purpose', 'Skill Building'];
const AVAILABILITY = ['Weekly', 'Bi-weekly', 'Monthly', 'One-time'];
const SESSION_TYPES = ['Video Call', 'Phone Call', 'Chat', 'In-person'];

const AGREEMENTS = [
  { id: 'code_of_conduct', title: 'Code of Conduct', text: 'I agree to uphold GGU\'s values of empowerment, authenticity, equity, community, integrity, and wholeness.' },
  { id: 'mandatory_reporting', title: 'Mandatory Reporting', text: 'I understand I must report any signs of abuse, neglect, or harm disclosed during mentorship sessions.' },
  { id: 'confidentiality', title: 'Confidentiality', text: 'I agree to protect the privacy and personal information of all mentees.' },
  { id: 'age_gating', title: 'Age-Gated Interactions', text: 'I understand: no 1:1 video with girls under 14; group sessions only at 13; 1:1 only with parental consent for ages 14-18.' },
  { id: 'platform_rules', title: 'Platform Rules', text: 'I agree to keep all interactions within the GGU App and will not initiate off-platform contact with minors.' },
  { id: 'media_release', title: 'Media Awareness', text: 'I understand what can and cannot be shared publicly regarding my mentorship activities.' },
];

export default function MentorRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Account, 2: Application
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  
  // Application data
  const [formData, setFormData] = useState({
    full_name: '', title: '', bio: '', expertise: '', experience_years: '',
    why_mentor: '', availability: '', session_type: '', categories: [],
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [acceptedAgreements, setAcceptedAgreements] = useState([]);

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      setStep(2); // Move to application
      setShowOtp(false);
      toast.success("Email verified! Now complete your mentor application.");
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await base44.auth.resendOtp(email);
      toast.success("Code sent! Check your email.");
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
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
    setAcceptedAgreements(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const toggleCategory = (cat) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat) ? prev.categories.filter(c => c !== cat) : [...prev.categories, cat]
    }));
  };

  const handleApplicationSubmit = async () => {
    if (!formData.full_name || !formData.categories.length || !formData.why_mentor) {
      setError('Please fill in all required fields');
      return;
    }
    if (!formData.bio || formData.bio.length < 50) {
      setError('Please write a bio with at least 50 characters');
      return;
    }
    if (acceptedAgreements.length !== AGREEMENTS.length) {
      setError('You must accept all agreements to proceed');
      return;
    }

    try {
      setLoading(true);
      const user = await base44.auth.me();
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

      toast.success("Application submitted! We'll review within 3-5 business days.");
      navigate('/mentorship');
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Error submitting application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/mentor-register?step=2");
  };

  const handleApple = () => {
    base44.auth.loginWithProvider("apple", "/mentor-register?step=2");
  };

  // Step 1: Account Creation
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a18 40%, #0d0610 100%)' }}>
        
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute rounded-full" style={{ width: 400, height: 400, top: -100, left: -80, background: 'radial-gradient(circle, rgba(236,72,153,0.18), transparent 70%)', filter: 'blur(60px)' }} />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <img src="https://gguapp.com/manus-storage/ggu-logo-glow_54cb14fa.png" alt="Girls Glowing Up" className="w-40 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Become a Mentor ✨</h1>
            <p className="text-sm text-gray-400">Create your account to start your application</p>
          </div>

          <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>
            {showOtp ? (
              <>
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-white mb-2 text-center">Verify Your Email</h2>
                  <p className="text-sm text-gray-400 text-center mb-4">We sent a code to {email}</p>
                  <div className="flex justify-center mb-4">
                    <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus className="gap-2">
                      <InputOTPGroup>
                        <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                        <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>}
                <Button className="w-full h-12 font-bold text-white mb-3" onClick={handleVerify} disabled={loading || otpCode.length < 6}
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</> : 'Verify Email'}
                </Button>
                <p className="text-center text-sm text-gray-400">
                  Didn't receive the code? <button onClick={handleResend} className="text-pink-400 font-semibold hover:underline">Resend</button>
                </p>
              </>
            ) : (
              <>
                <Button variant="outline" className="w-full h-12 text-sm font-medium mb-3 bg-white/5 border-white/10 hover:bg-white/10 text-white" onClick={handleGoogle}>
                  <GoogleIcon className="w-5 h-5 mr-2" />
                  Continue with Google
                </Button>
                <Button variant="outline" className="w-full h-12 text-sm font-medium mb-4 bg-white/5 border-white/10 hover:bg-white/10 text-white" onClick={handleApple}>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.56 1.4-1.32 2.79-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  Continue with Apple
                </Button>

                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-3 text-gray-500">or</span>
                  </div>
                </div>

                {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>}

                <form onSubmit={handleAccountSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input id="email" type="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm" className="text-xs font-bold text-gray-400 uppercase tracking-widest">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input id="confirm" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-pink-500" required />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 font-bold text-white" disabled={loading}
                    style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...</> : <><UserPlus className="w-4 h-4 mr-2" /> Create Account</>}
                  </Button>
                </form>
              </>
            )}
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            Already have an account? <Link to="/login" className="text-pink-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Application Form
  return (
    <div className="min-h-screen text-white pb-24" style={{ background: 'radial-gradient(ellipse at top, #2d0a1e 0%, #1a0a18 40%, #0d0610 100%)' }}>
      <div className="px-4 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/mentorship')} className="text-gray-400">← Back</button>
          <div>
            <h1 className="text-2xl font-bold text-white">Mentor Application</h1>
            <p className="text-xs text-gray-400">Step 2 of 2 — Complete your profile</p>
          </div>
        </div>

        <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}>
          {/* Info Banner */}
          <div className="rounded-2xl p-4 mb-6" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-bold text-white text-sm mb-1">Vetting Process</h3>
                <p className="text-xs text-gray-300">All mentors complete a background check and interview before approval. This ensures the safety of our GGU community.</p>
              </div>
            </div>
          </div>

          {/* Tier Progression */}
          <div className="rounded-2xl p-4 mb-6" style={{ background: 'rgba(132, 204, 22, 0.1)', border: '1px solid rgba(132, 204, 22, 0.3)' }}>
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

          {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>}

          <div className="space-y-4">
            {/* Profile Picture */}
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
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" id="avatar-upload" disabled={uploading} />
                  <label htmlFor="avatar-upload" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white cursor-pointer transition hover:opacity-80"
                    style={{ background: 'rgba(236,72,153,0.2)', border: '1px solid rgba(236,72,153,0.4)' }}>
                    <Upload size={16} />
                    {uploading ? 'Uploading...' : 'Choose Photo'}
                  </label>
                  <p className="text-xs text-gray-400 mt-1">Recommended: 400x400px</p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">Full Name *</label>
              <input value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">Professional Title</label>
              <input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g., Software Engineer, Entrepreneur"
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">About Me *</label>
              <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Share your story, background, and what makes you unique... (min 50 characters)"
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} rows={4} />
              {formData.bio && formData.bio.length < 50 && <p className="text-xs text-red-400 mt-1">Minimum 50 characters required ({formData.bio.length}/50)</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">Categories *</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${formData.categories.includes(cat) ? 'text-white' : 'text-gray-400 bg-gray-800'}`}
                    style={formData.categories.includes(cat) ? { background: 'linear-gradient(135deg, #ec4899, #a855f7)' } : {}}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">Areas of Expertise</label>
              <input value={formData.expertise} onChange={(e) => setFormData({...formData, expertise: e.target.value})} placeholder="e.g., Leadership, Career Transition"
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">Years of Experience</label>
              <input type="number" value={formData.experience_years} onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value) || 0})}
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">Why do you want to mentor? *</label>
              <textarea value={formData.why_mentor} onChange={(e) => setFormData({...formData, why_mentor: e.target.value})} placeholder="Share your motivation..."
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} rows={3} />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">Availability</label>
              <select value={formData.availability} onChange={(e) => setFormData({...formData, availability: e.target.value})}
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <option value="">Select availability</option>
                {AVAILABILITY.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">Session Type</label>
              <select value={formData.session_type} onChange={(e) => setFormData({...formData, session_type: e.target.value})}
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <option value="">Select session type</option>
                {SESSION_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            {/* Agreements */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-400" />
                Required Agreements
              </h3>
              <p className="text-xs text-gray-400 mb-4">You must accept all agreements to submit your application</p>
              
              <div className="space-y-3">
                {AGREEMENTS.map(agreement => (
                  <div key={agreement.id} className={`rounded-xl p-4 transition ${acceptedAgreements.includes(agreement.id) ? 'bg-green-900/20 border-green-500/30' : 'bg-gray-800/50 border-gray-700'}`} style={{ border: '1px solid' }}>
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={acceptedAgreements.includes(agreement.id)} onChange={() => toggleAgreement(agreement.id)}
                        className="mt-1 w-4 h-4 rounded border-gray-600 text-pink-500 focus:ring-pink-500" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white mb-1">{agreement.title}</h4>
                        <p className="text-xs text-gray-300">{agreement.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleApplicationSubmit} disabled={!formData.full_name || !formData.categories.length || !formData.why_mentor || acceptedAgreements.length !== AGREEMENTS.length || loading}
              className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40 mt-6"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}