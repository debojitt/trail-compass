import { useCallback, useEffect, useMemo, useState } from "react";
import type { Destination, PovDirection } from "@/data/destinations";
import { getDestinationNode } from "@/data/destinations";
import { resolveDestinationCoords } from "@/lib/parseGoogleMapsUrl";
import { GoogleStreetViewEmbed } from "@/components/GoogleStreetViewEmbed";
import { OwnPanoramaViewer } from "@/components/OwnPanoramaViewer";
import { PovControls } from "@/components/PovControls";

type ActiveSource = "google" | "own" | "empty";

const YAW_BY_DIR: Record<PovDirection, number> = {
  forward: 0,
  right: 90,
  back: 180,
  left: -90,
};

type Props = {
  destination: Destination;
  className?: string;
};

export function LookAround({ destination, className = "" }: Props) {
  const coords = useMemo(() => resolveDestinationCoords(destination), [destination]);
  const hasNodes = Boolean(destination.nodes?.length);
  const startId = destination.startNodeId ?? destination.nodes?.[0]?.id;

  const [nodeId, setNodeId] = useState(startId);
  const [yaw, setYaw] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [source, setSource] = useState<ActiveSource>(() => {
    if (destination.lookSource === "own") return hasNodes || destination.panoSrc ? "own" : "empty";
    if (destination.lookSource === "google") return coords ? "google" : hasNodes || destination.panoSrc ? "own" : "empty";
    /* auto */
    if (coords) return "google";
    if (hasNodes || destination.panoSrc) return "own";
    return "empty";
  });

  /* Reset when destination changes */
  useEffect(() => {
    setNodeId(destination.startNodeId ?? destination.nodes?.[0]?.id);
    setYaw(0);
    setTransitioning(false);
    if (destination.lookSource === "own") {
      setSource(destination.nodes?.length || destination.panoSrc ? "own" : "empty");
    } else if (destination.lookSource === "google") {
      setSource(coords ? "google" : destination.nodes?.length || destination.panoSrc ? "own" : "empty");
    } else {
      setSource(coords ? "google" : destination.nodes?.length || destination.panoSrc ? "own" : "empty");
    }
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

  const move = useCallback(
    (dir: PovDirection) => {
      if (!node?.links[dir] || transitioning) return;
      const nextId = node.links[dir]!;
      setTransitioning(true);
      setYaw((y) => y + YAW_BY_DIR[dir]);
      window.setTimeout(() => {
        setNodeId(nextId);
        setTransitioning(false);
      }, 280);
    },
    [node, transitioning],
  );

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
          <OwnPanoramaViewer src={ownSrc} yaw={yaw} transitioning={transitioning} />
          {node && (
            <PovControls node={node} onMove={move} disabled={transitioning} />
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
