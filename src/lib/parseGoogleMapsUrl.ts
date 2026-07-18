export type ParsedMapsLocation = {
  lat: number;
  lng: number;
  heading?: number;
  pitch?: number;
  fov?: number;
};

/**
 * Extract lat/lng (and optional Street View heading) from common Google Maps /
 * Street View share URLs. Returns null when nothing parseable is found.
 */
export function parseGoogleMapsUrl(url: string): ParsedMapsLocation | null {
  if (!url?.trim()) return null;

  let decoded = url.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    /* keep raw */
  }

  /* @lat,lng,zoom or @lat,lng,3a,75y,headingh,pitcht */
  const atMatch = decoded.match(
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,[\d.]+[a-z])?(?:,(\d+(?:\.\d+)?)y)?(?:,(\d+(?:\.\d+)?)h)?(?:,(\d+(?:\.\d+)?)t)?/i,
  );
  if (atMatch) {
    const lat = Number(atMatch[1]);
    const lng = Number(atMatch[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const fov = atMatch[3] != null ? Number(atMatch[3]) : undefined;
      const heading = atMatch[4] != null ? Number(atMatch[4]) : undefined;
      const pitchRaw = atMatch[5] != null ? Number(atMatch[5]) : undefined;
      /* Street View "t" is often 90 = horizon; convert to pitch where 0 is horizon */
      const pitch =
        pitchRaw != null && Number.isFinite(pitchRaw) ? pitchRaw - 90 : undefined;
      return {
        lat,
        lng,
        heading: Number.isFinite(heading) ? heading : undefined,
        pitch: Number.isFinite(pitch) ? pitch : undefined,
        fov: Number.isFinite(fov) ? fov : undefined,
      };
    }
  }

  /* !3dLAT!4dLNG (place / Street View data blobs) */
  const d3 = decoded.match(/!3d(-?\d+(?:\.\d+)?)/);
  const d4 = decoded.match(/!4d(-?\d+(?:\.\d+)?)/);
  if (d3 && d4) {
    const lat = Number(d3[1]);
    const lng = Number(d4[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const h = decoded.match(/!1d(-?\d+(?:\.\d+)?)/); /* sometimes heading */
      const headingMatch = decoded.match(/,(\d+(?:\.\d+)?)h/);
      return {
        lat,
        lng,
        heading: headingMatch ? Number(headingMatch[1]) : h ? Number(h[1]) : undefined,
      };
    }
  }

  /* query=lat,lng or q=lat,lng */
  const qMatch = decoded.match(/[?&](?:q|query)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (qMatch) {
    const lat = Number(qMatch[1]);
    const lng = Number(qMatch[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }

  /* ll=lat,lng */
  const llMatch = decoded.match(/[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (llMatch) {
    const lat = Number(llMatch[1]);
    const lng = Number(llMatch[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }

  return null;
}

/** Prefer explicit lat/lng on the destination; otherwise parse the share URL. */
export function resolveDestinationCoords(dest: {
  lat?: number;
  lng?: number;
  heading?: number;
  googleMapsUrl?: string;
}): ParsedMapsLocation | null {
  if (
    typeof dest.lat === "number" &&
    typeof dest.lng === "number" &&
    Number.isFinite(dest.lat) &&
    Number.isFinite(dest.lng)
  ) {
    const fromUrl = dest.googleMapsUrl ? parseGoogleMapsUrl(dest.googleMapsUrl) : null;
    return {
      lat: dest.lat,
      lng: dest.lng,
      heading: dest.heading ?? fromUrl?.heading,
      pitch: fromUrl?.pitch,
      fov: fromUrl?.fov,
    };
  }
  if (dest.googleMapsUrl) return parseGoogleMapsUrl(dest.googleMapsUrl);
  return null;
}
