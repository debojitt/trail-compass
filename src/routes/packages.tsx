import { useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Heart, Play, Rotate3d, Search, Star } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { BookingDialog, type BookingDraft } from "@/components/site/BookingDialog";
import { travelPackages as catalogPackages, type TravelPackage } from "@/data/catalog";
import { PUBLISHED_ITINERARIES, type PublishedItinerary } from "@/data/demoUniverse";
import { fetchPackages, fetchPublishedItineraries, formatINR, subscribeDemoStore } from "@/lib/demoApi";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "Packages · NORTHNEST" },
      {
        name: "description",
        content: "Permit-ready packages and published itineraries with special codes.",
      },
    ],
  }),
  component: PackagesPage,
});

function PackagesPage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<TravelPackage[]>(catalogPackages);
  const [published, setPublished] = useState<PublishedItinerary[]>(PUBLISHED_ITINERARIES);
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [codeQuery, setCodeQuery] = useState("");

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetchPackages().then((list) => {
        if (alive) setPackages(list);
      });
      fetchPublishedItineraries().then((list) => {
        if (alive) setPublished(list);
      });
    };
    load();
    const unsub = subscribeDemoStore(load);
    return () => {
      alive = false;
      unsub();
    };
  }, []);

  const searchCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = codeQuery.trim();
    if (!code) return;
    navigate({ to: "/itinerary/$code", params: { code } });
  };

  return (
    <SiteShell>
      <PageHero
        eyebrow="Curated packages"
        title="Everything included. Even the permits."
        sub="Fixed departures plus traveler-published itineraries with special codes. Search a code to load a full route instantly."
      />

      <form
        onSubmit={searchCode}
        className="mb-10 flex flex-col gap-3 rounded-3xl border bg-gradient-to-br from-neutral-50 to-white p-4 shadow-sm sm:flex-row sm:items-center"
        style={{ borderColor: "rgba(0,0,0,0.07)" }}
      >
        <div className="flex flex-1 items-center gap-2 rounded-2xl border bg-white px-4 py-3" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
          <Search size={16} className="text-neutral-400" />
          <input
            value={codeQuery}
            onChange={(e) => setCodeQuery(e.target.value)}
            placeholder="Load route by code — try NN-MEGH-804"
            className="w-full text-[14px] outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-full px-6 py-3 text-[13px] font-bold text-white"
          style={{ background: RED }}
        >
          Load itinerary
        </button>
      </form>

      <section className="mb-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em]" style={{ color: GREEN }}>
              Published itineraries
            </p>
            <h2 className="mt-1 text-[22px] font-bold tracking-tight">Routes with special codes</h2>
            <p className="mt-1 text-[13px] text-neutral-500">
              Codes generate only after COMPLETED bookings (creators/hosts/planners can publish earlier).
            </p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {published.slice(0, 12).map((p) => (
            <Link
              key={p.id}
              to="/itinerary/$code"
              params={{ code: p.code }}
              className="group overflow-hidden rounded-3xl border bg-white transition-all hover:-translate-y-1 hover:shadow-2xl"
              style={{ borderColor: "rgba(0,0,0,0.07)" }}
            >
              <div className="relative" style={{ aspectRatio: "4/5" }}>
                <img
                  src={p.cover}
                  alt={p.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
                <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 font-mono text-[11px] font-bold text-white backdrop-blur">
                  {p.code}
                </span>
                <span
                  className="absolute right-3 top-3 flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[11px] font-bold text-white"
                  style={{ background: GREEN }}
                >
                  {p.rating} <Star size={9} fill="white" />
                </span>
                {p.videos?.length > 0 && (
                  <span className="absolute right-3 top-12 flex items-center gap-1 rounded-lg bg-black/50 px-2 py-1 text-[10px] font-bold text-white">
                    <Play size={10} fill="white" /> Video
                  </span>
                )}
                <span className="absolute bottom-16 right-3 flex items-center gap-1 rounded-lg bg-black/50 px-2 py-1 text-[11px] font-semibold text-white">
                  <Heart size={11} fill="white" /> {p.likes}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-[15px] font-bold leading-snug">{p.title}</p>
                  <p className="mt-0.5 text-[11px] text-white/70">
                    by {p.publisherName} · {p.days}D · from {formatINR(p.priceFrom)}
                  </p>
                  <p className="mt-1 text-[10px] text-white/55">
                    {(p.photos?.length ?? 0)} photos · {(p.videos?.length ?? 0)} clips
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="mb-5">
        <h2 className="text-[22px] font-bold tracking-tight">Curated NORTHNEST packages</h2>
      </div>

      {packages.length === 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-3xl border bg-neutral-50"
              style={{ borderColor: "rgba(0,0,0,0.06)" }}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pk) => (
            <article
              key={pk.id}
              className="group relative overflow-hidden rounded-3xl border bg-white transition-all hover:-translate-y-1 hover:shadow-2xl"
              style={{ borderColor: "rgba(0,0,0,0.07)" }}
            >
              <Link to="/packages/$id" params={{ id: pk.id }} className="block">
                <div className="relative" style={{ aspectRatio: "16/10" }}>
                  <img
                    src={pk.img}
                    alt={pk.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                    {pk.days}
                  </span>
                  <div className="absolute right-3 top-3 flex gap-1.5">
                    {(pk.videos?.length ?? 0) > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                        <Play size={10} fill="white" /> Video
                      </span>
                    )}
                    {pk.states[0] && (
                      <span className="flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                        <Rotate3d size={12} /> Preview
                      </span>
                    )}
                  </div>
                  {(pk.photos?.length ?? 0) > 1 && (
                    <span className="absolute bottom-3 left-3 rounded-lg bg-black/55 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                      {pk.photos!.length} photos
                    </span>
                  )}
                </div>
                <div className="p-5 pb-16">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[17px] font-bold leading-snug tracking-tight">{pk.title}</p>
                    <span
                      className="flex shrink-0 items-center gap-1 rounded-lg px-1.5 py-0.5 text-[11px] font-bold text-white"
                      style={{ background: GREEN }}
                    >
                      {pk.rating} <Star size={9} fill="white" />
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-neutral-400">{pk.reviews} verified reviews</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {pk.perks.slice(0, 3).map((perk) => (
                      <span
                        key={perk}
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: GREEN_LIGHT, color: GREEN }}
                      >
                        {perk}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4">
                    <p className="text-[11px] text-neutral-400 line-through">{formatINR(pk.oldPrice)}</p>
                    <p className="text-[22px] font-bold tracking-tight" style={{ color: RED }}>
                      {formatINR(pk.price)}
                      <span className="ml-1 text-[11px] font-medium text-neutral-400">/ person</span>
                    </p>
                  </div>
                </div>
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDraft({
                    kind: "package",
                    title: pk.title,
                    detail: `${pk.days} · curated package`,
                    unitPrice: pk.price,
                    sourceId: pk.id,
                  });
                }}
                className="absolute bottom-5 right-5 z-10 rounded-full px-5 py-2 text-[13px] font-bold text-white shadow-sm"
                style={{ background: RED }}
              >
                Book
              </button>
            </article>
          ))}
        </div>
      )}
      <BookingDialog draft={draft} onClose={() => setDraft(null)} />
    </SiteShell>
  );
}
