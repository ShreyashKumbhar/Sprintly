import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { sendInvite } from "@/api/projects";

const ROLES = ["participant", "viewer"];

export function InviteModal({ projectId, onClose }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("participant");
  const [emailError, setEmailError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [inviteUrl, setInviteUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) { setEmailError("Email is required."); return; }
    setEmailError("");
    setSubmitError("");
    setLoading(true);
    try {
      const res = await sendInvite(projectId, { email: trimmed, role });
      const fullUrl = `${window.location.origin}${res.inviteUrl}`;
      setInviteUrl(fullUrl);
    } catch (err) {
      setSubmitError(err.message || "Failed to send invitation.");
    } finally {
      setLoading(false);
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal title="Invite team member" onClose={onClose}>
      {!inviteUrl ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="invite-email" label="Email address" type="email"
            placeholder="colleague@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            error={emailError} autoFocus />

          <div className="space-y-1.5">
            <label htmlFor="invite-role" className="block text-small font-medium text-gray-400">Role</label>
            <select id="invite-role" value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-graphite px-3 py-2.5 text-body text-gray-100 outline-none focus:border-steel focus:ring-2 focus:ring-steel/30">
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
            <p className="text-small text-gray-500">
              Participants can move their tasks · Viewers have read-only access
            </p>
          </div>

          {submitError && <p className="text-small text-semantic-error" role="alert">{submitError}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Sending…" : "Generate invite link"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-body text-gray-300">
            Share this link with <span className="font-medium text-white">{email}</span>.
            It expires in 7 days.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-gray-600 bg-slate-deep/50 px-3 py-2">
            <span className="flex-1 truncate text-small text-gray-300">{inviteUrl}</span>
            <button type="button" onClick={copyUrl}
              className="shrink-0 rounded p-1 text-gray-400 hover:text-white transition duration-150">
              {copied ? <Check className="h-4 w-4 text-semantic-success" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={onClose}>Done</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
