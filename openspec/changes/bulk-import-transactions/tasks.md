# Tasks: Bulk Import Transactions from Excel

## 1. Setup and Dependencies

- [x] 1.1 Add SheetJS library CDN reference to admin.html `<head>` section (https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js)
- [x] 1.2 Add feature detection function to check if FileReader API and XLSX library are available
- [x] 1.3 Create hidden file input element with accept=".xlsx,.xls" in Marquee tab section

## 2. UI Components

- [x] 2.1 Add "Import from Excel" button to Marquee tab next to "Add New Entry" button
- [x] 2.2 Create import preview modal HTML structure with sections for validation summary, preview table, and error list
- [x] 2.3 Style modal with Tailwind classes matching existing admin panel design
- [x] 2.4 Add loading indicator for file parsing phase
- [x] 2.5 Add expandable error list component in modal for displaying invalid rows

## 3. File Upload Handler

- [x] 3.1 Implement `triggerImport()` function to open file picker when button clicked
- [x] 3.2 Implement `handleFileSelect(event)` function to process selected file
- [x] 3.3 Add file size validation (max 5MB) with user-friendly error message
- [x] 3.4 Add file format validation (.xlsx, .xls only) with error message
- [x] 3.5 Implement FileReader to read file as binary string

## 4. Excel Parsing

- [x] 4.1 Implement `parseExcelFile(binaryString)` function using XLSX.read()
- [x] 4.2 Extract first sheet from workbook (workbook.Sheets[sheetNames[0]])
- [x] 4.3... Convert sheet to JSON array using XLSX.utils.sheet_to_json()
- [x] 4.4 Handle corrupted file errors with try-catch and user-friendly message

## 5. Column Detection

- [x] 5.1 Implement `detectColumns(headers)` function with alias matching
- [x] 5.2 Define alias arrays for Date (Date, Tanggal, Tgl), Description (Description, Desc, Keterangan, Ket, Deskripsi), Amount (Amount, Jumlah, Value, Nominal, Nilai)
- [x] 5.3 Perform case-insensitive column header matching
- [x] 5.4 Validate that all three required columns are detected, show error if missing
- [x] 5.5 Return column index mapping object { dateCol, descCol, amountCol }

## 6. Data Validation

- [x] 6.1 Implement `validateRow(row, columnMap)` function to validate each data row
- [x] 6.2 Implement date parsing for Excel serial numbers using conversion formula
- [x] 6.3 Implement date parsing for text dates (normalize "1/12/2025" to "01/12/2025")
- [x] 6.4 Validate date format matches DD/MM/YYYY pattern with regex
- [x] 6.5 Validate description field is non-empty and trim whitespace
- [x] 6.6 Implement amount parsing to remove thousand separators (commas, dots)
- [x] 6.7 Validate amount is numeric after cleanup
- [x] 6.8 Preserve negative sign for expense amounts
- [x] 6.9 Return validation result object { valid: boolean, date, description, amount, error? }
- [x] 6.10 Skip completely empty rows silently

## 7. Amount Formatting

- [x] 7.1 Implement `formatAmount(value)` function to convert numbers to Indonesian format
- [x] 7.2 Add thousands separator (dots) to formatted amounts
- [x] 7.3 Preserve negative sign for expenses in formatted output
- [x] 7.4 Handle both plain numbers and already-formatted strings as input

## 8. Preview Modal Logic

- [x] 8.1 Implement `showPreview(validRows, invalidRows, currentCount)` function
- [x] 8.2 Display validation summary showing valid count and invalid count
- [x] 8.3 Display warning "This will REPLACE all X existing transactions"
- [x] 8.4 Render preview table showing first 10 valid transactions
- [x] 8.5 Format preview table columns (Date, Description, Amount) with Indonesian formatting
- [x] 8.6 Render error list showing all invalid rows with row numbers and error messages
- [x] 8.7 Disable "Replace All" button if no valid transactions found
- [x] 8.8 Show file name and total rows found in modal header

## 9. Backup Download

- [x] 9.1 Implement `downloadBackup()` function to export current transactions
- [x] 9.2 Convert current marqueeText array to JSON string
- [x] 9.3 Create Blob with JSON data
- [x] 9.4 Generate filename with current date (transactions-backup-YYYY-MM-DD.json)
- [x] 9.5 Trigger browser download using temporary anchor element
- [x] 9.6 Call backup function automatically when user clicks "Replace All"

## 10. Replace Operation

- [x] 10.1 Implement `confirmReplace(validRows)` function triggered by "Replace All" button
- [x] 10.2 Call downloadBackup() before replacing data
- [x] 10.3 Transform validated rows to marqueeText format: "(DD/MM/YYYY) DESCRIPTION : AMOUNT"
- [x] 10.4 Clear existing state.settings.marqueeText array
- [x] 10.5 Populate marqueeText with new formatted transaction strings
- [x] 10.6 Call Settings.markChanged() to enable unsaved changes warning
- [x] 10.7 Call TransactionLedger.render() to refresh displayed table
- [x] 10.8 Close preview modal after successful replace

## 11. Error Handling

- [x] 11.1 Add try-catch around XLSX.read() with error message display
- [x] 11.2 Handle SheetJS library load failure with feature detection
- [x] 11.3 Disable import button and show tooltip if library unavailable
- [x] 11.4 Display clear error messages for all validation failures
- [x] 11.5 Allow user to retry after errors without page reload

## 12. Modal Interaction

- [x] 12.1 Implement modal close via "Cancel" button
- [x] 12.2 Implement modal close via "X" close button
- [x] 12.3 Implement modal close via Escape key press
- [x] 12.4 Ensure modal closure without confirmation makes no changes to transactions
- [x] 12.5 Remove modal backdrop on close

## 13. Integration with Existing Workflow

- [x] 13.1 Verify unsaved changes warning triggers after import (beforeunload event)
- [x] 13.2 Test that "Save to GitHub" commits imported transactions correctly
- [x] 13.3 Verify imported transactions sort correctly by date (newest first)
- [x] 13.4 Verify imported transactions display correctly in existing transaction table
- [x] 13.5 Test that manual "Add New Entry" still works after using import

## 14. Testing with Sample Data

- [ ] 14.1 Create sample Excel file with 50 valid transactions for testing
- [ ] 14.2 Test import with Excel serial number dates
- [ ] 14.3 Test import with text dates in various formats
- [ ] 14.4 Test import with Indonesian column headers (Tanggal, Keterangan, Jumlah)
- [ ] 14.5 Test import with amounts in different formats (plain, dots, commas)
- [ ] 14.6 Test import with negative amounts (expenses)
- [ ] 14.7 Test import with some invalid rows mixed in
- [ ] 14.8 Test import with all invalid rows
- [ ] 14.9 Test import with empty rows
- [ ] 14.10 Test import with file > 5MB (should reject)
- [ ] 14.11 Test import with non-Excel file (should reject)

## 15. Edge Cases and Error Scenarios

- [ ] 15.1 Test import with missing required columns
- [ ] 15.2 Test import with extra columns (should ignore gracefully)
- [ ] 15.3 Test import with only header row (no data)
- [ ] 15.4 Test canceling file picker dialog
- [ ] 15.5 Test canceling preview modal before confirm
- [ ] 15.6 Test with corrupted Excel file
- [ ] 15.7 Test when SheetJS CDN is unavailable (offline simulation)
- [ ] 15.8 Test with very large valid file (1000+ rows) for performance

## 16. Documentation

- [x] 16.1 Update USER_MANUAL.md with "Importing Transactions from Excel" section
- [x] 16.2 Document Excel file format requirements (Date, Description, Amount columns)
- [x] 16.3 Document supported date formats (DD/MM/YYYY, Excel serial, text dates)
- [x] 16.4 Document amount format handling (any format accepted, normalized to Indonesian)
- [x] 16.5 Create example Excel template file for users
- [x] 16.6 Add troubleshooting section for common import errors
- [x] 16.7 Document that import uses replace-all behavior with backup

## 17. Browser Compatibility

- [ ] 17.1 Test import feature in Chrome (last 2 versions)
- [ ] 17.2 Test import feature in Firefox (last 2 versions)
- [ ] 17.3 Test import feature in Edge (last 2 versions)
- [x] 17.4 Document browser requirements in USER_MANUAL.md
- [x] 17.5 Verify FileReader API feature detection works correctly

## 18. Final Integration

- [x] 18.1 Verify backup download works before replace completes
- [x] 18.2 Verify all validation errors display with correct row numbers
- [ ] 18.3 Verify preview modal displays correctly on mobile/tablet
- [ ] 18.4 Test complete workflow: upload → preview → backup → replace → save
- [ ] 18.5 Verify Git commit message includes imported transaction count

## 19. Deployment

- [ ] 19.1 Commit admin.html changes (import button and modal)
- [ ] 19.2 Commit admin.js changes (import functions in TransactionLedger)
- [ ] 19.3 Commit USER_MANUAL.md updates
- [ ] 19.4 Commit example Excel template file
- [ ] 19.5 Push to GitHub and verify GitHub Pages deployment
- [ ] 19.6 Test import feature on live GitHub Pages site
- [ ] 19.7 Verify SheetJS CDN loads correctly in production
