# Part 3 — Fleet & Driver Registry

**Files:** `src/pages/Vehicles.jsx`, `src/pages/Drivers.jsx`

## What this segment covers

The two "master data" registries of the app — the read-mostly directories
that trip dispatch and maintenance later depend on.

### `Vehicles.jsx`
- `VehiclesPage` — table of all vehicles (reg. number, type, load capacity,
  odometer, region, status).
- `VehicleForm` — modal form to add a new vehicle, with numeric coercion for
  capacity/odometer/acquisition cost.

### `Drivers.jsx`
- `DriversPage` — table of all drivers (name, license number, category,
  expiry date, safety score, status). Expired licenses are flagged visually
  in red with a shield-alert icon.
- `DriverForm` — modal form to add a new driver, with a default license
  expiry 365 days out and a default safety score of 80.

## Why it's its own commit

Both pages are simple CRUD-style registries (list + add-form) with no
cross-entity business logic — unlike trips/maintenance, which enforce state
transitions. Grouping them together keeps this commit focused on "reference
data management" as one coherent feature.

## Suggested commit message

```
feat(registry): add vehicle and driver registry pages

- VehiclesPage/VehicleForm: list + add vehicles with capacity/odometer/
  acquisition cost
- DriversPage/DriverForm: list + add drivers, flags expired licenses
```
