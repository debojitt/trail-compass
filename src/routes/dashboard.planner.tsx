import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Eye, EyeOff, MapPin, Shield } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { useDemoUser } from "@/components/site/useDemoUser";
import type { FreelancePlan } from "@/data/demoUniverse";
import { fetchFreelancePlans, formatINR, listCommissions, type CommissionEntry } from "@/lib/demoApi";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";

export const Route = createFileRoute("/dashboard/planner")({
  head: () => ({ meta: [{ title: "Planner Dashboard · NORTHNEST" }] }),
  component: PlannerDashboard,
});

function PlannerDashboard() {
  const user = useDemoUser();
  const [plans, setPlans] = useState<FreelancePlan[]>([]);
  const [comms, setComms] = useState<CommissionEntry[]>([]);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [hoursLeft, setHoursLeft] = useState(46);

  useEffect(() => {
    if (!user) return;
    fetchFreelancePlans(user.id).then(setPlans);
    setComms(listCommissions(user.id));
  }, [user]);

  useEffect(() => {
    const t = setInterval(() => setHoursLeft((h) => Math.max(0, h - 0.01)), 36000);
    return () => clearInterval(t);
  }, []);

  if (!user) {
    return (
      <SiteShell>
        <PageHero eyebrow="Planner" title="Sign in as a freelance planner" sub="" />
        <Link to="/demo-login" style={{ color: RED }} className="font-semibold">
          Demo login →
        </Link>
      </SiteShell>
    );
  }

  const subdomain = user.subdomain ?? "nestcraft";
  const totalShare = plans.reduce((s, p) => s + Math.round(p.netProfit * 0.6), 0);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Freelance planner"
        title={user.name}
        sub="Branded subdomain · 60% of net profit · Northnest runs 100% fulfillment. Vendors masked until near check-in — Echo SOS always live."
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          to="/planner/$subdomain"
          params={{ subdomain }}
          className="rounded-full px-5 py-2.5 text-[13px] font-bold text-white"
          style={{ background: RED }}
        >
          {subdomain}.northnest.demo
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
          <p className="text-[11px] font-semibold uppercase text-neutral-400">Your share (60%)</p>
          <p className="mt-1 text-[28px] font-bold" style={{ color: GREEN }}>
            {formatINR(totalShare)}
          </p>
          <p className="text-[12px] text-neutral-500">Demo net profit across plans</p>
        </div>
        <div
          className="rounded-3xl border p-5"
          style={{ borderColor: "rgba(0,0,0,0.07)", background: "linear-gradient(135deg,#fff,#f0fdf4)" }}
        >
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase" style={{ color: GREEN }}>
            <Shield size={14} /> Echo SOS
          </p>
          <p className="mt-2 text-[14px] font-bold">Standing access to live location</p>
          <p className="mt-1 text-[12px] text-neutral-500">
            Safety is never gated by vendor mask. Real-time location always available to Echo SOS.
          </p>
        </div>
        <div className="rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase text-amber-700">
            <AlertTriangle size={14} /> Liquidated damages
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">
            Demo copy framed under Indian Contract Act s.74 — reasonable compensation for breach, not
            blanket escrow seizure.
          </p>
        </div>
      </div>

      <section className="mt-8 rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
        <h2 className="text-[17px] font-bold">Vendor mask reveal timer</h2>
        <p className="mt-1 text-[12px] text-neutral-500">
          Identities stay masked until close to check-in. Demo timer: ~{hoursLeft.toFixed(0)}h remaining
          on active trip.
        </p>
        <div className="mt-4 space-y-3">
          {plans.slice(0, 4).map((p) => (
            <div key={p.id} className="rounded-2xl bg-neutral-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold">{p.title}</p>
                <button
                  onClick={() => setRevealed((r) => ({ ...r, [p.id]: !r[p.id] }))}
                  className="flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold"
                >
                  {revealed[p.id] || hoursLeft < 24 ? (
                    <>
                      <Eye size={12} /> Revealed
                    </>
                  ) : (
                    <>
                      <EyeOff size={12} /> Masked
                    </>
                  )}
                </button>
              </div>
              <ul className="mt-2 space-y-1 text-[12px] text-neutral-600">
                {p.stops.map((s) => (
                  <li key={s.place + s.day} className="flex items-center gap-2">
                    <MapPin size={11} /> Day {s.day} {s.place}:{" "}
                    <strong>
                      {revealed[p.id] || hoursLeft < p.vendorsMaskedUntilHours / 2
                        ? s.vendorReal
                        : s.vendorMasked}
                    </strong>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-[17px] font-bold">Plans & 60% share</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {plans.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-3xl border" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
              <img src={p.cover} alt="" className="h-36 w-full object-cover" />
              <div className="p-4">
                <p className="font-bold">{p.title}</p>
                <p className="text-[12px] text-neutral-500">
                  {p.days}D · from {formatINR(p.priceFrom)}
                </p>
                <p className="mt-2 text-[13px]" style={{ color: GREEN }}>
                  Your 60%: {formatINR(Math.round(p.netProfit * 0.6))} of {formatINR(p.netProfit)} net
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
        <h2 className="text-[17px] font-bold">Payouts</h2>
        <ul className="mt-3 space-y-2">
          {comms.map((c) => (
            <li key={c.id} className="flex justify-between text-[13px]">
              <span>{c.title}</span>
              <span className="font-bold" style={{ color: GREEN }}>
                {formatINR(c.amount)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </SiteShell>
  );
}
