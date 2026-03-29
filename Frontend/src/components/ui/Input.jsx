export function Input({
  id,
  label,
  error,
  className = "",
  inputClassName = "",
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-small font-medium text-slate-600 dark:text-slate-400"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border px-3 py-2.5 text-body text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 outline-none transition duration-150 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 ${
          error
            ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : "border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500/20"
        } ${inputClassName}`}
        {...props}
      />
      {error && (
        <p className="text-small text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
