import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BadgeCheck, LayoutDashboard, LogOut, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  dashboardPathFor,
  listDemoAccounts,
  signIn,
  signInDemo,
  signOut,
  type DemoUser,
} from "@/lib/demoApi";
import { useDemoUser } from "@/components/site/useDemoUser";
import { GREEN, RED } from "@/lib/brand";

export function SignInButton() {
  const user = useDemoUser();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"demo" | "guest">("demo");
  const [id, setId] = useState("traveler1");
  const [password, setPassword] = useState("demo123");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const goDash = (type: DemoUser["type"]) => {
    window.location.href = dashboardPathFor(type);
  };

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 rounded-full py-1.5 pl-2 pr-4 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03]"
            style={{ background: RED }}
          >
            <img src={user.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
            {user.name.split(" ")[0]}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="flex items-center gap-1 text-[13px] font-semibold">
              {user.name}
              {user.verified && <BadgeCheck size={14} style={{ color: GREEN }} />}
            </p>
            <p className="text-[11px] font-normal capitalize text-neutral-400">
              {user.type} · {user.email}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-[13px]" onClick={() => goDash(user.type)}>
            <LayoutDashboard size={14} className="mr-2" /> Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem className="text-[13px]" onClick={() => navigate({ to: "/demo-login" })}>
            <User size={14} className="mr-2" /> Switch demo account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()} className="text-[13px]">
            <LogOut size={14} className="mr-2" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const submitDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const u = await signInDemo(id, password);
      setOpen(false);
      goDash(u.type);
    } catch {
      setErr("Invalid id or password");
    }
    setBusy(false);
  };

  const submitGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setBusy(true);
    await signIn(name, email);
    setBusy(false);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => navigate({ to: "/demo-login" })}
        className="hidden rounded-full border px-3 py-1.5 text-[12px] font-semibold text-neutral-700 md:inline"
        style={{ borderColor: "rgba(0,0,0,0.12)" }}
      >
        Demo login
      </button>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full px-4 py-1.5 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03]"
        style={{ background: RED }}
      >
        Sign in
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-[20px] tracking-tight">Sign in to NORTHNEST</DialogTitle>
            <DialogDescription className="text-[13px]">
              Use a demo account (id + password) or continue as a guest traveler.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            {(["demo", "guest"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="rounded-full px-3 py-1.5 text-[12px] font-semibold capitalize"
                style={{
                  background: mode === m ? "rgba(226,55,68,0.1)" : "#f5f5f5",
                  color: mode === m ? RED : "#666",
                }}
              >
                {m === "demo" ? "Demo accounts" : "Guest"}
              </button>
            ))}
          </div>
          {mode === "demo" ? (
            <form onSubmit={submitDemo} className="mt-1 space-y-3">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  Account id
                </span>
                <select
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="mt-1 w-full rounded-2xl border px-4 py-2.5 text-[14px] outline-none"
                  style={{ borderColor: "rgba(0,0,0,0.12)" }}
                >
                  {listDemoAccounts().map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.id} — {a.name} ({a.type})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  Password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-2xl border px-4 py-2.5 text-[14px] outline-none"
                  style={{ borderColor: "rgba(0,0,0,0.12)" }}
                />
              </label>
              {err && (
                <p className="text-[12px] font-medium" style={{ color: RED }}>
                  {err}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full py-2.5 text-[14px] font-bold text-white disabled:opacity-60"
                style={{ background: RED }}
              >
                {busy ? "Signing in…" : "Sign in with demo"}
              </button>
              <p className="text-center text-[11px] text-neutral-400">
                Default password for all demos: <strong>demo123</strong>
              </p>
            </form>
          ) : (
            <form onSubmit={submitGuest} className="mt-1 space-y-3">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  Full name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-2xl border px-4 py-2.5 text-[14px] outline-none"
                  style={{ borderColor: "rgba(0,0,0,0.12)" }}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-2xl border px-4 py-2.5 text-[14px] outline-none"
                  style={{ borderColor: "rgba(0,0,0,0.12)" }}
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full py-2.5 text-[14px] font-bold text-white disabled:opacity-60"
                style={{ background: RED }}
              >
                {busy ? "Signing in…" : "Continue as guest"}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
