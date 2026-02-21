# Design: Bulk Import Transactions from Excel

## Context

The TV Masjid admin panel currently includes a transaction ledger (`marqueeText` array in `setting.json`) managed through the Marquee tab. Transactions follow the format `(DD/MM/YYYY) DESCRIPTION : AMOUNT` and are displayed as a scrolling marquee on the TV display.

**Current State:**
- Transaction entry is one-by-one via "Add New Entry" button
- Each transaction requires 3 field inputs (date, description, amount)
- TransactionLedger module in admin.js handles rendering, parsing, and CRUD operations
- Existing validation ensures DD/MM/YYYY date format and numeric amounts

**Constraints:**
- Must remain serverless (GitHub Pages, no backend)
- Must work in browsers (Chrome, Firefox, Edge)
- Must maintain existing transaction format for backward compatibility
- Zero npm dependencies (CDN-only libraries acceptable)

**Stakeholders:**
- Mosque administrators who receive monthly Excel reports from treasurers
- End users viewing the TV display (no impact to them)

## Goals / Non-Goals

**Goals:**
- Enable bulk import of 50+ transactions from Excel files (.xlsx, .xls)
- Reduce data entry time from ~30 minutes to <1 minute per batch
- Validate imported data before committing to prevent corrupt transactions
- Provide clear error messages for invalid data with row numbers
- Support flexible column naming (Indonesian and English)
- Handle Excel date formats (serial numbers and text dates)
- Automatically backup existing transactions before replace
- Maintain zero-dependency philosophy (CDN libraries only)

**Non-Goals:**
- Append mode (only replace-all is supported in v1)
- Duplicate detection or smart merging
- Multi-sheet Excel file support (use first sheet only)
- Real-time Excel editing (read-only import)
- Server-side processing or cloud storage
- CSV import (Excel-only for v1, CSV can be future enhancement)

## Decisions

### Decision 1: SheetJS via CDN for Excel Parsing

**Chosen:** SheetJS (xlsx.full.min.js) loaded from CDN  
**Why:** Industry-standard library, Apache 2.0 license, actively maintained, 500KB size acceptable for occasional use  
**Alternatives Considered:**
- **CSV only:** Simpler (~50 lines of code), but requires users to export CSV from Excel—adds friction
- **ExcelJS:** More features but 1.5MB, overkill for read-only use case
- **Server-side parsing:** Would require backend infrastructure, breaks GitHub Pages model

**Rationale:** SheetJS provides robust Excel format support (both .xlsx and legacy .xls), handles date serial numbers correctly, and is battle-tested across millions of deployments.

### Decision 2: Replace-All Behavior (No Append Mode)

**Chosen:** Replace all existing transactions on import  
**Why:** Simpler UX, clearer mental model, aligns with "Excel is source of truth" workflow  
**Alternatives Considered:**
- **Append mode:** Would require duplicate detection logic (complex—what defines a duplicate?)
- **Smart merge:** Would need conflict resolution UI (scope creep)
- **User choice (replace/append toggle):** Adds cognitive load, increases test surface

**Rationale:** Users exporting from accounting software have complete monthly records. Replace-all ensures imported data exactly matches their Excel file. Backup download provides safety net.

### Decision 3: Preview Modal with Validation Before Commit

**Chosen:** Modal showing parsed data with row-level validation status  
**Why:** Prevents "blind import" disasters, gives user confidence, catches errors before they corrupt data  
**Alternatives Considered:**
- **Import then undo:** User doesn't see problems until after clicking Save
- **Inline validation during upload:** No opportunity to review full dataset before commit

**Rationale:** Preview is standard UX pattern for bulk operations (Gmail attachments, PayPal CSVs, etc.). Seeing 50 rows of validated data builds trust.

### Decision 4: Flexible Column Detection (Case-Insensitive Aliases)

**Chosen:** Support aliases (Date/Tanggal, Description/Keterangan, Amount/Jumlah) with case-insensitive matching  
**Why:** Real-world Excel files have varied column names; users shouldn't need to rename columns  
**Alternatives Considered:**
- **Strict matching:** "Date", "Description", "Amount" only—brittle, user-unfriendly
- **User column mapping UI:** Complex, adds extra step, overkill for 3 columns

**Rationale:** Graceful handling of common variations (Indonesian terms, capitalization) improves UX. Fallback error message guides users if columns undetectable.

### Decision 5: Automatic Backup Download Before Replace

**Chosen:** Trigger browser download of current transactions as JSON before replace  
**Why:** Safety net if user regrets import, no server storage needed  
**Alternatives Considered:**
- **No backup:** Risky, data loss
- **Undo button in memory:** Lost on page refresh, limited value
- **Git history as backup:** Not accessible to non-technical users

**Rationale:** Browser download API is simple, works offline, users get tangible backup file. Can open in admin panel later if needed.

### Decision 6: Excel Date Handling (Dual Support)

**Chosen:** Support both Excel serial dates (44927) and text dates ("01/12/2025")  
**Why:** Excel auto-converts typed dates to serial numbers; users may also paste text  
**Alternatives Considered:**
- **Serial only:** Breaks for copy-pasted text dates
- **Text only:** Breaks for Excel-native date columns

**Rationale:** SheetJS provides date detection utilities. Implementing both costs ~20 lines but handles all real-world cases.

### Decision 7: File Size Limit (5MB)

**Chosen:** Reject files >5MB with friendly error  
**Why:** Prevents browser memory issues, 5MB = ~100,000 rows (far exceeds use case)  
**Alternatives Considered:**
- **No limit:** Risk of browser crash
- **1MB limit:** May be too restrictive for large historical imports

**Rationale:** Conservative limit that accommodates realistic data volumes while protecting browser performance.

## Risks / Trade-offs

### Risk: SheetJS Library Availability (CDN Dependency)

**Risk:** CDN unavailable (outage, blocking, offline use)  
**Mitigation:**
- Use reliable CDN (jsdelivr or cdnjs with fallbacks)
- Import feature gracefully degrades (button disabled with message)
- Manual entry still works
- Future: Consider bundling library for offline support

### Risk: Excel Format Variations

**Risk:** User's Excel file has unexpected structure (merged cells, formulas, hidden rows)  
**Mitigation:**
- Validate row structure before parsing
- Skip empty rows automatically
- Show clear error for undetectable columns
- Provide example Excel template in docs

### Risk: Large File Upload Performance

**Risk:** Parsing 10,000+ row file locks browser UI  
**Mitigation:**
- 5MB file size check before parsing
- Show loading spinner during parse
- Use Web Workers if performance issues emerge (future optimization)

### Risk: Date Format Ambiguity (DD/MM vs MM/DD)

**Risk:** "01/12/2025" is ambiguous (Jan 12 vs Dec 1)  
**Mitigation:**
- Expect DD/MM/YYYY (current system standard)
- Preview shows parsed dates—user validates before confirm
- Documentation explicitly states DD/MM/YYYY requirement

### Risk: Accidental Replace-All

**Risk:** User clicks import without reading preview, loses 6 months of data  
**Mitigation:**
- Preview modal shows count: "Will replace X existing transactions"
- Automatic backup download before replace
- Confirmation button labeled "Replace All" (not just "OK")
- Can't bypass preview (modal required)

### Risk: Browser Compatibility

**Risk:** FileReader API or XLSX library doesn't work in older browsers  
**Mitigation:**
- Target modern browsers (Chrome/Firefox/Edge, last 2 versions)
- Feature detection: Disable button if FileReader unavailable
- Document browser requirements in USER_MANUAL.md

## Architecture

### Component Integration

```
admin.html
├─ Marquee Tab
│   ├─ [Add New Entry] button (existing)
│   └─ [Import from Excel] button (NEW)
│       └─ <input type="file" accept=".xlsx,.xls" style="display:none">
│
└─ Import Preview Modal (NEW)
    ├─ File info (name, size, rows found)
    ├─ Validation summary (X valid, Y invalid)
    ├─ Preview table (first 10 rows)
    ├─ Error list (expandable)
    └─ Action buttons (Cancel | Replace All)

admin.js
└─ TransactionLedger module
    ├─ render() (existing)
    ├─ addNew() (existing)
    ├─ parseTransaction() (existing)
    ├─ parseDate() (existing)
    └─ NEW FUNCTIONS:
        ├─ triggerImport() - Opens file picker
        ├─ handleFileSelect() - Reads file, triggers parse
        ├─ parseExcelFile() - Uses XLSX.read(), extracts sheet
        ├─ detectColumns() - Maps headers to fields
        ├─ validateRow() - Validates date/desc/amount
        ├─ showPreview() - Renders modal with parsed data
        ├─ downloadBackup() - Triggers JSON download
        └─ confirmReplace() - Replaces marqueeText, closes modal
```

### Data Flow

```
1. User clicks [Import from Excel]
        ↓
2. File picker opens (.xlsx/.xls only)
        ↓
3. User selects file
        ↓
4. FileReader.readAsBinaryString(file)
        ↓
5. XLSX.read(binaryString, {type: 'binary'})
        ↓
6. workbook.Sheets[sheetNames[0]] (first sheet)
        ↓
7. XLSX.utils.sheet_to_json(sheet, {header: 1})
        ↓
8. Detect columns (Date/Description/Amount)
        ↓
9. For each row: validateRow(row)
   ├─ Parse date (serial or text → DD/MM/YYYY)
   ├─ Validate description (non-empty string)
   └─ Parse amount (any format → Indonesian dots)
        ↓
10. Build validation results
    ├─ Valid rows → {date, description, amount}
    └─ Invalid rows → {rowNum, error message}
        ↓
11. Show preview modal
    ├─ Valid count / Invalid count
    ├─ Preview table (first 10 valid rows)
    └─ Error list (all invalid rows)
        ↓
12. User clicks [Replace All]
        ↓
13. downloadBackup(currentTransactions)
        ↓
14. Replace state.settings.marqueeText with new array
        ↓
15. Settings.markChanged() (unsaved changes warning)
        ↓
16. Close modal, render updated table
        ↓
17. User clicks [Save to GitHub] when ready
```

### Excel Parsing Logic

```javascript
// Column detection (case-insensitive, multi-language)
const dateAliases = ['date', 'tanggal', 'tgl'];
const descAliases = ['description', 'desc', 'keterangan', 'ket', 'deskripsi'];
const amountAliases = ['amount', 'jumlah', 'value', 'nominal', 'nilai'];

// Date handling (dual format support)
function parseExcelDate(value) {
    // Excel serial number (e.g., 44927)?
    if (typeof value === 'number' && value > 40000) {
        const jsDate = excelSerialToDate(value);
        return formatToDDMMYYYY(jsDate);
    }
    // Text date?
    if (typeof value === 'string') {
        return normalizeDateString(value); // "1/12/2025" → "01/12/2025"
    }
    return null; // Invalid
}

// Amount parsing (flexible format)
function parseAmount(value) {
    // Remove any thousand separators (dots, commas)
    let cleaned = String(value).replace(/[,\.]/g, '');
    let num = parseInt(cleaned, 10);
    if (isNaN(num)) return null;
    
    // Format with Indonesian dots
    const isNegative = num < 0;
    num = Math.abs(num);
    const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return isNegative ? '-' + formatted : formatted;
}
```

## Migration Plan

### Deployment Steps

1. **Add SheetJS CDN reference to admin.html** (`<head>` section)
2. **Extend TransactionLedger module** in admin.js with import functions
3. **Add Import button and modal HTML** to Marquee tab
4. **Test with sample Excel files** (valid data, edge cases, invalid formats)
5. **Update USER_MANUAL.md** with import guide and Excel template
6. **Git commit and push** to GitHub Pages
7. **Verify** import button appears and SheetJS loads

### Rollback Strategy

- If critical bug discovered: Remove import button via admin.html edit, push to GitHub
- Manual entry path remains unchanged—users can continue normally
- `setting.json` commits are tracked in Git history—can revert via GitHub UI

### Testing Checklist

- [ ] Upload valid Excel with 50 transactions → Verify all parse correctly
- [ ] Upload Excel with date serial numbers → Verify conversion to DD/MM/YYYY
- [ ] Upload Excel with text dates "1/12/2025" → Verify normalization
- [ ] Upload Excel with Indonesian column headers → Verify detection
- [ ] Upload Excel with invalid dates "32/13/2025" → Verify error shown
- [ ] Upload Excel with missing amount → Verify error shown
- [ ] Upload Excel with 10,000 rows → Verify performance acceptable
- [ ] Upload .txt file → Verify graceful error
- [ ] Cancel during preview → Verify no changes applied
- [ ] Replace all → Verify backup downloads automatically
- [ ] Import then Save to GitHub → Verify commit succeeds

## Open Questions

- **Should we add CSV import as a secondary option?** (Lightweight alternative, no library needed)
- **Should we support multi-sheet workbooks?** (Let user select sheet in preview)
- **Should append mode be added in v2?** (Would need duplicate detection design)
- **What's the ideal preview row count?** (Currently 10 rows, configurable?)
