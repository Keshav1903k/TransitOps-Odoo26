# Part 2 — Shared UI Component Library

**Files:** `src/components/ui.jsx`

## What this segment covers

A set of small, reusable presentational primitives used by every page in the
app. Nothing here knows about vehicles, drivers, or trips specifically — it's
pure UI plumbing, styled using the tokens from Part 1 (`../theme`).

| Component | Purpose |
|---|---|
| `Badge` | Colored status pill (uses `STATUS_STYLES`) |
| `Plate` | License-plate-style monospace chip (used for reg. numbers / license numbers) |
| `Card` | Bordered white panel container |
| `Btn` | Button with 5 variants: `default`, `amber`, `ghost`, `danger`, `teal` |
| `Field` | Labeled form field wrapper |
| `inputStyle` | Shared style object for text/number/date/select inputs |
| `Modal` | Centered overlay dialog with header + close button |
| `Banner` | Inline error/info banner (used for form validation messages) |
| `SectionHead` | Page header with title, subtitle and optional action button |
| `Th` / `Td` / `Table` | Table primitives with consistent styling |
| `KPI` | Dashboard metric card (label + big number + icon) |

## Why it's its own commit

These primitives are consumed by every page in Parts 3–5. Isolating them into
one commit means:
- Reviewers can see the full "design system" surface area in one diff.
- Any future restyling (e.g. swapping the button variants, tweaking table
  density) touches this one file instead of being scattered across pages.

## Suggested commit message

```
feat(ui): add shared component library

Badge, Plate, Card, Btn, Field, Modal, Banner, SectionHead, Table
primitives (Th/Td/Table), and KPI card — all styled from theme tokens.
Used by every page in the app.
```
