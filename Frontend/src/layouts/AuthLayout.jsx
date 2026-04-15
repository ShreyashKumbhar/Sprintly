import { Outlet } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function AuthLayout() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 px-4 py-12 transition-colors duration-150">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-4 right-4 rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition duration-150"
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <div className="w-full max-w-sm animate-fade-in">
        <Outlet />
      </div>
    </div>
  );
}
