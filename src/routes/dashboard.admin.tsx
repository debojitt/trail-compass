import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import {
  ActionBtn,
  CmsSection,
  InventoryTable,
  StatusPill,
} from "@/components/site/CmsKit";
import { DEMO_ACCOUNTS, GROUP_INVITES, PUBLISHED_ITINERARIES } from "@/data/demoUniverse";
import {
  adminCmsSnapshot,
  fetchPublishedItineraries,
  formatINR,
  listAllCreatorPlans,
  listAllFreelancePlans,
  listAllHostHomes,
  listDemoAccounts,
  subscribeDemoStore,
} from "@/lib/demoApi";
import { GREEN, RED } from "@/lib/brand";

export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({ meta: [{ title: "Admin · NORTHNEST" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [snap, setSnap] = useState(adminCmsSnapshot());
  const [published, setPublished] = useState(PUBLISHED_ITINERARIES);
  const homes = listAllHostHomes();
  const plans = listAllCreatorPlans();
  const freelance = listAllFreelancePlans();
  const accounts = listDemoAccounts();

  const refresh = () => {
    setSnap(adminCmsSnapshot());
    fetchPublishedItineraries().then(setPublished);
  };

  useEffect(() => {
    refresh();
    return subscribeDemoStore(refresh);
  }, []);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Ops admin CMS"
        title="Marketplace overview"
        sub="Browse users, listings, and published codes. Live counts include CMS-created inventory."
      />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { l: "Accounts", v: accounts.length },
          { l: "Published codes", v: published.length },
          { l: "Host homes", v: snap.hostHomes },
          { l: "Creator plans", v: snap.creatorPlans },
        ].map((s) => (
          <div key={s.l} className="rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
            <p className="text-[11px] font-semibold uppercase text-neutral-400">{s.l}</p>
            <p className="mt-1 text-[28px] font-bold" style={{ color: GREEN }}>
              {s.v}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/demo-login" className="rounded-full px-5 py-2 text-[13px] font-bold text-white" style={{ background: RED }}>
          Switch accounts
        </Link>
        <Link to="/packages" className="rounded-full border px-5 py-2 text-[13px] font-bold">
          Packages
        </Link>
        <Link to="/stays" className="rounded-full border px-5 py-2 text-[13px] font-bold">
          Stays
        </Link>
        <ActionBtn onClick={refresh}>Refresh live counts</ActionBtn>
      </div>

      <div className="mt-8">
        <CmsSection title="Users" sub="All demo account types">
          <InventoryTable
            headers={["Name", "Type", "Email", "ID", "Open"]}
            rows={DEMO_ACCOUNTS.map((a) => [
              a.name,
              <StatusPill key="t" tone="gray">
                {a.type}
              </StatusPill>,
              a.email,
              a.id,
              <Link key="l" to="/demo-login" className="text-[12px] font-bold" style={{ color: RED }}>
                Login as →
              </Link>,
            ])}
          />
        </CmsSection>
      </div>

      <div className="mt-6">
        <CmsSection title="Published itinerary codes">
          <InventoryTable
            headers={["Code", "Title", "Publisher", "Price", "Open"]}
            rows={published.slice(0, 20).map((p) => [
              <span key="c" className="font-mono font-bold">
                {p.code}
              </span>,
              p.title,
              p.publisherName,
              formatINR(p.priceFrom),
              <Link
                key="o"
                to="/itinerary/$code"
                params={{ code: p.code }}
                className="text-[12px] font-bold"
                style={{ color: RED }}
              >
                View
              </Link>,
            ])}
          />
        </CmsSection>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <CmsSection title="Host listings">
          <InventoryTable
            headers={["Home", "Host", "Status", "Open"]}
            rows={homes.slice(0, 12).map((h) => [
              h.name,
              h.hostId,
              <StatusPill key="s" tone={h.listed !== false ? "green" : "gray"}>
                {h.listed !== false ? "listed" : "unlisted"}
              </StatusPill>,
              <Link key="l" to="/host/$slug" params={{ slug: h.slug }} className="text-[12px] font-bold" style={{ color: RED }}>
                Open
              </Link>,
            ])}
          />
        </CmsSection>
        <CmsSection title="Creator + planner inventory">
          <p className="mb-2 text-[12px] text-neutral-500">
            Creator plans: {plans.length} · Freelance: {freelance.length} · Crew invites: {GROUP_INVITES.length}
          </p>
          <InventoryTable
            headers={["Title", "Owner", "Status"]}
            rows={[
              ...plans.slice(0, 6).map((p) => [
                p.title,
                p.creatorId,
                <StatusPill key="s" tone={p.published !== false ? "green" : "gray"}>
                  {p.published !== false ? "published" : "draft"}
                </StatusPill>,
              ]),
              ...freelance.slice(0, 6).map((p) => [
                p.title,
                p.plannerId,
                <StatusPill key="s" tone={p.published !== false ? "green" : "gray"}>
                  {p.published !== false ? "published" : "draft"}
                </StatusPill>,
              ]),
            ]}
          />
        </CmsSection>
      </div>
    </SiteShell>
  );
}
