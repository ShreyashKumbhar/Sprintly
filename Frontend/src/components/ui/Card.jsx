export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}
