import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";
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
import type { CreatorPlan } from "@/data/demoUniverse";
import {
  PLACE_CLIPS,
  appendActivity,
  deleteCreatorPlan,
  fetchCreatorPlans,
  formatINR,
  getDashSettings,
  listActivity,
  listBookings,
  listCommissions,
  listEnquiries,
  markEnquiryRead,
  replyToEnquiry,
  setBookingStatus,
  setCreatorPlanPublished,
  setEnquiryStatus,
  subscribeDemoStore,
  updateBookingNotes,
  updateDashSettings,
  updateProfile,
  upsertCreatorPlan,
  type ActivityEvent,
  type Booking,
  type CommissionEntry,
  type DashSettings,
  type Enquiry,
} from "@/lib/demoApi";
import { GREEN, RED } from "@/lib/brand";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/creator")({
  head: () => ({ meta: [{ title: "Creator Dashboard · NORTHNEST" }] }),
  component: CreatorDashboard,
});

type PlanForm = {
  id?: string;
  title: string;
  experience: string;
  priceFrom: number;
  days: number;
  cover: string;
  photos: string;
  videos: string;
  dayPlan: string;
  published: boolean;
};

const blankForm = (): PlanForm => ({
  title: "",
  experience: "",
  priceFrom: 15000,
  days: 4,
  cover: PLACE_CLIPS[0].poster,
  photos: PLACE_CLIPS.slice(0, 3)
    .map((c) => c.poster)
    .join("\n"),
  videos: PLACE_CLIPS.slice(0, 2)
    .map((c) => c.videoUrl)
    .join("\n"),
  dayPlan: "Day 1: Arrive\nDay 2: Explore\nDay 3: Shoot\nDay 4: Wrap",
  published: true,
});

function CreatorDashboard() {
  const user = useDemoUser();
  const [tab, setTab] = useState<DashTabId>("overview");
  const [plans, setPlans] = useState<CreatorPlan[]>([]);
  const [comms, setComms] = useState<CommissionEntry[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [history, setHistory] = useState<ActivityEvent[]>([]);
  const [settings, setSettings] = useState<DashSettings | null>(null);
  const [form, setForm] = useState<PlanForm | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [cover, setCover] = useState("");

  const refresh = () => {
    if (!user) return;
    fetchCreatorPlans(user.id).then(setPlans);
    setComms(listCommissions(user.id));
    setBookings(listBookings({ publisherId: user.id }));
    setEnquiries(listEnquiries({ toUserId: user.id }));
    setHistory(listActivity({ actorId: user.id }));
    setSettings(getDashSettings(user.id));
    setName(user.name);
    setBio(user.bio ?? "");
    setAvatar(user.avatar);
    setCover(user.cover ?? PLACE_CLIPS[5]?.poster ?? PLACE_CLIPS[0].poster);
  };

  useEffect(() => {
    refresh();
    return subscribeDemoStore(refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) {
    return (
      <SiteShell>
        <PageHero eyebrow="Creator" title="Sign in as a verified creator" sub="" />
        <Link to="/demo-login" style={{ color: RED }} className="font-semibold">
          Demo login →
        </Link>
      </SiteShell>
    );
  }

  if (!user.verified) {
    return (
      <SiteShell>
        <PageHero
          eyebrow="Verification required"
          title="Claim your creator profile"
          sub="Verification is required before you can publish custom itineraries."
        />
      </SiteShell>
    );
  }

  const openEdit = (p?: CreatorPlan) => {
    if (!p) {
      setForm(blankForm());
      return;
    }
    setForm({
      id: p.id,
      title: p.title,
      experience: p.experience,
      priceFrom: p.priceFrom,
      days: p.days,
      cover: p.cover,
      photos: p.photos.join("\n"),
      videos: p.videos.join("\n"),
      dayPlan: p.stops.map((s) => `Day ${s.day}: ${s.place} — ${s.note}`).join("\n"),
      published: p.published !== false,
    });
  };

  const savePlan = () => {
    if (!form?.title.trim()) {
      toast.error("Title required");
      return;
    }
    const photoList = form.photos
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const videoList = form.videos
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const stops = form.dayPlan
      .split("\n")
      .map((line, i) => {
        const m = line.match(/Day\s*(\d+)\s*:\s*([^—\-]+)[—\-]?\s*(.*)/i);
        return {
          day: m ? Number(m[1]) : i + 1,
          place: (m?.[2] ?? line).trim() || `Stop ${i + 1}`,
          note: (m?.[3] ?? "").trim() || "Experience stop",
          img: photoList[i] ?? form.cover,
        };
      })
      .filter((s) => s.place);

    upsertCreatorPlan({
      id: form.id,
      creatorId: user.id,
      title: form.title.trim(),
      experience: form.experience,
      priceFrom: form.priceFrom,
      days: form.days,
      cover: form.cover || photoList[0],
      photos: photoList.length ? photoList : [form.cover],
      videos: videoList,
      stops: stops.length ? stops : undefined,
      published: form.published,
    });
    appendActivity({
      actorId: user.id,
      actorName: user.name,
      role: "creator",
      action: form.id ? "edit" : "create",
      summary: `${form.id ? "Updated" : "Created"} itinerary · ${form.title.trim()}`,
    });
    toast.success(form.id ? "Itinerary updated" : "Itinerary created");
    setForm(null);
    refresh();
  };

  return (
    <SiteShell>
      <PageHero
        eyebrow="Creator control panel"
        title={`${user.name} · verified`}
        sub="Full itinerary CMS, bookings, enquiries, commission history, and publish toggles."
      />
      <p className="mb-4 -mt-4 flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: GREEN }}>
        <BadgeCheck size={16} /> Verification badge active
      </p>

      <DashTabs active={tab} onChange={setTab} />

      {tab === "overview" && (
        <div className="space-y-6">
          <OverviewStats
            items={[
              { label: "Inventory", value: plans.length },
              {
                label: "Published",
                value: plans.filter((p) => p.published !== false).length,
                tone: "green",
              },
              { label: "Bookings", value: bookings.length },
              { label: "Open enquiries", value: enquiries.filter((e) => e.status === "open").length },
            ]}
          />
          <div className="flex flex-wrap gap-3">
            <ActionBtn variant="primary" onClick={() => { setTab("cms"); openEdit(); }}>
              Add itinerary
            </ActionBtn>
            <ActionBtn onClick={() => setTab("bookings")}>Customer bookings</ActionBtn>
            <ActionBtn onClick={() => setTab("enquiries")}>Enquiries</ActionBtn>
            {user.handle && (
              <Link
                to="/creator/$handle"
                params={{ handle: user.handle }}
                className="rounded-full border px-5 py-2 text-[13px] font-bold"
              >
                Public profile
              </Link>
            )}
          </div>
        </div>
      )}

      {tab === "cms" && (
        <CmsSection
          title="Itinerary inventory CMS"
          sub="Add / edit / delete · photo & video URLs · day plan · Publish On/Off"
          action={
            <ActionBtn variant="primary" onClick={() => openEdit()}>
              Add itinerary
            </ActionBtn>
          }
        >
          {plans.length === 0 ? (
            <CmsEmpty label="No itineraries yet." cta="Add first itinerary" onClick={() => openEdit()} />
          ) : (
            <InventoryTable
              headers={["Cover", "Title", "Status", "Likes", "Price", "Actions"]}
              rows={plans.map((p) => [
                <img key="img" src={p.cover} alt="" className="h-12 w-16 rounded-lg object-cover" />,
                <div key="t">
                  <p className="font-bold">{p.title}</p>
                  <p className="text-[11px] text-neutral-400">
                    {p.days}D · {p.publishCode ?? "no code"}
                  </p>
                </div>,
                <StatusPill key="s" tone={p.published !== false ? "green" : "gray"}>
                  {p.published !== false ? "published" : "draft"}
                </StatusPill>,
                String(p.likes),
                formatINR(p.priceFrom),
                <div key="a" className="flex flex-wrap gap-1">
                  <ActionBtn onClick={() => openEdit(p)}>Edit</ActionBtn>
                  <ActionBtn
                    onClick={() => {
                      const next = p.published === false;
                      setCreatorPlanPublished(p.id, next);
                      appendActivity({
                        actorId: user.id,
                        actorName: user.name,
                        role: "creator",
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
                      deleteCreatorPlan(p.id);
                      appendActivity({
                        actorId: user.id,
                        actorName: user.name,
                        role: "creator",
                        action: "delete",
                        summary: `Deleted itinerary · ${p.title}`,
                      });
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
      )}

      {tab === "bookings" && (
        <CmsSection title="Bookings of your itineraries" sub="Customers who booked your published plans">
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
        </CmsSection>
      )}

      {tab === "enquiries" && (
        <CmsSection title="Customer enquiries" sub="Inbox · mark read · reply · open/closed">
          <EnquiriesInbox
            items={enquiries}
            onMarkRead={(id) => {
              markEnquiryRead(id);
              refresh();
            }}
            onReply={(id, reply) => {
              replyToEnquiry(id, reply, { id: user.id, name: user.name });
              toast.success("Reply sent");
              refresh();
            }}
            onStatus={(id, status) => {
              setEnquiryStatus(id, status);
              refresh();
            }}
          />
        </CmsSection>
      )}

      {tab === "history" && (
        <div className="space-y-6">
          <CmsSection title="Commission history">
            <ul className="space-y-2">
              {comms.map((c) => (
                <li key={c.id} className="flex justify-between rounded-2xl bg-neutral-50 px-3 py-2 text-[13px]">
                  <span>{c.title}</span>
                  <span className="font-bold" style={{ color: GREEN }}>
                    +{formatINR(c.amount)}
                  </span>
                </li>
              ))}
              {comms.length === 0 && <li className="text-[13px] text-neutral-400">No commissions yet</li>}
            </ul>
          </CmsSection>
          <CmsSection title="Activity timeline">
            <HistoryTimeline items={history} />
          </CmsSection>
        </div>
      )}

      {tab === "settings" && settings && (
        <CmsSection title="Profile & toggles">
          <div className="mb-4 space-y-2">
            <ToggleRow
              label="Accept bookings"
              sub="Allow new customer bookings on published itineraries"
              checked={settings.acceptBookings}
              onChange={(v) => {
                setSettings(updateDashSettings(user.id, { acceptBookings: v }, { name: user.name, role: "creator" }));
                toast.success(v ? "Accept bookings ON" : "OFF");
              }}
            />
            <ToggleRow
              label="Notifications"
              checked={settings.notifications}
              onChange={(v) => {
                setSettings(updateDashSettings(user.id, { notifications: v }, { name: user.name, role: "creator" }));
                toast.success(v ? "Notifications ON" : "OFF");
              }}
            />
            <ToggleRow
              label="Public profile listed"
              checked={settings.publicProfile}
              onChange={(v) => {
                setSettings(updateDashSettings(user.id, { publicProfile: v }, { name: user.name, role: "creator" }));
                toast.success(v ? "Public profile ON" : "OFF");
              }}
            />
          </div>
          <Field label="Display name">
            <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Bio">
            <textarea className={fieldClass} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          </Field>
          <Field label="Avatar URL">
            <input className={fieldClass} value={avatar} onChange={(e) => setAvatar(e.target.value)} />
          </Field>
          <Field label="Cover URL">
            <input className={fieldClass} value={cover} onChange={(e) => setCover(e.target.value)} />
          </Field>
          <ActionBtn
            variant="primary"
            onClick={() => {
              updateProfile(user.id, { name, bio, avatar, cover });
              appendActivity({
                actorId: user.id,
                actorName: name,
                role: "creator",
                action: "edit",
                summary: "Updated creator profile",
              });
              toast.success("Profile saved");
              refresh();
            }}
          >
            Save profile
          </ActionBtn>
        </CmsSection>
      )}

      <CmsDrawer
        open={!!form}
        title={form?.id ? "Edit itinerary" : "Add itinerary"}
        onClose={() => setForm(null)}
        footer={
          <ActionBtn variant="primary" onClick={savePlan}>
            Save itinerary
          </ActionBtn>
        }
      >
        {form && (
          <>
            <Field label="Title">
              <input className={fieldClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Experience / description">
              <textarea className={fieldClass} rows={3} value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price from (₹)">
                <input
                  type="number"
                  className={fieldClass}
                  value={form.priceFrom}
                  onChange={(e) => setForm({ ...form, priceFrom: Number(e.target.value) })}
                />
              </Field>
              <Field label="Days">
                <input
                  type="number"
                  className={fieldClass}
                  value={form.days}
                  onChange={(e) => setForm({ ...form, days: Number(e.target.value) })}
                />
              </Field>
            </div>
            <Field label="Cover photo URL">
              <input className={fieldClass} value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} />
            </Field>
            <Field label="Photo URLs (one per line)">
              <textarea className={fieldClass} rows={3} value={form.photos} onChange={(e) => setForm({ ...form, photos: e.target.value })} />
            </Field>
            <Field label="Video URLs (one per line)">
              <textarea className={fieldClass} rows={2} value={form.videos} onChange={(e) => setForm({ ...form, videos: e.target.value })} />
            </Field>
            <Field label="Day plan (Day N: Place — note)">
              <textarea className={fieldClass} rows={4} value={form.dayPlan} onChange={(e) => setForm({ ...form, dayPlan: e.target.value })} />
            </Field>
            <ToggleRow
              label="Publish On/Off"
              sub="Show on public profile & packages"
              checked={form.published}
              onChange={(v) => setForm({ ...form, published: v })}
            />
          </>
        )}
      </CmsDrawer>
    </SiteShell>
  );
}
