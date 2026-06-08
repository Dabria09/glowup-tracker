import { useState } from 'react';

export default function StepSafetyConduct({ data, update, onNext, onBack, userAge }) {
  const [errors, setErrors] = useState({});
  const [teenAcknowledged, setTeenAcknowledged] = useState(false);

  // Only show for adult mentors (18+)
  const isAdult = userAge !== null && userAge >= 18;

  const validate = () => {
    if (!isAdult) {
      onNext();
      return;
    }

    const newErrors = {};
    if (data.felony_conviction === undefined) {
      newErrors.felony_conviction = 'Please answer this question';
    }
    if (data.restraining_order === undefined) {
      newErrors.restraining_order = 'Please answer this question';
    }
    if (data.removed_from_minors_role === undefined) {
      newErrors.removed_from_minors_role = 'Please answer this question';
    }
    if (!data.consent_background_check) {
      newErrors.consent_background_check = 'You must consent to a background check';
    }
    if (!data.understand_application_hold) {
      newErrors.understand_application_hold = 'You must acknowledge this condition';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const YesNoQuestion = ({ name, label }) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-white mb-3">
        {label} <span className="text-pink-400">*</span>
      </label>
      <div className="flex gap-4">
        <label className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
          <input
            type="radio"
            name={name}
            value="yes"
            checked={data[name] === 'yes'}
            onChange={(e) => update({ [name]: e.target.value === 'yes' ? 'yes' : 'no' })}
            className="w-4 h-4 text-pink-600 focus:ring-pink-500"
          />
          <span className="text-sm text-white">Yes</span>
        </label>
        <label className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
          <input
            type="radio"
            name={name}
            value="no"
            checked={data[name] === 'no'}
            onChange={(e) => update({ [name]: e.target.value === 'yes' ? 'yes' : 'no' })}
            className="w-4 h-4 text-pink-600 focus:ring-pink-500"
          />
          <span className="text-sm text-white">No</span>
        </label>
      </div>
      {errors[name] && (
        <p className="text-red-400 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  );

  // Teen mentor safety guidelines
  if (!isAdult) {
    const guidelines = [
      { emoji: '👨‍👩‍👧', title: 'Parent / Guardian Availability', body: 'Your parent or guardian must remain contactable throughout your time as a mentor. GGU staff may reach out to them at any time regarding your conduct or participation.' },
      { emoji: '🔒', title: 'Safe Digital Boundaries', body: 'Never share your personal phone number, social media handles, or any contact details with mentees. All communication must take place inside the GGU platform.' },
      { emoji: '🚫', title: 'Zero Tolerance Policy', body: 'Bullying, harassment, or sharing any inappropriate content will result in your immediate suspension and your parent or guardian being notified directly.' },
      { emoji: '🆘', title: 'Report Uncomfortable Interactions', body: 'If any interaction ever makes you feel unsafe or uncomfortable, report it immediately using the in-app report button and contact GGU at mentors@girlsglowingup.com.' },
    ];

    return (
      <div className="flex flex-col items-center text-center gap-6">
        <div>
          <div className="text-4xl mb-3">🛡️</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Teen Mentor Safety Standards</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            As a teen mentor, please read and acknowledge these safety guidelines before continuing.
          </p>
        </div>

        <div className="w-full space-y-3 text-left">
          {guidelines.map((g) => (
            <div key={g.title} className="flex gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-2xl">{g.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-white mb-1">{g.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{g.body}</p>
              </div>
            </div>
          ))}
        </div>

        <label className="w-full flex items-start gap-3 p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 cursor-pointer text-left">
          <input
            type="checkbox"
            checked={teenAcknowledged}
            onChange={(e) => setTeenAcknowledged(e.target.checked)}
            className="w-5 h-5 mt-0.5 accent-pink-500 shrink-0"
          />
          <span className="text-sm text-white">
            I have read and understand these Teen Safety Standards, and I agree to follow them under parental oversight.
            <span className="text-pink-400"> *</span>
          </span>
        </label>

        <div className="w-full flex gap-3">
          <button onClick={onBack} className="flex-1 py-3 rounded-2xl font-semibold text-sm text-muted-foreground border border-border hover:bg-muted transition">
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!teenAcknowledged}
            className="flex-1 py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed transition"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center gap-6">
      <div>
        <div className="text-4xl mb-3">🛡️</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Safety & Conduct</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Please answer the following screening questions honestly. All information is confidential.
        </p>
      </div>

      <div className="w-full text-left bg-white/5 p-5 rounded-2xl border border-white/10">
        <YesNoQuestion
          name="felony_conviction"
          label="Have you ever been convicted of a felony?"
        />
        
        <YesNoQuestion
          name="restraining_order"
          label="Have you ever had a restraining order filed against you?"
        />
        
        <YesNoQuestion
          name="removed_from_minors_role"
          label="Have you ever been removed from a role working with minors?"
        />
      </div>

      <div className="w-full text-left bg-white/5 p-5 rounded-2xl border border-white/10">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.consent_background_check || false}
            onChange={(e) => update({ consent_background_check: e.target.checked })}
            className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500 mt-0.5"
          />
          <span className="text-sm text-white">
            I consent to a background check as part of the mentor application process.
            <span className="text-pink-400">*</span>
          </span>
        </label>
        {errors.consent_background_check && (
          <p className="text-red-400 text-xs mt-1 ml-7">{errors.consent_background_check}</p>
        )}

        <label className="flex items-start gap-3 cursor-pointer mt-4">
          <input
            type="checkbox"
            checked={data.understand_application_hold || false}
            onChange={(e) => update({ understand_application_hold: e.target.checked })}
            className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500 mt-0.5"
          />
          <span className="text-sm text-white">
            I understand my application will not proceed without a cleared background check.
            <span className="text-pink-400">*</span>
          </span>
        </label>
        {errors.understand_application_hold && (
          <p className="text-red-400 text-xs mt-1 ml-7">{errors.understand_application_hold}</p>
        )}
      </div>

      <div className="w-full flex gap-3 mt-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-2xl font-semibold text-sm text-muted-foreground border border-border hover:bg-muted transition"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3 rounded-2xl font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}