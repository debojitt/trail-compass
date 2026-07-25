/**
 * Deterministic seed data for the NORTHNEST prototype.
 *
 * 5 accounts (one per role), 10+ items per feature. All images are Unsplash
 * source URLs — cached at CDN edges, no lag. Videos are omitted intentionally;
 * the builder uses posters with a Ken Burns pan for a zero-buffer "video" feel.
 */

import type {
  Account,
  Booking,
  GroupTrip,
  HostReferralPlan,
  Notification,
  Package,
  Place,
  PublicItinerary,
  SosBroadcast,
  Stay,
  StoreState,
  UserItinerary,
} from "@/lib/store";

const img = (id: string, w = 900) => `https://images.unsplash.com/${id}?w=${w}&q=70&auto=format&fit=crop`;

const IMG = {
  cherra: "photo-1587061949409-02df41d5e562",
  livingRoot: "photo-1571089336682-9f8d6c1671da",
  tawang: "photo-1544966503-7cc5ac882d5f",
  ziro: "photo-1470071459604-3b5ec3a7fe05",
  gangtok: "photo-1506905925346-21bda4d32df4",
  kisama: "photo-1533105079780-92b9be482077",
  kaziranga: "photo-1564760055775-d63b17a55c44",
  loktak: "photo-1439066615861-d1af74d74000",
  dawki: "photo-1600001731-f4a3e7c3f2c9",
  waterfall: "photo-1501594907352-04cda38ebc29",
  monastery: "photo-1516815231560-8f41ec531527",
  mountain: "photo-1464822759023-fed622ff2c3b",
  tea: "photo-1587049352846-4a222e784d38",
  river: "photo-1508739773434-c26b3d09e071",
  village: "photo-1517400508447-f8dd518b86db",
  festival: "photo-1533106497176-45ae19e68ba2",
  rhino: "photo-1516426122078-c23e76319801",
  hills: "photo-1519681393784-d120267933ba",
  camp: "photo-1504280390367-361c6d9f38f4",
  bridge: "photo-1520962880247-cfaf541c8724",
  lake: "photo-1500530855697-b586d89ba3ee",
  road: "photo-1470071459604-3b5ec3a7fe05",
  night: "photo-1449057059253-2ec5b2a53d3f",
  food: "photo-1504674900247-0877df9cc836",
  spice: "photo-1596797038530-2c107229654b",
  handloom: "photo-1524863479829-916d8e77f114",
  home: "photo-1449844908441-8829872d2607",
  cabin: "photo-1520250497591-112f2f40a3f4",
  loft: "photo-1502672260266-1c1ef2d93688",
  boat: "photo-1502920917128-1aa500764cbd",
  cave: "photo-1517486808906-6ca8b3f04846",
  peak: "photo-1486022976003-b06ddd7cfd9a",
} as const;

function accounts(): Account[] {
  return [
    {
      id: "u-traveler",
      email: "arya@demo.nn",
      password: "northnest",
      name: "Arya Barua",
      handle: "arya",
      role: "traveler",
      avatar: `https://i.pravatar.cc/200?img=32`,
      bio: "Weekend rider, chasing waterfalls in Meghalaya.",
      city: "Guwahati, Assam",
    },
    {
      id: "u-creator",
      email: "meiko@demo.nn",
      password: "northnest",
      name: "Meiko Longkumer",
      handle: "meiko.trails",
      role: "creator",
      avatar: `https://i.pravatar.cc/200?img=47`,
      bio: "Verified NORTHNEST creator · Nagaland · 60k followers",
      verified: true,
      followers: 62400,
      city: "Kohima, Nagaland",
    },
    {
      id: "u-host",
      email: "bikash@demo.nn",
      password: "northnest",
      name: "Bikash Lyngdoh",
      handle: "khasi.hills",
      role: "host",
      avatar: `https://i.pravatar.cc/200?img=13`,
      bio: "Host of Khasi Hills Bamboo Cottage · 20 min from Nohkalikai.",
      verified: true,
      city: "Sohra, Meghalaya",
    },
    {
      id: "u-planner",
      email: "zara@demo.nn",
      password: "northnest",
      name: "Zara Reang",
      handle: "zara.trips",
      role: "planner",
      avatar: `https://i.pravatar.cc/200?img=45`,
      bio: "Freelance planner · 400+ trips fulfilled · Northeast specialist",
      verified: true,
      followers: 12800,
      subdomain: "zara",
      city: "Agartala, Tripura",
    },
    {
      id: "u-admin",
      email: "admin@demo.nn",
      password: "northnest",
      name: "NORTHNEST Ops",
      handle: "admin",
      role: "admin",
      avatar: `https://i.pravatar.cc/200?img=8`,
      bio: "Platform operations, verifications, payouts.",
      city: "Shillong",
    },
  ];
}

function places(): Place[] {
  const raw: Omit<Place, "id">[] = [
    { name: "Nohkalikai Falls", state: "Meghalaya", stateSlug: "meghalaya", hook: "Tallest plunge waterfall in India — 1,115 ft into a turquoise pool.", priceRange: "₹200–₹500", price: 400, hours: "2h visit · dawn best", poster: img(IMG.waterfall, 800), tags: ["Waterfall", "Photography"], likes: 12400 },
    { name: "Double-Decker Root Bridge", state: "Meghalaya", stateSlug: "meghalaya", hook: "3,500 steps down into the jungle — Khasi living architecture.", priceRange: "₹150–₹300", price: 300, hours: "Full day trek", poster: img(IMG.bridge, 800), tags: ["Trek", "Heritage"], likes: 18900 },
    { name: "Dawki River", state: "Meghalaya", stateSlug: "meghalaya", hook: "Water so clear the boat looks like it's floating in air.", priceRange: "₹800/boat", price: 800, hours: "Half day", poster: img(IMG.river, 800), tags: ["Boat", "Border"], likes: 22100 },
    { name: "Tawang Monastery", state: "Arunachal Pradesh", stateSlug: "arunachal-pradesh", hook: "400-year-old gompa, second largest Buddhist monastery in the world.", priceRange: "Free", price: 0, hours: "3h visit", poster: img(IMG.monastery, 800), tags: ["Monastery", "Culture"], likes: 15600 },
    { name: "Sela Pass", state: "Arunachal Pradesh", stateSlug: "arunachal-pradesh", hook: "13,700 ft mountain pass with a frozen mirror lake at the top.", priceRange: "₹1,200 cab", price: 1200, hours: "Full day drive", poster: img(IMG.peak, 800), tags: ["Pass", "Snow"], likes: 9800 },
    { name: "Ziro Valley", state: "Arunachal Pradesh", stateSlug: "arunachal-pradesh", hook: "Rice fields walked by the Apatani tribe — music-festival home.", priceRange: "₹500 guide", price: 500, hours: "2 days", poster: img(IMG.ziro, 800), tags: ["Culture", "Festival"], likes: 13200 },
    { name: "Kaziranga Safari", state: "Assam", stateSlug: "assam", hook: "Two-thirds of the world's one-horned rhinos live inside these gates.", priceRange: "₹2,500/jeep", price: 2500, hours: "3h safari", poster: img(IMG.rhino, 800), tags: ["Wildlife", "Safari"], likes: 24500 },
    { name: "Majuli River Island", state: "Assam", stateSlug: "assam", hook: "World's largest river island — vaishnavite satras and mask makers.", priceRange: "₹300 ferry", price: 300, hours: "Overnight", poster: img(IMG.river, 800), tags: ["Culture", "Island"], likes: 8700 },
    { name: "Gurudongmar Lake", state: "Sikkim", stateSlug: "sikkim", hook: "17,800 ft holy lake — freezes solid but for one guru-blessed patch.", priceRange: "₹4,000 tour", price: 4000, hours: "Full day", poster: img(IMG.lake, 800), tags: ["Lake", "High-altitude"], likes: 19800 },
    { name: "MG Marg Gangtok", state: "Sikkim", stateSlug: "sikkim", hook: "Litter-free pedestrian promenade — momos, benches, mountain air.", priceRange: "₹200 meal", price: 200, hours: "Evening walk", poster: img(IMG.gangtok, 800), tags: ["Walk", "Food"], likes: 11200 },
    { name: "Kisama Village", state: "Nagaland", stateSlug: "nagaland", hook: "Hornbill Festival grounds — 17 tribes, one week of drum + dance.", priceRange: "₹500 pass", price: 500, hours: "Full day", poster: img(IMG.kisama, 800), tags: ["Festival", "Tribal"], likes: 16400 },
    { name: "Khonoma Green Village", state: "Nagaland", stateSlug: "nagaland", hook: "India's first green village — Angami warriors turned conservationists.", priceRange: "₹200 guide", price: 200, hours: "Half day", poster: img(IMG.village, 800), tags: ["Heritage", "Trek"], likes: 7100 },
    { name: "Loktak Lake", state: "Manipur", stateSlug: "manipur", hook: "World's only floating national park — phumdi islands and Sangai deer.", priceRange: "₹600 boat", price: 600, hours: "3h", poster: img(IMG.loktak, 800), tags: ["Lake", "Wildlife"], likes: 9300 },
    { name: "Aizawl Sunset Point", state: "Mizoram", stateSlug: "mizoram", hook: "Ridge city that turns copper for exactly seven minutes each dusk.", priceRange: "Free", price: 0, hours: "1h", poster: img(IMG.hills, 800), tags: ["View", "Sunset"], likes: 6400 },
    { name: "Unakoti Rock Reliefs", state: "Tripura", stateSlug: "tripura", hook: "999,999 rock-cut faces carved into a jungle cliff, no one knows by whom.", priceRange: "₹200 guide", price: 200, hours: "Half day", poster: img(IMG.cave, 800), tags: ["Heritage", "Mystery"], likes: 5900 },
  ];
  return raw.map((p, i) => ({ ...p, id: `pl-${i + 1}` }));
}

function stays(): Stay[] {
  const raw: Omit<Stay, "id">[] = [
    { name: "Khasi Hills Bamboo Cottage", stateSlug: "meghalaya", place: "Sohra, Meghalaya", pricePerNight: 2400, rating: 4.8, reviews: 312, img: img(IMG.cherra), gallery: [img(IMG.cherra, 1200), img(IMG.waterfall, 1200), img(IMG.home, 1200)], amenities: ["Valley view", "Home-cooked Khasi meals", "Bonfire", "Guide on call"], hostNote: "Run by the Lyngdoh family, 20 min from Nohkalikai Falls.", hostId: "u-host", bedrooms: 2, guests: 4, description: "Bamboo-and-slate cottage perched on a Sohra ridge with panoramic view of the Bangladesh plains. Wake up to gibbon calls; sleep under a wool quilt." },
    { name: "Living Root Homestay", stateSlug: "meghalaya", place: "Nongriat, Meghalaya", pricePerNight: 1400, rating: 4.9, reviews: 505, img: img(IMG.livingRoot), gallery: [img(IMG.livingRoot, 1200), img(IMG.bridge, 1200), img(IMG.village, 1200)], amenities: ["Root-bridge trailhead", "Organic kitchen", "Porter support"], hostNote: "3,500 steps down into the jungle — worth every one of them.", hostId: "u-host", bedrooms: 1, guests: 3, description: "Cross the double-decker root bridge to reach a village of 60 families. No roads, no crowds — just moss, waterfalls, and porters who carry your bag for a smile." },
    { name: "Gompa View Farmstay", stateSlug: "arunachal-pradesh", place: "Tawang, Arunachal Pradesh", pricePerNight: 2900, rating: 4.7, reviews: 188, img: img(IMG.tawang), gallery: [img(IMG.tawang, 1200), img(IMG.monastery, 1200), img(IMG.peak, 1200)], amenities: ["Monastery view", "Yak-butter tea", "Heated rooms", "ILP help"], hostNote: "Sunrise over the 400-year-old gompa from your window.", hostId: "u-host", bedrooms: 3, guests: 6, description: "Heated Monpa farmhouse with prayer flags on every eave. The host is a former army officer who will pour you butter tea while telling you about the 1962 war." },
    { name: "Ziro Valley Eco Huts", stateSlug: "arunachal-pradesh", place: "Ziro, Arunachal Pradesh", pricePerNight: 1900, rating: 4.6, reviews: 264, img: img(IMG.ziro), gallery: [img(IMG.ziro, 1200), img(IMG.hills, 1200), img(IMG.festival, 1200)], amenities: ["Paddy-field deck", "Apatani host family", "Cycle rental"], hostNote: "Walk into the rice fields straight from the veranda.", hostId: "u-host", bedrooms: 2, guests: 4, description: "Bamboo huts on stilts inside an Apatani hamlet. Book September for the Ziro Music Festival — the huts sell out a year in advance." },
    { name: "Ridge House Gangtok", stateSlug: "sikkim", place: "Gangtok, Sikkim", pricePerNight: 3200, rating: 4.7, reviews: 421, img: img(IMG.gangtok), gallery: [img(IMG.gangtok, 1200), img(IMG.mountain, 1200), img(IMG.loft, 1200)], amenities: ["Kanchenjunga view", "5 min to MG Marg", "Breakfast included"], hostNote: "Clear mornings show the third-highest peak on earth.", hostId: "u-host", bedrooms: 4, guests: 8, description: "Colonial-style house on the ridge above MG Marg. Every bedroom has a floor-to-ceiling window pointing at Kanchenjunga." },
    { name: "Kisama Heritage Morung", stateSlug: "nagaland", place: "Kisama, Nagaland", pricePerNight: 1700, rating: 4.5, reviews: 146, img: img(IMG.kisama), gallery: [img(IMG.kisama, 1200), img(IMG.festival, 1200), img(IMG.village, 1200)], amenities: ["Hornbill venue walk", "Tribal kitchen", "Log-drum evenings"], hostNote: "Book early for December — Hornbill sells the village out.", hostId: "u-host", bedrooms: 2, guests: 5, description: "A working morung — the traditional Naga bachelor's dormitory — converted into a homestay. Sleep on carved wood, eat smoked pork with bamboo shoot." },
    { name: "Kaziranga Forest Edge", stateSlug: "assam", place: "Kohora, Assam", pricePerNight: 2600, rating: 4.6, reviews: 389, img: img(IMG.kaziranga), gallery: [img(IMG.kaziranga, 1200), img(IMG.rhino, 1200), img(IMG.tea, 1200)], amenities: ["Safari desk", "Tea-garden walk", "Machan dining"], hostNote: "Jeep safaris leave from the gate 900 m away at dawn.", hostId: "u-host", bedrooms: 3, guests: 6, description: "Purpose-built tea-estate bungalow at the edge of Kaziranga's central range. Watch elephants cross the road from the machan bar in the evening." },
    { name: "Loktak Floating Homestay", stateSlug: "manipur", place: "Loktak Lake, Manipur", pricePerNight: 2100, rating: 4.8, reviews: 97, img: img(IMG.loktak), gallery: [img(IMG.loktak, 1200), img(IMG.boat, 1200), img(IMG.lake, 1200)], amenities: ["Phumdi boat rides", "Fisherman breakfast", "Sangai deck"], hostNote: "Sleep on the world's only floating national park.", hostId: "u-host", bedrooms: 1, guests: 2, description: "A hut on a phumdi — a floating island of matted vegetation. At dawn the whole lake turns silver and the Sangai deer step out to feed." },
    { name: "Aizawl Ridge Loft", stateSlug: "mizoram", place: "Aizawl, Mizoram", pricePerNight: 1800, rating: 4.5, reviews: 88, img: img(IMG.hills), gallery: [img(IMG.hills, 1200), img(IMG.loft, 1200), img(IMG.night, 1200)], amenities: ["Sunset deck", "Mizo dinner", "Guitar lessons"], hostNote: "Every window is a mountain view. Every neighbour sings.", hostId: "u-host", bedrooms: 2, guests: 4, description: "Modern loft in Zarkawt, Aizawl. Host is a music teacher — bring your voice, leave your inhibitions." },
    { name: "Unakoti Jungle Cabin", stateSlug: "tripura", place: "Unakoti, Tripura", pricePerNight: 1500, rating: 4.4, reviews: 62, img: img(IMG.cabin), gallery: [img(IMG.cabin, 1200), img(IMG.cave, 1200), img(IMG.forest ?? IMG.village, 1200)], amenities: ["Heritage walk", "Tribal kitchen", "Bird-watching"], hostNote: "20-minute walk to the 999,999 rock faces of Unakoti.", hostId: "u-host", bedrooms: 1, guests: 3, description: "Wood cabin at the mouth of the Unakoti trail. Wake up to the sound of hornbills and go to sleep under the loudest cricket orchestra you've ever heard." },
  ];
  return raw.map((s, i) => ({ ...s, id: `stay-${i + 1}` }));
}

function packages(): Package[] {
  const raw: Omit<Package, "id">[] = [
    { title: "Meghalaya Monsoon Trail", days: "5D · 4N", rating: 4.8, reviews: "1.2k", oldPrice: 21900, price: 18400, perks: ["Homestay chain", "Root-bridge trek", "All permits filed"], img: img(IMG.livingRoot), gallery: [img(IMG.livingRoot, 1200), img(IMG.waterfall, 1200), img(IMG.bridge, 1200)], itinerary: ["Day 1 — Guwahati → Shillong, Ward's Lake walk", "Day 2 — Sohra: Nohkalikai Falls + Arwah caves", "Day 3 — Nongriat trek: double-decker root bridge", "Day 4 — Dawki river + Mawlynnong village", "Day 5 — Laitlum canyon sunrise, drop at Guwahati"], states: ["meghalaya"], highlights: ["Living root bridge trek", "Dawki crystal boat ride", "Cleanest village in Asia"], includes: ["4 nights homestay", "Airport transfers", "Private cab with driver", "Breakfast + dinner"], excludes: ["Personal expenses", "Camera fees at monuments"] },
    { title: "Tawang Alpine Circuit", days: "7D · 6N", rating: 4.7, reviews: "860", oldPrice: 36500, price: 31200, perks: ["4×4 with driver", "ILP included", "Altitude buffer day"], img: img(IMG.tawang), gallery: [img(IMG.tawang, 1200), img(IMG.monastery, 1200), img(IMG.peak, 1200)], itinerary: ["Day 1 — Guwahati → Bhalukpong (ILP checkpost)", "Day 2 — Bomdila → Dirang dzong", "Day 3 — Sela Pass → Tawang", "Day 4 — Tawang Monastery + war memorial", "Day 5 — Bum La / PTSO lake", "Day 6 — Return to Dirang hot springs", "Day 7 — Drop at Tezpur"], states: ["arunachal-pradesh"], highlights: ["Sela Pass at 13,700 ft", "Tawang's 400-yr-old gompa", "Bum La border viewpoint"], includes: ["4×4 SUV", "ILP + Bum La army permit", "All accommodations", "Oxygen backup"], excludes: ["Lunches on drive days", "Personal shopping"] },
    { title: "Ziro Music Festival", days: "4D · 3N", rating: 4.5, reviews: "2.1k", oldPrice: 28900, price: 24800, perks: ["Festival pass", "Camping + meals", "Shuttle from Naharlagun"], img: img(IMG.festival), gallery: [img(IMG.festival, 1200), img(IMG.ziro, 1200), img(IMG.camp, 1200)], itinerary: ["Day 1 — Overnight Donyi Polo Express", "Day 2 — Shuttle to Ziro, first acts", "Day 3 — Full festival day + village walk", "Day 4 — Morning sets, shuttle back"], states: ["arunachal-pradesh"], highlights: ["4-day festival pass", "Apatani village immersion", "Camp bonfire jams"], includes: ["Festival wristband", "Camp with bedding", "All meals", "Shuttle from station"], excludes: ["Train ticket", "Alcohol"] },
    { title: "Kaziranga Rhino Safari", days: "3D · 2N", rating: 4.8, reviews: "1.7k", oldPrice: 15900, price: 13200, perks: ["2 jeep safaris", "Naturalist guide", "Tea-estate lunch"], img: img(IMG.kaziranga), gallery: [img(IMG.kaziranga, 1200), img(IMG.rhino, 1200), img(IMG.tea, 1200)], itinerary: ["Day 1 — Guwahati → Kohora, orchid park", "Day 2 — Central-range + western-range safaris", "Day 3 — Tea-garden breakfast, drop at Guwahati"], states: ["assam"], highlights: ["Two jeep safaris in one day", "One-horned rhino sightings", "Assam tea estate lunch"], includes: ["Jeep + naturalist", "Park fees", "Forest edge stay"], excludes: ["Elephant safari (optional)"] },
    { title: "Sikkim Lakes & Passes", days: "6D · 5N", rating: 4.6, reviews: "980", oldPrice: 27500, price: 23900, perks: ["Tsomgo + Gurudongmar", "PAP filed for you", "Oxygen backup"], img: img(IMG.lake), gallery: [img(IMG.lake, 1200), img(IMG.gangtok, 1200), img(IMG.peak, 1200)], itinerary: ["Day 1 — Bagdogra → Gangtok", "Day 2 — Tsomgo Lake + Baba Mandir", "Day 3 — Gangtok → Lachen", "Day 4 — Gurudongmar → Lachung", "Day 5 — Yumthang valley → Gangtok", "Day 6 — Drop at Bagdogra"], states: ["sikkim"], highlights: ["Gurudongmar at 17,800 ft", "Yumthang rhododendron valley", "MG Marg evening"], includes: ["All permits", "SUV", "Oxygen cylinders on board"], excludes: ["Nathu La (subject to army clearance)"] },
    { title: "Hornbill Festival Immersion", days: "5D · 4N", rating: 4.9, reviews: "640", oldPrice: 32000, price: 27800, perks: ["Kisama day passes", "Morung stay", "ILP included"], img: img(IMG.festival), gallery: [img(IMG.festival, 1200), img(IMG.kisama, 1200), img(IMG.village, 1200)], itinerary: ["Day 1 — Dimapur → Kohima, WWII cemetery", "Day 2 — Hornbill: morning dances", "Day 3 — Khonoma green village", "Day 4 — Hornbill finale", "Day 5 — Drop at Dimapur"], states: ["nagaland"], highlights: ["17 tribes under one roof", "Khonoma green village", "Naga king-chilli dinner"], includes: ["4 festival passes", "ILP", "Morung stay", "All meals"], excludes: ["Alcohol at carnival"] },
    { title: "Loktak Floating Retreat", days: "4D · 3N", rating: 4.6, reviews: "410", oldPrice: 19900, price: 16400, perks: ["Phumdi hut", "Fisherman breakfast", "Sangai reserve"], img: img(IMG.loktak), gallery: [img(IMG.loktak, 1200), img(IMG.boat, 1200), img(IMG.lake, 1200)], itinerary: ["Day 1 — Imphal → Loktak", "Day 2 — Phumdi boat rides + Sangai deck", "Day 3 — Kangla fort + Ima Keithel bazaar", "Day 4 — Drop at Imphal"], states: ["manipur"], highlights: ["Sleep on a floating island", "Sangai deer viewing", "Ima Keithel — women-run bazaar"], includes: ["Floating hut", "All boats", "Imphal city cab"], excludes: ["Flight to Imphal"] },
    { title: "Majuli Satras & Masks", days: "3D · 2N", rating: 4.4, reviews: "220", oldPrice: 12400, price: 10800, perks: ["Ferry rides", "Mask workshop", "Satra evening bhaona"], img: img(IMG.river), gallery: [img(IMG.river, 1200), img(IMG.village, 1200), img(IMG.handloom, 1200)], itinerary: ["Day 1 — Jorhat → Majuli ferry", "Day 2 — Satras + Kamalabari mask workshop", "Day 3 — Ferry back, drop at Jorhat"], states: ["assam"], highlights: ["World's largest river island", "Neo-Vaishnavite satras", "Mishing tribal village"], includes: ["Ferry", "Homestay", "Mask workshop"], excludes: ["Camera fees"] },
    { title: "Mizoram Ridge Ride", days: "5D · 4N", rating: 4.5, reviews: "310", oldPrice: 22400, price: 19200, perks: ["Reiek trek", "Blue Mountain viewpoint", "Bamboo dance evening"], img: img(IMG.hills), gallery: [img(IMG.hills, 1200), img(IMG.mountain, 1200), img(IMG.village, 1200)], itinerary: ["Day 1 — Aizawl arrival", "Day 2 — Reiek village + tlangdung viewpoint", "Day 3 — Blue Mountain (Phawngpui) day trip", "Day 4 — Champhai wine valley", "Day 5 — Drop at Lengpui"], states: ["mizoram"], highlights: ["Ridge sunsets", "Cheraw bamboo dance", "Mizo grape wine tasting"], includes: ["ILP", "SUV", "All homestays"], excludes: ["Wine bottles to carry back"] },
    { title: "Tripura Heritage Loop", days: "4D · 3N", rating: 4.3, reviews: "180", oldPrice: 14900, price: 12600, perks: ["Ujjayanta palace", "Unakoti reliefs", "Neermahal at sunset"], img: img(IMG.cave), gallery: [img(IMG.cave, 1200), img(IMG.night, 1200), img(IMG.village, 1200)], itinerary: ["Day 1 — Agartala + Ujjayanta palace", "Day 2 — Neermahal water palace", "Day 3 — Unakoti rock reliefs", "Day 4 — Drop at Agartala"], states: ["tripura"], highlights: ["999,999 rock-cut faces of Unakoti", "Neermahal at sunset", "Ujjayanta palace"], includes: ["Cab", "Homestay", "Guide at Unakoti"], excludes: ["Boat at Neermahal (₹200)"] },
  ];
  return raw.map((p, i) => ({ ...p, id: `pkg-${i + 1}` }));
}

function publicItineraries(pl: Place[]): PublicItinerary[] {
  const stateCodes: Record<string, string> = {
    Meghalaya: "MEGH",
    "Arunachal Pradesh": "ARUN",
    Sikkim: "SIKM",
    Nagaland: "NAGA",
    Assam: "ASSM",
    Manipur: "MANI",
    Mizoram: "MIZO",
    Tripura: "TRIP",
  };
  const templates = [
    { title: "5 Days Chasing Waterfalls in Meghalaya", state: "Meghalaya", stops: ["Nohkalikai Falls", "Double-Decker Root Bridge", "Dawki River"], creator: "u-creator", experience: "Started at Nohkalikai at 6am for the mist rainbow. The Nongriat trek broke my legs but the village at the bottom is straight out of a fable. Dawki on day 4 — the water is not photoshopped, it's actually that clear.", cover: IMG.livingRoot, price: 24800, days: 5, likes: 4820, bookings: 187, rating: 4.9 },
    { title: "Tawang in 7 — Sela, Bum La, Silence", state: "Arunachal Pradesh", stops: ["Sela Pass", "Tawang Monastery", "Ziro Valley"], creator: "u-planner", experience: "Every 1000 ft above 9000 hits differently. The buffer day at Dirang saved my father from AMS. Bum La at −4°C and the ITBP jawans made us butter tea — a memory I'll bore my grandkids with.", cover: IMG.tawang, price: 42400, days: 7, likes: 6210, bookings: 412, rating: 4.8 },
    { title: "Hornbill Weekender · 3 Days Kohima", state: "Nagaland", stops: ["Kisama Village", "Khonoma Green Village"], creator: "u-creator", experience: "Landed at Dimapur, drove up, plugged straight into the Hornbill main stage. 17 tribes, 17 kitchens, 17 kinds of chilli. Khonoma the day after is the palate cleanser — quiet, green, guilty conscience about the pork you ate.", cover: IMG.kisama, price: 28900, days: 3, likes: 3980, bookings: 302, rating: 4.9 },
    { title: "Kaziranga in 48h with a Toddler", state: "Assam", stops: ["Kaziranga Safari"], creator: "u-traveler", experience: "Was scared to take a 3-year-old but the central range morning safari was smooth roads. She counted 14 rhinos and one elephant crossing. Tea-garden lunch at Wild Grass was the win.", cover: IMG.kaziranga, price: 15600, days: 2, likes: 1240, bookings: 84, rating: 4.7 },
    { title: "Sikkim North Circuit · 6 Days", state: "Sikkim", stops: ["MG Marg Gangtok", "Gurudongmar Lake"], creator: "u-planner", experience: "Gurudongmar took 5am start, oxygen for two of us. Yumthang valley the next morning at 20°C, no crowd, just yaks. Ended at MG Marg with hot chocolate on a bench.", cover: IMG.lake, price: 31400, days: 6, likes: 5320, bookings: 261, rating: 4.7 },
    { title: "Ziro Music Fest Route", state: "Arunachal Pradesh", stops: ["Ziro Valley"], creator: "u-creator", experience: "Camped on paddy for 4 nights, woke up to bamboo flute. Peter Cat Recording Co closed the fest and we walked back drunk on Apong.", cover: IMG.festival, price: 26800, days: 4, likes: 7420, bookings: 519, rating: 4.9 },
    { title: "Loktak Slow Weekend", state: "Manipur", stops: ["Loktak Lake"], creator: "u-traveler", experience: "The floating hut has no wifi and no clock. The fisherman's wife made bora rice and dry-fish curry. Watched the sunrise turn everything pink. Would do it again next weekend.", cover: IMG.loktak, price: 17800, days: 3, likes: 2140, bookings: 138, rating: 4.8 },
    { title: "Majuli · 3 Days on the River Island", state: "Assam", stops: ["Majuli River Island"], creator: "u-planner", experience: "Ferried across with the bike. Bhaona at Auniati satra ran till 2am — masked actors, oil lamps, hypnotic. Made a mask myself at Kamalabari, still hanging on my wall.", cover: IMG.river, price: 13200, days: 3, likes: 1780, bookings: 96, rating: 4.6 },
    { title: "Aizawl Ridge & Blue Mountain", state: "Mizoram", stops: ["Aizawl Sunset Point"], creator: "u-creator", experience: "Aizawl at dusk from the ridge = seven minutes of copper. Blue Mountain the next day sits at 8800 ft with a straight cliff drop into Myanmar. Barely a soul up there.", cover: IMG.hills, price: 19400, days: 4, likes: 2610, bookings: 142, rating: 4.6 },
    { title: "Unakoti + Neermahal Heritage", state: "Tripura", stops: ["Unakoti Rock Reliefs"], creator: "u-planner", experience: "The Unakoti trail is jungle-slick in monsoon. 999,999 faces staring back — I counted 34 before I gave up. Neermahal at sunset from a paddle boat = the most peaceful hour I've had this year.", cover: IMG.cave, price: 11400, days: 4, likes: 1420, bookings: 71, rating: 4.5 },
  ];
  return templates.map((t) => {
    const dayStops = t.stops.map((name, i) => {
      const place = pl.find((x) => x.name === name)!;
      return { placeId: place.id, day: i + 1, note: place.hook };
    });
    return {
      code: `NN-${stateCodes[t.state] ?? "NRTH"}-${Math.floor(100 + Math.random() * 900)}`,
      title: t.title,
      creatorId: t.creator,
      state: t.state,
      stateSlug: pl.find((x) => x.state === t.state)?.stateSlug ?? "meghalaya",
      days: t.days,
      price: t.price,
      cover: img(t.cover, 1200),
      gallery: [img(t.cover, 1200), img(IMG.mountain, 1200), img(IMG.river, 1200)],
      rating: t.rating,
      reviews: Math.floor(t.likes / 15),
      likes: t.likes,
      bookings: t.bookings,
      stops: dayStops,
      experience: t.experience,
      publishedAt: new Date(Date.now() - Math.random() * 10 * 86400000).toISOString(),
    };
  });
}

function hostPlans(): HostReferralPlan[] {
  const cities = [
    { city: "Shillong", cover: IMG.gangtok, stay: "stay-1" },
    { city: "Sohra", cover: IMG.waterfall, stay: "stay-1" },
    { city: "Nongriat", cover: IMG.bridge, stay: "stay-2" },
    { city: "Tawang", cover: IMG.monastery, stay: "stay-3" },
    { city: "Ziro", cover: IMG.ziro, stay: "stay-4" },
    { city: "Gangtok", cover: IMG.gangtok, stay: "stay-5" },
    { city: "Kohima", cover: IMG.kisama, stay: "stay-6" },
    { city: "Kaziranga", cover: IMG.kaziranga, stay: "stay-7" },
    { city: "Loktak", cover: IMG.loktak, stay: "stay-8" },
    { city: "Aizawl", cover: IMG.hills, stay: "stay-9" },
  ];
  return cities.map((c, i) => ({
    id: `hp-${i + 1}`,
    hostId: "u-host",
    stayId: c.stay,
    title: `${c.city} in 48 Hours — from your homestay`,
    city: c.city,
    cover: img(c.cover, 1000),
    stops: [`Arrive at homestay`, `Sunset viewpoint`, `Local dinner`, `Village walk`, `Marketplace tour`, `Signature site`],
    cabs: [
      { label: "Local sightseeing (8h)", price: 2400 },
      { label: "Airport drop", price: 1800 },
    ],
    places: [
      { name: `${c.city} main sight`, time: "Day 1 · 10am", price: 400 },
      { name: `${c.city} sunset point`, time: "Day 1 · 5pm", price: 0 },
      { name: `Off-beat spot near ${c.city}`, time: "Day 2 · 8am", price: 300 },
      { name: `${c.city} heritage walk`, time: "Day 2 · 4pm", price: 500 },
    ],
    food: [
      { name: `${c.city} local kitchen`, kind: "Lunch", price: 320 },
      { name: "Rooftop cafe", kind: "Coffee", price: 180 },
      { name: "Night market street food", kind: "Snack", price: 250 },
    ],
    totalPrice: 6800 + i * 200,
    referralCode: `HOST-${c.city.slice(0, 4).toUpperCase()}-${100 + i}`,
    bookings: 20 + Math.floor(Math.random() * 40),
  }));
}

function seedBookings(): Booking[] {
  const now = Date.now();
  return [
    { id: "bk-1", ownerId: "u-traveler", kind: "package", refId: "pkg-1", title: "Meghalaya Monsoon Trail", detail: "5D · 4N · 2 travellers", amount: 36800, travellers: 2, status: "completed", createdAt: new Date(now - 30 * 86400000).toISOString() },
    { id: "bk-2", ownerId: "u-traveler", kind: "stay", refId: "stay-2", title: "Living Root Homestay", detail: "2 nights · 2 guests", amount: 2800, travellers: 2, status: "confirmed", createdAt: new Date(now - 3 * 86400000).toISOString() },
    { id: "bk-3", ownerId: "u-traveler", kind: "cab", refId: "cb-1", title: "Guwahati → Shillong (SUV)", detail: "Innova · 100 km", amount: 2800, travellers: 3, status: "confirmed", createdAt: new Date(now - 1 * 86400000).toISOString() },
    { id: "bk-4", ownerId: "u-creator", kind: "package", refId: "pkg-6", title: "Hornbill Festival Immersion", detail: "5D · 4N", amount: 27800, travellers: 1, status: "completed", createdAt: new Date(now - 60 * 86400000).toISOString() },
    { id: "bk-5", ownerId: "u-planner", kind: "package", refId: "pkg-2", title: "Tawang Alpine Circuit", detail: "7D · 6N · 4 travellers", amount: 124800, travellers: 4, status: "completed", createdAt: new Date(now - 45 * 86400000).toISOString() },
  ];
}

function seedItineraries(): UserItinerary[] {
  return [
    {
      id: "it-arya-draft",
      ownerId: "u-traveler",
      title: "My Meghalaya monsoon plan",
      stops: [
        { placeId: "pl-1", day: 1 },
        { placeId: "pl-2", day: 2 },
        { placeId: "pl-3", day: 3 },
      ],
      status: "draft",
      createdAt: new Date().toISOString(),
      totalPrice: 1500,
      cover: img(IMG.waterfall, 1000),
    },
    {
      id: "it-arya-completed",
      ownerId: "u-traveler",
      title: "Nongriat weekend",
      stops: [
        { placeId: "pl-2", day: 1 },
        { placeId: "pl-3", day: 2 },
      ],
      status: "completed",
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      totalPrice: 1100,
      cover: img(IMG.bridge, 1000),
    },
  ];
}

function seedGroupTrips(): GroupTrip[] {
  return [
    {
      id: "gt-1",
      organiserId: "u-traveler",
      title: "College crew · Meghalaya Aug 2026",
      itineraryId: "it-arya-draft",
      cover: img(IMG.livingRoot, 1000),
      perSeat: 18400,
      seats: [
        { id: "seat-1", memberName: "Arya Barua", claimed: true, paid: true, email: "arya@demo.nn" },
        { id: "seat-2", memberName: "Rohan Das", claimed: true, paid: true, email: "rohan@demo.nn" },
        { id: "seat-3", memberName: "Priya Nath", claimed: true, paid: false, email: "priya@demo.nn" },
        { id: "seat-4", memberName: "Seat 4", claimed: false, paid: false },
        { id: "seat-5", memberName: "Seat 5", claimed: false, paid: false },
      ],
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];
}

function seedNotifications(): Notification[] {
  return [
    { id: "n-1", ownerId: "u-traveler", title: "Your Nongriat trip is complete", body: "Publish it to unlock a NORTHNEST short code and earn from bookings.", createdAt: new Date().toISOString(), read: false },
    { id: "n-2", ownerId: "u-creator", title: "New booking on your Tawang route", body: "3 travellers used NN-ARUN-217 · earnings: ₹ 4,240", createdAt: new Date().toISOString(), read: false },
    { id: "n-3", ownerId: "u-host", title: "Referral used: HOST-SOHR-100", body: "Guest booked a 48h city plan · payout ₹ 1,700", createdAt: new Date().toISOString(), read: false },
    { id: "n-4", ownerId: "u-planner", title: "Escrow released for T-Zara-491", body: "Trip completed · 60% ₹ 74,880 credited", createdAt: new Date().toISOString(), read: false },
    { id: "n-5", ownerId: "u-admin", title: "3 creator verifications pending", body: "Meiko, Zara, Bikash awaiting review", createdAt: new Date().toISOString(), read: false },
  ];
}

function seedSos(): SosBroadcast[] {
  return [
    { id: "sos-1", ownerId: "u-traveler", message: "Test broadcast — Sela Pass", lat: 27.5, lng: 92.1, createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), resolved: true },
  ];
}

export function seed(): StoreState {
  const pl = places();
  return {
    currentUserId: null,
    accounts: accounts(),
    places: pl,
    stays: stays(),
    packages: packages(),
    publicItineraries: publicItineraries(pl),
    userItineraries: seedItineraries(),
    bookings: seedBookings(),
    groupTrips: seedGroupTrips(),
    hostPlans: hostPlans(),
    sos: seedSos(),
    notifications: seedNotifications(),
    likes: {},
  };
}
