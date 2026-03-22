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
          className="block text-small font-medium text-gray-400"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border bg-graphite px-3 py-2.5 text-body text-gray-100 outline-none transition duration-150 placeholder:text-gray-500 focus:border-steel focus:ring-2 focus:ring-steel/30 ${
          error
            ? "border-semantic-error focus:border-semantic-error focus:ring-semantic-error/30"
            : "border-gray-600"
        } ${inputClassName}`}
        {...props}
      />
      {error && (
        <p className="text-small text-semantic-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
