export type LookSource = "google" | "own" | "auto";

export type PovDirection = "forward" | "left" | "right" | "back";

export type PovNode = {
  id: string;
  label: string;
  panoSrc: string;
  links: Partial<Record<PovDirection, string>>;
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
      "Cloud forests, living root bridges, and India's tallest plunge waterfall. Start at Ward's Lake in Shillong, then step the AI POV trail at Nohkalikai Falls.",
    heroImg: "https://images.unsplash.com/photo-1571089336682-9f8d6c1671da?w=700",
    lookSource: "auto",
    googleMapsUrl: "https://www.google.com/maps/@25.5750,91.8870,3a,75y,90h,90t/data=!3m6!1e1",
    lat: 25.575,
    lng: 91.887,
    heading: 90,
    nodes: [
      {
        id: "approach",
        label: "Nohkalikai approach",
        panoSrc: "/panoramas/nohkalikai-approach.jpg",
        links: { forward: "railing", right: "right-overlook" },
      },
      {
        id: "railing",
        label: "Main railing viewpoint",
        panoSrc: "/panoramas/nohkalikai-railing.jpg",
        links: { back: "approach", left: "left-overlook", right: "right-overlook" },
      },
      {
        id: "left-overlook",
        label: "Left cliff overlook",
        panoSrc: "/panoramas/nohkalikai-left.jpg",
        links: { right: "railing", back: "approach" },
      },
      {
        id: "right-overlook",
        label: "Right mist overlook",
        panoSrc: "/panoramas/nohkalikai-right.jpg",
        links: { left: "railing", back: "approach" },
      },
    ],
    startNodeId: "approach",
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
