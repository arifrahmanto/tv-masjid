# Proposal: Bulk Import Transactions from Excel

## Why

The admin panel currently requires manual entry of each transaction one-by-one through the "Add New Entry" form. With 50+ transactions per month and historical data spanning multiple months, this creates significant admin burden. Users maintain financial records in Excel spreadsheets, making bulk import a natural fit to reduce data entry time from hours to seconds while minimizing transcription errors.

## What Changes

- Add "Import from Excel" button to Marquee tab alongside existing "Add New Entry" button
- Integrate SheetJS library (xlsx.js) via CDN for browser-based Excel parsing
- Implement file upload handler accepting .xlsx and .xls files
- Add validation logic for Excel data (date format, amount parsing, required fields)
- Create import preview modal showing parsed transactions before commit
- Implement "replace all" behavior that clears existing transactions and imports new data
- Add automatic backup download of current transactions before replacement
- Support flexible column detection (Date/Tanggal, Description/Keterangan, Amount/Jumlah)
- Handle Excel date serial numbers and convert to DD/MM/YYYY format
- Parse amount formats (plain numbers, Indonesian dots, US commas) and normalize to Indonesian format
- Display validation errors with row numbers and error descriptions
- Update USER_MANUAL.md with import instructions and Excel template guide

## Capabilities

### New Capabilities

- `excel-import`: Browser-based Excel file upload, parsing, validation, and bulk transaction import with preview and replace behavior

### Modified Capabilities

<!-- No existing capabilities are being modified - this is a pure addition -->

## Impact

**Files Modified:**
- `admin.html` - Add import button and file input to Marquee tab, add preview modal HTML
- `admin.js` - Extend `TransactionLedger` module with import functions
- `USER_MANUAL.md` - Add section on bulk import workflow

**New Dependencies:**
- SheetJS (xlsx.js) library via CDN (~500KB, Apache 2.0 license)

**Affected Components:**
- Marquee/Transaction Ledger UI - New import button and modal
- Transaction validation - Extended to handle bulk data
- Data flow - Replace behavior affects existing marqueeText array

**User Workflow:**
- Current: Add each transaction manually (3 fields × 50 transactions = 150 input operations)
- New: Upload Excel file → Review preview → Confirm import (3 clicks for 50 transactions)

**Risk Considerations:**
- Replace behavior could lose data if confirmed accidentally - mitigated by preview and backup
- Invalid Excel formats could fail parsing - mitigated by validation and error reporting
- Large file uploads could slow browser - mitigated by file size limit (5MB max)
