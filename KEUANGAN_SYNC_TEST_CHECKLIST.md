# Keuangan Live Sync Test Checklist

Date: 2026-02-21  
Change: `sync-keuangan-live-data`

## 1) Admin Save -> Live Keuangan Match (Task 3.1)

- [ ] Login to admin panel and open Financial tab
- [ ] Update all three funds (`month`, `previousBalance`, `income`, `expenses`)
- [ ] Click Save and confirm commit success message appears
- [ ] Open `setting.json` in GitHub and record committed values
- [ ] Refresh TV cycle until `keuangan.html` appears
- [ ] Verify each displayed field matches committed values for all three funds

### Expected
- `keuangan.html` values match `setting.json.financialSummary` exactly on next content load cycle.

### Actual Result
- _Fill after run in production_

---

## 2) Error Scenario Validation (Task 3.2)

### Scenario A: Missing key in payload
- [ ] Remove one key (example: `takmir.expenses`) in test branch config
- [ ] Load `keuangan.html`
- [ ] Verify full fallback remains (no partial live overwrite)
- [ ] Verify console warning includes missing-field reason

### Scenario B: Malformed numeric value
- [ ] Set a non-numeric value for one numeric key in test branch config
- [ ] Load `keuangan.html`
- [ ] Verify full fallback remains
- [ ] Verify warning indicates non-numeric field

### Scenario C: Fetch failure
- [ ] Simulate network error or invalid `setting.json` path
- [ ] Load `keuangan.html`
- [ ] Verify fallback remains intact
- [ ] Verify warning indicates fetch failure

### Expected
- All invalid payload cases keep fallback values and never show mixed fallback/live data.

### Actual Result
- _Fill after run in production_

---

## 3) Cache/Propagation Window (Task 3.3)

### Measurement Procedure
- [ ] Record timestamp at admin commit success (T0)
- [ ] Refresh deployed `setting.json` endpoint and note first observed new value time (T1)
- [ ] Refresh live TV content cycle and note first observed updated `keuangan.html` time (T2)
- [ ] Compute `T1 - T0` (GitHub Pages propagation) and `T2 - T0` (end-to-end visibility)

### Expected Consistency Timing
- GitHub commit visibility: usually under 1 minute
- GitHub Pages/static propagation: typically 1–5 minutes
- End-to-end TV visibility: propagation + next content rotation cycle

### Actual Timing Log
| Run | T0 Commit | T1 Setting Visible | T2 Keuangan Visible | End-to-end |
|-----|-----------|--------------------|---------------------|------------|
| 1 | _pending_ | _pending_ | _pending_ | _pending_ |
| 2 | _pending_ | _pending_ | _pending_ | _pending_ |

---

## 4) Troubleshooting Summary

- If commit fails in admin panel, live page stays on last committed values.
- If `financialSummary` is missing/incomplete/invalid, `keuangan.html` keeps fallback HTML values.
- If mismatch persists, verify `setting.json` commit hash in admin history and compare with live page after next cycle.
