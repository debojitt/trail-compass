import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Star, X } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { BookingDialog, type BookingDraft } from "@/components/site/BookingDialog";
import { formatINR, useStore } from "@/lib/store";
import { RED, GREEN, GREEN_LIGHT } from "@/lib/brand";

export const Route = createFileRoute("/packages/$id")({
  head: () => ({
    meta: [
      { title: "Package · NORTHNEST" },
      { name: "description", content: "Full package details on NORTHNEST" },
    ],
  }),
  loader: ({ params }) => ({ id: params.id }),
  component: PackageDetail,
  notFoundComponent: () => (
    <SiteShell>
      <div className="py-20 text-center"><h1 className="text-xl font-bold">Package not found</h1></div>
    </SiteShell>
  ),
});

function PackageDetail() {
  const { id } = Route.useLoaderData();
  const pkg = useStore((s) => s.packages.find((p) => p.id === id));
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  if (!pkg) throw notFound();

  return (
    <SiteShell>
      <p className="text-[12px] font-bold uppercase tracking-widest" style={{ color: RED }}>{pkg.days}</p>
      <h1 className="mt-1 text-[28px] font-bold tracking-tight md:text-[36px]">{pkg.title}</h1>
      <p className="mt-1 flex items-center gap-2 text-[12px] text-neutral-500">
        <Star size={12} fill={GREEN} color={GREEN} /> {pkg.rating} · {pkg.reviews} verified reviews
      </p>

      <div className="mt-4 grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl">
        <img src={pkg.gallery[0] ?? pkg.img} alt="" className="col-span-2 row-span-2 h-full w-full object-cover" style={{ minHeight: 320 }} />
        {pkg.gallery.slice(1, 5).map((g, i) => (
          <img key={i} src={g} alt="" className="h-full w-full object-cover" style={{ minHeight: 150 }} />
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div>
          <div className="flex flex-wrap gap-2">
            {pkg.perks.map((p) => (
              <span key={p} className="rounded-full px-3 py-1 text-[11px] font-bold" style={{ background: GREEN_LIGHT, color: GREEN }}>
                {p}
              </span>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-[12px] font-bold uppercase tracking-widest text-neutral-400">Highlights</p>
            <ul className="mt-2 space-y-1 text-[13px] text-neutral-700">
              {pkg.highlights.map((h) => (
                <li key={h} className="flex gap-2"><Check size={14} className="mt-0.5" style={{ color: GREEN }} /> {h}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <p className="text-[12px] font-bold uppercase tracking-widest text-neutral-400">Day-by-day itinerary</p>
            <ol className="mt-3 space-y-2">
              {pkg.itinerary.map((d, i) => (
                <li key={i} className="flex gap-3 rounded-2xl border p-3" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-bold text-white" style={{ background: RED }}>{i + 1}</span>
                  <span className="pt-1 text-[13px] text-neutral-700">{d}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-widest" style={{ color: GREEN }}>Includes</p>
              <ul className="mt-2 space-y-1 text-[13px]">
                {pkg.includes.map((h) => (
                  <li key={h} className="flex gap-2"><Check size={14} style={{ color: GREEN }} className="mt-0.5" /> {h}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-widest text-neutral-400">Excludes</p>
              <ul className="mt-2 space-y-1 text-[13px]">
                {pkg.excludes.map((h) => (
                  <li key={h} className="flex gap-2 text-neutral-500"><X size={14} className="mt-0.5" /> {h}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border bg-white p-5 shadow-sm" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
            <p className="text-[11px] text-neutral-400 line-through">{formatINR(pkg.oldPrice)}</p>
            <p className="text-[28px] font-bold tracking-tight" style={{ color: RED }}>
              {formatINR(pkg.price)}
              <span className="ml-1 text-[12px] font-medium text-neutral-400">/ person</span>
            </p>
            <button
              onClick={() =>
                setDraft({
                  kind: "package",
                  title: pkg.title,
                  detail: `${pkg.days} · permits + stays + transport`,
                  unitPrice: pkg.price,
                  perPerson: true,
                })
              }
              className="mt-3 w-full rounded-full py-3 text-[14px] font-bold text-white"
              style={{ background: RED }}
            >
              Reserve
            </button>
            <p className="mt-3 text-center text-[11px] text-neutral-400">
              All permits are filed for you at no extra charge.
            </p>
          </div>
        </aside>
      </div>

      <BookingDialog draft={draft} onClose={() => setDraft(null)} />
    </SiteShell>
  );
}
