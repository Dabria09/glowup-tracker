import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Ticket, HelpCircle, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BottomNav from '@/components/BottomNav';

const CATEGORIES = ['Bug / Technical Issue', 'Account Help', 'Content / Safety Report', 'Mentorship Issue', 'Billing / Points', 'Other'];

export default function Support() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ email: '', category: '', title: '', description: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm(f => ({ ...f, email: u.email }));
    }).catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!form.email || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.category) e.category = 'Please select a category';
    if (!form.title.trim()) e.title = 'Subject required';
    if (form.description.trim().length < 20) e.description = 'Please describe your issue (at least 20 characters)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitTicket = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await base44.entities.SupportTicket.create({
      user_email: form.email,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_'),
      status: 'open',
      priority: 'medium',
    });
    setSubmitting(false);
    setSubmitted(true);
    setForm({ email: user?.email || '', category: '', title: '', description: '' });
  };



  return (
    <div className="min-h-screen text-white pb-28" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="px-4 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h1 className="text-2xl font-bold">Help {'&'} Support</h1>
        </div>

        {/* Create a Ticket */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.25)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(236,72,153,0.2)' }}>
              <Ticket size={20} className="text-pink-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Create a Support Ticket</h3>
              <p className="text-xs text-gray-400">Our team will respond within 2 business days</p>
            </div>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center py-4 gap-3">
              <CheckCircle size={40} className="text-green-400" />
              <p className="font-bold text-white">Ticket Submitted! ✅</p>
              <p className="text-sm text-gray-400 text-center">We'll review your issue and get back to you soon.</p>
              <button onClick={() => setSubmitted(false)} className="px-4 py-2 rounded-full text-sm font-semibold text-pink-400" style={{ border: '1px solid rgba(236,72,153,0.3)' }}>Submit Another</button>
            </div>
          ) : !showTicketForm ? (
            <button
              onClick={() => setShowTicketForm(true)}
              className="w-full py-3 rounded-2xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
            >
              + Open a Ticket
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Your Email *</label>
                <input
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  type="email"
                  placeholder="your@email.com"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${errors.email ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'}` }}
                />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Category *</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${errors.category ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'}`, colorScheme: 'dark' }}
                >
                  <option value="">Select a category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-xs text-red-400 mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Subject *</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Brief description of your issue"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${errors.title ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'}` }}
                />
                {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Describe Your Issue *</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Please describe what happened in detail. Include any steps to reproduce the issue..."
                  rows={5}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${errors.description ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'}` }}
                />
                <p className="text-xs text-gray-500 mt-1">{form.description.length} characters (min 20)</p>
                {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTicketForm(false)}
                  className="flex-1 py-3 rounded-xl text-sm text-gray-400"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >Cancel</button>
                <button
                  onClick={submitTicket}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
                >{submitting ? 'Submitting...' : 'Submit Ticket'}</button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Help */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="text-lg font-bold text-white mb-3">💡 Quick Help</h3>
          <div className="space-y-3 text-gray-300 text-sm">
            <p>
              <strong className="text-white">Account Issues:</strong> Go to Settings → Account to manage your profile, 
              privacy settings, and notification preferences.
            </p>
            <p>
              <strong className="text-white">Technical Problems:</strong> Try refreshing the page or clearing your 
              browser cache. If the issue persists, contact support.
            </p>
            <p>
              <strong className="text-white">Safety Concerns:</strong> Report any inappropriate behavior immediately 
              using the report button or contact a trusted adult.
            </p>
          </div>
        </div>

        {/* Emergency Resources */}
        <div className="mt-6 rounded-2xl p-6" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <h3 className="text-lg font-bold text-white mb-2">🆘 Emergency Resources</h3>
          <p className="text-gray-300 text-sm mb-3">
            If you're in crisis or need immediate help, please reach out to these resources:
          </p>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• National Suicide Prevention Lifeline: 988</li>
            <li>• Crisis Text Line: Text HOME to 741741</li>
            <li>• Childhelp National Child Abuse Hotline: 1-800-422-4453</li>
          </ul>
        </div>
      </div>

      <BottomNav active="discover" />
    </div>
  );
}