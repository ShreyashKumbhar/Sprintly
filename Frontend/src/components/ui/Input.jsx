import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function Input({
  id,
  label,
  error,
  type,
  className = "",
  inputClassName = "",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

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
      <div className="relative">
        <input
          id={id}
          type={isPassword && showPassword ? "text" : type}
          className={`w-full rounded-lg border px-3 py-2.5 text-body text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 outline-none transition duration-150 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 ${
            isPassword ? "pr-10" : ""
          } ${
            error
              ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500/20"
          } ${inputClassName}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition duration-150"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-small text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
