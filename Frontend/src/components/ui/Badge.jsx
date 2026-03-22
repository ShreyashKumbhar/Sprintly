const roleStyles = {
  owner: "bg-role-owner/15 text-role-owner ring-1 ring-role-owner/40",
  participant:
    "bg-role-participant/15 text-role-participant ring-1 ring-role-participant/40",
  viewer: "bg-role-viewer/15 text-role-viewer ring-1 ring-role-viewer/40",
};

export function Badge({ children, role, className = "" }) {
  const roleClass = role ? roleStyles[role] : "bg-gray-700/50 text-gray-300 ring-1 ring-gray-600";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-small font-medium ${roleClass} ${className}`}
    >
      {children}
    </span>
  );
}
