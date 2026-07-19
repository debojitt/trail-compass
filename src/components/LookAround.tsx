import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Destination, PovDirection, PovNode } from "@/data/destinations";
import { getDestinationNode } from "@/data/destinations";
import { resolveDestinationCoords } from "@/lib/parseGoogleMapsUrl";
import { GoogleStreetViewEmbed } from "@/components/GoogleStreetViewEmbed";
import {
  OwnPanoramaViewer,
  type PanoHotspot,
  type PanoViewerHandle,
} from "@/components/OwnPanoramaViewer";

type ActiveSource = "google" | "own" | "empty";

const YAW_BY_DIR: Record<PovDirection, number> = {
  forward: 0,
  right: 90,
  back: 180,
  left: -90,
};

const DIR_LABEL: Record<PovDirection, string> = {
  forward: "Ahead",
  right: "Right",
  back: "Behind",
  left: "Left",
};

/** How far the facing can be from a corridor and still walk it (degrees) */
const WALK_CONE = 75;
const ROTATE_STEP = 55;

/** Smallest absolute angle between two bearings, 0–180° */
const angleDiff = (a: number, b: number) =>
  Math.abs(((((a - b) % 360) + 540) % 360) - 180);

const normDeg = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;

type Props = {
  destination: Destination;
  className?: string;
};

export function LookAround({ destination, className = "" }: Props) {
  const coords = useMemo(() => resolveDestinationCoords(destination), [destination]);

  const startId = destination.startNodeId ?? destination.nodes?.[0]?.id;
  const [nodeId, setNodeId] = useState(startId);
  /* Camera bearing we believe we're facing (approx; drives button hints) */
  const [facing, setFacing] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [source, setSource] = useState<ActiveSource>(() =>
    initialSource(destination, Boolean(coords)),
  );

  const viewer = useRef<PanoViewerHandle>(null);
  const nodeRef = useRef<PovNode | undefined>(undefined);
  const busyRef = useRef(false);

  /* Reset when destination changes */
  useEffect(() => {
    setNodeId(destination.startNodeId ?? destination.nodes?.[0]?.id);
    setFacing(0);
    setTransitioning(false);
    busyRef.current = false;
    setSource(initialSource(destination, Boolean(coords)));
  }, [destination, coords]);

  const node = getDestinationNode(destination, nodeId);
  nodeRef.current = node;
  const ownSrc = node?.panoSrc ?? destination.panoSrc;

  const fallToOwn = useCallback(() => {
    if (destination.nodes?.length || destination.panoSrc) setSource("own");
    else setSource("empty");
  }, [destination]);

  const warmNeighbors = useCallback(
    (from?: PovNode) => {
      if (!from || !destination.nodes) return;
      for (const linkedId of Object.values(from.links)) {
        const linked = destination.nodes.find((n) => n.id === linkedId);
        if (linked?.panoSrc) {
          const img = new Image();
          img.src = linked.panoSrc;
        }
      }
    },
    [destination.nodes],
  );

  /* Dolly-walk into a specific linked direction (no fade) */
  const stepToDir = useCallback(
    (dir: PovDirection) => {
      const current = nodeRef.current;
      const targetId = current?.links[dir];
      if (!current || !targetId || busyRef.current) return;
      const target = destination.nodes?.find((n) => n.id === targetId);
      if (!target?.panoSrc) return;

      busyRef.current = true;
      setTransitioning(true);
      viewer.current
        ?.walkTo(target.panoSrc, YAW_BY_DIR[dir])
        .then(() => {
          setNodeId(target.id);
          setFacing(YAW_BY_DIR[dir]);
          warmNeighbors(target);
        })
        .finally(() => {
          busyRef.current = false;
          setTransitioning(false);
        });
    },
    [destination.nodes, warmNeighbors],
  );

  /* Pick the corridor closest to a bearing and walk it */
  const walkTowards = useCallback(
    (bearing: number) => {
      const current = nodeRef.current;
      if (!current) return;
      let best: PovDirection | null = null;
      let bestDiff = WALK_CONE;
      for (const dir of Object.keys(current.links) as PovDirection[]) {
        const diff = angleDiff(YAW_BY_DIR[dir], bearing);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = dir;
        }
      }
      if (best) stepToDir(best);
    },
    [stepToDir],
  );

  const walkForward = useCallback(() => {
    const live = viewer.current?.getYaw() ?? facing;
    walkTowards(live);
  }, [walkTowards, facing]);

  const walkBack = useCallback(() => {
    const live = viewer.current?.getYaw() ?? facing;
    walkTowards(live + 180);
  }, [walkTowards, facing]);

  const rotateLeft = useCallback(() => {
    viewer.current?.rotateBy(-ROTATE_STEP);
    setFacing((f) => normDeg(f - ROTATE_STEP));
  }, []);

  const rotateRight = useCallback(() => {
    viewer.current?.rotateBy(ROTATE_STEP);
    setFacing((f) => normDeg(f + ROTATE_STEP));
  }, []);

  const jumpToNode = useCallback(
    (id: string) => {
      const current = nodeRef.current;
      if (busyRef.current || id === current?.id) return;
      const target = destination.nodes?.find((n) => n.id === id);
      if (!target?.panoSrc) return;
      busyRef.current = true;
      setTransitioning(true);
      viewer.current
        ?.jumpTo(target.panoSrc, 0)
        .then(() => {
          setNodeId(target.id);
          setFacing(0);
          warmNeighbors(target);
        })
        .finally(() => {
          busyRef.current = false;
          setTransitioning(false);
        });
    },
    [destination.nodes, warmNeighbors],
  );

  /* Keyboard: arrows/WASD → walk & turn like a game */
  useEffect(() => {
    if (source !== "own") return;
    const onKey = (e: KeyboardEvent) => {
      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          e.preventDefault();
          walkForward();
          break;
        case "ArrowDown":
        case "KeyS":
          e.preventDefault();
          walkBack();
          break;
        case "ArrowLeft":
        case "KeyA":
          e.preventDefault();
          rotateLeft();
          break;
        case "ArrowRight":
        case "KeyD":
          e.preventDefault();
          rotateRight();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [source, walkForward, walkBack, rotateLeft, rotateRight]);

  const hotspots: PanoHotspot[] = useMemo(() => {
    if (!node) return [];
    return (Object.entries(node.links) as [PovDirection, string][]).map(
      ([dir, targetId]) => {
        const target = destination.nodes?.find((n) => n.id === targetId);
        return {
          id: dir,
          yaw: YAW_BY_DIR[dir],
          label: target ? `${DIR_LABEL[dir]} — ${target.label}` : DIR_LABEL[dir],
        };
      },
    );
  }, [node, destination.nodes]);

  /* Group nodes into famous places for the switcher (order-preserving) */
  const places = useMemo(() => {
    const map = new Map<string, PovNode[]>();
    for (const n of destination.nodes ?? []) {
      const key = n.place ?? destination.name;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(n);
    }
    return [...map.entries()].map(([name, nodes]) => ({ name, nodes }));
  }, [destination.nodes, destination.name]);

  const currentPlace = node ? (node.place ?? destination.name) : undefined;
  const placeNodes = places.find((p) => p.name === currentPlace)?.nodes ?? [];
  const pointIndex = node ? placeNodes.findIndex((n) => n.id === node.id) + 1 : 0;

  return (
    <div className={`relative h-full w-full overflow-hidden bg-black ${className}`}>
      {source === "google" && coords && (
        <GoogleStreetViewEmbed
          lat={coords.lat}
          lng={coords.lng}
          heading={coords.heading ?? destination.heading ?? 0}
          pitch={coords.pitch ?? 0}
          onUnavailable={fallToOwn}
        />
      )}

      {source === "own" && ownSrc && (
        <>
          <OwnPanoramaViewer
            ref={viewer}
            initialSrc={ownSrc}
            hotspots={node ? hotspots : []}
            onHotspotClick={(id) => stepToDir(id as PovDirection)}
            onReady={() => warmNeighbors(nodeRef.current)}
          />
          {places.length > 1 && node && (
            <PlaceSwitcher
              places={places}
              currentPlace={currentPlace}
              currentNodeId={node.id}
              disabled={transitioning}
              onSelect={(id) => jumpToNode(id)}
            />
          )}
        </>
      )}

      {source === "empty" || (source === "own" && !ownSrc) ? (
        <div className="grid h-full place-items-center px-6 text-center text-white/70">
          <div>
            <p className="text-lg font-semibold text-white">Panorama coming soon</p>
            <p className="mt-2 max-w-sm text-sm">
              Send a Google Maps / Street View link or reference photos for {destination.name} and
              we&apos;ll wire the look-around.
            </p>
          </div>
        </div>
      ) : null}

      {/* Source badge — hidden on phones to keep the view clean */}
      <div className="pointer-events-none absolute left-3 top-3 z-20 hidden sm:block">
        <span className="rounded-full border border-white/25 bg-black/55 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white backdrop-blur">
          {source === "google"
            ? "Google Street View — real imagery"
            : source === "own"
              ? "AI recreation — real location references"
              : "No imagery yet"}
        </span>
      </div>

      {/* Place + point label, always on the right */}
      {source === "own" && node && currentPlace && (
        <div className="pointer-events-none absolute right-3 top-3 z-20 max-w-[70%] text-right">
          <div className="inline-block rounded-2xl border border-white/25 bg-black/60 px-3.5 py-2 backdrop-blur">
            <p className="text-[13px] font-bold leading-tight text-white sm:text-sm">
              {currentPlace}
            </p>
            <p className="mt-0.5 text-[11px] leading-tight text-white/80">
              {node.label}
              {placeNodes.length > 1 ? ` · ${pointIndex}/${placeNodes.length}` : ""}
              {node.rare ? " · rarely seen" : ""}
            </p>
          </div>
        </div>
      )}

      {source === "google" && (
        <p className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[11px] text-white/80 backdrop-blur">
          Drag to look · use Google arrows to move along the road
        </p>
      )}

      {source === "own" && (
        <p className="pointer-events-none absolute bottom-[110px] left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-black/50 px-3 py-1 text-[11px] text-white/80 backdrop-blur sm:block">
          Drag to look · tap scene arrows or W A S D to move between points
        </p>
      )}
    </div>
  );
}

function initialSource(destination: Destination, hasCoords: boolean): ActiveSource {
  const hasOwn = Boolean(destination.nodes?.length || destination.panoSrc);
  if (destination.lookSource === "own") return hasOwn ? "own" : "empty";
  /* "google" and "auto" both try Google first, then fall back */
  if (hasCoords) return "google";
  return hasOwn ? "own" : "empty";
}

/* ============ PLACE SWITCHER (mobile-first) ============ */

function PlaceSwitcher({
  places,
  currentPlace,
  currentNodeId,
  disabled,
  onSelect,
}: {
  places: { name: string; nodes: PovNode[] }[];
  currentPlace?: string;
  currentNodeId: string;
  disabled?: boolean;
  onSelect: (id: string) => void;
}) {
  const activeNodes = places.find((p) => p.name === currentPlace)?.nodes ?? [];

  return (
    <div className="absolute inset-x-0 bottom-12 z-20 flex flex-col items-center gap-2 px-2 sm:bottom-14">
      {/* Point dots within the current place */}
      {activeNodes.length > 1 && (
        <div className="flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 backdrop-blur">
          {activeNodes.map((n) => (
            <button
              key={n.id}
              type="button"
              title={n.label}
              aria-label={n.label}
              disabled={disabled}
              onClick={() => onSelect(n.id)}
              className={`h-2.5 rounded-full transition-all disabled:opacity-50 ${
                n.id === currentNodeId
                  ? "w-6 bg-[#E23744]"
                  : "w-2.5 bg-white/45 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      )}

      {/* Famous place chips — horizontally scrollable, thumb-friendly */}
      <div className="scrollbar-none flex max-w-full gap-1.5 overflow-x-auto rounded-2xl bg-black/45 p-1.5 backdrop-blur">
        {places.map((p) => {
          const active = p.name === currentPlace;
          return (
            <button
              key={p.name}
              type="button"
              disabled={disabled}
              onClick={() => !active && onSelect(p.nodes[0].id)}
              className={`shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-[11px] font-semibold transition-colors disabled:opacity-50 sm:text-xs ${
                active
                  ? "bg-white text-neutral-900"
                  : "bg-white/10 text-white/85 hover:bg-white/20"
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
