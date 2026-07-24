import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MapPin, Compass } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  {
    subtitle: "01 • True-Cost Topography",
    headline: "Most maps show you the roads. We show you the currents.",
    copy: "Welcome to Majuli—the world's largest river island, slowly being reclaimed by the Brahmaputra. This isn't a tourist stop; it is a ticking clock. Experience raw monastic culture before the water takes it back.",
  },
  {
    subtitle: "02 • The Echo SOS Net",
    headline: "Suspended over Cloud Zero. Never off the grid.",
    copy: "Walk across centuries-old living root bridges suspended over canyons. Our True-Cost logistics dashboard tracks real-time weather patterns so you traverse when the mist clears, backed by 24/7 satellite extraction teams.",
  },
];

export function ExploreNortheast() {
  const scope = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!pinRef.current || !rightRef.current) return;

      ScrollTrigger.create({
        trigger: scope.current,
        start: "top top",
        endTrigger: rightRef.current,
        end: "bottom bottom",
        pin: pinRef.current,
        pinSpacing: false,
      });

      gsap.utils.toArray<HTMLElement>(".nn-narrative").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 60,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "top 40%",
            scrub: true,
          },
        });
      });

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope },
  );

  return (
    <div
      ref={scope}
      className="mx-auto flex min-h-[200vh] max-w-6xl justify-between gap-12 bg-[#0B0F19] px-6 py-16 text-white"
    >
      <div className="hidden w-1/2 md:block">
        <div ref={pinRef} className="flex h-screen items-center">
          <div className="h-[450px] w-full overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-slate-800 via-slate-900 to-black p-6 shadow-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
              <Compass size={11} /> Current Node: Majuli Island
            </span>
            <h3 className="mt-6 text-[42px] font-bold leading-tight">
              The River's
              <br />
              Pulse
            </h3>
            <div className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-[12px] text-white/70">
              <div className="flex items-center justify-between">
                <span>LAT</span>
                <span className="text-cyan-300">26.9509° N</span>
              </div>
              <div className="flex items-center justify-between">
                <span>LONG</span>
                <span className="text-cyan-300">94.1636° E</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ALT</span>
                <span className="text-cyan-300">86 m</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span>STATUS</span>
                <span className="text-emerald-300">◉ Live · Signal Verified</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[11px] text-white/50">
              <MapPin size={12} /> Node 03 of 47 · Assam Ring
            </div>
          </div>
        </div>
      </div>

      <div ref={rightRef} className="w-full space-y-[40vh] md:w-1/2">
        {CARDS.map((c) => (
          <div
            key={c.subtitle}
            className="nn-narrative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md"
          >
            <p className="font-mono text-[11px] uppercase tracking-wider text-cyan-300">
              {c.subtitle}
            </p>
            <h4 className="mt-3 text-[26px] font-bold leading-tight">{c.headline}</h4>
            <p className="mt-4 text-[14px] leading-relaxed text-white/70">{c.copy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
