# Transaction Ledger Specification

## ADDED Requirements

### Requirement: Display Marquee Transactions Table
The admin panel SHALL display all marquee transactions in a table format sorted by date in descending order (newest first). Each row shows date, description, and amount.

#### Scenario: Admin views transaction list
- **WHEN** admin navigates to Marquee tab
- **THEN** all transactions from `marqueeText` array are displayed in a table
- **AND** table is sorted by date (newest first)
- **AND** each row shows: Date (DD/MM/YYYY), Description, Amount (formatted)
- **AND** each row has Edit and Delete buttons

#### Scenario: Admin views transaction not loading on startup
- **WHEN** admin opens admin panel
- **THEN** marquee transactions load from `setting.json`
- **AND** table is populated automatically

### Requirement: Add New Transaction
Admin SHALL be able to add a new marquee transaction by filling in a form with date, description, and amount. Transaction SHALL be formatted as `(DD/MM/YYYY) DESCRIPTION : AMOUNT` and added to the array.

#### Scenario: Admin adds valid transaction
- **WHEN** admin clicks "Add New Entry" button
- **THEN** form fields appear: Date (date picker), Description (text), Amount (number)
- **AND** admin fills in all fields with valid data
- **AND** admin clicks "Add"
- **THEN** transaction is added to the table
- **AND** table is re-sorted by date
- **AND** form is cleared for next entry

#### Scenario: Admin adds transaction with invalid data
- **WHEN** admin enters invalid date (wrong format) or empty description or non-numeric amount
- **THEN** corresponding field is highlighted in red
- **AND** error message is displayed
- **AND** Add button remains disabled until errors are fixed

#### Scenario: Admin cancels adding transaction
- **WHEN** admin clicks "Cancel" during form entry
- **THEN** form is cleared and hidden
- **AND** no transaction is added

### Requirement: Edit Existing Transaction
Admin SHALL be able to edit an existing transaction by clicking the Edit button. Changes SHALL update the transaction in place.

#### Scenario: Admin edits transaction
- **WHEN** admin clicks Edit button on a row
- **THEN** transaction row expands or form appears with current values
- **AND** admin modifies date, description, or amount
- **AND** admin clicks "Save"
- **THEN** transaction is updated in table
- **AND** table is re-sorted by date
- **AND** row returns to display mode

#### Scenario: Admin cancels edit
- **WHEN** admin clicks "Cancel" during edit
- **THEN** form is closed without saving
- **AND** transaction retains original values

### Requirement: Delete Transaction
Admin SHALL be able to delete a transaction by clicking the Delete button with a confirmation dialog.

#### Scenario: Admin deletes transaction
- **WHEN** admin clicks Delete button on a row
- **THEN** confirmation dialog appears asking "Are you sure?"
- **AND** admin clicks "Yes"
- **THEN** transaction is removed from the table
- **AND** array is immediately updated

#### Scenario: Admin cancels deletion
- **WHEN** admin clicks "Cancel" in confirmation dialog
- **THEN** transaction remains in table
- **AND** deletion is not performed

### Requirement: Transaction Format and Validation
All transactions SHALL strictly follow the format: `(DD/MM/YYYY) DESCRIPTION : AMOUNT`. Amounts SHALL use Indonesian thousands separator (dot). Validation SHALL enforce this format client-side.

#### Scenario: Valid transaction format
- **WHEN** admin creates transaction with: Date=01/12/2025, Description="RT 7 RW 1", Amount=700000
- **THEN** transaction is formatted as: `(01/12/2025) RT 7 RW 1 : 700.000`
- **AND** stored in `marqueeText` array as this string

#### Scenario: Invalid date format
- **WHEN** admin enters date not in DD/MM/YYYY format
- **THEN** date field shows error: "Date must be DD/MM/YYYY"
- **AND** form cannot be submitted

#### Scenario: Amount formatting with thousands separator
- **WHEN** admin enters amount 4097500
- **THEN** amount is displayed/stored as `4.097.500` (Indonesian format)
- **AND** when editing, shows `4.097.500` for readability

### Requirement: Auto-Sort by Date
After any add, edit, or delete operation, the transaction list SHALL be automatically sorted by date in descending order (newest first).

#### Scenario: Transactions re-sort after edit
- **WHEN** admin edits a transaction's date to an earlier date
- **THEN** after saving, transaction moves to lower position in table
- **AND** table remains sorted newest-first

### Requirement: Persist to Setting.json
All transaction changes (add, edit, delete) SHALL be reflected in the `marqueeText` array in `setting.json`. Changes are not persisted until Save is clicked at the panel level.

#### Scenario: Multiple transactions changed before save
- **WHEN** admin adds 2 transactions, edits 1, deletes 1 within one session
- **AND** all changes are shown in the table
- **AND** admin clicks panel "Save" button
- **THEN** all changes are committed together to `setting.json`
- **AND** one commit appears in Git history
