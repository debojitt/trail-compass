import { useState } from "react";
import { LogOut, User } from "lucide-react";
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
import { signIn, signOut } from "@/lib/demoApi";
import { useDemoUser } from "@/components/site/useDemoUser";
import { RED } from "@/lib/brand";

/**
 * Demo sign-in — collects a name + email and stores them locally.
 * Swap `signIn`/`signOut` in demoApi for a real auth provider later.
 */
export function SignInButton() {
  const user = useDemoUser();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 rounded-full py-1.5 pl-2 pr-4 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03]"
            style={{ background: RED }}
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white/25">
              <User size={13} />
            </span>
            {user.name.split(" ")[0]}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>
            <p className="text-[13px] font-semibold">{user.name}</p>
            <p className="text-[11px] font-normal text-neutral-400">{user.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()} className="text-[13px]">
            <LogOut size={14} className="mr-2" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const submit = async (e: React.FormEvent) => {
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
        onClick={() => setOpen(true)}
        className="rounded-full px-4 py-1.5 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03]"
        style={{ background: RED }}
      >
        Sign in
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-[20px] tracking-tight">Sign in to NORTHNEST</DialogTitle>
            <DialogDescription className="text-[13px]">
              Demo account — details stay on this device only.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="mt-1 space-y-3">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                Full name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ananya Sharma"
                className="mt-1 w-full rounded-2xl border px-4 py-2.5 text-[14px] outline-none transition-colors focus:border-neutral-400"
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
                placeholder="you@example.com"
                className="mt-1 w-full rounded-2xl border px-4 py-2.5 text-[14px] outline-none transition-colors focus:border-neutral-400"
                style={{ borderColor: "rgba(0,0,0,0.12)" }}
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full py-2.5 text-[14px] font-bold text-white transition-opacity disabled:opacity-60"
              style={{ background: RED }}
            >
              {busy ? "Signing in…" : "Continue"}
            </button>
            <p className="text-center text-[11px] text-neutral-400">
              Prototype: no password, no server — perfect for demos.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
