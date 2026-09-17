"use client";

import { useEffect, useState } from "react";
import { ApiError, Task, TaskInput, TaskPriority } from "@/lib/api";
import { Button, ErrorBanner, Field, Select, TextArea, TextInput } from "@/components/ui";

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
  const TITLE_MAX = 255;
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(task?.due_date ?? "");
  const [status, setStatus] = useState<Task["status"]>(task?.status ?? "pending");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 180);
  }

  function validateTitle(value: string): string | null {
    if (!value.trim()) return "Title is required.";
    if (value.trim().length > TITLE_MAX) {
      return `Title must be ${TITLE_MAX} characters or fewer.`;
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const titleValidation = validateTitle(title);
    setTitleError(titleValidation);
    if (titleValidation) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description,
        priority,
        status,
        due_date: dueDate || null,
      });
    } catch (err) {
      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        const data = err.data as Record<string, string[]>;
        if (data.title?.[0]) {
          setTitleError(data.title[0]);
        } else {
          setError("Could not save this task. Please check the form.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
  }

  const shown = visible && !closing;

  return (
    <div
      className={`fixed inset-0 z-20 flex justify-end bg-ink/30 transition-opacity duration-200 ${
        shown ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`flex h-full w-full max-w-md flex-col overflow-y-auto bg-panel px-4 py-5 shadow-xl transition-transform duration-200 ease-out sm:px-6 sm:py-6 ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-ink">
            {isEdit ? "Edit task" : "New task"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
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

          <Field label="Title" htmlFor="title" error={titleError ?? undefined}>
            <TextInput
              id="title"
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(null);
              }}
              onBlur={() => setTitleError(validateTitle(title))}
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
            <Select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </Field>

          <Field label="Due date" htmlFor="due_date">
            <TextInput
              id="due_date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Field>

          <Field label="Status" htmlFor="status">
            <Select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Task["status"])}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </Select>
          </Field>

          <div className="mt-auto flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={handleClose}>
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
