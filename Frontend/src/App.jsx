import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/layouts/AppShell";
import { AuthLayout } from "@/layouts/AuthLayout";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { BoardPage } from "@/pages/BoardPage";
import { AcceptInvitePage } from "@/pages/AcceptInvitePage";
import { NotFoundPage } from "@/pages/NotFoundPage";

function GuestRoute({ children }) {
  const { token, bootstrapping } = useAuth();
  if (bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-deep">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-steel" />
      </div>
    );
  }
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function ProtectedRoute({ children }) {
  const { token, bootstrapping } = useAuth();
  if (bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-deep">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-steel" />
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
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
        <Route path="/" element={<DashboardPage />} />
        <Route path="/board/:projectId?" element={<BoardPage />} />
      </Route>
      <Route path="/invite/:token" element={<AcceptInvitePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
