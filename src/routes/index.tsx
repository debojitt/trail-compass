import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  BadgePercent,
  Quote,
  Menu,
  Play,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "northnest — Northeast India Escapes" },
      {
        name: "description",
        content:
          "Book homestays, flights, trains, cabs and permit-ready packages across the eight states of Northeast India.",
      },
      { property: "og:title", content: "northnest — Northeast India Escapes" },
      {
        property: "og:description",
        content:
          "Book homestays, flights, trains, cabs and permit-ready packages across the eight states of Northeast India.",
      },
    ],
    links: [
      /* hero assets fetched immediately so the valley never pops in late */
      { rel: "preload", as: "image", href: "/elements/green-valley-hero.png" },
      { rel: "preload", as: "image", href: "/elements/cloud-1.png" },
      { rel: "preload", as: "image", href: "/elements/cloud-2.png" },
    ],
  }),
  component: Index,
});

/* Brand palette — pulled from the northnest logo (deep forest on cream) */
const FOREST = "#2E4B34";
const FOREST_DARK = "#223928";
const OLIVE = "#7E9F1F";
const OLIVE_DARK = "#69851A";
const CREAM = "#EAE4D2";
const GREEN_LIGHT = "#EFF4E0";

const HERO_IMG = "/elements/green-valley-hero.png";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function Index() {
  /* p: 0 → 1 hero progress. Tracks the scroll position almost 1:1 —
     a light chase factor keeps it buttery without ever feeling laggy. */
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    let current = clamp01(window.scrollY / (window.innerHeight * 1.15));
    let target = current;
    const onScroll = () => {
      target = clamp01(window.scrollY / (window.innerHeight * 1.15));
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
      <TopNav solid={p > 0.9} />
      <ValleyHero p={p} />

      {/* Content emerges as the valley fades away */}
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

/* ============ MOTION PRIMITIVES ============ */

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
        style={{ background: `linear-gradient(90deg, ${OLIVE}, ${FOREST})`, transform: "scaleX(0)" }}
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
              WebkitTextStroke: "1.5px rgba(46,75,52,0.16)",
            }}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

/* See-through text — the hero valley shows through the letters */
function Knockout({ text }: { text: string }) {
  return (
    <span className="relative inline-block align-baseline">
      <span className="nn-knockout" style={{ backgroundImage: `url(${HERO_IMG})` }}>
        {text}
      </span>
      {/* darkening pass so the glass letters read against the mist */}
      <span aria-hidden className="absolute inset-0 select-none" style={{ color: "rgba(12,24,14,0.32)" }}>
        {text}
      </span>
    </span>
  );
}

/* ============ TOP NAV ============ */

function TopNav({ solid }: { solid: boolean }) {
  const links = ["Home", "Explore", "Trips", "Culture", "Contact"];
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
      style={{
        background: solid ? "rgba(255,255,255,0.82)" : "transparent",
        backdropFilter: solid ? "blur(20px) saturate(180%)" : "none",
        borderBottom: solid ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 md:px-10">
        <a href="/" className="flex items-center gap-2.5">
          <img
            src="/elements/northnest-logo.png"
            alt="northnest"
            className="h-9 w-9 rounded-full object-cover shadow-sm"
            draggable={false}
          />
          <span className="text-[19px] font-bold tracking-tight">
            <span
              className="transition-colors duration-500"
              style={{ color: solid ? FOREST : "#fff" }}
            >
              north
            </span>
            <span style={{ color: OLIVE }}>nest</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l}
              href="#"
              className="nn-link text-[13.5px] font-medium transition-colors duration-500"
              style={{ color: solid ? "#374151" : "rgba(255,255,255,0.92)" }}
            >
              {l}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            className="rounded-xl px-5 py-2 text-[13px] font-bold text-white shadow-md transition-all hover:scale-[1.04] hover:shadow-lg"
            style={{ background: `linear-gradient(135deg, ${OLIVE}, ${OLIVE_DARK})` }}
          >
            Book Now
          </button>
          <Menu size={20} className="md:hidden" style={{ color: solid ? "#374151" : "#fff" }} />
        </div>
      </div>
    </header>
  );
}

/* ============ VALLEY HERO (scroll-linked, GreenHaven-style) ============ */

function ValleyHero({ p }: { p: number }) {
  /* everything below is driven directly by scroll — realtime, reversible */
  const bgScale = lerp(1, 1.16, p);
  const bgRise = p * -40;
  const mistShift = p * 220;
  const titleFade = 1 - clamp01(p / 0.5);
  const titleRise = p * -110;
  const deckSlide = p * 120;
  const deckFade = 1 - clamp01(p / 0.6);
  const whiteOut = clamp01((p - 0.72) / 0.28);

  return (
    <section className="relative h-[215vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        {/* Green valley backdrop */}
        <img
          src={HERO_IMG}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-cover"
          style={{
            transform: `scale(${bgScale}) translateY(${bgRise}px)`,
            transformOrigin: "center 40%",
            willChange: "transform",
          }}
        />
        {/* Green grade so the whites never blow out */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,35,22,0.42) 0%, rgba(20,35,22,0.08) 38%, rgba(16,30,18,0.25) 78%, rgba(10,22,12,0.55) 100%)",
          }}
        />

        {/* Drifting mist — parts as you scroll */}
        <Cloud
          src="/elements/cloud-2.png"
          style={{ top: "12%", left: "-10%", width: "58%", opacity: 0.5, transform: `translateX(${-mistShift}px)` }}
        />
        <Cloud
          src="/elements/cloud-1.png"
          style={{ top: "26%", right: "-12%", width: "60%", opacity: 0.42, transform: `translateX(${mistShift}px) scaleX(-1)` }}
        />
        <Cloud
          src="/elements/cloud-2.png"
          style={{ bottom: "6%", left: "6%", width: "64%", opacity: 0.45, transform: `translateX(${-mistShift * 0.6}px)` }}
        />

        {/* Inset frame — the signature GreenHaven border */}
        <div
          className="pointer-events-none absolute inset-3 rounded-[28px] border md:inset-6"
          style={{ borderColor: "rgba(255,255,255,0.65)", opacity: 1 - whiteOut }}
        />

        {/* Right-edge diamond rail */}
        <div
          className="absolute right-10 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex"
          style={{ opacity: titleFade }}
        >
          <span className="h-16 w-px bg-white/50" />
          <span className="h-2.5 w-2.5 rotate-45 bg-white" />
          <span className="h-2.5 w-2.5 rotate-45 border border-white/80" />
          <span className="h-2.5 w-2.5 rotate-45 bg-white" />
          <span className="h-16 w-px bg-white/50" />
        </div>

        {/* Hero layout: copy left, swipeable deck right */}
        <div className="absolute inset-0 mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-10 px-8 pt-16 md:px-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div
            style={{ opacity: titleFade, transform: `translateY(${titleRise}px)`, willChange: "opacity, transform" }}
          >
            <p
              className="nn-hero-line text-[11px] font-bold uppercase tracking-[0.4em] text-white/85"
              style={{ "--nn-delay": "150ms" } as React.CSSProperties}
            >
              northnest · eight sister states
            </p>
            <h1
              className="mt-5 select-none text-[15vw] font-extrabold uppercase leading-[0.98] tracking-[0.06em] text-white md:text-[92px]"
              style={{ fontStretch: "expanded" }}
            >
              <span className="nn-hero-line block" style={{ "--nn-delay": "350ms" } as React.CSSProperties}>
                <Knockout text="NORTH" />
                <span style={{ textShadow: "0 4px 30px rgba(0,0,0,0.35)" }}>EAST</span>
              </span>
              <span className="nn-hero-line block" style={{ "--nn-delay": "550ms" } as React.CSSProperties}>
                <Knockout text="ESCAPE" />
              </span>
            </h1>
            <p
              className="nn-hero-line mt-6 max-w-[440px] text-[15px] leading-relaxed text-white/85 md:text-[17px]"
              style={{ "--nn-delay": "780ms" } as React.CSSProperties}
            >
              Living root bridges, cloud monasteries and the greenest valleys
              in India — with every permit handled.
            </p>

            <div
              className="nn-hero-line mt-8 flex flex-wrap items-center gap-5"
              style={{ "--nn-delay": "950ms" } as React.CSSProperties}
            >
              <button
                className="rounded-xl px-8 py-3.5 text-[14px] font-bold text-white shadow-xl transition-all hover:scale-[1.04]"
                style={{ background: `linear-gradient(135deg, ${OLIVE}, ${OLIVE_DARK})`, boxShadow: "0 14px 34px rgba(126,159,31,0.4)" }}
              >
                Explore Trips
              </button>
              <button className="group flex items-center gap-3 text-[14px] font-semibold text-white">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-white/60 bg-white/10 backdrop-blur transition-transform group-hover:scale-110">
                  <Play size={15} fill="white" className="ml-0.5" />
                </span>
                Watch Video
              </button>
            </div>

            <div
              className="nn-hero-line mt-9 flex items-center gap-3"
              style={{ "--nn-delay": "1100ms" } as React.CSSProperties}
            >
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-lg bg-white/12 text-white backdrop-blur transition-all hover:scale-110 hover:bg-white/25"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Swipeable destination deck */}
          <div
            className="hidden justify-center lg:flex"
            style={{ opacity: deckFade, transform: `translateX(${deckSlide}px)`, willChange: "opacity, transform" }}
          >
            <HeroDeck />
          </div>
        </div>

        {/* Scroll hint */}
        <div
          className="absolute bottom-9 left-1/2 -translate-x-1/2 text-center"
          style={{ opacity: Math.max(0, 1 - p * 6) }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/75">
            Scroll to descend
          </p>
          <ChevronDown size={18} className="mx-auto mt-1 animate-bounce text-white/75" />
        </div>

        {/* Final dissolve to white — content takes over */}
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

/* ============ SWIPEABLE HERO DECK ============ */

const deckCards = [
  {
    name: "Nohkalikai Falls",
    place: "Meghalaya",
    img: "https://images.unsplash.com/photo-1571089336682-9f8d6c1671da?q=80&w=520&h=760&fit=crop",
  },
  {
    name: "Tawang Monastery",
    place: "Arunachal Pradesh",
    img: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?q=80&w=520&h=760&fit=crop",
  },
  {
    name: "Kanchenjunga",
    place: "Sikkim",
    img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=520&h=760&fit=crop",
  },
  {
    name: "Dzükou Valley",
    place: "Nagaland",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=520&h=760&fit=crop",
  },
];

function HeroDeck() {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const n = deckCards.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % n), [n]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + n) % n), [n]);

  /* gentle auto-advance, resets whenever the user interacts */
  useEffect(() => {
    const t = setInterval(next, 5200);
    return () => clearInterval(t);
  }, [index, next]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setDrag(e.clientX - startX.current);
  };
  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (drag < -55) next();
    else if (drag > 55) prev();
    setDrag(0);
  };

  return (
    <div className="relative">
      <div
        className="relative h-[400px] w-[250px] cursor-grab select-none active:cursor-grabbing xl:h-[440px] xl:w-[280px]"
        style={{ touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
      >
        {deckCards.map((c, i) => {
          const pos = (i - index + n) % n;
          const front = pos === 0;
          const x = pos * 46 + (front ? drag : drag * 0.25);
          const y = pos * 10;
          const rot = pos * 3.5 + (front ? drag * 0.045 : 0);
          const scale = 1 - pos * 0.055;
          return (
            <figure
              key={c.name}
              className="absolute inset-0 overflow-hidden rounded-2xl shadow-2xl"
              style={{
                transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`,
                zIndex: n - pos,
                opacity: pos > 2 ? 0 : 1,
                transition: dragging.current
                  ? "none"
                  : "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease",
                border: "3px solid rgba(255,255,255,0.85)",
                willChange: "transform",
              }}
            >
              <img
                src={c.img}
                alt={c.name}
                draggable={false}
                loading={pos === 0 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <figcaption
                className="absolute inset-x-0 bottom-0 p-4 transition-opacity duration-300"
                style={{ opacity: front ? 1 : 0 }}
              >
                <p className="text-[16px] font-bold text-white">{c.name}</p>
                <p className="flex items-center gap-1 text-[11px] font-medium" style={{ color: "#c9e77a" }}>
                  <MapPin size={11} /> {c.place}
                </p>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {/* Controls */}
      <div className="mt-16 flex items-center justify-between xl:mt-14">
        <div className="flex items-center gap-1.5">
          {deckCards.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Card ${i + 1}`}
              className="h-1.5 rounded-full transition-all duration-400"
              style={{
                width: i === index ? 22 : 8,
                background: i === index ? OLIVE : "rgba(255,255,255,0.45)",
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={prev}
            aria-label="Previous"
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/40 bg-white/10 text-white backdrop-blur transition-all hover:scale-105 hover:bg-white/25"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="grid h-10 w-10 place-items-center rounded-lg text-white shadow-lg transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${OLIVE}, ${OLIVE_DARK})` }}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ SEARCH HUB ============ */

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
    <section className="relative -mt-[24vh] md:-mt-[28vh]">
      <div
        className="rounded-3xl border bg-white/92 p-4 shadow-[0_24px_70px_rgba(20,40,20,0.14)] md:p-6"
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
                  background: active ? "rgba(126,159,31,0.1)" : "transparent",
                  color: active ? OLIVE_DARK : "#6b7280",
                  boxShadow: active ? "inset 0 0 0 1.5px rgba(126,159,31,0.45)" : "none",
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
                  style={{ background: FOREST }}
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
            style={{ background: `linear-gradient(135deg, ${OLIVE}, ${FOREST})`, boxShadow: "0 12px 30px rgba(126,159,31,0.4)" }}
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
            style={{ background: GREEN_LIGHT, color: OLIVE_DARK }}
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
          style={{ borderColor: OLIVE, color: OLIVE_DARK }}
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
    <Section eyebrow="Offers" title="Deals worth flying for." action="View all offers">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {offers.map((o, i) => (
          <Reveal
            key={o.title}
            delay={i * 100}
            className="group rounded-3xl border bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center gap-2">
              <BadgePercent size={16} style={{ color: OLIVE_DARK }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: OLIVE_DARK }}>
                {o.tag}
              </span>
            </div>
            <p className="mt-3 text-[16px] font-bold leading-snug tracking-tight">{o.title}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">{o.body}</p>
            <div className="mt-4 flex items-center justify-between">
              <span
                className="rounded-lg border border-dashed px-2.5 py-1 text-[11px] font-bold tracking-wider"
                style={{ borderColor: OLIVE, color: OLIVE_DARK, background: GREEN_LIGHT }}
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
  const words = ["Eight", "states.", "A", "hundred", "tribes.", "One", "green", "horizon."];
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
      <h2 className="mx-auto max-w-[900px] text-center text-[36px] font-bold leading-[1.12] tracking-tight md:text-[60px]">
        {words.map((w, i) => {
          const on = prog * words.length > i;
          return (
            <span
              key={i}
              className="mr-[0.28em] inline-block transition-all duration-300 last:mr-0"
              style={{
                opacity: on ? 1 : 0.12,
                transform: on ? "translateY(0)" : "translateY(10px)",
                color: on ? (i === 4 ? OLIVE_DARK : i === 6 ? FOREST : undefined) : undefined,
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

/* ============ NORTHNEST CULTURE (horizontal strip) ============ */

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
            <p className="text-[12px] font-semibold uppercase tracking-[0.25em]" style={{ color: OLIVE_DARK }}>
              The northnest culture
            </p>
            <h2 className="mt-2 text-[26px] font-bold leading-tight tracking-tight md:text-[36px]">
              <SplitHead text="Festivals, crafts and the people who keep them." />
            </h2>
          </div>
          <a
            href="#"
            className="nn-link hidden shrink-0 items-center gap-1 text-[13px] font-semibold md:flex"
            style={{ color: FOREST }}
          >
            Full culture calendar <ChevronRight size={15} />
          </a>
        </div>
      </Reveal>

      {/* Horizontal strip — drag/scroll sideways */}
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
                style={{ background: OLIVE }}
              >
                {c.month}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-[18px] font-bold tracking-tight text-white">{c.name}</p>
                <p className="text-[11px] font-medium" style={{ color: "#c9e77a" }}>
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
  const states = [
    { name: "Meghalaya", tag: "Living root bridges", img: "https://images.unsplash.com/photo-1571089336682-9f8d6c1671da?w=700", stays: "480+ stays" },
    { name: "Arunachal Pradesh", tag: "Tawang & Sela Pass", img: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=700", stays: "310+ stays" },
    { name: "Sikkim", tag: "Kanchenjunga views", img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=700", stays: "520+ stays" },
    { name: "Nagaland", tag: "Hornbill Festival", img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=700", stays: "190+ stays" },
    { name: "Assam", tag: "Kaziranga safaris", img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=700", stays: "640+ stays" },
    { name: "Manipur", tag: "Loktak floating lake", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700", stays: "140+ stays" },
    { name: "Mizoram", tag: "Blue mountain trails", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700", stays: "120+ stays" },
    { name: "Tripura", tag: "Ujjayanta palaces", img: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=700", stays: "110+ stays" },
  ];
  return (
    <Section
      eyebrow="Destinations"
      title="Eight sisters. Pick your first."
      action="Open the map"
      marquee="eight sisters ·"
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {states.map((s, i) => (
          <Reveal key={s.name} delay={(i % 4) * 90}>
            <a
              href="#"
              className="group relative block overflow-hidden rounded-3xl"
              style={{ aspectRatio: "4/5" }}
            >
              <img
                src={s.img}
                alt={s.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[16px] font-bold tracking-tight text-white">{s.name}</p>
                <p className="text-[11px] text-white/75">{s.tag}</p>
                <span
                  className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                  style={{ background: OLIVE }}
                >
                  {s.stays}
                </span>
              </div>
            </a>
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
                    color: liked[pk.title] ? "#e0245e" : "#9ca3af",
                    fill: liked[pk.title] ? "#e0245e" : "none",
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
                  style={{ background: OLIVE }}
                >
                  {pk.rating} <Star size={9} fill="white" />
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-neutral-400">{pk.reviews} verified reviews</p>
              <ul className="mt-3 space-y-1">
                {pk.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-[12px] text-neutral-600">
                    <span className="h-1 w-1 rounded-full" style={{ background: OLIVE }} />
                    {perk}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-neutral-400 line-through">{pk.oldPrice}</p>
                  <p className="text-[20px] font-bold tracking-tight" style={{ color: FOREST }}>
                    {pk.price}
                    <span className="ml-1 text-[11px] font-medium text-neutral-400">/ person</span>
                  </p>
                </div>
                <button
                  className="rounded-full px-5 py-2 text-[13px] font-bold text-white transition-transform hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${OLIVE}, ${OLIVE_DARK})` }}
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
    <Section eyebrow="Why northnest" title="Built for the Northeast. Not adapted to it.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {feats.map((f, i) => {
          const Icon = f.icon;
          return (
            <Reveal key={f.title} delay={i * 100} className="rounded-3xl bg-neutral-50 p-6">
              <div
                className="grid h-11 w-11 place-items-center rounded-2xl"
                style={{ background: GREEN_LIGHT }}
              >
                <Icon size={20} style={{ color: OLIVE_DARK }} />
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
              <Quote size={18} style={{ color: OLIVE_DARK }} />
              <blockquote className="mt-3 text-[14px] leading-relaxed text-neutral-700">
                {q.text}
              </blockquote>
              <figcaption className="mt-4">
                <p className="text-[13px] font-bold">{q.name}</p>
                <p className="text-[11px]" style={{ color: OLIVE_DARK }}>
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
  marquee,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: string;
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
            <p className="text-[12px] font-semibold uppercase tracking-[0.25em]" style={{ color: OLIVE_DARK }}>
              {eyebrow}
            </p>
            <h2 className="mt-2 text-[26px] font-bold leading-tight tracking-tight md:text-[36px]">
              <SplitHead text={title} />
            </h2>
          </div>
          {action && (
            <a
              href="#"
              className="nn-link hidden shrink-0 items-center gap-1 text-[13px] font-semibold md:flex"
              style={{ color: FOREST }}
            >
              {action} <ChevronRight size={15} />
            </a>
          )}
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
    <footer className="relative z-10 mt-10" style={{ background: FOREST_DARK }}>
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] md:px-6">
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src="/elements/northnest-logo.png"
              alt="northnest"
              className="h-11 w-11 rounded-full object-cover"
              draggable={false}
            />
            <p className="text-[19px] font-bold tracking-tight text-white">
              north<span style={{ color: "#b7d34e" }}>nest</span>
            </p>
          </div>
          <p className="mt-3 max-w-[260px] text-[13px] leading-relaxed" style={{ color: CREAM + "cc" }}>
            The travel platform built for the eight sister states of Northeast India.
          </p>
          <div className="mt-4 flex items-center gap-2 text-[12px] font-semibold" style={{ color: "#b7d34e" }}>
            <Compass size={14} /> Guwahati · Shillong · Itanagar
          </div>
          <div className="mt-5 flex items-center gap-2.5">
            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white transition-all hover:scale-110 hover:bg-white/20"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "rgba(234,228,210,0.5)" }}>
              {c.h}
            </p>
            <ul className="mt-3 space-y-2">
              {c.items.map((i) => (
                <li key={i}>
                  <a href="#" className="nn-link text-[13px] text-white/70 hover:text-white">
                    {i}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t py-5 text-center text-[12px]" style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(234,228,210,0.55)" }}>
        © 2026 northnest · Northeast India, unfiltered.
        <MapPin size={12} className="ml-1 inline" style={{ color: "#b7d34e" }} />
      </div>
    </footer>
  );
}
