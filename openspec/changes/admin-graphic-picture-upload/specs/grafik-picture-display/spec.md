## ADDED Requirements

### Requirement: Display Grafik Picture
The grafik.html page SHALL display `grafik.png` directly as a static image asset. The page MUST NOT rely on localStorage, JavaScript, or any dynamic retrieval mechanism to show the picture.

#### Scenario: Grafik page loads after a new picture was uploaded
- **WHEN** grafik.html loads after a picture has been committed to GitHub as `grafik.png`
- **THEN** the browser SHALL load and display the updated `grafik.png` served from the repository

#### Scenario: Grafik page loads with no custom upload
- **WHEN** grafik.html loads and no picture has been uploaded via admin
- **THEN** the page SHALL display the default `grafik.png` already present in the repository

### Requirement: No Client-Side Storage Dependency
The grafik.html page SHALL NOT use localStorage, sessionStorage, IndexedDB, or any browser-side storage to load or cache the picture. The image MUST be loaded directly via its `src` attribute pointing to `grafik.png`.

#### Scenario: Picture displays without any JavaScript execution
- **WHEN** grafik.html is rendered
- **THEN** the `<img src="grafik.png">` element SHALL display the image without requiring any script to run

### Requirement: Picture Display Styling
The picture displayed in grafik.html SHALL be properly styled and sized to fit within the page layout with correct aspect ratio.

#### Scenario: Picture displays with correct styling
- **WHEN** the picture is displayed in grafik.html
- **THEN** the image SHALL be sized with `max-width: 100%`, `max-height: 100%`, and `object-fit: contain` within its container
