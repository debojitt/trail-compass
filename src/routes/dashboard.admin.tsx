import { useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { useDemoAuthReady, useDemoUser } from "@/components/site/useDemoUser";
import { openSignInDialog } from "@/components/site/SignInButton";
import {
  ActionBtn,
  CmsSection,
  DashLoading,
  DashSignInGate,
  DashTabs,
  EnquiriesInbox,
  HistoryTimeline,
  InventoryTable,
  OverviewStats,
  StatusPill,
  type DashTabId,
} from "@/components/site/CmsKit";
import { DEMO_ACCOUNTS, GROUP_INVITES } from "@/data/demoUniverse";
import {
  adminCmsSnapshot,
  dashboardPathFor,
  fetchPublishedItineraries,
  formatINR,
  isUserSuspended,
  listAllCreatorPlans,
  listAllFreelancePlans,
  listAllHostHomes,
  listDemoAccounts,
  listEnquiries,
  listPlatformActivity,
  markEnquiryRead,
  replyToEnquiry,
  setCreatorPlanPublished,
  setEnquiryStatus,
  setFreelancePlanPublished,
  setHostHomeListed,
  setUserSuspended,
  subscribeDemoStore,
  type ActivityEvent,
  type Enquiry,
} from "@/lib/demoApi";
import { GREEN, RED } from "@/lib/brand";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({ meta: [{ title: "Admin · NORTHNEST" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const user = useDemoUser();
  const ready = useDemoAuthReady();
  const navigate = useNavigate();
  const [tab, setTab] = useState<DashTabId>("overview");
  const [snap, setSnap] = useState(adminCmsSnapshot());
  const [published, setPublished] = useState<Awaited<ReturnType<typeof fetchPublishedItineraries>>>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [history, setHistory] = useState<ActivityEvent[]>([]);
  const [tick, setTick] = useState(0);

  const homes = listAllHostHomes();
  const plans = listAllCreatorPlans();
  const freelance = listAllFreelancePlans();
  const accounts = listDemoAccounts();

  const refresh = () => {
    setSnap(adminCmsSnapshot());
    fetchPublishedItineraries().then(setPublished);
    setEnquiries(listEnquiries());
    setHistory(listPlatformActivity());
    setTick((t) => t + 1);
  };

  useEffect(() => {
    refresh();
    return subscribeDemoStore(refresh);
  }, []);

  useEffect(() => {
    if (!ready || !user) return;
    if (user.type !== "admin") {
      void navigate({ href: dashboardPathFor(user.type) });
    }
  }, [ready, user, navigate]);

  void tick;

  if (!ready) {
    return (
      <SiteShell>
        <DashLoading />
      </SiteShell>
    );
  }

  if (!user) {
    return (
      <SiteShell>
        <DashSignInGate roleLabel="Admin" title="Sign in as ops admin" />
      </SiteShell>
    );
  }

  if (user.type !== "admin") {
    return (
      <SiteShell>
        <DashLoading />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageHero
        eyebrow="Ops admin control panel"
        title="Marketplace overview"
        sub="Users · listings · enquiries · platform history — counts update from live demo data."
        backFallback="/"
        backLabel="Home"
      />

      <DashTabs active={tab} onChange={setTab} />

      {tab === "overview" && (
        <div className="space-y-6">
          <OverviewStats
            items={[
              { label: "Accounts", value: accounts.length },
              { label: "Published codes", value: published.length, tone: "green" },
              { label: "Host homes", value: snap.hostHomes },
              { label: "Open enquiries", value: enquiries.filter((e) => e.status === "open").length },
            ]}
          />
          <div className="flex flex-wrap gap-3">
            <ActionBtn variant="primary" onClick={() => openSignInDialog()}>
              Switch accounts
            </ActionBtn>
            <ActionBtn onClick={refresh}>Refresh live counts</ActionBtn>
            <ActionBtn onClick={() => setTab("cms")}>Manage listings</ActionBtn>
            <ActionBtn onClick={() => setTab("enquiries")}>Enquiry queue</ActionBtn>
          </div>
        </div>
      )}

      {tab === "cms" && (
        <div className="space-y-6">
          <CmsSection title="Users" sub="Suspend / unsuspend demo accounts">
            <InventoryTable
              headers={["Name", "Type", "Email", "Status", "Actions"]}
              rows={DEMO_ACCOUNTS.map((a) => {
                const suspended = isUserSuspended(a.id);
                return [
                  a.name,
                  <StatusPill key="t" tone="gray">{a.type}</StatusPill>,
                  a.email,
                  <StatusPill key="s" tone={suspended ? "red" : "green"}>
                    {suspended ? "suspended" : "active"}
                  </StatusPill>,
                  <div key="a" className="flex flex-wrap gap-1">
                    <ActionBtn
                      variant={suspended ? "success" : "danger"}
                      onClick={() => {
                        setUserSuspended(a.id, !suspended, { id: "admin1", name: "Ops Admin" });
                        toast.success(suspended ? `Unsuspended ${a.name}` : `Suspended ${a.name}`);
                        refresh();
                      }}
                    >
                      {suspended ? "Unsuspend" : "Suspend"}
                    </ActionBtn>
                    <button
                      type="button"
                      onClick={() => openSignInDialog()}
                      className="self-center text-[12px] font-bold"
                      style={{ color: RED }}
                    >
                      Login →
                    </button>
                  </div>,
                ];
              })}
            />
          </CmsSection>

          <CmsSection title="Published itinerary codes">
            <InventoryTable
              headers={["Code", "Title", "Publisher", "Price", "Open"]}
              rows={published.slice(0, 20).map((p) => [
                <span key="c" className="font-mono font-bold">{p.code}</span>,
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

          <div className="grid gap-6 lg:grid-cols-2">
            <CmsSection title="Host listings · List On/Off">
              <InventoryTable
                headers={["Home", "Host", "Status", "Toggle"]}
                rows={homes.slice(0, 12).map((h) => [
                  h.name,
                  h.hostId,
                  <StatusPill key="s" tone={h.listed !== false ? "green" : "gray"}>
                    {h.listed !== false ? "listed" : "unlisted"}
                  </StatusPill>,
                  <ActionBtn
                    key="t"
                    onClick={() => {
                      setHostHomeListed(h.id, h.listed === false);
                      toast.success(h.listed === false ? "Listed" : "Unlisted");
                      refresh();
                    }}
                  >
                    {h.listed === false ? "Publish" : "Unlist"}
                  </ActionBtn>,
                ])}
              />
            </CmsSection>
            <CmsSection title="Creator + planner · Publish On/Off">
              <p className="mb-2 text-[12px] text-neutral-500">
                Creator plans: {plans.length} · Freelance: {freelance.length} · Crew: {GROUP_INVITES.length}
              </p>
              <InventoryTable
                headers={["Title", "Owner", "Status", "Toggle"]}
                rows={[
                  ...plans.slice(0, 6).map((p) => [
                    p.title,
                    p.creatorId,
                    <StatusPill key="s" tone={p.published !== false ? "green" : "gray"}>
                      {p.published !== false ? "published" : "draft"}
                    </StatusPill>,
                    <ActionBtn
                      key="t"
                      onClick={() => {
                        setCreatorPlanPublished(p.id, p.published === false);
                        toast.success(p.published === false ? "Published" : "Unpublished");
                        refresh();
                      }}
                    >
                      Toggle
                    </ActionBtn>,
                  ]),
                  ...freelance.slice(0, 6).map((p) => [
                    p.title,
                    p.plannerId,
                    <StatusPill key="s" tone={p.published !== false ? "green" : "gray"}>
                      {p.published !== false ? "published" : "draft"}
                    </StatusPill>,
                    <ActionBtn
                      key="t"
                      onClick={() => {
                        setFreelancePlanPublished(p.id, p.published === false);
                        toast.success(p.published === false ? "Published" : "Unpublished");
                        refresh();
                      }}
                    >
                      Toggle
                    </ActionBtn>,
                  ]),
                ]}
              />
            </CmsSection>
          </div>
        </div>
      )}

      {tab === "bookings" && (
        <CmsSection title="Platform bookings snapshot" sub="Counts from live localStorage ledger">
          <OverviewStats
            items={[
              { label: "Creator plans", value: snap.creatorPlans },
              { label: "Host homes", value: snap.hostHomes },
              { label: "Host trips", value: snap.hostTrips },
              { label: "Freelance plans", value: snap.freelancePlans },
            ]}
          />
          <p className="mt-4 text-[13px] text-neutral-500">
            Role dashboards own booking status changes. Admin monitors inventory counts here.
          </p>
        </CmsSection>
      )}

      {tab === "enquiries" && (
        <CmsSection title="All enquiries" sub="Cross-role inbox (read + reply + close)">
          <EnquiriesInbox
            items={enquiries}
            onMarkRead={(id) => { markEnquiryRead(id); refresh(); }}
            onReply={(id, reply) => {
              replyToEnquiry(id, reply, { id: "admin1", name: "Ops Admin" });
              toast.success("Reply sent");
              refresh();
            }}
            onStatus={(id, status) => { setEnquiryStatus(id, status); refresh(); }}
          />
        </CmsSection>
      )}

      {tab === "history" && (
        <CmsSection title="Platform history feed" sub="Login-independent activity across all roles">
          <HistoryTimeline items={history} />
        </CmsSection>
      )}

      {tab === "settings" && (
        <CmsSection title="Ops shortcuts">
          <div className="flex flex-wrap gap-3">
            <Link to="/packages" className="rounded-full border px-5 py-2 text-[13px] font-bold">Packages</Link>
            <Link to="/stays" className="rounded-full border px-5 py-2 text-[13px] font-bold">Stays</Link>
            <ActionBtn onClick={() => openSignInDialog()}>Switch account</ActionBtn>
            <ActionBtn variant="primary" onClick={refresh}>Refresh counts</ActionBtn>
          </div>
          <p className="mt-4 text-[13px] text-neutral-500" style={{ color: GREEN }}>
            Live snapshot · homes {snap.hostHomes} · creators {snap.creatorPlans} · freelance {snap.freelancePlans} · city {snap.cityItems}
          </p>
        </CmsSection>
      )}
    </SiteShell>
  );
}
