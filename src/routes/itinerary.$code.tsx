import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { BookingDialog, type BookingDraft } from "@/components/site/BookingDialog";
import { PhotoStrip, VideoRow, RatingLikes, PriceBlock } from "@/components/site/DetailMedia";
import type { PublishedItinerary } from "@/data/demoUniverse";
import { fetchPublishedByCode, addToCart, PLACE_CLIPS } from "@/lib/demoApi";
import { GREEN, RED } from "@/lib/brand";
import { toast } from "sonner";

export const Route = createFileRoute("/itinerary/$code")({
  head: ({ params }) => ({
    meta: [{ title: `${params.code} · Published itinerary · NORTHNEST` }],
  }),
  component: ItineraryByCodePage,
});

function ItineraryByCodePage() {
  const { code } = Route.useParams();
  const [pub, setPub] = useState<PublishedItinerary | null | undefined>(undefined);
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  useEffect(() => {
    fetchPublishedByCode(code).then(setPub);
  }, [code]);

  if (pub === undefined) {
    return (
      <SiteShell>
        <div className="h-72 animate-pulse rounded-3xl bg-neutral-100" />
      </SiteShell>
    );
  }
  if (!pub) {
    return (
      <SiteShell>
        <p className="text-[18px] font-bold">No itinerary for code {code}</p>
        <p className="mt-2 text-[13px] text-neutral-500">
          Try NN-MEGH-804, NN-TAWA-221, or NN-CREA-441
        </p>
        <Link to="/packages" className="mt-4 inline-block text-[13px] font-semibold" style={{ color: RED }}>
          Browse published itineraries
        </Link>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <p className="font-mono text-[12px] font-bold" style={{ color: GREEN }}>
        {pub.code}
      </p>
      <h1 className="mt-1 text-[28px] font-bold tracking-tight">{pub.title}</h1>
      <p className="mt-1 text-[13px] text-neutral-500">
        Published by {pub.publisherName} ({pub.publisherType})
        {pub.fromCompletedBooking ? " · unlocked after COMPLETED booking" : " · creator/host/planner publish"}
      </p>
      <div className="mt-3">
        <RatingLikes rating={pub.rating} likes={pub.likes} reviews={pub.reviews} />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <PhotoStrip photos={pub.photos} alt={pub.title} />
          <VideoRow videos={pub.videos} />
          <div>
            <h2 className="text-[16px] font-bold">Experience</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">{pub.experience}</p>
          </div>
          <div>
            <h2 className="text-[16px] font-bold">Stops</h2>
            <ol className="mt-3 space-y-3">
              {pub.stops.map((s) => (
                <li key={`${s.day}-${s.place}`} className="flex gap-3 rounded-2xl bg-neutral-50 p-3">
                  <img src={s.img} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-400">Day {s.day}</p>
                    <p className="text-[14px] font-bold">{s.place}</p>
                    <p className="text-[12px] text-neutral-500">{s.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <aside
          className="h-fit rounded-3xl border p-6 shadow-lg lg:sticky lg:top-24"
          style={{ borderColor: "rgba(0,0,0,0.07)" }}
        >
          <PriceBlock price={pub.priceFrom} />
          <p className="mt-2 text-[12px] text-neutral-500">
            {pub.days} days · Publisher earns {pub.commissionPct}% when you complete
          </p>
          <button
            onClick={() =>
              setDraft({
                kind: "itinerary",
                title: pub.title,
                detail: `Code ${pub.code}`,
                unitPrice: pub.priceFrom,
                sourceId: pub.id,
                publisherId: pub.publisherId,
              })
            }
            className="mt-5 w-full rounded-full py-3 text-[15px] font-bold text-white"
            style={{ background: RED }}
          >
            Book this route
          </button>
          <button
            onClick={() => {
              pub.stops.forEach((_, i) => {
                const clip = PLACE_CLIPS[i % PLACE_CLIPS.length];
                if (clip) addToCart(clip.id);
              });
              toast.success("Stops added to itinerary builder");
            }}
            className="mt-3 w-full rounded-full border py-2.5 text-[13px] font-semibold"
            style={{ borderColor: "rgba(0,0,0,0.12)" }}
          >
            Add to builder cart
          </button>
          <Link
            to="/builder"
            className="mt-3 block text-center text-[13px] font-semibold"
            style={{ color: GREEN }}
          >
            Open Shorts builder →
          </Link>
        </aside>
      </div>
      <BookingDialog draft={draft} onClose={() => setDraft(null)} />
    </SiteShell>
  );
}
