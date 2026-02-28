## Why

Currently, the picture displayed in grafik.html is static and hardcoded into the application, making it difficult to update without modifying the source code. This change enables dynamic picture management through the admin panel, allowing authorized users to upload and change the picture without technical intervention.

## What Changes

- Admin panel will include a picture upload interface
- Users can select and upload picture files from the admin page
- The uploaded picture will automatically be displayed in grafik.html
- grafik.html defaults to displaying grafik.png when no custom picture is uploaded
- The system supports dynamic picture updates while maintaining backward compatibility with the default image

## Capabilities

### New Capabilities
- `admin-picture-upload`: Admin interface and functionality to upload, manage, and store picture files
- `grafik-picture-display`: Capability for grafik.html to retrieve and display dynamically uploaded pictures

### Modified Capabilities
<!-- None - this is a purely additive feature -->

## Impact

- **admin.html / admin.js**: New upload form UI and file handling logic in the admin panel
- **grafik.html**: Modified to display uploaded picture instead of hardcoded static image
- **script.js**: Possibly updated to support picture data retrieval and display
- **Storage**: Picture file storage/management (client-side or server-side)
- **No breaking changes**: This is backward-compatible and purely additive
