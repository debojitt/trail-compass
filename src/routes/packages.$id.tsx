import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { BookingDialog, type BookingDraft } from "@/components/site/BookingDialog";
import { PhotoGallery, VideoRow, RatingLikes, PriceBlock } from "@/components/site/DetailMedia";
import type { TravelPackage } from "@/data/catalog";
import { SAMPLE_VIDEOS } from "@/data/demoUniverse";
import { fetchPackage } from "@/lib/demoApi";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";

export const Route = createFileRoute("/packages/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Package · ${params.id} · NORTHNEST` }],
  }),
  component: PackageDetailPage,
});

function PackageDetailPage() {
  const { id } = Route.useParams();
  const [pk, setPk] = useState<TravelPackage | null | undefined>(undefined);
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  useEffect(() => {
    fetchPackage(id).then(setPk);
  }, [id]);

  if (pk === undefined) {
    return (
      <SiteShell>
        <div className="h-72 animate-pulse rounded-3xl bg-neutral-100" />
      </SiteShell>
    );
  }
  if (!pk) {
    return (
      <SiteShell>
        <p className="font-semibold">Package not found</p>
        <Link to="/packages" style={{ color: RED }} className="text-[13px]">
          Back to packages
        </Link>
      </SiteShell>
    );
  }

  const photos = pk.photos?.length
    ? pk.photos
    : [pk.img, "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900", pk.img];
  const videos = pk.videos?.length ? pk.videos : [SAMPLE_VIDEOS[2], SAMPLE_VIDEOS[3]];

  return (
    <SiteShell backFallback="/packages">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-neutral-400">{pk.days}</p>
        <h1 className="mt-1 text-[26px] font-bold tracking-tight md:text-[32px]">{pk.title}</h1>
        <div className="mt-2">
          <RatingLikes
            rating={pk.rating}
            reviews={pk.reviews}
            likes={Number(String(pk.reviews).replace(/\D/g, "")) || 100}
          />
        </div>
      </div>

      <div className="mt-5">
        <PhotoGallery photos={photos} alt={pk.title} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.45fr_1fr]">
        <div className="space-y-8">
          <div>
            <h2 className="text-[18px] font-bold tracking-tight">Experience</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">
              {pk.experience ??
                "Permit-ready circuit with homestays, transport and guides. Fixed departures — what you see is what you pay."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {pk.perks.map((perk) => (
                <span
                  key={perk}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold"
                  style={{ background: GREEN_LIGHT, color: GREEN }}
                >
                  <Check size={12} /> {perk}
                </span>
              ))}
            </div>
          </div>

          <VideoRow videos={videos} />

          <div>
            <h2 className="text-[18px] font-bold tracking-tight">Day-by-day plan</h2>
            <ol className="mt-4 space-y-3">
              {pk.itinerary.map((day, i) => (
                <li
                  key={day}
                  className="flex gap-3 rounded-2xl border bg-white p-4"
                  style={{ borderColor: "rgba(0,0,0,0.06)" }}
                >
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white"
                    style={{ background: GREEN }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-[13px] leading-relaxed text-neutral-700">{day}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside
          className="h-fit rounded-3xl border p-6 shadow-xl lg:sticky lg:top-24"
          style={{ borderColor: "rgba(0,0,0,0.07)" }}
        >
          <PriceBlock price={pk.price} oldPrice={pk.oldPrice} />
          <p className="mt-1 text-[12px] text-neutral-500">All-in demo price · permits included where listed</p>
          <button
            onClick={() =>
              setDraft({
                kind: "package",
                title: pk.title,
                detail: `${pk.days} · curated package`,
                unitPrice: pk.price,
                sourceId: pk.id,
              })
            }
            className="mt-5 w-full rounded-full py-3.5 text-[15px] font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
            style={{ background: RED }}
          >
            Book package
          </button>
          <Link
            to="/builder"
            className="mt-3 flex w-full items-center justify-center rounded-full border py-2.5 text-[13px] font-semibold"
            style={{ borderColor: "rgba(0,0,0,0.1)" }}
          >
            Add to itinerary builder
          </Link>
          {pk.states[0] && (
            <Link
              to="/explore/$slug"
              params={{ slug: pk.states[0] }}
              className="mt-3 block text-center text-[13px] font-semibold"
              style={{ color: GREEN }}
            >
              Preview area in 360° →
            </Link>
          )}
        </aside>
      </div>
      <BookingDialog draft={draft} onClose={() => setDraft(null)} />
    </SiteShell>
  );
}
