# Admin Panel Specification

## ADDED Requirements

### Requirement: Admin Panel Accessibility and Authentication
The admin panel SHALL be a single-page HTML application accessible via GitHub Pages at `/admin.html`. Access SHALL require GitHub OAuth authentication before any functionality is available.

#### Scenario: Unauthenticated user views admin panel
- **WHEN** unauthenticated user navigates to `/admin.html`
- **THEN** user is presented with a GitHub login button
- **AND** no settings or data are visible

#### Scenario: Authenticated user accesses admin panel
- **WHEN** user clicks GitHub login button and completes OAuth flow
- **THEN** user is successfully authenticated
- **AND** admin panel main interface is displayed
- **AND** GitHub OAuth token is stored in sessionStorage

### Requirement: Tabbed User Interface
The admin panel SHALL display a tabbed interface with the following sections: Marquee, Financial, Site, Prayer, Audio, and Advanced. Each tab SHALL be independently accessible.

#### Scenario: User switches between tabs
- **WHEN** user clicks different tab headers
- **THEN** the corresponding tab content is displayed
- **AND** previously entered data in other tabs are preserved (unsaved)

#### Scenario: Tab displays validation errors
- **WHEN** user switches tabs with invalid data in current tab
- **THEN** system shows warning that data has unsaved changes
- **AND** provides option to continue (discard changes) or cancel

### Requirement: Load Current Settings on Startup
Upon successful authentication, the admin panel SHALL fetch the current `setting.json` file from the repository and populate all form fields with existing values.

#### Scenario: Settings load successfully
- **WHEN** user authenticates
- **THEN** system fetches `setting.json` from GitHub
- **AND** all form fields are populated with current values
- **AND** loading indicator is shown during fetch

#### Scenario: Settings fetch fails
- **WHEN** GitHub API request fails or returns 404
- **THEN** error message is displayed to user
- **AND** admin is offered option to retry or cancel

### Requirement: Save Changes to Repository
The admin panel SHALL provide a "Save" button that validates all unsaved changes and commits them to `setting.json` via GitHub API. User SHALL provide a commit message.

#### Scenario: User saves valid changes
- **WHEN** user clicks "Save" button
- **THEN** system validates all form fields across all tabs
- **AND** if valid, user is prompted for commit message (with suggestion)
- **AND** system commits changes to `setting.json` via GitHub API
- **AND** success message is displayed with commit hash

#### Scenario: User saves with invalid data
- **WHEN** user clicks "Save" button with invalid data
- **THEN** system highlights invalid fields with error messages
- **AND** commit is prevented
- **AND** user must fix errors before save is allowed

#### Scenario: GitHub API commit fails
- **WHEN** GitHub API returns error (auth fail, rate limit, etc.)
- **THEN** error message is displayed with details
- **AND** user is offered option to retry or cancel
- **AND** local changes are preserved for retry

### Requirement: Display Commit History
The admin panel SHALL display recent commits to `setting.json` with timestamps, commit messages, and authors, allowing the user to see what changes were made and when.

#### Scenario: User views commit history
- **WHEN** user navigates to "History" section
- **THEN** last 10 commits affecting `setting.json` are displayed
- **AND** each commit shows: timestamp, message, author, commit hash (shortened)

### Requirement: Logout Functionality
The admin panel SHALL provide a logout button that clears the GitHub OAuth token from sessionStorage and returns the user to the login screen.

#### Scenario: User logs out
- **WHEN** user clicks "Logout" button
- **THEN** OAuth token is cleared from sessionStorage
- **AND** user is returned to login screen
- **AND** all form data is cleared from memory

### Requirement: Form Validation
All input fields SHALL be validated client-side before submission. Invalid entries SHALL prevent save and display clear error messages.

#### Scenario: Validation error on specific field
- **WHEN** user enters invalid data in any field
- **THEN** field is highlighted in red
- **AND** error message explains what is wrong and how to fix
- **AND** Save button is disabled until all errors are corrected

### Requirement: Unsaved Changes Warning
The admin panel SHALL warn the user if they attempt to leave the page with unsaved changes.

#### Scenario: User leaves page with unsaved changes
- **WHEN** user navigates away from admin panel with unsaved changes
- **THEN** browser shows confirmation dialog
- **AND** dialog warns that changes will be lost
- **AND** user can choose to stay and save, or leave without saving
