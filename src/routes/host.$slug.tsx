import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Car, MapPin, Utensils } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { BookingDialog, type BookingDraft } from "@/components/site/BookingDialog";
import { PhotoGallery, VideoRow, RatingLikes, PriceBlock } from "@/components/site/DetailMedia";
import { stays as catalogStays } from "@/data/catalog";
import type { DemoAccount, HostHome, HostTrip48h } from "@/data/demoUniverse";
import { SAMPLE_VIDEOS } from "@/data/demoUniverse";
import { fetchHostBySlug, fetchHostTrips, formatINR, listCityItems, subscribeDemoStore } from "@/lib/demoApi";
import type { HostCityItem } from "@/data/demoUniverse";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";

export const Route = createFileRoute("/host/$slug")({
  head: ({ params }) => ({ meta: [{ title: `Host · ${params.slug} · NORTHNEST` }] }),
  component: HostProfilePage,
});

function HostProfilePage() {
  const { slug } = Route.useParams();
  const [data, setData] = useState<{ home: HostHome; host: DemoAccount } | null | undefined>(undefined);
  const [trips, setTrips] = useState<HostTrip48h[]>([]);
  const [city, setCity] = useState<HostCityItem[]>([]);
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetchHostBySlug(slug).then((d) => {
        if (!alive) return;
        setData(d ?? null);
        if (d) {
          fetchHostTrips(d.host.id).then((t) => alive && setTrips(t));
          setCity(listCityItems(d.host.id));
        }
      });
    };
    load();
    const unsub = subscribeDemoStore(load);
    return () => {
      alive = false;
      unsub();
    };
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
  const cityPlaces = city.filter((c) => c.kind === "place");
  const cityFood = city.filter((c) => c.kind === "restaurant");
  const cityCabs = city.filter((c) => c.kind === "cab");
  const places = cityPlaces.length
    ? cityPlaces.map((c) => c.name)
    : [...new Set(trips.flatMap((t) => t.places))];
  const food = cityFood.length
    ? cityFood.map((c) => c.name)
    : [...new Set(trips.flatMap((t) => t.food))];
  const cabs = cityCabs.length
    ? cityCabs.map((c) => c.name)
    : [...new Set(trips.flatMap((t) => t.cabs))];
  const placeKey = home.place.split(",")[0]?.trim().toLowerCase() ?? "";
  const relatedStays = catalogStays
    .filter(
      (s) =>
        s.name.toLowerCase().includes(home.name.split(" ")[0]?.toLowerCase() ?? "") ||
        s.place.toLowerCase().includes(placeKey) ||
        (placeKey.includes("sohra") && s.stateSlug === "meghalaya") ||
        (placeKey.includes("ziro") && s.stateSlug === "arunachal-pradesh"),
    )
    .slice(0, 4);
  const marketplaceStays =
    relatedStays.length > 0 ? relatedStays : catalogStays.filter((s) => s.pricePerNight > 0).slice(0, 4);

  return (
    <SiteShell backFallback="/stays">
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

      <div className="mt-5">
        <PhotoGallery
          photos={
            home.photos.length >= 4
              ? home.photos
              : [
                  ...home.photos,
                  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200",
                  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200",
                  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200",
                ]
          }
          alt={home.name}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          <VideoRow videos={[SAMPLE_VIDEOS[0], SAMPLE_VIDEOS[2]]} />
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
                            hostId: t.hostId,
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

          <section>
            <h2 className="text-[16px] font-bold">Marketplace stays nearby</h2>
            <p className="mt-1 text-[12px] text-neutral-500">Open full stay detail pages with photos, videos and book CTAs.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {marketplaceStays.map((s) => (
                <Link
                  key={s.id}
                  to="/stays/$id"
                  params={{ id: s.id }}
                  className="flex gap-3 overflow-hidden rounded-2xl border transition-shadow hover:shadow-lg"
                  style={{ borderColor: "rgba(0,0,0,0.07)" }}
                >
                  <img src={s.img} alt="" className="h-20 w-20 shrink-0 object-cover" />
                  <div className="min-w-0 py-2 pr-2">
                    <p className="truncate text-[13px] font-bold">{s.name}</p>
                    <p className="truncate text-[11px] text-neutral-500">{s.place}</p>
                    <p className="mt-1 text-[13px] font-bold" style={{ color: RED }}>
                      {formatINR(s.pricePerNight)}
                      <span className="text-[10px] font-medium text-neutral-400"> / night</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <Link to="/stays" className="mt-3 inline-block text-[13px] font-semibold" style={{ color: RED }}>
              All marketplace stays →
            </Link>
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
                hostId: home.hostId,
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
