import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { MapPin, Rotate3d } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { BookingDialog, type BookingDraft } from "@/components/site/BookingDialog";
import { PhotoStrip, VideoRow, RatingLikes, PriceBlock } from "@/components/site/DetailMedia";
import type { Stay } from "@/data/catalog";
import { SAMPLE_VIDEOS } from "@/data/demoUniverse";
import { fetchStay } from "@/lib/demoApi";
import { GREEN_LIGHT, GREEN, RED } from "@/lib/brand";

export const Route = createFileRoute("/stays/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Stay · ${params.id} · NORTHNEST` }],
  }),
  component: StayDetailPage,
});

function StayDetailPage() {
  const { id } = Route.useParams();
  const [stay, setStay] = useState<Stay | null | undefined>(undefined);
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  useEffect(() => {
    fetchStay(id).then(setStay);
  }, [id]);

  if (stay === undefined) {
    return (
      <SiteShell>
        <div className="h-72 animate-pulse rounded-3xl bg-neutral-100" />
      </SiteShell>
    );
  }
  if (!stay) {
    return (
      <SiteShell>
        <p className="text-[15px] font-semibold">Stay not found</p>
        <Link to="/stays" className="mt-2 inline-block text-[13px]" style={{ color: RED }}>
          Back to stays
        </Link>
      </SiteShell>
    );
  }

  const photos = stay.photos?.length
    ? stay.photos
    : [stay.img, stay.img, "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=900"];
  const videos = stay.videos ?? [SAMPLE_VIDEOS[0], SAMPLE_VIDEOS[1]];

  return (
    <SiteShell>
      <Link to="/stays" className="text-[13px] font-semibold text-neutral-500">
        ← All stays
      </Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <PhotoStrip photos={photos} alt={stay.name} />
          <VideoRow videos={videos} />
          <div>
            <h2 className="text-[16px] font-bold">About this stay</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">{stay.hostNote}</p>
            <p className="mt-3 text-[14px] leading-relaxed text-neutral-600">
              {stay.experience ??
                "Host-verified village stay with true-cost pricing. Meals, local tips and permit help available on request."}
            </p>
          </div>
          <div>
            <h2 className="text-[16px] font-bold">Amenities</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {stay.amenities.map((a) => (
                <span
                  key={a}
                  className="rounded-full px-3 py-1 text-[12px] font-semibold"
                  style={{ background: GREEN_LIGHT, color: GREEN }}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
        <aside
          className="h-fit rounded-3xl border bg-white p-6 shadow-lg lg:sticky lg:top-24"
          style={{ borderColor: "rgba(0,0,0,0.07)" }}
        >
          <h1 className="text-[24px] font-bold tracking-tight">{stay.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-[13px] text-neutral-500">
            <MapPin size={13} /> {stay.place}
          </p>
          <div className="mt-3">
            <RatingLikes rating={stay.rating} reviews={stay.reviews} likes={stay.reviews * 3} />
          </div>
          <div className="mt-5">
            <PriceBlock price={stay.pricePerNight} suffix="/ night" />
          </div>
          <button
            onClick={() =>
              setDraft({
                kind: "stay",
                title: stay.name,
                detail: `${stay.place} · per-night rate`,
                unitPrice: stay.pricePerNight,
                perPerson: false,
                sourceId: stay.id,
              })
            }
            className="mt-5 w-full rounded-full py-3 text-[15px] font-bold text-white"
            style={{ background: RED }}
          >
            Book this stay
          </button>
          <Link
            to="/explore/$slug"
            params={{ slug: stay.stateSlug }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border py-2.5 text-[13px] font-semibold"
            style={{ borderColor: "rgba(0,0,0,0.1)" }}
          >
            <Rotate3d size={14} /> Preview area in 360°
          </Link>
        </aside>
      </div>
      <BookingDialog draft={draft} onClose={() => setDraft(null)} />
    </SiteShell>
  );
}
