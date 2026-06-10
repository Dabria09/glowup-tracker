import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function DeleteUsersTab() {
  const [emailsInput, setEmailsInput] = useState("");
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const emails = emailsInput
    .split(/[\n,]+/)
    .map(e => e.trim().toLowerCase())
    .filter(e => e.includes("@"));

  const handleDelete = async () => {
    if (!confirmed || emails.length === 0) return;
    setRunning(true);
    setResults([]);

    for (const email of emails) {
      try {
        await base44.functions.invoke("adminDeleteUser", { targetEmail: email });
        setResults(prev => [...prev, { email, success: true }]);
      } catch (err) {
        setResults(prev => [...prev, { email, success: false, error: err.message }]);
      }
    }

    setRunning(false);
    setConfirmed(false);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-white font-bold text-lg mb-1">🗑️ Bulk Delete Users</h2>
        <p className="text-gray-400 text-sm mb-3">
          Permanently deletes auth credentials + all data for each email. One per line or comma-separated.
        </p>
        <a
          href="https://app.base44.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          🔗 Open Base44 Dashboard
        </a>
        <p className="text-gray-400 text-xs mt-2 leading-relaxed">
          Once on the dashboard: <strong className="text-gray-300">select your app → click "Users" in the left sidebar → find the user → click Delete</strong>. This removes their Google OAuth identity so they cannot sign back in.
        </p>
      </div>

      <Textarea
        className="bg-gray-800 border-gray-700 text-white font-mono text-sm min-h-[140px]"
        placeholder={"test1@example.com\ntest2@example.com"}
        value={emailsInput}
        onChange={e => { setEmailsInput(e.target.value); setConfirmed(false); setResults([]); }}
        disabled={running}
      />

      {emails.length > 0 && (
        <p className="text-yellow-400 text-sm font-medium">
          ⚠️ {emails.length} account{emails.length !== 1 ? "s" : ""} will be permanently deleted.
        </p>
      )}

      {!confirmed && emails.length > 0 && (
        <Button
          onClick={() => setConfirmed(true)}
          variant="outline"
          className="border-red-500 text-red-400 hover:bg-red-500/10"
          disabled={running}
        >
          I understand — confirm deletion
        </Button>
      )}

      {confirmed && (
        <Button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white"
          disabled={running}
        >
          {running ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</>
          ) : (
            <><Trash2 className="w-4 h-4 mr-2" /> Delete {emails.length} Account{emails.length !== 1 ? "s" : ""}</>
          )}
        </Button>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Results</p>
          {results.map(r => (
            <div key={r.email} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${r.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {r.success
                ? <CheckCircle className="w-4 h-4 shrink-0" />
                : <XCircle className="w-4 h-4 shrink-0" />}
              <span className="font-mono">{r.email}</span>
              {!r.success && <span className="text-xs opacity-70">— {r.error}</span>}
            </div>
          ))}
          {!running && results.every(r => r.success) && (
            <p className="text-green-400 text-sm font-medium pt-1">✅ All accounts deleted successfully.</p>
          )}
        </div>
      )}
    </div>
  );
}