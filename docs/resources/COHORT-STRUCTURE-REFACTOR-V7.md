# Cohort Structure Refactor (Version 7.0.0)

## Overview
This refactor moves the cohort sheet from being a simple grade list to a comprehensive "Data Record." By capturing enrollment and submission dates at the cohort level, we eliminate the need for redundant API calls in the Master tab.

## New Column Structure (A-AI)
| Column | Name | Description | Source |
| :--- | :--- | :--- | :--- |
| **A** | Course ID | Canvas Course ID | Spreadsheet |
| **B** | Student ID | Canvas User ID | API (Enrollments) |
| **C** | Name | Student Full Name | API (Enrollments) |
| **D** | Email | Standardized Email | API (Enrollments) |
| **E** | Submitted | **NEW:** Account Creation Date | API (user.created_at) |
| **F** | Enrolled | **NEW:** Enrollment Quiz Date | API (Submission date for Col G) |
| **G - AI**| Assignments | 29 Assignment Score Columns | API (Submissions) |

## Key Logic Changes

### 1. Data Capture (GradeEngine.js)
- **Submitter Date**: Fetched via `u.created_at` during the initial roster fetch.
- **Enrollee Date**: Fetched via `submitted_at` for the specific assignment ID found in Column G1.
- **Bulk Writing**: The write range expands from 33 to 35 columns.

### 2. Header Mapping (Initialization.js)
- Assignment IDs now occupy **G1:AI1**.
- The "Enrollment Gate" assignment is now consistently located in **G1**.

### 3. Master Tab Optimization (MasterManager.js)
- The Master Tab will now read Columns E and F directly from the cohort sheets.
- **API Removal**: Bulk fetching of creation dates and individual user lookups are no longer required for Master updates.

## Implementation Steps
1. Delete all legacy cohort sheets.
2. Update `Initialization.js` to use the new 35-column template.
3. Update `GradeEngine.js` to populate the Submitted (E) and Enrolled (F) dates.
4. Update `UtilityEngine.js` formatting to handle 35 columns.
5. Update `MasterManager.js` to sync from the new columns.
