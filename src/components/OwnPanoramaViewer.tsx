import { useEffect, useRef, useState } from "react";
import type { Viewer } from "@photo-sphere-viewer/core";
import type { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";

export type PanoHotspot = {
  id: string;
  /** Degrees, 0 = initial forward direction */
  yaw: number;
  label: string;
};

type Props = {
  src: string;
  className?: string;
  /** Degrees — camera faces this way after each step */
  yaw?: number;
  hotspots?: PanoHotspot[];
  onHotspotClick?: (id: string) => void;
  onPanoramaLoaded?: () => void;
};

const HOTSPOT_HTML = `
<div class="nn-hotspot">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>
  </svg>
</div>`;

export function OwnPanoramaViewer({
  src,
  className = "",
  yaw = 0,
  hotspots = [],
  onHotspotClick,
  onPanoramaLoaded,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const markersRef = useRef<MarkersPlugin | null>(null);
  const currentSrcRef = useRef(src);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  /* Latest callbacks without re-creating the viewer */
  const onHotspotClickRef = useRef(onHotspotClick);
  onHotspotClickRef.current = onHotspotClick;
  const onLoadedRef = useRef(onPanoramaLoaded);
  onLoadedRef.current = onPanoramaLoaded;

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
          panorama: currentSrcRef.current,
          plugins: [markersMod.MarkersPlugin],
          navbar: [
            "zoom",
            {
              id: "reset-view",
              title: "Reset view",
              content:
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>',
              onClick: (v) => v.rotate({ yaw: 0, pitch: 0 }),
            },
            "fullscreen",
          ],
          defaultYaw: 0,
          touchmoveTwoFingers: false,
          mousewheelCtrlKey: false,
          loadingTxt: "Loading look-around…",
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
              onLoadedRef.current?.();
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
  }, []);

  /* Crossfade to a new panorama when stepping between nodes */
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !ready || currentSrcRef.current === src) return;
    currentSrcRef.current = src;
    setFailed(false);
    viewer
      .setPanorama(src, {
        transition: true,
        speed: 1200,
        showLoader: false,
        position: { yaw: `${yaw}deg`, pitch: 0 },
      })
      .then(() => onLoadedRef.current?.())
      .catch(() => setFailed(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, ready]);

  /* Sync hotspot markers with the current node's links */
  useEffect(() => {
    const markers = markersRef.current;
    if (!markers || !ready) return;
    markers.clearMarkers();
    for (const h of hotspots) {
      markers.addMarker({
        id: h.id,
        position: { yaw: `${h.yaw}deg`, pitch: "-12deg" },
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
          Loading look-around…
        </div>
      )}
    </div>
  );
}
