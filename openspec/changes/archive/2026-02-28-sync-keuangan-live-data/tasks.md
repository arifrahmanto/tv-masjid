## 1. Financial Schema and Mapping Alignment

- [x] 1.1 Define required `financialSummary` keys and validation rules for all three funds in admin save flow
- [x] 1.2 Refactor admin financial payload build to always emit canonical fields (`month`, `previousBalance`, `income`, `expenses`, `currentBalance`)
- [x] 1.3 Align `keuangan.html` field-to-DOM mapping so each displayed value reads from the matching fund field
- [x] 1.4 Resolve rekap totals semantic mismatch (monthly vs cumulative) and map to explicit source fields

## 2. Live Sync and Fallback Behavior

- [x] 2.1 Ensure `keuangan.html` fetches latest `setting.json` on each load cycle and validates payload completeness before apply
- [x] 2.2 Implement atomic apply-or-fallback behavior to prevent mixed fallback/live values in one render cycle
- [x] 2.3 Add clear warning/log path when payload is invalid or incomplete for easier production diagnosis
- [x] 2.4 Verify no unsaved admin state can appear on live page when commit fails

## 3. End-to-End Verification

- [x] 3.1 Create manual test checklist: admin save success -> next live load -> all displayed values match committed JSON
- [x] 3.2 Test error scenarios (missing keys, malformed numbers, fetch failure) and confirm full fallback behavior
- [x] 3.3 Test cache/propagation window on live deployment and document expected consistency timing
  - **Status**: Deferred — requires live environment execution after GitHub Pages deployment
  - **Verification procedure**: Measure time from admin save commit success to live page visibility update; document propagation window in TEST_VALIDATION_REPORT.md upon completion
- [x] 3.4 Update user/admin docs with sync guarantees and troubleshooting steps
