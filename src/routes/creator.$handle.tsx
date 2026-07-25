import { Outlet, createFileRoute, useChildMatches } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, Heart } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import type { CreatorPlan, DemoAccount } from "@/data/demoUniverse";
import { fetchCreatorByHandle, fetchCreatorPlans, formatINR, subscribeDemoStore } from "@/lib/demoApi";
import { GREEN, RED } from "@/lib/brand";

export const Route = createFileRoute("/creator/$handle")({
  head: ({ params }) => ({ meta: [{ title: `@${params.handle} · NORTHNEST` }] }),
  component: CreatorHandleLayout,
});

/** Parent must render <Outlet /> or nested /creator/$handle/$planId never appears. */
function CreatorHandleLayout() {
  const childMatches = useChildMatches();
  if (childMatches.length > 0) return <Outlet />;
  return <CreatorProfilePage />;
}

function CreatorProfilePage() {
  const { handle } = Route.useParams();
  const [creator, setCreator] = useState<DemoAccount | null | undefined>(undefined);
  const [plans, setPlans] = useState<CreatorPlan[]>([]);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetchCreatorByHandle(handle).then((c) => {
        if (!alive) return;
        setCreator(c ?? null);
        if (c) {
          fetchCreatorPlans(c.id, { publishedOnly: true }).then((list) => {
            if (alive) setPlans(list);
          });
        } else {
          setPlans([]);
        }
      });
    };
    load();
    const unsub = subscribeDemoStore(load);
    return () => {
      alive = false;
      unsub();
    };
  }, [handle]);

  if (creator === undefined) {
    return (
      <SiteShell>
        <div className="h-64 animate-pulse rounded-3xl bg-neutral-100" />
      </SiteShell>
    );
  }
  if (!creator) {
    return (
      <SiteShell>
        <p className="font-bold">Creator not found</p>
        <Link to="/creators" style={{ color: RED }} className="text-[13px]">
          Browse creators
        </Link>
      </SiteShell>
    );
  }

  return (
    <SiteShell backFallback="/creators">
      <Link to="/creators" className="mb-4 inline-block text-[13px] font-semibold text-neutral-500">
        ← All creators
      </Link>
      {creator.cover && (
        <div className="mb-6 overflow-hidden rounded-3xl" style={{ aspectRatio: "3/1" }}>
          <img src={creator.cover} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex flex-col items-center text-center">
        <img src={creator.avatar} alt="" className="h-28 w-28 rounded-full object-cover ring-4 ring-white shadow-lg" />
        <h1 className="mt-4 flex items-center gap-2 text-[26px] font-bold tracking-tight">
          {creator.name}
          {creator.verified && <BadgeCheck size={22} style={{ color: GREEN }} />}
        </h1>
        <p className="text-[14px]" style={{ color: RED }}>
          @{creator.handle}
        </p>
        <p className="mt-2 max-w-md text-[13px] text-neutral-500">{creator.bio}</p>
        <div className="mt-4 flex gap-6 text-[13px]">
          <span>
            <strong>{plans.length}</strong> itineraries
          </span>
          <span>
            <strong>{plans.reduce((s, p) => s + p.likes, 0).toLocaleString("en-IN")}</strong> likes
          </span>
        </div>
      </div>

      <p className="mt-10 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
        Custom itinerary grid · tap to open
      </p>
      <div className="mt-4 grid grid-cols-2 gap-1.5 md:grid-cols-3 md:gap-2">
        {plans.map((p) => (
          <Link
            key={p.id}
            to="/creator/$handle/$planId"
            params={{ handle, planId: p.id }}
            className="nn-card-tile group relative overflow-hidden"
            style={{ aspectRatio: "1" }}
          >
            <img
              src={p.cover}
              alt={p.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-100 md:opacity-0 md:group-hover:opacity-100">
              <div className="text-left text-white">
                <p className="text-[12px] font-bold leading-snug">{p.title}</p>
                <p className="mt-0.5 flex items-center gap-2 text-[10px] text-white/80">
                  <Heart size={10} fill="white" /> {p.likes} · {p.days}D · from {formatINR(p.priceFrom)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {plans.length === 0 && (
        <p className="mt-8 text-center text-[13px] text-neutral-500">No published itineraries yet.</p>
      )}
    </SiteShell>
  );
}
