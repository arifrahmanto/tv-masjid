## Context

The existing application displays a static picture in grafik.html that is hardcoded as an image source. Admin users need the ability to upload pictures through an admin interface, and these uploaded pictures should automatically appear in grafik.html. The system validates file types, provides user feedback, and persists the picture by committing it directly to the GitHub repository as `grafik.png`.

## Goals / Non-Goals

**Goals:**
- Enable admin users to upload picture files through a dedicated Grafik tab in admin.html
- Validate uploaded files to ensure they are valid image formats (.jpg, .png, .gif, .webp, max 2MB)
- Commit the uploaded picture to the GitHub repository as `grafik.png` via the GitHub Contents API
- Display the uploaded picture in grafik.html by loading `grafik.png` directly
- Provide clear success/error feedback to users during upload

**Non-Goals:**
- Picture editing or cropping functionality
- Image optimization or resizing
- Client-side storage (localStorage/IndexedDB) for picture data
- User-specific picture galleries or history tracking
- Multiple pictures or rotation functionality

## Decisions

### Decision 1: Storage Mechanism - GitHub Repository Commit via API
**Choice**: Upload the picture as Base64 content and commit it to the GitHub repository as `grafik.png` using the GitHub Contents API (`PUT /repos/{owner}/{repo}/contents/grafik.png`)

**Rationale**:
- Fully persistent  picture survives browser cache clears, device changes, and redeployments
- Consistent with how other app data (settings, transactions) is stored in the repo
- grafik.html can load `grafik.png` directly as a static asset  no JavaScript required
- Leverages the existing `GitHubAPI` module already used throughout admin.js

**Alternatives Considered**:
- localStorage + Base64: Browser-only, lost on cache clear, not visible on other devices
- File API + IndexedDB: More complex, still client-only
- Third-party image hosting: Requires external dependency

### Decision 2: File Validation - Client-Side MIME Type and Extension Check
**Choice**: Validate files on the client side before upload using MIME type and file extension

**Rationale**:
- Immediate user feedback without API round-trip
- Prevents invalid files from being committed to the repository
- Acceptable for admin-only context where malicious uploads are less likely

**Alternatives Considered**:
- No validation: Risk of committing invalid/corrupted files
- Server-side validation only: Requires backend infrastructure

### Decision 3: Picture Display - Direct Static Asset Load
**Choice**: grafik.html contains only `<img src="grafik.png">`  no JavaScript, no localStorage

**Rationale**:
- Simplest possible implementation; zero JS required in grafik.html
- Picture is always served as the latest committed file from GitHub
- No cross-tab sync complexity; any page load shows the current picture
- Reduces attack surface and maintenance burden

**Alternatives Considered**:
- localStorage-based display with storage events: More complex; picture lost on cache clear
- Polling GitHub API: Unnecessary  static asset loading is sufficient

### Decision 4: Implementation Architecture - PictureUploadHandler in admin.js
**Choice**: Implement `PictureUtils` (validateImageFile, convertToBase64) and `PictureUploadHandler` directly in admin.js; no shared utilities in script.js

**Rationale**:
- admin.html only loads admin.js, not script.js  no sharing needed
- grafik.html requires no JS at all  nothing to share
- Keeps picture upload logic self-contained in the admin module

**Alternatives Considered**:
- Shared utilities in script.js: Unnecessary coupling; script.js is not loaded in admin context

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **GitHub API rate limits**  Too many uploads could be throttled | One picture at a time; admin use only  rate limits not a practical concern |
| **Base64 encoding increases file size by ~33%**  Larger API payload | Accept overhead; 2MB max validation keeps payloads manageable |
| **SHA fetch required before update**  Extra API call per upload | Fetch existing file SHA first; handle 404 (new file) gracefully |
| **Poor image optimization**  Large uncompressed images  Slow loading | User responsibility to optimize before upload; could add compression later |

## Migration Plan

1. **Code Implementation**:
   - Add `PictureUtils` (validateImageFile, convertToBase64) to admin.js
   - Add Grafik upload tab UI to admin.html
   - Add `PictureUploadHandler` to admin.js with GitHub API commit logic
   - Simplify grafik.html to `<img src="grafik.png">`  remove all scripts

2. **Deployment**:
   - Deploy changes to admin.html, admin.js, and grafik.html
   - Default `grafik.png` in repo remains as fallback if no upload has occurred
   - No infrastructure changes required  uses existing GitHub OAuth token flow

3. **Rollback**:
   - Remove upload tab from admin.html
   - Remove PictureUtils and PictureUploadHandler from admin.js
   - Restore grafik.html to static hardcoded image reference

## Open Questions

- Should admin have ability to delete/reset grafik.png to a default placeholder?
- Should upload history (previous grafik.png versions) be surfaced via commit history link?
