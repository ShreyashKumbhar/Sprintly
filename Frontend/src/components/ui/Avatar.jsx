const ringByRole = {
  owner: "ring-role-owner",
  participant: "ring-role-participant",
  viewer: "ring-role-viewer",
};

function initials(email) {
  if (!email) return "?";
  const part = email.split("@")[0] || email;
  return part.slice(0, 2).toUpperCase();
}

export function Avatar({ email, role = "participant", size = "md" }) {
  const sizes = {
    sm: "h-8 w-8 text-small",
    md: "h-9 w-9 text-body",
    lg: "h-11 w-11 text-card-title",
  };
  const ring = ringByRole[role] || ringByRole.participant;
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-graphite font-semibold text-gray-200 ring-2 ring-offset-2 ring-offset-slate-deep ${ring} ${sizes[size]}`}
      title={email}
    >
      {initials(email)}
    </div>
  );
}
