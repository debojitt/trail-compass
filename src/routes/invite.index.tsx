import { useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, Search, Users } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { useDemoUser } from "@/components/site/useDemoUser";
import { openSignInDialog } from "@/lib/openSignIn";
import type { GroupInvite } from "@/data/demoUniverse";
import {
  createGroupInvite,
  formatINR,
  listGroupInvitesSync,
  subscribeDemoStore,
} from "@/lib/demoApi";
import { GREEN, RED } from "@/lib/brand";
import { toast } from "sonner";

export const Route = createFileRoute("/invite/")({
  head: () => ({ meta: [{ title: "Invite Crew · NORTHNEST" }] }),
  component: InviteIndexPage,
});

function InviteIndexPage() {
  const user = useDemoUser();
  const navigate = useNavigate();
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [ready, setReady] = useState(false);
  const [codeQuery, setCodeQuery] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const refresh = () => setInvites(listGroupInvitesSync());
    refresh();
    setReady(true);
    return subscribeDemoStore(refresh);
  }, []);

  const openCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = codeQuery.trim().toUpperCase();
    if (!code) return;
    void navigate({ to: "/invite/$code", params: { code } });
  };

  const createMine = async () => {
    if (!user) {
      openSignInDialog();
      toast.message("Sign in to create a crew invite");
      return;
    }
    setCreating(true);
    try {
      const inv = await createGroupInvite({
        title: `${user.name.split(" ")[0]}'s crew trip`,
        pricePerSeat: 18400,
        seatCount: 4,
      });
      toast.success(`Invite ${inv.code} created`);
      void navigate({ to: "/invite/$code", params: { code: inv.code } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create invite");
    }
    setCreating(false);
  };

  return (
    <SiteShell>
      <PageHero
        eyebrow="Multiplayer flywheel"
        title="Invite Crew"
        sub="One planner’s itinerary → shared link. Each member claims and pays their own seat with individual EMI. Nobody’s booking depends on the full group paying as one block."
        backFallback="/"
        backLabel="Home"
      />

      <div className="mb-8 flex flex-wrap items-end gap-3">
        <form onSubmit={openCode} className="flex min-w-[240px] flex-1 flex-wrap gap-2">
          <label className="block flex-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              Have a code?
            </span>
            <div className="mt-1 flex gap-2">
              <input
                value={codeQuery}
                onChange={(e) => setCodeQuery(e.target.value.toUpperCase())}
                placeholder="CREW-MEGH-01"
                className="w-full rounded-2xl border px-4 py-2.5 font-mono text-[13px] outline-none"
                style={{ borderColor: "rgba(0,0,0,0.12)" }}
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-full px-4 py-2.5 text-[12px] font-bold text-white"
                style={{ background: RED }}
              >
                <Search size={14} /> Open
              </button>
            </div>
          </label>
        </form>
        <button
          type="button"
          disabled={creating}
          onClick={() => void createMine()}
          className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
          style={{ background: GREEN }}
        >
          <Plus size={14} /> {creating ? "Creating…" : "Create crew invite"}
        </button>
      </div>

      {!ready ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl bg-neutral-100" />
          ))}
        </div>
      ) : invites.length === 0 ? (
        <p className="rounded-3xl border border-dashed px-4 py-12 text-center text-[14px] text-neutral-500">
          No crew invites yet. Create one or try code <strong>CREW-MEGH-01</strong>.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {invites.map((g) => {
            const claimed = g.seats.filter((s) => s.claimedBy).length;
            const paid = g.seats.filter((s) => s.paid).length;
            return (
              <Link
                key={g.id}
                to="/invite/$code"
                params={{ code: g.code }}
                className="overflow-hidden rounded-3xl border transition-shadow hover:shadow-xl"
                style={{ borderColor: "rgba(0,0,0,0.07)" }}
              >
                <div className="relative h-40">
                  <img src={g.cover} alt="" className="h-full w-full object-cover" />
                  <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 font-mono text-[11px] font-bold text-white">
                    {g.code}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-bold">{g.title}</p>
                  <p className="text-[12px] text-neutral-500">by {g.plannerName}</p>
                  <p className="mt-2 flex items-center gap-1 text-[12px] text-neutral-600">
                    <Users size={12} /> {claimed}/{g.seats.length} claimed · {paid} fully paid
                  </p>
                  <p className="mt-1 text-[14px] font-bold" style={{ color: RED }}>
                    {formatINR(g.pricePerSeat)}
                    <span className="text-[11px] font-medium text-neutral-400"> / seat</span>
                  </p>
                  <p className="text-[11px]" style={{ color: GREEN }}>
                    EMI {formatINR(g.emiPerMonth)}/mo × 4
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </SiteShell>
  );
}
