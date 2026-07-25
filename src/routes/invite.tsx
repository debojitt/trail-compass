import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import type { GroupInvite } from "@/data/demoUniverse";
import { fetchGroupInvites, formatINR } from "@/lib/demoApi";
import { GREEN, RED } from "@/lib/brand";

export const Route = createFileRoute("/invite")({
  head: () => ({ meta: [{ title: "Invite Crew · NORTHNEST" }] }),
  component: InviteIndexPage,
});

function InviteIndexPage() {
  const [invites, setInvites] = useState<GroupInvite[]>([]);

  useEffect(() => {
    fetchGroupInvites().then(setInvites);
  }, []);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Multiplayer flywheel"
        title="Invite Crew"
        sub="One planner’s itinerary → shared link. Each member claims and pays their own seat with individual EMI. Nobody’s booking depends on the full group paying as one block."
      />
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
                  EMI {formatINR(g.emiPerMonth)}/mo
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </SiteShell>
  );
}
