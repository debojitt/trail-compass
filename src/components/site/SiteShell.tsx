import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Compass, MapPin, Menu } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SignInButton } from "@/components/site/SignInButton";
import { GREEN, RED } from "@/lib/brand";

export const NAV_LINKS = [
  { label: "Explore", to: "/explore/$slug", params: { slug: "meghalaya" }, badge: "360°" },
  { label: "Stays", to: "/stays" },
  { label: "Flights", to: "/flights" },
  { label: "Trains", to: "/trains" },
  { label: "Cabs", to: "/cabs" },
  { label: "Packages", to: "/packages" },
  { label: "Permits", to: "/permits" },
  { label: "Offers", to: "/offers" },
] as const;

/** Solid header + footer wrapper used by every page except the homepage hero */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 antialiased">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-4 pb-16 pt-24 md:px-6">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function SiteHeader() {
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b bg-white/85"
      style={{ backdropFilter: "blur(20px) saturate(180%)", borderColor: "rgba(0,0,0,0.06)" }}
    >
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/elements/northnest-logo.png"
            alt="northnest"
            className="h-8 w-8 rounded-full object-cover shadow-sm"
            draggable={false}
          />
          <span className="text-[17px] font-bold tracking-tight" style={{ color: RED }}>
            NORTHNEST
          </span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              params={"params" in l ? l.params : undefined}
              className="nn-link text-[13px] font-medium text-neutral-600 hover:text-neutral-900"
              activeProps={{ style: { color: RED, fontWeight: 700 } }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <SignInButton />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

export function MobileMenu({ light = false }: { light?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open menu"
          className="grid h-9 w-9 place-items-center rounded-full lg:hidden"
          style={{ color: light ? "#fff" : "#374151" }}
        >
          <Menu size={20} />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] p-0">
        <div className="flex items-center gap-2 border-b border-neutral-100 px-5 py-4">
          <img
            src="/elements/northnest-logo.png"
            alt=""
            className="h-8 w-8 rounded-full object-cover"
            draggable={false}
          />
          <SheetTitle className="text-[16px] font-bold" style={{ color: RED }}>
            NORTHNEST
          </SheetTitle>
        </div>
        <nav className="flex flex-col px-2 py-3">
          {NAV_LINKS.map((l) => (
            <SheetClose asChild key={l.label}>
              <Link
                to={l.to}
                params={"params" in l ? l.params : undefined}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium text-neutral-800 hover:bg-neutral-50"
              >
                <span className="flex items-center gap-2">
                  {l.label}
                  {"badge" in l && l.badge && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ background: RED }}
                    >
                      {l.badge}
                    </span>
                  )}
                </span>
                <ChevronRight size={16} className="text-neutral-400" />
              </Link>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export function SiteFooter() {
  const cols: { h: string; items: { label: string; to?: string; explore?: string }[] }[] = [
    {
      h: "Book",
      items: [
        { label: "Homestays", to: "/stays" },
        { label: "Flights", to: "/flights" },
        { label: "Trains", to: "/trains" },
        { label: "Cabs", to: "/cabs" },
        { label: "Packages", to: "/packages" },
      ],
    },
    {
      h: "Explore 360°",
      items: [
        { label: "Meghalaya wonders", explore: "meghalaya" },
        { label: "Tawang Monastery", explore: "arunachal-pradesh" },
        { label: "MG Marg, Gangtok", explore: "sikkim" },
        { label: "Kisama Village", explore: "nagaland" },
        { label: "Kaziranga", explore: "assam" },
      ],
    },
    {
      h: "States",
      items: [
        { label: "Meghalaya", explore: "meghalaya" },
        { label: "Arunachal", explore: "arunachal-pradesh" },
        { label: "Sikkim", explore: "sikkim" },
        { label: "Nagaland", explore: "nagaland" },
        { label: "Assam", explore: "assam" },
        { label: "Manipur", explore: "manipur" },
        { label: "Mizoram", explore: "mizoram" },
        { label: "Tripura", explore: "tripura" },
      ],
    },
    {
      h: "Company",
      items: [
        { label: "Offers", to: "/offers" },
        { label: "Permits", to: "/permits" },
        { label: "About" },
        { label: "Support 24×7" },
      ],
    },
  ];
  return (
    <footer
      className="relative z-10 mt-10 border-t bg-neutral-50"
      style={{ borderColor: "rgba(0,0,0,0.06)" }}
    >
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] md:px-6">
        <div>
          <div className="flex items-center gap-2">
            <img
              src="/elements/northnest-logo.png"
              alt="northnest"
              className="h-9 w-9 rounded-full object-cover"
              draggable={false}
            />
            <p className="text-[17px] font-bold tracking-tight" style={{ color: RED }}>
              NORTHNEST
            </p>
          </div>
          <p className="mt-3 max-w-[260px] text-[13px] leading-relaxed text-neutral-500">
            The travel platform built for the eight sister states of Northeast India.
          </p>
          <div
            className="mt-4 flex items-center gap-2 text-[12px] font-semibold"
            style={{ color: GREEN }}
          >
            <Compass size={14} /> Guwahati · Shillong · Itanagar
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <p className="text-[12px] font-bold uppercase tracking-wider text-neutral-400">{c.h}</p>
            <ul className="mt-3 space-y-2">
              {c.items.map((i) => (
                <li key={i.label}>
                  {i.explore ? (
                    <Link
                      to="/explore/$slug"
                      params={{ slug: i.explore }}
                      className="nn-link text-[13px] text-neutral-600 hover:text-neutral-900"
                    >
                      {i.label}
                    </Link>
                  ) : i.to ? (
                    <Link
                      to={i.to}
                      className="nn-link text-[13px] text-neutral-600 hover:text-neutral-900"
                    >
                      {i.label}
                    </Link>
                  ) : (
                    <span className="text-[13px] text-neutral-400">{i.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        className="border-t py-5 text-center text-[12px] text-neutral-400"
        style={{ borderColor: "rgba(0,0,0,0.06)" }}
      >
        © 2026 NORTHNEST · Northeast India, unfiltered.
        <MapPin size={12} className="ml-1 inline" style={{ color: RED }} />
      </div>
    </footer>
  );
}

/** Page heading used across all catalog pages */
export function PageHero({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="pb-8 pt-6 md:pb-10">
      <p className="text-[12px] font-semibold uppercase tracking-[0.25em]" style={{ color: RED }}>
        {eyebrow}
      </p>
      <h1 className="mt-2 text-[30px] font-bold leading-tight tracking-tight md:text-[44px]">
        {title}
      </h1>
      <p className="mt-3 max-w-[560px] text-[14px] leading-relaxed text-neutral-500 md:text-[15px]">
        {sub}
      </p>
    </div>
  );
}
