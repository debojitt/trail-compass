import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { destinations, type Destination } from "@/data/destinations";
import { NE_INDIA_VIEWBOX, NE_STATE_PATHS, type NeStateId } from "@/data/neIndiaPaths";

const RED = "#E23744";
const GREEN = "#24963F";
const FILL = "#2C2C2C";
const FILL_DIM = "#6B6B6B";

type Props = {
  liftSlug: string | null;
  previewSlug: string | null;
  onHover: (slug: NeStateId | null) => void;
  onSelect: (slug: NeStateId) => void;
};

export function NortheastMap({ liftSlug, previewSlug, onHover, onSelect }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [isNarrow, setIsNarrow] = useState(false);
  const [cardPos, setCardPos] = useState<{ x: number; y: number; mode: "float" | "dock" } | null>(
    null,
  );

  const preview = useMemo(
    () => destinations.find((d) => d.slug === previewSlug) ?? null,
    [previewSlug],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    const sync = () => setIsNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!previewSlug || !wrapRef.current) {
      setCardPos(null);
      return;
    }

    const wrap = wrapRef.current.getBoundingClientRect();
    if (isNarrow) {
      /* Phone: dock preview under the map so it never clips or fights the SVG */
      setCardPos({ x: 0, y: 0, mode: "dock" });
      return;
    }

    const el = wrapRef.current.querySelector<SVGGElement>(`[data-state="${previewSlug}"]`);
    if (!el) {
      setCardPos({ x: wrap.width * 0.58, y: 20, mode: "float" });
      return;
    }
    const box = el.getBoundingClientRect();
    const cardW = 168;
    const x = Math.min(Math.max(8, box.right - wrap.left - 28), wrap.width - cardW - 8);
    const y = Math.max(8, Math.min(box.top - wrap.top - 6, wrap.height - 260));
    setCardPos({ x, y, mode: "float" });
  }, [previewSlug, isNarrow]);

  return (
    <div
      ref={wrapRef}
      className="nn-ne-map relative mx-auto w-full max-w-[720px]"
      onMouseLeave={() => {
        if (!isNarrow) onHover(null);
      }}
    >
      <svg
        viewBox={NE_INDIA_VIEWBOX}
        className="nn-ne-map-svg block h-auto w-full overflow-visible"
        role="img"
        aria-label="Interactive map of Northeast India"
      >
        <defs>
          <filter id="nn-ne-lift-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2.8" floodColor="#000" floodOpacity="0.32" />
          </filter>
        </defs>

        <text
          x="412"
          y="198"
          fill="#1a1a1a"
          fontSize="7.5"
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="1.4"
          className="nn-ne-map-title"
        >
          NORTHEAST INDIA
        </text>

        {NE_STATE_PATHS.map((state) => {
          const isActive = liftSlug === state.id;
          const dimmed = Boolean(liftSlug) && !isActive;
          return (
            <g
              key={state.id}
              data-state={state.id}
              className={`nn-ne-state${isActive ? " is-active" : ""}${dimmed ? " is-dimmed" : ""}`}
              style={
                reduceMotion
                  ? undefined
                  : {
                      transformBox: "fill-box",
                      transformOrigin: "center",
                    }
              }
              filter={isActive && !reduceMotion ? "url(#nn-ne-lift-shadow)" : undefined}
              onPointerEnter={() => onHover(state.id)}
              onFocus={() => onHover(state.id)}
              onClick={() => {
                /* Phone: first tap highlights + docks preview; card opens explore */
                if (isNarrow) onHover(state.id);
                else onSelect(state.id);
              }}
              tabIndex={0}
              role="button"
              aria-pressed={isActive}
              aria-label={`Explore ${state.label}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(state.id);
                }
              }}
            >
              <path
                id={state.mapId}
                d={state.d}
                fill={isActive ? RED : dimmed ? FILL_DIM : FILL}
                stroke="#fff"
                strokeWidth={1.55}
                strokeLinejoin="round"
                strokeLinecap="round"
                className="nn-ne-state-path"
              />
              <text
                x={state.cx}
                y={state.cy}
                fill="#fff"
                fontSize={state.fontSize}
                fontFamily="Georgia, 'Times New Roman', serif"
                fontWeight={600}
                letterSpacing="0.55"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${state.rotate} ${state.cx} ${state.cy})`}
                className="nn-ne-state-label pointer-events-none select-none"
              >
                {state.id === "arunachal-pradesh" ? (
                  <>
                    <tspan x={state.cx} dy="-0.55em">
                      ARUNĀCHAL
                    </tspan>
                    <tspan x={state.cx} dy="1.15em">
                      PRADESH
                    </tspan>
                  </>
                ) : (
                  state.label
                )}
              </text>
            </g>
          );
        })}
      </svg>

      <AnimatePresence mode="wait">
        {preview && cardPos && (
          <motion.div
            key={`${preview.slug}-${cardPos.mode}`}
            className={
              cardPos.mode === "dock"
                ? "relative z-20 mx-auto mt-3 w-[min(200px,72vw)]"
                : "pointer-events-auto absolute z-20 w-[168px]"
            }
            style={
              cardPos.mode === "float"
                ? { left: cardPos.x, top: cardPos.y }
                : undefined
            }
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            onPointerEnter={() => onHover(preview.slug as NeStateId)}
          >
            <MapPreviewCard
              dest={preview}
              compact={isNarrow}
              onSelect={() => onSelect(preview.slug as NeStateId)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MapPreviewCard({
  dest,
  onSelect,
  compact,
}: {
  dest: Destination;
  onSelect: () => void;
  compact?: boolean;
}) {
  return (
    <Link
      to="/explore/$slug"
      params={{ slug: dest.slug }}
      onClick={(e) => {
        e.preventDefault();
        onSelect();
      }}
      className="nn-ne-preview group relative block w-full overflow-hidden rounded-[14px] shadow-[0_16px_36px_rgba(0,0,0,0.2)] ring-1 ring-black/5"
      style={{ aspectRatio: compact ? "4/5" : "11/16" }}
      aria-label={`Open ${dest.name}`}
    >
      <img
        src={dest.heroImg}
        alt={dest.name}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
        <p className="text-[13px] font-bold tracking-tight text-white sm:text-[14px]">{dest.name}</p>
        <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-white/75">{dest.tag}</p>
        <span
          className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
          style={{ background: GREEN }}
        >
          {dest.stays}
        </span>
      </div>
    </Link>
  );
}
