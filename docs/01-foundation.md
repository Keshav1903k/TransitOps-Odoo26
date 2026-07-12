# Part 1 — Foundation: Design Tokens, Roles & Seed Data

**Files:** `src/theme.js`, `src/data/seed.js`, `package.json`

## What this segment covers

The base layer everything else depends on: no components, no pages — just
constants, configuration and mock data.

### `src/theme.js`
- `FONT_IMPORT` — Google Fonts `@import` string (IBM Plex Mono / IBM Plex Sans).
- `COLORS` — the full color palette (ink, paper, amber, teal, red, slate, etc.)
  used consistently across every component.
- `STATUS_STYLES` — maps every domain status (`AVAILABLE`, `ON_TRIP`,
  `IN_SHOP`, `DRAFT`, `DISPATCHED`, `COMPLETED`, `OPEN`, `CLOSED`, ...) to a
  color and display label. This is the single source of truth for how status
  badges render everywhere in the app.
- `ROLES` — defines the 4 user roles (`FLEET_MANAGER`, `DRIVER_OPS`,
  `SAFETY_OFFICER`, `FINANCIAL_ANALYST`) and which nav tabs each role can see.
- Formatting/utility helpers: `uid()` (id generator), `today`, `daysFromNow()`,
  `fmtDate()`, `money()` (₹ formatting for Indian locale).

### `src/data/seed.js`
In-memory seed generators for every entity in the app:
`seedVehicles`, `seedDrivers`, `seedTrips`, `seedMaintenance`, `seedFuel`,
`seedExpense`. These back the app's state on first load since there is no
backend/API.

## Why it's its own commit

Every other segment imports from here. Committing it first establishes the
data model and visual language before any UI is built on top of it, and keeps
the diff focused on "what the app's data/design vocabulary is" rather than
mixing it with component code.

## Suggested commit message

```
feat(foundation): add design tokens, role config, and seed data

- theme.js: color palette, status styles, role/tab config, formatting helpers
- data/seed.js: in-memory seed data for vehicles, drivers, trips,
  maintenance, fuel and expense logs
- package.json: react, lucide-react, recharts dependencies
```
