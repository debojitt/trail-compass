/**
 * Shared dashboard ops: enquiries inbox, activity history, role settings,
 * admin suspend flags — all localStorage-persisted for the demo.
 */

const CHANGE_EVENT = "nn-demo-store-change";

const OPS_KEYS = {
  enquiries: "nn-demo-enquiries-v2",
  activity: "nn-demo-activity-v2",
  settings: "nn-demo-dash-settings-v1",
  suspended: "nn-demo-suspended-users-v1",
  listingFlags: "nn-demo-admin-listing-flags-v1",
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

function daysAgo(n: number) {
  return new Date(Date.now() - 86400000 * n).toISOString();
}

/* ============ ENQUIRIES ============ */

export type EnquiryStatus = "open" | "closed";

export type Enquiry = {
  id: string;
  toUserId: string;
  fromName: string;
  fromEmail: string;
  fromUserId?: string;
  subject: string;
  message: string;
  reply?: string;
  status: EnquiryStatus;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

function seedEnquiries(): Enquiry[] {
  return [
    {
      id: "ENQ-T1",
      toUserId: "traveler1",
      fromName: "Kabir Host Desk",
      fromEmail: "host1@northnest.demo",
      fromUserId: "host1",
      subject: "Re: Cloud Homestay hold",
      message: "We can confirm your pending stay if you reply with check-in time.",
      status: "open",
      read: false,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    {
      id: "ENQ-T2",
      toUserId: "traveler1",
      fromName: "Priya Films",
      fromEmail: "creator1@northnest.demo",
      fromUserId: "creator1",
      subject: "Thanks for booking Root Bridge route",
      message: "Happy to tweak day 2 if you want more waterfall time.",
      reply: "Yes please — more falls on day 2!",
      status: "closed",
      read: true,
      createdAt: daysAgo(8),
      updatedAt: daysAgo(7),
    },
    {
      id: "ENQ-C1",
      toUserId: "creator1",
      fromName: "Ananya Traveler",
      fromEmail: "traveler1@northnest.demo",
      fromUserId: "traveler1",
      subject: "Can we add a drone slot?",
      message: "Love the Root Bridge Film Route — any drone-friendly windows?",
      status: "open",
      read: false,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: "ENQ-C2",
      toUserId: "creator1",
      fromName: "Riya Crew",
      fromEmail: "riya@example.com",
      subject: "Group of 6 for October",
      message: "Looking at your published plan for a crew shoot in Oct.",
      status: "open",
      read: true,
      createdAt: daysAgo(4),
      updatedAt: daysAgo(4),
    },
    {
      id: "ENQ-H1",
      toUserId: "host1",
      fromName: "Guest · Mira",
      fromEmail: "mira@example.com",
      subject: "Availability next weekend?",
      message: "Do you have 2 rooms free Fri–Sun? Prefer home meals.",
      status: "open",
      read: false,
      createdAt: daysAgo(0.5),
      updatedAt: daysAgo(0.5),
    },
    {
      id: "ENQ-H2",
      toUserId: "host1",
      fromName: "Ananya Traveler",
      fromEmail: "traveler1@northnest.demo",
      fromUserId: "traveler1",
      subject: "48h Sohra sprint questions",
      message: "Does the referral trip include airport pickup?",
      reply: "Yes — airport pickup is in the cab list.",
      status: "closed",
      read: true,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(4),
    },
    {
      id: "ENQ-P1",
      toUserId: "planner1",
      fromName: "Corporate desk",
      fromEmail: "ops@acme.demo",
      subject: "Seven Sisters for 8 pax",
      message: "Need a proposal with masked vendors for next month.",
      status: "open",
      read: false,
      createdAt: daysAgo(1.5),
      updatedAt: daysAgo(1.5),
    },
    {
      id: "ENQ-P2",
      toUserId: "planner1",
      fromName: "Traveler · Dev",
      fromEmail: "traveler2@northnest.demo",
      fromUserId: "traveler2",
      subject: "Echo SOS coverage?",
      message: "Confirm Echo SOS stays on even with vendor mask.",
      reply: "Confirmed — safety is never gated by the mask.",
      status: "closed",
      read: true,
      createdAt: daysAgo(3),
      updatedAt: daysAgo(2),
    },
    {
      id: "ENQ-A1",
      toUserId: "admin1",
      fromName: "Platform monitor",
      fromEmail: "ops@northnest.demo",
      subject: "Flagged enquiry volume spike",
      message: "Creator enquiries up 40% this week — review queue.",
      status: "open",
      read: false,
      createdAt: daysAgo(0.2),
      updatedAt: daysAgo(0.2),
    },
  ];
}

function ensureEnquiries(): Enquiry[] {
  if (typeof window === "undefined") return seedEnquiries();
  const existing = readJson<Enquiry[] | null>(OPS_KEYS.enquiries, null);
  if (existing && existing.length > 0) return existing;
  writeJson(OPS_KEYS.enquiries, seedEnquiries());
  return seedEnquiries();
}

export function listEnquiries(filter?: {
  toUserId?: string;
  fromUserId?: string;
  status?: EnquiryStatus;
}): Enquiry[] {
  let list = ensureEnquiries();
  if (filter?.toUserId) list = list.filter((e) => e.toUserId === filter.toUserId);
  if (filter?.fromUserId) list = list.filter((e) => e.fromUserId === filter.fromUserId);
  if (filter?.status) list = list.filter((e) => e.status === filter.status);
  return [...list].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export function createEnquiry(input: {
  toUserId: string;
  fromName: string;
  fromEmail: string;
  fromUserId?: string;
  subject: string;
  message: string;
}): Enquiry {
  const now = new Date().toISOString();
  const enq: Enquiry = {
    id: refCode("ENQ"),
    toUserId: input.toUserId,
    fromName: input.fromName,
    fromEmail: input.fromEmail,
    fromUserId: input.fromUserId,
    subject: input.subject.trim(),
    message: input.message.trim(),
    status: "open",
    read: false,
    createdAt: now,
    updatedAt: now,
  };
  writeJson(OPS_KEYS.enquiries, [enq, ...ensureEnquiries()]);
  appendActivity({
    actorId: input.fromUserId ?? "guest",
    actorName: input.fromName,
    action: "enquiry",
    summary: `Enquiry sent: ${enq.subject}`,
    meta: { enquiryId: enq.id, toUserId: enq.toUserId },
  });
  return enq;
}

export function markEnquiryRead(id: string, read = true): Enquiry {
  const list = ensureEnquiries();
  const idx = list.findIndex((e) => e.id === id);
  if (idx < 0) throw new Error("Enquiry not found");
  const updated = { ...list[idx], read, updatedAt: new Date().toISOString() };
  const next = [...list];
  next[idx] = updated;
  writeJson(OPS_KEYS.enquiries, next);
  return updated;
}

export function replyToEnquiry(id: string, reply: string, actor?: { id: string; name: string }): Enquiry {
  const list = ensureEnquiries();
  const idx = list.findIndex((e) => e.id === id);
  if (idx < 0) throw new Error("Enquiry not found");
  const updated: Enquiry = {
    ...list[idx],
    reply: reply.trim(),
    read: true,
    status: "open",
    updatedAt: new Date().toISOString(),
  };
  const next = [...list];
  next[idx] = updated;
  writeJson(OPS_KEYS.enquiries, next);
  appendActivity({
    actorId: actor?.id ?? updated.toUserId,
    actorName: actor?.name ?? "Host",
    action: "reply",
    summary: `Replied to enquiry: ${updated.subject}`,
    meta: { enquiryId: id },
  });
  return updated;
}

export function setEnquiryStatus(id: string, status: EnquiryStatus): Enquiry {
  const list = ensureEnquiries();
  const idx = list.findIndex((e) => e.id === id);
  if (idx < 0) throw new Error("Enquiry not found");
  const updated = { ...list[idx], status, updatedAt: new Date().toISOString() };
  const next = [...list];
  next[idx] = updated;
  writeJson(OPS_KEYS.enquiries, next);
  return updated;
}

/* ============ ACTIVITY HISTORY ============ */

export type ActivityAction =
  | "login"
  | "create"
  | "edit"
  | "publish"
  | "unlist"
  | "booking"
  | "enquiry"
  | "reply"
  | "settings"
  | "delete"
  | "status"
  | "suspend";

export type ActivityEvent = {
  id: string;
  actorId: string;
  actorName: string;
  role?: string;
  action: ActivityAction;
  summary: string;
  createdAt: string;
  meta?: Record<string, string>;
};

function seedActivity(): ActivityEvent[] {
  return [
    {
      id: "ACT-1",
      actorId: "traveler1",
      actorName: "Ananya Traveler",
      role: "traveler",
      action: "booking",
      summary: "Completed booking · Ananya's Monsoon Meghalaya",
      createdAt: daysAgo(12),
    },
    {
      id: "ACT-2",
      actorId: "traveler1",
      actorName: "Ananya Traveler",
      role: "traveler",
      action: "publish",
      summary: "Published itinerary code NN-MEGH-804",
      createdAt: daysAgo(11),
    },
    {
      id: "ACT-3",
      actorId: "creator1",
      actorName: "Priya Films",
      role: "creator",
      action: "create",
      summary: "Added itinerary · Root Bridge Film Route",
      createdAt: daysAgo(20),
    },
    {
      id: "ACT-4",
      actorId: "creator1",
      actorName: "Priya Films",
      role: "creator",
      action: "publish",
      summary: "Published Root Bridge Film Route to public profile",
      createdAt: daysAgo(19),
    },
    {
      id: "ACT-5",
      actorId: "host1",
      actorName: "Kabir Host",
      role: "host",
      action: "create",
      summary: "Listed home · Cloud Ridge Homestay",
      createdAt: daysAgo(30),
    },
    {
      id: "ACT-6",
      actorId: "host1",
      actorName: "Kabir Host",
      role: "host",
      action: "booking",
      summary: "Guest referral booking confirmed · 48h Sohra sprint",
      createdAt: daysAgo(4),
    },
    {
      id: "ACT-7",
      actorId: "planner1",
      actorName: "Nestcraft Planner",
      role: "planner",
      action: "create",
      summary: "Created plan · Seven Sisters Sampler",
      createdAt: daysAgo(25),
    },
    {
      id: "ACT-8",
      actorId: "planner1",
      actorName: "Nestcraft Planner",
      role: "planner",
      action: "settings",
      summary: "Enabled Echo SOS standing access",
      createdAt: daysAgo(10),
    },
    {
      id: "ACT-9",
      actorId: "admin1",
      actorName: "Ops Admin",
      role: "admin",
      action: "status",
      summary: "Platform health check · all role CMS seeds OK",
      createdAt: daysAgo(1),
    },
    {
      id: "ACT-10",
      actorId: "traveler1",
      actorName: "Ananya Traveler",
      role: "traveler",
      action: "enquiry",
      summary: "Sent enquiry to Priya Films about drone slot",
      createdAt: daysAgo(2),
    },
    {
      id: "ACT-11",
      actorId: "host1",
      actorName: "Kabir Host",
      role: "host",
      action: "reply",
      summary: "Replied to 48h Sohra sprint questions",
      createdAt: daysAgo(4),
    },
    {
      id: "ACT-12",
      actorId: "creator1",
      actorName: "Priya Films",
      role: "creator",
      action: "booking",
      summary: "New customer booking on creator plan inventory",
      createdAt: daysAgo(6),
    },
  ];
}

function ensureActivity(): ActivityEvent[] {
  if (typeof window === "undefined") return seedActivity();
  const existing = readJson<ActivityEvent[] | null>(OPS_KEYS.activity, null);
  if (existing && existing.length > 0) return existing;
  writeJson(OPS_KEYS.activity, seedActivity());
  return seedActivity();
}

export function listActivity(filter?: { actorId?: string; role?: string }): ActivityEvent[] {
  let list = ensureActivity();
  if (filter?.actorId) list = list.filter((a) => a.actorId === filter.actorId);
  if (filter?.role) list = list.filter((a) => a.role === filter.role);
  return [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function appendActivity(input: {
  actorId: string;
  actorName: string;
  role?: string;
  action: ActivityAction;
  summary: string;
  meta?: Record<string, string>;
}): ActivityEvent {
  const event: ActivityEvent = {
    id: refCode("ACT"),
    actorId: input.actorId,
    actorName: input.actorName,
    role: input.role,
    action: input.action,
    summary: input.summary,
    createdAt: new Date().toISOString(),
    meta: input.meta,
  };
  /* avoid recursive write storms: read without ensure write when missing */
  const existing = readJson<ActivityEvent[] | null>(OPS_KEYS.activity, null) ?? seedActivity();
  writeJson(OPS_KEYS.activity, [event, ...existing].slice(0, 200));
  return event;
}

export function listPlatformActivity(): ActivityEvent[] {
  return listActivity();
}

/* ============ DASHBOARD SETTINGS / TOGGLES ============ */

export type DashSettings = {
  acceptBookings: boolean;
  notifications: boolean;
  publicProfile: boolean;
  vendorMask?: boolean;
  subdomainPublic?: boolean;
  echoSosNote?: boolean;
};

const DEFAULT_SETTINGS: DashSettings = {
  acceptBookings: true,
  notifications: true,
  publicProfile: true,
  vendorMask: true,
  subdomainPublic: true,
  echoSosNote: true,
};

export function getDashSettings(userId: string): DashSettings {
  const all = readJson<Record<string, DashSettings>>(OPS_KEYS.settings, {});
  return { ...DEFAULT_SETTINGS, ...(all[userId] ?? {}) };
}

export function updateDashSettings(userId: string, patch: Partial<DashSettings>, actor?: { name: string; role?: string }): DashSettings {
  const all = readJson<Record<string, DashSettings>>(OPS_KEYS.settings, {});
  const next = { ...getDashSettings(userId), ...patch };
  all[userId] = next;
  writeJson(OPS_KEYS.settings, all);
  const flipped = Object.keys(patch)
    .map((k) => `${k}=${String((patch as Record<string, unknown>)[k])}`)
    .join(", ");
  appendActivity({
    actorId: userId,
    actorName: actor?.name ?? userId,
    role: actor?.role,
    action: "settings",
    summary: `Settings updated · ${flipped}`,
  });
  return next;
}

/* ============ ADMIN FLAGS ============ */

export function listSuspendedUserIds(): string[] {
  return readJson<string[]>(OPS_KEYS.suspended, []);
}

export function isUserSuspended(userId: string): boolean {
  return listSuspendedUserIds().includes(userId);
}

export function setUserSuspended(userId: string, suspended: boolean, actor?: { id: string; name: string }): boolean {
  const cur = new Set(listSuspendedUserIds());
  if (suspended) cur.add(userId);
  else cur.delete(userId);
  writeJson(OPS_KEYS.suspended, [...cur]);
  appendActivity({
    actorId: actor?.id ?? "admin1",
    actorName: actor?.name ?? "Ops Admin",
    role: "admin",
    action: "suspend",
    summary: suspended ? `Suspended user ${userId}` : `Unsuspended user ${userId}`,
    meta: { userId },
  });
  return suspended;
}

export type ListingFlagKey = `${"home" | "plan" | "freelance"}:${string}`;

export function getListingPublishedFlag(kind: "home" | "plan" | "freelance", id: string): boolean | null {
  const all = readJson<Record<string, boolean>>(OPS_KEYS.listingFlags, {});
  const key = `${kind}:${id}` as ListingFlagKey;
  return key in all ? all[key] : null;
}

export function setListingPublishedFlag(
  kind: "home" | "plan" | "freelance",
  id: string,
  published: boolean,
  actor?: { id: string; name: string },
): boolean {
  const all = readJson<Record<string, boolean>>(OPS_KEYS.listingFlags, {});
  all[`${kind}:${id}`] = published;
  writeJson(OPS_KEYS.listingFlags, all);
  appendActivity({
    actorId: actor?.id ?? "admin1",
    actorName: actor?.name ?? "Ops Admin",
    role: "admin",
    action: published ? "publish" : "unlist",
    summary: `${published ? "Published" : "Unlisted"} ${kind} ${id}`,
    meta: { kind, id },
  });
  return published;
}
