## ADDED Requirements

### Requirement: Service Worker Registration
The application SHALL register a service worker file at `/sw.js` during initialization to intercept network requests and enable offline support.

#### Scenario: Service worker registers successfully
- **WHEN** the application loads
- **THEN** JavaScript code SHALL call `navigator.serviceWorker.register('/sw.js')`

#### Scenario: Registration error handling
- **WHEN** service worker registration fails
- **THEN** the application SHALL log the error to console and continue functioning (graceful degradation)

#### Scenario: Service worker updates automatically
- **WHEN** files are deployed with new service worker code
- **THEN** the browser SHALL check for updates and install the new version in the background

### Requirement: Service Worker Lifecycle
The service worker SHALL manage install, activate, and fetch events to control caching behavior and handle offline requests.

#### Scenario: Service worker installs
- **WHEN** service worker code is first loaded
- **THEN** the `install` event SHALL fire and pre-cache essential assets (manifest, critical JS, CSS)

#### Scenario: Old caches are cleaned up
- **WHEN** a new version of the service worker activates
- **THEN** the `activate` event SHALL clean up old cache versions and take control of all pages

#### Scenario: Fetch requests are intercepted
- **WHEN** a browser requests a resource (JS, CSS, API, images)
- **THEN** the `fetch` event handler SHALL intercept the request and apply caching strategy

### Requirement: Cache Management
The service worker SHALL maintain organized caches with versioning to prevent stale data issues.

#### Scenario: Assets are cached with version prefix
- **WHEN** static assets are cached
- **THEN** cache names SHALL include a version identifier (e.g., `v1-assets`, `v2-assets`)

#### Scenario: Cache updates do not affect running app
- **WHEN** a new cache version is created
- **THEN** currently-running pages SHALL continue using old cache until refresh

#### Scenario: Storage quota is monitored
- **WHEN** cached data approaches browser storage limits
- **THEN** the service worker SHALL implement cleanup logic to delete old or least-used caches

### Requirement: Static Asset Caching
Static assets (CSS, JavaScript, fonts, images) SHALL use cache-first strategy for performance.

#### Scenario: Cached asset loads immediately
- **WHEN** user visits the app after initial load
- **THEN** static CSS and JS files SHALL load from cache without network request

#### Scenario: Cached asset fallback
- **WHEN** network is unavailable
- **THEN** static assets SHALL load from cache without error

### Requirement: Network Error Handling
The service worker SHALL provide fallback responses when network is unavailable and no cache exists.

#### Scenario: Offline page displayed for unsupported routes
- **WHEN** user navigates to an unsupported URL offline
- **THEN** the service worker SHALL return a generic offline page or error message

#### Scenario: API errors gracefully degraded
- **WHEN** API request fails offline
- **THEN** the app SHALL display cached data or "offline" message instead of broken UI

### Requirement: Service Worker Debugging
The service worker code SHALL include logging and debuggable state for troubleshooting.

#### Scenario: Cache operations are logged
- **WHEN** service worker caches or retrieves data
- **THEN** debug logs SHALL be available in browser DevTools console (when appropriate)

#### Scenario: Service worker status visible
- **WHEN** developer inspects the application
- **THEN** DevTools Application tab SHALL show service worker registration, caches, and version info
