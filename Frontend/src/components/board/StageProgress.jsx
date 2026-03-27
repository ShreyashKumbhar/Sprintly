export function StageProgress({ stages = [], activeIndex = 0 }) {
  const names = stages.length > 0
    ? stages.map((s) => s.name)
    : ["To Do", "In Progress", "Review", "Done"];

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {names.map((name, i) => {
        const active = i === activeIndex;
        return (
          <div key={name} className="flex items-center gap-2">
            {i > 0 && (
              <span className="hidden h-px w-6 bg-gray-600 sm:block" aria-hidden />
            )}
            <span className={`rounded-full px-3 py-1 text-small font-medium transition duration-150 ${
              active ? "bg-steel/20 text-cyan-soft ring-1 ring-steel/50" : "text-gray-500"
            }`}>
              {name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
