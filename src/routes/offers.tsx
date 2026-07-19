import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BadgePercent, Check, Copy } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import type { Offer } from "@/data/catalog";
import { fetchOffers } from "@/lib/demoApi";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers · NORTHNEST" },
      { name: "description", content: "Current deals on Northeast India stays, flights and packages." },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchOffers().then((list) => {
      if (alive) setOffers(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* clipboard can be unavailable in some browsers; still show feedback */
    }
    setCopied(code);
    setTimeout(() => setCopied((c) => (c === code ? null : c)), 1600);
  };

  return (
    <SiteShell>
      <PageHero
        eyebrow="Offers"
        title="Deals worth flying for."
        sub="Copy a code and apply it at the demo checkout. Codes marked AUTO apply themselves."
      />

      {offers === null ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-3xl border bg-neutral-50"
              style={{ borderColor: "rgba(0,0,0,0.06)" }}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((o) => (
            <article
              key={o.id}
              className="flex flex-col rounded-3xl border bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{ borderColor: "rgba(0,0,0,0.07)" }}
            >
              <div className="flex items-center gap-2">
                <BadgePercent size={16} style={{ color: RED }} />
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: RED }}
                >
                  {o.tag}
                </span>
                <span className="ml-auto text-[10px] font-semibold text-neutral-400">
                  Ends {o.expires}
                </span>
              </div>
              <p className="mt-3 text-[17px] font-bold leading-snug tracking-tight">{o.title}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">{o.body}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-neutral-400">{o.terms}</p>
              <div className="mt-auto pt-4">
                <button
                  onClick={() => copy(o.code)}
                  className="flex w-full items-center justify-between rounded-2xl border border-dashed px-4 py-2.5 transition-colors hover:bg-neutral-50"
                  style={{ borderColor: GREEN, background: copied === o.code ? GREEN_LIGHT : "transparent" }}
                >
                  <span className="text-[13px] font-bold tracking-wider" style={{ color: GREEN }}>
                    {o.code}
                  </span>
                  {copied === o.code ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: GREEN }}>
                      <Check size={13} /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400">
                      <Copy size={13} /> Copy code
                    </span>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </SiteShell>
  );
}
