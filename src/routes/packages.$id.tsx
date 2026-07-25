import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { BookingDialog, type BookingDraft } from "@/components/site/BookingDialog";
import { PhotoStrip, VideoRow, RatingLikes, PriceBlock } from "@/components/site/DetailMedia";
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
  const videos = pk.videos ?? [SAMPLE_VIDEOS[2], SAMPLE_VIDEOS[3]];

  return (
    <SiteShell>
      <Link to="/packages" className="text-[13px] font-semibold text-neutral-500">
        ← All packages
      </Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <PhotoStrip photos={photos} alt={pk.title} />
          <VideoRow videos={videos} />
          <div>
            <h2 className="text-[16px] font-bold">Day-by-day plan</h2>
            <ol className="mt-3 space-y-2">
              {pk.itinerary.map((day) => (
                <li
                  key={day}
                  className="rounded-2xl bg-neutral-50 px-4 py-3 text-[13px] leading-relaxed text-neutral-700"
                >
                  {day}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-[16px] font-bold">Experience</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">
              {pk.experience ??
                "Permit-ready circuit with homestays, transport and guides. Fixed departures — what you see is what you pay."}
            </p>
          </div>
        </div>
        <aside
          className="h-fit rounded-3xl border p-6 shadow-lg lg:sticky lg:top-24"
          style={{ borderColor: "rgba(0,0,0,0.07)" }}
        >
          <p className="text-[12px] font-semibold text-neutral-400">{pk.days}</p>
          <h1 className="mt-1 text-[24px] font-bold tracking-tight">{pk.title}</h1>
          <div className="mt-3">
            <RatingLikes rating={pk.rating} reviews={pk.reviews} likes={Number(pk.reviews.replace(/\D/g, "")) || 100} />
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
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
          <div className="mt-5">
            <PriceBlock price={pk.price} oldPrice={pk.oldPrice} />
          </div>
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
            className="mt-5 w-full rounded-full py-3 text-[15px] font-bold text-white"
            style={{ background: RED }}
          >
            Book package
          </button>
          <Link
            to="/builder"
            className="mt-3 block text-center text-[13px] font-semibold"
            style={{ color: GREEN }}
          >
            Or build a custom itinerary →
          </Link>
        </aside>
      </div>
      <BookingDialog draft={draft} onClose={() => setDraft(null)} />
    </SiteShell>
  );
}
