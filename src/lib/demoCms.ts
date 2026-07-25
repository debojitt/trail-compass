/**
 * CMS layer on top of demo localStorage — CRUD for all role dashboards.
 * Seed entities live in demoUniverse; mutations persist under nn-cms-* keys.
 */

import {
  CREATOR_PLANS,
  FREELANCE_PLANS,
  HOST_HOMES,
  HOST_TRIPS_48H,
  PLACE_CLIPS,
  SAMPLE_VIDEOS,
  type CreatorPlan,
  type DemoAccount,
  type FreelancePlan,
  type HostCityItem,
  type HostHome,
  type HostTrip48h,
  type PublishedItinerary,
} from "@/data/demoUniverse";

export type { HostCityItem };
const CHANGE_EVENT = "nn-demo-store-change";

const CMS_KEYS = {
  creatorPlans: "nn-cms-creator-plans-v1",
  hostHomes: "nn-cms-host-homes-v1",
  hostTrips: "nn-cms-host-trips-v1",
  cityItems: "nn-cms-city-items-v1",
  freelancePlans: "nn-cms-freelance-plans-v1",
  profileOverrides: "nn-cms-profiles-v1",
  plannerSettings: "nn-cms-planner-settings-v1",
  echoSos: "nn-cms-echo-sos-v1",
} as const;

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

function ensureList<T>(key: string, seed: T[]): T[] {
  if (typeof window === "undefined") return seed;
  const existing = readJson<T[] | null>(key, null);
  if (existing) return existing;
  writeJson(key, seed);
  return seed;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "listing";
}

function defaultStops(n = 3) {
  return PLACE_CLIPS.slice(0, n).map((c, i) => ({
    place: c.place,
    day: i + 1,
    note: c.blurb,
    img: c.poster,
  }));
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

/* ============ PROFILE ============ */

export type ProfileOverride = {
  name?: string;
  bio?: string;
  avatar?: string;
  cover?: string;
  subdomain?: string;
};

export function getProfileOverride(userId: string): ProfileOverride {
  const all = readJson<Record<string, ProfileOverride>>(CMS_KEYS.profileOverrides, {});
  return all[userId] ?? {};
}

export function updateProfile(userId: string, patch: ProfileOverride): ProfileOverride {
  const all = readJson<Record<string, ProfileOverride>>(CMS_KEYS.profileOverrides, {});
  const next = { ...all[userId], ...patch };
  all[userId] = next;
  writeJson(CMS_KEYS.profileOverrides, all);
  /* also patch live session user */
  const userKey = "nn-demo-user-v2";
  const user = readJson<Record<string, unknown> | null>(userKey, null);
  if (user && user.id === userId) {
    writeJson(userKey, { ...user, ...patch });
  }
  return next;
}

export function mergeAccountProfile(acc: DemoAccount): DemoAccount {
  const o = getProfileOverride(acc.id);
  return {
    ...acc,
    name: o.name ?? acc.name,
    bio: o.bio ?? acc.bio,
    avatar: o.avatar ?? acc.avatar,
    cover: o.cover ?? acc.cover,
    subdomain: o.subdomain ?? acc.subdomain,
  };
}

/* ============ CREATOR PLANS ============ */

function seedCreatorPlans(): CreatorPlan[] {
  return CREATOR_PLANS.map((p) => ({
    ...p,
    published: p.published ?? true,
    publishCode: p.publishCode ?? generatePublishCode(p.title),
  }));
}

export function listAllCreatorPlans(): CreatorPlan[] {
  return ensureList(CMS_KEYS.creatorPlans, seedCreatorPlans());
}

export function listCreatorPlansCms(creatorId?: string): CreatorPlan[] {
  const all = listAllCreatorPlans();
  return creatorId ? all.filter((p) => p.creatorId === creatorId) : all;
}

export function getCreatorPlanCms(id: string): CreatorPlan | undefined {
  return listAllCreatorPlans().find((p) => p.id === id);
}

export function upsertCreatorPlan(
  input: Partial<CreatorPlan> & { creatorId: string; title: string },
): CreatorPlan {
  const all = listAllCreatorPlans();
  const clips = PLACE_CLIPS.slice(0, Math.max(2, input.days ?? 3));
  if (input.id) {
    const idx = all.findIndex((p) => p.id === input.id);
    if (idx >= 0) {
      const updated = { ...all[idx], ...input } as CreatorPlan;
      const next = [...all];
      next[idx] = updated;
      writeJson(CMS_KEYS.creatorPlans, next);
      syncCreatorPlanToPublished(updated);
      return updated;
    }
  }
  const plan: CreatorPlan = {
    id: refCode("CP"),
    creatorId: input.creatorId,
    title: input.title,
    cover: input.cover ?? clips[0].poster,
    photos: input.photos ?? clips.map((c) => c.poster),
    videos: input.videos ?? clips.map((c) => c.videoUrl),
    days: input.days ?? clips.length,
    priceFrom: input.priceFrom ?? 12000,
    likes: input.likes ?? 0,
    rating: input.rating ?? 5,
    experience: input.experience ?? "",
    stops: input.stops ?? defaultStops(input.days ?? 3),
    published: input.published ?? false,
    publishCode: input.publishCode,
  };
  writeJson(CMS_KEYS.creatorPlans, [plan, ...all]);
  if (plan.published) syncCreatorPlanToPublished(plan);
  return plan;
}

export function deleteCreatorPlan(id: string): void {
  writeJson(
    CMS_KEYS.creatorPlans,
    listAllCreatorPlans().filter((p) => p.id !== id),
  );
}

export function setCreatorPlanPublished(id: string, published: boolean): CreatorPlan {
  const plan = getCreatorPlanCms(id);
  if (!plan) throw new Error("Plan not found");
  const code = published ? plan.publishCode ?? generatePublishCode(plan.title) : plan.publishCode;
  return upsertCreatorPlan({ ...plan, published, publishCode: code });
}

function syncCreatorPlanToPublished(plan: CreatorPlan) {
  if (!plan.published) return;
  const key = "nn-demo-published-extra";
  const extras = readJson<PublishedItinerary[]>(key, []);
  const code = plan.publishCode ?? generatePublishCode(plan.title);
  if (!plan.publishCode) {
    const all = listAllCreatorPlans();
    const idx = all.findIndex((p) => p.id === plan.id);
    if (idx >= 0) {
      all[idx] = { ...plan, publishCode: code };
      writeJson(CMS_KEYS.creatorPlans, all);
      plan = all[idx];
    }
  }
  const existing = extras.findIndex((p) => p.code === code || p.id === `from-${plan.id}`);
  const pub: PublishedItinerary = {
    id: `from-${plan.id}`,
    code,
    title: plan.title,
    publisherId: plan.creatorId,
    publisherName: "Creator",
    publisherType: "creator",
    days: plan.days,
    priceFrom: plan.priceFrom,
    rating: plan.rating,
    likes: plan.likes,
    reviews: Math.max(1, Math.round(plan.likes / 40)),
    cover: plan.cover,
    photos: plan.photos,
    videos: plan.videos,
    stops: plan.stops,
    experience: plan.experience,
    commissionPct: 12,
    fromCompletedBooking: false,
  };
  if (existing >= 0) {
    extras[existing] = pub;
    writeJson(key, extras);
  } else {
    writeJson(key, [pub, ...extras]);
  }
}

/* ============ HOST HOMES ============ */

function seedHostHomes(): HostHome[] {
  return HOST_HOMES.map((h, i) => ({
    ...h,
    listed: h.listed ?? true,
    bookingsDemo: h.bookingsDemo ?? 2 + (i % 5),
  }));
}

export function listAllHostHomes(): HostHome[] {
  return ensureList(CMS_KEYS.hostHomes, seedHostHomes());
}

export function listHostHomesCms(hostId?: string, listedOnly = false): HostHome[] {
  let all = listAllHostHomes();
  if (hostId) all = all.filter((h) => h.hostId === hostId);
  if (listedOnly) all = all.filter((h) => h.listed !== false);
  return all;
}

export function getHostHomeBySlugCms(slug: string): HostHome | undefined {
  return listAllHostHomes().find((h) => h.slug === slug);
}

export function upsertHostHome(
  input: Partial<HostHome> & { hostId: string; name: string },
): HostHome {
  const all = listAllHostHomes();
  if (input.id) {
    const idx = all.findIndex((h) => h.id === input.id);
    if (idx >= 0) {
      const updated = { ...all[idx], ...input } as HostHome;
      const next = [...all];
      next[idx] = updated;
      writeJson(CMS_KEYS.hostHomes, next);
      return updated;
    }
  }
  const baseSlug = slugify(input.name);
  let slug = input.slug ?? baseSlug;
  if (all.some((h) => h.slug === slug)) slug = `${baseSlug}-${refCode("X").slice(-4).toLowerCase()}`;
  const home: HostHome = {
    id: refCode("HH"),
    hostId: input.hostId,
    name: input.name,
    slug,
    place: input.place ?? "Northeast India",
    pricePerNight: input.pricePerNight ?? 2500,
    rating: input.rating ?? 4.9,
    reviews: input.reviews ?? 0,
    photos: input.photos?.length
      ? input.photos
      : [PLACE_CLIPS[0].poster, PLACE_CLIPS[1].poster, PLACE_CLIPS[2].poster],
    amenities: input.amenities ?? ["Wi‑Fi", "Home meals", "Hot water"],
    description: input.description ?? "",
    listed: input.listed ?? true,
    bookingsDemo: input.bookingsDemo ?? 0,
  };
  writeJson(CMS_KEYS.hostHomes, [home, ...all]);
  return home;
}

export function deleteHostHome(id: string): void {
  writeJson(
    CMS_KEYS.hostHomes,
    listAllHostHomes().filter((h) => h.id !== id),
  );
}

export function setHostHomeListed(id: string, listed: boolean): HostHome {
  const home = listAllHostHomes().find((h) => h.id === id);
  if (!home) throw new Error("Home not found");
  return upsertHostHome({ ...home, listed });
}

/* ============ HOST 48H TRIPS ============ */

function seedHostTrips(): HostTrip48h[] {
  return [...HOST_TRIPS_48H];
}

export function listAllHostTrips(): HostTrip48h[] {
  return ensureList(CMS_KEYS.hostTrips, seedHostTrips());
}

export function listHostTripsCms(hostId?: string): HostTrip48h[] {
  const all = listAllHostTrips();
  return hostId ? all.filter((t) => t.hostId === hostId) : all;
}

export function upsertHostTrip(
  input: Partial<HostTrip48h> & { hostId: string; title: string; homeId: string },
): HostTrip48h {
  const all = listAllHostTrips();
  if (input.id) {
    const idx = all.findIndex((t) => t.id === input.id);
    if (idx >= 0) {
      const updated = { ...all[idx], ...input, hoursWindow: 48 as const };
      const next = [...all];
      next[idx] = updated;
      writeJson(CMS_KEYS.hostTrips, next);
      return updated;
    }
  }
  const trip: HostTrip48h = {
    id: refCode("HT"),
    hostId: input.hostId,
    homeId: input.homeId,
    title: input.title,
    referralCode: input.referralCode ?? `REF-${refCode("R").slice(-6)}`,
    hoursWindow: 48,
    price: input.price ?? 4500,
    cover: input.cover ?? PLACE_CLIPS[3]?.poster ?? PLACE_CLIPS[0].poster,
    places: input.places ?? ["Local market", "Viewpoint"],
    food: input.food ?? ["Home kitchen thali"],
    cabs: input.cabs ?? ["Airport pickup"],
    description: input.description ?? "",
  };
  writeJson(CMS_KEYS.hostTrips, [trip, ...all]);
  return trip;
}

export function deleteHostTrip(id: string): void {
  writeJson(
    CMS_KEYS.hostTrips,
    listAllHostTrips().filter((t) => t.id !== id),
  );
}

export function regenerateTripReferral(id: string): HostTrip48h {
  const trip = listAllHostTrips().find((t) => t.id === id);
  if (!trip) throw new Error("Trip not found");
  return upsertHostTrip({ ...trip, referralCode: `REF-${refCode("R").slice(-6)}` });
}

/* ============ CITY INVENTORY ============ */

function seedCityItems(): HostCityItem[] {
  const items: HostCityItem[] = [];
  for (const home of HOST_HOMES.slice(0, 6)) {
    items.push(
      {
        id: `cab-${home.id}`,
        hostId: home.hostId,
        kind: "cab",
        name: `${home.place.split(",")[0]} airport cab`,
        detail: "AC sedan · fixed fare",
        priceHint: 1200,
      },
      {
        id: `place-${home.id}`,
        hostId: home.hostId,
        kind: "place",
        name: `${home.place.split(",")[0]} viewpoint`,
        detail: "Sunrise walk with host tip",
      },
      {
        id: `food-${home.id}`,
        hostId: home.hostId,
        kind: "restaurant",
        name: `Kitchen near ${home.name}`,
        detail: "Local thali · veg options",
        priceHint: 350,
      },
    );
  }
  return items;
}

export function listCityItems(hostId?: string): HostCityItem[] {
  const all = ensureList(CMS_KEYS.cityItems, seedCityItems());
  return hostId ? all.filter((i) => i.hostId === hostId) : all;
}

export function upsertCityItem(
  input: Partial<HostCityItem> & { hostId: string; kind: HostCityItem["kind"]; name: string },
): HostCityItem {
  const all = listCityItems();
  if (input.id) {
    const idx = all.findIndex((i) => i.id === input.id);
    if (idx >= 0) {
      const updated = { ...all[idx], ...input } as HostCityItem;
      const next = [...all];
      next[idx] = updated;
      writeJson(CMS_KEYS.cityItems, next);
      return updated;
    }
  }
  const item: HostCityItem = {
    id: refCode("CI"),
    hostId: input.hostId,
    kind: input.kind,
    name: input.name,
    detail: input.detail ?? "",
    priceHint: input.priceHint,
  };
  writeJson(CMS_KEYS.cityItems, [item, ...all]);
  return item;
}

export function deleteCityItem(id: string): void {
  writeJson(
    CMS_KEYS.cityItems,
    listCityItems().filter((i) => i.id !== id),
  );
}

/* ============ FREELANCE PLANS ============ */

function seedFreelancePlans(): FreelancePlan[] {
  return FREELANCE_PLANS.map((p, i) => ({
    ...p,
    published: p.published ?? true,
    pipelineStage: p.pipelineStage ?? (["lead", "proposal", "booked", "completed"] as const)[i % 4],
  }));
}

export function listAllFreelancePlans(): FreelancePlan[] {
  return ensureList(CMS_KEYS.freelancePlans, seedFreelancePlans());
}

export function listFreelancePlansCms(plannerId?: string): FreelancePlan[] {
  const all = listAllFreelancePlans();
  return plannerId ? all.filter((p) => p.plannerId === plannerId) : all;
}

export function getFreelancePlanCms(id: string): FreelancePlan | undefined {
  return listAllFreelancePlans().find((p) => p.id === id);
}

export function upsertFreelancePlan(
  input: Partial<FreelancePlan> & { plannerId: string; title: string },
): FreelancePlan {
  const all = listAllFreelancePlans();
  if (input.id) {
    const idx = all.findIndex((p) => p.id === input.id);
    if (idx >= 0) {
      const updated = {
        ...all[idx],
        ...input,
        plannerSharePct: 60 as const,
      } as FreelancePlan;
      const next = [...all];
      next[idx] = updated;
      writeJson(CMS_KEYS.freelancePlans, next);
      if (updated.published) syncFreelanceToPublished(updated);
      return updated;
    }
  }
  const plan: FreelancePlan = {
    id: refCode("FP"),
    plannerId: input.plannerId,
    title: input.title,
    cover: input.cover ?? PLACE_CLIPS[2].poster,
    days: input.days ?? 5,
    priceFrom: input.priceFrom ?? 28000,
    netProfit: input.netProfit ?? 12000,
    plannerSharePct: 60,
    vendorsMaskedUntilHours: input.vendorsMaskedUntilHours ?? 48,
    photos: input.photos ?? [PLACE_CLIPS[2].poster, PLACE_CLIPS[4]?.poster ?? PLACE_CLIPS[0].poster],
    stops: input.stops ?? [
      {
        place: PLACE_CLIPS[0].place,
        day: 1,
        note: "Arrival",
        vendorMasked: "Partner lodge A",
        vendorReal: "Hidden valley stay",
      },
      {
        place: PLACE_CLIPS[1].place,
        day: 2,
        note: "Explore",
        vendorMasked: "Trail desk B",
        vendorReal: "Local guide collective",
      },
    ],
    published: input.published ?? false,
    pipelineStage: input.pipelineStage ?? "lead",
  };
  writeJson(CMS_KEYS.freelancePlans, [plan, ...all]);
  if (plan.published) syncFreelanceToPublished(plan);
  return plan;
}

export function deleteFreelancePlan(id: string): void {
  writeJson(
    CMS_KEYS.freelancePlans,
    listAllFreelancePlans().filter((p) => p.id !== id),
  );
}

export function setFreelancePlanPublished(id: string, published: boolean): FreelancePlan {
  const plan = getFreelancePlanCms(id);
  if (!plan) throw new Error("Plan not found");
  return upsertFreelancePlan({ ...plan, published });
}

function syncFreelanceToPublished(plan: FreelancePlan) {
  const key = "nn-demo-published-extra";
  const extras = readJson<PublishedItinerary[]>(key, []);
  const code = generatePublishCode(plan.title);
  const id = `fp-${plan.id}`;
  const pub: PublishedItinerary = {
    id,
    code: extras.find((e) => e.id === id)?.code ?? code,
    title: plan.title,
    publisherId: plan.plannerId,
    publisherName: "Planner",
    publisherType: "planner",
    days: plan.days,
    priceFrom: plan.priceFrom,
    rating: 4.9,
    likes: 40,
    reviews: 8,
    cover: plan.cover,
    photos: plan.photos,
    videos: [SAMPLE_VIDEOS[0]],
    stops: plan.stops.map((s) => ({
      place: s.place,
      day: s.day,
      note: s.note,
      img: plan.cover,
    })),
    experience: `Freelance plan · ${plan.days}D · Northnest fulfills`,
    commissionPct: 10,
    fromCompletedBooking: false,
  };
  const idx = extras.findIndex((e) => e.id === id);
  if (idx >= 0) {
    extras[idx] = { ...pub, code: extras[idx].code };
    writeJson(key, extras);
  } else {
    writeJson(key, [pub, ...extras]);
  }
}

/* ============ PLANNER SETTINGS / SOS ============ */

export type PlannerSettings = {
  subdomain: string;
  brandName: string;
  accentNote: string;
};

export function getPlannerSettings(plannerId: string, fallbackSub = "nestcraft"): PlannerSettings {
  const all = readJson<Record<string, PlannerSettings>>(CMS_KEYS.plannerSettings, {});
  return (
    all[plannerId] ?? {
      subdomain: fallbackSub,
      brandName: "Nestcraft Plans",
      accentNote: "60% profit share · Northnest fulfills",
    }
  );
}

export function updatePlannerSettings(plannerId: string, patch: Partial<PlannerSettings>): PlannerSettings {
  const all = readJson<Record<string, PlannerSettings>>(CMS_KEYS.plannerSettings, {});
  const next = { ...getPlannerSettings(plannerId), ...patch };
  all[plannerId] = next;
  writeJson(CMS_KEYS.plannerSettings, all);
  if (patch.subdomain) updateProfile(plannerId, { subdomain: patch.subdomain });
  return next;
}

export function getEchoSosEnabled(plannerId: string): boolean {
  const all = readJson<Record<string, boolean>>(CMS_KEYS.echoSos, {});
  return all[plannerId] ?? true;
}

export function setEchoSosEnabled(plannerId: string, enabled: boolean): boolean {
  const all = readJson<Record<string, boolean>>(CMS_KEYS.echoSos, {});
  all[plannerId] = enabled;
  writeJson(CMS_KEYS.echoSos, all);
  return enabled;
}

/* ============ ADMIN SNAPSHOT ============ */

export function adminCmsSnapshot() {
  return {
    creatorPlans: listAllCreatorPlans().length,
    hostHomes: listAllHostHomes().length,
    hostTrips: listAllHostTrips().length,
    freelancePlans: listAllFreelancePlans().length,
    cityItems: listCityItems().length,
    publishedExtra: readJson<unknown[]>("nn-demo-published-extra", []).length,
  };
}
