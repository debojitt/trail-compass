import { useCallback, useEffect, useMemo, useState } from "react";
import type { Destination, PovDirection, PovNode } from "@/data/destinations";
import { getDestinationNode } from "@/data/destinations";
import { resolveDestinationCoords } from "@/lib/parseGoogleMapsUrl";
import { GoogleStreetViewEmbed } from "@/components/GoogleStreetViewEmbed";
import { OwnPanoramaViewer, type PanoHotspot } from "@/components/OwnPanoramaViewer";
import { PovControls } from "@/components/PovControls";

type ActiveSource = "google" | "own" | "empty";

const YAW_BY_DIR: Record<PovDirection, number> = {
  forward: 0,
  right: 90,
  back: 180,
  left: -90,
};

const DIR_LABEL: Record<PovDirection, string> = {
  forward: "Move forward",
  right: "Go right",
  back: "Go back",
  left: "Go left",
};

type Props = {
  destination: Destination;
  className?: string;
};

export function LookAround({ destination, className = "" }: Props) {
  const coords = useMemo(() => resolveDestinationCoords(destination), [destination]);
  const hasNodes = Boolean(destination.nodes?.length);

  const [nodeId, setNodeId] = useState(
    destination.startNodeId ?? destination.nodes?.[0]?.id,
  );
  const [yaw, setYaw] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [source, setSource] = useState<ActiveSource>(() =>
    initialSource(destination, Boolean(coords)),
  );

  /* Reset when destination changes */
  useEffect(() => {
    setNodeId(destination.startNodeId ?? destination.nodes?.[0]?.id);
    setYaw(0);
    setTransitioning(false);
    setSource(initialSource(destination, Boolean(coords)));
  }, [destination, coords]);

  const node = getDestinationNode(destination, nodeId);
  const ownSrc = node?.panoSrc ?? destination.panoSrc;

  const fallToOwn = useCallback(() => {
    if (destination.nodes?.length || destination.panoSrc) {
      setSource("own");
    } else {
      setSource("empty");
    }
  }, [destination]);

  const jumpToNode = useCallback(
    (id: string, stepYaw = 0) => {
      if (transitioning || id === nodeId) return;
      setTransitioning(true);
      setYaw(stepYaw);
      setNodeId(id);
    },
    [transitioning, nodeId],
  );

  const move = useCallback(
    (dir: PovDirection) => {
      const nextId = node?.links[dir];
      if (!nextId) return;
      jumpToNode(nextId, YAW_BY_DIR[dir]);
    },
    [node, jumpToNode],
  );

  const onPanoramaLoaded = useCallback(() => {
    setTransitioning(false);
    /* Warm the panoramas one step away so moving feels instant */
    if (!node || !destination.nodes) return;
    for (const linkedId of Object.values(node.links)) {
      const linked = destination.nodes.find((n) => n.id === linkedId);
      if (linked?.panoSrc) {
        const img = new Image();
        img.src = linked.panoSrc;
      }
    }
  }, [node, destination.nodes]);

  /* Keyboard WASD / arrows for POV graph */
  useEffect(() => {
    if (source !== "own" || !node) return;
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, PovDirection> = {
        ArrowUp: "forward",
        KeyW: "forward",
        ArrowLeft: "left",
        KeyA: "left",
        ArrowRight: "right",
        KeyD: "right",
        ArrowDown: "back",
        KeyS: "back",
      };
      const dir = map[e.code];
      if (dir && node.links[dir]) {
        e.preventDefault();
        move(dir);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [source, node, move]);

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

  const nodeIndex =
    destination.nodes && node
      ? destination.nodes.findIndex((n) => n.id === node.id) + 1
      : 0;
  const nodeCount = destination.nodes?.length ?? 0;

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
            src={ownSrc}
            yaw={yaw}
            hotspots={node ? hotspots : []}
            onHotspotClick={(id) => move(id as PovDirection)}
            onPanoramaLoaded={onPanoramaLoaded}
          />
          {node && <PovControls node={node} onMove={move} disabled={transitioning} />}
          {destination.nodes && destination.nodes.length > 1 && node && (
            <NodeMiniMap
              nodes={destination.nodes}
              currentId={node.id}
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

      {/* Source badge */}
      <div className="pointer-events-none absolute left-4 top-4 z-20">
        <span className="rounded-full border border-white/25 bg-black/55 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white backdrop-blur">
          {source === "google"
            ? "Google Street View — real imagery"
            : source === "own"
              ? "AI virtual recreation — based on reference photos"
              : "No imagery yet"}
        </span>
      </div>

      {/* Node label */}
      {source === "own" && node && nodeCount > 0 && (
        <div className="pointer-events-none absolute right-4 top-4 z-20">
          <span className="rounded-full border border-white/25 bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white/90 backdrop-blur">
            {node.label} · {nodeIndex}/{nodeCount}
          </span>
        </div>
      )}

      {source === "google" && (
        <p className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[11px] text-white/80 backdrop-blur">
          Drag to look · use Google arrows to move along the road
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

/* ============ NODE MINI-MAP ============ */

function NodeMiniMap({
  nodes,
  currentId,
  onSelect,
}: {
  nodes: PovNode[];
  currentId: string;
  onSelect: (id: string) => void;
}) {
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const r = nodes.length > 2 ? 40 : 30;

  /* Even circular layout in definition order; stable and readable for 2–5 nodes */
  const positions = new Map<string, { x: number; y: number }>();
  nodes.forEach((n, i) => {
    if (nodes.length === 1) {
      positions.set(n.id, { x: cx, y: cy });
    } else {
      const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
      positions.set(n.id, {
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      });
    }
  });

  /* Unique undirected edges */
  const edges: [string, string][] = [];
  const seen = new Set<string>();
  for (const n of nodes) {
    for (const target of Object.values(n.links)) {
      const key = [n.id, target].sort().join("|");
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([n.id, target]);
      }
    }
  }

  return (
    <div className="absolute bottom-6 right-4 z-20 hidden rounded-2xl border border-white/20 bg-black/50 p-2 backdrop-blur-md md:block">
      <p className="px-1 pb-1 text-center text-[9px] font-semibold uppercase tracking-[0.18em] text-white/50">
        Area map
      </p>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {edges.map(([a, b]) => {
          const pa = positions.get(a);
          const pb = positions.get(b);
          if (!pa || !pb) return null;
          return (
            <line
              key={`${a}-${b}`}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
          );
        })}
        {nodes.map((n) => {
          const p = positions.get(n.id)!;
          const active = n.id === currentId;
          return (
            <g
              key={n.id}
              onClick={() => onSelect(n.id)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={active ? 8 : 6}
                fill={active ? "#E23744" : "rgba(255,255,255,0.35)"}
                stroke={active ? "#fff" : "rgba(255,255,255,0.5)"}
                strokeWidth={active ? 2 : 1}
              >
                <title>{n.label}</title>
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
