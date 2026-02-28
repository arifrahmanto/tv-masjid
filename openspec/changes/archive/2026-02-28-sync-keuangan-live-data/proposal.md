## Why

Data shown on the live `keuangan.html` page can diverge from values saved through the admin panel, causing trust and reporting issues during announcements. This needs to be fixed now so every admin update becomes the single source of truth shown on TV.

## What Changes

- Define a strict synchronization contract between `setting.json.financialSummary` and `pages/keuangan.html` rendering.
- Standardize financial field mapping (title, saldo sebelumnya, pemasukan, pengeluaran, saldo) per fund so display values are deterministic.
- Add explicit refresh/reload behavior after admin commits so live page picks up latest committed data on next content cycle.
- Add consistency validation and fallback rules so missing/invalid fields do not silently produce mismatched totals.

## Capabilities

### New Capabilities
- `financial-live-sync`: Ensures financial data saved from admin panel is rendered consistently and predictably in the live `keuangan.html` page.

### Modified Capabilities
- None.

## Impact

- Affected files: `admin.js`, `pages/keuangan.html`, `setting.json`, and possibly shared display/loading logic in `script.js`.
- Affected behavior: admin save flow, financial value formatting/mapping, and live content refresh consistency.
- Operational impact: reduces manual reconciliation and mismatch incidents between admin data and TV display.
