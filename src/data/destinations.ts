export type LookSource = "google" | "own" | "auto";

export type PovDirection = "forward" | "left" | "right" | "back";

export type PovNode = {
  id: string;
  label: string;
  panoSrc: string;
  links: Partial<Record<PovDirection, string>>;
  /** Famous place this point belongs to (groups nodes into mini-tours). */
  place?: string;
  /** Marks views people cannot normally reach on foot. */
  rare?: boolean;
};

export type Destination = {
  slug: string;
  name: string;
  tag: string;
  stays: string;
  description: string;
  heroImg: string;
  lookSource: LookSource;
  /** Raw Google Maps / Street View share link (optional). */
  googleMapsUrl?: string;
  lat?: number;
  lng?: number;
  heading?: number;
  /** Single-pano fallback when no POV graph is defined. */
  panoSrc?: string;
  /** Walkable POV graph for AI / own panoramas. */
  nodes?: PovNode[];
  startNodeId?: string;
};

export const destinations: Destination[] = [
  {
    slug: "meghalaya",
    name: "Meghalaya",
    tag: "Living root bridges · Ward's Lake · Nohkalikai",
    stays: "480+ stays",
    description:
      "Five famous Meghalaya wonders stitched into one virtual trip — Nohkalikai Falls, the Double Decker Root Bridge, Dawki's Umngot River, Mawsmai Cave and Laitlum Canyon. Each place includes rare angles people can't normally reach, recreated with AI from real location references.",
    heroImg: "https://images.unsplash.com/photo-1571089336682-9f8d6c1671da?w=700",
    lookSource: "own",
    nodes: [
      {
        id: "nohkalikai-viewpoint",
        place: "Nohkalikai Falls",
        label: "Public viewpoint",
        panoSrc: "/panoramas/mgh-nohkalikai-viewpoint.jpg",
        links: { forward: "nohkalikai-base" },
      },
      {
        id: "nohkalikai-base",
        place: "Nohkalikai Falls",
        label: "Plunge pool base",
        rare: true,
        panoSrc: "/panoramas/mgh-nohkalikai-base.jpg",
        links: { back: "nohkalikai-viewpoint", forward: "nohkalikai-top" },
      },
      {
        id: "nohkalikai-top",
        place: "Nohkalikai Falls",
        label: "Top of the falls",
        rare: true,
        panoSrc: "/panoramas/mgh-nohkalikai-top.jpg",
        links: { back: "nohkalikai-base", forward: "rootbridge-front" },
      },
      {
        id: "rootbridge-front",
        place: "Double Decker Root Bridge",
        label: "Bridge approach",
        panoSrc: "/panoramas/mgh-rootbridge-front.jpg",
        links: { back: "nohkalikai-top", forward: "rootbridge-deck" },
      },
      {
        id: "rootbridge-deck",
        place: "Double Decker Root Bridge",
        label: "On the root deck",
        panoSrc: "/panoramas/mgh-rootbridge-deck.jpg",
        links: { back: "rootbridge-front", forward: "rootbridge-pool" },
      },
      {
        id: "rootbridge-pool",
        place: "Double Decker Root Bridge",
        label: "Rainbow Falls blue pool",
        rare: true,
        panoSrc: "/panoramas/mgh-rootbridge-pool.jpg",
        links: { back: "rootbridge-deck", forward: "dawki-boat" },
      },
      {
        id: "dawki-boat",
        place: "Dawki · Umngot River",
        label: "Crystal water boat ride",
        panoSrc: "/panoramas/mgh-dawki-boat.jpg",
        links: { back: "rootbridge-pool", forward: "dawki-bridge" },
      },
      {
        id: "dawki-bridge",
        place: "Dawki · Umngot River",
        label: "Suspension bridge bank",
        panoSrc: "/panoramas/mgh-dawki-bridge.jpg",
        links: { back: "dawki-boat", forward: "dawki-gorge" },
      },
      {
        id: "dawki-gorge",
        place: "Dawki · Umngot River",
        label: "Hidden border gorge",
        rare: true,
        panoSrc: "/panoramas/mgh-dawki-gorge.jpg",
        links: { back: "dawki-bridge", forward: "mawsmai-entrance" },
      },
      {
        id: "mawsmai-entrance",
        place: "Mawsmai Cave",
        label: "Cave mouth",
        panoSrc: "/panoramas/mgh-mawsmai-entrance.jpg",
        links: { back: "dawki-gorge", forward: "mawsmai-passage" },
      },
      {
        id: "mawsmai-passage",
        place: "Mawsmai Cave",
        label: "Lit limestone passage",
        panoSrc: "/panoramas/mgh-mawsmai-passage.jpg",
        links: { back: "mawsmai-entrance", forward: "mawsmai-chamber" },
      },
      {
        id: "mawsmai-chamber",
        place: "Mawsmai Cave",
        label: "Restricted deep chamber",
        rare: true,
        panoSrc: "/panoramas/mgh-mawsmai-chamber.jpg",
        links: { back: "mawsmai-passage", forward: "laitlum-ridge" },
      },
      {
        id: "laitlum-ridge",
        place: "Laitlum Canyon",
        label: "Ridge viewpoint",
        panoSrc: "/panoramas/mgh-laitlum-ridge.jpg",
        links: { back: "mawsmai-chamber", forward: "laitlum-steps" },
      },
      {
        id: "laitlum-steps",
        place: "Laitlum Canyon",
        label: "Cliff stairway",
        panoSrc: "/panoramas/mgh-laitlum-steps.jpg",
        links: { back: "laitlum-ridge", forward: "laitlum-valley" },
      },
      {
        id: "laitlum-valley",
        place: "Laitlum Canyon",
        label: "Valley floor stream",
        rare: true,
        panoSrc: "/panoramas/mgh-laitlum-valley.jpg",
        links: { back: "laitlum-steps" },
      },
    ],
    startNodeId: "nohkalikai-viewpoint",
  },
  {
    slug: "arunachal-pradesh",
    name: "Arunachal Pradesh",
    tag: "Tawang Monastery & Sela Pass",
    stays: "310+ stays",
    description:
      "India's largest monastery perched above the Tawang Chu valley. Auto mode tries Google Street View on the access road, then falls back to an AI courtyard walk.",
    heroImg: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=700",
    lookSource: "auto",
    googleMapsUrl: "https://www.google.com/maps/@27.5864,91.8575,3a,75y,180h,90t/data=!3m6!1e1",
    lat: 27.5864,
    lng: 91.8575,
    heading: 180,
    nodes: [
      {
        id: "entrance",
        label: "Monastery entrance",
        panoSrc: "/panoramas/tawang-entrance.jpg",
        links: { forward: "courtyard" },
      },
      {
        id: "courtyard",
        label: "Inner courtyard",
        panoSrc: "/panoramas/tawang-courtyard.jpg",
        links: { back: "entrance", forward: "valley" },
      },
      {
        id: "valley",
        label: "Valley overlook",
        panoSrc: "/panoramas/tawang-valley.jpg",
        links: { back: "courtyard" },
      },
    ],
    startNodeId: "entrance",
  },
  {
    slug: "sikkim",
    name: "Sikkim",
    tag: "MG Marg · Kanchenjunga views",
    stays: "520+ stays",
    description:
      "Walk the pedestrian heart of Gangtok on MG Marg with live Google Street View, then look out toward the Kanchenjunga skyline.",
    heroImg: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=700",
    lookSource: "google",
    googleMapsUrl: "https://www.google.com/maps/@27.3257,88.6122,3a,75y,45h,90t/data=!3m6!1e1",
    lat: 27.3257,
    lng: 88.6122,
    heading: 45,
    panoSrc: "/panoramas/gangtok-mg-marg.jpg",
  },
  {
    slug: "nagaland",
    name: "Nagaland",
    tag: "Hornbill Festival",
    stays: "190+ stays",
    description:
      "Village plazas and festival grounds of the Naga hills — an AI recreation until Street View coverage reaches Kisama.",
    heroImg: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=700",
    lookSource: "own",
    nodes: [
      {
        id: "plaza",
        label: "Village plaza",
        panoSrc: "/panoramas/nagaland-plaza.jpg",
        links: { forward: "morung", right: "trail" },
      },
      {
        id: "morung",
        label: "Morung front",
        panoSrc: "/panoramas/nagaland-morung.jpg",
        links: { back: "plaza" },
      },
      {
        id: "trail",
        label: "Hill trail edge",
        panoSrc: "/panoramas/nagaland-trail.jpg",
        links: { left: "plaza" },
      },
    ],
    startNodeId: "plaza",
  },
  {
    slug: "assam",
    name: "Assam",
    tag: "Kaziranga safaris",
    stays: "640+ stays",
    description:
      "Tall grassland and misty jeep tracks on the fringe of Kaziranga — AI POV walk of a safari viewpoint.",
    heroImg: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=700",
    lookSource: "own",
    lat: 26.5253,
    lng: 92.9924,
    nodes: [
      {
        id: "track",
        label: "Jeep track",
        panoSrc: "/panoramas/kaziranga-track.jpg",
        links: { forward: "tower" },
      },
      {
        id: "tower",
        label: "Watchtower view",
        panoSrc: "/panoramas/kaziranga-tower.jpg",
        links: { back: "track", left: "grass" },
      },
      {
        id: "grass",
        label: "Grassland edge",
        panoSrc: "/panoramas/kaziranga-grass.jpg",
        links: { right: "tower" },
      },
    ],
    startNodeId: "track",
  },
  {
    slug: "manipur",
    name: "Manipur",
    tag: "Loktak floating lake",
    stays: "140+ stays",
    description:
      "Phumdis and open water on Loktak Lake — an AI lakeside look-around until native Street View arrives.",
    heroImg: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700",
    lookSource: "own",
    panoSrc: "/panoramas/loktak.jpg",
  },
  {
    slug: "mizoram",
    name: "Mizoram",
    tag: "Blue mountain trails",
    stays: "120+ stays",
    description:
      "Ridgelines above Aizawl — AI recreation of a Blue Mountain trailhead look-around.",
    heroImg: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700",
    lookSource: "own",
    panoSrc: "/panoramas/mizoram-ridge.jpg",
  },
  {
    slug: "tripura",
    name: "Tripura",
    tag: "Ujjayanta palaces",
    stays: "110+ stays",
    description:
      "Palace gardens of Agartala — AI courtyard panorama for a first virtual step into Tripura.",
    heroImg: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=700",
    lookSource: "own",
    panoSrc: "/panoramas/tripura-palace.jpg",
  },
];

export function getDestination(slug: string): Destination | undefined {
  return destinations.find((d) => d.slug === slug);
}

export function getDestinationNode(dest: Destination, nodeId?: string): PovNode | undefined {
  if (!dest.nodes?.length) return undefined;
  const id = nodeId ?? dest.startNodeId ?? dest.nodes[0]?.id;
  return dest.nodes.find((n) => n.id === id) ?? dest.nodes[0];
}
