# GitHub Sync Specification

## ADDED Requirements

### Requirement: GitHub OAuth Authentication
Admin panel SHALL implement GitHub OAuth 2.0 flow for user authentication. User SHALL authenticate via GitHub, and a token SHALL be obtained with `repo` scope for file access.

#### Scenario: User logs in via GitHub OAuth
- **WHEN** user is not authenticated and clicks GitHub login button
- **THEN** user is redirected to GitHub OAuth consent screen
- **AND** GitHub asks for permission to access repositories (scope: `repo`)
- **AND** user clicks "Authorize"
- **AND** user is redirected back to admin panel with authorization code
- **AND** admin panel exchanges code for access token

#### Scenario: Token is stored securely
- **WHEN** access token is obtained from GitHub
- **THEN** token is stored in browser sessionStorage (not localStorage)
- **AND** token is passed in Authorization header for subsequent API calls
- **AND** token does not appear in console logs or debug output

#### Scenario: Token expires after inactivity
- **WHEN** user is inactive for 1 hour
- **THEN** token is automatically cleared from sessionStorage
- **AND** next API call returns 401 Unauthorized
- **AND** user is prompted to re-authenticate

### Requirement: Read Current Setting.json via GitHub API
Admin panel SHALL fetch the current `setting.json` file from the repository using GitHub API (GET /repos/{owner}/{repo}/contents/setting.json) with authentication token.

#### Scenario: Admin panel loads current settings on startup
- **WHEN** user authenticates successfully
- **THEN** system makes API call to fetch `setting.json` content
- **AND** response includes base64-encoded file content
- **AND** system decodes content and populates form fields
- **AND** response includes file SHA (needed for update)

#### Scenario: File fetch returns 404
- **WHEN** GitHub API returns 404 (file not found)
- **THEN** error message is displayed: "Setting file not found in repository"
- **AND** user is offered options to create default or abort

#### Scenario: Authentication token is invalid or expired
- **WHEN** GitHub API returns 401 Unauthorized
- **THEN** user is logged out automatically
- **AND** user is redirected to login screen with message: "Session expired, please log in again"

### Requirement: Commit Changes via GitHub API
When user clicks Save, admin panel SHALL create a commit to `setting.json` using GitHub API (PUT /repos/{owner}/{repo}/contents/setting.json) with the updated file content, commit message, and authentication token.

#### Scenario: Admin saves changes and commit succeeds
- **WHEN** admin validates form data and clicks Save
- **AND** user enters commit message (or default is used)
- **AND** admin clicks "Commit"
- **THEN** system prepares JSON payload with:
  - new file content (base64 encoded)
  - commit message (provided by user)
  - author name and email (from GitHub API user info)
  - sha of current file (from previous fetch)
- **AND** system makes PUT request to GitHub API
- **AND** GitHub returns success with commit hash
- **AND** success message is displayed: "Changes committed: [hash]"

#### Scenario: Commit fails due to file conflict
- **WHEN** another change was pushed to repository between fetch and commit
- **AND** SHA no longer matches current file on GitHub
- **THEN** GitHub API returns 409 Conflict
- **AND** error message is displayed: "File was modified elsewhere. Please reload settings and try again."
- **AND** user is offered "Reload and Retry" button

#### Scenario: Commit fails due to rate limiting
- **WHEN** GitHub API returns 429 Too Many Requests
- **THEN** error message is displayed with retry-after time
- **AND** user is offered option to retry after cooldown

#### Scenario: Commit message generation
- **WHEN** user does not explicitly enter commit message
- **THEN** system generates default message: "Update settings from admin panel"
- **AND** default message is shown as placeholder/suggestion
- **AND** user can override with custom message

### Requirement: GitHub OAuth App Configuration
Admin panel requires a GitHub OAuth App to be created and configured. The app SHALL have:
- Client ID (public)
- Client Secret (private, not exposed in client-side code)
- Redirect URI configured to point to admin panel URL

#### Scenario: OAuth app is configured
- **WHEN** admin panel is deployed
- **THEN** GitHub OAuth App credentials must be available
- **AND** Client ID is embedded in admin.html or fetched from environment
- **AND** Client Secret is kept secure on server (if needed) or handled via GitHub token exchange
- **AND** Redirect URI matches deployed domain

### Requirement: Graceful Error Handling for API Failures
All GitHub API calls SHALL include error handling with user-friendly messages. Network errors, timeouts, and API errors SHALL not crash the admin panel.

#### Scenario: Network request times out
- **WHEN** GitHub API request times out (>30 seconds)
- **THEN** timeout error is caught and displayed: "Request timed out. Please check your connection and try again."
- **AND** user is offered Retry button

#### Scenario: Network connection lost
- **WHEN** user loses internet connection during commit
- **THEN** error message is displayed: "Network connection lost"
- **AND** changes are preserved in local form state
- **AND** user can retry when connection is restored

### Requirement: Commit History Retrieval
Admin panel SHALL retrieve recent commits affecting `setting.json` using GitHub API (GET /repos/{owner}/{repo}/commits?path=setting.json).

#### Scenario: Admin views commit history
- **WHEN** admin navigates to History section
- **THEN** system fetches last 10 commits for `setting.json`
- **AND** displays: timestamp, author, commit message, commit hash
- **AND** history is sorted newest-first

#### Scenario: Fetch commit history fails
- **WHEN** GitHub API call to fetch commits fails
- **THEN** error message is displayed
- **AND** user is offered Retry button

### Requirement: User Info Display
After authentication, admin panel SHALL fetch user profile information from GitHub API (/user endpoint) and display username in UI.

#### Scenario: Display authenticated user name
- **WHEN** user authenticates via GitHub OAuth
- **THEN** system fetches user profile (GET /user)
- **AND** username is displayed in panel (e.g., "Logged in as: [username]")
- **AND** logout button appears next to username

### Requirement: Privacy and Security
All API communication SHALL use HTTPS. OAuth tokens SHALL be stored only in sessionStorage (never persisted). Tokens SHALL not be logged or exposed in browser console.

#### Scenario: Secure token storage
- **WHEN** token is received from GitHub
- **THEN** token is stored ONLY in sessionStorage
- **AND** token is not written to localStorage, cookies, or console
- **AND** token is cleared when user navigates away
