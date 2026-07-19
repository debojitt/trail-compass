/**
 * Demo catalog — the single source of sample data for the prototype.
 *
 * Going to production: keep these types, delete the arrays, and serve the
 * same shapes from a real API (see src/lib/demoApi.ts for the call sites).
 */

export type Stay = {
  id: string;
  name: string;
  stateSlug: string;
  place: string;
  pricePerNight: number;
  rating: number;
  reviews: number;
  img: string;
  amenities: string[];
  hostNote: string;
};

export type TransportMode = "flights" | "trains" | "cabs";

export type TransportRoute = {
  id: string;
  mode: TransportMode;
  carrier: string;
  code: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  depart: string;
  arrive: string;
  duration: string;
  note: string;
  price: number;
};

export type TravelPackage = {
  id: string;
  title: string;
  days: string;
  rating: number;
  reviews: string;
  oldPrice: number;
  price: number;
  perks: string[];
  img: string;
  itinerary: string[];
  states: string[];
};

export type Offer = {
  id: string;
  tag: string;
  title: string;
  body: string;
  code: string;
  terms: string;
  expires: string;
};

export type PermitRule = {
  stateSlug: string;
  state: string;
  indian: "ILP" | "None";
  foreign: "PAP" | "RAP" | "None";
  processing: string;
  fee: number;
  note: string;
};

/* ============ STAYS ============ */

export const stays: Stay[] = [
  {
    id: "stay-khasi-hills",
    name: "Khasi Hills Bamboo Cottage",
    stateSlug: "meghalaya",
    place: "Sohra (Cherrapunji), Meghalaya",
    pricePerNight: 2400,
    rating: 4.8,
    reviews: 312,
    img: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=700",
    amenities: ["Valley view", "Home-cooked Khasi meals", "Bonfire", "Guide on call"],
    hostNote: "Run by the Lyngdoh family, 20 minutes from Nohkalikai Falls.",
  },
  {
    id: "stay-living-root",
    name: "Living Root Homestay",
    stateSlug: "meghalaya",
    place: "Nongriat, Meghalaya",
    pricePerNight: 1400,
    rating: 4.9,
    reviews: 505,
    img: "https://images.unsplash.com/photo-1571089336682-9f8d6c1671da?w=700",
    amenities: ["Root-bridge trailhead", "Organic kitchen", "Porter support"],
    hostNote: "3,500 steps down into the jungle — worth every one of them.",
  },
  {
    id: "stay-tawang-gompa",
    name: "Gompa View Farmstay",
    stateSlug: "arunachal-pradesh",
    place: "Tawang, Arunachal Pradesh",
    pricePerNight: 2900,
    rating: 4.7,
    reviews: 188,
    img: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=700",
    amenities: ["Monastery view", "Yak-butter tea", "Heated rooms", "ILP help"],
    hostNote: "Sunrise over the 400-year-old gompa from your window.",
  },
  {
    id: "stay-ziro-valley",
    name: "Ziro Valley Eco Huts",
    stateSlug: "arunachal-pradesh",
    place: "Ziro, Arunachal Pradesh",
    pricePerNight: 1900,
    rating: 4.6,
    reviews: 264,
    img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=700",
    amenities: ["Paddy-field deck", "Apatani host family", "Cycle rental"],
    hostNote: "Walk into the rice fields straight from the veranda.",
  },
  {
    id: "stay-gangtok-ridge",
    name: "Ridge House Gangtok",
    stateSlug: "sikkim",
    place: "Gangtok, Sikkim",
    pricePerNight: 3200,
    rating: 4.7,
    reviews: 421,
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700",
    amenities: ["Kanchenjunga view", "5 min to MG Marg", "Breakfast included"],
    hostNote: "Clear mornings show the third-highest peak on earth.",
  },
  {
    id: "stay-kisama-morung",
    name: "Kisama Heritage Morung",
    stateSlug: "nagaland",
    place: "Kisama, Nagaland",
    pricePerNight: 1700,
    rating: 4.5,
    reviews: 146,
    img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=700",
    amenities: ["Hornbill venue walk", "Tribal kitchen", "Log-drum evenings"],
    hostNote: "Book early for December — Hornbill sells the village out.",
  },
  {
    id: "stay-kaziranga-edge",
    name: "Kaziranga Forest Edge",
    stateSlug: "assam",
    place: "Kohora, Assam",
    pricePerNight: 2600,
    rating: 4.6,
    reviews: 389,
    img: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=700",
    amenities: ["Safari desk", "Tea-garden walk", "Machan dining"],
    hostNote: "Jeep safaris leave from the gate 900 m away at dawn.",
  },
  {
    id: "stay-loktak-float",
    name: "Loktak Floating Homestay",
    stateSlug: "manipur",
    place: "Loktak Lake, Manipur",
    pricePerNight: 2100,
    rating: 4.8,
    reviews: 97,
    img: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=700",
    amenities: ["Phumdi boat rides", "Fisherman breakfast", "Sangai deck"],
    hostNote: "Sleep on the world's only floating national park.",
  },
];

/* ============ TRANSPORT ============ */

export const transportRoutes: TransportRoute[] = [
  /* Flights */
  { id: "fl-1", mode: "flights", carrier: "IndiGo", code: "6E 2041", from: "Kolkata", fromCode: "CCU", to: "Guwahati", toCode: "GAU", depart: "06:10", arrive: "07:25", duration: "1h 15m", note: "Cabin bag included", price: 2499 },
  { id: "fl-2", mode: "flights", carrier: "IndiGo", code: "6E 917", from: "Kolkata", fromCode: "CCU", to: "Guwahati", toCode: "GAU", depart: "11:40", arrive: "12:55", duration: "1h 15m", note: "Free seat selection", price: 2899 },
  { id: "fl-3", mode: "flights", carrier: "Air India Express", code: "IX 712", from: "Delhi", fromCode: "DEL", to: "Guwahati", toCode: "GAU", depart: "08:05", arrive: "10:20", duration: "2h 15m", note: "Meal on board", price: 4650 },
  { id: "fl-4", mode: "flights", carrier: "IndiGo", code: "6E 7302", from: "Guwahati", fromCode: "GAU", to: "Dibrugarh", toCode: "DIB", depart: "13:30", arrive: "14:35", duration: "1h 05m", note: "ATR turboprop", price: 3100 },
  { id: "fl-5", mode: "flights", carrier: "Alliance Air", code: "9I 883", from: "Guwahati", fromCode: "GAU", to: "Shillong", toCode: "SHL", depart: "09:15", arrive: "09:50", duration: "0h 35m", note: "Umroi airport", price: 2750 },
  { id: "fl-6", mode: "flights", carrier: "IndiGo", code: "6E 5387", from: "Guwahati", fromCode: "GAU", to: "Imphal", toCode: "IMF", depart: "15:20", arrive: "16:20", duration: "1h 00m", note: "Cabin bag included", price: 3450 },
  { id: "fl-7", mode: "flights", carrier: "IndiGo", code: "6E 469", from: "Guwahati", fromCode: "GAU", to: "Aizawl", toCode: "AJL", depart: "10:45", arrive: "11:50", duration: "1h 05m", note: "Lengpui approach views", price: 3900 },
  { id: "fl-8", mode: "flights", carrier: "IndiGo", code: "6E 274", from: "Guwahati", fromCode: "GAU", to: "Agartala", toCode: "IXA", depart: "17:05", arrive: "18:05", duration: "1h 00m", note: "Evening departure", price: 3200 },

  /* Trains */
  { id: "tr-1", mode: "trains", carrier: "Vande Bharat", code: "22228", from: "Guwahati", fromCode: "GHY", to: "New Jalpaiguri", toCode: "NJP", depart: "06:10", arrive: "11:40", duration: "5h 30m", note: "CC · EC available", price: 1075 },
  { id: "tr-2", mode: "trains", carrier: "Donyi Polo Express", code: "15818", from: "Guwahati", fromCode: "GHY", to: "Naharlagun", toCode: "NHLN", depart: "21:25", arrive: "05:10", duration: "7h 45m", note: "Overnight · 3A / 2A", price: 890 },
  { id: "tr-3", mode: "trains", carrier: "Kanchanjunga Express", code: "13174", from: "Sealdah", fromCode: "SDAH", to: "Guwahati", toCode: "GHY", depart: "06:50", arrive: "04:15", duration: "21h 25m", note: "SL / 3A / 2A", price: 640 },
  { id: "tr-4", mode: "trains", carrier: "Barak Valley Express", code: "15615", from: "Guwahati", fromCode: "GHY", to: "Silchar", toCode: "SCL", depart: "19:00", arrive: "06:30", duration: "11h 30m", note: "Through Haflong hills", price: 520 },

  /* Cabs */
  { id: "cb-1", mode: "cabs", carrier: "NORTHNEST Cabs", code: "SUV · Innova", from: "Guwahati Airport", fromCode: "GAU", to: "Shillong", toCode: "SHL", depart: "Any time", arrive: "~3h later", duration: "3h 00m", note: "100 km · toll included", price: 2800 },
  { id: "cb-2", mode: "cabs", carrier: "NORTHNEST Cabs", code: "SUV · Innova", from: "Guwahati Airport", fromCode: "GAU", to: "Kaziranga", toCode: "KZR", depart: "Any time", arrive: "~4.5h later", duration: "4h 30m", note: "193 km · NH27", price: 4200 },
  { id: "cb-3", mode: "cabs", carrier: "NORTHNEST Cabs", code: "4×4 · Scorpio", from: "Shillong", fromCode: "SHL", to: "Sohra (Cherrapunji)", toCode: "CHR", depart: "Any time", arrive: "~1.5h later", duration: "1h 30m", note: "Waterfall halts on request", price: 1900 },
  { id: "cb-4", mode: "cabs", carrier: "NORTHNEST Cabs", code: "4×4 · Gypsy", from: "Tezpur", fromCode: "TZU", to: "Tawang", toCode: "TWG", depart: "05:00 start", arrive: "Same evening", duration: "12h 00m", note: "Sela Pass · driver stays", price: 9500 },
  { id: "cb-5", mode: "cabs", carrier: "NORTHNEST Cabs", code: "Sedan · Dzire", from: "Bagdogra", fromCode: "IXB", to: "Gangtok", toCode: "GTK", depart: "Any time", arrive: "~4h later", duration: "4h 00m", note: "124 km · Teesta valley", price: 3100 },
];

/* ============ PACKAGES ============ */

export const travelPackages: TravelPackage[] = [
  {
    id: "pkg-monsoon-trail",
    title: "Meghalaya Monsoon Trail",
    days: "5D · 4N",
    rating: 4.8,
    reviews: "1.2k",
    oldPrice: 21900,
    price: 18400,
    perks: ["Homestay chain", "Root-bridge trek", "All permits filed"],
    img: "https://images.unsplash.com/photo-1571089336682-9f8d6c1671da?w=700",
    itinerary: [
      "Day 1 — Guwahati → Shillong, Ward's Lake evening walk",
      "Day 2 — Sohra: Nohkalikai Falls + Arwah caves",
      "Day 3 — Nongriat trek: double-decker root bridge",
      "Day 4 — Dawki river + Mawlynnong village",
      "Day 5 — Laitlum canyon sunrise, drop at Guwahati",
    ],
    states: ["meghalaya"],
  },
  {
    id: "pkg-tawang-circuit",
    title: "Tawang Alpine Circuit",
    days: "7D · 6N",
    rating: 4.7,
    reviews: "860",
    oldPrice: 36500,
    price: 31200,
    perks: ["4×4 with driver", "ILP included", "Altitude buffer day"],
    img: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=700",
    itinerary: [
      "Day 1 — Guwahati → Bhalukpong (ILP checkpost)",
      "Day 2 — Bomdila → Dirang dzong",
      "Day 3 — Sela Pass (13,700 ft) → Tawang",
      "Day 4 — Tawang Monastery + war memorial",
      "Day 5 — Bum La / PTSO lake (army permit)",
      "Day 6 — Return to Dirang hot springs",
      "Day 7 — Drop at Tezpur or Guwahati",
    ],
    states: ["arunachal-pradesh"],
  },
  {
    id: "pkg-ziro-festival",
    title: "Ziro Music Festival",
    days: "4D · 3N",
    rating: 4.5,
    reviews: "2.1k",
    oldPrice: 28900,
    price: 24800,
    perks: ["Festival pass", "Camping + meals", "Shuttle from Naharlagun"],
    img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=700",
    itinerary: [
      "Day 1 — Overnight Donyi Polo Express to Naharlagun",
      "Day 2 — Shuttle to Ziro, camp check-in, first acts",
      "Day 3 — Full festival day + Apatani village walk",
      "Day 4 — Morning sets, shuttle back",
    ],
    states: ["arunachal-pradesh"],
  },
  {
    id: "pkg-kaziranga-safari",
    title: "Kaziranga Rhino Safari",
    days: "3D · 2N",
    rating: 4.8,
    reviews: "1.7k",
    oldPrice: 15900,
    price: 13200,
    perks: ["2 jeep safaris", "Naturalist guide", "Tea-estate lunch"],
    img: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=700",
    itinerary: [
      "Day 1 — Guwahati → Kohora, orchid park evening",
      "Day 2 — Dawn central-range safari + western range at dusk",
      "Day 3 — Tea-garden breakfast, drop at Guwahati",
    ],
    states: ["assam"],
  },
  {
    id: "pkg-sikkim-lakes",
    title: "Sikkim Lakes & Passes",
    days: "6D · 5N",
    rating: 4.6,
    reviews: "980",
    oldPrice: 27500,
    price: 23900,
    perks: ["Tsomgo + Gurudongmar", "PAP filed for you", "Oxygen backup"],
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700",
    itinerary: [
      "Day 1 — Bagdogra → Gangtok, MG Marg evening",
      "Day 2 — Tsomgo Lake + Baba Mandir",
      "Day 3 — Gangtok → Lachen",
      "Day 4 — Gurudongmar Lake (17,800 ft) → Lachung",
      "Day 5 — Yumthang valley → Gangtok",
      "Day 6 — Drop at Bagdogra",
    ],
    states: ["sikkim"],
  },
  {
    id: "pkg-hornbill",
    title: "Hornbill Festival Immersion",
    days: "5D · 4N",
    rating: 4.9,
    reviews: "640",
    oldPrice: 32000,
    price: 27800,
    perks: ["Kisama day passes", "Morung stay", "ILP included"],
    img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=700",
    itinerary: [
      "Day 1 — Dimapur → Kohima, WWII cemetery",
      "Day 2 — Hornbill: morning dances + night carnival",
      "Day 3 — Khonoma green village day trip",
      "Day 4 — Hornbill finale + rock contest",
      "Day 5 — Drop at Dimapur",
    ],
    states: ["nagaland"],
  },
];

/* ============ OFFERS ============ */

export const offers: Offer[] = [
  { id: "of-hornbill", tag: "FESTIVE", title: "Hornbill Festival Special", body: "Flat 18% off Nagaland circuits booked before 31 Oct.", code: "HORNBILL18", terms: "Valid on Nagaland packages of 4D+. Not combinable.", expires: "31 Oct 2026" },
  { id: "of-stays", tag: "STAYS", title: "Homestay Week", body: "3rd night free at 200+ verified village homestays.", code: "NESTSTAY", terms: "Minimum 3-night booking. Free night is the cheapest night.", expires: "30 Nov 2026" },
  { id: "of-flights", tag: "FLIGHTS", title: "CCU → GAU from ₹2,499", body: "Morning departures, cabin bag included.", code: "FLYNE", terms: "Limited seats per departure. Fares refresh daily.", expires: "Rolling" },
  { id: "of-permits", tag: "PERMITS", title: "Zero-fee ILP filing", body: "We file your Inner Line Permit free with any package.", code: "AUTO", terms: "Applied automatically at checkout with any package.", expires: "Always on" },
  { id: "of-monsoon", tag: "SEASON", title: "Monsoon Meghalaya −12%", body: "See the falls at full roar. June–September departures.", code: "MONSOON12", terms: "Valid on Meghalaya Monsoon Trail departures Jun–Sep.", expires: "30 Sep 2026" },
  { id: "of-group", tag: "GROUPS", title: "Group of 6+ saves 10%", body: "Private 4×4 convoys for friends and families.", code: "NEST6", terms: "Single invoice, 6+ travellers on the same itinerary.", expires: "Rolling" },
];

/* ============ PERMITS ============ */

export const permitRules: PermitRule[] = [
  { stateSlug: "arunachal-pradesh", state: "Arunachal Pradesh", indian: "ILP", foreign: "PAP", processing: "24–48 h", fee: 100, note: "ILP mandatory for all non-residents; PAP for foreign nationals in groups of 2+." },
  { stateSlug: "nagaland", state: "Nagaland", indian: "ILP", foreign: "None", processing: "24 h", fee: 50, note: "Foreign nationals only need to register with the district FRO on arrival." },
  { stateSlug: "mizoram", state: "Mizoram", indian: "ILP", foreign: "None", processing: "24 h", fee: 120, note: "ILP checked at Lengpui airport and all road entries." },
  { stateSlug: "manipur", state: "Manipur", indian: "ILP", foreign: "None", processing: "24–72 h", fee: 100, note: "ILP reinstated in 2019 — carry a printed or QR copy." },
  { stateSlug: "sikkim", state: "Sikkim", indian: "None", foreign: "RAP", processing: "On arrival", fee: 0, note: "Indians need permits only for Nathu La / Gurudongmar; foreigners need RAP for North Sikkim." },
  { stateSlug: "meghalaya", state: "Meghalaya", indian: "None", foreign: "None", processing: "—", fee: 0, note: "No permit needed. Some sacred groves require local guides." },
  { stateSlug: "assam", state: "Assam", indian: "None", foreign: "None", processing: "—", fee: 0, note: "No permit needed anywhere in the state." },
  { stateSlug: "tripura", state: "Tripura", indian: "None", foreign: "None", processing: "—", fee: 0, note: "No permit needed. Carry ID for border-area checkposts." },
];
