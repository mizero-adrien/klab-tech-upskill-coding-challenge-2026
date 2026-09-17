import Link from "next/link";
import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type Variant = "primary" | "secondary" | "danger" | "dangerSolid" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-indigo text-white hover:bg-indigo-strong disabled:opacity-50",
  secondary:
    "bg-panel text-ink border border-line hover:border-ink-soft disabled:opacity-50",
  danger: "bg-panel text-clay border border-clay/40 hover:bg-clay-soft disabled:opacity-50",
  dangerSolid: "bg-clay text-white hover:bg-clay/90 disabled:opacity-50",
  ghost: "text-ink-soft hover:text-ink disabled:opacity-50",
};

const buttonBaseClasses =
  "inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-all duration-100 cursor-pointer active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`${buttonBaseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export function LinkButton({
  variant = "primary",
  className = "",
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; href: string }) {
  return (
    <Link
      href={href}
      className={`${buttonBaseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-clay">{error}</p>}
    </div>
  );
}

const controlClasses =
  "w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 transition-colors focus:border-indigo";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={`${controlClasses} ${props.className ?? ""}`} />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} className={`${controlClasses} ${props.className ?? ""}`} />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`${controlClasses} cursor-pointer appearance-none pr-9 ${props.className ?? ""}`}
      />
      <svg
        viewBox="0 0 12 8"
        className="pointer-events-none absolute top-1/2 right-3 h-2 w-3 -translate-y-1/2 text-ink-soft"
        fill="none"
        aria-hidden
      >
        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-clay/30 bg-clay-soft px-3.5 py-2.5 text-sm text-clay">
      {message}
    </div>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-soft">
      <span
        className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-indigo"
        aria-hidden
      />
      {label}
    </div>
  );
}

export function Avatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-strong text-sm font-semibold text-white">
      {initial}
    </span>
  );
}

export function TaskRowSkeleton() {
  return (
    <li className="flex items-start gap-3 border-l-2 border-line bg-panel px-4 py-3.5">
      <span className="mt-0.5 h-5 w-5 shrink-0 animate-pulse rounded-full bg-slate-soft" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="h-3.5 w-2/5 animate-pulse rounded bg-slate-soft" />
        <span className="h-3 w-4/5 animate-pulse rounded bg-slate-soft" />
      </div>
    </li>
  );
}
