import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Eye, EyeOff, MapPin, Shield } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { useDemoUser } from "@/components/site/useDemoUser";
import {
  ActionBtn,
  BookingsManager,
  CmsDrawer,
  CmsEmpty,
  CmsSection,
  DashTabs,
  EnquiriesInbox,
  Field,
  HistoryTimeline,
  InventoryTable,
  OverviewStats,
  StatusPill,
  ToggleRow,
  fieldClass,
  type DashTabId,
} from "@/components/site/CmsKit";
import type { FreelancePlan } from "@/data/demoUniverse";
import {
  PLACE_CLIPS,
  appendActivity,
  deleteFreelancePlan,
  fetchFreelancePlans,
  formatINR,
  getDashSettings,
  getEchoSosEnabled,
  getPlannerSettings,
  listActivity,
  listBookings,
  listCommissions,
  listEnquiries,
  markEnquiryRead,
  replyToEnquiry,
  setBookingStatus,
  setEchoSosEnabled,
  setEnquiryStatus,
  setFreelancePlanPublished,
  subscribeDemoStore,
  updateBookingNotes,
  updateDashSettings,
  updatePlannerSettings,
  updateProfile,
  upsertFreelancePlan,
  type ActivityEvent,
  type Booking,
  type CommissionEntry,
  type DashSettings,
  type Enquiry,
  type PlannerSettings,
} from "@/lib/demoApi";
import { GREEN, RED } from "@/lib/brand";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/planner")({
  head: () => ({ meta: [{ title: "Planner Dashboard · NORTHNEST" }] }),
  component: PlannerDashboard,
});

type PlanForm = {
  id?: string;
  title: string;
  days: number;
  priceFrom: number;
  netProfit: number;
  cover: string;
  photos: string;
  published: boolean;
  pipelineStage: NonNullable<FreelancePlan["pipelineStage"]>;
  dayPlan: string;
};

function PlannerDashboard() {
  const user = useDemoUser();
  const [tab, setTab] = useState<DashTabId>("overview");
  const [plans, setPlans] = useState<FreelancePlan[]>([]);
  const [comms, setComms] = useState<CommissionEntry[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [history, setHistory] = useState<ActivityEvent[]>([]);
  const [settings, setSettings] = useState<PlannerSettings | null>(null);
  const [dashSettings, setDashSettings] = useState<DashSettings | null>(null);
  const [sos, setSos] = useState(true);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [hoursLeft, setHoursLeft] = useState(46);
  const [form, setForm] = useState<PlanForm | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  const refresh = () => {
    if (!user) return;
    fetchFreelancePlans(user.id).then(setPlans);
    setComms(listCommissions(user.id));
    setBookings(listBookings().filter((b) => b.kind === "freelance" || b.publisherId === user.id));
    setEnquiries(listEnquiries({ toUserId: user.id }));
    setHistory(listActivity({ actorId: user.id }));
    setSettings(getPlannerSettings(user.id, user.subdomain ?? "nestcraft"));
    setDashSettings(getDashSettings(user.id));
    setSos(getEchoSosEnabled(user.id));
    setName(user.name);
    setBio(user.bio ?? "");
    setAvatar(user.avatar);
  };

  useEffect(() => {
    refresh();
    return subscribeDemoStore(refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    const t = setInterval(() => setHoursLeft((h) => Math.max(0, h - 0.01)), 36000);
    return () => clearInterval(t);
  }, []);

  if (!user) {
    return (
      <SiteShell>
        <PageHero eyebrow="Planner" title="Sign in as a freelance planner" sub="" />
        <Link to="/demo-login" style={{ color: RED }} className="font-semibold">
          Demo login →
        </Link>
      </SiteShell>
    );
  }

  const subdomain = settings?.subdomain ?? user.subdomain ?? "nestcraft";
  const totalShare =
    plans.reduce((s, p) => s + Math.round(p.netProfit * 0.6), 0) +
    comms.reduce((s, c) => s + c.amount, 0);

  const savePlan = () => {
    if (!form?.title.trim()) return toast.error("Title required");
    const photos = form.photos.split("\n").map((s) => s.trim()).filter(Boolean);
    const stops = form.dayPlan.split("\n").map((line, i) => {
      const parts = line.split("|").map((s) => s.trim());
      return {
        day: i + 1,
        place: parts[0] || `Stop ${i + 1}`,
        note: parts[1] || "Experience",
        vendorMasked: parts[2] || `Partner ${i + 1}`,
        vendorReal: parts[3] || `Real vendor ${i + 1}`,
      };
    });
    upsertFreelancePlan({
      id: form.id,
      plannerId: user.id,
      title: form.title.trim(),
      days: form.days,
      priceFrom: form.priceFrom,
      netProfit: form.netProfit,
      cover: form.cover,
      photos: photos.length ? photos : [form.cover],
      published: form.published,
      pipelineStage: form.pipelineStage,
      stops,
    });
    appendActivity({
      actorId: user.id,
      actorName: user.name,
      role: "planner",
      action: form.id ? "edit" : "create",
      summary: `${form.id ? "Updated" : "Created"} plan · ${form.title.trim()}`,
    });
    toast.success(form.id ? "Plan updated" : "Plan created");
    setForm(null);
    refresh();
  };

  return (
    <SiteShell>
      <PageHero
        eyebrow="Planner control panel"
        title={user.name}
        sub="Plans CMS · bookings · enquiries · profit ledger · subdomain / vendor-mask / Echo SOS toggles."
      />

      <DashTabs active={tab} onChange={setTab} />

      {tab === "overview" && (
        <div className="space-y-6">
          <OverviewStats
            items={[
              { label: "Plans", value: plans.length },
              { label: "60% share", value: formatINR(totalShare), tone: "green" },
              { label: "Client bookings", value: bookings.length },
              { label: "Open enquiries", value: enquiries.filter((e) => e.status === "open").length },
            ]}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.07)", background: "linear-gradient(135deg,#fff,#f0fdf4)" }}>
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase" style={{ color: GREEN }}>
                <Shield size={14} /> Echo SOS
              </p>
              <p className="mt-2 text-[14px] font-bold">{sos ? "Standing access ON" : "Demo toggle OFF"}</p>
              <ToggleRow
                label="Echo SOS"
                sub="Safety is never gated by vendor mask"
                checked={sos}
                onChange={(e) => {
                  setEchoSosEnabled(user.id, e);
                  setSos(e);
                  appendActivity({
                    actorId: user.id,
                    actorName: user.name,
                    role: "planner",
                    action: "settings",
                    summary: e ? "Echo SOS enabled" : "Echo SOS demo off",
                  });
                  toast.success(e ? "Echo SOS ON" : "Echo SOS OFF");
                }}
              />
            </div>
            <div className="rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase text-amber-700">
                <AlertTriangle size={14} /> Liquidated damages
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">
                Demo copy framed under Indian Contract Act s.74 — reasonable compensation for breach.
              </p>
              <Link
                to="/planner/$subdomain"
                params={{ subdomain }}
                className="mt-3 inline-block text-[13px] font-bold"
                style={{ color: RED }}
              >
                {subdomain}.northnest.demo →
              </Link>
            </div>
          </div>
        </div>
      )}

      {tab === "cms" && (
        <div className="space-y-6">
          <CmsSection
            title="Plans / packages CMS"
            sub="Add · Edit · Delete · Publish On/Off"
            action={
              <ActionBtn
                variant="primary"
                onClick={() =>
                  setForm({
                    title: "",
                    days: 5,
                    priceFrom: 28000,
                    netProfit: 12000,
                    cover: PLACE_CLIPS[1].poster,
                    photos: PLACE_CLIPS.slice(1, 4).map((c) => c.poster).join("\n"),
                    published: true,
                    pipelineStage: "lead",
                    dayPlan: "Shillong | Arrival | Lodge A | Pine Crest\nDawki | Boats | Trail desk | Crystal Guides",
                  })
                }
              >
                Add plan
              </ActionBtn>
            }
          >
            {plans.length === 0 ? (
              <CmsEmpty label="No plans yet." cta="Add first plan" onClick={() => setForm({
                title: "",
                days: 5,
                priceFrom: 28000,
                netProfit: 12000,
                cover: PLACE_CLIPS[1].poster,
                photos: PLACE_CLIPS[1].poster,
                published: false,
                pipelineStage: "lead",
                dayPlan: "Place | Note | Masked | Real",
              })} />
            ) : (
              <InventoryTable
                headers={["Plan", "Pipeline", "Status", "Your 60%", "Actions"]}
                rows={plans.map((p) => [
                  <div key="t">
                    <p className="font-bold">{p.title}</p>
                    <p className="text-[11px] text-neutral-400">
                      {p.days}D · from {formatINR(p.priceFrom)}
                    </p>
                  </div>,
                  <StatusPill key="p" tone="amber">{p.pipelineStage ?? "lead"}</StatusPill>,
                  <StatusPill key="s" tone={p.published !== false ? "green" : "gray"}>
                    {p.published !== false ? "published" : "draft"}
                  </StatusPill>,
                  formatINR(Math.round(p.netProfit * 0.6)),
                  <div key="a" className="flex flex-wrap gap-1">
                    <ActionBtn
                      onClick={() =>
                        setForm({
                          id: p.id,
                          title: p.title,
                          days: p.days,
                          priceFrom: p.priceFrom,
                          netProfit: p.netProfit,
                          cover: p.cover,
                          photos: p.photos.join("\n"),
                          published: p.published !== false,
                          pipelineStage: p.pipelineStage ?? "lead",
                          dayPlan: p.stops
                            .map((s) => `${s.place} | ${s.note} | ${s.vendorMasked} | ${s.vendorReal}`)
                            .join("\n"),
                        })
                      }
                    >
                      Edit
                    </ActionBtn>
                    <ActionBtn
                      onClick={() => {
                        const next = p.published === false;
                        setFreelancePlanPublished(p.id, next);
                        appendActivity({
                          actorId: user.id,
                          actorName: user.name,
                          role: "planner",
                          action: next ? "publish" : "unlist",
                          summary: `${next ? "Published" : "Unpublished"} · ${p.title}`,
                        });
                        toast.success(next ? "Published" : "Unpublished");
                        refresh();
                      }}
                    >
                      {p.published === false ? "Publish ON" : "Publish OFF"}
                    </ActionBtn>
                    <ActionBtn
                      variant="danger"
                      onClick={() => {
                        deleteFreelancePlan(p.id);
                        toast.success("Deleted");
                        refresh();
                      }}
                    >
                      Delete
                    </ActionBtn>
                  </div>,
                ])}
              />
            )}
          </CmsSection>

          <CmsSection title="Vendor mask reveal" sub={`Demo timer: ~${hoursLeft.toFixed(0)}h remaining`}>
            <div className="space-y-3">
              {plans.slice(0, 4).map((p) => (
                <div key={p.id} className="rounded-2xl bg-neutral-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{p.title}</p>
                    <button
                      type="button"
                      onClick={() => setRevealed((r) => ({ ...r, [p.id]: !r[p.id] }))}
                      className="flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold"
                    >
                      {revealed[p.id] || hoursLeft < 24 ? (
                        <><Eye size={12} /> Revealed</>
                      ) : (
                        <><EyeOff size={12} /> Masked</>
                      )}
                    </button>
                  </div>
                  <ul className="mt-2 space-y-1 text-[12px] text-neutral-600">
                    {p.stops.map((s) => (
                      <li key={s.place + s.day} className="flex items-center gap-2">
                        <MapPin size={11} /> Day {s.day} {s.place}:{" "}
                        <strong>
                          {revealed[p.id] || hoursLeft < p.vendorsMaskedUntilHours / 2
                            ? s.vendorReal
                            : s.vendorMasked}
                        </strong>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CmsSection>
        </div>
      )}

      {tab === "bookings" && (
        <CmsSection title="Client bookings" sub="Status filters · notes · pipeline">
          <BookingsManager
            bookings={bookings}
            onStatus={async (id, status) => {
              await setBookingStatus(id, status);
              toast.success(`Status → ${status}`);
              refresh();
            }}
            onNotes={(id, notes) => {
              updateBookingNotes(id, notes);
              toast.success("Notes saved");
              refresh();
            }}
          />
          <ul className="mt-4 space-y-2">
            {plans.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-2xl bg-neutral-50 px-3 py-2 text-[13px]">
                <span className="font-semibold">{p.title}</span>
                <select
                  className="rounded-lg border px-2 py-1 text-[12px]"
                  value={p.pipelineStage ?? "lead"}
                  onChange={(e) => {
                    upsertFreelancePlan({
                      ...p,
                      pipelineStage: e.target.value as FreelancePlan["pipelineStage"],
                    });
                    refresh();
                  }}
                >
                  <option value="lead">lead</option>
                  <option value="proposal">proposal</option>
                  <option value="booked">booked</option>
                  <option value="completed">completed</option>
                </select>
              </li>
            ))}
          </ul>
        </CmsSection>
      )}

      {tab === "enquiries" && (
        <CmsSection title="Client enquiry inbox">
          <EnquiriesInbox
            items={enquiries}
            onMarkRead={(id) => { markEnquiryRead(id); refresh(); }}
            onReply={(id, reply) => {
              replyToEnquiry(id, reply, { id: user.id, name: user.name });
              toast.success("Reply sent");
              refresh();
            }}
            onStatus={(id, status) => { setEnquiryStatus(id, status); refresh(); }}
          />
        </CmsSection>
      )}

      {tab === "history" && (
        <div className="space-y-6">
          <CmsSection title="Profit share ledger">
            <ul className="space-y-2">
              {comms.map((c) => (
                <li key={c.id} className="flex justify-between text-[13px]">
                  <span>{c.title}</span>
                  <span className="font-bold" style={{ color: GREEN }}>{formatINR(c.amount)}</span>
                </li>
              ))}
              {comms.length === 0 && <li className="text-[13px] text-neutral-400">No payouts yet</li>}
            </ul>
          </CmsSection>
          <CmsSection title="Activity history">
            <HistoryTimeline items={history} />
          </CmsSection>
        </div>
      )}

      {tab === "settings" && settings && dashSettings && (
        <CmsSection title="Subdomain, vendor-mask & profile">
          <div className="mb-4 space-y-2">
            <ToggleRow
              label="Subdomain public"
              sub={`${settings.subdomain}.northnest.demo visible in marketplace`}
              checked={dashSettings.subdomainPublic !== false}
              onChange={(v) => {
                setDashSettings(updateDashSettings(user.id, { subdomainPublic: v }, { name: user.name, role: "planner" }));
                toast.success(v ? "Subdomain public ON" : "OFF");
              }}
            />
            <ToggleRow
              label="Vendor mask"
              sub="Mask real vendors until reveal window"
              checked={dashSettings.vendorMask !== false}
              onChange={(v) => {
                setDashSettings(updateDashSettings(user.id, { vendorMask: v }, { name: user.name, role: "planner" }));
                toast.success(v ? "Vendor mask ON" : "OFF");
              }}
            />
            <ToggleRow
              label="Accept bookings"
              checked={dashSettings.acceptBookings}
              onChange={(v) => {
                setDashSettings(updateDashSettings(user.id, { acceptBookings: v }, { name: user.name, role: "planner" }));
                toast.success(v ? "Accept bookings ON" : "OFF");
              }}
            />
            <ToggleRow
              label="Notifications"
              checked={dashSettings.notifications}
              onChange={(v) => {
                setDashSettings(updateDashSettings(user.id, { notifications: v }, { name: user.name, role: "planner" }));
                toast.success(v ? "Notifications ON" : "OFF");
              }}
            />
            <ToggleRow
              label="Echo SOS"
              checked={sos}
              onChange={(v) => {
                setEchoSosEnabled(user.id, v);
                setSos(v);
                toast.success(v ? "Echo SOS ON" : "OFF");
              }}
            />
          </div>
          <Field label="Subdomain">
            <input
              className={fieldClass}
              value={settings.subdomain}
              onChange={(e) => setSettings({ ...settings, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
            />
          </Field>
          <p className="text-[12px] text-neutral-500">{settings.subdomain}.northnest.demo</p>
          <Field label="Brand name">
            <input className={fieldClass} value={settings.brandName} onChange={(e) => setSettings({ ...settings, brandName: e.target.value })} />
          </Field>
          <Field label="Accent note">
            <input className={fieldClass} value={settings.accentNote} onChange={(e) => setSettings({ ...settings, accentNote: e.target.value })} />
          </Field>
          <Field label="Name"><input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Bio"><textarea className={fieldClass} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} /></Field>
          <Field label="Avatar URL"><input className={fieldClass} value={avatar} onChange={(e) => setAvatar(e.target.value)} /></Field>
          <ActionBtn
            variant="primary"
            onClick={() => {
              updatePlannerSettings(user.id, settings);
              updateProfile(user.id, { name, bio, avatar });
              toast.success("Settings saved");
              refresh();
            }}
          >
            Save settings
          </ActionBtn>
        </CmsSection>
      )}

      <CmsDrawer open={!!form} title={form?.id ? "Edit plan" : "Add plan"} onClose={() => setForm(null)} footer={<ActionBtn variant="primary" onClick={savePlan}>Save plan</ActionBtn>}>
        {form && (
          <>
            <Field label="Title"><input className={fieldClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Days"><input type="number" className={fieldClass} value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })} /></Field>
              <Field label="Price"><input type="number" className={fieldClass} value={form.priceFrom} onChange={(e) => setForm({ ...form, priceFrom: Number(e.target.value) })} /></Field>
              <Field label="Net profit"><input type="number" className={fieldClass} value={form.netProfit} onChange={(e) => setForm({ ...form, netProfit: Number(e.target.value) })} /></Field>
            </div>
            <Field label="Cover URL"><input className={fieldClass} value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} /></Field>
            <Field label="Photos (one per line)"><textarea className={fieldClass} rows={2} value={form.photos} onChange={(e) => setForm({ ...form, photos: e.target.value })} /></Field>
            <Field label="Day plan (Place | Note | Masked | Real)">
              <textarea className={fieldClass} rows={4} value={form.dayPlan} onChange={(e) => setForm({ ...form, dayPlan: e.target.value })} />
            </Field>
            <Field label="Pipeline">
              <select className={fieldClass} value={form.pipelineStage} onChange={(e) => setForm({ ...form, pipelineStage: e.target.value as PlanForm["pipelineStage"] })}>
                <option value="lead">lead</option>
                <option value="proposal">proposal</option>
                <option value="booked">booked</option>
                <option value="completed">completed</option>
              </select>
            </Field>
            <ToggleRow label="Publish On/Off" checked={form.published} onChange={(v) => setForm({ ...form, published: v })} />
          </>
        )}
      </CmsDrawer>
    </SiteShell>
  );
}
