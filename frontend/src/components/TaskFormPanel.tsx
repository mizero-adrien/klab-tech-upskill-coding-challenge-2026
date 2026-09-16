"use client";

import { useState } from "react";
import { ApiError, Task, TaskInput, TaskPriority } from "@/lib/api";
import { Button, ErrorBanner, Field, TextArea, TextInput } from "@/components/ui";

export function TaskFormPanel({
  task,
  onClose,
  onSubmit,
}: {
  task: Task | null;
  onClose: () => void;
  onSubmit: (input: TaskInput) => Promise<void>;
}) {
  const isEdit = Boolean(task);
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "medium");
  const [status, setStatus] = useState<Task["status"]>(task?.status ?? "pending");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ title, description, priority, ...(isEdit ? { status } : {}) });
    } catch (err) {
      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        const data = err.data as Record<string, string[]>;
        setError(data.title?.[0] || "Could not save this task. Please check the form.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-ink/30" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col bg-panel px-6 py-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-ink">
            {isEdit ? "Edit task" : "New task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-md p-1 text-ink-soft hover:bg-slate-soft hover:text-ink"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col gap-4">
          {error && <ErrorBanner message={error} />}

          <Field label="Title" htmlFor="title">
            <TextInput
              id="title"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to get done?"
            />
          </Field>

          <Field label="Description" htmlFor="description">
            <TextArea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any useful detail (optional)"
            />
          </Field>

          <Field label="Priority" htmlFor="priority">
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-ink focus:border-indigo"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </Field>

          {isEdit && (
            <Field label="Status" htmlFor="status">
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Task["status"])}
                className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-ink focus:border-indigo"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </Field>
          )}

          <div className="mt-auto flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : isEdit ? "Save changes" : "Add task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
