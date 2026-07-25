/**
 * Demo API client — localStorage-backed prototype state.
 * Replace simulate() bodies with real fetch() for production.
 */

import {
  offers,
  permitRules,
  stays,
  transportRoutes,
  travelPackages,
  type Offer,
  type PermitRule,
  type Stay,
  type TransportMode,
  type TransportRoute,
  type TravelPackage,
} from "@/data/catalog";
import {
  CREATOR_PLANS,
  DEMO_ACCOUNTS,
  FREELANCE_PLANS,
  GROUP_INVITES,
  HOST_HOMES,
  HOST_TRIPS_48H,
  PLACE_CLIPS,
  PUBLISHED_ITINERARIES,
  SAMPLE_VIDEOS,
  findAccount,
  type AccountType,
  type CreatorPlan,
  type DemoAccount,
  type FreelancePlan,
  type GroupInvite,
  type HostHome,
  type HostTrip48h,
  type PlaceClip,
  type PublishedItinerary,
} from "@/data/demoUniverse";

const simulate = <T>(data: T, ms = 280): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

/* ============ CATALOG ============ */

export function fetchStays(stateSlug?: string): Promise<Stay[]> {
  const list = stateSlug ? stays.filter((s) => s.stateSlug === stateSlug) : stays;
  return simulate(list);
}

export function fetchStay(id: string): Promise<Stay | undefined> {
  return simulate(stays.find((s) => s.id === id));
}

export function fetchRoutes(mode: TransportMode, query?: string): Promise<TransportRoute[]> {
  let list = transportRoutes.filter((r) => r.mode === mode);
  if (query?.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter(
      (r) =>
        r.from.toLowerCase().includes(q) ||
        r.to.toLowerCase().includes(q) ||
        r.fromCode.toLowerCase().includes(q) ||
        r.toCode.toLowerCase().includes(q) ||
        r.carrier.toLowerCase().includes(q),
    );
  }
  return simulate(list);
}

export function fetchPackages(): Promise<TravelPackage[]> {
  return simulate(travelPackages);
}

export function fetchPackage(id: string): Promise<TravelPackage | undefined> {
  return simulate(travelPackages.find((p) => p.id === id));
}

export function fetchOffers(): Promise<Offer[]> {
  return simulate(offers);
}

export function fetchPermitRules(): Promise<PermitRule[]> {
  return simulate(permitRules, 200);
}

export function fetchPlaceClips(): Promise<PlaceClip[]> {
  return simulate(PLACE_CLIPS, 150);
}

export function fetchPublishedItineraries(): Promise<PublishedItinerary[]> {
  const custom = readJson<PublishedItinerary[]>(KEYS.publishedExtra, []);
  return simulate([...custom, ...PUBLISHED_ITINERARIES]);
}

export function fetchPublishedByCode(code: string): Promise<PublishedItinerary | undefined> {
  const q = code.trim().toUpperCase();
  return fetchPublishedItineraries().then((list) =>
    list.find((p) => p.code.toUpperCase() === q),
  );
}

export function fetchCreatorPlans(creatorId?: string): Promise<CreatorPlan[]> {
  const extra = readJson<CreatorPlan[]>(KEYS.creatorPlansExtra, []);
  const all = [...extra, ...CREATOR_PLANS];
  return simulate(creatorId ? all.filter((p) => p.creatorId === creatorId) : all);
}

export function fetchCreatorPlan(id: string): Promise<CreatorPlan | undefined> {
  return fetchCreatorPlans().then((list) => list.find((p) => p.id === id));
}

export function fetchHostHomes(hostId?: string): Promise<HostHome[]> {
  return simulate(hostId ? HOST_HOMES.filter((h) => h.hostId === hostId) : HOST_HOMES);
}

export function fetchHostBySlug(
  slug: string,
): Promise<{ home: HostHome; host: DemoAccount } | undefined> {
  const home = HOST_HOMES.find((h) => h.slug === slug);
  if (!home) return simulate(undefined);
  const host = DEMO_ACCOUNTS.find((a) => a.id === home.hostId);
  if (!host) return simulate(undefined);
  return simulate({ home, host });
}

export function fetchHostTrips(hostId?: string): Promise<HostTrip48h[]> {
  return simulate(hostId ? HOST_TRIPS_48H.filter((t) => t.hostId === hostId) : HOST_TRIPS_48H);
}

export function fetchGroupInvites(): Promise<GroupInvite[]> {
  const overrides = readJson<GroupInvite[]>(KEYS.groupOverrides, []);
  const map = new Map(GROUP_INVITES.map((g) => [g.code, g]));
  for (const o of overrides) map.set(o.code, o);
  return simulate([...map.values()]);
}

export function fetchGroupByCode(code: string): Promise<GroupInvite | undefined> {
  return fetchGroupInvites().then((list) =>
    list.find((g) => g.code.toUpperCase() === code.trim().toUpperCase()),
  );
}

export function fetchFreelancePlans(plannerId?: string): Promise<FreelancePlan[]> {
  return simulate(plannerId ? FREELANCE_PLANS.filter((p) => p.plannerId === plannerId) : FREELANCE_PLANS);
}

export function fetchFreelancePlan(id: string): Promise<FreelancePlan | undefined> {
  return simulate(FREELANCE_PLANS.find((p) => p.id === id));
}

export function fetchCreators(): Promise<DemoAccount[]> {
  return simulate(DEMO_ACCOUNTS.filter((a) => a.type === "creator"));
}

export function fetchCreatorByHandle(handle: string): Promise<DemoAccount | undefined> {
  return simulate(
    DEMO_ACCOUNTS.find(
      (a) => a.type === "creator" && a.handle?.toLowerCase() === handle.toLowerCase(),
    ),
  );
}

export function fetchPlannerBySubdomain(sub: string): Promise<DemoAccount | undefined> {
  return simulate(
    DEMO_ACCOUNTS.find(
      (a) => a.type === "planner" && a.subdomain?.toLowerCase() === sub.toLowerCase(),
    ),
  );
}

/* ============ ACCOUNT STORE ============ */

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  type: AccountType;
  handle?: string;
  avatar: string;
  verified?: boolean;
  bio?: string;
  slug?: string;
  subdomain?: string;
};

export type BookingStatus = "confirmed" | "completed" | "cancelled";

export type Booking = {
  id: string;
  kind:
    | "stay"
    | "flight"
    | "train"
    | "cab"
    | "package"
    | "itinerary"
    | "creator-plan"
    | "host-trip"
    | "freelance";
  title: string;
  detail: string;
  amount: number;
  travellers: number;
  createdAt: string;
  status: BookingStatus;
  sourceId?: string;
  publisherId?: string;
  publishCode?: string;
};

export type PermitApplication = {
  id: string;
  state: string;
  permitType: string;
  applicant: string;
  travelWindow: string;
  status: "approved";
  createdAt: string;
};

export type SavedItinerary = {
  id: string;
  title: string;
  placeIds: string[];
  createdAt: string;
  userId: string;
};

export type CommissionEntry = {
  id: string;
  beneficiaryId: string;
  fromBookingId: string;
  title: string;
  amount: number;
  createdAt: string;
};

const KEYS = {
  user: "nn-demo-user-v2",
  bookings: "nn-demo-bookings-v2",
  permits: "nn-demo-permits",
  cart: "nn-demo-cart",
  savedItineraries: "nn-demo-saved-itins",
  publishedExtra: "nn-demo-published-extra",
  creatorPlansExtra: "nn-demo-creator-plans",
  commissions: "nn-demo-commissions",
  groupOverrides: "nn-demo-groups",
  undoStack: "nn-demo-undo",
} as const;

const CHANGE_EVENT = "nn-demo-store-change";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function refCode(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function subscribeDemoStore(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/* --- auth --- */

export function getUser(): DemoUser | null {
  return readJson<DemoUser | null>(KEYS.user, null);
}

export function listDemoAccounts(): DemoAccount[] {
  return DEMO_ACCOUNTS;
}

export function signIn(name: string, email: string): Promise<DemoUser> {
  const user: DemoUser = {
    id: `guest-${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    type: "traveler",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
  };
  writeJson(KEYS.user, user);
  return simulate(user, 400);
}

export function signInDemo(idOrEmail: string, password: string): Promise<DemoUser> {
  const acc = findAccount(idOrEmail, password);
  if (!acc) return Promise.reject(new Error("Invalid id or password"));
  const user: DemoUser = {
    id: acc.id,
    name: acc.name,
    email: acc.email,
    type: acc.type,
    handle: acc.handle,
    avatar: acc.avatar,
    verified: acc.verified,
    bio: acc.bio,
    slug: acc.slug,
    subdomain: acc.subdomain,
  };
  writeJson(KEYS.user, user);
  return simulate(user, 400);
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEYS.user);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/* --- cart / itinerary builder --- */

export function getCart(): string[] {
  return readJson<string[]>(KEYS.cart, []);
}

export function addToCart(placeId: string): string[] {
  const cart = getCart();
  if (!cart.includes(placeId)) {
    const next = [...cart, placeId];
    writeJson(KEYS.cart, next);
    pushUndo({ type: "remove", placeId });
    return next;
  }
  return cart;
}

export function removeFromCart(placeId: string): string[] {
  const next = getCart().filter((id) => id !== placeId);
  writeJson(KEYS.cart, next);
  return next;
}

type UndoAction = { type: "remove" | "add"; placeId: string };

function pushUndo(action: UndoAction) {
  const stack = readJson<UndoAction[]>(KEYS.undoStack, []);
  writeJson(KEYS.undoStack, [action, ...stack].slice(0, 20));
}

export function undoLastCartAction(): string[] {
  const stack = readJson<UndoAction[]>(KEYS.undoStack, []);
  const action = stack[0];
  if (!action) return getCart();
  writeJson(KEYS.undoStack, stack.slice(1));
  if (action.type === "remove") return removeFromCart(action.placeId);
  const cart = getCart();
  if (!cart.includes(action.placeId)) {
    writeJson(KEYS.cart, [...cart, action.placeId]);
  }
  return getCart();
}

export function clearCart() {
  writeJson(KEYS.cart, []);
}

export function saveItinerary(title: string): Promise<SavedItinerary> {
  const user = getUser();
  if (!user) return Promise.reject(new Error("Sign in required"));
  const placeIds = getCart();
  if (placeIds.length === 0) return Promise.reject(new Error("Cart empty"));
  const itin: SavedItinerary = {
    id: refCode("ITIN"),
    title: title.trim() || "My itinerary",
    placeIds,
    createdAt: new Date().toISOString(),
    userId: user.id,
  };
  writeJson(KEYS.savedItineraries, [itin, ...listSavedItineraries()]);
  return simulate(itin, 500);
}

export function listSavedItineraries(): SavedItinerary[] {
  const user = getUser();
  const all = readJson<SavedItinerary[]>(KEYS.savedItineraries, []);
  if (!user) return all;
  return all.filter((i) => i.userId === user.id);
}

/* --- bookings --- */

export function listBookings(): Booking[] {
  return ensureSeedBookings();
}

function ensureSeedBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  const existing = readJson<Booking[] | null>(KEYS.bookings, null);
  if (existing) return existing;
  const seed: Booking[] = [
    {
      id: "NN-SEED01",
      kind: "itinerary",
      title: "Ananya's Monsoon Meghalaya",
      detail: "Completed demo trip · ready to publish",
      amount: 18400,
      travellers: 1,
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      status: "completed",
      sourceId: "pub-1",
      publisherId: "traveler1",
      publishCode: "NN-MEGH-804",
    },
    {
      id: "NN-SEED02",
      kind: "package",
      title: "Tawang Alpine Circuit",
      detail: "Confirmed — mark complete to unlock publish code",
      amount: 31200,
      travellers: 2,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: "confirmed",
      sourceId: "pkg-tawang-circuit",
    },
  ];
  writeJson(KEYS.bookings, seed);
  return seed;
}

export function createBooking(
  input: Omit<Booking, "id" | "createdAt" | "status"> & { status?: BookingStatus },
): Promise<Booking> {
  const booking: Booking = {
    ...input,
    status: input.status ?? "confirmed",
    id: refCode("NN"),
    createdAt: new Date().toISOString(),
  };
  writeJson(KEYS.bookings, [booking, ...listBookings()]);
  return simulate(booking, 600);
}

export function completeBooking(bookingId: string): Promise<Booking> {
  const list = listBookings();
  const idx = list.findIndex((b) => b.id === bookingId);
  if (idx < 0) return Promise.reject(new Error("Booking not found"));
  const updated = { ...list[idx], status: "completed" as const };
  const next = [...list];
  next[idx] = updated;
  writeJson(KEYS.bookings, next);

  if (updated.publisherId && updated.publisherId !== getUser()?.id) {
    const amount = Math.round(updated.amount * 0.08);
    addCommission({
      beneficiaryId: updated.publisherId,
      fromBookingId: updated.id,
      title: `Commission · ${updated.title}`,
      amount,
    });
  }
  return simulate(updated, 400);
}

export function publishItineraryFromBooking(
  bookingId: string,
  payload: { title: string; experience: string },
): Promise<PublishedItinerary> {
  const booking = listBookings().find((b) => b.id === bookingId);
  if (!booking) return Promise.reject(new Error("Booking not found"));
  if (booking.status !== "completed") {
    return Promise.reject(new Error("Codes ONLY generate after COMPLETED booking status"));
  }
  if (booking.publishCode) {
    return fetchPublishedByCode(booking.publishCode).then((p) => {
      if (!p) throw new Error("Published itinerary missing");
      return p;
    });
  }
  const user = getUser();
  if (!user) return Promise.reject(new Error("Sign in required"));

  const code = generatePublishCode(payload.title);
  const cartPlaces = getCart()
    .map((id) => PLACE_CLIPS.find((c) => c.id === id))
    .filter(Boolean) as PlaceClip[];
  const clips = cartPlaces.length > 0 ? cartPlaces : PLACE_CLIPS.slice(0, 4);

  const pub: PublishedItinerary = {
    id: refCode("PUB"),
    code,
    title: payload.title,
    publisherId: user.id,
    publisherName: user.name,
    publisherType:
      user.type === "admin" ? "traveler" : (user.type as PublishedItinerary["publisherType"]),
    days: Math.max(clips.length, 2),
    priceFrom: booking.amount,
    rating: 4.8,
    likes: 12,
    reviews: 1,
    cover: clips[0]?.poster ?? "",
    photos: clips.map((c) => c.poster),
    videos: clips.map((c) => c.videoUrl),
    stops: clips.map((c, i) => ({
      place: c.place,
      day: i + 1,
      note: c.blurb,
      img: c.poster,
    })),
    experience: payload.experience,
    commissionPct: user.type === "creator" ? 12 : 8,
    fromCompletedBooking: true,
  };

  writeJson(KEYS.publishedExtra, [pub, ...readJson<PublishedItinerary[]>(KEYS.publishedExtra, [])]);

  const list = listBookings();
  const bIdx = list.findIndex((b) => b.id === bookingId);
  if (bIdx >= 0) {
    list[bIdx] = { ...list[bIdx], publishCode: code };
    writeJson(KEYS.bookings, list);
  }
  return simulate(pub, 700);
}

function generatePublishCode(title: string) {
  const token = title
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(4, "X");
  const num = Math.floor(100 + Math.random() * 900);
  return `NN-${token}-${num}`;
}

export function publishCreatorPlan(input: {
  title: string;
  experience: string;
  placeIds: string[];
  priceFrom: number;
}): Promise<{ plan: CreatorPlan; published: PublishedItinerary }> {
  const user = getUser();
  if (!user) return Promise.reject(new Error("Sign in required"));
  if (user.type === "traveler") {
    return Promise.reject(new Error("Travelers must complete a booking before publishing"));
  }
  if (user.type === "creator" && !user.verified) {
    return Promise.reject(new Error("Verification required to claim creator profile"));
  }

  const clips = input.placeIds
    .map((id) => PLACE_CLIPS.find((c) => c.id === id))
    .filter(Boolean) as PlaceClip[];
  const use = clips.length ? clips : PLACE_CLIPS.slice(0, 3);

  const plan: CreatorPlan = {
    id: refCode("CP"),
    creatorId: user.id,
    title: input.title,
    cover: use[0].poster,
    photos: use.map((c) => c.poster),
    videos: use.map((c) => c.videoUrl),
    days: use.length,
    priceFrom: input.priceFrom,
    likes: 0,
    rating: 5,
    experience: input.experience,
    stops: use.map((c, i) => ({ place: c.place, day: i + 1, note: c.blurb, img: c.poster })),
  };
  writeJson(KEYS.creatorPlansExtra, [plan, ...readJson<CreatorPlan[]>(KEYS.creatorPlansExtra, [])]);

  const published: PublishedItinerary = {
    id: refCode("PUB"),
    code: generatePublishCode(input.title),
    title: input.title,
    publisherId: user.id,
    publisherName: user.name,
    publisherType:
      user.type === "admin" ? "creator" : (user.type as PublishedItinerary["publisherType"]),
    days: plan.days,
    priceFrom: plan.priceFrom,
    rating: 5,
    likes: 0,
    reviews: 0,
    cover: plan.cover,
    photos: plan.photos,
    videos: plan.videos,
    stops: plan.stops,
    experience: input.experience,
    commissionPct: 12,
    fromCompletedBooking: false,
  };
  writeJson(KEYS.publishedExtra, [
    published,
    ...readJson<PublishedItinerary[]>(KEYS.publishedExtra, []),
  ]);
  return simulate({ plan, published }, 600);
}

function addCommission(input: Omit<CommissionEntry, "id" | "createdAt">) {
  const entry: CommissionEntry = {
    ...input,
    id: refCode("COM"),
    createdAt: new Date().toISOString(),
  };
  writeJson(KEYS.commissions, [entry, ...listCommissions()]);
}

export function listCommissions(userId?: string): CommissionEntry[] {
  const all = ensureSeedCommissions();
  if (!userId) return all;
  return all.filter((c) => c.beneficiaryId === userId);
}

function ensureSeedCommissions(): CommissionEntry[] {
  if (typeof window === "undefined") return [];
  const existing = readJson<CommissionEntry[] | null>(KEYS.commissions, null);
  if (existing) return existing;
  const seed: CommissionEntry[] = [
    {
      id: "COM-SEED1",
      beneficiaryId: "traveler1",
      fromBookingId: "NN-DEMO",
      title: "Commission · Ananya's Monsoon Meghalaya",
      amount: 1472,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: "COM-SEED2",
      beneficiaryId: "creator1",
      fromBookingId: "NN-DEMO2",
      title: "Commission · Root Bridge Film Route",
      amount: 1872,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: "COM-SEED3",
      beneficiaryId: "planner1",
      fromBookingId: "NN-DEMO3",
      title: "Planner share 60% · Seven Sisters Sampler",
      amount: 7200,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];
  writeJson(KEYS.commissions, seed);
  return seed;
}

export function claimGroupSeat(
  inviteCode: string,
  seatId: string,
  claimerName: string,
): Promise<GroupInvite> {
  return fetchGroupByCode(inviteCode).then((g) => {
    if (!g) throw new Error("Invite not found");
    const seats = g.seats.map((s) =>
      s.id === seatId && !s.claimedBy
        ? { ...s, claimedBy: claimerName, paid: false, emiPaid: 0 }
        : s,
    );
    const updated = { ...g, seats };
    const overrides = readJson<GroupInvite[]>(KEYS.groupOverrides, []);
    const filtered = overrides.filter((o) => o.code !== g.code);
    writeJson(KEYS.groupOverrides, [updated, ...filtered]);
    return simulate(updated, 500);
  });
}

export function payGroupSeatEmi(inviteCode: string, seatId: string): Promise<GroupInvite> {
  return fetchGroupByCode(inviteCode).then((g) => {
    if (!g) throw new Error("Invite not found");
    const seats = g.seats.map((s) => {
      if (s.id !== seatId) return s;
      const emiPaid = Math.min(4, s.emiPaid + 1);
      return { ...s, emiPaid, paid: emiPaid >= 4 };
    });
    const updated = { ...g, seats };
    const overrides = readJson<GroupInvite[]>(KEYS.groupOverrides, []);
    const filtered = overrides.filter((o) => o.code !== g.code);
    writeJson(KEYS.groupOverrides, [updated, ...filtered]);
    return simulate(updated, 500);
  });
}

export function createGroupInvite(input: {
  title: string;
  pricePerSeat: number;
  seatCount: number;
}): Promise<GroupInvite> {
  const user = getUser();
  if (!user) return Promise.reject(new Error("Sign in required"));
  const invite: GroupInvite = {
    id: refCode("GI"),
    code: `CREW-${refCode("X").slice(3, 7)}`,
    title: input.title,
    plannerName: user.name,
    plannerId: user.id,
    cover: PLACE_CLIPS[0].poster,
    pricePerSeat: input.pricePerSeat,
    emiPerMonth: Math.round(input.pricePerSeat / 4),
    seats: Array.from({ length: input.seatCount }, (_, i) => ({
      id: `seat-${i + 1}`,
      label: `Seat ${i + 1}`,
      claimedBy: i === 0 ? user.name : null,
      paid: i === 0,
      emiPaid: i === 0 ? 4 : 0,
    })),
  };
  const overrides = readJson<GroupInvite[]>(KEYS.groupOverrides, []);
  writeJson(KEYS.groupOverrides, [invite, ...overrides]);
  return simulate(invite, 500);
}

export function listPermits(): PermitApplication[] {
  return readJson<PermitApplication[]>(KEYS.permits, []);
}

export function applyForPermit(
  input: Omit<PermitApplication, "id" | "createdAt" | "status">,
): Promise<PermitApplication> {
  const permit: PermitApplication = {
    ...input,
    id: refCode("ILP"),
    status: "approved",
    createdAt: new Date().toISOString(),
  };
  writeJson(KEYS.permits, [permit, ...listPermits()]);
  return simulate(permit, 900);
}

export const formatINR = (n: number) => `₹ ${n.toLocaleString("en-IN")}`;

export function dashboardPathFor(type: AccountType): string {
  switch (type) {
    case "creator":
      return "/dashboard/creator";
    case "host":
      return "/dashboard/host";
    case "planner":
      return "/dashboard/planner";
    case "admin":
      return "/dashboard/admin";
    default:
      return "/dashboard/traveler";
  }
}

export { SAMPLE_VIDEOS, PLACE_CLIPS, DEMO_ACCOUNTS };
