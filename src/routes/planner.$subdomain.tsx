import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Shield } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { BookingDialog, type BookingDraft } from "@/components/site/BookingDialog";
import type { DemoAccount, FreelancePlan } from "@/data/demoUniverse";
import { fetchFreelancePlans, fetchPlannerBySubdomain, formatINR, getPlannerSettings, subscribeDemoStore } from "@/lib/demoApi";
import { GREEN, RED } from "@/lib/brand";

export const Route = createFileRoute("/planner/$subdomain")({
  head: ({ params }) => ({
    meta: [{ title: `${params.subdomain}.northnest.demo · NORTHNEST` }],
  }),
  component: PlannerPublicPage,
});

function PlannerPublicPage() {
  const { subdomain } = Route.useParams();
  const [planner, setPlanner] = useState<DemoAccount | null | undefined>(undefined);
  const [plans, setPlans] = useState<FreelancePlan[]>([]);
  const [brandNote, setBrandNote] = useState("");
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetchPlannerBySubdomain(subdomain).then((p) => {
        if (!alive) return;
        setPlanner(p ?? null);
        if (p) {
          fetchFreelancePlans(p.id, { publishedOnly: true }).then((list) => alive && setPlans(list));
          const s = getPlannerSettings(p.id, subdomain);
          setBrandNote(s.accentNote);
        }
      });
    };
    load();
    const unsub = subscribeDemoStore(load);
    return () => {
      alive = false;
      unsub();
    };
  }, [subdomain]);

  if (planner === undefined) {
    return (
      <SiteShell>
        <div className="h-48 animate-pulse rounded-3xl bg-neutral-100" />
      </SiteShell>
    );
  }
  if (!planner) {
    return (
      <SiteShell>
        <p className="font-bold">Planner not found</p>
        <p className="text-[13px] text-neutral-500">Try nestcraft or peakpath</p>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <p className="font-mono text-[12px] font-semibold text-neutral-400">
        {subdomain}.northnest.demo
      </p>
      <div className="mt-3 flex items-center gap-4">
        <img src={planner.avatar} alt="" className="h-20 w-20 rounded-2xl object-cover" />
        <div>
          <h1 className="flex items-center gap-2 text-[26px] font-bold tracking-tight">
            {planner.name}
            {planner.verified && <BadgeCheck size={20} style={{ color: GREEN }} />}
          </h1>
          <p className="text-[13px] text-neutral-500">{planner.bio}</p>
          {brandNote && <p className="mt-1 text-[12px] font-medium text-neutral-500">{brandNote}</p>}
          <p className="mt-1 flex items-center gap-1 text-[12px] font-semibold" style={{ color: GREEN }}>
            <Shield size={12} /> Echo SOS always on · Northnest fulfills 100%
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {plans.map((p) => (
          <article
            key={p.id}
            className="overflow-hidden rounded-3xl border"
            style={{ borderColor: "rgba(0,0,0,0.07)" }}
          >
            <img src={p.cover} alt={p.title} className="h-44 w-full object-cover" />
            <div className="p-5">
              <p className="text-[17px] font-bold">{p.title}</p>
              <p className="text-[12px] text-neutral-500">
                {p.days}D · vendors masked until {p.vendorsMaskedUntilHours}h before check-in
              </p>
              <p className="mt-2 text-[18px] font-bold" style={{ color: RED }}>
                from {formatINR(p.priceFrom)}
              </p>
              <p className="text-[11px] text-neutral-400">
                Planner earns 60% of net · liquidated damages (Contract Act s.74), not blanket escrow
              </p>
              <button
                onClick={() =>
                  setDraft({
                    kind: "freelance",
                    title: p.title,
                    detail: `${subdomain}.northnest.demo`,
                    unitPrice: p.priceFrom,
                    sourceId: p.id,
                    publisherId: p.plannerId,
                  })
                }
                className="mt-4 rounded-full px-5 py-2 text-[13px] font-bold text-white"
                style={{ background: RED }}
              >
                Book with Northnest
              </button>
            </div>
          </article>
        ))}
      </div>
      <BookingDialog draft={draft} onClose={() => setDraft(null)} />
    </SiteShell>
  );
}
