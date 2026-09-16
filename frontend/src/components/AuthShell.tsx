export function AuthShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-2/5 flex-col justify-between bg-indigo-strong px-10 py-12 text-white lg:flex">
        <span className="font-serif text-lg font-semibold">Task Manager</span>
        <div className="max-w-sm">
          <p className="font-serif text-3xl leading-tight font-semibold">
            Built for the kLab Tech Upskill Program challenge.
          </p>
          <p className="mt-4 text-sm text-white/70">
            Track what needs doing, mark it done, and keep your work organized
            by priority and status.
          </p>
        </div>
        <p className="text-xs text-white/50">
          Django REST Framework · Next.js · PostgreSQL
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-2xl font-semibold text-ink">{title}</h1>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
