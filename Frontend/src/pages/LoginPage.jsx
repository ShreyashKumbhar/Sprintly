import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      setError(err.message || "Sign in failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Brand */}
      <div className="text-center">
        <img src="/favicon.svg" alt="Sprintly" className="mx-auto mb-4 h-12 w-12" />
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Welcome back
        </h1>
        <p className="mt-1 text-body text-slate-500 dark:text-slate-400">
          Sign in to your Sprintly account
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-7 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2.5">
              <p className="text-small text-red-700 dark:text-red-400" role="alert">
                {error}
              </p>
            </div>
          )}

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>

      <p className="text-center text-small text-slate-500 dark:text-slate-400">
        No account?{" "}
        <Link to="/signup" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
