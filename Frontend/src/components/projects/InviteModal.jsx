import { useState } from "react";
import { Copy, Check, Link as LinkIcon } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { sendInvite } from "@/api/projects";

const ROLES = ["participant", "viewer"];

const SELECT_CLASS =
  "w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-body text-slate-900 dark:text-slate-100 outline-none transition duration-150 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

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
    if (!trimmed) {
      setEmailError("Email is required.");
      return;
    }
    setEmailError("");
    setSubmitError("");
    setLoading(true);
    try {
      const res = await sendInvite(projectId, { email: trimmed, role });
      setInviteUrl(`${window.location.origin}${res.inviteUrl}`);
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
          <Input
            id="invite-email"
            label="Email address"
            type="email"
            placeholder="colleague@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            autoFocus
          />

          <div className="space-y-1.5">
            <label
              htmlFor="invite-role"
              className="block text-small font-medium text-slate-600 dark:text-slate-400"
            >
              Role
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={SELECT_CLASS}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
            <p className="text-small text-slate-400 dark:text-slate-500">
              Participants can move their tasks · Viewers have read-only access
            </p>
          </div>

          {submitError && (
            <p className="text-small text-red-600 dark:text-red-400" role="alert">
              {submitError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Generating…" : "Generate invite link"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-center">
            <p className="text-small font-medium text-emerald-700 dark:text-emerald-400">
              Invite link generated!
            </p>
          </div>

          <p className="text-body text-slate-600 dark:text-slate-400">
            Share this link with{" "}
            <span className="font-medium text-slate-900 dark:text-slate-200">{email}</span>.
            It expires in 7 days.
          </p>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5">
            <LinkIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="flex-1 truncate text-small text-slate-600 dark:text-slate-400">
              {inviteUrl}
            </span>
            <button
              type="button"
              onClick={copyUrl}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition duration-150"
              title={copied ? "Copied!" : "Copy link"}
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex justify-end">
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
