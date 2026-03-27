import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup({ email, password, username });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(
        typeof err.body === "string"
          ? err.body
          : err.message || "Sign up failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-8 shadow-card-lift">
      <h1 className="font-display text-page-title font-semibold text-slate-deep">
        Create account
      </h1>
      <p className="mt-1 text-body text-gray-600">
        Registers via <code className="text-small">/api/auth/signup</code>.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          id="username"
          label="Username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={30}
          pattern="^[a-zA-Z0-9_]+$"
          title="Letters, digits, and underscores only"
        />
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        {error && (
          <p className="text-small text-semantic-error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Sign up"}
        </Button>
      </form>
      <p className="mt-6 text-center text-small text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-steel hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
