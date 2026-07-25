import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Grid3x3, Heart, MapPin, MessageCircle, ShieldCheck, UserPlus } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { useStore } from "@/lib/store";
import { RED } from "@/lib/brand";

export const Route = createFileRoute("/creators/$handle")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.handle} · NORTHNEST creator` },
      { name: "description", content: `Public itineraries by @${params.handle}` },
    ],
  }),
  loader: ({ params }) => ({ handle: params.handle }),
  component: CreatorProfile,
  notFoundComponent: () => (
    <SiteShell>
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">Creator not found</h1>
      </div>
    </SiteShell>
  ),
});

function CreatorProfile() {
  const { handle } = Route.useLoaderData();
  const creator = useStore((s) => s.accounts.find((a) => a.handle === handle));
  const its = useStore((s) => s.publicItineraries.filter((i) => i.creatorId === creator?.id));

  if (!creator) throw notFound();

  const totalLikes = its.reduce((a, b) => a + b.likes, 0);

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl">
        {/* Instagram-style header */}
        <div className="flex flex-col items-center gap-5 md:flex-row md:items-start">
          <div className="rounded-full p-1" style={{ background: "linear-gradient(45deg, #FF385C, #F59E0B, #8B5CF6)" }}>
            <img src={creator.avatar} className="h-28 w-28 rounded-full border-4 border-white object-cover" alt="" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <p className="text-[22px] font-light">@{creator.handle}</p>
              {creator.verified && <ShieldCheck size={18} style={{ color: RED }} />}
              <button className="rounded-full px-4 py-1.5 text-[12px] font-bold text-white" style={{ background: RED }}>
                <UserPlus size={12} className="mr-1 inline" /> Follow
              </button>
              <button className="rounded-full border px-4 py-1.5 text-[12px] font-bold" style={{ borderColor: "rgba(0,0,0,0.12)" }}>
                <MessageCircle size={12} className="mr-1 inline" /> Message
              </button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-6 text-[13px] md:justify-start">
              <span><strong>{its.length}</strong> itineraries</span>
              <span><strong>{(creator.followers ?? 0).toLocaleString("en-IN")}</strong> followers</span>
              <span><strong>{totalLikes.toLocaleString("en-IN")}</strong> likes</span>
            </div>
            <p className="mt-3 text-[14px] font-bold">{creator.name}</p>
            <p className="text-[13px] text-neutral-600">{creator.bio}</p>
            <p className="mt-1 flex items-center gap-1 text-[12px] text-neutral-500 md:justify-start">
              <MapPin size={11} /> {creator.city}
            </p>
          </div>
        </div>

        {/* Story-highlights row */}
        <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
          {["States covered", "Best rated", "Off-beat", "Festivals", "Treks"].map((h) => (
            <div key={h} className="shrink-0 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full border" style={{ borderColor: "rgba(0,0,0,0.15)" }}>
                <div className="grid h-14 w-14 place-items-center rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-500">
                  {h.split(" ")[0]}
                </div>
              </div>
              <p className="mt-1 text-[10px] text-neutral-500">{h}</p>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="mt-6 flex justify-center gap-8 border-t pt-3" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest">
            <Grid3x3 size={12} /> Itineraries
          </span>
        </div>

        {/* Grid — Instagram-style */}
        <div className="mt-4 grid grid-cols-3 gap-1">
          {its.map((it) => (
            <Link
              key={it.code}
              to="/itineraries/$code"
              params={{ code: it.code }}
              className="group relative aspect-square overflow-hidden"
            >
              <img src={it.cover} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 hidden items-center justify-center gap-4 bg-black/50 text-[13px] font-bold text-white group-hover:flex">
                <span className="flex items-center gap-1">
                  <Heart size={14} fill="currentColor" /> {it.likes.toLocaleString("en-IN")}
                </span>
                <span>{it.bookings} 📌</span>
              </div>
              <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] font-black text-white">{it.code}</span>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
