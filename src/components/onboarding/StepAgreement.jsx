import { useState } from 'react';

export default function StepAgreement({ data, update, onNext, onBack }) {
  const [tos, setTos] = useState(data.agreed_to_tos || false);
  const [privacy, setPrivacy] = useState(data.agreed_to_privacy || false);
  const [stage, setStage] = useState(data.stage || '');

  const isUnder13 = data.age < 13;
  const canContinue = tos && privacy && stage;

  const handleNext = () => {
    update({ agreed_to_tos: tos, agreed_to_privacy: privacy, stage });
    onNext();
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <h2 className="text-2xl font-bold text-center mb-1">Almost There! 🌟</h2>
      <p className="text-gray-400 text-sm text-center mb-6">Just a few more things before you start glowing.</p>

      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-300 mb-3">Pick your stage:</p>
        <div className="grid grid-cols-3 gap-2">
          {[{ id: 'Girl', emoji: '🌸', label: 'Girl' }, { id: 'Mom', emoji: '💗', label: 'Mom' }, { id: 'Sis', emoji: '✨', label: 'Sis' }].map(s => (
            <button
              key={s.id}
              onClick={() => setStage(s.id)}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-sm font-semibold transition ${stage === s.id ? 'border-pink-500 bg-pink-500/10 text-white' : 'border-gray-700 text-gray-400'}`}
            >
              <span className="text-2xl">{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 bg-gray-800 rounded-xl p-3 text-sm text-center text-gray-300">
        You're joining as a <strong className="text-pink-400">
          {data.age_group === 'glow_girls' ? '🌱 Glow Girl' : data.age_group === 'glow_teens' ? '🌸 Glow Teen' : '👑 Glow Woman'}
        </strong>
      </div>

      {isUnder13 && (
        <div className="mb-4 bg-blue-900/30 border border-blue-700/40 rounded-xl p-3 text-xs text-blue-300">
          📧 A consent email will be sent to your parent at <strong>{data.parent_email}</strong>.
        </div>
      )}

      <div className="space-y-3 mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={tos} onChange={e => setTos(e.target.checked)} className="mt-0.5 accent-pink-500" />
          <span className="text-sm text-gray-300">
            I agree to the <a href="https://gguapp.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline">Terms of Service</a>
            {isUnder13 ? ' (my parent/guardian has read and agrees)' : ''}
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={privacy} onChange={e => setPrivacy(e.target.checked)} className="mt-0.5 accent-pink-500" />
          <span className="text-sm text-gray-300">
            I agree to the <a href="https://gguapp.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-pink-400 underline">Privacy Policy</a>
            {isUnder13 ? ' (my parent/guardian has read and agrees)' : ''}
          </span>
        </label>
      </div>

      <button onClick={handleNext} disabled={!canContinue} className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm disabled:opacity-40 transition">
        {isUnder13 ? 'Submit for Parent Approval →' : 'Complete Signup →'}
      </button>
      <button onClick={onBack} className="w-full py-3 text-gray-500 text-sm mt-2 hover:text-gray-300 transition">← Back</button>
    </div>
  );
}