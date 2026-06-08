import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail, Clock, FileText, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function generateAppId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'GGU-';
  for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)];
  id += '-';
  for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export default function StepComplete({ fullName, email, mentorTrack, parentEmail }) {
  const navigate = useNavigate();
  const appId = useMemo(() => generateAppId(), []);
  const firstName = (fullName || '').split(' ')[0] || 'Mentor';
  const isAdult = mentorTrack === 'adult';
  const isTeen = mentorTrack === 'teen';

  const stages = [
    { num: 1, emoji: '✅', label: 'Application Submitted', desc: 'Your application is in our system', current: true, show: true },
    { num: 2, emoji: '🔍', label: 'Under Review', desc: 'GGU team reviews your application', current: false, show: true },
    { num: 3, emoji: '📅', label: 'Interview Scheduled', desc: 'Video call with a GGU coordinator', current: false, show: true },
    { num: 4, emoji: '🔒', label: 'Background Check In Progress', desc: 'Safety verification — adult mentors only', current: false, show: isAdult },
    { num: 5, emoji: '📚', label: 'Mentor Lesson Required', desc: 'Complete the GGU Mentor Lesson (pass with 80%+)', current: false, show: true },
    { num: 6, emoji: '⚖️', label: 'Final Decision', desc: 'Welcome to the mentor community — or next steps if declined', current: false, show: true },
  ].filter(s => s.show);

  return (
    <div className="space-y-6 pb-4">
      {/* Logo */}
      <div className="text-center">
        <div style={{ fontFamily: '"Playfair Display", serif', fontWeight: 900, fontSize: 24, background: 'linear-gradient(135deg, #e8526d, #f1b610)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Girls Glowing Up™
        </div>
      </div>

      {/* Celebration Graphic */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-pink-500/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative w-24 h-24 rounded-full flex items-center justify-center border-2 border-pink-400/30 shadow-xl"
            style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.3), rgba(168,85,247,0.3))' }}>
            <CheckCircle2 className="h-12 w-12 text-pink-400" />
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white" style={{ fontFamily: '"Playfair Display", serif' }}>
          Application Submitted! ✨
        </h2>
        <p className="text-gray-300 text-base leading-relaxed">
          Thank you, <span className="text-pink-300 font-semibold">{firstName}</span>! Your GGU mentor application has been received and is now under review.
        </p>
      </div>

      {/* Application ID */}
      <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><FileText className="h-3 w-3" /> Your Application ID</p>
          <p className="text-xl font-mono font-bold text-white tracking-widest">{appId}</p>
        </div>
        <span className="text-3xl">📋</span>
      </div>

      {/* Teen Consent Warning */}
      {isTeen && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-200">Consent Verification Required</p>
            <p className="text-xs text-amber-300/80 mt-1">
              Your application is <strong>on hold</strong> until your parent or guardian confirms consent. Please ask them to check their email
              {parentEmail ? <> at <strong>{parentEmail}</strong></> : ''}.
            </p>
          </div>
        </div>
      )}

      {/* 6-Stage Progress Tracker */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-white">What Happens Next</h3>
          <span className="ml-auto text-xs text-pink-300 font-medium">5–7 business days</span>
        </div>
        <div className="space-y-2">
          {stages.map((stage, idx) => (
            <div
              key={stage.num}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border transition-all ${
                stage.current
                  ? 'bg-pink-500/15 border-pink-500/30'
                  : 'bg-white/3 border-white/8 opacity-60'
              }`}
            >
              <span className="text-lg w-7 text-center">{stage.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${stage.current ? 'text-pink-200' : 'text-gray-300'}`}>
                  Stage {idx + 1} — {stage.label}
                </p>
                <p className="text-xs text-gray-500 truncate">{stage.desc}</p>
              </div>
              {stage.current && (
                <span className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full font-semibold shrink-0">
                  Current
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info Block */}
      <div className="space-y-2">
        <div className="rounded-lg border border-white/10 bg-white/5 p-3 flex gap-3 items-start text-xs text-gray-400">
          <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span>Most applications are reviewed within <strong className="text-white">5 to 7 business days.</strong></span>
        </div>
        {email && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 flex gap-3 items-start text-xs text-gray-400">
            <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>You will receive an email notification at <strong className="text-white">{email}</strong> when your status updates.</span>
          </div>
        )}
        <div className="rounded-lg border border-white/10 bg-white/5 p-3 flex gap-3 items-start text-xs text-gray-400">
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span>You can check your application status anytime by logging into your mentor account.</span>
        </div>
      </div>

      {/* CTA */}
      <Button
        onClick={() => navigate('/mentor-dashboard')}
        className="w-full py-3 text-white font-semibold rounded-xl text-base"
        style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)', boxShadow: '0 4px 20px rgba(236,72,153,0.3)' }}
        size="lg"
      >
        Go to My Dashboard →
      </Button>
    </div>
  );
}