import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Compass,
  Sparkles,
  Route as RouteIcon,
  Shield,
  Search,
  MapPin,
  Sun,
  WifiOff,
  Languages,
  Volume2,
  Play,
  Mountain,
  Filter,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NORTHNEST — Northeast India, Unfiltered" },
      {
        name: "description",
        content:
          "Discover, plan and navigate Northeast India with true-cost pricing, offline permit wallet and immersive POV previews.",
      },
      { property: "og:title", content: "NORTHNEST — Northeast India, Unfiltered" },
      {
        property: "og:description",
        content:
          "Discover, plan and navigate Northeast India with true-cost pricing, offline permit wallet and immersive POV previews.",
      },
    ],
  }),
  component: Index,
});

type ViewId = "explore" | "build" | "routes" | "nest";

function Index() {
  const [view, setView] = useState<ViewId>("explore");

  return (
    <div
      className="flex min-h-[100dvh] w-full items-stretch justify-center bg-neutral-950 font-sans md:items-center md:p-6 lg:p-10"
      style={{
        backgroundImage:
          "radial-gradient(1200px 600px at 15% -10%, rgba(0,140,255,0.15), transparent 60%), radial-gradient(900px 500px at 110% 20%, rgba(255,56,92,0.15), transparent 60%)",
      }}
    >
      {/* Optional desktop side info */}
      <aside className="hidden xl:mr-10 xl:flex xl:w-[320px] xl:flex-col xl:justify-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">NORTHNEST</p>
        <h2
          className="mt-3 text-4xl font-bold leading-tight text-white"
          style={{ fontFamily: '"SF Pro Display", -apple-system, sans-serif' }}
        >
          Northeast India,
          <br />
          <span style={{ color: "#FF385C" }}>unfiltered.</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/60">
          A mobile-first companion for eight states — true-cost pricing, offline permit wallet,
          immersive POV previews, and an SOS net that works past the last cell tower.
        </p>
      </aside>

      <div
        className="relative w-full overflow-hidden bg-black shadow-[0_24px_80px_rgba(0,0,0,0.8)] md:w-[420px] md:rounded-[44px] md:border-[6px] md:border-neutral-800 lg:w-[440px]"
        style={{
          height: "100dvh",
          maxHeight: "100dvh",
        }}
      >
        <div className="absolute inset-0 overflow-y-auto pb-[120px] text-white">
          {view === "explore" && <ExploreView />}
          {view === "build" && <BuildView />}
          {view === "routes" && <RoutesView />}
          {view === "nest" && <NestView />}
        </div>

        <DockNav view={view} setView={setView} />
      </div>

      <aside className="hidden xl:ml-10 xl:flex xl:w-[280px] xl:flex-col xl:justify-center xl:gap-4">
        <DesktopInfoCard
          title="Live true-cost"
          body="Prices already include Inner Line Permits, state entry fees and local guide floors."
        />
        <DesktopInfoCard
          title="Works past signal"
          body="Cache maps, permits and QR codes to device storage before you cross into a deadzone."
        />
        <DesktopInfoCard
          title="Echo SOS"
          body="Swipe-to-broadcast pushes your coordinates to the nearest ground team."
        />
      </aside>
    </div>
  );
}

function DesktopInfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="rounded-2xl border p-4 text-white"
      style={{
        background: "rgba(255,255,255,0.04)",
        borderColor: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
      }}
    >
      <p className="text-[13px] font-semibold">{title}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-white/60">{body}</p>
    </div>
  );
}


/* ============ DOCK NAV ============ */

function DockNav({ view, setView }: { view: ViewId; setView: (v: ViewId) => void }) {
  const tabs: { id: ViewId; label: string; icon: typeof Compass }[] = [
    { id: "explore", label: "Explore", icon: Compass },
    { id: "build", label: "Build", icon: Sparkles },
    { id: "routes", label: "Routes", icon: RouteIcon },
    { id: "nest", label: "My Nest", icon: Shield },
  ];
  return (
    <nav
      className="absolute bottom-6 left-4 right-4 z-50 flex h-[76px] items-center justify-around rounded-[38px] border px-2"
      style={{
        background: "rgba(26,26,26,0.7)",
        backdropFilter: "blur(30px) saturate(210%)",
        borderColor: "rgba(255,255,255,0.1)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
      }}
    >
      {tabs.map((t) => {
        const active = t.id === view;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className="flex flex-col items-center gap-1 px-3 py-2 transition-colors"
            style={{ color: active ? "#008CFF" : "rgba(255,255,255,0.45)" }}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            <span className="text-[11px] font-semibold">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ============ VIEW 1: EXPLORE ============ */

const searchPrompts = [
  "Search 'Living Root Bridges'…",
  "Search 'Hornbill Festival'…",
  "Search 'Dzukou Valley trek'…",
  "Search 'Majuli river island'…",
];

function ExploreView() {
  const [promptIdx, setPromptIdx] = useState(0);
  const [trueCost, setTrueCost] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setPromptIdx((i) => (i + 1) % searchPrompts.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      {/* HERO */}
      <div className="relative" style={{ height: 400 }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 60%, #000 100%), url('https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800') center/cover",
          }}
        />
        <div className="absolute left-5 right-5 top-16">
          <p
            className="text-[13px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: "#FF385C", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
          >
            Northeast India
          </p>
          <h1
            className="mt-2 text-[32px] font-bold leading-[1.05]"
            style={{
              fontFamily: '"SF Pro Display", -apple-system, sans-serif',
              textShadow: "0 4px 24px rgba(0,0,0,0.7)",
            }}
          >
            Eight states.
            <br />
            One unfiltered nest.
          </h1>
        </div>

        {/* Sticky search matrix */}
        <div
          className="absolute left-4 right-4 flex items-center gap-3 rounded-full border px-5 py-3.5"
          style={{
            top: 320,
            background: "rgba(26,26,26,0.55)",
            backdropFilter: "blur(24px) saturate(180%)",
            borderColor: "rgba(255,255,255,0.15)",
          }}
        >
          <Search size={18} className="shrink-0 opacity-80" />
          <span
            key={promptIdx}
            className="flex-1 truncate text-[14px] text-white/80"
            style={{ animation: "fadeSlide 0.4s ease-out" }}
          >
            {searchPrompts[promptIdx]}
          </span>
          <Filter size={16} className="opacity-70" />
        </div>
      </div>

      {/* TRUE-COST TOGGLE */}
      <div className="mx-4 -mt-2 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
        <div className="pr-3">
          <p className="text-[13px] font-semibold leading-tight">Show Ultimate Net Prices</p>
          <p className="text-[11px] text-white/50">All permits &amp; local taxes included</p>
        </div>
        <button
          onClick={() => setTrueCost((t) => !t)}
          className="relative h-[28px] w-[48px] shrink-0 rounded-full transition-colors"
          style={{ background: trueCost ? "#008CFF" : "rgba(255,255,255,0.15)" }}
        >
          <span
            className="absolute top-[2px] h-[24px] w-[24px] rounded-full bg-white shadow-md transition-all"
            style={{ left: trueCost ? 22 : 2 }}
          />
        </button>
      </div>

      {/* SECTION TITLE */}
      <div className="mt-6 flex items-end justify-between px-5">
        <div>
          <h2 className="text-[20px] font-bold">Traveler Lens</h2>
          <p className="text-[12px] text-white/50">Unfiltered clips. Long-press to peek.</p>
        </div>
        <span className="text-[12px] text-[#008CFF]">Live</span>
      </div>

      {/* TRAVELER LENS ROW */}
      <LensRow />

      {/* CURATED PICKS */}
      <div className="mt-6 px-5">
        <h2 className="text-[20px] font-bold">Curated for October</h2>
        <p className="text-[12px] text-white/50">Real prices. Real weather. Real permits.</p>
      </div>
      <div className="mt-3 space-y-3 px-4 pb-6">
        <PickCard
          title="Ziro Music Festival"
          state="Arunachal Pradesh"
          price="₹ 24,800"
          note="Inner Line Permit included"
          img="https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600"
        />
        <PickCard
          title="Tawang Monastery Circuit"
          state="Arunachal Pradesh"
          price="₹ 31,200"
          note="4×4 + altitude buffer day"
          img="https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600"
        />
        <PickCard
          title="Mawlynnong &amp; Root Bridges"
          state="Meghalaya"
          price="₹ 18,400"
          note="Village homestay chain"
          img="https://images.unsplash.com/photo-1571089336682-9f8d6c1671da?w=600"
        />
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function LensRow() {
  const clips = [
    { loc: "Dzukou Valley", alt: "2452 m · 12°C", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400" },
    { loc: "Loktak Lake", alt: "768 m · 24°C", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400" },
    { loc: "Nohkalikai Falls", alt: "1178 m · 19°C", img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400" },
    { loc: "Sela Pass", alt: "4170 m · -2°C", img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400" },
  ];
  const [held, setHeld] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = (i: number) => {
    timer.current = setTimeout(() => setHeld(i), 300);
  };
  const end = () => {
    if (timer.current) clearTimeout(timer.current);
    setHeld(null);
  };

  return (
    <div className="mt-3 flex gap-3 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: "none" }}>
      {clips.map((c, i) => (
        <div
          key={c.loc}
          onMouseDown={() => start(i)}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={() => start(i)}
          onTouchEnd={end}
          className="relative shrink-0 overflow-hidden rounded-2xl"
          style={{ width: 110, height: 160 }}
        >
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7)), url(${c.img}) center/cover` }}
          />
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-[11px] font-semibold leading-tight">{c.loc}</p>
          </div>
          {held === i && (
            <div
              className="absolute inset-1 flex flex-col justify-between rounded-xl border p-2 text-[10px]"
              style={{
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(16px) saturate(180%)",
                borderColor: "rgba(255,255,255,0.15)",
              }}
            >
              <div>
                <div className="flex items-center gap-1 text-white/80">
                  <MapPin size={10} /> {c.loc}
                </div>
                <div className="mt-1 text-white/60">{c.alt}</div>
              </div>
              <button
                className="rounded-lg border border-white/20 bg-white/10 py-1.5 text-[10px] font-semibold"
                style={{ backdropFilter: "blur(10px)" }}
              >
                Map into Journey
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PickCard({
  title,
  state,
  price,
  note,
  img,
}: {
  title: string;
  state: string;
  price: string;
  note: string;
  img: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2.5">
      <div
        className="h-20 w-20 shrink-0 rounded-xl bg-cover bg-center"
        style={{ backgroundImage: `url(${img})` }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{title}</p>
        <p className="text-[11px] text-white/50">{state}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[15px] font-bold" style={{ color: "#FF385C" }}>
            {price}
          </span>
          <span className="text-[10px] text-white/50">· {note}</span>
        </div>
      </div>
      <ChevronRight size={18} className="opacity-40" />
    </div>
  );
}

/* ============ VIEW 2: BUILD ============ */

function BuildView() {
  const [pace, setPace] = useState(30);
  const [vibe, setVibe] = useState(70);
  const [days, setDays] = useState(50);

  const dayCount = Math.round(3 + (days / 100) * 11);
  const price = Math.round(8000 + (pace * 120) + (vibe * 180) + dayCount * 2200);

  const bgHue = 200 - (vibe / 100) * 160;

  return (
    <div className="relative min-h-full">
      {/* Dynamic backdrop */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-500"
        style={{
          background: `radial-gradient(120% 60% at 50% 0%, hsl(${bgHue}, 60%, 25%) 0%, #0a0a0a 60%)`,
        }}
      />
      <div className="relative">
        {/* Progress meter */}
        <div className="px-5 pt-14">
          <div className="flex items-center justify-between">
            <p className="text-[12px] uppercase tracking-widest text-white/50">Step 2 of 4</p>
            <p className="text-[12px] text-white/60">Mood &amp; Pace</p>
          </div>
          <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full" style={{ width: "50%", background: "#008CFF" }} />
          </div>
        </div>

        <div className="px-5 pt-6">
          <h1
            className="text-[26px] font-bold leading-tight"
            style={{ fontFamily: '"SF Pro Display", -apple-system, sans-serif' }}
          >
            Shape your nest.
          </h1>
          <p className="mt-1 text-[13px] text-white/60">
            Move the dials. The world rearranges to match.
          </p>
        </div>

        {/* Sliders */}
        <div className="mt-6 space-y-6 px-5">
          <SliderRow
            label="Pace"
            left="Cultural Leisure"
            right="Alpine Trekking"
            value={pace}
            onChange={setPace}
          />
          <SliderRow
            label="Vibe"
            left="Village Homestay"
            right="Premium Eco-Resort"
            value={vibe}
            onChange={setVibe}
          />
          <SliderRow
            label="Duration"
            left="3 days"
            right="14 days"
            value={days}
            onChange={setDays}
          />
        </div>

        {/* Preview stack */}
        <div className="mt-6 px-4">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div
              className="h-40 bg-cover bg-center transition-all"
              style={{
                backgroundImage:
                  vibe > 50
                    ? "url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600')"
                    : "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600')",
              }}
            />
            <div className="bg-white/[0.03] p-4">
              <p className="text-[13px] text-white/70">
                {vibe > 50 ? "Boutique eco-resorts, private guides" : "Homestay warmth, community meals"}
                {" · "}
                {pace > 50 ? "long trek days" : "slow-flow mornings"}
              </p>
            </div>
          </div>
        </div>

        {/* Live Basket */}
        <div className="fixed bottom-[120px] left-1/2 z-40 -translate-x-1/2" style={{ width: 358 }}>
          <div
            className="rounded-3xl border p-4"
            style={{
              background: "rgba(26,26,26,0.7)",
              backdropFilter: "blur(30px) saturate(200%)",
              borderColor: "rgba(255,255,255,0.12)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-white/50">Your nest</p>
                <p className="text-[15px] font-semibold">
                  {dayCount} days · 2 permits · Meghalaya + Nagaland
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/50">Total (net)</p>
                <p className="text-[20px] font-bold" style={{ color: "#FF385C" }}>
                  ₹ {price.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <button
              className="mt-3 w-full rounded-full py-3 text-[14px] font-semibold text-white"
              style={{ background: "#FF385C" }}
            >
              Lock this itinerary
            </button>
          </div>
        </div>

        <div className="h-64" />
      </div>
    </div>
  );
}

function SliderRow({
  label,
  left,
  right,
  value,
  onChange,
}: {
  label: string;
  left: string;
  right: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] uppercase tracking-wider text-white/50">{label}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="glass-slider w-full"
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-white/50">
        <span>{left}</span>
        <span>{right}</span>
      </div>
      <style>{`
        .glass-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 999px;
          background: linear-gradient(90deg, #008CFF 0%, #008CFF ${value}%, rgba(255,255,255,0.12) ${value}%, rgba(255,255,255,0.12) 100%);
          outline: none;
        }
        .glass-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6));
          border: 1px solid rgba(255,255,255,0.4);
          box-shadow: 0 4px 14px rgba(0,140,255,0.4), inset 0 1px 0 rgba(255,255,255,0.6);
          cursor: grab;
        }
        .glass-slider::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255,255,255,0.85);
          border: 1px solid rgba(255,255,255,0.4);
          box-shadow: 0 4px 14px rgba(0,140,255,0.4);
        }
      `}</style>
    </div>
  );
}

/* ============ VIEW 3: ROUTES ============ */

function RoutesView() {
  const [dayIdx, setDayIdx] = useState(0);

  const days = [
    {
      day: "Day 3",
      title: "Dirang → Sela Pass → Tawang",
      dist: "142 km · 6h drive",
      dusk: "4:10 PM",
      arrive: "3:30 PM",
      deadzone: true,
      img: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=600",
    },
    {
      day: "Day 4",
      title: "Tawang Monastery · Bumla morning",
      dist: "34 km · acclimatize",
      dusk: "4:14 PM",
      arrive: "3:45 PM",
      deadzone: false,
      img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
    },
  ];

  const active = days[dayIdx];

  return (
    <div className="pt-12">
      <div className="px-5">
        <p className="text-[12px] uppercase tracking-widest text-white/50">Tactical dashboard</p>
        <h1 className="mt-1 text-[24px] font-bold">Arunachal Alpine Circuit</h1>
      </div>

      {/* Elevation map */}
      <div className="mx-4 mt-4 overflow-hidden rounded-3xl border border-white/10">
        <div
          className="relative h-56"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600') center/cover",
          }}
        >
          <ElevationChart />
          <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[11px] backdrop-blur">
            <Mountain size={11} className="mr-1 inline" /> 4170 m peak
          </div>
        </div>
      </div>

      {/* Day cards */}
      <div className="mt-5 flex gap-3 overflow-x-auto px-4 pb-2" style={{ scrollSnapType: "x mandatory" }}>
        {days.map((d, i) => (
          <button
            key={d.day}
            onClick={() => setDayIdx(i)}
            className="shrink-0 overflow-hidden rounded-3xl border text-left"
            style={{
              width: 340,
              scrollSnapAlign: "center",
              background: i === dayIdx ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
              borderColor: i === dayIdx ? "rgba(0,140,255,0.4)" : "rgba(255,255,255,0.08)",
            }}
          >
            <div className="relative p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-[#008CFF]">{d.day}</p>
                  <p className="mt-1 text-[16px] font-semibold leading-snug">{d.title}</p>
                  <p className="text-[12px] text-white/60">{d.dist}</p>
                </div>
                <DaylightRing arrive={d.arrive} />
              </div>
            </div>
            <div className="border-t border-white/5 p-4">
              <div className="flex items-start gap-2 text-[11px] text-amber-300/90">
                <Sun size={14} className="mt-0.5 shrink-0" />
                <span>
                  Daylight Limit: dusk begins at {d.dusk}. Plan arrival before {d.arrive}.
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Deadzone alert */}
      {active.deadzone && (
        <div className="mx-4 mt-4 overflow-hidden rounded-3xl border border-amber-500/30 bg-amber-500/[0.08] p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-500/20">
              <WifiOff size={18} className="text-amber-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-amber-100">Zero-Signal Zone Ahead</p>
              <p className="text-[12px] text-amber-100/70">
                Cache maps &amp; permit QR codes before the pass.
              </p>
              <OfflineDownloader />
            </div>
          </div>
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}

function ElevationChart() {
  // Simple SVG elevation profile
  return (
    <svg viewBox="0 0 340 90" className="absolute bottom-0 left-0 right-0 h-24 w-full">
      <defs>
        <linearGradient id="elev" x1="0" x2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="55%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <path
        d="M0 70 L40 60 L80 55 L120 40 L170 20 L210 15 L260 30 L300 45 L340 55 L340 90 L0 90 Z"
        fill="url(#elev)"
        opacity="0.35"
      />
      <path
        d="M0 70 L40 60 L80 55 L120 40 L170 20 L210 15 L260 30 L300 45 L340 55"
        fill="none"
        stroke="url(#elev)"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function DaylightRing({ arrive }: { arrive: string }) {
  return (
    <div className="relative h-14 w-14">
      <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
        <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3"
          strokeDasharray="100"
          strokeDashoffset="35"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Sun size={12} className="text-amber-300" />
        <span className="text-[9px] font-semibold text-white/80">{arrive}</span>
      </div>
    </div>
  );
}

function OfflineDownloader() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [pct, setPct] = useState(0);

  const start = () => {
    if (state !== "idle") return;
    setState("loading");
    setPct(0);
    const id = setInterval(() => {
      setPct((p) => {
        if (p >= 100) {
          clearInterval(id);
          setState("done");
          try {
            localStorage.setItem("northnest_offline_cache", JSON.stringify({ cached: true, at: Date.now() }));
          } catch {
            /* ignore */
          }
          return 100;
        }
        return p + 8;
      });
    }, 120);
  };

  return (
    <button
      onClick={start}
      disabled={state !== "idle"}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 py-2.5 text-[12px] font-semibold text-amber-100"
    >
      {state === "idle" && <>Cache offline pack</>}
      {state === "loading" && (
        <>
          <span
            className="inline-block h-4 w-4 rounded-full border-2 border-amber-200 border-t-transparent"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          Downloading {pct}%
        </>
      )}
      {state === "done" && <>✓ Cached to device</>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}

/* ============ VIEW 4: MY NEST ============ */

function NestView() {
  const [openPermit, setOpenPermit] = useState<string | null>(null);
  const [sosPct, setSosPct] = useState(0);
  const [sosArmed, setSosArmed] = useState(false);
  const dragRef = useRef<{ start: number; width: number } | null>(null);

  useEffect(() => {
    if (openPermit) {
      const prev = document.body.style.filter;
      document.body.style.filter = "brightness(1.15)";
      return () => {
        document.body.style.filter = prev;
      };
    }
  }, [openPermit]);

  const startSwipe = (e: React.PointerEvent) => {
    const track = e.currentTarget as HTMLElement;
    dragRef.current = { start: e.clientX, width: track.clientWidth - 56 };
    track.setPointerCapture(e.pointerId);
  };
  const moveSwipe = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.start;
    const pct = Math.max(0, Math.min(100, (dx / dragRef.current.width) * 100));
    setSosPct(pct);
    if (pct >= 98) {
      setSosArmed(true);
      dragRef.current = null;
    }
  };
  const endSwipe = () => {
    if (!sosArmed) setSosPct(0);
    dragRef.current = null;
  };

  const permits = [
    { code: "ILP-AR-0429", state: "Arunachal Pradesh", valid: "Valid until 14 Nov 2026" },
    { code: "ILP-NL-1123", state: "Nagaland", valid: "Valid until 20 Nov 2026" },
    { code: "PAP-SK-0912", state: "Sikkim (Protected Area)", valid: "Valid until 03 Nov 2026" },
  ];

  const phrases = [
    { lang: "Assamese", text: "Nomoskar" },
    { lang: "Khasi", text: "Khublei" },
    { lang: "Naga (Ao)", text: "Kwei" },
    { lang: "Mizo", text: "Chibai" },
    { lang: "Manipuri", text: "Khurumjari" },
    { lang: "Bodo", text: "Oi" },
    { lang: "Nyishi", text: "Aai Aai" },
    { lang: "Garo", text: "Namaste" },
  ];

  return (
    <div className="pt-12">
      <div className="px-5">
        <p className="text-[12px] uppercase tracking-widest text-white/50">My nest</p>
        <h1 className="mt-1 text-[24px] font-bold">Command hub</h1>
      </div>

      {/* Permit wallet */}
      <div className="mt-5 px-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[13px] font-semibold">Digital Checkgate Pass</p>
          <span className="text-[11px] text-white/50">{permits.length} active</span>
        </div>
        <div className="space-y-2">
          {permits.map((p) => (
            <button
              key={p.code}
              onClick={() => setOpenPermit(p.code)}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left"
            >
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold">{p.state}</p>
                <p className="text-[11px] text-white/50">
                  {p.code} · {p.valid}
                </p>
              </div>
              <div
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                style={{ background: "#008CFF" }}
              >
                <ChevronRight size={16} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Language matrix */}
      <div className="mt-6 px-5">
        <div className="mb-2 flex items-center gap-2">
          <Languages size={14} className="text-[#008CFF]" />
          <p className="text-[13px] font-semibold">Regional Language Matrix</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {phrases.map((p) => (
            <button
              key={p.lang}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left"
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold">{p.text}</p>
                <p className="text-[10px] text-white/50">{p.lang}</p>
              </div>
              <Volume2 size={14} className="opacity-70" />
            </button>
          ))}
        </div>
      </div>

      {/* SOS */}
      <div className="mt-6 px-4">
        <div
          className="overflow-hidden rounded-3xl border p-4"
          style={{
            background: sosArmed
              ? "linear-gradient(135deg, #7f1d1d, #FF385C)"
              : "linear-gradient(135deg, rgba(255,56,92,0.18), rgba(255,56,92,0.06))",
            borderColor: "rgba(255,56,92,0.4)",
          }}
        >
          <p className="text-[13px] font-semibold text-white">
            {sosArmed ? "SOS broadcast active" : "Echo SOS Safety Net"}
          </p>
          <p className="mt-0.5 text-[11px] text-white/70">
            {sosArmed
              ? "Coordinates transmitting to nearest ground team over low-bandwidth."
              : "Swipe fully to broadcast your location to the nearest ground team."}
          </p>
          <div
            onPointerDown={sosArmed ? undefined : startSwipe}
            onPointerMove={sosArmed ? undefined : moveSwipe}
            onPointerUp={endSwipe}
            className="relative mt-3 h-14 select-none overflow-hidden rounded-full border border-white/20"
            style={{ background: "rgba(0,0,0,0.35)", touchAction: "none" }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `calc(${sosPct}% + 56px)`,
                background: "linear-gradient(90deg, rgba(255,56,92,0.4), rgba(255,56,92,0.8))",
                transition: dragRef.current ? "none" : "width 0.3s ease",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold uppercase tracking-[0.25em] text-white/70">
              {sosArmed ? "Broadcasting" : "Swipe to send SOS"}
            </div>
            <div
              className="absolute top-1 grid h-12 w-12 place-items-center rounded-full bg-white text-[#FF385C] shadow-lg"
              style={{
                left: `calc(${sosPct}% + 4px)`,
                transition: dragRef.current ? "none" : "left 0.3s ease",
              }}
            >
              <Shield size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="h-8" />

      {/* Permit modal */}
      {openPermit && (
        <div
          className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-white p-6 text-black"
          onClick={() => setOpenPermit(null)}
        >
          <p className="text-[11px] uppercase tracking-widest text-black/50">Present at checkgate</p>
          <p className="mt-2 text-[18px] font-bold">{openPermit}</p>
          <div className="mt-6 grid h-56 w-56 place-items-center rounded-2xl border-2 border-black bg-white">
            <QRPlaceholder />
          </div>
          <p className="mt-6 text-[12px] text-black/60">Tap anywhere to close · brightness maxed</p>
        </div>
      )}
    </div>
  );
}

function QRPlaceholder() {
  // deterministic pseudo-QR
  const cells = Array.from({ length: 21 * 21 }, (_, i) => (i * 7919) % 3 === 0);
  return (
    <div className="grid h-48 w-48" style={{ gridTemplateColumns: "repeat(21, 1fr)" }}>
      {cells.map((on, i) => (
        <div key={i} style={{ background: on ? "#000" : "transparent" }} />
      ))}
    </div>
  );
}
