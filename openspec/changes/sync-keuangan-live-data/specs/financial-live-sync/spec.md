## ADDED Requirements

### Requirement: Canonical Financial Source of Truth
The system SHALL treat `setting.json.financialSummary` as the canonical source for all values displayed in `keuangan.html`.

#### Scenario: Financial summary exists and valid
- **WHEN** `keuangan.html` loads and `setting.json.financialSummary` is present with required keys for all funds
- **THEN** displayed financial values SHALL be populated exclusively from `financialSummary`
- **AND** hardcoded fallback values SHALL NOT be shown

#### Scenario: Financial summary missing or invalid
- **WHEN** `setting.json` cannot be loaded or `financialSummary` is missing/invalid
- **THEN** `keuangan.html` SHALL keep the complete fallback values embedded in HTML
- **AND** system SHALL NOT apply partial replacement from invalid payload

### Requirement: Deterministic Field Mapping Across Funds
The system SHALL map each fund field (`month`, `previousBalance`, `income`, `expenses`, `currentBalance`) to the correct visual targets in `keuangan.html` consistently for Pembangunan, Takmir, and Sawah.

#### Scenario: Pembangunan mapping
- **WHEN** `financialSummary.pembangunan` is loaded
- **THEN** title, saldo sebelumnya, pemasukan, pengeluaran, and saldo SHALL reflect `month`, `previousBalance`, `income`, `expenses`, and `currentBalance` respectively

#### Scenario: Takmir and Sawah mapping
- **WHEN** `financialSummary.takmir` and `financialSummary.sawah` are loaded
- **THEN** each displayed label/value SHALL map to its matching fund field without using another fund's or fallback values

### Requirement: Sync After Admin Save
After a successful admin-panel save to `setting.json`, live financial display SHALL converge to committed values on the next page refresh/content cycle.

#### Scenario: Admin save success propagates to live page
- **WHEN** admin commits updated financial data and the commit succeeds
- **THEN** next `keuangan.html` load SHALL fetch `setting.json` and display the committed values
- **AND** displayed values SHALL match admin-saved values for all three funds

#### Scenario: Save fails
- **WHEN** admin save fails and no commit is created
- **THEN** live `keuangan.html` SHALL continue showing last committed values
- **AND** no intermediate unsaved values SHALL appear

### Requirement: Atomic Financial Apply Behavior
Financial updates in `keuangan.html` SHALL be applied atomically per load cycle (all valid fund values applied together, or full fallback retained).

#### Scenario: Partial fund payload received
- **WHEN** one or more required fund keys are missing in fetched payload
- **THEN** system SHALL treat payload as invalid for live apply
- **AND** page SHALL retain fallback values for the affected load cycle

#### Scenario: Valid complete payload received
- **WHEN** all required keys are present for all configured funds
- **THEN** all fund displays SHALL be updated in the same load cycle
- **AND** no mixed fallback/live values SHALL be shown
