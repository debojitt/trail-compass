import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

type Props = {
  lat: number;
  lng: number;
  heading?: number;
  pitch?: number;
  className?: string;
  onUnavailable?: () => void;
  onReady?: () => void;
};

let loaderPromise: Promise<typeof google> | null = null;

function loadMaps(apiKey: string) {
  if (!loaderPromise) {
    const loader = new Loader({
      apiKey,
      version: "weekly",
    });
    loaderPromise = loader.load();
  }
  return loaderPromise;
}

export function GoogleStreetViewEmbed({
  lat,
  lng,
  heading = 0,
  pitch = 0,
  className = "",
  onUnavailable,
  onReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (!key) {
      setError("Missing VITE_GOOGLE_MAPS_API_KEY");
      onUnavailable?.();
      return;
    }

    let cancelled = false;
    let panorama: google.maps.StreetViewPanorama | null = null;

    (async () => {
      try {
        const g = await loadMaps(key);
        if (cancelled || !containerRef.current) return;

        const service = new g.maps.StreetViewService();
        const result = await service.getPanorama({
          location: { lat, lng },
          radius: 120,
          source: g.maps.StreetViewSource.OUTDOOR,
        });

        if (cancelled || !containerRef.current) return;

        const location = result.data.location;
        if (!location?.latLng) {
          setError("No Street View nearby");
          onUnavailable?.();
          return;
        }

        panorama = new g.maps.StreetViewPanorama(containerRef.current, {
          position: location.latLng,
          pov: { heading, pitch },
          zoom: 1,
          addressControl: false,
          linksControl: true,
          panControl: true,
          enableCloseButton: false,
          fullscreenControl: true,
          motionTracking: false,
          showRoadLabels: true,
        });

        onReady?.();
      } catch {
        if (!cancelled) {
          setError("Street View unavailable");
          onUnavailable?.();
        }
      }
    })();

    return () => {
      cancelled = true;
      if (panorama) {
        /* detach */
        panorama.setVisible(false);
      }
    };
  }, [lat, lng, heading, pitch, onUnavailable, onReady]);

  if (error) {
    return (
      <div
        className={`grid place-items-center bg-neutral-900 text-center text-sm text-white/70 ${className}`}
      >
        <p>{error}</p>
      </div>
    );
  }

  return <div ref={containerRef} className={`h-full w-full bg-black ${className}`} />;
}
