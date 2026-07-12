# TransitOps — Fleet Dispatch Console

A single-page React UI prototype for a logistics/fleet operations team. It manages
vehicles, drivers, trip dispatching, maintenance logs, fuel & expense tracking,
and financial reporting — all with an in-memory data layer (no backend).

This repository is deliberately organized and committed in **5 functional
segments**, each covering one major slice of the app. Every segment has its
own README in [`docs/`](./docs) explaining what it contains and why it's
scoped that way.

## Segments

| # | Segment | Folder(s) | Docs |
|---|---------|-----------|------|
| 1 | Foundation: design tokens, roles, seed data | `src/theme.js`, `src/data/` | [docs/01-foundation.md](./docs/01-foundation.md) |
| 2 | Shared UI component library | `src/components/` | [docs/02-ui-components.md](./docs/02-ui-components.md) |
| 3 | Fleet & Driver Registry | `src/pages/Vehicles.jsx`, `src/pages/Drivers.jsx` | [docs/03-fleet-driver-registry.md](./docs/03-fleet-driver-registry.md) |
| 4 | Trip Dispatch & Maintenance Operations | `src/pages/Trips.jsx`, `src/pages/Maintenance.jsx` | [docs/04-trip-maintenance-ops.md](./docs/04-trip-maintenance-ops.md) |
| 5 | Dashboard, Fuel/Expense, Reports & App Shell | `src/pages/Dashboard.jsx`, `src/pages/FuelExpense.jsx`, `src/pages/Reports.jsx`, `src/App.jsx` | [docs/05-dashboard-reports-app-shell.md](./docs/05-dashboard-reports-app-shell.md) |

## Tech stack

- React (hooks: `useState`, `useMemo`)
- [`lucide-react`](https://lucide.dev/) for icons
- [`recharts`](https://recharts.org/) for charts (bar, pie)
- Inline styling with a shared design-token object (no CSS framework)

## Project structure

```
transitops-ui/
├── src/
│   ├── theme.js                # design tokens, roles, nav config, formatting helpers
│   ├── data/
│   │   └── seed.js             # in-memory seed data for all entities
│   ├── components/
│   │   └── ui.jsx              # shared primitives: Badge, Card, Btn, Modal, Table, KPI, etc.
│   ├── pages/
│   │   ├── Vehicles.jsx        # vehicle registry + add-vehicle form
│   │   ├── Drivers.jsx         # driver registry + add-driver form
│   │   ├── Trips.jsx           # trip dispatch board + trip/complete forms
│   │   ├── Maintenance.jsx     # maintenance log page + form
│   │   ├── FuelExpense.jsx     # fuel & expense logs + forms
│   │   ├── Reports.jsx         # ROI / fuel-efficiency reports
│   │   └── Dashboard.jsx       # KPIs + charts overview
│   └── App.jsx                 # sidebar, role switcher, state machines, routing
├── docs/                       # one README per commit segment
├── package.json
└── README.md
```

## Running it

This is UI-only (no build config committed). Drop `src/App.jsx` and its
imports into any React + Vite/CRA project that has `lucide-react` and
`recharts` installed, and render `<TransitOpsApp />`.

## Notes

- All data is in-memory and resets on page reload — there is no backend/API.
- Business rules (e.g. "a vehicle On Trip can't be dispatched again", "an
  expired-license driver can't be assigned") are enforced client-side inside
  `src/App.jsx`'s state-machine functions.
