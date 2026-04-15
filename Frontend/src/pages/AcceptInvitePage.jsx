import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getInvitation, acceptInvitation } from "@/api/invitations";
import { Button } from "@/components/ui/Button";
import { Mail } from "lucide-react";

export function AcceptInvitePage() {
  const { token } = useParams();
  const { isAuthenticated, bootstrapping } = useAuth();
  const navigate = useNavigate();
  const [invite, setInvite] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState(null);

  useEffect(() => {
    getInvitation(token)
      .then(setInvite)
      .catch((err) => setLoadError(err.message || "Invitation not found or expired."));
  }, [token]);

  async function handleAccept() {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/invite/${token}`);
      return;
    }
    setAccepting(true);
    setAcceptError(null);
    try {
      await acceptInvitation(token);
      navigate("/dashboard");
    } catch (err) {
      setAcceptError(err.message || "Failed to accept invitation.");
      setAccepting(false);
    }
  }

  if (bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-150">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 p-4 transition-colors duration-150">
      <div className="w-full max-w-md animate-fade-in">
        {/* Brand */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <img src="/favicon.svg" alt="Sprintly" className="h-8 w-8" />
          <span className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
            Sprintly
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Project Invitation
          </h1>

          {loadError ? (
            <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
              <p className="text-body text-red-700 dark:text-red-400">{loadError}</p>
            </div>
          ) : !invite ? (
            <div className="mt-4 flex justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-600 border-t-blue-600" />
            </div>
          ) : (
            <>
              <p className="mt-4 text-body text-slate-500 dark:text-slate-400">
                You have been invited to join
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-50">
                {invite.projectName}
              </p>
              {invite.projectDescription && (
                <p className="mt-1 text-small text-slate-400 dark:text-slate-500">
                  {invite.projectDescription}
                </p>
              )}
              <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-1 text-body text-slate-500 dark:text-slate-400">
                <span>Invited by</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {invite.inviterEmail}
                </span>
                <span>as</span>
                <span className="capitalize font-semibold text-blue-600 dark:text-blue-400">
                  {invite.role}
                </span>
              </div>

              {acceptError && (
                <div className="mt-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2">
                  <p className="text-small text-red-700 dark:text-red-400">{acceptError}</p>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <Button variant="primary" onClick={handleAccept} disabled={accepting}>
                  {accepting
                    ? "Joining…"
                    : isAuthenticated
                    ? "Accept & join project"
                    : "Sign in to accept"}
                </Button>
                <Button variant="secondary" onClick={() => navigate("/dashboard")}>
                  Decline
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
