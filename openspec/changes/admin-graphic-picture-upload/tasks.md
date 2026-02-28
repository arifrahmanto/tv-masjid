## 1. Setup and Utility Functions

- [x] 1.1 Add `PictureUtils` module to admin.js (validateImageFile, convertToBase64)
- [x] 1.2 Implement file validation checking MIME type and extension (.jpg, .png, .gif, .webp)
- [x] 1.3 Implement Base64 conversion utility to encode uploaded files for GitHub API payload

## 2. Admin Panel Upload Interface

- [x] 2.1 Add Grafik tab to admin.html with file input and upload button
- [x] 2.2 Style the upload form to match existing admin panel styling
- [x] 2.3 Add upload event handler in admin.js (`PictureUploadHandler.onFileSelected`) to capture file selection
- [x] 2.4 Implement file validation on selection (show error if invalid format)
- [x] 2.5 Implement file size validation (max 2MB, show error if exceeded)
- [x] 2.6 Implement upload processing: convert to Base64 and commit to GitHub as `grafik.png`
- [x] 2.7 Fetch existing file SHA before commit (required by GitHub API for updates; handle 404 for new file)
- [x] 2.8 Display success message when picture is successfully committed
- [x] 2.9 Display error messages with specific reasons (invalid format, file too large, API error)
- [x] 2.10 Add loading indicator while processing and committing the file
- [x] 2.11 Show preview of uploaded picture in admin panel after successful commit

## 3. Grafik Picture Display

- [x] 3.1 Simplify grafik.html to `<img src="grafik.png">` — remove all script blocks and localStorage logic
- [x] 3.2 Add CSS styling for the image element (sizing, object-fit, container fit)
- [x] 3.3 Default `grafik.png` in repository serves as fallback when no upload has occurred
