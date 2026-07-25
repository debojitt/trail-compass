import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Copy, CreditCard, Link2 } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { useDemoUser } from "@/components/site/useDemoUser";
import { GROUP_INVITES, type GroupInvite } from "@/data/demoUniverse";
import {
  claimGroupSeat,
  formatINR,
  getGroupByCodeSync,
  payGroupSeatEmi,
  subscribeDemoStore,
} from "@/lib/demoApi";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";
import { toast } from "sonner";

function resolveInvite(rawCode: string): GroupInvite | null {
  const code = decodeURIComponent(rawCode).trim().toUpperCase();
  if (!code) return null;
  try {
    const live = getGroupByCodeSync(code);
    if (live) return live;
  } catch {
    /* fall through to seed */
  }
  return GROUP_INVITES.find((g) => g.code.toUpperCase() === code) ?? null;
}

export const Route = createFileRoute("/invite/$code")({
  head: ({ params }) => ({
    meta: [{ title: `Crew ${params.code} · NORTHNEST` }],
  }),
  loader: ({ params }) => {
    const invite = resolveInvite(params.code);
    return { code: params.code, invite };
  },
  component: InviteDetailPage,
});

function InviteDetailPage() {
  const { code: rawCode, invite: loaded } = Route.useLoaderData();
  const user = useDemoUser();
  const [invite, setInvite] = useState<GroupInvite | null>(loaded);
  const [busy, setBusy] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [copied, setCopied] = useState(false);

  const code = useMemo(
    () => decodeURIComponent(rawCode).trim().toUpperCase(),
    [rawCode],
  );

  useEffect(() => {
    const refresh = () => setInvite(resolveInvite(code));
    refresh();
    return subscribeDemoStore(refresh);
  }, [code]);

  if (!invite) {
    return (
      <SiteShell>
        <p className="font-bold">Invite not found</p>
        <p className="mt-2 text-[13px] text-neutral-500">
          No crew for code <span className="font-mono font-bold">{code}</span>. Try{" "}
          <Link to="/invite/$code" params={{ code: "CREW-MEGH-01" }} className="font-semibold" style={{ color: RED }}>
            CREW-MEGH-01
          </Link>
          .
        </p>
        <Link to="/invite" className="mt-4 inline-block font-semibold" style={{ color: RED }}>
          All invites →
        </Link>
      </SiteShell>
    );
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/invite/${invite.code}`
      : `/invite/${invite.code}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Invite link copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const claimName = user?.name?.trim() || guestName.trim();

  return (
    <SiteShell backFallback="/invite">
      <div className="overflow-hidden rounded-3xl">
        <img src={invite.cover} alt="" className="h-48 w-full object-cover md:h-64" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="font-mono text-[12px] font-bold" style={{ color: GREEN }}>
          {invite.code}
        </p>
        <button
          type="button"
          onClick={() => void copyLink()}
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold"
          style={{ borderColor: "rgba(0,0,0,0.12)" }}
        >
          {copied ? <CheckCircle2 size={13} /> : <Link2 size={13} />}
          {copied ? "Copied" : "Copy invite link"}
        </button>
        <button
          type="button"
          onClick={() =>
            void navigator.clipboard.writeText(invite.code).then(() => toast.success("Code copied"))
          }
          className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] font-bold"
          style={{ borderColor: "rgba(0,0,0,0.12)" }}
        >
          <Copy size={13} /> Copy code
        </button>
      </div>
      <h1 className="mt-2 text-[28px] font-bold tracking-tight">{invite.title}</h1>
      <p className="text-[13px] text-neutral-500">Planned by {invite.plannerName}</p>
      <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-neutral-600">
        Each member claims and pays their own seat. Individual EMI per seat — your booking does not
        depend on the whole group paying together.
      </p>
      <p className="mt-2 text-[18px] font-bold" style={{ color: RED }}>
        {formatINR(invite.pricePerSeat)} / seat · EMI {formatINR(invite.emiPerMonth)}/mo × 4
      </p>

      {!user && (
        <div className="mt-6 max-w-md">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              Your name (for claiming)
            </span>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Guest traveler name"
              className="mt-1 w-full rounded-2xl border px-4 py-2.5 text-[14px] outline-none"
              style={{ borderColor: "rgba(0,0,0,0.12)" }}
            />
          </label>
        </div>
      )}

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
                  type="button"
                  disabled={busy !== null}
                  onClick={async () => {
                    if (!claimName) {
                      toast.error("Enter your name (or sign in) to claim a seat");
                      return;
                    }
                    setBusy(s.id);
                    try {
                      await claimGroupSeat(invite.code, s.id, claimName);
                      toast.success("Seat claimed — pay your own EMI");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Failed");
                    }
                    setBusy(null);
                  }}
                  className="rounded-full px-4 py-2 text-[12px] font-bold text-white disabled:opacity-60"
                  style={{ background: RED }}
                >
                  {busy === s.id ? "…" : "Claim seat"}
                </button>
              )}
              {s.claimedBy && !s.paid && (
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={async () => {
                    setBusy(s.id);
                    try {
                      const next = await payGroupSeatEmi(invite.code, s.id);
                      const seat = next.seats.find((x) => x.id === s.id);
                      toast.success(
                        seat?.paid ? "Seat fully paid!" : `EMI paid · ${seat?.emiPaid}/4`,
                      );
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Payment failed");
                    }
                    setBusy(null);
                  }}
                  className="flex items-center gap-1 rounded-full px-4 py-2 text-[12px] font-bold text-white disabled:opacity-60"
                  style={{ background: GREEN }}
                >
                  <CreditCard size={12} /> {busy === s.id ? "…" : "Pay EMI"}
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
