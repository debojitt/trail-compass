import { useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Copy } from "lucide-react";
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
  InventoryTable,
  OverviewStats,
  StatusPill,
  ToggleRow,
  fieldClass,
  type DashTabId,
} from "@/components/site/CmsKit";
import type { HostCityItem, HostHome, HostTrip48h } from "@/data/demoUniverse";
import {
  PLACE_CLIPS,
  appendActivity,
  dashboardPathFor,
  deleteCityItem,
  deleteHostHome,
  deleteHostTrip,
  fetchHostHomes,
  fetchHostTrips,
  formatINR,
  getDashSettings,
  listActivity,
  listBookings,
  listCityItems,
  listEnquiries,
  markEnquiryRead,
  regenerateTripReferral,
  replyToEnquiry,
  setBookingStatus,
  setEnquiryStatus,
  setHostHomeListed,
  subscribeDemoStore,
  updateBookingNotes,
  updateDashSettings,
  updateProfile,
  upsertCityItem,
  upsertHostHome,
  upsertHostTrip,
  type ActivityEvent,
  type Booking,
  type DashSettings,
  type Enquiry,
} from "@/lib/demoApi";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/host")({
  head: () => ({ meta: [{ title: "Host Dashboard · NORTHNEST" }] }),
  component: HostDashboard,
});

type HomeForm = {
  id?: string;
  name: string;
  place: string;
  pricePerNight: number;
  description: string;
  amenities: string;
  photos: string;
  listed: boolean;
};

type TripForm = {
  id?: string;
  homeId: string;
  title: string;
  price: number;
  description: string;
  cover: string;
  places: string;
  food: string;
  cabs: string;
};

type CityForm = {
  id?: string;
  kind: HostCityItem["kind"];
  name: string;
  detail: string;
  priceHint?: number;
};

function HostDashboard() {
  const user = useDemoUser();
  const ready = useDemoAuthReady();
  const navigate = useNavigate();
  const [tab, setTab] = useState<DashTabId>("overview");
  const [homes, setHomes] = useState<HostHome[]>([]);
  const [trips, setTrips] = useState<HostTrip48h[]>([]);
  const [city, setCity] = useState<HostCityItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [history, setHistory] = useState<ActivityEvent[]>([]);
  const [settings, setSettings] = useState<DashSettings | null>(null);
  const [homeForm, setHomeForm] = useState<HomeForm | null>(null);
  const [tripForm, setTripForm] = useState<TripForm | null>(null);
  const [cityForm, setCityForm] = useState<CityForm | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  const refresh = () => {
    if (!user) return;
    fetchHostHomes(user.id).then(setHomes);
    fetchHostTrips(user.id).then(setTrips);
    setCity(listCityItems(user.id));
    setBookings(listBookings({ hostId: user.id }));
    setEnquiries(listEnquiries({ toUserId: user.id }));
    setHistory(listActivity({ actorId: user.id }));
    setSettings(getDashSettings(user.id));
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
    if (!ready || !user) return;
    if (user.type !== "host") {
      void navigate({ href: dashboardPathFor(user.type) });
    }
  }, [ready, user, navigate]);

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
        <DashSignInGate roleLabel="Host" title="Sign in as a homestay host" />
      </SiteShell>
    );
  }

  if (user.type !== "host") {
    return (
      <SiteShell>
        <DashLoading />
      </SiteShell>
    );
  }

  const blankHome = (): HomeForm => ({
    name: "",
    place: "Meghalaya",
    pricePerNight: 2800,
    description: "",
    amenities: "Wi‑Fi, Home meals, Hot water",
    photos: PLACE_CLIPS.slice(0, 3)
      .map((c) => c.poster)
      .join("\n"),
    listed: true,
  });

  const saveHome = () => {
    if (!homeForm?.name.trim()) return toast.error("Name required");
    const photos = homeForm.photos
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    upsertHostHome({
      id: homeForm.id,
      hostId: user.id,
      name: homeForm.name.trim(),
      place: homeForm.place,
      pricePerNight: homeForm.pricePerNight,
      description: homeForm.description,
      amenities: homeForm.amenities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      photos: photos.length ? photos : [PLACE_CLIPS[0].poster],
      listed: homeForm.listed,
    });
    appendActivity({
      actorId: user.id,
      actorName: user.name,
      role: "host",
      action: homeForm.id ? "edit" : "create",
      summary: `${homeForm.id ? "Updated" : "Listed"} home · ${homeForm.name.trim()}`,
    });
    toast.success(homeForm.id ? "Listing updated" : "Listing added");
    setHomeForm(null);
    refresh();
  };

  const saveTrip = () => {
    if (!tripForm?.title.trim() || !tripForm.homeId) return toast.error("Title + home required");
    upsertHostTrip({
      id: tripForm.id,
      hostId: user.id,
      homeId: tripForm.homeId,
      title: tripForm.title.trim(),
      price: tripForm.price,
      description: tripForm.description,
      cover: tripForm.cover,
      places: tripForm.places.split(",").map((s) => s.trim()).filter(Boolean),
      food: tripForm.food.split(",").map((s) => s.trim()).filter(Boolean),
      cabs: tripForm.cabs.split(",").map((s) => s.trim()).filter(Boolean),
    });
    appendActivity({
      actorId: user.id,
      actorName: user.name,
      role: "host",
      action: tripForm.id ? "edit" : "create",
      summary: `${tripForm.id ? "Updated" : "Created"} 48h trip · ${tripForm.title.trim()}`,
    });
    toast.success(tripForm.id ? "Trip updated" : "Trip added");
    setTripForm(null);
    refresh();
  };

  const saveCity = () => {
    if (!cityForm?.name.trim()) return toast.error("Name required");
    upsertCityItem({
      id: cityForm.id,
      hostId: user.id,
      kind: cityForm.kind,
      name: cityForm.name.trim(),
      detail: cityForm.detail,
      priceHint: cityForm.priceHint,
    });
    appendActivity({
      actorId: user.id,
      actorName: user.name,
      role: "host",
      action: cityForm.id ? "edit" : "create",
      summary: `City inventory · ${cityForm.kind}: ${cityForm.name.trim()}`,
    });
    toast.success("Saved");
    setCityForm(null);
    refresh();
  };

  return (
    <SiteShell>
      <PageHero
        eyebrow="Host control panel"
        title={user.name}
        sub="Homes · 48h itineraries · city inventory · bookings calendar · enquiries · history."
        backFallback="/"
        backLabel="Home"
      />
      <div
        className="mb-4 rounded-3xl px-5 py-3 text-[13px] font-semibold"
        style={{ background: GREEN_LIGHT, color: GREEN }}
      >
        Zero host commission · List On/Off syncs to public /host pages
      </div>

      <DashTabs active={tab} onChange={setTab} />

      {tab === "overview" && (
        <div className="space-y-6">
          <OverviewStats
            items={[
              { label: "Homes", value: homes.length },
              { label: "Listed", value: homes.filter((h) => h.listed !== false).length, tone: "green" },
              { label: "Guest bookings", value: bookings.length },
              { label: "Open enquiries", value: enquiries.filter((e) => e.status === "open").length },
            ]}
          />
          <div className="flex flex-wrap gap-3">
            <ActionBtn variant="primary" onClick={() => { setTab("cms"); setHomeForm(blankHome()); }}>
              Add home
            </ActionBtn>
            <ActionBtn onClick={() => setTab("bookings")}>Occupancy / bookings</ActionBtn>
            <ActionBtn onClick={() => setTab("enquiries")}>Guest enquiries</ActionBtn>
          </div>
        </div>
      )}

      {tab === "cms" && (
        <div className="space-y-6">
          <CmsSection
            title="Homes inventory"
            sub="Add / Edit / Delete · List On/Off"
            action={
              <ActionBtn variant="primary" onClick={() => setHomeForm(blankHome())}>
                Add home
              </ActionBtn>
            }
          >
            {homes.length === 0 ? (
              <CmsEmpty label="No homes yet." cta="Add first home" onClick={() => setHomeForm(blankHome())} />
            ) : (
              <InventoryTable
                headers={["Home", "Place", "Price", "Occupancy", "Status", "Actions"]}
                rows={homes.map((h) => [
                  <div key="n" className="flex items-center gap-2">
                    <img src={h.photos[0]} alt="" className="h-10 w-14 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold">{h.name}</p>
                      <Link to="/host/$slug" params={{ slug: h.slug }} className="text-[11px]" style={{ color: RED }}>
                        /host/{h.slug}
                      </Link>
                    </div>
                  </div>,
                  h.place,
                  formatINR(h.pricePerNight),
                  `${h.bookingsDemo ?? 0} bookings`,
                  <StatusPill key="s" tone={h.listed !== false ? "green" : "gray"}>
                    {h.listed !== false ? "listed" : "unlisted"}
                  </StatusPill>,
                  <div key="a" className="flex flex-wrap gap-1">
                    <ActionBtn
                      onClick={() =>
                        setHomeForm({
                          id: h.id,
                          name: h.name,
                          place: h.place,
                          pricePerNight: h.pricePerNight,
                          description: h.description,
                          amenities: h.amenities.join(", "),
                          photos: h.photos.join("\n"),
                          listed: h.listed !== false,
                        })
                      }
                    >
                      Edit
                    </ActionBtn>
                    <ActionBtn
                      onClick={() => {
                        const next = h.listed === false;
                        setHostHomeListed(h.id, next);
                        appendActivity({
                          actorId: user.id,
                          actorName: user.name,
                          role: "host",
                          action: next ? "publish" : "unlist",
                          summary: `${next ? "Listed" : "Unlisted"} · ${h.name}`,
                        });
                        toast.success(next ? "Listed" : "Unlisted");
                        refresh();
                      }}
                    >
                      {h.listed === false ? "List ON" : "List OFF"}
                    </ActionBtn>
                    <ActionBtn
                      variant="danger"
                      onClick={() => {
                        deleteHostHome(h.id);
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

          <CmsSection
            title="48-hour itinerary CMS"
            sub="Referral codes · copy link"
            action={
              <ActionBtn
                variant="primary"
                onClick={() =>
                  setTripForm({
                    homeId: homes[0]?.id ?? "",
                    title: "",
                    price: 4500,
                    description: "",
                    cover: PLACE_CLIPS[2].poster,
                    places: "Viewpoint, Market",
                    food: "Home thali",
                    cabs: "Airport pickup",
                  })
                }
              >
                Add 48h trip
              </ActionBtn>
            }
          >
            {trips.length === 0 ? (
              <CmsEmpty label="No 48h trips." cta="Add trip" onClick={() => setTripForm({
                homeId: homes[0]?.id ?? "",
                title: "",
                price: 4500,
                description: "",
                cover: PLACE_CLIPS[2].poster,
                places: "Viewpoint",
                food: "Thali",
                cabs: "Cab",
              })} />
            ) : (
              <div className="space-y-3">
                {trips.map((t) => (
                  <div key={t.id} className="flex flex-wrap items-center gap-4 rounded-2xl border p-4" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                    <img src={t.cover} alt="" className="h-16 w-16 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{t.title}</p>
                      <p className="font-mono text-[12px] font-bold" style={{ color: GREEN }}>
                        {t.referralCode}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <ActionBtn
                        onClick={() =>
                          setTripForm({
                            id: t.id,
                            homeId: t.homeId,
                            title: t.title,
                            price: t.price,
                            description: t.description,
                            cover: t.cover,
                            places: t.places.join(", "),
                            food: t.food.join(", "),
                            cabs: t.cabs.join(", "),
                          })
                        }
                      >
                        Edit
                      </ActionBtn>
                      <ActionBtn
                        onClick={() => {
                          regenerateTripReferral(t.id);
                          toast.success("New referral code");
                          refresh();
                        }}
                      >
                        New code
                      </ActionBtn>
                      <ActionBtn
                        onClick={async () => {
                          const url = `${window.location.origin}/host/${homes.find((h) => h.id === t.homeId)?.slug ?? homes[0]?.slug ?? ""}?ref=${t.referralCode}`;
                          await navigator.clipboard.writeText(url);
                          toast.success("Link copied");
                        }}
                      >
                        <span className="inline-flex items-center gap-1">
                          <Copy size={12} /> Copy
                        </span>
                      </ActionBtn>
                      <ActionBtn variant="danger" onClick={() => { deleteHostTrip(t.id); refresh(); }}>
                        Delete
                      </ActionBtn>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CmsSection>

          <CmsSection
            title="City inventory"
            sub="Cabs · places · restaurants"
            action={
              <ActionBtn variant="primary" onClick={() => setCityForm({ kind: "place", name: "", detail: "" })}>
                Add item
              </ActionBtn>
            }
          >
            {city.length === 0 ? (
              <CmsEmpty label="No city items." cta="Add item" onClick={() => setCityForm({ kind: "cab", name: "", detail: "" })} />
            ) : (
              <InventoryTable
                headers={["Kind", "Name", "Detail", "Price", "Actions"]}
                rows={city.map((c) => [
                  <StatusPill key="k" tone="gray">{c.kind}</StatusPill>,
                  c.name,
                  c.detail,
                  c.priceHint ? formatINR(c.priceHint) : "—",
                  <div key="a" className="flex gap-1">
                    <ActionBtn onClick={() => setCityForm({ id: c.id, kind: c.kind, name: c.name, detail: c.detail, priceHint: c.priceHint })}>
                      Edit
                    </ActionBtn>
                    <ActionBtn variant="danger" onClick={() => { deleteCityItem(c.id); refresh(); }}>
                      Delete
                    </ActionBtn>
                  </div>,
                ])}
              />
            )}
          </CmsSection>
        </div>
      )}

      {tab === "bookings" && (
        <CmsSection title="Calendar-ish occupancy / bookings" sub="Guest stays & referral bookings · status + notes">
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
        <CmsSection title="Guest enquiries">
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
        <CmsSection title="Listings & referrals history">
          <HistoryTimeline items={history} />
        </CmsSection>
      )}

      {tab === "settings" && settings && (
        <CmsSection title="Host profile & toggles">
          <div className="mb-4 space-y-2">
            <ToggleRow
              label="Accept bookings"
              checked={settings.acceptBookings}
              onChange={(v) => {
                setSettings(updateDashSettings(user.id, { acceptBookings: v }, { name: user.name, role: "host" }));
                toast.success(v ? "Accept bookings ON" : "OFF");
              }}
            />
            <ToggleRow
              label="Notifications"
              checked={settings.notifications}
              onChange={(v) => {
                setSettings(updateDashSettings(user.id, { notifications: v }, { name: user.name, role: "host" }));
                toast.success(v ? "Notifications ON" : "OFF");
              }}
            />
            <ToggleRow
              label="Public host profile"
              checked={settings.publicProfile}
              onChange={(v) => {
                setSettings(updateDashSettings(user.id, { publicProfile: v }, { name: user.name, role: "host" }));
                toast.success(v ? "Public profile ON" : "OFF");
              }}
            />
          </div>
          <Field label="Name"><input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Bio"><textarea className={fieldClass} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} /></Field>
          <Field label="Avatar URL"><input className={fieldClass} value={avatar} onChange={(e) => setAvatar(e.target.value)} /></Field>
          <ActionBtn
            variant="primary"
            onClick={() => {
              updateProfile(user.id, { name, bio, avatar });
              toast.success("Profile saved");
              refresh();
            }}
          >
            Save profile
          </ActionBtn>
        </CmsSection>
      )}

      <CmsDrawer open={!!homeForm} title={homeForm?.id ? "Edit home" : "Add home"} onClose={() => setHomeForm(null)} footer={<ActionBtn variant="primary" onClick={saveHome}>Save home</ActionBtn>}>
        {homeForm && (
          <>
            <Field label="Name"><input className={fieldClass} value={homeForm.name} onChange={(e) => setHomeForm({ ...homeForm, name: e.target.value })} /></Field>
            <Field label="Location"><input className={fieldClass} value={homeForm.place} onChange={(e) => setHomeForm({ ...homeForm, place: e.target.value })} /></Field>
            <Field label="Price / night (₹)"><input type="number" className={fieldClass} value={homeForm.pricePerNight} onChange={(e) => setHomeForm({ ...homeForm, pricePerNight: Number(e.target.value) })} /></Field>
            <Field label="Description"><textarea className={fieldClass} rows={3} value={homeForm.description} onChange={(e) => setHomeForm({ ...homeForm, description: e.target.value })} /></Field>
            <Field label="Amenities (comma-separated)"><input className={fieldClass} value={homeForm.amenities} onChange={(e) => setHomeForm({ ...homeForm, amenities: e.target.value })} /></Field>
            <Field label="Photo URLs (one per line)"><textarea className={fieldClass} rows={3} value={homeForm.photos} onChange={(e) => setHomeForm({ ...homeForm, photos: e.target.value })} /></Field>
            <ToggleRow label="Listed On/Off" checked={homeForm.listed} onChange={(v) => setHomeForm({ ...homeForm, listed: v })} />
          </>
        )}
      </CmsDrawer>

      <CmsDrawer open={!!tripForm} title={tripForm?.id ? "Edit 48h trip" : "Add 48h trip"} onClose={() => setTripForm(null)} footer={<ActionBtn variant="primary" onClick={saveTrip}>Save trip</ActionBtn>}>
        {tripForm && (
          <>
            <Field label="Linked home">
              <select className={fieldClass} value={tripForm.homeId} onChange={(e) => setTripForm({ ...tripForm, homeId: e.target.value })}>
                <option value="">Select home</option>
                {homes.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Title"><input className={fieldClass} value={tripForm.title} onChange={(e) => setTripForm({ ...tripForm, title: e.target.value })} /></Field>
            <Field label="Price (₹)"><input type="number" className={fieldClass} value={tripForm.price} onChange={(e) => setTripForm({ ...tripForm, price: Number(e.target.value) })} /></Field>
            <Field label="Description"><textarea className={fieldClass} rows={2} value={tripForm.description} onChange={(e) => setTripForm({ ...tripForm, description: e.target.value })} /></Field>
            <Field label="Cover URL"><input className={fieldClass} value={tripForm.cover} onChange={(e) => setTripForm({ ...tripForm, cover: e.target.value })} /></Field>
            <Field label="Places (comma)"><input className={fieldClass} value={tripForm.places} onChange={(e) => setTripForm({ ...tripForm, places: e.target.value })} /></Field>
            <Field label="Food (comma)"><input className={fieldClass} value={tripForm.food} onChange={(e) => setTripForm({ ...tripForm, food: e.target.value })} /></Field>
            <Field label="Cabs (comma)"><input className={fieldClass} value={tripForm.cabs} onChange={(e) => setTripForm({ ...tripForm, cabs: e.target.value })} /></Field>
          </>
        )}
      </CmsDrawer>

      <CmsDrawer open={!!cityForm} title={cityForm?.id ? "Edit city item" : "Add city item"} onClose={() => setCityForm(null)} footer={<ActionBtn variant="primary" onClick={saveCity}>Save</ActionBtn>}>
        {cityForm && (
          <>
            <Field label="Kind">
              <select className={fieldClass} value={cityForm.kind} onChange={(e) => setCityForm({ ...cityForm, kind: e.target.value as HostCityItem["kind"] })}>
                <option value="cab">Cab</option>
                <option value="place">Place</option>
                <option value="restaurant">Restaurant</option>
              </select>
            </Field>
            <Field label="Name"><input className={fieldClass} value={cityForm.name} onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })} /></Field>
            <Field label="Detail"><input className={fieldClass} value={cityForm.detail} onChange={(e) => setCityForm({ ...cityForm, detail: e.target.value })} /></Field>
            <Field label="Price hint (₹)"><input type="number" className={fieldClass} value={cityForm.priceHint ?? ""} onChange={(e) => setCityForm({ ...cityForm, priceHint: Number(e.target.value) || undefined })} /></Field>
          </>
        )}
      </CmsDrawer>
    </SiteShell>
  );
}
