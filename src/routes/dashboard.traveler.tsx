import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import { useDemoUser } from "@/components/site/useDemoUser";
import {
  PLACE_CLIPS,
  completeBooking,
  createGroupInvite,
  formatINR,
  getUser,
  listBookings,
  listCommissions,
  listSavedItineraries,
  publishItineraryFromBooking,
  subscribeDemoStore,
  type Booking,
  type CommissionEntry,
  type SavedItinerary,
} from "@/lib/demoApi";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";
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
  const [pubTitle, setPubTitle] = useState("");
  const [pubExp, setPubExp] = useState("");
  const [publishing, setPublishing] = useState<string | null>(null);

  const refresh = () => {
    setBookings(listBookings());
    setSaved(listSavedItineraries());
    const u = getUser();
    if (u) setComms(listCommissions(u.id));
  };

  useEffect(() => {
    refresh();
    return subscribeDemoStore(refresh);
  }, []);

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
        eyebrow="Traveler dashboard"
        title={`Hey, ${user.name.split(" ")[0]}`}
        sub="Build itineraries, book trips, complete them, then publish a special code. Earn commission when others complete your published routes."
      />

      <div className="mb-8 flex flex-wrap gap-3">
        <Link
          to="/builder"
          className="rounded-full px-5 py-2.5 text-[13px] font-bold text-white"
          style={{ background: RED }}
        >
          Open Shorts builder
        </Link>
        <Link
          to="/invite"
          className="rounded-full border px-5 py-2.5 text-[13px] font-bold"
          style={{ borderColor: "rgba(0,0,0,0.12)" }}
        >
          Invite Crew
        </Link>
        <Link to="/packages" className="rounded-full border px-5 py-2.5 text-[13px] font-bold" style={{ borderColor: "rgba(0,0,0,0.12)" }}>
          Published itineraries
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section
          className="rounded-3xl border p-5"
          style={{ borderColor: "rgba(0,0,0,0.07)" }}
        >
          <h2 className="text-[17px] font-bold">Saved itineraries</h2>
          <ul className="mt-4 space-y-3">
            {saved.length === 0 && (
              <li className="text-[13px] text-neutral-400">None yet — swipe places in the builder.</li>
            )}
            {saved.map((s) => (
              <li key={s.id} className="rounded-2xl bg-neutral-50 p-3">
                <p className="text-[14px] font-bold">{s.title}</p>
                <p className="text-[11px] text-neutral-500">
                  {s.id} · {s.placeIds.length} stops ·{" "}
                  {s.placeIds
                    .map((id) => PLACE_CLIPS.find((c) => c.id === id)?.place)
                    .filter(Boolean)
                    .slice(0, 3)
                    .join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="rounded-3xl border p-5"
          style={{ borderColor: "rgba(0,0,0,0.07)" }}
        >
          <h2 className="text-[17px] font-bold">Commission earned</h2>
          <p className="mt-1 text-[12px] text-neutral-500">
            When another traveler books your published itinerary and completes it.
          </p>
          <ul className="mt-4 space-y-2">
            {comms.length === 0 && (
              <li className="text-[13px] text-neutral-400">No commissions yet.</li>
            )}
            {comms.map((c) => (
              <li key={c.id} className="flex justify-between rounded-2xl bg-neutral-50 px-3 py-2 text-[13px]">
                <span>{c.title}</span>
                <span className="font-bold" style={{ color: GREEN }}>
                  +{formatINR(c.amount)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-8 rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
        <h2 className="text-[17px] font-bold">Bookings</h2>
        <p className="mt-1 text-[12px] text-neutral-500">
          Mark COMPLETED to unlock publishing a special code (codes only generate after completed status).
        </p>
        <div className="mt-4 space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="rounded-2xl border p-4" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-bold">{b.title}</p>
                  <p className="text-[12px] text-neutral-500">
                    {b.id} · {b.detail} · {formatINR(b.amount)}
                  </p>
                  <span
                    className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase"
                    style={{
                      background: b.status === "completed" ? GREEN_LIGHT : "#f5f5f5",
                      color: b.status === "completed" ? GREEN : "#666",
                    }}
                  >
                    {b.status}
                  </span>
                  {b.publishCode && (
                    <Link
                      to="/itinerary/$code"
                      params={{ code: b.publishCode }}
                      className="ml-2 font-mono text-[12px] font-bold"
                      style={{ color: RED }}
                    >
                      {b.publishCode}
                    </Link>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {b.status === "confirmed" && (
                    <button
                      onClick={async () => {
                        await completeBooking(b.id);
                        toast.success("Marked COMPLETED — you can publish now");
                        refresh();
                      }}
                      className="rounded-full px-4 py-1.5 text-[12px] font-bold text-white"
                      style={{ background: GREEN }}
                    >
                      Mark completed
                    </button>
                  )}
                  {b.status === "completed" && !b.publishCode && (
                    <button
                      onClick={() => {
                        setPublishing(b.id);
                        setPubTitle(b.title);
                        setPubExp("My experience videos and photos from this trip.");
                      }}
                      className="rounded-full px-4 py-1.5 text-[12px] font-bold text-white"
                      style={{ background: RED }}
                    >
                      Publish itinerary
                    </button>
                  )}
                </div>
              </div>
              {publishing === b.id && (
                <div className="mt-4 space-y-2 rounded-2xl bg-neutral-50 p-3">
                  <input
                    value={pubTitle}
                    onChange={(e) => setPubTitle(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-[13px]"
                    placeholder="Title"
                  />
                  <textarea
                    value={pubExp}
                    onChange={(e) => setPubExp(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-[13px]"
                    rows={2}
                    placeholder="Experience notes"
                  />
                  <button
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
                    className="rounded-full px-4 py-2 text-[12px] font-bold text-white"
                    style={{ background: RED }}
                  >
                    Generate code & publish
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border p-5" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
        <h2 className="text-[17px] font-bold">Invite Crew (multiplayer)</h2>
        <p className="mt-1 text-[13px] text-neutral-500">
          Share a link — each member claims and pays their own seat (individual EMI). Nobody waits for the whole group.
        </p>
        <button
          onClick={async () => {
            const inv = await createGroupInvite({
              title: `${user.name.split(" ")[0]}'s Crew Trip`,
              pricePerSeat: 18400,
              seatCount: 6,
            });
            toast.success(`Invite ${inv.code} created`);
            window.location.href = `/invite/${inv.code}`;
          }}
          className="mt-4 rounded-full px-5 py-2.5 text-[13px] font-bold text-white"
          style={{ background: RED }}
        >
          Create Invite Crew link
        </button>
      </section>
    </SiteShell>
  );
}
