## Why

Currently, the picture displayed in grafik.html is static and hardcoded into the application, making it difficult to update without modifying the source code. This change enables dynamic picture management through the admin panel, allowing authorized users to upload and change the picture without technical intervention.

## What Changes

- Admin panel includes a dedicated Grafik tab with a picture upload interface
- Users can select and upload picture files through the admin page
- The uploaded picture is committed directly to the GitHub repository as `grafik.png`
- grafik.html loads `grafik.png` directly from the repository — no localStorage or client-side storage
- The system supports dynamic picture updates with full persistence via GitHub

## Capabilities

### New Capabilities
- `admin-picture-upload`: Admin interface and GitHub API integration to upload and commit picture files as `grafik.png`
- `grafik-picture-display`: Capability for grafik.html to load and display `grafik.png` served directly from the repository

### Modified Capabilities
<!-- None - this is a purely additive feature -->

## Impact

- **admin.html / admin.js**: New Grafik upload tab UI and GitHub API commit logic
- **grafik.html**: Simplified to a plain `<img src="grafik.png">` — no scripts
- **script.js**: No changes required (PictureUtils removed; no localStorage involvement)
- **Storage**: Pictures committed to GitHub repository as `grafik.png` via the GitHub Contents API
- **No breaking changes**: Default `grafik.png` remains as fallback; purely additive
