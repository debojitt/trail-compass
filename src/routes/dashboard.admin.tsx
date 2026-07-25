import { Link, createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { DEMO_ACCOUNTS, PUBLISHED_ITINERARIES, GROUP_INVITES, HOST_HOMES } from "@/data/demoUniverse";
import { RED, GREEN } from "@/lib/brand";

export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({ meta: [{ title: "Admin · NORTHNEST" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Ops admin"
        title="Fulfillment overview"
        sub="Demo admin view — accounts, published codes, group invites, and host listings."
      />
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { l: "Accounts", v: DEMO_ACCOUNTS.length },
          { l: "Published codes", v: PUBLISHED_ITINERARIES.length },
          { l: "Crew invites", v: GROUP_INVITES.length },
          { l: "Host homes", v: HOST_HOMES.length },
        ].map((s) => (
          <div key={s.l} className="rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
            <p className="text-[11px] font-semibold uppercase text-neutral-400">{s.l}</p>
            <p className="mt-1 text-[28px] font-bold" style={{ color: GREEN }}>
              {s.v}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/demo-login" className="rounded-full px-5 py-2 text-[13px] font-bold text-white" style={{ background: RED }}>
          Switch accounts
        </Link>
        <Link to="/packages" className="rounded-full border px-5 py-2 text-[13px] font-bold">
          Packages
        </Link>
      </div>
    </SiteShell>
  );
}
