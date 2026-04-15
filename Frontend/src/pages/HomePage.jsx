import { Link } from "react-router-dom";
import {
  Kanban,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const FEATURES = [
  {
    Icon: Kanban,
    title: "Kanban Boards",
    desc: "Drag-and-drop task management across customizable workflow stages.",
  },
  {
    Icon: Users,
    title: "Team Collaboration",
    desc: "Invite members, assign tasks, and track progress together.",
  },
  {
    Icon: BarChart3,
    title: "Gantt Charts",
    desc: "Export project timelines to Excel with one click.",
  },
];

export function HomePage() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-150">
      {/* Nav */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-6 lg:px-10">
        <div className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          <img src="/logo.svg" alt="Sprintly" className="h-7 w-7" />
          Sprintly
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition duration-150"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to="/login"
            className="rounded-lg px-4 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-150"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition duration-150"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 pt-10 pb-16 text-center lg:pt-15 lg:pb-20">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Free &amp; open-source project management
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Plan sprints,{" "}
            <span className="text-blue-600 dark:text-blue-400">ship faster</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500 dark:text-slate-400">
            Sprintly helps teams organize work with kanban boards,
            real-time collaboration, and timeline exports - all in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition duration-150"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition duration-150"
            >
              Log in
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-4xl px-6 pb-20">
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-6 shadow-sm"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        &copy; {new Date().getFullYear()} Sprintly
      </footer>
    </div>
  );
}
