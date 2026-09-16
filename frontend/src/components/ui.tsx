import { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-indigo text-white hover:bg-indigo-strong disabled:opacity-50",
  secondary:
    "bg-panel text-ink border border-line hover:border-ink-soft disabled:opacity-50",
  danger: "bg-panel text-clay border border-clay/40 hover:bg-clay-soft disabled:opacity-50",
  ghost: "text-ink-soft hover:text-ink disabled:opacity-50",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
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

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-indigo ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-indigo ${props.className ?? ""}`}
    />
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
