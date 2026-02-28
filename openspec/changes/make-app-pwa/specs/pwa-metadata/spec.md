## ADDED Requirements

### Requirement: PWA Detection Meta Tags
The application's HTML SHALL include meta tags that identify it as a PWA and communicate its properties to browsers and crawlers.

#### Scenario: Manifest link in HTML
- **WHEN** browser parses index.html
- **THEN** HTML `<head>` SHALL contain `<link rel="manifest" href="/manifest.json">`

#### Scenario: Theme color meta tag present
- **WHEN** browser loads the app
- **THEN** HTML `<head>` SHALL include `<meta name="theme-color" content="#<color>">`

#### Scenario: App name meta tag present
- **WHEN** browser detects PWA
- **THEN** HTML `<head>` SHALL include `<meta name="application-name" content="TV Masjid">`

### Requirement: Mobile Viewport Configuration
The HTML SHALL configure viewport settings for proper display on mobile devices and responsive layouts.

#### Scenario: Viewport meta tag correctly configured
- **WHEN** app loads on mobile device
- **THEN** HTML `<head>` SHALL include `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

#### Scenario: Content renders responsively
- **WHEN** app displays on different screen sizes
- **THEN** content SHALL adapt to screen width without horizontal scrolling or layout breaks

### Requirement: PWA Standalone Support Detection
The HTML and JavaScript SHALL support detection of standalone display mode for customized UI.

#### Scenario: Standalone mode detection in JavaScript
- **WHEN** app runs in standalone mode
- **THEN** JavaScript code SHALL detect `window.navigator.standalone === true` (iOS) or check `display-mode` media query

#### Scenario: App adapts UI for standalone
- **WHEN** app detects standalone mode
- **THEN** app MAY hide browser-specific UI elements or adjust layout for gap-free fullscreen display

### Requirement: Touch Icon Support
The application SHALL provide a touch icon for iOS home screen add-to-home-screen compatibility.

#### Scenario: Apple touch icon provided
- **WHEN** iOS user adds app to home screen manually
- **THEN** HTML `<head>` SHALL include `<link rel="apple-touch-icon" href="/icon-180x180.png">`

#### Scenario: Touch icon displays correctly
- **WHEN** app is added to iOS home screen
- **THEN** the touch icon SHALL appear as the app icon (rounded, glossy effect applied by iOS)

### Requirement: Status Bar and System UI Theming
The application SHALL customize the appearance of system status bars and browser chrome on mobile.

#### Scenario: Status bar color matches app theme
- **WHEN** app opens on Android
- **THEN** system status bar color SHALL match theme_color from manifest (dark gray, blue, or app primary color)

#### Scenario: Browser chrome color configured
- **WHEN** app accessed in browser (not installed)
- **THEN** browser address bar and chrome SHALL tint to theme-color for branding consistency

### Requirement: Open Graph and Social Sharing Metadata
The application SHALL include Open Graph tags for proper preview when shared on social media.

#### Scenario: Open Graph title set
- **WHEN** app URL is shared on social media
- **THEN** preview SHALL display `og:title` (e.g., "TV Masjid")

#### Scenario: Open Graph image set
- **WHEN** app is shared
- **THEN** preview SHALL display `og:image` with app icon or screenshot

#### Scenario: Open Graph description set
- **WHEN** shared on social platforms
- **THEN** preview SHALL include `og:description` summarizing the app

### Requirement: DNS Prefetch and Performance Optimization
The HTML SHALL include metadata for DNS prefetch and resource hints to improve load performance.

#### Scenario: DNS prefetch for external APIs
- **WHEN** app loads
- **THEN** HTML SHALL include `<link rel="dns-prefetch" href="https://api.github.com">` for known external hosts

#### Scenario: Preconnect for critical resources
- **WHEN** page loads
- **THEN** HTML MAY include `<link rel="preconnect" href="...">` for critical external domains

### Requirement: Charset and Language Settings
The HTML SHALL specify character encoding and language for proper text rendering.

#### Scenario: UTF-8 charset declared
- **WHEN** HTML is parsed
- **THEN** `<head>` SHALL include `<meta charset="UTF-8">` as first meta tag

#### Scenario: Language tag set
- **WHEN** browser processes the page
- **THEN** HTML root element SHALL include `lang="id"` or `lang="en"` attribute

### Requirement: Security Content-Security-Policy (CSP)
The HTML SHALL define or reference CSP headers to protect against injection attacks.

#### Scenario: CSP meta tag or header present
- **WHEN** app loads
- **THEN** server SHALL set `Content-Security-Policy` header (or meta tag) restricting script sources

#### Scenario: Third-party scripts controlled
- **WHEN** app executes scripts
- **THEN** CSP policy SHALL restrict execution to trusted sources only (prevent inline scripts, unsigned extensions)

### Requirement: Manifest Accessibility Link
The PWA manifest itself SHALL be discoverable and include accessibility-related metadata.

#### Scenario: Manifest is valid JSON
- **WHEN** browser fetches `/manifest.json`
- **THEN** JSON SHALL be valid and contain no syntax errors

#### Scenario: Manifest includes accessibility metadata
- **WHEN** assistive tech reads manifest
- **THEN** manifest MAY include `description` and `purpose` for icons enabling accessibility tools to understand the app
