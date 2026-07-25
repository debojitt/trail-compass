import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { useDemoUser } from "@/components/site/useDemoUser";
import type { CreatorPlan } from "@/data/demoUniverse";
import {
  PLACE_CLIPS,
  fetchCreatorPlans,
  formatINR,
  listCommissions,
  publishCreatorPlan,
  subscribeDemoStore,
  type CommissionEntry,
} from "@/lib/demoApi";
import { GREEN, RED } from "@/lib/brand";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/creator")({
  head: () => ({ meta: [{ title: "Creator Dashboard · NORTHNEST" }] }),
  component: CreatorDashboard,
});

function CreatorDashboard() {
  const user = useDemoUser();
  const [plans, setPlans] = useState<CreatorPlan[]>([]);
  const [comms, setComms] = useState<CommissionEntry[]>([]);
  const [title, setTitle] = useState("New creator circuit");
  const [experience, setExperience] = useState("Verified creator plan — Northnest fulfills.");
  const [price, setPrice] = useState(15000);
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    if (!user) return;
    fetchCreatorPlans(user.id).then(setPlans);
    setComms(listCommissions(user.id));
  };

  useEffect(() => {
    refresh();
    return subscribeDemoStore(refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) {
    return (
      <SiteShell>
        <PageHero eyebrow="Creator" title="Sign in as a verified creator" sub="" />
        <Link to="/demo-login" style={{ color: RED }} className="font-semibold">
          Demo login →
        </Link>
      </SiteShell>
    );
  }

  if (!user.verified) {
    return (
      <SiteShell>
        <PageHero
          eyebrow="Verification required"
          title="Claim your creator profile"
          sub="Verification is required before you can publish custom itineraries without completing travel."
        />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageHero
        eyebrow="Creator dashboard"
        title={`${user.name} · verified`}
        sub="Publish custom itineraries without completing travel. Earn commission when clients complete — Northnest handles fulfillment."
      />

      <div className="mb-6 flex flex-wrap gap-3">
        {user.handle && (
          <Link
            to="/creator/$handle"
            params={{ handle: user.handle }}
            className="rounded-full px-5 py-2.5 text-[13px] font-bold text-white"
            style={{ background: RED }}
          >
            View public Instagram-style profile
          </Link>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
          <h2 className="text-[17px] font-bold">Publish without traveling</h2>
          <p className="mt-1 text-[12px] text-neutral-500">
            Creators skip the COMPLETED booking gate. Customers can add to builder and book.
          </p>
          <div className="mt-4 space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-[13px]"
            />
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-[13px]"
              rows={2}
            />
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full rounded-xl border px-3 py-2 text-[13px]"
            />
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const { published } = await publishCreatorPlan({
                    title,
                    experience,
                    placeIds: PLACE_CLIPS.slice(0, 4).map((c) => c.id),
                    priceFrom: price,
                  });
                  toast.success(`Published ${published.code}`);
                  refresh();
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed");
                }
                setBusy(false);
              }}
              className="w-full rounded-full py-2.5 text-[13px] font-bold text-white"
              style={{ background: RED }}
            >
              Publish itinerary
            </button>
          </div>
        </section>

        <section className="rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
          <h2 className="text-[17px] font-bold">Commission dashboard</h2>
          <ul className="mt-4 space-y-2">
            {comms.map((c) => (
              <li key={c.id} className="flex justify-between rounded-2xl bg-neutral-50 px-3 py-2 text-[13px]">
                <span>{c.title}</span>
                <span className="font-bold" style={{ color: GREEN }}>
                  +{formatINR(c.amount)}
                </span>
              </li>
            ))}
            {comms.length === 0 && <li className="text-[13px] text-neutral-400">No commissions yet</li>}
          </ul>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="text-[17px] font-bold">Your itinerary grid</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {plans.map((p) => (
            <Link
              key={p.id}
              to="/creator/$handle/$planId"
              params={{ handle: user.handle ?? "meghatrails", planId: p.id }}
              className="group relative overflow-hidden rounded-2xl"
              style={{ aspectRatio: "1" }}
            >
              <img
                src={p.cover}
                alt={p.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <p className="absolute bottom-2 left-2 right-2 text-[12px] font-bold text-white">{p.title}</p>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
