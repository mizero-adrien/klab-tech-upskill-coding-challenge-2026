import { Task } from "@/lib/api";

const PRIORITY_STYLES: Record<Task["priority"], { dot: string; label: string }> = {
  high: { dot: "bg-clay", label: "High" },
  medium: { dot: "bg-amber", label: "Medium" },
  low: { dot: "bg-slate", label: "Low" },
};

export function TaskRow({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  busy,
}: {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  busy: boolean;
}) {
  const completed = task.status === "completed";
  const priority = PRIORITY_STYLES[task.priority];

  return (
    <li
      className={`flex items-start gap-3 border-l-2 bg-panel px-4 py-3.5 ${
        completed ? "border-moss" : "border-slate"
      }`}
    >
      <button
        type="button"
        onClick={() => onToggleStatus(task)}
        disabled={busy}
        aria-pressed={completed}
        aria-label={completed ? "Mark as pending" : "Mark as completed"}
        className={`mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed ${
          completed
            ? "border-moss bg-moss text-white"
            : "border-line text-transparent hover:border-moss"
        }`}
      >
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden>
          <path
            d="M2 6l2.5 2.5L10 3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${completed ? "text-ink-soft line-through" : "text-ink"}`}
          >
            {task.title}
          </span>
        </div>
        {task.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-ink-soft">{task.description}</p>
        )}
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-soft">
          <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} aria-hidden />
          {priority.label} priority
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-ink-soft hover:bg-slate-soft hover:text-ink"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-clay hover:bg-clay-soft"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
