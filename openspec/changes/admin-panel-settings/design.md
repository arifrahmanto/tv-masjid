# Admin Panel Settings – Design

## Context

**Current state:** 
- TV display settings live in `setting.json` and `pages/*.html` files
- Changes require Git workflow: manual edit → commit → push → GitHub Pages rebuild → TV refresh
- Marquee text is a hardcoded array; financial data in `keuangan.html` is static HTML
- No audit trail, no remote management

**Constraints:**
- Must remain static-site deployable (no backend server)
- GitHub Pages is the deployment target
- TV refresh cycle is out of band (periodic polling, not push)
- Only one trusted admin (you)

**Stakeholders:**
- Admin user (you): needs quick, reliable updates
- TV displays: need to pull updated config without intervention
- Future: possibly other masjids reusing this codebase

## Goals / Non-Goals

**Goals:**
- Enable real-time updates to marquee, financial data, and all settings without Git knowledge
- Create a centralized interface to manage all `setting.json` properties
- Maintain audit trail (Git history shows what changed and when)
- Keep workflow simple: Edit → Save → Done (no commits, builds, or deployments visible)
- Support transaction ledger with structured add/edit/delete UI

**Non-Goals:**
- Full role-based access control (not needed for single admin)
- Mobile-friendly responsive design (can be web-only)
- Automated deployment to multiple repositories
- Real-time push to TVs (eventual consistency acceptable)
- Ability to directly edit keuangan.html; financial data managed through admin panel

## Decisions

### 1. GitHub OAuth for Authentication

**Decision:** Use GitHub OAuth (via GitHub API) for admin authentication.

**Rationale:**
- No separate user database needed
- Leverages existing GitHub repo credentials
- Simple library support (github-app or similar)
- Audit trail: commit messages show who changed what

**Alternatives considered:**
- Simple password: Less secure, harder to audit (commits appear as if from system user)
- Email-based OTP: More friction, requires email service
- None (trust on same network): Risky if TV is on public network

**Implementation:**
- Admin panel requests GitHub OAuth token (redirect to GitHub, scope: `repo`)
- Token stored in browser sessionStorage (not persisted)
- Token passed to API calls for file commits
- Token expires after 1 hour of inactivity (user must re-auth)

---

### 2. Admin Panel as Single-Page App in Repo

**Decision:** Admin panel lives as `admin.html` + `admin.js` in the repo, accessible via GitHub Pages.

**Rationale:**
- No separate hosting needed; uses same deployment as TV display
- GitHub OAuth app can be configured for single repo
- Versioned alongside code; easy to update
- Reduces infrastructure complexity

**Alternatives considered:**
- Separate hosted service: Requires infrastructure, complicates deployment
- Embedded iframe: Harder to manage auth, less clean separation

**Implementation:**
- `admin.html`: Static markup with Bootstrap or Tailwind for styling
- `admin.js`: Main logic, GitHub API calls, form handling, validation
- Access via `/admin.html` on GitHub Pages or custom domain
- Not linked from main display (security through obscurity + auth)

---

### 3. Tabbed UI for Organized Settings

**Decision:** Organize admin panel into logical tabs/sections:
1. **Marquee** - Transaction ledger (table UI)
2. **Financial** - Summary for three funds
3. **Site** - Title, content URLs
4. **Prayer** - Prayer times, city, tuning offsets
5. **Audio** - Tarhim, beep files, schedules
6. **Advanced** - Raw JSON viewer (optional power-user mode)

**Rationale:**
- Reduces cognitive load; changes grouped by concern
- High-frequency changes (marquee, financial) front-and-center
- Low-frequency changes (prayer config) separate
- Discovery-friendly for future admins

**Implementation:**
- Tab navigation at top
- Each tab loads/saves independently (no cross-tab dependencies)
- Validation per-tab before save
- Unsaved changes warning on tab switch

---

### 4. Data Structure: Centralize Financial Summary

**Decision:** Add `financialSummary` object to `setting.json` alongside `marqueeText`:

```json
{
  "pageTitle": "...",
  "marqueeText": [...],
  "financialSummary": {
    "pembangunan": {
      "month": "December 2025",
      "previousBalance": 97771922,
      "income": 123676000,
      "expenses": 104262500,
      "currentBalance": 117185422
    },
    "takmir": { ... },
    "sawah": { ... }
  },
  ...
}
```

**Rationale:**
- Centralized data: Marquee and financial summaries both in one file
- `keuangan.html` reads from `setting.json` instead of hardcoded values
- Admin panel manages one source of truth
- Easier to sync, audit, and backup

**Alternatives considered:**
- Keep financial data hardcoded in `keuangan.html`: Fragmented state, harder to manage
- Separate `financial.json`: Adds file complexity for minimal benefit

**Implementation:**
- Migration: Parse existing `keuangan.html`, extract current values, add to `setting.json`
- Update `script.js` to fetch `financialSummary` and populate `keuangan.html` dynamically

---

### 5. Transaction Ledger with Automatic Sorting

**Decision:** Marquee transactions stored as strings in array, automatically sorted by date on save.

Format: `(DD/MM/YYYY) DESCRIPTION : AMOUNT` where AMOUNT uses Indonesian format (dots as thousands separator).

**Rationale:**
- Maintains existing format compatibility
- Automatic sort removes manual ordering burden
- Simple string format for human-readable Git diffs

**Alternatives considered:**
- Structured JSON objects: More complex, less readable in Git history
- CSV import: Adds external dependency, UI friction

**Implementation:**
- Admin panel has table with Date, Description, Amount fields
- Add/Edit/Delete buttons for each row
- On save: Sort by date descending (newest first), format as strings, commit
- Validation: Verify date format, description non-empty, amount is number

---

### 6. GitHub API Commits for Instant Deployment

**Decision:** Use GitHub API (v3 REST or v4 GraphQL) to create commits directly to `setting.json`.

**Rationale:**
- No local Git clone needed
- No command-line tools required
- Instant deployment via existing GitHub Pages workflow
- Clean commit messages for audit trail

**Alternatives considered:**
- Use GitHub CLI: Requires local setup, not accessible from web browser
- Use GitHub Actions: Extra setup, overkill for simple file updates

**Implementation:**
- Use `PUT /repos/{owner}/{repo}/contents/{path}` endpoint
- Payload includes file content (base64), commit message, author info
- On successful commit, GitHub Pages rebuilds automatically
- TV picks up changes on next refresh (within minutes)

**API Flow:**
```
1. Admin clicks "Save"
2. Validate form data
3. Read current setting.json from GitHub (get SHA)
4. Prepare new content + commit message
5. POST to GitHub API with auth token
6. Show success/error to user
7. TV refreshes on next cycle, loads new config
```

---

### 7. Client-Side Validation Only

**Decision:** Validate form inputs on the client side before sending to GitHub API.

**Rationale:**
- Faster feedback to user
- No server needed
- JSON validation catches schema errors before commit

**Validation Rules:**
- Marquee entries: Date format DD/MM/YYYY, description non-empty, amount is valid number
- Financial summaries: All numeric fields positive or negative (no text)
- Prayer city: Non-empty string
- Audio files: Valid filename format
- URLs: Basic URL format check

**Alternatives considered:**
- Server-side validation: Requires backend, overkill for single admin
- No validation: Risky, could break TV display

---

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **Invalid JSON breaks TV display** | Client-side JSON validation before commit. Keep raw JSON viewer for inspection. TV falls back to last known-good if parse fails. |
| **GitHub API rate limits (60 req/hour for auth'd user)** | Low risk for single admin. 60 commits/hour is plenty. If needed, request higher tier. |
| **OAuth token leaks** | Token only in sessionStorage, cleared on logout. HTTPS only. Short expiration (1 hour). GitHub app can be revoked immediately if compromised. |
| **Marquee data grows large** | Current ~50 entries. If grows to thousands, might need pagination. Not a blocker now; can address in v2. |
| **Financial data gets out of sync with external ledger** | Single source of truth in admin panel. Admin responsible for accuracy. No automated sync (mitigated by audit trail). |
| **TV doesn't refresh for hours (offline/slow network)** | Expected eventual consistency. Not a blocker; can add "force refresh" endpoint later if needed. |
| **Accidental data deletion** | Git history provides recovery. Admin can view commit history in GitHub and revert if needed. |

---

## Migration Plan

**Phase 1: Prepare (no downtime)**
- Add `admin.html` and `admin.js` to repo
- Update `script.js` to read `financialSummary` from `setting.json`
- Migrate `keuangan.html` data into `setting.json` structure
- Test admin panel locally

**Phase 2: Deploy (minimal downtime)**
- Commit all changes to repo
- GitHub Pages builds automatically
- Admin panel accessible at `/admin.html`
- TV display behavior unchanged (reads updated `setting.json` on next refresh)

**Phase 3: Rollback (if issues)**
- Revert latest commit in GitHub
- GitHub Pages rebuilds to previous version
- Admin panel no longer accessible; fall back to manual Git editing

---

## Open Questions

1. **Financial summary: How often do you update these balances?** (Monthly? After each entry?) This affects how much the admin panel needs to automate vs. manually maintain.

2. **Should the admin panel create separate delta specs for modified capabilities like site-config and prayer-times?** Or is this a non-breaking addition?

3. **Do we need version tracking for settings?** (e.g., "last updated 2 hours ago" shown on TV?) Currently no, but valuable for debugging stale displays.

4. **Should financial summaries auto-calculate?** (e.g., Current Balance = Previous + Income - Expenses?) Or always manual entry?

5. **Multi-location future:** If adding more masjids later, should we design for separate repos or one repo with multiple configs? (Design doesn't preclude either, but good to think about.)

---

**Next:** Specs define exact requirements for each capability. Tasks will break down implementation into work items.
