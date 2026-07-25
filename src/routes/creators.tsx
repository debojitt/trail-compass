import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Search } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import type { DemoAccount } from "@/data/demoUniverse";
import { fetchCreators } from "@/lib/demoApi";
import { GREEN, RED } from "@/lib/brand";

export const Route = createFileRoute("/creators")({
  head: () => ({ meta: [{ title: "Creators · NORTHNEST" }] }),
  component: CreatorsPage,
});

function CreatorsPage() {
  const [creators, setCreators] = useState<DemoAccount[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchCreators().then(setCreators);
  }, []);

  const filtered = creators.filter(
    (c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.handle?.toLowerCase().includes(q.toLowerCase()) ||
      c.bio?.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <SiteShell>
      <PageHero
        eyebrow="Creators"
        title="Search creators like Instagram"
        sub="Verified profiles with custom itinerary grids — not reels photos."
        backFallback="/"
        backLabel="Home"
      />
      <div
        className="mb-8 flex items-center gap-2 rounded-2xl border px-4 py-3"
        style={{ borderColor: "rgba(0,0,0,0.1)" }}
      >
        <Search size={16} className="text-neutral-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search @meghatrails or Eastern Echo…"
          className="w-full text-[14px] outline-none"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((c) => (
          <Link
            key={c.id}
            to="/creator/$handle"
            params={{ handle: c.handle ?? c.id }}
            className="flex gap-4 rounded-3xl border p-4 transition-shadow hover:shadow-xl"
            style={{ borderColor: "rgba(0,0,0,0.07)" }}
          >
            <img src={c.avatar} alt="" className="h-20 w-20 rounded-full object-cover" />
            <div>
              <p className="flex items-center gap-1 text-[16px] font-bold">
                {c.name}
                {c.verified && <BadgeCheck size={16} style={{ color: GREEN }} />}
              </p>
              <p className="text-[13px]" style={{ color: RED }}>
                @{c.handle}
              </p>
              <p className="mt-1 text-[12px] text-neutral-500">{c.bio}</p>
            </div>
          </Link>
        ))}
      </div>
    </SiteShell>
  );
}
