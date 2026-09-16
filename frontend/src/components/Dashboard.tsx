"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { FilterTabs, StatusFilter } from "@/components/FilterTabs";
import { TaskRow } from "@/components/TaskRow";
import { TaskFormPanel } from "@/components/TaskFormPanel";
import { Button, ErrorBanner, Spinner } from "@/components/ui";
import * as api from "@/lib/api";
import { Task, TaskInput } from "@/lib/api";

export function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [panelTask, setPanelTask] = useState<Task | null | "new">(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.listTasks(filter === "all" ? {} : { status: filter });
        if (!ignore) setTasks(data.results);
      } catch {
        if (!ignore) {
          setError("Couldn't load your tasks. Check your connection and try again.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [filter, reloadKey]);

  async function handleCreateOrUpdate(input: TaskInput) {
    if (panelTask === "new") {
      const created = await api.createTask(input);
      setTasks((prev) => [created, ...prev]);
    } else if (panelTask) {
      const updated = await api.updateTask(panelTask.id, input);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }
    setPanelTask(null);
  }

  async function handleToggleStatus(task: Task) {
    setBusyId(task.id);
    setError(null);
    try {
      const updated = await api.patchTask(task.id, {
        status: task.status === "completed" ? "pending" : "completed",
      });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      setError("Couldn't update that task. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(task: Task) {
    if (!window.confirm(`Delete "${task.title}"? This can't be undone.`)) return;
    setBusyId(task.id);
    setError(null);
    try {
      await api.deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch {
      setError("Couldn't delete that task. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">Task Manager</h1>
          <p className="text-sm text-ink-soft">Signed in as {user?.username}</p>
        </div>
        <Button variant="ghost" onClick={logout}>
          Sign out
        </Button>
      </header>

      <div className="mt-8 flex items-center justify-between gap-4">
        <FilterTabs value={filter} onChange={setFilter} />
        <Button onClick={() => setPanelTask("new")}>Add task</Button>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {error && (
          <div className="flex items-center justify-between gap-4">
            <ErrorBanner message={error} />
            <Button variant="secondary" onClick={() => setReloadKey((k) => k + 1)}>
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center">
            <Spinner label="Loading tasks…" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-md border border-dashed border-line py-16 text-center">
            <p className="text-sm text-ink-soft">
              {filter === "all"
                ? "No tasks yet. Add your first one to get started."
                : `No ${filter} tasks.`}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                busy={busyId === task.id}
                onToggleStatus={handleToggleStatus}
                onEdit={setPanelTask}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </div>

      {panelTask && (
        <TaskFormPanel
          task={panelTask === "new" ? null : panelTask}
          onClose={() => setPanelTask(null)}
          onSubmit={handleCreateOrUpdate}
        />
      )}
    </div>
  );
}
