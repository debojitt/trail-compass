import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, LayoutDashboard, LogOut, UserRound } from "lucide-react";
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
import { GREEN, GREEN_LIGHT, RED } from "@/lib/brand";
import type { AccountType } from "@/data/demoUniverse";
import { SIGNIN_EVENT, consumeSignInFlag, openSignInDialog } from "@/lib/openSignIn";

export { openSignInDialog };

const ROLE_ORDER: AccountType[] = ["traveler", "creator", "host", "planner", "admin"];

const ROLE_LABEL: Record<AccountType, string> = {
  traveler: "Traveler",
  creator: "Creator",
  host: "Host",
  planner: "Planner",
  admin: "Admin",
};

export function SignInButton() {
  const user = useDemoUser();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [showGuest, setShowGuest] = useState(false);

  const accounts = useMemo(() => listDemoAccounts(), []);
  const grouped = useMemo(
    () =>
      ROLE_ORDER.map((type) => ({
        type,
        label: ROLE_LABEL[type],
        items: accounts.filter((a) => a.type === type),
      })).filter((g) => g.items.length > 0),
    [accounts],
  );

  useEffect(() => {
    const openDialog = () => setOpen(true);
    window.addEventListener(SIGNIN_EVENT, openDialog);
    if (consumeSignInFlag()) setOpen(true);
    return () => window.removeEventListener(SIGNIN_EVENT, openDialog);
  }, []);

  const goDash = (type: DemoUser["type"]) => {
    // Full navigation so the role route mounts fresh with session in localStorage
    window.location.assign(dashboardPathFor(type));
  };

  const loginAs = async (id: string) => {
    setBusy(id);
    setErr(null);
    try {
      const u = await signInDemo(id, "demo123");
      setOpen(false);
      goDash(u.type);
    } catch {
      setErr("Could not sign in — try another account.");
      setBusy(null);
    }
  };

  const submitGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim()) return;
    setBusy("guest");
    setErr(null);
    try {
      const u = await signIn(guestName, guestEmail);
      setOpen(false);
      goDash(u.type);
    } catch {
      setErr("Guest sign-in failed.");
      setBusy(null);
    }
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
          <DropdownMenuItem
            className="text-[13px]"
            onClick={() => {
              signOut();
              setOpen(true);
            }}
          >
            <UserRound size={14} className="mr-2" /> Switch account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()} className="text-[13px]">
            <LogOut size={14} className="mr-2" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full px-4 py-1.5 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03]"
        style={{ background: RED }}
      >
        Sign in
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-[20px] tracking-tight">Sign in to NORTHNEST</DialogTitle>
            <DialogDescription className="text-[13px]">
              Pick a role account to open its full dashboard — bookings, inventory CMS, enquiries, and
              add/edit/delete are all live in this browser.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {grouped.map((g) => (
              <div key={g.type}>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-neutral-400">
                  {g.label}
                </p>
                <ul className="space-y-2">
                  {g.items.map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        disabled={busy === a.id}
                        onClick={() => loginAs(a.id)}
                        className="flex w-full items-center gap-3 rounded-2xl border bg-white p-3 text-left transition hover:border-neutral-300 hover:bg-neutral-50 disabled:opacity-60"
                        style={{ borderColor: "rgba(0,0,0,0.08)" }}
                      >
                        <img
                          src={a.avatar}
                          alt=""
                          className="h-11 w-11 rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1 text-[14px] font-bold">
                            {a.name}
                            {a.verified && <BadgeCheck size={14} style={{ color: GREEN }} />}
                          </p>
                          <p className="truncate text-[11px] text-neutral-500">
                            {a.email}
                            {a.bio ? ` · ${a.bio}` : ""}
                          </p>
                        </div>
                        <span
                          className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold text-white"
                          style={{ background: RED }}
                        >
                          {busy === a.id ? "…" : "Enter"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="rounded-2xl px-3 py-2 text-[11px] font-medium"
            style={{ background: GREEN_LIGHT, color: GREEN }}
          >
            Demo password for all accounts: <strong>demo123</strong> (one-click Enter uses it
            automatically).
          </div>

          {err && (
            <p className="text-[12px] font-medium" style={{ color: RED }}>
              {err}
            </p>
          )}

          <button
            type="button"
            onClick={() => setShowGuest((v) => !v)}
            className="text-[12px] font-semibold text-neutral-500 underline-offset-2 hover:underline"
          >
            {showGuest ? "Hide guest traveler" : "Continue as guest traveler"}
          </button>

          {showGuest && (
            <form onSubmit={submitGuest} className="space-y-3 border-t pt-3">
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                placeholder="Full name"
                className="w-full rounded-2xl border px-4 py-2.5 text-[14px] outline-none"
                style={{ borderColor: "rgba(0,0,0,0.12)" }}
              />
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
                placeholder="Email"
                className="w-full rounded-2xl border px-4 py-2.5 text-[14px] outline-none"
                style={{ borderColor: "rgba(0,0,0,0.12)" }}
              />
              <button
                type="submit"
                disabled={busy === "guest"}
                className="w-full rounded-full py-2.5 text-[14px] font-bold text-white disabled:opacity-60"
                style={{ background: RED }}
              >
                {busy === "guest" ? "Signing in…" : "Enter traveler dashboard"}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
