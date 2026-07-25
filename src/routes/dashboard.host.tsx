import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Copy } from "lucide-react";
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
import type { HostCityItem, HostHome, HostTrip48h } from "@/data/demoUniverse";
import {
  PLACE_CLIPS,
  deleteCityItem,
  deleteHostHome,
  deleteHostTrip,
  fetchHostHomes,
  fetchHostTrips,
  formatINR,
  listBookings,
  listCityItems,
  regenerateTripReferral,
  setHostHomeListed,
  subscribeDemoStore,
  updateProfile,
  upsertCityItem,
  upsertHostHome,
  upsertHostTrip,
  type Booking,
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
  const [homes, setHomes] = useState<HostHome[]>([]);
  const [trips, setTrips] = useState<HostTrip48h[]>([]);
  const [city, setCity] = useState<HostCityItem[]>([]);
  const [referrals, setReferrals] = useState<Booking[]>([]);
  const [homeForm, setHomeForm] = useState<HomeForm | null>(null);
  const [tripForm, setTripForm] = useState<TripForm | null>(null);
  const [cityForm, setCityForm] = useState<CityForm | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  const refresh = () => {
    if (!user) return;
    fetchHostHomes(user.id).then(setHomes);
    fetchHostTrips(user.id).then(setTrips);
    setCity(listCityItems(user.id));
    setReferrals(listBookings({ hostId: user.id }));
    setName(user.name);
    setBio(user.bio ?? "");
    setAvatar(user.avatar);
  };

  useEffect(() => {
    refresh();
    return subscribeDemoStore(refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) {
    return (
      <SiteShell>
        <PageHero eyebrow="Host" title="Sign in as a homestay host" sub="" />
        <Link to="/demo-login" style={{ color: RED }} className="font-semibold">
          Demo login →
        </Link>
      </SiteShell>
    );
  }

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
    toast.success("Saved");
    setCityForm(null);
    refresh();
  };

  return (
    <SiteShell>
      <PageHero
        eyebrow="Host CMS"
        title={user.name}
        sub="Manage homes, 48h itineraries, in-city inventory, and guest referrals — zero host commission demo."
      />

      <div
        className="mb-6 rounded-3xl px-5 py-4 text-[13px] font-semibold"
        style={{ background: GREEN_LIGHT, color: GREEN }}
      >
        Zero host commission on NORTHNEST · Listed homes appear on public /host/&#123;slug&#125; pages
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <ActionBtn variant="primary" onClick={() => setHomeForm({
          name: "",
          place: "Meghalaya",
          pricePerNight: 2800,
          description: "",
          amenities: "Wi‑Fi, Home meals, Hot water",
          photos: PLACE_CLIPS.slice(0, 3).map((c) => c.poster).join("\n"),
          listed: true,
        })}>
          Add home
        </ActionBtn>
        <ActionBtn onClick={() => setProfileOpen(true)}>Edit host profile</ActionBtn>
        {homes[0] && (
          <Link
            to="/host/$slug"
            params={{ slug: homes[0].slug }}
            className="rounded-full border px-5 py-2 text-[13px] font-bold"
          >
            Preview public profile
          </Link>
        )}
      </div>

      <CmsSection title="Homes inventory" sub="Add / Edit / Delete / List · Unlist">
        {homes.length === 0 ? (
          <CmsEmpty
            label="No homes yet."
            cta="Add first home"
            onClick={() =>
              setHomeForm({
                name: "",
                place: "Meghalaya",
                pricePerNight: 2800,
                description: "",
                amenities: "Wi‑Fi, Home meals",
                photos: PLACE_CLIPS[0].poster,
                listed: true,
              })
            }
          />
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
                    setHostHomeListed(h.id, h.listed === false);
                    toast.success(h.listed === false ? "Listed" : "Unlisted");
                    refresh();
                  }}
                >
                  {h.listed === false ? "List" : "Unlist"}
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

      <div className="mt-6">
        <CmsSection
          title="48-hour itineraries"
          sub="Add / edit / delete · generate referral codes · copy link"
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
            <CmsEmpty label="No 48h trips." cta="Add first trip" onClick={() => setTripForm({
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
                    <p className="text-[12px] text-neutral-500">{t.description}</p>
                    <p className="mt-1 font-mono text-[12px] font-bold" style={{ color: GREEN }}>
                      {t.referralCode}
                    </p>
                  </div>
                  <p className="font-bold" style={{ color: RED }}>
                    {formatINR(t.price)}
                  </p>
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
                        <Copy size={12} /> Copy link
                      </span>
                    </ActionBtn>
                    <ActionBtn
                      variant="danger"
                      onClick={() => {
                        deleteHostTrip(t.id);
                        toast.success("Deleted");
                        refresh();
                      }}
                    >
                      Delete
                    </ActionBtn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CmsSection>
      </div>

      <div className="mt-6">
        <CmsSection
          title="In-city trip inventory"
          sub="Cabs, places, restaurants — editable"
          action={
            <ActionBtn variant="primary" onClick={() => setCityForm({ kind: "place", name: "", detail: "" })}>
              Add item
            </ActionBtn>
          }
        >
          {city.length === 0 ? (
            <CmsEmpty label="No city items." cta="Add first item" onClick={() => setCityForm({ kind: "cab", name: "", detail: "" })} />
          ) : (
            <InventoryTable
              headers={["Kind", "Name", "Detail", "Price hint", "Actions"]}
              rows={city.map((c) => [
                <StatusPill key="k" tone="gray">
                  {c.kind}
                </StatusPill>,
                c.name,
                c.detail,
                c.priceHint ? formatINR(c.priceHint) : "—",
                <div key="a" className="flex gap-1">
                  <ActionBtn
                    onClick={() =>
                      setCityForm({
                        id: c.id,
                        kind: c.kind,
                        name: c.name,
                        detail: c.detail,
                        priceHint: c.priceHint,
                      })
                    }
                  >
                    Edit
                  </ActionBtn>
                  <ActionBtn
                    variant="danger"
                    onClick={() => {
                      deleteCityItem(c.id);
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
      </div>

      <div className="mt-6">
        <CmsSection title="Guest referral bookings" sub="Bookings attributed to your hostId (demo).">
          {referrals.length === 0 ? (
            <p className="text-[13px] text-neutral-400">No referral bookings yet.</p>
          ) : (
            <ul className="space-y-2">
              {referrals.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-neutral-50 px-3 py-2 text-[13px]">
                  <span>
                    {b.title} · {formatINR(b.amount)}
                  </span>
                  <StatusPill tone={b.status === "completed" ? "green" : b.status === "pending" ? "amber" : "gray"}>
                    {b.status}
                  </StatusPill>
                </li>
              ))}
            </ul>
          )}
        </CmsSection>
      </div>

      <CmsDrawer open={!!homeForm} title={homeForm?.id ? "Edit home" : "Add home"} onClose={() => setHomeForm(null)} footer={<ActionBtn variant="primary" onClick={saveHome}>Save home</ActionBtn>}>
        {homeForm && (
          <>
            <Field label="Name"><input className={fieldClass} value={homeForm.name} onChange={(e) => setHomeForm({ ...homeForm, name: e.target.value })} /></Field>
            <Field label="Location"><input className={fieldClass} value={homeForm.place} onChange={(e) => setHomeForm({ ...homeForm, place: e.target.value })} /></Field>
            <Field label="Price / night (₹)"><input type="number" className={fieldClass} value={homeForm.pricePerNight} onChange={(e) => setHomeForm({ ...homeForm, pricePerNight: Number(e.target.value) })} /></Field>
            <Field label="Description"><textarea className={fieldClass} rows={3} value={homeForm.description} onChange={(e) => setHomeForm({ ...homeForm, description: e.target.value })} /></Field>
            <Field label="Amenities (comma-separated)"><input className={fieldClass} value={homeForm.amenities} onChange={(e) => setHomeForm({ ...homeForm, amenities: e.target.value })} /></Field>
            <Field label="Photo URLs (one per line)"><textarea className={fieldClass} rows={3} value={homeForm.photos} onChange={(e) => setHomeForm({ ...homeForm, photos: e.target.value })} /></Field>
            <label className="flex items-center gap-2 text-[13px] font-semibold">
              <input type="checkbox" checked={homeForm.listed} onChange={(e) => setHomeForm({ ...homeForm, listed: e.target.checked })} />
              Listed publicly
            </label>
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

      <CmsDrawer
        open={profileOpen}
        title="Edit host profile"
        onClose={() => setProfileOpen(false)}
        footer={
          <ActionBtn
            variant="primary"
            onClick={() => {
              updateProfile(user.id, { name, bio, avatar });
              toast.success("Profile saved");
              setProfileOpen(false);
              refresh();
            }}
          >
            Save profile
          </ActionBtn>
        }
      >
        <Field label="Name"><input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Bio"><textarea className={fieldClass} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} /></Field>
        <Field label="Avatar URL"><input className={fieldClass} value={avatar} onChange={(e) => setAvatar(e.target.value)} /></Field>
      </CmsDrawer>
    </SiteShell>
  );
}
