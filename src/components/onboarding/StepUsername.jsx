import { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function StepUsername({ data, update, onNext, onBack }) {
  const [username, setUsername] = useState(data.username || '');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const [error, setError] = useState('');

  const isValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);

  const checkUsername = async (val) => {
    setUsername(val);
    setAvailable(null);
    setError('');
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(val)) return;
    setChecking(true);
    const results = await base44.entities.UserProfile.filter({ username: val });
    setChecking(false);
    setAvailable(results.length === 0);
  };

  const handleNext = () => {
    if (!isValid) return setError('Username must be 3–20 characters, letters/numbers/underscores only.');
    if (available === false) return setError('That username is already taken.');
    update({ username });
    onNext();
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">✨</div>
        <h2 className="text-2xl font-bold mb-1">Choose Your Username</h2>
        <p className="text-gray-400 text-sm">This is how you'll appear in the GGU community.</p>
      </div>

      <div className="relative mb-2">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
        <input
          type="text"
          value={username}
          onChange={e => checkUsername(e.target.value)}
          placeholder="yourusername"
          maxLength={20}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-8 pr-4 py-3 text-white text-sm outline-none focus:border-pink-500 transition"
        />
      </div>

      <div className="text-xs mb-4 h-4">
        {checking && <span className="text-gray-400">Checking availability…</span>}
        {!checking && available === true && isValid && <span className="text-green-400">✓ @{username} is available!</span>}
        {!checking && available === false && <span className="text-red-400">✗ @{username} is already taken.</span>}
        {error && <span className="text-red-400">{error}</span>}
      </div>

      <p className="text-xs text-gray-600 mb-5">3–20 characters · letters, numbers, underscores only</p>

      <button onClick={handleNext} disabled={!isValid || available === false || checking} className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm disabled:opacity-40 transition">
        Continue →
      </button>
      <button onClick={onBack} className="w-full py-3 text-gray-500 text-sm mt-2 hover:text-gray-300 transition">← Back</button>
    </div>
  );
}