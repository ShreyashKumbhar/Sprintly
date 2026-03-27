import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getInvitation, acceptInvitation } from "@/api/invitations";
import { Button } from "@/components/ui/Button";

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
      navigate("/");
    } catch (err) {
      setAcceptError(err.message || "Failed to accept invitation.");
      setAccepting(false);
    }
  }

  if (bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-deep">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-steel" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-deep p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-700 bg-graphite p-8 text-center shadow-xl">
        <h1 className="font-display text-2xl font-semibold text-white">Project Invitation</h1>

        {loadError ? (
          <p className="mt-4 text-body text-semantic-error">{loadError}</p>
        ) : !invite ? (
          <p className="mt-4 text-body text-gray-400">Loading…</p>
        ) : (
          <>
            <p className="mt-4 text-body text-gray-300">
              You have been invited to join
            </p>
            <p className="mt-1 text-xl font-semibold text-white">{invite.projectName}</p>
            {invite.projectDescription && (
              <p className="mt-1 text-small text-gray-500">{invite.projectDescription}</p>
            )}
            <p className="mt-4 text-body text-gray-400">
              Invited by <span className="text-white">{invite.inviterEmail}</span> as{" "}
              <span className="capitalize font-semibold text-cyan-soft">{invite.role}</span>
            </p>

            {acceptError && (
              <p className="mt-3 text-small text-semantic-error">{acceptError}</p>
            )}

            <div className="mt-6 flex flex-col gap-3">
              <Button variant="primary" onClick={handleAccept} disabled={accepting}>
                {accepting ? "Joining…" : isAuthenticated ? "Accept & join project" : "Sign in to accept"}
              </Button>
              <Button variant="secondary" onClick={() => navigate("/")}>
                Decline
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
