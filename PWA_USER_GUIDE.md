# TV Masjid PWA - User Guide

## What is a PWA?

TV Masjid is now a **Progressive Web App (PWA)**. This means:

✅ **Install on your device** - Like a native app  
✅ **Works offline** - View prayer times even without internet  
✅ **Updates automatically** - No manual updates needed  
✅ **Faster loading** - Content loads instantly from cache  
✅ **Works on all devices** - Android, iPhone, Windows, Mac

## Installation

### Android (Chrome, Firefox, Edge)

#### Method 1: Browser Install Button (Easiest)
1. Open `https://tvmasjid.banjarsari-gajah.web.id/` in Chrome, Firefox, or Edge
2. Look for **"Install"** button (appears on address bar or menu)
3. Tap **"Install"**
4. Confirm installation
5. App opens on home screen with icon

#### Method 2: Add to Home Screen
1. Open app in browser
2. Tap menu (⋮) → **"Add to Home Screen"**
3. Confirm with **"Install"** or **"Add"**
4. App added to home screen

#### Method 3: Share Menu
1. Open app in browser
2. Tap Share button
3. Select **"Install app"** or **"Add to Home Screen"**

### iPhone/iPad (Safari)

Since iOS doesn't fully support PWA installation, you can add the app to home screen as a web app:

1. Open `https://tvmasjid.banjarsari-gajah.web.id/` in Safari
2. Tap Share button (↗️)
3. Scroll down and tap **"Add to Home Screen"**
4. Confirm with **"Add"**
5. App opens from home screen in full screen

**Note:** iOS version is a web app, not a full PWA. Some features like offline caching work, but installation experience is different from Android.

### Windows/Mac (Desktop)

#### Chrome/Edge
1. Open app in Chrome or Edge
2. Look for **"Install"** button (address bar or menu)
3. Click **"Install"**
4. Shortcuts created on desktop/taskbar

#### Firefox
1. Right-click app URL → **"Create Shortcut"**
2. Shortcut opens app in standalone window

## Using TV Masjid

### Online Mode (Normal)

- All features work normally
- Content loads from internet
- Latest data always available
- Prayer times updated in real-time

### Offline Mode 📡

When internet is **unavailable**, a red banner appears:

**"📡 You are offline. Some features may be limited."**

Offline capabilities:
- ✅ View prayer times (if previously loaded)
- ✅ View announcements
- ✅ View schedule  
- ✅ View graphics/slides
- ❌ Cannot make settings changes
- ❌ Cannot upload transactions
- ❌ New data not available

**Changes while offline:**
If you try to save settings or upload transactions while offline:
1. Changes are **queued** in app memory
2. A **yellow banner** appears: **"🔄 Syncing X changes..."**
3. When connection restored, changes **sync automatically**
4. If sync fails, changes remain queued until next online time

### Last Updated

When viewing offline content, you'll see:

**"Last updated: 2 hours ago"**

This shows how recently the content was cached.

## FAQ

### Q: How do I update to the latest version?

**A:** Updates happen automatically! When a new version is available:
1. You'll see a blue banner: **"A new version of TV Masjid is available!"**
2. Click **"Reload"** to get the latest version
3. Or just visit the app again next time

### Q: What if I don't want the app on my home screen?

**A:** You can uninstall it like any other app:
- **Android:** Long-press app → "Uninstall" or take to trash bin
- **iPhone:** Long-press app → "Remove App" → "Remove from Home Screen"
- **Desktop:** Right-click shortcut → "Delete"

### Q: Does offline mode work if I never used the app before?

**A:** Only for content you've already viewed. On first visit:
1. App downloads and caches pages
2. After visiting a page, it's available offline
3. With repeated use, more content gets cached

### Q: Can I clear my cached data?

**A:** Yes! Both:
- **User:** Set app to forget old data (auto-clears after 7 days)
- **Admin:** Clear caches via Admin Panel → Advanced tab

### Q: What happens to my offline changes if I clear cache?

**A:** Pending offline changes are stored separately:
- Clearing cache **doesn't** remove queued changes
- Changes still sync when connection restored
- You can view pending changes in Admin Panel

### Q: How much data does the app use?

**A:** Offline cache is typically **5-30 MB**, depending on:
- Number of cached pages
- Size of graphics/images
- Length of announcements

App auto-manages storage - never exceeds device limits.

### Q: Why does the app ask for permission?

**A:** The app asks permission to:
- **Send notifications:** For upcoming prayer times
- **Access files:** For transaction uploads
- **Use camera:** For picture features

Always optional - app works fine without these.

## Device Compatibility

| Device | Support | Notes |
|--------|---------|-------|
| Android 5+ | ✅ Full | Recommended: 7+ for best experience |
| iPhone/iPad | ✅ Partial | Web app only (no PWA installation) |
| Windows 10/11 | ✅ Full | Works on Desktop, Tablet, Phone |
| Mac | ✅ Full | Safari, Chrome, Firefox supported |
| Older browsers | ⚠️ Limited | Works offline, no installation |

## Browser Recommendations

### Best Experience
- ✅ Chrome 90+ (Android/Windows)
- ✅ Firefox 88+ (Android/Windows)
- ✅ Edge 90+ (Windows)
- ✅ Safari 15+ (iPhone/Mac)

### Still Works
- ⚠️ Chrome 70+
- ⚠️ Firefox 68+
- ⚠️ Samsung Internet

### Limited/No Support
- ❌ Internet Explorer (not supported)
- ❌ Very old Android phones (<5.0)

## Data & Privacy

### What TV Masjid Stores

**On your device:**
- Cached pages and images (for offline use)
- Pending changes (settings, transactions)
- Last updated timestamps
- Your login credentials (if admin)

**On our servers:**
- Prayer time data
- Announcements
- Settings (as you change them)
- Admin transactions (as you upload)

**NOT stored:**
- Personal data
- Browsing history
- Passwords
- Usage analytics

### How to Clear All Data

1. **On Device:** Go to device Settings → Apps → TV Masjid → Storage → Clear Cache/Data
2. **In App:** Admin Panel → Advanced → "Clear Offline Cache"
3. **Reset:** Uninstall app and reinstall fresh

## Tips for Best Performance

1. **Keep cache fresh** - Visit app regularly to update cache
2. **Use WiFi** - First time loads faster on WiFi
3. **Offline practice** - Try offline mode occasionally to verify it works
4. **Report issues** - Tell admin if offline mode has problems
5. **Update app** - Accept update notifications when they appear

## Troubleshooting

### Problem: App not installing

**Solution:**
- Make sure using HTTPS connection (not HTTP)
- Try a different browser (Chrome recommended)
- Clear browser cache and try again

### Problem: Offline mode not working

**Solution:**
- Visit a page while online first
- Wait a few seconds after loading
- Disable internet and try again
- Check DevTools (F12) → Application → Cache Storage

### Problem: Changes not syncing when back online

**Solution:**
- Be patient - can take 10-30 seconds
- Check blue banner appears
- If nothing happens after 1 minute:
  - Reload app
  - Check internet connection
  - Contact admin if problem persists

### Problem: App running slow

**Solution:**
- Clear cache: Admin Panel → "Clear Offline Cache"
- Uninstall and reinstall app
- Check device storage isn't full
- Close other apps using memory

### Problem: Can't install on iPhone

**Solution:**
- Make sure using Safari
- Try newer iOS version (14.0+)
- Use "Add to Home Screen" as web app instead

## Contact & Support

**Issues or questions?**

Contact your mosque administrator or check:
- Admin Panel → Help section
- Your device's browser settings
- Official browser documentation

---

**Version:** 1.0  
**Last Updated:** 2026-02-28  
**Platform Support:** Android 5+, iPhone 12+, Windows 10+, Mac OS
