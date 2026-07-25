import { useState } from "react";
import { Link, Outlet, createFileRoute, useChildMatches, useNavigate } from "@tanstack/react-router";
import { Heart, MapPin, Search, ShieldCheck, Sparkles } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { formatINR, useStore } from "@/lib/store";
import { RED, GREEN, GREEN_LIGHT } from "@/lib/brand";

export const Route = createFileRoute("/itineraries")({
  head: () => ({
    meta: [
      { title: "Public Itineraries · NORTHNEST" },
      { name: "description", content: "Search verified traveler itineraries by short code (NN-MEGH-804 style)." },
    ],
  }),
  component: ItinerariesLayout,
});

/** Nested /itineraries/$code needs an Outlet or the detail page never mounts. */
function ItinerariesLayout() {
  const childMatches = useChildMatches();
  if (childMatches.length > 0) return <Outlet />;
  return <ItinerariesIndex />;
}

function ItinerariesIndex() {
  const its = useStore((s) => s.publicItineraries);
  const accounts = useStore((s) => s.accounts);
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = q.trim().toUpperCase();
    const match = its.find((i) => i.code === code);
    if (match) navigate({ to: "/itineraries/$code", params: { code: match.code } });
  };

  const filtered = q
    ? its.filter(
        (i) =>
          i.code.toLowerCase().includes(q.toLowerCase()) ||
          i.title.toLowerCase().includes(q.toLowerCase()) ||
          i.state.toLowerCase().includes(q.toLowerCase()),
      )
    : its;

  return (
    <SiteShell>
      <PageHero
        eyebrow="Verified itineraries"
        title="Every trip has a short code."
        sub="Paste an NN-XXXX-### code below to load the full route instantly — no clickable-link problem, no scrolling reels for context."
        backFallback="/"
        backLabel="Home"
      />

      <form
        onSubmit={submit}
        className="mx-auto flex max-w-2xl flex-col gap-2 rounded-3xl border bg-white p-2 shadow-sm sm:flex-row sm:items-center sm:rounded-full"
        style={{ borderColor: "rgba(0,0,0,0.08)" }}
      >
        <div className="flex min-w-0 flex-1 items-center">
          <Search size={18} className="ml-3 shrink-0 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value.toUpperCase())}
            placeholder="Try NN-MEGH-482 or search 'Tawang'"
            className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-[14px] outline-none"
          />
        </div>
        <button
          className="rounded-full px-5 py-2.5 text-[13px] font-bold text-white sm:py-2"
          style={{ background: RED }}
        >
          Load
        </button>
      </form>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((it) => {
          const creator = accounts.find((a) => a.id === it.creatorId);
          return (
            <Link
              key={it.code}
              to="/itineraries/$code"
              params={{ code: it.code }}
              className="nn-card group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ borderColor: "rgba(0,0,0,0.07)" }}
            >
              <div className="relative aspect-[4/3]">
                <img src={it.cover} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <span className="rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-black tracking-widest text-neutral-900">
                    {it.code}
                  </span>
                </div>
                <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                  <Heart size={10} fill="currentColor" /> {it.likes.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="p-4">
                <p className="line-clamp-2 min-h-[42px] text-[15px] font-bold tracking-tight">{it.title}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
                  <MapPin size={11} /> {it.state} · {it.days} days
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <img src={creator?.avatar} className="h-6 w-6 rounded-full" alt="" />
                  <p className="flex-1 truncate text-[12px] font-semibold text-neutral-700">
                    @{creator?.handle}
                    {creator?.verified && <ShieldCheck size={11} className="ml-0.5 inline" style={{ color: RED }} />}
                  </p>
                  <p className="text-[13px] font-bold" style={{ color: RED }}>
                    {formatINR(it.price)}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
                  <span>{it.bookings} bookings</span>
                  <span>⭐ {it.rating}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mx-auto mt-10 max-w-3xl rounded-3xl border p-6" style={{ borderColor: GREEN, background: GREEN_LIGHT }}>
        <div className="flex items-start gap-3">
          <Sparkles size={22} style={{ color: GREEN }} />
          <div>
            <p className="text-[15px] font-bold" style={{ color: GREEN }}>
              How codes get minted
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-neutral-700">
              Codes are minted only after a booking hits <strong>COMPLETED</strong>. Publish from your
              dashboard to receive one — solves Instagram's no-clickable-link problem and gives you a
              share-worthy artefact.
            </p>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
