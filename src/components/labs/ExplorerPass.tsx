import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Lock, Check, Plus, RotateCcw, Sparkles } from "lucide-react";

type Milestone = {
  requiredActions: number;
  title: string;
  perk: string;
};

const MILESTONES: Milestone[] = [
  {
    requiredActions: 1,
    title: "Local Taste Pass",
    perk: "Free private bonfire & Assamese organic tea tasting",
  },
  {
    requiredActions: 3,
    title: "Suite Upgrade Pass",
    perk: "Guaranteed room upgrade on next boutique stay",
  },
  {
    requiredActions: 5,
    title: "Sanctuary Extension",
    perk: "2 free extra nights at partner boutique homestays",
  },
];

const TOTAL = 5;

export function ExplorerPass() {
  const [completed, setCompleted] = useState(3);
  const pct = (completed / TOTAL) * 100;

  return (
    <div className="mx-auto w-full max-w-md">
      <div
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800 via-slate-950 to-black p-6 text-white shadow-2xl"
        style={{
          backgroundImage:
            "radial-gradient(600px 200px at 20% 10%, rgba(34,211,238,0.18), transparent 60%), radial-gradient(500px 200px at 90% 90%, rgba(16,185,129,0.15), transparent 60%)",
        }}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-cyan-300">
              Northnest Pioneer Card
            </p>
            <h2 className="mt-1 text-[26px] font-black leading-none">EXPLORER PASS</h2>
            <p className="mt-2 text-[13px] text-white/60">Rahul Sharma · Verified Member</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/90 backdrop-blur hover:bg-white/15">
            <Wallet size={13} /> Add to Wallet
          </button>
        </div>

        <div className="relative mt-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/40">Status</p>
              <p className="text-[16px] font-bold">Level 2: Expedition Veteran</p>
            </div>
            <p className="font-mono text-[13px] text-cyan-300">
              {completed} / {TOTAL} Milestones
            </p>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_20px_rgba(34,211,238,0.7)]"
              animate={{ width: `${pct}%` }}
              transition={{ type: "spring", damping: 20, stiffness: 140 }}
            />
          </div>
        </div>

        <div className="relative mt-6 space-y-3">
          {MILESTONES.map((m) => {
            const unlocked = completed >= m.requiredActions;
            return (
              <motion.div
                key={m.title}
                animate={{ opacity: unlocked ? 1 : 0.55 }}
                className={`flex items-start gap-3 rounded-2xl border p-3.5 transition ${
                  unlocked
                    ? "border-emerald-400/50 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div
                  className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl ${
                    unlocked ? "bg-emerald-400/20 text-emerald-300" : "bg-white/10 text-white/40"
                  }`}
                >
                  {unlocked ? <Check size={18} /> : <Lock size={16} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-bold text-white">{m.title}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        unlocked
                          ? "bg-emerald-400/20 text-emerald-200"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {m.requiredActions} Action{m.requiredActions > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/60">{m.perk}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="relative mt-6 flex items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-[11px] text-white/50">
            <Sparkles size={12} className="text-cyan-300" /> Simulate earning more actions
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCompleted((c) => Math.min(TOTAL, c + 1))}
              className="flex items-center gap-1 rounded-full bg-cyan-400 px-3 py-1.5 text-[11px] font-bold text-slate-950 hover:brightness-110"
            >
              <Plus size={12} /> Simulate Action
            </button>
            <button
              onClick={() => setCompleted(0)}
              className="flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/70 hover:bg-white/10"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
