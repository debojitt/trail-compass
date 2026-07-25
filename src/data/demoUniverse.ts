/**
 * Rich demo universe for the Northnest prototype.
 * All imagery/videos use public sample URLs (Unsplash + free sample video hosts).
 */

export type AccountType = "traveler" | "creator" | "host" | "planner" | "admin";

export type DemoAccount = {
  id: string;
  password: string;
  name: string;
  email: string;
  type: AccountType;
  handle?: string;
  avatar: string;
  verified?: boolean;
  bio?: string;
  /** Cover image for Instagram-like profiles */
  cover?: string;
  /** Host home slug or planner subdomain */
  slug?: string;
  subdomain?: string;
};

export type PlaceClip = {
  id: string;
  place: string;
  state: string;
  priceMin: number;
  priceMax: number;
  videoUrl: string;
  poster: string;
  likes: number;
  rating: number;
  tags: string[];
  blurb: string;
};

export type ItineraryStop = {
  placeId: string;
  day: number;
  note: string;
};

export type PublishedItinerary = {
  id: string;
  code: string;
  title: string;
  publisherId: string;
  publisherName: string;
  publisherType: "traveler" | "creator" | "host" | "planner";
  days: number;
  priceFrom: number;
  rating: number;
  likes: number;
  reviews: number;
  cover: string;
  photos: string[];
  videos: string[];
  stops: { place: string; day: number; note: string; img: string }[];
  experience: string;
  commissionPct: number;
  /** Only true when generated after COMPLETED booking (or creator/host/planner publish) */
  fromCompletedBooking: boolean;
};

export type CreatorPlan = {
  id: string;
  creatorId: string;
  title: string;
  cover: string;
  photos: string[];
  videos: string[];
  days: number;
  priceFrom: number;
  likes: number;
  rating: number;
  experience: string;
  stops: { place: string; day: number; note: string; img: string }[];
  /** CMS: visible on public profile when true */
  published?: boolean;
  publishCode?: string;
};

export type HostHome = {
  id: string;
  hostId: string;
  name: string;
  slug: string;
  place: string;
  pricePerNight: number;
  rating: number;
  reviews: number;
  photos: string[];
  amenities: string[];
  description: string;
  /** CMS: appears on public host profile when true */
  listed?: boolean;
  /** Demo occupancy / bookings count */
  bookingsDemo?: number;
};

export type HostTrip48h = {
  id: string;
  hostId: string;
  homeId: string;
  title: string;
  referralCode: string;
  hoursWindow: 48;
  price: number;
  cover: string;
  places: string[];
  food: string[];
  cabs: string[];
  description: string;
};

/** Editable in-city inventory on host dashboards */
export type HostCityItem = {
  id: string;
  hostId: string;
  kind: "cab" | "place" | "restaurant";
  name: string;
  detail: string;
  priceHint?: number;
};

export type GroupInvite = {
  id: string;
  code: string;
  title: string;
  plannerName: string;
  plannerId: string;
  cover: string;
  pricePerSeat: number;
  emiPerMonth: number;
  seats: {
    id: string;
    label: string;
    claimedBy: string | null;
    paid: boolean;
    emiPaid: number;
  }[];
};

export type FreelancePlan = {
  id: string;
  plannerId: string;
  title: string;
  cover: string;
  days: number;
  priceFrom: number;
  netProfit: number;
  plannerSharePct: 60;
  vendorsMaskedUntilHours: number;
  photos: string[];
  stops: { place: string; day: number; note: string; vendorMasked: string; vendorReal: string }[];
  published?: boolean;
  /** Client pipeline stage for CMS */
  pipelineStage?: "lead" | "proposal" | "booked" | "completed";
};

/* Sample loop videos (public CDN samples) */
export const SAMPLE_VIDEOS = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
] as const;

const U = (id: string, w = 900) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

/* ============ DEMO ACCOUNTS ============ */

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "traveler1",
    password: "demo123",
    name: "Ananya Sharma",
    email: "ananya@demo.northnest",
    type: "traveler",
    avatar: U("photo-1494790108377-be9c29b29330", 200),
    bio: "Solo trekker · Meghalaya addict",
  },
  {
    id: "traveler2",
    password: "demo123",
    name: "Rohan Mehta",
    email: "rohan@demo.northnest",
    type: "traveler",
    avatar: U("photo-1500648767791-00dcc994a43e", 200),
    bio: "Weekend warrior · Group trip planner",
  },
  {
    id: "creator1",
    password: "demo123",
    name: "Megha Trails",
    email: "megha@demo.northnest",
    type: "creator",
    handle: "meghatrails",
    verified: true,
    avatar: U("photo-1534528741775-53994a69daeb", 200),
    bio: "Verified creator · Living-root circuits & monsoon films",
  },
  {
    id: "creator2",
    password: "demo123",
    name: "Eastern Echo",
    email: "echo@demo.northnest",
    type: "creator",
    handle: "easternecho",
    verified: true,
    avatar: U("photo-1524504388940-b1c1722653e1", 200),
    bio: "Arunachal & Sikkim storyteller · ILP tips",
  },
  {
    id: "host1",
    password: "demo123",
    name: "Lyngdoh Family",
    email: "lyngdoh@demo.northnest",
    type: "host",
    slug: "khasi-bamboo",
    avatar: U("photo-1544005313-94ddf0286df2", 200),
    bio: "Homestay hosts in Sohra — zero host commission on NORTHNEST",
  },
  {
    id: "host2",
    password: "demo123",
    name: "Apatani Nest",
    email: "apatani@demo.northnest",
    type: "host",
    slug: "ziro-eco",
    avatar: U("photo-1438761681033-6461ffad8d80", 200),
    bio: "Ziro valley eco huts · rice-field decks",
  },
  {
    id: "planner1",
    password: "demo123",
    name: "NestCraft Plans",
    email: "nestcraft@demo.northnest",
    type: "planner",
    subdomain: "nestcraft",
    verified: true,
    avatar: U("photo-1472099645785-5658abf4ff4e", 200),
    bio: "Freelance planner · 60% net profit · NORTHNEST fulfills 100%",
  },
  {
    id: "planner2",
    password: "demo123",
    name: "PeakPath India",
    email: "peakpath@demo.northnest",
    type: "planner",
    subdomain: "peakpath",
    verified: true,
    avatar: U("photo-1507003211169-0a1dd7228f2d", 200),
    bio: "High-altitude circuits · Echo SOS always on",
  },
  {
    id: "admin1",
    password: "demo123",
    name: "NORTHNEST Ops",
    email: "ops@demo.northnest",
    type: "admin",
    avatar: U("photo-1560250097-0b93528c311a", 200),
    bio: "Demo admin · fulfillment overview",
  },
];

/* ============ SWIPE FEED PLACES (10+) ============ */

export const PLACE_CLIPS: PlaceClip[] = [
  {
    id: "clip-sohra",
    place: "Nohkalikai Falls",
    state: "Meghalaya",
    priceMin: 1800,
    priceMax: 4200,
    videoUrl: SAMPLE_VIDEOS[0],
    poster: U("photo-1571089336682-9f8d6c1671da"),
    likes: 12840,
    rating: 4.9,
    tags: ["waterfall", "monsoon"],
    blurb: "Asia's tallest plunge — roar after rain.",
  },
  {
    id: "clip-root",
    place: "Double Decker Root Bridge",
    state: "Meghalaya",
    priceMin: 1200,
    priceMax: 2800,
    videoUrl: SAMPLE_VIDEOS[1],
    poster: U("photo-1544966503-7cc5ac882d5f"),
    likes: 22100,
    rating: 4.8,
    tags: ["trek", "living root"],
    blurb: "3,500 steps into a living cathedral.",
  },
  {
    id: "clip-dawki",
    place: "Umngot River, Dawki",
    state: "Meghalaya",
    priceMin: 900,
    priceMax: 2500,
    videoUrl: SAMPLE_VIDEOS[2],
    poster: U("photo-1439066615861-d1af74d74000"),
    likes: 18920,
    rating: 4.7,
    tags: ["boat", "crystal water"],
    blurb: "Boats float on glass-clear water.",
  },
  {
    id: "clip-tawang",
    place: "Tawang Monastery",
    state: "Arunachal",
    priceMin: 2200,
    priceMax: 5500,
    videoUrl: SAMPLE_VIDEOS[3],
    poster: U("photo-1506905925346-21bda4d32df4"),
    likes: 15400,
    rating: 4.8,
    tags: ["monastery", "ILP"],
    blurb: "400-year gompa above the clouds.",
  },
  {
    id: "clip-sela",
    place: "Sela Pass",
    state: "Arunachal",
    priceMin: 3000,
    priceMax: 7000,
    videoUrl: SAMPLE_VIDEOS[4],
    poster: U("photo-1464822759023-fed622ff2c3b"),
    likes: 9800,
    rating: 4.6,
    tags: ["pass", "13,700 ft"],
    blurb: "Frozen lakes and prayer flags at altitude.",
  },
  {
    id: "clip-ziro",
    place: "Ziro Paddy Fields",
    state: "Arunachal",
    priceMin: 1500,
    priceMax: 3600,
    videoUrl: SAMPLE_VIDEOS[5],
    poster: U("photo-1470071459604-3b5ec3a7fe05"),
    likes: 11200,
    rating: 4.7,
    tags: ["festival", "Apatani"],
    blurb: "Rice terraces and music under open sky.",
  },
  {
    id: "clip-kaziranga",
    place: "Kaziranga Central Range",
    state: "Assam",
    priceMin: 2500,
    priceMax: 6000,
    videoUrl: SAMPLE_VIDEOS[6],
    poster: U("photo-1564760055775-d63b17a55c44"),
    likes: 20100,
    rating: 4.9,
    tags: ["safari", "rhino"],
    blurb: "Dawn jeep rides with one-horned rhinos.",
  },
  {
    id: "clip-gangtok",
    place: "MG Marg, Gangtok",
    state: "Sikkim",
    priceMin: 2000,
    priceMax: 4800,
    videoUrl: SAMPLE_VIDEOS[7],
    poster: U("photo-1587061949409-02df41d5e562"),
    likes: 8700,
    rating: 4.5,
    tags: ["town", "evening"],
    blurb: "Pedestrian plaza under Kanchenjunga light.",
  },
  {
    id: "clip-tsomgo",
    place: "Tsomgo Lake",
    state: "Sikkim",
    priceMin: 2800,
    priceMax: 5200,
    videoUrl: SAMPLE_VIDEOS[8],
    poster: U("photo-1519681393784-d120267933ba"),
    likes: 14300,
    rating: 4.6,
    tags: ["lake", "yak"],
    blurb: "Glacial lake with yak rides and tea stalls.",
  },
  {
    id: "clip-hornbill",
    place: "Kisama Heritage Village",
    state: "Nagaland",
    priceMin: 1600,
    priceMax: 4000,
    videoUrl: SAMPLE_VIDEOS[9],
    poster: U("photo-1533105079780-92b9be482077"),
    likes: 16750,
    rating: 4.9,
    tags: ["Hornbill", "culture"],
    blurb: "December dances, log drums, night carnival.",
  },
  {
    id: "clip-loktak",
    place: "Loktak Lake",
    state: "Manipur",
    priceMin: 1400,
    priceMax: 3200,
    videoUrl: SAMPLE_VIDEOS[0],
    poster: U("photo-1501785888041-af3ef285b470"),
    likes: 7600,
    rating: 4.7,
    tags: ["phumdi", "sangai"],
    blurb: "Floating islands on the world's unique lake.",
  },
  {
    id: "clip-mawlynnong",
    place: "Mawlynnong Village",
    state: "Meghalaya",
    priceMin: 1100,
    priceMax: 2600,
    videoUrl: SAMPLE_VIDEOS[1],
    poster: U("photo-1441974231531-c6227db76b6e"),
    likes: 13400,
    rating: 4.8,
    tags: ["cleanest", "skywalk"],
    blurb: "Asia's cleanest village + bamboo skywalk.",
  },
];

/* ============ PUBLISHED ITINERARIES (10+) ============ */

function stopsFrom(places: string[], notes: string[]) {
  return places.map((place, i) => ({
    place,
    day: i + 1,
    note: notes[i] ?? "Explore freely",
    img: PLACE_CLIPS[i % PLACE_CLIPS.length].poster,
  }));
}

export const PUBLISHED_ITINERARIES: PublishedItinerary[] = [
  {
    id: "pub-1",
    code: "NN-MEGH-804",
    title: "Ananya's Monsoon Meghalaya",
    publisherId: "traveler1",
    publisherName: "Ananya Sharma",
    publisherType: "traveler",
    days: 5,
    priceFrom: 18400,
    rating: 4.9,
    likes: 842,
    reviews: 56,
    cover: U("photo-1571089336682-9f8d6c1671da"),
    photos: [U("photo-1571089336682-9f8d6c1671da"), U("photo-1439066615861-d1af74d74000"), U("photo-1441974231531-c6227db76b6e")],
    videos: [SAMPLE_VIDEOS[0], SAMPLE_VIDEOS[1]],
    stops: stopsFrom(
      ["Shillong", "Sohra", "Nongriat", "Dawki", "Mawlynnong"],
      ["Ward's Lake dusk", "Nohkalikai + caves", "Root bridge trek", "Clear-water boats", "Village + skywalk"],
    ),
    experience: "Completed trip with living-root trek and monsoon falls. Homestays + local guides.",
    commissionPct: 8,
    fromCompletedBooking: true,
  },
  {
    id: "pub-2",
    code: "NN-TAWA-221",
    title: "Rohan's Tawang Alpine",
    publisherId: "traveler2",
    publisherName: "Rohan Mehta",
    publisherType: "traveler",
    days: 7,
    priceFrom: 31200,
    rating: 4.7,
    likes: 610,
    reviews: 41,
    cover: U("photo-1506905925346-21bda4d32df4"),
    photos: [U("photo-1506905925346-21bda4d32df4"), U("photo-1464822759023-fed622ff2c3b")],
    videos: [SAMPLE_VIDEOS[3]],
    stops: stopsFrom(
      ["Bhalukpong", "Bomdila", "Sela", "Tawang", "Bum La", "Dirang", "Tezpur"],
      ["ILP checkpost", "Dzong stay", "Pass day", "Gompa sunrise", "Army permit lake", "Hot springs", "Drop"],
    ),
    experience: "Altitude-aware circuit with buffer day. 4×4 convoy.",
    commissionPct: 8,
    fromCompletedBooking: true,
  },
  {
    id: "pub-3",
    code: "NN-CREA-441",
    title: "Megha's Root Bridge Film Route",
    publisherId: "creator1",
    publisherName: "Megha Trails",
    publisherType: "creator",
    days: 4,
    priceFrom: 15600,
    rating: 4.95,
    likes: 2104,
    reviews: 188,
    cover: U("photo-1544966503-7cc5ac882d5f"),
    photos: [U("photo-1544966503-7cc5ac882d5f"), U("photo-1571089336682-9f8d6c1671da")],
    videos: [SAMPLE_VIDEOS[1], SAMPLE_VIDEOS[2]],
    stops: stopsFrom(
      ["Tyrna", "Nongriat", "Rainbow Falls", "Shillong"],
      ["Trailhead dawn", "Double decker", "Swim + film", "Edit café"],
    ),
    experience: "Creator-published without needing to complete travel first. Shot list included.",
    commissionPct: 12,
    fromCompletedBooking: false,
  },
  {
    id: "pub-4",
    code: "NN-ECHO-909",
    title: "Eastern Echo Sikkim Lakes",
    publisherId: "creator2",
    publisherName: "Eastern Echo",
    publisherType: "creator",
    days: 6,
    priceFrom: 23900,
    rating: 4.8,
    likes: 1550,
    reviews: 120,
    cover: U("photo-1519681393784-d120267933ba"),
    photos: [U("photo-1519681393784-d120267933ba"), U("photo-1506905925346-21bda4d32df4")],
    videos: [SAMPLE_VIDEOS[7]],
    stops: stopsFrom(
      ["Gangtok", "Tsomgo", "Lachen", "Gurudongmar", "Lachung", "Yumthang"],
      ["MG Marg", "Yak lake", "North base", "17,800 ft", "Valley night", "Rhododendrons"],
    ),
    experience: "PAP filing tips + oxygen backup notes from a verified creator.",
    commissionPct: 12,
    fromCompletedBooking: false,
  },
  {
    id: "pub-5",
    code: "NN-KAZI-112",
    title: "Kaziranga Dawn Safari Loop",
    publisherId: "traveler1",
    publisherName: "Ananya Sharma",
    publisherType: "traveler",
    days: 3,
    priceFrom: 13200,
    rating: 4.85,
    likes: 720,
    reviews: 64,
    cover: U("photo-1564760055775-d63b17a55c44"),
    photos: [U("photo-1564760055775-d63b17a55c44")],
    videos: [SAMPLE_VIDEOS[6]],
    stops: stopsFrom(
      ["Kohora", "Central Range", "Western Range"],
      ["Orchid park", "Dawn jeep", "Dusk jeep + tea"],
    ),
    experience: "Two jeep safaris + tea-estate lunch. Completed booking published.",
    commissionPct: 8,
    fromCompletedBooking: true,
  },
  {
    id: "pub-6",
    code: "NN-HORN-330",
    title: "Hornbill Immersion Week",
    publisherId: "traveler2",
    publisherName: "Rohan Mehta",
    publisherType: "traveler",
    days: 5,
    priceFrom: 27800,
    rating: 4.9,
    likes: 990,
    reviews: 77,
    cover: U("photo-1533105079780-92b9be482077"),
    photos: [U("photo-1533105079780-92b9be482077")],
    videos: [SAMPLE_VIDEOS[9]],
    stops: stopsFrom(
      ["Kohima", "Kisama", "Khonoma", "Kisama Night", "Dimapur"],
      ["WWII cemetery", "Day dances", "Green village", "Carnival", "Drop"],
    ),
    experience: "Morung stay + festival passes. December-only energy.",
    commissionPct: 8,
    fromCompletedBooking: true,
  },
  {
    id: "pub-7",
    code: "NN-ZIRO-550",
    title: "Ziro Music + Paddy Walk",
    publisherId: "creator1",
    publisherName: "Megha Trails",
    publisherType: "creator",
    days: 4,
    priceFrom: 24800,
    rating: 4.6,
    likes: 1340,
    reviews: 95,
    cover: U("photo-1470071459604-3b5ec3a7fe05"),
    photos: [U("photo-1470071459604-3b5ec3a7fe05")],
    videos: [SAMPLE_VIDEOS[5]],
    stops: stopsFrom(
      ["Naharlagun", "Ziro Camp", "Festival", "Apatani Village"],
      ["Overnight train", "Camp check-in", "Full day sets", "Host walk"],
    ),
    experience: "Festival pass + camping meals. Creator curated.",
    commissionPct: 12,
    fromCompletedBooking: false,
  },
  {
    id: "pub-8",
    code: "NN-LOKT-670",
    title: "Loktak Floating Nights",
    publisherId: "creator2",
    publisherName: "Eastern Echo",
    publisherType: "creator",
    days: 3,
    priceFrom: 11800,
    rating: 4.75,
    likes: 480,
    reviews: 33,
    cover: U("photo-1501785888041-af3ef285b470"),
    photos: [U("photo-1501785888041-af3ef285b470")],
    videos: [SAMPLE_VIDEOS[0]],
    stops: stopsFrom(
      ["Imphal", "Loktak", "Keibul Lamjao"],
      ["Market + ILP", "Phumdi stay", "Sangai park"],
    ),
    experience: "Sleep on floating islands. Fisherman breakfast.",
    commissionPct: 12,
    fromCompletedBooking: false,
  },
  {
    id: "pub-9",
    code: "NN-HOST-781",
    title: "Sohra 48h Guest Circuit",
    publisherId: "host1",
    publisherName: "Lyngdoh Family",
    publisherType: "host",
    days: 2,
    priceFrom: 4500,
    rating: 4.8,
    likes: 310,
    reviews: 28,
    cover: U("photo-1587061949409-02df41d5e562"),
    photos: [U("photo-1587061949409-02df41d5e562")],
    videos: [SAMPLE_VIDEOS[2]],
    stops: stopsFrom(
      ["Nohkalikai", "Arwah Caves", "Local Khasi kitchen"],
      ["Falls morning", "Cave walk", "Home dinner"],
    ),
    experience: "Host-built 48-hour in-city itinerary for guests.",
    commissionPct: 5,
    fromCompletedBooking: false,
  },
  {
    id: "pub-10",
    code: "NN-PLAN-882",
    title: "NestCraft Seven Sisters Sampler",
    publisherId: "planner1",
    publisherName: "NestCraft Plans",
    publisherType: "planner",
    days: 10,
    priceFrom: 54000,
    rating: 4.85,
    likes: 420,
    reviews: 39,
    cover: U("photo-1464822759023-fed622ff2c3b"),
    photos: [U("photo-1464822759023-fed622ff2c3b"), U("photo-1564760055775-d63b17a55c44")],
    videos: [SAMPLE_VIDEOS[4]],
    stops: stopsFrom(
      ["Guwahati", "Shillong", "Kaziranga", "Kohima", "Imphal"],
      ["Arrival hub", "Hills", "Safari", "Culture", "Lake"],
    ),
    experience: "Freelance plan — NORTHNEST fulfills; vendors masked until check-in window.",
    commissionPct: 0,
    fromCompletedBooking: false,
  },
];

/* ============ CREATOR PLANS (grid) ============ */

export const CREATOR_PLANS: CreatorPlan[] = [
  {
    id: "cp-1",
    creatorId: "creator1",
    title: "Root Bridge Film Route",
    cover: U("photo-1544966503-7cc5ac882d5f"),
    photos: [U("photo-1544966503-7cc5ac882d5f"), U("photo-1571089336682-9f8d6c1671da")],
    videos: [SAMPLE_VIDEOS[1]],
    days: 4,
    priceFrom: 15600,
    likes: 2104,
    rating: 4.95,
    experience: "Shot-list days for creators + travellers.",
    stops: stopsFrom(["Tyrna", "Nongriat", "Rainbow Falls", "Shillong"], ["Dawn trail", "Bridge", "Swim", "Café"]),
  },
  {
    id: "cp-2",
    creatorId: "creator1",
    title: "Monsoon Falls Sprint",
    cover: U("photo-1571089336682-9f8d6c1671da"),
    photos: [U("photo-1571089336682-9f8d6c1671da")],
    videos: [SAMPLE_VIDEOS[0]],
    days: 3,
    priceFrom: 12400,
    likes: 980,
    rating: 4.8,
    experience: "Peak roar season — waterproof pack list included.",
    stops: stopsFrom(["Sohra", "Nohkalikai", "Seven Sisters"], ["Base", "Falls", "Viewpoints"]),
  },
  {
    id: "cp-3",
    creatorId: "creator1",
    title: "Dawki Crystal Day",
    cover: U("photo-1439066615861-d1af74d74000"),
    photos: [U("photo-1439066615861-d1af74d74000")],
    videos: [SAMPLE_VIDEOS[2]],
    days: 2,
    priceFrom: 8900,
    likes: 760,
    rating: 4.7,
    experience: "Boat + Bangladesh border viewpoints.",
    stops: stopsFrom(["Shillong", "Dawki"], ["Drive", "Boats"]),
  },
  {
    id: "cp-4",
    creatorId: "creator1",
    title: "Mawlynnong Clean Circuit",
    cover: U("photo-1441974231531-c6227db76b6e"),
    photos: [U("photo-1441974231531-c6227db76b6e")],
    videos: [SAMPLE_VIDEOS[1]],
    days: 2,
    priceFrom: 7600,
    likes: 540,
    rating: 4.75,
    experience: "Village stay + bamboo skywalk golden hour.",
    stops: stopsFrom(["Mawlynnong", "Riwai"], ["Village", "Root bridge nearby"]),
  },
  {
    id: "cp-5",
    creatorId: "creator1",
    title: "Laitlum Canyon Sunrise",
    cover: U("photo-1470071459604-3b5ec3a7fe05"),
    photos: [U("photo-1470071459604-3b5ec3a7fe05")],
    videos: [SAMPLE_VIDEOS[5]],
    days: 2,
    priceFrom: 6800,
    likes: 430,
    rating: 4.6,
    experience: "Canyon rim camp + photography windows.",
    stops: stopsFrom(["Shillong", "Laitlum"], ["Prep", "Sunrise"]),
  },
  {
    id: "cp-6",
    creatorId: "creator2",
    title: "Sikkim Lakes Master",
    cover: U("photo-1519681393784-d120267933ba"),
    photos: [U("photo-1519681393784-d120267933ba")],
    videos: [SAMPLE_VIDEOS[7]],
    days: 6,
    priceFrom: 23900,
    likes: 1550,
    rating: 4.8,
    experience: "Tsomgo to Gurudongmar with PAP notes.",
    stops: stopsFrom(["Gangtok", "Tsomgo", "Lachen", "Gurudongmar", "Lachung", "Yumthang"], ["Town", "Lake", "Base", "High lake", "Valley", "Alpine"]),
  },
  {
    id: "cp-7",
    creatorId: "creator2",
    title: "Tawang Soft Landing",
    cover: U("photo-1506905925346-21bda4d32df4"),
    photos: [U("photo-1506905925346-21bda4d32df4")],
    videos: [SAMPLE_VIDEOS[3]],
    days: 7,
    priceFrom: 31200,
    likes: 1120,
    rating: 4.85,
    experience: "Altitude buffer built in — ILP handled by Northnest.",
    stops: stopsFrom(["Bhalukpong", "Bomdila", "Sela", "Tawang"], ["Entry", "Acclimatize", "Pass", "Gompa"]),
  },
  {
    id: "cp-8",
    creatorId: "creator2",
    title: "Loktak Floating Edit",
    cover: U("photo-1501785888041-af3ef285b470"),
    photos: [U("photo-1501785888041-af3ef285b470")],
    videos: [SAMPLE_VIDEOS[0]],
    days: 3,
    priceFrom: 11800,
    likes: 480,
    rating: 4.75,
    experience: "Phumdi nights + Sangai park.",
    stops: stopsFrom(["Imphal", "Loktak", "Keibul"], ["City", "Lake", "Park"]),
  },
  {
    id: "cp-9",
    creatorId: "creator2",
    title: "Nagaland Pre-Hornbill",
    cover: U("photo-1533105079780-92b9be482077"),
    photos: [U("photo-1533105079780-92b9be482077")],
    videos: [SAMPLE_VIDEOS[9]],
    days: 4,
    priceFrom: 16800,
    likes: 690,
    rating: 4.7,
    experience: "Village immersion before festival rush.",
    stops: stopsFrom(["Kohima", "Khonoma", "Kisama"], ["Cemetery", "Green village", "Heritage"]),
  },
  {
    id: "cp-10",
    creatorId: "creator2",
    title: "Kaziranga Creator Camp",
    cover: U("photo-1564760055775-d63b17a55c44"),
    photos: [U("photo-1564760055775-d63b17a55c44")],
    videos: [SAMPLE_VIDEOS[6]],
    days: 3,
    priceFrom: 14200,
    likes: 810,
    rating: 4.9,
    experience: "Naturalist + content windows on safari.",
    stops: stopsFrom(["Kohora", "Central", "Western"], ["Base", "Dawn", "Dusk"]),
  },
];

/* ============ HOST HOMES + 48h TRIPS ============ */

export const HOST_HOMES: HostHome[] = [
  {
    id: "hh-1",
    hostId: "host1",
    name: "Khasi Hills Bamboo Cottage",
    slug: "khasi-bamboo",
    place: "Sohra, Meghalaya",
    pricePerNight: 2400,
    rating: 4.8,
    reviews: 312,
    photos: [U("photo-1587061949409-02df41d5e562"), U("photo-1571089336682-9f8d6c1671da")],
    amenities: ["Valley view", "Khasi meals", "Bonfire"],
    description: "Family-run cottage 20 min from Nohkalikai. No host commission on NORTHNEST.",
  },
  {
    id: "hh-2",
    hostId: "host1",
    name: "Cloud Deck Cabin",
    slug: "cloud-deck",
    place: "Sohra, Meghalaya",
    pricePerNight: 2800,
    rating: 4.7,
    reviews: 148,
    photos: [U("photo-1470071459604-3b5ec3a7fe05")],
    amenities: ["Private deck", "Fireplace"],
    description: "Fog rolls under your feet at breakfast.",
  },
  {
    id: "hh-3",
    hostId: "host1",
    name: "Root Trail Lodge",
    slug: "root-trail",
    place: "Tyrna, Meghalaya",
    pricePerNight: 1900,
    rating: 4.6,
    reviews: 201,
    photos: [U("photo-1544966503-7cc5ac882d5f")],
    amenities: ["Trek support", "Porter"],
    description: "Closest bed to the living-root trailhead.",
  },
  {
    id: "hh-4",
    hostId: "host1",
    name: "Dawki Riverside Hut",
    slug: "dawki-hut",
    place: "Dawki, Meghalaya",
    pricePerNight: 2100,
    rating: 4.5,
    reviews: 97,
    photos: [U("photo-1439066615861-d1af74d74000")],
    amenities: ["River view", "Boats"],
    description: "Wake to glass water.",
  },
  {
    id: "hh-5",
    hostId: "host1",
    name: "Mawlynnong Garden Stay",
    slug: "mawlynnong-garden",
    place: "Mawlynnong, Meghalaya",
    pricePerNight: 1700,
    rating: 4.9,
    reviews: 256,
    photos: [U("photo-1441974231531-c6227db76b6e")],
    amenities: ["Garden", "Skywalk walk"],
    description: "In Asia's cleanest village.",
  },
  {
    id: "hh-6",
    hostId: "host2",
    name: "Ziro Valley Eco Huts",
    slug: "ziro-eco",
    place: "Ziro, Arunachal",
    pricePerNight: 1900,
    rating: 4.6,
    reviews: 264,
    photos: [U("photo-1470071459604-3b5ec3a7fe05")],
    amenities: ["Paddy deck", "Cycles"],
    description: "Walk into rice fields from the veranda.",
  },
  {
    id: "hh-7",
    hostId: "host2",
    name: "Apatani Heritage Room",
    slug: "apatani-heritage",
    place: "Ziro, Arunachal",
    pricePerNight: 1600,
    rating: 4.7,
    reviews: 132,
    photos: [U("photo-1533105079780-92b9be482077")],
    amenities: ["Host family", "Local kitchen"],
    description: "Stay with an Apatani family.",
  },
  {
    id: "hh-8",
    hostId: "host2",
    name: "Festival Camp Pad",
    slug: "festival-pad",
    place: "Ziro, Arunachal",
    pricePerNight: 2200,
    rating: 4.4,
    reviews: 88,
    photos: [U("photo-1501785888041-af3ef285b470")],
    amenities: ["Near venue", "Shared kitchen"],
    description: "Built for Ziro Music Festival weeks.",
  },
  {
    id: "hh-9",
    hostId: "host2",
    name: "Pine Ridge Studio",
    slug: "pine-ridge",
    place: "Ziro, Arunachal",
    pricePerNight: 2500,
    rating: 4.8,
    reviews: 76,
    photos: [U("photo-1506905925346-21bda4d32df4")],
    amenities: ["Workspace", "View"],
    description: "Quiet studio for remote workers.",
  },
  {
    id: "hh-10",
    hostId: "host2",
    name: "Valley Firepit Cottage",
    slug: "firepit",
    place: "Ziro, Arunachal",
    pricePerNight: 2000,
    rating: 4.55,
    reviews: 110,
    photos: [U("photo-1519681393784-d120267933ba")],
    amenities: ["Firepit", "Stargazing"],
    description: "Clear nights, cold stars.",
  },
];

export const HOST_TRIPS_48H: HostTrip48h[] = [
  {
    id: "ht-1",
    hostId: "host1",
    homeId: "hh-1",
    title: "Sohra Falls Sprint",
    referralCode: "HOST-SOHRA-48",
    hoursWindow: 48,
    price: 4500,
    cover: U("photo-1571089336682-9f8d6c1671da"),
    places: ["Nohkalikai", "Arwah Caves", "Mawsmai"],
    food: ["Jadoh thali", "Tungrymbai"],
    cabs: ["Shared Sumo to Shillong", "Local Gypsy half-day"],
    description: "Book within 48h of stay — guest referral from this homestay.",
  },
  {
    id: "ht-2",
    hostId: "host1",
    homeId: "hh-1",
    title: "Living Root Day Raid",
    referralCode: "HOST-ROOT-48",
    hoursWindow: 48,
    price: 5200,
    cover: U("photo-1544966503-7cc5ac882d5f"),
    places: ["Tyrna", "Nongriat", "Rainbow Falls"],
    food: ["Packed trek lunch", "Village tea"],
    cabs: ["4×4 to Tyrna"],
    description: "Aggressive day trek with porter option.",
  },
  {
    id: "ht-3",
    hostId: "host1",
    homeId: "hh-4",
    title: "Dawki Glass Boats",
    referralCode: "HOST-DAWKI-48",
    hoursWindow: 48,
    price: 3800,
    cover: U("photo-1439066615861-d1af74d74000"),
    places: ["Umngot", "Shnongpdeng"],
    food: ["Riverside BBQ"],
    cabs: ["Local boat + jeep"],
    description: "Crystal water half-day for cottage guests.",
  },
  {
    id: "ht-4",
    hostId: "host1",
    homeId: "hh-5",
    title: "Cleanest Village Loop",
    referralCode: "HOST-MAWL-48",
    hoursWindow: 48,
    price: 2900,
    cover: U("photo-1441974231531-c6227db76b6e"),
    places: ["Mawlynnong", "Riwai root bridge"],
    food: ["Garden breakfast"],
    cabs: ["E-rickshaw hops"],
    description: "Skywalk + village walks.",
  },
  {
    id: "ht-5",
    hostId: "host1",
    homeId: "hh-2",
    title: "Cloud Deck Food Crawl",
    referralCode: "HOST-FOOD-48",
    hoursWindow: 48,
    price: 2400,
    cover: U("photo-1470071459604-3b5ec3a7fe05"),
    places: ["Local market", "View cafés"],
    food: ["Pumaloi", "Dohneiiong", "Ki Kpu"],
    cabs: ["Walking + shared taxi"],
    description: "Host-curated Khasi bites.",
  },
  {
    id: "ht-6",
    hostId: "host2",
    homeId: "hh-6",
    title: "Paddy Cycle Morning",
    referralCode: "HOST-ZIRO-48",
    hoursWindow: 48,
    price: 1800,
    cover: U("photo-1470071459604-3b5ec3a7fe05"),
    places: ["Hong village", "Paddy paths"],
    food: ["Apatani rice"],
    cabs: ["Cycle rental included"],
    description: "Gentle in-valley ride before checkout.",
  },
  {
    id: "ht-7",
    hostId: "host2",
    homeId: "hh-7",
    title: "Heritage Kitchen Night",
    referralCode: "HOST-KITCH-48",
    hoursWindow: 48,
    price: 2200,
    cover: U("photo-1533105079780-92b9be482077"),
    places: ["Host kitchen", "Village walk"],
    food: ["Smoked pork", "Bamboo shoot"],
    cabs: ["On foot"],
    description: "Cook with the family.",
  },
  {
    id: "ht-8",
    hostId: "host2",
    homeId: "hh-8",
    title: "Festival Shuttle Pass",
    referralCode: "HOST-FEST-48",
    hoursWindow: 48,
    price: 3500,
    cover: U("photo-1501785888041-af3ef285b470"),
    places: ["Venue", "Camp"],
    food: ["Festival stalls"],
    cabs: ["Shuttle both ways"],
    description: "For guests arriving within 48h of festival days.",
  },
  {
    id: "ht-9",
    hostId: "host2",
    homeId: "hh-9",
    title: "Pine Ridge Sunset Drive",
    referralCode: "HOST-PINE-48",
    hoursWindow: 48,
    price: 2600,
    cover: U("photo-1506905925346-21bda4d32df4"),
    places: ["Ridge viewpoint"],
    food: ["Thermos chai"],
    cabs: ["Private Scorpio 3h"],
    description: "Golden hour photography run.",
  },
  {
    id: "ht-10",
    hostId: "host2",
    homeId: "hh-10",
    title: "Stargaze Firepit",
    referralCode: "HOST-STAR-48",
    hoursWindow: 48,
    price: 1500,
    cover: U("photo-1519681393784-d120267933ba"),
    places: ["Cottage deck"],
    food: ["Camp snacks"],
    cabs: ["Stay put"],
    description: "Astronomy app + blankets included.",
  },
];

/* ============ GROUP INVITES (10) ============ */

function seats(n: number, claimed: { label: string; by: string; paid: boolean; emi: number }[] = []) {
  return Array.from({ length: n }, (_, i) => {
    const c = claimed[i];
    return {
      id: `seat-${i + 1}`,
      label: `Seat ${i + 1}`,
      claimedBy: c?.by ?? null,
      paid: c?.paid ?? false,
      emiPaid: c?.emi ?? 0,
    };
  });
}

export const GROUP_INVITES: GroupInvite[] = [
  {
    id: "gi-1",
    code: "CREW-MEGH-01",
    title: "Monsoon Meghalaya Crew",
    plannerName: "Ananya Sharma",
    plannerId: "traveler1",
    cover: U("photo-1571089336682-9f8d6c1671da"),
    pricePerSeat: 18400,
    emiPerMonth: 4600,
    seats: seats(6, [
      { label: "Seat 1", by: "Ananya Sharma", paid: true, emi: 4 },
      { label: "Seat 2", by: "Priya N.", paid: true, emi: 3 },
      { label: "Seat 3", by: "Dev K.", paid: false, emi: 1 },
    ]),
  },
  {
    id: "gi-2",
    code: "CREW-TAWA-02",
    title: "Tawang Alpine Six",
    plannerName: "Rohan Mehta",
    plannerId: "traveler2",
    cover: U("photo-1506905925346-21bda4d32df4"),
    pricePerSeat: 31200,
    emiPerMonth: 7800,
    seats: seats(6, [
      { label: "Seat 1", by: "Rohan Mehta", paid: true, emi: 4 },
      { label: "Seat 2", by: "Sara M.", paid: false, emi: 2 },
    ]),
  },
  {
    id: "gi-3",
    code: "CREW-KAZI-03",
    title: "Kaziranga Weekend Four",
    plannerName: "Ananya Sharma",
    plannerId: "traveler1",
    cover: U("photo-1564760055775-d63b17a55c44"),
    pricePerSeat: 13200,
    emiPerMonth: 3300,
    seats: seats(4, [{ label: "Seat 1", by: "Ananya Sharma", paid: true, emi: 4 }]),
  },
  {
    id: "gi-4",
    code: "CREW-HORN-04",
    title: "Hornbill December Crew",
    plannerName: "Rohan Mehta",
    plannerId: "traveler2",
    cover: U("photo-1533105079780-92b9be482077"),
    pricePerSeat: 27800,
    emiPerMonth: 6950,
    seats: seats(8, [
      { label: "Seat 1", by: "Rohan Mehta", paid: true, emi: 2 },
      { label: "Seat 2", by: "Amit", paid: true, emi: 2 },
      { label: "Seat 3", by: "Neha", paid: false, emi: 0 },
    ]),
  },
  {
    id: "gi-5",
    code: "CREW-ZIRO-05",
    title: "Ziro Music Friends",
    plannerName: "Megha Trails",
    plannerId: "creator1",
    cover: U("photo-1470071459604-3b5ec3a7fe05"),
    pricePerSeat: 24800,
    emiPerMonth: 6200,
    seats: seats(5),
  },
  {
    id: "gi-6",
    code: "CREW-SIKK-06",
    title: "Sikkim Lakes Squad",
    plannerName: "Eastern Echo",
    plannerId: "creator2",
    cover: U("photo-1519681393784-d120267933ba"),
    pricePerSeat: 23900,
    emiPerMonth: 5975,
    seats: seats(6, [{ label: "Seat 1", by: "Eastern Echo", paid: true, emi: 4 }]),
  },
  {
    id: "gi-7",
    code: "CREW-DAWK-07",
    title: "Dawki Day Escape",
    plannerName: "Ananya Sharma",
    plannerId: "traveler1",
    cover: U("photo-1439066615861-d1af74d74000"),
    pricePerSeat: 4500,
    emiPerMonth: 1500,
    seats: seats(4),
  },
  {
    id: "gi-8",
    code: "CREW-ROOT-08",
    title: "Root Bridge Challenge",
    plannerName: "Rohan Mehta",
    plannerId: "traveler2",
    cover: U("photo-1544966503-7cc5ac882d5f"),
    pricePerSeat: 8900,
    emiPerMonth: 2225,
    seats: seats(5, [{ label: "Seat 1", by: "Rohan Mehta", paid: false, emi: 1 }]),
  },
  {
    id: "gi-9",
    code: "CREW-LOKT-09",
    title: "Loktak Float Crew",
    plannerName: "Eastern Echo",
    plannerId: "creator2",
    cover: U("photo-1501785888041-af3ef285b470"),
    pricePerSeat: 11800,
    emiPerMonth: 2950,
    seats: seats(4),
  },
  {
    id: "gi-10",
    code: "CREW-NEST-10",
    title: "NestCraft Sampler Group",
    plannerName: "NestCraft Plans",
    plannerId: "planner1",
    cover: U("photo-1464822759023-fed622ff2c3b"),
    pricePerSeat: 54000,
    emiPerMonth: 9000,
    seats: seats(6, [
      { label: "Seat 1", by: "NestCraft Plans", paid: true, emi: 3 },
      { label: "Seat 2", by: "Guest A", paid: true, emi: 3 },
    ]),
  },
];

/* ============ FREELANCE PLANS ============ */

export const FREELANCE_PLANS: FreelancePlan[] = [
  {
    id: "fp-1",
    plannerId: "planner1",
    title: "Seven Sisters Sampler",
    cover: U("photo-1464822759023-fed622ff2c3b"),
    days: 10,
    priceFrom: 54000,
    netProfit: 12000,
    plannerSharePct: 60,
    vendorsMaskedUntilHours: 72,
    photos: [U("photo-1464822759023-fed622ff2c3b")],
    stops: [
      { place: "Guwahati", day: 1, note: "Arrival hub", vendorMasked: "Partner Stay · ***", vendorReal: "Hotel Dynasty" },
      { place: "Shillong", day: 2, note: "Hills", vendorMasked: "Homestay · ***", vendorReal: "Ri Kynjai" },
      { place: "Kaziranga", day: 4, note: "Safari", vendorMasked: "Lodge · ***", vendorReal: "Iora Resort" },
    ],
  },
  {
    id: "fp-2",
    plannerId: "planner1",
    title: "Meghalaya Soft Adventure",
    cover: U("photo-1571089336682-9f8d6c1671da"),
    days: 5,
    priceFrom: 22000,
    netProfit: 5500,
    plannerSharePct: 60,
    vendorsMaskedUntilHours: 48,
    photos: [U("photo-1571089336682-9f8d6c1671da")],
    stops: [
      { place: "Sohra", day: 1, note: "Falls", vendorMasked: "Cottage · ***", vendorReal: "Lyngdoh Cottage" },
      { place: "Nongriat", day: 3, note: "Trek", vendorMasked: "Guide · ***", vendorReal: "Banrilang Guide Co." },
    ],
  },
  {
    id: "fp-3",
    plannerId: "planner1",
    title: "Assam Tea + Rhino",
    cover: U("photo-1564760055775-d63b17a55c44"),
    days: 4,
    priceFrom: 18500,
    netProfit: 4200,
    plannerSharePct: 60,
    vendorsMaskedUntilHours: 48,
    photos: [U("photo-1564760055775-d63b17a55c44")],
    stops: [
      { place: "Jorhat", day: 1, note: "Tea estate", vendorMasked: "Bungalow · ***", vendorReal: "Banyan Grove" },
      { place: "Kaziranga", day: 2, note: "Safari", vendorMasked: "Jeep · ***", vendorReal: "Forest Dept. Partner" },
    ],
  },
  {
    id: "fp-4",
    plannerId: "planner1",
    title: "Nagaland Culture Lite",
    cover: U("photo-1533105079780-92b9be482077"),
    days: 5,
    priceFrom: 26000,
    netProfit: 6100,
    plannerSharePct: 60,
    vendorsMaskedUntilHours: 72,
    photos: [U("photo-1533105079780-92b9be482077")],
    stops: [
      { place: "Kohima", day: 1, note: "City", vendorMasked: "Stay · ***", vendorReal: "The Heritage" },
      { place: "Kisama", day: 2, note: "Village", vendorMasked: "Morung · ***", vendorReal: "Kisama Homestay" },
    ],
  },
  {
    id: "fp-5",
    plannerId: "planner1",
    title: "Corporate Offsite NE",
    cover: U("photo-1506905925346-21bda4d32df4"),
    days: 3,
    priceFrom: 32000,
    netProfit: 8000,
    plannerSharePct: 60,
    vendorsMaskedUntilHours: 24,
    photos: [U("photo-1506905925346-21bda4d32df4")],
    stops: [
      { place: "Shillong", day: 1, note: "Team base", vendorMasked: "Resort · ***", vendorReal: "Pinewood Hotel" },
    ],
  },
  {
    id: "fp-6",
    plannerId: "planner2",
    title: "Tawang High Pass",
    cover: U("photo-1506905925346-21bda4d32df4"),
    days: 7,
    priceFrom: 38000,
    netProfit: 9500,
    plannerSharePct: 60,
    vendorsMaskedUntilHours: 96,
    photos: [U("photo-1506905925346-21bda4d32df4")],
    stops: [
      { place: "Sela", day: 3, note: "Pass", vendorMasked: "4×4 · ***", vendorReal: "Himalayan Trax" },
      { place: "Tawang", day: 4, note: "Gompa", vendorMasked: "Lodge · ***", vendorReal: "Tawang Inn" },
    ],
  },
  {
    id: "fp-7",
    plannerId: "planner2",
    title: "Sikkim Oxygen Circuit",
    cover: U("photo-1519681393784-d120267933ba"),
    days: 6,
    priceFrom: 29000,
    netProfit: 7200,
    plannerSharePct: 60,
    vendorsMaskedUntilHours: 72,
    photos: [U("photo-1519681393784-d120267933ba")],
    stops: [
      { place: "Gurudongmar", day: 4, note: "High lake", vendorMasked: "Permit desk · ***", vendorReal: "North Sikkim Desk" },
    ],
  },
  {
    id: "fp-8",
    plannerId: "planner2",
    title: "Ziro Quiet Luxury",
    cover: U("photo-1470071459604-3b5ec3a7fe05"),
    days: 4,
    priceFrom: 27000,
    netProfit: 6800,
    plannerSharePct: 60,
    vendorsMaskedUntilHours: 48,
    photos: [U("photo-1470071459604-3b5ec3a7fe05")],
    stops: [
      { place: "Ziro", day: 1, note: "Valley", vendorMasked: "Eco hut · ***", vendorReal: "Apatani Nest" },
    ],
  },
  {
    id: "fp-9",
    plannerId: "planner2",
    title: "Manipur Lake Weekend",
    cover: U("photo-1501785888041-af3ef285b470"),
    days: 3,
    priceFrom: 16000,
    netProfit: 3900,
    plannerSharePct: 60,
    vendorsMaskedUntilHours: 36,
    photos: [U("photo-1501785888041-af3ef285b470")],
    stops: [
      { place: "Loktak", day: 1, note: "Phumdi", vendorMasked: "Floating stay · ***", vendorReal: "Sendra Resort" },
    ],
  },
  {
    id: "fp-10",
    plannerId: "planner2",
    title: "Echo SOS Safety Demo Tour",
    cover: U("photo-1464822759023-fed622ff2c3b"),
    days: 5,
    priceFrom: 25000,
    netProfit: 5000,
    plannerSharePct: 60,
    vendorsMaskedUntilHours: 120,
    photos: [U("photo-1464822759023-fed622ff2c3b")],
    stops: [
      { place: "Remote trail", day: 2, note: "SOS always live", vendorMasked: "Guide · ***", vendorReal: "PeakPath Field" },
    ],
  },
];

export function findAccount(idOrEmail: string, password?: string): DemoAccount | undefined {
  const q = idOrEmail.trim().toLowerCase();
  const acc = DEMO_ACCOUNTS.find(
    (a) => a.id.toLowerCase() === q || a.email.toLowerCase() === q || a.handle?.toLowerCase() === q,
  );
  if (!acc) return undefined;
  if (password !== undefined && acc.password !== password) return undefined;
  return acc;
}
