import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Heart } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import type { CreatorPlan, DemoAccount } from "@/data/demoUniverse";
import { fetchCreatorByHandle, fetchCreatorPlans, formatINR } from "@/lib/demoApi";
import { GREEN, RED } from "@/lib/brand";

export const Route = createFileRoute("/creator/$handle")({
  head: ({ params }) => ({ meta: [{ title: `@${params.handle} · NORTHNEST` }] }),
  component: CreatorProfilePage,
});

function CreatorProfilePage() {
  const { handle } = Route.useParams();
  const [creator, setCreator] = useState<DemoAccount | null | undefined>(undefined);
  const [plans, setPlans] = useState<CreatorPlan[]>([]);

  useEffect(() => {
    fetchCreatorByHandle(handle).then((c) => {
      setCreator(c ?? null);
      if (c) fetchCreatorPlans(c.id).then(setPlans);
    });
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
    <SiteShell>
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

      {/* Instagram-style grid of itineraries (not reels) */}
      <div className="mt-10 grid grid-cols-2 gap-1 md:grid-cols-3 md:gap-3">
        {plans.map((p) => (
          <Link
            key={p.id}
            to="/creator/$handle/$planId"
            params={{ handle, planId: p.id }}
            className="group relative overflow-hidden bg-neutral-100"
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
                  <Heart size={10} fill="white" /> {p.likes} · from {formatINR(p.priceFrom)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SiteShell>
  );
}
