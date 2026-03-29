export function StageProgress({ stages = [], activeIndex = 0 }) {
  const names =
    stages.length > 0
      ? stages.map((s) => s.name)
      : ["To Do", "In Progress", "Review", "Done"];

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {names.map((name, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <div key={name} className="flex items-center gap-2">
            {i > 0 && (
              <span
                className={`hidden h-px w-5 sm:block ${
                  done || active
                    ? "bg-blue-300 dark:bg-blue-700"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
                aria-hidden
              />
            )}
            <span
              className={`rounded-full px-3 py-1 text-small font-medium transition duration-150 ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : done
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
