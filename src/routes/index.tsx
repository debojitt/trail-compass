import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Home,
  Plane,
  TrainFront,
  CarFront,
  Package,
  FileCheck,
  Search,
  ArrowLeftRight,
  Minus,
  Plus,
  Star,
  Heart,
  MapPin,
  ShieldCheck,
  WifiOff,
  Wallet,
  Compass,
  ChevronDown,
  ChevronRight,
  BadgePercent,
  Quote,
  Menu,
} from "lucide-react";
import { destinations } from "@/data/destinations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NORTHNEST — Travel Northeast India" },
      {
        name: "description",
        content:
          "Book homestays, flights, trains, cabs and permit-ready packages across the eight states of Northeast India.",
      },
      { property: "og:title", content: "NORTHNEST — Travel Northeast India" },
      {
        property: "og:description",
        content:
          "Book homestays, flights, trains, cabs and permit-ready packages across the eight states of Northeast India.",
      },
    ],
    links: [
      /* hero assets fetched immediately so the sunrise never pops in late */
      { rel: "preload", as: "image", href: "/elements/mountains.png" },
      { rel: "preload", as: "image", href: "/elements/real-sunrise.png" },
      { rel: "preload", as: "image", href: "/elements/cloud-1.png" },
      { rel: "preload", as: "image", href: "/elements/cloud-2.png" },
    ],
  }),
  component: Index,
});

/* Brand palette */
const RED = "#E23744";
const RED_DARK = "#C5303C";
const GREEN = "#24963F";
const GREEN_LIGHT = "#E8F5EC";

/* Real sunrise photo — fills the see-through hero letters */
const SUNRISE_IMG = "/elements/real-sunrise.png";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function Index() {
  /* p: 0 → 1 sunrise progress. Tracks the scroll position almost 1:1 —
     a light chase factor keeps it buttery without ever feeling laggy. */
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    let current = clamp01(window.scrollY / (window.innerHeight * 1.6));
    let target = current;
    const onScroll = () => {
      target = clamp01(window.scrollY / (window.innerHeight * 1.6));
    };
    const tick = () => {
      current += (target - current) * 0.22;
      if (Math.abs(target - current) < 0.0004) current = target;
      setP(current);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 antialiased">
      <ScrollProgress />
      <TopNav solid={p > 0.85} />
      <SunriseHero p={p} />

      {/* Content emerges as the sky fades away */}
      <main className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-6">
        <SearchHub />
        <OffersRow />
        <Statement />
        <StatesGrid />
        <CultureStrip />
        <PackagesSection />
        <FeatureStrip />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

/* ============ MOTION PRIMITIVES (tile.pt-style) ============ */

/* Page-wide scroll progress bar — mapped 1:1 to scroll position */
function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div
        ref={ref}
        className="h-full w-full origin-left"
        style={{ background: `linear-gradient(90deg, ${RED}, ${GREEN})`, transform: "scaleX(0)" }}
      />
    </div>
  );
}

/* Scroll-triggered rise reveal */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`nn-reveal ${inView ? "nn-in" : ""} ${className}`}
      style={{ "--nn-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/* Letter-by-letter heading reveal */
function SplitHead({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = text.split(" ");
  let letterIndex = 0;
  return (
    <span ref={ref} className={`${inView ? "nn-in" : ""} ${className}`} aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {word.split("").map((ch, ci) => {
            const d = letterIndex++ * 22;
            return (
              <span
                key={ci}
                aria-hidden
                className="nn-letter"
                style={{ "--nn-delay": `${d}ms` } as React.CSSProperties}
              >
                {ch}
              </span>
            );
          })}
          {wi < words.length - 1 && <span aria-hidden>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}

/* Infinite outlined marquee title */
function Marquee({ text, duration = 30 }: { text: string; duration?: number }) {
  const items = Array.from({ length: 8 }, (_, i) => i);
  return (
    <div aria-hidden className="pointer-events-none -mx-4 select-none overflow-hidden md:-mx-6">
      <div className="nn-marquee-track" style={{ "--nn-marquee-dur": `${duration}s` } as React.CSSProperties}>
        {items.map((i) => (
          <span
            key={i}
            className="whitespace-nowrap px-5 text-[56px] font-bold uppercase leading-none tracking-tight md:text-[96px]"
            style={{
              color: "transparent",
              WebkitTextStroke: "1.5px rgba(0,0,0,0.12)",
            }}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

/* See-through text — the real sunrise photo shows through the letters */
function Knockout({ text }: { text: string }) {
  return (
    <span className="relative inline-block align-baseline">
      <span className="nn-knockout" style={{ backgroundImage: `url(${SUNRISE_IMG})` }}>
        {text}
      </span>
      {/* soft edge pass so the glass letters read against the dawn sky */}
      <span aria-hidden className="absolute inset-0 select-none" style={{ color: "rgba(40,12,8,0.18)" }}>
        {text}
      </span>
    </span>
  );
}

/* ============ TOP NAV (Apple-style translucent) ============ */

function TopNav({ solid }: { solid: boolean }) {
  const links: { label: string; explore?: boolean }[] = [
    { label: "Explore", explore: true },
    { label: "Stays" },
    { label: "Flights" },
    { label: "Packages" },
    { label: "Permits" },
    { label: "Offers" },
  ];
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
      style={{
        background: solid ? "rgba(255,255,255,0.8)" : "transparent",
        backdropFilter: solid ? "blur(20px) saturate(180%)" : "none",
        borderBottom: solid ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 md:px-6">
        <a href="/" className="flex items-center gap-2">
          <img
            src="/elements/northnest-logo.png"
            alt="northnest"
            className="h-8 w-8 rounded-full object-cover shadow-sm"
            draggable={false}
          />
          <span
            className="text-[17px] font-bold tracking-tight transition-colors duration-500"
            style={{ color: solid ? RED : "#fff" }}
          >
            NORTHNEST
          </span>
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) =>
            l.explore ? (
              <Link
                key={l.label}
                to="/explore/$slug"
                params={{ slug: "meghalaya" }}
                className="nn-link text-[13px] font-medium transition-colors duration-500"
                style={{ color: solid ? "#374151" : "rgba(255,255,255,0.9)" }}
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.label}
                href="#"
                className="nn-link text-[13px] font-medium transition-colors duration-500"
                style={{ color: solid ? "#374151" : "rgba(255,255,255,0.9)" }}
              >
                {l.label}
              </a>
            ),
          )}
        </nav>
        <div className="flex items-center gap-3">
          <button
            className="rounded-full px-4 py-1.5 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03]"
            style={{ background: RED }}
          >
            Sign in
          </button>
          <Menu
            size={20}
            className="md:hidden"
            style={{ color: solid ? "#374151" : "#fff" }}
          />
        </div>
      </div>
    </header>
  );
}

/* ============ SUNRISE HERO (scroll-driven) ============ */

function SunriseHero({ p }: { p: number }) {
  /* sun rises from below the hills to high in the sky */
  const sunBottom = lerp(-12, 58, p);
  const sunScale = lerp(1, 1.35, p);
  /* clouds drift apart and thin out */
  const cloudShift = p * 260;
  const cloudFade = 1 - clamp01((p - 0.45) / 0.45);
  /* the whole scene dissolves to white at the end */
  const whiteOut = clamp01((p - 0.72) / 0.28);
  const titleFade = 1 - clamp01(p / 0.5);

  return (
    <section className="relative h-[260vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Night → dawn sky (fades out) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #201c45 0%, #4a2b63 38%, #b0486b 62%, #ff8e56 82%, #ffc98f 100%)",
            opacity: 1 - p,
          }}
        />
        {/* Morning sky (fades in) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #9fd4ff 0%, #d4ecff 55%, #ffffff 100%)",
            opacity: p,
          }}
        />

        {/* Stars, only pre-dawn */}
        <div
          className="absolute inset-x-0 top-0 h-1/2"
          style={{
            opacity: Math.max(0, 1 - p * 2.4),
            backgroundImage:
              "radial-gradient(1.5px 1.5px at 12% 22%, #fff, transparent), radial-gradient(1px 1px at 28% 12%, #fff, transparent), radial-gradient(1.5px 1.5px at 44% 30%, #fff, transparent), radial-gradient(1px 1px at 61% 15%, #fff, transparent), radial-gradient(1.5px 1.5px at 76% 25%, #fff, transparent), radial-gradient(1px 1px at 89% 10%, #fff, transparent), radial-gradient(1px 1px at 52% 8%, #fff, transparent)",
          }}
        />

        {/* Sun */}
        <div
          className="absolute left-1/2 h-40 w-40 -translate-x-1/2 rounded-full md:h-56 md:w-56"
          style={{
            bottom: `${sunBottom}%`,
            transform: `translateX(-50%) scale(${sunScale})`,
            background: `radial-gradient(circle, ${p > 0.5 ? "#fff6d8" : "#ffd27a"} 0%, ${p > 0.5 ? "#ffe08a" : "#ff9e4d"} 55%, transparent 72%)`,
            filter: "blur(2px)",
            boxShadow: `0 0 ${lerp(80, 180, p)}px ${lerp(40, 90, p)}px rgba(255, ${Math.round(lerp(150, 210, p))}, 110, 0.35)`,
          }}
        />

        {/* Realistic mountain range — rises slightly and dissolves with the scene */}
        <img
          src="/elements/mountains.png"
          alt=""
          draggable={false}
          className="absolute bottom-[-6%] left-1/2 w-[160%] max-w-none -translate-x-1/2 select-none md:w-[110%]"
          style={{
            transform: `translateX(-50%) translateY(${p * 40}px)`,
            mixBlendMode: "multiply",
            willChange: "transform, opacity, filter",
            opacity: lerp(0.85, 1, p) * (1 - whiteOut),
            filter: `brightness(${lerp(0.88, 1.02, p)}) saturate(${lerp(0.75, 1, p)})`,
            maskImage:
              "linear-gradient(180deg, transparent 0%, black 22%, black 82%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(180deg, transparent 0%, black 22%, black 82%, transparent 100%)",
          }}
        />

        {/* Realistic clouds (transparent PNGs) — drift apart as the sun rises */}
        <Cloud
          src="/elements/cloud-1.png"
          style={{ top: "20%", left: "-4%", width: "46%", transform: `translateX(${-cloudShift}px)`, opacity: 0.95 * cloudFade }}
        />
        <Cloud
          src="/elements/cloud-1.png"
          style={{ top: "10%", right: "-6%", width: "52%", transform: `translateX(${cloudShift}px) scaleX(-1)`, opacity: 0.85 * cloudFade }}
        />
        <Cloud
          src="/elements/cloud-2.png"
          style={{ top: "40%", left: "12%", width: "42%", transform: `translateX(${-cloudShift * 1.6}px)`, opacity: 0.8 * cloudFade }}
        />
        <Cloud
          src="/elements/cloud-2.png"
          style={{ top: "32%", right: "14%", width: "38%", transform: `translateX(${cloudShift * 1.4}px) scaleX(-1)`, opacity: 0.8 * cloudFade }}
        />
        <Cloud
          src="/elements/cloud-1.png"
          style={{ bottom: "8%", left: "28%", width: "58%", transform: `translateX(${cloudShift * 0.7}px)`, opacity: 0.7 * cloudFade }}
        />
        {/* Low mist hugging the mountains */}
        <Cloud
          src="/elements/cloud-2.png"
          style={{ bottom: "0%", left: "-8%", width: "70%", transform: `translateX(${-cloudShift * 0.4}px)`, opacity: 0.9 * cloudFade }}
        />

        {/* Hero copy — the big words are glass: a real sunrise burns through them */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          style={{ opacity: titleFade, transform: `translateY(${p * -80}px)`, willChange: "opacity, transform" }}
        >
          <p
            className="nn-hero-line text-[12px] font-semibold uppercase tracking-[0.35em] text-white/80"
            style={{ "--nn-delay": "150ms" } as React.CSSProperties}
          >
            Northeast India
          </p>
          <h1 className="mt-5 max-w-[900px] select-none text-[13vw] font-extrabold uppercase leading-[1.02] tracking-[0.04em] text-white md:text-[88px]">
            <span className="nn-hero-line block" style={{ "--nn-delay": "350ms" } as React.CSSProperties}>
              <span style={{ textShadow: "0 6px 40px rgba(0,0,0,0.35)" }}>FIRST&nbsp;</span>
              <Knockout text="SUNRISE" />
            </span>
            <span className="nn-hero-line block" style={{ "--nn-delay": "550ms" } as React.CSSProperties}>
              <Knockout text="OF INDIA" />
            </span>
          </h1>
          <p
            className="nn-hero-line mt-6 max-w-[520px] text-[15px] leading-relaxed text-white/80 md:text-[17px]"
            style={{ "--nn-delay": "800ms" } as React.CSSProperties}
          >
            Eight sister states. A hundred living cultures.
            Homestays, festivals, permits and journeys — one nest.
          </p>
        </div>

        {/* Scroll hint */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
          style={{ opacity: Math.max(0, 1 - p * 6) }}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/70">
            Scroll for sunrise
          </p>
          <ChevronDown size={18} className="mx-auto mt-1 animate-bounce text-white/70" />
        </div>

        {/* Final dissolve to white — the background "removes itself" */}
        <div className="absolute inset-0 bg-white" style={{ opacity: whiteOut, pointerEvents: "none" }} />
      </div>
    </section>
  );
}

function Cloud({ src, style }: { src: string; style: React.CSSProperties }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      decoding="async"
      className="pointer-events-none absolute max-w-none select-none"
      style={{ ...style, willChange: "transform, opacity" }}
    />
  );
}

/* ============ SEARCH HUB (MakeMyTrip-style) ============ */

type TabId = "stays" | "flights" | "trains" | "cabs" | "packages" | "permits";

const tabs: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "stays", label: "Homestays", icon: Home },
  { id: "flights", label: "Flights", icon: Plane },
  { id: "trains", label: "Trains", icon: TrainFront },
  { id: "cabs", label: "Cabs", icon: CarFront },
  { id: "packages", label: "Packages", icon: Package },
  { id: "permits", label: "Permits", icon: FileCheck },
];

const tabConfig: Record<
  TabId,
  { from: string; fromV: string; to: string; toV: string; cta: string }
> = {
  stays: { from: "Destination", fromV: "Shillong, Meghalaya", to: "Property type", toV: "Homestay · Eco-resort", cta: "Search Homestays" },
  flights: { from: "From", fromV: "Kolkata (CCU)", to: "To", toV: "Guwahati (GAU)", cta: "Search Flights" },
  trains: { from: "From", fromV: "Guwahati (GHY)", to: "To", toV: "Naharlagun (NHLN)", cta: "Search Trains" },
  cabs: { from: "Pickup", fromV: "Guwahati Airport", to: "Drop", toV: "Kaziranga National Park", cta: "Search Cabs" },
  packages: { from: "Starting city", fromV: "Guwahati", to: "Circuit", toV: "Meghalaya + Arunachal", cta: "Explore Packages" },
  permits: { from: "Nationality", fromV: "Indian", to: "State permit", toV: "Arunachal Pradesh (ILP)", cta: "Apply for Permit" },
};

function SearchHub() {
  const [tab, setTab] = useState<TabId>("stays");
  const [swapped, setSwapped] = useState(false);
  const [showPax, setShowPax] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const cfg = tabConfig[tab];
  const swappable = tab === "flights" || tab === "trains" || tab === "cabs";
  const fromLabel = swapped && swappable ? cfg.to : cfg.from;
  const toLabel = swapped && swappable ? cfg.from : cfg.to;
  const fromValue = swapped && swappable ? cfg.toV : cfg.fromV;
  const toValue = swapped && swappable ? cfg.fromV : cfg.toV;

  return (
    <section className="relative -mt-[22vh] md:-mt-[26vh]">
      <div
        className="rounded-3xl border bg-white/90 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.12)] md:p-6"
        style={{ borderColor: "rgba(0,0,0,0.06)", backdropFilter: "blur(20px)" }}
      >
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {tabs.map((t) => {
            const active = t.id === tab;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setSwapped(false);
                }}
                className="flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all"
                style={{
                  background: active ? "rgba(226,55,68,0.08)" : "transparent",
                  color: active ? RED : "#6b7280",
                  boxShadow: active ? "inset 0 0 0 1.5px rgba(226,55,68,0.35)" : "none",
                }}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Fields */}
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr_1fr_1fr]">
          <Field label={fromLabel} value={fromValue} />
          <button
            onClick={() => setSwapped((s) => !s)}
            className="mx-auto grid h-10 w-10 shrink-0 place-items-center self-center rounded-full border bg-white text-neutral-500 shadow-sm transition-transform hover:scale-105"
            style={{
              borderColor: "rgba(0,0,0,0.1)",
              transform: swapped ? "rotate(180deg)" : "rotate(0deg)",
            }}
            aria-label="Swap"
          >
            <ArrowLeftRight size={15} />
          </button>
          <Field label={toLabel} value={toValue} />
          <Field label={tab === "permits" ? "Travel window" : "Dates"} value="12 Oct — 19 Oct" />

          {/* Travellers */}
          <div className="relative">
            <button
              onClick={() => setShowPax((s) => !s)}
              className="w-full rounded-2xl border px-4 py-3 text-left transition-colors hover:border-neutral-300"
              style={{ borderColor: "rgba(0,0,0,0.1)" }}
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                Travellers
              </p>
              <p className="mt-0.5 truncate text-[15px] font-semibold">
                {adults + children} traveller{adults + children !== 1 ? "s" : ""}
              </p>
            </button>
            {showPax && (
              <div
                className="absolute right-0 top-[calc(100%+8px)] z-30 w-64 rounded-2xl border bg-white p-4 shadow-xl"
                style={{ borderColor: "rgba(0,0,0,0.08)" }}
              >
                <PaxRow label="Adults" sub="12+ years" value={adults} setValue={setAdults} min={1} />
                <PaxRow label="Children" sub="2–12 years" value={children} setValue={setChildren} min={0} />
                <button
                  onClick={() => setShowPax(false)}
                  className="mt-3 w-full rounded-full py-2 text-[13px] font-semibold text-white"
                  style={{ background: GREEN }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4 flex justify-center">
          <button
            className="flex items-center gap-2 rounded-full px-12 py-3.5 text-[15px] font-bold text-white shadow-lg transition-all hover:scale-[1.02]"
            style={{ background: `linear-gradient(135deg, ${RED}, ${RED_DARK})`, boxShadow: "0 12px 30px rgba(226,55,68,0.35)" }}
          >
            <Search size={17} />
            {cfg.cta}
          </button>
        </div>
      </div>

      {/* Trust chips */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[12px] text-neutral-500">
        {["Permit-ready bookings", "True-cost pricing", "Free cancellation on most stays", "24×7 ground support"].map((c) => (
          <span
            key={c}
            className="rounded-full px-3 py-1 font-medium"
            style={{ background: GREEN_LIGHT, color: GREEN }}
          >
            ✓ {c}
          </span>
        ))}
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="cursor-pointer rounded-2xl border px-4 py-3 transition-colors hover:border-neutral-300"
      style={{ borderColor: "rgba(0,0,0,0.1)" }}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-0.5 truncate text-[15px] font-semibold">{value}</p>
    </div>
  );
}

function PaxRow({
  label,
  sub,
  value,
  setValue,
  min,
}: {
  label: string;
  sub: string;
  value: number;
  setValue: (n: number) => void;
  min: number;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-[14px] font-semibold">{label}</p>
        <p className="text-[11px] text-neutral-400">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setValue(Math.max(min, value - 1))}
          className="grid h-7 w-7 place-items-center rounded-full border text-neutral-500 hover:bg-neutral-50"
          style={{ borderColor: "rgba(0,0,0,0.15)" }}
        >
          <Minus size={13} />
        </button>
        <span className="w-4 text-center text-[14px] font-semibold">{value}</span>
        <button
          onClick={() => setValue(value + 1)}
          className="grid h-7 w-7 place-items-center rounded-full border hover:bg-neutral-50"
          style={{ borderColor: GREEN, color: GREEN }}
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

/* ============ OFFERS ============ */

function OffersRow() {
  const offers = [
    { tag: "FESTIVE", title: "Hornbill Festival Special", body: "Flat 18% off Nagaland circuits booked before 31 Oct.", code: "HORNBILL18" },
    { tag: "STAYS", title: "Homestay Week", body: "3rd night free at 200+ verified village homestays.", code: "NESTSTAY" },
    { tag: "FLIGHTS", title: "CCU → GAU from ₹2,499", body: "Morning departures, cabin bag included.", code: "FLYNE" },
    { tag: "PERMITS", title: "Zero-fee ILP filing", body: "We file your Inner Line Permit free with any package.", code: "AUTO" },
  ];
  return (
    <Section
      eyebrow="Offers"
      title="Deals worth flying for."
      action="View all offers"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {offers.map((o, i) => (
          <Reveal
            key={o.title}
            delay={i * 100}
            className="group rounded-3xl border bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center gap-2">
              <BadgePercent size={16} style={{ color: RED }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: RED }}>
                {o.tag}
              </span>
            </div>
            <p className="mt-3 text-[16px] font-bold leading-snug tracking-tight">{o.title}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">{o.body}</p>
            <div className="mt-4 flex items-center justify-between">
              <span
                className="rounded-lg border border-dashed px-2.5 py-1 text-[11px] font-bold tracking-wider"
                style={{ borderColor: GREEN, color: GREEN, background: GREEN_LIGHT }}
              >
                {o.code}
              </span>
              <ChevronRight size={16} className="text-neutral-300 transition-transform group-hover:translate-x-1" />
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ============ STATEMENT (scroll-linked word reveal) ============ */

function Statement() {
  const words = ["Eight", "states.", "A", "hundred", "tribes.", "One", "sunrise."];
  const ref = useRef<HTMLElement>(null);
  const [prog, setProg] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      /* progress mapped 1:1 to the section's travel through the viewport */
      setProg(clamp01((vh * 0.9 - r.top) / (vh * 0.62)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section ref={ref} className="py-16 md:py-24">
      <h2 className="mx-auto max-w-[880px] text-center text-[36px] font-bold leading-[1.12] tracking-tight md:text-[60px]">
        {words.map((w, i) => {
          const on = prog * words.length > i;
          return (
            <span
              key={i}
              className="mr-[0.28em] inline-block transition-all duration-300 last:mr-0"
              style={{
                opacity: on ? 1 : 0.12,
                transform: on ? "translateY(0)" : "translateY(10px)",
                color: on ? (i === 4 ? GREEN : i === 6 ? RED : undefined) : undefined,
              }}
            >
              {w}
            </span>
          );
        })}
      </h2>
      <Reveal delay={200}>
        <p className="mx-auto mt-6 max-w-[560px] text-center text-[14px] leading-relaxed text-neutral-500 md:text-[16px]">
          From Khasi root bridges grown over fifty years to Naga morungs where
          seventeen tribes gather every December — the Northeast is not a
          destination. It is a living culture that lets you in.
        </p>
      </Reveal>
    </section>
  );
}

/* ============ NORTHNEST CULTURE (horizontal, tile.pt project-strip style) ============ */

function CultureStrip() {
  const culture = [
    {
      name: "Hornbill Festival",
      place: "Kisama, Nagaland",
      note: "Seventeen tribes, one December. War dances, log drums and smoked-pork feasts.",
      img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=700",
      month: "DEC",
    },
    {
      name: "Bihu",
      place: "Assam",
      note: "The harvest heartbeat of the Brahmaputra valley — dhol, pepa and gamosa red.",
      img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=700",
      month: "APR",
    },
    {
      name: "Living Root Bridges",
      place: "Khasi Hills, Meghalaya",
      note: "Bridges grown, not built — ficus roots trained across rivers for 50 years.",
      img: "https://images.unsplash.com/photo-1571089336682-9f8d6c1671da?w=700",
      month: "ALL YEAR",
    },
    {
      name: "Cheraw Dance",
      place: "Mizoram",
      note: "Bamboo staves clap at ankle height while dancers step between the beats.",
      img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700",
      month: "MAR",
    },
    {
      name: "Sangai Festival",
      place: "Manipur",
      note: "Named for the dancing deer of Loktak — polo, Ras Leela and floating villages.",
      img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700",
      month: "NOV",
    },
    {
      name: "Losar at Tawang",
      place: "Arunachal Pradesh",
      note: "Monpa new year in India's largest monastery, 3,048 metres into the clouds.",
      img: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=700",
      month: "FEB",
    },
    {
      name: "Kharchi Puja",
      place: "Tripura",
      note: "Fourteen deities bathed in the Saidra river — a week of royal ritual.",
      img: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=700",
      month: "JUL",
    },
    {
      name: "Eri Silk & Bamboo",
      place: "Across the eight states",
      note: "Ahimsa silk spun without harm, and a craft culture built on bamboo.",
      img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=700",
      month: "CRAFT",
    },
  ];

  return (
    <section className="py-14 md:py-20">
      <div className="mb-6">
        <Marquee text="northnest culture ·" duration={26} />
      </div>
      <Reveal>
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.25em]" style={{ color: RED }}>
              The northnest culture
            </p>
            <h2 className="mt-2 text-[26px] font-bold leading-tight tracking-tight md:text-[36px]">
              <SplitHead text="Festivals, crafts and the people who keep them." />
            </h2>
          </div>
          <a
            href="#"
            className="nn-link hidden shrink-0 items-center gap-1 text-[13px] font-semibold md:flex"
            style={{ color: RED }}
          >
            Full culture calendar <ChevronRight size={15} />
          </a>
        </div>
      </Reveal>

      {/* Horizontal strip — drag/scroll sideways like tile.pt's project row */}
      <div
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:-mx-6 md:px-6"
        style={{ scrollbarWidth: "none" }}
      >
        {culture.map((c, i) => (
          <Reveal key={c.name} delay={Math.min(i, 3) * 110} className="snap-start">
            <a
              href="#"
              className="group relative block w-[240px] shrink-0 overflow-hidden rounded-3xl md:w-[300px]"
              style={{ aspectRatio: "3/4" }}
            >
              <img
                src={c.img}
                alt={c.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <span
                className="absolute left-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest text-white"
                style={{ background: GREEN }}
              >
                {c.month}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-[18px] font-bold tracking-tight text-white">{c.name}</p>
                <p className="text-[11px] font-medium" style={{ color: "#7fe39a" }}>
                  {c.place}
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-white/75 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  {c.note}
                </p>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ============ DESTINATIONS: 8 SISTER STATES ============ */

function StatesGrid() {
  return (
    <Section
      eyebrow="Destinations"
      title="Eight sisters. Pick your first."
      action="Open the map"
      actionExplore
      marquee="eight sisters ·"
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {destinations.map((s, i) => (
          <Reveal key={s.slug} delay={(i % 4) * 90}>
            <Link
              to="/explore/$slug"
              params={{ slug: s.slug }}
              className="group relative block overflow-hidden rounded-3xl"
              style={{ aspectRatio: "4/5" }}
            >
              <img
                src={s.heroImg}
                alt={s.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[16px] font-bold tracking-tight text-white">{s.name}</p>
                <p className="text-[11px] text-white/75">{s.tag}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                    style={{ background: GREEN }}
                  >
                    {s.stays}
                  </span>
                  <span className="inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                    360° look
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ============ PACKAGES ============ */

function PackagesSection() {
  const packages = [
    {
      title: "Meghalaya Monsoon Trail",
      days: "5D · 4N",
      rating: "4.8",
      reviews: "1.2k",
      oldPrice: "₹ 21,900",
      price: "₹ 18,400",
      perks: ["Homestay chain", "Root-bridge trek", "All permits filed"],
      img: "https://images.unsplash.com/photo-1571089336682-9f8d6c1671da?w=700",
    },
    {
      title: "Tawang Alpine Circuit",
      days: "7D · 6N",
      rating: "4.7",
      reviews: "860",
      oldPrice: "₹ 36,500",
      price: "₹ 31,200",
      perks: ["4×4 with driver", "ILP included", "Altitude buffer day"],
      img: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=700",
    },
    {
      title: "Ziro Music Festival",
      days: "4D · 3N",
      rating: "4.5",
      reviews: "2.1k",
      oldPrice: "₹ 28,900",
      price: "₹ 24,800",
      perks: ["Festival pass", "Camping + meals", "Shuttle from Naharlagun"],
      img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=700",
    },
  ];
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  return (
    <Section
      eyebrow="Curated packages"
      title="Everything included. Even the permits."
      action="All 46 packages"
      marquee="journeys ·"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {packages.map((pk, i) => (
          <Reveal
            key={pk.title}
            delay={i * 120}
            className="group overflow-hidden rounded-3xl border bg-white transition-all hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="relative" style={{ aspectRatio: "16/10" }}>
              <img
                src={pk.img}
                alt={pk.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <button
                onClick={() => setLiked((l) => ({ ...l, [pk.title]: !l[pk.title] }))}
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow backdrop-blur transition-transform hover:scale-110"
                aria-label="Save"
              >
                <Heart
                  size={16}
                  style={{
                    color: liked[pk.title] ? RED : "#9ca3af",
                    fill: liked[pk.title] ? RED : "none",
                  }}
                />
              </button>
              <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                {pk.days}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[16px] font-bold leading-snug tracking-tight">{pk.title}</p>
                <span
                  className="flex shrink-0 items-center gap-1 rounded-lg px-1.5 py-0.5 text-[11px] font-bold text-white"
                  style={{ background: GREEN }}
                >
                  {pk.rating} <Star size={9} fill="white" />
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-neutral-400">{pk.reviews} verified reviews</p>
              <ul className="mt-3 space-y-1">
                {pk.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-[12px] text-neutral-600">
                    <span className="h-1 w-1 rounded-full" style={{ background: GREEN }} />
                    {perk}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-neutral-400 line-through">{pk.oldPrice}</p>
                  <p className="text-[20px] font-bold tracking-tight" style={{ color: RED }}>
                    {pk.price}
                    <span className="ml-1 text-[11px] font-medium text-neutral-400">/ person</span>
                  </p>
                </div>
                <button
                  className="rounded-full px-5 py-2 text-[13px] font-bold text-white transition-transform hover:scale-105"
                  style={{ background: RED }}
                >
                  Book
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ============ WHY NORTHNEST ============ */

function FeatureStrip() {
  const feats = [
    { icon: FileCheck, title: "Permits, auto-filed", body: "ILP and Protected Area Permits filed digitally and cached as QR for checkgates." },
    { icon: Wallet, title: "True-cost pricing", body: "Every price includes permits, state fees and local guide floors. No checkout surprises." },
    { icon: WifiOff, title: "Works past signal", body: "Maps, vouchers and permits stay on-device through every deadzone." },
    { icon: ShieldCheck, title: "Echo SOS net", body: "One swipe broadcasts your location to the nearest ground team, even on low bandwidth." },
  ];
  return (
    <Section eyebrow="Why NORTHNEST" title="Built for the Northeast. Not adapted to it.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {feats.map((f, i) => {
          const Icon = f.icon;
          return (
            <Reveal key={f.title} delay={i * 100} className="rounded-3xl bg-neutral-50 p-6">
              <div
                className="grid h-11 w-11 place-items-center rounded-2xl"
                style={{ background: GREEN_LIGHT }}
              >
                <Icon size={20} style={{ color: GREEN }} />
              </div>
              <p className="mt-4 text-[15px] font-bold tracking-tight">{f.title}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">{f.body}</p>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* ============ TESTIMONIALS ============ */

function Testimonials() {
  const quotes = [
    { name: "Ananya S.", trip: "Meghalaya Monsoon Trail", text: "The permit QR worked at every checkgate even with zero signal. First trip where the price at checkout was the price I paid." },
    { name: "Rohit & Meera", trip: "Tawang Alpine Circuit", text: "The daylight planner rerouted us before Sela Pass fogged over. Felt like travelling with a local who never sleeps." },
    { name: "Daniel K.", trip: "Ziro Music Festival", text: "Booked flights, camp and festival pass in one flow. Smoother than any big travel app I've used." },
  ];
  return (
    <Section eyebrow="Travellers" title="Trusted on the hardest roads in India.">
      <div className="grid gap-4 md:grid-cols-3">
        {quotes.map((q, i) => (
          <Reveal key={q.name} delay={i * 120}>
            <figure
              className="h-full rounded-3xl border bg-white p-6"
              style={{ borderColor: "rgba(0,0,0,0.07)" }}
            >
              <Quote size={18} style={{ color: RED }} />
              <blockquote className="mt-3 text-[14px] leading-relaxed text-neutral-700">
                {q.text}
              </blockquote>
              <figcaption className="mt-4">
                <p className="text-[13px] font-bold">{q.name}</p>
                <p className="text-[11px]" style={{ color: GREEN }}>
                  ✓ Verified · {q.trip}
                </p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ============ SHARED SECTION SHELL ============ */

function Section({
  eyebrow,
  title,
  action,
  actionExplore,
  marquee,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: string;
  actionExplore?: boolean;
  marquee?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-14 md:py-20">
      {marquee && (
        <div className="mb-6">
          <Marquee text={marquee} />
        </div>
      )}
      <Reveal>
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.25em]" style={{ color: RED }}>
              {eyebrow}
            </p>
            <h2 className="mt-2 text-[26px] font-bold leading-tight tracking-tight md:text-[36px]">
              <SplitHead text={title} />
            </h2>
          </div>
          {action &&
            (actionExplore ? (
              <Link
                to="/explore/$slug"
                params={{ slug: "meghalaya" }}
                className="nn-link hidden shrink-0 items-center gap-1 text-[13px] font-semibold md:flex"
                style={{ color: RED }}
              >
                {action} <ChevronRight size={15} />
              </Link>
            ) : (
              <a
                href="#"
                className="nn-link hidden shrink-0 items-center gap-1 text-[13px] font-semibold md:flex"
                style={{ color: RED }}
              >
                {action} <ChevronRight size={15} />
              </a>
            ))}
        </div>
      </Reveal>
      {children}
    </section>
  );
}

/* ============ FOOTER ============ */

function Footer() {
  const cols = [
    { h: "Book", items: ["Homestays", "Flights", "Trains", "Cabs", "Packages"] },
    { h: "Permits", items: ["Inner Line Permit", "Protected Area Permit", "Checkgate map", "Document vault"] },
    { h: "States", items: ["Meghalaya", "Arunachal", "Sikkim", "Nagaland", "Assam"] },
    { h: "Company", items: ["About", "Ground teams", "Careers", "Support 24×7"] },
  ];
  return (
    <footer className="relative z-10 mt-10 border-t bg-neutral-50" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] md:px-6">
        <div>
          <div className="flex items-center gap-2">
            <img
              src="/elements/northnest-logo.png"
              alt="northnest"
              className="h-9 w-9 rounded-full object-cover"
              draggable={false}
            />
            <p className="text-[17px] font-bold tracking-tight" style={{ color: RED }}>
              NORTHNEST
            </p>
          </div>
          <p className="mt-3 max-w-[260px] text-[13px] leading-relaxed text-neutral-500">
            The travel platform built for the eight sister states of Northeast India.
          </p>
          <div className="mt-4 flex items-center gap-2 text-[12px] font-semibold" style={{ color: GREEN }}>
            <Compass size={14} /> Guwahati · Shillong · Itanagar
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <p className="text-[12px] font-bold uppercase tracking-wider text-neutral-400">{c.h}</p>
            <ul className="mt-3 space-y-2">
              {c.items.map((i) => (
                <li key={i}>
                  <a href="#" className="nn-link text-[13px] text-neutral-600 hover:text-neutral-900">
                    {i}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t py-5 text-center text-[12px] text-neutral-400" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        © 2026 NORTHNEST · Northeast India, unfiltered.
        <MapPin size={12} className="ml-1 inline" style={{ color: RED }} />
      </div>
    </footer>
  );
}
