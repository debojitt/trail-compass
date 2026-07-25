import { useEffect } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  Bell,
  Bookmark,
  Compass,
  Home,
  Instagram,
  Map,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import {
  bookItinerary,
  completeBooking,
  formatINR,
  publishItinerary,
  signOut,
  useCurrentUser,
  useStore,
} from "@/lib/store";
import { RED, GREEN, GREEN_LIGHT } from "@/lib/brand";
import { useState } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Nest · NORTHNEST" },
      { name: "description", content: "Your trips, itineraries, bookings and role-based tools." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const user = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/auth" });
  }, [user, navigate]);

  if (!user) return null;

  return (
    <SiteShell>
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <SidebarNav />
        <div>
          <Header />
          <div className="mt-6 space-y-6">
            <TravelerBlock />
            {user.role === "creator" && <CreatorBlock />}
            {user.role === "host" && <HostBlock />}
            {user.role === "planner" && <PlannerBlock />}
            {user.role === "admin" && <AdminBlock />}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

function Header() {
  const user = useCurrentUser()!;
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
      <img src={user.avatar} className="h-16 w-16 rounded-full" alt="" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[20px] font-bold tracking-tight">{user.name}</p>
          {user.verified && <ShieldCheck size={16} style={{ color: RED }} />}
        </div>
        <p className="text-[12px] text-neutral-500">@{user.handle} · {user.city}</p>
      </div>
      <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white" style={{ background: RED }}>
        {user.role}
      </span>
      <button
        onClick={() => signOut()}
        className="rounded-full border px-4 py-2 text-[12px] font-bold"
        style={{ borderColor: "rgba(0,0,0,0.12)" }}
      >
        Sign out
      </button>
    </div>
  );
}

function SidebarNav() {
  const user = useCurrentUser()!;
  const items: { label: string; icon: any; role?: string; anchor: string }[] = [
    { label: "Overview", icon: Home, anchor: "overview" },
    { label: "My trips", icon: Compass, anchor: "trips" },
    { label: "Saved itineraries", icon: Bookmark, anchor: "saved" },
    { label: "Group trips", icon: Users, anchor: "groups" },
    { label: "Notifications", icon: Bell, anchor: "notif" },
    { label: "Creator studio", icon: Instagram, anchor: "creator", role: "creator" },
    { label: "Host desk", icon: Map, anchor: "host", role: "host" },
    { label: "Planner console", icon: Wallet, anchor: "planner", role: "planner" },
    { label: "Ops admin", icon: ShieldCheck, anchor: "admin", role: "admin" },
  ];
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <nav className="rounded-3xl border p-2" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
        {items
          .filter((i) => !i.role || i.role === user.role)
          .map((i) => (
            <a
              key={i.anchor}
              href={`#${i.anchor}`}
              className="flex items-center gap-2 rounded-2xl px-3 py-2 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-50"
            >
              <i.icon size={14} /> {i.label}
            </a>
          ))}
      </nav>
    </aside>
  );
}

function TravelerBlock() {
  const user = useCurrentUser()!;
  const bookings = useStore((s) => s.bookings.filter((b) => b.ownerId === user.id));
  const itineraries = useStore((s) => s.userItineraries.filter((i) => i.ownerId === user.id));
  const groups = useStore((s) => s.groupTrips.filter((g) => g.organiserId === user.id));
  const notifs = useStore((s) => s.notifications.filter((n) => n.ownerId === user.id));
  const publicIt = useStore((s) => s.publicItineraries);
  const [experienceById, setExperienceById] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <>
      <section id="overview" className="grid gap-3 md:grid-cols-4">
        <Stat label="Bookings" value={String(bookings.length)} />
        <Stat label="Itineraries" value={String(itineraries.length)} />
        <Stat label="Group trips" value={String(groups.length)} />
        <Stat label="Codes published" value={String(itineraries.filter((i) => i.publishedCode).length)} />
      </section>

      <section id="trips" className="rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
        <h2 className="text-[16px] font-bold tracking-tight">My trips</h2>
        {bookings.length === 0 ? (
          <p className="mt-2 text-[12px] text-neutral-400">No bookings yet — start on the home page.</p>
        ) : (
          <ul className="mt-3 divide-y">
            {bookings.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold">{b.title}</p>
                  <p className="text-[11px] text-neutral-500">{b.detail} · {new Date(b.createdAt).toDateString()}</p>
                </div>
                <span className="text-[13px] font-bold" style={{ color: RED }}>{formatINR(b.amount)}</span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: b.status === "completed" ? GREEN_LIGHT : "#f5f5f5", color: b.status === "completed" ? GREEN : "#666" }}
                >
                  {b.status}
                </span>
                {b.status === "confirmed" && (
                  <button
                    onClick={() => completeBooking(b.id)}
                    className="rounded-full border px-3 py-1 text-[11px] font-bold"
                    style={{ borderColor: GREEN, color: GREEN }}
                  >
                    Mark completed
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="saved" className="rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[16px] font-bold tracking-tight">Saved itineraries</h2>
          <Link to="/builder" className="rounded-full px-4 py-2 text-[12px] font-bold text-white" style={{ background: RED }}>
            <Sparkles size={12} className="mr-1 inline" /> Build new
          </Link>
        </div>
        {itineraries.length === 0 ? (
          <p className="mt-2 text-[12px] text-neutral-400">Nothing saved yet — try the builder.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {itineraries.map((it) => (
              <div key={it.id} className="overflow-hidden rounded-2xl border" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                <img src={it.cover} alt="" className="aspect-video w-full object-cover" />
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-bold">{it.title}</p>
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                      style={{ background: it.status === "published" ? GREEN_LIGHT : "#f5f5f5", color: it.status === "published" ? GREEN : "#666" }}
                    >
                      {it.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-500">{it.stops.length} stops · {formatINR(it.totalPrice)}</p>
                  {it.status === "draft" && (
                    <button
                      onClick={() => {
                        const b = bookItinerary(it.id);
                        if (b) setTimeout(() => completeBooking(b.id), 400);
                        setMsg("Booked & auto-completed for demo");
                        setTimeout(() => setMsg(null), 1500);
                      }}
                      className="mt-2 w-full rounded-full py-1.5 text-[11px] font-bold text-white"
                      style={{ background: RED }}
                    >
                      Simulate book + complete
                    </button>
                  )}
                  {it.status === "completed" && !it.publishedCode && (
                    <div className="mt-2 space-y-2">
                      <textarea
                        placeholder="Write your experience (unlocks public code)"
                        value={experienceById[it.id] ?? ""}
                        onChange={(e) => setExperienceById((m) => ({ ...m, [it.id]: e.target.value }))}
                        rows={2}
                        className="w-full resize-none rounded-xl border px-2 py-1.5 text-[11px]"
                        style={{ borderColor: "rgba(0,0,0,0.08)" }}
                      />
                      <button
                        onClick={() => {
                          const c = publishItinerary(it.id, experienceById[it.id] ?? "Great trip!");
                          if (c) setMsg(`Published! Code: ${c}`);
                          setTimeout(() => setMsg(null), 3000);
                        }}
                        className="w-full rounded-full py-1.5 text-[11px] font-bold text-white"
                        style={{ background: GREEN }}
                      >
                        Publish · mint short code
                      </button>
                    </div>
                  )}
                  {it.publishedCode && (
                    <Link
                      to="/itineraries/$code"
                      params={{ code: it.publishedCode }}
                      className="mt-2 block rounded-xl bg-neutral-900 px-3 py-2 text-center font-mono text-[12px] font-black tracking-wider text-white"
                    >
                      {it.publishedCode}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="groups" className="rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
        <h2 className="text-[16px] font-bold tracking-tight">Group trips</h2>
        {groups.length === 0 ? (
          <p className="mt-2 text-[12px] text-neutral-400">You haven't organised any group trips. Try "Invite Crew" on any itinerary.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {groups.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center gap-3 rounded-2xl border p-3" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                <img src={g.cover} className="h-14 w-14 rounded-xl object-cover" alt="" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold">{g.title}</p>
                  <p className="text-[11px] text-neutral-500">
                    {g.seats.filter((s) => s.paid).length}/{g.seats.length} paid · {formatINR(g.perSeat)}/seat
                  </p>
                </div>
                <Link
                  to="/trip/$id/invite"
                  params={{ id: g.id }}
                  className="rounded-full px-4 py-1.5 text-[11px] font-bold text-white"
                  style={{ background: RED }}
                >
                  Manage
                </Link>
                <Link
                  to="/trip/$id/sos"
                  params={{ id: g.id }}
                  className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-bold"
                  style={{ borderColor: RED, color: RED }}
                >
                  <ShieldAlert size={11} /> SOS
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="notif" className="rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
        <h2 className="text-[16px] font-bold tracking-tight">Notifications</h2>
        <ul className="mt-3 divide-y">
          {notifs.map((n) => (
            <li key={n.id} className="py-2">
              <p className="text-[13px] font-bold">{n.title}</p>
              <p className="text-[11px] text-neutral-500">{n.body}</p>
            </li>
          ))}
          {notifs.length === 0 && <p className="text-[12px] text-neutral-400">Nothing new.</p>}
        </ul>
      </section>

      {msg && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-[13px] font-bold text-white shadow-2xl" style={{ background: GREEN }}>
          {msg}
        </div>
      )}
    </>
  );
}

function CreatorBlock() {
  const user = useCurrentUser()!;
  const its = useStore((s) => s.publicItineraries.filter((i) => i.creatorId === user.id));
  const totalLikes = its.reduce((a, b) => a + b.likes, 0);
  const totalBookings = its.reduce((a, b) => a + b.bookings, 0);
  const earnings = its.reduce((a, b) => a + b.bookings * b.price * 0.12, 0);
  return (
    <section id="creator" className="rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.08)", background: "#faf5ff" }}>
      <div className="flex items-center gap-2">
        <Instagram size={16} style={{ color: "#8B5CF6" }} />
        <h2 className="text-[16px] font-bold">Creator studio</h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold" style={{ color: "#8B5CF6" }}>
          <BadgeCheck size={10} className="mr-0.5 inline" /> Verified
        </span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Stat label="Published" value={String(its.length)} />
        <Stat label="Likes" value={totalLikes.toLocaleString("en-IN")} />
        <Stat label="Bookings" value={totalBookings.toLocaleString("en-IN")} />
        <Stat label="Earnings" value={formatINR(Math.round(earnings))} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/creators/$handle" params={{ handle: user.handle }} className="rounded-full px-4 py-2 text-[12px] font-bold text-white" style={{ background: "#8B5CF6" }}>
          View public profile →
        </Link>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {its.map((it) => (
          <Link key={it.code} to="/itineraries/$code" params={{ code: it.code }} className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
            <img src={it.cover} className="aspect-square w-full object-cover" alt="" />
            <div className="p-2">
              <p className="truncate text-[11px] font-bold">{it.title}</p>
              <p className="font-mono text-[10px]" style={{ color: "#8B5CF6" }}>{it.code}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function HostBlock() {
  const user = useCurrentUser()!;
  const stays = useStore((s) => s.stays.filter((st) => st.hostId === user.id));
  const plans = useStore((s) => s.hostPlans.filter((p) => p.hostId === user.id));
  const totalRef = plans.reduce((a, b) => a + b.bookings, 0);
  return (
    <section id="host" className="rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.08)", background: "#fffbeb" }}>
      <div className="flex items-center gap-2">
        <Map size={16} style={{ color: "#F59E0B" }} />
        <h2 className="text-[16px] font-bold">Host desk · zero commission</h2>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Stat label="Listings" value={String(stays.length)} />
        <Stat label="48h plans" value={String(plans.length)} />
        <Stat label="Referral books" value={String(totalRef)} />
        <Stat label="Payouts" value={formatINR(totalRef * 1700)} />
      </div>
      <Link to="/hosts/$id" params={{ id: user.id }} className="mt-4 inline-block rounded-full px-4 py-2 text-[12px] font-bold text-white" style={{ background: "#F59E0B" }}>
        View public host page →
      </Link>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {plans.map((p) => (
          <div key={p.id} className="rounded-2xl border bg-white p-3" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
            <p className="text-[13px] font-bold">{p.title}</p>
            <p className="text-[11px] text-neutral-500">{p.city} · {p.stops.length} stops · {formatINR(p.totalPrice)}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="rounded-full bg-neutral-900 px-2 py-0.5 font-mono text-[10px] font-black text-white">{p.referralCode}</span>
              <span className="text-[11px] font-bold" style={{ color: "#F59E0B" }}>{p.bookings} used</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlannerBlock() {
  const user = useCurrentUser()!;
  const bookings = useStore((s) => s.bookings.filter((b) => b.ownerId === user.id));
  const revenue = bookings.reduce((a, b) => a + b.amount, 0);
  const share = Math.round(revenue * 0.6);
  return (
    <section id="planner" className="rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.08)", background: GREEN_LIGHT }}>
      <div className="flex items-center gap-2">
        <Wallet size={16} style={{ color: GREEN }} />
        <h2 className="text-[16px] font-bold">Planner console · 60% net</h2>
      </div>
      <div className="mt-4 rounded-2xl bg-white p-4">
        <p className="text-[11px] uppercase tracking-widest text-neutral-400">Branded subdomain</p>
        <p className="mt-1 font-mono text-[15px] font-bold" style={{ color: GREEN }}>
          {user.subdomain}.northnest.demo
        </p>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-4">
        <Stat label="Trips fulfilled" value="412" />
        <Stat label="Vendors masked" value="Until T-48h" />
        <Stat label="Gross revenue" value={formatINR(revenue)} />
        <Stat label="Your share" value={formatINR(share)} />
      </div>
      <div className="mt-4 rounded-2xl bg-white p-4">
        <p className="text-[12px] font-bold">Vendor mask · reveals in 41h 12m</p>
        <ul className="mt-2 space-y-1 text-[12px] text-neutral-500">
          <li>▪︎ Cab: <span className="font-mono blur-[3px] hover:blur-0">Trans-NE Wheels</span></li>
          <li>▪︎ Stay: <span className="font-mono blur-[3px] hover:blur-0">Ridge House Gangtok</span></li>
          <li>▪︎ Guide: <span className="font-mono blur-[3px] hover:blur-0">Karma Lepcha</span></li>
        </ul>
        <p className="mt-3 rounded-xl px-3 py-2 text-[11px]" style={{ background: "#fff3cd", color: "#664d03" }}>
          <ShieldAlert size={11} className="mr-1 inline" />
          Echo SOS bypasses this mask automatically — safety access is never gated.
        </p>
      </div>
    </section>
  );
}

function AdminBlock() {
  const accounts = useStore((s) => s.accounts);
  const bookings = useStore((s) => s.bookings);
  const sos = useStore((s) => s.sos);
  return (
    <section id="admin" className="rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.08)", background: "#f3f4f6" }}>
      <h2 className="text-[16px] font-bold">Ops admin</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Stat label="Users" value={String(accounts.length)} />
        <Stat label="Bookings" value={String(bookings.length)} />
        <Stat label="Verified" value={String(accounts.filter((a) => a.verified).length)} />
        <Stat label="SOS on record" value={String(sos.length)} />
      </div>
      <ul className="mt-4 divide-y">
        {accounts.map((a) => (
          <li key={a.id} className="flex items-center gap-3 py-2">
            <img src={a.avatar} className="h-8 w-8 rounded-full" alt="" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold">{a.name}</p>
              <p className="text-[11px] text-neutral-500">{a.email} · {a.role}</p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${a.verified ? "text-green-700" : "text-neutral-400"}`} style={{ background: a.verified ? GREEN_LIGHT : "#fff" }}>
              {a.verified ? "verified" : "pending"}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center gap-2">
        <Send size={13} className="text-neutral-400" />
        <p className="text-[11px] text-neutral-500">Reset the demo dataset to start fresh:</p>
        <button
          onClick={() => {
            import("@/lib/store").then((m) => m.resetStore());
          }}
          className="rounded-full border px-3 py-1 text-[11px] font-bold"
          style={{ borderColor: RED, color: RED }}
        >
          Reset demo
        </button>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-3" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
      <p className="text-[10px] uppercase tracking-widest text-neutral-400">{label}</p>
      <p className="mt-1 text-[18px] font-bold tracking-tight">{value}</p>
    </div>
  );
}
