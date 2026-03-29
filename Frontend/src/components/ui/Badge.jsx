const roleStyles = {
  owner:
    "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 ring-1 ring-violet-200 dark:ring-violet-700/50",
  participant:
    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-700/50",
  viewer:
    "bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-600/50",
};

export function Badge({ children, role, className = "" }) {
  const roleClass = role
    ? roleStyles[role] ?? roleStyles.viewer
    : "bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-600/50";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-small font-medium ${roleClass} ${className}`}
    >
      {children}
    </span>
  );
}
