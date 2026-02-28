# TV Masjid

TV Masjid is a progressive web application designed to display prayer times, announcements, and community information for mosques. The application is free and open-source, available for anyone to use and modify. This project was built to meet the specific needs of Masjid At-Taqwa in Banjarsari, Gajah, Demak, but can be adapted for any mosque.

## Features

### Core Prayer Time Features
- Display prayer times (Imsak, Subuh, Dzuhur, Ashar, Maghrib, Isya) based on location and calculation method
- Play Tarhim (adhan pre-announcements) before prayer times
- Display Hijri (Islamic) calendar dates
- Play Quran recitations (Qiro'/Murottal) according to schedule
- Easy configuration via `setting.json` file
- Support for custom announcement pages
- Audio file management for hymns and recitations

### Progressive Web App (PWA) Features ✨ NEW
- **Offline Support** - View prayer times even without internet connection
- **Installation** - Install app on home screen like native app (Android, iOS, Windows)
- **Auto-Update Detection** - Get notified when new version is available
- **Request Queue** - Offline changes queue automatically and sync when reconnected
- **Smart Caching** - Multi-layer caching strategy for optimal performance

## Getting Started

### Prerequisites
- Modern web browser (Chrome 51+, Firefox 55+, Edge 79+, Safari 15.1+)
- For SmartTV: Android TV with browser (Fully Kiosk Browser recommended)
- For local development: Node.js or similar environment

### Installation Options

#### Option 1: Direct Web Access
1. Visit `https://yourdomain.com/tv-masjid` in any browser
2. No installation required - works immediately

#### Option 2: PWA Installation (Recommended for SmartTV)

**Android/Windows:**
1. Visit the app URL
2. Click "Install" button (appears in address bar or menu)
3. Select "Install"
4. App launches in standalone mode

**iPhone/iPad:**
1. Open app in Safari
2. Tap Share button (↗️)
3. Select "Add to Home Screen"
4. App opens from home screen in full screen

**SmartTV (Android TV):**
1. Install Fully Kiosk Browser on SmartTV
2. Set start URL to your app deployment
3. Configure Fully Kiosk to autostart on TV power-on
4. Enable offline mode in browser settings

## Configuration

### Setting up Your Mosque

Edit `setting.json` to customize:

```json
{
  "pageTitle": "Your Mosque Name",
  "prayerApiCity": "Jakarta",
  "prayerApiTune": "3,3,3,3,3,3,3,3,3",
  "tarhimOffsetMinutes": 6,
  "contentUrls": ["welcome.html", "announcements.html"]
}
```

### Key Settings

| Setting | Description |
|---------|-------------|
| `pageTitle` | Display name of your mosque |
| `prayerApiCity` | City for prayer time calculations |
| `prayerApiTune` | Prayer time adjustment in minutes |
| `tarhimOffsetMinutes` | Minutes before Adhan to play Tarhim |
| `contentUrls` | Array of pages to display in rotation |

### Custom Pages

Add custom announcement pages:
1. Create HTML files in `/pages` directory
2. Add filenames to `contentUrls` in `setting.json`
3. Pages will cycle automatically

### Audio Management

Upload audio files to `/audio` directory:
- `tarhim.mp3` - Tarhim announcement sound
- `beep.mp3` - Timer/notification beep
- Custom recitations for queue

## Admin Panel

The Admin Panel provides controls for managing settings, announcements, and financial data.

### Accessing Admin Panel

1. Open `/admin.html` on your deployment
2. Authenticate with GitHub OAuth (first time only)
3. Once logged in, remain authenticated for 1 hour

### Admin Features

#### 📰 Marquee Tab
- Update scrolling announcements
- Edit marquee text and timing
- Immediate display updates

#### 💰 Financial Tab
- Track mosque financial transactions
- Upload transaction data (CSV import)
- View financial summaries
- Export reports

#### 🏢 Site Tab
- Edit mosque name and location
- Configure prayer time location and method
- Set color themes and branding

#### 🕌 Prayer Tab
- Adjust prayer time offsets per prayer
- Configure Tarhim timing
- Set audio playback options

#### 🔊 Audio Tab
- Upload and manage audio files
- Set audio playback volume
- Configure Qiro' playlist

#### 🖼️ Grafik Tab
- Upload promotional graphics
- Manage slideshow display timing
- Configure image rotation schedule

#### ⚙️ Advanced Tab
- **PWA Cache Management** ✨
  - Clear offline cache
  - View pending offline changes queue
  - Monitor storage usage
- View commit history
- Export settings as JSON

### Offline Change Management

When admin makes changes while offline:

1. Changes are queued automatically
2. Yellow banner shows: "🔄 Syncing X changes..."
3. Once reconnected, changes sync automatically
4. View pending changes: Advanced → "View Queue Status"
5. Clear queue if needed: Advanced → "Clear Offline Queue"

## Deployment

### Option 1: GitHub Pages (Easiest)

1. Fork this repository
2. Rename to `yourdomain.github.io` or configure custom domain
3. Edit `setting.json` with your mosque info
4. GitHub Pages automatically deploys to `https://yourdomain.com`

### Option 2: Custom Domain with GitHub Pages

1. Edit `CNAME` file: `yourdomain.com`
2. Configure DNS settings at your registrar
3. Enable HTTPS in repository settings
4. Deploy automatically from `main` branch

### Option 3: Self-Hosted Server

1. Clone repository to your server
2. Configure HTTPS (required for PWA)
3. Set up web server (Apache/Nginx)
4. See `PWA_DEPLOYMENT_GUIDE.md` for detailed server config

### Pre-Deployment Checklist

- [ ] `setting.json` configured with mosque information
- [ ] Prayer time location and method verified
- [ ] Custom pages added to `pages/` directory
- [ ] Audio files uploaded to `audio/` directory
- [ ] Icons properly placed in `icons/` directory
- [ ] HTTPS enabled (required for service worker)
- [ ] Domain points to deployment URL
- [ ] Admin panel OAuth credentials configured

### GitHub OAuth Setup (Required for Admin Panel)

The Admin Panel requires GitHub OAuth for authentication. Follow these steps after forking:

#### Step 1: Create GitHub OAuth Application

1. Go to GitHub Settings → Developer settings → OAuth Apps
   - URL: `https://github.com/settings/developers`
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: TV Masjid Admin
   - **Homepage URL**: `https://yourdomain.com`
   - **Authorization callback URL**: `https://yourdomain.com/admin.html`
4. Click "Register application"
5. You'll see:
   - **Client ID** (copy this)
   - **Client Secret** (click to reveal and copy)

#### Step 2: Configure Client ID in admin.js

1. Open `admin.js` in your editor
2. Find line ~35 (search for `GITHUB_CLIENT_ID`)
3. Replace `YOUR_CLIENT_ID_HERE` with your Client ID:
   ```javascript
   const GITHUB_CLIENT_ID = "abc123def456xyz";  // Your actual Client ID
   ```
4. Update `GITHUB_REDIRECT_URI` if using custom domain:
   ```javascript
   const GITHUB_REDIRECT_URI = "https://yourdomain.com/admin.html";
   ```
5. Update `REPO_OWNER` and `REPO_NAME`:
   ```javascript
   const REPO_OWNER = "yourgithubusername";
   const REPO_NAME = "tv-masjid";
   ```
6. Save the file

#### Step 3: Configure Server-Side Token Exchange (Important!)

For production deployment, you need server-side token exchange to keep credentials secure.

⚠️ **Note**: The Client Secret should NOT be in client-side code. For a complete production setup:

1. Create a backend service (Node.js, Python, etc.) that handles:
   - Receives authorization code from admin.html
   - Exchanges code for access token using Client Secret
   - Returns access token to admin panel
   
2. See `GITHUB_OAUTH_SETUP.md` for detailed backend implementation

#### Step 4: Test Authentication

1. Visit your deployment: `https://yourdomain.com/admin.html`
2. You should see a login screen
3. Click "Login with GitHub"
4. You'll be redirected to GitHub to authorize
5. After approval, redirects back to admin panel
6. You're now logged in!

#### Troubleshooting OAuth

| Problem | Solution |
|---------|----------|
| "Invalid Client ID" | Check Client ID is correct and matches in admin.js |
| Redirect URI mismatch | Ensure callback URL in GitHub OAuth app matches exactly |
| "Cannot read token" | Check authorization code is being passed correctly |
| CORS errors | Implement backend token exchange (see GITHUB_OAUTH_SETUP.md) |

See `GITHUB_OAUTH_SETUP.md` for complete OAuth setup guide including backend implementation.

### Version Control

The app uses cache versioning for deployments:

1. Edit `/sw.js` line 4 to increment version:
   ```javascript
   const CACHE_VERSION = 'v2';  // Changed from v1
   ```
2. Deploy changes
3. Service worker automatically clears old cache
4. Users see fresh content on next visit

See `PWA_DEPLOYMENT_GUIDE.md` for complete deployment instructions.

## Running on SmartTV

### Setup Steps

1. **Install Fully Kiosk Browser**
   - Download from Google Play Store
   - Grant all required permissions

2. **Configure Browser Settings**
   - Set start URL: `https://yourdomain.com`
   - Enable: Autostart, Keep display on, Full screen
   - Disable: Notifications, Status bar

3. **Enable Offline Mode** (optional)
   - Download app for offline: Settings → Offline → Enable
   - Refresh periodically to update cache

4. **Display Optimization**
   - Disable scrollbars and URL bar
   - Set theme to dark/black for reduced power usage
   - Adjust text size for visibility distance

### Performance Notes

- Most Android SmartTVs display in qHD (960x540) by default, even on 4K TVs
- App automatically scales to any screen resolution
- Fully Kiosk Browser optimizes for TV use cases
- Offline mode reduces bandwidth and improves reliability

## Documentation

- **[PWA Deployment Guide](PWA_DEPLOYMENT_GUIDE.md)** - Complete server setup and deployment
- **[PWA User Guide](PWA_USER_GUIDE.md)** - Installation and usage for end users
- **[User Manual](USER_MANUAL.md)** - Detailed feature documentation
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Original deployment instructions
- **[GitHub OAuth Setup](GITHUB_OAUTH_SETUP.md)** - OAuth configuration

## Browser Support

| Browser | Desktop | Android | iOS |
|---------|---------|---------|-----|
| Chrome | ✅ Full | ✅ Full | ⚠️ Limited |
| Firefox | ✅ Full | ✅ Full | ❌ No |
| Safari | ✅ Full | ❌ No | ✅ Partial |
| Edge | ✅ Full | ✅ Full | ❌ No |
| Samsung Internet | ⚠️ Limited | ✅ Full | ❌ No |

## Development

### Project Structure

```
tv-masjid/
├── index.html           # Main prayer times display
├── admin.html           # Admin panel interface
├── admin.js             # Admin panel logic
├── script.js            # Main application logic
├── style.css            # Styling
├── manifest.json        # PWA manifest
├── sw.js                # Service worker (offline support)
├── offline.html         # Offline fallback page
├── setting.json         # Configuration file
├── pages/               # Custom announcement pages
├── audio/               # Audio files (Tarhim, Qiro')
├── icons/               # App icons
└── openspec/            # Specification documents
```

### Local Development

1. Clone repository: `git clone https://github.com/arifrahmanto/tv-masjid.git`
2. Edit `setting.json` for local testing
3. Serve on HTTPS (required for service worker):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Access at https://localhost:8000 (with self-signed cert)
   ```
4. Open browser to `https://localhost:8000`

## Contributing

Contributions welcome! Please:

1. Fork repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open Pull Request

## License

This project is open-source and free to use. See LICENSE file for details.

## Support & Feedback

For issues, questions, or suggestions:
- Open GitHub Issue on the repository
- Check existing documentation for solutions
- Contact your mosque administrator for deployment help

## Roadmap

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] SMS notification integration
- [ ] Mobile app versions
- [ ] Crowd estimation visualization
- [ ] Donation management system

## Changelog

### Latest (v1.0 PWA - Feb 28, 2026)
- ✨ Progressive Web App (PWA) support with offline capabilities
- ✨ Service worker with multi-layer caching strategy
- ✨ Offline request queue with auto-sync
- ✨ Admin panel cache management
- ✨ Installation on home screen support
- 🐛 Various bug fixes and performance improvements

See full changelog in git history.

---

**Made with ❤️ for Masjid At-Taqwa Banjarsari**

Last Updated: February 28, 2026
