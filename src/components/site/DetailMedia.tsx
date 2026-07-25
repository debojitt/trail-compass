import { useState } from "react";
import { Play, Star, Heart } from "lucide-react";
import { formatINR } from "@/lib/demoApi";
import { GREEN, RED } from "@/lib/brand";

export function PhotoStrip({ photos, alt }: { photos: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const list = photos.length ? photos : [];
  if (list.length === 0) return null;
  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl bg-neutral-100" style={{ aspectRatio: "16/10" }}>
        <img
          src={list[active]}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      {list.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {list.map((p, i) => (
            <button
              key={p + i}
              onClick={() => setActive(i)}
              className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2"
              style={{ borderColor: i === active ? RED : "transparent" }}
            >
              <img src={p} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function VideoRow({ videos }: { videos: string[] }) {
  if (!videos?.length) return null;
  return (
    <div>
      <h3 className="text-[15px] font-bold tracking-tight">Experience videos</h3>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {videos.map((v, i) => (
          <div
            key={v + i}
            className="relative h-48 w-32 shrink-0 overflow-hidden rounded-2xl bg-black"
          >
            <video
              src={v}
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white">
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
