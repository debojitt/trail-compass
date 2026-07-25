import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Clapperboard, Trash2 } from "lucide-react";
import { ShortsBuilder } from "@/components/site/ShortsBuilder";
import { useDemoUser } from "@/components/site/useDemoUser";
import {
  clearCart,
  formatINR,
  getCart,
  PLACE_CLIPS,
  removeFromCart,
  saveItinerary,
  undoLastCartAction,
} from "@/lib/demoApi";
import { GREEN, RED } from "@/lib/brand";
import { toast } from "sonner";

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "Shorts Builder · NORTHNEST" },
      {
        name: "description",
        content: "Build your Northeast itinerary in a YouTube Shorts–style vertical feed.",
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
    <div className="flex min-h-dvh flex-col bg-[#0f0f0f] text-white">
      <header className="sticky top-0 z-40 shrink-0 border-b border-white/10 bg-[#0f0f0f]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="grid h-9 w-9 place-items-center rounded-full text-white/80 hover:bg-white/10"
              aria-label="Back home"
            >
              <ArrowLeft size={18} />
            </Link>
            <Clapperboard size={18} style={{ color: RED }} />
            <div className="leading-tight">
              <p className="text-[15px] font-bold">Shorts</p>
              <p className="text-[11px] text-white/45">Itinerary builder</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white/70 sm:inline">
              {cart.length} stop{cart.length === 1 ? "" : "s"}
            </span>
            <Link
              to="/dashboard/traveler"
              className="rounded-full px-3.5 py-2 text-[12px] font-bold text-white/90 hover:bg-white/10"
            >
              My Nest
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-5 px-3 py-4 md:px-6 md:py-6 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
        <section className="flex w-full flex-col items-center xl:pr-12">
          <ShortsBuilder onCartChange={setCart} />
          <p className="mt-3 text-center text-[12px] text-white/40">
            Scroll like Shorts · swipe → add (genie) · ← skip
          </p>
        </section>

        <aside
          id="nn-playlist-dock"
          className="flex w-full shrink-0 flex-col rounded-2xl border border-white/10 bg-[#212121] lg:sticky lg:top-20 lg:w-[320px] lg:max-h-[min(675px,calc(100dvh-6.5rem))]"
        >
          <div className="border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <div
                id="nn-playlist-dock-icon"
                className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/15 bg-[#0f0f0f]"
              >
                {places[0] ? (
                  <img src={places[0].poster} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Clapperboard size={18} className="text-white/45" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Playlist</p>
                <p className="mt-0.5 text-[15px] font-bold">Your trip · {places.length}</p>
              </div>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-3 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-3 py-2 text-[13px] text-white outline-none placeholder:text-white/35 focus:border-white/25"
              placeholder="Trip name"
            />
          </div>

          <ul
            className="min-h-[160px] flex-1 space-y-1.5 overflow-y-auto px-3 py-3 lg:min-h-0"
            style={{ scrollbarWidth: "thin" }}
          >
            {places.length === 0 && (
              <li className="rounded-xl bg-white/[0.04] px-3 py-8 text-center text-[13px] text-white/40">
                Scroll Shorts and tap + to build your route.
              </li>
            )}
            {places.map((p, i) =>
              p ? (
                <li
                  key={p.id}
                  className="group flex items-center gap-3 rounded-xl bg-white/[0.04] p-2 hover:bg-white/[0.07]"
                >
                  <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md">
                    <img src={p.poster} alt="" className="h-full w-full object-cover" />
                    <span className="absolute left-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded bg-black/75 px-0.5 text-[9px] font-bold">
                      {i + 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{p.place}</p>
                    <p className="truncate text-[11px] text-white/45">{p.state}</p>
                    <p className="mt-0.5 text-[11px] text-white/60">
                      {formatINR(p.priceMin)}–{formatINR(p.priceMax)}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${p.place}`}
                    onClick={() => setCart(removeFromCart(p.id))}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/40 hover:bg-white/10 hover:text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ) : null,
            )}
          </ul>

          <div className="space-y-2 border-t border-white/10 p-4">
            <button
              type="button"
              onClick={save}
              disabled={saving || places.length === 0}
              className="w-full rounded-full py-2.5 text-[14px] font-bold text-white disabled:opacity-40"
              style={{ background: RED }}
            >
              {saving ? "Saving…" : "Save to dashboard"}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCart(undoLastCartAction())}
                className="flex-1 rounded-full border border-white/10 py-2 text-[12px] font-semibold text-white/70 hover:bg-white/5"
              >
                Undo
              </button>
              <button
                type="button"
                onClick={() => {
                  clearCart();
                  setCart([]);
                }}
                className="flex-1 rounded-full border border-white/10 py-2 text-[12px] font-semibold text-white/70 hover:bg-white/5"
              >
                Clear
              </button>
            </div>
            <Link
              to="/dashboard/traveler"
              className="block pt-1 text-center text-[12px] font-semibold"
              style={{ color: GREEN }}
            >
              Open traveler dashboard →
            </Link>
          </div>
        </aside>
      </main>
    </div>
  );
}
