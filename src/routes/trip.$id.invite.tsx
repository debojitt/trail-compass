import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { ensureInviteForTrip } from "@/lib/demoApi";
import { useStore } from "@/lib/store";

/**
 * Legacy /trip/$id/invite → multiplayer flywheel /invite/$code (demoApi).
 */
export const Route = createFileRoute("/trip/$id/invite")({
  head: () => ({
    meta: [
      { title: "Invite crew · NORTHNEST" },
      { name: "description", content: "Per-seat payment — no group-block bottleneck." },
    ],
  }),
  loader: ({ params }) => ({ id: params.id }),
  component: TripInviteRedirect,
});

function TripInviteRedirect() {
  const { id } = Route.useLoaderData();
  const trip = useStore((s) => s.groupTrips.find((t) => t.id === id));
  const navigate = useNavigate();

  useEffect(() => {
    if (!trip) {
      void navigate({ to: "/invite" });
      return;
    }
    const inv = ensureInviteForTrip({
      tripId: trip.id,
      title: trip.title,
      cover: trip.cover,
      pricePerSeat: trip.perSeat,
      seatCount: trip.seats.length || 4,
    });
    void navigate({ to: "/invite/$code", params: { code: inv.code }, replace: true });
  }, [trip, navigate]);

  return (
    <SiteShell>
      <div className="py-20 text-center text-[14px] text-neutral-500">
        Opening Invite Crew…
      </div>
    </SiteShell>
  );
}
