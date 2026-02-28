## Context

The existing application displays a static picture in grafik.html that is hardcoded as an image source. Admin users need the ability to upload pictures through an admin interface, and these uploaded pictures should automatically appear in grafik.html. The system must validate file types, provide user feedback, and handle picture storage in a way that persists across page refreshes and is accessible from multiple page contexts.

## Goals / Non-Goals

**Goals:**
- Enable admin users to upload picture files through a dedicated UI in admin.html
- Validate uploaded files to ensure they are valid image formats (.jpg, .png, .gif, .webp)
- Store the uploaded picture in a persistent, accessible location
- Display the uploaded picture in grafik.html by default
- Provide clear success/error feedback to users during upload
- Automatically update grafik.html when a new picture is uploaded

**Non-Goals:**
- Picture editing or cropping functionality
- Image optimization or resizing
- Cloud storage integration (initial implementation uses client-side or local storage)
- User-specific picture galleries or history tracking
- Multiple pictures or rotation functionality

## Decisions

### Decision 1: Storage Mechanism - LocalStorage with Base64 Encoding
**Choice**: Store uploaded pictures as Base64-encoded strings in browser localStorage

**Rationale**: 
- No backend server required, keeping the system simple for a single-user admin context
- Persists across page refreshes and browser sessions
- Accessible from any page (admin.html and grafik.html can both read/write)
- Works offline

**Alternatives Considered**:
- File API + IndexedDB: More complex, better for large files but unnecessary for single images
- Server-side storage: Requires backend infrastructure not currently evident in project
- Cookies: Limited size (~4KB), insufficient for image data

### Decision 2: File Validation - Client-Side MIME Type and Extension Check
**Choice**: Validate files on client-side before storage using MIME type and file extension

**Rationale**:
- Immediate user feedback without server round-trip
- Prevents invalid files from being stored in localStorage
- Acceptable for admin-only context where malicious uploads are less likely

**Alternatives Considered**:
- Server-side validation only: Requires backend
- No validation: Risk of corrupted or invalid data in storage

### Decision 3: Picture Synchronization - Window Events and Polling
**Choice**: Use browser storage events and optional polling for cross-tab updates; page refreshes will always show latest picture

**Rationale**:
- LocalStorage events fire when data changes in other tabs/windows
- Grafik page can listen and update dynamically
- Polling as fallback for same-tab updates
- User can manually refresh if needed

**Alternatives Considered**:
- Mandatory polling every 2 seconds: More resource-intensive
- WebSockets: Requires backend infrastructure
- No sync: User must manually refresh (poor UX)

### Decision 4: Implementation Architecture - Modular JavaScript
**Choice**: Create utility functions in script.js for picture upload/retrieval; separate concerns between admin.html and grafik.html

**Rationale**:
- Keeps code maintainable and testable
- Shared utility functions reduce duplication
- Clear separation of concerns (admin uploads vs. grafik displays)

**Alternatives Considered**:
- Inline all code in admin.html and grafik.html separately: Code duplication
- Single shared library file: Good but simpler to use existing script.js

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **LocalStorage size limit (~5-10MB)** → Could fail if multiple large images stored | Only store one picture at a time; validate file size before upload (recommend max 2MB) |
| **Base64 encoding increases size by ~33%** | Accept the overhead for simplicity; can optimize later if needed |
| **Browser storage is per-origin** → Won't sync if deployed to different domain | Document requirement to use consistent domain |
| **No server backup** → Picture lost if browser data cleared | Consider adding export/backup feature in future; warn user before clearing data |
| **Poor image optimization** → Large uncompressed images → Slow loading | User responsibility to optimize before upload; could add compression library later |

## Migration Plan

1. **Code Implementation**:
   - Add picture upload form and handler to admin.html/admin.js
   - Add file validation utility function to script.js
   - Add picture storage/retrieval utility functions to script.js
   - Modify grafik.html to retrieve and display picture from storage

2. **Testing**:
   - Test upload with valid formats (.jpg, .png, .gif, .webp)
   - Test upload rejection for invalid formats
   - Test localStorage persistence across page refreshes
   - Test grafik.html displays uploaded picture on load

3. **Deployment**:
   - Deploy changes to admin.html, admin.js, grafik.html, and script.js
   - Existing static picture remains as fallback if no picture uploaded
   - No database or infrastructure changes required

4. **Rollback**:
   - Remove upload form from admin.html
   - Remove utility functions from script.js
   - Restore grafik.html to display static picture
   - Existing user data in localStorage becomes inactive (not dangerous)

## Open Questions

- What should be maximum file size limit for uploads? (Recommend: 2MB)
- Should system preserve upload history or always replace previous picture? (Current spec suggests replacement only)
- Should there be a default placeholder image for grafik.html if no picture uploaded yet, or leave blank?
- Should admin have ability to delete/reset picture to initial state?
