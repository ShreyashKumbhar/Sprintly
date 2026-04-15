import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Kanban, Inbox, Sun, Moon, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Avatar } from "@/components/ui/Avatar";

export function TopBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/board", label: "Board", icon: Kanban, exact: false },
    { to: "/inbox", label: "Inbox", icon: Inbox, exact: true },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-4 lg:px-6 transition-colors duration-150">
      {/* Left: brand + nav */}
      <div className="flex items-center gap-5">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white transition duration-150 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <img src="/logo.svg" alt="Sprintly" className="h-7 w-7" />
          Sprintly
        </Link>

        <nav className="hidden items-center gap-0.5 sm:flex">
          {navLinks.map(({ to, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-small font-medium transition duration-150 ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: user info + theme toggle + logout */}
      <div className="flex items-center gap-1.5">
        {user?.email && (
          <span className="hidden text-small text-slate-500 dark:text-slate-400 md:inline mr-1">
            {user.email}
          </span>
        )}

        <Avatar email={user?.email} role="participant" size="sm" />

        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition duration-150"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={logout}
          className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition duration-150"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
