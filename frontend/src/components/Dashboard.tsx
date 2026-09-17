"use client";

import { useEffect, useState } from "react";
import { AccountMenu } from "@/components/AccountMenu";
import { FilterTabs, StatusFilter } from "@/components/FilterTabs";
import { TaskRow } from "@/components/TaskRow";
import { TaskFormPanel } from "@/components/TaskFormPanel";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/ToastProvider";
import {
  Button,
  ErrorBanner,
  Select,
  Spinner,
  TaskRowSkeleton,
  TextInput,
} from "@/components/ui";
import * as api from "@/lib/api";
import { Task, TaskInput, TaskOrdering } from "@/lib/api";

type Counts = Record<StatusFilter, number>;

interface PageInfo {
  count: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const SORT_OPTIONS: { value: TaskOrdering; label: string }[] = [
  { value: "-created_at", label: "Newest" },
  { value: "due_date_sort", label: "Due date" },
  { value: "priority_rank", label: "Priority" },
];

function otherBucket(status: Task["status"]): StatusFilter {
  return status === "completed" ? "completed" : "pending";
}

export function Dashboard() {
  const { notify } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [counts, setCounts] = useState<Counts>({ all: 0, pending: 0, completed: 0 });
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    count: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [ordering, setOrdering] = useState<TaskOrdering>("-created_at");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panelTask, setPanelTask] = useState<Task | null | "new">(null);
  const [confirmDeleteTask, setConfirmDeleteTask] = useState<Task | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    let ignore = false;

    (async () => {
      setRefreshing(true);
      setError(null);
      try {
        const base = { search: search || undefined, page, ordering };
        const [all, pending, completed] = await Promise.all([
          api.listTasks(base),
          api.listTasks({ ...base, status: "pending" }),
          api.listTasks({ ...base, status: "completed" }),
        ]);
        if (ignore) return;
        setCounts({ all: all.count, pending: pending.count, completed: completed.count });
        const active = filter === "all" ? all : filter === "pending" ? pending : completed;
        setTasks(active.results);
        setPageInfo({
          count: active.count,
          hasNext: Boolean(active.next),
          hasPrevious: Boolean(active.previous),
        });
      } catch {
        if (!ignore) {
          setError("Couldn't load your tasks. Check your connection and try again.");
        }
      } finally {
        if (!ignore) {
          setInitialLoading(false);
          setRefreshing(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [filter, search, page, ordering, reloadKey]);

  function handleFilterChange(next: StatusFilter) {
    setFilter(next);
    setPage(1);
  }

  function handleOrderingChange(next: TaskOrdering) {
    setOrdering(next);
    setPage(1);
  }

  async function handleCreateOrUpdate(input: TaskInput) {
    if (panelTask === "new") {
      await api.createTask(input);
      setPage(1);
      setReloadKey((k) => k + 1);
      notify("Task created.");
    } else if (panelTask) {
      const previousBucket = otherBucket(panelTask.status);
      const updated = await api.updateTask(panelTask.id, input);
      const newBucket = otherBucket(updated.status);

      setTasks((prev) => {
        const withoutOld = prev.filter((t) => t.id !== updated.id);
        const stillVisible = filter === "all" || filter === newBucket;
        return stillVisible ? [updated, ...withoutOld] : withoutOld;
      });

      if (previousBucket !== newBucket) {
        setCounts((c) => ({
          ...c,
          [previousBucket]: c[previousBucket] - 1,
          [newBucket]: c[newBucket] + 1,
        }));
      }
      notify("Task updated.");
    }
    setPanelTask(null);
  }

  async function handleToggleStatus(task: Task) {
    setBusyId(task.id);
    setError(null);
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    try {
      const updated = await api.patchTask(task.id, { status: nextStatus });
      const stillVisible = filter === "all" || filter === otherBucket(updated.status);
      const nextTasks = stillVisible
        ? tasks.map((t) => (t.id === updated.id ? updated : t))
        : tasks.filter((t) => t.id !== updated.id);
      setTasks(nextTasks);
      setCounts((c) => ({
        ...c,
        [otherBucket(task.status)]: c[otherBucket(task.status)] - 1,
        [otherBucket(nextStatus)]: c[otherBucket(nextStatus)] + 1,
      }));
      if (nextTasks.length === 0 && page > 1) setPage((p) => p - 1);
      notify(nextStatus === "completed" ? "Marked as completed." : "Marked as pending.");
    } catch {
      setError("Couldn't update that task. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(task: Task) {
    setBusyId(task.id);
    setError(null);
    try {
      await api.deleteTask(task.id);
      const remaining = tasks.filter((t) => t.id !== task.id);
      setTasks(remaining);
      setCounts((c) => ({
        ...c,
        all: c.all - 1,
        [otherBucket(task.status)]: c[otherBucket(task.status)] - 1,
      }));
      if (remaining.length === 0 && page > 1) setPage((p) => p - 1);
      notify("Task deleted.");
    } catch {
      setError("Couldn't delete that task. Please try again.");
    } finally {
      setBusyId(null);
      setConfirmDeleteTask(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-line pb-4 sm:pb-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-strong sm:h-9 sm:w-9">
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
              <path
                d="M3 8.5L6 11.5L13 4.5"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h1 className="truncate font-serif text-lg font-semibold text-ink sm:text-xl">
            Task Manager
          </h1>
        </div>
        <AccountMenu />
      </header>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <svg
            viewBox="0 0 16 16"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-soft"
            fill="none"
            aria-hidden
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <TextInput
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tasks…"
            aria-label="Search tasks"
            className="pl-9"
          />
        </div>
        <Button onClick={() => setPanelTask("new")} className="w-full shrink-0 sm:w-auto">
          Add task
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
          <FilterTabs value={filter} onChange={handleFilterChange} counts={counts} />
        </div>
        <div className="flex items-center gap-2 sm:shrink-0">
          <label htmlFor="sort" className="text-sm text-ink-soft">
            Sort
          </label>
          <Select
            id="sort"
            value={ordering}
            onChange={(e) => handleOrderingChange(e.target.value as TaskOrdering)}
            className="w-auto"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {error && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <ErrorBanner message={error} />
            <Button
              variant="secondary"
              onClick={() => setReloadKey((k) => k + 1)}
              className="shrink-0"
            >
              Retry
            </Button>
          </div>
        )}

        {initialLoading ? (
          <ul className="flex flex-col gap-2">
            <TaskRowSkeleton />
            <TaskRowSkeleton />
            <TaskRowSkeleton />
          </ul>
        ) : tasks.length === 0 ? (
          <div className="rounded-md border border-dashed border-line py-16 text-center">
            <svg
              viewBox="0 0 24 24"
              className="mx-auto h-8 w-8 text-slate"
              fill="none"
              aria-hidden
            >
              <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.4" />
              <path d="M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <p className="mt-3 text-sm text-ink-soft">
              {search
                ? `No tasks match "${search}".`
                : filter === "all"
                  ? "No tasks yet. Add your first one to get started."
                  : `No ${filter} tasks.`}
            </p>
          </div>
        ) : (
          <ul
            className={`flex flex-col gap-2 transition-opacity ${refreshing ? "opacity-60" : "opacity-100"}`}
          >
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                busy={busyId === task.id}
                onToggleStatus={handleToggleStatus}
                onEdit={setPanelTask}
                onDelete={setConfirmDeleteTask}
              />
            ))}
          </ul>
        )}

        {!initialLoading && refreshing && (
          <div className="flex justify-center py-1">
            <Spinner label="Refreshing…" />
          </div>
        )}

        {!initialLoading && (pageInfo.hasNext || pageInfo.hasPrevious) && (
          <div className="flex flex-col items-center gap-3 border-t border-line pt-4 sm:flex-row sm:justify-between">
            <p className="text-sm text-ink-soft">{pageInfo.count} results</p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={!pageInfo.hasPrevious}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="px-1 text-sm whitespace-nowrap text-ink-soft">Page {page}</span>
              <Button
                variant="secondary"
                disabled={!pageInfo.hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {panelTask && (
        <TaskFormPanel
          task={panelTask === "new" ? null : panelTask}
          onClose={() => setPanelTask(null)}
          onSubmit={handleCreateOrUpdate}
        />
      )}

      {confirmDeleteTask && (
        <ConfirmDialog
          title="Delete task"
          description={`Delete "${confirmDeleteTask.title}"? This can't be undone.`}
          confirmLabel="Delete"
          danger
          onCancel={() => setConfirmDeleteTask(null)}
          onConfirm={() => handleDelete(confirmDeleteTask)}
        />
      )}
    </div>
  );
}
