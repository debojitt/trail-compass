import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Car, MapPin, Utensils } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { BookingDialog, type BookingDraft } from "@/components/site/BookingDialog";
import { PhotoStrip, RatingLikes, PriceBlock } from "@/components/site/DetailMedia";
import type { DemoAccount, HostHome, HostTrip48h } from "@/data/demoUniverse";
import { fetchHostBySlug, fetchHostTrips, formatINR } from "@/lib/demoApi";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";

export const Route = createFileRoute("/host/$slug")({
  head: ({ params }) => ({ meta: [{ title: `Host · ${params.slug} · NORTHNEST` }] }),
  component: HostProfilePage,
});

function HostProfilePage() {
  const { slug } = Route.useParams();
  const [data, setData] = useState<{ home: HostHome; host: DemoAccount } | null | undefined>(undefined);
  const [trips, setTrips] = useState<HostTrip48h[]>([]);
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  useEffect(() => {
    fetchHostBySlug(slug).then((d) => {
      setData(d ?? null);
      if (d) fetchHostTrips(d.host.id).then(setTrips);
    });
  }, [slug]);

  if (data === undefined) {
    return (
      <SiteShell>
        <div className="h-64 animate-pulse rounded-3xl bg-neutral-100" />
      </SiteShell>
    );
  }
  if (!data) {
    return (
      <SiteShell>
        <p className="font-bold">Host not found</p>
        <Link to="/stays" style={{ color: RED }}>
          Browse stays
        </Link>
      </SiteShell>
    );
  }

  const { home, host } = data;
  const places = [...new Set(trips.flatMap((t) => t.places))];
  const food = [...new Set(trips.flatMap((t) => t.food))];
  const cabs = [...new Set(trips.flatMap((t) => t.cabs))];

  return (
    <SiteShell>
      <div
        className="mb-4 inline-block rounded-full px-3 py-1 text-[11px] font-bold"
        style={{ background: GREEN_LIGHT, color: GREEN }}
      >
        No host commission on NORTHNEST
      </div>
      <div className="flex items-center gap-3">
        <img src={host.avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
        <div>
          <h1 className="text-[24px] font-bold tracking-tight">{home.name}</h1>
          <p className="text-[13px] text-neutral-500">
            Hosted by {host.name} · {home.place}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <RatingLikes rating={home.rating} reviews={home.reviews} />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          <PhotoStrip photos={home.photos} alt={home.name} />
          <p className="text-[14px] leading-relaxed text-neutral-600">{home.description}</p>

          <section>
            <h2 className="flex items-center gap-2 text-[16px] font-bold">
              <MapPin size={16} style={{ color: RED }} /> Places to visit
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {places.map((p) => (
                <span key={p} className="rounded-full bg-neutral-100 px-3 py-1 text-[12px] font-semibold">
                  {p}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-[16px] font-bold">
              <Utensils size={16} style={{ color: RED }} /> Food & restaurants
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {food.map((f) => (
                <span key={f} className="rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: GREEN_LIGHT, color: GREEN }}>
                  {f}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-[16px] font-bold">
              <Car size={16} style={{ color: RED }} /> Cabs
            </h2>
            <ul className="mt-3 space-y-1 text-[13px] text-neutral-600">
              {cabs.map((c) => (
                <li key={c}>· {c}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-bold">Bookable 48-hour in-city trips</h2>
            <p className="mt-1 text-[12px] text-neutral-500">
              Guests from this homestay can book within 48 hours before the trip using referral codes.
            </p>
            <div className="mt-4 space-y-3">
              {trips.map((t) => (
                <div key={t.id} className="flex gap-3 rounded-2xl border p-3" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                  <img src={t.cover} alt="" className="h-20 w-20 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-bold">{t.title}</p>
                    <p className="font-mono text-[11px] font-bold" style={{ color: GREEN }}>
                      {t.referralCode}
                    </p>
                    <p className="text-[12px] text-neutral-500">{t.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-bold" style={{ color: RED }}>
                        {formatINR(t.price)}
                      </span>
                      <button
                        onClick={() =>
                          setDraft({
                            kind: "host-trip",
                            title: t.title,
                            detail: `Referral ${t.referralCode} · 48h window`,
                            unitPrice: t.price,
                            perPerson: false,
                            sourceId: t.id,
                            publisherId: t.hostId,
                          })
                        }
                        className="rounded-full px-4 py-1.5 text-[12px] font-bold text-white"
                        style={{ background: RED }}
                      >
                        Book trip
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-3xl border p-6 shadow-lg lg:sticky lg:top-24" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
          <PriceBlock price={home.pricePerNight} suffix="/ night" />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {home.amenities.map((a) => (
              <span key={a} className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: GREEN_LIGHT, color: GREEN }}>
                {a}
              </span>
            ))}
          </div>
          <button
            onClick={() =>
              setDraft({
                kind: "stay",
                title: home.name,
                detail: home.place,
                unitPrice: home.pricePerNight,
                perPerson: false,
                sourceId: home.id,
              })
            }
            className="mt-5 w-full rounded-full py-3 text-[15px] font-bold text-white"
            style={{ background: RED }}
          >
            Book stay
          </button>
        </aside>
      </div>
      <BookingDialog draft={draft} onClose={() => setDraft(null)} />
    </SiteShell>
  );
}
