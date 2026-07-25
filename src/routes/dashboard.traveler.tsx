import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { useDemoUser } from "@/components/site/useDemoUser";
import {
  ActionBtn,
  CmsDrawer,
  CmsEmpty,
  CmsSection,
  Field,
  StatusPill,
  fieldClass,
} from "@/components/site/CmsKit";
import {
  PLACE_CLIPS,
  completeBooking,
  createGroupInvite,
  deleteSavedItinerary,
  duplicateSavedItinerary,
  fetchGroupInvites,
  formatINR,
  getCart,
  getUser,
  listBookings,
  listCommissions,
  listSavedItineraries,
  publishItineraryFromBooking,
  setBookingStatus,
  subscribeDemoStore,
  updateProfile,
  updateSavedItinerary,
  type Booking,
  type CommissionEntry,
  type SavedItinerary,
} from "@/lib/demoApi";
import type { GroupInvite } from "@/data/demoUniverse";
import { GREEN, RED } from "@/lib/brand";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/traveler")({
  head: () => ({ meta: [{ title: "Traveler Dashboard · NORTHNEST" }] }),
  component: TravelerDashboard,
});

function TravelerDashboard() {
  const user = useDemoUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [saved, setSaved] = useState<SavedItinerary[]>([]);
  const [comms, setComms] = useState<CommissionEntry[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [edit, setEdit] = useState<SavedItinerary | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pubTitle, setPubTitle] = useState("");
  const [pubExp, setPubExp] = useState("");
  const [publishing, setPublishing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  const refresh = () => {
    const u = getUser();
    setBookings(listBookings(u ? { userId: u.id } : undefined));
    setSaved(listSavedItineraries());
    setCart(getCart());
    if (u) {
      setComms(listCommissions(u.id));
      setName(u.name);
      setBio(u.bio ?? "");
      setAvatar(u.avatar);
    }
    fetchGroupInvites().then((list) => {
      const uid = getUser()?.id;
      setInvites(uid ? list.filter((g) => g.plannerId === uid) : list.slice(0, 3));
    });
  };

  useEffect(() => {
    refresh();
    return subscribeDemoStore(refresh);
  }, []);

  const cartPlaces = useMemo(
    () => cart.map((id) => PLACE_CLIPS.find((c) => c.id === id)).filter(Boolean),
    [cart],
  );

  if (!user) {
    return (
      <SiteShell>
        <PageHero eyebrow="Traveler" title="Sign in to see your dashboard" sub="Use a demo traveler account." />
        <Link to="/demo-login" className="font-semibold" style={{ color: RED }}>
          Demo login →
        </Link>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageHero
        eyebrow="Traveler CMS"
        title={`Hey, ${user.name.split(" ")[0]}`}
        sub="Manage itineraries, bookings, crew invites, and profile — everything saves to this browser."
      />

      <div className="mb-8 flex flex-wrap gap-3">
        <Link to="/builder" className="rounded-full px-5 py-2.5 text-[13px] font-bold text-white" style={{ background: RED }}>
          Open Shorts builder
        </Link>
        <ActionBtn variant="ghost" onClick={() => setProfileOpen(true)}>
          Edit profile
        </ActionBtn>
        <Link to="/packages" className="rounded-full border px-5 py-2.5 text-[13px] font-bold" style={{ borderColor: "rgba(0,0,0,0.12)" }}>
          Browse published codes
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CmsSection
          title="My itineraries"
          sub="Edit name/notes, duplicate, or delete. Seeded with demo drafts."
        >
          {saved.length === 0 ? (
            <CmsEmpty label="No itineraries yet." cta="Open builder" onClick={() => (window.location.href = "/builder")} />
          ) : (
            <ul className="space-y-3">
              {saved.map((s) => (
                <li key={s.id} className="rounded-2xl bg-neutral-50 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[14px] font-bold">{s.title}</p>
                      <p className="text-[11px] text-neutral-500">
                        {s.placeIds.length} stops ·{" "}
                        {s.placeIds
                          .map((id) => PLACE_CLIPS.find((c) => c.id === id)?.place)
                          .filter(Boolean)
                          .slice(0, 3)
                          .join(", ")}
                      </p>
                      {s.notes && <p className="mt-1 text-[12px] text-neutral-600">{s.notes}</p>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <ActionBtn onClick={() => setEdit(s)}>Edit</ActionBtn>
                      <ActionBtn
                        onClick={() => {
                          duplicateSavedItinerary(s.id);
                          toast.success("Duplicated");
                          refresh();
                        }}
                      >
                        Duplicate
                      </ActionBtn>
                      <ActionBtn
                        variant="danger"
                        onClick={() => {
                          deleteSavedItinerary(s.id);
                          toast.success("Deleted");
                          refresh();
                        }}
                      >
                        Delete
                      </ActionBtn>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CmsSection>

        <CmsSection title="Saved stops / cart" sub="From the Shorts builder — persists in localStorage.">
          {cartPlaces.length === 0 ? (
            <p className="text-[13px] text-neutral-400">Cart empty — swipe places in the builder.</p>
          ) : (
            <ul className="space-y-2">
              {cartPlaces.map((c) =>
                c ? (
                  <li key={c.id} className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-2">
                    <img src={c.poster} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    <div>
                      <p className="text-[13px] font-bold">{c.place}</p>
                      <p className="text-[11px] text-neutral-500">{c.state}</p>
                    </div>
                  </li>
                ) : null,
              )}
            </ul>
          )}
          <Link to="/builder" className="mt-3 inline-block text-[13px] font-semibold" style={{ color: RED }}>
            Manage in builder →
          </Link>
        </CmsSection>
      </div>

      <div className="mt-6">
        <CmsSection title="Commission earned" sub="When others complete bookings of your published itineraries.">
          <ul className="space-y-2">
            {comms.length === 0 && <li className="text-[13px] text-neutral-400">No commissions yet.</li>}
            {comms.map((c) => (
              <li key={c.id} className="flex justify-between rounded-2xl bg-neutral-50 px-3 py-2 text-[13px]">
                <span>{c.title}</span>
                <span className="font-bold" style={{ color: GREEN }}>
                  +{formatINR(c.amount)}
                </span>
              </li>
            ))}
          </ul>
        </CmsSection>
      </div>

      <div className="mt-6">
        <CmsSection
          title="Bookings"
          sub="Statuses: PENDING → CONFIRMED → COMPLETED. Publish codes unlock only after COMPLETED."
        >
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="rounded-2xl border p-4" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-bold">{b.title}</p>
                    <p className="text-[12px] text-neutral-500">
                      {b.id} · {b.detail} · {formatINR(b.amount)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusPill
                        tone={
                          b.status === "completed"
                            ? "green"
                            : b.status === "pending"
                              ? "amber"
                              : b.status === "cancelled"
                                ? "red"
                                : "gray"
                        }
                      >
                        {b.status}
                      </StatusPill>
                      {b.publishCode && (
                        <Link
                          to="/itinerary/$code"
                          params={{ code: b.publishCode }}
                          className="font-mono text-[12px] font-bold"
                          style={{ color: RED }}
                        >
                          {b.publishCode}
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {b.status === "pending" && (
                      <ActionBtn
                        variant="success"
                        onClick={async () => {
                          await setBookingStatus(b.id, "confirmed");
                          toast.success("Confirmed");
                          refresh();
                        }}
                      >
                        Confirm
                      </ActionBtn>
                    )}
                    {b.status === "confirmed" && (
                      <ActionBtn
                        variant="success"
                        onClick={async () => {
                          await completeBooking(b.id);
                          toast.success("Marked COMPLETED");
                          refresh();
                        }}
                      >
                        Mark complete
                      </ActionBtn>
                    )}
                    {b.status === "completed" && !b.publishCode && (
                      <ActionBtn
                        variant="primary"
                        onClick={() => {
                          setPublishing(b.id);
                          setPubTitle(b.title);
                          setPubExp("My experience videos and photos from this trip.");
                        }}
                      >
                        Publish with code
                      </ActionBtn>
                    )}
                  </div>
                </div>
                {publishing === b.id && (
                  <div className="mt-4 space-y-2 rounded-2xl bg-neutral-50 p-3">
                    <input value={pubTitle} onChange={(e) => setPubTitle(e.target.value)} className={fieldClass} placeholder="Title" />
                    <textarea value={pubExp} onChange={(e) => setPubExp(e.target.value)} className={fieldClass} rows={2} placeholder="Experience notes" />
                    <ActionBtn
                      variant="primary"
                      onClick={async () => {
                        try {
                          const pub = await publishItineraryFromBooking(b.id, {
                            title: pubTitle,
                            experience: pubExp,
                          });
                          toast.success(`Published as ${pub.code}`);
                          setPublishing(null);
                          refresh();
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Publish failed");
                        }
                      }}
                    >
                      Generate code & publish
                    </ActionBtn>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CmsSection>
      </div>

      <div className="mt-6">
        <CmsSection
          title="Invite Crew"
          sub="Create a link from an itinerary idea; track seat payment / EMI status."
          action={
            <ActionBtn
              variant="primary"
              onClick={async () => {
                const inv = await createGroupInvite({
                  title: saved[0]?.title ?? `${user.name.split(" ")[0]}'s Crew Trip`,
                  pricePerSeat: 18400,
                  seatCount: 6,
                });
                toast.success(`Invite ${inv.code} created`);
                window.location.href = `/invite/${inv.code}`;
              }}
            >
              Create invite link
            </ActionBtn>
          }
        >
          {invites.length === 0 ? (
            <p className="text-[13px] text-neutral-400">No crew invites yet.</p>
          ) : (
            <ul className="space-y-3">
              {invites.map((g) => (
                <li key={g.id} className="rounded-2xl bg-neutral-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-bold">{g.title}</p>
                      <Link to="/invite/$code" params={{ code: g.code }} className="font-mono text-[12px] font-bold" style={{ color: RED }}>
                        {g.code}
                      </Link>
                    </div>
                    <p className="text-[12px] text-neutral-500">
                      {g.seats.filter((s) => s.paid).length}/{g.seats.length} paid ·{" "}
                      {g.seats.filter((s) => s.claimedBy).length} claimed
                    </p>
                  </div>
                  <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                    {g.seats.map((s) => (
                      <li key={s.id} className="flex justify-between text-[11px] text-neutral-600">
                        <span>
                          {s.label}: {s.claimedBy ?? "open"}
                        </span>
                        <StatusPill tone={s.paid ? "green" : s.claimedBy ? "amber" : "gray"}>
                          {s.paid ? "paid" : s.emiPaid ? `EMI ${s.emiPaid}/4` : "unpaid"}
                        </StatusPill>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </CmsSection>
      </div>

      <CmsDrawer
        open={!!edit}
        title="Edit itinerary"
        onClose={() => setEdit(null)}
        footer={
          <ActionBtn
            variant="primary"
            onClick={() => {
              if (!edit) return;
              updateSavedItinerary(edit.id, { title: edit.title, notes: edit.notes });
              toast.success("Saved");
              setEdit(null);
              refresh();
            }}
          >
            Save changes
          </ActionBtn>
        }
      >
        {edit && (
          <>
            <Field label="Name">
              <input className={fieldClass} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
            </Field>
            <Field label="Notes">
              <textarea className={fieldClass} rows={4} value={edit.notes ?? ""} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} />
            </Field>
          </>
        )}
      </CmsDrawer>

      <CmsDrawer
        open={profileOpen}
        title="Edit profile"
        onClose={() => setProfileOpen(false)}
        footer={
          <ActionBtn
            variant="primary"
            onClick={() => {
              updateProfile(user.id, { name, bio, avatar });
              toast.success("Profile updated");
              setProfileOpen(false);
              refresh();
            }}
          >
            Save profile
          </ActionBtn>
        }
      >
        <Field label="Name">
          <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Bio">
          <textarea className={fieldClass} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
        </Field>
        <Field label="Avatar URL">
          <input className={fieldClass} value={avatar} onChange={(e) => setAvatar(e.target.value)} />
        </Field>
      </CmsDrawer>
    </SiteShell>
  );
}
