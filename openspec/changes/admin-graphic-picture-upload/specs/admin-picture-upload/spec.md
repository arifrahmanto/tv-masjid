## ADDED Requirements

### Requirement: Admin Picture Upload Interface
The admin page SHALL provide a user interface that allows authorized users to upload picture files. The interface MUST include a file input field and a submit button to initiate the upload process.

#### Scenario: User uploads a picture file
- **WHEN** user selects a picture file and clicks the submit button in the admin panel
- **THEN** the system SHALL process the uploaded file and confirm the upload was successful

### Requirement: Picture File Validation
The system SHALL validate uploaded files to ensure they are valid picture files. The system MUST reject files that are not valid image formats (e.g., only accept .jpg, .png, .gif, .webp).

#### Scenario: User uploads invalid file type
- **WHEN** user attempts to upload a non-image file (e.g., .txt or .pdf)
- **THEN** the system SHALL display an error message indicating the file format is not supported

#### Scenario: User uploads valid image file
- **WHEN** user uploads a valid image file (.jpg, .png, .gif, or .webp)
- **THEN** the system SHALL accept the file and proceed with storage

### Requirement: Picture Storage
The system SHALL store the uploaded picture file in a location accessible to grafik.html. The storage mechanism MUST support retrieval of the most recently uploaded picture.

#### Scenario: Picture is stored and retrievable
- **WHEN** a picture is successfully uploaded
- **THEN** the system SHALL store the picture and make it available for retrieval by grafik.html

### Requirement: Upload Feedback
The admin interface SHALL provide user feedback confirming whether the upload was successful or failed. The user MUST be informed of any errors that occurred during the upload process.

#### Scenario: Successful upload confirmation
- **WHEN** a picture file is successfully uploaded and stored
- **THEN** the system SHALL display a success message to the user

#### Scenario: Upload failure notification
- **WHEN** a picture upload fails
- **THEN** the system SHALL display a clear error message explaining why the upload failed
