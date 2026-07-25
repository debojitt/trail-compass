import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { sendSos, useCurrentUser, useStore } from "@/lib/store";

export const Route = createFileRoute("/trip/$id/sos")({
  head: () => ({
    meta: [{ title: "Echo SOS · NORTHNEST" }, { name: "description", content: "Swipe-to-broadcast — bypasses vendor masks, works offline." }],
  }),
  loader: ({ params }) => ({ id: params.id }),
  component: SosPage,
  notFoundComponent: () => (
    <SiteShell>
      <div className="py-20 text-center"><h1 className="text-xl font-bold">Trip not found</h1></div>
    </SiteShell>
  ),
});

function SosPage() {
  const { id } = Route.useLoaderData();
  const trip = useStore((s) => s.groupTrips.find((t) => t.id === id));
  const user = useCurrentUser();
  const [swipeX, setSwipeX] = useState(0);
  const [sent, setSent] = useState<{ ts: string; code: string } | null>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cleanup
    return () => setSwipeX(0);
  }, []);

  if (!trip) throw notFound();

  const width = barRef.current?.offsetWidth ?? 300;
  const maxX = width - 68;

  const onDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX - swipeX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const x = Math.max(0, Math.min(maxX, e.clientX - startX.current));
    setSwipeX(x);
  };
  const onUp = () => {
    dragging.current = false;
    if (swipeX >= maxX * 0.85) {
      const s = sendSos({ message: `SOS from ${user?.name ?? "guest"} on ${trip.title}`, lat: 25.5788 + Math.random() * 0.5, lng: 91.8933 + Math.random() * 0.5 });
      if (s) setSent({ ts: new Date().toLocaleTimeString(), code: `NN-SOS-${s.id.slice(-4).toUpperCase()}` });
    }
    setSwipeX(0);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-between px-4 pb-10 pt-16">
        <div>
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-500/20">
            <ShieldAlert size={28} className="text-red-400" />
          </div>
          <h1 className="mt-4 text-center text-[26px] font-bold tracking-tight">Echo SOS</h1>
          <p className="mt-2 text-center text-[13px] text-neutral-400">
            Broadcasts to nearest NORTHNEST ground team, all group members, and the nearest ITBP/Assam Rifles post — even past the last cell tower via cached mesh nodes.
          </p>

          <div className="mt-6 rounded-2xl bg-white/5 p-4 text-[12px] text-neutral-300">
            <p><strong className="text-white">Trip:</strong> {trip.title}</p>
            <p><strong className="text-white">User:</strong> {user?.name ?? "Guest"}</p>
            <p><strong className="text-white">Last cached location:</strong> Nongriat trailhead · 25.28° N, 91.68° E</p>
            <p><strong className="text-white">Group members alerted:</strong> {trip.seats.filter((s) => s.paid).length}</p>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-[11px] text-amber-200">
            <strong>Vendor-mask override:</strong> SOS bypasses planner masking. Real cab driver number and homestay contact will be revealed to the ground team.
          </div>

          {sent && (
            <div className="mt-4 rounded-2xl border border-green-500/50 bg-green-500/10 p-4 text-center">
              <CheckCircle2 size={28} className="mx-auto text-green-400" />
              <p className="mt-2 text-[13px] font-bold">Broadcast sent at {sent.ts}</p>
              <p className="mt-1 font-mono text-[14px] font-black text-green-400">{sent.code}</p>
              <p className="mt-2 text-[11px] text-neutral-400">Ground team ETA: 42 min · you'll receive a call shortly.</p>
            </div>
          )}
        </div>

        {/* Swipe to send */}
        <div
          ref={barRef}
          className="relative h-16 select-none overflow-hidden rounded-full bg-white/10"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-red-500/30"
            style={{ width: swipeX + 60 }}
          />
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-[13px] font-bold uppercase tracking-widest text-white/70">
            {sent ? "Broadcast delivered" : "Swipe to broadcast"}
          </div>
          <div
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            style={{ transform: `translateX(${swipeX}px)` }}
            className="absolute inset-y-1 left-1 grid h-14 w-14 cursor-grab place-items-center rounded-full bg-red-500 text-white shadow-2xl"
          >
            <ShieldAlert size={20} />
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] text-neutral-500">
          Demo mode — no real emergency service is contacted.
        </p>
      </div>
    </div>
  );
}
