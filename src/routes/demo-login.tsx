import { useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, Copy, KeyRound } from "lucide-react";
import { SiteShell, PageHero } from "@/components/site/SiteShell";
import {
  dashboardPathFor,
  listDemoAccounts,
  signInDemo,
  type DemoUser,
} from "@/lib/demoApi";
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";

export const Route = createFileRoute("/demo-login")({
  head: () => ({ meta: [{ title: "Demo Login · NORTHNEST" }] }),
  component: DemoLoginPage,
});

const TYPE_LABEL: Record<string, string> = {
  traveler: "Individual traveler",
  creator: "Verified creator",
  host: "Homestay host",
  planner: "Freelance planner",
  admin: "Admin / ops",
};

function DemoLoginPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const accounts = listDemoAccounts();

  const login = async (id: string) => {
    setBusy(id);
    const u = await signInDemo(id, "demo123");
    setBusy(null);
    window.location.href = dashboardPathFor(u.type);
  };

  useEffect(() => {
    /* ensure route registered */
  }, [navigate]);

  const copyAll = async () => {
    const text = accounts
      .map((a) => `${a.type.padEnd(10)} ${a.id.padEnd(12)} / demo123  — ${a.name}`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <SiteShell>
      <PageHero
        eyebrow="Prototype access"
        title="Demo accounts for every role"
        sub="One-click login. Password for all accounts is demo123. Dashboards load with full demo data."
      />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={copyAll}
          className="flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold"
          style={{ borderColor: "rgba(0,0,0,0.1)" }}
        >
          <Copy size={14} /> {copied ? "Copied!" : "Copy all credentials"}
        </button>
        <Link to="/builder" className="text-[13px] font-semibold" style={{ color: RED }}>
          Open itinerary builder →
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map((a) => (
          <article
            key={a.id}
            className="flex gap-4 rounded-3xl border bg-white p-4 shadow-sm"
            style={{ borderColor: "rgba(0,0,0,0.07)" }}
          >
            <img src={a.avatar} alt="" className="h-16 w-16 rounded-2xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-[15px] font-bold">
                {a.name}
                {a.verified && <BadgeCheck size={15} style={{ color: GREEN }} />}
              </p>
              <p className="text-[12px] capitalize text-neutral-500">{TYPE_LABEL[a.type]}</p>
              <div
                className="mt-2 inline-flex items-center gap-2 rounded-xl px-2.5 py-1 text-[11px] font-semibold"
                style={{ background: GREEN_LIGHT, color: GREEN }}
              >
                <KeyRound size={12} />
                {a.id} / demo123
              </div>
              {a.bio && <p className="mt-2 text-[12px] leading-relaxed text-neutral-500">{a.bio}</p>}
              <button
                onClick={() => login(a.id)}
                disabled={busy === a.id}
                className="mt-3 rounded-full px-4 py-1.5 text-[12px] font-bold text-white disabled:opacity-60"
                style={{ background: RED }}
              >
                {busy === a.id ? "Signing in…" : "Login as this account"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </SiteShell>
  );
}

// silence unused type in some TS configs
export type _Demo = DemoUser;
