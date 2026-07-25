import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { useDemoUser } from "@/components/site/useDemoUser";
import type { HostHome, HostTrip48h } from "@/data/demoUniverse";
import { fetchHostHomes, fetchHostTrips, formatINR } from "@/lib/demoApi";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";

export const Route = createFileRoute("/dashboard/host")({
  head: () => ({ meta: [{ title: "Host Dashboard · NORTHNEST" }] }),
  component: HostDashboard,
});

function HostDashboard() {
  const user = useDemoUser();
  const [homes, setHomes] = useState<HostHome[]>([]);
  const [trips, setTrips] = useState<HostTrip48h[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchHostHomes(user.id).then(setHomes);
    fetchHostTrips(user.id).then(setTrips);
  }, [user]);

  if (!user) {
    return (
      <SiteShell>
        <PageHero eyebrow="Host" title="Sign in as a homestay host" sub="" />
        <Link to="/demo-login" style={{ color: RED }} className="font-semibold">
          Demo login →
        </Link>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageHero
        eyebrow="Homestay host"
        title={user.name}
        sub="List homes like Airbnb — no commission charged to host in this demo. Create 48-hour in-city itineraries with guest referral codes."
      />

      <div
        className="mb-8 rounded-3xl px-5 py-4 text-[13px] font-semibold"
        style={{ background: GREEN_LIGHT, color: GREEN }}
      >
        Zero host commission on NORTHNEST · Guests book 48h trips before their stay via your referral codes
      </div>

      <section>
        <h2 className="text-[17px] font-bold">Your listings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {homes.map((h) => (
            <Link
              key={h.id}
              to="/host/$slug"
              params={{ slug: h.slug }}
              className="overflow-hidden rounded-3xl border transition-shadow hover:shadow-xl"
              style={{ borderColor: "rgba(0,0,0,0.07)" }}
            >
              <img src={h.photos[0]} alt={h.name} className="h-40 w-full object-cover" />
              <div className="p-4">
                <p className="font-bold">{h.name}</p>
                <p className="text-[12px] text-neutral-500">{h.place}</p>
                <p className="mt-2 font-bold" style={{ color: RED }}>
                  {formatINR(h.pricePerNight)}
                  <span className="text-[11px] font-medium text-neutral-400"> / night</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[17px] font-bold">48-hour guest itineraries & referral codes</h2>
        <div className="mt-4 space-y-3">
          {trips.map((t) => (
            <div
              key={t.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border p-4"
              style={{ borderColor: "rgba(0,0,0,0.07)" }}
            >
              <img src={t.cover} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-bold">{t.title}</p>
                <p className="text-[12px] text-neutral-500">{t.description}</p>
                <p className="mt-1 font-mono text-[12px] font-bold" style={{ color: GREEN }}>
                  {t.referralCode}
                </p>
              </div>
              <p className="font-bold" style={{ color: RED }}>
                {formatINR(t.price)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {homes[0] && (
        <Link
          to="/host/$slug"
          params={{ slug: homes[0].slug }}
          className="mt-8 inline-block font-semibold"
          style={{ color: RED }}
        >
          Open public host profile (cabs · places · food · trips) →
        </Link>
      )}
    </SiteShell>
  );
}
