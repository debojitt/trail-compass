import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, Compass } from "lucide-react";
import { LookAround } from "@/components/LookAround";
import { destinations, getDestination } from "@/data/destinations";

export const Route = createFileRoute("/explore/$slug")({
  head: ({ params }) => {
    const dest = getDestination(params.slug);
    const title = dest
      ? `${dest.name} — Virtual look-around · NORTHNEST`
      : "Explore · NORTHNEST";
    /* Preload the panorama shown first so the sphere appears immediately */
    const startPano =
      dest?.nodes?.find((n) => n.id === (dest.startNodeId ?? dest.nodes?.[0]?.id))
        ?.panoSrc ?? dest?.panoSrc;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: dest?.description ?? "Virtual 360° experiences across Northeast India.",
        },
      ],
      links: startPano ? [{ rel: "preload", as: "image", href: startPano }] : [],
    };
  },
  loader: ({ params }) => {
    const dest = getDestination(params.slug);
    if (!dest) throw notFound();
    return { destination: dest };
  },
  component: ExplorePage,
});

function ExplorePage() {
  const { destination } = Route.useLoaderData();
  const { slug } = Route.useParams();

  return (
    <div className="flex h-dvh flex-col bg-black text-white">
      {/* Top bar */}
      <header className="relative z-30 flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-black/70 px-4 py-3 backdrop-blur-md md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/20"
            aria-label="Back home"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
              Virtual experience
            </p>
            <h1 className="truncate text-[17px] font-bold tracking-tight">{destination.name}</h1>
          </div>
        </div>
        <div className="hidden items-center gap-2 text-[12px] text-white/70 sm:flex">
          <Compass size={14} className="text-[#7fe39a]" />
          <span className="max-w-[280px] truncate">{destination.tag}</span>
        </div>
      </header>

      {/* Viewer */}
      <main className="relative min-h-0 flex-1">
        <LookAround key={slug} destination={destination} className="absolute inset-0" />
      </main>

      {/* Destination switcher */}
      <nav className="relative z-30 shrink-0 border-t border-white/10 bg-black/80 px-3 py-3 backdrop-blur-md md:px-5">
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
          Switch destination
        </p>
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {destinations.map((d) => {
            const active = d.slug === slug;
            return (
              <Link
                key={d.slug}
                to="/explore/$slug"
                params={{ slug: d.slug }}
                className="shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition"
                style={{
                  background: active ? "rgba(226,55,68,0.95)" : "rgba(255,255,255,0.1)",
                  color: "#fff",
                  boxShadow: active ? "0 0 0 1px rgba(255,255,255,0.25)" : "none",
                }}
              >
                {d.name}
              </Link>
            );
          })}
        </div>
        <p className="mt-2 px-1 text-[11px] leading-relaxed text-white/50 md:max-w-3xl">
          {destination.description}
        </p>
      </nav>
    </div>
  );
}
