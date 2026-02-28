# Admin Panel Settings – Proposal

## Why

Currently, any change to the TV display (marquee text, prayer times, financial data, schedules) requires:
1. Manual editing of `setting.json` or HTML files
2. Git commit and push
3. GitHub Pages rebuild
4. TV eventually refreshes (delayed, not guaranteed immediate)

This process is slow, fragile, and demands technical knowledge (Git, JSON). For a mosque running multiple displays, managing updates across different TVs becomes increasingly painful. The financial ledger especially—currently a 50+ entry array in `setting.json`—requires manual entry every time a donation comes in.

**What we need:** A simple web-based admin panel that lets authorized users update all settings and data in one place, publish changes with a click, and have TVs pick them up within minutes (no Git knowledge required).

## What Changes

- **New admin panel** (single-page web app) accessible to authorized users for centralized management
- **Transaction ledger manager** for marquee entries (date, description, amount) with add/edit/delete/sort
- **Financial summary editor** to manage keuangan.html balance sheets (3 funds: Pembangunan, Takmir, Sawah)
- **Complete settings editor** for all `setting.json` properties (site config, prayer times, audio files, schedules)
- **GitHub integration** (OAuth + API commits) for real-time deployment without manual pushes
- **Commit history** visible in admin panel for audit trail

## Capabilities

### New Capabilities

- `admin-panel`: Web-based settings management interface accessible via GitHub OAuth. Manages all `setting.json` properties and handles GitHub API commits.
- `transaction-ledger`: Marquee transaction editor. Displays, creates, edits, and deletes entries in `(date) description : amount` format, auto-sorted by date, updates `setting.json`.
- `financial-summary`: Financial balance sheet manager for three mosque funds (Pembangunan, Takmir, Sawah). Each fund tracks starting balance, income, expenses, and current balance.
- `github-sync`: Integration with GitHub API for OAuth authentication and direct file commits to the repository, enabling real-time deployment.

### Modified Capabilities

- None. This is a net addition; existing TV display and content logic remain unchanged.

## Impact

**Code changes:**
- New file: `admin.html` (the panel interface)
- New file: `admin.js` (panel logic + GitHub API integration)
- Potentially updated: `setting.json` structure if we add a new `financialSummary` object
- Potentially updated: `keuangan.html` to read from centralized data instead of hardcoded values

**Infrastructure:**
- Requires GitHub OAuth app credentials (can store in environment or admin panel config)
- No new backend server needed (uses GitHub API directly)
- TV behavior unchanged; just pulls updated `setting.json` on next refresh cycle

**User experience:**
- New workflow: Open admin panel → edit → click Save → changes live within minutes
- Audit trail: All changes tracked in Git history with commit messages
- Reduced friction: No technical knowledge required to update mosque data

---

**Next:** Design will detail the UI/UX, data flow, and GitHub OAuth setup. Specs will define exact behavior of each capability.
