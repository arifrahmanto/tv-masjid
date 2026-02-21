# Spec: Excel Import

## ADDED Requirements

### Requirement: User can import transactions from Excel file

The system SHALL provide an "Import from Excel" button in the Marquee tab that allows users to upload an .xlsx or .xls file containing transaction data.

#### Scenario: User clicks import button
- **WHEN** user clicks the "Import from Excel" button
- **THEN** system SHALL display a file picker dialog accepting .xlsx and .xls files only

#### Scenario: User cancels file picker
- **WHEN** user cancels the file picker without selecting a file
- **THEN** system SHALL close the dialog and make no changes to transactions

### Requirement: System validates Excel file before processing

The system SHALL validate the uploaded file to ensure it is a valid Excel format and meets size constraints before attempting to parse.

#### Scenario: File exceeds size limit
- **WHEN** user uploads a file larger than 5MB
- **THEN** system SHALL display error "File too large (max 5MB)" and reject the file

#### Scenario: File is not Excel format
- **WHEN** user uploads a non-Excel file (e.g., .txt, .pdf, .doc)
- **THEN** system SHALL display error "Invalid file format. Please upload .xlsx or .xls file" and reject the file

#### Scenario: File is corrupted
- **WHEN** user uploads a corrupted Excel file that cannot be parsed
- **THEN** system SHALL display error "Unable to read file. Please check the file is not corrupted" and allow retry

### Requirement: System detects column headers in Excel

The system SHALL automatically detect Date, Description, and Amount columns using case-insensitive matching with support for Indonesian and English column names.

#### Scenario: Headers use English names
- **WHEN** Excel file has columns "Date", "Description", "Amount"
- **THEN** system SHALL correctly map to transaction fields

#### Scenario: Headers use Indonesian names
- **WHEN** Excel file has columns "Tanggal", "Keterangan", "Jumlah"
- **THEN** system SHALL correctly map to transaction fields

#### Scenario: Headers use mixed or abbreviated names
- **WHEN** Excel file has columns "Tgl", "Desc", "Nominal"
- **THEN** system SHALL correctly map to transaction fields using alias matching

#### Scenario: Required columns are missing
- **WHEN** Excel file is missing one or more required columns (Date, Description, or Amount)
- **THEN** system SHALL display error "Missing required columns: [column names]" and reject the file

#### Scenario: Headers have different capitalization
- **WHEN** Excel file has columns "DATE", "description", "AMOUNT"
- **THEN** system SHALL correctly map columns using case-insensitive matching

### Requirement: System parses and validates each transaction row

The system SHALL parse each row of data and validate that date, description, and amount fields meet format requirements, collecting validation errors for display to user.

#### Scenario: Row has valid data
- **WHEN** row contains valid date "01/12/2025", non-empty description, and numeric amount
- **THEN** system SHALL mark row as valid

#### Scenario: Row has Excel serial date
- **WHEN** row contains Excel serial number date (e.g., 44927)
- **THEN** system SHALL convert to DD/MM/YYYY format (e.g., "01/12/2025")

#### Scenario: Row has text date with single-digit day/month
- **WHEN** row contains date "1/12/2025"
- **THEN** system SHALL normalize to "01/12/2025" with zero-padding

#### Scenario: Row has invalid date format
- **WHEN** row contains date "32/13/2025" or "2025-01-01" or non-date text
- **THEN** system SHALL mark row as invalid with error "Invalid date format (use DD/MM/YYYY)"

#### Scenario: Row has empty description
- **WHEN** row has date and amount but description is empty or whitespace-only
- **THEN** system SHALL mark row as invalid with error "Description cannot be empty"

#### Scenario: Row has non-numeric amount
- **WHEN** row has amount value that is not a number (e.g., "abc", "N/A")
- **THEN** system SHALL mark row as invalid with error "Amount must be a number"

#### Scenario: Row has amount with thousand separators
- **WHEN** row has amount "1,000" (US format) or "1.000" (Indonesian format)
- **THEN** system SHALL remove separators and parse as numeric value

#### Scenario: Row has negative amount
- **WHEN** row has amount "-500000" or "-500.000"
- **THEN** system SHALL preserve negative sign and format as expense

#### Scenario: Row is completely empty
- **WHEN** row has all empty cells
- **THEN** system SHALL skip the row silently (not counted as valid or invalid)

### Requirement: System displays import preview modal with validation results

The system SHALL display a modal showing parsed transaction data, validation summary, and error details before allowing user to confirm import.

#### Scenario: All rows are valid
- **WHEN** all parsed rows pass validation
- **THEN** system SHALL display preview showing "X valid transactions" with first 10 rows in table format

#### Scenario: Some rows are invalid
- **WHEN** file contains both valid and invalid rows
- **THEN** system SHALL display preview showing "X valid, Y invalid" with error list containing row numbers and error messages

#### Scenario: All rows are invalid
- **WHEN** no rows pass validation
- **THEN** system SHALL display error "No valid transactions found. Please check file format." and disable import button

#### Scenario: User reviews preview data
- **WHEN** preview modal is displayed
- **THEN** modal SHALL show:
  - File name and row count
  - Validation summary (valid/invalid count)
  - Preview table with first 10 valid transactions showing date, description, and formatted amount
  - Expandable error list showing all invalid rows with row numbers and specific errors
  - Warning message "This will REPLACE all X existing transactions"

#### Scenario: Preview shows formatted amounts
- **WHEN** preview table displays transaction amounts
- **THEN** amounts SHALL be formatted with Indonesian thousand separators (dots) matching existing display

### Requirement: System provides automatic backup before replace

The system SHALL automatically download a backup of current transactions before replacing them with imported data.

#### Scenario: User confirms import
- **WHEN** user clicks "Replace All" button in preview modal
- **THEN** system SHALL trigger browser download of current transactions as JSON file named "transactions-backup-YYYY-MM-DD.json"

#### Scenario: Backup download completes
- **WHEN** backup file download is triggered
- **THEN** system SHALL wait for download to complete before proceeding with replace operation

### Requirement: System replaces all transactions with imported data

The system SHALL clear the existing marqueeText array and replace it with validated transactions from the imported file, formatted according to existing transaction structure.

#### Scenario: Replace operation completes successfully
- **WHEN** user confirms replace in preview modal
- **THEN** system SHALL:
  - Clear all existing transactions from marqueeText array
  - Add all valid imported transactions in format "(DD/MM/YYYY) DESCRIPTION : AMOUNT"
  - Mark settings as changed (unsaved changes warning enabled)
  - Close the preview modal
  - Refresh the transaction table to show imported data

#### Scenario: Imported amounts preserve sign
- **WHEN** imported transaction has negative amount
- **THEN** formatted transaction SHALL include minus sign in amount field (e.g., "-4.097.500")

#### Scenario: Imported date format is preserved
- **WHEN** imported date is converted to DD/MM/YYYY
- **THEN** formatted transaction SHALL use exactly DD/MM/YYYY with zero-padding (e.g., "01/12/2025")

### Requirement: User can cancel import at any point

The system SHALL allow user to cancel the import operation before confirmation without making any changes to existing transactions.

#### Scenario: User cancels during preview
- **WHEN** user clicks "Cancel" button in preview modal
- **THEN** system SHALL close modal and make no changes to transactions

#### Scenario: User closes modal via X button
- **WHEN** user clicks X or presses Escape key while preview modal is open
- **THEN** system SHALL close modal and make no changes to transactions

### Requirement: System handles errors gracefully

The system SHALL display clear error messages for all error conditions and allow user to retry or cancel without leaving the UI in a broken state.

#### Scenario: SheetJS library fails to load
- **WHEN** SheetJS CDN is unavailable or blocked
- **THEN** import button SHALL be disabled with tooltip "Import feature unavailable (library failed to load)"

#### Scenario: File parsing throws exception
- **WHEN** XLSX.read() throws an unexpected error
- **THEN** system SHALL display error "Failed to parse Excel file: [error message]" and allow user to try a different file

#### Scenario: Browser lacks FileReader API
- **WHEN** browser does not support FileReader API
- **THEN** import button SHALL be hidden and feature detection SHALL log warning to console

### Requirement: Import feature integrates with existing save workflow

The system SHALL mark settings as unsaved after import, requiring user to click "Save to GitHub" to commit changes, consistent with manual transaction edits.

#### Scenario: After successful import
- **WHEN** import completes and modal closes
- **THEN** system SHALL:
  - Set unsaved changes flag to true
  - Update validation status to "Unsaved changes"
  - Enable browser beforeunload warning

#### Scenario: User saves after import
- **WHEN** user clicks "Save to GitHub" after import
- **THEN** system SHALL commit all imported transactions to setting.json via GitHub API

#### Scenario: User navigates away without saving
- **WHEN** user tries to leave page or switch tabs after import without saving
- **THEN** system SHALL display browser warning "You have unsaved changes. Leave anyway?"
