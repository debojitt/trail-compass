import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Bed, ShieldCheck, Star, Users } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { BookingDialog, type BookingDraft } from "@/components/site/BookingDialog";
import { formatINR, useStore } from "@/lib/store";
import { RED, GREEN, GREEN_LIGHT } from "@/lib/brand";

export const Route = createFileRoute("/stays/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Stay · NORTHNEST` },
      { name: "description", content: `Homestay ${params.id} on NORTHNEST` },
    ],
  }),
  loader: ({ params }) => ({ id: params.id }),
  component: StayDetail,
  notFoundComponent: () => (
    <SiteShell>
      <div className="py-20 text-center"><h1 className="text-xl font-bold">Stay not found</h1></div>
    </SiteShell>
  ),
});

function StayDetail() {
  const { id } = Route.useLoaderData();
  const stay = useStore((s) => s.stays.find((x) => x.id === id));
  const host = useStore((s) => s.accounts.find((a) => a.id === stay?.hostId));
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  if (!stay) throw notFound();

  return (
    <SiteShell>
      <p className="text-[12px] font-bold uppercase tracking-widest" style={{ color: RED }}>
        {stay.place}
      </p>
      <h1 className="mt-1 text-[28px] font-bold tracking-tight md:text-[36px]">{stay.name}</h1>
      <p className="mt-1 flex items-center gap-2 text-[12px] text-neutral-500">
        <Star size={12} fill={GREEN} color={GREEN} /> {stay.rating} · {stay.reviews} reviews · {stay.guests} guests · {stay.bedrooms} bedrooms
      </p>

      {/* Airbnb-style gallery */}
      <div className="mt-4 grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl">
        <img src={stay.gallery[0] ?? stay.img} alt="" className="col-span-2 row-span-2 h-full w-full object-cover" style={{ minHeight: 320 }} />
        {stay.gallery.slice(1, 5).map((g, i) => (
          <img key={i} src={g} alt="" className="h-full w-full object-cover" style={{ minHeight: 150 }} />
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div>
          {host && (
            <Link
              to="/hosts/$id"
              params={{ id: host.id }}
              className="flex items-center gap-3 rounded-2xl border p-4 hover:bg-neutral-50"
              style={{ borderColor: "rgba(0,0,0,0.08)" }}
            >
              <img src={host.avatar} className="h-12 w-12 rounded-full" alt="" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 text-[14px] font-bold">
                  Hosted by {host.name}
                  {host.verified && <ShieldCheck size={13} style={{ color: "#F59E0B" }} />}
                </p>
                <p className="text-[11px] text-neutral-500">Superhost · Zero commission model</p>
              </div>
              <span className="text-[11px] font-bold text-neutral-400">View →</span>
            </Link>
          )}

          <p className="mt-6 whitespace-pre-line text-[14px] leading-relaxed text-neutral-700">{stay.description}</p>
          <p className="mt-4 text-[13px] italic text-neutral-500">"{stay.hostNote}"</p>

          <div className="mt-8">
            <p className="text-[12px] font-bold uppercase tracking-widest text-neutral-400">What's included</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {stay.amenities.map((a) => (
                <div key={a} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-[13px]" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                  <Bed size={13} style={{ color: GREEN }} /> {a}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border bg-white p-5 shadow-sm" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
            <p className="text-[24px] font-bold tracking-tight" style={{ color: RED }}>
              {formatINR(stay.pricePerNight)}
              <span className="ml-1 text-[12px] font-medium text-neutral-400">/ night</span>
            </p>
            <button
              onClick={() =>
                setDraft({
                  kind: "stay",
                  title: stay.name,
                  detail: `${stay.place} · ${stay.guests} guests`,
                  unitPrice: stay.pricePerNight,
                  perPerson: false,
                })
              }
              className="mt-3 w-full rounded-full py-3 text-[14px] font-bold text-white"
              style={{ background: RED }}
            >
              Reserve
            </button>
            <p className="mt-3 text-center text-[11px] text-neutral-400">
              You won't be charged yet — demo flow only.
            </p>
            <div className="mt-4 rounded-2xl px-3 py-2 text-[11px]" style={{ background: GREEN_LIGHT, color: GREEN }}>
              <Users size={11} className="mr-1 inline" /> Ask host for their 48h city plan — exclusive to guests.
            </div>
          </div>
        </aside>
      </div>

      <BookingDialog draft={draft} onClose={() => setDraft(null)} />
    </SiteShell>
  );
}
