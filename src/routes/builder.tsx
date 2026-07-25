import { useEffect, useMemo, useRef, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Heart, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import {
  useStore,
  useCurrentUser,
  saveDraftItinerary,
  formatINR,
  type Place,
} from "@/lib/store";
import { RED, GREEN } from "@/lib/brand";

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "Itinerary Builder · NORTHNEST" },
      { name: "description", content: "Swipe through Northeast India places · add to your itinerary." },
    ],
  }),
  component: Builder,
});

type CartStop = { placeId: string; day: number };

function Builder() {
  const places = useStore((s) => s.places);
  const user = useCurrentUser();
  const navigate = useNavigate();

  const [cart, setCart] = useState<CartStop[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [swipeXById, setSwipeXById] = useState<Record<string, number>>({});
  const [savedTitle, setSavedTitle] = useState<string | null>(null);
  const [title, setTitle] = useState("My Northeast plan");

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.6) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            setActiveIdx(idx);
          }
        }
      },
      { root: el, threshold: [0, 0.6, 1] },
    );
    slideRefs.current.forEach((s) => s && io.observe(s));
    return () => io.disconnect();
  }, [places]);

  const addPlace = (p: Place) => {
    if (cart.some((c: CartStop) => c.placeId === p.id)) return;
    setCart((c) => [...c, { placeId: p.id, day: Math.floor(c.length / 2) + 1 }]);
  };
  const skip = (idx: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const next = slideRefs.current[idx + 1];
    next?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cartTotal = useMemo(
    () =>
      cart.reduce((sum, c) => sum + (places.find((p) => p.id === c.placeId)?.price ?? 0), 0),
    [cart, places],
  );

  const save = () => {
    if (!user) return navigate({ to: "/auth" });
    if (cart.length === 0) return;
    const cover = places.find((p) => p.id === cart[0].placeId)?.poster ?? "";
    const it = saveDraftItinerary({ title, stops: cart, cover });
    if (it) {
      setSavedTitle(title);
      setCart([]);
      setCartOpen(false);
      setTimeout(() => setSavedTitle(null), 2200);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex bg-black text-white">
      {/* Top exit bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between p-4">
        <Link
          to="/"
          className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-black/50 backdrop-blur"
          aria-label="Close builder"
        >
          <X size={18} />
        </Link>
        <div className="pointer-events-auto rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest backdrop-blur">
          {activeIdx + 1} / {places.length}
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="pointer-events-auto relative flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold text-white shadow-lg"
          style={{ background: RED }}
        >
          <ShoppingBag size={15} /> {cart.length}
          {cart.length > 0 && (
            <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-white" />
          )}
        </button>
      </div>

      {/* Vertical snap feed */}
      <div
        ref={scrollerRef}
        className="h-full w-full flex-1 snap-y snap-mandatory overflow-y-scroll"
        style={{ scrollBehavior: "smooth" }}
      >
        {places.map((p, i) => (
          <PlaceSlide
            key={p.id}
            place={p}
            idx={i}
            ref={(el: HTMLDivElement | null) => { slideRefs.current[i] = el; }}
            inCart={cart.some((c: CartStop) => c.placeId === p.id)}
            swipeX={swipeXById[p.id] ?? 0}
            setSwipeX={(x) => setSwipeXById((m) => ({ ...m, [p.id]: x }))}
            onAdd={() => addPlace(p)}
            onSkip={() => skip(i)}
          />
        ))}
      </div>

      {/* Cart drawer */}
      {cartOpen && (
        <div
          className="absolute inset-0 z-40 bg-black/60 backdrop-blur"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6 text-neutral-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-300" />
            <div className="flex items-center justify-between">
              <p className="text-[18px] font-bold tracking-tight">Your itinerary</p>
              <button
                onClick={() => setCartOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-neutral-100"
              >
                <ChevronDown size={16} />
              </button>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-3 w-full rounded-2xl border px-4 py-2.5 text-[15px] outline-none"
              style={{ borderColor: "rgba(0,0,0,0.12)" }}
            />
            {cart.length === 0 ? (
              <p className="mt-6 text-center text-[13px] text-neutral-400">
                Swipe right or tap Add on any place to start.
              </p>
            ) : (
              <ol className="mt-4 space-y-2">
                {cart.map((c, i) => {
                  const p = places.find((x) => x.id === c.placeId)!;
                  return (
                    <li
                      key={c.placeId}
                      className="flex items-center gap-3 rounded-2xl border p-2"
                      style={{ borderColor: "rgba(0,0,0,0.08)" }}
                    >
                      <img src={p.poster} alt="" className="h-14 w-14 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold">{p.name}</p>
                        <p className="text-[11px] text-neutral-500">
                          Day {c.day} · {p.priceRange}
                        </p>
                      </div>
                      <select
                        value={c.day}
                        onChange={(e) => {
                          const day = Number(e.target.value);
                          setCart((cur) => cur.map((x, xi) => (xi === i ? { ...x, day } : x)));
                        }}
                        className="rounded-full border px-2 py-1 text-[11px]"
                        style={{ borderColor: "rgba(0,0,0,0.12)" }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                          <option key={d} value={d}>
                            Day {d}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setCart((c) => c.filter((_, xi) => xi !== i))}
                        className="grid h-8 w-8 place-items-center rounded-full text-neutral-400 hover:bg-neutral-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
            <div
              className="mt-4 flex items-center justify-between rounded-2xl px-4 py-3"
              style={{ background: "rgba(0,0,0,0.04)" }}
            >
              <div>
                <p className="text-[11px] uppercase tracking-widest text-neutral-400">Estimated</p>
                <p className="text-[22px] font-bold" style={{ color: RED }}>
                  {formatINR(cartTotal)}
                </p>
              </div>
              <button
                onClick={save}
                disabled={cart.length === 0}
                className="rounded-full px-6 py-3 text-[13px] font-bold text-white disabled:opacity-40"
                style={{ background: GREEN }}
              >
                Save to my nest
              </button>
            </div>
            {!user && (
              <p className="mt-3 text-center text-[11px] text-neutral-400">
                You'll be asked to sign in when saving.
              </p>
            )}
          </div>
        </div>
      )}

      {savedTitle && (
        <div
          className="absolute bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-2 text-[13px] font-bold text-white shadow-2xl"
          style={{ background: GREEN }}
        >
          Saved "{savedTitle}" — see it in your dashboard
        </div>
      )}
    </div>
  );
}

const PlaceSlide = (({ place, idx, inCart, swipeX, setSwipeX, onAdd, onSkip, ...rest }: any) => {
  const startX = useRef(0);
  const dragging = useRef(false);

  const onDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setSwipeX(e.clientX - startX.current);
  };
  const onUp = () => {
    dragging.current = false;
    if (swipeX > 120) {
      onAdd();
    } else if (swipeX < -120) {
      onSkip();
    }
    setSwipeX(0);
  };

  return (
    <div
      ref={(el) => rest.ref?.(el)}
      data-idx={idx}
      className="relative h-full w-full snap-start snap-always"
    >
      <div
        className="relative h-full w-full transition-transform"
        style={{
          transform: `translateX(${swipeX * 0.3}px) rotate(${swipeX * 0.02}deg)`,
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <img
          src={place.poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ animation: "nnKenBurns 20s ease-in-out infinite alternate" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />

        {/* Swipe indicators */}
        {swipeX > 40 && (
          <div className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full border-4 border-green-400 px-4 py-2 text-lg font-black text-green-400 rotate-[-15deg]">
            ADD
          </div>
        )}
        {swipeX < -40 && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full border-4 border-red-400 px-4 py-2 text-lg font-black text-red-400 rotate-[15deg]">
            SKIP
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-6 pb-32 md:pb-24">
          <div className="flex flex-wrap gap-1.5">
            {place.tags.map((t: string) => (
              <span
                key={t}
                className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur"
              >
                {t}
              </span>
            ))}
          </div>
          <h2 className="mt-3 text-[32px] font-black leading-tight tracking-tight">{place.name}</h2>
          <p className="text-[13px] font-semibold text-white/70">
            {place.state} · {place.hours}
          </p>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/85">{place.hook}</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-bold backdrop-blur">
              {place.priceRange}
            </div>
            <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-bold backdrop-blur">
              <Heart size={12} fill="currentColor" /> {place.likes.toLocaleString("en-IN")}
            </div>
          </div>
          <button
            onClick={onAdd}
            disabled={inCart}
            className="mt-5 flex items-center gap-2 rounded-full py-3 pl-4 pr-6 text-[15px] font-black text-white shadow-2xl transition-transform hover:scale-105 disabled:opacity-70"
            style={{ background: inCart ? GREEN : RED }}
          >
            <Plus size={18} /> {inCart ? "Added" : "Add to itinerary"}
          </button>
          <p className="mt-2 text-[11px] text-white/50">
            Swipe right to add · left to skip · scroll for next
          </p>
        </div>
      </div>
    </div>
  );
}) as any;
