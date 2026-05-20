import { useState } from 'react';

function calcAge(dob) {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getAgeGroup(age) {
  if (age >= 10 && age <= 12) return 'glow_girls';
  if (age >= 13 && age <= 18) return 'glow_teens';
  if (age >= 19) return 'glow_women';
  return null;
}

const AGE_GROUP_INFO = {
  glow_girls: { label: '🌱 Glow Girl', desc: 'Ages 10–12', color: 'text-green-400' },
  glow_teens: { label: '🌸 Glow Teen', desc: 'Ages 13–18', color: 'text-pink-400' },
  glow_women: { label: '👑 Glow Woman', desc: 'Ages 19+', color: 'text-purple-400' },
};

export default function StepDOB({ data, update, onNext }) {
  const [dob, setDob] = useState(data.date_of_birth || '');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!dob) return setError('Please enter your date of birth.');
    const age = calcAge(dob);
    const group = getAgeGroup(age);
    if (age < 10) return setError('You must be at least 10 years old to join.');
    update({ date_of_birth: dob, age, age_group: group });
    onNext();
  };

  const preview = dob ? calcAge(dob) : null;
  const group = preview !== null ? getAgeGroup(preview) : null;

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🎂</div>
        <h2 className="text-2xl font-bold mb-1">When's your birthday?</h2>
        <p className="text-gray-400 text-sm">We use this to keep your experience age-appropriate and safe. GGU is for ages 10 and up.</p>
      </div>

      <input
        type="date"
        value={dob}
        onChange={e => { setDob(e.target.value); setError(''); }}
        max={new Date().toISOString().split('T')[0]}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-pink-500 transition mb-3"
      />

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      {group && (
        <div className="bg-gray-800 rounded-xl p-3 text-center mb-4">
          <p className="text-xs text-gray-400 mb-1">You'll join as</p>
          <p className={`font-bold text-lg ${AGE_GROUP_INFO[group].color}`}>{AGE_GROUP_INFO[group].label}</p>
          <p className="text-xs text-gray-500">{AGE_GROUP_INFO[group].desc}</p>
          {preview < 13 && <p className="text-xs text-yellow-400 mt-2">⚠️ Parental consent required for under-13</p>}
        </div>
      )}

      <button onClick={handleNext} disabled={!dob} className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm disabled:opacity-40 transition">
        Continue →
      </button>
    </div>
  );
}