import React, { useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';

function YesNoQuestion({ label, value, expValue, onAnswer, onExplain, expError }) {
  return (
    <div className="mb-5 space-y-2">
      <label className="block text-sm font-semibold text-white leading-relaxed">
        {label} <span className="text-pink-400">*</span>
      </label>
      <div className="flex gap-3">
        {['yes', 'no'].map(opt => (
          <label key={opt} className={`flex-1 flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition capitalize ${
            value === opt ? 'bg-pink-500/10 border-pink-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}>
            <input type="radio" value={opt} checked={value === opt} onChange={() => onAnswer(opt)}
              className="w-4 h-4 accent-pink-500" />
            <span className="text-sm font-medium text-white capitalize">{opt}</span>
          </label>
        ))}
      </div>
      {value === 'yes' && (
        <div className="space-y-1 mt-1">
          <label className="block text-xs font-semibold text-pink-300">
            Please explain (dates, details, resolution) <span className="text-pink-400">*</span>
          </label>
          <textarea
            value={expValue || ''}
            onChange={e => onExplain(e.target.value)}
            rows={3}
            placeholder="Provide context and details here..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm transition resize-none"
          />
          {expError && <p className="text-red-400 text-xs">{expError}</p>}
        </div>
      )}
    </div>
  );
}

export default function StepBackgroundCheck({ data, update, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.felony_conviction) e.felony_conviction = 'Required.';
    else if (data.felony_conviction === 'yes' && !data.felony_explanation?.trim()) e.felony_explanation = 'Please provide an explanation.';
    if (!data.restraining_order) e.restraining_order = 'Required.';
    else if (data.restraining_order === 'yes' && !data.restraining_explanation?.trim()) e.restraining_explanation = 'Please provide an explanation.';
    if (!data.removed_from_minors_role) e.removed_from_minors_role = 'Required.';
    else if (data.removed_from_minors_role === 'yes' && !data.removed_explanation?.trim()) e.removed_explanation = 'Please provide an explanation.';
    if (!data.consent_background_check) e.consent_background_check = 'Required.';
    if (!data.understand_application_hold) e.understand_application_hold = 'Required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const canContinue = data.consent_background_check && data.understand_application_hold;

  return (
    <div className="flex flex-col items-center text-center gap-6">
      <div>
        <div className="text-4xl mb-3">🛡️</div>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>Background Check Required</h2>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">Please complete your screening disclosure and security consent.</p>
      </div>

      <div className="w-full space-y-5 text-left">
        {/* Highlighted notice */}
        <div className="p-5 rounded-2xl bg-pink-500/10 border border-pink-500/25 flex gap-4">
          <Shield className="h-6 w-6 text-pink-400 shrink-0 mt-0.5" />
          <p className="text-sm text-pink-100/90 leading-relaxed">
            All adult GGU mentors are required to complete a background check before being approved to work with girls. This is a mandatory requirement and is in place to protect the safety of every girl on our platform.
          </p>
        </div>

        {/* Yes/No Questions */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <YesNoQuestion
            label="Have you ever been convicted of a felony?"
            value={data.felony_conviction}
            expValue={data.felony_explanation}
            onAnswer={v => { update({ felony_conviction: v, felony_explanation: v === 'no' ? '' : data.felony_explanation }); setErrors(p => ({ ...p, felony_conviction: null })); }}
            onExplain={v => { update({ felony_explanation: v }); setErrors(p => ({ ...p, felony_explanation: null })); }}
            expError={errors.felony_explanation}
          />
          <YesNoQuestion
            label="Have you ever had a restraining order filed against you?"
            value={data.restraining_order}
            expValue={data.restraining_explanation}
            onAnswer={v => { update({ restraining_order: v, restraining_explanation: v === 'no' ? '' : data.restraining_explanation }); setErrors(p => ({ ...p, restraining_order: null })); }}
            onExplain={v => { update({ restraining_explanation: v }); setErrors(p => ({ ...p, restraining_explanation: null })); }}
            expError={errors.restraining_explanation}
          />
          <YesNoQuestion
            label="Have you ever been removed from a role working with minors?"
            value={data.removed_from_minors_role}
            expValue={data.removed_explanation}
            onAnswer={v => { update({ removed_from_minors_role: v, removed_explanation: v === 'no' ? '' : data.removed_explanation }); setErrors(p => ({ ...p, removed_from_minors_role: null })); }}
            onExplain={v => { update({ removed_explanation: v }); setErrors(p => ({ ...p, removed_explanation: null })); }}
            expError={errors.removed_explanation}
          />
        </div>

        {/* Required Checkboxes */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={data.consent_background_check || false}
              onChange={e => update({ consent_background_check: e.target.checked })}
              className="w-5 h-5 mt-0.5 accent-pink-500 shrink-0" />
            <span className="text-sm text-white leading-relaxed">
              I consent to a background check as part of the GGU mentor approval process <span className="text-pink-400">*</span>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={data.understand_application_hold || false}
              onChange={e => update({ understand_application_hold: e.target.checked })}
              className="w-5 h-5 mt-0.5 accent-pink-500 shrink-0" />
            <span className="text-sm text-white leading-relaxed">
              I understand my application will not move forward without a cleared background check <span className="text-pink-400">*</span>
            </span>
          </label>
        </div>

        {/* Bottom note */}
        <div className="flex gap-2.5 px-1">
          <AlertCircle className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400 italic leading-relaxed">
            The background check will be initiated by GGU admin after your application is reviewed. You will receive an email from our background check provider with next steps.
          </p>
        </div>
      </div>

      <div className="w-full flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 rounded-2xl font-semibold text-sm text-gray-400"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          Back
        </button>
        <button onClick={() => { if (validate()) onNext(); }} disabled={!canContinue}
          className="flex-1 py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed transition"
          style={{ background: canContinue ? 'linear-gradient(135deg, #ec4899, #a855f7)' : '#374151' }}>
          Continue
        </button>
      </div>
    </div>
  );
}