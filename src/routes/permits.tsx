import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, FileCheck, QrCode, ShieldCheck, WifiOff } from "lucide-react";
import { PageHero, SiteShell } from "@/components/site/SiteShell";
import type { PermitRule } from "@/data/catalog";
import {
  applyForPermit,
  fetchPermitRules,
  formatINR,
  listPermits,
  subscribeDemoStore,
  type PermitApplication,
} from "@/lib/demoApi";
import { useDemoUser } from "@/components/site/useDemoUser";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";

export const Route = createFileRoute("/permits")({
  head: () => ({
    meta: [
      { title: "Permits · NORTHNEST" },
      {
        name: "description",
        content: "ILP and PAP requirements for every Northeast Indian state, filed digitally.",
      },
    ],
  }),
  component: PermitsPage,
});

function PermitsPage() {
  const user = useDemoUser();
  const [rules, setRules] = useState<PermitRule[] | null>(null);
  const [permits, setPermits] = useState<PermitApplication[]>([]);

  /* form state */
  const [stateSlug, setStateSlug] = useState("arunachal-pradesh");
  const [applicant, setApplicant] = useState("");
  const [window_, setWindow_] = useState("12 Oct — 19 Oct 2026");
  const [busy, setBusy] = useState(false);
  const [justIssued, setJustIssued] = useState<PermitApplication | null>(null);

  useEffect(() => {
    let alive = true;
    fetchPermitRules().then((r) => {
      if (alive) setRules(r);
    });
    setPermits(listPermits());
    const unsub = subscribeDemoStore(() => setPermits(listPermits()));
    return () => {
      alive = false;
      unsub();
    };
  }, []);

  useEffect(() => {
    if (user && !applicant) setApplicant(user.name);
  }, [user, applicant]);

  const permitStates = rules?.filter((r) => r.indian !== "None") ?? [];
  const selectedRule = rules?.find((r) => r.stateSlug === stateSlug);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicant.trim() || !selectedRule) return;
    setBusy(true);
    const issued = await applyForPermit({
      state: selectedRule.state,
      permitType: selectedRule.indian,
      applicant: applicant.trim(),
      travelWindow: window_,
    });
    setBusy(false);
    setJustIssued(issued);
  };

  return (
    <SiteShell>
      <PageHero
        eyebrow="Permits"
        title="Filed before you fly."
        sub="Four of the eight states need an Inner Line Permit. Apply here and carry the QR — it works offline at every checkgate."
      />

      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        {/* Left: rules table */}
        <div>
          <h2 className="mb-4 text-[18px] font-bold tracking-tight">
            Who needs what, state by state
          </h2>
          {rules === null ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-neutral-50" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {rules.map((r) => (
                <div
                  key={r.stateSlug}
                  className="rounded-2xl border bg-white p-4"
                  style={{ borderColor: "rgba(0,0,0,0.07)" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[14px] font-bold">{r.state}</p>
                    <div className="flex gap-1.5">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={
                          r.indian === "None"
                            ? { background: "#f5f5f5", color: "#9ca3af" }
                            : { background: GREEN_LIGHT, color: GREEN }
                        }
                      >
                        Indians: {r.indian === "None" ? "No permit" : r.indian}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={
                          r.foreign === "None"
                            ? { background: "#f5f5f5", color: "#9ca3af" }
                            : { background: "rgba(226,55,68,0.08)", color: RED }
                        }
                      >
                        Foreigners: {r.foreign === "None" ? "Registration only" : r.foreign}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-neutral-500">{r.note}</p>
                  {r.indian !== "None" && (
                    <p className="mt-1 text-[11px] font-semibold text-neutral-400">
                      Processing {r.processing} · fee {r.fee ? formatINR(r.fee) : "free"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { icon: FileCheck, t: "Filed digitally", b: "No queues at Deputy Commissioner offices." },
              { icon: WifiOff, t: "Works offline", b: "QR cached on-device for zero-signal checkgates." },
              { icon: ShieldCheck, t: "Ground-verified", b: "Our teams re-validate at every entry point." },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.t} className="rounded-2xl bg-neutral-50 p-4">
                  <Icon size={18} style={{ color: GREEN }} />
                  <p className="mt-2 text-[13px] font-bold">{f.t}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-500">{f.b}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: application form + wallet */}
        <div>
          <div
            className="rounded-3xl border bg-white p-6"
            style={{ borderColor: "rgba(0,0,0,0.08)" }}
          >
            <h2 className="text-[18px] font-bold tracking-tight">Apply now (demo)</h2>
            <p className="mt-1 text-[12px] text-neutral-500">
              Instant approval in this prototype — the real flow talks to state portals.
            </p>
            <form onSubmit={submit} className="mt-4 space-y-3">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  State
                </span>
                <select
                  value={stateSlug}
                  onChange={(e) => setStateSlug(e.target.value)}
                  className="mt-1 w-full rounded-2xl border bg-white px-4 py-2.5 text-[14px] outline-none"
                  style={{ borderColor: "rgba(0,0,0,0.12)" }}
                >
                  {permitStates.map((r) => (
                    <option key={r.stateSlug} value={r.stateSlug}>
                      {r.state} ({r.indian})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  Full name (as on ID)
                </span>
                <input
                  value={applicant}
                  onChange={(e) => setApplicant(e.target.value)}
                  required
                  placeholder="Ananya Sharma"
                  className="mt-1 w-full rounded-2xl border px-4 py-2.5 text-[14px] outline-none transition-colors focus:border-neutral-400"
                  style={{ borderColor: "rgba(0,0,0,0.12)" }}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  Travel window
                </span>
                <input
                  value={window_}
                  onChange={(e) => setWindow_(e.target.value)}
                  required
                  className="mt-1 w-full rounded-2xl border px-4 py-2.5 text-[14px] outline-none transition-colors focus:border-neutral-400"
                  style={{ borderColor: "rgba(0,0,0,0.12)" }}
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full py-3 text-[14px] font-bold text-white transition-opacity disabled:opacity-60"
                style={{ background: RED }}
              >
                {busy ? "Filing with the state portal…" : `Apply for ${selectedRule?.indian ?? "permit"}`}
              </button>
            </form>

            {justIssued && (
              <div
                className="mt-4 rounded-2xl border border-dashed p-4 text-center"
                style={{ borderColor: GREEN, background: GREEN_LIGHT }}
              >
                <BadgeCheck size={22} className="mx-auto" style={{ color: GREEN }} />
                <p className="mt-1 text-[13px] font-bold" style={{ color: GREEN }}>
                  Approved — {justIssued.id}
                </p>
                <p className="text-[11px] text-neutral-500">
                  Added to your permit wallet below.
                </p>
              </div>
            )}
          </div>

          {/* Permit wallet */}
          <div className="mt-6">
            <h2 className="mb-3 text-[18px] font-bold tracking-tight">Your permit wallet</h2>
            {permits.length === 0 ? (
              <div className="rounded-3xl bg-neutral-50 py-10 text-center">
                <QrCode size={22} className="mx-auto text-neutral-300" />
                <p className="mt-2 text-[13px] text-neutral-500">
                  No permits yet — approved permits appear here as offline QR cards.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {permits.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-4 rounded-3xl border bg-white p-4"
                    style={{ borderColor: "rgba(0,0,0,0.08)" }}
                  >
                    <div
                      className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl"
                      style={{ background: "#111" }}
                    >
                      <QrCode size={34} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[14px] font-bold">
                          {p.permitType} · {p.state}
                        </p>
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase"
                          style={{ background: GREEN_LIGHT, color: GREEN }}
                        >
                          {p.status}
                        </span>
                      </div>
                      <p className="truncate text-[12px] text-neutral-500">
                        {p.applicant} · {p.travelWindow}
                      </p>
                      <p className="text-[11px] font-semibold tracking-wider text-neutral-400">
                        {p.id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
