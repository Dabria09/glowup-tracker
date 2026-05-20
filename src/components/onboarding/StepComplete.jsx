export default function StepComplete({ data, onDone }) {
  const isUnder13 = data.age < 13;

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center">
      <div className="text-5xl mb-4">{isUnder13 ? '📧' : '🎉'}</div>
      <h2 className="text-2xl font-bold mb-2">{isUnder13 ? 'Almost There!' : 'Welcome to GGU! ✨'}</h2>

      {isUnder13 ? (
        <>
          <p className="text-gray-400 text-sm mb-4">
            We've sent a consent request to <strong className="text-white">{data.parent_email}</strong>. Your account will be activated once your parent approves.
          </p>
          <div className="bg-yellow-900/30 border border-yellow-700/40 rounded-xl p-4 text-xs text-yellow-300 text-left mb-5 space-y-2">
            <p>📬 Ask your parent to check their email from <strong>noreply@girlsglowingup.com</strong></p>
            <p>⏳ Approval usually takes 1–24 hours</p>
            <p>🔒 Your data is protected until consent is given</p>
          </div>
        </>
      ) : (
        <>
          <p className="text-gray-400 text-sm mb-4">
            Hey <strong className="text-white">@{data.username}</strong>! You're officially a{' '}
            <span className="text-pink-400 font-bold">
              {data.age_group === 'glow_girls' ? '🌱 Glow Girl' : data.age_group === 'glow_teens' ? '🌸 Glow Teen' : '👑 Glow Woman'}
            </span>. Your glow-up journey starts now!
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-left mb-5">
            {[{ icon: '📚', text: 'GGU Curriculum' }, { icon: '💬', text: 'Daily Quotes' }, { icon: '🌸', text: 'Cycle Tracker' }, { icon: '⚡', text: 'Me vs Me' }].map(f => (
              <div key={f.text} className="bg-gray-800 rounded-xl p-3 flex items-start gap-2">
                <span>{f.icon}</span><span className="text-gray-300">{f.text}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <button onClick={onDone} className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition">
        {isUnder13 ? 'Go to App (Pending Approval)' : "Let's Glow! ✨"}
      </button>
    </div>
  );
}