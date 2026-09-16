export function AuthShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-2/5 flex-col justify-between overflow-hidden bg-indigo-strong px-10 py-12 text-white lg:flex">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
          aria-hidden
        >
          <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <span className="relative flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
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
          <span className="font-serif text-lg font-semibold">Task Manager</span>
        </span>

        <div className="relative max-w-sm">
          <p className="font-serif text-3xl leading-tight font-semibold">
            Organize your work, one task at a time.
          </p>
          <p className="mt-4 text-sm text-white/70">
            Track what needs doing, mark it done, and keep everything
            organized by priority and status.
          </p>
        </div>

        <p className="relative text-xs text-white/50">
          Search, filter, and stay on top of every task.
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-2xl font-semibold text-ink">{title}</h1>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
