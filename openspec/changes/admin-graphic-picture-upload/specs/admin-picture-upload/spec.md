## ADDED Requirements

### Requirement: Admin Picture Upload Interface
The admin page SHALL provide a dedicated Grafik tab that allows authorized users to upload picture files. The interface MUST include a file input field, an upload button, a loading indicator, a status message area, and a preview container.

#### Scenario: User uploads a picture file
- **WHEN** user selects a picture file and clicks the upload button in the Grafik tab
- **THEN** the system SHALL commit the image to the GitHub repository as `grafik.png` and display a success message

### Requirement: Picture File Validation
The system SHALL validate uploaded files before committing to GitHub. The system MUST reject files that are not valid image formats (.jpg, .png, .gif, .webp) or exceed 2MB.

#### Scenario: User uploads invalid file type
- **WHEN** user attempts to upload a non-image file (e.g., .txt or .pdf)
- **THEN** the system SHALL display an error message indicating the file format is not supported

#### Scenario: User uploads a file exceeding size limit
- **WHEN** user attempts to upload an image file larger than 2MB
- **THEN** the system SHALL display an error message indicating the file is too large

#### Scenario: User uploads valid image file
- **WHEN** user uploads a valid image file (.jpg, .png, .gif, or .webp) within 2MB
- **THEN** the system SHALL proceed to commit the file to GitHub

### Requirement: Picture Commited to GitHub
The system SHALL commit the uploaded picture to the GitHub repository as `grafik.png` using the GitHub Contents API. The commit MUST include the correct SHA of the existing file (if present) to support updates.

#### Scenario: Picture is committed for the first time
- **WHEN** no `grafik.png` exists in the repository and a valid image is uploaded
- **THEN** the system SHALL create `grafik.png` via a GitHub API PUT request

#### Scenario: Existing picture is replaced
- **WHEN** `grafik.png` already exists and a new valid image is uploaded
- **THEN** the system SHALL fetch the existing file SHA and commit the new file, replacing the previous one

### Requirement: Upload Feedback
The admin interface SHALL provide feedback confirming whether the upload succeeded or failed.

#### Scenario: Successful upload confirmation
- **WHEN** a picture file is successfully committed to GitHub
- **THEN** the system SHALL display a success message and show a preview of the uploaded image

#### Scenario: Upload failure notification
- **WHEN** a picture upload fails (validation error or GitHub API error)
- **THEN** the system SHALL display a clear error message explaining why the upload failed
