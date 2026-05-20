export default function StepParentalConsent({ data, update, onNext, onBack }) {
  const canContinue = data.parent_email && data.parent_name &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.parent_email);

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <div className="text-center mb-5">
        <div className="text-4xl mb-2">👨‍👩‍👧</div>
        <h2 className="text-2xl font-bold mb-1">Parent or Guardian Required</h2>
        <p className="text-gray-400 text-sm">Because you're under 13, we need a parent or guardian to approve your account before you can access Girls Glowing Up™.</p>
      </div>

      <div className="bg-yellow-900/30 border border-yellow-700/40 rounded-xl p-3 mb-5 text-xs text-yellow-300">
        ⚖️ <strong>COPPA Compliance:</strong> The Children's Online Privacy Protection Act requires us to get parental consent before collecting information from anyone under 13.
      </div>

      <div className="space-y-4 mb-5">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1">Parent/Guardian Full Name *</label>
          <input
            type="text"
            value={data.parent_name}
            onChange={e => update({ parent_name: e.target.value })}
            placeholder="Jane Smith"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-pink-500 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1">Parent/Guardian Email Address *</label>
          <input
            type="email"
            value={data.parent_email}
            onChange={e => update({ parent_email: e.target.value })}
            placeholder="parent@email.com"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-pink-500 transition"
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-3 text-xs text-gray-400 mb-5 space-y-1">
        <p>📧 We'll send a consent request to your parent's email.</p>
        <p>⏳ Your account will be pending until they approve.</p>
        <p>🔒 We will never share your parent's email with anyone.</p>
      </div>

      <button
        onClick={onNext}
        disabled={!canContinue}
        className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm disabled:opacity-40 transition"
      >
        Send Consent Request →
      </button>
      <button onClick={onBack} className="w-full py-3 text-gray-500 text-sm mt-2 hover:text-gray-300 transition">
        ← Back
      </button>
    </div>
  );
}