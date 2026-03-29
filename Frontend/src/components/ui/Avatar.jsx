const ringByRole = {
  owner: "ring-violet-500",
  participant: "ring-blue-500",
  viewer: "ring-slate-400 dark:ring-slate-500",
};

function initials(nameOrEmail) {
  if (!nameOrEmail) return "?";
  const part = nameOrEmail.split("@")[0] || nameOrEmail;
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
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 font-semibold text-white ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ${ring} ${sizes[size]}`}
      title={email}
    >
      {initials(email)}
    </div>
  );
}
