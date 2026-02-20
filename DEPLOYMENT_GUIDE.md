# Deployment Guide - TV Masjid Admin Panel

## Overview
This guide covers deploying the Admin Panel for managing TV Masjid configuration without manual Git commits. The panel is a single-page application served from `/admin.html` on GitHub Pages.

---

## Prerequisites

1. **GitHub Account with Admin Access** to the `tv-masjid` repository
2. **GitHub Personal Access Token** (for API access via admin panel)
3. **GitHub OAuth App** (optional, for future multi-user support)
4. **Web Browser** with JavaScript support (Chrome, Firefox, Safari, Edge)
5. **Reading Time:** 15-20 minutes to complete setup

---

## Step 1: Create GitHub OAuth App (Personal Access Token Method)

### Why You Need This
The admin panel needs permission to:
- Read your current `setting.json`
- Create commits to update `setting.json`
- View commit history for audit trail

### Simple Setup (Recommended for Single Admin)

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name it: `TV Masjid Admin Panel`
4. Select scopes:
   - ✅ `repo` (full control of private repositories)
   - ✅ `public_repo` (for public repositories)
5. Click **"Generate token"** and **copy it immediately**
6. **Keep this safe!** Treat it like a password.

**Token Format:** `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (50+ characters)

### Paste into Admin Panel
1. Open `/admin.html` in your browser
2. When prompted for a "GitHub Token", paste the token from Step 5
3. Token is stored **only in your browser's session memory** (not saved to disk)
4. Session expires after 1 hour for security

---

## Step 2: Deploy Files to Repository

### Files to Add/Update

**New Files:**
- `admin.html` - The panel UI (~200 lines)
- `admin.js` - The panel logic (~1000 lines)
- `GITHUB_OAUTH_SETUP.md` - OAuth setup guide
- `TEST_VALIDATION_REPORT.md` - Test validation results
- `DEPLOYMENT_GUIDE.md` - This file

**Modified Files:**
- `setting.json` - Now includes `financialSummary` object
- `pages/keuangan.html` - Updated to read from `setting.json` dynamically

### Deployment Steps

```bash
# 1. Ensure all files are in the repository
# Add these files via Git or GitHub Web UI:

git add admin.html admin.js GITHUB_OAUTH_SETUP.md TEST_VALIDATION_REPORT.md DEPLOYMENT_GUIDE.md
git add pages/keuangan.html
git add setting.json  # with financialSummary object

# 2. Commit with descriptive message
git commit -m "Deploy admin panel for TV Masjid configuration management"

# 3. Push to main/master branch
git push origin main

# 4. GitHub Pages will auto-rebuild (typically <1 minute)
```

### Verify Deployment

1. Go to your GitHub Pages URL: `https://arifrahmanto.github.io/tv-masjid/`
2. Navigate to `/admin.html`
3. You should see the login screen

---

## Step 3: First-Time Access Checklist

### Configuration Required

Before the first use, you must configure one variable in `admin.js`:

**Find these lines in `admin.js` (lines 7-11):**

```javascript
const GITHUB_CLIENT_ID = "YOUR_CLIENT_ID_HERE";      // ← Leave as-is for now
const GITHUB_REDIRECT_URI = "https://YOUR_DOMAIN/admin.html";  // ← Change this
const REPO_OWNER = "YOUR_USERNAME";  // ← Change this
const REPO_NAME = "tv-masjid";  // ← Verify this
```

### Fill in Your Values

Replace with your actual information:

| Variable | Example | Where to Get |
|----------|---------|--------------|
| `GITHUB_REDIRECT_URI` | `https://username.github.io/tv-masjid/admin.html` | Your GitHub Pages URL |
| `REPO_OWNER` | `your-github-username` | Your GitHub username |
| `REPO_NAME` | `tv-masjid` | Your repository name |

### Final Configuration

After filling in values:
1. Save `admin.js`
2. Commit and push
3. Wait for GitHub Pages rebuild (~1 minute)

---

## Step 4: First Access

### Access the Admin Panel

1. **URL:** Visit `https://your-github-pages-url/admin.html`
2. **Login Screen:** You'll see the GitHub login prompt
3. **Enter Token:** Paste your GitHub Personal Access Token (from Step 1)
4. **Authenticate:** Click "Login with GitHub"
5. **Success:** You're logged in and can see the admin panel

### Navigation

The panel has 6 tabs:

1. **Marquee** - Transaction ledger (automatically displayed on TV)
2. **Financial** - Financial summaries for three funds
3. **Site** - Page title and content URLs
4. **Prayer** - Prayer times and audio settings
5. **Audio** - Audio schedule management
6. **Advanced** - Expert options (raw JSON viewer)

---

## Step 5: Using the Admin Panel

### Updating Marquee Transactions

1. Go to **Marquee** tab
2. Click **"Add New Entry"** button
3. Fill in:
   - **Date:** Format as DD/MM/YYYY (e.g., `20/02/2026`)
   - **Description:** What the transaction is for
   - **Amount:** Number (can be negative for expenses)
4. Click **"Save to GitHub"** at the bottom
5. Enter commit message (optional)
6. Changes saved within seconds!

### Updating Financial Data

1. Go to **Financial** tab
2. Expand any fund (Pembangunan, Takmir, or Sawah)
3. Update values:
   - Previous Balance, Income, Expenses
   - Current Balance calculates automatically
4. Click **"Save to GitHub"**
5. Financial page auto-updates on next TV refresh

### Updating Site Settings

1. Go to **Site** tab
2. Change **Page Title** as needed
3. Manage content URLs (add/remove pages)
4. Click **"Save to GitHub"**

### Managing Prayer Times

1. Go to **Prayer** tab
2. Update prayer city (e.g., "Demak")
3. Adjust prayer time offsets if needed
4. Select audio files for tarhim/beep/countdown
5. Click **"Save to GitHub"**

### Managing Audio Schedules

1. Go to **Audio** tab
2. Add/remove audio broadcasts
3. Specify day of week and prayer timing
4. Click **"Save to GitHub"**

### View Advanced Settings

1. Go to **Advanced** tab
2. See raw JSON of all settings
3. Copy to clipboard if needed
4. (Optional) Edit manual JSON and save

---

## Step 6: Verify TV Integration

### Where Changes Appear

| Change | TV Display | Update Interval |
|--------|-----------|-----------------|
| Marquee transaction | Scrolling marquee on TV | On page refresh (auto or manual) |
| Financial data | `/pages/keuangan.html` | On page load |
| Site content URLs | Menu or page selector | On page reload |
| Prayer times | Countdown & audio playback | On `script.js` reload |
| Audio files | Audio player on TV | On page refresh |

### Testing the Flow

1. **Update** a value in admin panel (e.g., add transaction)
2. **Save** to GitHub (watch for success message)
3. **Navigate** TV to the affected page
4. **Verify** the change appears

### TV Refresh Options

- **Auto-refresh:** If TV display has auto-refresh enabled, changes appear within 1-5 minutes
- **Manual refresh:** Press refresh button on TV remote or manually reload page
- **Check commit:** Visit GitHub to see commit history in admin panel's "History" tab

---

## Step 7: Troubleshooting

### Problem: "Authentication expired"
**Solution:**
- Your token has expired (after 1 hour)
- Enter a new token or log out/log back in
- Token refreshes automatically on each API call

### Problem: "Not found: /repos/..."
**Solution:**
- Check `REPO_OWNER` and `REPO_NAME` in `admin.js`
- Ensure repository name matches exactly
- Verify token has `repo` scope

### Problem: "Conflict: Resource was modified elsewhere"
**Solution:**
- Someone else edited `setting.json` between your load and save
- Click the History tab to see what changed
- Refresh the page and re-enter your changes
- Then save again

### Problem: "Rate limited: Too many requests"
**Solution:**
- You've made too many API calls to GitHub
- GitHub limits: 60 requests/hour (unauthenticated), 5000/hour (authenticated)
- Wait a few minutes and try again
- Panel makes 1-2 requests per save operation

### Problem: Transaction showing wrong date after sort
**Solution:**
- Date must be in format `DD/MM/YYYY`
- Examples that work: `01/01/2026`, `25/12/2025`
- Examples that DON'T work: `1/1/2026`, `2025-01-01`, `January 1`

### Problem: Financial balance not calculating
**Solution:**
- All fields must be numbers
- Remove any dots from thousands separator
- Example that works: `1000000` or `97771922`
- Example that DON'T work: `97.771.922` (admin panel removes dots before save)

### Problem: Changes not showing on TV
**Solution:**
1. Check that save was successful (green success message)
2. View History tab to confirm commit was created
3. TV may need manual refresh - check TV remote
4. May also be GitHub Pages rebuild delay (usually <1 minute)
5. Check browser console (F12) for JavaScript errors

### Problem: Keuangan.html showing hardcoded values
**Solution:**
- Fetch from `setting.json` may have failed
- Check browser console (F12) → Network tab
- Look for 404 error on `setting.json` fetch
- Verify `setting.json` path and format are correct
- Fallback values display if fetch fails (this is by design)

---

## Security Considerations

### Token Security

- ✅ Token stored **only in browser session memory** (sessionStorage)
- ✅ Token **expires after 1 hour** of inactivity
- ✅ Token **NOT saved to disk** or sent to external servers
- ✅ Token **cleared on logout**
- ⚠️ **Do NOT share your token** - treat it like a password
- ⚠️ **Do NOT commit token** to repository

### Best Practices

1. **Create a limited token** (not your main account password)
2. **Only grant necessary scopes** (`repo` for private repos)
3. **Rotate tokens regularly** (quarterly recommended)
4. **Revoke old tokens** after creating new ones
5. **Never share admin panel URL** with untrusted users
6. **Use HTTPS only** (GitHub Pages provides this automatically)

### Revoking Tokens

If you think a token was compromised:

1. Go to https://github.com/settings/tokens
2. Find the token for "TV Masjid Admin Panel"
3. Click **"Delete"**
4. Create a new token (following Step 1)
5. Paste new token in admin panel

---

## Setup Phases Complete ✅

| Phase | Tasks | Status |
|-------|-------|--------|
| 1. OAuth Setup | OAuth app, documentation | ✅ Complete |
| 2. Core APIs | Token management, GitHub API | ✅ Complete |
| 3. Admin Panel UI | Tab interface, forms | ✅ Complete |
| 4. Settings Loading | Load from GitHub | ✅ Complete |
| 5. Transaction Ledger | Add/edit/delete transactions | ✅ Complete |
| 6. Financial Summary | Three-fund management | ✅ Complete |
| 7. Site Settings | Title, content URLs | ✅ Complete |
| 8. Prayer Settings | City, times, audio files | ✅ Complete |
| 9. Audio Schedules | Schedule broadcasts | ✅ Complete |
| 10. Advanced Features | Raw JSON viewer | ✅ Complete |
| 11. Validation | Form validation, error handling | ✅ Complete |
| 12. Commit & GitHub | Save to GitHub, create commits | ✅ Complete |
| 13. History | View commit history | ✅ Complete |
| 14. Integration | keuangan.html reads from setting.json | ✅ Complete |
| 15. Testing | Comprehensive validation | ✅ Complete |
| 16. Deployment | Deploy files, documentation | ✅ In Progress |

---

## Post-Deployment Tasks

### Document Admin Procedures

Create a reference guide for admin staff:
1. How to log in (URL, token entry)
2. How to add new transactions
3. How to update financial data
4. When to expect TV to reflect changes
5. Who to contact for issues

### Monitor First Week

1. **Day 1:** Verify all tabs work
2. **Day 2-3:** Test with actual TV updates
3. **Day 4-7:** Monitor for any issues
4. **Ongoing:** Check History tab weekly to verify commits

### Future Enhancements (Optional)

1. **Automated TV refresh** after admin saves
2. **Multi-user support** with Google OAuth
3. **Email notifications** on financial updates
4. **Backup system** for automatic `setting.json` backups
5. **Mobile app** for quick updates

---

## Support Contacts

For issues:
- GitHub Issues: Open on the repository
- Error messages in admin panel: Check browser console (F12)
- Token issues: Review GitHub Settings > Developer Settings > Personal Access Tokens

---

## Conclusion

your TV Masjid Admin Panel is now deployed! You can update all settings without Git knowledge or command-line tools. All changes are tracked via GitHub commits for audit trail.

**Start using it:** Visit `/admin.html` on your GitHub Pages URL and log in with your GitHub token.

**Need help?** Refer to the troubleshooting section above.
