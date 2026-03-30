import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/layouts/AppShell";
import { AuthLayout } from "@/layouts/AuthLayout";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { BoardPage } from "@/pages/BoardPage";
import { AcceptInvitePage } from "@/pages/AcceptInvitePage";
import { NotFoundPage } from "@/pages/NotFoundPage";

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-150">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-blue-600" />
    </div>
  );
}

function GuestRoute({ children }) {
  const { token, bootstrapping } = useAuth();
  if (bootstrapping) return <Spinner />;
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
}

function ProtectedRoute({ children }) {
  const { token, bootstrapping } = useAuth();
  if (bootstrapping) return <Spinner />;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public home page */}
      <Route
        path="/"
        element={
          <GuestRoute>
            <HomePage />
          </GuestRoute>
        }
      />
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <SignupPage />
            </GuestRoute>
          }
        />
      </Route>
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/board/:projectId?" element={<BoardPage />} />
      </Route>
      <Route path="/invite/:token" element={<AcceptInvitePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
