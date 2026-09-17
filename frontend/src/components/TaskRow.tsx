import { Task } from "@/lib/api";

const PRIORITY_STYLES: Record<Task["priority"], { dot: string; label: string }> = {
  high: { dot: "bg-clay", label: "High" },
  medium: { dot: "bg-amber", label: "Medium" },
  low: { dot: "bg-slate", label: "Low" },
};

function formatDueDate(dueDate: string): string {
  const [year, month, day] = dueDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === "completed") return false;
  const [year, month, day] = task.due_date.split("-").map(Number);
  const due = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

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
  const overdue = isOverdue(task);

  return (
    <li
      className={`group flex items-start gap-2 border-l-2 bg-panel px-3 py-3.5 transition-colors hover:bg-slate-soft/40 sm:gap-3 sm:px-4 ${
        completed ? "border-moss" : "border-slate"
      }`}
    >
      <button
        type="button"
        onClick={() => onToggleStatus(task)}
        disabled={busy}
        aria-pressed={completed}
        aria-label={completed ? "Mark as pending" : "Mark as completed"}
        className={`mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
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
            className={`text-sm font-medium break-words ${completed ? "text-ink-soft line-through" : "text-ink"}`}
          >
            {task.title}
          </span>
        </div>
        {task.description && (
          <p className="mt-0.5 line-clamp-2 text-sm break-words text-ink-soft">
            {task.description}
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} aria-hidden />
            {priority.label} priority
          </span>
          {task.due_date && (
            <span
              className={`flex items-center gap-1 ${overdue ? "font-medium text-clay" : ""}`}
            >
              <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none" aria-hidden>
                <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M1.5 5.5h11M4 1.5v2M10 1.5v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {overdue ? "Overdue" : "Due"} {formatDueDate(task.due_date)}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity sm:gap-1 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          type="button"
          onClick={() => onEdit(task)}
          disabled={busy}
          className="cursor-pointer rounded-md px-1.5 py-1 text-xs font-medium text-ink-soft hover:bg-slate-soft hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 sm:px-2"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          disabled={busy}
          className="cursor-pointer rounded-md px-1.5 py-1 text-xs font-medium text-clay hover:bg-clay-soft disabled:cursor-not-allowed disabled:opacity-50 sm:px-2"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
