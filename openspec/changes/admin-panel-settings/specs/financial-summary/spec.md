# Financial Summary Specification

## ADDED Requirements

### Requirement: Display Financial Summary Forms
The admin panel SHALL display forms for three mosque funds: Kas Pembangunan, Kas Takmir, and Kas Sawah. Each fund form displays and allows editing of: month/year, previous balance, income, expenses, and calculated current balance.

#### Scenario: Admin views financial summary tab
- **WHEN** admin navigates to Financial tab
- **THEN** three collapsible sections are displayed (one per fund)
- **AND** each section shows fields: Month/Year, Previous Balance, Income, Expenses, Current Balance
- **AND** Current Balance field is read-only (calculated)

#### Scenario: Financial data loads from setting.json
- **WHEN** admin opens admin panel
- **THEN** `setting.json` `financialSummary` object is fetched
- **AND** all three fund forms are populated with current values

### Requirement: Auto-Calculate Current Balance
When income, expenses, or previous balance values change, the Current Balance SHALL automatically recalculate and update using the formula: `currentBalance = previousBalance + income - expenses`.

#### Scenario: Admin edits income
- **WHEN** admin changes Income field value
- **AND** moves to next field or clicks elsewhere
- **THEN** Current Balance is immediately recalculated
- **AND** new balance is displayed in read-only field

#### Scenario: Admin edits expenses
- **WHEN** admin changes Expenses field value
- **AND** all three figures (previous, income, expenses) are present
- **THEN** Current Balance updates automatically to: previousBalance + income - expenses

#### Scenario: Auto-calculation with negative values
- **WHEN** expenses are greater than (previousBalance + income)
- **THEN** Current Balance becomes negative (displayed as negative number)
- **AND** no error is raised (valid financial state)

### Requirement: Fund-Specific Data Fields
Each of the three funds (Pembangunan, Takmir, Sawah) SHALL have its own set of editable fields. Changes to one fund do NOT affect the others.

#### Scenario: Admin edits Pembangunan values
- **WHEN** admin enters values in Pembangunan form fields
- **AND** these values are different from Takmir/Sawah
- **THEN** only Pembangunan data is modified
- **AND** Takmir and Sawah remain unchanged

### Requirement: Validation for Financial Fields
All numeric fields (Previous Balance, Income, Expenses) SHALL require valid numbers. Decimals SHALL be accepted but thousands separator handling SHALL be consistent.

#### Scenario: Admin enters invalid number
- **WHEN** admin enters non-numeric text in Balance or Amount field
- **THEN** field is highlighted with error message: "Must be a valid number"
- **AND** field does not accept text value

#### Scenario: Admin enters valid large number
- **WHEN** admin enters 123456789
- **THEN** value is accepted and stored as numeric 123456789
- **AND** displayed in readable format (e.g., 123.456.789 if formatted)

### Requirement: Month/Year Field
Each fund SHALL have a Month/Year field displayed as text or selector (e.g., "December 2025", "Desember 2025"). Updates to this field are arbitrary and not validated against calendar.

#### Scenario: Admin updates month/year
- **WHEN** admin changes Month/Year field to "Januari 2026"
- **THEN** value is stored and displayed as entered
- **AND** no validation is performed on format

### Requirement: Fund Sections Collapsible
The three fund sections (Pembangunan, Takmir, Sawah) SHALL be collapsible to reduce visual clutter. Clicking section header toggles expand/collapse.

#### Scenario: Admin collapses a fund section
- **WHEN** admin clicks Pembangunan section header
- **THEN** section content (form fields) is hidden
- **AND** section header shows indicator (e.g., > or ▼) showing collapsed state

### Requirement: Persist Financial Data to Setting.json
All financial summary changes SHALL be stored in `setting.json` under `financialSummary` object. Changes are not persisted until Save is clicked at the panel level.

#### Scenario: Financial data committed to repository
- **WHEN** admin makes changes to fund balances and clicks panel Save
- **THEN** all changes are committed to `setting.json` in Single commit
- **AND** `financialSummary` object in JSON contains all updated values

### Requirement: Display in Keuangan.html
When `keuangan.html` page is displayed (via content rotation on TV), it SHALL read financial data from `setting.json` `financialSummary` object and populate the display tables with current values. If `financialSummary` is not present in `setting.json`, fall back to hardcoded values.

#### Scenario: TV displays updated financial data
- **WHEN** admin updates financial summary in admin panel and saves
- **AND** setting.json is updated on GitHub
- **AND** TV refreshes and loads keuangan.html
- **THEN** keuangan.html displays latest values from `financialSummary`
- **AND** hardcoded values are not shown

#### Scenario: Financial data structure missing
- **WHEN** `setting.json` does not contain `financialSummary` object
- **THEN** keuangan.html uses hardcoded fallback values
- **AND** page displays without error
