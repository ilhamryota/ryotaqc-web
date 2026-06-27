import { Link } from "@tanstack/react-router";
import { Plus, ArrowRight } from "lucide-react";
import { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  to,
}: {
  label: string;
  value: string | number;
  hint?: string;
  to?: string;
}) {
  const body = (
    <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
      {to && (
        <div className="mt-3 inline-flex items-center text-xs text-primary">
          Kelola <ArrowRight className="ml-1 h-3 w-3" />
        </div>
      )}
    </div>
  );
  return to ? <Link to={to as any}>{body}</Link> : body;
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function AddButton({ onClick, label = "Tambah" }: { onClick: () => void; label?: string }) {
  return (
    <PrimaryButton onClick={onClick}>
      <Plus className="h-4 w-4" /> {label}
    </PrimaryButton>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
      {children}
      {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

export function StatusBadge({ status }: { status: "draft" | "published" | "scheduled" }) {
  const styles =
    status === "published"
      ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
      : status === "scheduled"
        ? "bg-violet-500/15 text-violet-600 border-violet-500/30 dark:text-violet-400"
        : "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "published" ? "bg-emerald-500" : status === "scheduled" ? "bg-violet-500" : "bg-amber-500"}`} />
      {status === "published" ? "Published" : status === "scheduled" ? "Scheduled" : "Draft"}
    </span>
  );
}
