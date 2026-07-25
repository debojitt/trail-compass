import { useState } from "react";
import { Play, Star, Heart, Images, X } from "lucide-react";
import { formatINR } from "@/lib/demoApi";
import { GREEN, RED } from "@/lib/brand";

/** Airbnb / MakeMyTrip-style photo mosaic with lightbox */
export function PhotoGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const list = photos.length ? photos : [];
  if (list.length === 0) return null;

  const main = list[0];
  const side = list.slice(1, 5);

  return (
    <div>
      <div className="relative grid gap-2 overflow-hidden rounded-3xl md:grid-cols-4 md:grid-rows-2" style={{ minHeight: 280 }}>
        <button
          type="button"
          onClick={() => setLightbox(0)}
          className="relative col-span-2 row-span-2 min-h-[220px] overflow-hidden bg-neutral-100 md:min-h-[360px]"
        >
          <img src={main} alt={alt} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
        </button>
        {side.map((p, i) => (
          <button
            type="button"
            key={p + i}
            onClick={() => setLightbox(i + 1)}
            className="relative hidden min-h-[175px] overflow-hidden bg-neutral-100 md:block"
          >
            <img src={p} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
          </button>
        ))}
        {list.length > 1 && (
          <button
            type="button"
            onClick={() => setLightbox(0)}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-bold shadow"
          >
            <Images size={14} /> Show all {list.length} photos
          </button>
        )}
      </div>

      {list.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 md:hidden" style={{ scrollbarWidth: "none" }}>
          {list.map((p, i) => (
            <button
              key={p + i}
              type="button"
              onClick={() => setLightbox(i)}
              className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl"
              style={{ boxShadow: i === 0 ? `inset 0 0 0 2px ${RED}` : undefined }}
            >
              <img src={p} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox != null && (
        <div
          className="fixed inset-0 z-[80] flex flex-col bg-black/92"
          role="dialog"
          aria-modal
          aria-label="Photo gallery"
        >
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <p className="text-[13px] font-semibold">
              {lightbox + 1} / {list.length}
            </p>
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center px-4 pb-6">
            <img
              src={list[lightbox]}
              alt={`${alt} ${lightbox + 1}`}
              className="max-h-[78vh] max-w-full rounded-2xl object-contain"
            />
          </div>
          <div className="flex justify-center gap-2 overflow-x-auto px-4 pb-5" style={{ scrollbarWidth: "none" }}>
            {list.map((p, i) => (
              <button
                key={p + i}
                type="button"
                onClick={() => setLightbox(i)}
                className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2"
                style={{ borderColor: i === lightbox ? "#fff" : "transparent" }}
              >
                <img src={p} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** @deprecated use PhotoGallery */
export const PhotoStrip = PhotoGallery;

export function VideoRow({ videos }: { videos: string[] }) {
  if (!videos?.length) return null;
  return (
    <div>
      <h3 className="text-[15px] font-bold tracking-tight">Experience videos</h3>
      <p className="mt-1 text-[12px] text-neutral-500">Short clips from the place — mute by default, tap to unmute in browser controls.</p>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {videos.map((v, i) => (
          <div
            key={v + i}
            className="relative h-56 w-36 shrink-0 overflow-hidden rounded-2xl bg-black shadow-md"
          >
            <video
              src={v}
              muted
              loop
              playsInline
              autoPlay
              controls
              preload="metadata"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white">
              <Play size={10} fill="white" /> Clip {i + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RatingLikes({
  rating,
  likes,
  reviews,
}: {
  rating: number;
  likes?: number;
  reviews?: number | string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-bold text-white"
        style={{ background: GREEN }}
      >
        {rating} <Star size={10} fill="white" />
      </span>
      {likes != null && (
        <span className="flex items-center gap-1 rounded-lg bg-neutral-100 px-2 py-1 text-[12px] font-semibold text-neutral-700">
          <Heart size={12} style={{ color: RED }} /> {likes.toLocaleString("en-IN")}
        </span>
      )}
      {reviews != null && (
        <span className="text-[12px] text-neutral-500">{reviews} reviews</span>
      )}
    </div>
  );
}

export function PriceBlock({
  price,
  oldPrice,
  suffix = "/ person",
}: {
  price: number;
  oldPrice?: number;
  suffix?: string;
}) {
  return (
    <div>
      {oldPrice != null && (
        <p className="text-[12px] text-neutral-400 line-through">{formatINR(oldPrice)}</p>
      )}
      <p className="text-[26px] font-bold tracking-tight" style={{ color: RED }}>
        {formatINR(price)}
        <span className="ml-1 text-[12px] font-medium text-neutral-400">{suffix}</span>
      </p>
    </div>
  );
}
