import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { BookingDialog, type BookingDraft } from "@/components/site/BookingDialog";
import { destinations } from "@/data/destinations";
import { stays as catalogStays } from "@/data/catalog";
import type { HostHome } from "@/data/demoUniverse";
import { fetchHostHomes, formatINR, subscribeDemoStore } from "@/lib/demoApi";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";

export const Route = createFileRoute("/stays")({
  head: () => ({
    meta: [
      { title: "Homestays · NORTHNEST" },
      {
        name: "description",
        content: "Verified village homestays and eco-stays across Northeast India.",
      },
    ],
  }),
  component: StaysPage,
});

function StaysPage() {
  const [stateFilter, setStateFilter] = useState<string | undefined>(undefined);
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [hostHomes, setHostHomes] = useState<HostHome[]>([]);

  useEffect(() => {
    const load = () => fetchHostHomes(undefined, true).then(setHostHomes);
    load();
    return subscribeDemoStore(load);
  }, []);

  const stays = useMemo(
    () => (stateFilter ? catalogStays.filter((s) => s.stateSlug === stateFilter) : catalogStays),
    [stateFilter],
  );

  return (
    <SiteShell>
      <PageHero
        eyebrow="Homestays"
        title="Sleep where the locals live."
        sub="Every stay is host-verified with true-cost pricing — what you see includes taxes, permits help and host fees."
        backFallback="/"
        backLabel="Home"
      />

      <div className="mb-8 flex flex-wrap gap-2">
        <FilterChip label="All states" active={!stateFilter} onClick={() => setStateFilter(undefined)} />
        {destinations.map((d) => (
          <FilterChip
            key={d.slug}
            label={d.name}
            active={stateFilter === d.slug}
            onClick={() => setStateFilter(d.slug)}
          />
        ))}
      </div>

      {hostHomes.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-[20px] font-bold tracking-tight">Host CMS listings</h2>
          <p className="mb-4 text-[13px] text-neutral-500">
            Live from host dashboards — newly listed homes appear here instantly.
          </p>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {hostHomes.map((h) => (
              <Link
                key={h.id}
                to="/host/$slug"
                params={{ slug: h.slug }}
                className="group overflow-hidden rounded-3xl border bg-white transition-all hover:-translate-y-1 hover:shadow-2xl"
                style={{ borderColor: "rgba(0,0,0,0.07)" }}
              >
                <div className="relative" style={{ aspectRatio: "16/10" }}>
                  <img
                    src={h.photos[0]}
                    alt={h.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span
                    className="absolute left-3 top-3 flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[11px] font-bold text-white"
                    style={{ background: GREEN }}
                  >
                    {h.rating} <Star size={9} fill="white" />
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-[16px] font-bold">{h.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[12px] text-neutral-500">
                    <MapPin size={11} /> {h.place}
                  </p>
                  <p className="mt-3 text-[19px] font-bold" style={{ color: RED }}>
                    {formatINR(h.pricePerNight)}
                    <span className="ml-1 text-[11px] font-medium text-neutral-400">/ night</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <h2 className="mb-4 text-[20px] font-bold tracking-tight">Marketplace catalog</h2>

      {stays.length === 0 ? (
        <div className="rounded-3xl bg-neutral-50 py-16 text-center">
          <p className="text-[15px] font-semibold">No demo stays here yet</p>
          <p className="mt-1 text-[13px] text-neutral-500">
            Pick another state — or explore it in 360° first.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {stays.map((s) => (
            <article
              key={s.id}
              className="group relative overflow-hidden rounded-3xl border bg-white transition-all hover:-translate-y-1 hover:shadow-2xl"
              style={{ borderColor: "rgba(0,0,0,0.07)" }}
            >
              <Link to="/stays/$id" params={{ id: s.id }} className="block">
                <div className="relative" style={{ aspectRatio: "16/10" }}>
                  <img
                    src={s.img}
                    alt={s.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span
                    className="absolute left-3 top-3 flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[11px] font-bold text-white"
                    style={{ background: GREEN }}
                  >
                    {s.rating} <Star size={9} fill="white" />
                  </span>
                </div>
                <div className="p-4 pb-16">
                  <p className="text-[16px] font-bold leading-snug tracking-tight">{s.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[12px] text-neutral-500">
                    <MapPin size={11} /> {s.place}
                  </p>
                  <p className="mt-2 text-[12px] leading-relaxed text-neutral-500">{s.hostNote}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {s.amenities.slice(0, 3).map((a) => (
                      <span
                        key={a}
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: GREEN_LIGHT, color: GREEN }}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4">
                    <p className="text-[11px] text-neutral-400">{s.reviews} reviews</p>
                    <p className="text-[19px] font-bold tracking-tight" style={{ color: RED }}>
                      {formatINR(s.pricePerNight)}
                      <span className="ml-1 text-[11px] font-medium text-neutral-400">/ night</span>
                    </p>
                  </div>
                </div>
              </Link>
              <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                <Link
                  to="/stays/$id"
                  params={{ id: s.id }}
                  className="rounded-full border bg-white px-3 py-2 text-[12px] font-bold shadow-sm"
                  style={{ borderColor: "rgba(0,0,0,0.12)" }}
                >
                  View
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDraft({
                      kind: "stay",
                      title: s.name,
                      detail: `${s.place} · per-night rate`,
                      unitPrice: s.pricePerNight,
                      perPerson: false,
                      sourceId: s.id,
                    });
                  }}
                  className="rounded-full px-5 py-2 text-[13px] font-bold text-white shadow-sm transition-transform hover:scale-105"
                  style={{ background: RED }}
                >
                  Book
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <BookingDialog draft={draft} onClose={() => setDraft(null)} />
    </SiteShell>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-4 py-2 text-[13px] font-semibold transition-all"
      style={{
        background: active ? "rgba(226,55,68,0.08)" : "#f5f5f5",
        color: active ? RED : "#6b7280",
        boxShadow: active ? "inset 0 0 0 1.5px rgba(226,55,68,0.35)" : "none",
      }}
    >
      {label}
    </button>
  );
}
