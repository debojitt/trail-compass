import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { MapPin, Rotate3d, Star } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { BookingDialog, type BookingDraft } from "@/components/site/BookingDialog";
import { destinations } from "@/data/destinations";
import type { Stay } from "@/data/catalog";
import { fetchStays, formatINR } from "@/lib/demoApi";
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
  const [stays, setStays] = useState<Stay[] | null>(null);
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  useEffect(() => {
    let alive = true;
    setStays(null);
    fetchStays(stateFilter).then((list) => {
      if (alive) setStays(list);
    });
    return () => {
      alive = false;
    };
  }, [stateFilter]);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Homestays"
        title="Sleep where the locals live."
        sub="Every stay is host-verified with true-cost pricing — what you see includes taxes, permits help and host fees."
      />

      {/* State filter chips */}
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

      {stays === null ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-3xl border" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
              <div className="bg-neutral-100" style={{ aspectRatio: "16/10" }} />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 rounded bg-neutral-100" />
                <div className="h-3 w-1/2 rounded bg-neutral-100" />
                <div className="h-8 w-full rounded bg-neutral-50" />
              </div>
            </div>
          ))}
        </div>
      ) : stays.length === 0 ? (
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
              className="group overflow-hidden rounded-3xl border bg-white transition-all hover:-translate-y-1 hover:shadow-2xl"
              style={{ borderColor: "rgba(0,0,0,0.07)" }}
            >
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
                <Link
                  to="/explore/$slug"
                  params={{ slug: s.stateSlug }}
                  className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur transition-colors hover:bg-black/75"
                >
                  <Rotate3d size={12} /> 360° area
                </Link>
              </div>
              <div className="p-4">
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
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-[11px] text-neutral-400">{s.reviews} reviews</p>
                    <p className="text-[19px] font-bold tracking-tight" style={{ color: RED }}>
                      {formatINR(s.pricePerNight)}
                      <span className="ml-1 text-[11px] font-medium text-neutral-400">/ night</span>
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setDraft({
                        kind: "stay",
                        title: s.name,
                        detail: `${s.place} · per-night rate`,
                        unitPrice: s.pricePerNight,
                        perPerson: false,
                      })
                    }
                    className="rounded-full px-5 py-2 text-[13px] font-bold text-white transition-transform hover:scale-105"
                    style={{ background: RED }}
                  >
                    Book
                  </button>
                </div>
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
