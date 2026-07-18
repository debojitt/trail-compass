import { useEffect, useRef, useState } from "react";
import type { Viewer } from "@photo-sphere-viewer/core";

type Props = {
  src: string;
  className?: string;
  /** Degrees — applied after each panorama load */
  yaw?: number;
  transitioning?: boolean;
};

export function OwnPanoramaViewer({
  src,
  className = "",
  yaw = 0,
  transitioning = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === "undefined") return;

    let cancelled = false;
    let viewer: Viewer | null = null;

    setFailed(false);
    setReady(false);

    (async () => {
      try {
        const [{ Viewer: ViewerCtor }, css] = await Promise.all([
          import("@photo-sphere-viewer/core"),
          import("@photo-sphere-viewer/core/index.css"),
        ]);
        void css;
        if (cancelled || !containerRef.current) return;

        viewer = new ViewerCtor({
          container: containerRef.current,
          panorama: src,
          navbar: ["zoom", "fullscreen"],
          defaultYaw: `${yaw}deg`,
          touchmoveTwoFingers: false,
          mousewheelCtrlKey: false,
          loadingTxt: "Loading look-around…",
        });
        viewerRef.current = viewer;
        viewer.addEventListener("ready", () => {
          if (!cancelled) setReady(true);
        }, { once: true });
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
    };
    /* yaw applied in separate effect after ready */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    const v = viewerRef.current;
    if (!v || !ready) return;
    try {
      v.rotate({ yaw: `${yaw}deg`, pitch: 0 });
    } catch {
      /* ignore */
    }
  }, [yaw, ready]);

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
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{
          transform: transitioning ? "scale(1.12)" : "scale(1)",
          opacity: transitioning ? 0.55 : 1,
          transition: "transform 0.45s ease, opacity 0.35s ease",
        }}
      />
      {!ready && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/50 text-sm text-white/80">
          Loading look-around…
        </div>
      )}
    </div>
  );
}
