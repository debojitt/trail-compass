import { createFileRoute } from "@tanstack/react-router";
import { SpotlightModal } from "@/components/labs/SpotlightModal";
import { SwipeDraftFeed } from "@/components/labs/SwipeDraftFeed";
import { MultiplayerBuilder } from "@/components/labs/MultiplayerBuilder";
import { ExplorerPass } from "@/components/labs/ExplorerPass";
import { ExploreNortheast } from "@/components/labs/ExploreNortheast";
import { FlashNfcSimulator } from "@/components/labs/FlashNfcSimulator";

export const Route = createFileRoute("/labs")({
  head: () => ({
    meta: [
      { title: "NORTHNEST Labs — Interactive Feature Playground" },
      {
        name: "description",
        content:
          "Try Northnest's Spotlight command, swipe-to-build itineraries, multiplayer split math, Explorer Pass loyalty and NFC host tools — all live.",
      },
      { property: "og:title", content: "NORTHNEST Labs — Interactive Feature Playground" },
      {
        property: "og:description",
        content:
          "Try Northnest's Spotlight command, swipe-to-build itineraries, multiplayer split math, Explorer Pass loyalty and NFC host tools.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LabsPage,
});

function LabsPage() {
  return (
    <div className="min-h-screen bg-[#05070f] text-white">
      <header className="border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-300">
              Northnest / Labs
            </p>
            <h1 className="mt-2 text-[32px] font-bold leading-tight md:text-[40px]">
              Interactive Feature Playground
            </h1>
            <p className="mt-2 max-w-xl text-[14px] text-white/60">
              Six working prototypes powering the next Northnest release — press{" "}
              <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[11px]">
                ⌘K
              </kbd>{" "}
              anywhere to open the command bar.
            </p>
          </div>
          <SpotlightModal />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-24 px-6 py-16">
        <Section
          eyebrow="01 · Command"
          title="Spotlight — instant route lookup"
          body="Open with ⌘K, filter by pill, or paste an Instagram Reel Route ID like NN-MEGH-804 to load a dossier."
        >
          <div className="grid place-items-center rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-10">
            <p className="text-center text-sm text-white/60">
              Trigger lives in the header — try ⌘K or Ctrl+K now.
            </p>
          </div>
        </Section>

        <Section
          eyebrow="02 · Draft"
          title="Swipe to build your itinerary"
          body="Drag right to add · left to skip · undo to rewind. Cart, EMI and swipe stack update live."
        >
          <SwipeDraftFeed />
        </Section>

        <Section
          eyebrow="03 · Multiplayer"
          title="Split the trip, not the friendship"
          body="Change crew size to watch per-person cost and EMI recompute. Remove modules to drop the wholesale total."
        >
          <MultiplayerBuilder />
        </Section>

        <Section
          eyebrow="04 · Loyalty"
          title="Explorer Pass — status, not spam"
          body="Simulate completing verified actions and watch the ring fill and reward tiers unlock in real time."
        >
          <ExplorerPass />
        </Section>

        <Section
          eyebrow="05 · Story"
          title="Explore Northeast — scroll-pinned showroom"
          body="Left card pins while narrative blocks scrub in on the right. Scroll slowly to feel the choreography."
        >
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0B0F19]">
            <ExploreNortheast />
          </div>
        </Section>

        <Section
          eyebrow="06 · Host"
          title="Flash NFC — 0% commission Trojan horse"
          body="Toggle Flash Mode, tap the NFC stand and watch the host's 10% escrow tick up per simulated guest booking."
        >
          <FlashNfcSimulator />
        </Section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-[12px] text-white/40">
        Northnest Labs · Interactive prototypes · 2026
      </footer>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-300">{eyebrow}</p>
        <h2 className="mt-2 text-[26px] font-bold leading-tight md:text-[32px]">{title}</h2>
        <p className="mt-2 text-[14px] text-white/60">{body}</p>
      </div>
      {children}
    </section>
  );
}
