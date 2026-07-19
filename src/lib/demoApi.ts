/**
 * Demo API client.
 *
 * Every page talks to these async functions instead of importing demo data
 * directly. To go live, replace the bodies with real `fetch()` calls — the
 * return shapes and the localStorage "account" store can stay as a cache.
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

/* Simulated network latency so loading states are visible in the demo */
const simulate = <T>(data: T, ms = 350): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

/* ============ CATALOG QUERIES ============ */

export function fetchStays(stateSlug?: string): Promise<Stay[]> {
  const list = stateSlug ? stays.filter((s) => s.stateSlug === stateSlug) : stays;
  return simulate(list);
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

export function fetchOffers(): Promise<Offer[]> {
  return simulate(offers);
}

export function fetchPermitRules(): Promise<PermitRule[]> {
  return simulate(permitRules, 200);
}

/* ============ ACCOUNT STORE (localStorage, demo-only) ============ */

export type DemoUser = { name: string; email: string };

export type Booking = {
  id: string;
  kind: "stay" | "flight" | "train" | "cab" | "package";
  title: string;
  detail: string;
  amount: number;
  travellers: number;
  createdAt: string;
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

const KEYS = {
  user: "nn-demo-user",
  bookings: "nn-demo-bookings",
  permits: "nn-demo-permits",
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

export function signIn(name: string, email: string): Promise<DemoUser> {
  const user = { name: name.trim(), email: email.trim() };
  writeJson(KEYS.user, user);
  return simulate(user, 500);
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEYS.user);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/* --- bookings --- */

export function listBookings(): Booking[] {
  return readJson<Booking[]>(KEYS.bookings, []);
}

export function createBooking(
  input: Omit<Booking, "id" | "createdAt">,
): Promise<Booking> {
  const booking: Booking = {
    ...input,
    id: refCode("NN"),
    createdAt: new Date().toISOString(),
  };
  writeJson(KEYS.bookings, [booking, ...listBookings()]);
  return simulate(booking, 700);
}

/* --- permits --- */

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
