import { useState } from "react";
import { Link, createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { LogIn, ShieldCheck, Sparkles } from "lucide-react";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import { signIn, signInAs, useStore, type Role } from "@/lib/store";
import { RED, GREEN, GREEN_LIGHT } from "@/lib/brand";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · NORTHNEST" },
      { name: "description", content: "Demo sign-in with pre-seeded accounts for every NORTHNEST role." },
    ],
  }),
  component: AuthPage,
});

const ROLE_META: Record<Role, { label: string; blurb: string; color: string }> = {
  traveler: { label: "Traveler", blurb: "Plan trips, save itineraries, invite crew.", color: RED },
  creator: { label: "Verified Creator", blurb: "Publish itineraries · earn commission.", color: "#8B5CF6" },
  host: { label: "Homestay Host", blurb: "List stays · 48h city plans · referral codes.", color: "#F59E0B" },
  planner: { label: "Freelance Planner", blurb: "Branded subdomain · 60% net · escrow.", color: GREEN },
  admin: { label: "Ops Admin", blurb: "Verifications · payouts · SOS console.", color: "#111" },
};

function AuthPage() {
  const accounts = useStore((s) => s.accounts);
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("northnest");
  const [error, setError] = useState<string | null>(null);

  const go = async () => {
    await router.invalidate();
    navigate({ to: "/dashboard" });
  };

  const quick = (id: string) => {
    signInAs(id);
    void go();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const acc = signIn(email, password);
    if (!acc) return setError("Wrong email or password. Try a demo card above.");
    setError(null);
    void go();
  };

  return (
    <SiteShell>
      <PageHero
        eyebrow="Demo login"
        title="Pick any account — every role is pre-seeded."
        sub="Every dashboard is loaded with real demo bookings, itineraries and notifications so you can try the full flow instantly. Password for all accounts: northnest"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((a) => {
          const meta = ROLE_META[a.role];
          return (
            <button
              key={a.id}
              onClick={() => quick(a.id)}
              className="group text-left rounded-3xl border bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-2xl"
              style={{ borderColor: "rgba(0,0,0,0.08)" }}
            >
              <div className="flex items-start gap-3">
                <img src={a.avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[15px] font-bold tracking-tight">{a.name}</p>
                    {a.verified && <ShieldCheck size={14} style={{ color: meta.color }} />}
                  </div>
                  <p className="truncate text-[12px] text-neutral-500">@{a.handle}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ background: meta.color }}
                >
                  {meta.label}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">{a.email}</span>
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-neutral-500">{meta.blurb}</p>
              <div
                className="mt-4 flex items-center justify-center gap-2 rounded-full py-2 text-[12px] font-bold text-white transition-colors group-hover:brightness-110"
                style={{ background: meta.color }}
              >
                <LogIn size={13} /> Enter as {a.name.split(" ")[0]}
              </div>
            </button>
          );
        })}
      </div>

      <form
        onSubmit={submit}
        className="mx-auto mt-10 max-w-md rounded-3xl border bg-white p-6"
        style={{ borderColor: "rgba(0,0,0,0.08)" }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: RED }} />
          <p className="text-[13px] font-bold uppercase tracking-widest text-neutral-500">
            Or sign in manually
          </p>
        </div>
        <div className="mt-4 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="arya@demo.nn"
            className="w-full rounded-2xl border px-4 py-3 text-[14px] outline-none focus:border-neutral-400"
            style={{ borderColor: "rgba(0,0,0,0.12)" }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="northnest"
            className="w-full rounded-2xl border px-4 py-3 text-[14px] outline-none focus:border-neutral-400"
            style={{ borderColor: "rgba(0,0,0,0.12)" }}
          />
          {error && <p className="text-[12px] text-red-500">{error}</p>}
          <button
            className="w-full rounded-full py-3 text-[14px] font-bold text-white"
            style={{ background: RED }}
          >
            Sign in
          </button>
        </div>
        <div className="mt-4 rounded-2xl px-4 py-3 text-[11px]" style={{ background: GREEN_LIGHT, color: GREEN }}>
          <strong>Prototype notice:</strong> All auth is client-side. No password is ever transmitted. Data persists to your browser's localStorage.
        </div>
      </form>

      <div className="mt-6 text-center">
        <Link to="/" className="text-[13px] font-semibold text-neutral-500 hover:text-neutral-900">
          ← Back to home
        </Link>
      </div>
    </SiteShell>
  );
}
