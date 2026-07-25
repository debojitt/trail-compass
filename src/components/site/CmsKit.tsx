import type { ReactNode } from "react";
import { X } from "lucide-react";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";

export function CmsSection({
  title,
  sub,
  action,
  children,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border bg-white p-5" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold tracking-tight">{title}</h2>
          {sub && <p className="mt-0.5 text-[12px] text-neutral-500">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function CmsEmpty({
  label,
  cta,
  onClick,
}: {
  label: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed bg-neutral-50 px-4 py-10 text-center" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
      <p className="text-[14px] text-neutral-500">{label}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-3 rounded-full px-5 py-2 text-[13px] font-bold text-white"
        style={{ background: RED }}
      >
        {cta}
      </button>
    </div>
  );
}

export function StatusPill({
  tone,
  children,
}: {
  tone: "green" | "amber" | "gray" | "red";
  children: ReactNode;
}) {
  const styles =
    tone === "green"
      ? { background: GREEN_LIGHT, color: GREEN }
      : tone === "amber"
        ? { background: "#FFF7ED", color: "#C2410C" }
        : tone === "red"
          ? { background: "#FEE2E2", color: RED }
          : { background: "#F5F5F5", color: "#666" };
  return (
    <span className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={styles}>
      {children}
    </span>
  );
}

export function ActionBtn({
  children,
  onClick,
  variant = "ghost",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "ghost" | "primary" | "danger" | "success";
  disabled?: boolean;
}) {
  const style =
    variant === "primary"
      ? { background: RED, color: "#fff", borderColor: RED }
      : variant === "success"
        ? { background: GREEN, color: "#fff", borderColor: GREEN }
        : variant === "danger"
          ? { background: "#fff", color: RED, borderColor: "rgba(226,55,68,0.35)" }
          : { background: "#fff", color: "#222", borderColor: "rgba(0,0,0,0.12)" };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full border px-3 py-1.5 text-[11px] font-bold disabled:opacity-50"
      style={style}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{label}</span>
      {children}
    </label>
  );
}

export const fieldClass =
  "w-full rounded-xl border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-black/5";

export function CmsDrawer({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button type="button" aria-label="Close drawer" className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          <h3 className="text-[16px] font-bold">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-neutral-100">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="border-t px-5 py-4" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function InventoryTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
      <table className="w-full min-w-[640px] text-left text-[13px]">
        <thead className="bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-400">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i} className="border-t" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
              {cells.map((c, j) => (
                <td key={j} className="px-3 py-3 align-middle">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
