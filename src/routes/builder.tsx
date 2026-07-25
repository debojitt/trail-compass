import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { ShortsBuilder } from "@/components/site/ShortsBuilder";
import { useDemoUser } from "@/components/site/useDemoUser";
import { clearCart, formatINR, getCart, PLACE_CLIPS, saveItinerary } from "@/lib/demoApi";
import { GREEN, RED } from "@/lib/brand";
import { toast } from "sonner";

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "Itinerary Builder · NORTHNEST" },
      {
        name: "description",
        content: "Swipe places like YouTube Shorts to build your Northeast itinerary.",
      },
    ],
  }),
  component: BuilderPage,
});

function BuilderPage() {
  const user = useDemoUser();
  const [cart, setCart] = useState<string[]>(() => (typeof window !== "undefined" ? getCart() : []));
  const [title, setTitle] = useState("My Northeast Trail");
  const [saving, setSaving] = useState(false);

  const places = cart
    .map((id) => PLACE_CLIPS.find((c) => c.id === id))
    .filter(Boolean);

  const save = async () => {
    if (!user) {
      toast.error("Sign in to save your itinerary");
      return;
    }
    setSaving(true);
    try {
      const itin = await saveItinerary(title);
      toast.success(`Saved ${itin.id} to your dashboard`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    }
    setSaving(false);
  };

  return (
    <SiteShell>
      <PageHero
        eyebrow="Shorts builder"
        title="Swipe your trip together."
        sub="Right = add · Left = skip · Scroll = next. Instant undo. Save to your traveler dashboard."
        backFallback="/"
        backLabel="Home"
      />
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <ShortsBuilder onCartChange={setCart} />
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div
            className="rounded-3xl border bg-white p-5 shadow-sm"
            style={{ borderColor: "rgba(0,0,0,0.07)" }}
          >
            <h3 className="text-[16px] font-bold">Your itinerary</h3>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-3 w-full rounded-2xl border px-3 py-2 text-[14px] outline-none"
              style={{ borderColor: "rgba(0,0,0,0.12)" }}
              placeholder="Trip name"
            />
            <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
              {places.length === 0 && (
                <li className="text-[13px] text-neutral-400">No stops yet — start swiping.</li>
              )}
              {places.map((p) =>
                p ? (
                  <li key={p.id} className="flex gap-2 text-[13px]">
                    <img src={p.poster} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold leading-tight">{p.place}</p>
                      <p className="text-[11px] text-neutral-500">
                        {formatINR(p.priceMin)}–{formatINR(p.priceMax)}
                      </p>
                    </div>
                  </li>
                ) : null,
              )}
            </ul>
            <button
              onClick={save}
              disabled={saving || places.length === 0}
              className="mt-4 w-full rounded-full py-2.5 text-[14px] font-bold text-white disabled:opacity-50"
              style={{ background: RED }}
            >
              {saving ? "Saving…" : "Save to dashboard"}
            </button>
            <button
              onClick={() => {
                clearCart();
                setCart([]);
              }}
              className="mt-2 w-full rounded-full py-2 text-[13px] font-semibold text-neutral-600"
            >
              Clear cart
            </button>
            <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">
              After you book and the trip status is <strong>COMPLETED</strong>, you can publish this
              itinerary with a special code (e.g. NN-MEGH-804) on Packages → Published Itineraries.
            </p>
          </div>
          <Link
            to="/dashboard/traveler"
            className="block text-center text-[13px] font-semibold"
            style={{ color: GREEN }}
          >
            Open traveler dashboard →
          </Link>
        </aside>
      </div>
    </SiteShell>
  );
}
