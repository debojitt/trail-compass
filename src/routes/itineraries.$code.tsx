import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Calendar, Copy, Heart, MapPin, Share2, ShieldCheck, ShoppingCart, Users } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { VideoRow } from "@/components/site/DetailMedia";
import { useDemoUser } from "@/components/site/useDemoUser";
import { openSignInDialog } from "@/lib/openSignIn";
import { SAMPLE_VIDEOS } from "@/data/demoUniverse";
import {
  bookItinerary,
  formatINR,
  likeItinerary,
  saveDraftItinerary,
  useStore,
} from "@/lib/store";
import { createGroupInvite } from "@/lib/demoApi";
import { RED, GREEN, GREEN_LIGHT } from "@/lib/brand";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/itineraries/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.code} · NORTHNEST itinerary` },
      { name: "description", content: `Verified NORTHNEST itinerary ${params.code} — full route, photos, host experience.` },
    ],
  }),
  loader: ({ params }) => {
    return { code: params.code };
  },
  component: ItineraryDetail,
  notFoundComponent: () => (
    <SiteShell>
      <div className="py-20 text-center">
        <p className="text-[13px] font-bold uppercase tracking-widest text-neutral-400">404</p>
        <h1 className="mt-2 text-[26px] font-bold">No itinerary with that code</h1>
        <Link to="/itineraries" className="mt-4 inline-block text-[13px] font-semibold" style={{ color: RED }}>
          ← Browse all itineraries
        </Link>
      </div>
    </SiteShell>
  ),
});

function ItineraryDetail() {
  const { code } = Route.useLoaderData();
  const it = useStore((s) => s.publicItineraries.find((x) => x.code === code));
  const places = useStore((s) => s.places);
  const accounts = useStore((s) => s.accounts);
  const user = useDemoUser();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busyInvite, setBusyInvite] = useState(false);

  if (!it) throw notFound();
  const creator = accounts.find((a) => a.id === it.creatorId);

  const useThis = () => {
    if (!user) {
      openSignInDialog();
      return;
    }
    const draft = saveDraftItinerary({
      title: `${it.title} (copy)`,
      stops: it.stops.map((s) => ({ placeId: s.placeId, day: s.day })),
      cover: it.cover,
    });
    if (draft) {
      setMsg("Loaded into your builder — check My Nest");
      setTimeout(() => setMsg(null), 2500);
    }
  };

  const bookNow = () => {
    if (!user) {
      openSignInDialog();
      return;
    }
    const draft = saveDraftItinerary({
      title: it.title,
      stops: it.stops.map((s) => ({ placeId: s.placeId, day: s.day })),
      cover: it.cover,
    });
    if (draft) {
      bookItinerary(draft.id);
      setMsg(`Booked · ₹ ${it.price.toLocaleString("en-IN")} · creator earns 12% commission`);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const inviteCrew = async () => {
    if (!user) {
      openSignInDialog();
      toast.message("Sign in to create a crew invite");
      return;
    }
    setBusyInvite(true);
    try {
      const inv = await createGroupInvite({
        title: it.title,
        pricePerSeat: it.price,
        seatCount: 4,
        cover: it.cover,
      });
      toast.success(`Crew invite ${inv.code} ready`);
      void navigate({ to: "/invite/$code", params: { code: inv.code } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create invite");
    }
    setBusyInvite(false);
  };

  const share = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <SiteShell backFallback="/itineraries">
      <Link to="/itineraries" className="mb-4 inline-block text-[13px] font-semibold text-neutral-500">
        ← All itineraries
      </Link>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div>
          {/* Gallery */}
          <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl">
            <img src={it.cover} alt="" className="col-span-2 row-span-2 h-full w-full object-cover" style={{ minHeight: 300 }} />
            {it.gallery.slice(0, 4).map((g, i) => (
              <img key={i} src={g} alt="" className="h-full w-full object-cover" style={{ minHeight: 140 }} />
            ))}
          </div>

          <div className="mt-6">
            <VideoRow
              videos={
                it.stops
                  .map((s) => places.find((x) => x.id === s.placeId)?.video)
                  .filter((v): v is string => Boolean(v))
                  .slice(0, 3)
                  .concat([SAMPLE_VIDEOS[0], SAMPLE_VIDEOS[1]])
                  .slice(0, 3)
              }
            />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span
              className="rounded-full bg-neutral-900 px-3 py-1 font-mono text-[12px] font-black tracking-wider text-white"
            >
              {it.code}
            </span>
            <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: GREEN_LIGHT, color: GREEN }}>
              <ShieldCheck size={11} className="mr-1 inline" /> Verified · Completed booking
            </span>
          </div>
          <h1 className="mt-3 text-[30px] font-bold leading-tight tracking-tight md:text-[38px]">
            {it.title}
          </h1>
          <p className="mt-2 flex items-center gap-2 text-[13px] text-neutral-500">
            <MapPin size={14} /> {it.state} · {it.days} days ·{" "}
            <Heart size={12} className="ml-2" /> {it.likes.toLocaleString("en-IN")} ·{" "}
            <Users size={12} className="ml-2" /> {it.bookings} bookings
          </p>

          {/* Creator */}
          <Link
            to="/creators/$handle"
            params={{ handle: creator?.handle ?? "meiko.trails" }}
            className="mt-6 flex items-center gap-3 rounded-2xl border p-4 transition-colors hover:bg-neutral-50"
            style={{ borderColor: "rgba(0,0,0,0.08)" }}
          >
            <img src={creator?.avatar} className="h-12 w-12 rounded-full" alt="" />
            <div>
              <p className="flex items-center gap-1 text-[14px] font-bold">
                {creator?.name}
                {creator?.verified && <ShieldCheck size={13} style={{ color: RED }} />}
              </p>
              <p className="text-[11px] text-neutral-500">
                @{creator?.handle} · {(creator?.followers ?? 0).toLocaleString("en-IN")} followers
              </p>
            </div>
            <span className="ml-auto text-[11px] font-bold text-neutral-400">View profile →</span>
          </Link>

          {/* Experience */}
          <div className="mt-6">
            <p className="text-[12px] font-bold uppercase tracking-widest text-neutral-400">
              Creator experience
            </p>
            <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-neutral-700">
              {it.experience}
            </p>
          </div>

          {/* Day-by-day */}
          <div className="mt-8">
            <p className="text-[12px] font-bold uppercase tracking-widest text-neutral-400">
              Day-by-day plan
            </p>
            <ol className="mt-3 space-y-3">
              {it.stops.map((s, i) => {
                const p = places.find((x) => x.id === s.placeId);
                if (!p) return null;
                return (
                  <li
                    key={i}
                    className="flex gap-3 overflow-hidden rounded-2xl border"
                    style={{ borderColor: "rgba(0,0,0,0.07)" }}
                  >
                    <img src={p.poster} alt="" className="h-24 w-32 object-cover" />
                    <div className="flex-1 py-3 pr-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        <Calendar size={10} className="mr-1 inline" /> Day {s.day}
                      </p>
                      <p className="text-[15px] font-bold tracking-tight">{p.name}</p>
                      <p className="mt-0.5 line-clamp-2 text-[12px] text-neutral-500">{s.note}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* Sticky booking card */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border bg-white p-5 shadow-sm" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
            <p className="text-[11px] text-neutral-400">All-in demo price</p>
            <p className="text-[28px] font-bold tracking-tight" style={{ color: RED }}>
              {formatINR(it.price)}
              <span className="ml-1 text-[12px] font-medium text-neutral-400">/ person</span>
            </p>
            <button
              onClick={bookNow}
              className="mt-3 w-full rounded-full py-3 text-[14px] font-bold text-white"
              style={{ background: RED }}
            >
              Book this itinerary
            </button>
            <button
              onClick={useThis}
              className="mt-2 w-full rounded-full border py-3 text-[13px] font-bold"
              style={{ borderColor: GREEN, color: GREEN }}
            >
              <ShoppingCart size={13} className="mr-1 inline" /> Use as template
            </button>
            <button
              type="button"
              disabled={busyInvite}
              onClick={() => void inviteCrew()}
              className="mt-2 w-full rounded-full border py-3 text-[13px] font-bold disabled:opacity-60"
              style={{ borderColor: "rgba(0,0,0,0.15)" }}
            >
              <Users size={13} className="mr-1 inline" />{" "}
              {busyInvite ? "Creating crew…" : "Invite crew (per-seat pay)"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  openSignInDialog();
                  return;
                }
                likeItinerary(it.code);
              }}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full py-2 text-[12px] font-bold text-neutral-500 hover:bg-neutral-50"
            >
              <Heart size={13} /> Like
            </button>
            <button
              onClick={share}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-full py-2 text-[12px] font-bold text-neutral-500 hover:bg-neutral-50"
            >
              {copied ? <Copy size={13} /> : <Share2 size={13} />}
              {copied ? "Link copied!" : "Share"}
            </button>
            <div className="mt-4 rounded-2xl px-3 py-2 text-[11px]" style={{ background: GREEN_LIGHT, color: GREEN }}>
              Creator earns 12% when your booking hits COMPLETED status.
            </div>
          </div>
        </aside>
      </div>
      {msg && (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-[13px] font-bold text-white shadow-2xl"
          style={{ background: GREEN }}
        >
          {msg}
        </div>
      )}
    </SiteShell>
  );
}
