import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Copy, Link2, ShieldAlert, Users } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { claimSeat, formatINR, useStore } from "@/lib/store";
import { RED, GREEN, GREEN_LIGHT } from "@/lib/brand";

export const Route = createFileRoute("/trip/$id/invite")({
  head: () => ({
    meta: [{ title: "Invite crew · NORTHNEST" }, { name: "description", content: "Per-seat payment — no group-block bottleneck." }],
  }),
  loader: ({ params }) => ({ id: params.id }),
  component: InvitePage,
  notFoundComponent: () => (
    <SiteShell>
      <div className="py-20 text-center"><h1 className="text-xl font-bold">Trip not found</h1></div>
    </SiteShell>
  ),
});

function InvitePage() {
  const { id } = Route.useLoaderData();
  const trip = useStore((s) => s.groupTrips.find((t) => t.id === id));
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [seatOpen, setSeatOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "" });

  if (!trip) throw notFound();

  const paid = trip.seats.filter((s) => s.paid).length;
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/trip/${trip.id}/invite`;

  const share = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const claim = (seatId: string) => {
    if (!form.name || !form.email) return;
    claimSeat(trip.id, seatId, form.name, form.email);
    setSeatOpen(null);
    setForm({ name: "", email: "" });
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl">
        <img src={trip.cover} alt="" className="aspect-video w-full rounded-3xl object-cover" />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-bold tracking-tight">{trip.title}</h1>
            <p className="text-[13px] text-neutral-500">
              <Users size={13} className="mr-1 inline" /> {paid}/{trip.seats.length} seats confirmed · {formatINR(trip.perSeat)}/seat
            </p>
          </div>
          <button onClick={share} className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold text-white" style={{ background: RED }}>
            {copied ? <CheckCircle2 size={14} /> : <Link2 size={14} />}
            {copied ? "Link copied!" : "Copy invite link"}
          </button>
        </div>

        <div className="mt-6 rounded-2xl px-4 py-3 text-[12px]" style={{ background: GREEN_LIGHT, color: GREEN }}>
          <strong>How it works:</strong> Everyone pays for their own seat. Nobody's booking depends on the group paying as a block. EMI available per seat.
        </div>

        <ul className="mt-6 space-y-3">
          {trip.seats.map((s, i) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border p-4"
              style={{ borderColor: "rgba(0,0,0,0.08)", background: s.paid ? "#f0fdf4" : "#fff" }}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-neutral-100 text-[12px] font-bold">
                #{i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold">{s.memberName}</p>
                <p className="text-[11px] text-neutral-500">{s.email ?? (s.claimed ? "Waiting for payment" : "Unclaimed")}</p>
              </div>
              {s.paid ? (
                <span className="flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold" style={{ background: GREEN, color: "white" }}>
                  <CheckCircle2 size={12} /> Paid · confirmed
                </span>
              ) : s.claimed ? (
                <button
                  onClick={() => claim(s.id)}
                  className="rounded-full px-3 py-1 text-[11px] font-bold text-white"
                  style={{ background: RED }}
                >
                  Pay {formatINR(trip.perSeat)}
                </button>
              ) : (
                <button
                  onClick={() => setSeatOpen(s.id)}
                  className="rounded-full border px-3 py-1 text-[11px] font-bold"
                  style={{ borderColor: RED, color: RED }}
                >
                  Claim seat
                </button>
              )}
              {seatOpen === s.id && (
                <div className="mt-3 w-full space-y-2 rounded-2xl border p-3" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
                  <input placeholder="Your name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-[13px]" style={{ borderColor: "rgba(0,0,0,0.12)" }} />
                  <input placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-[13px]" style={{ borderColor: "rgba(0,0,0,0.12)" }} />
                  <button onClick={() => claim(s.id)} className="w-full rounded-full py-2 text-[13px] font-bold text-white" style={{ background: GREEN }}>
                    Claim + pay {formatINR(trip.perSeat)}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        <button
          onClick={() => navigate({ to: "/trip/$id/sos", params: { id: trip.id } })}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-[13px] font-bold"
          style={{ borderColor: RED, color: RED }}
        >
          <ShieldAlert size={14} /> Open Echo SOS for this trip
        </button>
      </div>
    </SiteShell>
  );
}
