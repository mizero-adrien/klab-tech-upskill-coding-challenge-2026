"use client";

import { useState } from "react";
import { ApiError, changePassword } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";
import { Button, ErrorBanner, Field, TextInput } from "@/components/ui";

type FieldErrors = Partial<Record<"old_password" | "new_password" | "new_password2", string>>;

export function ChangePasswordDialog({ onClose }: { onClose: () => void }) {
  const { notify } = useToast();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword2,
      });
      notify("Password changed successfully.");
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        const data = err.data as Record<string, string[]>;
        const nextFieldErrors: FieldErrors = {};
        for (const key of ["old_password", "new_password", "new_password2"] as const) {
          if (data[key]?.length) nextFieldErrors[key] = data[key][0];
        }
        setFieldErrors(nextFieldErrors);
        if (Object.keys(nextFieldErrors).length === 0) {
          setError("Could not change your password. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-ink/30 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-panel p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="change-password-title" className="font-serif text-lg font-semibold text-ink">
          Change password
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {error && <ErrorBanner message={error} />}

          <Field label="Current password" htmlFor="old_password" error={fieldErrors.old_password}>
            <TextInput
              id="old_password"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </Field>

          <Field label="New password" htmlFor="new_password" error={fieldErrors.new_password}>
            <TextInput
              id="new_password"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Field>

          <Field
            label="Confirm new password"
            htmlFor="new_password2"
            error={fieldErrors.new_password2}
          >
            <TextInput
              id="new_password2"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
            />
          </Field>

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Change password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
