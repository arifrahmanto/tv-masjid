## Context

`keuangan.html` currently loads fallback values embedded in HTML and optionally replaces them from `setting.json.financialSummary`. In live conditions, admins can update data via admin panel, but users still report mismatch between admin values and what appears on TV. This indicates weak sync guarantees across save, reload, field mapping, and display rendering.

The system is static-site based (GitHub Pages), so no server push is available. TV display refreshes by polling and rotating pages. The design must guarantee eventual consistency without backend infrastructure while preserving graceful fallback when data is unavailable.

## Goals / Non-Goals

**Goals:**
- Make `setting.json.financialSummary` the single source of truth for financial display.
- Define deterministic field mapping from admin form -> JSON -> `keuangan.html` DOM nodes.
- Ensure live display loads the latest committed values after admin save on the next refresh/content cycle.
- Preserve safe fallback behavior for missing/invalid payloads without mixing stale and new values.

**Non-Goals:**
- Real-time push updates to active TV sessions without refresh.
- Multi-repository or multi-tenant sync.
- Redesign of financial UI layout/content wording beyond data consistency needs.

## Decisions

### 1) Enforce canonical financial contract in `setting.json`
Use a strict schema for each fund (`month`, `previousBalance`, `income`, `expenses`, `currentBalance`) and treat missing keys as invalid for sync.

**Why:** Prevent silent partial updates and undefined mapping behavior.

**Alternatives considered:**
- Loose/optional keys: simpler but leads to hidden mismatches.
- Separate data file for keuangan page: increases drift risk and maintenance overhead.

### 2) Centralize render mapping per fund
Define one explicit mapping table per fund so each DOM target (`...Prev`, `...Income`, `...Expense`, `...Balance`, titles) comes from known JSON fields.

**Why:** Eliminates accidental re-use/misalignment (e.g., monthly values accidentally used as cumulative totals).

**Alternatives considered:**
- Ad-hoc manual assignment: flexible but error-prone.
- Dynamic generic renderer: overkill for fixed 3-fund layout.

### 3) Version-aware live refresh behavior
After successful admin save, rely on GitHub commit completion and existing page reload cycle; ensure `keuangan.html` re-fetches `setting.json` each load and applies all-or-fallback update atomically.

**Why:** Works with static hosting constraints while avoiding mixed-state rendering.

**Alternatives considered:**
- Cache-busting query timestamps everywhere: helps but can increase request churn.
- Long polling on page: unnecessary complexity for rotating content flow.

### 4) Atomic fallback strategy
If `financialSummary` is missing/invalid, keep full fallback block and log one explicit warning; never partially overwrite only some fields.

**Why:** Partial writes are a key source of visible mismatch.

**Alternatives considered:**
- Best-effort partial updates: can produce confusing hybrid values.

## Risks / Trade-offs

- [GitHub Pages/cache propagation delay] -> Mitigation: document eventual consistency window and ensure re-fetch on each page load.
- [Data shape changed by manual edits] -> Mitigation: schema validation in admin save and defensive validation in display load.
- [Display/JSON semantic mismatch (monthly vs cumulative)] -> Mitigation: define explicit semantic labels and mapping in spec.
- [Fallback masks recurring sync issues] -> Mitigation: add visible logging/monitoring checklist for admin verification.

## Migration Plan

1. Align admin save payload to canonical `financialSummary` schema and semantics.
2. Align `keuangan.html` mapping to canonical schema with atomic apply-or-fallback behavior.
3. Validate through end-to-end scenario: save in admin -> commit success -> reload live `keuangan.html` -> values match.
4. Keep rollback path via Git revert of `setting.json` and display logic commit if mismatch occurs.

## Open Questions

- Should rekap totals in `keuangan.html` remain monthly mirrors or use distinct cumulative fields?
- Do we need an explicit "last update" timestamp on keuangan display for operator trust?
- Is cache-busting needed only for `setting.json` fetch or for iframe content URLs as well?
