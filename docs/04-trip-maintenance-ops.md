# Part 4 — Trip Dispatch & Maintenance Operations

**Files:** `src/pages/Trips.jsx`, `src/pages/Maintenance.jsx`

## What this segment covers

The two operational workflows that actually move vehicles/drivers through
state transitions (the transition logic itself lives in `App.jsx` in Part 5;
these files provide the UI that triggers it).

### `Trips.jsx`
- `TripsPage` — dispatch board showing route, vehicle, driver, cargo,
  distance, revenue and status, with per-row actions depending on trip state:
  - `DRAFT` → Dispatch / Cancel
  - `DISPATCHED` → Complete / Cancel
  - `COMPLETED` / `CANCELLED` → no actions
- `TripForm` — "New Trip" modal. Only shows vehicles/drivers currently
  `AVAILABLE` (and drivers with a non-expired license), and validates cargo
  weight against the chosen vehicle's max load capacity before submit.
- `CompleteTripForm` — captures actual distance travelled and fuel consumed
  when marking a dispatched trip complete.

### `Maintenance.jsx`
- `MaintenancePage` — table of maintenance logs with a "Close Log" action for
  open entries.
- `MaintenanceForm` — opens a new maintenance log; only vehicles that are not
  currently `ON_TRIP` are selectable.

## Why it's its own commit

This is the operational core of the product — trip lifecycle and maintenance
lifecycle are the two workflows that change a vehicle's/driver's status and
have the most business-rule validation (capacity checks, license expiry,
availability checks). Grouping them highlights that these two workflows
share the same "vehicle availability" concept and are meant to be reviewed
together.

## Suggested commit message

```
feat(operations): add trip dispatch board and maintenance logging

- TripsPage/TripForm/CompleteTripForm: draft → dispatch → complete/cancel
  flow with capacity + license-expiry validation
- MaintenancePage/MaintenanceForm: open/close maintenance logs, blocks
  vehicles currently on trip
```
