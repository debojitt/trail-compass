import { useCallback, useEffect, useRef, useState } from "react";
import {
  Heart,
  MessageCircle,
  Music2,
  Plus,
  Share2,
  Volume2,
  VolumeX,
  X,
  Undo2,
  Check,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { PlaceClip } from "@/data/demoUniverse";
import {
  addToCart,
  fetchPlaceClips,
  formatINR,
  getCart,
  removeFromCart,
  subscribeDemoStore,
  undoLastCartAction,
} from "@/lib/demoApi";
import { macGenieMinimize } from "@/lib/macGenie";
import { GREEN, RED } from "@/lib/brand";

type Props = {
  onCartChange?: (ids: string[]) => void;
};

/**
 * YouTube Shorts–accurate vertical snap feed + Mac genie add-to-playlist.
 */
export function ShortsBuilder({ onCartChange }: Props) {
  const [clips, setClips] = useState<PlaceClip[]>([]);
  const [index, setIndex] = useState(0);
  const [cart, setCart] = useState<string[]>([]);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [muted, setMuted] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Map<number, HTMLElement>>(new Map());
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const dragXRef = useRef(0);
  const ptr = useRef<{
    id: number | null;
    x: number;
    y: number;
    axis: "none" | "x" | "y";
    moved: boolean;
  }>({ id: null, x: 0, y: 0, axis: "none", moved: false });

  const syncCart = useCallback(
    (next: string[]) => {
      setCart(next);
      onCartChange?.(next);
    },
    [onCartChange],
  );

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1400);
  };

  useEffect(() => {
    let alive = true;
    fetchPlaceClips().then((list) => {
      if (!alive) return;
      setClips(list);
      setReady(true);
    });
    setCart(getCart());
    const unsub = subscribeDemoStore(() => {
      const c = getCart();
      setCart(c);
      onCartChange?.(c);
    });
    return () => {
      alive = false;
      unsub();
    };
  }, [onCartChange]);

  const scrollToIndex = useCallback((i: number, smooth = true) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const clamped = Math.max(0, Math.min(i, scroller.children.length - 1));
    const top = clamped * scroller.clientHeight;
    scroller.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
    setIndex(clamped);
    setDragX(0);
    dragXRef.current = 0;
  }, []);

  /* Track active short via intersection (YouTube Shorts style) */
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || !clips.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!best) return;
        const i = Number((best.target as HTMLElement).dataset.index);
        if (!Number.isNaN(i)) setIndex(i);
      },
      { root, threshold: [0.55, 0.75, 0.9] },
    );
    Array.from(root.children).forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, [clips.length]);

  /* Only the active video plays */
  useEffect(() => {
    const active = clips[index];
    videoRefs.current.forEach((vid, id) => {
      if (active && id === active.id) {
        vid.muted = muted;
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, [index, clips, muted]);

  const runGenie = useCallback(async (slideEl: HTMLElement | null, poster: string, onStarted?: () => void) => {
    /* Prefer on-screen floating cart (phone) so genie never flies off-viewport */
    const fab = document.getElementById("nn-playlist-fab");
    const dockIcon = document.getElementById("nn-playlist-dock-icon");
    const dockPanel = document.getElementById("nn-playlist-dock");
    const visible = (el: HTMLElement | null) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return r.width >= 8 && r.height >= 8 ? el : null;
    };
    const dock = visible(fab) ?? visible(dockIcon) ?? visible(dockPanel);
    if (!slideEl || !dock) {
      onStarted?.();
      return;
    }
    await macGenieMinimize(slideEl, dock, poster, { onStarted });
  }, []);

  const commitAdd = useCallback(
    async (clip: PlaceClip, i: number) => {
      if (busy) return;
      if (cart.includes(clip.id)) {
        scrollToIndex(i + 1, true);
        return;
      }

      setBusy(true);
      setDragging(false);
      setDragX(0);
      dragXRef.current = 0;

      const slide = slideRefs.current.get(i) ?? null;
      /* Freeze frame for genie, then jump to next Shorts frame immediately */
      if (slide) slide.classList.add("nn-shorts-minimizing");

      /* Cart updates right away so playlist shows the selected stop */
      syncCart(addToCart(clip.id));
      flash(`Added · ${clip.place}`);

      try {
        await runGenie(slide, clip.poster, () => {
          /* Next short appears directly while genie is still sucking away */
          scrollToIndex(i + 1, false);
        });
      } finally {
        slide?.classList.remove("nn-shorts-minimizing");
        setBusy(false);
      }
    },
    [busy, cart, runGenie, scrollToIndex, syncCart],
  );

  const commitSkip = useCallback(
    (i: number) => {
      if (busy) return;
      flash("Skipped");
      setDragX(0);
      dragXRef.current = 0;
      scrollToIndex(i + 1, true);
    },
    [busy, scrollToIndex],
  );

  const onUndo = () => {
    syncCart(undoLastCartAction());
    flash("Undone");
  };

  /* Horizontal swipe only — vertical stays native Shorts scroll */
  const onPointerDown = (e: React.PointerEvent, i: number) => {
    if (busy || e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button, a, input")) return;
    if (i !== index) return;
    ptr.current = { id: e.pointerId, x: e.clientX, y: e.clientY, axis: "none", moved: false };
    dragXRef.current = 0;
    setDragX(0);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (ptr.current.id !== e.pointerId) return;
    const dx = e.clientX - ptr.current.x;
    const dy = e.clientY - ptr.current.y;

    if (ptr.current.axis === "none") {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      ptr.current.axis = Math.abs(dx) > Math.abs(dy) * 1.15 ? "x" : "y";
      if (ptr.current.axis === "x") {
        setDragging(true);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }
    }

    if (ptr.current.axis !== "x") return;
    e.preventDefault();
    ptr.current.moved = true;
    dragXRef.current = dx;
    setDragX(dx);
  };

  const onPointerUp = (e: React.PointerEvent, clip: PlaceClip, i: number) => {
    if (ptr.current.id !== e.pointerId) return;
    const axis = ptr.current.axis;
    const dx = dragXRef.current;
    ptr.current.id = null;
    setDragging(false);

    if (axis !== "x") {
      setDragX(0);
      dragXRef.current = 0;
      return;
    }

    if (dx > 100) void commitAdd(clip, i);
    else if (dx < -100) commitSkip(i);
    else {
      setDragX(0);
      dragXRef.current = 0;
    }
  };

  /* Keep snap height in sync with viewport (mobile URL bar / rotate) */
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const resync = () => {
      const i = index;
      const top = i * scroller.clientHeight;
      if (Math.abs(scroller.scrollTop - top) > 2) {
        scroller.scrollTo({ top, behavior: "auto" });
      }
    };
    window.addEventListener("resize", resync);
    window.visualViewport?.addEventListener("resize", resync);
    return () => {
      window.removeEventListener("resize", resync);
      window.visualViewport?.removeEventListener("resize", resync);
    };
  }, [index, clips.length]);

  if (!ready) {
    return (
      <div className="nn-shorts-stage grid place-items-center bg-[#121212] text-[14px] text-white/50">
        Loading Shorts…
      </div>
    );
  }

  if (!clips.length) {
    return (
      <div className="nn-shorts-stage grid place-items-center bg-[#121212] text-[14px] text-white/50">
        No places available
      </div>
    );
  }

  return (
    <div className="relative h-full w-full lg:h-auto lg:max-w-[420px]">
      <div
        ref={stageRef}
        className="nn-shorts-stage bg-black text-white lg:shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
      >
        <div ref={scrollerRef} className="nn-shorts-scroller">
          {clips.map((clip, i) => {
            const active = i === index;
            const added = cart.includes(clip.id);
            const isLiked = !!liked[clip.id];
            const x = active ? dragX : 0;
            const rotate = x / 28;
            const addHint = active && x > 48;
            const skipHint = active && x < -48;

            return (
              <article
                key={clip.id}
                data-index={i}
                ref={(el) => {
                  if (el) slideRefs.current.set(i, el);
                  else slideRefs.current.delete(i);
                }}
                className="nn-shorts-slide"
                onPointerDown={(e) => onPointerDown(e, i)}
                onPointerMove={onPointerMove}
                onPointerUp={(e) => onPointerUp(e, clip, i)}
                onPointerCancel={(e) => onPointerUp(e, clip, i)}
              >
                <div
                  className="absolute inset-0 will-change-transform"
                  style={{
                    transform: `translateX(${x}px) rotate(${rotate}deg)`,
                    transition: dragging && active ? "none" : "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  <img
                    src={clip.poster}
                    alt=""
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current.set(clip.id, el);
                      else videoRefs.current.delete(clip.id);
                    }}
                    src={clip.videoUrl}
                    poster={clip.poster}
                    muted={muted}
                    loop
                    playsInline
                    preload={Math.abs(i - index) <= 1 ? "metadata" : "none"}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.visibility = "hidden";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/90" />

                  {addHint && (
                    <div
                      className="absolute right-5 top-28 rotate-12 rounded-xl border-[3px] px-3 py-1.5 text-[22px] font-black uppercase lg:top-24"
                      style={{ borderColor: GREEN, color: GREEN, background: "rgba(0,0,0,0.35)" }}
                    >
                      Add
                    </div>
                  )}
                  {skipHint && (
                    <div
                      className="absolute left-5 top-28 -rotate-12 rounded-xl border-[3px] px-3 py-1.5 text-[22px] font-black uppercase lg:top-24"
                      style={{ borderColor: RED, color: RED, background: "rgba(0,0,0,0.35)" }}
                    >
                      Skip
                    </div>
                  )}

                  {active && (
                    <div
                      className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-3 lg:pt-3"
                      style={{ paddingTop: "max(4.25rem, calc(env(safe-area-inset-top) + 3.5rem))" }}
                    >
                      <div className="hidden items-center gap-2 lg:flex">
                        <span className="text-[15px] font-bold">Shorts</span>
                        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/80">
                          {i + 1}/{clips.length}
                        </span>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5">
                        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/80 lg:hidden">
                          {i + 1}/{clips.length}
                        </span>
                        <IconBtn onClick={onUndo} label="Undo">
                          <Undo2 size={15} />
                        </IconBtn>
                        <IconBtn onClick={() => setMuted((m) => !m)} label={muted ? "Unmute" : "Mute"}>
                          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                        </IconBtn>
                      </div>
                    </div>
                  )}

                  <div
                    className="absolute right-2.5 z-20 flex flex-col items-center gap-3.5 sm:right-3 sm:gap-4"
                    style={{ bottom: "max(8.75rem, calc(env(safe-area-inset-bottom) + 7.75rem))" }}
                  >
                    <RailBtn
                      label={(clip.likes + (isLiked ? 1 : 0)).toLocaleString("en-IN")}
                      onClick={() => setLiked((p) => ({ ...p, [clip.id]: !p[clip.id] }))}
                    >
                      <Heart
                        size={22}
                        fill={isLiked ? RED : "transparent"}
                        color={isLiked ? RED : "white"}
                      />
                    </RailBtn>
                    <RailBtn label="Ask">
                      <MessageCircle size={22} />
                    </RailBtn>
                    <RailBtn
                      label={added ? "Added" : "Add"}
                      onClick={() => {
                        if (added) syncCart(removeFromCart(clip.id));
                        else void commitAdd(clip, i);
                      }}
                      solid={added ? "#22c55e" : RED}
                    >
                      {added ? <Check size={22} /> : <Plus size={22} />}
                    </RailBtn>
                    <RailBtn label="Skip" onClick={() => commitSkip(i)}>
                      <X size={22} />
                    </RailBtn>
                    <RailBtn label="Share">
                      <Share2 size={20} />
                    </RailBtn>
                    <div className="mt-1 h-10 w-10 overflow-hidden rounded-xl border-2 border-white">
                      <img src={clip.poster} alt="" className="h-full w-full object-cover" />
                    </div>
                  </div>

                  <div
                    className="absolute inset-x-0 bottom-0 z-20 p-4 pr-[4.75rem]"
                    style={{
                      paddingBottom: "max(1rem, calc(env(safe-area-inset-bottom) + 0.75rem))",
                      paddingRight: "max(4.75rem, calc(env(safe-area-inset-right) + 4.5rem))",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-white/80">
                        <img src={clip.poster} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-bold">
                          @{clip.place.replace(/\s+/g, "").toLowerCase()}
                        </p>
                        <p className="truncate text-[11px] text-white/65">{clip.state}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!added) void commitAdd(clip, i);
                        }}
                        className="shrink-0 rounded-full border border-white/50 px-3 py-1 text-[11px] font-bold"
                      >
                        {added ? "In trip" : "Add stop"}
                      </button>
                    </div>
                    <p className="mt-2.5 line-clamp-2 text-[13px] leading-snug text-white/90">{clip.blurb}</p>
                    <p className="mt-1.5 text-[13px] font-semibold">
                      {formatINR(clip.priceMin)} – {formatINR(clip.priceMax)}
                      <span className="ml-1 text-[11px] font-medium text-white/50">/ person</span>
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/70">
                      <Music2 size={12} />
                      <p className="truncate">Original audio · {clip.place}</p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {toast && (
          <div
            className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-bold text-black shadow-lg"
            style={{ top: "max(5.5rem, calc(env(safe-area-inset-top) + 4.5rem))" }}
          >
            {toast}
          </div>
        )}
      </div>

      <div className="absolute left-[calc(100%+12px)] top-1/2 hidden -translate-y-1/2 flex-col gap-2 xl:flex">
        <button
          type="button"
          onClick={() => scrollToIndex(index - 1)}
          disabled={index <= 0}
          className="grid h-10 w-10 place-items-center rounded-full bg-[#272727] text-white disabled:opacity-30"
          aria-label="Previous"
        >
          <ChevronUp size={18} />
        </button>
        <button
          type="button"
          onClick={() => scrollToIndex(index + 1)}
          disabled={index >= clips.length - 1}
          className="grid h-10 w-10 place-items-center rounded-full bg-[#272727] text-white disabled:opacity-30"
          aria-label="Next"
        >
          <ChevronDown size={18} />
        </button>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full bg-black/45 backdrop-blur-sm"
    >
      {children}
    </button>
  );
}

function RailBtn({
  children,
  label,
  onClick,
  solid,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  solid?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="flex flex-col items-center gap-1"
    >
      <span
        className="grid h-11 w-11 place-items-center rounded-full sm:h-12 sm:w-12"
        style={{ background: solid ?? "rgba(0,0,0,0.45)" }}
      >
        {children}
      </span>
      <span className="text-[10px] font-semibold sm:text-[11px]">{label}</span>
    </button>
  );
}
