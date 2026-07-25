import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { useDemoUser } from "@/components/site/useDemoUser";
import {
  ActionBtn,
  CmsDrawer,
  CmsEmpty,
  CmsSection,
  Field,
  InventoryTable,
  StatusPill,
  fieldClass,
} from "@/components/site/CmsKit";
import type { CreatorPlan } from "@/data/demoUniverse";
import {
  PLACE_CLIPS,
  deleteCreatorPlan,
  fetchCreatorPlans,
  formatINR,
  listCommissions,
  setCreatorPlanPublished,
  subscribeDemoStore,
  updateProfile,
  upsertCreatorPlan,
  type CommissionEntry,
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
  const [plans, setPlans] = useState<CreatorPlan[]>([]);
  const [comms, setComms] = useState<CommissionEntry[]>([]);
  const [form, setForm] = useState<PlanForm | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [cover, setCover] = useState("");

  const refresh = () => {
    if (!user) return;
    fetchCreatorPlans(user.id).then(setPlans);
    setComms(listCommissions(user.id));
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
    toast.success(form.id ? "Itinerary updated" : "Itinerary created");
    setForm(null);
    refresh();
  };

  return (
    <SiteShell>
      <PageHero
        eyebrow="Creator CMS"
        title={`${user.name} · verified`}
        sub="Add, edit, publish, and unpublish itineraries. Inventory updates instantly on your public profile and /packages."
      />
      <p className="mb-6 -mt-4 flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: GREEN }}>
        <BadgeCheck size={16} /> Verification badge active
      </p>

      <div className="mb-6 flex flex-wrap gap-3">
        {user.handle && (
          <Link
            to="/creator/$handle"
            params={{ handle: user.handle }}
            className="rounded-full px-5 py-2.5 text-[13px] font-bold text-white"
            style={{ background: RED }}
          >
            Public profile preview
          </Link>
        )}
        <ActionBtn onClick={() => setProfileOpen(true)}>Edit profile</ActionBtn>
        <ActionBtn variant="primary" onClick={() => openEdit()}>
          Add itinerary
        </ActionBtn>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border p-4" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
          <p className="text-[11px] font-semibold uppercase text-neutral-400">Inventory</p>
          <p className="mt-1 text-[28px] font-bold">{plans.length}</p>
        </div>
        <div className="rounded-3xl border p-4" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
          <p className="text-[11px] font-semibold uppercase text-neutral-400">Published</p>
          <p className="mt-1 text-[28px] font-bold" style={{ color: GREEN }}>
            {plans.filter((p) => p.published !== false).length}
          </p>
        </div>
        <div className="rounded-3xl border p-4" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
          <p className="text-[11px] font-semibold uppercase text-neutral-400">Verification</p>
          <p className="mt-1 flex items-center gap-1 text-[16px] font-bold" style={{ color: GREEN }}>
            <BadgeCheck size={18} /> Verified badge
          </p>
        </div>
      </div>

      <CmsSection title="Itinerary inventory" sub="Table actions: Edit · Delete · Publish/Unpublish">
        {plans.length === 0 ? (
          <CmsEmpty label="No itineraries yet." cta="Add first itinerary" onClick={() => openEdit()} />
        ) : (
          <InventoryTable
            headers={["Cover", "Title", "Status", "Likes", "Rating", "Price", "Actions"]}
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
              String(p.rating),
              formatINR(p.priceFrom),
              <div key="a" className="flex flex-wrap gap-1">
                <ActionBtn onClick={() => openEdit(p)}>Edit</ActionBtn>
                <ActionBtn
                  onClick={() => {
                    setCreatorPlanPublished(p.id, p.published === false);
                    toast.success(p.published === false ? "Published" : "Unpublished");
                    refresh();
                  }}
                >
                  {p.published === false ? "Publish" : "Unpublish"}
                </ActionBtn>
                <ActionBtn
                  variant="danger"
                  onClick={() => {
                    deleteCreatorPlan(p.id);
                    toast.success("Deleted");
                    refresh();
                  }}
                >
                  Delete
                </ActionBtn>
                {user.handle && (
                  <Link
                    to="/creator/$handle/$planId"
                    params={{ handle: user.handle, planId: p.id }}
                    className="rounded-full border px-3 py-1.5 text-[11px] font-bold"
                  >
                    View
                  </Link>
                )}
              </div>,
            ])}
          />
        )}
      </CmsSection>

      <div className="mt-6">
        <CmsSection title="Commission earnings">
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
      </div>

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
            <label className="flex items-center gap-2 text-[13px] font-semibold">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              Publish to public profile & packages
            </label>
          </>
        )}
      </CmsDrawer>

      <CmsDrawer
        open={profileOpen}
        title="Edit creator profile"
        onClose={() => setProfileOpen(false)}
        footer={
          <ActionBtn
            variant="primary"
            onClick={() => {
              updateProfile(user.id, { name, bio, avatar, cover });
              toast.success("Profile saved");
              setProfileOpen(false);
              refresh();
            }}
          >
            Save profile
          </ActionBtn>
        }
      >
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
      </CmsDrawer>
    </SiteShell>
  );
}
