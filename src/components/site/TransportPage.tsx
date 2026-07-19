import { useEffect, useState } from "react";
import { ArrowRight, CarFront, Plane, Search, TrainFront } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { BookingDialog, type BookingDraft } from "@/components/site/BookingDialog";
import type { TransportMode, TransportRoute } from "@/data/catalog";
import { fetchRoutes, formatINR } from "@/lib/demoApi";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";

const MODE_META: Record<
  TransportMode,
  {
    icon: typeof Plane;
    eyebrow: string;
    title: string;
    sub: string;
    searchHint: string;
    bookingKind: "flight" | "train" | "cab";
    perPerson: boolean;
  }
> = {
  flights: {
    icon: Plane,
    eyebrow: "Flights",
    title: "Fly into the sunrise states.",
    sub: "Direct demo fares into Guwahati and onward hops to every sister-state airport. Prices include cabin bag.",
    searchHint: "Search city or airport — e.g. Guwahati, CCU, Imphal",
    bookingKind: "flight",
    perPerson: true,
  },
  trains: {
    icon: TrainFront,
    eyebrow: "Trains",
    title: "Rail routes into the hills.",
    sub: "From the Vande Bharat to the overnight Donyi Polo Express — the slow, scenic way into the Northeast.",
    searchHint: "Search station or train — e.g. Guwahati, Naharlagun",
    bookingKind: "train",
    perPerson: true,
  },
  cabs: {
    icon: CarFront,
    eyebrow: "Cabs",
    title: "4×4s, drivers, mountain roads.",
    sub: "Fixed, all-inclusive transfers with drivers who know every pass and checkgate. Price is per vehicle.",
    searchHint: "Search pickup or drop — e.g. Shillong, Tawang",
    bookingKind: "cab",
    perPerson: false,
  },
};

export function TransportPage({ mode }: { mode: TransportMode }) {
  const meta = MODE_META[mode];
  const Icon = meta.icon;
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const [routes, setRoutes] = useState<TransportRoute[] | null>(null);
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  useEffect(() => {
    let alive = true;
    setRoutes(null);
    fetchRoutes(mode, applied).then((list) => {
      if (alive) setRoutes(list);
    });
    return () => {
      alive = false;
    };
  }, [mode, applied]);

  return (
    <SiteShell>
      <PageHero eyebrow={meta.eyebrow} title={meta.title} sub={meta.sub} />

      {/* Search bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setApplied(query);
        }}
        className="mb-8 flex gap-2"
      >
        <div
          className="flex flex-1 items-center gap-3 rounded-full border bg-white px-5 py-3"
          style={{ borderColor: "rgba(0,0,0,0.1)" }}
        >
          <Icon size={17} className="shrink-0 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={meta.searchHint}
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-neutral-400"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold text-white transition-transform hover:scale-[1.02]"
          style={{ background: RED }}
        >
          <Search size={15} /> Search
        </button>
      </form>

      {routes === null ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-3xl border bg-neutral-50"
              style={{ borderColor: "rgba(0,0,0,0.06)" }}
            />
          ))}
        </div>
      ) : routes.length === 0 ? (
        <div className="rounded-3xl bg-neutral-50 py-16 text-center">
          <p className="text-[15px] font-semibold">No demo routes match “{applied}”</p>
          <button
            onClick={() => {
              setQuery("");
              setApplied("");
            }}
            className="mt-3 text-[13px] font-semibold"
            style={{ color: RED }}
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {routes.map((r) => (
            <article
              key={r.id}
              className="flex flex-col gap-4 rounded-3xl border bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg md:flex-row md:items-center"
              style={{ borderColor: "rgba(0,0,0,0.07)" }}
            >
              <div className="flex items-center gap-3 md:w-52">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl"
                  style={{ background: GREEN_LIGHT }}
                >
                  <Icon size={18} style={{ color: GREEN }} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold">{r.carrier}</p>
                  <p className="text-[11px] text-neutral-400">{r.code}</p>
                </div>
              </div>

              <div className="flex flex-1 items-center gap-4">
                <div className="text-left">
                  <p className="text-[17px] font-bold tracking-tight">{r.depart}</p>
                  <p className="text-[11px] text-neutral-500">
                    {r.from} · {r.fromCode}
                  </p>
                </div>
                <div className="flex flex-1 flex-col items-center px-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                    {r.duration}
                  </p>
                  <div className="mt-1 flex w-full items-center gap-1">
                    <span className="h-px flex-1 bg-neutral-200" />
                    <ArrowRight size={13} className="text-neutral-300" />
                  </div>
                  <p className="mt-1 text-[10px] text-neutral-400">{r.note}</p>
                </div>
                <div className="text-right">
                  <p className="text-[17px] font-bold tracking-tight">{r.arrive}</p>
                  <p className="text-[11px] text-neutral-500">
                    {r.to} · {r.toCode}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 md:w-48 md:flex-col md:items-end md:justify-center md:gap-1">
                <p className="text-[20px] font-bold tracking-tight" style={{ color: RED }}>
                  {formatINR(r.price)}
                  <span className="ml-1 text-[10px] font-medium text-neutral-400">
                    {meta.perPerson ? "/ person" : "/ vehicle"}
                  </span>
                </p>
                <button
                  onClick={() =>
                    setDraft({
                      kind: meta.bookingKind,
                      title: `${r.carrier} ${r.code}`,
                      detail: `${r.from} (${r.fromCode}) → ${r.to} (${r.toCode}) · ${r.depart}`,
                      unitPrice: r.price,
                      perPerson: meta.perPerson,
                    })
                  }
                  className="rounded-full px-6 py-2 text-[13px] font-bold text-white transition-transform hover:scale-105"
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
