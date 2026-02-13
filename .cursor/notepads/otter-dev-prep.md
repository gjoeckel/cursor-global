# Online Courses Application - E2E Functionality & Database Transition Plan
**Status:** Environment Ready / Database Audit Completed
**Last Updated:** February 10, 2026

## 1. Application Overview
The "Online Courses" application is a mature PHP/MySQL suite designed to manage registrations and Canvas LMS integration for WebAIM's online courses. It operates in two primary environments:

### Root Application (`/onlinecourses`)
- **Purpose**: Core registration management and Canvas automation.
- **Key Features**: 
    - Public/Admin registration flows (`register.php`, `phpenrolluser.php`).
    - Course and assignment management in Canvas (`course_builder.php`).
    - Cron-based automation for daily/weekly tasks (`cron_daily.php`).
    - Direct database management (`registrations.php`).

### Otter Sub-system (`/otter`)
- **Purpose**: Multi-enterprise dashboard for client organizations (e.g., CSU, CCC).
- **Key Features**:
    - Organization-specific data views using 4-digit password access.
    - Real-time data aggregation from both MySQL and Canvas API.
    - Enterprise-specific configuration system (`.config` files).
    - Advanced caching for performance.

---

## 2. Current Project Status (February 10, 2026)

### ✅ Environment Setup Completed
- **Tooling**: "Lean Six" extension kit installed (Intelephense, SQLTools, REST Client, GitLens, etc.).
- **Configuration**: Workspace settings optimized (`formatOnSave` DISABLED, `php.suggest.basic` DISABLED).
- **Rules**: `.cursorrules` updated with "No-Touch UI" and "Concise Response" policies.
- **Persistence**: Migration from deprecated native Notepads to Markdown files in `.cursor/notepads/`.

### ✅ Phase 1: Database Audit Completed
- **Ground Truth**: Live schema retrieved from RDS and stored in `.cursor/context/schema_context.sql`.
- **Key Findings**:
    - `registrations` table: Legacy `first_name` and `last_name` (VARCHAR 100) are still present.
    - `registrations` table: `organization_id` and `enterprise_id` (SMALLINT) are integrated, confirming the multi-tenant relational structure.
    - `registrations` table: `status` ENUM contains 8 specific values (submitter, active, enrollee, completer, review, expired, locked, inactive).
    - `courses` table: Extensive Quiz ID mapping (20+ columns) is maintained.

---

## 3. End-to-End Functionality (E2E)

### A. User Registration & Enrollment Flow
1. **Initiation**: User fills out `register.php`.
2. **Database Entry**: Record is created in the `registrations` table.
3. **Canvas Integration**: `phpenrolluser.php` or `cron_process_canvas_users.php` triggers Canvas API calls to create users and enroll them in specific `course_id`s.
4. **Status Lifecycle**: Users move through statuses: `submitter` -> `active` -> `enrollee` -> `earner` (on completion).

### B. Enterprise Reporting Flow (Otter)
1. **Login**: Client enters a 4-digit code in `otter/login.php`.
2. **Detection**: `UnifiedEnterpriseConfig` identifies the enterprise (CSU, CCC, etc.).
3. **Data Retrieval**: `NewDatabaseService` or `CanvasDataService` fetches records.
4. **UI Rendering**: `otter/dashboard.php` displays enrollment summaries, invited participants, and certificates earned.

---

## 4. Identified Transition Risk (The "Rewiring" Challenge)

1. **Schema Mismatch**: Discrepancies between legacy scripts using string-based `organization` and modern scripts using `organization_id`.
2. **Name Normalization**: Potential for logic errors where some parts of the system expect a unified `name` while the database still uses `first_name`/`last_name`.
3. **UI Fragility**: The requirement to preserve EVERY visual aspect means any change to the data-fetching layer must be tested against side-by-side visual snapshots.

---

## 5. Next Phase: Rewiring & Testing Strategy

### Phase 2: Rewiring Logic (IN PROGRESS)
- **Action**: Use `@schema_context.sql` to update SQL queries in core files (`registrations.php`, `db.php`).
- **Safety**: Apply `// REWIRE` tags to all updated logic for tracking.

### Phase 3: Canvas API Validation
- **Tool**: Use `/onlinecourses/canvas_api.http` to verify live responses from Canvas.
- **Integration**: Ensure the local `phpenrolluser.php` correctly parses the JSON returned by the current Canvas API version.

### Phase 4: Regression Testing (No-Touch UI)
- **Method**: Use Composer 1.5's Internal Browser to capture "Gold Standard" screenshots of pages before and after logic updates.
- **Checklist**:
    - [ ] Bootstrap table alignments unchanged.
    - [ ] Status badge colors (Secondary, Primary, Info, etc.) preserved.
    - [ ] Pagination logic remains identical.

---

## 6. Additional Recommended Documentation
Prior to full-scale development, the following documents should be maintained:
1. **`Canvas-API-Mapping.md`**: Specifically mapping which internal database Quiz IDs match which Canvas Assignment names (crucial for `course_builder.php`).
2. **`Visual-Regression-Checklist.md`**: A list of critical UI elements (CSS classes, specific JS behaviors) that must be verified after every rewire.
