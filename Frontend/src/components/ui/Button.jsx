const variants = {
  primary:
    "bg-blue-600 text-white shadow-btn hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  secondary:
    "border border-slate-300 dark:border-slate-600 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  danger:
    "bg-red-600 text-white shadow-btn hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  ghost:
    "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition duration-150 ease-out ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
