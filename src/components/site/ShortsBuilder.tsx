import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, Plus, Star, Undo2, X } from "lucide-react";
import type { PlaceClip } from "@/data/demoUniverse";
import {
  addToCart,
  fetchPlaceClips,
  formatINR,
  getCart,
  subscribeDemoStore,
  undoLastCartAction,
} from "@/lib/demoApi";
import { GREEN, RED } from "@/lib/brand";

/**
 * YouTube Shorts–style vertical swipe itinerary builder.
 * Swipe right = add, left = skip, scroll = next without selecting.
 */
export function ShortsBuilder({ onCartChange }: { onCartChange?: (ids: string[]) => void }) {
  const [clips, setClips] = useState<PlaceClip[]>([]);
  const [index, setIndex] = useState(0);
  const [cart, setCart] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [dragX, setDragX] = useState(0);
  const startX = useRef(0);
  const dragging = useRef(false);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

  useEffect(() => {
    fetchPlaceClips().then(setClips);
    setCart(getCart());
    return subscribeDemoStore(() => {
      const c = getCart();
      setCart(c);
      onCartChange?.(c);
    });
  }, [onCartChange]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, Math.max(clips.length - 1, 0)));
    setDragX(0);
  }, [clips.length]);

  const onAdd = useCallback(
    (id: string) => {
      const next = addToCart(id);
      setCart(next);
      onCartChange?.(next);
      showToast("Added to itinerary");
      goNext();
    },
    [goNext, onCartChange],
  );

  const onSkip = useCallback(() => {
    showToast("Skipped");
    goNext();
  }, [goNext]);

  const onUndo = () => {
    const next = undoLastCartAction();
    setCart(next);
    onCartChange?.(next);
    showToast("Undone");
  };

  /* Lazy-play only the active + neighbors */
  useEffect(() => {
    videoRefs.current.forEach((vid, i) => {
      if (Math.abs(i - index) <= 1) {
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, [index, clips]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setDragX(e.clientX - startX.current);
  };
  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const clip = clips[index];
    if (dragX > 100 && clip) onAdd(clip.id);
    else if (dragX < -100) onSkip();
    else setDragX(0);
  };

  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 40) return;
    if (e.deltaY > 0) goNext();
    else setIndex((i) => Math.max(0, i - 1));
  };

  if (clips.length === 0) {
    return (
      <div className="grid h-[70vh] place-items-center rounded-3xl bg-neutral-900 text-white">
        Loading places…
      </div>
    );
  }

  const clip = clips[index];
  const rotate = dragX / 20;
  const tint =
    dragX > 40 ? "rgba(36,150,63,0.25)" : dragX < -40 ? "rgba(226,55,68,0.25)" : "transparent";

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        className="relative overflow-hidden rounded-[28px] bg-black shadow-2xl"
        style={{ height: "min(78vh, 720px)" }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {clips.map((c, i) => {
          if (Math.abs(i - index) > 2) return null;
          const active = i === index;
          return (
            <div
              key={c.id}
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: active ? 1 : 0,
                pointerEvents: active ? "auto" : "none",
                transform: active ? `translateX(${dragX}px) rotate(${rotate}deg)` : undefined,
                background: tint,
              }}
            >
              <video
                ref={(el) => {
                  if (el) videoRefs.current.set(i, el);
                  else videoRefs.current.delete(i);
                }}
                src={c.videoUrl}
                poster={c.poster}
                muted
                loop
                playsInline
                preload={Math.abs(i - index) <= 1 ? "metadata" : "none"}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  const v = e.currentTarget;
                  v.style.display = "none";
                  const img = v.nextElementSibling as HTMLImageElement | null;
                  if (img) img.style.display = "block";
                }}
              />
              <img
                src={c.poster}
                alt=""
                className="absolute inset-0 hidden h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* Overlays */}
              <div className="absolute left-4 top-4 flex items-center gap-2">
                <span
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-bold text-white"
                  style={{ background: GREEN }}
                >
                  {c.rating} <Star size={10} fill="white" />
                </span>
                <span className="flex items-center gap-1 rounded-lg bg-black/50 px-2 py-1 text-[12px] font-semibold text-white backdrop-blur">
                  <Heart size={12} fill="white" /> {c.likes.toLocaleString("en-IN")}
                </span>
              </div>

              {dragX > 40 && (
                <div
                  className="absolute right-6 top-1/3 rotate-12 rounded-xl border-4 px-4 py-2 text-[22px] font-black uppercase text-white"
                  style={{ borderColor: GREEN, color: GREEN }}
                >
                  Add
                </div>
              )}
              {dragX < -40 && (
                <div
                  className="absolute left-6 top-1/3 -rotate-12 rounded-xl border-4 px-4 py-2 text-[22px] font-black uppercase"
                  style={{ borderColor: RED, color: RED }}
                >
                  Skip
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                  {c.state}
                </p>
                <h3 className="mt-1 text-[26px] font-bold tracking-tight">{c.place}</h3>
                <p className="mt-1 text-[14px] text-white/80">{c.blurb}</p>
                <p className="mt-3 text-[15px] font-semibold">
                  {formatINR(c.priceMin)} – {formatINR(c.priceMax)}
                  <span className="ml-1 text-[11px] font-medium text-white/60">/ person</span>
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => onSkip()}
                    className="grid h-12 w-12 place-items-center rounded-full bg-white/15 backdrop-blur"
                    aria-label="Skip"
                  >
                    <X size={22} />
                  </button>
                  <button
                    onClick={() => onAdd(c.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[15px] font-bold text-white"
                    style={{ background: RED }}
                  >
                    <Plus size={18} /> Add to itinerary
                  </button>
                </div>
                <p className="mt-3 text-center text-[11px] text-white/50">
                  Swipe right to add · left to skip · scroll for next
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating cart */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div
          className="flex flex-1 items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-lg"
          style={{ borderColor: "rgba(0,0,0,0.08)" }}
        >
          <span
            className="grid h-8 w-8 place-items-center rounded-full text-[13px] font-bold text-white"
            style={{ background: RED }}
          >
            {cart.length}
          </span>
          <div>
            <p className="text-[13px] font-bold">Itinerary cart</p>
            <p className="text-[11px] text-neutral-500">
              {cart.length === 0 ? "Swipe places to build your trip" : `${cart.length} stops selected`}
            </p>
          </div>
        </div>
        <button
          onClick={onUndo}
          className="flex items-center gap-1.5 rounded-2xl border bg-white px-4 py-3 text-[13px] font-semibold shadow-lg"
          style={{ borderColor: "rgba(0,0,0,0.08)" }}
        >
          <Undo2 size={15} /> Undo
        </button>
      </div>

      {toast && (
        <div className="pointer-events-none absolute left-1/2 top-6 z-20 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-[13px] font-semibold text-white">
          {toast}
        </div>
      )}

      <div className="mt-3 flex justify-center gap-1.5">
        {clips.map((_, i) => (
          <span
            key={i}
            className="h-1 rounded-full transition-all"
            style={{
              width: i === index ? 18 : 6,
              background: i === index ? RED : "rgba(0,0,0,0.15)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
