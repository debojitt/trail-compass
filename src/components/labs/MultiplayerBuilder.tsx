import { useMemo, useState } from "react";
import { Trash2, Zap, Users, Check, Copy } from "lucide-react";

type Module = { id: number; name: string; cost: number };

const INITIAL: Module[] = [
  { id: 1, name: "4x4 Expedition SUV (Guwahati to Tawang)", cost: 18000 },
  { id: 2, name: "Kaziranga Sanctuary 2-Night Boutique Stay", cost: 14000 },
  { id: 3, name: "Private Bonfire & Khasi Tribe Guide", cost: 4000 },
];

const CREW_SIZES = [1, 2, 3, 4, 6];
const SHARE_URL = "https://northnest.in/crew/rahul-tawang-909";

export function MultiplayerBuilder() {
  const [modules, setModules] = useState<Module[]>(INITIAL);
  const [crew, setCrew] = useState(4);
  const [copied, setCopied] = useState(false);

  const total = useMemo(() => modules.reduce((s, m) => s + m.cost, 0), [modules]);
  const perPerson = crew > 0 ? Math.round(total / crew) : 0;
  const emiPerPerson = perPerson > 0 ? Math.round(perPerson / 6) : 0;

  const remove = (id: number) => setModules((m) => m.filter((x) => x.id !== id));

  const share = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-white shadow-2xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="rounded-md border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-cyan-300">
            ROUTE ID: NN-DRAFT-909
          </span>
          <h2 className="mt-3 text-[26px] font-bold leading-tight">
            Rahul's Tawang Cloud Expedition
          </h2>
          <p className="mt-1 text-[13px] text-white/50">Zero middleman markups · Live split math</p>
        </div>
        <button
          onClick={share}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold transition ${
            copied
              ? "bg-emerald-500 text-white"
              : "bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:brightness-110"
          }`}
        >
          {copied ? (
            <>
              <Check size={14} /> Invite Link Copied!
            </>
          ) : (
            <>
              <Zap size={14} /> Invite Crew (Multiplayer)
            </>
          )}
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-white/80">
            <Users size={16} className="text-cyan-300" /> Expedition Crew Size:
          </div>
          <div className="flex items-center gap-2">
            {CREW_SIZES.map((n) => {
              const active = crew === n;
              return (
                <button
                  key={n}
                  onClick={() => setCrew(n)}
                  className={`h-10 w-10 rounded-full text-[13px] font-bold transition ${
                    active
                      ? "bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.6)]"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">
          True-Cost Timeline
        </p>
        <div className="mt-3 divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.02]">
          {modules.length === 0 && (
            <p className="p-6 text-center text-sm text-white/40">
              All modules removed. Add some back to see the split math.
            </p>
          )}
          {modules.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <p className="flex-1 text-[13px] text-white/90">{m.name}</p>
              <span className="font-mono text-[13px] font-semibold text-emerald-300">
                ₹{m.cost.toLocaleString("en-IN")}
              </span>
              <button
                onClick={() => remove(m.id)}
                className="grid h-8 w-8 place-items-center rounded-full text-white/40 hover:bg-red-500/20 hover:text-red-300"
                aria-label="Remove module"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <FinCol
          label="Zero middleman markups"
          value={`₹${total.toLocaleString("en-IN")}`}
          title="Total Wholesale Cost"
        />
        <FinCol
          label="Splits automatically"
          value={`₹${perPerson.toLocaleString("en-IN")}`}
          title="Per Person Share"
        />
        <div className="rounded-2xl border border-cyan-400/50 bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 p-4 shadow-[0_0_30px_rgba(34,211,238,0.25)]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">
            No-Cost EMI Hook
          </p>
          <p className="mt-2 text-[24px] font-bold text-white">
            ₹{emiPerPerson.toLocaleString("en-IN")}{" "}
            <span className="text-[13px] font-medium text-cyan-200">/ mo</span>
          </p>
          <p className="mt-1 text-[11px] text-cyan-100/80">6 months • 0% interest</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[10px] text-white/30">
        <Copy size={10} /> {SHARE_URL}
      </div>
    </div>
  );
}

function FinCol({ label, value, title }: { label: string; value: string; title: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">{title}</p>
      <p className="mt-2 text-[22px] font-bold text-white">{value}</p>
      <p className="mt-1 text-[11px] text-white/50">{label}</p>
    </div>
  );
}
