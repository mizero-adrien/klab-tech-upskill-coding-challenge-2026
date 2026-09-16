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
}: {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
}) {
  return (
    <div className="flex gap-6 border-b border-line" role="tablist" aria-label="Filter tasks by status">
      {TABS.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`relative cursor-pointer pb-3 text-sm font-medium transition-colors ${
              active ? "text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            {tab.label}
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-indigo" />
            )}
          </button>
        );
      })}
    </div>
  );
}
