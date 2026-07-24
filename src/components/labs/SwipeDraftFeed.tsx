import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { Heart, X, RotateCcw, MapPin, Quote } from "lucide-react";

type Card = {
  id: number;
  title: string;
  location: string;
  price: number;
  vibe: string;
  note: string;
  gradient: string;
};

const INITIAL: Card[] = [
  {
    id: 1,
    title: "Shnongpdeng River Camping",
    location: "East Khasi Hills",
    price: 1800,
    vibe: "High-Altitude Bonfire",
    note: "Best experienced during November mist. Hosted by Khasi elders.",
    gradient: "from-emerald-900 via-slate-900 to-cyan-950",
  },
  {
    id: 2,
    title: "Kaziranga Deep Safari Node",
    location: "Assam Gateway",
    price: 3200,
    vibe: "4x4 Off-Road",
    note: "Private jeep track with verified naturalist.",
    gradient: "from-amber-900 via-slate-900 to-rose-950",
  },
  {
    id: 3,
    title: "Jorhat Heritage Tea Bungalow",
    location: "Jorhat Town",
    price: 2500,
    vibe: "0% Commission Sanctuary",
    note: "Includes organic tea tasting session.",
    gradient: "from-teal-900 via-slate-900 to-emerald-950",
  },
];

type HistoryEntry = { card: Card; direction: "left" | "right" };

export function SwipeDraftFeed() {
  const [cards, setCards] = useState<Card[]>(INITIAL);
  const [cart, setCart] = useState<Card[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const totalCost = cart.reduce((s, c) => s + c.price, 0);
  const emi = totalCost ? Math.round(totalCost / 6) : 0;

  const swipe = (direction: "left" | "right") => {
    const top = cards[0];
    if (!top) return;
    setHistory((h) => [...h, { card: top, direction }]);
    setCards((cs) => cs.slice(1));
    if (direction === "right") setCart((c) => [...c, top]);
  };

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    setHistory((h) => h.slice(0, -1));
    setCards((cs) => [last.card, ...cs]);
    if (last.direction === "right") setCart((c) => c.filter((x) => x.id !== last.card.id));
  };

  const reset = () => {
    setCards(INITIAL);
    setCart([]);
    setHistory([]);
  };

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="relative h-[600px] rounded-3xl border border-white/10 bg-slate-950 p-4 shadow-2xl">
        <div className="relative h-[440px]">
          <AnimatePresence>
            {cards
              .slice(0, 3)
              .reverse()
              .map((c, idx, arr) => {
                const isTop = idx === arr.length - 1;
                return (
                  <SwipeCard
                    key={c.id}
                    card={c}
                    isTop={isTop}
                    stackIndex={arr.length - 1 - idx}
                    onSwipe={swipe}
                  />
                );
              })}
          </AnimatePresence>
          {cards.length === 0 && (
            <div className="grid h-full place-items-center rounded-2xl border border-dashed border-white/15 text-center text-white/50">
              <div>
                <p className="text-sm font-semibold">All experiences reviewed</p>
                <button
                  onClick={reset}
                  className="mt-3 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
                >
                  Reset deck
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-center gap-5">
          <button
            onClick={() => swipe("left")}
            disabled={!cards.length}
            className="grid h-14 w-14 place-items-center rounded-full border border-red-400/40 bg-red-500/15 text-red-400 transition hover:scale-110 disabled:opacity-40"
            aria-label="Skip"
          >
            <X size={22} />
          </button>
          <button
            onClick={undo}
            disabled={!history.length}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white/80 transition hover:scale-110 disabled:opacity-40"
            aria-label="Undo"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => swipe("right")}
            disabled={!cards.length}
            className="grid h-14 w-14 place-items-center rounded-full border border-cyan-400/50 bg-cyan-400/20 text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.4)] transition hover:scale-110 disabled:opacity-40"
            aria-label="Add"
          >
            <Heart size={22} />
          </button>
        </div>
      </div>

      <div className="sticky bottom-4 mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-white">
              {cart.length} Experience{cart.length !== 1 ? "s" : ""} Added
            </p>
            <p className="text-[11px] text-cyan-300">Est. ₹{emi.toLocaleString("en-IN")}/mo EMI</p>
          </div>
          <button className="rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-2 text-[13px] font-bold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.5)] transition hover:brightness-110">
            Build Route →
          </button>
        </div>
      </div>
    </div>
  );
}

function SwipeCard({
  card,
  isTop,
  stackIndex,
  onSwipe,
}: {
  card: Card;
  isTop: boolean;
  stackIndex: number;
  onSwipe: (dir: "left" | "right") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(x, [40, 140], [0, 1]);
  const skipOpacity = useTransform(x, [-140, -40], [1, 0]);

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        scale: 1 - stackIndex * 0.04,
        y: stackIndex * 10,
        zIndex: 10 - stackIndex,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) onSwipe("right");
        else if (info.offset.x < -100) onSwipe("left");
      }}
      exit={{ x: x.get() > 0 ? 400 : -400, opacity: 0, transition: { duration: 0.25 } }}
    >
      <div
        className={`relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${card.gradient} p-5 shadow-xl`}
      >
        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute right-4 top-4 rotate-12 rounded-lg border-2 border-cyan-400 bg-cyan-400/20 px-3 py-1 text-sm font-black text-cyan-200"
            >
              ADD
            </motion.div>
            <motion.div
              style={{ opacity: skipOpacity }}
              className="absolute left-4 top-4 -rotate-12 rounded-lg border-2 border-red-400 bg-red-500/20 px-3 py-1 text-sm font-black text-red-200"
            >
              SKIP
            </motion.div>
          </>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur">
          <MapPin size={11} /> {card.location}
        </span>
        <div className="mt-32">
          <span className="rounded-full border border-cyan-400/40 bg-cyan-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-200">
            {card.vibe}
          </span>
          <h3 className="mt-3 text-[24px] font-bold leading-tight text-white">{card.title}</h3>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-white/80">
            <Quote size={12} className="mt-0.5 flex-shrink-0 text-cyan-300" />
            {card.note}
          </div>
        </div>
        <div className="absolute inset-x-5 bottom-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 backdrop-blur">
          <span className="text-[11px] uppercase tracking-wider text-white/50">Vendor</span>
          <span className="text-[16px] font-bold text-emerald-300">
            +₹{card.price.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
