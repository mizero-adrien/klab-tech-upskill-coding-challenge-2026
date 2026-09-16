import { TaskStatus } from "@/lib/api";

export type StatusFilter = "all" | TaskStatus;

const TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
];

export function FilterTabs({
  value,
  onChange,
  counts,
}: {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
  counts: Record<StatusFilter, number>;
}) {
  return (
    <div
      className="flex flex-nowrap gap-4 border-b border-line sm:gap-6"
      role="tablist"
      aria-label="Filter tasks by status"
    >
      {TABS.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`relative flex shrink-0 cursor-pointer items-center gap-1.5 pb-3 text-sm font-medium whitespace-nowrap transition-colors ${
              active ? "text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs tabular-nums ${
                active ? "bg-indigo/10 text-indigo" : "bg-slate-soft text-ink-soft"
              }`}
            >
              {counts[tab.value]}
            </span>
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-indigo" />
            )}
          </button>
        );
      })}
    </div>
  );
}
