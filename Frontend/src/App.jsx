import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/layouts/AppShell";
import { AuthLayout } from "@/layouts/AuthLayout";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { BoardPage } from "@/pages/BoardPage";
import { InboxPage } from "@/pages/InboxPage";
import { AcceptInvitePage } from "@/pages/AcceptInvitePage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/board/:projectId?" element={<BoardPage />} />
      </Route>
      <Route path="/invite/:token" element={<AcceptInvitePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
