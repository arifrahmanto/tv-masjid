## ADDED Requirements

### Requirement: Display Uploaded Picture in Grafik
The grafik.html page SHALL retrieve and display the most recently uploaded picture from the admin panel. The page MUST remove the static picture reference and use the dynamically uploaded picture instead.

#### Scenario: Grafik page displays uploaded picture
- **WHEN** grafik.html loads after a picture has been uploaded
- **THEN** the system SHALL retrieve the uploaded picture and display it on the grafik.html page

#### Scenario: Grafik page loads without uploaded picture
- **WHEN** grafik.html loads and no picture has been uploaded yet
- **THEN** the system SHALL display the default grafik.png image

### Requirement: Picture Retrieval
The system SHALL provide a mechanism for grafik.html to retrieve the currently stored picture. The retrieval MUST be reliable and work across page refreshes.

#### Scenario: Picture is retrieved on page load
- **WHEN** grafik.html is loaded or refreshed
- **THEN** the system SHALL retrieve the current picture from storage and make it available for display

### Requirement: Picture Replacement
When a new picture is uploaded via the admin panel, grafik.html SHALL automatically reflect the change without requiring a manual page refresh. The old picture MUST be replaced with the new one.

#### Scenario: Picture is updated in real-time
- **WHEN** a new picture is uploaded via the admin panel
- **THEN** the system SHALL update the picture displayed in grafik.html (either immediately or on next page load)

### Requirement: Picture Display Styling
The picture displayed in grafik.html SHALL be properly styled and sized to match the intended layout of the page. The image MUST maintain proper aspect ratio and fit appropriately within its container.

#### Scenario: Picture displays with correct styling
- **WHEN** the uploaded picture is displayed in grafik.html
- **THEN** the system SHALL apply appropriate styling to ensure the picture is properly sized and positioned
