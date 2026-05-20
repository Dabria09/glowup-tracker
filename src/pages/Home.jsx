import { base44 } from '@/api/base44Client';

export default function Home() {
  const handleSignIn = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-8 overflow-x-hidden w-full">
      {/* Logo */}
      <div className="mb-2">
        <img
          src="https://gguapp.com/manus-storage/ggu-logo-glow_54cb14fa.png"
          alt="Girls Glowing Up"
          className="w-48 mx-auto"
        />
      </div>

      <p className="text-gray-300 text-sm mb-6 text-center">
        Your journey to becoming your best self starts here.
      </p>

      {/* Auth Card */}
      <div className="w-full max-w-sm bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-800">
        {/* Tabs */}
        <div className="flex rounded-full bg-gray-800 p-1 mb-5">
          <button className="flex-1 py-2 rounded-full bg-pink-500 text-white text-sm font-semibold">
            Sign In
          </button>
          <button className="flex-1 py-2 rounded-full text-gray-400 text-sm font-semibold">
            Create Account
          </button>
        </div>

        <h2 className="text-xl font-bold text-center mb-1">Welcome Back ✨</h2>
        <p className="text-gray-400 text-sm text-center mb-5">Your glow up journey continues here</p>

        <button
          onClick={handleSignIn}
          className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm mb-3 hover:opacity-90 transition"
        >
          ✨ Sign In with Google
        </button>

        <p className="text-gray-500 text-xs text-center mb-3">
          New here? Tap <span className="font-bold text-white">Create Account</span> above.
        </p>

        <button
          onClick={handleSignIn}
          className="w-full py-3 rounded-full border border-pink-400 text-pink-400 font-semibold text-sm mb-3 hover:bg-pink-400/10 transition"
        >
          🧑‍🏫 Mentor Sign In
        </button>

        <div className="text-center text-gray-600 text-xs mb-3">or</div>

        <button className="w-full py-3 rounded-full border border-gray-600 text-gray-400 font-semibold text-sm hover:bg-gray-800 transition">
          🔐 Sign In with Face / Fingerprint
        </button>

        <p className="text-gray-600 text-xs text-center mt-3">
          Face / fingerprint login requires setting it up in your Profile first.
        </p>

        <div className="mt-4 bg-gray-800 rounded-xl p-3 flex gap-2 items-start">
          <span className="text-yellow-400 text-sm mt-0.5">💡</span>
          <p className="text-xs text-pink-400">
            <strong>For the best experience, please sign in with Google.</strong> Apple sign-in is not currently supported on this platform.
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-3 mb-6">
        {[
          { icon: '📚', title: 'GGU Curriculum', sub: '5 pillars of growth' },
          { icon: '💬', title: 'Daily Quotes', sub: 'Inspiration every day' },
          { icon: '🌸', title: 'Cycle Tracker', sub: 'Know your body' },
          { icon: '⚡', title: 'Me vs Me', sub: 'Beat your best self' },
        ].map((f) => (
          <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col items-center text-center">
            <span className="text-2xl mb-2">{f.icon}</span>
            <p className="text-sm font-semibold">{f.title}</p>
            <p className="text-xs text-gray-500">{f.sub}</p>
          </div>
        ))}
      </div>

      {/* Mentor CTA */}
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6 text-center">
        <p className="text-lg mb-1">🌟</p>
        <h3 className="font-bold text-base mb-1">Are you a mentor or educator?</h3>
        <p className="text-gray-400 text-sm mb-4">Join our team of verified mentors and help girls glow up.</p>
        <a
          href="https://gguapp.com/mentor-apply"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition"
        >
          ✨ Become a Mentor
        </a>
        <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
          <span>✅ Background Checked</span>
          <span>🔒 Data Protected</span>
          <span>✅ Verified Mentors</span>
        </div>
      </div>

      {/* Safety Section */}
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
        <div className="text-center mb-4">
          <span className="text-2xl">🛡️</span>
          <h3 className="font-bold text-base mt-1">A Safe Space for Girls</h3>
          <p className="text-gray-400 text-xs mt-1">Girls Glowing Up™ is built with your safety as our #1 priority. Every mentor is background-checked, verified, and trained before they can connect with girls.</p>
        </div>
        <div className="space-y-3">
          {[
            { icon: '✅', title: 'All Mentors Are Background Checked', desc: 'Every mentor undergoes a thorough background check before approval. No exceptions.' },
            { icon: '🔒', title: 'Your Data Is Protected', desc: 'We never sell your data. All conversations are private and encrypted.' },
            { icon: '👁️', title: 'Moderated Community', desc: 'All content is monitored. Inappropriate messages are flagged and removed immediately.' },
            { icon: '👨‍👩‍👧', title: 'Parent-Friendly Platform', desc: 'Designed for girls 10–18. Parents can request account oversight at any time.' },
          ].map((s) => (
            <div key={s.title} className="flex gap-3 items-start">
              <span className="text-lg">{s.icon}</span>
              <div>
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-600 mt-4">🔒 All mentor connections are monitored for safety</p>
        <p className="text-center text-xs text-gray-600">Report any concerns directly through the app</p>
      </div>

      {/* Disclaimer */}
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
        <p className="text-xs text-gray-500 text-center">
          📋 <strong className="text-gray-300">Not a Therapy Service</strong><br />
          GGU mentors are not licensed therapists, counselors, or medical professionals. Girls Glowing Up™ does not diagnose, treat, or provide clinical advice. If you or someone you know is in crisis, please contact a qualified mental health professional or call <strong className="text-white">988</strong> (Suicide &amp; Crisis Lifeline).
        </p>
      </div>

      {/* Safety Disclosure */}
      <div className="w-full max-w-sm bg-yellow-900/20 border border-yellow-700/30 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span>⚠️</span>
          <h3 className="font-bold text-sm text-yellow-400">Important Safety Disclosure</h3>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Girls Glowing Up™ is a platform designed exclusively for girls and verified mentors. Despite our rigorous screening process, <strong className="text-white">individuals with harmful intentions may attempt to gain access to this platform.</strong>
        </p>
        <div className="space-y-2">
          {[
            { icon: '🔍', text: 'All mentor applications require a background check AND a live Zoom or phone interview before approval.' },
            { icon: '🚨', text: 'If any mentor or user makes you feel unsafe, uncomfortable, or asks for personal information — report them immediately using the flag button.' },
            { icon: '📵', text: 'Never share your home address, school name, phone number, or meet anyone from this platform in person without a trusted adult present.' },
            { icon: '👩‍👧', text: 'Parents: you may request a full activity review of your child\'s account at any time by contacting our safety team.' },
          ].map((d, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-sm">{d.icon}</span>
              <p className="text-xs text-gray-400">{d.text}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-red-400 mt-3 text-center">🚨 Report suspicious behavior: safety@girlsglowingup.com</p>
        <p className="text-xs text-gray-600 text-center">All reports are reviewed within 24 hours. Zero tolerance policy enforced.</p>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 space-x-2 mb-4">
        <a href="https://gguapp.com/privacy-policy" className="hover:text-gray-400">Privacy Policy</a>
        <span>·</span>
        <a href="https://gguapp.com/terms-of-service" className="hover:text-gray-400">Terms of Service</a>
        <span>·</span>
        <a href="https://gguapp.com/parental-consent" className="hover:text-gray-400">Parental Consent (COPPA)</a>
      </div>
      <p className="text-xs text-gray-700">© 2025 Girls Glowing Up™. All rights reserved.</p>
    </div>
  );
}