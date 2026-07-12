# Part 5 — Dashboard, Fuel/Expense, Reports & App Shell

**Files:** `src/pages/Dashboard.jsx`, `src/pages/FuelExpense.jsx`,
`src/pages/Reports.jsx`, `src/App.jsx`

## What this segment covers

The analytics layer plus the top-level app that wires every previous segment
together into a working product.

### `Dashboard.jsx`
`DashboardPage` — KPI cards (active vehicles, available, in maintenance,
active/pending trips, drivers on duty, fleet utilization %) plus a fleet
status pie chart and an operational-cost-by-vehicle stacked bar chart.

### `FuelExpense.jsx`
`FuelExpensePage` plus `FuelForm` / `ExpenseForm` — side-by-side fuel and
expense logs with add-entry modals.

### `Reports.jsx`
`ReportsPage` — fuel efficiency (km/L) bar chart, a per-vehicle financial
table (revenue, fuel cost, maintenance cost, operating cost, acquisition
cost, ROI %), and CSV export of all trips.

### `App.jsx`
`TransitOpsApp` — the default export and entry point:
- Owns all top-level state (`vehicles`, `drivers`, `trips`, `maint`, `fuel`,
  `expense`, `modal`) and derives `vMap`/`dMap` lookups.
- Implements the **trip state machine** (`dispatchTrip`, `completeTrip`,
  `cancelTrip`, `createTrip`) and **maintenance state machine**
  (`openMaintenance`, `closeMaintenance`), including all the validation
  rules that reject invalid transitions.
- Computes derived metrics (`metrics`, `perVehicleFinance`, ROI, fuel
  efficiency) via `useMemo`.
- Renders the sidebar (role-filtered nav), top bar (role switcher), routes
  to the active page, and mounts whichever modal is currently open.

## Why it's its own commit

This is the composition root — it depends on every earlier segment (theme,
seed data, UI library, registry pages, operations pages) and adds the two
remaining feature areas (dashboard/reports) plus the orchestration logic.
Committing it last reflects the natural dependency order: you can't wire the
app together until the pieces it wires exist.

## Suggested commit message

```
feat(app): add dashboard, reports, fuel/expense pages and app shell

- DashboardPage: KPIs, fleet status pie chart, cost-by-vehicle bar chart
- FuelExpensePage + forms: fuel/expense logging
- ReportsPage: fuel efficiency chart, per-vehicle ROI table, CSV export
- App.jsx: top-level state, trip/maintenance state machines, role-based
  sidebar nav, modal routing — wires up all previous segments
```
