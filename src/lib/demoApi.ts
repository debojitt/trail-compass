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
import {
  adminCmsSnapshot,
  deleteCityItem,
  deleteCreatorPlan,
  deleteFreelancePlan,
  deleteHostHome,
  deleteHostTrip,
  getCreatorPlanCms,
  getEchoSosEnabled,
  getFreelancePlanCms,
  getHostHomeBySlugCms,
  getPlannerSettings,
  getProfileOverride,
  listAllCreatorPlans,
  listAllFreelancePlans,
  listAllHostHomes,
  listAllHostTrips,
  listCityItems,
  listCreatorPlansCms,
  listFreelancePlansCms,
  listHostHomesCms,
  listHostTripsCms,
  mergeAccountProfile,
  regenerateTripReferral,
  setCreatorPlanPublished,
  setEchoSosEnabled,
  setFreelancePlanPublished,
  setHostHomeListed,
  updatePlannerSettings,
  updateProfile,
  upsertCityItem,
  upsertCreatorPlan,
  upsertFreelancePlan,
  upsertHostHome,
  upsertHostTrip,
  type HostCityItem,
  type PlannerSettings,
  type ProfileOverride,
} from "@/lib/demoCms";
import {
  appendActivity,
  createEnquiry,
  getDashSettings,
  getListingPublishedFlag,
  isUserSuspended,
  listActivity,
  listEnquiries,
  listPlatformActivity,
  listSuspendedUserIds,
  markEnquiryRead,
  replyToEnquiry,
  setEnquiryStatus,
  setListingPublishedFlag,
  setUserSuspended,
  updateDashSettings,
  type ActivityEvent,
  type DashSettings,
  type Enquiry,
} from "@/lib/demoOps";

/* silence unused seed imports kept for parity / future catalog merges */
void CREATOR_PLANS;
void FREELANCE_PLANS;
void HOST_HOMES;
void HOST_TRIPS_48H;
const simulate = <T>(data: T, ms = 280): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

/** Extra Northeast-feel Unsplash photos for marketplace galleries */
const GALLERY_POOL = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516815231560-8f41ec531527?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1520962880247-cfaf541c8724?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80&auto=format&fit=crop",
] as const;

function pickGallery(cover: string, seed: number, count = 5): string[] {
  const out = [cover];
  for (let i = 0; out.length < count; i++) {
    const next = GALLERY_POOL[(seed + i) % GALLERY_POOL.length];
    if (!out.includes(next)) out.push(next);
  }
  return out;
}

function pickVideos(seed: number, count = 2): string[] {
  const out: string[] = [];
  for (let i = 0; out.length < count; i++) {
    out.push(SAMPLE_VIDEOS[(seed + i) % SAMPLE_VIDEOS.length]);
  }
  return out;
}

function enrichStay(s: Stay, index: number): Stay {
  return {
    ...s,
    photos: s.photos?.length ? s.photos : pickGallery(s.img, index),
    videos: s.videos?.length ? s.videos : pickVideos(index),
    experience:
      s.experience ??
      `${s.hostNote} Guests love the ${s.amenities.slice(0, 2).join(" and ").toLowerCase()}. True-cost nightly rate includes host fees — what you see is what you pay.`,
  };
}

function enrichPackage(p: TravelPackage, index: number): TravelPackage {
  return {
    ...p,
    photos: p.photos?.length ? p.photos : pickGallery(p.img, index + 3),
    videos: p.videos?.length ? p.videos : pickVideos(index + 2),
    experience:
      p.experience ??
      `Permit-ready ${p.days} circuit covering ${p.states.join(", ").replace(/-/g, " ")}. Includes ${p.perks.slice(0, 2).join(" and ").toLowerCase()}. Fixed departures — no checkout surprises.`,
  };
}

/* ============ CATALOG ============ */

export function fetchStays(stateSlug?: string): Promise<Stay[]> {
  const list = stateSlug ? stays.filter((s) => s.stateSlug === stateSlug) : stays;
  return simulate(list.map(enrichStay));
}

export function fetchStay(id: string): Promise<Stay | undefined> {
  const idx = stays.findIndex((s) => s.id === id);
  if (idx < 0) return simulate(undefined);
  return simulate(enrichStay(stays[idx], idx));
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
  return simulate(travelPackages.map(enrichPackage));
}

export function fetchPackage(id: string): Promise<TravelPackage | undefined> {
  const idx = travelPackages.findIndex((p) => p.id === id);
  if (idx < 0) return simulate(undefined);
  return simulate(enrichPackage(travelPackages[idx], idx));
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

export function fetchCreatorPlans(creatorId?: string, opts?: { publishedOnly?: boolean }): Promise<CreatorPlan[]> {
  let all = listCreatorPlansCms(creatorId);
  /* Merge legacy extras once into CMS list */
  const extra = readJson<CreatorPlan[]>(KEYS.creatorPlansExtra, []);
  if (extra.length && typeof window !== "undefined") {
    const ids = new Set(all.map((p) => p.id));
    const missing = extra.filter((p) => !ids.has(p.id)).map((p) => ({ ...p, published: true }));
    if (missing.length) {
      const merged = [...missing, ...all];
      window.localStorage.setItem("nn-cms-creator-plans-v2", JSON.stringify(merged));
      all = creatorId ? merged.filter((p) => p.creatorId === creatorId) : merged;
    }
  }
  if (opts?.publishedOnly) all = all.filter((p) => p.published !== false);
  return simulate(all);
}

export function fetchCreatorPlan(id: string): Promise<CreatorPlan | undefined> {
  return simulate(getCreatorPlanCms(id) ?? listAllCreatorPlans().find((p) => p.id === id));
}

export function fetchHostHomes(hostId?: string, listedOnly = false): Promise<HostHome[]> {
  return simulate(listHostHomesCms(hostId, listedOnly));
}

export function fetchHostBySlug(
  slug: string,
): Promise<{ home: HostHome; host: DemoAccount } | undefined> {
  const home = getHostHomeBySlugCms(slug) ?? listAllHostHomes().find((h) => h.slug === slug);
  if (!home || home.listed === false) return simulate(undefined);
  const hostRaw = DEMO_ACCOUNTS.find((a) => a.id === home.hostId);
  if (!hostRaw) return simulate(undefined);
  return simulate({ home, host: mergeAccountProfile(hostRaw) });
}

export function fetchHostTrips(hostId?: string): Promise<HostTrip48h[]> {
  return simulate(listHostTripsCms(hostId));
}

export function fetchFreelancePlans(plannerId?: string, opts?: { publishedOnly?: boolean }): Promise<FreelancePlan[]> {
  let all = listFreelancePlansCms(plannerId);
  if (opts?.publishedOnly) all = all.filter((p) => p.published !== false);
  return simulate(all);
}

export function fetchFreelancePlan(id: string): Promise<FreelancePlan | undefined> {
  return simulate(getFreelancePlanCms(id) ?? listAllFreelancePlans().find((p) => p.id === id));
}

export function fetchCreators(): Promise<DemoAccount[]> {
  return simulate(
    DEMO_ACCOUNTS.filter((a) => a.type === "creator").map(mergeAccountProfile),
  );
}

export function fetchCreatorByHandle(handle: string): Promise<DemoAccount | undefined> {
  const acc = DEMO_ACCOUNTS.find(
    (a) => a.type === "creator" && a.handle?.toLowerCase() === handle.toLowerCase(),
  );
  return simulate(acc ? mergeAccountProfile(acc) : undefined);
}

export function fetchPlannerBySubdomain(sub: string): Promise<DemoAccount | undefined> {
  const acc = DEMO_ACCOUNTS.find((a) => {
    if (a.type !== "planner") return false;
    const merged = mergeAccountProfile(a);
    const settings = getPlannerSettings(a.id, a.subdomain ?? "nestcraft");
    const subActual = settings.subdomain || merged.subdomain || a.subdomain;
    return subActual?.toLowerCase() === sub.toLowerCase();
  });
  return simulate(acc ? mergeAccountProfile(acc) : undefined);
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
  cover?: string;
  slug?: string;
  subdomain?: string;
};

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

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
  userId?: string;
  hostId?: string;
  notes?: string;
  /** ISO date string for occupancy calendar demos */
  stayDate?: string;
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
  notes?: string;
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
  bookings: "nn-demo-bookings-v4",
  permits: "nn-demo-permits",
  cart: "nn-demo-cart",
  savedItineraries: "nn-demo-saved-itins",
  publishedExtra: "nn-demo-published-extra",
  creatorPlansExtra: "nn-demo-creator-plans",
  commissions: "nn-demo-commissions-v2",
  groupOverrides: "nn-demo-groups",
  undoStack: "nn-demo-undo",
} as const;

const CHANGE_EVENT = "nn-demo-store-change";

/** Warm all role dashboard seeds (bookings, CMS, enquiries, history). */
export function ensureDemoDataReady(userId?: string) {
  if (typeof window === "undefined") return;
  ensureSeedBookings();
  ensureSeedCommissions();
  listEnquiries();
  listActivity();
  listAllCreatorPlans();
  listAllHostHomes();
  listAllHostTrips();
  listAllFreelancePlans();
  listCityItems();
  if (userId) ensureTravelerSavedSeeds(userId);
}

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

/* --- group invites (multiplayer flywheel) --- */

function normalizeInvite(g: GroupInvite): GroupInvite {
  const seats = Array.isArray(g.seats)
    ? g.seats.map((s, i) => ({
        id: s?.id || `seat-${i + 1}`,
        label: s?.label || `Seat ${i + 1}`,
        claimedBy: s?.claimedBy ?? null,
        paid: Boolean(s?.paid),
        emiPaid: Number(s?.emiPaid) || 0,
      }))
    : [];
  return { ...g, seats };
}

export function listGroupInvitesSync(): GroupInvite[] {
  const overrides = readJson<GroupInvite[]>(KEYS.groupOverrides, []);
  const map = new Map(GROUP_INVITES.map((g) => [g.code.toUpperCase(), normalizeInvite(g)]));
  for (const o of overrides) {
    if (!o?.code) continue;
    map.set(o.code.toUpperCase(), normalizeInvite(o));
  }
  return [...map.values()];
}

export function getGroupByCodeSync(code: string): GroupInvite | undefined {
  const q = code.trim().toUpperCase();
  return listGroupInvitesSync().find((g) => g.code.toUpperCase() === q);
}

export function fetchGroupInvites(): Promise<GroupInvite[]> {
  return simulate(listGroupInvitesSync());
}

export function fetchGroupByCode(code: string): Promise<GroupInvite | undefined> {
  return simulate(getGroupByCodeSync(code));
}

/* --- auth --- */

export function getUser(): DemoUser | null {
  const user = readJson<DemoUser | null>(KEYS.user, null);
  if (!user) return null;
  const o = getProfileOverride(user.id);
  return {
    ...user,
    name: o.name ?? user.name,
    bio: o.bio ?? user.bio,
    avatar: o.avatar ?? user.avatar,
    cover: o.cover ?? user.cover,
    subdomain: o.subdomain ?? user.subdomain,
  };
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
  ensureDemoDataReady(user.id);
  appendActivity({
    actorId: user.id,
    actorName: user.name,
    role: user.type,
    action: "login",
    summary: `Signed in as guest traveler`,
  });
  return simulate(user, 400);
}

export function signInDemo(idOrEmail: string, password: string): Promise<DemoUser> {
  const acc = findAccount(idOrEmail, password);
  if (!acc) return Promise.reject(new Error("Invalid id or password"));
  const merged = mergeAccountProfile(acc);
  const user: DemoUser = {
    id: merged.id,
    name: merged.name,
    email: merged.email,
    type: merged.type,
    handle: merged.handle,
    avatar: merged.avatar,
    verified: merged.verified,
    bio: merged.bio,
    cover: merged.cover,
    slug: merged.slug,
    subdomain: merged.subdomain,
  };
  writeJson(KEYS.user, user);
  ensureDemoDataReady(user.id);
  appendActivity({
    actorId: user.id,
    actorName: user.name,
    role: user.type,
    action: "login",
    summary: `Signed in as ${user.type}`,
  });
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

export function saveItinerary(title: string, notes?: string): Promise<SavedItinerary> {
  const user = getUser();
  if (!user) return Promise.reject(new Error("Sign in required"));
  const placeIds = getCart();
  if (placeIds.length === 0) return Promise.reject(new Error("Cart empty"));
  const itin: SavedItinerary = {
    id: refCode("ITIN"),
    title: title.trim() || "My itinerary",
    placeIds,
    notes: notes ?? "",
    createdAt: new Date().toISOString(),
    userId: user.id,
  };
  writeJson(KEYS.savedItineraries, [itin, ...readJson<SavedItinerary[]>(KEYS.savedItineraries, [])]);
  return simulate(itin, 500);
}

function ensureTravelerSavedSeeds(userId: string) {
  const all = readJson<SavedItinerary[]>(KEYS.savedItineraries, []);
  if (all.some((i) => i.userId === userId)) return;
  const seeds: SavedItinerary[] = PLACE_CLIPS.slice(0, 5).map((c, i) => ({
    id: `ITIN-SEED-${userId}-${i + 1}`,
    title: `${["Monsoon", "Ridge", "Valley", "Falls", "Border"][i]} draft · ${c.place}`,
    placeIds: PLACE_CLIPS.slice(i, i + 3).map((p) => p.id),
    notes: `Demo saved route starting at ${c.place}. Edit notes anytime.`,
    createdAt: new Date(Date.now() - 86400000 * (i + 2)).toISOString(),
    userId,
  }));
  writeJson(KEYS.savedItineraries, [...seeds, ...all]);
}

export function listSavedItineraries(): SavedItinerary[] {
  const user = getUser();
  if (user) ensureTravelerSavedSeeds(user.id);
  const all = readJson<SavedItinerary[]>(KEYS.savedItineraries, []);
  if (!user) return all;
  return all.filter((i) => i.userId === user.id);
}

export function updateSavedItinerary(
  id: string,
  patch: Partial<Pick<SavedItinerary, "title" | "notes" | "placeIds">>,
): SavedItinerary {
  const all = readJson<SavedItinerary[]>(KEYS.savedItineraries, []);
  const idx = all.findIndex((i) => i.id === id);
  if (idx < 0) throw new Error("Itinerary not found");
  const updated = { ...all[idx], ...patch };
  const next = [...all];
  next[idx] = updated;
  writeJson(KEYS.savedItineraries, next);
  return updated;
}

export function deleteSavedItinerary(id: string): void {
  writeJson(
    KEYS.savedItineraries,
    readJson<SavedItinerary[]>(KEYS.savedItineraries, []).filter((i) => i.id !== id),
  );
}

export function duplicateSavedItinerary(id: string): SavedItinerary {
  const all = readJson<SavedItinerary[]>(KEYS.savedItineraries, []);
  const src = all.find((i) => i.id === id);
  if (!src) throw new Error("Itinerary not found");
  const copy: SavedItinerary = {
    ...src,
    id: refCode("ITIN"),
    title: `${src.title} (copy)`,
    createdAt: new Date().toISOString(),
  };
  writeJson(KEYS.savedItineraries, [copy, ...all]);
  return copy;
}

/* --- bookings --- */

function ensureSeedBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  const existing = readJson<Booking[] | null>(KEYS.bookings, null);
  if (existing && existing.length > 0) return existing;
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
      userId: "traveler1",
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
      userId: "traveler1",
    },
    {
      id: "NN-SEED03",
      kind: "stay",
      title: "Pending · Cloud Homestay hold",
      detail: "Awaiting host confirmation",
      amount: 6400,
      travellers: 2,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      status: "pending",
      sourceId: "stay-demo",
      userId: "traveler1",
      hostId: "host1",
    },
    {
      id: "NN-SEED04",
      kind: "host-trip",
      title: "Guest referral · 48h Sohra sprint",
      detail: "Booked via host referral code",
      amount: 5200,
      travellers: 2,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      status: "confirmed",
      sourceId: "ht-seed",
      userId: "traveler2",
      hostId: "host1",
    },
    {
      id: "NN-SEED05",
      kind: "freelance",
      title: "Seven Sisters Sampler",
      detail: "Planner booking · awaiting travel",
      amount: 42000,
      travellers: 3,
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      status: "confirmed",
      sourceId: "fp-1",
      userId: "traveler2",
      publisherId: "planner1",
      notes: "Corporate desk — 8 pax soft hold",
    },
    {
      id: "NN-SEED06",
      kind: "creator-plan",
      title: "Root Bridge Film Route",
      detail: "Customer booking on creator inventory",
      amount: 15600,
      travellers: 2,
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      status: "confirmed",
      sourceId: "cp-1",
      userId: "traveler2",
      publisherId: "creator1",
      notes: "Ask about drone window",
    },
    {
      id: "NN-SEED07",
      kind: "creator-plan",
      title: "Living Root Weekend",
      detail: "Pending deposit",
      amount: 9800,
      travellers: 1,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      status: "pending",
      sourceId: "cp-2",
      userId: "traveler1",
      publisherId: "creator1",
    },
    {
      id: "NN-SEED08",
      kind: "stay",
      title: "Cloud Ridge · Fri–Sun hold",
      detail: "Occupancy demo · weekend block",
      amount: 8400,
      travellers: 2,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      status: "confirmed",
      sourceId: "hh-1",
      userId: "traveler2",
      hostId: "host1",
      stayDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
      notes: "Home meals requested",
    },
  ];
  writeJson(KEYS.bookings, seed);
  return seed;
}

export function listBookings(filter?: {
  userId?: string;
  hostId?: string;
  kind?: Booking["kind"];
  publisherId?: string;
  status?: BookingStatus;
}): Booking[] {
  let list = ensureSeedBookings();
  if (filter?.userId) list = list.filter((b) => !b.userId || b.userId === filter.userId);
  if (filter?.hostId) list = list.filter((b) => b.hostId === filter.hostId);
  if (filter?.kind) list = list.filter((b) => b.kind === filter.kind);
  if (filter?.publisherId) list = list.filter((b) => b.publisherId === filter.publisherId);
  if (filter?.status) list = list.filter((b) => b.status === filter.status);
  return list;
}

export function createBooking(
  input: Omit<Booking, "id" | "createdAt" | "status"> & { status?: BookingStatus },
): Promise<Booking> {
  const user = getUser();
  const booking: Booking = {
    ...input,
    userId: input.userId ?? user?.id,
    status: input.status ?? "confirmed",
    id: refCode("NN"),
    createdAt: new Date().toISOString(),
  };
  writeJson(KEYS.bookings, [booking, ...ensureSeedBookings()]);
  return simulate(booking, 600);
}

export function setBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
  const list = ensureSeedBookings();
  const idx = list.findIndex((b) => b.id === bookingId);
  if (idx < 0) return Promise.reject(new Error("Booking not found"));
  const updated = { ...list[idx], status };
  const next = [...list];
  next[idx] = updated;
  writeJson(KEYS.bookings, next);
  const actor = getUser();
  appendActivity({
    actorId: actor?.id ?? updated.userId ?? "system",
    actorName: actor?.name ?? "System",
    role: actor?.type,
    action: "status",
    summary: `Booking ${updated.id} → ${status} · ${updated.title}`,
    meta: { bookingId },
  });
  if (status === "completed" && updated.publisherId && updated.publisherId !== getUser()?.id) {
    addCommission({
      beneficiaryId: updated.publisherId,
      fromBookingId: updated.id,
      title: `Commission · ${updated.title}`,
      amount: Math.round(updated.amount * 0.08),
    });
  }
  return simulate(updated, 300);
}

export function updateBookingNotes(bookingId: string, notes: string): Booking {
  const list = ensureSeedBookings();
  const idx = list.findIndex((b) => b.id === bookingId);
  if (idx < 0) throw new Error("Booking not found");
  const updated = { ...list[idx], notes };
  const next = [...list];
  next[idx] = updated;
  writeJson(KEYS.bookings, next);
  const actor = getUser();
  appendActivity({
    actorId: actor?.id ?? "system",
    actorName: actor?.name ?? "System",
    role: actor?.type,
    action: "edit",
    summary: `Updated notes on booking ${bookingId}`,
    meta: { bookingId },
  });
  return updated;
}

export function completeBooking(bookingId: string): Promise<Booking> {
  return setBookingStatus(bookingId, "completed");
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

  const plan = upsertCreatorPlan({
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
    published: true,
  });

  return fetchPublishedItineraries().then((list) => {
    const published =
      list.find((p) => p.id === `from-${plan.id}` || p.code === plan.publishCode) ??
      ({
        id: `from-${plan.id}`,
        code: plan.publishCode ?? generatePublishCode(input.title),
        title: plan.title,
        publisherId: user.id,
        publisherName: user.name,
        publisherType: "creator" as const,
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
      } satisfies PublishedItinerary);
    return simulate({ plan, published }, 600);
  });
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
  if (existing && existing.length > 0) return existing;
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
  const g = getGroupByCodeSync(inviteCode);
  if (!g) return Promise.reject(new Error("Invite not found"));
  const seat = g.seats.find((s) => s.id === seatId);
  if (!seat) return Promise.reject(new Error("Seat not found"));
  if (seat.claimedBy) return Promise.reject(new Error("Seat already claimed"));
  const name = claimerName.trim() || "Guest Traveler";
  const seats = g.seats.map((s) =>
    s.id === seatId ? { ...s, claimedBy: name, paid: false, emiPaid: 0 } : s,
  );
  const updated = { ...g, seats };
  saveGroupInvite(updated);
  const actor = getUser();
  appendActivity({
    actorId: actor?.id ?? "guest",
    actorName: name,
    role: actor?.type ?? "traveler",
    action: "booking",
    summary: `Claimed ${seat.label} on ${g.code}`,
    meta: { inviteCode: g.code, seatId },
  });
  return simulate(updated, 350);
}

export function payGroupSeatEmi(inviteCode: string, seatId: string): Promise<GroupInvite> {
  const g = getGroupByCodeSync(inviteCode);
  if (!g) return Promise.reject(new Error("Invite not found"));
  const seats = g.seats.map((s) => {
    if (s.id !== seatId) return s;
    if (!s.claimedBy) return s;
    const emiPaid = Math.min(4, (s.emiPaid ?? 0) + 1);
    return { ...s, emiPaid, paid: emiPaid >= 4 };
  });
  const updated = { ...g, seats };
  saveGroupInvite(updated);
  const seat = updated.seats.find((s) => s.id === seatId);
  const actor = getUser();
  appendActivity({
    actorId: actor?.id ?? "guest",
    actorName: actor?.name ?? seat?.claimedBy ?? "Guest",
    role: actor?.type ?? "traveler",
    action: "booking",
    summary: seat?.paid
      ? `Seat fully paid on ${g.code}`
      : `Paid EMI ${seat?.emiPaid}/4 on ${g.code}`,
    meta: { inviteCode: g.code, seatId },
  });
  return simulate(updated, 350);
}

function saveGroupInvite(invite: GroupInvite) {
  const overrides = readJson<GroupInvite[]>(KEYS.groupOverrides, []);
  const filtered = overrides.filter((o) => o.code.toUpperCase() !== invite.code.toUpperCase());
  writeJson(KEYS.groupOverrides, [invite, ...filtered]);
}

export function createGroupInvite(input: {
  title: string;
  pricePerSeat: number;
  seatCount: number;
  cover?: string;
}): Promise<GroupInvite> {
  const user = getUser();
  if (!user) return Promise.reject(new Error("Sign in required"));
  const seatCount = Math.max(2, Math.min(12, input.seatCount || 4));
  const price = Math.max(1000, input.pricePerSeat || 12000);
  const invite: GroupInvite = {
    id: refCode("GI"),
    code: `CREW-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    title: input.title.trim() || "Crew trip",
    plannerName: user.name,
    plannerId: user.id,
    cover: input.cover ?? PLACE_CLIPS[0].poster,
    pricePerSeat: price,
    emiPerMonth: Math.round(price / 4),
    seats: Array.from({ length: seatCount }, (_, i) => ({
      id: `seat-${i + 1}`,
      label: `Seat ${i + 1}`,
      claimedBy: i === 0 ? user.name : null,
      paid: i === 0,
      emiPaid: i === 0 ? 4 : 0,
    })),
  };
  saveGroupInvite(invite);
  appendActivity({
    actorId: user.id,
    actorName: user.name,
    role: user.type,
    action: "create",
    summary: `Created crew invite ${invite.code}`,
    meta: { inviteCode: invite.code },
  });
  return simulate(invite, 400);
}

/** Ensure a shareable crew invite exists for a legacy trip id (multiplayer flywheel). */
export function ensureInviteForTrip(input: {
  tripId: string;
  title: string;
  cover: string;
  pricePerSeat: number;
  seatCount: number;
  plannerName?: string;
}): GroupInvite {
  const code = `CREW-${input.tripId.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 8) || "TRIP"}`;
  const existing = getGroupByCodeSync(code);
  if (existing) return existing;
  const user = getUser();
  const plannerName = input.plannerName ?? user?.name ?? "Trip planner";
  const seatCount = Math.max(2, Math.min(12, input.seatCount || 4));
  const price = Math.max(1000, input.pricePerSeat || 12000);
  const invite: GroupInvite = {
    id: refCode("GI"),
    code,
    title: input.title,
    plannerName,
    plannerId: user?.id ?? input.tripId,
    cover: input.cover,
    pricePerSeat: price,
    emiPerMonth: Math.round(price / 4),
    seats: Array.from({ length: seatCount }, (_, i) => ({
      id: `seat-${i + 1}`,
      label: `Seat ${i + 1}`,
      claimedBy: i === 0 ? plannerName : null,
      paid: i === 0,
      emiPaid: i === 0 ? 4 : 0,
    })),
  };
  saveGroupInvite(invite);
  return invite;
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

/* CMS re-exports for dashboards */
export {
  adminCmsSnapshot,
  deleteCityItem,
  deleteCreatorPlan,
  deleteFreelancePlan,
  deleteHostHome,
  deleteHostTrip,
  getEchoSosEnabled,
  getPlannerSettings,
  getProfileOverride,
  listCityItems,
  listAllCreatorPlans,
  listAllFreelancePlans,
  listAllHostHomes,
  listAllHostTrips,
  listCreatorPlansCms,
  listFreelancePlansCms,
  listHostHomesCms,
  listHostTripsCms,
  regenerateTripReferral,
  setCreatorPlanPublished,
  setEchoSosEnabled,
  setFreelancePlanPublished,
  setHostHomeListed,
  updatePlannerSettings,
  updateProfile,
  upsertCityItem,
  upsertCreatorPlan,
  upsertFreelancePlan,
  upsertHostHome,
  upsertHostTrip,
};
export type { HostCityItem, PlannerSettings, ProfileOverride };

/* Inbox / history / settings */
export {
  appendActivity,
  createEnquiry,
  getDashSettings,
  getListingPublishedFlag,
  isUserSuspended,
  listActivity,
  listEnquiries,
  listPlatformActivity,
  listSuspendedUserIds,
  markEnquiryRead,
  replyToEnquiry,
  setEnquiryStatus,
  setListingPublishedFlag,
  setUserSuspended,
  updateDashSettings,
};
export type { ActivityEvent, DashSettings, Enquiry };
