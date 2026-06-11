import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Link2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function LinkAccountSetting({ onLinkComplete }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [linked, setLinked] = useState(false);

  const handleLink = async () => {
    setLoading(true);
    try {
      // Verify existence & authenticity of the GGU Girl Account
      await base44.auth.loginViaEmailPassword(email, password);
      
      // Fetch girl user object to capture ID
      const girlUser = await base44.auth.me();
      
      // Persist connection link
      await base44.auth.updateMe({
        account_type: "linked",
        linked_girl_account_id: girlUser.id,
        active_mode: "mentor"
      });

      toast.success("Successfully linked to GGU Girl Account!");
      setLinked(true);
      if (onLinkComplete) onLinkComplete();
    } catch (err) {
      toast.error(err.message || "Failed to verify GGU Girl credentials");
    } finally {
      setLoading(false);
    }
  };

  if (linked) {
    return (
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3">
        <CheckCircle2 className="text-green-400 w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-sm text-white">Accounts Linked!</h4>
          <p className="text-xs text-gray-400">Use the persistent header switch above to toggle anytime.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl p-5 border border-white/10 bg-white/5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Link2 className="text-purple-400" size={18} />
        <h3 className="font-bold text-sm text-white">Link GGU Girl Account</h3>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">
        If you are also a GGU Woman (19-26) who wants to browse posts, join challenges, or use the interactive social features, link your member account below.
      </p>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs text-gray-400 uppercase tracking-widest">GGU Girl Email</Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-neutral-900 border-white/10 text-white" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-400 uppercase tracking-widest">GGU Girl Password</Label>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-neutral-900 border-white/10 text-white" />
        </div>
        <Button type="button" onClick={handleLink} className="w-full bg-purple-600 hover:bg-purple-700 text-xs font-bold" disabled={loading || !email || !password}>
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" size={14} />}
          Link Account
        </Button>
      </div>
    </div>
  );
}