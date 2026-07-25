# NORTHNEST full prototype build

Everything runs on a single client-side demo store (localStorage + seed JSON). No Lovable Cloud. 10 pre-seeded demos per feature. 5 pre-made accounts (one per role) with a public credentials card on the sign-in screen so you can log into any of them instantly.

## Demo accounts (all password: `northnest`)

| Role | Email | Dashboard |
|---|---|---|
| Traveler | `arya@demo.nn` | Trips, saved itineraries, group invites, permits |
| Creator | `meiko@demo.nn` | Instagram-style profile, publish itineraries, earnings |
| Homestay Host | `bikash@demo.nn` | Airbnb-style listings, 48h city plans, referral codes |
| Freelance Planner | `zara@demo.nn` | Branded subdomain, masked vendors, 60% split |
| Admin | `admin@demo.nn` | Bookings, verifications, payouts |

## New routes

```text
/                         Home — search by itinerary code, hero, featured
/auth                     One-click demo login cards + email/password form
/explore                  Discovery feed (MMT dense grid)
/explore/$slug            State detail, 360° preview, packages
/stays, /stays/$id        Airbnb-style listing + detail (photos, host, reviews, book)
/packages, /packages/$id  MMT-style package + full itinerary detail
/itineraries              Public itinerary directory + code search
/itineraries/$code        Public itinerary detail (NN-MEGH-804 style)
/builder                  Vertical video swipe feed (YT Shorts UX) + floating cart
/creators/$handle         Instagram-grid creator profile
/hosts/$id                Host public page + referral 48h plan
/trip/$id/invite          Group invite — per-seat payment
/trip/$id/sos             Echo SOS swipe-to-send
/_authenticated/dashboard Router based on role → sub-dashboards
  /dashboard/trips
  /dashboard/saved
  /dashboard/creator      (creator only)
  /dashboard/host         (host only)
  /dashboard/planner      (planner only)
  /dashboard/admin        (admin only)
```

## Core mechanics

**Itinerary Builder (`/builder`)**
- Full-screen vertical snap-scroll feed of place cards (video/looping poster).
- Overlay: place name, price range, "Add" button, like count.
- Swipe right = add to floating cart, left = skip, tap Add button = add.
- Cart drawer shows day-by-day timeline, drag to reorder, save to profile.
- "Invite Crew" → generates share link, each member claims their seat.

**Public Itinerary Codes**
- Booking status `COMPLETED` unlocks Publish. Publishing mints `NN-XXXX-###`.
- Homepage search bar resolves code → `/itineraries/$code`.
- Card shows creator, likes, rating, photos, day plan, "Use this itinerary" → prefills builder.

**Creator profile** — Instagram grid of published itineraries, verified tick, follow, DM stub, earnings widget (own dashboard only).

**Host dashboard** — List/edit stays (no commission badge), build 48h in-city plan, share referral link. Guest booking via referral tags host for revenue share.

**Planner dashboard** — Branded subdomain preview (`zara.northnest.demo`), masked vendor names until T-48h, escrow ledger, 60/40 split, liquidated-damages clause visible, SOS override banner.

**Group booking** — Trip has seats; each seat has its own payment status; booking finalizes when all paid, or individually with EMI.

**Echo SOS** — Swipe-to-send button, broadcasts mock coords + last cached location, bypasses vendor mask.

## Visual system

Cards mix MMT (dense price + badge), Airbnb (photo-first, generous whitespace on detail), Instagram (grid + story ring on creator profile), YouTube Shorts (full-bleed vertical feed on builder). Keep NORTHNEST palette (`RED #FF385C`, `GREEN #0E7C4A`), Inter/SF Pro. Dark only on Shorts feed and SOS screen; light elsewhere for MMT/Airbnb feel.

## Media strategy

- Stills from Unsplash source URLs (`images.unsplash.com/...`) — no lag, no keys.
- "Video" cards use `<img>` with a subtle CSS Ken Burns loop (looks like ambient video, zero buffering).
- Real HTML5 `<video>` only for the 3 hero clips (public sample MP4 from `cdn.coverr.co`).

## Data layer

Single `src/lib/store.ts` — typed Zustand-ish subscribable store persisting to localStorage under `nn:*`. Seeded on first load with:

- 10 stays, 10 packages, 10 published itineraries (with codes), 10 places for builder, 10 host referral plans, 10 creator profiles, 10 group trips, 10 SOS drills.
- 5 seeded accounts + bookings + notifications per account so each dashboard is populated.
- Reset button in footer to re-seed.

All existing pages (`/stays`, `/packages`, `/permits`, etc.) migrated from `demoApi.ts` to the new store; cards become links to detail pages; "Reserve" flows use `BookingDialog` and land in the current user's dashboard.

## Technical notes

- Router: add new file routes; keep TanStack Query for cache. Detail routes use `useSuspenseQuery`.
- Auth: pathless `_authenticated` layout redirects to `/auth` when no user; role gates inside dashboard.
- Video feed: `scroll-snap-y mandatory`, IntersectionObserver plays only visible slide.
- Group invite links = `/trip/$id/invite?seat=xxx` — deep-linkable in demo.
- No secrets, no server functions. Everything client-side so it's demo-safe.

## Sequenced execution (single turn, batched writes)

1. Store + seed data (`src/lib/store.ts`, `src/data/seed.ts`).
2. Auth route + role gate + updated header account menu.
3. Detail pages for stays/packages + card link wiring.
4. Builder route (vertical video feed + cart).
5. Public itinerary directory + code search on home.
6. Creator, host, planner public pages.
7. Dashboard shell with role-based sub-pages.
8. Group invite + SOS pages.
9. Home search wiring + reset button.
10. Typecheck, fix, verify preview.

This is large — expect ~25 new files. I will batch parallel writes where possible.