# Admin Panel Settings – Tasks

## 1. Setup and Infrastructure

- [x] 1.1 Create GitHub OAuth App and obtain Client ID and Client Secret
- [x] 1.2 Document OAuth app configuration (redirect URI, scopes)
- [x] 1.3 Create `admin.html` skeleton with Tailwind CSS styling
- [x] 1.4 Create `admin.js` main file with module structure
- [x] 1.5 Add `financialSummary` object structure to `setting.json` with sample three-fund data

## 2. GitHub OAuth Authentication Flow

- [x] 2.1 Implement GitHub OAuth redirect URL and authorization code handling
- [x] 2.2 Implement OAuth token exchange (code → access token)
- [x] 2.3 Store tokens in sessionStorage with automatic expiry (1 hour)
- [x] 2.4 Fetch and display authenticated user info (username)
- [x] 2.5 Create logout button and token cleanup functionality
- [x] 2.6 Add re-authentication prompt when token expires

## 3. Admin Panel Core UI and Navigation

- [x] 3.1 Build tabbed interface with tabs: Marquee, Financial, Site, Prayer, Audio, Advanced
- [x] 3.2 Implement tab switch logic and unsaved changes warning
- [x] 3.3 Create header with logo, title, user info, and logout button
- [x] 3.4 Add loading spinner/indicator for API calls
- [x] 3.5 Add global "Save" button and validation status display

## 4. Settings Loading and Display

- [x] 4.1 Implement fetch of current `setting.json` from GitHub API on startup
- [x] 4.2 Parse JSON and populate all form fields with current values
- [x] 4.3 Store file SHA for later commit operations
- [x] 4.4 Handle 404 and network errors gracefully during settings fetch
- [x] 4.5 Add retry mechanism for failed fetches

## 5. Transaction Ledger Manager

- [x] 5.1 Build marquee transactions table UI (Date, Description, Amount columns)
- [x] 5.2 Display all transactions sorted by date (newest first)
- [x] 5.3 Implement "Add New Entry" button and form (date picker, description, amount)
- [x] 5.4 Implement transaction add logic with client-side validation (date format, amount numeric)
- [x] 5.5 Implement Edit button and in-place/modal edit form
- [x] 5.6 Implement Delete button with confirmation dialog
- [x] 5.7 Add auto-sort by date after add/edit/delete operations
- [x] 5.8 Implement Indonesian number formatting (dots as thousands separator)
- [x] 5.9 Format transactions as `(DD/MM/YYYY) DESCRIPTION : AMOUNT` before saving
- [x] 5.10 Validate transaction format before creating commit

## 6. Financial Summary Manager

- [x] 6.1 Build three-fund layout (Pembangunan, Takmir, Sawah) with collapsible sections
- [x] 6.2 Create form fields for each fund: Month/Year, Previous Balance, Income, Expenses, Current Balance
- [x] 6.3 Make Current Balance read-only (calculated field)
- [x] 6.4 Implement auto-calculation logic: currentBalance = previousBalance + income - expenses
- [x] 6.5 Add validation for numeric fields (reject non-numbers)
- [x] 6.6 Populate financial forms from `setting.json` `financialSummary` on startup
- [x] 6.7 Implement collapsible/expandable fund sections

## 7. Settings Management – Site Configuration

- [x] 7.1 Build Site tab with pageTitle input field
- [x] 7.2 Build contentUrls list manager (add/remove URLs dynamically)
- [x] 7.3 Add validation for content URLs (basic URL format check)
- [x] 7.4 Populate site settings from `setting.json` on startup

## 8. Settings Management – Prayer Configuration

- [x] 8.1 Build Prayer tab with prayerApiCity field (text or dropdown)
- [x] 8.2 Build prayer time adjustment fields (prayerApiTune: 9 numeric fields for prayer offsets)
- [x] 8.3 Add tarhimOffsetMinutes, countdownSecondsThreshold number fields
- [x] 8.4 Build audio file reference fields (tarhimAudioFile, beepAudioFile, countdownHtmlFile)
- [x] 8.5 Add validation for numeric fields and filename formats
- [x] 8.6 Populate prayer settings from `setting.json` on startup

## 9. Settings Management – Audio and Schedules

- [x] 9.1 Build Audio tab with audioSchedule table (Day of Week, Time Relative to Prayer, Audio File, Offset)
- [x] 9.2 Implement add/edit/delete for audio schedule entries
- [x] 9.3 Add day-of-week selector (0-6 or name dropdown)
- [x] 9.4 Add prayer selector for "relative to" field (subuh, dzuhur, ashar, maghrib, isya)
- [x] 9.5 Add audio file picker or text input
- [x] 9.6 Add offset minutes number field (positive or negative)
- [x] 9.7 Populate audio schedules from `setting.json` on startup

## 10. Advanced Features

- [x] 10.1 Build Advanced tab with raw JSON viewer (read-only display of current setting.json)
- [x] 10.2 Add "Copy to Clipboard" button for raw JSON
- [-] 10.3 (Optional) Add JSON editor for power users to edit raw JSON directly

## 11. Form Validation and Error Handling

- [x] 11.1 Implement global form validation across all tabs before save
- [x] 11.2 Highlight invalid fields with red borders and error messages
- [x] 11.3 Disable Save button if any invalid data exists
- [x] 11.4 Add field-level validation feedback (on blur, on change)
- [x] 11.5 Create reusable validation utilities for common patterns (date, number, URL, etc.)

## 12. Commit and GitHub API Integration

- [x] 12.1 Implement "Save" button that validates all form data
- [x] 12.2 Create commit message input field with suggested default message
- [x] 12.3 Build JSON rebuild logic: convert all form data back to `setting.json` structure
- [x] 12.4 Implement GitHub API PUT request to create commit
- [x] 12.5 Handle GitHub API errors: 409 (conflict), 429 (rate limit), auth failures
- [x] 12.6 Display success message with commit hash after successful commit
- [x] 12.7 Preserve local changes on commit failure and offer retry
- [-] 12.8 (Optional Enhancement) Implement optimistic UI update (show changes immediately, revert on error)

## 13. Commit History and Audit Trail

- [x] 13.1 Create History section/tab displaying recent commits to `setting.json`
- [x] 13.2 Fetch last 10 commits using GitHub API
- [x] 13.3 Display commit info: timestamp, author, message, commit hash
- [x] 13.4 Sort history newest-first
- [x] 13.5 Add refresh button to reload commit history

## 14. Financial Data Integration with Keuangan.html

- [x] 14.1 Update `keuangan.html` to read `financialSummary` from `setting.json` instead of hardcoded values
- [x] 14.2 Parse `financialSummary.pembangunan` and populate Kas Pembangunan table
- [x] 14.3 Parse `financialSummary.takmir` and populate Kas Takmir table
- [x] 14.4 Parse `financialSummary.sawah` and populate Kas Sawah table
- [x] 14.5 Add fallback to hardcoded values if `financialSummary` not present in `setting.json`
- [x] 14.6 Test financial display on actual TV or local server

## 15. Testing and Validation

- [x] 15.1 Test GitHub OAuth flow (login, token storage, logout)
- [x] 15.2 Test transaction ledger (add, edit, delete, sort, format)
- [x] 15.3 Test financial summary (auto-calculation, validation, persistence)
- [x] 15.4 Test all settings tabs (populate, validate, save)
- [x] 15.5 Test form validation error messages and field highlighting
- [x] 15.6 Test unsaved changes warning when navigating away
- [x] 15.7 Test GitHub API error scenarios (network loss, rate limits, 409 conflict)
- [x] 15.8 Test commit history display
- [x] 15.9 Verify `setting.json` structure after multiple commits
- [x] 15.10 Test financial data display in keuangan.html on TV

## 16. Deployment and Documentation

- [x] 16.1 Add `admin.html` and `admin.js` to repository
- [x] 16.2 Update `setting.json` with `financialSummary` structure
- [x] 16.3 Create deployment documentation (GitHub OAuth setup steps)
- [x] 16.4 Document admin panel usage (how to access, how to update marquee, etc.)
- [x] 16.5 Deploy to GitHub Pages and verify accessibility
- [x] 16.6 Test end-to-end: update in admin panel → verify TV displays changes within minutes
- [x] 16.7 Create runbook for troubleshooting common issues
