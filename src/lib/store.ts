/**
 * NORTHNEST demo store.
 *
 * Single source of truth for the prototype. Persists to localStorage, seeds
 * on first load, and notifies subscribers on any change. All roles, bookings,
 * itineraries, likes etc. live here — no backend required.
 */

import { useSyncExternalStore } from "react";
import { seed } from "@/data/seed";

/* ============ TYPES ============ */

export type Role = "traveler" | "creator" | "host" | "planner" | "admin";

export type Account = {
  id: string;
  email: string;
  password: string;
  name: string;
  handle: string;
  role: Role;
  avatar: string;
  bio: string;
  verified?: boolean;
  followers?: number;
  city?: string;
  /** planner-only */
  subdomain?: string;
};

export type Place = {
  id: string;
  name: string;
  state: string;
  stateSlug: string;
  hook: string;
  priceRange: string;
  price: number;
  hours: string;
  poster: string;
  video?: string;
  tags: string[];
  likes: number;
};

export type Stay = {
  id: string;
  name: string;
  stateSlug: string;
  place: string;
  pricePerNight: number;
  rating: number;
  reviews: number;
  img: string;
  gallery: string[];
  amenities: string[];
  hostNote: string;
  hostId: string;
  bedrooms: number;
  guests: number;
  description: string;
};

export type Package = {
  id: string;
  title: string;
  days: string;
  rating: number;
  reviews: string;
  oldPrice: number;
  price: number;
  perks: string[];
  img: string;
  gallery: string[];
  itinerary: string[];
  states: string[];
  highlights: string[];
  includes: string[];
  excludes: string[];
};

/** A public, verified itinerary with a short code (NN-XXXX-###) */
export type PublicItinerary = {
  code: string;
  title: string;
  creatorId: string;
  state: string;
  stateSlug: string;
  days: number;
  price: number;
  cover: string;
  gallery: string[];
  rating: number;
  reviews: number;
  likes: number;
  bookings: number;
  stops: { placeId: string; day: number; note: string }[];
  experience: string;
  publishedAt: string;
};

/** A user's saved (draft or booked) itinerary */
export type UserItinerary = {
  id: string;
  ownerId: string;
  title: string;
  stops: { placeId: string; day: number }[];
  status: "draft" | "booked" | "completed" | "published";
  publishedCode?: string;
  createdAt: string;
  totalPrice: number;
  cover: string;
};

export type Booking = {
  id: string;
  ownerId: string;
  kind: "stay" | "package" | "itinerary" | "flight" | "train" | "cab";
  refId: string;
  title: string;
  detail: string;
  amount: number;
  travellers: number;
  status: "confirmed" | "completed" | "cancelled";
  createdAt: string;
  hostReferralId?: string;
};

export type GroupTrip = {
  id: string;
  organiserId: string;
  title: string;
  itineraryId: string;
  cover: string;
  perSeat: number;
  seats: {
    id: string;
    memberName: string;
    claimed: boolean;
    paid: boolean;
    email?: string;
  }[];
  createdAt: string;
};

/** 48-hour city plan a homestay host offers to their guests */
export type HostReferralPlan = {
  id: string;
  hostId: string;
  stayId: string;
  title: string;
  city: string;
  cover: string;
  stops: string[];
  cabs: { label: string; price: number }[];
  places: { name: string; time: string; price: number }[];
  food: { name: string; kind: string; price: number }[];
  totalPrice: number;
  referralCode: string;
  bookings: number;
};

export type SosBroadcast = {
  id: string;
  ownerId: string;
  message: string;
  lat: number;
  lng: number;
  createdAt: string;
  resolved: boolean;
};

export type Notification = {
  id: string;
  ownerId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type StoreState = {
  currentUserId: string | null;
  accounts: Account[];
  places: Place[];
  stays: Stay[];
  packages: Package[];
  publicItineraries: PublicItinerary[];
  userItineraries: UserItinerary[];
  bookings: Booking[];
  groupTrips: GroupTrip[];
  hostPlans: HostReferralPlan[];
  sos: SosBroadcast[];
  notifications: Notification[];
  likes: Record<string, number>;
};

/* ============ PERSISTENCE ============ */

const KEY = "nn:store:v3";
const EVT = "nn:store:change";

function load(): StoreState {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      window.localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    const parsed = JSON.parse(raw) as StoreState;
    // Migration: if seed changed structure, re-seed
    if (!parsed.places || !parsed.publicItineraries) {
      const s = seed();
      window.localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return parsed;
  } catch {
    return seed();
  }
}

let state: StoreState = load();

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(EVT));
}

export function resetStore() {
  state = seed();
  persist();
}

export function getState(): StoreState {
  return state;
}

export function setState(patch: Partial<StoreState> | ((s: StoreState) => Partial<StoreState>)) {
  const next = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...next };
  persist();
}

function subscribe(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVT, handler);
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      state = load();
      cb();
    }
  });
  return () => window.removeEventListener(EVT, handler);
}

/* ============ HOOKS ============ */

export function useStore<T>(selector: (s: StoreState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

export function useCurrentUser(): Account | null {
  return useStore((s) => s.accounts.find((a) => a.id === s.currentUserId) ?? null);
}

/* ============ AUTH ============ */

export function signIn(email: string, password: string): Account | null {
  const acc = state.accounts.find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
  );
  if (!acc) return null;
  setState({ currentUserId: acc.id });
  return acc;
}

export function signInAs(accountId: string) {
  setState({ currentUserId: accountId });
}

export function signOut() {
  setState({ currentUserId: null });
}

/* ============ MUTATIONS ============ */

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function shortCode(state: string) {
  const stateCode = state.slice(0, 4).toUpperCase();
  const num = Math.floor(100 + Math.random() * 900);
  return `NN-${stateCode}-${num}`;
}

export function saveDraftItinerary(input: {
  title: string;
  stops: { placeId: string; day: number }[];
  cover: string;
}): UserItinerary | null {
  const uid = state.currentUserId;
  if (!uid) return null;
  const total = input.stops.reduce((sum, s) => {
    const p = state.places.find((pl) => pl.id === s.placeId);
    return sum + (p?.price ?? 0);
  }, 0);
  const it: UserItinerary = {
    id: id("it"),
    ownerId: uid,
    title: input.title,
    stops: input.stops,
    status: "draft",
    createdAt: new Date().toISOString(),
    totalPrice: total,
    cover: input.cover,
  };
  setState((s) => ({ userItineraries: [it, ...s.userItineraries] }));
  return it;
}

export function bookItinerary(itineraryId: string): Booking | null {
  const uid = state.currentUserId;
  if (!uid) return null;
  const it = state.userItineraries.find((i) => i.id === itineraryId);
  if (!it) return null;
  const booking: Booking = {
    id: id("bk"),
    ownerId: uid,
    kind: "itinerary",
    refId: it.id,
    title: it.title,
    detail: `${it.stops.length} stops`,
    amount: it.totalPrice,
    travellers: 1,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  setState((s) => ({
    bookings: [booking, ...s.bookings],
    userItineraries: s.userItineraries.map((i) =>
      i.id === itineraryId ? { ...i, status: "booked" } : i,
    ),
  }));
  return booking;
}

export function completeBooking(bookingId: string) {
  setState((s) => ({
    bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, status: "completed" } : b)),
    userItineraries: s.userItineraries.map((i) => {
      const b = s.bookings.find((bb) => bb.id === bookingId);
      if (b && b.refId === i.id) return { ...i, status: "completed" };
      return i;
    }),
  }));
}

export function publishItinerary(itineraryId: string, experience: string): string | null {
  const uid = state.currentUserId;
  const it = state.userItineraries.find((i) => i.id === itineraryId);
  const acc = state.accounts.find((a) => a.id === uid);
  if (!it || !acc) return null;
  // Gate: must be completed (or creator role can publish any)
  if (it.status !== "completed" && acc.role !== "creator") return null;
  const stateName = state.places.find((p) => p.id === it.stops[0]?.placeId)?.state ?? "Northeast";
  const stateSlug = state.places.find((p) => p.id === it.stops[0]?.placeId)?.stateSlug ?? "meghalaya";
  const code = shortCode(stateName);
  const pub: PublicItinerary = {
    code,
    title: it.title,
    creatorId: uid!,
    state: stateName,
    stateSlug,
    days: Math.max(...it.stops.map((s) => s.day), 1),
    price: it.totalPrice,
    cover: it.cover,
    gallery: it.stops.slice(0, 6).map((s) => state.places.find((p) => p.id === s.placeId)?.poster ?? it.cover),
    rating: 4.6,
    reviews: 0,
    likes: 0,
    bookings: 0,
    stops: it.stops.map((s) => ({ ...s, note: state.places.find((p) => p.id === s.placeId)?.hook ?? "" })),
    experience,
    publishedAt: new Date().toISOString(),
  };
  setState((s) => ({
    publicItineraries: [pub, ...s.publicItineraries],
    userItineraries: s.userItineraries.map((i) =>
      i.id === itineraryId ? { ...i, status: "published", publishedCode: code } : i,
    ),
  }));
  return code;
}

export function likeItinerary(code: string) {
  setState((s) => ({
    publicItineraries: s.publicItineraries.map((p) =>
      p.code === code ? { ...p, likes: p.likes + 1 } : p,
    ),
  }));
}

export function createBooking(input: Omit<Booking, "id" | "createdAt" | "status" | "ownerId">): Booking | null {
  const uid = state.currentUserId;
  if (!uid) return null;
  const b: Booking = {
    ...input,
    id: id("bk"),
    ownerId: uid,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  setState((s) => ({ bookings: [b, ...s.bookings] }));
  return b;
}

export function createGroupTrip(input: {
  itineraryId: string;
  title: string;
  cover: string;
  perSeat: number;
  seatCount: number;
}): GroupTrip | null {
  const uid = state.currentUserId;
  if (!uid) return null;
  const trip: GroupTrip = {
    id: id("gt"),
    organiserId: uid,
    title: input.title,
    itineraryId: input.itineraryId,
    cover: input.cover,
    perSeat: input.perSeat,
    seats: Array.from({ length: input.seatCount }).map((_, i) => ({
      id: id("seat"),
      memberName: `Seat ${i + 1}`,
      claimed: i === 0,
      paid: i === 0,
    })),
    createdAt: new Date().toISOString(),
  };
  setState((s) => ({ groupTrips: [trip, ...s.groupTrips] }));
  return trip;
}

export function claimSeat(tripId: string, seatId: string, name: string, email: string) {
  setState((s) => ({
    groupTrips: s.groupTrips.map((t) =>
      t.id === tripId
        ? {
            ...t,
            seats: t.seats.map((se) =>
              se.id === seatId ? { ...se, claimed: true, paid: true, memberName: name, email } : se,
            ),
          }
        : t,
    ),
  }));
}

export function sendSos(input: { message: string; lat: number; lng: number }): SosBroadcast | null {
  const uid = state.currentUserId;
  if (!uid) return null;
  const s: SosBroadcast = {
    id: id("sos"),
    ownerId: uid,
    message: input.message,
    lat: input.lat,
    lng: input.lng,
    createdAt: new Date().toISOString(),
    resolved: false,
  };
  setState((st) => ({ sos: [s, ...st.sos] }));
  return s;
}

export function addPlaceToItinerary(itineraryId: string, placeId: string, day: number) {
  setState((s) => ({
    userItineraries: s.userItineraries.map((i) =>
      i.id === itineraryId ? { ...i, stops: [...i.stops, { placeId, day }] } : i,
    ),
  }));
}

export function formatINR(n: number) {
  return `₹ ${n.toLocaleString("en-IN")}`;
}

export function findAccount(idOrHandle: string): Account | null {
  return (
    state.accounts.find((a) => a.id === idOrHandle) ??
    state.accounts.find((a) => a.handle === idOrHandle) ??
    null
  );
}
