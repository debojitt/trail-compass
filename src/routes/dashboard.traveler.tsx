import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { useDemoAuthReady, useDemoUser } from "@/components/site/useDemoUser";
import {
  ActionBtn,
  BookingsManager,
  CmsDrawer,
  CmsEmpty,
  CmsSection,
  DashLoading,
  DashSignInGate,
  DashTabs,
  EnquiriesInbox,
  Field,
  HistoryTimeline,
  OverviewStats,
  StatusPill,
  ToggleRow,
  fieldClass,
  type DashTabId,
} from "@/components/site/CmsKit";
import {
  PLACE_CLIPS,
  appendActivity,
  completeBooking,
  createEnquiry,
  createGroupInvite,
  dashboardPathFor,
  deleteSavedItinerary,
  duplicateSavedItinerary,
  formatINR,
  getCart,
  getDashSettings,
  getUser,
  listActivity,
  listBookings,
  listCommissions,
  listEnquiries,
  listGroupInvitesSync,
  listSavedItineraries,
  markEnquiryRead,
  publishItineraryFromBooking,
  replyToEnquiry,
  setBookingStatus,
  setEnquiryStatus,
  subscribeDemoStore,
  updateBookingNotes,
  updateDashSettings,
  updateProfile,
  updateSavedItinerary,
  type ActivityEvent,
  type Booking,
  type CommissionEntry,
  type DashSettings,
  type Enquiry,
  type SavedItinerary,
} from "@/lib/demoApi";
import type { GroupInvite } from "@/data/demoUniverse";
import { RED } from "@/lib/brand";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/traveler")({
  head: () => ({ meta: [{ title: "Traveler Dashboard · NORTHNEST" }] }),
  component: TravelerDashboard,
});

function TravelerDashboard() {
  const user = useDemoUser();
  const ready = useDemoAuthReady();
  const navigate = useNavigate();
  const [tab, setTab] = useState<DashTabId>("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [saved, setSaved] = useState<SavedItinerary[]>([]);
  const [comms, setComms] = useState<CommissionEntry[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [sentEnquiries, setSentEnquiries] = useState<Enquiry[]>([]);
  const [history, setHistory] = useState<ActivityEvent[]>([]);
  const [settings, setSettings] = useState<DashSettings | null>(null);
  const [edit, setEdit] = useState<SavedItinerary | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [enqTo, setEnqTo] = useState("creator1");
  const [enqSubject, setEnqSubject] = useState("");
  const [enqMessage, setEnqMessage] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [pubTitle, setPubTitle] = useState("");
  const [pubExp, setPubExp] = useState("");
  const [publishing, setPublishing] = useState<string | null>(null);

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
      setEnquiries(listEnquiries({ toUserId: u.id }));
      setSentEnquiries(listEnquiries({ fromUserId: u.id }));
      setHistory(listActivity({ actorId: u.id }));
      setSettings(getDashSettings(u.id));
    }
    const uid = getUser()?.id;
    const allInvites = listGroupInvitesSync();
    setInvites(uid ? allInvites.filter((g) => g.plannerId === uid) : allInvites.slice(0, 3));
  };

  useEffect(() => {
    refresh();
    return subscribeDemoStore(refresh);
  }, []);

  useEffect(() => {
    if (!ready || !user) return;
    if (user.type !== "traveler") {
      void navigate({ href: dashboardPathFor(user.type) });
    }
  }, [ready, user, navigate]);

  const cartPlaces = useMemo(
    () => cart.map((id) => PLACE_CLIPS.find((c) => c.id === id)).filter(Boolean),
    [cart],
  );

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
        <DashSignInGate roleLabel="Traveler" title="Sign in to see your dashboard" />
      </SiteShell>
    );
  }

  if (user.type !== "traveler") {
    return (
      <SiteShell>
        <DashLoading />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageHero
        eyebrow="Traveler control panel"
        title={`Hey, ${user.name.split(" ")[0]}`}
        sub="Overview · CMS · Bookings · Enquiries · History · Settings — all persisted in this browser."
        backFallback="/"
        backLabel="Home"
      />

      <DashTabs active={tab} onChange={setTab} />

      {tab === "overview" && (
        <div className="space-y-6">
          <OverviewStats
            items={[
              { label: "Itineraries", value: saved.length },
              { label: "Bookings", value: bookings.length },
              { label: "Open enquiries", value: enquiries.filter((e) => e.status === "open").length, tone: "green" },
              { label: "Crew invites", value: invites.length },
            ]}
          />
          <div className="flex flex-wrap gap-3">
            <ActionBtn variant="primary" onClick={() => setTab("cms")}>
              Open itinerary CMS
            </ActionBtn>
            <ActionBtn onClick={() => setTab("bookings")}>Bookings pipeline</ActionBtn>
            <ActionBtn onClick={() => setTab("enquiries")}>Enquiries inbox</ActionBtn>
            <Link to="/builder" className="rounded-full border px-5 py-2 text-[13px] font-bold">
              Shorts builder
            </Link>
          </div>
          <CmsSection title="Recent history" sub="Login-independent activity for this account">
            <HistoryTimeline items={history.slice(0, 5)} />
            <ActionBtn onClick={() => setTab("history")}>View full history</ActionBtn>
          </CmsSection>
        </div>
      )}

      {tab === "cms" && (
        <div className="space-y-6">
          <CmsSection
            title="Saved itineraries CMS"
            sub="Edit · delete · duplicate. Seeded drafts on first login."
            action={
              <Link to="/builder" className="rounded-full px-4 py-2 text-[12px] font-bold text-white" style={{ background: RED }}>
                Add via builder
              </Link>
            }
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
                            appendActivity({
                              actorId: user.id,
                              actorName: user.name,
                              role: "traveler",
                              action: "create",
                              summary: `Duplicated itinerary · ${s.title}`,
                            });
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
                            appendActivity({
                              actorId: user.id,
                              actorName: user.name,
                              role: "traveler",
                              action: "delete",
                              summary: `Deleted itinerary · ${s.title}`,
                            });
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

          <CmsSection title="Invite Crew" sub="Create links · track seat / EMI status">
            <ActionBtn
              variant="primary"
              onClick={async () => {
                try {
                  const inv = await createGroupInvite({
                    title: saved[0]?.title ?? `${user.name.split(" ")[0]}'s Crew Trip`,
                    pricePerSeat: 18400,
                    seatCount: 6,
                  });
                  toast.success(`Invite ${inv.code} created`);
                  window.location.assign(`/invite/${inv.code}`);
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Could not create invite");
                }
              }}
            >
              Create invite link
            </ActionBtn>
            {invites.length === 0 ? (
              <p className="mt-3 text-[13px] text-neutral-400">No crew invites yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
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
                        {g.seats.filter((s) => s.paid).length}/{g.seats.length} paid
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CmsSection>

          <CmsSection title="Cart stops">
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
          </CmsSection>
        </div>
      )}

      {tab === "bookings" && (
        <CmsSection title="Bookings pipeline" sub="Filter by status · change status · notes · publish after COMPLETED">
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
            emptyCta="Browse packages"
            onEmpty={() => (window.location.href = "/packages")}
          />
          {bookings
            .filter((b) => b.status === "completed" && !b.publishCode)
            .map((b) => (
              <div key={`pub-${b.id}`} className="mt-4 rounded-2xl bg-neutral-50 p-3">
                <p className="mb-2 text-[13px] font-bold">Publish code for {b.title}</p>
                {publishing === b.id ? (
                  <div className="space-y-2">
                    <input value={pubTitle} onChange={(e) => setPubTitle(e.target.value)} className={fieldClass} placeholder="Title" />
                    <textarea value={pubExp} onChange={(e) => setPubExp(e.target.value)} className={fieldClass} rows={2} />
                    <ActionBtn
                      variant="primary"
                      onClick={async () => {
                        try {
                          const pub = await publishItineraryFromBooking(b.id, { title: pubTitle, experience: pubExp });
                          appendActivity({
                            actorId: user.id,
                            actorName: user.name,
                            role: "traveler",
                            action: "publish",
                            summary: `Published itinerary ${pub.code}`,
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
                ) : (
                  <ActionBtn
                    variant="primary"
                    onClick={() => {
                      setPublishing(b.id);
                      setPubTitle(b.title);
                      setPubExp("My experience from this trip.");
                    }}
                  >
                    Publish with code
                  </ActionBtn>
                )}
              </div>
            ))}
          {comms.length > 0 && (
            <ul className="mt-4 space-y-2">
              {comms.map((c) => (
                <li key={c.id} className="flex justify-between text-[13px]">
                  <span>{c.title}</span>
                  <span className="font-bold">+{formatINR(c.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </CmsSection>
      )}

      {tab === "enquiries" && (
        <div className="space-y-6">
          <CmsSection
            title="Inbox"
            sub="Messages to you — mark read, reply, open/closed"
            action={
              <ActionBtn variant="primary" onClick={() => setComposeOpen(true)}>
                Send enquiry
              </ActionBtn>
            }
          >
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
          <CmsSection title="Sent to hosts / creators" sub="Your outbound enquiries + replies">
            {sentEnquiries.length === 0 ? (
              <p className="text-[13px] text-neutral-400">No sent enquiries yet.</p>
            ) : (
              <ul className="space-y-2">
                {sentEnquiries.map((e) => (
                  <li key={e.id} className="rounded-2xl bg-neutral-50 p-3 text-[13px]">
                    <div className="flex justify-between gap-2">
                      <p className="font-bold">{e.subject}</p>
                      <StatusPill tone={e.status === "open" ? "amber" : "gray"}>{e.status}</StatusPill>
                    </div>
                    <p className="text-[12px] text-neutral-500">To {e.toUserId}</p>
                    {e.reply && <p className="mt-1 text-[12px]">Reply: {e.reply}</p>}
                  </li>
                ))}
              </ul>
            )}
          </CmsSection>
        </div>
      )}

      {tab === "history" && (
        <CmsSection title="Activity history" sub="Trips, bookings, publishes, enquiries — survives re-login">
          <HistoryTimeline items={history} />
        </CmsSection>
      )}

      {tab === "settings" && settings && (
        <div className="space-y-6">
          <CmsSection title="Profile & toggles">
            <div className="mb-4 space-y-2">
              <ToggleRow
                label="Accept booking updates"
                sub="Allow status changes & host messages on your trips"
                checked={settings.acceptBookings}
                onChange={(v) => {
                  setSettings(updateDashSettings(user.id, { acceptBookings: v }, { name: user.name, role: "traveler" }));
                  toast.success(v ? "Accept bookings ON" : "Accept bookings OFF");
                }}
              />
              <ToggleRow
                label="Notifications"
                sub="Demo toast-style alerts for enquiries & booking changes"
                checked={settings.notifications}
                onChange={(v) => {
                  setSettings(updateDashSettings(user.id, { notifications: v }, { name: user.name, role: "traveler" }));
                  toast.success(v ? "Notifications ON" : "Notifications OFF");
                }}
              />
              <ToggleRow
                label="Public publish profile"
                sub="Show your published itinerary codes on marketplace"
                checked={settings.publicProfile}
                onChange={(v) => {
                  setSettings(updateDashSettings(user.id, { publicProfile: v }, { name: user.name, role: "traveler" }));
                  toast.success(v ? "Public profile ON" : "Public profile OFF");
                }}
              />
            </div>
            <Field label="Name">
              <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Bio">
              <textarea className={fieldClass} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
            </Field>
            <Field label="Avatar URL">
              <input className={fieldClass} value={avatar} onChange={(e) => setAvatar(e.target.value)} />
            </Field>
            <ActionBtn
              variant="primary"
              onClick={() => {
                updateProfile(user.id, { name, bio, avatar });
                appendActivity({
                  actorId: user.id,
                  actorName: name,
                  role: "traveler",
                  action: "edit",
                  summary: "Updated traveler profile",
                });
                toast.success("Profile saved");
                refresh();
              }}
            >
              Save profile
            </ActionBtn>
          </CmsSection>
        </div>
      )}

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
              appendActivity({
                actorId: user.id,
                actorName: user.name,
                role: "traveler",
                action: "edit",
                summary: `Edited itinerary · ${edit.title}`,
              });
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
        open={composeOpen}
        title="Send enquiry"
        onClose={() => setComposeOpen(false)}
        footer={
          <ActionBtn
            variant="primary"
            onClick={() => {
              if (!enqSubject.trim() || !enqMessage.trim()) return toast.error("Subject + message required");
              createEnquiry({
                toUserId: enqTo,
                fromName: user.name,
                fromEmail: user.email,
                fromUserId: user.id,
                subject: enqSubject,
                message: enqMessage,
              });
              toast.success("Enquiry sent");
              setComposeOpen(false);
              setEnqSubject("");
              setEnqMessage("");
              refresh();
            }}
          >
            Send
          </ActionBtn>
        }
      >
        <Field label="To">
          <select className={fieldClass} value={enqTo} onChange={(e) => setEnqTo(e.target.value)}>
            <option value="creator1">Priya Films (creator)</option>
            <option value="host1">Kabir Host</option>
            <option value="planner1">Nestcraft Planner</option>
          </select>
        </Field>
        <Field label="Subject">
          <input className={fieldClass} value={enqSubject} onChange={(e) => setEnqSubject(e.target.value)} />
        </Field>
        <Field label="Message">
          <textarea className={fieldClass} rows={4} value={enqMessage} onChange={(e) => setEnqMessage(e.target.value)} />
        </Field>
      </CmsDrawer>
    </SiteShell>
  );
}
