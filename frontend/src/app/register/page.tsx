"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { AuthShell } from "@/components/AuthShell";
import { Button, ErrorBanner, Field, TextInput } from "@/components/ui";
import { ApiError } from "@/lib/api";

type FieldErrors = Partial<Record<"username" | "email" | "password" | "password2", string>>;

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      await register(form);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        const data = err.data as Record<string, string[]>;
        const nextFieldErrors: FieldErrors = {};
        for (const key of ["username", "email", "password", "password2"] as const) {
          if (data[key]?.length) nextFieldErrors[key] = data[key][0];
        }
        setFieldErrors(nextFieldErrors);
        if (Object.keys(nextFieldErrors).length === 0) {
          setError("Could not create your account. Please check your details.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Create an account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <ErrorBanner message={error} />}
        <Field label="Username" htmlFor="username" error={fieldErrors.username}>
          <TextInput
            id="username"
            autoComplete="username"
            required
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
          />
        </Field>
        <Field label="Email" htmlFor="email" error={fieldErrors.email}>
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor="password" error={fieldErrors.password}>
          <TextInput
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </Field>
        <Field label="Confirm password" htmlFor="password2" error={fieldErrors.password2}>
          <TextInput
            id="password2"
            type="password"
            autoComplete="new-password"
            required
            value={form.password2}
            onChange={(e) => update("password2", e.target.value)}
          />
        </Field>
        <Button type="submit" disabled={submitting} className="mt-2 w-full">
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
