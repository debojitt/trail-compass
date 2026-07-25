# NORTHNEST Demo Accounts

## Primary demo accounts (password: `demo123`)

Use **Demo login** at `/demo-login` or Sign in → Demo accounts.

| Type | ID | Password | Name | Notes |
|------|-----|----------|------|-------|
| Individual traveler | `traveler1` | demo123 | Ananya Sharma | Completed booking + published NN-MEGH-804 |
| Individual traveler | `traveler2` | demo123 | Rohan Mehta | Group invites + Tawang publish |
| Verified creator | `creator1` | demo123 | Megha Trails | Handle `@meghatrails` |
| Verified creator | `creator2` | demo123 | Eastern Echo | Handle `@easternecho` |
| Homestay host | `host1` | demo123 | Lyngdoh Family | Profile `/host/khasi-bamboo` |
| Homestay host | `host2` | demo123 | Apatani Nest | Profile `/host/ziro-eco` |
| Freelance planner | `planner1` | demo123 | NestCraft Plans | `/planner/nestcraft` |
| Freelance planner | `planner2` | demo123 | PeakPath India | `/planner/peakpath` |
| Admin | `admin1` | demo123 | NORTHNEST Ops | `/dashboard/admin` |

## Alternate store accounts (password: `northnest`)

Also available via `/auth` (parallel seed store from merged remote work):

| Role | Email | Password | Handle |
|------|-------|----------|--------|
| Traveler | arya@demo.nn | northnest | arya |
| Creator | meiko@demo.nn | northnest | meiko.trails |
| Host / Planner / Admin | see `/auth` picker | northnest | — |

## Quick demo paths

- Demo login picker: `/demo-login`
- Shorts itinerary builder: `/builder`
- Published code: `/itinerary/NN-MEGH-804` (also homepage “Load by code”)
- Packages + Published Itineraries: `/packages`
- Invite Crew: `/invite` · `/invite/CREW-MEGH-01`
- Creators: `/creators` · `/creator/meghatrails`
- Host profile: `/host/khasi-bamboo`
- Planner subdomain: `/planner/nestcraft`
- Role dashboards: `/dashboard/traveler` · `/dashboard/creator` · `/dashboard/host` · `/dashboard/planner`
- Echo SOS (store route): `/trip/$id/sos`
- Alt itineraries index: `/itineraries`

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:8080/
