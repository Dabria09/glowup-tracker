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
  if (age >= 10 && age <= 13) return 'glow_girls';
  if (age >= 14 && age <= 19) return 'glow_teens';
  if (age >= 20) return 'glow_women';
  return null;
}

const AGE_GROUP_INFO = {
  glow_girls: { label: '🌱 Glow Girl', desc: 'Ages 10–13', color: 'text-green-400' },
  glow_teens: { label: '🌸 Glow Teen', desc: 'Ages 14–19', color: 'text-pink-400' },
  glow_women: { label: '👑 Glow Woman', desc: 'Ages 20+', color: 'text-purple-400' },
};

export default function StepDOB({ data, update, onNext }) {
  const [dob, setDob] = useState(data.date_of_birth || '');
  const [ageInput, setAgeInput] = useState(data.age ? String(data.age) : '');
  const [mode, setMode] = useState('calendar'); // 'calendar' | 'age'
  const [error, setError] = useState('');

  const handleNext = () => {
    if (mode === 'calendar') {
      if (!dob) return setError('Please enter your date of birth.');
      const age = calcAge(dob);
      const group = getAgeGroup(age);
      if (age < 10) return setError('You must be at least 10 years old to join.');
      update({ date_of_birth: dob, age, age_group: group });
    } else {
      const age = parseInt(ageInput, 10);
      if (!ageInput || isNaN(age)) return setError('Please enter your age.');
      if (age < 10) return setError('You must be at least 10 years old to join.');
      const group = getAgeGroup(age);
      update({ age, age_group: group });
    }
    onNext();
  };

  const preview = mode === 'calendar' && dob ? calcAge(dob) : (ageInput ? parseInt(ageInput, 10) : null);
  const group = preview !== null && !isNaN(preview) ? getAgeGroup(preview) : null;

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🎂</div>
        <h2 className="text-2xl font-bold font-poppins mb-1">When's your birthday?</h2>
        <p className="text-muted-foreground text-sm">We use this to keep your experience age-appropriate and safe. GGU is for ages 10 and up.</p>
      </div>

      {/* Toggle */}
      <div className="flex rounded-full bg-secondary p-1 mb-4">
        <button onClick={() => { setMode('calendar'); setError(''); }} className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${mode === 'calendar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>📅 Birthday</button>
        <button onClick={() => { setMode('age'); setError(''); }} className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${mode === 'age' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>🔢 Enter Age</button>
      </div>

      {mode === 'calendar' ? (
        <input
          type="date"
          value={dob}
          onChange={e => { setDob(e.target.value); setError(''); }}
          max={new Date().toISOString().split('T')[0]}
          className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:border-primary transition mb-3"
        />
      ) : (
        <input
          type="number"
          value={ageInput}
          onChange={e => { setAgeInput(e.target.value); setError(''); }}
          placeholder="Enter your age"
          min="10"
          max="120"
          className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:border-primary transition mb-3"
        />
      )}

      {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

      {group && (
        <div className="bg-secondary rounded-xl p-3 text-center mb-4">
          <p className="text-xs text-muted-foreground mb-1">You'll join as</p>
          <p className={`font-bold text-lg font-poppins ${AGE_GROUP_INFO[group].color}`}>{AGE_GROUP_INFO[group].label}</p>
          <p className="text-xs text-muted-foreground">{AGE_GROUP_INFO[group].desc}</p>
          {preview < 13 && <p className="text-xs text-amber-500 mt-2">⚠️ Parental consent required for under-13</p>}
        </div>
      )}

      <button onClick={handleNext} disabled={mode === 'calendar' ? !dob : !ageInput} className="w-full py-3 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm disabled:opacity-40 transition">
        Continue →
      </button>
    </div>
  );
}