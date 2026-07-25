import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { BookingDialog, type BookingDraft } from "@/components/site/BookingDialog";
import { PhotoGallery, VideoRow, RatingLikes, PriceBlock } from "@/components/site/DetailMedia";
import type { CreatorPlan } from "@/data/demoUniverse";
import { addToCart, fetchCreatorPlan, PLACE_CLIPS } from "@/lib/demoApi";
import { GREEN, RED } from "@/lib/brand";
import { toast } from "sonner";

export const Route = createFileRoute("/creator/$handle/$planId")({
  head: ({ params }) => ({ meta: [{ title: `${params.planId} · Creator plan · NORTHNEST` }] }),
  component: CreatorPlanPage,
});

function CreatorPlanPage() {
  const { handle, planId } = Route.useParams();
  const [plan, setPlan] = useState<CreatorPlan | null | undefined>(undefined);
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  useEffect(() => {
    fetchCreatorPlan(planId).then(setPlan);
  }, [planId]);

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
        <p className="font-bold">Plan not found</p>
        <Link to="/creator/$handle" params={{ handle }} style={{ color: RED }}>
          Back to profile
        </Link>
      </SiteShell>
    );
  }

  return (
    <SiteShell backFallback={`/creator/${handle}`}>
      <Link to="/creator/$handle" params={{ handle }} className="text-[13px] font-semibold text-neutral-500">
        ← @{handle}
      </Link>
      <h1 className="mt-2 text-[28px] font-bold tracking-tight">{plan.title}</h1>
      <div className="mt-2">
        <RatingLikes rating={plan.rating} likes={plan.likes} />
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <PhotoGallery photos={plan.photos} alt={plan.title} />
          <VideoRow videos={plan.videos} />
          <div>
            <h2 className="text-[16px] font-bold">Experience</h2>
            <p className="mt-2 text-[14px] text-neutral-600">{plan.experience}</p>
          </div>
          <ol className="space-y-3">
            {plan.stops.map((s) => (
              <li key={s.day + s.place} className="flex gap-3 rounded-2xl bg-neutral-50 p-3">
                <img src={s.img} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <div>
                  <p className="text-[11px] text-neutral-400">Day {s.day}</p>
                  <p className="font-bold">{s.place}</p>
                  <p className="text-[12px] text-neutral-500">{s.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <aside className="h-fit rounded-3xl border p-6 shadow-lg lg:sticky lg:top-24" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
          <PriceBlock price={plan.priceFrom} />
          <p className="mt-2 text-[12px] text-neutral-500">{plan.days} days · Northnest fulfills</p>
          <button
            onClick={() =>
              setDraft({
                kind: "creator-plan",
                title: plan.title,
                detail: `Creator @${handle}`,
                unitPrice: plan.priceFrom,
                sourceId: plan.id,
                publisherId: plan.creatorId,
              })
            }
            className="mt-5 w-full rounded-full py-3 text-[15px] font-bold text-white"
            style={{ background: RED }}
          >
            Book this plan
          </button>
          <button
            onClick={() => {
              PLACE_CLIPS.slice(0, plan.days).forEach((c) => addToCart(c.id));
              toast.success("Added to itinerary builder");
            }}
            className="mt-3 w-full rounded-full border py-2.5 text-[13px] font-semibold"
          >
            Add to builder
          </button>
          <Link to="/builder" className="mt-3 block text-center text-[13px] font-semibold" style={{ color: GREEN }}>
            Open builder →
          </Link>
        </aside>
      </div>
      <BookingDialog draft={draft} onClose={() => setDraft(null)} />
    </SiteShell>
  );
}
