import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
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
      setError(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-8 shadow-card-lift">
      <h1 className="font-display text-page-title font-semibold text-slate-deep">
        Sign in
      </h1>
      <p className="mt-1 text-body text-gray-600">
        Use the same credentials as your Spring Boot backend (
        <code className="text-small">/api/auth/signin</code>).
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <p className="text-small text-semantic-error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-small text-gray-600">
        No account?{" "}
        <Link
          to="/signup"
          className="font-medium text-steel hover:underline"
        >
          Create one
        </Link>
      </p>
    </Card>
  );
}
