## Why

The TV Masjid app is currently a web application that requires continuous internet connectivity and cannot be accessed like a native app on mobile devices. Converting it to a Progressive Web App (PWA) enables users to install the app on their devices (Android, iOS, desktop), access it offline for core functionality, and receive timely push notifications for prayer times and announcements.

## What Changes

- Add a Web App Manifest (`manifest.json`) to make the app installable with proper branding, icons, and display mode
- Implement a Service Worker to enable offline support, caching strategies, and automatic sync of queued requests
- Configure caching strategies for static assets, API responses, and dynamic content with deployment-based invalidation
- Implement request queue for failed transactions/settings changes that automatically syncs when internet reconnects
- Update the application to register and activate the service worker on load
- Ensure responsive design works across all device sizes and orientations
- Add metadata tags for PWA deep linking and web standards compliance

## Capabilities

### New Capabilities
- `web-app-manifest`: Web app manifest configuration for installability, branding, and app shell definition
- `service-worker`: Service worker implementation for caching, offline support, and background tasks
- `offline-support`: Ability for the app to function offline with cached content and automatic sync of queued requests on reconnect
- `app-installation`: Enable "Add to Home Screen" functionality on mobile devices and desktop browsers
- `pwa-metadata`: Proper HTML metadata tags for PWA detection, theming, and mobile optimization

### Modified Capabilities
<!-- No existing capabilities are being fundamentally modified - this is purely additive -->

## Impact

- **index.html**: Add manifest link, meta tags for PWA detection, theme color, viewport settings
- **New files**: `manifest.json` for app configuration, `sw.js` (Service Worker), icon files (192px, 512px PNG)
- **script.js**: Add service worker registration and lifecycle management
- **settings.json**: May need PWA-specific configuration for caching behavior
- **Network/Storage**: Significant increase in cached static assets and offline data
- **No breaking changes**: Fully backward compatible; non-PWA browsers continue to function normally

## Deployment Notes

- PWA functionality requires HTTPS (except for localhost)
- Service worker caching strategies must be carefully managed to avoid stale data issues
- Users must manually "Install App" or "Add to Home Screen" - there's no forced installation
- Offline functionality is graceful - core features work offline, remote data requires connectivity
