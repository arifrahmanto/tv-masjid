# TV Masjid PWA Deployment Guide

## Overview

TV Masjid has been converted to a Progressive Web App (PWA) with offline support, installation capability, and an optimized caching strategy. This guide covers deployment, configuration, and maintenance.

## Prerequisites

- HTTPS enabled server (required for Service Worker functionality)
- Node.js or similar environment for local testing
- Modern browsers: Chrome 51+, Firefox 55+, Edge 79+, Safari 15.1+

## Pre-Deployment Checklist

### 1. Verify PWA Files
Ensure all PWA files are present:
- [ ] `/manifest.json` - Web app manifest with icons and metadata
- [ ] `/sw.js` - Service worker with caching strategies
- [ ] `/offline.html` - Offline fallback page
- [ ] `/icons/icon-192.png` - 192x192 PNG icon
- [ ] `/icons/icon-512.png` - 512x512 PNG icon
- [ ] `index.html` - Updated with PWA meta tags

### 2. Verify Icons
- [ ] 192x192 PNG icon at `/icons/icon-192.png`
- [ ] 512x512 PNG icon at `/icons/icon-512.png`
- [ ] Icons are square (1:1 ratio)
- [ ] Icons optimized for file size

### 3. HTTPS Configuration
- [ ] Domain has valid SSL/TLS certificate
- [ ] Service Worker requires HTTPS (except localhost for dev)
- [ ] Test HTTPS connection: `https://yourdomain.com`

### 4. Manifest Validation
- [ ] Run: `curl https://yourdomain.com/manifest.json`
- [ ] Verify valid JSON format
- [ ] Verify all required fields present (name, icons, display, etc.)

## Deployment Steps

### 1. Update Version Numbers

When deploying, **increment the cache version** to force fresh cache:

**Edit `/sw.js` - Line 4:**
```javascript
const CACHE_VERSION = 'v2';  // Changed from v1 to v2
const CACHE_STATIC = `${CACHE_VERSION}-assets`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-pages`;
const CACHE_API = `${CACHE_VERSION}-api`;
```

This will automatically:
- Invalidate all old caches when service worker activates
- Force users to download fresh assets on next visit
- Continue serving cached content during transition

### 2. Deploy Files

```bash
# Upload these files to web root
- dist/manifest.json
- dist/sw.js
- dist/offline.html
- dist/index.html (updated)
- dist/script.js (updated)
- dist/style.css
- dist/icons/icon-192.png
- dist/icons/icon-512.png
- dist/pages/* (all page files)
- dist/audio/* (audio files if applicable)
```

### 3. Verify Deployment

```bash
# Check manifest is accessible
curl https://yourdomain.com/manifest.json

# Check service worker is accessible
curl https://yourdomain.com/sw.js

# Check offline page
curl https://yourdomain.com/offline.html
```

### 4. Test in Browser

1. Open `https://yourdomain.com` in Chrome/Firefox/Edge
2. Open DevTools (F12)
3. Go to "Application" tab → "Service Workers"
4. Verify service worker shows "active and running"
5. Go to "Application" tab → "Cache Storage"
6. Verify cache directories exist: v2-assets, v2-pages, v2-api

### 5. Test Installation

**Chrome/Edge (Desktop/Android):**
1. Visit app URL
2. Click install button (address bar or menu)
3. Select "Install" when prompted
4. App should open in standalone window

**Firefox (Android):**
1. Long-press app → "Add to Home Screen"
2. Confirm installation
3. App opens in standalone window

**Safari (iOS):**
1. Open app in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Note: iOS shows as web app, not PWA (no installation)

## Server Configuration

### Apache (.htaccess)

Add to your `.htaccess` file:

```apache
<FilesMatch "\.(js|css|json|svg|png|ico)$">
  Header set Cache-Control "public, max-age=3600"
</FilesMatch>

# HTTPS redirect
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Service Worker MIME type
AddType application/javascript js json
```

### Nginx

Add to your Nginx config:

```nginx
# HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://yourdomain.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL certificates
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Service Worker caching
    location ~ ^/(sw\.js|manifest\.json|offline\.html)$ {
        add_header Cache-Control "public, max-age=3600";
        add_header Service-Worker-Allowed "/";
    }
    
    # Static assets caching
    location ~ ^/icons/ {
        add_header Cache-Control "public, max-age=86400";
    }
}
```

### GitHub Pages

If hosting on GitHub Pages:

1. Enable HTTPS option in repository settings
2. Service Worker will work automatically
3. Cache headers are set by GitHub

## Monitoring

### Check Service Worker Status

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Application → Service Workers
3. Verify:
   - Status: "active and running"
   - Scope: "/"
   - No errors in console

### Monitor Cache Size

**Chrome DevTools:**
1. Application → Cache Storage
2. Right-click cache → "Inspect" to see size
3. Check quota: DevTools → Application → Storage

### Check Network Requests

**Chrome DevTools:**
1. Network tab → Disable cache
2. Refresh page
3. Verify requests use cache (gray icon = cached)
4. Verify requests use network (blue icon = network)

## Maintenance

### Cache Invalidation

Current strategy: **Version-based (v1, v2, v3, etc.)**

When deploying minor updates:
```javascript
const CACHE_VERSION = 'v3';  // Increment for deploy
```

Service worker automatically:
- Deletes old cache (v2, v1)
- Creates new cache with new version
- Serves fresh content on reload

### Storage Quota Management

Service worker automatically:
- Monitors storage usage (via `navigator.storage.estimate()`)
- Deletes caches >7 days old
- Maintains 40MB soft limit
- Deletes oldest entries if quota exceeded

**Manual management** via Admin Panel:
1. Go to Admin → Advanced tab
2. Click "Clear Offline Cache" to manually clear all caches
3. Click "Clear Offline Queue" to clear pending offline changes

### Offline Request Queue

Stored in browser localStorage:
- Key: `pwa_request_queue`
- Auto-synced when connection restored
- Max requests: limited by localStorage (typically 5-10MB available)

Admin can:
1. View pending changes: Admin → Advanced → "View Queue Status"
2. Clear queue: Admin → Advanced → "Clear Offline Queue"

## Rollback Plan

If issues occur after deployment:

### Option 1: Cache Invalidation (Recommended)
1. Revert the problematic code
2. Increment version number again (v3 → v4)
3. Deploy
4. Service worker clears old cache automatically

### Option 2: Disable Service Worker
1. Rename `/sw.js` to `/sw.js.disabled`
2. Clear all caches via admin panel
3. Browsers will stop using service worker
4. App operates normally without PWA features
5. Restore `/sw.js` when ready

## Testing Procedures

### 1. Installation Test

**Manual:**
1. Visit app URL
2. Test install prompt on Chrome, Firefox, Edge
3. Test Add to Home Screen on Android
4. Verify app opens in standalone mode

**Automated:**
- Run Lighthouse audit (DevTools)
- Check manifest validity
- Verify icons present

### 2. Offline Test

**Manual:**
1. Open app
2. Disconnect network (DevTools → Network → Offline)
3. Reload page - should show cached content
4. Navigate to different pages
5. Try changing settings (should queue request)
6. Reconnect network
7. Verify queued requests sync automatically

### 3. Update Test

**Manual:**
1. Increment version number
2. Deploy new version
3. Open app in two browser tabs
4. In one tab, go to DevTools → Application → Service Workers
5. New version shows "waiting to activate"
6. Refresh other tab
7. Verify new version activates and cache updates

### 4. Performance Test

**Chrome Lighthouse:**
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "PWA" category
4. Click "Generate report"
5. Fix any critical issues
6. Target: 90+ score

## Troubleshooting

### Service Worker Not Installing

**Symptoms:** DevTools shows no service worker registered

**Fixes:**
- Verify HTTPS enabled
- Check browser console for errors
- Check `/sw.js` is accessible
- Add error logging in console

### Cache Not Updating

**Symptoms:** Changes don't appear after deployment

**Fixes:**
- Increment version number (CACHE_VERSION)
- Check DevTools → Application → Cache Storage
- Clear cache manually via Admin Panel
- Test in incognito/private mode

### Offline Mode Issues

**Symptoms:** App not working offline

**Fixes:**
- Check offline.html exists and is accessible
- Verify essential pages are in STATIC_ASSETS
- Check browser allows service workers
- Test `navigator.onLine` in console

## Performance Targets

After PWA conversion:

- **Lighthouse PWA Score:** 90+
- **First Contentful Paint (FCP):** < 3 seconds
- **Largest Contentful Paint (LCP):** < 4 seconds
- **Cache Hit Rate:** > 80% for repeat visitors
- **Offline Load Time:** < 500ms (cached)

## Support & Documentation

- Service Worker: `/sw.js` - See inline comments
- Manifest: `/manifest.json` - Standard PWA manifest
- Offline Queue: `script.js` - OfflineRequestQueue class
- Admin Controls: `admin.html` - Advanced tab

## Timeline

Recommended deployment timeline:

1. **Day 1:** Deploy to staging environment
2. **Day 1-2:** Run full test suite
3. **Day 2:** Deploy to production during low-traffic period
4. **Day 2-7:** Monitor error logs and usage patterns
5. **Day 7+:** Ongoing maintenance and updates

---

**Last Updated:** 2026-02-28
**PWA Version:** v1 (Canary Release)
