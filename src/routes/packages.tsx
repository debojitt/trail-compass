import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Rotate3d, Star } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { BookingDialog, type BookingDraft } from "@/components/site/BookingDialog";
import type { TravelPackage } from "@/data/catalog";
import { fetchPackages, formatINR } from "@/lib/demoApi";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "Packages · NORTHNEST" },
      {
        name: "description",
        content: "Permit-ready travel packages across the eight sister states.",
      },
    ],
  }),
  component: PackagesPage,
});

function PackagesPage() {
  const [packages, setPackages] = useState<TravelPackage[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  useEffect(() => {
    let alive = true;
    fetchPackages().then((list) => {
      if (alive) setPackages(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Curated packages"
        title="Everything included. Even the permits."
        sub="Fixed departures with homestays, transport, guides and every ILP or PAP filed before you land. Tap a package to see the day-by-day plan."
      />

      {packages === null ? (
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-3xl border bg-neutral-50"
              style={{ borderColor: "rgba(0,0,0,0.06)" }}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {packages.map((pk) => {
            const open = expanded === pk.id;
            return (
              <article
                key={pk.id}
                className="group overflow-hidden rounded-3xl border bg-white transition-all hover:shadow-2xl"
                style={{ borderColor: "rgba(0,0,0,0.07)" }}
              >
                <div className="relative" style={{ aspectRatio: "16/8" }}>
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
                  {pk.states[0] && (
                    <Link
                      to="/explore/$slug"
                      params={{ slug: pk.states[0] }}
                      className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur transition-colors hover:bg-black/75"
                    >
                      <Rotate3d size={12} /> Preview in 360°
                    </Link>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[18px] font-bold leading-snug tracking-tight">{pk.title}</p>
                    <span
                      className="flex shrink-0 items-center gap-1 rounded-lg px-1.5 py-0.5 text-[11px] font-bold text-white"
                      style={{ background: GREEN }}
                    >
                      {pk.rating} <Star size={9} fill="white" />
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    {pk.reviews} verified reviews
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {pk.perks.map((perk) => (
                      <span
                        key={perk}
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: GREEN_LIGHT, color: GREEN }}
                      >
                        {perk}
                      </span>
                    ))}
                  </div>

                  {/* Itinerary accordion */}
                  <button
                    onClick={() => setExpanded(open ? null : pk.id)}
                    className="mt-4 flex w-full items-center justify-between rounded-2xl bg-neutral-50 px-4 py-2.5 text-[13px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
                  >
                    Day-by-day itinerary
                    <ChevronDown
                      size={15}
                      className="transition-transform"
                      style={{ transform: open ? "rotate(180deg)" : "none" }}
                    />
                  </button>
                  {open && (
                    <ol className="mt-3 space-y-1.5 px-1">
                      {pk.itinerary.map((day) => (
                        <li key={day} className="flex gap-2 text-[12px] leading-relaxed text-neutral-600">
                          <span
                            className="mt-[7px] h-1 w-1 shrink-0 rounded-full"
                            style={{ background: GREEN }}
                          />
                          {day}
                        </li>
                      ))}
                    </ol>
                  )}

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[11px] text-neutral-400 line-through">
                        {formatINR(pk.oldPrice)}
                      </p>
                      <p className="text-[22px] font-bold tracking-tight" style={{ color: RED }}>
                        {formatINR(pk.price)}
                        <span className="ml-1 text-[11px] font-medium text-neutral-400">
                          / person
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setDraft({
                          kind: "package",
                          title: pk.title,
                          detail: `${pk.days} · permits + stays + transport included`,
                          unitPrice: pk.price,
                          perPerson: true,
                        })
                      }
                      className="rounded-full px-6 py-2.5 text-[13px] font-bold text-white transition-transform hover:scale-105"
                      style={{ background: RED }}
                    >
                      Reserve
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <BookingDialog draft={draft} onClose={() => setDraft(null)} />
    </SiteShell>
  );
}
