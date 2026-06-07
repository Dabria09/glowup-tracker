import { useState } from 'react';

export default function StepAgreement({ data, update, onNext, onBack }) {
  const [tos, setTos] = useState(data.agreed_to_tos || false);
  const [privacy, setPrivacy] = useState(data.agreed_to_privacy || false);

  const isUnder13 = data.age < 13;
  const canContinue = tos && privacy;

  const handleNext = () => {
    update({ agreed_to_tos: tos, agreed_to_privacy: privacy });
    onNext();
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
      <h2 className="text-2xl font-bold font-poppins text-center mb-1">Almost There! 🌟</h2>
      <p className="text-muted-foreground text-sm text-center mb-6">Just a few more things before you start glowing.</p>

      <div className="mb-5 bg-secondary rounded-xl p-3 text-sm text-center text-foreground">
        You're joining as a <strong className="text-primary font-poppins">
          {data.age_group === 'glow_girls' ? '🌱 Glow Girl' : data.age_group === 'glow_teens' ? '🌸 Glow Teen' : '👑 Glow Woman'}
        </strong>
      </div>

      {isUnder13 && (
        <div className="mb-4 bg-blue-100 border border-blue-300 rounded-xl p-3 text-xs text-blue-800">
          📧 A consent email will be sent to your parent at <strong>{data.parent_email}</strong>.
        </div>
      )}

      <div className="space-y-3 mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={tos} onChange={e => setTos(e.target.checked)} className="mt-0.5 accent-primary" />
          <span className="text-sm text-foreground">
            I agree to the <a href="https://gguapp.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary underline">Terms of Service</a>
            {isUnder13 ? ' (my parent/guardian has read and agrees)' : ''}
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={privacy} onChange={e => setPrivacy(e.target.checked)} className="mt-0.5 accent-primary" />
          <span className="text-sm text-foreground">
            I agree to the <a href="https://gguapp.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary underline">Privacy Policy</a>
            {isUnder13 ? ' (my parent/guardian has read and agrees)' : ''}
          </span>
        </label>
      </div>

      <button onClick={handleNext} disabled={!canContinue} className="w-full py-3 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm disabled:opacity-40 transition">
        {isUnder13 ? 'Submit for Parent Approval →' : 'Complete Signup →'}
      </button>
      <button onClick={onBack} className="w-full py-3 text-muted-foreground text-sm mt-2 hover:text-foreground transition">← Back</button>
    </div>
  );
}