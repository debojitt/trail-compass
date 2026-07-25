import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Clapperboard, ShoppingBag, Trash2, X } from "lucide-react";
import { ShortsBuilder } from "@/components/site/ShortsBuilder";
import { useDemoUser } from "@/components/site/useDemoUser";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import type { PlaceClip } from "@/data/demoUniverse";

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
  const [playlistOpen, setPlaylistOpen] = useState(false);

  const places = cart
    .map((id) => PLACE_CLIPS.find((c) => c.id === id))
    .filter(Boolean) as PlaceClip[];

  /* Prevent page rubber-band / double-scroll behind fullscreen reel */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.documentElement.style.overscrollBehavior;
    const apply = () => {
      if (mq.matches) {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overscrollBehavior = "none";
      } else {
        document.body.style.overflow = prevOverflow;
        document.documentElement.style.overscrollBehavior = prevOverscroll;
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.overscrollBehavior = prevOverscroll;
    };
  }, []);

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

  const playlistProps = {
    places,
    title,
    setTitle,
    saving,
    save,
    setCart,
  };

  return (
    <div className="nn-builder-shell relative flex min-h-dvh flex-col bg-[#0f0f0f] text-white">
      <header className="absolute inset-x-0 top-0 z-40 shrink-0 border-b border-transparent bg-gradient-to-b from-black/75 via-black/35 to-transparent lg:sticky lg:border-white/10 lg:bg-[#0f0f0f]/95 lg:backdrop-blur lg:from-transparent lg:via-transparent lg:to-transparent">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 px-4 pt-[env(safe-area-inset-top)] md:px-6 lg:pt-0">
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="grid h-9 w-9 place-items-center rounded-full text-white/80 hover:bg-white/10"
              aria-label="Back home"
            >
              <ArrowLeft size={18} />
            </Link>
            <Clapperboard size={18} className="hidden sm:block" style={{ color: RED }} />
            <div className="leading-tight">
              <p className="text-[15px] font-bold">Shorts</p>
              <p className="hidden text-[11px] text-white/45 sm:block">Itinerary builder</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white/70 sm:inline lg:inline">
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

      <main className="relative mx-auto flex w-full max-w-[1200px] flex-1 flex-col lg:flex-row lg:items-start lg:justify-center lg:gap-10 lg:px-6 lg:py-6">
        <section className="nn-builder-reel flex w-full flex-col items-center lg:relative lg:static xl:pr-12">
          <ShortsBuilder onCartChange={setCart} />
          <p className="mt-3 hidden text-center text-[12px] text-white/40 lg:block">
            Scroll like Shorts · swipe → add (genie) · ← skip
          </p>
        </section>

        <aside
          id="nn-playlist-dock"
          className="hidden w-full shrink-0 flex-col rounded-2xl border border-white/10 bg-[#212121] lg:sticky lg:top-20 lg:flex lg:w-[320px] lg:max-h-[min(675px,calc(100dvh-6.5rem))]"
        >
          <PlaylistPanel {...playlistProps} showDockIcon />
        </aside>
      </main>

      {/* Floating cart — genie target on phone; tap to review playlist */}
      <button
        type="button"
        id="nn-playlist-fab"
        aria-label={`Open playlist · ${places.length} stops`}
        onClick={() => setPlaylistOpen(true)}
        className={`fixed z-40 grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-white/20 bg-[#212121] shadow-[0_12px_40px_rgba(0,0,0,0.55)] transition-opacity lg:hidden ${
          playlistOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={{
          right: "max(1rem, env(safe-area-inset-right))",
          bottom: "max(1.25rem, env(safe-area-inset-bottom))",
        }}
      >
        {places[0] ? (
          <img src={places[0].poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <ShoppingBag size={22} className="relative z-[1] text-white/80" />
        )}
        <span
          className="absolute -right-1 -top-1 z-[2] grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold text-white"
          style={{ background: RED }}
        >
          {places.length}
        </span>
        {places[0] && <span className="absolute inset-0 bg-black/35" />}
        {places[0] && (
          <ShoppingBag size={18} className="relative z-[1] text-white drop-shadow" />
        )}
      </button>

      <Sheet open={playlistOpen} onOpenChange={setPlaylistOpen}>
        <SheetContent
          side="bottom"
          className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden rounded-t-3xl border-white/10 bg-[#212121] p-0 text-white [&>button]:hidden"
        >
          <SheetHeader className="shrink-0 border-b border-white/10 px-4 pb-3 pt-4 text-left">
            <div className="flex items-center justify-between gap-3">
              <SheetTitle className="text-white">Your trip · {places.length}</SheetTitle>
              <button
                type="button"
                aria-label="Close playlist"
                onClick={() => setPlaylistOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-white/70 hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]">
            <PlaylistPanel {...playlistProps} showDockIcon={false} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function PlaylistPanel({
  places,
  title,
  setTitle,
  saving,
  save,
  setCart,
  showDockIcon,
}: {
  places: PlaceClip[];
  title: string;
  setTitle: (v: string) => void;
  saving: boolean;
  save: () => void;
  setCart: (ids: string[]) => void;
  showDockIcon: boolean;
}) {
  return (
    <>
      <div className="border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          {showDockIcon && (
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
          )}
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
        className="min-h-[120px] flex-1 space-y-1.5 overflow-y-auto px-3 py-3 lg:min-h-0"
        style={{ scrollbarWidth: "thin" }}
      >
        {places.length === 0 && (
          <li className="rounded-xl bg-white/[0.04] px-3 py-8 text-center text-[13px] text-white/40">
            Scroll Shorts and tap + to build your route.
          </li>
        )}
        {places.map((p, i) => (
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
        ))}
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
    </>
  );
}
