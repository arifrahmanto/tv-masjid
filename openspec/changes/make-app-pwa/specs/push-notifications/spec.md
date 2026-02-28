## ADDED Requirements

### Requirement: Push Notification Subscription
The application SHALL allow users to opt-in to push notifications with a permission request that complies with browser notification API standards.

#### Scenario: User grants notification permission
- **WHEN** user selects "Enable Notifications" in app settings
- **THEN** app SHALL request permission via `Notification.requestPermission()` and receive approval

#### Scenario: User denies notification permission
- **WHEN** user denies notification permission request
- **THEN** app SHALL store that decision and not re-prompt on every visit (respect user choice)

#### Scenario: Subscription endpoint stored
- **WHEN** user grants notification permission
- **THEN** app SHALL subscribe via service worker push API and store the subscription endpoint

### Requirement: Prayer Time Notifications
The application SHALL send push notifications at scheduled prayer times to remind users to pray.

#### Scenario: Prayer time notification arrives
- **WHEN** prayer time occurs and user has notifications enabled
- **THEN** the app SHALL deliver a push notification with prayer name (Fajr, Zuhr, Asr, Maghrib, Isha)

#### Scenario: Notification includes time details
- **WHEN** notification is delivered
- **THEN** notification title and body SHALL include prayer name and exact time (e.g., "Zuhr Prayer - 12:30 PM")

#### Scenario: User taps notification
- **WHEN** user taps push notification
- **THEN** the app SHALL open or bring to foreground and navigate to prayer times page

### Requirement: Announcement Notifications
The application SHALL send push notifications for important announcements (kegiatan, pengumuman).

#### Scenario: Important announcement sent
- **WHEN** admin publishes announcement marked "urgent"
- **THEN** app SHALL deliver push notification to all subscribed users within 5 minutes

#### Scenario: Notification click opens announcement
- **WHEN** user clicks announcement notification
- **THEN** the app SHALL open and navigate to the announcement detail page

### Requirement: Notification Display
Notifications SHALL be displayed with appropriate titles, icons, and visual styling consistent with app branding.

#### Scenario: Notification has app icon
- **WHEN** push notification is delivered
- **THEN** notification SHALL display the app icon (from manifest) in the notification area

#### Scenario: Notification has consistent styling
- **WHEN** multiple notifications are delivered
- **THEN** all notifications SHALL use consistent color scheme, fonts, and layout

#### Scenario: Notification includes action buttons
- **WHEN** applicable (e.g., "View" or "Dismiss")
- **THEN** notifications MAY include action buttons for quick responses

### Requirement: Background Notification Handling
The application SHALL handle push notifications even when the app is closed or in background.

#### Scenario: Notification delivered while app closed
- **WHEN** device receives push notification and app is not running
- **THEN** notification SHALL still arrive and be visible in system notification center

#### Scenario: Service worker receives push event
- **WHEN** server sends push notification
- **THEN** service worker `push` event handler SHALL receive message and display notification

#### Scenario: App wakes on notification click
- **WHEN** user clicks notification from closed state
- **THEN** the app SHALL launch and respond to the click action

### Requirement: Notification Unsubscription
Users SHALL be able to disable push notifications at any time.

#### Scenario: User disables notifications in settings
- **WHEN** user toggles "Notifications" setting to OFF
- **THEN** app SHALL unsubscribe push endpoint and stop receiving notifications

#### Scenario: Disabled notifications are confirmed
- **WHEN** user disables notifications
- **THEN** app SHALL display confirmation message and cease notification delivery immediately

### Requirement: Notification Privacy
Push notification endpoints and subscriptions SHALL be handled securely and not exposed to unauthorized parties.

#### Scenario: Subscription endpoint stored securely
- **WHEN** user subscribes to notifications
- **THEN** subscription endpoint SHALL not be logged, transmitted, or stored in client-side localStorage in plain text

#### Scenario: Notification server communication uses HTTPS
- **WHEN** push notification is sent from backend
- **THEN** server SHALL use HTTPS and verify subscription validity before sending
