import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";
import type { ActivityEvent, Booking, BookingStatus, Enquiry } from "@/lib/demoApi";
import { formatINR } from "@/lib/demoApi";

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

export type DashTabId = "overview" | "cms" | "bookings" | "enquiries" | "history" | "settings";

export const DEFAULT_DASH_TABS: { id: DashTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "cms", label: "Inventory / CMS" },
  { id: "bookings", label: "Bookings" },
  { id: "enquiries", label: "Enquiries" },
  { id: "history", label: "History" },
  { id: "settings", label: "Settings" },
];

export function DashTabs({
  tabs = DEFAULT_DASH_TABS,
  active,
  onChange,
}: {
  tabs?: { id: DashTabId; label: string }[];
  active: DashTabId;
  onChange: (id: DashTabId) => void;
}) {
  return (
    <div
      className="mb-6 flex flex-wrap gap-1.5 rounded-2xl border bg-neutral-50 p-1.5"
      style={{ borderColor: "rgba(0,0,0,0.06)" }}
      role="tablist"
    >
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.id)}
            className="rounded-xl px-3.5 py-2 text-[12px] font-bold transition"
            style={
              on
                ? { background: "#111", color: "#fff" }
                : { background: "transparent", color: "#555" }
            }
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function ToggleRow({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-neutral-50 px-4 py-3">
      <div>
        <p className="text-[13px] font-bold">{label}</p>
        {sub && <p className="text-[11px] text-neutral-500">{sub}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative h-7 w-12 shrink-0 rounded-full transition"
        style={{ background: checked ? GREEN : "#D4D4D4" }}
      >
        <span
          className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition"
          style={{ left: checked ? 22 : 2 }}
        />
      </button>
    </div>
  );
}

export function HistoryTimeline({ items }: { items: ActivityEvent[] }) {
  if (items.length === 0) {
    return <p className="text-[13px] text-neutral-400">No activity yet — actions will appear here.</p>;
  }
  return (
    <ol className="relative space-y-0 border-l-2 pl-5" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
      {items.map((ev) => (
        <li key={ev.id} className="relative pb-5">
          <span
            className="absolute -left-[1.4rem] top-1 h-3 w-3 rounded-full border-2 border-white"
            style={{ background: RED }}
          />
          <p className="text-[13px] font-semibold">{ev.summary}</p>
          <p className="text-[11px] text-neutral-500">
            {ev.actorName}
            {ev.role ? ` · ${ev.role}` : ""} · {ev.action} ·{" "}
            {new Date(ev.createdAt).toLocaleString()}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function BookingsManager({
  bookings,
  onStatus,
  onNotes,
  emptyCta,
  onEmpty,
}: {
  bookings: Booking[];
  onStatus: (id: string, status: BookingStatus) => void;
  onNotes?: (id: string, notes: string) => void;
  emptyCta?: string;
  onEmpty?: () => void;
}) {
  const statuses: Array<BookingStatus | "all"> = ["all", "pending", "confirmed", "completed", "cancelled"];
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className="rounded-full px-3 py-1 text-[11px] font-bold capitalize"
            style={
              filter === s
                ? { background: "#111", color: "#fff" }
                : { background: "#F5F5F5", color: "#555" }
            }
          >
            {s}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        emptyCta && onEmpty ? (
          <CmsEmpty label="No bookings in this filter." cta={emptyCta} onClick={onEmpty} />
        ) : (
          <p className="text-[13px] text-neutral-400">No bookings in this filter.</p>
        )
      ) : (
        <ul className="space-y-3">
          {filtered.map((b) => (
            <li key={b.id} className="rounded-2xl border p-4" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[14px] font-bold">{b.title}</p>
                  <p className="text-[12px] text-neutral-500">
                    {b.id} · {b.detail} · {formatINR(b.amount)}
                    {b.stayDate ? ` · stay ${b.stayDate}` : ""}
                  </p>
                  <div className="mt-2">
                    <StatusPill
                      tone={
                        b.status === "completed"
                          ? "green"
                          : b.status === "pending"
                            ? "amber"
                            : b.status === "cancelled"
                              ? "red"
                              : "gray"
                      }
                    >
                      {b.status}
                    </StatusPill>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(["pending", "confirmed", "completed", "cancelled"] as BookingStatus[]).map((st) => (
                    <ActionBtn key={st} disabled={b.status === st} onClick={() => onStatus(b.id, st)}>
                      {st}
                    </ActionBtn>
                  ))}
                </div>
              </div>
              {onNotes && (
                <div className="mt-3">
                  <Field label="Internal notes">
                    <textarea
                      className={fieldClass}
                      rows={2}
                      defaultValue={b.notes ?? ""}
                      key={`${b.id}-${b.notes ?? ""}`}
                      onBlur={(e) => {
                        if (e.target.value !== (b.notes ?? "")) onNotes(b.id, e.target.value);
                      }}
                    />
                  </Field>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function EnquiriesInbox({
  items,
  onMarkRead,
  onReply,
  onStatus,
  allowCompose,
  onCompose,
}: {
  items: Enquiry[];
  onMarkRead: (id: string) => void;
  onReply: (id: string, reply: string) => void;
  onStatus: (id: string, status: "open" | "closed") => void;
  allowCompose?: boolean;
  onCompose?: () => void;
}) {
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});

  if (items.length === 0) {
    return (
      <CmsEmpty
        label="Inbox empty."
        cta={allowCompose ? "Send enquiry" : "Refresh later"}
        onClick={() => (allowCompose && onCompose ? onCompose() : undefined)}
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((e) => (
        <li
          key={e.id}
          className="rounded-2xl border p-4"
          style={{
            borderColor: e.read ? "rgba(0,0,0,0.06)" : "rgba(226,55,68,0.35)",
            background: e.read ? "#fff" : "#FFF8F8",
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[14px] font-bold">{e.subject}</p>
              <p className="text-[11px] text-neutral-500">
                From {e.fromName} · {e.fromEmail} · {new Date(e.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              <StatusPill tone={e.status === "open" ? "amber" : "gray"}>{e.status}</StatusPill>
              {!e.read && <ActionBtn onClick={() => onMarkRead(e.id)}>Mark read</ActionBtn>}
              <ActionBtn onClick={() => onStatus(e.id, e.status === "open" ? "closed" : "open")}>
                {e.status === "open" ? "Close" : "Reopen"}
              </ActionBtn>
            </div>
          </div>
          <p className="mt-2 text-[13px] text-neutral-700">{e.message}</p>
          {e.reply && (
            <p className="mt-2 rounded-xl bg-neutral-50 px-3 py-2 text-[12px]">
              <strong>Reply:</strong> {e.reply}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              className={`${fieldClass} max-w-md`}
              placeholder="Type a demo reply…"
              value={replyDraft[e.id] ?? ""}
              onChange={(ev) => setReplyDraft((d) => ({ ...d, [e.id]: ev.target.value }))}
            />
            <ActionBtn
              variant="primary"
              onClick={() => {
                const text = (replyDraft[e.id] ?? "").trim();
                if (!text) return;
                onReply(e.id, text);
                setReplyDraft((d) => ({ ...d, [e.id]: "" }));
              }}
            >
              Send reply
            </ActionBtn>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function OverviewStats({
  items,
}: {
  items: { label: string; value: string | number; tone?: "green" | "default" }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="rounded-3xl border p-4" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
          <p className="text-[11px] font-semibold uppercase text-neutral-400">{s.label}</p>
          <p
            className="mt-1 text-[26px] font-bold"
            style={{ color: s.tone === "green" ? GREEN : undefined }}
          >
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
