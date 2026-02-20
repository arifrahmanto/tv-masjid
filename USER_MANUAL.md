# TV Masjid Admin Panel - User Manual

**Version:** 1.0  
**Last Updated:** February 20, 2026  
**Audience:** Non-technical admin staff

---

## Quick Start (5 Minutes)

### Step 1: Open the Admin Panel
- **URL:** Ask your IT contact for the exact URL (e.g., `https://domain/tv-masjid/admin.html`)
- **Browser:** Use Chrome, Firefox, Safari, or Edge
- **Device:** Desktop computer or tablet (works best on larger screens)

### Step 2: Log In
- **Paste Token:** When asked for a "GitHub Token", paste the token provided by your IT contact
- **Click Login:** Click the "Login with GitHub" button
- **Wait:** Should take 1-2 seconds

### Step 3: You're Logged In!
- **Welcome message** shows your name
- **6 tabs** are visible: Marquee, Financial, Site, Prayer, Audio, Advanced
- **Success!** You're ready to make changes

---

## Making Changes: A Simple Guide

### The Basic Workflow

```
1. Open tab (e.g., "Marquee")
       ↓
2. Make changes (add, edit, delete entries)
       ↓
3. Write a brief commit message (optional)
       ↓
4. Click "Save to GitHub"
       ↓
5. ✅ See success message = Change saved!
```

### Understanding the Tabs

Each tab manages different parts of the TV display:

| Tab | Handles | Purpose |
|-----|---------|---------|
| 📋 **Marquee** | Transaction list | Scrolling text on TV screen |
| 💰 **Financial** | Money summaries | Account balances for 3 funds |
| 🏪 **Site** | Page titles & URLs | Which pages appear on TV |
| 🕌 **Prayer** | Prayer times | Azhan/call to prayer settings |
| 🔊 **Audio** | Audio broadcasts | When to play announcements |
| ⚙️ **Advanced** | Expert settings | For advanced users only |

---

## Detailed Tab Guides

### 📋 Tab 1: Marquee (Transaction List)

**What it does:** These transactions scroll across the bottom of the TV screen to show community contributions and mosque expenses.

**How to Add a Transaction:**

1. Click **"Add New Entry"** button
2. Fill in 3 fields:
   - **Date:** Enter in format `DD/MM/YYYY` (e.g., `20/02/2026`)
   - **Description:** What is this transaction about? (e.g., "Sumbangan Ibu Nur : 500.000")
   - **Amount:** The number (can be negative for expenses)
3. Click **"Save to GitHub"**
4. Transaction appears on TV marquee within minutes

**Example Entries:**
```
Date          Description                     Amount
20/02/2026    Sumbangan RT 7                  + 500.000
20/02/2026    Gaji Pekerja                    -15.000.000
21/02/2026    Material Marmer                 - 2.500.000
```

**Important Notes:**
- ✅ Date MUST be `DD/MM/YYYY` (numbers separated by forward slashes)
- ✅ Amount appears with dots: `500.000` not `500000`
- ⚠️ Oldest transactions show FIRST (top of table), newest LAST (bottom)
- ⚠️ TV shows them with newest FIRST (scrolling effect)

**How to Edit:**
1. Click on the cell you want to change
2. Edit the text
3. Click elsewhere or press Tab to confirm change
4. Click **"Save to GitHub"**

**How to Delete:**
1. Find the transaction row
2. Click the **"Delete"** button on the right
3. Confirm the deletion
4. Click **"Save to GitHub"**

---

### 💰 Tab 2: Financial (Summaries)

**What it does:** Shows three fund accounts (Pembangunan, Takmir, Sawah) with income, expenses, and current balance. These get displayed on the Keuangan page on the TV.

**Understanding the Three Funds:**

| Fund | Purpose | Shown On |
|------|---------|----------|
| **Pembangunan** | Building/renovation fund | Keuangan page - Left side |
| **Takmir** | Operations & maintenance | Keuangan page - Right side |
| **Sawah** | Rice field income | Keuangan page - Bottom right |

**How to Update:**

1. Find the fund you want to update (click to expand if collapsed)
2. Update fields:
   - **Month/Year:** e.g., "Desember 2025"
   - **Previous Balance:** Balance at start of month
   - **Income:** Money received this month
   - **Expenses:** Money spent this month
   - **Current Balance:** ← Auto-calculated (don't edit!)
3. Click **"Save to GitHub"**

**Current Balance Formula (Automatic):**
```
Current Balance = Previous Balance + Income - Expenses
```
You don't need to calculate this - the system does it automatically!

**Example:**
```
Pembangunan Fund - Desember 2025
Previous Balance:    97.771.922
Income:            +123.676.000
Expenses:          -104.262.500
                   ___________
Current Balance =  117.185.422  ← Auto-calculated
```

**Important Notes:**
- ✅ All numbers auto-format with dots (thousands separator)
- ✅ Current Balance updates automatically when you change Income/Expenses
- ⚠️ If balance looks wrong, check Previous Balance + Income - Expenses = Current Balance

---

### 🏪 Tab 3: Site (Pages & Titles)

**What it does:** Controls the page title shown on TV and which pages appear in the menu.

**Change Page Title:**

1. Find the **"Page Title"** field
2. Delete current text
3. Type new title (e.g., "MASJID AT-TAQWA BANJARSARI")
4. Click **"Save to GitHub"**

**Manage Content Pages:**

1. Look for **"Content URLs"** list
2. Each line is a page that appears on the TV menu
3. To **add** a page:
   - Click **"Add URL"** button
   - Enter filename (e.g., `pages/welcome.html`)
   - It will appear in TV menu
4. To **remove** a page:
   - Find the page you want to remove
   - Click the **"Remove"** button next to it

**Example Pages:**
```
welcome.html       → Welcome message
keuangan.html      → Financial page
grafik.html        → Graphics/charts
khotib.html        → Speaker information
takmir.html        → Management info
```

---

### 🕌 Tab 4: Prayer (Prayer Times & Audio)

**What it does:** Manages prayer times, adhan alerts, and audio settings for the TV.

**Update Prayer Settings:**

1. **City:** Change to your city (e.g., "Demak")
   - Used to fetch prayer times from Islamic API
2. **Prayer Tune:** 9 numbers separated by commas
   - Leave as-is unless you need adjustments: `2,2,3,4,3,3,3,3,3`
3. **Audio Files:**
   - Tarhim file (signal before adhan)
   - Beep file (alert sound)
   - Countdown file (countdown display)

**Important Notes:**
- ✅ City name determines prayer times via internet API
- ⚠️ Don't change the prayer tune unless advised
- ⚠️ Audio files must exist in the `audio/` folder

---

### 🔊 Tab 5: Audio (Broadcast Schedule)

**What it does:** Plans when audio broadcasts play on the TV (e.g., Quran recitation every Friday).

**Add Audio Broadcast:**

1. Click **"Add Schedule"** button
2. Fill in:
   - **Day:** Select day of week (0=Sunday, 5=Friday, etc.)
   - **Prayer:** Which prayer time (Dzuhur, Maghrib, etc.)
   - **File:** Audio file to play
   - **Offset:** Minutes before/after prayer time
3. Click **"Save to GitHub"**

**Example:**
```
📻 Every Friday, 38 minutes before Dzuhur → Play Jumuah announcement
📻 Every Thursday, 49 minutes before Maghrib → Play Islamic program
```

**Understanding Offset:**
- `0` = Start at prayer time
- `+5` = Start 5 minutes after prayer time
- `-30` = Start 30 minutes before prayer time

---

### ⚙️ Tab 6: Advanced (For Experts Only)

**What it does:** Shows raw settings as JSON code for advanced users.

**For Most Users:** You don't need this tab!

**For Advanced Users:**
1. Click the **"Raw JSON"** section
2. See all settings as structured data
3. Click **"Copy to Clipboard"** to copy for backup/sharing
4. (Optional) Edit JSON directly and save

---

## Understanding Status Messages

### ✅ After You Save

| Message | Means | What to do |
|---------|-------|-----------|
| `✓ Saved! Commit: abc123` | ✅ Success! | Changes are on GitHub, TV will update |
| `⏳ Loading settings...` | Processing | Wait for action to complete |
| `❌ Authentication expired` | Token expired | Ask IT for new token, log in again |
| `❌ Please fix validation errors` | Invalid data | Check error highlighting (red fields) |
| `❌ Network error` | Internet problem | Check connection, try again |

### Red Field Highlighting

If a field turns **red border**, it means:
- **Date field:** Date is not in DD/MM/YYYY format
- **Amount field:** Amount contains non-numeric characters
- **URL field:** URL format is invalid

**How to fix:** Read the error message below the field and correct the data

---

## Common Questions (FAQ)

### Q: What happens when I save?
**A:** Your changes get saved to GitHub and committed with a timestamp. The TV refreshes and displays new data within 1-5 minutes depending on your setup.

### Q: Can I undo a change?
**A:** Yes! Check the "History" section in the Advanced tab to see all commits. Each commit is a snapshot you could restore.

### Q: Does my token expire?
**A:** Yes, after 1 hour of inactivity. You'll get a message to log in again. This is normal and secure.

### Q: What if I make a mistake?
**A:** No problem! Just fix it and save again. Each change creates a new commit, so nothing is lost.

### Q: How quickly do changes show on TV?
**A:** Usually within 1-5 minutes:
- Admin panel saves → GitHub updates → Pages rebuild (~1 min) → TV refreshes

### Q: Can someone else edit while I'm editing?
**A:** Yes, but you'll get a "Conflict" message if they save before you do. Just refresh and try again.

### Q: What if I see "Rate limited"?
**A:** You've made too many changes too quickly. Wait 5 minutes and try again.

### Q: Where is my authentication token kept?
**A:** In your browser's memory (session storage). It's deleted when you:
- Click "Logout"
- Close your browser
- After 1 hour of inactivity
- When you log in on another device

---

## Troubleshooting: Problems & Solutions

### Problem: "I see the login screen but can't log in"

**Check:**
1. Is the token pasted correctly? (Should be 50+ characters)
2. Did you copy the entire token from GitHub?
3. Is your internet connection working?

**Solution:**
- Ask IT for a new token
- Try again in a different browser
- Check that you're on the correct URL

---

### Problem: "My transaction date shows wrong order"

**Check:**
- Date must be in format `DD/MM/YYYY`

**Examples that WORK:**
- `01/01/2026` ✅
- `20/02/2026` ✅
- `31/12/2025` ✅

**Examples that DON'T WORK:**
- `1/1/2026` ❌ (missing leading zero)
- `2026-01-01` ❌ (wrong format)
- `January 1, 2026` ❌ (wrong format)

**Solution:**
- Always use `DD/MM/YYYY` with leading zeros
- Dates sort automatically

---

### Problem: "Financial balance is wrong"

**Check:**
- Formula: Current = Previous + Income - Expenses
- Are all fields numbers?

**Examples that WORK:**
- Previous: `97771922`
- Income: `123676000`
- Expenses: `104262500`
- Current calculates to: `117185422` ✅

**Examples that DON'T WORK:**
- Typing: `97.771.922` ❌ (dots are only for display)
- Text: `one hundred thousand` ❌ (only numbers work)

**Solution:**
- Clear the field and type just numbers (no dots, no commas)
- System auto-formats with dots after you save

---

### Problem: "I updated data but TV isn't showing changes"

**Check:**
1. Did you see the "✓ Saved!" message?
2. Check the TV page - is it the right page?
3. How long ago did you save? (Allow 1-5 minutes)

**Solution:**
1. Confirm save was successful (green message)
2. Manually refresh the TV page (check remote)
3. Check TV isn't on different page
4. Wait a few more minutes for GitHub rebuild

---

### Problem: "Field is highlighted in red"

**This means:** That field has invalid data

**Solution:**
- Read the error message below the field
- Follow the format requirements shown
- Example: If red date field, use DD/MM/YYYY format
- After fixing, the red highlighting goes away

---

### Problem: "I'm locked out or can't authenticate"

**Solutions:**
1. Ask IT for a new GitHub token
2. Log out (click logout button)
3. Close the browser completely
4. Open a new browser window
5. Go to admin panel URL again
6. Paste new token and log in

---

## Best Practices

### ✅ DO:

- ✅ **Save often** - Small changes are easier to track
- ✅ **Use descriptive transaction descriptions** - "Sumbangan RT 7 Rw 1: 500.000" is clear
- ✅ **Check your changes on TV** - Verify what you saved appears correctly
- ✅ **Keep token secret** - Don't share login link with others
- ✅ **Use correct date format** - DD/MM/YYYY always
- ✅ **Monitor balance** - Check financial totals monthly

### ❌ DON'T:

- ❌ **Don't use fancy characters** - Stick to numbers and normal text
- ❌ **Don't leave amounts blank** - Fill all required fields
- ❌ **Don't edit raw JSON unless you know JSON** - Use the forms instead!
- ❌ **Don't save huge numbers of changes** - Save after each logical group
- ❌ **Don't share the admin.html link casually** - It controls all TV content

---

## Getting Help

### If Something Goes Wrong:

1. **Red error field?**
   - Read the error message
   - Check format requirements
   - Try again

2. **Can't log in?**
   - Ask IT for new token
   - Check internet connection
   - Try different browser

3. **Save failed?**
   - Check internet connection
   - Try saving again
   - Check if someone else edited the file

4. **TV not updating?**
   - Allow 1-5 minutes for TV refresh
   - Manually refresh TV page
   - Check TV is on correct page
   - Check admin panel shows green "Saved" message

### Contact IT If:

- Authentication token stops working
- Can't access `/admin.html` URL
- Repeated network/connection errors
- Need to restore old version of settings

---

## Summary

You now know how to:
- ✅ Log into admin panel
- ✅ Update transaction lists
- ✅ Manage financial data
- ✅ Change site settings
- ✅ Configure prayer times
- ✅ Schedule audio broadcasts
- ✅ Save changes to GitHub
- ✅ Fix common problems

**Happy administering!** The TV Masjid system is now in your hands, without needing Git or technical knowledge.

---

**Questions?** Ask your IT contact for help with:
- Getting started (token, URL)
- Troubleshooting access issues
- Restoring old settings
- Making bulk changes

**Version History:**
- v1.0 (Feb 2026) - Initial release with all major features
