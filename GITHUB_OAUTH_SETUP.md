# GitHub OAuth Configuration Guide

## Setup Steps

To enable admin panel authentication, you need to create a GitHub OAuth App.

### 1. Create GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
   - URL: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: `TV Masjid Admin`
   - **Homepage URL**: `https://[your-github-username].github.io/tv-masjid` (or your custom domain)
   - **Authorization callback URL**: `https://[your-github-username].github.io/tv-masjid/admin.html`
4. Click "Create OAuth Application"
5. You'll see:
   - **Client ID** (will be embedded in admin.html)
   - **Client Secret** (keep this private - will be used server-side in future)

### 2. Configure OAuth in admin.html

Once you have the Client ID and Client Secret, update `admin.html`:

```javascript
// In admin.js, set these constants:
const GITHUB_CLIENT_ID = "YOUR_CLIENT_ID_HERE";
const GITHUB_REDIRECT_URI = "https://[your-domain]/tv-masjid/admin.html";
```

### 3. Scopes

The OAuth app requires the following scope:
- `repo` - Full access to repositories (needed to read/write `setting.json`)

### 4. Security Notes

- **Client ID**: Public (safe to embed in HTML)
- **Client Secret**: Private (should NOT be embedded in client code)
- **Token Storage**: OAuth tokens stored in sessionStorage (cleared on browser close)
- **HTTPS Only**: OAuth callbacks must use HTTPS

### 5. Testing OAuth Flow

1. Deploy `admin.html` to GitHub Pages
2. Navigate to: `https://[your-domain]/tv-masjid/admin.html`
3. Click "Login with GitHub"
4. Authorize the app (one-time)
5. Should redirect back to admin panel with authenticated session

## Variables to Replace

In the code below, replace these with your actual values:
- `YOUR_GITHUB_CLIENT_ID` - Your OAuth app Client ID
- `YOUR_GITHUB_REDIRECT_URI` - Your admin panel URL (must match OAuth app configuration)
- `YOUR_REPOSITORY` - Your GitHub repo (e.g., `username/tv-masjid`)
- `YOUR_GITHUB_USERNAME` - Your GitHub username

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid redirect URI" | Ensure redirect URI in OAuth app settings matches exactly with `admin.html` URL |
| "OAuth token not working" | Token may be expired; user must re-authenticate |
| "401 Unauthorized" on API calls | Token scope insufficient or token expired |
| CORS errors | GitHub API requests must use proper Authorization headers |
