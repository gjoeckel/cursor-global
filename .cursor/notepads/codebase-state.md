# Codebase State Analysis: Otter Registration System
**Date:** February 10, 2026

## Relationship Matrix

| Environment/Branch | Architecture Type | Backend Logic Status | Current Stability |
| :--- | :--- | :--- | :--- |
| **Production (`onlinecourses`)** | Legacy (Flat) | **Latest / Ground Truth** | Stable (but needs refactor) |
| **GitHub `main` Branch** | Legacy (Flat) | Pre-Update Baseline | Stable (Outdated) |
| **GitHub `services` Branch** | Modern (Services) | Outdated / Broken | **Unstable (Incomplete)** |
| **Test (`onlinecourses-test`)** | Modern (Services) | Outdated / Broken | **Unstable (Incomplete)** |

## Environment Key Details

### 1. Production (`webaim.org/onlinecourses`)
*   **Path:** `/var/websites/webaim/htdocs/onlinecourses/`
*   **Key Files:** `map_quizzes_to_database.php`, `certificates.php`.
*   **Schema:** Uses underscored columns (`enrolled_date`, `earner_date`).

### 2. Test (`webaim.org/onlinecourses-test`)
*   **Path:** `/var/websites/webaim/htdocs/onlinecourses-test/`
*   **Key Directories:** `services/`, `api/`, `shared/`.
*   **Current Issue:** Lacks the dynamic mapping and underscored column support found in Production.

## Refactor Requirements (The "Rewire")
1.  Port `map_quizzes_to_database.php` logic into `services/canvas`.
2.  Update `services/database` to use underscored column names.
3.  Integrate Prod utilities (`certificates.php`) into the services model.

**Refer to @/Users/a00288946/Agents/resources/otter/codebase_state_analysis.md for full details.**
