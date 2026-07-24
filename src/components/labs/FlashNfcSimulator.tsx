import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Smartphone, DollarSign, Zap, MapPin } from "lucide-react";

type Trip = { title: string; city: string; price: number; time: string };

const TRIPS: Trip[] = [
  {
    title: "Sunset Brahmaputra River Cruise & Dinner",
    city: "Guwahati Hub",
    price: 2500,
    time: "Executing Tonight • Instant Book",
  },
  {
    title: "Jorhat Tea Estate & Heritage Tasting",
    city: "Jorhat Town",
    price: 1800,
    time: "Executing Tomorrow Morning",
  },
];

export function FlashNfcSimulator() {
  const [flashMode, setFlashMode] = useState(true);
  const [commission, setCommission] = useState(1250);
  const [bounce, setBounce] = useState(0);

  const tap = () => {
    if (!flashMode) return;
    setCommission((c) => c + 250);
    setBounce((b) => b + 1);
  };

  return (
    <div className="mx-auto w-full max-w-lg rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6 text-white shadow-2xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-bold">Maplewood Homestay Hub</h2>
          <span className="mt-1 inline-block rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            0% Commission Sanctuary Node
          </span>
        </div>
        <label className="flex items-center gap-2 text-[12px] font-semibold text-white/70">
          Flash Mode
          <button
            onClick={() => setFlashMode((f) => !f)}
            className={`relative h-6 w-11 rounded-full transition ${
              flashMode ? "bg-emerald-500" : "bg-white/15"
            }`}
            aria-label="Toggle Flash Mode"
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                flashMode ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </label>
      </div>

      <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 to-black p-6 text-center">
        <motion.div
          key={bounce}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.25, 0.95, 1] }}
          transition={{ duration: 0.5 }}
          className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
        >
          <Smartphone size={30} />
        </motion.div>
        <p className="mt-3 text-[13px] font-semibold text-white">Tap Phone at Reception</p>
        <p className="mt-1 text-[11px] text-white/50">
          Physical NFC desk stand · Guest sightseeing 10% payout
        </p>
        <button
          onClick={tap}
          disabled={!flashMode}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-2.5 text-[13px] font-bold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.4)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <Zap size={14} /> Simulate Guest NFC Tap
        </button>
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">
          Triggered Inventory Feed
        </p>
        <AnimatePresence initial={false}>
          {flashMode ? (
            <motion.div
              key="feed"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2 overflow-hidden"
            >
              {TRIPS.map((t) => (
                <div
                  key={t.title}
                  className="rounded-xl border border-white/10 bg-white/5 p-3.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                        <MapPin size={9} /> {t.city}
                      </span>
                      <p className="mt-1.5 text-[13px] font-semibold text-white">{t.title}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                        {t.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[16px] font-bold text-emerald-300">
                        ₹{t.price.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-white/40">Zero OTA fees</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.p
              key="off"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 rounded-xl border border-dashed border-white/10 p-6 text-center text-[12px] text-white/40"
            >
              Flash Mode is off · Inventory hidden
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300">
            <DollarSign size={18} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-emerald-200/80">
              Host Affiliate Earnings (10% commission paid on guest sightseeing)
            </p>
            <motion.p
              key={commission}
              initial={{ scale: 1.15, color: "#a7f3d0" }}
              animate={{ scale: 1, color: "#6ee7b7" }}
              className="text-[22px] font-bold text-emerald-300"
            >
              ₹{commission.toLocaleString("en-IN")}
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}
