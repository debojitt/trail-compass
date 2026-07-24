import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, ShieldCheck, Command, Sparkles } from "lucide-react";

type Route = {
  id: string;
  title: string;
  creator: string;
  emi: string;
  verified: boolean;
  tag: string;
};

const ROUTES: Route[] = [
  {
    id: "NN-MEGH-804",
    title: "Meghalaya Living Root Bridges & Dawki",
    creator: "@rahul_explores",
    emi: "₹3,500/mo",
    verified: true,
    tag: "48-Hour In-City",
  },
  {
    id: "TWG-7721",
    title: "Tawang Monastery & Sela Pass High-Altitude",
    creator: "@vikram_northeast",
    emi: "₹4,800/mo",
    verified: true,
    tag: "High-Altitude",
  },
  {
    id: "KZR-1102",
    title: "Kaziranga Deep Forest & Sanctuary Stay",
    creator: "@axom_wanderer",
    emi: "₹2,900/mo",
    verified: true,
    tag: "Tea Sanctuary",
  },
];

const FILTERS = [
  { label: "48-Hour In-City", icon: "⚡" },
  { label: "High-Altitude", icon: "🏔️" },
  { label: "Tea Sanctuary", icon: "☕" },
  { label: "Multiplayer", icon: "🤝" },
];

export function SpotlightModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
    else {
      setQuery("");
      setActiveFilter(null);
    }
  }, [open]);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => setLoaded(null), 2200);
    return () => clearTimeout(t);
  }, [loaded]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ROUTES.filter((r) => {
      const matchesQ =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.id.toLowerCase() === q ||
        r.id.toLowerCase().includes(q);
      const matchesF = !activeFilter || r.tag === activeFilter;
      return matchesQ && matchesF;
    });
  }, [query, activeFilter]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left text-white/70 backdrop-blur-xl transition hover:border-white/30 hover:bg-white/10"
      >
        <Search size={18} className="text-cyan-300" />
        <span className="flex-1 text-sm">Search destinations or paste Route ID…</span>
        <kbd className="flex items-center gap-1 rounded-md border border-white/20 bg-black/40 px-2 py-1 text-[11px] font-semibold text-white/80">
          <Command size={11} /> K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] grid place-items-start bg-black/70 px-4 pt-[12vh] backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.94, y: -8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 260 }}
              className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-[#0B0F19]/90 shadow-[0_30px_120px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
            >
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                <Search size={22} className="text-cyan-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search destinations or paste NN-XXXX-000"
                  className="flex-1 bg-transparent text-[17px] text-white placeholder:text-white/40 focus:outline-none"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
                    aria-label="Clear"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 border-b border-white/10 px-5 py-3">
                {FILTERS.map((f) => {
                  const active = activeFilter === f.label;
                  return (
                    <button
                      key={f.label}
                      onClick={() => setActiveFilter(active ? null : f.label)}
                      className={`rounded-full border px-3 py-1 text-[12px] font-medium transition ${
                        active
                          ? "border-cyan-400 bg-cyan-400/20 text-cyan-200"
                          : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {f.icon} {f.label}
                    </button>
                  );
                })}
              </div>

              <div className="max-h-[50vh] overflow-y-auto p-3">
                {filtered.length === 0 && (
                  <div className="grid place-items-center gap-2 py-10 text-white/50">
                    <Sparkles size={22} />
                    <p className="text-sm">No routes match. Try NN-MEGH-804.</p>
                  </div>
                )}
                {filtered.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setLoaded(r.id)}
                    className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left transition hover:bg-white/5"
                  >
                    <span className="rounded-md border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 font-mono text-[11px] font-semibold text-cyan-300">
                      {r.id}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-white">{r.title}</p>
                      <p className="text-[12px] text-white/50">
                        {r.creator}{" "}
                        {r.verified && (
                          <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                            <ShieldCheck size={10} /> Verified
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="rounded-lg bg-gradient-to-r from-amber-400/20 to-rose-400/20 px-2.5 py-1 text-[11px] font-bold text-amber-200">
                      {r.emi}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-white/10 bg-black/30 px-4 py-2 text-[11px] text-white/40">
                <span>↑↓ navigate · ↵ select · esc close</span>
                <span>Northnest Command</span>
              </div>
            </motion.div>

            <AnimatePresence>
              {loaded && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="fixed bottom-8 left-1/2 z-[110] -translate-x-1/2 rounded-full border border-emerald-400/50 bg-emerald-500/20 px-5 py-2.5 text-sm font-semibold text-emerald-100 shadow-lg backdrop-blur-xl"
                >
                  ✓ Route Dossier Loaded — {loaded}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
