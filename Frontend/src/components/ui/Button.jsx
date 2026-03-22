const variants = {
  primary:
    "bg-steel text-white shadow-btn hover:brightness-105 hover:-translate-y-px active:scale-[0.98] disabled:opacity-50",
  secondary:
    "border border-gray-500 bg-transparent text-gray-200 hover:bg-white/5 active:scale-[0.98] disabled:opacity-50",
  danger:
    "bg-semantic-error text-white shadow-btn hover:brightness-105 active:scale-[0.98] disabled:opacity-50",
  ghost:
    "text-gray-300 hover:bg-white/5 active:scale-[0.98] disabled:opacity-50",
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
