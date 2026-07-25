import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CreditCard } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { useDemoUser } from "@/components/site/useDemoUser";
import type { GroupInvite } from "@/data/demoUniverse";
import { claimGroupSeat, fetchGroupByCode, formatINR, payGroupSeatEmi, subscribeDemoStore } from "@/lib/demoApi";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";
import { toast } from "sonner";

export const Route = createFileRoute("/invite/$code")({
  head: ({ params }) => ({ meta: [{ title: `Crew ${params.code} · NORTHNEST` }] }),
  component: InviteDetailPage,
});

function InviteDetailPage() {
  const { code } = Route.useParams();
  const user = useDemoUser();
  const [invite, setInvite] = useState<GroupInvite | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  const load = () => fetchGroupByCode(code).then(setInvite);

  useEffect(() => {
    load();
    return subscribeDemoStore(() => {
      load();
    });
  }, [code]);

  if (invite === undefined) {
    return (
      <SiteShell>
        <div className="h-48 animate-pulse rounded-3xl bg-neutral-100" />
      </SiteShell>
    );
  }
  if (!invite) {
    return (
      <SiteShell>
        <p className="font-bold">Invite not found</p>
        <Link to="/invite" style={{ color: RED }}>
          All invites
        </Link>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <Link to="/invite" className="text-[13px] font-semibold text-neutral-500">
        ← All crew invites
      </Link>
      <div className="mt-4 overflow-hidden rounded-3xl">
        <img src={invite.cover} alt="" className="h-48 w-full object-cover md:h-64" />
      </div>
      <p className="mt-4 font-mono text-[12px] font-bold" style={{ color: GREEN }}>
        {invite.code}
      </p>
      <h1 className="text-[28px] font-bold tracking-tight">{invite.title}</h1>
      <p className="text-[13px] text-neutral-500">Planned by {invite.plannerName}</p>
      <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-neutral-600">
        Each member claims and pays their own seat. Individual EMI per seat — your booking does not
        depend on the whole group paying together.
      </p>
      <p className="mt-2 text-[18px] font-bold" style={{ color: RED }}>
        {formatINR(invite.pricePerSeat)} / seat · EMI {formatINR(invite.emiPerMonth)}/mo × 4
      </p>

      <div className="mt-8 space-y-3">
        {invite.seats.map((s) => (
          <div
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4"
            style={{ borderColor: "rgba(0,0,0,0.07)" }}
          >
            <div>
              <p className="font-bold">{s.label}</p>
              <p className="text-[12px] text-neutral-500">
                {s.claimedBy ? `Claimed by ${s.claimedBy}` : "Open seat"}
              </p>
              {s.claimedBy && (
                <div className="mt-2 flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-8 rounded-full"
                      style={{ background: i < s.emiPaid ? GREEN : "#e5e5e5" }}
                    />
                  ))}
                  <span className="ml-1 text-[11px] text-neutral-400">
                    {s.emiPaid}/4 EMI {s.paid ? "· PAID" : ""}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {!s.claimedBy && (
                <button
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await claimGroupSeat(invite.code, s.id, user?.name ?? "Guest Traveler");
                      toast.success("Seat claimed — pay your own EMI");
                      await load();
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Failed");
                    }
                    setBusy(false);
                  }}
                  className="rounded-full px-4 py-2 text-[12px] font-bold text-white"
                  style={{ background: RED }}
                >
                  Claim seat
                </button>
              )}
              {s.claimedBy && !s.paid && (
                <button
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    await payGroupSeatEmi(invite.code, s.id);
                    toast.success("EMI installment paid (demo)");
                    await load();
                    setBusy(false);
                  }}
                  className="flex items-center gap-1 rounded-full px-4 py-2 text-[12px] font-bold text-white"
                  style={{ background: GREEN }}
                >
                  <CreditCard size={12} /> Pay EMI
                </button>
              )}
              {s.paid && (
                <span
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold"
                  style={{ background: GREEN_LIGHT, color: GREEN }}
                >
                  <CheckCircle2 size={12} /> Seat paid
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </SiteShell>
  );
}
