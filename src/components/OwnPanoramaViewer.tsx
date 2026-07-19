import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { Viewer } from "@photo-sphere-viewer/core";
import type { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";

export type PanoHotspot = {
  id: string;
  /** Degrees, 0 = initial forward direction */
  yaw: number;
  label: string;
};

/** Imperative walking-camera API driven by LookAround */
export type PanoViewerHandle = {
  /** Current camera yaw in degrees */
  getYaw: () => number;
  /** Smoothly turn the camera by a delta in degrees (GTA-style look) */
  rotateBy: (deltaDeg: number) => Promise<void>;
  /** Dolly forward into a new panorama facing `faceYaw` — no fade */
  walkTo: (src: string, faceYaw: number) => Promise<void>;
  /** Teleport to a panorama with a short push (used by mini-map jumps) */
  jumpTo: (src: string, faceYaw: number) => Promise<void>;
};

type Props = {
  /** Panorama shown on first mount; later changes are driven imperatively */
  initialSrc: string;
  className?: string;
  hotspots?: PanoHotspot[];
  onHotspotClick?: (id: string) => void;
  onReady?: () => void;
};

const HOTSPOT_HTML = `
<div class="nn-hotspot">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>
  </svg>
</div>`;

const DEG = Math.PI / 180;
/** Wide immersive default field of view (0 = widest, 100 = tightest) */
const DEFAULT_ZOOM = 25;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** requestAnimationFrame tween helper */
function tween(duration: number, onFrame: (k: number) => void): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / duration);
      onFrame(easeInOut(k));
      if (k < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}

export const OwnPanoramaViewer = forwardRef<PanoViewerHandle, Props>(
  function OwnPanoramaViewer(
    { initialSrc, className = "", hotspots = [], onHotspotClick, onReady },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const markersRef = useRef<MarkersPlugin | null>(null);
    const [failed, setFailed] = useState(false);
    const [ready, setReady] = useState(false);

    const onHotspotClickRef = useRef(onHotspotClick);
    onHotspotClickRef.current = onHotspotClick;
    const onReadyRef = useRef(onReady);
    onReadyRef.current = onReady;

    /* ---- imperative walking camera ---- */
    useImperativeHandle(ref, () => ({
      getYaw: () => {
        const v = viewerRef.current;
        return v ? v.getPosition().yaw / DEG : 0;
      },
      rotateBy: async (deltaDeg) => {
        const v = viewerRef.current;
        if (!v) return;
        const startYaw = v.getPosition().yaw;
        const pitch = v.getPosition().pitch;
        const endYaw = startYaw + deltaDeg * DEG;
        await tween(340, (k) => v.rotate({ yaw: lerp(startYaw, endYaw, k), pitch }));
      },
      walkTo: async (src, faceYaw) => {
        const v = viewerRef.current;
        if (!v) return;
        const faceRad = faceYaw * DEG;
        const startYaw = v.getPosition().yaw;
        const startPitch = v.getPosition().pitch;
        const startZoom = v.getZoomLevel();
        setFailed(false);
        /* 1. turn to travel direction while dollying in */
        await tween(260, (k) => {
          v.rotate({ yaw: lerp(startYaw, faceRad, k), pitch: lerp(startPitch, 0, k) });
          v.zoom(lerp(startZoom, 62, k));
        });
        /* 2. hard-swap the scene (no fade) already zoomed-in */
        try {
          await v.setPanorama(src, {
            transition: false,
            showLoader: false,
            position: { yaw: faceRad, pitch: 0 },
            zoom: 38,
          });
        } catch {
          setFailed(true);
          return;
        }
        /* 3. settle: ease the dolly back out to the wide default view */
        await tween(260, (k) => v.zoom(lerp(38, DEFAULT_ZOOM, k)));
        onReadyRef.current?.();
      },
      jumpTo: async (src, faceYaw) => {
        const v = viewerRef.current;
        if (!v) return;
        const faceRad = faceYaw * DEG;
        const startZoom = v.getZoomLevel();
        setFailed(false);
        await tween(180, (k) => v.zoom(lerp(startZoom, 55, k)));
        try {
          await v.setPanorama(src, {
            transition: false,
            showLoader: false,
            position: { yaw: faceRad, pitch: 0 },
            zoom: 34,
          });
        } catch {
          setFailed(true);
          return;
        }
        await tween(220, (k) => v.zoom(lerp(34, DEFAULT_ZOOM, k)));
        onReadyRef.current?.();
      },
    }));

    /* Create the viewer once */
    useEffect(() => {
      const el = containerRef.current;
      if (!el || typeof window === "undefined") return;

      let cancelled = false;
      let viewer: Viewer | null = null;

      (async () => {
        try {
          const [{ Viewer: ViewerCtor }, markersMod] = await Promise.all([
            import("@photo-sphere-viewer/core"),
            import("@photo-sphere-viewer/markers-plugin"),
            import("@photo-sphere-viewer/core/index.css"),
            import("@photo-sphere-viewer/markers-plugin/index.css"),
          ]);
          if (cancelled || !containerRef.current) return;

          viewer = new ViewerCtor({
            container: containerRef.current,
            panorama: initialSrc,
            plugins: [markersMod.MarkersPlugin],
            navbar: [
              "zoom",
              {
                id: "reset-view",
                title: "Reset view",
                content:
                  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>',
                onClick: (v) => v.animate({ yaw: 0, pitch: 0, zoom: DEFAULT_ZOOM, speed: "8rpm" }),
              },
              "fullscreen",
            ],
            defaultYaw: 0,
            defaultZoomLvl: DEFAULT_ZOOM,
            touchmoveTwoFingers: false,
            mousewheelCtrlKey: false,
            loadingTxt: "Loading walk-through…",
          });
          viewerRef.current = viewer;
          markersRef.current = viewer.getPlugin<MarkersPlugin>(markersMod.MarkersPlugin);

          markersRef.current?.addEventListener("select-marker", (e) => {
            onHotspotClickRef.current?.(e.marker.id);
          });

          viewer.addEventListener(
            "ready",
            () => {
              if (!cancelled) {
                setReady(true);
                onReadyRef.current?.();
              }
            },
            { once: true },
          );
          viewer.addEventListener("panorama-error", () => {
            if (!cancelled) setFailed(true);
          });
        } catch {
          if (!cancelled) setFailed(true);
        }
      })();

      return () => {
        cancelled = true;
        viewer?.destroy();
        viewerRef.current = null;
        markersRef.current = null;
      };
      // Only mount once; later panoramas are driven through the imperative handle
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* Sync hotspot markers with the current node's links */
    useEffect(() => {
      const markers = markersRef.current;
      if (!markers || !ready) return;
      markers.clearMarkers();
      for (const h of hotspots) {
        markers.addMarker({
          id: h.id,
          position: { yaw: `${h.yaw}deg`, pitch: "-10deg" },
          html: HOTSPOT_HTML,
          size: { width: 44, height: 44 },
          anchor: "center center",
          tooltip: h.label,
          style: { cursor: "pointer" },
        });
      }
    }, [hotspots, ready]);

    if (failed) {
      return (
        <div
          className={`grid place-items-center bg-neutral-900 text-center text-sm text-white/70 ${className}`}
        >
          <p>Panorama coming soon for this viewpoint.</p>
        </div>
      );
    }

    return (
      <div className={`relative h-full w-full overflow-hidden bg-black ${className}`}>
        <div ref={containerRef} className="h-full w-full" />
        {!ready && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/50 text-sm text-white/80">
            Loading walk-through…
          </div>
        )}
      </div>
    );
  },
);
