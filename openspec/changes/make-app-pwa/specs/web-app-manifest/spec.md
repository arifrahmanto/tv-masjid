## ADDED Requirements

### Requirement: Web App Manifest File Exists
The application SHALL include a `manifest.json` file at the root level that defines the PWA metadata, branding, and installation properties.

#### Scenario: Manifest file is properly served
- **WHEN** a browser requests `/manifest.json`
- **THEN** the server SHALL return a valid JSON file with HTTP 200 and `Content-Type: application/json`

#### Scenario: Manifest contains required fields
- **WHEN** the application starts
- **THEN** the manifest SHALL include `name`, `short_name`, `start_url`, `display`, `orientation`, `theme_color`, and `icons`

### Requirement: App Display Configuration
The manifest SHALL specify how the app appears when installed, with `display: "standalone"` to hide browser UI elements.

#### Scenario: Installed app displays standalone
- **WHEN** user installs the app and launches it from home screen
- **THEN** the app SHALL display in full-screen standalone mode without browser address bar or navigation controls

#### Scenario: Fallback display mode
- **WHEN** a browser does not support standalone mode
- **THEN** the app SHALL gracefully fall back to browser display mode with minimal UI

### Requirement: App Icons
The manifest SHALL provide multiple icon sizes for different device contexts (192x192 and 512x512 pixels minimum).

#### Scenario: Icon for installation dialog
- **WHEN** browser displays PWA installation prompt
- **THEN** the 192x192 icon SHALL be displayed to represent the app

#### Scenario: Icon for home screen
- **WHEN** user installs app and views home screen
- **THEN** the appropriate icon size (based on device) SHALL be displayed with proper aspect ratio

### Requirement: App Metadata
The manifest SHALL include human-readable app name, short name (for limited space displays), and description.

#### Scenario: Full app name display
- **WHEN** installation dialog or app store listing shows app details
- **THEN** the `name` field (max 45 chars for web stores) SHALL be displayed as the official app title

#### Scenario: Shortened name display
- **WHEN** device home screen space is limited (e.g., icon label)
- **THEN** the `short_name` field (max 12 chars) SHALL be used for the icon label

### Requirement: Start URL Configuration
The manifest SHALL define the entry point URL that launches when the app is opened from home screen.

#### Scenario: App opens to home page
- **WHEN** user taps the app icon on home screen
- **THEN** the app SHALL navigate to the URL specified in `start_url` (default `/`)

#### Scenario: URL parameters preserved
- **WHEN** start_url includes query parameters or path
- **THEN** those parameters SHALL be preserved and passed to the app

### Requirement: Theme and Color Configuration
The manifest SHALL define theme colors for the app's visual appearance in browser chrome and system UI.

#### Scenario: Address bar theme color
- **WHEN** app is accessed in browser
- **THEN** the `theme_color` SHALL tint the browser's address bar to match the app branding

#### Scenario: Splash screen background color
- **WHEN** app launches from home screen
- **THEN** the `background_color` SHALL display during app loading (splash screen)
