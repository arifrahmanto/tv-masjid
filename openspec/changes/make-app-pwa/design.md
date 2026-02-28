## Context

The TV Masjid app is currently a traditional web application served over HTTPS with no offline capability or installability. It loads dynamic content (prayer times, transaction data, announcements) from a GitHub repository via API, and displays them in a responsive single-page application. Users access the app through a browser URL and cannot install it or use it offline. The app already uses a modern tech stack (HTML5, CSS3, vanilla JavaScript) with localStorage for some client-side state. Constraints include: HTTPS requirement for Service Worker, need to maintain backward compatibility with older browsers, limited storage quota per domain (~50MB on most browsers), and the complexity of managing cache invalidation for dynamic content.

## Goals / Non-Goals

**Goals:**
- Enable installation on Android, iOS, and desktop (Windows, macOS, Linux) via "Add to Home Screen"
- Provide offline-first experience for viewing cached content (prayer times, grafik, khotib)
- Support push notifications for prayer time reminders and important announcements
- Reduce load times and bandwidth usage through aggressive caching of static assets
- Maintain automatic cache updates so users see fresh data when online
- Improve app discoverability through PWA installation prompts

**Non-Goals:**
- Full offline functionality for dynamic data modification (uploads, settings changes must be online)
- Native platform-specific features (camera, contacts, etc.) beyond what the browser provides
- Automatic background sync of all data - only prayer time notifications via push
- Supporting browser environments without Service Worker support (graceful degradation only)
- Replacing existing web analytics with native app analytics

## Decisions

### Decision 1: Service Worker Caching Strategy - Multi-Layer Approach
**Choice**: Implement three cache layers: (1) network-first for dynamic content (settings, transactions), (2) cache-first for static assets (CSS, JS, icons), (3) stale-while-revalidate for HTML pages.

**Rationale**:
- Clean separation of concerns for different content types
- Stale-while-revalidate balances freshness with offline access for pages
- Network-first for dynamic content prevents serving outdated prayer times or settings
- Cache-first for static ensures instant load times on repeat visits

**Alternatives Considered**:
- Single cache-first strategy: Would require manual cache busting on every deployment
- Pure network-only: Would break offline functionality entirely
- All stale-while-revalidate: Could serve significantly outdated transaction data

### Decision 2: Web App Manifest Configuration - Standalone Display Mode
**Choice**: Set `display: "standalone"` in manifest.json to hide browser UI and create true app-like experience; use `start_url: "/"` for entry point.

**Rationale**:
- Standalone mode provides full-screen immersive experience, similar to native apps
- Alternative modes (fullscreen, minimal-ui) are less widely supported
- Users expect "Add to Home Screen" to feel like a real app, not a browser tab
- Fallback to browser display for unsupported browsers is automatic

**Alternatives Considered**:
- `display: "minimal-ui"`: Shows less browser UI but still appears web-like
- `display: "browser"`: Defeats purpose of PWA installation

### Decision 3: Push Notification Implementation - Web Push API with Server Backend
**Choice**: Use Web Push API with a separate backend service (or Firebase Cloud Messaging) to send notifications from the server to subscribed clients.

**Rationale**:
- Web Push API is the standard for PWA push; works on Android and desktop
- iOS PWA support for push is limited to notifications when app is open
- Server-side push allows sending prayer time reminders without user action
- Can reuse existing notification infrastructure or add FCM

**Alternatives Considered**:
- Local notifications only: Would require app to be open to show reminders
- WebSocket polling: Drains battery and not designed for this use case

### Decision 4: Service Worker File Location - `/sw.js` at Root
**Choice**: Place service worker at `http://domain/sw.js` root level to allow scope access to entire app.

**Rationale**:
- Root-level service worker controls all resources under `/`
- Service worker scope is determined by its registration path
- Easier discovery and follows common convention
- Simpler deployment than nested directory structures

**Alternatives Considered**:
- Nested path like `/assets/sw.js`: Would limit scope to `/assets/**` only
- Multiple service workers: Increased complexity without clear benefit

### Decision 5: Offline Content Scope - View-Only Access
**Choice**: Cache and allow offline viewing of prayer times, grafik images, khotib, announcements, and pengumuman; require online for transactions, settings modifications, and admin functions.

**Rationale**:
- Matches user expectations (why use app offline? To check prayer times or view announcements)
- Avoids data consistency issues from offline edits
- Admin panel naturally requires online due to GitHub API dependency
- Simple mental model: "read offline, write online"

**Alternatives Considered**:
- Full offline support with sync queue: Complex state management, potential conflicts
- No offline access: Would not justify the PWA effort

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **Service Worker caching stale data** → Users see outdated prayer times or settings | Use network-first strategy for dynamic content; implement cache versioning; provide manual refresh button |
| **Storage quota exceeded** → Large images or excessive cache fills 50MB limit | Limit cached assets to essential files (~15MB), cache busting strategy, storage cleanup logic |
| **Inconsistent cache updates across tabs** → Different tabs show different cached versions | Use cache versioning (e.g., `v1`, `v2`) and post-message to notify tabs of updates |
| **iOS PWA push limitations** → Notifications only work when app is open on iOS | Document limitation in release notes; provide in-app fallback for critical alerts |
| **Deployment blocker: HTTP vs HTTPS** → Service Worker requires HTTPS; development needs workaround | Use localhost or mkcert for local HTTPS testing |
| **Complex cache invalidation** → New deployment doesn't clear old caches automatically | Implement cache versioning strategy; provide clear upgrade path for users |

## Migration Plan

### Phase 1: Foundation (Weeks 1-2)
1. Create `manifest.json` with app metadata, icons (192x192, 512x512 PNG)
2. Create `service-worker.js` with initial offline-first cache setup
3. Register service worker in `script.js` with error handling
4. Add manifest link and PWA meta tags to `index.html`
5. Test on Chrome DevTools (PWA audit)

### Phase 2: Enhanced Caching (Weeks 3-4)
1. Implement multi-layer caching strategy (network-first, cache-first, stale-while-revalidate)
2. Add cache versioning and cleanup logic
3. Add storage quota monitoring and alerts
4. Test offline functionality on multiple browsers
5. Add debug logging to service worker

### Phase 3: Push Notifications (Weeks 5-6)
1. Set up Web Push notification endpoint (server or FCM)
2. Implement notification permission request flow
3. Build push notification handler in service worker
4. Create admin panel UI for sending prayer time notifications
5. Test notification delivery on Android and desktop

### Phase 4: Testing & Deployment (Weeks 7-8)
1. Full PWA audit and compliance check
2. User acceptance testing on real devices
3. Monitor cache hit rates and performance metrics
4. Create rollback plan if issues arise
5. Release with PWA installation prompts

### Rollback Strategy
- Service worker can be "unregistered" by serving 404 or a no-op version
- Old caches can be cleared via version increment
- Manifest can be updated to remove PWA support if critical issues arise

## Implementation Decisions (Finalized)

1. **Push Notifications**: Not implementing in Phase 1. Feature deferred for future enhancement.
2. **Icon Design**: Will generate default icon programmatically or use existing logo. No manual icon creation required.
3. **Cache Invalidation**: Clear all caches on every production deployment using version increment (e.g., v1 → v2).
4. **Offline Sync**: Implement request queue for failed transactions and settings changes. Sync automatically when internet reconnects.
5. **PWA Analytics**: No analytics tracking for installations or usage. Rely on existing app analytics only.
6. **iOS Support**: Web app only for iOS. Do not pursue PWA installation on iOS Safari in Phase 1.
7. **Storage Cleanup**: Automatic cleanup when quota exceeds 40MB (leave 10MB buffer). Oldest caches purged first.
