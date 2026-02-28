## 1. Setup and Utility Functions

- [x] 1.1 Add picture utility functions to script.js (validateImageFile, convertToBase64, savePictureToStorage, getPictureFromStorage, deletePictureFromStorage)
- [x] 1.2 Implement file validation function checking MIME type and extension (.jpg, .png, .gif, .webp)
- [x] 1.3 Implement Base64 conversion utility to encode uploaded files
- [x] 1.4 Implement localStorage save/get functions with error handling for picture data
- [x] 1.5 Add localStorage event listener utility for detecting picture changes across tabs

## 2. Admin Panel Upload Interface

- [x] 2.1 Add picture upload form to admin.html with file input and submit button
- [x] 2.2 Style the upload form to match existing admin panel styling
- [x] 2.3 Add upload event handler in admin.js to capture file selection
- [x] 2.4 Implement file validation on selection (show error if invalid format)
- [x] 2.5 Implement file size validation (recommend max 2MB, show error if exceeded)
- [x] 2.6 Implement upload processing in admin.js using utility functions
- [x] 2.7 Save validated picture to localStorage as Base64 string
- [x] 2.8 Display success message when picture is successfully uploaded
- [x] 2.9 Display error messages with specific reasons (invalid format, file too large, storage error)
- [x] 2.10 Add loading indicator while processing the file

## 3. Grafik Picture Display

- [x] 3.1 Modify grafik.html to remove static/hardcoded picture reference
- [x] 3.2 Add image element to grafik.html for dynamic picture display
- [x] 3.3 Add script to grafik.html that retrieves picture from localStorage on page load
- [x] 3.4 Convert Base64 string back to displayable image (data URI)
- [x] 3.5 Add CSS styling for the image element (sizing, aspect ratio, container fit)
- [x] 3.6 Add storage event listener to grafik page to detect picture uploads from admin panel
- [x] 3.7 Implement dynamic picture refresh when storage changes (for cross-tab updates)
- [x] 3.8 Add fallback behavior if no picture is uploaded (placeholder or message)
