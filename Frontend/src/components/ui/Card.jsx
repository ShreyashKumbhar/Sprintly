export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-gray-600 bg-white text-slate-deep shadow-card ${className}`}
    >
      {children}
    </div>
  );
}
