"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { LinkButton } from "@/components/ui";

const FEATURES: { title: string; description: string; icon: React.ReactNode }[] = [
  {
    title: "Search",
    description: "Find any task instantly by title or description as you type.",
    icon: (
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Filter and sort",
    description: "Switch between all, pending, and completed, then sort by due date or priority.",
    icon: (
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
        <path d="M2 4h12M4.5 8h7M7 12h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Priorities and due dates",
    description: "Flag what matters most and never lose track of a deadline.",
    icon: (
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
        <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2 6.5h12M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Your tasks, private to you",
    description: "Every account keeps its own list, protected behind a secure sign-in.",
    icon: (
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
        <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

function MockTaskRow({
  title,
  priorityLabel,
  priorityColor,
  done,
  due,
}: {
  title: string;
  priorityLabel: string;
  priorityColor: string;
  done?: boolean;
  due?: string;
}) {
  return (
    <li
      className={`flex items-center gap-3 border-l-2 bg-panel px-4 py-3 ${done ? "border-moss" : "border-slate"}`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${done ? "border-moss bg-moss" : "border-line"}`}
      >
        {done && (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden>
            <path d="M2 6l2.5 2.5L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <div className="min-w-0">
        <p className={`truncate text-sm font-medium ${done ? "text-ink-soft line-through" : "text-ink"}`}>
          {title}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-soft">
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${priorityColor}`} aria-hidden />
            {priorityLabel}
          </span>
          {due && <span>{due}</span>}
        </p>
      </div>
    </li>
  );
}

export function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <span className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-strong">
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
              <path d="M3 8.5L6 11.5L13 4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="truncate font-serif text-base font-semibold text-ink sm:text-lg">
            Task Manager
          </span>
        </span>
        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          <LinkButton href="/login" variant="ghost" className="px-2 sm:px-3.5">
            Sign in
          </LinkButton>
          <LinkButton href="/register" className="px-2.5 sm:px-3.5">
            Get started
          </LinkButton>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 sm:px-6">
        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-2 lg:gap-16 lg:py-16">
          <div>
            <h1 className="font-serif text-4xl leading-tight font-semibold text-ink sm:text-5xl">
              Organize your work, one task at a time.
            </h1>
            <p className="mt-5 max-w-md text-base text-ink-soft">
              Create tasks, set priorities and due dates, and track what&apos;s done
              — all in one clear, fast list that stays out of your way.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/register" className="w-full sm:w-auto">
                Get started — it&apos;s free
              </LinkButton>
              <LinkButton href="/login" variant="secondary" className="w-full sm:w-auto">
                Sign in
              </LinkButton>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-paper p-3 shadow-sm">
            <ul className="flex flex-col gap-2">
              <MockTaskRow
                title="Prepare client presentation"
                priorityLabel="High priority"
                priorityColor="bg-clay"
                due="Due Oct 3"
              />
              <MockTaskRow
                title="Review pull requests"
                priorityLabel="Medium priority"
                priorityColor="bg-amber"
              />
              <MockTaskRow
                title="Update onboarding docs"
                priorityLabel="Completed"
                priorityColor="bg-moss"
                done
              />
            </ul>
          </div>
        </section>

        <section className="grid gap-8 border-t border-line py-12 sm:grid-cols-2 sm:py-16">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex gap-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo/10 text-indigo">
                {feature.icon}
              </span>
              <div>
                <h2 className="text-sm font-semibold text-ink">{feature.title}</h2>
                <p className="mt-1 text-sm text-ink-soft">{feature.description}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-4 py-10 text-center sm:px-6">
          <p className="font-serif text-xl font-semibold text-ink">
            Ready to get organized?
          </p>
          <LinkButton href="/register">Get started — it&apos;s free</LinkButton>
        </div>
      </footer>
    </div>
  );
}
