import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Copy, MapPin, ShieldCheck, Star } from "lucide-react";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { formatINR, useStore } from "@/lib/store";
import { RED, GREEN, GREEN_LIGHT } from "@/lib/brand";

export const Route = createFileRoute("/hosts/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Host · NORTHNEST` },
      { name: "description", content: `Public host page ${params.id}` },
    ],
  }),
  loader: ({ params }) => ({ id: params.id }),
  component: HostPage,
  notFoundComponent: () => (
    <SiteShell>
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">Host not found</h1>
      </div>
    </SiteShell>
  ),
});

function HostPage() {
  const { id } = Route.useLoaderData();
  const host = useStore((s) => s.accounts.find((a) => a.id === id));
  const stays = useStore((s) => s.stays.filter((st) => st.hostId === id));
  const plans = useStore((s) => s.hostPlans.filter((p) => p.hostId === id));
  const [copied, setCopied] = useState<string | null>(null);

  if (!host) throw notFound();

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <SiteShell backFallback="/stays">
      <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="text-center md:text-left">
          <img src={host.avatar} className="mx-auto h-32 w-32 rounded-full object-cover md:mx-0" alt="" />
          <p className="mt-3 flex items-center justify-center gap-1 text-[18px] font-bold md:justify-start">
            {host.name}
            {host.verified && <ShieldCheck size={14} style={{ color: "#F59E0B" }} />}
          </p>
          <p className="text-[12px] text-neutral-500">@{host.handle}</p>
          <p className="mt-3 text-[13px] text-neutral-600">{host.bio}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-[12px] text-neutral-500 md:justify-start">
            <MapPin size={11} /> {host.city}
          </p>
          <div className="mt-4 rounded-2xl border p-3 text-left" style={{ borderColor: GREEN, background: GREEN_LIGHT }}>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: GREEN }}>Zero commission</p>
            <p className="mt-1 text-[12px] text-neutral-700">NORTHNEST charges hosts 0% on stays. Referral 48h plans earn a flat payout.</p>
          </div>
        </aside>

        <div>
          <section>
            <h2 className="text-[18px] font-bold tracking-tight">Listings</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {stays.map((s) => (
                <Link
                  key={s.id}
                  to="/stays/$id"
                  params={{ id: s.id }}
                  className="group overflow-hidden rounded-2xl border transition-shadow hover:shadow-xl"
                  style={{ borderColor: "rgba(0,0,0,0.08)" }}
                >
                  <img src={s.img} alt="" className="aspect-video w-full object-cover transition-transform group-hover:scale-105" />
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-[14px] font-bold">{s.name}</p>
                      <span className="flex items-center gap-0.5 text-[12px] font-bold"><Star size={11} fill={GREEN} color={GREEN} /> {s.rating}</span>
                    </div>
                    <p className="truncate text-[11px] text-neutral-500">{s.place}</p>
                    <p className="mt-2 text-[13px] font-bold" style={{ color: RED }}>{formatINR(s.pricePerNight)}<span className="text-[10px] font-medium text-neutral-500"> / night</span></p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-[18px] font-bold tracking-tight">48-hour city plans · booked in-stay</h2>
            <p className="text-[12px] text-neutral-500">Guests get exclusive access via the referral code — books get filled within 48 hours of arrival.</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {plans.map((p) => (
                <div key={p.id} className="overflow-hidden rounded-2xl border" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                  <img src={p.cover} alt="" className="aspect-video w-full object-cover" />
                  <div className="p-4">
                    <p className="text-[14px] font-bold">{p.title}</p>
                    <p className="text-[11px] text-neutral-500">{p.city} · {p.stops.length} stops</p>
                    <ul className="mt-3 grid grid-cols-2 gap-1 text-[11px] text-neutral-600">
                      {p.stops.slice(0, 4).map((st) => (
                        <li key={st}>▪︎ {st}</li>
                      ))}
                    </ul>
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        onClick={() => copy(p.referralCode)}
                        className="flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1.5 font-mono text-[11px] font-black text-white"
                      >
                        {p.referralCode}
                        <Copy size={11} />
                      </button>
                      <p className="text-[13px] font-bold" style={{ color: RED }}>{formatINR(p.totalPrice)}</p>
                    </div>
                    {copied === p.referralCode && (
                      <p className="mt-2 text-center text-[10px] font-bold" style={{ color: GREEN }}>Referral code copied!</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}
