import { Link } from "react-router-dom";
import { LayoutDashboard, Kanban } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-700 bg-graphite px-4 lg:px-6">
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="font-display text-lg font-semibold tracking-tight text-white transition duration-150 hover:text-cyan-soft"
        >
          Sprintly
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-small text-gray-400 transition duration-150 hover:bg-white/5 hover:text-gray-200"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden />
            Dashboard
          </Link>
          <Link
            to="/board"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-small text-gray-400 transition duration-150 hover:bg-white/5 hover:text-gray-200"
          >
            <Kanban className="h-4 w-4" aria-hidden />
            Board
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {user?.email && (
          <span className="hidden text-small text-gray-500 md:inline">
            {user.email}
          </span>
        )}
        <Avatar email={user?.email} role="participant" size="sm" />
        <Button variant="secondary" className="!py-2 !text-small" onClick={logout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
