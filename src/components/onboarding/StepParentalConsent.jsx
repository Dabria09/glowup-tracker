export default function StepParentalConsent({ data, update, onNext, onBack }) {
  const canContinue = data.parent_email && data.parent_name &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.parent_email);

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
      <div className="text-center mb-5">
        <div className="text-4xl mb-2">👨‍👩‍👧</div>
        <h2 className="text-2xl font-bold font-poppins mb-1">Parent or Guardian Required</h2>
        <p className="text-muted-foreground text-sm">Because you're under 13, we need a parent or guardian to approve your account before you can access Girls Glowing Up™.</p>
      </div>

      <div className="bg-amber-100 border border-amber-300 rounded-xl p-3 mb-5 text-xs text-amber-800">
        ⚖️ <strong>COPPA Compliance:</strong> The Children's Online Privacy Protection Act requires us to get parental consent before collecting information from anyone under 13.
      </div>

      <div className="space-y-4 mb-5">
        <div>
          <label className="block text-sm font-semibold font-poppins mb-1">Parent/Guardian Full Name *</label>
          <input
            type="text"
            value={data.parent_name}
            onChange={e => update({ parent_name: e.target.value })}
            placeholder="Jane Smith"
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:border-primary transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold font-poppins mb-1">Parent/Guardian Email Address *</label>
          <input
            type="email"
            value={data.parent_email}
            onChange={e => update({ parent_email: e.target.value })}
            placeholder="parent@email.com"
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:border-primary transition"
          />
        </div>
      </div>

      <div className="bg-secondary rounded-xl p-3 text-xs text-muted-foreground mb-5 space-y-1">
        <p>📧 We'll send a consent request to your parent's email.</p>
        <p>⏳ Your account will be pending until they approve.</p>
        <p>🔒 We will never share your parent's email with anyone.</p>
      </div>

      <button
        onClick={onNext}
        disabled={!canContinue}
        className="w-full py-3 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm disabled:opacity-40 transition"
      >
        Send Consent Request →
      </button>
      <button onClick={onBack} className="w-full py-3 text-muted-foreground text-sm mt-2 hover:text-foreground transition">
        ← Back
      </button>
    </div>
  );
}