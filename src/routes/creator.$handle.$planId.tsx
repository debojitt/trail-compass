import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  CalendarDays,
  MapPin,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { BookingDialog, type BookingDraft } from "@/components/site/BookingDialog";
import { PhotoGallery, VideoRow, RatingLikes, PriceBlock } from "@/components/site/DetailMedia";
import type { CreatorPlan, DemoAccount } from "@/data/demoUniverse";
import {
  addToCart,
  fetchCreatorByHandle,
  fetchCreatorPlan,
  formatINR,
  PLACE_CLIPS,
} from "@/lib/demoApi";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";
import { toast } from "sonner";

export const Route = createFileRoute("/creator/$handle/$planId")({
  head: ({ params }) => ({
    meta: [{ title: `Itinerary · @${params.handle} · NORTHNEST` }],
  }),
  component: CreatorPlanPage,
});

function CreatorPlanPage() {
  const { handle, planId } = Route.useParams();
  const [plan, setPlan] = useState<CreatorPlan | null | undefined>(undefined);
  const [creator, setCreator] = useState<DemoAccount | null>(null);
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  useEffect(() => {
    let alive = true;
    fetchCreatorPlan(planId).then((p) => {
      if (alive) setPlan(p ?? null);
    });
    fetchCreatorByHandle(handle).then((c) => {
      if (alive) setCreator(c ?? null);
    });
    return () => {
      alive = false;
    };
  }, [planId, handle]);

  if (plan === undefined) {
    return (
      <SiteShell>
        <div className="h-64 animate-pulse rounded-3xl bg-neutral-100" />
      </SiteShell>
    );
  }
  if (!plan) {
    return (
      <SiteShell>
        <p className="font-bold">Itinerary not found</p>
        <Link to="/creator/$handle" params={{ handle }} style={{ color: RED }}>
          Back to @{handle}
        </Link>
      </SiteShell>
    );
  }

  const days = Array.from({ length: plan.days }, (_, i) => i + 1);
  const stopsByDay = days.map((day) => ({
    day,
    stops: plan.stops.filter((s) => s.day === day),
  }));

  return (
    <SiteShell backFallback={`/creator/${handle}`}>
      <Link
        to="/creator/$handle"
        params={{ handle }}
        className="text-[13px] font-semibold text-neutral-500"
      >
        ← @{handle}'s itineraries
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {creator && (
          <Link
            to="/creator/$handle"
            params={{ handle }}
            className="flex items-center gap-2 rounded-full border bg-white py-1 pl-1 pr-3"
            style={{ borderColor: "rgba(0,0,0,0.08)" }}
          >
            <img src={creator.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
            <span className="text-[12px] font-bold">{creator.name}</span>
            {creator.verified && <BadgeCheck size={14} style={{ color: GREEN }} />}
          </Link>
        )}
        {plan.publishCode && (
          <span
            className="rounded-full px-3 py-1 font-mono text-[11px] font-bold"
            style={{ background: GREEN_LIGHT, color: GREEN }}
          >
            {plan.publishCode}
          </span>
        )}
      </div>

      <h1 className="mt-4 text-[28px] font-bold tracking-tight md:text-[34px]">{plan.title}</h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-neutral-600">{plan.experience}</p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <RatingLikes rating={plan.rating} likes={plan.likes} />
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-neutral-500">
          <CalendarDays size={14} /> {plan.days} days
        </span>
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-neutral-500">
          <RouteIcon size={14} /> {plan.stops.length} stops
        </span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.45fr_1fr]">
        <div className="space-y-8">
          <PhotoGallery photos={plan.photos} alt={plan.title} />
          <VideoRow videos={plan.videos} />

          <section>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={16} style={{ color: RED }} />
              <h2 className="text-[16px] font-bold">Personalized day-by-day route</h2>
            </div>
            <div className="space-y-4">
              {stopsByDay.map(({ day, stops }) => (
                <div
                  key={day}
                  className="overflow-hidden rounded-3xl border bg-white"
                  style={{ borderColor: "rgba(0,0,0,0.07)" }}
                >
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ background: "linear-gradient(90deg, rgba(226,55,68,0.08), transparent)" }}
                  >
                    <p className="text-[13px] font-bold">Day {day}</p>
                    <p className="text-[11px] text-neutral-400">
                      {stops.length ? `${stops.length} stop${stops.length > 1 ? "s" : ""}` : "Travel / buffer"}
                    </p>
                  </div>
                  <div className="space-y-0 divide-y" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                    {stops.length === 0 ? (
                      <p className="px-4 py-4 text-[13px] text-neutral-500">
                        Flexible day — creator left this open for weather, permits, or rest.
                      </p>
                    ) : (
                      stops.map((s) => (
                        <div key={`${s.day}-${s.place}-${s.note}`} className="flex gap-3 p-4">
                          <img
                            src={s.img}
                            alt=""
                            className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                          />
                          <div className="min-w-0">
                            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                              <MapPin size={11} /> Stop
                            </p>
                            <p className="mt-0.5 text-[15px] font-bold leading-snug">{s.place}</p>
                            <p className="mt-1 text-[13px] leading-relaxed text-neutral-600">
                              {s.note}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            className="rounded-3xl border p-5"
            style={{ borderColor: "rgba(0,0,0,0.07)", background: GREEN_LIGHT }}
          >
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} style={{ color: GREEN }} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-[14px] font-bold text-neutral-900">Traveled & verified route</p>
                <p className="mt-1 text-[13px] leading-relaxed text-neutral-600">
                  This itinerary comes from @{handle}'s own travel — stops, pacing, and notes are what they
                  actually did on the ground. NORTHNEST fulfills bookings, permits, and local logistics.
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside
          className="h-fit rounded-3xl border p-6 shadow-lg lg:sticky lg:top-24"
          style={{ borderColor: "rgba(0,0,0,0.07)" }}
        >
          <PriceBlock price={plan.priceFrom} />
          <p className="mt-2 text-[12px] text-neutral-500">
            {plan.days} days · from {formatINR(plan.priceFrom)} · Northnest fulfills
          </p>
          <ul className="mt-4 space-y-2 text-[12px] text-neutral-600">
            <li>· Creator-personalized pacing</li>
            <li>· Day-wise stops with local notes</li>
            <li>· Permits & transfers handled at checkout</li>
          </ul>
          <button
            type="button"
            onClick={() =>
              setDraft({
                kind: "creator-plan",
                title: plan.title,
                detail: `Creator @${handle} · ${plan.days}D itinerary`,
                unitPrice: plan.priceFrom,
                sourceId: plan.id,
                publisherId: plan.creatorId,
              })
            }
            className="mt-5 w-full rounded-full py-3 text-[15px] font-bold text-white"
            style={{ background: RED }}
          >
            Book this itinerary
          </button>
          <button
            type="button"
            onClick={() => {
              PLACE_CLIPS.slice(0, plan.days).forEach((c) => addToCart(c.id));
              toast.success("Added to itinerary builder");
            }}
            className="mt-3 w-full rounded-full border py-2.5 text-[13px] font-semibold"
          >
            Remix in builder
          </button>
          <Link
            to="/builder"
            className="mt-3 block text-center text-[13px] font-semibold"
            style={{ color: GREEN }}
          >
            Open builder →
          </Link>
        </aside>
      </div>
      <BookingDialog draft={draft} onClose={() => setDraft(null)} />
    </SiteShell>
  );
}
